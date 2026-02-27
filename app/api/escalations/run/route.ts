import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { runEscalationSweep } from "@/lib/escalation";

export const dynamic = "force-dynamic";

/**
 * POST /api/escalations/run
 * Manually triggers a full escalation sweep across all active offices.
 * Can also be called by a Vercel Cron job nightly.
 */
export async function POST() {
    try {
        await connectDB();
        const result = await runEscalationSweep();
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error("[POST /api/escalations/run]", err);
        return NextResponse.json({ error: "Escalation sweep failed." }, { status: 500 });
    }
}
