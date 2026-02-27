/**
 * scripts/seed-demo-data.ts
 * ─────────────────────────
 * One script to rule them all.
 * 1. Updates the Office.metadata (omes, trend, themes, confidence, submissions_monthly)
 *    to match the escalation scenario — so the Office Registry and Escalation page
 *    are always showing consistent, coherent data.
 * 2. Rebuilds the Escalation collection using those same real OMES values.
 *
 * Run: npx tsx scripts/seed-demo-data.ts
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Office from "../models/Office";
import Escalation from "../models/Escalation";

async function connectDB() {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
}

const THRESHOLD = 3.0;

function daysBack(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

/**
 * Per-office demo scenario.
 * Each entry drives BOTH the office.metadata update AND the escalation record.
 */
const OFFICE_SCENARIOS: Array<{
    officeIndex: number;
    omes: number;
    trend: "declining" | "stable" | "improving";
    themes: string[];
    confidence: "High" | "Medium" | "Low";
    submissions: number;
    escalationLevel: 1 | 2 | 3 | 4 | null; // null = no escalation (performing okay)
    escalationStatus: "open" | "action_uploaded" | "resolved" | null;
    consecutiveMonths: number;
    daysAgo: number;
}> = [
        // ─── UNDERPERFORMING (will have escalations) ───────────────────────────────
        {
            officeIndex: 0,  // Collector Office Pune
            omes: 1.8, trend: "declining", themes: ["Long Wait Times", "Staff Behavior", "Queue Management"],
            confidence: "High", submissions: 42,
            escalationLevel: 4, escalationStatus: "open", consecutiveMonths: 6, daysAgo: 90,
        },
        {
            officeIndex: 1,  // RTO Pune
            omes: 2.1, trend: "declining", themes: ["Documentation Issues", "Corruption", "Rude Staff"],
            confidence: "High", submissions: 38,
            escalationLevel: 3, escalationStatus: "open", consecutiveMonths: 5, daysAgo: 75,
        },
        {
            officeIndex: 2,  // Pune Municipal Corporation
            omes: 2.4, trend: "declining", themes: ["Infrastructure", "Delayed Services", "Staff Absence"],
            confidence: "Medium", submissions: 29,
            escalationLevel: 3, escalationStatus: "action_uploaded", consecutiveMonths: 5, daysAgo: 60,
        },
        {
            officeIndex: 3,  // Collector Office Satara
            omes: 2.6, trend: "declining", themes: ["Long Wait Times", "Staff Behavior"],
            confidence: "Medium", submissions: 21,
            escalationLevel: 2, escalationStatus: "open", consecutiveMonths: 3, daysAgo: 45,
        },
        {
            officeIndex: 4,  // Zilla Parishad Solapur
            omes: 2.7, trend: "declining", themes: ["Documentation Issues", "Facilities"],
            confidence: "Medium", submissions: 18,
            escalationLevel: 2, escalationStatus: "open", consecutiveMonths: 4, daysAgo: 40,
        },
        {
            officeIndex: 5,  // BMC Headquarters Mumbai
            omes: 2.8, trend: "stable", themes: ["Staff Behavior", "Long Wait Times"],
            confidence: "Medium", submissions: 15,
            escalationLevel: 2, escalationStatus: "action_uploaded", consecutiveMonths: 3, daysAgo: 30,
        },
        {
            officeIndex: 6,  // Sub-Registrar Office Mumbai City
            omes: 2.9, trend: "stable", themes: ["Process Complexity", "Queue Management"],
            confidence: "Low", submissions: 9,
            escalationLevel: 1, escalationStatus: "open", consecutiveMonths: 1, daysAgo: 14,
        },
        {
            officeIndex: 7,  // Collector Office Thane
            omes: 2.5, trend: "declining", themes: ["Infrastructure", "Staff Absence"],
            confidence: "Medium", submissions: 14,
            escalationLevel: 1, escalationStatus: "open", consecutiveMonths: 2, daysAgo: 10,
        },
        {
            officeIndex: 8,  // District Civil Hospital Alibaug
            omes: 2.8, trend: "improving", themes: ["Cleanliness", "Staff Behavior"],
            confidence: "Low", submissions: 7,
            escalationLevel: 1, escalationStatus: "resolved", consecutiveMonths: 1, daysAgo: 5,
        },
        {
            officeIndex: 9,  // Tehsil Office Palghar
            omes: 2.7, trend: "declining", themes: ["Long Wait Times", "Facilities"],
            confidence: "Low", submissions: 6,
            escalationLevel: 1, escalationStatus: "open", consecutiveMonths: 1, daysAgo: 3,
        },
        // ─── GOOD PERFORMERS (no escalation, metrics still updated) ───────────────
        {
            officeIndex: 10, // Collector Office Nashik
            omes: 4.1, trend: "improving", themes: ["Digital Services", "Friendly Staff"],
            confidence: "High", submissions: 55,
            escalationLevel: null, escalationStatus: null, consecutiveMonths: 0, daysAgo: 0,
        },
        {
            officeIndex: 11, // RTO Nashik
            omes: 3.8, trend: "stable", themes: ["Good Infrastructure", "Quick Service"],
            confidence: "High", submissions: 47,
            escalationLevel: null, escalationStatus: null, consecutiveMonths: 0, daysAgo: 0,
        },
        {
            officeIndex: 12, // Gram Panchayat Nandurbar
            omes: 4.4, trend: "improving", themes: ["Helpful Staff", "Digital Adoption"],
            confidence: "High", submissions: 62,
            escalationLevel: null, escalationStatus: null, consecutiveMonths: 0, daysAgo: 0,
        },
        {
            officeIndex: 13, // Collectorate Nagpur
            omes: 3.5, trend: "stable", themes: ["Transparency", "Process Clarity"],
            confidence: "Medium", submissions: 33,
            escalationLevel: null, escalationStatus: null, consecutiveMonths: 0, daysAgo: 0,
        },
        {
            officeIndex: 14, // Nagpur Municipal Corporation
            omes: 3.9, trend: "improving", themes: ["Smart City Projects", "Efficient Teams"],
            confidence: "High", submissions: 44,
            escalationLevel: null, escalationStatus: null, consecutiveMonths: 0, daysAgo: 0,
        },
    ];

async function main() {
    await connectDB();

    const offices = await Office.find({ is_active: true }).lean();
    if (offices.length === 0) {
        console.error("❌ No offices found. Run seed-offices.ts first.");
        process.exit(1);
    }

    console.log(`📋 Found ${offices.length} offices in DB.\n`);

    // ── Step 1: Update office.metadata to match scenarios ─────────────────────
    console.log("🔄 Updating office metadata...");
    let officesUpdated = 0;

    for (const s of OFFICE_SCENARIOS) {
        const office = offices[s.officeIndex % offices.length] as any;
        await Office.findOneAndUpdate(
            { office_id: office.office_id },
            {
                $set: {
                    metadata: {
                        omes: s.omes,
                        trend: s.trend,
                        themes: s.themes,
                        confidence: s.confidence,
                        submissions_monthly: s.submissions,
                    },
                },
            }
        );
        console.log(
            `   ✅ ${office.office_name.padEnd(45)} OMES: ${s.omes} | Trend: ${s.trend}`
        );
        officesUpdated++;
    }

    // ── Step 2: Rebuild escalations from same OMES values ─────────────────────
    console.log(`\n🗑️  Clearing existing escalations...`);
    await Escalation.deleteMany({});

    const escalationScenarios = OFFICE_SCENARIOS.filter(
        (s) => s.escalationLevel !== null
    );

    const records = escalationScenarios.map((s) => {
        const office = offices[s.officeIndex % offices.length] as any;
        const triggeredAt = s.daysAgo > 0 ? daysBack(s.daysAgo) : new Date();

        return {
            office_id: office.office_id,
            office_name: office.office_name,
            district: office.district,
            division: office.division || office.district,
            department: office.department || "General Administration",
            level: s.escalationLevel,
            omes_at_trigger: s.omes,           // same OMES as office.metadata.omes ✅
            consecutive_months_below: s.consecutiveMonths,
            threshold_used: THRESHOLD,
            status: s.escalationStatus!,
            triggered_at: triggeredAt,
            ...(s.escalationStatus === "action_uploaded"
                ? {
                    corrective_action_note:
                        "Additional staff deployed to reception counters. " +
                        "Token-based queue management system introduced. " +
                        "All front-desk personnel completed citizen sensitivity training on Feb 10, 2026.",
                    action_uploaded_by: "Office Head",
                    action_uploaded_at: daysBack(s.daysAgo - 3),
                }
                : {}),
            ...(s.escalationStatus === "resolved"
                ? { resolved_at: daysBack(1) }
                : {}),
        };
    });

    await Escalation.insertMany(records);

    console.log(`\n✅ Seeded ${records.length} escalations:\n`);
    records.forEach((r: any) => {
        console.log(
            `   L${r.level} [${r.status.padEnd(16)}] ${r.office_name.padEnd(45)} ` +
            `OMES: ${r.omes_at_trigger} | District: ${r.district}`
        );
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Offices with data updated : ${officesUpdated}`);
    console.log(`   Escalations created       : ${records.length}`);
    console.log(`   Open                      : ${records.filter((r: any) => r.status === "open").length}`);
    console.log(`   Action Uploaded           : ${records.filter((r: any) => r.status === "action_uploaded").length}`);
    console.log(`   Resolved                  : ${records.filter((r: any) => r.status === "resolved").length}`);

    await mongoose.disconnect();
    console.log("\n✅ All done. Data is now fully consistent.");
}

main().catch((e) => { console.error(e); process.exit(1); });
