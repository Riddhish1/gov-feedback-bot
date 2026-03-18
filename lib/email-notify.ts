import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import EscalationNotification from "@/models/EscalationNotification";

// ── Level Metadata ────────────────────────────────────────────────────────────

const LEVEL_RECIPIENT: Record<number, string> = {
  1: "Office Head",
  2: "District Collector",
  3: "Divisional Commissioner",
  4: "Guardian Secretary",
};

const LEVEL_URGENCY: Record<number, { tag: string; color: string }> = {
  1: { tag: "L1 ALERT",      color: "#F59E0B" },
  2: { tag: "L2 ESCALATION", color: "#EF4444" },
  3: { tag: "L3 ESCALATION", color: "#DC2626" },
  4: { tag: "L4 CRITICAL",   color: "#991B1B" },
};

// ── Escalation data shape ─────────────────────────────────────────────────────

export interface EscalationPayload {
  office_name: string;
  district: string;
  division: string;
  department: string;
  level: number;
  omes_at_trigger: number;
  consecutive_months_below: number;
  threshold_used: number;
  office_id: string;
}

// ── SMTP Transport (lazy singleton) ───────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn("[Email] SMTP credentials not set — skipping email notification.");
    return null;
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: { user, pass },
  });

  return _transporter;
}

// ── HTML Email Builder ────────────────────────────────────────────────────────

function buildEmailHTML(escalation: EscalationPayload): string {
  const { tag, color } = LEVEL_URGENCY[escalation.level] ?? { tag: "ALERT", color: "#EF4444" };
  const recipient = LEVEL_RECIPIENT[escalation.level] ?? "Official";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F7F9FB;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FB;padding:32px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E8EDF3;overflow:hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background:${color};padding:20px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#FFFFFF;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                  ⚠️ ${tag}
                </td>
                <td align="right" style="color:rgba(255,255,255,0.8);font-size:12px;">
                  GovIntel Escalation System
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#0F1724;font-weight:700;">
              Escalation Alert — ${escalation.office_name}
            </h2>
            <p style="margin:0 0 20px;font-size:14px;color:#64748B;">
              This auto-generated alert requires your immediate attention.
            </p>

            <!-- Details Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E8EDF3;border-radius:8px;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${[
                      ["Escalated To", recipient],
                      ["Office", escalation.office_name],
                      ["Office ID", escalation.office_id],
                      ["District", escalation.district],
                      ["Division", escalation.division || "—"],
                      ["Department", escalation.department || "—"],
                    ].map(([label, value]) => `
                    <tr>
                      <td style="padding:5px 0;font-size:13px;color:#64748B;width:120px;">${label}</td>
                      <td style="padding:5px 0;font-size:13px;color:#0F1724;font-weight:500;">${value}</td>
                    </tr>`).join("")}
                  </table>
                </td>
              </tr>
            </table>

            <!-- OMES Score -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:14px 16px;text-align:center;">
                    <div style="font-size:11px;color:#991B1B;font-weight:600;letter-spacing:0.5px;margin-bottom:4px;">OMES SCORE</div>
                    <div style="font-size:24px;font-weight:700;color:#DC2626;">${escalation.omes_at_trigger.toFixed(2)}/5.00</div>
                  </div>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:14px 16px;text-align:center;">
                    <div style="font-size:11px;color:#92400E;font-weight:600;letter-spacing:0.5px;margin-bottom:4px;">DURATION BELOW ${escalation.threshold_used.toFixed(1)}</div>
                    <div style="font-size:24px;font-weight:700;color:#D97706;">${escalation.consecutive_months_below} month${escalation.consecutive_months_below > 1 ? "s" : ""}</div>
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">
              This office has maintained an OMES score of <strong>${escalation.omes_at_trigger.toFixed(2)}</strong>
              (below the ${escalation.threshold_used.toFixed(1)} threshold) for
              <strong>${escalation.consecutive_months_below} consecutive month${escalation.consecutive_months_below > 1 ? "s" : ""}</strong>.
              Immediate corrective action is required.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E8EDF3;padding:16px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:11px;color:#94A3B8;">
                  GovIntel · Maharashtra Governance Platform
                </td>
                <td align="right" style="font-size:11px;color:#94A3B8;">
                  Auto-generated · Do not reply
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildPlainText(escalation: EscalationPayload): string {
  const { tag } = LEVEL_URGENCY[escalation.level] ?? { tag: "ALERT" };
  const recipient = LEVEL_RECIPIENT[escalation.level] ?? "Official";

  return [
    `[${tag}] MahaGov Escalation Alert`,
    ``,
    `Escalated To: ${recipient}`,
    `Office: ${escalation.office_name} (${escalation.office_id})`,
    `District: ${escalation.district}`,
    `Division: ${escalation.division || "—"}`,
    `Department: ${escalation.department || "—"}`,
    ``,
    `OMES Score: ${escalation.omes_at_trigger.toFixed(2)}/5.00`,
    `Duration Below ${escalation.threshold_used.toFixed(1)}: ${escalation.consecutive_months_below} month(s)`,
    ``,
    `Immediate corrective action is required.`,
    ``,
    `— GovIntel · Maharashtra Governance Platform`,
  ].join("\n");
}

// ── Subject Line Builder ──────────────────────────────────────────────────────

function buildSubject(escalation: EscalationPayload): string {
  const { tag } = LEVEL_URGENCY[escalation.level] ?? { tag: "ALERT" };
  return `[${tag}] ${escalation.office_name} — OMES ${escalation.omes_at_trigger.toFixed(2)} (${escalation.consecutive_months_below}mo)`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendEscalationEmail(
  toEmail: string,
  escalation: EscalationPayload,
  escalationId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || "";
  const recipient = LEVEL_RECIPIENT[escalation.level] ?? "Official";

  if (!transporter) {
    return { success: false, error: "SMTP not configured" };
  }

  console.log(`📧 [Email] Sending escalation: ${toEmail} | ${escalation.office_name} L${escalation.level}`);

  try {
    const info = await transporter.sendMail({
      from: `"GovIntel Alerts" <${fromEmail}>`,
      to: toEmail,
      subject: buildSubject(escalation),
      text: buildPlainText(escalation),
      html: buildEmailHTML(escalation),
    });

    await EscalationNotification.create({
      escalation_id: escalationId,
      office_id: escalation.office_id,
      office_name: escalation.office_name,
      level: escalation.level,
      recipient_label: recipient,
      recipient_number: toEmail,
      channel: "email",
      message_body: buildPlainText(escalation),
      twilio_sid: info.messageId ?? null,
      status: "sent",
      sent_at: new Date(),
    });

    console.log(`✅ [Email] Sent to ${toEmail} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (err: any) {
    console.error("[Email] Failed:", err.message);

    await EscalationNotification.create({
      escalation_id: escalationId,
      office_id: escalation.office_id,
      office_name: escalation.office_name,
      level: escalation.level,
      recipient_label: recipient,
      recipient_number: toEmail,
      channel: "email",
      message_body: buildPlainText(escalation),
      twilio_sid: null,
      status: "failed",
      error_message: err.message,
      sent_at: new Date(),
    });

    return { success: false, error: err.message };
  }
}
