import { NextRequest } from "next/server";
import twilio from "twilio";

import { connectDB } from "@/lib/db";
import { QUESTIONS } from "@/lib/questions";
import { handleOfficeFlow, handlePolicyFlow, handleProcessFlow } from "@/lib/flowHandlers";
import { processSessionWithAI } from "@/lib/ai";
import { transcribeTwilioAudio } from "@/lib/transcription";
import Office from "@/models/Office";
import Session from "@/models/Session";

// ── TwiML helper ──────────────────────────────────────────────────────────────

import { InteractiveMessage } from "@/lib/questions";

/**
 * Builds a Twilio MessagingResponse (TwiML) and returns it as a Web Response.
 * Twilio requires Content-Type: text/xml.
 */
function twimlResponse(msg: InteractiveMessage | string): Response {
  const resp = new twilio.twiml.MessagingResponse();
  
  let body = "";
  if (typeof msg === "string") {
    body = msg;
  } else {
    body = msg.text;
    if (msg.options && msg.options.length > 0) {
      body += "\n\n";
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      msg.options.forEach((opt, idx) => {
        const prefix = emojis[idx] || `${idx + 1}.`;
        body += `${prefix} ${opt}\n`;
      });
      
      // If the message is list type, we could hint to reply with the exact text or number
      if (msg.type === "list" || msg.type === "button") {
        body += "\n(Reply with the number or exact text)";
      }
    }
  }

  resp.message(body.trim());
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
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);
    const mediaUrl = formData.get("MediaUrl0") as string | null;
    const mediaType = formData.get("MediaContentType0") as string | null;

    if (!from) {
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
    let messageText = body ? body.trim() : "";
    let messageUpper = messageText.toUpperCase();

    // 4. Connect to MongoDB
    await connectDB();

    // ── Handle visible QR sentence like:
    // "I want to give feedback for my visit to {office_name} ({office_id})"
    // Using the `s` (dotAll) flag so `.+?` matches newlines inside multi-line office names.
    const visibleRegex = /^I want to give feedback for my visit to\s+([\s\S]+?)\s*\(([^)]+)\)\s*$/is;
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
        { $set: { completed: true, current_step: 15 } } // Mark as completed (legacy was 5, 12, now arbitrary > max)
      );

      // Create a fresh session
      await Session.create({
        phone,
        language: null,
        office_id: officeId,
        office_name: office.office_name,
        current_step: 1, // Step 1 is now language
        completed: false,
        answers: {
          flow_choice: null,
          rating: null,
          feedback: null,
          scheme_suggestion: null,
          policy_suggestion: null,
        },
      });

      return twimlResponse(QUESTIONS.LANGUAGE_SELECT);
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
      // ── Step 1: Language Select ──
      const isMarathi = messageText === "1" || messageText === "मराठी";
      const isEnglish = messageText === "2" || messageText.toLowerCase() === "english";
      
      if (!isMarathi && !isEnglish) {
        return twimlResponse(QUESTIONS.INVALID_OPTION);
      }

      session.language = isMarathi ? "mr" : "en";
      session.current_step = 2; // Move to greeting
      await session.save();

      return twimlResponse(QUESTIONS.GREETING(session.office_name));
    }
    else if (session.current_step === 2) {
      // ── Step 2: User picks flow (Office = 1, Policy = 2, Process = 3) ──
      let choice = parseInt(messageText, 10);
      
      if (messageText === "कार्यालय अनुभव") choice = 1;
      if (messageText === "धोरण सूचना") choice = 2;
      if (messageText === "प्रक्रिया सुधारणा सूचना") choice = 3;

      if (![1, 2, 3].includes(choice)) {
        return twimlResponse(QUESTIONS.INVALID_OPTION);
      }

      session.answers.flow_choice = choice;
      session.current_step = 3;
      await session.save();

      if (choice === 1) return twimlResponse(QUESTIONS.CAT1_Q1);
      if (choice === 2) return twimlResponse(QUESTIONS.CAT2_FLOW_SELECT);
      if (choice === 3) return twimlResponse(QUESTIONS.CAT3_Q1_CHANGE);

      return twimlResponse(QUESTIONS.ERROR);
    }
    else if (session.completed) {
      // ── Session already complete ────────────────────────────────────────────
      return twimlResponse(QUESTIONS.SESSION_COMPLETED);
    }
    else if (session.current_step >= 3 && session.current_step <= 21) {
      // ── Audio Transcription Intercept ─────────────────────────────────────────
      if (numMedia > 0 && mediaUrl && mediaType?.startsWith("audio/")) {
        // Validate if audio is allowed for the CURRENT step the citizen is on
        const isAudioAllowed =
          (session.answers.flow_choice === 1 && session.current_step === 12) || // Office Exp: Q10
          (session.answers.flow_choice === 2 && session.current_step === 10) || // Policy Sugg: Mandatory Feedback
          (session.answers.flow_choice === 3 && session.current_step === 4);   // Process Ref: Suggestion

        if (!isAudioAllowed) {
          return twimlResponse("⚠️ Please reply with text/numbers for this step. Voice notes are only accepted for detailed descriptive feedback later in the flow.");
        }

        // Allowed -> transcribe async and block the flow until we get the text
        const transcribedText = await transcribeTwilioAudio(mediaUrl);
        if (transcribedText.startsWith("[Audio")) {
          return twimlResponse(`⚠️ ${transcribedText}`);
        }

        // Override the empty messageText with the transcribed string
        messageText = `[VOICE-NOTE]: ${transcribedText}`;
      }

      // ── Hand off to specific flow handlers ──────────────────────────────────
      let flowRes: { message: InteractiveMessage; nextStep: number; completed: boolean };

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

      // Launch async AI sentiment extraction completely independent of the WhatsApp Twilio loop so timeout never hits
      // We only do this here if completed was set to true directly by a flow handler somehow, 
      // though now they all go to Step 21. Just in case of fallback:
      if (flowRes.completed) {
        processSessionWithAI(
          session._id.toString(),
          session.office_id,
          session.answers,
          session.answers.completed_flows.join(",") || String(session.answers.flow_choice)
        ).catch((err) => console.error("Async AI Error tracking", err));
      }

      return twimlResponse(flowRes.message);
    }
    else if (session.current_step === 22) {
      // ── Step 22: Continue Menu (Multi-Flow Submission) ────────────────────
      let choice = parseInt(messageText, 10);
      
      if (messageText === "पूर्ण करा" || choice === 4) choice = 0;
      if (messageText === "कार्यालय अनुभव" || messageText === "कार्यालय अनुभव ✅") choice = 1;
      if (messageText === "धोरण सूचना" || messageText === "धोरण सूचना ✅") choice = 2;
      if (messageText === "प्रक्रिया सुधारणा" || messageText === "प्रक्रिया सुधारणा ✅") choice = 3;
      
      // Submit and Finish
      if (choice === 0) {
        session.completed = true;
        await session.save();
        
        // Launch AI sentiment extraction for all combined flows
        processSessionWithAI(
          session._id.toString(),
          session.office_id,
          session.answers,
          session.answers.completed_flows.join(",")
        ).catch((err) => console.error("Async AI Error tracking", err));
        
        return twimlResponse("धन्यवाद.\nआपला अभिप्राय यशस्वीरित्या नोंदविण्यात आला आहे.\n\nआपल्या अभिप्रायामुळे शासकीय सेवा सुधारण्यास मदत होईल.");
      }
      
      // Loop back to another flow
      if ([1, 2, 3].includes(choice)) {
        if (session.answers.completed_flows.includes(choice)) {
          return twimlResponse(QUESTIONS.CONTINUE_MENU(session.answers.completed_flows));
        }
        
        // Update flow choice and reset to Step 3
        session.answers.flow_choice = choice;
        session.current_step = 3;
        await session.save();
        
        if (choice === 1) return twimlResponse(QUESTIONS.CAT1_Q1);
        if (choice === 2) return twimlResponse(QUESTIONS.CAT2_FLOW_SELECT);
        if (choice === 3) return twimlResponse(QUESTIONS.CAT3_Q1_CHANGE);
      }
      
      return twimlResponse(QUESTIONS.INVALID_OPTION);
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
    errResp.message(QUESTIONS.ERROR.text);
    return new Response(errResp.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }
}
