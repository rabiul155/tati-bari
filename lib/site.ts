// Store details shown across the site. Placeholder values until the brand
// is decided (docs/PLAN.md, decision 6). Empty contact fields are hidden.
export const site = {
  name: "Tangail Saree",
  tagline: "Handloom sarees from Tangail",
  description:
    "Handwoven Tangail sarees, sourced directly from weavers and delivered across Bangladesh with cash on delivery.",
  // Mobile number shown to customers, e.g. "01712345678".
  phone: "",
  // WhatsApp number in international format without "+", e.g. "8801712345678".
  whatsapp: "",
  email: "",
  facebookUrl: "",
  instagramUrl: "",
  address: "Tangail, Bangladesh",
  // Prefix for order numbers, e.g. "TS-000123".
  orderPrefix: "TS",
} as const;

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
