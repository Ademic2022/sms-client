/**
 * Marketing details for the platform homepage. Placeholders until the business decides:
 * the product name, price (an open question in the PRD) and contact details.
 */
export const SITE = {
  name: "Akademiq",
  tagline: "School management for Nigerian schools",
  pricePerStudentNaira: 1500,
  trialDays: 30,
  smsUnitNaira: 4,
  contactEmail: "hello@akademiq.ng",
  whatsapp: "2349121424608", // support WhatsApp, international format without "+"
};

/**
 * Details printed in the privacy notice, data processing agreement and terms. The company
 * name and address are placeholders until the business is registered: confirm them, and have
 * a Nigerian data protection lawyer review the documents in src/content/legal.ts, before launch.
 */
export const LEGAL = {
  company: "Akademiq Technologies Ltd",
  address: "Lagos, Nigeria",
  email: SITE.contactEmail,
  effective: "13 October 2026",
  // Must match CURRENT_DPA_VERSION in the server (apps/schools/services.py): it is recorded
  // against each school when its owner accepts the agreement at sign-up.
  dpaVersion: "2026-10",
};

/** What search engines and link previews show for the public site. */
export const SEO = {
  // Under about 60 characters, so search results do not cut it off.
  title: "School Management Software for Nigerian Schools",
  // Under about 160 characters.
  description:
    "Report cards that compute themselves, school fees parents pay online, and SMS to every parent. For Nigerian nursery, primary and secondary schools.",
  keywords: [
    "school management software Nigeria",
    "school management system",
    "report card software",
    "school fees payment",
    "result computation",
    "school portal Nigeria",
    "private school software",
    "Paystack school fees",
  ],
};
