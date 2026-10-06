import { useState } from "react";
import { budgetApi } from "../api/api";

const CATEGORIES = [
  "Total", "Food", "Transport", "Rent", "Utilities", "Shopping",
  "Entertainment", "Health", "Groceries", "Travel", "Other",
];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetForm({ onSaved }) {
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState(currentMonth());

  async function handleSubmit(e) {
    e.preventDefault();
    await budgetApi.upsert({ category, month, limit: Number(limit) });
    setLimit("");
    onSaved();
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <h3>Set a budget</h3>
      <div className="form-row">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <input
          type="number"
          placeholder="Limit (₹)"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
          min="1"
        />
        <button type="submit">Save</button>
      </div>
      <p className="hint">Tip: set a "Total" budget too — it catches overspend even before something's categorized.</p>
    </form>
  );
}
