import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import EscalationNotification from "@/models/EscalationNotification";

export const dynamic = "force-dynamic";

/**
 * GET /api/escalations/notifications
 * Returns recent WhatsApp notifications sent by the escalation engine.
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const office_id = searchParams.get("office_id") || "";

        const query: Record<string, any> = {};
        if (office_id) query.office_id = office_id;

        const notifications = await EscalationNotification.find(query)
            .sort({ sent_at: -1 })
            .limit(limit)
            .lean();

        const total = await EscalationNotification.countDocuments(query);
        const sentCount = await EscalationNotification.countDocuments({ status: "sent" });
        const failedCount = await EscalationNotification.countDocuments({ status: "failed" });

        return NextResponse.json({ notifications, total, sentCount, failedCount });
    } catch (err) {
        console.error("[GET /api/escalations/notifications]", err);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
