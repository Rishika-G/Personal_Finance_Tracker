// Shows the instant overspend alert(s) returned right in the response of
// POST /transactions. This is the synchronous, no-AI-in-the-path alert
// described in the design.
export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-banner">
      {alerts.map((a, i) => (
        <div key={i} className="alert-item">
          ⚠️ You're over budget on <strong>{a.category}</strong>: spent ₹{a.spent} of a ₹{a.limit} limit
          (₹{a.overBy} over).
        </div>
      ))}
    </div>
  );
}
