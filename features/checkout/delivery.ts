// Delivery charges in taka: inside Tangail (where the shop is) or anywhere
// else in Bangladesh.
export const DELIVERY_CHARGES = {
  insideTangail: 70,
  outsideTangail: 120,
} as const;

export function getDeliveryCharge(district: string): number {
  return district.trim().toLowerCase() === "tangail"
    ? DELIVERY_CHARGES.insideTangail
    : DELIVERY_CHARGES.outsideTangail;
}
