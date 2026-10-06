// The SLOW PATH. Only ever called from the background enrichment job
// (src/jobs/enrichmentJob.js), never from the live request path -- that's
// the whole point: it's allowed to be slow/flaky without breaking alerts.
//
// This file is written as a pluggable adapter. Swap `callLLM` for a real
// call to the Anthropic API (or any LLM) when you have an API key. Until
// then it falls back to a keyword-based heuristic so the pipeline runs
// end-to-end out of the box.

const DEFAULT_CATEGORIES = [
  "Food", "Transport", "Rent", "Utilities", "Shopping",
  "Entertainment", "Health", "Groceries", "Travel", "Other",
];

const HEURISTIC_HINTS = {
  food: "Food", swiggy: "Food", zomato: "Food", restaurant: "Food", cafe: "Food",
  uber: "Transport", ola: "Transport", metro: "Transport", fuel: "Transport", petrol: "Transport",
  rent: "Rent", landlord: "Rent",
  electricity: "Utilities", water: "Utilities", broadband: "Utilities", recharge: "Utilities",
  amazon: "Shopping", flipkart: "Shopping", myntra: "Shopping",
  netflix: "Entertainment", spotify: "Entertainment", movie: "Entertainment", bookmyshow: "Entertainment",
  pharmacy: "Health", hospital: "Health", clinic: "Health", medplus: "Health",
  grocery: "Groceries", bigbasket: "Groceries", dmart: "Groceries",
  flight: "Travel", irctc: "Travel", makemytrip: "Travel", hotel: "Travel",
};

async function callLLM({ description, amount, candidateCategories, fewShotExamples }) {
  // ---- Real implementation would look roughly like this: ----
  // const res = await fetch("https://api.anthropic.com/v1/messages", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "x-api-key": process.env.AI_API_KEY },
  //   body: JSON.stringify({
  //     model: "claude-sonnet-4-6",
  //     max_tokens: 50,
  //     messages: [{
  //       role: "user",
  //       content: `Categorize this transaction into exactly one of: ${candidateCategories.join(", ")}.
  //         Past examples for this user: ${JSON.stringify(fewShotExamples)}
  //         Transaction: "${description}", amount: ${amount}
  //         Reply with ONLY the category name.`
  //     }],
  //   }),
  // });
  // const data = await res.json();
  // return data.content[0].text.trim();

  // ---- Fallback heuristic (no API key required) ----
  const lower = description.toLowerCase();
  for (const [keyword, category] of Object.entries(HEURISTIC_HINTS)) {
    if (lower.includes(keyword)) return category;
  }
  return "Other";
}

// suggestCategory: takes a batch-friendly single transaction and returns a
// best-guess category. Never throws into the caller's face -- enrichment
// is best-effort, a failure here should just leave the transaction as-is
// for the next scheduled run.
export async function suggestCategory(transaction, fewShotExamples = []) {
  try {
    const category = await callLLM({
      description: transaction.rawDescription,
      amount: transaction.amount,
      candidateCategories: DEFAULT_CATEGORIES,
      fewShotExamples,
    });
    return DEFAULT_CATEGORIES.includes(category) ? category : "Other";
  } catch (err) {
    console.error("[aiCategorizer] suggestion failed:", err.message);
    return null;
  }
}

export { DEFAULT_CATEGORIES };
