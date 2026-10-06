import Transaction from "../models/Transaction.js";

// Powers the dashboard charts: spend by category (pie) and monthly trend (bar/line).
export async function spendByCategory(req, res, next) {
  try {
    const { month } = req.query;
    const filter = { userId: req.userId, type: "expense" };

    if (month) {
      const [y, m] = month.split("-");
      filter.date = { $gte: new Date(Number(y), Number(m) - 1, 1), $lt: new Date(Number(y), Number(m), 1) };
    }

    const results = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json(results.map((r) => ({ category: r._id, total: r.total })));
  } catch (err) {
    next(err);
  }
}

export async function monthlyTrend(req, res, next) {
  try {
    const results = await Transaction.aggregate([
      { $match: { userId: req.userId, type: "expense" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(results.map((r) => ({ month: r._id, total: r.total })));
  } catch (err) {
    next(err);
  }
}
