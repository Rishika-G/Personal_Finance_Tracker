import { transactionApi } from "../api/api";

// The confirmation step for the AI's background suggestions -- step 6/7 in
// the flow: AI suggests, user confirms/corrects, and that confirmation gets
// promoted into a permanent rule so the same merchant is instant next time.
export default function ReviewQueue({ items, onResolved }) {
  if (!items || items.length === 0) return null;

  async function confirm(id, category) {
    await transactionApi.updateCategory(id, { category, confirmedFromSuggestion: true });
    onResolved();
  }

  return (
    <div className="review-queue">
      <h3>AI suggestions to review ({items.length})</h3>
      {items.map((t) => (
        <div key={t._id} className="review-item">
          <span className="review-desc">{t.rawDescription} — ₹{t.amount}</span>
          <span className="review-suggestion">We think this is <strong>{t.suggestedCategory}</strong></span>
          <div className="review-actions">
            <button onClick={() => confirm(t._id, t.suggestedCategory)}>Confirm</button>
            <button className="secondary" onClick={() => confirm(t._id, "Other")}>It's something else</button>
          </div>
        </div>
      ))}
    </div>
  );
}
