import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";
import Session from "@/models/Session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();

        // 1. Office Metrics
        const totalOffices = await Office.countDocuments({ is_active: true });
        const officesUnderReview = await Office.countDocuments({ is_active: false });

        // 2. Statewide OMES calculation
        // Average the "metadata.omes" for active offices that actually have a score
        const officesWithOmes = await Office.find({
            is_active: true,
            "metadata.omes": { $gt: 0 }
        }).select("metadata.omes").lean();

        let stateOmes = 0;
        if (officesWithOmes.length > 0) {
            const sum = officesWithOmes.reduce((acc, o: any) => acc + (o.metadata?.omes || 0), 0);
            stateOmes = Number((sum / officesWithOmes.length).toFixed(2));
        }

        // 3. Feedback Submissions
        const totalSubmissions = await Session.countDocuments({ completed: true });

        // 4. Reform Signals (Policy & Process suggestions)
        const reformSignals = await Session.countDocuments({
            completed: true,
            "answers.flow_choice": { $in: [2, 3] }
        });

        // 5. Sentiment breakdown to find Positive %
        const totalAnalyzed = await Session.countDocuments({
            completed: true,
            "ai_analysis.sentiment": { $ne: null }
        });
        const positiveCount = await Session.countDocuments({
            completed: true,
            "ai_analysis.sentiment": "Positive"
        });

        const positivePct = totalAnalyzed > 0 ? Math.round((positiveCount / totalAnalyzed) * 100) : 0;

        // Return the aggregated metrics
        return NextResponse.json({
            totalOffices,
            officesUnderReview,
            stateOmes,
            totalSubmissions,
            reformSignals,
            positivePct
        });

    } catch (error) {
        console.error("[GET /api/dashboard/summary]", error);
        return NextResponse.json(
            { error: "Failed to fetch aggregated dashboard summary" },
            { status: 500 }
        );
    }
}
