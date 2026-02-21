/**
 * Seed script — populates the `offices` collection with sample data.
 *
 * Usage:
 *   npx tsx scripts/seed-offices.ts
 *
 * Requirements:
 *   MONGODB_URI must be set in your .env or .env.local file.
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

const SAMPLE_OFFICES = [
  {
    office_id: "1023",
    office_name: "Collector Office Pune",
    district: "Pune",
    state: "Maharashtra",
  },
  {
    office_id: "1024",
    office_name: "Tehsil Office Haveli",
    district: "Pune",
    state: "Maharashtra",
  },
  {
    office_id: "2001",
    office_name: "Regional Transport Office Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
  },
  {
    office_id: "3010",
    office_name: "District Health Office Nashik",
    district: "Nashik",
    state: "Maharashtra",
  },
  {
    office_id: "4005",
    office_name: "Panchayat Samiti Office Shirur",
    district: "Pune",
    state: "Maharashtra",
  },
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("❌  MONGODB_URI is not defined. Check your .env file.");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected.");

  for (const office of SAMPLE_OFFICES) {
    await Office.findOneAndUpdate(
      { office_id: office.office_id },
      { $set: office },
      { upsert: true, new: true }
    );
    console.log(`   ✔  Upserted: ${office.office_id} — ${office.office_name}`);
  }

  console.log(`\n🌱  Seeded ${SAMPLE_OFFICES.length} offices successfully.`);
  await mongoose.disconnect();
  console.log("🔌  Disconnected.");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
