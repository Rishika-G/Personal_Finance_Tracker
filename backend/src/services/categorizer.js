import CategoryRule from "../models/CategoryRule.js";
import { extractMerchantToken } from "../utils/merchantToken.js";

// The FAST PATH. Runs synchronously on every transaction write.
// No network call, no AI -- just a lookup against this user's rule table.
// This is what keeps "instant alerts" actually instant.
export async function categorizeFast(userId, rawDescription) {
  const merchantToken = extractMerchantToken(rawDescription);

  const rule = await CategoryRule.findOne({ userId, merchantToken });

  if (rule) {
    rule.hitCount += 1;
    await rule.save();
    return { merchantToken, category: rule.category, categorySource: "rule", needsReview: false };
  }

  // No rule yet -> goes out as Uncategorized, flagged for the AI enrichment
  // job to look at later. It still counts toward the "Total" budget so an
  // unclassified expense can never silently dodge an overspend alert.
  return { merchantToken, category: "Uncategorized", categorySource: "rule", needsReview: true };
}

// Called when a user confirms or corrects a category (either typing one in
// manually, or approving an AI suggestion). This is the "learning" step --
// it writes/updates a rule so the SAME merchant takes the fast path next time.
export async function promoteToRule(userId, merchantToken, category, source = "user") {
  await CategoryRule.findOneAndUpdate(
    { userId, merchantToken },
    { $set: { category, source }, $inc: { hitCount: 1 } },
    { upsert: true, new: true }
  );
}
