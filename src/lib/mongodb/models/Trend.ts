import mongoose, { Document, Model, Schema } from "mongoose";

export interface IScore {
  maturity: number;
  applicability: number;
  competitiveImpact: number;
  strategicAlignment: number;
  adoptionComplexity: number;
  total: number;
  scoredBy: "manual" | "llm";
  scoredAt: Date;
  notes?: string;
}

export interface ITrend extends Document {
  title: string;
  summary: string;
  url: string;
  source: string;
  topicSlug: string;
  collectedAt: Date;
  deletedAt?: Date;
  score?: IScore;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    maturity: { type: Number, required: true, min: 1, max: 5 },
    applicability: { type: Number, required: true, min: 1, max: 5 },
    competitiveImpact: { type: Number, required: true, min: 1, max: 5 },
    strategicAlignment: { type: Number, required: true, min: 1, max: 5 },
    adoptionComplexity: { type: Number, required: true, min: 1, max: 5 },
    total: { type: Number, required: true },
    scoredBy: { type: String, enum: ["manual", "llm"], required: true },
    scoredAt: { type: Date, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const TrendSchema = new Schema<ITrend>(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    topicSlug: { type: String, required: true },
    collectedAt: { type: Date, required: true, default: Date.now },
    deletedAt: { type: Date },
    score: { type: ScoreSchema },
  },
  { timestamps: true }
);

TrendSchema.index({ url: 1 }, { unique: true });
TrendSchema.index({ topicSlug: 1, collectedAt: -1 });
TrendSchema.index({ "score.total": -1 });
TrendSchema.index({ source: 1 });
TrendSchema.index({ collectedAt: -1 });

export const Trend: Model<ITrend> =
  mongoose.models.Trend ?? mongoose.model<ITrend>("Trend", TrendSchema);
