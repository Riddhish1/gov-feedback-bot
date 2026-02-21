import mongoose, { Document, Model, Schema } from "mongoose";

// ── TypeScript interface ──────────────────────────────────────────────────────

export interface IOffice extends Document {
  office_id: string;
  office_name: string;
  district: string;
  state: string;
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
