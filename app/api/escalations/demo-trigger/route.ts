import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";
import { checkEscalationForOffice } from "@/lib/escalation";

export const dynamic = "force-dynamic";

/**
 * POST /api/escalations/demo-trigger
 *
 * FOR DEMO PURPOSES ONLY.
 * Forces a specific office's OMES below the threshold and immediately
 * runs the escalation engine — raising an alert and firing a WhatsApp message.
 *
 * Body: { office_id: string, omes?: number (default 1.8), months?: number (default 4) }
 */
export async function POST(req: Request) {
    try {
        await connectDB();
        const { office_id, digipin, omes = 1.8, months = 4 } = await req.json();

        if (!office_id && !digipin) {
            return NextResponse.json({ error: "Provide either office_id or digipin." }, { status: 400 });
        }

        // Accept either identifier — whichever you provide
        const query = office_id ? { office_id } : { digipin };
        const office = await Office.findOne(query).lean();
        if (!office) {
            const searched = office_id ? `office_id '${office_id}'` : `digipin '${digipin}'`;
            return NextResponse.json({ error: `Office with ${searched} not found.` }, { status: 404 });
        }
        const resolvedOfficeId = (office as any).office_id;

        // Step 1: Force the office metadata OMES below threshold
        await Office.findOneAndUpdate(
            { office_id: resolvedOfficeId },
            {
                $set: {
                    "metadata.omes": omes,
                    "metadata.trend": "declining",
                    "metadata.submissions_monthly": months * 5,
                },
            }
        );

        console.log(`🎭 [Demo] Forced ${resolvedOfficeId} OMES to ${omes}`);

        // Step 2: Run the escalation check — this will raise the escalation and fire WhatsApp
        await checkEscalationForOffice(resolvedOfficeId);

        return NextResponse.json({
            success: true,
            message: `Escalation triggered for '${(office as any).office_name}'. OMES forced to ${omes}. Check your WhatsApp and the Escalations page.`,
            office_name: (office as any).office_name,
            forced_omes: omes,
            check_whatsapp: true,
        });

    } catch (err: any) {
        console.error("[POST /api/escalations/demo-trigger]", err);
        return NextResponse.json({ error: "Demo trigger failed: " + err.message }, { status: 500 });
    }
}
