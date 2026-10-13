/**
 * The platform's legal documents: privacy notice, data processing agreement and terms of
 * service. Written in plain English to match how the product actually works (prices, billing,
 * security measures and the services we rely on).
 *
 * Draft: have a Nigerian data protection lawyer review these before the first school relies
 * on them, and keep them in step with the product when billing, hosting or providers change.
 */
import { LEGAL, SITE } from "@/lib/site";

export type Block = string | { list: string[] } | { table: { head: string[]; rows: string[][] } };
export type Section = { id: string; heading: string; blocks: Block[] };
export type LegalDoc = {
  slug: "privacy" | "dpa" | "terms";
  title: string;
  description: string;
  version?: string;
  summary: string[];
  sections: Section[];
};

const PRICE = `₦${SITE.pricePerStudentNaira.toLocaleString("en-NG")}`;

/** The services that process personal data for us. Keep in step with the deployment. */
export const SUBPROCESSORS = {
  head: ["Provider", "What they do", "Where"],
  rows: [
    ["Oracle Cloud Infrastructure", "Hosts the application, database and backups", "United Kingdom (London)"],
    ["Vercel Inc.", "Serves the web app to browsers", "Global network; company based in the United States"],
    ["Paystack Payments Ltd", "Processes card, bank transfer and USSD payments", "Nigeria"],
    ["Termii", "Delivers SMS messages to parents and staff", "Nigeria"],
    ["Functional Software, Inc. (Sentry), when enabled", "Records application errors, with user IDs only, never names or phone numbers", "United States"],
    ["S3-compatible file storage, when enabled", "Stores logos, photos, report cards and nightly backups", "Named here, with its location, before it is used"],
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacy notice",
  description: `How ${SITE.name} collects, uses and protects personal data, under the Nigeria Data Protection Act 2023.`,
  summary: [
    `Schools own their records. For students, parents and staff, the school decides how data is used and ${SITE.name} only processes it on the school's instructions.`,
    "We collect what we need to run a school's account and bill for it, and nothing for advertising. We do not sell personal data.",
    "Each school's data is kept separate from every other school's, at the application and the database level.",
    "You can ask to see, correct or delete your data, and complain to the Nigeria Data Protection Commission.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are and what this notice covers",
      blocks: [
        `${SITE.name} is run by ${LEGAL.company} ("we", "us"), ${LEGAL.address}. We provide school management software to private nursery, primary and secondary schools in Nigeria.`,
        "We handle personal data in two different roles:",
        {
          list: [
            `As a data processor, for the records a school keeps in ${SITE.name}: its students, their parents and guardians, and its staff. The school is the data controller. It decides what is collected and why, and its own privacy notice (found at /privacy on the school's web address) explains this to parents. We process those records only on the school's instructions, under our data processing agreement.`,
            "As a data controller, for our own purposes: people who visit our website, people who sign up a school, school owners and administrators as our customers, and the running and billing of the platform.",
          ],
        },
        "This notice covers our role as a controller, and explains how we look after school records on schools' behalf.",
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      blocks: [
        {
          table: {
            head: ["Data", "Examples", "Where it comes from"],
            rows: [
              ["School details", "School name, address, phone, email, web address, logo", "The person who signs the school up, and its administrators"],
              ["Account details", "Name, phone number, email, role, and a password that we store only in scrambled (hashed) form", "You, or the school that adds you"],
              ["Usage and security records", "Sign-in times, IP address, browser, and an audit log of who viewed, changed or exported records", "Created when the service is used"],
              ["Billing records", "Invoices, payment references and amounts. Card details go to Paystack and we never see the full card number.", "The school, and Paystack"],
              ["Support", "Emails you send us, and the time-limited access a school grants us to help it", "You"],
            ],
          },
        },
        "Our website does not use advertising or tracking cookies. The app uses only the cookies it needs to work: one that keeps you signed in, and one that protects forms against forgery.",
      ],
    },
    {
      id: "why",
      heading: "Why we use it, and on what lawful basis",
      blocks: [
        {
          list: [
            "To provide the service a school has signed up for: contract.",
            "To bill for it, keep accounts and meet tax and company law: legal obligation.",
            "To keep the service secure, prevent fraud and misuse, and fix faults: our legitimate interests, which we balance against your rights.",
            "To tell school owners about changes to the service, prices or these documents: contract, and legitimate interests.",
            "Marketing emails, only if you have agreed to them: consent, which you can withdraw at any time.",
          ],
        },
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: [
        `Most records in ${SITE.name} are about children. Schools enter and control those records. The Nigeria Data Protection Act requires a parent's or guardian's consent to process a child's data, so ${SITE.name} asks each parent for consent, per child, the first time they sign in, and lets schools record consent given on paper. Parents can withdraw consent from the parent portal at any time.`,
        "We do not use children's data for our own purposes, and never for advertising or profiling.",
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      blocks: [
        "We use the following providers to run the service. Each processes data only to provide its service to us, under a contract that requires it to keep the data secure and confidential.",
        { table: SUBPROCESSORS },
        "We also share data where the law requires it, for example with a court or regulator, and only as much as is required. We do not sell personal data, and we do not share it for advertising.",
      ],
    },
    {
      id: "transfers",
      heading: "Data stored outside Nigeria",
      blocks: [
        "Our servers and database are in the United Kingdom, and our web app is served from a global network. Transfers outside Nigeria are made under Part VIII of the Nigeria Data Protection Act 2023: to countries with adequate protection, or with appropriate safeguards such as binding contractual terms requiring the recipient to protect the data to the standard the Act requires.",
      ],
    },
    {
      id: "security",
      heading: "How we keep it safe",
      blocks: [
        {
          list: [
            "Each school's records are kept apart from every other school's, enforced both in the application and by the database itself.",
            "All traffic is encrypted with HTTPS. Passwords are stored only in hashed form.",
            "Staff see only what their role allows. Medical and emergency details are visible only to roles allowed to see them, and every view is logged.",
            "An audit log records who viewed, changed or exported records, and when.",
            "Our staff can enter a school's account only when the school grants access, for a limited time, and everything they do is marked in the school's audit log.",
            "Each school is backed up every night, and backups are kept for 30 days.",
            "Uploaded photos are re-encoded and stripped of location data. Error reports never include names, phone numbers or what was typed into forms.",
          ],
        },
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        {
          table: {
            head: ["Data", "How long"],
            rows: [
              ["A school's records", "While the school uses the service. After it leaves, 30 days to export everything, then deleted within a further 30 days."],
              ["Backups", "Replaced every night and kept for no more than 30 days"],
              ["Invoices and payment records", "Six years, as tax and company law require"],
              ["Security and audit logs", "As long as the school's account exists, so the school can review them"],
              ["Support emails", "Two years after the matter is closed"],
            ],
          },
        },
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      blocks: [
        "Under the Nigeria Data Protection Act 2023 you can:",
        {
          list: [
            "be told how your data is used, and get a copy of it;",
            "have inaccurate data corrected;",
            "have data deleted, or its use restricted, where the law allows;",
            "receive your data in a common format to take elsewhere;",
            "object to processing based on legitimate interests, and to direct marketing;",
            "withdraw consent at any time, without affecting what was done before.",
          ],
        },
        `For records a school keeps about you or your child, ask the school first: it controls those records, and we will help it respond. For anything else, email ${LEGAL.email}. We will reply within 30 days.`,
      ],
    },
    {
      id: "complaints",
      heading: "Complaints",
      blocks: [
        `Please contact us first at ${LEGAL.email} so we can try to put things right. You can also complain to the Nigeria Data Protection Commission (ndpc.gov.ng).`,
      ],
    },
    {
      id: "changes",
      heading: "Changes to this notice",
      blocks: [
        "When we make an important change, we tell school owners by email or in the app before it takes effect. The date at the top shows when this notice last changed.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [`${LEGAL.company}, ${LEGAL.address}. Email: ${LEGAL.email}.`],
    },
  ],
};

export const DPA: LegalDoc = {
  slug: "dpa",
  title: "Data processing agreement",
  description: `The agreement between each school and ${SITE.name} on how school records are processed, under the Nigeria Data Protection Act 2023.`,
  version: LEGAL.dpaVersion,
  summary: [
    `The school is the data controller for its records. ${SITE.name} is the data processor and acts only on the school's instructions.`,
    "We keep each school's data separate and secure, help the school answer requests from parents and staff, and tell it about any breach within 48 hours.",
    "When a school leaves, it can export everything, and we then delete its data.",
    `A school accepts this agreement when its owner or administrator signs up for ${SITE.name}.`,
  ],
  sections: [
    {
      id: "parties",
      heading: "1. Parties and roles",
      blocks: [
        `This agreement is between the school that signs up for ${SITE.name} (the "School") and ${LEGAL.company}, ${LEGAL.address} ("we", "us"). It forms part of our Terms of Service.`,
        "For the personal data the School keeps in the service, the School is the data controller and we are the data processor, as those terms are used in the Nigeria Data Protection Act 2023 (the \"Act\").",
      ],
    },
    {
      id: "scope",
      heading: "2. What we process, and why",
      blocks: [
        {
          table: {
            head: ["", ""],
            rows: [
              ["Purpose", "Providing the school management service: student records, attendance, scores and report cards, fees and payments, messages to parents and staff, and the parent portal"],
              ["Duration", "For as long as the School uses the service, and the deletion period after it leaves (section 10)"],
              ["People", "Students, many of them children; their parents and guardians; the School's staff"],
              ["Data", "Names, dates of birth, gender, photographs, admission numbers and classes; contact details; attendance; scores, results, comments and behaviour ratings; fees billed and paid; messages sent"],
              ["Sensitive data", "Medical notes and emergency contacts, only if the School records them"],
            ],
          },
        },
      ],
    },
    {
      id: "school",
      heading: "3. The School's responsibilities",
      blocks: [
        "The School is responsible for:",
        {
          list: [
            "having a lawful basis for the data it keeps, and only keeping what it needs;",
            `obtaining a parent's or guardian's consent to process each child's data. ${SITE.name} asks parents for consent when they first sign in, and lets the School record consent given on paper;`,
            "giving parents and staff a privacy notice, which the School can publish and update in the service;",
            "keeping its records accurate, and deciding who on its staff can see what;",
            "keeping its staff's sign-in details secure.",
          ],
        },
      ],
    },
    {
      id: "instructions",
      heading: "4. Processing only on the School's instructions",
      blocks: [
        "We process the School's data only to provide the service, and as the School instructs through the way it sets up and uses the service, or in writing. We will not use it for any other purpose, including our own marketing or advertising. If we believe an instruction breaks the Act, we will tell the School.",
        "If the law requires us to process data in another way, we will tell the School first, unless the law forbids it.",
      ],
    },
    {
      id: "confidentiality",
      heading: "5. Confidentiality and our staff",
      blocks: [
        "Only staff who need access to run or support the service can reach the School's data, and they are bound to keep it confidential. Our staff can enter the School's account only when the School grants access in the service, for a limited time, and everything they do is marked in the School's audit log.",
      ],
    },
    {
      id: "security",
      heading: "6. Security",
      blocks: [
        "We protect the School's data with the measures in Annex A, and keep them under review as risks and technology change.",
      ],
    },
    {
      id: "subprocessors",
      heading: "7. Sub-processors",
      blocks: [
        "The School authorises us to use the sub-processors listed in Annex B. Each is bound by a written contract with data protection obligations at least as protective as this agreement, and we remain responsible to the School for their work.",
        "We will give the School at least 30 days' notice before adding or replacing a sub-processor. If the School objects on reasonable data protection grounds and we cannot resolve the objection, the School may end its subscription and receive a refund for the unused part of the term already paid.",
      ],
    },
    {
      id: "transfers",
      heading: "8. Transfers outside Nigeria",
      blocks: [
        "The service is hosted in the United Kingdom, and some sub-processors are elsewhere (Annex B). We transfer data outside Nigeria only in line with Part VIII of the Act: to countries with adequate protection, or under appropriate safeguards such as binding contractual terms.",
      ],
    },
    {
      id: "assistance",
      heading: "9. Helping the School meet its obligations",
      blocks: [
        {
          list: [
            "Requests from parents and staff: the service lets the School find, export, correct and remove records, and record or withdraw consent. If someone contacts us directly about the School's data, we pass the request to the School promptly and do not answer it ourselves.",
            "Breaches: if we become aware of a breach affecting the School's data, we will tell the School without undue delay and within 48 hours, with what we know of its nature, the records and people affected, the likely consequences and what we are doing about it. This allows the School to notify the Nigeria Data Protection Commission within the 72 hours the Act requires.",
            "Impact assessments: we will give the School the information it reasonably needs to assess the risks of its processing.",
            "Demonstrating compliance: we will give the School the information it reasonably needs to show it meets the Act, and answer reasonable written questions. Once a year, on 30 days' notice, the School may audit our compliance, or accept a summary of our security measures instead.",
          ],
        },
      ],
    },
    {
      id: "end",
      heading: "10. When the School leaves",
      blocks: [
        "The School can download a complete copy of its records at any time from the service. When its subscription ends, it has 30 days to do so, during which the account is read-only. We then delete the School's data within a further 30 days. Nightly backups are replaced on a rolling basis and contain none of it after another 30 days.",
        "We keep invoices and payment records for as long as tax and company law require, and nothing else.",
      ],
    },
    {
      id: "general",
      heading: "11. General",
      blocks: [
        "Liability under this agreement is subject to the limits in our Terms of Service, except where the law does not allow it to be limited. If this agreement and the Terms of Service conflict about personal data, this agreement applies. This agreement is governed by the laws of the Federal Republic of Nigeria.",
        `We may update this agreement to reflect changes in the law or the service, giving school owners at least 30 days' notice. Each version is numbered; the service records which version the School accepted, and when. This is version ${LEGAL.dpaVersion}.`,
      ],
    },
    {
      id: "annex-a",
      heading: "Annex A: Security measures",
      blocks: [
        {
          list: [
            "Separation: every record belongs to one school, and access is limited to that school both in the application and by row-level security in the database.",
            "Encryption in transit: all connections use HTTPS (TLS).",
            "Passwords: stored only as salted hashes. Repeated failed sign-ins are rate-limited per account.",
            "Access control: role-based permissions. Medical and emergency details are restricted to roles allowed to see them, and each view is logged.",
            "Audit log: views, changes and exports of records, changes to results and fees, permission changes and support access are recorded with the person and time.",
            "Support access: only with the School's time-limited permission, and marked in the School's audit log.",
            "Backups: each school is backed up nightly and backups are kept for 30 days. Restoring a single school without affecting others is covered by automated tests.",
            "Uploads: images are checked, re-encoded and stripped of location data. Files are served through links that expire.",
            "Error reports: contain user IDs only, never names, phone numbers, passwords or form contents.",
            "Updates: the servers' operating system and the software's dependencies are kept up to date with security fixes.",
          ],
        },
      ],
    },
    {
      id: "annex-b",
      heading: "Annex B: Sub-processors",
      blocks: [{ table: SUBPROCESSORS }],
    },
  ],
};

export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms of service",
  description: `The terms on which schools use ${SITE.name}: the service, prices and billing, data, and your responsibilities.`,
  summary: [
    `${SITE.name} costs ${PRICE} per active student per term, after a ${SITE.trialDays}-day free trial. SMS units are ${`₦${SITE.smsUnitNaira}`} each.`,
    "If an invoice is unpaid 14 days after it is due, the portal becomes read-only until it is paid. Nothing is deleted.",
    "Your school owns its data and can export it at any time.",
    "Fees from parents go straight to your school's bank account through Paystack. We take no share of them.",
  ],
  sections: [
    {
      id: "agreement",
      heading: "1. The agreement",
      blocks: [
        `These terms are an agreement between ${LEGAL.company}, ${LEGAL.address} ("we", "us") and the school that signs up for ${SITE.name} (the "School"). The person signing up confirms they are authorised to accept these terms on the School's behalf. Our data processing agreement forms part of these terms.`,
      ],
    },
    {
      id: "service",
      heading: "2. The service",
      blocks: [
        `${SITE.name} is online school management software: student records, attendance, score entry, report cards, school fees and online payments, messages to parents and staff, and a parent portal. The School chooses its staff's roles and decides who can see and do what.`,
        "We may improve and change the service. We will not remove a feature the School relies on without telling school owners in advance.",
      ],
    },
    {
      id: "trial",
      heading: "3. Free trial",
      blocks: [
        `New schools get a ${SITE.trialDays}-day free trial with every feature. No card is needed. A term that ends during the trial is not charged.`,
      ],
    },
    {
      id: "fees",
      heading: "4. Prices and billing",
      blocks: [
        {
          list: [
            `The Standard plan costs ${PRICE} per active student per term. Some plans have a minimum charge per term, shown before you choose them.`,
            "Each term is invoiced up to 14 days before it starts, at the number of active students when the invoice is raised, and is due on the first day of term.",
            "A term in which the free trial ends is invoiced in full, due the day after the trial ends.",
            "Invoices can be paid online in the app by card, bank transfer or USSD, or by bank transfer to the account shown on the invoice.",
            "Prices are in naira and exclude VAT, which is added where it applies.",
            "We may change prices with at least 60 days' notice to school owners. A change applies from the next term invoiced after the notice period.",
          ],
        },
      ],
    },
    {
      id: "late",
      heading: "5. Late payment",
      blocks: [
        "If an invoice is still unpaid 14 days after it is due, the School's portal becomes read-only: everyone can still sign in, view and export, but changes are paused. We never delete data for late payment. Full access returns as soon as the invoice is paid.",
      ],
    },
    {
      id: "sms",
      heading: "6. SMS units",
      blocks: [
        `SMS units are bought in advance into the School's wallet at ₦${SITE.smsUnitNaira} each, and do not expire. One unit sends up to 160 plain characters to one number; longer messages, or ones with special characters, use more. Units are not refundable, except that units for messages that fail to send are returned to the wallet automatically. Delivery depends on the mobile networks, which we do not control.`,
      ],
    },
    {
      id: "school-fees",
      heading: "7. Collecting fees from parents",
      blocks: [
        "Online fee payments are processed by Paystack, under Paystack's own terms, through our Paystack business account. Money settles directly into the School's bank account, usually the next working day; we do not hold the School's money. Parents may see our business name, or Paystack's, on their bank statement.",
        "We take no share of fee payments. Our charges are the subscription and SMS units only. The School chooses whether it or the parent pays Paystack's transaction charge.",
        "Only the School's owner can link or change the bank account fees are paid into. The School is responsible for those details being correct; a payment settled into the account the School linked counts as paid to the School.",
        "Cash, POS and bank payments made to the School never pass through us. The service only records them, and the School is responsible for those records and the receipts it issues.",
        "Fees, discounts and refunds are a matter between the School and its parents. The School handles refund requests from parents.",
        "If a parent disputes an online payment with their bank or card issuer (a chargeback), the School will provide evidence that the payment was owed, such as the bill and receipt, within the time Paystack allows. If the dispute is decided against the School, the School bears the amount refunded and any charge Paystack makes for the dispute. We may invoice the School for these or recover them from its future settlements.",
      ],
    },
    {
      id: "responsibilities",
      heading: "8. The School's responsibilities",
      blocks: [
        "The School is responsible for:",
        {
          list: [
            "the accuracy of what it enters, and for checking results before it publishes them;",
            "having a lawful basis for its data, and the consent of parents where the law requires it;",
            "keeping its staff's sign-in details secure, and removing people who leave;",
            "how its staff use the service.",
          ],
        },
        "The School must not use the service to break the law, upload harmful software, try to reach another school's data, test the service's limits or security without our written agreement, or copy or resell the software.",
      ],
    },
    {
      id: "data",
      heading: "9. Your data",
      blocks: [
        "The School owns its data. We use it only to provide the service, as set out in our data processing agreement and privacy notice. The School can export its records at any time.",
      ],
    },
    {
      id: "availability",
      heading: "10. Availability and support",
      blocks: [
        "We aim for the service to be available 99.5% of the time each month, excluding planned maintenance. We plan maintenance outside school hours, avoid results weeks, and announce it in advance. This is a target, not a guarantee.",
        `Support is by email at ${LEGAL.email}. To look into a problem inside the School's account, we need the School's permission, which it grants in its settings for a limited time.`,
      ],
    },
    {
      id: "ip",
      heading: "11. Intellectual property",
      blocks: [
        `We own ${SITE.name}, its software and its design. The School receives the right to use the service during its subscription. Suggestions the School sends us may be used to improve the service.`,
      ],
    },
    {
      id: "ending",
      heading: "12. Ending the agreement",
      blocks: [
        "The School can stop using the service at any time. The subscription ends at the end of the term already invoiced; terms already paid are not refunded, except as our data processing agreement allows.",
        "We may suspend or end the service for a School that does not pay, or that seriously breaks these terms and does not put it right within 14 days of our notice. We may act at once to stop serious harm, such as an attack on the service.",
        "When the subscription ends, the School has 30 days to export its data, after which we delete it as our data processing agreement describes.",
      ],
    },
    {
      id: "liability",
      heading: "13. Our liability",
      blocks: [
        "We provide the service with reasonable care and skill. Report cards and balances are calculated from the School's own settings and entries, so the School should check them before publishing or relying on them.",
        "Our total liability in any 12 months is limited to the fees the School paid us in those 12 months. We are not liable for indirect losses, such as lost profits or reputation. Nothing in these terms limits liability that the law does not allow to be limited.",
        "The School is responsible for claims arising from data it had no right to enter, or from its staff's misuse of the service.",
      ],
    },
    {
      id: "law",
      heading: "14. Law and disputes",
      blocks: [
        "These terms are governed by the laws of the Federal Republic of Nigeria. If a dispute arises, we will first try to resolve it together in good faith for 30 days. If that fails, the courts of Lagos State have jurisdiction.",
      ],
    },
    {
      id: "changes",
      heading: "15. Changes to these terms",
      blocks: [
        "We may update these terms. We will tell school owners at least 30 days before an important change takes effect. If the School does not accept the change, it may end its subscription before the change applies.",
      ],
    },
    {
      id: "contact",
      heading: "16. Contact",
      blocks: [`${LEGAL.company}, ${LEGAL.address}. Email: ${LEGAL.email}.`],
    },
  ],
};

export const LEGAL_DOCS = { privacy: PRIVACY, dpa: DPA, terms: TERMS };
