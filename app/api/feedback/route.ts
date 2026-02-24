import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const sentiment = searchParams.get('sentiment') || '';
        const flow = searchParams.get('flow') || '';

        await connectDB();

        // Only get completed sessions that actually have answers
        const query: any = { completed: true };

        if (search) {
            query.$or = [
                { office_name: { $regex: search, $options: 'i' } },
                { 'answers.feedback': { $regex: search, $options: 'i' } },
                { 'answers.process_suggestion': { $regex: search, $options: 'i' } },
                { 'answers.scheme_suggestion': { $regex: search, $options: 'i' } }
            ];
        }

        if (sentiment) {
            query['ai_analysis.sentiment'] = sentiment;
        }

        if (flow) {
            query['answers.flow_choice'] = parseInt(flow);
        }

        const total = await Session.countDocuments(query);
        const sessions = await Session.find(query)
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            sessions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("[GET /api/feedback]", error);
        return NextResponse.json(
            { error: "Failed to fetch feedback" },
            { status: 500 }
        );
    }
}
