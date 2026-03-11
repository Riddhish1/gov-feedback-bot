import mongoose, { Document, Model, Schema } from "mongoose";

// ── TypeScript interface ──────────────────────────────────────────────────────

export interface IOffice extends Document {
  office_id: string;
  office_name: string;
  district: string;
  state: string;

  // Geographic hierarchy
  region?: string;              // Administrative region (e.g. "Nashik") — from REGION column
  division?: string;            // Revenue division
  taluka?: string;

  // Government identifiers
  ddo_code?: string;            // DDO Code — from DDO CODE column
  treasury_code?: string;       // Treasury code — from TRY CODE column
  district_treasury?: string;   // District Treasury name — from DISTRICT TREASURY column
  sevaarth_id?: string;         // HRMS/Sevaarth system ID — from SEVAARTH_ID column

  // DDO details
  role?: string;                // Role of the DDO — from ROLE column
  ddo_designation?: string;     // Designation of DDO — from DDO DESIGNATION column

  // Office details
  department?: string;
  office_type?: string;
  digipin?: string;
  services?: string[];
  expected_visitors?: number;
  working_hours?: { from?: string; to?: string };

  // Address — stored as 3 lines to match Excel + a combined field
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  address?: string;             // Concatenated full address (auto-set or manually set)

  geo?: { lat?: number; lng?: number };
  office_head_contact?: { name?: string; phone?: string; email?: string };
  collector_contact?: { name?: string; phone?: string; email?: string };
  divisional_commissioner_contact?: { name?: string; phone?: string; email?: string };
  guardian_secretary?: string;
  tags?: string[];
  is_active?: boolean;
  metadata?: Record<string, any>;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const OfficeSchema = new Schema<IOffice>(
  {
    office_id: {
      type: String,
      required: [true, "office_id is required"],
      unique: true,
      trim: true,
      index: true,
    },
    office_name: {
      type: String,
      required: [true, "office_name is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "district is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "state is required"],
      trim: true,
    },
    // Extended geographic fields
    region: { type: String, trim: true, index: true },
    division: { type: String, trim: true, index: true },
    taluka: { type: String, trim: true, index: true },

    // Government identifiers
    ddo_code: { type: String, trim: true, index: true },
    treasury_code: { type: String, trim: true },
    district_treasury: { type: String, trim: true },
    sevaarth_id: { type: String, trim: true, index: true },

    // DDO details
    role: { type: String, trim: true },
    ddo_designation: { type: String, trim: true },

    // Office details
    department: { type: String, trim: true, index: true },
    office_type: { type: String, trim: true },
    digipin: { type: String, trim: true, index: true },
    services: { type: [String], default: [] },
    expected_visitors: { type: Number, default: null },
    working_hours: {
      from: { type: String, default: null },
      to: { type: String, default: null },
    },

    // Address — 3-line breakdown matching Excel + combined fallback
    address_line1: { type: String, default: null, trim: true },
    address_line2: { type: String, default: null, trim: true },
    address_line3: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },

    geo: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    office_head_contact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      email: { type: String, default: null },
    },
    collector_contact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      email: { type: String, default: null },
    },
    divisional_commissioner_contact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      email: { type: String, default: null },
    },
    guardian_secretary: { type: String, default: null },
    tags: { type: [String], default: [] },
    is_active: { type: Boolean, default: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    collection: "offices",
    timestamps: true,
  }
);

// ── Model (singleton-safe for Next.js hot reload) ─────────────────────────────

const Office: Model<IOffice> =
  mongoose.models.Office ?? mongoose.model<IOffice>("Office", OfficeSchema);

export default Office;
