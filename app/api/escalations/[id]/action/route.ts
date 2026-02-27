import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Escalation from "@/models/Escalation";

export const dynamic = "force-dynamic";

/**
 * POST /api/escalations/[id]/action
 * Office head uploads a corrective action note to pause the escalation clock.
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { note, uploaded_by } = await req.json();

        if (!note || note.trim().length < 10) {
            return NextResponse.json(
                { error: "Corrective action note must be at least 10 characters." },
                { status: 400 }
            );
        }

        const escalation = await Escalation.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: "action_uploaded",
                    corrective_action_note: note.trim(),
                    action_uploaded_by: uploaded_by || "Office Head",
                    action_uploaded_at: new Date(),
                },
            },
            { returnDocument: "after" }
        );

        if (!escalation) {
            return NextResponse.json({ error: "Escalation not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, escalation });
    } catch (err) {
        console.error("[POST /api/escalations/[id]/action]", err);
        return NextResponse.json({ error: "Failed to upload corrective action." }, { status: 500 });
    }
}
