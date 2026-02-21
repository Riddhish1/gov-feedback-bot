import mongoose, { Document, Model, Schema } from "mongoose";

// ── Step enum ─────────────────────────────────────────────────────────────────
// 0 → waiting for START_OFFICE
// 1 → waiting for rating (1-5)
// 2 → waiting for feedback text
// 3 → waiting for scheme suggestion
// 4 → waiting for policy suggestion
// 5 → completed

export type SessionStep = 0 | 1 | 2 | 3 | 4 | 5;

// ── TypeScript interface ──────────────────────────────────────────────────────

export interface IAnswers {
  rating: number | null;
  feedback: string | null;
  scheme_suggestion: string | null;
  policy_suggestion: string | null;
}

export interface ISession extends Document {
  phone: string;
  office_id: string;
  office_name: string;
  current_step: SessionStep;
  answers: IAnswers;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Sub-schema for answers ────────────────────────────────────────────────────

const AnswersSchema = new Schema<IAnswers>(
  {
    rating: { type: Number, default: null, min: 1, max: 5 },
    feedback: { type: String, default: null, trim: true },
    scheme_suggestion: { type: String, default: null, trim: true },
    policy_suggestion: { type: String, default: null, trim: true },
  },
  { _id: false } // no separate _id for the embedded document
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
    answers: {
      type: AnswersSchema,
      default: () => ({
        rating: null,
        feedback: null,
        scheme_suggestion: null,
        policy_suggestion: null,
      }),
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
