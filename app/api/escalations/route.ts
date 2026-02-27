import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Escalation from "@/models/Escalation";

export const dynamic = "force-dynamic";

/**
 * GET /api/escalations
 * Returns all escalations, optionally filtered by status or office.
 * Query params: status, office_id, level, page, limit
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "";
        const office_id = searchParams.get("office_id") || "";
        const level = searchParams.get("level") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const query: Record<string, any> = {};
        if (status) query.status = status;
        if (office_id) query.office_id = office_id;
        if (level) query.level = parseInt(level);

        const [escalations, total] = await Promise.all([
            Escalation.find(query)
                .sort({ triggered_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Escalation.countDocuments(query),
        ]);

        // Summary stats for the dashboard strip
        const openCount = await Escalation.countDocuments({ status: "open" });
        const l4Count = await Escalation.countDocuments({ status: "open", level: 4 });
        const l3Count = await Escalation.countDocuments({ status: "open", level: 3 });
        const resolvedToday = await Escalation.countDocuments({
            status: "resolved",
            resolved_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });

        return NextResponse.json({
            escalations,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            summary: { openCount, l4Count, l3Count, resolvedToday },
        });
    } catch (err) {
        console.error("[GET /api/escalations]", err);
        return NextResponse.json({ error: "Failed to fetch escalations" }, { status: 500 });
    }
}
