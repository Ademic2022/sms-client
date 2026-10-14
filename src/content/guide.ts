/**
 * The user guide at /guide: how owners, admins, bursars, teachers and parents use the app.
 * Keep it in step with the product: it names real menu items and buttons, so rename them
 * here when they change in the app.
 *
 * Text may use **bold** for menu items and buttons; GuideDocument renders it.
 */
import { SITE } from "@/lib/site";

export type GuideBlock =
  | string
  | { list: string[] }
  | { steps: string[] }
  | { table: { head: string[]; rows: string[][] } };
export type GuideSection = { id: string; heading: string; lead?: string; parts: { heading?: string; blocks: GuideBlock[] }[] };

export const GUIDE_UPDATED = "13 October 2026";
export const SUPPORT = {
  hours: "24 hours a day, 7 days a week",
  response: "within 30 minutes",
};

export const GUIDE: GuideSection[] = [
  {
    id: "introduction",
    heading: "1. Introduction",
    lead: `${SITE.name} runs a school's records, results, fees and parent communication in one place, on a phone or a computer.`,
    parts: [
      {
        heading: "Purpose of the system",
        blocks: [
          "It replaces the spreadsheets, paper report cards and phone calls most schools use. Staff enter information once, and parents see what concerns their own children.",
        ],
      },
      {
        heading: "What problems it solves",
        blocks: [
          {
            table: {
              head: ["Problem", `How ${SITE.name} handles it`],
              rows: [
                ["Report cards take weeks to compile", "Teachers enter scores; positions, grades and PDF report cards are produced automatically"],
                ["Fees are hard to track", "Bills per term, cash and online payments, a debtors list, receipts and SMS reminders"],
                ["Parents chase the school for information", "Parents see results, report cards, bills and payments in their own portal"],
                ["Mistakes and changes go unnoticed", "Every change to results, fees, staff and settings is recorded in the audit log"],
                ["Poor or no internet", "Attendance and scores save offline and are sent when the connection returns"],
              ],
            },
          },
        ],
      },
      {
        heading: "Who the system is designed for",
        blocks: [
          {
            list: [
              "**School owners and administrators**, who set up the school and oversee everything.",
              "**Bursars**, who manage fees and payments.",
              "**Teachers**, both subject teachers and class teachers.",
              "**Parents and guardians**, who follow their children and pay fees.",
              "**Students**, who see their own results, report cards, attendance and notices.",
            ],
          },
        ],
      },
      {
        heading: "How to access the website",
        blocks: [
          {
            steps: [
              "Open your school's own web address. The school gives it to every user, and it is different for each school.",
              "Sign in with your **phone number** (or email address) and password. Students use their **admission number**.",
              `On a phone, use your browser's **Add to Home Screen** option to install ${SITE.name} like an app.`,
            ],
          },
          `A new school registers on the ${SITE.name} website with **Start free trial**, chooses its web address, and confirms the owner's email address before signing in.`,
        ],
      },
    ],
  },
  {
    id: "overview",
    heading: "2. System overview",
    lead: "Each person sees only the menu items their role allows, so a teacher's screen is shorter than an owner's.",
    parts: [
      {
        heading: "Dashboard and navigation",
        blocks: [
          "The menu sits on the left on a computer and behind the menu button on a phone. **Overview** is the first page after signing in, and it changes with your role:",
          {
            list: [
              "**Owner and admin**: money billed, collected and outstanding this term, the share paid online, enrolment by level, and how many classes have published results.",
              "**Class teacher**: your class, with links to the daily register, broadsheet, comments and ratings.",
              "**Subject teacher**: the subjects and classes you teach, with links to score entry.",
              "**Parent**: goes straight to **My children**.",
              "**Student**: goes straight to **My results**.",
            ],
          },
        ],
      },
      {
        heading: "Main modules and features",
        blocks: [
          {
            table: {
              head: ["Menu item", "What it does", "Who sees it"],
              rows: [
                ["Students", "Records, guardians, admission, import from Excel, export", "Owner, admin, bursar, class teacher"],
                ["Attendance", "Daily register per class", "Owner, admin, class teacher"],
                ["Score entry", "Continuous assessment and exam scores per subject", "Owner, admin, subject and class teachers"],
                ["Results", "Broadsheet, comments, ratings, approval, publishing, report cards", "Owner, admin, class teacher"],
                ["Fees and payments", "Fee setup, bills, payments, receipts, debtors", "Owner, admin, bursar"],
                ["Messages", "SMS and in-app announcements, SMS wallet", "Owner, admin, bursar"],
                ["Settings", "School profile, branding, academics, staff, billing, privacy, online payments", "Owner, admin"],
                ["Audit log", "Who changed what, and when", "Owner, admin"],
                ["My children", "Results, report cards, attendance, bills, payments, online payment, notices", "Parents"],
                ["My results", "Own results, report cards, attendance and notices", "Students"],
              ],
            },
          },
        ],
      },
      {
        heading: "Notifications and announcements",
        blocks: [
          {
            list: [
              "**Announcements** are written under **Messages** and sent by SMS, as an in-app notice, or both. Staff see notices on **Overview**, parents on **My children** and students on **My results**.",
              "**Automatic SMS** go out for payment receipts, results being published, absences (when the school turns this on) and scheduled fee reminders.",
              "**Emails** confirm a new school owner's address, deliver password reset codes, and send receipts for online payments and subscription invoices.",
              "A **banner** at the top warns staff when the school's subscription invoice is due or overdue.",
            ],
          },
        ],
      },
      {
        heading: "How the modules work together",
        blocks: [
          {
            steps: [
              "**Settings → Academics** defines sessions, terms, classes, subjects, assessment weights and grading.",
              "**Students** are admitted into classes, with their parents linked as guardians.",
              "**Attendance** and **Score entry** collect daily and termly data for those classes and subjects.",
              "**Results** turns scores and attendance into positions, comments and report cards, and publishing releases them to parents.",
              "**Fees** bills each student for the term; payments, cash or online, reduce the balance and issue receipts.",
              "**Messages** reach parents about results, absences and balances, and the **audit log** records every change.",
            ],
          },
          "A school can hold results back from students owing more than an amount it sets, which links **Fees** to **Results**.",
        ],
      },
    ],
  },
  {
    id: "administrators",
    heading: "3. Administrator's guide",
    lead: "Set up the academic structure first, then staff, then students; everything else depends on those three. Bursars use the fee parts.",
    parts: [
      {
        heading: "First-time setup, in order",
        blocks: [
          {
            steps: [
              "**Settings → Academics**: create the session (for example 2026/2027), add its terms and mark the current term with **Make current**.",
              "Add **levels** (JSS 1, Primary 4 and so on) and their **arms** (A, B, Gold), then the subjects each level takes.",
              "Set the **assessment** columns and their maximum scores (for example two tests of 20 and an exam of 60) and the **grading scale**.",
              "**Settings → Staff**: add staff, then assign teachers.",
              "**Students**: add or import students with their parents.",
              "**Fees and payments → Fee setup**: set fee items and the amount each level pays.",
              "**Settings**: upload the logo, principal's signature and school stamp, and link the school's bank account for online fees.",
            ],
          },
        ],
      },
      {
        heading: "Managing students",
        blocks: [
          {
            list: [
              "Add one student with **New student**, or many at once with **Import from Excel**: download the template, fill one row per student with their parent's name and phone, and upload it.",
              "A parent's account is created from the phone number entered. The parent sets a password with **Forgot password?** on the sign-in page.",
              "Open a student to edit details, add a passport photo, medical notes and emergency contacts, choose electives, or **Withdraw**, **Transfer out** and **Reactivate**.",
              "Search by name or admission number, filter by class or status, and export the list to Excel.",
            ],
          },
        ],
      },
      {
        heading: "Student portal logins",
        blocks: [
          {
            steps: [
              "Open **Students → Portal logins** and choose a class.",
              "Click **Create logins for…**. Every active student in the class without a login gets one, with a starting password.",
              "Click **Print slips** and hand each student their slip. It shows the web address, their admission number and the starting password. Passwords are shown only once.",
              "A student who loses their password gets a new slip with **Reset password**.",
            ],
          },
          "Students choose their own password the first time they sign in. Students who are withdrawn, transferred or graduate can no longer sign in.",
        ],
      },
      {
        heading: "Managing teachers and staff",
        blocks: [
          {
            list: [
              "**Settings → Staff → Add staff member**: enter the name, phone and email and choose roles. Staff with an email receive sign-in instructions. Many staff can be added with **Import from Excel**.",
              "Turn off **Account active** to stop someone who has left from signing in. Their past work stays in the records.",
            ],
          },
        ],
      },
      {
        heading: "Creating classes and assigning subjects",
        blocks: [
          {
            list: [
              "**Settings → Academics**: expand a level to add arms, pick each arm's **class teacher**, and edit the level's subjects.",
              "**Settings → Staff → Subject teachers → Assign a teacher**: choose a class, a subject and its teacher. A teacher only sees the classes and subjects assigned to them.",
              "At the end of a session, **Settings → Academic setup → Review and promote** lists every class with each student's year average. Students below the pass mark are suggested to repeat; adjust any decision, then **Promote all** moves the whole school into the new session. Final-year students graduate.",
            ],
          },
        ],
      },
      {
        heading: "Managing attendance",
        blocks: [
          "Class teachers mark the register daily; admins can mark any class. Turn on **Text parents when a child is marked absent** in **Settings** to send absence SMS.",
        ],
      },
      {
        heading: "Managing results, each term",
        blocks: [
          {
            steps: [
              "Teachers enter scores under **Score entry**.",
              "Under **Results**, open each class to see missing scores, the broadsheet and positions.",
              "Class teachers add **report card comments** and **behaviour and skills** ratings. **Fill empty with suggestions** drafts comments from each student's performance.",
              "Click **Approve and lock**. Scores can then change only after an admin clicks **Unlock**.",
              "Click **Publish to parents**, now or at a set date and time. Parents are notified and can download report cards. **Generate report cards** prepares the PDFs for the whole class.",
            ],
          },
          "In **Settings → Fees**, a school can hold results from students owing more than an amount it sets.",
        ],
      },
      {
        heading: "Managing fees, each term",
        blocks: [
          {
            steps: [
              "**Fee setup**: add fee items (tuition, PTA, uniform) and the amount each level pays. Import **opening balances** carried over from before the school used " + SITE.name + ".",
              "**Fees and payments → Generate bills** charges every active student for the term.",
              "Record cash, POS and bank payments under **Payments → Record a payment**. Parents receive an SMS receipt. Online payments appear automatically.",
              "Open a student under **Fees** to add a discount or scholarship, add an item to their bill, or **Reverse** a payment recorded by mistake.",
              "**Students owing** lists debtors, largest balance first. Export it to Excel or send an **SMS reminder**. Automatic reminders can be scheduled in **Settings**.",
            ],
          },
          "**Online fee payments**: the owner links the school's bank account under **Settings → Online fee payments**. Parents' payments then settle straight into that account through Paystack, usually the next working day. **Settings → Fees** decides whether the school or the parent pays the online charge.",
        ],
      },
      {
        heading: "Managing accounts, permissions and reports",
        blocks: [
          {
            table: {
              head: ["Role", "Can do"],
              rows: [
                ["Owner", "Everything, including the money overview and the payout bank account"],
                ["Admin", "Everything except the owner's money overview and payout account"],
                ["Bursar", "View students; fees, payments, receipts and fee reminders"],
                ["Class teacher", "Own class: register, broadsheet, comments, ratings; scores for assigned subjects"],
                ["Subject teacher", "Scores for assigned subjects and classes only"],
                ["Parent", "Own children only"],
                ["Student", "Own results, report cards, attendance and notices only"],
              ],
            },
          },
          "A person can hold several roles, for example class teacher and subject teacher.",
          {
            list: [
              "**Overview**: billed, collected, outstanding, online share, enrolment and results progress.",
              "**Excel exports**: students, debtors, payments by date and method, and a full copy of the school's records.",
              "**PDFs**: report cards, receipts and subscription invoices.",
              "**Audit log**: every change to results, fees, staff, settings and sign-ins, filterable by area.",
              "**Settings → Billing**: the school's invoices and SMS units. If an invoice is unpaid 14 days after it is due, the portal becomes read-only until it is paid; nothing is deleted.",
              "**Settings → Privacy**: publish the school's privacy notice and see which parents have given consent.",
              "**Support access**: let the support team into the account for a set time. Their actions are marked in the audit log.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "teachers",
    heading: "4. Teacher's guide",
    lead: "Teachers see only the classes and subjects the school assigned to them, and their work saves even without internet.",
    parts: [
      {
        heading: "Viewing assigned classes",
        blocks: [
          {
            list: [
              "**Overview** shows **My class** if you are a class teacher, and **My subjects** with every class you teach each subject in.",
              "If a class or subject is missing, ask an admin to assign it under **Settings → Staff → Subject teachers**, or to make you class teacher of the arm.",
            ],
          },
        ],
      },
      {
        heading: "Recording attendance",
        blocks: [
          {
            steps: [
              "Open **Attendance** and choose your class. Today's date is selected.",
              "Click **Mark all present**, then change the students who are absent or late.",
              "Click **Save register**.",
            ],
          },
          "With no internet, the register is kept on your phone and sent automatically when the connection returns.",
        ],
      },
      {
        heading: "Uploading assessments and results",
        blocks: [
          {
            steps: [
              "Open **Score entry** and choose a class and subject.",
              "Type each student's score in each column (for example Test 1, Test 2, Exam). A score above a column's maximum is refused.",
              "Scores save as you go, including offline.",
              "To work in Excel instead, download the class's score sheet, fill it, and use **Upload sheet**.",
            ],
          },
          "Once an admin clicks **Approve and lock**, scores can no longer be changed. Ask an admin to **Unlock** the class if a correction is needed.",
          "**Class teachers** also, under **Results**:",
          {
            list: [
              "Check the **broadsheet**: every subject, total, average and position for the class.",
              "Write each student's **report card comment** (or use **Fill empty with suggestions**, then edit) and click **Save comments**.",
              "Rate **behaviour and skills** such as punctuality and neatness, then **Save ratings**.",
            ],
          },
        ],
      },
      {
        heading: "Communicating with parents",
        blocks: [
          "Announcements are sent by the school's admins or bursar under **Messages**, and appear in the parent and student portals. Parents are informed automatically when results are published and, if the school chooses, when a child is absent.",
        ],
      },
    ],
  },
  {
    id: "parents",
    heading: "5. Parent's guide",
    lead: "Parents sign in with the phone number the school has on file and see each of their children on one screen.",
    parts: [
      {
        heading: "Getting started",
        blocks: [
          {
            steps: [
              "Open your school's web address and click **Forgot password?**",
              "Enter your phone number. A code arrives by SMS.",
              "Enter the code and choose a password, then sign in.",
              "The first time, read the school's privacy notice and give or decline consent for each child.",
            ],
          },
          "If no children appear, the school has a different phone number for you; ask the school office to correct it.",
        ],
      },
      {
        heading: "Viewing your children's academic performance",
        blocks: [
          {
            steps: [
              "Open **My children** and click a child.",
              "Choose the term. You see the child's average, position in class, and every subject's scores and grade.",
              "Click **Report card** to download the PDF, with attendance and the teacher's and principal's comments.",
            ],
          },
          "Results appear once the school publishes them. If the school holds results while fees are outstanding, a notice explains this until the balance is paid.",
        ],
      },
      {
        heading: "Attendance and announcements",
        blocks: [
          {
            list: [
              "Open a child and choose the term: **Attendance** shows the share of days present and each day they were absent, late or excused.",
              "**Notices** on **My children** shows the school's latest announcements.",
              "If the school has turned on absence alerts, you also get an SMS the day your child is marked absent. Result notifications and fee reminders arrive by SMS too.",
            ],
          },
        ],
      },
      {
        heading: "Fee balances and payment records",
        blocks: [
          {
            list: [
              "Each child's card on **My children** shows the **balance** and this term's **bill**. Click **Bill breakdown** to see each item.",
              "Open a child to see every payment, with a link to its **receipt**.",
            ],
          },
        ],
      },
      {
        heading: "Paying fees online",
        blocks: [
          {
            steps: [
              "On **My children**, under **Pay school fees**, enter the amount for each child. You can pay part of the balance, and pay for several children at once.",
              "Optionally add an email address for an emailed receipt.",
              "Click **Pay**, then pay by card, bank transfer or USSD on the secure Paystack page.",
              `You return to ${SITE.name}, the payment is recorded straight away, and an SMS receipt is sent.`,
            ],
          },
          "The school may add a small online payment charge, shown before you pay. Payments go directly to the school's bank account.",
        ],
      },
      {
        heading: "Contacting the school",
        blocks: ["Use the school's phone number or email, printed on every receipt and report card."],
      },
    ],
  },
  {
    id: "students",
    heading: "6. Student's guide",
    lead: "Students sign in with their admission number and see only their own records.",
    parts: [
      {
        heading: "Signing in for the first time",
        blocks: [
          {
            steps: [
              "Open the web address on your login slip.",
              "Enter your **admission number** and the **starting password** from the slip.",
              "Choose your own password, type it twice, and click **Change password**. Keep it to yourself.",
            ],
          },
          "Forgot your password? Ask the school office for a new slip.",
        ],
      },
      {
        heading: "Results, attendance and notices",
        blocks: [
          {
            list: [
              "**My results** shows your average, position in class, and every subject's score and grade for the term you choose.",
              "Click **Report card** to download it. Results appear once the school publishes them.",
              "**Attendance** shows the share of days you were present, and each day you were absent, late or excused.",
              "**Notices** shows the school's latest announcements.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "security",
    heading: "7. Account security and troubleshooting",
    lead: "Everyone signs in at their own school's address, and each account sees only what its role allows.",
    parts: [
      {
        heading: "Signing in and resetting passwords",
        blocks: [
          {
            list: [
              "Sign in with your **phone number or email address** and password. Students sign in with their **admission number**.",
              "Forgot your password, or never set one: click **Forgot password?** Enter your phone number to get a code by SMS, or your email address to get it by email. The code lasts 10 minutes.",
              "To change your password, click your name at the bottom of the menu to open **Your account**. You get an email when it changes, if your account has one.",
              "Students who forget their password get a new starting password from the school office.",
              "A new school owner must click the link in the confirmation email before signing in. The link lasts 3 days, and **Resend** sends a new one after 60 seconds.",
              "After 10 wrong passwords in 10 minutes, the account is paused briefly. Wait, then try again or reset the password.",
            ],
          },
        ],
      },
      {
        heading: "Role-based access",
        blocks: [
          "What you can see and do depends on your role (see the table in section 3). Teachers see only their assigned classes and subjects, parents see only their own children, and medical notes and emergency contacts are visible only to staff allowed to see them. Ask the school owner or an admin to change your roles.",
        ],
      },
      {
        heading: "Common messages and what to do",
        blocks: [
          {
            table: {
              head: ["Message", "What it means", "What to do"],
              rows: [
                ["Wrong phone/email or password", "Details do not match", "Check the number, or use **Forgot password?**"],
                ["Confirm your email address first", "New owner account not confirmed", "Open the confirmation email, or click **Resend**"],
                ["Open this from your school's web address", "You are on the main website", "Use your school's own address"],
                ["This school address does not exist", "Mistyped school address", "Check the address with the school"],
                ["You do not have permission to do that", "Your role does not allow it", "Ask an admin"],
                ["You are not assigned to teach this subject in this class", "Missing subject assignment", "Ask an admin to assign you"],
                ["Results for this class are locked", "Results were approved", "Ask an admin to **Unlock** the class"],
                ["The portal is read-only", "The school's invoice is overdue", "The owner pays under **Settings → Billing**"],
                ["This school's portal is suspended", "The account was suspended", "The owner contacts support"],
                ["Too many requests. Please wait a minute", "Too many actions in a short time", "Wait a minute, then try again"],
                ["No connection. Your changes will be sent when you are back online", "You are offline", "Keep working; attendance and scores send themselves later"],
                ["That code is wrong or has expired", "Reset code mistyped or older than 10 minutes", "Request a new code"],
                ["Choose a new password before you continue", "Signed in with a starting password", "Choose your own password on **Your account**"],
                ["This student is no longer at the school", "The student was withdrawn, transferred or graduated", "Contact the school office"],
              ],
            },
          },
        ],
      },
      {
        heading: "Protecting student information",
        blocks: [
          {
            list: [
              "Never share your password or sign in on someone else's account. Sign out on shared computers.",
              "Admins should turn off **Account active** for staff who leave, and review the **Audit log** regularly.",
              "Under the Nigeria Data Protection Act 2023, the school publishes a privacy notice and records each parent's consent.",
              "Grant **Support access** only when you have asked for help, and for as short a time as possible.",
              `Report a suspected data leak, a wrong result or a payment problem to the school office first; the school reports platform problems to ${SITE.name} support.`,
            ],
          },
        ],
      },
    ],
  },
  {
    id: "glossary",
    heading: "8. Glossary",
    parts: [
      {
        blocks: [
          {
            table: {
              head: ["Term", "Meaning"],
              rows: [
                ["Session", "The school year, for example 2026/2027, made of three terms"],
                ["Current term", "The term the school is working in now; most screens use it"],
                ["Level", "A year group, such as JSS 1 or Primary 4"],
                ["Arm", "One class within a level, such as JSS 1A"],
                ["Continuous assessment (CA)", "Tests and assignments scored during the term, before the exam"],
                ["Broadsheet", "The class's full results table: every subject, total, average and position"],
                ["Approve and lock", "Confirms a class's results so scores can no longer change"],
                ["Publish", "Releases approved results and report cards to parents"],
                ["Result hold", "Keeps results from a student owing more than the school's set amount"],
                ["Bill", "What a student owes for a term, made of fee items"],
                ["Opening balance", `Debt or credit carried over from before the school used ${SITE.name}`],
                ["Discount", "A reduction or scholarship on a student's fees"],
                ["Reversal", "Cancels a payment recorded by mistake, keeping a record of it"],
                ["SMS unit", "One text message of up to 160 characters to one phone, bought in advance"],
                ["Sender name", "The name SMS appear from; the school's own name needs network approval"],
                ["Payout account", "The school bank account online fee payments settle into"],
                ["Read-only", "Signing in and viewing still work, but changes are paused until an invoice is paid"],
                ["Audit log", "The record of who changed what, and when"],
                ["Support access", "Time-limited permission for support to enter the school's account"],
                ["Starting password", "The password on a student's login slip, replaced at first sign-in"],
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "faq",
    heading: "9. Frequently asked questions",
    parts: [
      {
        blocks: [
          "**A parent says they cannot sign in.** Check the parent's phone number on the student's record, then ask them to use **Forgot password?** with that number.",
          "**A teacher cannot see a class.** Assign the subject under **Settings → Staff → Subject teachers**, or make them class teacher of the arm in **Settings → Academics**.",
          "**A score was entered wrongly after approval.** An admin clicks **Unlock** on the class under **Results**, the teacher corrects it, and the class is approved again.",
          "**A payment was recorded against the wrong student.** Open the student under **Fees**, **Reverse** the payment, and record it on the right student.",
          "**A parent paid online but the balance did not change.** Most payments show at once. If not, check **Fees and payments → Payments**; online payments are confirmed with Paystack automatically within minutes.",
          "**Can parents pay part of the fees?** Yes. Parents choose any amount, and can pay for several children at once.",
          "**Does it work without internet?** Attendance and scores save offline and send when the connection returns. Other screens need a connection.",
          "**A student forgot their password.** Open **Students → Portal logins**, choose their class and click **Reset password** to print a new slip.",
          "**Who owns the school's data?** The school. It can export a full copy at any time.",
        ],
      },
    ],
  },
  {
    id: "coming-soon",
    heading: "10. Coming soon",
    lead: "These are on the way; this guide will be updated as each one arrives.",
    parts: [
      {
        blocks: [
          {
            list: [
              "Class timetables, for staff and students.",
              "Assignments and lesson notes from teachers, with files students can download.",
              "Messages from teachers to their class's parents.",
            ],
          },
        ],
      },
    ],
  },
];
