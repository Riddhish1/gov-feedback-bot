/**
 * scripts/seed-office-add-taluka.ts
 * ─────────────────────────────────
 * This script iterates over all existing Office records and assigns
 * a default 'taluka' based on their district or office name to
 * ensure data consistency for the new Regional Dashboard.
 *
 * Usage:
 *   npx tsx scripts/seed-office-add-taluka.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env or .env.local
const envLocal = path.resolve(process.cwd(), ".env.local");
const envFile = path.resolve(process.cwd(), ".env");
dotenv.config({ path: fs.existsSync(envLocal) ? envLocal : envFile });

import Office from "../models/Office";

// Safe mapping function to guess the taluka based on district or office name
function deriveTaluka(office: any): string {
    const districtLower = (office.district || "").toLowerCase();
    const nameLower = (office.office_name || "").toLowerCase();

    if (nameLower.includes("haveli")) return "Haveli";
    if (nameLower.includes("shirur")) return "Shirur";

    switch (districtLower) {
        case "pune": return "Pune City";
        case "mumbai": return "Mumbai City";
        case "solapur": return "North Solapur";
        case "satara": return "Satara";
        case "thane": return "Thane";
        case "raigad": return "Alibaug";
        case "palghar": return "Palghar";
        case "nashik": return "Nashik";
        case "nandurbar": return "Nandurbar";
        case "nagpur": return "Nagpur Urban";
        default: return office.district || "Default Taluka";
    }
}

async function addTalukaToOffices() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error("❌  MONGODB_URI is not defined.");
        process.exit(1);
    }

    console.log("🔌  Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    const offices = await Office.find({});
    console.log(`📋 Found ${offices.length} offices to update.`);

    let updatedCount = 0;
    for (const office of offices) {
        const taluka = deriveTaluka(office);

        await Office.updateOne(
            { _id: office._id },
            { $set: { taluka: taluka } }
        );

        console.log(`   ✔  Updated: ${office.office_name} -> Taluka: ${taluka}`);
        updatedCount++;
    }

    console.log(`\n✅ Successfully added taluka to ${updatedCount} offices.`);
    await mongoose.disconnect();
}

addTalukaToOffices().catch((err) => {
    console.error("❌  Failed to add taluka:", err);
    process.exit(1);
});
