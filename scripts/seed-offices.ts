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
    office_id: "OFF-MH-1023",
    office_name: "Pune Revenue Office A",
    district: "Pune",
    state: "Maharashtra",
    division: "Pune",
    department: "Administration",
    office_type: "Revenue",
    digipin: "MH-PUN-1023",
    services: ["Land Records", "Certificates", "Aadhaar Linking"],
    expected_visitors: 2840,
    working_hours: { from: "09:30", to: "17:30" },
    address: "Bund Garden Rd, Pune, Maharashtra 411001",
    geo: { lat: 18.528, lng: 73.874 },
    office_head_contact: { name: "Rajesh Patil", phone: "9876543210", email: "head.pune@gov.in" },
    collector_contact: { name: "Dr. Suhas Diwase", phone: "020-26114949", email: "collector.pune@maharashtra.gov.in" },
    divisional_commissioner_contact: { name: "Saurabh Rao", phone: "020-26122000", email: "divcom.pune@gov.in" },
    guardian_secretary: "Valsa Nair Singh",
    tags: ["revenue", "urban", "high-volume"],
    is_active: true,
    metadata: {
      omes: 3.12,
      trend: "improving",
      themes: ["Waiting Time Optimisation", "Citizen Guidance Clarity"],
      confidence: "High",
      submissions_monthly: 2840
    }
  },
  {
    office_id: "OFF-MH-1024",
    office_name: "Nashik Municipal North",
    district: "Nashik",
    state: "Maharashtra",
    division: "Nashik",
    department: "Municipal Corporation",
    office_type: "Municipal",
    digipin: "MH-NAS-1024",
    services: ["Property Tax", "Water Tax", "Birth & Death Certificates"],
    expected_visitors: 1920,
    working_hours: { from: "10:00", to: "18:00" },
    address: "Rajiv Gandhi Bhavan, Sharanpur Rd, Nashik, Maharashtra 422002",
    geo: { lat: 19.9975, lng: 73.7898 },
    office_head_contact: { name: "Dr. Ashok Karanjkar", phone: "9876543211", email: "head.nashik@gov.in" },
    collector_contact: { name: "Jalaj Sharma", phone: "0253-2578500", email: "collector.nashik@maharashtra.gov.in" },
    divisional_commissioner_contact: { name: "Radhakrishna Game", phone: "0253-2571000", email: "divcom.nashik@gov.in" },
    guardian_secretary: "Sujata Saunik",
    tags: ["municipal", "urban", "tax"],
    is_active: true,
    metadata: {
      omes: 2.94,
      trend: "improving",
      themes: ["Queue Flow Efficiency", "Documentation Clarity"],
      confidence: "High",
      submissions_monthly: 1920
    }
  },
  {
    office_id: "OFF-MH-2001",
    office_name: "Nagpur Tahsildar Office B",
    district: "Nagpur",
    state: "Maharashtra",
    division: "Nagpur",
    department: "Revenue",
    office_type: "Tehsil",
    digipin: "MH-NAG-2001",
    services: ["Income Certificate", "Domicile Certificate", "Caste Certificate"],
    expected_visitors: 3120,
    working_hours: { from: "09:30", to: "17:30" },
    address: "Civil Lines, Nagpur, Maharashtra 440001",
    geo: { lat: 21.1458, lng: 79.0882 },
    office_head_contact: { name: "Anil Bhatia", phone: "9876543212", email: "tahsildar.nagpur@gov.in" },
    collector_contact: { name: "Dr. Vipin Itankar", phone: "0712-2564973", email: "collector.nagpur@maharashtra.gov.in" },
    divisional_commissioner_contact: { name: "Vijayalakshmi Bidari", phone: "0712-2560934", email: "divcom.nagpur@gov.in" },
    guardian_secretary: "Manoj Saunik",
    tags: ["tehsil", "certificates", "rural-urban"],
    is_active: false,
    metadata: {
      omes: 3.28,
      trend: "stable",
      themes: ["Documentation Clarity", "Staff Responsiveness"],
      confidence: "High",
      submissions_monthly: 3120
    }
  },
  {
    office_id: "OFF-MH-3010",
    office_name: "Mumbai Transport Office Central",
    district: "Mumbai",
    state: "Maharashtra",
    division: "Konkan",
    department: "Transport",
    office_type: "RTO",
    digipin: "MH-MUM-3010",
    services: ["Licensing", "RC Services", "Permits"],
    expected_visitors: 4680,
    working_hours: { from: "09:00", to: "17:00" },
    address: "Tardeo Rd, Tardeo, Mumbai, Maharashtra 400034",
    geo: { lat: 18.975, lng: 72.8258 },
    office_head_contact: { name: "Bharat Kalaskar", phone: "9876543213", email: "rto.central@gov.in" },
    collector_contact: { name: "Rajendra Kshirsagar", phone: "022-22662440", email: "collector.mumbaicity@maharashtra.gov.in" },
    divisional_commissioner_contact: { name: "Mahendra Kalyankar", phone: "022-27572522", email: "divcom.konkan@gov.in" },
    guardian_secretary: "Ashish Kumar Singh",
    tags: ["rto", "transport", "high-volume"],
    is_active: true,
    metadata: {
      omes: 3.05,
      trend: "declining",
      themes: ["System Throughput", "Appointment Availability"],
      confidence: "High",
      submissions_monthly: 4680
    }
  },
  {
    office_id: "OFF-MH-4005",
    office_name: "Panchayat Samiti Office Shirur",
    district: "Pune",
    state: "Maharashtra",
    division: "Pune",
    department: "Local Government",
    office_type: "Panchayat",
    digipin: "MH-PUN-4005",
    services: ["Local Grants", "Rural Housing", "Agri Schemes"],
    expected_visitors: 850,
    working_hours: { from: "10:00", to: "17:30" },
    address: "Pune-Nagar Highway, Shirur, Pune District 412210",
    geo: { lat: 18.8277, lng: 74.3752 },
    office_head_contact: { name: "Sunil Shinde", phone: "9876543214", email: "bdo.shirur@gov.in" },
    collector_contact: { name: "Dr. Suhas Diwase", phone: "020-26114949", email: "collector.pune@maharashtra.gov.in" },
    divisional_commissioner_contact: { name: "Saurabh Rao", phone: "020-26122000", email: "divcom.pune@gov.in" },
    guardian_secretary: "Valsa Nair Singh",
    tags: ["panchayat", "rural", "schemes"],
    is_active: true,
    metadata: {
      omes: 3.82,
      trend: "improving",
      themes: ["Scheme Accessibility", "Staff Assistance"],
      confidence: "Medium",
      submissions_monthly: 850
    }
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
