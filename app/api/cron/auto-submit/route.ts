import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { processSessionWithAI } from "@/lib/ai";
import twilio from "twilio";

export async function GET(request: NextRequest) {
  try {
    // Basic API Key check matching Vercel Cron syntax
    const authHeader = request.headers.get("authorization");
    const isCronAction = authHeader === `Bearer ${process.env.CRON_SECRET}` || request.nextUrl.searchParams.get("key") === process.env.CRON_SECRET;

    if (process.env.CRON_SECRET && !isCronAction) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ── Find sessions sitting at the Continue Menu (Step 21) 
    //    that haven't been touched in over 1 minute.
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const abandonedSessions = await Session.find({
      completed: false,
      current_step: 21,
      updated_at: { $lte: oneMinuteAgo }
    }).lean();

    if (abandonedSessions.length === 0) {
      return NextResponse.json({ status: "success", message: "No abandoned sessions found." });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    let processedCount = 0;

    for (const session of abandonedSessions) {
      // 1. Mark as completed
      await Session.updateOne(
        { _id: session._id },
        { $set: { completed: true } }
      );

      // 2. Transmit to AI for processing independently
      const completedFlowsStr = session.answers?.completed_flows?.join(",") || "1";
      
      processSessionWithAI(
        session._id.toString(),
        session.office_id,
        session.answers,
        completedFlowsStr
      ).catch((err) => console.error(`[Cron Auth-Submit AI Error] ${session._id}`, err));

      // 3. Dispatch Twilio Whatsapp message silently notifying them it auto-submitted
      if (process.env.TWILIO_WHATSAPP_NUMBER && session.phone) {
        try {
          await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${session.phone}`,
            body: `⏳ Your feedback session was automatically submitted due to inactivity. Thank you! Your submission will help improve governance in Maharashtra.`
          });
        } catch (twErr) {
          console.error(`[Cron Twilio Error] Failed to send auto-submit notice to ${session.phone}:`, twErr);
        }
      }

      processedCount++;
    }

    return NextResponse.json({
      status: "success",
      message: `Successfully auto-submitted ${processedCount} abandoned sessions.`
    });

  } catch (error) {
    console.error("[Cron Auto-Submit Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
