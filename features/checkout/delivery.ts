// Delivery charges in taka. Placeholder amounts until the owner confirms
// them (docs/PLAN.md, decision 3).
export const DELIVERY_CHARGES = {
  insideDhaka: 70,
  outsideDhaka: 130,
} as const;

export function getDeliveryCharge(district: string): number {
  return district.trim().toLowerCase() === "dhaka"
    ? DELIVERY_CHARGES.insideDhaka
    : DELIVERY_CHARGES.outsideDhaka;
}
