// Store details shown across the site. Placeholder values until the brand
// is decided (docs/PLAN.md, decision 6). Empty contact fields are hidden.
export const site = {
  name: "Tangail Saree",
  tagline: "টাঙ্গাইলের হ্যান্ডলুম শাড়ি",
  description:
    "তাঁতিদের কাছ থেকে সরাসরি সংগ্রহ করা হাতে বোনা টাঙ্গাইল শাড়ি, ক্যাশ অন ডেলিভারিতে সারা বাংলাদেশে পৌঁছে দেওয়া হয়।",
  // Mobile number shown to customers, e.g. "01712345678".
  phone: "",
  // WhatsApp number in international format without "+", e.g. "8801712345678".
  whatsapp: "",
  email: "",
  facebookUrl: "",
  instagramUrl: "",
  address: "টাঙ্গাইল, বাংলাদেশ",
  // Prefix for order numbers, e.g. "TS-000123".
  orderPrefix: "TS",
} as const;

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
