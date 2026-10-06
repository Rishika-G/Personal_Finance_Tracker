import { useEffect, useState, useCallback } from "react";
import { budgetApi } from "../api/api";
import BudgetForm from "../components/BudgetForm";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);

  const load = useCallback(async () => {
    const res = await budgetApi.list({});
    setBudgets(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    await budgetApi.remove(id);
    load();
  }

  return (
    <div className="budgets-page">
      <h1>Budgets</h1>
      <BudgetForm onSaved={load} />
      <table className="budget-table">
        <thead>
          <tr><th>Month</th><th>Category</th><th>Limit</th><th></th></tr>
        </thead>
        <tbody>
          {budgets.map((b) => (
            <tr key={b._id}>
              <td>{b.month}</td>
              <td>{b.category}</td>
              <td>₹{b.limit}</td>
              <td><button className="link-btn" onClick={() => handleDelete(b._id)}>Delete</button></td>
            </tr>
          ))}
          {budgets.length === 0 && <tr><td colSpan="4" className="empty-row">No budgets set yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
