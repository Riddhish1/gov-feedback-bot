import Office from "@/models/Office";
import Session from "@/models/Session";
import Escalation from "@/models/Escalation";
import { sendEscalationWhatsApp } from "@/lib/whatsapp-notify";

/**
 * ESCALATION ENGINE
 * ─────────────────
 * Pattern-based, data-triggered, 4-level escalation system.
 *
 * Level 1 → Office Head          : OMES below threshold for current month
 * Level 2 → District Collector   : OMES below threshold for 3+ consecutive months
 * Level 3 → Div. Commissioner    : OMES below threshold for 5+ consecutive months
 * Level 4 → Guardian Secretary   : 5+ months + no corrective action uploaded
 *
 * This runs either:
 *  a) After every OMES recompute (post-webhook)
 *  b) Via POST /api/escalations/run (manual / cron trigger)
 */

const OMES_THRESHOLD = 3.0; // Below this score triggers an escalation
const MONTHS_TO_CHECK = 6;  // Look back this many months for pattern detection

interface MonthlyOMES {
    month: string; // "YYYY-MM"
    omes: number;
    sessionCount: number;
}

/**
 * Compute the last N months of OMES for a specific office.
 * Returns an array ordered oldest → newest.
 */
async function computeMonthlyHistory(officeId: string): Promise<MonthlyOMES[]> {
    const history: MonthlyOMES[] = [];
    const now = new Date();

    for (let i = MONTHS_TO_CHECK - 1; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;

        const sessions = await Session.find({
            office_id: officeId,
            completed: true,
            "answers.flow_choice": 1,
            "answers.office_rating": { $ne: null },
            created_at: { $gte: start, $lt: end },
        }).lean();

        if (sessions.length > 0) {
            const avg =
                sessions.reduce((s, r) => s + (r.answers.office_rating || 0), 0) /
                sessions.length;
            history.push({ month: monthKey, omes: Number(avg.toFixed(2)), sessionCount: sessions.length });
        }
        // If no sessions that month, we skip it (don't penalise empty months)
    }

    return history;
}

/**
 * Determine how many consecutive recent months are below the threshold.
 * Counts from the most recent month backwards.
 */
function countConsecutiveBelowThreshold(history: MonthlyOMES[], threshold: number): number {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].omes < threshold) {
            count++;
        } else {
            break; // streak broken
        }
    }
    return count;
}

/**
 * Determine the correct escalation level based on consecutive months below threshold.
 * Returns null if no escalation needed.
 */
function determineLevel(consecutiveMonths: number, hasNoAction: boolean): 1 | 2 | 3 | 4 | null {
    if (consecutiveMonths === 0) return null;
    if (consecutiveMonths >= 5 && hasNoAction) return 4;
    if (consecutiveMonths >= 5) return 3;
    if (consecutiveMonths >= 3) return 2;
    return 1;
}

/**
 * Core function — run escalation check for a single office.
 * Called after every OMES recompute in ai.ts.
 */
export async function checkEscalationForOffice(officeId: string): Promise<void> {
    try {
        const office = await Office.findOne({ office_id: officeId }).lean();
        if (!office) return;

        const currentOMES: number = (office as any).metadata?.omes ?? 0;

        // Fast exit — if current OMES is above threshold, resolve any open escalations
        if (currentOMES >= OMES_THRESHOLD && currentOMES > 0) {
            await Escalation.updateMany(
                { office_id: officeId, status: "open" },
                { $set: { status: "resolved", resolved_at: new Date() } }
            );
            console.log(`✅ [Escalation] ${officeId} recovered (OMES ${currentOMES}). Resolved open escalations.`);
            return;
        }

        // Compute monthly history for pattern detection (from real session data)
        const history = await computeMonthlyHistory(officeId);
        let consecutiveMonths = countConsecutiveBelowThreshold(history, OMES_THRESHOLD);

        // Fallback: if there are no session records yet but metadata.omes is already
        // below threshold (e.g. set directly via seed or demo trigger), treat it as
        // 1 consecutive month so the engine still raises an L1 alert.
        if (consecutiveMonths === 0 && currentOMES > 0 && currentOMES < OMES_THRESHOLD) {
            console.log(`ℹ️ [Escalation] ${officeId} — no session history but metadata OMES ${currentOMES} < threshold. Treating as 1 month.`);
            consecutiveMonths = 1;
        }

        if (consecutiveMonths === 0) return;


        // Check if there's already an open escalation at L1 with an action uploaded
        const existingEscalation = await Escalation.findOne({
            office_id: officeId,
            status: { $in: ["open", "action_uploaded"] },
        }).sort({ triggered_at: -1 });

        const hasNoAction =
            !existingEscalation || existingEscalation.status === "open";

        const requiredLevel = determineLevel(consecutiveMonths, hasNoAction);
        if (!requiredLevel) return;

        // Don't re-raise if an escalation of this level or higher is already open
        const existingLevel = existingEscalation?.level ?? 0;
        if (existingLevel >= requiredLevel) {
            console.log(`ℹ️ [Escalation] ${officeId} already at L${existingLevel}. No new escalation needed.`);
            return;
        }

        // Raise new escalation
        const newEscalation = await Escalation.create({
            office_id: officeId,
            office_name: (office as any).office_name,
            district: (office as any).district,
            division: (office as any).division ?? "",
            department: (office as any).department ?? "",
            level: requiredLevel,
            omes_at_trigger: currentOMES,
            consecutive_months_below: consecutiveMonths,
            threshold_used: OMES_THRESHOLD,
            status: "open",
            triggered_at: new Date(),
        });

        console.log(
            `🚨 [Escalation] Created L${requiredLevel} escalation for ${officeId} ` +
            `(OMES: ${currentOMES}, ${consecutiveMonths} months below threshold)`
        );

        // Resolve the correct recipient phone number based on escalation level.
        // Reads directly from the office's stored contact fields.
        const o = office as any;
        const resolveRecipientPhone = (level: number): string | null => {
            switch (level) {
                case 1: return o.office_head_contact?.phone ?? null;
                case 2: return o.collector_contact?.phone ?? null;
                case 3: return o.divisional_commissioner_contact?.phone ?? null;
                case 4:
                    // guardian_secretary stored as a plain string (name only), so
                    // fall back through hierarchy to the highest available contact
                    return o.divisional_commissioner_contact?.phone
                        ?? o.collector_contact?.phone
                        ?? o.office_head_contact?.phone
                        ?? null;
                default: return null;
            }
        };

        const recipientPhone = resolveRecipientPhone(requiredLevel)
            ?? process.env.DEMO_NOTIFY_NUMBER   // last-resort fallback for demo/dev
            ?? null;

        console.log(`📞 [Escalation] L${requiredLevel} notification → resolved phone: ${recipientPhone ?? "NONE — no contact set on office and no DEMO_NOTIFY_NUMBER in .env"}`);

        if (recipientPhone) {
            sendEscalationWhatsApp(
                recipientPhone,
                {
                    office_name: o.office_name,
                    district: o.district,
                    division: o.division ?? "",
                    department: o.department ?? "",
                    level: requiredLevel,
                    omes_at_trigger: currentOMES,
                    consecutive_months_below: consecutiveMonths,
                    threshold_used: OMES_THRESHOLD,
                    office_id: officeId,
                },
                newEscalation._id.toString()
            ).catch(err => console.error("[Escalation] WhatsApp notification failed:", err));
        } else {
            console.warn(
                `[Escalation] No contact phone found for L${requiredLevel} escalation on ${officeId}. ` +
                "Set office_head_contact / collector_contact / divisional_commissioner_contact on the office record."
            );
        }

    } catch (err) {
        console.error("[Escalation Engine] Error:", err);
    }
}

/**
 * Run escalation check across ALL active offices.
 * Used by POST /api/escalations/run
 */
export async function runEscalationSweep(): Promise<{ checked: number; raised: number }> {
    const offices = await Office.find({ is_active: true }).select("office_id").lean();
    let raised = 0;
    const before = await Escalation.countDocuments({ status: "open" });

    for (const o of offices) {
        await checkEscalationForOffice((o as any).office_id);
    }

    const after = await Escalation.countDocuments({ status: "open" });
    raised = Math.max(0, after - before);

    console.log(`✅ [Escalation Sweep] Checked ${offices.length} offices. New escalations raised: ${raised}`);
    return { checked: offices.length, raised };
}
