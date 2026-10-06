import Budget from "../models/Budget.js";

export async function upsertBudget(req, res, next) {
  try {
    const { category, month, limit } = req.body;
    if (!category || !month || limit == null) {
      return res.status(400).json({ message: "category, month and limit are required" });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category, month },
      { $set: { limit } },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (err) {
    next(err);
  }
}

export async function listBudgets(req, res, next) {
  try {
    const { month } = req.query;
    const filter = { userId: req.userId };
    if (month) filter.month = month;
    const budgets = await Budget.find(filter);
    res.json(budgets);
  } catch (err) {
    next(err);
  }
}

export async function deleteBudget(req, res, next) {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}
