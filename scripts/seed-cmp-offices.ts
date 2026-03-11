/**
 * seed-cmp-offices.ts
 *
 * Reads "NEW CMP FAST PLUS 19.07.2024 NEW 1.xlsx" from the project root.
 * Each sheet name = the Taluka name.
 * Each row = one government office (DDO).
 *
 * Column → Office field mapping
 * ──────────────────────────────────────────────────────────────────────────────
 * REGION             → region
 * REGION NAME        → region_name (stored as division for now)
 * DISTRICT NAME      → district
 * TRY CODE           → treasury_code
 * DISTRICT TREASURY  → district_treasury
 * DDO CODE           → ddo_code  (also used as office_id)
 * SEVAARTH_ID        → sevaarth_id
 * NAME_AS_SEVAARTH_ID→ office_head_contact.name
 * DDO_OFFICE         → office_name
 * ROLE               → role
 * DDO DESIGNATION    → ddo_designation
 * OFFICE ADDRESS 1   → address_line1
 * OFFICE ADDRESS 2   → address_line2
 * OFFICE ADDRESS 3   → address_line3
 * EMAIL              → office_head_contact.email
 * MOBILE             → office_head_contact.phone
 * Sheet name         → taluka
 *
 * Usage:
 *   npx tsx scripts/seed-cmp-offices.ts
 */

import XLSX from "xlsx";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// ── Load env ─────────────────────────────────────────────────────────────────
const envLocal = path.resolve(process.cwd(), ".env.local");
const envFile = path.resolve(process.cwd(), ".env");
dotenv.config({ path: fs.existsSync(envLocal) ? envLocal : envFile });

import Office from "../models/Office";

// ── Config ───────────────────────────────────────────────────────────────────
const EXCEL_PATH = path.resolve(
    process.cwd(),
    "NEW CMP FAST PLUS  19.07.2024 NEW 1.xlsx"
);

// Columns that are noise / empty padding from the Excel
const SKIP_COLS = new Set([
    "Sr no", "Sr.No.", "S.NO.", "sr no", "SrNo", "SRNo", "SR NO.", "SRNO",
]);

// ── Helper to safely coerce a value to string ─────────────────────────────────
function str(val: any): string {
    if (val === null || val === undefined || val === "") return "";
    return String(val).trim();
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error("❌  MONGODB_URI is not set. Check your .env.local file.");
        process.exit(1);
    }

    if (!fs.existsSync(EXCEL_PATH)) {
        console.error(`❌  Excel file not found at:\n   ${EXCEL_PATH}`);
        process.exit(1);
    }

    console.log("🔌  Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅  Connected.\n");

    const wb = XLSX.readFile(EXCEL_PATH);
    let totalUpserted = 0;
    let totalSkipped = 0;

    for (const sheetName of wb.SheetNames) {
        const taluka = sheetName.trim(); // Each sheet = one Taluka
        const ws = wb.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        console.log(`\n📋  Sheet: "${taluka}" — ${rows.length} rows`);
        let sheetCount = 0;

        for (const row of rows) {
            // Skip serial-number-only rows or empty rows
            const ddoCode = str(row["DDO CODE "] || row["DDO CODE"] || row["DDO_CODE"]);
            const officeName = str(row["DDO_OFFICE"] || row["office name"] || "");

            if (!ddoCode && !officeName) {
                totalSkipped++;
                continue;
            }

            // office_id = DDO Code is the unique government identifier
            // fallback to sevaarth_id if DDO code missing
            const office_id = ddoCode || str(row["SEVAARTH_ID"]);
            if (!office_id) {
                console.warn(`  ⚠️  Row skipped — no DDO CODE or SEVAARTH_ID: ${JSON.stringify(row)}`);
                totalSkipped++;
                continue;
            }

            const addressLine1 = str(row["OFFICE ADDRESS 1"]);
            const addressLine2 = str(row["OFFICE ADDRESS 2"]);
            const addressLine3 = str(row["OFFICE ADDRESS 3"]);
            const fullAddress = [addressLine1, addressLine2, addressLine3]
                .filter(Boolean)
                .join(", ");

            const phone = str(row["MOBILE"] || row["MOBILE_1"]);
            const email = str(row["EMAIL"] || row["EMAIL_1"]);

            const officeData = {
                office_id,
                office_name: officeName || `Office ${office_id}`,
                district: str(row["DISTRICT NAME"]) || "Nashik",
                state: "Maharashtra",

                // Geographic
                region: str(row["REGION"]),
                division: str(row["REGION NAME"]),
                taluka,

                // Government identifiers
                ddo_code: ddoCode,
                treasury_code: str(row["TRY CODE"]),
                district_treasury: str(row["DISTRICT TREASURY"]),
                sevaarth_id: str(row["SEVAARTH_ID"]),

                // DDO details
                role: str(row["ROLE"]),
                ddo_designation: str(row["DDO DESIGNATION"]),

                // Address
                address_line1: addressLine1,
                address_line2: addressLine2,
                address_line3: addressLine3,
                address: fullAddress,

                // Contact
                office_head_contact: {
                    name: str(row["NAME_AS_SEVAARTH_ID"]),
                    phone: phone,
                    email: email,
                },

                is_active: true,
            };

            await Office.findOneAndUpdate(
                { office_id },
                { $set: officeData },
                { upsert: true, new: true }
            );

            sheetCount++;
            totalUpserted++;
        }

        console.log(`   ✔️  Upserted ${sheetCount} offices for Taluka "${taluka}"`);
    }

    console.log(`\n🌱  Done!`);
    console.log(`   ✅  Upserted : ${totalUpserted} offices`);
    console.log(`   ⚠️  Skipped  : ${totalSkipped} rows (empty/header rows)`);

    await mongoose.disconnect();
    console.log("🔌  Disconnected.");
}

seed().catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
});
