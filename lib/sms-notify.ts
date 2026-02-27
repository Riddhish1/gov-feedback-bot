import twilio from "twilio";
import EscalationNotification from "@/models/EscalationNotification";

const LEVEL_RECIPIENT: Record<number, string> = {
    1: "Office Head",
    2: "District Collector",
    3: "Divisional Commissioner",
    4: "Guardian Secretary",
};

const LEVEL_URGENCY: Record<number, string> = {
    1: "[L1 ALERT]",
    2: "[L2 ESCALATION]",
    3: "[L3 ESCALATION]",
    4: "[L4 CRITICAL]",
};

function buildSmsBody(escalation: {
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
    const urgency = LEVEL_URGENCY[escalation.level] ?? "[ALERT]";
    const recipient = LEVEL_RECIPIENT[escalation.level] ?? "Official";

    // SMS has 160 char limit per segment — keep it punchy
    return (
        `${urgency} MahaGov Escalation\n` +
        `To: ${recipient}\n` +
        `Office: ${escalation.office_name}\n` +
        `District: ${escalation.district}\n` +
        `OMES: ${escalation.omes_at_trigger.toFixed(2)}/5.00 ` +
        `(${escalation.consecutive_months_below} month${escalation.consecutive_months_below > 1 ? "s" : ""} below ${escalation.threshold_used.toFixed(1)})\n` +
        `Action required immediately. - GovIntel System`
    );
}

/** Normalise bare 10-digit Indian numbers → +91XXXXXXXXXX */
function normalizePhone(raw: string): string {
    let n = raw.replace(/[\s\-().]/g, "");
    if (!n.startsWith("+")) {
        if (n.length === 10) n = "+91" + n;
        else if (n.startsWith("91") && n.length === 12) n = "+" + n;
    }
    // Strip any whatsapp: prefix — SMS doesn't need it
    return n.replace(/^whatsapp:/i, "");
}

/**
 * Send an SMS escalation alert via Twilio.
 * No templates, no sandbox joins — works instantly with any Twilio-purchased number.
 */
export async function sendEscalationSMS(
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

    // Use the real Twilio SMS number — strip whatsapp: prefix if present
    const rawFrom = process.env.TWILIO_SMS_NUMBER
        ?? process.env.TWILIO_WHATSAPP_NUMBER?.replace(/^whatsapp:/i, "")
        ?? null;

    if (!accountSid || !authToken || !rawFrom) {
        console.warn("[SMS] Twilio credentials not set — skipping SMS notification.");
        return { success: false, error: "Twilio credentials missing" };
    }

    const fromNumber = normalizePhone(rawFrom);
    const toNormalized = normalizePhone(toNumber);
    const messageBody = buildSmsBody(escalation);
    const recipient = LEVEL_RECIPIENT[escalation.level] ?? "Official";

    console.log(`📱 [SMS] Attempting: ${fromNumber} → ${toNormalized} | ${escalation.office_name} L${escalation.level}`);

    const client = twilio(accountSid, authToken);

    try {
        const msg = await client.messages.create({
            from: fromNumber,
            to: toNormalized,
            body: messageBody,
        });

        await EscalationNotification.create({
            escalation_id: escalationId,
            office_id: escalation.office_id,
            office_name: escalation.office_name,
            level: escalation.level,
            recipient_label: recipient,
            recipient_number: toNormalized,
            channel: "sms",
            message_body: messageBody,
            twilio_sid: msg.sid,
            status: "sent",
            sent_at: new Date(),
        });

        console.log(`✅ [SMS] Sent to ${toNormalized} | SID: ${msg.sid}`);
        return { success: true, sid: msg.sid };

    } catch (err: any) {
        console.error("[SMS] Failed:", err.message);

        await EscalationNotification.create({
            escalation_id: escalationId,
            office_id: escalation.office_id,
            office_name: escalation.office_name,
            level: escalation.level,
            recipient_label: recipient,
            recipient_number: toNormalized,
            channel: "sms",
            message_body: messageBody,
            twilio_sid: null,
            status: "failed",
            error_message: err.message,
            sent_at: new Date(),
        });

        return { success: false, error: err.message };
    }
}
