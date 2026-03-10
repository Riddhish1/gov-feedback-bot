import { OpenAI } from "openai";
import fetch from "node-fetch";

// Ensure we don't crash if the key is missing during build or early dev
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * Downloads an audio file from Twilio and transcribes it using OpenAI Whisper.
 * @param mediaUrl The URL of the Twilio audio media.
 * @returns The transcribed text, or a fallback message if it fails.
 */
export async function transcribeTwilioAudio(mediaUrl: string): Promise<string> {
    if (!openai) {
        console.warn("OPENAI_API_KEY not set. Skipping audio transcription.");
        return "[Audio Transcription Unavailable: No API Key]";
    }

    try {
        console.log(`🎙️ [Transcription] Fetching audio from Twilio: ${mediaUrl}`);

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (!accountSid || !authToken) {
            console.warn("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set. Cannot authenticate media download.");
            return "[Audio Transcription Unavailable: Missing Twilio Auth]";
        }

        // 1. Download the media from Twilio into a temporary array buffer
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
        const twilioResponse = await fetch(mediaUrl, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        if (!twilioResponse.ok) {
            console.error(`[Transcription] Failed to fetch Twilio audio. Status: ${twilioResponse.status}`);
            return "[Audio fetch failed]";
        }

        const arrayBuffer = await twilioResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`🎙️ [Transcription] Downloaded ${buffer.length} bytes. Sending to Whisper...`);

        // 2. Create a virtual File object from the buffer to send to OpenAI
        // The mimetype and filename don't stringently matter for Whisper if it's a valid format, 
        // but we'll use ogg as that's what WhatsApp sends.
        const file = new File([buffer], "audio.ogg", { type: "audio/ogg" });

        // 3. Call Whisper — force Marathi (ISO 639-1: "mr") so it never
        //    misdetects Marathi speech as Kannada, Hindi, or other regional languages.
        //    The prompt gives Whisper contextual hints for colloquial Marathi governance vocabulary.
        const transcriptionResponse = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "mr",
            prompt: "Marathi speech about government services, schemes, complaints, and citizen feedback in Maharashtra.",
        });

        console.log(`✅ [Transcription] Success: "${transcriptionResponse.text}"`);
        return transcriptionResponse.text;

    } catch (error) {
        console.error("❌ [Transcription] Error during audio transcription:", error);
        return "[Audio transcription failed. Please type your message instead.]";
    }
}
