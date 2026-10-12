/** Money is handled in whole kobo everywhere; these helpers only format and parse for display. */

const formatter = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2, minimumFractionDigits: 0 });

export function naira(kobo: number | null | undefined): string {
  if (kobo === null || kobo === undefined) return "–";
  return formatter.format(kobo / 100);
}

/** Parse a naira amount typed by a user ("150,000" or "1500.50") into kobo. Returns null if invalid. */
export function toKobo(input: string): number | null {
  const cleaned = input.replace(/[₦,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

export function ordinal(n: number | null | undefined): string {
  if (!n) return "";
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

export function todayIso(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** "+2348031234567" -> "0803 123 4567", the way Nigerians write phone numbers. */
export function localPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const m = phone.match(/^\+234(\d{3})(\d{3})(\d{4})$/);
  return m ? `0${m[1]}\u00a0${m[2]}\u00a0${m[3]}` : phone; // non-breaking spaces keep it on one line
}
