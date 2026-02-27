import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEscalationNotification extends Document {
    escalation_id: string;
    office_id: string;
    office_name: string;
    level: number;
    recipient_label: string;       // e.g. "District Collector"
    recipient_number: string;      // e.g. "+919876543210"
    channel: "whatsapp" | "sms" | "email";
    message_body: string;
    twilio_sid: string | null;
    status: "sent" | "failed" | "pending";
    error_message?: string;
    sent_at: Date;
}

const EscalationNotificationSchema = new Schema<IEscalationNotification>(
    {
        escalation_id: { type: String, required: true, index: true },
        office_id: { type: String, required: true, index: true },
        office_name: { type: String, required: true },
        level: { type: Number, required: true },
        recipient_label: { type: String, required: true },
        recipient_number: { type: String, required: true },
        channel: { type: String, enum: ["whatsapp", "sms", "email"], default: "whatsapp" },
        message_body: { type: String, required: true },
        twilio_sid: { type: String, default: null },
        status: { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
        error_message: { type: String, default: null },
        sent_at: { type: Date, default: Date.now },
    },
    {
        collection: "escalation_notifications",
        timestamps: true,
    }
);

const EscalationNotification: Model<IEscalationNotification> =
    mongoose.models.EscalationNotification ??
    mongoose.model<IEscalationNotification>(
        "EscalationNotification",
        EscalationNotificationSchema
    );

export default EscalationNotification;
