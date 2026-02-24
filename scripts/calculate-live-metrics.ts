/**
 * Script to forcefully recalculate OMES and Office Metrics for all current offices based on the newly seeded live sessions data.
 * 
 * Usage: npx tsx scripts/calculate-live-metrics.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const envLocal = path.resolve(process.cwd(), ".env.local");
const envFile = path.resolve(process.cwd(), ".env");
dotenv.config({ path: fs.existsSync(envLocal) ? envLocal : envFile });

import Office from "../models/Office";
import { computeOfficeMetrics } from "../lib/metrics";

async function run() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI missing.");
        process.exit(1);
    }

    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);

        const allOffices = await Office.find({ is_active: true });
        console.log(`📊 Found ${allOffices.length} active offices. Starting metric calculation...`);

        let computed = 0;
        for (const office of allOffices) {
            const metrics = await computeOfficeMetrics(office.office_id);
            if (metrics) {
                computed++;
                console.log(`   ✔ Updated: ${office.office_name} (OMES: ${metrics.omes})`);
            }
        }

        console.log(`\n🎉 Successfully calculated OMES and metadata for ${computed} offices.`);

    } catch (e) {
        console.error("❌ Error calculating metrics:", e);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected.");
        process.exit(0);
    }
}

run();
