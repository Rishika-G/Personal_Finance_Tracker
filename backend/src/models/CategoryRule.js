import mongoose from "mongoose";

const categoryRuleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchantToken: { type: String, required: true },
    category: { type: String, required: true },
    source: { type: String, enum: ["system", "user", "llm-promoted"], default: "user" },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categoryRuleSchema.index({ userId: 1, merchantToken: 1 }, { unique: true });

export default mongoose.model("CategoryRule", categoryRuleSchema);
