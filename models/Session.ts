import mongoose, { Document, Model, Schema } from "mongoose";

// 0 → waiting for START_OFFICE
// 1 → Language Select (Marathi / English)
// 2 → waiting for flow choice (Greeting Menu)
// 3-12 → Office Flow Steps
// 13-16 → Policy Flow Steps
// 17-21 → Process Reform Flow Steps
// 22 → Continue Menu (Multi-Flow)

export type SessionStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;

// ── TypeScript interface ──────────────────────────────────────────────────────

export interface IAnswers {
  flow_choice: number | null;
  completed_flows: number[];
  rating: number | null;
  feedback: string | null;
  scheme_suggestion: string | null;
  policy_suggestion: string | null;

  // Office Flow (10 Steps)
  cat1_q1_helpdesk?: string | null;
  cat1_q2_charter?: string | null;
  cat1_q3_map?: string | null;
  cat1_q4_seating?: number | null;
  cat1_q5_water?: string | null;
  cat1_q6_toilets?: number | null;
  cat1_q7_fulfilled?: string | null;
  cat1_q8_service?: string | null;
  cat1_q9_overall?: number | null;
  cat1_q10_comments?: string | null;

  // Category 2 Flow
  cat2_flow_type?: string | null;
  cat2_scheme_name?: string | null;
  cat2_improvement_needed?: string | null;
  cat2_policy_area?: string | null;
  cat2_beneficiary?: string | null;
  cat2_mandatory_feedback?: string | null;

  // Category 3 Flow
  cat3_change_type?: string | null;
  cat3_suggestion?: string | null;
  cat3_department?: string | null;

  // Legacy Office Fields
  office_rating?: number | null;
  office_issue?: string | null;
  office_positive?: string | null;
  policy_name?: string | null;
  policy_improvement_type?: string | null;
  policy_beneficiary?: string | null;
  process_name?: string | null;
  process_difficulty?: string | null;
  process_suggestion?: string | null;
}

export interface IAIAnalysis {
  sentiment: "Positive" | "Neutral" | "Negative" | null;
  confidence: number | null;
  themes: string[];
  translated_text: string | null;
  keywords: string[];
  reform_recommendation: string | null;
  direct_response_to_citizen?: string | null;
}

export interface ISession extends Document {
  phone: string;
  language: string | null;
  office_id: string;
  office_name: string;
  current_step: SessionStep;
  answers: IAnswers;
  ai_analysis?: IAIAnalysis;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Sub-schema for answers ────────────────────────────────────────────────────

const AnswersSchema = new Schema<IAnswers>(
  {
    flow_choice: { type: Number, default: null },
    completed_flows: { type: [Number], default: [] },
    rating: { type: Number, default: null, min: 1, max: 5 },
    feedback: { type: String, default: null, trim: true },
    scheme_suggestion: { type: String, default: null, trim: true },
    policy_suggestion: { type: String, default: null, trim: true },

    cat1_q1_helpdesk: { type: String, default: null },
    cat1_q2_charter: { type: String, default: null },
    cat1_q3_map: { type: String, default: null },
    cat1_q4_seating: { type: Number, default: null, min: 1, max: 5 },
    cat1_q5_water: { type: String, default: null },
    cat1_q6_toilets: { type: Number, default: null, min: 1, max: 5 },
    cat1_q7_fulfilled: { type: String, default: null },
    cat1_q8_service: { type: String, default: null },
    cat1_q9_overall: { type: Number, default: null, min: 1, max: 5 },
    cat1_q10_comments: { type: String, default: null },

    cat2_flow_type: { type: String, default: null },
    cat2_scheme_name: { type: String, default: null },
    cat2_improvement_needed: { type: String, default: null },
    cat2_policy_area: { type: String, default: null },
    cat2_beneficiary: { type: String, default: null },
    cat2_mandatory_feedback: { type: String, default: null },

    cat3_change_type: { type: String, default: null },
    cat3_suggestion: { type: String, default: null },
    cat3_department: { type: String, default: null },

    office_rating: { type: Number, default: null, min: 1, max: 5 },
    office_issue: { type: String, default: null, trim: true },
    office_positive: { type: String, default: null, trim: true },
    policy_name: { type: String, default: null, trim: true },
    policy_improvement_type: { type: String, default: null, trim: true },
    policy_beneficiary: { type: String, default: null, trim: true },
    process_name: { type: String, default: null, trim: true },
    process_difficulty: { type: String, default: null, trim: true },
    process_suggestion: { type: String, default: null, trim: true },
  },
  { _id: false } // no separate _id for the embedded document
);

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    sentiment: { type: String, enum: ["Positive", "Neutral", "Negative"], default: null },
    confidence: { type: Number, default: null },
    themes: { type: [String], default: [] },
    translated_text: { type: String, default: null },
    keywords: { type: [String], default: [] },
    reform_recommendation: { type: String, default: null },
    direct_response_to_citizen: { type: String, default: null },
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
    language: {
      type: String,
      enum: ["mr", "en", null],
      default: null,
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
      max: 22,
    },
    answers: {
      type: AnswersSchema,
      default: () => ({
        flow_choice: null,
        completed_flows: [],
        rating: null,
        feedback: null,
        scheme_suggestion: null,
        policy_suggestion: null,
        office_rating: null,
        office_issue: null,
        office_positive: null,
        cat1_q1_helpdesk: null,
        cat1_q2_charter: null,
        cat1_q3_map: null,
        cat1_q4_seating: null,
        cat1_q5_water: null,
        cat1_q6_toilets: null,
        cat1_q7_fulfilled: null,
        cat1_q8_service: null,
        cat1_q9_overall: null,
        cat1_q10_comments: null,
        cat2_flow_type: null,
        cat2_scheme_name: null,
        cat2_improvement_needed: null,
        cat2_policy_area: null,
        cat2_beneficiary: null,
        cat2_mandatory_feedback: null,
        cat3_change_type: null,
        cat3_suggestion: null,
        cat3_department: null,
        policy_name: null,
        policy_improvement_type: null,
        policy_beneficiary: null,
        process_name: null,
        process_difficulty: null,
        process_suggestion: null,
      }),
    },
    ai_analysis: {
      type: AIAnalysisSchema,
      default: () => ({
        sentiment: null,
        confidence: null,
        themes: [],
        translated_text: null,
        keywords: [],
        reform_recommendation: null,
        direct_response_to_citizen: null,
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
delete mongoose.models.Session;
const Session: Model<ISession> =
  mongoose.model<ISession>("Session", SessionSchema);

export default Session;
