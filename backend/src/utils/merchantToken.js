// Turns a messy raw string like "UPI-Swiggy-8827@okhdfcbank" or
// "POS 4521 RELIANCE FRESH MUMBAI" into a stable, lowercase key we can
// match rules against and store on the CategoryRule table.
export function extractMerchantToken(rawDescription) {
  const cleaned = rawDescription
    .toLowerCase()
    .replace(/upi[-\s]?/g, "")
    .replace(/pos\s?\d*/g, "")
    .replace(/@[a-z0-9.]+/g, "") // strip UPI handles like @okhdfcbank
    .replace(/[0-9]{3,}/g, "") // strip long reference numbers
    .replace(/[^a-z\s]/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  // Merchant name is usually the most distinctive word/phrase left.
  // Keep it simple: first 1-2 meaningful words, joined.
  return words.slice(0, 2).join("-") || "unknown";
}
