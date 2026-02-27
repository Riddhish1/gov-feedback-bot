import twilio from "twilio";
import EscalationNotification from "@/models/EscalationNotification";

const LEVEL_RECIPIENT = {
    1: "Office Head",
    2: "District Collector",
    3: "Divisional Commissioner",
    4: "Guardian Secretary",
};

const LEVEL_URGENCY = {
    1: "⚠️",
    2: "🔴",
    3: "🚨",
    4: "🆘",
};

/**
 * Compose the WhatsApp alert message text for a given escalation.
 */
function buildMessage(escalation: {
    office_name: string;
    district: string;
    division: string;
    department: string;
    level: number;
    omes_at_trigger: number;
    consecutive_months_below: number;
    threshold_used: number;
    office_id: string;
}): string {
    const urgency = LEVEL_URGENCY[escalation.level as keyof typeof LEVEL_URGENCY] ?? "⚠️";
    const recipient = LEVEL_RECIPIENT[escalation.level as keyof typeof LEVEL_RECIPIENT] ?? "Official";
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return (
        `${urgency} *MahaGov Response — Escalation Alert*\n\n` +
        `*Level ${escalation.level} Escalation* — Escalated to: ${recipient}\n\n` +
        `📍 *Office:* ${escalation.office_name}\n` +
        `🗺️ *District:* ${escalation.district} · ${escalation.division} Division\n` +
        `🏛️ *Department:* ${escalation.department}\n\n` +
        `📊 *Current OMES Score:* ${escalation.omes_at_trigger.toFixed(2)} / 5.00\n` +
        `📉 *Threshold:* ${escalation.threshold_used.toFixed(1)} (Below for ${escalation.consecutive_months_below} consecutive month${escalation.consecutive_months_below > 1 ? "s" : ""})\n\n` +
        `🔴 This office requires *immediate attention*. Please review performance data and initiate corrective measures.\n\n` +
        `_Automated alert via MahaGov Response Governance Intelligence System · ${date}_`
    );
}

/**
 * Send a WhatsApp escalation alert via Twilio.
 * Logs the notification to the EscalationNotification collection.
 *
 * @param toNumber  - Recipient WhatsApp number, e.g. "+919876543210"
 * @param escalation - The escalation document being raised
 * @param escalationId - MongoDB _id of the escalation record
 */
export async function sendEscalationWhatsApp(
    toNumber: string,
    escalation: {
        office_name: string;
        district: string;
        division: string;
        department: string;
        level: number;
        omes_at_trigger: number;
        consecutive_months_below: number;
        threshold_used: number;
        office_id: string;
    },
    escalationId: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. "whatsapp:+14155238886"

    if (!accountSid || !authToken || !fromNumber) {
        console.warn("[WhatsApp] Twilio credentials not set — skipping notification.");
        return { success: false, error: "Twilio credentials missing" };
    }

    const client = twilio(accountSid, authToken);
    const messageBody = buildMessage(escalation);

    // Normalize the phone number:
    // - strip spaces, dashes, and brackets
    // - if it's a bare 10-digit Indian number (e.g. "9022337207"), prefix +91
    const normalizePhone = (raw: string): string => {
        let n = raw.replace(/[\s\-().]/g, "");          // strip formatting
        if (!n.startsWith("+")) {
            if (n.length === 10) n = "+91" + n;         // bare Indian mobile
            else if (n.startsWith("91") && n.length === 12) n = "+" + n;
        }
        return n;
    };

    const normalizedNumber = normalizePhone(toNumber);
    const toFormatted = normalizedNumber.startsWith("whatsapp:")
        ? normalizedNumber
        : `whatsapp:${normalizedNumber}`;

    console.log(`📲 [WhatsApp] Attempting send → ${toFormatted} (raw: ${toNumber}) | Office: ${escalation.office_name} | L${escalation.level}`);

    const recipient = LEVEL_RECIPIENT[escalation.level as keyof typeof LEVEL_RECIPIENT] ?? "Official";

    try {
        const msg = await client.messages.create({
            from: fromNumber,
            to: toFormatted,
            body: messageBody,
        });


        // Log to DB
        await EscalationNotification.create({
            escalation_id: escalationId,
            office_id: escalation.office_id,
            office_name: escalation.office_name,
            level: escalation.level,
            recipient_label: recipient,
            recipient_number: toNumber,
            channel: "whatsapp",
            message_body: messageBody,
            twilio_sid: msg.sid,
            status: "sent",
            sent_at: new Date(),
        });

        console.log(`✅ [WhatsApp] Alert sent to ${toNumber} for ${escalation.office_name} (L${escalation.level}). SID: ${msg.sid}`);
        return { success: true, sid: msg.sid };

    } catch (err: any) {
        console.error("[WhatsApp] Failed to send escalation alert:", err.message);

        // Still log the failure
        await EscalationNotification.create({
            escalation_id: escalationId,
            office_id: escalation.office_id,
            office_name: escalation.office_name,
            level: escalation.level,
            recipient_label: recipient,
            recipient_number: toNumber,
            channel: "whatsapp",
            message_body: messageBody,
            twilio_sid: null,
            status: "failed",
            error_message: err.message,
            sent_at: new Date(),
        });

        return { success: false, error: err.message };
    }
}
