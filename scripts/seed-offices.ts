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
  // Pune Division
  {
    office_id: "MH-PUN-COL-001",
    office_name: "Collector Office Pune",
    district: "Pune",
    state: "Maharashtra",
    division: "Pune",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-PUN-001",
    services: ["Land Records", "Certificates", "Disaster Management"],
    expected_visitors: 1200,
  },
  {
    office_id: "MH-PUN-RTO-001",
    office_name: "RTO Pune (MH-12)",
    district: "Pune",
    state: "Maharashtra",
    division: "Pune",
    department: "Transport",
    office_type: "RTO",
    digipin: "MH-PUN-002",
    services: ["Licensing", "Vehicle Registration", "Taxation"],
    expected_visitors: 2500,
  },
  {
    office_id: "MH-PUN-PMC-001",
    office_name: "Pune Municipal Corporation Main Building",
    district: "Pune",
    state: "Maharashtra",
    division: "Pune",
    department: "Urban Development",
    office_type: "Municipal Corporation",
    digipin: "MH-PUN-003",
    services: ["Property Tax", "Water Supply", "Building Permission"],
    expected_visitors: 3000,
  },
  {
    office_id: "MH-SAT-COL-001",
    office_name: "Collector Office Satara",
    district: "Satara",
    state: "Maharashtra",
    division: "Pune",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-SAT-001",
    services: ["Land Revenue", "Magisterial Duties"],
    expected_visitors: 600,
  },
  {
    office_id: "MH-SOL-ZP-001",
    office_name: "Zilla Parishad Solapur",
    district: "Solapur",
    state: "Maharashtra",
    division: "Pune",
    department: "Rural Development",
    office_type: "Zilla Parishad",
    digipin: "MH-SOL-001",
    services: ["Rural Education", "Health Schemes", "Agriculture"],
    expected_visitors: 800,
  },

  // Konkan Division
  {
    office_id: "MH-MUM-BMC-001",
    office_name: "BMC Headquarters Mumbai",
    district: "Mumbai City",
    state: "Maharashtra",
    division: "Konkan",
    department: "Urban Development",
    office_type: "Municipal Corporation",
    digipin: "MH-MUM-001",
    services: ["Civic Amenities", "Public Health", "City Engineering"],
    expected_visitors: 5000,
  },
  {
    office_id: "MH-MUM-SRO-001",
    office_name: "Sub-Registrar Office Mumbai City",
    district: "Mumbai City",
    state: "Maharashtra",
    division: "Konkan",
    department: "Registration & Stamps",
    office_type: "Sub-Registrar",
    digipin: "MH-MUM-002",
    services: ["Property Registration", "Marriage Registration"],
    expected_visitors: 400,
  },
  {
    office_id: "MH-THA-COL-001",
    office_name: "Collector Office Thane",
    district: "Thane",
    state: "Maharashtra",
    division: "Konkan",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-THA-001",
    services: ["Revenue Collection", "Election Duties"],
    expected_visitors: 1500,
  },
  {
    office_id: "MH-RAI-HOS-001",
    office_name: "District Civil Hospital Alibaug",
    district: "Raigad",
    state: "Maharashtra",
    division: "Konkan",
    department: "Public Health",
    office_type: "Civil Hospital",
    digipin: "MH-RAI-001",
    services: ["OPD", "Emergency Services", "Medicines"],
    expected_visitors: 1200,
  },
  {
    office_id: "MH-PAL-TEH-001",
    office_name: "Tehsil Office Palghar",
    district: "Palghar",
    state: "Maharashtra",
    division: "Konkan",
    department: "Revenue",
    office_type: "Tehsil",
    digipin: "MH-PAL-001",
    services: ["Income Certificate", "Caste Certificate", "7/12 Extract"],
    expected_visitors: 500,
  },

  // Nashik Division
  {
    office_id: "MH-NAS-COL-001",
    office_name: "Collector Office Nashik",
    district: "Nashik",
    state: "Maharashtra",
    division: "Nashik",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-NAS-001",
    services: ["Land Mapping", "Public Grievances"],
    expected_visitors: 1100,
  },
  {
    office_id: "MH-NAS-RTO-001",
    office_name: "RTO Nashik (MH-15)",
    district: "Nashik",
    state: "Maharashtra",
    division: "Nashik",
    department: "Transport",
    office_type: "RTO",
    digipin: "MH-NAS-002",
    services: ["Learning License", "Driving Test", "Permits"],
    expected_visitors: 1300,
  },
  {
    office_id: "MH-AHM-TEH-001",
    office_name: "Tehsil Office Ahmednagar",
    district: "Ahmednagar",
    state: "Maharashtra",
    division: "Nashik",
    department: "Revenue",
    office_type: "Tehsil",
    digipin: "MH-AHM-001",
    services: ["Ration Card", "Non-creamy Layer Certificate"],
    expected_visitors: 850,
  },
  {
    office_id: "MH-JAL-ZP-001",
    office_name: "Zilla Parishad Jalgaon",
    district: "Jalgaon",
    state: "Maharashtra",
    division: "Nashik",
    department: "Rural Development",
    office_type: "Zilla Parishad",
    digipin: "MH-JAL-001",
    services: ["Gram Panchayat Monitoring", "Rural Roads"],
    expected_visitors: 400,
  },
  {
    office_id: "MH-DHA-MCO-001",
    office_name: "Dhule Municipal Corporation",
    district: "Dhule",
    state: "Maharashtra",
    division: "Nashik",
    department: "Urban Development",
    office_type: "Municipal Corporation",
    digipin: "MH-DHA-001",
    services: ["Sanitation", "Solid Waste Management"],
    expected_visitors: 300,
  },

  // Nagpur Division
  {
    office_id: "MH-NAG-COL-001",
    office_name: "Collector Office Nagpur",
    district: "Nagpur",
    state: "Maharashtra",
    division: "Nagpur",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-NAG-001",
    services: ["District Planning", "Law and Order"],
    expected_visitors: 1800,
  },
  {
    office_id: "MH-NAG-NMC-001",
    office_name: "Nagpur Municipal Corporation",
    district: "Nagpur",
    state: "Maharashtra",
    division: "Nagpur",
    department: "Urban Development",
    office_type: "Municipal Corporation",
    digipin: "MH-NAG-002",
    services: ["Fire Brigade", "Town Planning", "Birth Certificates"],
    expected_visitors: 2200,
  },
  {
    office_id: "MH-WAR-FOR-001",
    office_name: "Deputy Conservator of Forests Wardha",
    district: "Wardha",
    state: "Maharashtra",
    division: "Nagpur",
    department: "Forest",
    office_type: "Forest Office",
    digipin: "MH-WAR-001",
    services: ["Wildlife Protection", "Afforestation", "Timber Transit Pass"],
    expected_visitors: 100,
  },
  {
    office_id: "MH-CHA-SP-001",
    office_name: "Superintendent of Police Chandrapur",
    district: "Chandrapur",
    state: "Maharashtra",
    division: "Nagpur",
    department: "Home",
    office_type: "Police Headquarters",
    digipin: "MH-CHA-001",
    services: ["Law Enforcement", "Passport Verification", "Cyber Crime"],
    expected_visitors: 250,
  },
  {
    office_id: "MH-BHA-TEH-001",
    office_name: "Tehsil Office Bhandara",
    district: "Bhandara",
    state: "Maharashtra",
    division: "Nagpur",
    department: "Revenue",
    office_type: "Tehsil",
    digipin: "MH-BHA-001",
    services: ["E-Seva Kendra", "Revenue Court"],
    expected_visitors: 350,
  },

  // Chhatrapati Sambhajinagar (Aurangabad) Division
  {
    office_id: "MH-CSN-COL-001",
    office_name: "Collector Office Chhatrapati Sambhajinagar",
    district: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    division: "Chhatrapati Sambhajinagar",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-CSN-001",
    services: ["Relief and Rehabilitation", "Minor Minerals"],
    expected_visitors: 1400,
  },
  {
    office_id: "MH-JALN-SRO-001",
    office_name: "Sub-Registrar Office Jalna",
    district: "Jalna",
    state: "Maharashtra",
    division: "Chhatrapati Sambhajinagar",
    department: "Registration & Stamps",
    office_type: "Sub-Registrar",
    digipin: "MH-JALN-001",
    services: ["Deed Registration", "Leave and License"],
    expected_visitors: 150,
  },
  {
    office_id: "MH-PAR-HOS-001",
    office_name: "District Civil Hospital Parbhani",
    district: "Parbhani",
    state: "Maharashtra",
    division: "Chhatrapati Sambhajinagar",
    department: "Public Health",
    office_type: "Civil Hospital",
    digipin: "MH-PAR-001",
    services: ["Inpatient Care", "Blood Bank", "Sonography"],
    expected_visitors: 800,
  },
  {
    office_id: "MH-NAN-NMC-001",
    office_name: "Nanded-Waghala Municipal Corporation",
    district: "Nanded",
    state: "Maharashtra",
    division: "Chhatrapati Sambhajinagar",
    department: "Urban Development",
    office_type: "Municipal Corporation",
    digipin: "MH-NAN-001",
    services: ["Trade Licenses", "Property Registration"],
    expected_visitors: 900,
  },
  {
    office_id: "MH-LAT-ELEC-001",
    office_name: "MSEDCL Division Office Latur",
    district: "Latur",
    state: "Maharashtra",
    division: "Chhatrapati Sambhajinagar",
    department: "Energy",
    office_type: "Electricity Board",
    digipin: "MH-LAT-001",
    services: ["New Connection", "Billing Grievances", "Fault Repair"],
    expected_visitors: 300,
  },

  // Amravati Division
  {
    office_id: "MH-AMR-COL-001",
    office_name: "Collector Office Amravati",
    district: "Amravati",
    state: "Maharashtra",
    division: "Amravati",
    department: "Revenue",
    office_type: "Collectorate",
    digipin: "MH-AMR-001",
    services: ["Natural Disaster Claims", "Caste Scrutiny"],
    expected_visitors: 950,
  },
  {
    office_id: "MH-AKO-TEH-001",
    office_name: "Tehsil Office Akola",
    district: "Akola",
    state: "Maharashtra",
    division: "Amravati",
    department: "Revenue",
    office_type: "Tehsil",
    digipin: "MH-AKO-001",
    services: ["Sanjay Gandhi Niradhar Yojana", "Land Disputes"],
    expected_visitors: 450,
  },
  {
    office_id: "MH-BULD-RTO-001",
    office_name: "RTO Buldhana (MH-28)",
    district: "Buldhana",
    state: "Maharashtra",
    division: "Amravati",
    department: "Transport",
    office_type: "RTO",
    digipin: "MH-BULD-001",
    services: ["Vehicle Transfer", "Fitness Certificate"],
    expected_visitors: 300,
  },
  {
    office_id: "MH-YAV-ZP-001",
    office_name: "Zilla Parishad Yavatmal",
    district: "Yavatmal",
    state: "Maharashtra",
    division: "Amravati",
    department: "Agriculture",
    office_type: "Zilla Parishad",
    digipin: "MH-YAV-001",
    services: ["Farmer Schemes", "Seed Distribution", "Irrigation Tools"],
    expected_visitors: 500,
  },
  {
    office_id: "MH-WASH-PWD-001",
    office_name: "Public Works Department Washim",
    district: "Washim",
    state: "Maharashtra",
    division: "Amravati",
    department: "Public Works",
    office_type: "PWD Office",
    digipin: "MH-WASH-001",
    services: ["Road Tenders", "Government Building Maintenance"],
    expected_visitors: 50,
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
