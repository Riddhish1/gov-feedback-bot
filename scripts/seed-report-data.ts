/**
 * Seed demo session data using REAL office IDs from the database.
 * Generates data across 6 months to populate all 6 report types.
 *
 * Usage:  npx tsx scripts/seed-report-data.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Lightweight Session schema (avoids Next.js alias issues with tsx) ─────────

const SessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    language: { type: String, default: null },
    office_id: { type: String, required: true },
    office_name: { type: String, required: true },
    current_step: { type: Number, default: 22 },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    ai_analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    completed: { type: Boolean, default: true, index: true },
  },
  {
    collection: "sessions",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICES = ["Certificate", "License", "Scheme Approval", "Land Record", "Other"];

function randomDateIn(year: number, month: number): Date {
  const day = Math.floor(Math.random() * 28) + 1;
  const hour = Math.floor(Math.random() * 10) + 8;
  return new Date(year, month - 1, day, hour, 0, 0);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randRating(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPhone(): string {
  return `+919${String(Math.floor(Math.random() * 900000000 + 100000000))}`;
}

function buildSession(
  officeId: string,
  officeName: string,
  r: number,
  createdAt: Date
) {
  const svc = pick(SERVICES);
  return {
    phone: randomPhone(),
    language: pick(["mr", "en"]),
    office_id: officeId,
    office_name: officeName,
    current_step: 22,
    completed: true,
    answers: {
      flow_choice: 1,
      completed_flows: [1],
      rating: r,
      feedback: null,
      office_rating: r,
      cat1_q1_helpdesk: pick(["Yes", "No"]),
      cat1_q2_charter: pick(["Yes", "No", "Partially"]),
      cat1_q3_map: pick(["Yes", "No"]),
      cat1_q4_seating: randRating(1, 5),
      cat1_q5_water: pick(["Yes", "No"]),
      cat1_q6_toilets: randRating(1, 5),
      cat1_q7_fulfilled: pick(["Fully", "Partially", "No"]),
      cat1_q8_service: svc,
      cat1_q9_overall: r,
      cat1_q10_comments: "Seeded demo feedback",
    },
    ai_analysis: {
      sentiment: r >= 4 ? "Positive" : r >= 3 ? "Neutral" : "Negative",
      confidence: Math.floor(Math.random() * 30) + 70,
      themes: r >= 4 ? ["Good Service", "Clean Office"] : ["Long Wait", "Poor Hygiene"],
      translated_text: null,
      keywords: [],
      reform_recommendation: null,
    },
    created_at: createdAt,
    updated_at: createdAt,
  };
}

// ── Seed function for a group of months ───────────────────────────────────────

async function seedGroup(
  label: string,
  offices: { id: string; name: string }[],
  months: { year: number; month: number; ratingRange: [number, number] }[],
  sessionsPerMonth: number
): Promise<number> {
  let count = 0;
  console.log(`\n📦 ${label} — ${offices.length} offices × ${months.length} months`);

  for (const office of offices) {
    for (const m of months) {
      const docs = [];
      for (let i = 0; i < sessionsPerMonth; i++) {
        const r = randRating(m.ratingRange[0], m.ratingRange[1]);
        docs.push(buildSession(office.id, office.name, r, randomDateIn(m.year, m.month)));
      }
      await Session.insertMany(docs);
      count += docs.length;
    }
    process.stdout.write(`   ✅ ${office.id}\n`);
  }
  return count;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("🔗 Connected to MongoDB");

  // 1. First, clean up any previous seeded sessions
  const deleted = await Session.deleteMany({ "answers.cat1_q10_comments": "Seeded demo feedback" });
  console.log(`🧹 Cleaned ${deleted.deletedCount} previously seeded sessions`);

  // 2. Fetch real office IDs from the database
  const officesColl = mongoose.connection.collection("offices");
  const allOffices = await officesColl
    .find({ is_active: true })
    .project({ office_id: 1, office_name: 1 })
    .limit(200)
    .toArray();

  if (allOffices.length < 30) {
    console.error(`❌ Need at least 30 offices in DB, found ${allOffices.length}`);
    process.exit(1);
  }

  const toRef = (o: any) => ({ id: o.office_id, name: o.office_name });

  // Partition offices into groups for each report type
  const group5star3mo    = allOffices.slice(0, 5).map(toRef);    // 5 offices → Type 1+2+3
  const group5star2mo    = allOffices.slice(5, 8).map(toRef);    // 3 offices → Type 1+2
  const group5star1mo    = allOffices.slice(8, 11).map(toRef);   // 3 offices → Type 1
  const groupLowSustain  = allOffices.slice(11, 16).map(toRef);  // 5 offices → Type 4
  const groupDeclining   = allOffices.slice(16, 20).map(toRef);  // 4 offices → Type 5
  const groupAverage     = allOffices.slice(20, 30).map(toRef);  // 10 offices → fill Type 6

  let total = 0;

  // ── Type 1 + 2 + 3:  5★ for 3 consecutive months (Dec 2025 – Feb 2026)
  total += await seedGroup("5★ × 3-month streak (→ Types 1, 2, 3)", group5star3mo, [
    { year: 2025, month: 12, ratingRange: [5, 5] },
    { year: 2026, month: 1,  ratingRange: [5, 5] },
    { year: 2026, month: 2,  ratingRange: [5, 5] },
  ], 8);

  // ── Type 1 + 2:  5★ for 2 consecutive months (Jan + Feb 2026)
  total += await seedGroup("5★ × 2-month streak (→ Types 1, 2)", group5star2mo, [
    { year: 2026, month: 1, ratingRange: [5, 5] },
    { year: 2026, month: 2, ratingRange: [5, 5] },
  ], 8);

  // ── Type 1 only:  5★ in Feb 2026 only
  total += await seedGroup("5★ last month only (→ Type 1)", group5star1mo, [
    { year: 2026, month: 2, ratingRange: [5, 5] },
  ], 10);

  // ── Type 4:  <3★ sustained for 4 months (Nov 2025 – Feb 2026)
  total += await seedGroup("<3★ × 4 months sustained (→ Type 4)", groupLowSustain, [
    { year: 2025, month: 11, ratingRange: [1, 2] },
    { year: 2025, month: 12, ratingRange: [1, 2] },
    { year: 2026, month: 1,  ratingRange: [1, 2] },
    { year: 2026, month: 2,  ratingRange: [1, 2] },
  ], 6);

  // ── Type 5:  Was ≥3★, then declined to <3★ for 4 months
  total += await seedGroup("3★→<3★ declining (→ Type 5)", groupDeclining, [
    { year: 2025, month: 9,  ratingRange: [3, 4] },  // was OK
    { year: 2025, month: 10, ratingRange: [1, 2] },   // dropped
    { year: 2025, month: 11, ratingRange: [1, 2] },
    { year: 2025, month: 12, ratingRange: [1, 2] },
    { year: 2026, month: 1,  ratingRange: [1, 2] },
    { year: 2026, month: 2,  ratingRange: [1, 2] },
  ], 6);

  // ── Average performers (3–4★) for Type 6 richness
  total += await seedGroup("Average performers (→ Type 6)", groupAverage, [
    { year: 2026, month: 1, ratingRange: [3, 4] },
    { year: 2026, month: 2, ratingRange: [3, 4] },
  ], 6);

  console.log(`\n🎉 Seeded ${total} demo sessions.`);
  console.log(`\n👉 Now click "Generate Reports" on /reports (or hit GET /api/cron/monthly-reports?month=2026-02)\n`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
