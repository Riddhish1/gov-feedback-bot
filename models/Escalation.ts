import mongoose, { Document, Model, Schema } from "mongoose";

export type EscalationLevel = 1 | 2 | 3 | 4;
export type EscalationStatus = "open" | "resolved" | "action_uploaded";

export interface IEscalation extends Document {
    office_id: string;
    office_name: string;
    district: string;
    division: string;
    department: string;
    level: EscalationLevel;          // 1=OfficeHead, 2=Collector, 3=Commissioner, 4=Guardian Secretary
    omes_at_trigger: number;         // OMES score that caused this escalation
    consecutive_months_below: number; // How many months consistently below threshold
    threshold_used: number;           // What the threshold was (e.g. 3.0)
    status: EscalationStatus;
    triggered_at: Date;
    resolved_at?: Date;
    corrective_action_note?: string;
    action_uploaded_by?: string;
    action_uploaded_at?: Date;
}

const EscalationSchema = new Schema<IEscalation>(
    {
        office_id: { type: String, required: true, index: true },
        office_name: { type: String, required: true },
        district: { type: String, required: true },
        division: { type: String, default: "" },
        department: { type: String, default: "" },
        level: { type: Number, required: true, enum: [1, 2, 3, 4] },
        omes_at_trigger: { type: Number, required: true },
        consecutive_months_below: { type: Number, default: 1 },
        threshold_used: { type: Number, default: 3.0 },
        status: {
            type: String,
            enum: ["open", "resolved", "action_uploaded"],
            default: "open",
        },
        triggered_at: { type: Date, default: Date.now },
        resolved_at: { type: Date, default: null },
        corrective_action_note: { type: String, default: null },
        action_uploaded_by: { type: String, default: null },
        action_uploaded_at: { type: Date, default: null },
    },
    {
        collection: "escalations",
        timestamps: true,
    }
);

const Escalation: Model<IEscalation> =
    mongoose.models.Escalation ??
    mongoose.model<IEscalation>("Escalation", EscalationSchema);

export default Escalation;
