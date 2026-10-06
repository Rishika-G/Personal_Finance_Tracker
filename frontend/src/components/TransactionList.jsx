import { useState } from "react";
import { transactionApi } from "../api/api";

const CATEGORIES = [
  "Food", "Transport", "Rent", "Utilities", "Shopping",
  "Entertainment", "Health", "Groceries", "Travel", "Other", "Uncategorized",
];

// Badge showing HOW a category was decided -- makes the hybrid pipeline
// visible in the UI instead of hidden: rule (instant), manual (user typed
// it), llm (AI suggested, user confirmed).
function SourceBadge({ source }) {
  const labels = { rule: "⚡ instant", manual: "✍️ manual", llm: "🤖 AI-confirmed" };
  return <span className={`source-badge source-${source}`}>{labels[source] || source}</span>;
}

export default function TransactionList({ transactions, onChanged }) {
  const [editingId, setEditingId] = useState(null);

  async function handleCategoryChange(id, category) {
    await transactionApi.updateCategory(id, { category });
    setEditingId(null);
    onChanged();
  }

  async function handleDelete(id) {
    await transactionApi.remove(id);
    onChanged();
  }

  return (
    <table className="txn-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t._id} className={t.needsReview ? "row-needs-review" : ""}>
            <td>{new Date(t.date).toLocaleDateString()}</td>
            <td>{t.rawDescription}</td>
            <td>
              {editingId === t._id ? (
                <select
                  autoFocus
                  defaultValue={t.category}
                  onBlur={() => setEditingId(null)}
                  onChange={(e) => handleCategoryChange(t._id, e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <span onClick={() => setEditingId(t._id)} className="category-cell">
                  {t.category} <SourceBadge source={t.categorySource} />
                </span>
              )}
            </td>
            <td className={t.type === "income" ? "amount-income" : "amount-expense"}>
              {t.type === "income" ? "+" : "-"}₹{t.amount}
            </td>
            <td>
              <button className="link-btn" onClick={() => handleDelete(t._id)}>Delete</button>
            </td>
          </tr>
        ))}
        {transactions.length === 0 && (
          <tr><td colSpan="5" className="empty-row">No transactions yet.</td></tr>
        )}
      </tbody>
    </table>
  );
}
