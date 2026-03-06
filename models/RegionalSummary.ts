import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRegionalSummary extends Document {
    region_type: "state" | "division" | "district" | "taluka";
    region_name: string;
    summary_text: string;
    metrics: {
        total_offices: number;
        avg_omes: number;
        open_escalations: number;
    };
    top_themes: string[];
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

const RegionalSummarySchema = new Schema<IRegionalSummary>(
    {
        region_type: {
            type: String,
            enum: ["state", "division", "district", "taluka"],
            required: true,
            index: true,
        },
        region_name: {
            type: String,
            required: true,
            index: true,
        },
        summary_text: {
            type: String,
            required: true,
        },
        metrics: {
            total_offices: { type: Number, default: 0 },
            avg_omes: { type: Number, default: 0 },
            open_escalations: { type: Number, default: 0 },
        },
        top_themes: {
            type: [String],
            default: [],
        },
        expires_at: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, // Automatically deletes the document when expires_at is reached
        },
    },
    {
        collection: "regional_summaries",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// Compound index to quickly find the valid cache for a region
RegionalSummarySchema.index({ region_type: 1, region_name: 1 });

const RegionalSummary: Model<IRegionalSummary> =
    mongoose.models.RegionalSummary ??
    mongoose.model<IRegionalSummary>("RegionalSummary", RegionalSummarySchema);

export default RegionalSummary;
