import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

function monthKeyOf(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Sums this user's spend in a category for a given month, then compares it
// against the budget limit. Runs synchronously right after a transaction is
// saved -- this IS the "instant alert" step.
export async function checkBudget(userId, category, date) {
  const month = monthKeyOf(date);

  const [categoryTotal, budget] = await Promise.all([
    sumSpend(userId, category, month),
    Budget.findOne({ userId, category, month }),
  ]);

  const alerts = [];
  if (budget && categoryTotal > budget.limit) {
    alerts.push({
      category,
      spent: categoryTotal,
      limit: budget.limit,
      overBy: +(categoryTotal - budget.limit).toFixed(2),
    });
  }

  // Safety net: also check the overall "Total" budget so unclassified
  // spend can never silently dodge an alert while it waits for enrichment.
  const totalBudget = await Budget.findOne({ userId, category: "Total", month });
  if (totalBudget) {
    const totalSpend = await sumSpend(userId, null, month);
    if (totalSpend > totalBudget.limit) {
      alerts.push({
        category: "Total",
        spent: totalSpend,
        limit: totalBudget.limit,
        overBy: +(totalSpend - totalBudget.limit).toFixed(2),
      });
    }
  }

  return alerts;
}

async function sumSpend(userId, category, month) {
  const [yearStr, monthStr] = month.split("-");
  const start = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const end = new Date(Number(yearStr), Number(monthStr), 1);

  const match = { userId, type: "expense", date: { $gte: start, $lt: end } };
  if (category) match.category = category;

  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result[0]?.total || 0;
}

// Called when a transaction's category changes after the fact (an AI
// suggestion gets confirmed, or a user manually recategorizes something
// that already counted toward a different category's total). Both the old
// and new category need their budgets re-checked.
export async function recomputeAfterRecategorize(userId, oldCategory, newCategory, date) {
  const [oldAlerts, newAlerts] = await Promise.all([
    checkBudget(userId, oldCategory, date),
    checkBudget(userId, newCategory, date),
  ]);
  // Flagged as retroactive so the frontend can show a softer "heads up"
  // toast instead of a live-overspend alert.
  return { retroactive: true, oldAlerts, newAlerts };
}

export { monthKeyOf };
