/**
 * scripts/seed-escalations.ts
 * Seeds escalations using ONLY real office data from MongoDB.
 * Run: npx tsx scripts/seed-escalations.ts
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Escalation from "../models/Escalation";
import Office from "../models/Office";

async function connectDB() {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
}

// Each scenario assigns a specific office_index from the fetched offices array
// Level + OMES + months are purely illustrative — all office identity fields come from DB
const SCENARIOS: Array<{
    officeIndex: number;
    level: 1 | 2 | 3 | 4;
    omes: number;
    months: number;
    status: "open" | "resolved" | "action_uploaded";
    daysAgo: number;
}> = [
        { officeIndex: 0, level: 4, omes: 1.8, months: 6, status: "open", daysAgo: 90 },
        { officeIndex: 1, level: 3, omes: 2.1, months: 5, status: "open", daysAgo: 75 },
        { officeIndex: 2, level: 3, omes: 2.4, months: 5, status: "action_uploaded", daysAgo: 60 },
        { officeIndex: 3, level: 2, omes: 2.6, months: 3, status: "open", daysAgo: 45 },
        { officeIndex: 4, level: 2, omes: 2.7, months: 4, status: "open", daysAgo: 40 },
        { officeIndex: 5, level: 2, omes: 2.8, months: 3, status: "action_uploaded", daysAgo: 30 },
        { officeIndex: 6, level: 1, omes: 2.9, months: 1, status: "open", daysAgo: 14 },
        { officeIndex: 7, level: 1, omes: 2.5, months: 2, status: "open", daysAgo: 10 },
        { officeIndex: 8, level: 1, omes: 2.8, months: 1, status: "resolved", daysAgo: 5 },
        { officeIndex: 9, level: 1, omes: 2.7, months: 1, status: "open", daysAgo: 3 },
    ];

const THRESHOLD = 3.0;

function daysBack(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

async function main() {
    await connectDB();

    const offices = await Office.find({ is_active: true }).lean();
    if (offices.length === 0) {
        console.error("❌ No offices found. Run seed-offices.ts first.");
        process.exit(1);
    }

    console.log(`📋 Found ${offices.length} offices in DB.`);

    await Escalation.deleteMany({});
    console.log("🗑️  Cleared existing escalations");

    const records = SCENARIOS.map((s) => {
        const office = offices[s.officeIndex % offices.length] as any;
        const triggeredAt = daysBack(s.daysAgo);

        return {
            office_id: office.office_id,
            office_name: office.office_name,
            district: office.district,
            division: office.division || office.district,
            department: office.department || "General Administration",
            level: s.level,
            omes_at_trigger: s.omes,
            consecutive_months_below: s.months,
            threshold_used: THRESHOLD,
            status: s.status,
            triggered_at: triggeredAt,
            ...(s.status === "action_uploaded" ? {
                corrective_action_note:
                    "Additional staff deployed to reception counters. Token-based queue management introduced. " +
                    "All front-desk personnel completed sensitivity training on Feb 10, 2026.",
                action_uploaded_by: "Office Head",
                action_uploaded_at: daysBack(s.daysAgo - 3),
            } : {}),
            ...(s.status === "resolved" ? {
                resolved_at: daysBack(1),
            } : {}),
        };
    });

    await Escalation.insertMany(records);

    console.log(`\n✅ Seeded ${records.length} escalations:`);
    records.forEach(r => {
        console.log(`   L${r.level} [${r.status.padEnd(16)}] ${r.office_name} (${r.district}/${r.division}) — OMES ${r.omes_at_trigger}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
