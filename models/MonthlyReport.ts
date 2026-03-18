import mongoose, { Document, Model, Schema } from "mongoose";

// ── Report Types ──────────────────────────────────────────────────────────────
// 1 = 5★ last month          | avg_rating >= 4.5 in target month
// 2 = 5★ for 2 months        | Consecutive streak of 2 months
// 3 = 5★ for 3 months        | Consecutive streak of 3 months
// 4 = <3★ for 3–6 months     | avg_rating < 3 sustained
// 5 = 3★→<3★ declining       | Was >= 3, now < 3 sustained
// 6 = Master report          | All offices with full metrics

export type ReportType = 1 | 2 | 3 | 4 | 5 | 6;

export interface IReportEntry {
  office_id: string;
  office_name: string;
  district: string;
  region: string;
  taluka: string;
  department: string;
  avg_rating: number;
  submission_count: number;
  service_breakdown: Record<string, number>; // service name → avg rating
  consecutive_months: number;                // streak length
  trend: "improving" | "stable" | "declining";
}

export interface IMonthlyReport extends Document {
  report_month: string;   // "2026-03" (YYYY-MM)
  report_type: ReportType;
  generated_at: Date;
  entries: IReportEntry[];
  summary: {
    total_offices: number;
    avg_rating: number;
  };
}

// ── Sub-schema ────────────────────────────────────────────────────────────────

const ReportEntrySchema = new Schema<IReportEntry>(
  {
    office_id:          { type: String, required: true },
    office_name:        { type: String, required: true },
    district:           { type: String, default: "" },
    region:             { type: String, default: "" },
    taluka:             { type: String, default: "" },
    department:         { type: String, default: "" },
    avg_rating:         { type: Number, required: true },
    submission_count:   { type: Number, default: 0 },
    service_breakdown:  { type: Schema.Types.Mixed, default: {} },
    consecutive_months: { type: Number, default: 1 },
    trend:              { type: String, enum: ["improving", "stable", "declining"], default: "stable" },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const MonthlyReportSchema = new Schema<IMonthlyReport>(
  {
    report_month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    report_type: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6],
      index: true,
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
    entries: {
      type: [ReportEntrySchema],
      default: [],
    },
    summary: {
      total_offices: { type: Number, default: 0 },
      avg_rating:    { type: Number, default: 0 },
    },
  },
  {
    collection: "monthly_reports",
    timestamps: true,
  }
);

// One report per month per type
MonthlyReportSchema.index({ report_month: 1, report_type: 1 }, { unique: true });

// ── Model (singleton-safe for Next.js hot reload) ─────────────────────────────

delete mongoose.models.MonthlyReport;
const MonthlyReport: Model<IMonthlyReport> =
  mongoose.model<IMonthlyReport>("MonthlyReport", MonthlyReportSchema);

export default MonthlyReport;
