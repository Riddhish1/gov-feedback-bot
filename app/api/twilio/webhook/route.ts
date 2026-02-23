import { NextRequest } from "next/server";
import twilio from "twilio";

import { connectDB } from "@/lib/db";
import { QUESTIONS } from "@/lib/questions";
import { handleOfficeFlow, handlePolicyFlow, handleProcessFlow } from "@/lib/flowHandlers";
import Office from "@/models/Office";
import Session from "@/models/Session";

// ── TwiML helper ──────────────────────────────────────────────────────────────

/**
 * Builds a Twilio MessagingResponse (TwiML) and returns it as a Web Response.
 * Twilio requires Content-Type: text/xml.
 */
function twimlResponse(message: string): Response {
  const resp = new twilio.twiml.MessagingResponse();
  resp.message(message);
  return new Response(resp.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

// ── Twilio signature validation ───────────────────────────────────────────────

/**
 * Validates that the incoming request actually comes from Twilio.
 * Enable by setting TWILIO_VALIDATE_REQUESTS=true in your environment.
 */
function validateTwilioSignature(
  request: NextRequest,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!authToken || !appUrl) {
    console.warn(
      "[Twilio] TWILIO_AUTH_TOKEN or NEXT_PUBLIC_APP_URL not set — skipping validation"
    );
    return true;
  }

  const twilioSignature =
    request.headers.get("x-twilio-signature") ?? "";
  const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/twilio/webhook`;

  return twilio.validateRequest(authToken, twilioSignature, webhookUrl, params);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Parse Twilio's application/x-www-form-urlencoded body
    const formData = await request.formData();

    const from = formData.get("From") as string | null;
    const body = formData.get("Body") as string | null;

    if (!from || body === null) {
      return new Response("Bad Request: missing From or Body", { status: 400 });
    }

    // 2. Optional Twilio request signature validation (recommended in production)
    if (process.env.TWILIO_VALIDATE_REQUESTS === "true") {
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value as string;
      });

      if (!validateTwilioSignature(request, params)) {
        console.warn("[Twilio] Invalid request signature — rejecting");
        return new Response("Forbidden", { status: 403 });
      }
    }

    // 3. Normalise values
    const phone = from.replace(/^whatsapp:/i, "").trim();       // e.g. +919876543210
    const messageText = body.trim();
    const messageUpper = messageText.toUpperCase();

    // 4. Connect to MongoDB
    await connectDB();

    // ── Handle visible QR sentence like:
    // "I want to give feedback for my visit to {office_name} ({office_id})"
    const visibleRegex = /^I want to give feedback for my visit to\s+(.+?)\s*\(([^)]+)\)\s*$/i;
    const visibleMatch = messageText.match(visibleRegex);
    if (visibleMatch) {
      const officeId = visibleMatch[2].trim();
      return startSession(officeId);
    }

    // ── Helper: start a new session for a given officeId ───────────────────
    async function startSession(officeId: string): Promise<Response> {
      const office = await Office.findOne({ office_id: officeId }).lean();
      if (!office) {
        return twimlResponse(QUESTIONS.OFFICE_NOT_FOUND(officeId));
      }

      // Close any previously open sessions for this phone (idempotent restart)
      await Session.updateMany(
        { phone, completed: false },
        { $set: { completed: true, current_step: 5 } }
      );

      // Create a fresh session
      await Session.create({
        phone,
        office_id: officeId,
        office_name: office.office_name,
        current_step: 1,
        completed: false,
        answers: {
          flow_choice: null,
          rating: null,
          feedback: null,
          scheme_suggestion: null,
          policy_suggestion: null,
        },
      });

      return twimlResponse(QUESTIONS.GREETING(office.office_name));
    }

    // ── Handle START_OFFICE_<id>  (legacy / fallback trigger) ────────────────
    if (messageUpper.startsWith("START_OFFICE_")) {
      const officeId = messageText.replace(/START_OFFICE_/i, "").trim();
      if (!officeId) {
        return twimlResponse(
          "⚠️ Invalid QR code format. Please scan the correct QR code at the office."
        );
      }
      return startSession(officeId);
    }

    // ── Handle bare office_id  (sent by the new QR codes) ───────────────────
    // When a citizen scans the QR the pre-filled text is just the office ID
    // (e.g. "1023"). If there is no existing active session we treat ANY
    // message as a potential office_id lookup first.
    const existingSession = await Session.findOne({
      phone,
      completed: false,
    }).sort({ created_at: -1 });

    if (!existingSession) {
      // No active session — try to start one using the message as an office_id or digipin
      const officeCandidate = messageText.trim();
      const matchedOffice = await Office.findOne({
        $or: [
          { office_id: officeCandidate },
          { digipin: officeCandidate }
        ]
      }).lean();

      if (matchedOffice) {
        return startSession(officeCandidate);
      }

      // Not a valid office_id either — prompt the citizen to scan
      return twimlResponse(
        "👋 Welcome to the Government Feedback System.\n\nTo share your feedback, please *scan the QR code* at the government office counter."
      );
    }

    // active session exists — fall through directly to the state machine
    const session = existingSession;

    // ── Conversation state machine ─────────────────────────────────────────────
    if (session.current_step === 1) {
      // ── Step 1: User picks flow (Office = 1, Policy = 2, Process = 3) ──
      const choice = parseInt(messageText, 10);
      if (![1, 2, 3].includes(choice)) {
        return twimlResponse(QUESTIONS.INVALID_OPTION);
      }

      session.answers.flow_choice = choice;
      session.current_step = 2;
      await session.save();

      if (choice === 1) return twimlResponse(QUESTIONS.OFFICE_Q1);
      if (choice === 2) return twimlResponse(QUESTIONS.POLICY_Q1);
      if (choice === 3) return twimlResponse(QUESTIONS.PROCESS_Q1);

      return twimlResponse(QUESTIONS.ERROR);
    }
    else if (session.current_step === 5) {
      // ── Step 5: Session already complete ────────────────────────────────────
      return twimlResponse(QUESTIONS.SESSION_COMPLETED);
    }
    else if (session.current_step >= 2 && session.current_step <= 4) {
      // ── Step 2-4: Hand off to specific flow handlers ────────────────────────
      let flowRes: { message: string; nextStep: number; completed: boolean };

      switch (session.answers.flow_choice) {
        case 1:
          flowRes = await handleOfficeFlow(session, messageText);
          break;
        case 2:
          flowRes = await handlePolicyFlow(session, messageText);
          break;
        case 3:
          flowRes = await handleProcessFlow(session, messageText);
          break;
        default:
          return twimlResponse(QUESTIONS.ERROR);
      }

      session.current_step = flowRes.nextStep as any;
      if (flowRes.completed) {
        session.completed = true;
      }
      await session.save();

      return twimlResponse(flowRes.message);
    }
    else {
      // ── Unknown state ────────────────────────────────────────────────────────
      console.error(
        `[Twilio Webhook] Unknown session step ${session.current_step} for phone ${phone}`
      );
      return twimlResponse(QUESTIONS.ERROR);
    }
  } catch (error) {
    // Log the full error server-side, never expose internals to WhatsApp
    console.error("[Twilio Webhook] Unhandled error:", error);

    // Return a valid TwiML 200 response so Twilio doesn't retry
    const errResp = new twilio.twiml.MessagingResponse();
    errResp.message(QUESTIONS.ERROR);
    return new Response(errResp.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }
}
