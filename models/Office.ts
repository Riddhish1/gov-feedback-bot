import mongoose, { Document, Model, Schema } from "mongoose";

// ── TypeScript interface ──────────────────────────────────────────────────────

export interface IOffice extends Document {
  office_id: string;
  office_name: string;
  district: string;
  state: string;
  division?: string;
  department?: string;
  office_type?: string;
  digipin?: string;
  treasury_code?: string;
  services?: string[];
  expected_visitors?: number;
  working_hours?: { from?: string; to?: string };
  address?: string;
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
    // Extended metadata fields
    division: { type: String, trim: true, index: true },
    department: { type: String, trim: true, index: true },
    office_type: { type: String, trim: true },
    digipin: { type: String, trim: true, index: true },
    treasury_code: { type: String, trim: true },
    services: { type: [String], default: [] },
    expected_visitors: { type: Number, default: null },
    working_hours: {
      from: { type: String, default: null },
      to: { type: String, default: null },
    },
    address: { type: String, default: null },
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

delete mongoose.models.Office;
const Office: Model<IOffice> = mongoose.model<IOffice>("Office", OfficeSchema);

export default Office;
