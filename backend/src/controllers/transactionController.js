import Transaction from "../models/Transaction.js";
import { categorizeFast, promoteToRule } from "../services/categorizer.js";
import { checkBudget, recomputeAfterRecategorize } from "../services/budgetService.js";

// THE CRITICAL PATH: add a transaction -> categorize instantly -> save ->
// check budget -> return any alert, all in one synchronous request.
// No AI call happens here -- see src/jobs/enrichmentJob.js for that.
export async function createTransaction(req, res, next) {
  try {
    const { amount, rawDescription, type, date } = req.body;
    if (!amount || !rawDescription) {
      return res.status(400).json({ message: "amount and rawDescription are required" });
    }

    const { merchantToken, category, categorySource, needsReview } =
      await categorizeFast(req.userId, rawDescription);

    const transaction = await Transaction.create({
      userId: req.userId,
      amount,
      type: type || "expense",
      rawDescription,
      merchantToken,
      category,
      categorySource,
      needsReview,
      date: date || Date.now(),
    });

    const alerts = type === "income" ? [] : await checkBudget(req.userId, category, transaction.date);

    res.status(201).json({ transaction, alerts });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req, res, next) {
  try {
    const { month, category, needsReview } = req.query;
    const filter = { userId: req.userId };

    if (category) filter.category = category;
    if (needsReview === "true") filter.needsReview = true;
    if (month) {
      const [y, m] = month.split("-");
      const start = new Date(Number(y), Number(m) - 1, 1);
      const end = new Date(Number(y), Number(m), 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

// Handles BOTH cases described in the design doc:
// 1. A user manually recategorizing a transaction
// 2. A user confirming/correcting an AI suggestion from the review queue
// Either way: update the transaction, promote a rule so this merchant takes
// the fast path next time, and recompute both the old and new category's
// budget totals since spend has effectively moved between buckets.
export async function updateCategory(req, res, next) {
  try {
    const { category, confirmedFromSuggestion } = req.body;
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const oldCategory = transaction.category;

    transaction.category = category;
    transaction.categorySource = confirmedFromSuggestion ? "llm" : "manual";
    transaction.needsReview = false;
    transaction.suggestedCategory = null;
    await transaction.save();

    await promoteToRule(
      req.userId,
      transaction.merchantToken,
      category,
      confirmedFromSuggestion ? "llm-promoted" : "user"
    );

    const recheck = await recomputeAfterRecategorize(req.userId, oldCategory, category, transaction.date);

    res.json({ transaction, ...recheck });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}

// Feeds the "review these N transactions" queue on the dashboard --
// anything the AI enrichment job has suggested a category for, awaiting
// user confirmation.
export async function listReviewQueue(req, res, next) {
  try {
    const items = await Transaction.find({
      userId: req.userId,
      suggestedCategory: { $ne: null },
    }).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
}
