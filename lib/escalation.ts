import Office from "@/models/Office";
import Session from "@/models/Session";
import Escalation from "@/models/Escalation";
import { sendEscalationEmail } from "@/lib/email-notify";

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
 * Notifications are sent via SMTP email.
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
    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_CHECK - 1), 1);
    const windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const rows = await Session.aggregate([
        {
            $match: {
                office_id: officeId,
                completed: true,
                "answers.flow_choice": 1,
                "answers.office_rating": { $ne: null },
                created_at: { $gte: windowStart, $lt: windowEnd },
            },
        },
        {
            $project: {
                month: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
                rating: "$answers.office_rating",
            },
        },
        {
            $group: {
                _id: "$month",
                omes: { $avg: "$rating" },
                sessionCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return rows.map((row: any) => ({
        month: row._id,
        omes: Number((row.omes ?? 0).toFixed(2)),
        sessionCount: row.sessionCount ?? 0,
    }));
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
 * @param maxLevel - Optional cap on the maximum escalation level (default: 4).
 *                   Pass 2 for Office Experience escalations (Collector is highest authority).
 * Returns null if no escalation needed.
 */
function determineLevel(consecutiveMonths: number, hasNoAction: boolean, maxLevel: 1 | 2 | 3 | 4 = 4): 1 | 2 | 3 | 4 | null {
    if (consecutiveMonths === 0) return null;
    if (consecutiveMonths >= 5 && hasNoAction && maxLevel >= 4) return 4;
    if (consecutiveMonths >= 5 && maxLevel >= 3) return 3;
    if (consecutiveMonths >= 3) return Math.min(2, maxLevel) as 1 | 2;
    return 1;
}

/**
 * Core function — run escalation check for a single office.
 * Called after every OMES recompute in ai.ts.
 */
export async function checkEscalationForOffice(officeId: string, officeOverride?: any): Promise<void> {
    try {
        const office = officeOverride ?? await Office.findOne({ office_id: officeId }).lean();
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

        // Office Experience escalations are capped at Level 2 (District Collector).
        // OMES is derived entirely from flow_choice=1 (Office Experience) sessions.
        // L3 (Divisional Commissioner) and L4 (Guardian Secretary) are reserved
        // for policy and process reform escalation paths only.
        const requiredLevel = determineLevel(consecutiveMonths, hasNoAction, 2);
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

        // Resolve the correct recipient email based on escalation level.
        // Reads from the office's stored contact email fields.
        const o = office as any;
        const resolveRecipientEmail = (level: number): string | null => {
            switch (level) {
                case 1: return o.office_head_contact?.email ?? null;
                case 2: return o.collector_contact?.email ?? null;
                case 3: return o.divisional_commissioner_contact?.email ?? null;
                case 4:
                    // Fall through hierarchy to the highest available contact
                    return o.divisional_commissioner_contact?.email
                        ?? o.collector_contact?.email
                        ?? o.office_head_contact?.email
                        ?? null;
                default: return null;
            }
        };

        const recipientEmail = resolveRecipientEmail(requiredLevel)
            ?? process.env.DEMO_NOTIFY_EMAIL   // fallback for demo/dev
            ?? null;

        console.log(`📧 [Escalation] L${requiredLevel} notification → resolved email: ${recipientEmail ?? "NONE — no contact email set on office and no DEMO_NOTIFY_EMAIL in .env"}`);

        if (recipientEmail) {
            try {
                await sendEscalationEmail(
                    recipientEmail,
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
                );
            } catch (err) {
                console.error("[Escalation] Email notification failed:", err);
            }
        } else {
            console.warn(
                `[Escalation] No contact email found for L${requiredLevel} escalation on ${officeId}. ` +
                "Set office_head_contact.email / collector_contact.email / divisional_commissioner_contact.email on the office record, " +
                "or set DEMO_NOTIFY_EMAIL in .env."
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
    const offices = await Office.find({ is_active: true })
        .select("office_id office_name district division department metadata.omes office_head_contact collector_contact divisional_commissioner_contact")
        .lean();
    let raised = 0;
    const before = await Escalation.countDocuments({ status: "open" });

    const SWEEP_CONCURRENCY = 8;
    for (let i = 0; i < offices.length; i += SWEEP_CONCURRENCY) {
        const batch = offices.slice(i, i + SWEEP_CONCURRENCY);
        await Promise.all(batch.map((o: any) => checkEscalationForOffice(o.office_id, o)));
    }

    const after = await Escalation.countDocuments({ status: "open" });
    raised = Math.max(0, after - before);

    console.log(`✅ [Escalation Sweep] Checked ${offices.length} offices. New escalations raised: ${raised}`);
    return { checked: offices.length, raised };
}
