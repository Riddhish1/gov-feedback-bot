import mongoose, { Document, Model, Schema } from "mongoose";

// ── Step enum ─────────────────────────────────────────────────────────────────
// 0 → waiting for START_OFFICE
// 1 → waiting for flow selection (1=Office, 2=Policy, 3=Process)
// 2 → flow-specific step 1
// 3 → flow-specific step 2
// 4 → flow-specific step 3
// 5 → completed

export type SessionStep = 0 | 1 | 2 | 3 | 4 | 5;

// ── Flow type ─────────────────────────────────────────────────────────────────
export type FeedbackFlow = "office" | "policy" | "process" | null;

// ── TypeScript interface ──────────────────────────────────────────────────────

export interface IAnswers {
  // Office Experience Flow
  office_rating?: number | null;
  office_issue?: string | null;
  office_positive?: string | null;

  // Policy Suggestion Flow
  policy_name?: string | null;
  policy_improvement_type?: string | null;
  policy_beneficiary?: string | null;

  // Process Reform Flow
  process_name?: string | null;
  process_difficulty?: string | null;
  process_suggestion?: string | null;
}

export interface ISession extends Document {
  phone: string;
  office_id: string;
  office_name: string;
  current_step: SessionStep;
  flow_type: FeedbackFlow;
  answers: IAnswers;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Sub-schema for answers ────────────────────────────────────────────────────

const AnswersSchema = new Schema<IAnswers>(
  {
    // Office Experience Flow
    office_rating: { type: Number, default: null, min: 1, max: 5 },
    office_issue: { type: String, default: null, trim: true },
    office_positive: { type: String, default: null, trim: true },

    // Policy Suggestion Flow
    policy_name: { type: String, default: null, trim: true },
    policy_improvement_type: { type: String, default: null, trim: true },
    policy_beneficiary: { type: String, default: null, trim: true },

    // Process Reform Flow
    process_name: { type: String, default: null, trim: true },
    process_difficulty: { type: String, default: null, trim: true },
    process_suggestion: { type: String, default: null, trim: true },
  },
  { _id: false }
);

// ── Main Session schema ───────────────────────────────────────────────────────

const SessionSchema = new Schema<ISession>(
  {
    phone: {
      type: String,
      required: [true, "phone is required"],
      trim: true,
      index: true,
    },
    office_id: {
      type: String,
      required: [true, "office_id is required"],
      trim: true,
    },
    office_name: {
      type: String,
      required: [true, "office_name is required"],
      trim: true,
    },
    current_step: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    flow_type: {
      type: String,
      enum: ["office", "policy", "process", null],
      default: null,
    },
    answers: {
      type: AnswersSchema,
      default: () => ({}),
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    collection: "sessions",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound index: one active session per phone number
SessionSchema.index({ phone: 1, completed: 1 });

// ── Model (singleton-safe for Next.js hot reload) ─────────────────────────────

const Session: Model<ISession> =
  mongoose.models.Session ??
  mongoose.model<ISession>("Session", SessionSchema);

export default Session;
