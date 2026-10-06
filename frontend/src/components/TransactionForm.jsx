import { useState } from "react";
import { transactionApi } from "../api/api";

// Adds a transaction. The response comes back with the transaction ALREADY
// categorized (fast-path rule match) and any budget alert already computed
// -- there's no loading spinner for "waiting on AI" because the AI never
// sits in this path.
export default function TransactionForm({ onCreated }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await transactionApi.create({
        amount: Number(amount),
        rawDescription: description,
        type,
      });
      onCreated(res.data);
      setAmount("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="txn-form" onSubmit={handleSubmit}>
      <h3>Add transaction</h3>
      <div className="form-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0.01"
          step="0.01"
        />
        <input
          type="text"
          placeholder="e.g. UPI-Swiggy-8827@okhdfcbank"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
