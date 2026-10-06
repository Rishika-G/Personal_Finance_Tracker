import cron from "node-cron";
import Transaction from "../models/Transaction.js";
import { suggestCategory } from "../services/aiCategorizer.js";

// THE BACKGROUND AI PASS. This is what makes the "AI-driven" part of the
// tracker real, without ever putting an LLM call in the path of an instant
// alert. It runs on a schedule, looks only at transactions the fast-path
// rule table couldn't classify, and writes a SUGGESTION -- it never
// silently overwrites the user's category or budget totals.
export async function runEnrichmentPass() {
  const pending = await Transaction.find({ needsReview: true, suggestedCategory: null }).limit(50);

  if (pending.length === 0) {
    console.log("[enrichment] nothing to review");
    return;
  }

  console.log(`[enrichment] processing ${pending.length} transactions`);

  for (const txn of pending) {
    // A few of this user's already-confirmed categorizations, used as
    // few-shot context so the AI leans on this specific user's history.
    const fewShotExamples = await Transaction.find({
      userId: txn.userId,
      categorySource: { $in: ["manual", "llm"] },
    })
      .limit(5)
      .select("rawDescription category -_id");

    const suggestion = await suggestCategory(txn, fewShotExamples);
    if (suggestion) {
      txn.suggestedCategory = suggestion;
      await txn.save();
    }
  }

  console.log("[enrichment] pass complete");
}

// Runs every night at 2am. In a real deployment you'd likely run this as a
// separate worker process rather than inside the API server, but for a
// personal-scale project a cron job in-process is simple and sufficient.
export function scheduleEnrichmentJob() {
  cron.schedule("0 2 * * *", () => {
    runEnrichmentPass().catch((err) => console.error("[enrichment] pass failed:", err));
  });
  console.log("[enrichment] scheduled nightly at 02:00");
}
