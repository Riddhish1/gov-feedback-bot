import { connectDB } from "../lib/db";
import Session from "../models/Session";
import { processSessionWithAI } from "../lib/ai";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testAutoResponder() {
    await connectDB();

    console.log("Creating a mock session...");

    const mockSession = await Session.create({
        phone: process.env.DEMO_NOTIFY_NUMBER || "919876543210", // Fallback if no demo number
        office_id: "TEST_AUTO_RESPONDER",
        office_name: "Test Office",
        current_step: 12,
        completed: true,
        answers: {
            flow_choice: 2, // Policy Suggestion
            cat2_flow_type: "1", // Improve Existing Scheme
            cat2_scheme_name: "Mahila Samman Yojana",
            cat2_improvement_needed: "I want free bus travel everywhere instead of 50%",
            cat2_mandatory_feedback: "The Mahila Samman Yojana currently gives 50% discount but it should be 100% free across the whole state.",
        }
    });

    console.log(`Mock Session ID: ${mockSession._id}`);
    console.log("Triggering processSessionWithAI...");

    const result = await processSessionWithAI(
        mockSession._id.toString(),
        "TEST_AUTO_RESPONDER",
        mockSession.answers,
        2
    );

    console.log("AI Result:");
    console.dir(result, { depth: null });

    console.log("Cleaning up mock session...");
    await Session.findByIdAndDelete(mockSession._id);
    console.log("Done. Check terminal/WhatsApp for Twilio output.");
    process.exit(0);
}

testAutoResponder();
