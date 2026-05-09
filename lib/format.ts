export function formatPrice(amount: number, type: "SALE" | "RENT") {
  if (type === "RENT") {
    return `₹${Math.round(amount).toLocaleString("en-IN")}/mo`;
  }
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(amount >= 10_00_000 ? 1 : 2)} L`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
