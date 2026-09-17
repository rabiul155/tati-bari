// Bangladesh mobile numbers: 11 digits starting with 01 and an operator
// digit 3–9, e.g. 01712345678.
const BD_MOBILE = /^01[3-9]\d{8}$/;

// Accepts common ways of writing a number ("+880 1712-345678",
// "8801712345678", "01712 345678") and returns "01712345678", or null.
export function normalizeBdPhone(input: string): string | null {
  // Bangla digits (০-৯) are common on phone keyboards.
  const ascii = input.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
  let digits = ascii.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("880")) digits = digits.slice(2);
  return BD_MOBILE.test(digits) ? digits : null;
}
