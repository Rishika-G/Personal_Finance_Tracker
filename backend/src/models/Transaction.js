import mongoose from "mongoose";

// categorySource tells us how the category was decided:
// "rule"   -> matched instantly against the user's rule table (fast path)
// "manual" -> the user typed/picked it directly
// "llm"    -> confirmed after the AI enrichment job suggested it
const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    rawDescription: { type: String, required: true, trim: true },
    merchantToken: { type: String, index: true },
    category: { type: String, default: "Uncategorized" },
    categorySource: { type: String, enum: ["rule", "manual", "llm"], default: "rule" },
    suggestedCategory: { type: String, default: null },
    needsReview: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, category: 1, date: 1 });

export default mongoose.model("Transaction", transactionSchema);
