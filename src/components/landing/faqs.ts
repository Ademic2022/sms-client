/**
 * Questions school owners ask first. Shown on the homepage and published to search engines
 * as FAQ structured data, so the two never disagree.
 */
export const FAQS: [question: string, answer: string][] = [
  ["Do we need internet in the staff room?", "Only some of the time. Score entry and attendance save on the teacher's phone when the network drops, and sync on their own when it comes back."],
  ["Can we keep our own report card layout?", "Choose from our report templates and switch on what you need: class position, cumulative results, behaviour and skills ratings, comments, signature and stamp. You can also hide class position entirely."],
  ["How do parents pay?", "By card, bank transfer or USSD through Paystack, for one child or several at once. Money settles directly into your school's bank account. The bursar can still record cash, POS and bank tellers by hand."],
  ["Will SMS reach parents on Do Not Disturb?", "Yes. School messages go through a registered transactional route. While your school's own sender name is being approved by the networks, messages go out under a shared name."],
  ["We run nursery, primary and secondary. One account?", "Yes. One school account holds every section, each with its own classes, subjects, grading scale and report card."],
  ["How do we move from what we use now?", "Fill in our Excel template, or export a list from your current system. Each row is checked, and nothing is imported until the whole file is correct, so there are no duplicates to clean up."],
  ["What happens to our data if we leave?", "Your data is yours. You can export every list to Excel at any time, from any screen."],
];
