import mongoose, { Document, Model, Schema } from "mongoose";

export const TOPIC_COLOR_PALETTE = [
  "blue",
  "emerald",
  "violet",
  "amber",
  "rose",
  "cyan",
  "orange",
  "teal",
  "pink",
  "indigo",
] as const;

export type TopicColor = (typeof TOPIC_COLOR_PALETTE)[number];

export interface ITopic extends Document {
  name: string;
  slug: string;
  description: string;
  color: TopicColor;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, immutable: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    color: { type: String, enum: TOPIC_COLOR_PALETTE, default: "blue" },
  },
  { timestamps: true }
);

TopicSchema.index({ slug: 1 }, { unique: true });

export const Topic: Model<ITopic> =
  mongoose.models.Topic ?? mongoose.model<ITopic>("Topic", TopicSchema);
