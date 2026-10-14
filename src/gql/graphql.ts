/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AttendanceEntry = {
  clientUpdatedAt?: string | null | undefined;
  status: string;
  studentId: string | number;
};

export type BandInput = {
  grade: string;
  maxScore: string;
  minScore: string;
  remark?: string;
};

export type CommentInput = {
  classTeacherComment?: string | null | undefined;
  principalComment?: string | null | undefined;
  studentId: string | number;
};

export type ComponentInput = {
  maxScore: string;
  name: string;
};

export type GuardianInput = {
  email?: string;
  firstName: string;
  lastName: string;
  phone: string;
  relationship?: string;
  title?: string;
};

export type LevelSubjectInput = {
  category?: string;
  subjectId: string | number;
};

export type PayFor = {
  amountKobo: number;
  studentId: string | number;
};

export type PromotionDecision = {
  decision: string;
  studentId: string | number;
};

export type RatingInput = {
  rating: number;
  studentId: string | number;
  traitId: string | number;
};

export type ScheduleInput = {
  amountKobo: number;
  isCompulsory?: boolean;
  itemId: string | number;
  levelId: string | number;
};

export type ScoreEntry = {
  clientUpdatedAt?: string | null | undefined;
  componentId: string | number;
  studentId: string | number;
  value?: string | null | undefined;
};

export type StudentInput = {
  admissionNumber?: string | null | undefined;
  armId: string | number;
  dateOfBirth?: string | null | undefined;
  emergencyContactName?: string | null | undefined;
  emergencyContactPhone?: string | null | undefined;
  examNumbers?: Record<string, unknown> | null | undefined;
  firstName: string;
  gender: string;
  lastName: string;
  medicalNotes?: string | null | undefined;
  middleName?: string;
};

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: string;
  newPassword: string;
}>;


export type ChangePasswordMutation = { changePassword: boolean };

export type RegisterQueryVariables = Exact<{
  armId: string | number;
  date: string;
}>;


export type RegisterQuery = { register: { date: string, rows: Array<{ status: string | null, student: { id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null } }> } };

export type MarkAttendanceMutationVariables = Exact<{
  armId: string | number;
  date: string;
  entries: Array<AttendanceEntry> | AttendanceEntry;
}>;


export type MarkAttendanceMutation = { markAttendance: { saved: number, conflicts: Array<{ studentId: string, serverStatus: string }> } };

export type AttendanceClassesQueryVariables = Exact<{
  all: boolean;
}>;


export type AttendanceClassesQuery = { myClasses: { classArms: Array<{ id: string, label: string, studentCount: number }> }, arms?: Array<{ id: string, label: string, studentCount: number }> };

export type AuditLogQueryVariables = Exact<{
  prefix?: string | null | undefined;
  offset: number;
}>;


export type AuditLogQuery = { auditLog: { total: number, items: Array<{ id: string, action: string, summary: string, userName: string | null, viaSupport: boolean, createdAt: string }> } };

export type PlatformSchoolsQueryVariables = Exact<{
  search?: string | null | undefined;
  offset: number;
}>;


export type PlatformSchoolsQuery = { platformOverview: { schools: number, activeStudents: number, onTrial: number, pendingSenders: Array<{ schoolId: string, schoolName: string, senderId: string }> }, platformSchools: { total: number, items: Array<{ id: string, name: string, slug: string, status: string, accessMode: string, plan: string | null, studentCount: number, trialEndsAt: string | null, lastActivityAt: string | null, createdAt: string, smsSenderId: string, smsSenderStatus: string, usage: { signIns7d: number, activeUsers7d: number, smsUnits30d: number, collected30dKobo: number, onlineShare30d: number, unpaidInvoices: number } }> } };

export type SetSchoolStatusMutationVariables = Exact<{
  schoolId: string | number;
  status: string;
  reason: string;
}>;


export type SetSchoolStatusMutation = { setSchoolStatus: { id: string, status: string } };

export type SetSenderStatusMutationVariables = Exact<{
  schoolId: string | number;
  status: string;
}>;


export type SetSenderStatusMutation = { setSenderIdStatus: boolean };

export type CreditSmsMutationVariables = Exact<{
  schoolId: string | number;
  units: number;
  reason: string;
}>;


export type CreditSmsMutation = { creditSmsUnits: number };

export type OwnerDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type OwnerDashboardQuery = { ownerDashboard: { termLabel: string, activeStudents: number, classesPublished: number, classesTotal: number, studentsByLevel: Array<{ level: string, students: number }>, fees: { expectedKobo: number, collectedKobo: number, collectedOnlineKobo: number, outstandingKobo: number, debtorCount: number } } | null };

export type MyClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyClassesQuery = { myClasses: { classArms: Array<{ id: string, label: string, studentCount: number }>, subjectAssignments: Array<{ id: string, arm: { id: string, label: string }, subject: { id: string, name: string } }> } };

export type BursarSummaryQueryVariables = Exact<{
  termId: string | number;
}>;


export type BursarSummaryQuery = { termFeeSummary: { expectedKobo: number, collectedKobo: number, collectedOnlineKobo: number, outstandingKobo: number, debtorCount: number } };

export type FeesOverviewQueryVariables = Exact<{
  termId: string | number;
  armId?: string | number | null | undefined;
  offset: number;
}>;


export type FeesOverviewQuery = { termFeeSummary: { expectedKobo: number, collectedKobo: number, collectedOnlineKobo: number, outstandingKobo: number, debtorCount: number }, debtors: { total: number, totalBalanceKobo: number, items: Array<{ balanceKobo: number, student: { id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null } }> } };

export type GenerateBillsMutationVariables = Exact<{
  termId: string | number;
}>;


export type GenerateBillsMutation = { generateBills: number };

export type RemindDebtorsMutationVariables = Exact<{
  body: string;
}>;


export type RemindDebtorsMutation = { sendMessage: { id: string, unitsUsed: number } };

export type RecentPaymentsQueryVariables = Exact<{
  method?: string | null | undefined;
  offset: number;
}>;


export type RecentPaymentsQuery = { payments: { total: number, items: Array<{ id: string, amountKobo: number, method: string, status: string, receiptNumber: string, reference: string, paidAt: string, student: { id: string, fullName: string, admissionNumber: string }, recordedBy: { fullName: string } | null }> } };

export type RecordPaymentMutationVariables = Exact<{
  studentId: string | number;
  amountKobo: number;
  method: string;
  paidAt: string;
  reference: string;
  note: string;
}>;


export type RecordPaymentMutation = { recordPayment: { id: string, receiptNumber: string } };

export type StudentBalanceQueryVariables = Exact<{
  studentId: string | number;
}>;


export type StudentBalanceQuery = { ledger: { balanceKobo: number } };

export type FeeSetupQueryVariables = Exact<{
  termId: string | number;
}>;


export type FeeSetupQuery = { feeItems: Array<{ id: string, name: string, order: number }>, levels: Array<{ id: string, name: string }>, feeSchedules: Array<{ id: string, amountKobo: number, isCompulsory: boolean, levelId: string, item: { id: string } }> };

export type SaveFeeItemMutationVariables = Exact<{
  name: string;
  order: number;
}>;


export type SaveFeeItemMutation = { saveFeeItem: { id: string } };

export type SetFeeScheduleMutationVariables = Exact<{
  termId: string | number;
  schedules: Array<ScheduleInput> | ScheduleInput;
}>;


export type SetFeeScheduleMutation = { setFeeSchedule: Array<{ id: string }> };

export type LedgerQueryVariables = Exact<{
  studentId: string | number;
}>;


export type LedgerQuery = { ledger: { balanceKobo: number, chargedKobo: number, paidKobo: number, openingBalance: { amountKobo: number, asOf: string, note: string } | null, student: { id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null }, bills: Array<{ id: string, broughtForwardKobo: number, totalKobo: number, term: { id: string, label: string }, lines: Array<{ id: string, kind: string, description: string, amountKobo: number, isOptional: boolean }> }>, payments: Array<{ id: string, amountKobo: number, method: string, status: string, receiptNumber: string, reference: string, paidAt: string, reversedReason: string }>, discounts: Array<{ id: string, name: string, kind: string, value: number, item: { name: string } | null, term: { label: string } | null }> }, feeItems: Array<{ id: string, name: string }> };

export type SetOpeningBalanceMutationVariables = Exact<{
  studentId: string | number;
  amountKobo?: number | null | undefined;
  asOf?: string | null | undefined;
  note: string;
}>;


export type SetOpeningBalanceMutation = { setOpeningBalance: { amountKobo: number } | null };

export type AddDiscountMutationVariables = Exact<{
  studentId: string | number;
  name: string;
  kind: string;
  value: number;
  itemId?: string | number | null | undefined;
}>;


export type AddDiscountMutation = { addDiscount: { id: string } };

export type AddBillItemMutationVariables = Exact<{
  billId: string | number;
  description: string;
  amountKobo: number;
  itemId?: string | number | null | undefined;
  reason: string;
}>;


export type AddBillItemMutation = { addBillItem: { id: string } };

export type RemoveBillItemMutationVariables = Exact<{
  lineId: string | number;
  reason: string;
}>;


export type RemoveBillItemMutation = { removeBillItem: { id: string } };

export type ReversePaymentMutationVariables = Exact<{
  paymentId: string | number;
  reason: string;
}>;


export type ReversePaymentMutation = { reversePayment: { id: string, status: string } };

export type ResendFailedMutationVariables = Exact<{
  messageId: string | number;
}>;


export type ResendFailedMutation = { resendFailed: { id: string, unitsUsed: number } };

export type MessagesQueryVariables = Exact<{
  offset: number;
}>;


export type MessagesQuery = { smsWalletBalance: number, messages: { total: number, items: Array<{ id: string, kind: string, audience: string, title: string, body: string, unitsUsed: number, createdAt: string, sendSms: boolean, isAutomatic: boolean, arm: { label: string } | null, delivery: { queued: number, sent: number, delivered: number, failed: number, skipped: number, resent: number }, failedRecipients: Array<{ id: string, phone: string, error: string }> }> } };

export type EstimateMessageQueryVariables = Exact<{
  body: string;
  audience: string;
  armId?: string | number | null | undefined;
}>;


export type EstimateMessageQuery = { estimateMessage: { recipients: number, units: number, walletBalance: number, senderId: string } };

export type SendMessageMutationVariables = Exact<{
  audience: string;
  body: string;
  title: string;
  armId?: string | number | null | undefined;
  sendSms: boolean;
  showInApp: boolean;
}>;


export type SendMessageMutation = { sendMessage: { id: string, unitsUsed: number } };

export type ChildLedgerQueryVariables = Exact<{
  studentId: string | number;
}>;


export type ChildLedgerQuery = { ledger: { balanceKobo: number, student: { fullName: string, admissionNumber: string, currentArm: { label: string } | null }, payments: Array<{ id: string, amountKobo: number, method: string, status: string, receiptNumber: string, paidAt: string }> } };

export type GiveConsentMutationVariables = Exact<{
  studentIds: Array<string | number> | string | number;
}>;


export type GiveConsentMutation = { giveConsent: { pending: boolean } };

export type WithdrawMyConsentMutationVariables = Exact<{
  studentId: string | number;
  reason: string;
}>;


export type WithdrawMyConsentMutation = { withdrawMyConsent: { pending: boolean } };

export type MyChildrenQueryVariables = Exact<{ [key: string]: never; }>;


export type MyChildrenQuery = { myChildren: Array<{ balanceKobo: number, student: { id: string, fullName: string, firstName: string, admissionNumber: string, currentArm: { label: string } | null }, currentBill: { totalKobo: number, term: { label: string }, lines: Array<{ id: string, description: string, amountKobo: number }> } | null }> };

export type StartCheckoutMutationVariables = Exact<{
  payFor: Array<PayFor> | PayFor;
  callbackUrl: string;
  email?: string | null | undefined;
}>;


export type StartCheckoutMutation = { startCheckout: { reference: string, authorizationUrl: string, totalKobo: number, convenienceFeeKobo: number } };

export type CheckoutStatusQueryVariables = Exact<{
  reference: string;
}>;


export type CheckoutStatusQuery = { checkoutStatus: { reference: string, status: string, amountKobo: number } };

export type BroadsheetQueryVariables = Exact<{
  armId: string | number;
  termId: string | number;
}>;


export type BroadsheetQuery = { broadsheet: { armLabel: string, status: string, classSize: number, classAverage: string | null, isThirdTerm: boolean, showPosition: boolean, subjects: Array<{ id: string, name: string }>, missing: Array<{ subject: string, students: number }>, students: Array<{ total: string, average: string | null, position: number | null, cumulativeAverage: string | null, cumulativePosition: number | null, missingSubjects: Array<string>, student: { id: string, fullName: string, admissionNumber: string }, subjects: Array<{ subjectId: string, total: string | null, grade: string }> }> } };

export type ClassReportInputsQueryVariables = Exact<{
  armId: string | number;
  termId: string | number;
}>;


export type ClassReportInputsQuery = { classReportInputs: { traits: Array<{ id: string, name: string, kind: string }>, ratings: Array<{ studentId: string, traitId: string, rating: number }>, comments: Array<{ studentId: string, classTeacherComment: string, principalComment: string, suggestedClassTeacherComment: string, suggestedPrincipalComment: string }> } };

export type SaveReportCommentsMutationVariables = Exact<{
  armId: string | number;
  termId: string | number;
  comments: Array<CommentInput> | CommentInput;
}>;


export type SaveReportCommentsMutation = { saveReportComments: number };

export type SaveTraitRatingsMutationVariables = Exact<{
  armId: string | number;
  termId: string | number;
  ratings: Array<RatingInput> | RatingInput;
}>;


export type SaveTraitRatingsMutation = { saveTraitRatings: number };

export type ApproveResultsMutationVariables = Exact<{
  armId: string | number;
  termId: string | number;
}>;


export type ApproveResultsMutation = { approveResults: string };

export type UnlockResultsMutationVariables = Exact<{
  armId: string | number;
  termId: string | number;
  reason: string;
}>;


export type UnlockResultsMutation = { unlockResults: string };

export type PublishResultsMutationVariables = Exact<{
  armId: string | number;
  termId: string | number;
  publishAt?: string | null | undefined;
  notify: boolean;
}>;


export type PublishResultsMutation = { publishResults: string };

export type GenerateReportCardsMutationVariables = Exact<{
  armId: string | number;
  termId: string | number;
}>;


export type GenerateReportCardsMutation = { generateReportCards: boolean };

export type ClassResultStatusesQueryVariables = Exact<{
  termId: string | number;
}>;


export type ClassResultStatusesQuery = { classResultStatuses: Array<{ armId: string, armLabel: string, status: string, publishAt: string | null, missingCells: number }> };

export type MyResultArmsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyResultArmsQuery = { myClasses: { classArms: Array<{ id: string, label: string }> } };

export type ScoreSheetQueryVariables = Exact<{
  armId: string | number;
  subjectId: string | number;
  termId: string | number;
}>;


export type ScoreSheetQuery = { scoreSheet: { armLabel: string, locked: boolean, status: string, subject: { id: string, name: string }, components: Array<{ id: string, name: string, maxScore: string }>, students: Array<{ id: string, fullName: string, admissionNumber: string }>, scores: Array<{ studentId: string, componentId: string, value: string | null }> } };

export type SaveScoresMutationVariables = Exact<{
  armId: string | number;
  subjectId: string | number;
  termId: string | number;
  entries: Array<ScoreEntry> | ScoreEntry;
}>;


export type SaveScoresMutation = { saveScores: { saved: number, conflicts: Array<{ studentId: string, componentId: string, serverValue: string | null }> } };

export type ScoreTargetsQueryVariables = Exact<{ [key: string]: never; }>;


export type ScoreTargetsQuery = { myClasses: { subjectAssignments: Array<{ id: string, arm: { id: string, label: string }, subject: { id: string, name: string } }> } };

export type AllClassesAndSubjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllClassesAndSubjectsQuery = { levels: Array<{ id: string, name: string, arms: Array<{ id: string, label: string }>, levelSubjects: Array<{ subject: { id: string, name: string } }> }> };

export type AcademicSetupQueryVariables = Exact<{ [key: string]: never; }>;


export type AcademicSetupQuery = { sessions: Array<{ id: string, name: string, startDate: string, endDate: string, isCurrent: boolean }>, terms: Array<{ id: string, number: number, label: string, startDate: string, endDate: string, daysOpened: number, nextTermBegins: string | null, isCurrent: boolean, session: { id: string } }>, levels: Array<{ id: string, name: string, section: string, order: number, hasSubjectSelection: boolean, reportTemplate: string, gradingScale: { id: string, name: string } | null, nextLevel: { id: string, name: string } | null, arms: Array<{ id: string, name: string, label: string, studentCount: number, classTeacher: { id: string, user: { fullName: string } } | null }>, components: Array<{ id: string, name: string, maxScore: string }>, levelSubjects: Array<{ category: string, subject: { id: string, name: string } }> }>, staff: Array<{ id: string, user: { fullName: string } }>, gradingScales: Array<{ id: string, name: string, bands: Array<{ grade: string, minScore: string, maxScore: string, remark: string }> }>, subjects: Array<{ id: string, name: string }> };

export type SaveSessionMutationVariables = Exact<{
  name: string;
  startDate: string;
  endDate: string;
}>;


export type SaveSessionMutation = { saveSession: { id: string } };

export type SaveTermMutationVariables = Exact<{
  id?: string | number | null | undefined;
  sessionId: string | number;
  number: number;
  startDate: string;
  endDate: string;
  daysOpened: number;
  nextTermBegins?: string | null | undefined;
}>;


export type SaveTermMutation = { saveTerm: { id: string } };

export type SetCurrentTermMutationVariables = Exact<{
  termId: string | number;
}>;


export type SetCurrentTermMutation = { setCurrentTerm: { id: string } };

export type SaveArmMutationVariables = Exact<{
  id?: string | number | null | undefined;
  levelId: string | number;
  name: string;
  classTeacherId?: string | number | null | undefined;
}>;


export type SaveArmMutation = { saveArm: { id: string } };

export type SetComponentsMutationVariables = Exact<{
  levelId: string | number;
  components: Array<ComponentInput> | ComponentInput;
}>;


export type SetComponentsMutation = { setAssessmentComponents: { id: string } };

export type BillingQueryVariables = Exact<{ [key: string]: never; }>;


export type BillingQuery = { billing: { accessMode: string, trialEndsAt: string | null, inTrial: boolean, graceDays: number, activeStudents: number, outstandingKobo: number, smsBalance: number, smsUnitPriceKobo: number, smsMinUnits: number, smsMaxUnits: number, billingEmail: string, plan: { name: string, pricePerStudentKobo: number, minimumKobo: number } | null, invoices: Array<{ id: string, number: string, periodLabel: string, studentCount: number, pricePerStudentKobo: number, amountKobo: number, dueDate: string, status: string, paidAt: string | null, paidVia: string, readOnlyFrom: string, isOverdue: boolean, pdfUrl: string }>, smsPurchases: Array<{ id: string, units: number, amountKobo: number, reason: string, createdAt: string }>, bank: { bankName: string, accountNumber: string, accountName: string } | null } };

export type PayInvoiceMutationVariables = Exact<{
  invoiceId: string | number;
  returnPath: string;
}>;


export type PayInvoiceMutation = { payInvoice: { authorizationUrl: string } };

export type BuySmsUnitsMutationVariables = Exact<{
  units: number;
  returnPath: string;
}>;


export type BuySmsUnitsMutation = { buySmsUnits: { authorizationUrl: string } };

export type ConfirmPlatformPaymentMutationVariables = Exact<{
  reference: string;
}>;


export type ConfirmPlatformPaymentMutation = { confirmPlatformPayment: { reference: string, status: string, purpose: string, units: number, amountKobo: number, invoiceNumber: string | null, smsBalance: number } };

export type SchoolSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SchoolSettingsQuery = { school: { name: string, motto: string, address: string, phone: string, email: string, primaryColor: string, secondaryColor: string } | null, schoolSettings: { showClassPosition: boolean, admissionNumberFormat: string, admissionNumberPrefix: string, resultDebtThresholdKobo: number | null, transactionChargeBearer: string, smsSenderId: string, smsSenderStatus: string, smsLowBalanceUnits: number, notifyParentOnAbsence: boolean, reportTemplate: string, principalTitle: string, feeRemindersEnabled: boolean, feeReminderEveryDays: number, feeReminderMinBalanceKobo: number, feeReminderTemplate: string }, supportGrants: Array<{ id: string, reason: string, expiresAt: string, grantedBy: string }>, schoolBranding: { logoUrl: string | null, signatureUrl: string | null, stampUrl: string | null } };

export type UpdateSchoolSettingsMutationVariables = Exact<{
  name?: string | null | undefined;
  motto?: string | null | undefined;
  address?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  primaryColor?: string | null | undefined;
  settingsJson?: Record<string, unknown> | null | undefined;
}>;


export type UpdateSchoolSettingsMutation = { updateSchoolSettings: { showClassPosition: boolean } };

export type FeeReminderStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type FeeReminderStatusQuery = { feeReminderStatus: { enabled: boolean, nextDueOn: string | null, lastSentAt: string | null, recipients: number, units: number, walletBalance: number, sample: string | null } };

export type GrantSupportMutationVariables = Exact<{
  reason: string;
  hours: number;
}>;


export type GrantSupportMutation = { grantSupportAccess: { id: string } };

export type RevokeSupportMutationVariables = Exact<{
  id: string | number;
}>;


export type RevokeSupportMutation = { revokeSupportAccess: boolean };

export type ConsentOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type ConsentOverviewQuery = { consentOverview: { activeStudents: number, withConsent: number, dpaVersion: string, dpaAcceptedAt: string | null, dpaAcceptedBy: string | null, notice: { version: number, body: string, publishedAt: string }, missing: Array<{ id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null }> } };

export type PublishPrivacyNoticeMutationVariables = Exact<{
  body: string;
}>;


export type PublishPrivacyNoticeMutation = { publishPrivacyNotice: { version: number } };

export type PromotionSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type PromotionSessionsQuery = { sessions: Array<{ id: string, name: string, startDate: string, isCurrent: boolean }>, schoolSettings: { promotionPassMark: number } };

export type PromotionPreviewQueryVariables = Exact<{
  from: string | number;
  to: string | number;
  passMark?: number | null | undefined;
}>;


export type PromotionPreviewQuery = { promotionPreview: Array<{ movesTo: string | null, arm: { id: string, label: string }, rows: Array<{ average: string | null, suggestion: string, student: { id: string, fullName: string, admissionNumber: string } }> }> };

export type PromoteSchoolMutationVariables = Exact<{
  from: string | number;
  to: string | number;
  decisions: Array<PromotionDecision> | PromotionDecision;
  passMark?: number | null | undefined;
}>;


export type PromoteSchoolMutation = { promoteSchool: { promoted: number, repeated: number, graduated: number } };

export type StaffQueryVariables = Exact<{ [key: string]: never; }>;


export type StaffQuery = { staff: Array<{ id: string, title: string, isActive: boolean, user: { id: string, fullName: string, phone: string | null, email: string | null }, roles: Array<{ code: string, name: string }> }>, roles: Array<{ code: string, name: string, isSystem: boolean }>, levels: Array<{ id: string, arms: Array<{ id: string, label: string }>, levelSubjects: Array<{ subject: { id: string, name: string } }> }>, subjectAssignments: Array<{ id: string, arm: { label: string }, subject: { name: string }, teacher: { user: { fullName: string } } }> };

export type AddStaffMutationVariables = Exact<{
  firstName: string;
  lastName: string;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  roleCodes: Array<string> | string;
}>;


export type AddStaffMutation = { addStaff: { id: string } };

export type SetStaffRolesMutationVariables = Exact<{
  id: string | number;
  roleCodes: Array<string> | string;
  isActive: boolean;
}>;


export type SetStaffRolesMutation = { setStaffRoles: { id: string } };

export type AssignSubjectTeacherMutationVariables = Exact<{
  armId: string | number;
  subjectId: string | number;
  teacherId: string | number;
}>;


export type AssignSubjectTeacherMutation = { assignSubjectTeacher: { id: string } };

export type MyStudentQueryVariables = Exact<{ [key: string]: never; }>;


export type MyStudentQuery = { myStudent: { id: string, fullName: string, firstName: string, admissionNumber: string, currentArm: { label: string } | null } | null };

export type StudentProfileQueryVariables = Exact<{
  id: string | number;
  withFees: boolean;
  withSubjects: boolean;
}>;


export type StudentProfileQuery = { student: { id: string, fullName: string, firstName: string, middleName: string, lastName: string, admissionNumber: string, gender: string, dateOfBirth: string | null, admittedOn: string, status: string, examNumbers: Record<string, unknown>, photoUrl: string | null, medicalNotes: string | null, emergencyContactName: string | null, emergencyContactPhone: string | null, currentArm: { id: string, label: string, levelId: string } | null, guardianLinks: Array<{ relationship: string, isPrimary: boolean, guardian: { id: string, title: string, firstName: string, lastName: string, phone: string, email: string } }> }, ledger?: { balanceKobo: number, chargedKobo: number, paidKobo: number }, studentSubjects?: Array<{ id: string, name: string }> };

export type LevelElectivesQueryVariables = Exact<{ [key: string]: never; }>;


export type LevelElectivesQuery = { levels: Array<{ id: string, hasSubjectSelection: boolean, levelSubjects: Array<{ category: string, subject: { id: string, name: string } }> }> };

export type ChangeStudentStatusMutationVariables = Exact<{
  id: string | number;
  status: string;
  reason: string;
}>;


export type ChangeStudentStatusMutation = { changeStudentStatus: { id: string, status: string } };

export type ClassStudentLoginsQueryVariables = Exact<{
  armId?: string | number | null | undefined;
}>;


export type ClassStudentLoginsQuery = { students: { total: number, items: Array<{ id: string, fullName: string, admissionNumber: string, hasLogin: boolean, currentArm: { label: string } | null }> } };

export type CreateStudentLoginsMutationVariables = Exact<{
  armId: string | number;
}>;


export type CreateStudentLoginsMutation = { createStudentLogins: Array<{ password: string, student: { id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null } }> };

export type ResetStudentPasswordMutationVariables = Exact<{
  studentId: string | number;
}>;


export type ResetStudentPasswordMutation = { resetStudentPassword: { password: string, student: { id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null } } };

export type CreateStudentMutationVariables = Exact<{
  data: StudentInput;
  guardians: Array<GuardianInput> | GuardianInput;
}>;


export type CreateStudentMutation = { createStudent: { id: string } };

export type StudentsQueryVariables = Exact<{
  armId?: string | number | null | undefined;
  search?: string | null | undefined;
  status?: string | null | undefined;
  offset: number;
}>;


export type StudentsQuery = { students: { total: number, items: Array<{ id: string, fullName: string, admissionNumber: string, gender: string, status: string, currentArm: { id: string, label: string } | null }> } };

export type ConfirmEmailMutationVariables = Exact<{
  token: string;
}>;


export type ConfirmEmailMutation = { confirmEmail: { email: string, schoolName: string | null, schoolUrl: string | null } };

export type RequestResetMutationVariables = Exact<{
  identifier: string;
}>;


export type RequestResetMutation = { requestPasswordReset: boolean };

export type ResetPasswordMutationVariables = Exact<{
  identifier: string;
  code: string;
  newPassword: string;
}>;


export type ResetPasswordMutation = { resetPassword: boolean };

export type LoginMutationVariables = Exact<{
  identifier: string;
  password: string;
}>;


export type LoginMutation = { login: { permissions: Array<string>, isPlatformAdmin: boolean, mustChangePassword: boolean } };

export type PublicPrivacyNoticeQueryVariables = Exact<{ [key: string]: never; }>;


export type PublicPrivacyNoticeQuery = { privacyNotice: { version: number, body: string, publishedAt: string, schoolName: string } | null };

export type SignUpSchoolMutationVariables = Exact<{
  name: string;
  slug: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  adminEmail?: string | null | undefined;
  password: string;
  sections: Array<string> | string;
  accept: boolean;
}>;


export type SignUpSchoolMutation = { signUpSchool: { slug: string, schoolUrl: string, confirmationSentTo: string | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type SmsWalletStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type SmsWalletStatusQuery = { smsWalletStatus: { balance: number, lowThreshold: number, isLow: boolean } };

export type NoticesQueryVariables = Exact<{ [key: string]: never; }>;


export type NoticesQuery = { notices: Array<{ id: string, title: string, body: string, createdAt: string }> };

export type PayoutAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type PayoutAccountQuery = { payoutAccount: { connected: boolean, bankName: string | null, accountNumber: string | null, accountName: string | null, canChange: boolean } };

export type PayoutBanksQueryVariables = Exact<{ [key: string]: never; }>;


export type PayoutBanksQuery = { payoutBanks: Array<{ code: string, name: string }> };

export type ResolvePayoutAccountMutationVariables = Exact<{
  bankCode: string;
  accountNumber: string;
}>;


export type ResolvePayoutAccountMutation = { resolvePayoutAccount: string };

export type ConnectPayoutAccountMutationVariables = Exact<{
  bankCode: string;
  accountNumber: string;
}>;


export type ConnectPayoutAccountMutation = { connectPayoutAccount: { connected: boolean } };

export type PlatformInvoicesQueryVariables = Exact<{
  status?: string | null | undefined;
}>;


export type PlatformInvoicesQuery = { platformInvoices: Array<{ schoolName: string, schoolSlug: string, invoice: { id: string, number: string, periodLabel: string, studentCount: number, amountKobo: number, dueDate: string, status: string, paidAt: string | null, paidVia: string, paymentReference: string, voidReason: string, isOverdue: boolean, readOnlyFrom: string } }> };

export type GenerateInvoicesMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateInvoicesMutation = { generateInvoices: Array<{ schoolName: string, invoice: { number: string } }> };

export type MarkInvoicePaidMutationVariables = Exact<{
  invoiceId: string | number;
  reference: string;
}>;


export type MarkInvoicePaidMutation = { markInvoicePaid: { id: string, status: string } };

export type VoidInvoiceMutationVariables = Exact<{
  invoiceId: string | number;
  reason: string;
}>;


export type VoidInvoiceMutation = { voidInvoice: { id: string, status: string } };

export type ChildResultQueryVariables = Exact<{
  studentId: string | number;
  termId: string | number;
}>;


export type ChildResultQuery = { childResult: { visible: boolean, reason: string, classSize: number | null, classAverage: string | null, reportCardUrl: string | null, result: { total: string, average: string | null, position: number | null, cumulativeAverage: string | null, cumulativePosition: number | null, student: { fullName: string, currentArm: { label: string } | null }, subjects: Array<{ subjectId: string, subjectName: string, total: string | null, grade: string, remark: string, position: number | null, cumulativeAverage: string | null, cumulativeGrade: string }> } | null } };

export type ChildAttendanceQueryVariables = Exact<{
  studentId: string | number;
  termId: string | number;
}>;


export type ChildAttendanceQuery = { attendanceHistory: Array<{ id: string, date: string, status: string }> };

export type SaveLevelMutationVariables = Exact<{
  id?: string | number | null | undefined;
  name: string;
  section: string;
  gradingScaleId?: string | number | null | undefined;
  nextLevelId?: string | number | null | undefined;
  hasSubjectSelection: boolean;
  reportTemplate: string;
}>;


export type SaveLevelMutation = { saveLevel: { id: string } };

export type SaveSubjectMutationVariables = Exact<{
  name: string;
}>;


export type SaveSubjectMutation = { saveSubject: { id: string, name: string } };

export type SetLevelSubjectsMutationVariables = Exact<{
  levelId: string | number;
  subjects: Array<LevelSubjectInput> | LevelSubjectInput;
}>;


export type SetLevelSubjectsMutation = { setLevelSubjects: { id: string } };

export type SaveGradingScaleMutationVariables = Exact<{
  id?: string | number | null | undefined;
  name: string;
  bands: Array<BandInput> | BandInput;
}>;


export type SaveGradingScaleMutation = { saveGradingScale: { id: string } };

export type StudentConsentQueryVariables = Exact<{
  studentId: string | number;
}>;


export type StudentConsentQuery = { studentConsent: { noticeVersion: number, guardians: Array<{ guardianId: string, guardianName: string, relationship: string, consent: { id: string, source: string, givenAt: string, recordedBy: string | null } | null }>, history: Array<{ id: string, guardianName: string, noticeVersion: string, source: string, givenAt: string, recordedBy: string | null, withdrawnAt: string | null, withdrawalReason: string }> } };

export type RecordPaperConsentMutationVariables = Exact<{
  studentId: string | number;
  guardianId: string | number;
  givenOn: string;
}>;


export type RecordPaperConsentMutation = { recordPaperConsent: boolean };

export type RecordConsentWithdrawalMutationVariables = Exact<{
  consentId: string | number;
  reason: string;
}>;


export type RecordConsentWithdrawalMutation = { recordConsentWithdrawal: boolean };

export type UpdateStudentMutationVariables = Exact<{
  id: string | number;
  data: StudentInput;
}>;


export type UpdateStudentMutation = { updateStudent: { id: string } };

export type AddGuardianMutationVariables = Exact<{
  studentId: string | number;
  guardian: GuardianInput;
}>;


export type AddGuardianMutation = { addGuardian: { id: string } };

export type SetStudentSubjectsMutationVariables = Exact<{
  studentId: string | number;
  subjectIds: Array<string | number> | string | number;
}>;


export type SetStudentSubjectsMutation = { setStudentSubjects: Array<{ id: string }> };

export type ArmsQueryVariables = Exact<{ [key: string]: never; }>;


export type ArmsQuery = { arms: Array<{ id: string, label: string, levelId: string, studentCount: number }> };

export type TermsQueryVariables = Exact<{ [key: string]: never; }>;


export type TermsQuery = { terms: Array<{ id: string, label: string, number: number, isCurrent: boolean, session: { id: string, name: string } }> };

export type StudentSearchQueryVariables = Exact<{
  search: string;
}>;


export type StudentSearchQuery = { students: { items: Array<{ id: string, fullName: string, admissionNumber: string, currentArm: { label: string } | null }> } };

export type MyConsentQueryVariables = Exact<{ [key: string]: never; }>;


export type MyConsentQuery = { myConsent: { pending: boolean, notice: { version: number, body: string, publishedAt: string, schoolName: string }, children: Array<{ consented: boolean, givenAt: string | null, source: string | null, student: { id: string, fullName: string, firstName: string, currentArm: { label: string } | null } }> } };

export type ResendEmailConfirmationMutationVariables = Exact<{
  identifier: string;
}>;


export type ResendEmailConfirmationMutation = { resendEmailConfirmation: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { permissions: Array<string>, roles: Array<string>, accessMode: string, isPlatformAdmin: boolean, viaSupport: boolean, mustChangePassword: boolean, user: { id: string, fullName: string, firstName: string, phone: string | null, email: string | null }, membership: { id: string } | null, billingAlert: { kind: string, date: string, invoice: { number: string, periodLabel: string, amountKobo: number, studentCount: number } | null } | null } | null, school: { name: string, slug: string, motto: string, address: string, phone: string, email: string, primaryColor: string, secondaryColor: string, logoUrl: string | null } | null, currentTerm: { id: string, label: string, number: number, isCurrent: boolean, session: { id: string, name: string } } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ChangePasswordDocument = new TypedDocumentString(`
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}
    `) as unknown as TypedDocumentString<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    query Register($armId: ID!, $date: Date!) {
  register(armId: $armId, date: $date) {
    date
    rows {
      status
      student {
        id
        fullName
        admissionNumber
        currentArm {
          label
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<RegisterQuery, RegisterQueryVariables>;
export const MarkAttendanceDocument = new TypedDocumentString(`
    mutation MarkAttendance($armId: ID!, $date: Date!, $entries: [AttendanceEntry!]!) {
  markAttendance(armId: $armId, date: $date, entries: $entries) {
    saved
    conflicts {
      studentId
      serverStatus
    }
  }
}
    `) as unknown as TypedDocumentString<MarkAttendanceMutation, MarkAttendanceMutationVariables>;
export const AttendanceClassesDocument = new TypedDocumentString(`
    query AttendanceClasses($all: Boolean!) {
  myClasses {
    classArms {
      id
      label
      studentCount
    }
  }
  arms @include(if: $all) {
    id
    label
    studentCount
  }
}
    `) as unknown as TypedDocumentString<AttendanceClassesQuery, AttendanceClassesQueryVariables>;
export const AuditLogDocument = new TypedDocumentString(`
    query AuditLog($prefix: String, $offset: Int!) {
  auditLog(actionPrefix: $prefix, offset: $offset, limit: 50) {
    total
    items {
      id
      action
      summary
      userName
      viaSupport
      createdAt
    }
  }
}
    `) as unknown as TypedDocumentString<AuditLogQuery, AuditLogQueryVariables>;
export const PlatformSchoolsDocument = new TypedDocumentString(`
    query PlatformSchools($search: String, $offset: Int!) {
  platformOverview {
    schools
    activeStudents
    onTrial
    pendingSenders {
      schoolId
      schoolName
      senderId
    }
  }
  platformSchools(search: $search, offset: $offset, limit: 50) {
    total
    items {
      id
      name
      slug
      status
      accessMode
      plan
      studentCount
      trialEndsAt
      lastActivityAt
      createdAt
      smsSenderId
      smsSenderStatus
      usage {
        signIns7d
        activeUsers7d
        smsUnits30d
        collected30dKobo
        onlineShare30d
        unpaidInvoices
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PlatformSchoolsQuery, PlatformSchoolsQueryVariables>;
export const SetSchoolStatusDocument = new TypedDocumentString(`
    mutation SetSchoolStatus($schoolId: ID!, $status: String!, $reason: String!) {
  setSchoolStatus(schoolId: $schoolId, status: $status, reason: $reason) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<SetSchoolStatusMutation, SetSchoolStatusMutationVariables>;
export const SetSenderStatusDocument = new TypedDocumentString(`
    mutation SetSenderStatus($schoolId: ID!, $status: String!) {
  setSenderIdStatus(schoolId: $schoolId, status: $status)
}
    `) as unknown as TypedDocumentString<SetSenderStatusMutation, SetSenderStatusMutationVariables>;
export const CreditSmsDocument = new TypedDocumentString(`
    mutation CreditSms($schoolId: ID!, $units: Int!, $reason: String!) {
  creditSmsUnits(schoolId: $schoolId, units: $units, reason: $reason)
}
    `) as unknown as TypedDocumentString<CreditSmsMutation, CreditSmsMutationVariables>;
export const OwnerDashboardDocument = new TypedDocumentString(`
    query OwnerDashboard {
  ownerDashboard {
    termLabel
    activeStudents
    classesPublished
    classesTotal
    studentsByLevel {
      level
      students
    }
    fees {
      expectedKobo
      collectedKobo
      collectedOnlineKobo
      outstandingKobo
      debtorCount
    }
  }
}
    `) as unknown as TypedDocumentString<OwnerDashboardQuery, OwnerDashboardQueryVariables>;
export const MyClassesDocument = new TypedDocumentString(`
    query MyClasses {
  myClasses {
    classArms {
      id
      label
      studentCount
    }
    subjectAssignments {
      id
      arm {
        id
        label
      }
      subject {
        id
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MyClassesQuery, MyClassesQueryVariables>;
export const BursarSummaryDocument = new TypedDocumentString(`
    query BursarSummary($termId: ID!) {
  termFeeSummary(termId: $termId) {
    expectedKobo
    collectedKobo
    collectedOnlineKobo
    outstandingKobo
    debtorCount
  }
}
    `) as unknown as TypedDocumentString<BursarSummaryQuery, BursarSummaryQueryVariables>;
export const FeesOverviewDocument = new TypedDocumentString(`
    query FeesOverview($termId: ID!, $armId: ID, $offset: Int!) {
  termFeeSummary(termId: $termId) {
    expectedKobo
    collectedKobo
    collectedOnlineKobo
    outstandingKobo
    debtorCount
  }
  debtors(armId: $armId, offset: $offset, limit: 50) {
    total
    totalBalanceKobo
    items {
      balanceKobo
      student {
        id
        fullName
        admissionNumber
        currentArm {
          label
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<FeesOverviewQuery, FeesOverviewQueryVariables>;
export const GenerateBillsDocument = new TypedDocumentString(`
    mutation GenerateBills($termId: ID!) {
  generateBills(termId: $termId)
}
    `) as unknown as TypedDocumentString<GenerateBillsMutation, GenerateBillsMutationVariables>;
export const RemindDebtorsDocument = new TypedDocumentString(`
    mutation RemindDebtors($body: String!) {
  sendMessage(audience: "debtors", body: $body, showInApp: false) {
    id
    unitsUsed
  }
}
    `) as unknown as TypedDocumentString<RemindDebtorsMutation, RemindDebtorsMutationVariables>;
export const RecentPaymentsDocument = new TypedDocumentString(`
    query RecentPayments($method: String, $offset: Int!) {
  payments(method: $method, offset: $offset, limit: 50) {
    total
    items {
      id
      amountKobo
      method
      status
      receiptNumber
      reference
      paidAt
      student {
        id
        fullName
        admissionNumber
      }
      recordedBy {
        fullName
      }
    }
  }
}
    `) as unknown as TypedDocumentString<RecentPaymentsQuery, RecentPaymentsQueryVariables>;
export const RecordPaymentDocument = new TypedDocumentString(`
    mutation RecordPayment($studentId: ID!, $amountKobo: Kobo!, $method: String!, $paidAt: DateTime!, $reference: String!, $note: String!) {
  recordPayment(
    studentId: $studentId
    amountKobo: $amountKobo
    method: $method
    paidAt: $paidAt
    reference: $reference
    note: $note
  ) {
    id
    receiptNumber
  }
}
    `) as unknown as TypedDocumentString<RecordPaymentMutation, RecordPaymentMutationVariables>;
export const StudentBalanceDocument = new TypedDocumentString(`
    query StudentBalance($studentId: ID!) {
  ledger(studentId: $studentId) {
    balanceKobo
  }
}
    `) as unknown as TypedDocumentString<StudentBalanceQuery, StudentBalanceQueryVariables>;
export const FeeSetupDocument = new TypedDocumentString(`
    query FeeSetup($termId: ID!) {
  feeItems {
    id
    name
    order
  }
  levels {
    id
    name
  }
  feeSchedules(termId: $termId) {
    id
    amountKobo
    isCompulsory
    levelId
    item {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<FeeSetupQuery, FeeSetupQueryVariables>;
export const SaveFeeItemDocument = new TypedDocumentString(`
    mutation SaveFeeItem($name: String!, $order: Int!) {
  saveFeeItem(name: $name, order: $order) {
    id
  }
}
    `) as unknown as TypedDocumentString<SaveFeeItemMutation, SaveFeeItemMutationVariables>;
export const SetFeeScheduleDocument = new TypedDocumentString(`
    mutation SetFeeSchedule($termId: ID!, $schedules: [ScheduleInput!]!) {
  setFeeSchedule(termId: $termId, schedules: $schedules) {
    id
  }
}
    `) as unknown as TypedDocumentString<SetFeeScheduleMutation, SetFeeScheduleMutationVariables>;
export const LedgerDocument = new TypedDocumentString(`
    query Ledger($studentId: ID!) {
  ledger(studentId: $studentId) {
    balanceKobo
    chargedKobo
    paidKobo
    openingBalance {
      amountKobo
      asOf
      note
    }
    student {
      id
      fullName
      admissionNumber
      currentArm {
        label
      }
    }
    bills {
      id
      broughtForwardKobo
      totalKobo
      term {
        id
        label
      }
      lines {
        id
        kind
        description
        amountKobo
        isOptional
      }
    }
    payments {
      id
      amountKobo
      method
      status
      receiptNumber
      reference
      paidAt
      reversedReason
    }
    discounts {
      id
      name
      kind
      value
      item {
        name
      }
      term {
        label
      }
    }
  }
  feeItems {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<LedgerQuery, LedgerQueryVariables>;
export const SetOpeningBalanceDocument = new TypedDocumentString(`
    mutation SetOpeningBalance($studentId: ID!, $amountKobo: Int, $asOf: Date, $note: String!) {
  setOpeningBalance(
    studentId: $studentId
    amountKobo: $amountKobo
    asOf: $asOf
    note: $note
  ) {
    amountKobo
  }
}
    `) as unknown as TypedDocumentString<SetOpeningBalanceMutation, SetOpeningBalanceMutationVariables>;
export const AddDiscountDocument = new TypedDocumentString(`
    mutation AddDiscount($studentId: ID!, $name: String!, $kind: String!, $value: Kobo!, $itemId: ID) {
  addDiscount(
    studentId: $studentId
    name: $name
    kind: $kind
    value: $value
    itemId: $itemId
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<AddDiscountMutation, AddDiscountMutationVariables>;
export const AddBillItemDocument = new TypedDocumentString(`
    mutation AddBillItem($billId: ID!, $description: String!, $amountKobo: Kobo!, $itemId: ID, $reason: String!) {
  addBillItem(
    billId: $billId
    description: $description
    amountKobo: $amountKobo
    itemId: $itemId
    reason: $reason
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<AddBillItemMutation, AddBillItemMutationVariables>;
export const RemoveBillItemDocument = new TypedDocumentString(`
    mutation RemoveBillItem($lineId: ID!, $reason: String!) {
  removeBillItem(lineId: $lineId, reason: $reason) {
    id
  }
}
    `) as unknown as TypedDocumentString<RemoveBillItemMutation, RemoveBillItemMutationVariables>;
export const ReversePaymentDocument = new TypedDocumentString(`
    mutation ReversePayment($paymentId: ID!, $reason: String!) {
  reversePayment(paymentId: $paymentId, reason: $reason) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<ReversePaymentMutation, ReversePaymentMutationVariables>;
export const ResendFailedDocument = new TypedDocumentString(`
    mutation ResendFailed($messageId: ID!) {
  resendFailed(messageId: $messageId) {
    id
    unitsUsed
  }
}
    `) as unknown as TypedDocumentString<ResendFailedMutation, ResendFailedMutationVariables>;
export const MessagesDocument = new TypedDocumentString(`
    query Messages($offset: Int!) {
  smsWalletBalance
  messages(offset: $offset, limit: 20) {
    total
    items {
      id
      kind
      audience
      title
      body
      unitsUsed
      createdAt
      sendSms
      isAutomatic
      arm {
        label
      }
      delivery {
        queued
        sent
        delivered
        failed
        skipped
        resent
      }
      failedRecipients {
        id
        phone
        error
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MessagesQuery, MessagesQueryVariables>;
export const EstimateMessageDocument = new TypedDocumentString(`
    query EstimateMessage($body: String!, $audience: String!, $armId: ID) {
  estimateMessage(body: $body, audience: $audience, armId: $armId) {
    recipients
    units
    walletBalance
    senderId
  }
}
    `) as unknown as TypedDocumentString<EstimateMessageQuery, EstimateMessageQueryVariables>;
export const SendMessageDocument = new TypedDocumentString(`
    mutation SendMessage($audience: String!, $body: String!, $title: String!, $armId: ID, $sendSms: Boolean!, $showInApp: Boolean!) {
  sendMessage(
    audience: $audience
    body: $body
    title: $title
    armId: $armId
    sendSms: $sendSms
    showInApp: $showInApp
  ) {
    id
    unitsUsed
  }
}
    `) as unknown as TypedDocumentString<SendMessageMutation, SendMessageMutationVariables>;
export const ChildLedgerDocument = new TypedDocumentString(`
    query ChildLedger($studentId: ID!) {
  ledger(studentId: $studentId) {
    balanceKobo
    student {
      fullName
      admissionNumber
      currentArm {
        label
      }
    }
    payments {
      id
      amountKobo
      method
      status
      receiptNumber
      paidAt
    }
  }
}
    `) as unknown as TypedDocumentString<ChildLedgerQuery, ChildLedgerQueryVariables>;
export const GiveConsentDocument = new TypedDocumentString(`
    mutation GiveConsent($studentIds: [ID!]!) {
  giveConsent(studentIds: $studentIds) {
    pending
  }
}
    `) as unknown as TypedDocumentString<GiveConsentMutation, GiveConsentMutationVariables>;
export const WithdrawMyConsentDocument = new TypedDocumentString(`
    mutation WithdrawMyConsent($studentId: ID!, $reason: String!) {
  withdrawMyConsent(studentId: $studentId, reason: $reason) {
    pending
  }
}
    `) as unknown as TypedDocumentString<WithdrawMyConsentMutation, WithdrawMyConsentMutationVariables>;
export const MyChildrenDocument = new TypedDocumentString(`
    query MyChildren {
  myChildren {
    balanceKobo
    student {
      id
      fullName
      firstName
      admissionNumber
      currentArm {
        label
      }
    }
    currentBill {
      totalKobo
      term {
        label
      }
      lines {
        id
        description
        amountKobo
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MyChildrenQuery, MyChildrenQueryVariables>;
export const StartCheckoutDocument = new TypedDocumentString(`
    mutation StartCheckout($payFor: [PayFor!]!, $callbackUrl: String!, $email: String) {
  startCheckout(payFor: $payFor, callbackUrl: $callbackUrl, email: $email) {
    reference
    authorizationUrl
    totalKobo
    convenienceFeeKobo
  }
}
    `) as unknown as TypedDocumentString<StartCheckoutMutation, StartCheckoutMutationVariables>;
export const CheckoutStatusDocument = new TypedDocumentString(`
    query CheckoutStatus($reference: String!) {
  checkoutStatus(reference: $reference) {
    reference
    status
    amountKobo
  }
}
    `) as unknown as TypedDocumentString<CheckoutStatusQuery, CheckoutStatusQueryVariables>;
export const BroadsheetDocument = new TypedDocumentString(`
    query Broadsheet($armId: ID!, $termId: ID!) {
  broadsheet(armId: $armId, termId: $termId) {
    armLabel
    status
    classSize
    classAverage
    isThirdTerm
    showPosition
    subjects {
      id
      name
    }
    missing {
      subject
      students
    }
    students {
      student {
        id
        fullName
        admissionNumber
      }
      total
      average
      position
      cumulativeAverage
      cumulativePosition
      missingSubjects
      subjects {
        subjectId
        total
        grade
      }
    }
  }
}
    `) as unknown as TypedDocumentString<BroadsheetQuery, BroadsheetQueryVariables>;
export const ClassReportInputsDocument = new TypedDocumentString(`
    query ClassReportInputs($armId: ID!, $termId: ID!) {
  classReportInputs(armId: $armId, termId: $termId) {
    traits {
      id
      name
      kind
    }
    ratings {
      studentId
      traitId
      rating
    }
    comments {
      studentId
      classTeacherComment
      principalComment
      suggestedClassTeacherComment
      suggestedPrincipalComment
    }
  }
}
    `) as unknown as TypedDocumentString<ClassReportInputsQuery, ClassReportInputsQueryVariables>;
export const SaveReportCommentsDocument = new TypedDocumentString(`
    mutation SaveReportComments($armId: ID!, $termId: ID!, $comments: [CommentInput!]!) {
  saveReportComments(armId: $armId, termId: $termId, comments: $comments)
}
    `) as unknown as TypedDocumentString<SaveReportCommentsMutation, SaveReportCommentsMutationVariables>;
export const SaveTraitRatingsDocument = new TypedDocumentString(`
    mutation SaveTraitRatings($armId: ID!, $termId: ID!, $ratings: [RatingInput!]!) {
  saveTraitRatings(armId: $armId, termId: $termId, ratings: $ratings)
}
    `) as unknown as TypedDocumentString<SaveTraitRatingsMutation, SaveTraitRatingsMutationVariables>;
export const ApproveResultsDocument = new TypedDocumentString(`
    mutation ApproveResults($armId: ID!, $termId: ID!) {
  approveResults(armId: $armId, termId: $termId)
}
    `) as unknown as TypedDocumentString<ApproveResultsMutation, ApproveResultsMutationVariables>;
export const UnlockResultsDocument = new TypedDocumentString(`
    mutation UnlockResults($armId: ID!, $termId: ID!, $reason: String!) {
  unlockResults(armId: $armId, termId: $termId, reason: $reason)
}
    `) as unknown as TypedDocumentString<UnlockResultsMutation, UnlockResultsMutationVariables>;
export const PublishResultsDocument = new TypedDocumentString(`
    mutation PublishResults($armId: ID!, $termId: ID!, $publishAt: DateTime, $notify: Boolean!) {
  publishResults(
    armId: $armId
    termId: $termId
    publishAt: $publishAt
    notifyParents: $notify
  )
}
    `) as unknown as TypedDocumentString<PublishResultsMutation, PublishResultsMutationVariables>;
export const GenerateReportCardsDocument = new TypedDocumentString(`
    mutation GenerateReportCards($armId: ID!, $termId: ID!) {
  generateReportCards(armId: $armId, termId: $termId)
}
    `) as unknown as TypedDocumentString<GenerateReportCardsMutation, GenerateReportCardsMutationVariables>;
export const ClassResultStatusesDocument = new TypedDocumentString(`
    query ClassResultStatuses($termId: ID!) {
  classResultStatuses(termId: $termId) {
    armId
    armLabel
    status
    publishAt
    missingCells
  }
}
    `) as unknown as TypedDocumentString<ClassResultStatusesQuery, ClassResultStatusesQueryVariables>;
export const MyResultArmsDocument = new TypedDocumentString(`
    query MyResultArms {
  myClasses {
    classArms {
      id
      label
    }
  }
}
    `) as unknown as TypedDocumentString<MyResultArmsQuery, MyResultArmsQueryVariables>;
export const ScoreSheetDocument = new TypedDocumentString(`
    query ScoreSheet($armId: ID!, $subjectId: ID!, $termId: ID!) {
  scoreSheet(armId: $armId, subjectId: $subjectId, termId: $termId) {
    armLabel
    locked
    status
    subject {
      id
      name
    }
    components {
      id
      name
      maxScore
    }
    students {
      id
      fullName
      admissionNumber
    }
    scores {
      studentId
      componentId
      value
    }
  }
}
    `) as unknown as TypedDocumentString<ScoreSheetQuery, ScoreSheetQueryVariables>;
export const SaveScoresDocument = new TypedDocumentString(`
    mutation SaveScores($armId: ID!, $subjectId: ID!, $termId: ID!, $entries: [ScoreEntry!]!) {
  saveScores(
    armId: $armId
    subjectId: $subjectId
    termId: $termId
    entries: $entries
  ) {
    saved
    conflicts {
      studentId
      componentId
      serverValue
    }
  }
}
    `) as unknown as TypedDocumentString<SaveScoresMutation, SaveScoresMutationVariables>;
export const ScoreTargetsDocument = new TypedDocumentString(`
    query ScoreTargets {
  myClasses {
    subjectAssignments {
      id
      arm {
        id
        label
      }
      subject {
        id
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ScoreTargetsQuery, ScoreTargetsQueryVariables>;
export const AllClassesAndSubjectsDocument = new TypedDocumentString(`
    query AllClassesAndSubjects {
  levels {
    id
    name
    arms {
      id
      label
    }
    levelSubjects {
      subject {
        id
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AllClassesAndSubjectsQuery, AllClassesAndSubjectsQueryVariables>;
export const AcademicSetupDocument = new TypedDocumentString(`
    query AcademicSetup {
  sessions {
    id
    name
    startDate
    endDate
    isCurrent
  }
  terms {
    id
    number
    label
    startDate
    endDate
    daysOpened
    nextTermBegins
    isCurrent
    session {
      id
    }
  }
  levels {
    id
    name
    section
    order
    hasSubjectSelection
    reportTemplate
    gradingScale {
      id
      name
    }
    nextLevel {
      id
      name
    }
    arms {
      id
      name
      label
      studentCount
      classTeacher {
        id
        user {
          fullName
        }
      }
    }
    components {
      id
      name
      maxScore
    }
    levelSubjects {
      category
      subject {
        id
        name
      }
    }
  }
  staff {
    id
    user {
      fullName
    }
  }
  gradingScales {
    id
    name
    bands {
      grade
      minScore
      maxScore
      remark
    }
  }
  subjects {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<AcademicSetupQuery, AcademicSetupQueryVariables>;
export const SaveSessionDocument = new TypedDocumentString(`
    mutation SaveSession($name: String!, $startDate: Date!, $endDate: Date!) {
  saveSession(name: $name, startDate: $startDate, endDate: $endDate) {
    id
  }
}
    `) as unknown as TypedDocumentString<SaveSessionMutation, SaveSessionMutationVariables>;
export const SaveTermDocument = new TypedDocumentString(`
    mutation SaveTerm($id: ID, $sessionId: ID!, $number: Int!, $startDate: Date!, $endDate: Date!, $daysOpened: Int!, $nextTermBegins: Date) {
  saveTerm(
    id: $id
    sessionId: $sessionId
    number: $number
    startDate: $startDate
    endDate: $endDate
    daysOpened: $daysOpened
    nextTermBegins: $nextTermBegins
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<SaveTermMutation, SaveTermMutationVariables>;
export const SetCurrentTermDocument = new TypedDocumentString(`
    mutation SetCurrentTerm($termId: ID!) {
  setCurrentTerm(termId: $termId) {
    id
  }
}
    `) as unknown as TypedDocumentString<SetCurrentTermMutation, SetCurrentTermMutationVariables>;
export const SaveArmDocument = new TypedDocumentString(`
    mutation SaveArm($id: ID, $levelId: ID!, $name: String!, $classTeacherId: ID) {
  saveArm(
    id: $id
    levelId: $levelId
    name: $name
    classTeacherId: $classTeacherId
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<SaveArmMutation, SaveArmMutationVariables>;
export const SetComponentsDocument = new TypedDocumentString(`
    mutation SetComponents($levelId: ID!, $components: [ComponentInput!]!) {
  setAssessmentComponents(levelId: $levelId, components: $components) {
    id
  }
}
    `) as unknown as TypedDocumentString<SetComponentsMutation, SetComponentsMutationVariables>;
export const BillingDocument = new TypedDocumentString(`
    query Billing {
  billing {
    plan {
      name
      pricePerStudentKobo
      minimumKobo
    }
    accessMode
    trialEndsAt
    inTrial
    graceDays
    activeStudents
    outstandingKobo
    invoices {
      id
      number
      periodLabel
      studentCount
      pricePerStudentKobo
      amountKobo
      dueDate
      status
      paidAt
      paidVia
      readOnlyFrom
      isOverdue
      pdfUrl
    }
    smsBalance
    smsUnitPriceKobo
    smsMinUnits
    smsMaxUnits
    smsPurchases {
      id
      units
      amountKobo
      reason
      createdAt
    }
    bank {
      bankName
      accountNumber
      accountName
    }
    billingEmail
  }
}
    `) as unknown as TypedDocumentString<BillingQuery, BillingQueryVariables>;
export const PayInvoiceDocument = new TypedDocumentString(`
    mutation PayInvoice($invoiceId: ID!, $returnPath: String!) {
  payInvoice(invoiceId: $invoiceId, returnPath: $returnPath) {
    authorizationUrl
  }
}
    `) as unknown as TypedDocumentString<PayInvoiceMutation, PayInvoiceMutationVariables>;
export const BuySmsUnitsDocument = new TypedDocumentString(`
    mutation BuySmsUnits($units: Int!, $returnPath: String!) {
  buySmsUnits(units: $units, returnPath: $returnPath) {
    authorizationUrl
  }
}
    `) as unknown as TypedDocumentString<BuySmsUnitsMutation, BuySmsUnitsMutationVariables>;
export const ConfirmPlatformPaymentDocument = new TypedDocumentString(`
    mutation ConfirmPlatformPayment($reference: String!) {
  confirmPlatformPayment(reference: $reference) {
    reference
    status
    purpose
    units
    amountKobo
    invoiceNumber
    smsBalance
  }
}
    `) as unknown as TypedDocumentString<ConfirmPlatformPaymentMutation, ConfirmPlatformPaymentMutationVariables>;
export const SchoolSettingsDocument = new TypedDocumentString(`
    query SchoolSettings {
  school {
    name
    motto
    address
    phone
    email
    primaryColor
    secondaryColor
  }
  schoolSettings {
    showClassPosition
    admissionNumberFormat
    admissionNumberPrefix
    resultDebtThresholdKobo
    transactionChargeBearer
    smsSenderId
    smsSenderStatus
    smsLowBalanceUnits
    notifyParentOnAbsence
    reportTemplate
    principalTitle
    feeRemindersEnabled
    feeReminderEveryDays
    feeReminderMinBalanceKobo
    feeReminderTemplate
  }
  supportGrants {
    id
    reason
    expiresAt
    grantedBy
  }
  schoolBranding {
    logoUrl
    signatureUrl
    stampUrl
  }
}
    `) as unknown as TypedDocumentString<SchoolSettingsQuery, SchoolSettingsQueryVariables>;
export const UpdateSchoolSettingsDocument = new TypedDocumentString(`
    mutation UpdateSchoolSettings($name: String, $motto: String, $address: String, $phone: String, $email: String, $primaryColor: String, $settingsJson: JSON) {
  updateSchoolSettings(
    name: $name
    motto: $motto
    address: $address
    phone: $phone
    email: $email
    primaryColor: $primaryColor
    settingsJson: $settingsJson
  ) {
    showClassPosition
  }
}
    `) as unknown as TypedDocumentString<UpdateSchoolSettingsMutation, UpdateSchoolSettingsMutationVariables>;
export const FeeReminderStatusDocument = new TypedDocumentString(`
    query FeeReminderStatus {
  feeReminderStatus {
    enabled
    nextDueOn
    lastSentAt
    recipients
    units
    walletBalance
    sample
  }
}
    `) as unknown as TypedDocumentString<FeeReminderStatusQuery, FeeReminderStatusQueryVariables>;
export const GrantSupportDocument = new TypedDocumentString(`
    mutation GrantSupport($reason: String!, $hours: Int!) {
  grantSupportAccess(reason: $reason, hours: $hours) {
    id
  }
}
    `) as unknown as TypedDocumentString<GrantSupportMutation, GrantSupportMutationVariables>;
export const RevokeSupportDocument = new TypedDocumentString(`
    mutation RevokeSupport($id: ID!) {
  revokeSupportAccess(grantId: $id)
}
    `) as unknown as TypedDocumentString<RevokeSupportMutation, RevokeSupportMutationVariables>;
export const ConsentOverviewDocument = new TypedDocumentString(`
    query ConsentOverview {
  consentOverview(limit: 50) {
    notice {
      version
      body
      publishedAt
    }
    activeStudents
    withConsent
    dpaVersion
    dpaAcceptedAt
    dpaAcceptedBy
    missing {
      id
      fullName
      admissionNumber
      currentArm {
        label
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ConsentOverviewQuery, ConsentOverviewQueryVariables>;
export const PublishPrivacyNoticeDocument = new TypedDocumentString(`
    mutation PublishPrivacyNotice($body: String!) {
  publishPrivacyNotice(body: $body) {
    version
  }
}
    `) as unknown as TypedDocumentString<PublishPrivacyNoticeMutation, PublishPrivacyNoticeMutationVariables>;
export const PromotionSessionsDocument = new TypedDocumentString(`
    query PromotionSessions {
  sessions {
    id
    name
    startDate
    isCurrent
  }
  schoolSettings {
    promotionPassMark
  }
}
    `) as unknown as TypedDocumentString<PromotionSessionsQuery, PromotionSessionsQueryVariables>;
export const PromotionPreviewDocument = new TypedDocumentString(`
    query PromotionPreview($from: ID!, $to: ID!, $passMark: Float) {
  promotionPreview(fromSessionId: $from, toSessionId: $to, passMark: $passMark) {
    arm {
      id
      label
    }
    movesTo
    rows {
      student {
        id
        fullName
        admissionNumber
      }
      average
      suggestion
    }
  }
}
    `) as unknown as TypedDocumentString<PromotionPreviewQuery, PromotionPreviewQueryVariables>;
export const PromoteSchoolDocument = new TypedDocumentString(`
    mutation PromoteSchool($from: ID!, $to: ID!, $decisions: [PromotionDecision!]!, $passMark: Float) {
  promoteSchool(
    fromSessionId: $from
    toSessionId: $to
    decisions: $decisions
    passMark: $passMark
  ) {
    promoted
    repeated
    graduated
  }
}
    `) as unknown as TypedDocumentString<PromoteSchoolMutation, PromoteSchoolMutationVariables>;
export const StaffDocument = new TypedDocumentString(`
    query Staff {
  staff {
    id
    title
    isActive
    user {
      id
      fullName
      phone
      email
    }
    roles {
      code
      name
    }
  }
  roles {
    code
    name
    isSystem
  }
  levels {
    id
    arms {
      id
      label
    }
    levelSubjects {
      subject {
        id
        name
      }
    }
  }
  subjectAssignments {
    id
    arm {
      label
    }
    subject {
      name
    }
    teacher {
      user {
        fullName
      }
    }
  }
}
    `) as unknown as TypedDocumentString<StaffQuery, StaffQueryVariables>;
export const AddStaffDocument = new TypedDocumentString(`
    mutation AddStaff($firstName: String!, $lastName: String!, $phone: String, $email: String, $roleCodes: [String!]!) {
  addStaff(
    firstName: $firstName
    lastName: $lastName
    phone: $phone
    email: $email
    roleCodes: $roleCodes
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<AddStaffMutation, AddStaffMutationVariables>;
export const SetStaffRolesDocument = new TypedDocumentString(`
    mutation SetStaffRoles($id: ID!, $roleCodes: [String!]!, $isActive: Boolean!) {
  setStaffRoles(membershipId: $id, roleCodes: $roleCodes, isActive: $isActive) {
    id
  }
}
    `) as unknown as TypedDocumentString<SetStaffRolesMutation, SetStaffRolesMutationVariables>;
export const AssignSubjectTeacherDocument = new TypedDocumentString(`
    mutation AssignSubjectTeacher($armId: ID!, $subjectId: ID!, $teacherId: ID!) {
  assignSubjectTeacher(
    armId: $armId
    subjectId: $subjectId
    teacherId: $teacherId
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<AssignSubjectTeacherMutation, AssignSubjectTeacherMutationVariables>;
export const MyStudentDocument = new TypedDocumentString(`
    query MyStudent {
  myStudent {
    id
    fullName
    firstName
    admissionNumber
    currentArm {
      label
    }
  }
}
    `) as unknown as TypedDocumentString<MyStudentQuery, MyStudentQueryVariables>;
export const StudentProfileDocument = new TypedDocumentString(`
    query StudentProfile($id: ID!, $withFees: Boolean!, $withSubjects: Boolean!) {
  student(id: $id) {
    id
    fullName
    firstName
    middleName
    lastName
    admissionNumber
    gender
    dateOfBirth
    admittedOn
    status
    examNumbers
    photoUrl
    medicalNotes
    emergencyContactName
    emergencyContactPhone
    currentArm {
      id
      label
      levelId
    }
    guardianLinks {
      relationship
      isPrimary
      guardian {
        id
        title
        firstName
        lastName
        phone
        email
      }
    }
  }
  ledger(studentId: $id) @include(if: $withFees) {
    balanceKobo
    chargedKobo
    paidKobo
  }
  studentSubjects(studentId: $id) @include(if: $withSubjects) {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<StudentProfileQuery, StudentProfileQueryVariables>;
export const LevelElectivesDocument = new TypedDocumentString(`
    query LevelElectives {
  levels {
    id
    hasSubjectSelection
    levelSubjects {
      category
      subject {
        id
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LevelElectivesQuery, LevelElectivesQueryVariables>;
export const ChangeStudentStatusDocument = new TypedDocumentString(`
    mutation ChangeStudentStatus($id: ID!, $status: String!, $reason: String!) {
  changeStudentStatus(id: $id, status: $status, reason: $reason) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<ChangeStudentStatusMutation, ChangeStudentStatusMutationVariables>;
export const ClassStudentLoginsDocument = new TypedDocumentString(`
    query ClassStudentLogins($armId: ID) {
  students(armId: $armId, status: "active", limit: 200) {
    total
    items {
      id
      fullName
      admissionNumber
      hasLogin
      currentArm {
        label
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ClassStudentLoginsQuery, ClassStudentLoginsQueryVariables>;
export const CreateStudentLoginsDocument = new TypedDocumentString(`
    mutation CreateStudentLogins($armId: ID!) {
  createStudentLogins(armId: $armId) {
    password
    student {
      id
      fullName
      admissionNumber
      currentArm {
        label
      }
    }
  }
}
    `) as unknown as TypedDocumentString<CreateStudentLoginsMutation, CreateStudentLoginsMutationVariables>;
export const ResetStudentPasswordDocument = new TypedDocumentString(`
    mutation ResetStudentPassword($studentId: ID!) {
  resetStudentPassword(studentId: $studentId) {
    password
    student {
      id
      fullName
      admissionNumber
      currentArm {
        label
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ResetStudentPasswordMutation, ResetStudentPasswordMutationVariables>;
export const CreateStudentDocument = new TypedDocumentString(`
    mutation CreateStudent($data: StudentInput!, $guardians: [GuardianInput!]!) {
  createStudent(data: $data, guardians: $guardians) {
    id
  }
}
    `) as unknown as TypedDocumentString<CreateStudentMutation, CreateStudentMutationVariables>;
export const StudentsDocument = new TypedDocumentString(`
    query Students($armId: ID, $search: String, $status: String, $offset: Int!) {
  students(
    armId: $armId
    search: $search
    status: $status
    offset: $offset
    limit: 50
  ) {
    total
    items {
      id
      fullName
      admissionNumber
      gender
      status
      currentArm {
        id
        label
      }
    }
  }
}
    `) as unknown as TypedDocumentString<StudentsQuery, StudentsQueryVariables>;
export const ConfirmEmailDocument = new TypedDocumentString(`
    mutation ConfirmEmail($token: String!) {
  confirmEmail(token: $token) {
    email
    schoolName
    schoolUrl
  }
}
    `) as unknown as TypedDocumentString<ConfirmEmailMutation, ConfirmEmailMutationVariables>;
export const RequestResetDocument = new TypedDocumentString(`
    mutation RequestReset($identifier: String!) {
  requestPasswordReset(identifier: $identifier)
}
    `) as unknown as TypedDocumentString<RequestResetMutation, RequestResetMutationVariables>;
export const ResetPasswordDocument = new TypedDocumentString(`
    mutation ResetPassword($identifier: String!, $code: String!, $newPassword: String!) {
  resetPassword(identifier: $identifier, code: $code, newPassword: $newPassword)
}
    `) as unknown as TypedDocumentString<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($identifier: String!, $password: String!) {
  login(identifier: $identifier, password: $password) {
    permissions
    isPlatformAdmin
    mustChangePassword
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const PublicPrivacyNoticeDocument = new TypedDocumentString(`
    query PublicPrivacyNotice {
  privacyNotice {
    version
    body
    publishedAt
    schoolName
  }
}
    `) as unknown as TypedDocumentString<PublicPrivacyNoticeQuery, PublicPrivacyNoticeQueryVariables>;
export const SignUpSchoolDocument = new TypedDocumentString(`
    mutation SignUpSchool($name: String!, $slug: String!, $adminFirstName: String!, $adminLastName: String!, $adminPhone: String!, $adminEmail: String, $password: String!, $sections: [String!]!, $accept: Boolean!) {
  signUpSchool(
    name: $name
    slug: $slug
    adminFirstName: $adminFirstName
    adminLastName: $adminLastName
    adminPhone: $adminPhone
    adminEmail: $adminEmail
    password: $password
    sections: $sections
    acceptDataProcessingAgreement: $accept
  ) {
    slug
    schoolUrl
    confirmationSentTo
  }
}
    `) as unknown as TypedDocumentString<SignUpSchoolMutation, SignUpSchoolMutationVariables>;
export const LogoutDocument = new TypedDocumentString(`
    mutation Logout {
  logout
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const SmsWalletStatusDocument = new TypedDocumentString(`
    query SmsWalletStatus {
  smsWalletStatus {
    balance
    lowThreshold
    isLow
  }
}
    `) as unknown as TypedDocumentString<SmsWalletStatusQuery, SmsWalletStatusQueryVariables>;
export const NoticesDocument = new TypedDocumentString(`
    query Notices {
  notices(limit: 5) {
    id
    title
    body
    createdAt
  }
}
    `) as unknown as TypedDocumentString<NoticesQuery, NoticesQueryVariables>;
export const PayoutAccountDocument = new TypedDocumentString(`
    query PayoutAccount {
  payoutAccount {
    connected
    bankName
    accountNumber
    accountName
    canChange
  }
}
    `) as unknown as TypedDocumentString<PayoutAccountQuery, PayoutAccountQueryVariables>;
export const PayoutBanksDocument = new TypedDocumentString(`
    query PayoutBanks {
  payoutBanks {
    code
    name
  }
}
    `) as unknown as TypedDocumentString<PayoutBanksQuery, PayoutBanksQueryVariables>;
export const ResolvePayoutAccountDocument = new TypedDocumentString(`
    mutation ResolvePayoutAccount($bankCode: String!, $accountNumber: String!) {
  resolvePayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber)
}
    `) as unknown as TypedDocumentString<ResolvePayoutAccountMutation, ResolvePayoutAccountMutationVariables>;
export const ConnectPayoutAccountDocument = new TypedDocumentString(`
    mutation ConnectPayoutAccount($bankCode: String!, $accountNumber: String!) {
  connectPayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) {
    connected
  }
}
    `) as unknown as TypedDocumentString<ConnectPayoutAccountMutation, ConnectPayoutAccountMutationVariables>;
export const PlatformInvoicesDocument = new TypedDocumentString(`
    query PlatformInvoices($status: String) {
  platformInvoices(status: $status) {
    schoolName
    schoolSlug
    invoice {
      id
      number
      periodLabel
      studentCount
      amountKobo
      dueDate
      status
      paidAt
      paidVia
      paymentReference
      voidReason
      isOverdue
      readOnlyFrom
    }
  }
}
    `) as unknown as TypedDocumentString<PlatformInvoicesQuery, PlatformInvoicesQueryVariables>;
export const GenerateInvoicesDocument = new TypedDocumentString(`
    mutation GenerateInvoices {
  generateInvoices {
    schoolName
    invoice {
      number
    }
  }
}
    `) as unknown as TypedDocumentString<GenerateInvoicesMutation, GenerateInvoicesMutationVariables>;
export const MarkInvoicePaidDocument = new TypedDocumentString(`
    mutation MarkInvoicePaid($invoiceId: ID!, $reference: String!) {
  markInvoicePaid(invoiceId: $invoiceId, reference: $reference) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<MarkInvoicePaidMutation, MarkInvoicePaidMutationVariables>;
export const VoidInvoiceDocument = new TypedDocumentString(`
    mutation VoidInvoice($invoiceId: ID!, $reason: String!) {
  voidInvoice(invoiceId: $invoiceId, reason: $reason) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<VoidInvoiceMutation, VoidInvoiceMutationVariables>;
export const ChildResultDocument = new TypedDocumentString(`
    query ChildResult($studentId: ID!, $termId: ID!) {
  childResult(studentId: $studentId, termId: $termId) {
    visible
    reason
    classSize
    classAverage
    reportCardUrl
    result {
      total
      average
      position
      cumulativeAverage
      cumulativePosition
      student {
        fullName
        currentArm {
          label
        }
      }
      subjects {
        subjectId
        subjectName
        total
        grade
        remark
        position
        cumulativeAverage
        cumulativeGrade
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ChildResultQuery, ChildResultQueryVariables>;
export const ChildAttendanceDocument = new TypedDocumentString(`
    query ChildAttendance($studentId: ID!, $termId: ID!) {
  attendanceHistory(studentId: $studentId, termId: $termId) {
    id
    date
    status
  }
}
    `) as unknown as TypedDocumentString<ChildAttendanceQuery, ChildAttendanceQueryVariables>;
export const SaveLevelDocument = new TypedDocumentString(`
    mutation SaveLevel($id: ID, $name: String!, $section: String!, $gradingScaleId: ID, $nextLevelId: ID, $hasSubjectSelection: Boolean!, $reportTemplate: String!) {
  saveLevel(
    id: $id
    name: $name
    section: $section
    gradingScaleId: $gradingScaleId
    nextLevelId: $nextLevelId
    hasSubjectSelection: $hasSubjectSelection
    reportTemplate: $reportTemplate
  ) {
    id
  }
}
    `) as unknown as TypedDocumentString<SaveLevelMutation, SaveLevelMutationVariables>;
export const SaveSubjectDocument = new TypedDocumentString(`
    mutation SaveSubject($name: String!) {
  saveSubject(name: $name) {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<SaveSubjectMutation, SaveSubjectMutationVariables>;
export const SetLevelSubjectsDocument = new TypedDocumentString(`
    mutation SetLevelSubjects($levelId: ID!, $subjects: [LevelSubjectInput!]!) {
  setLevelSubjects(levelId: $levelId, subjects: $subjects) {
    id
  }
}
    `) as unknown as TypedDocumentString<SetLevelSubjectsMutation, SetLevelSubjectsMutationVariables>;
export const SaveGradingScaleDocument = new TypedDocumentString(`
    mutation SaveGradingScale($id: ID, $name: String!, $bands: [BandInput!]!) {
  saveGradingScale(id: $id, name: $name, bands: $bands) {
    id
  }
}
    `) as unknown as TypedDocumentString<SaveGradingScaleMutation, SaveGradingScaleMutationVariables>;
export const StudentConsentDocument = new TypedDocumentString(`
    query StudentConsent($studentId: ID!) {
  studentConsent(studentId: $studentId) {
    noticeVersion
    guardians {
      guardianId
      guardianName
      relationship
      consent {
        id
        source
        givenAt
        recordedBy
      }
    }
    history {
      id
      guardianName
      noticeVersion
      source
      givenAt
      recordedBy
      withdrawnAt
      withdrawalReason
    }
  }
}
    `) as unknown as TypedDocumentString<StudentConsentQuery, StudentConsentQueryVariables>;
export const RecordPaperConsentDocument = new TypedDocumentString(`
    mutation RecordPaperConsent($studentId: ID!, $guardianId: ID!, $givenOn: Date!) {
  recordPaperConsent(
    studentId: $studentId
    guardianId: $guardianId
    givenOn: $givenOn
  )
}
    `) as unknown as TypedDocumentString<RecordPaperConsentMutation, RecordPaperConsentMutationVariables>;
export const RecordConsentWithdrawalDocument = new TypedDocumentString(`
    mutation RecordConsentWithdrawal($consentId: ID!, $reason: String!) {
  recordConsentWithdrawal(consentId: $consentId, reason: $reason)
}
    `) as unknown as TypedDocumentString<RecordConsentWithdrawalMutation, RecordConsentWithdrawalMutationVariables>;
export const UpdateStudentDocument = new TypedDocumentString(`
    mutation UpdateStudent($id: ID!, $data: StudentInput!) {
  updateStudent(id: $id, data: $data) {
    id
  }
}
    `) as unknown as TypedDocumentString<UpdateStudentMutation, UpdateStudentMutationVariables>;
export const AddGuardianDocument = new TypedDocumentString(`
    mutation AddGuardian($studentId: ID!, $guardian: GuardianInput!) {
  addGuardian(studentId: $studentId, guardian: $guardian) {
    id
  }
}
    `) as unknown as TypedDocumentString<AddGuardianMutation, AddGuardianMutationVariables>;
export const SetStudentSubjectsDocument = new TypedDocumentString(`
    mutation SetStudentSubjects($studentId: ID!, $subjectIds: [ID!]!) {
  setStudentSubjects(studentId: $studentId, subjectIds: $subjectIds) {
    id
  }
}
    `) as unknown as TypedDocumentString<SetStudentSubjectsMutation, SetStudentSubjectsMutationVariables>;
export const ArmsDocument = new TypedDocumentString(`
    query Arms {
  arms {
    id
    label
    levelId
    studentCount
  }
}
    `) as unknown as TypedDocumentString<ArmsQuery, ArmsQueryVariables>;
export const TermsDocument = new TypedDocumentString(`
    query Terms {
  terms {
    id
    label
    number
    isCurrent
    session {
      id
      name
    }
  }
}
    `) as unknown as TypedDocumentString<TermsQuery, TermsQueryVariables>;
export const StudentSearchDocument = new TypedDocumentString(`
    query StudentSearch($search: String!) {
  students(search: $search, limit: 8) {
    items {
      id
      fullName
      admissionNumber
      currentArm {
        label
      }
    }
  }
}
    `) as unknown as TypedDocumentString<StudentSearchQuery, StudentSearchQueryVariables>;
export const MyConsentDocument = new TypedDocumentString(`
    query MyConsent {
  myConsent {
    pending
    notice {
      version
      body
      publishedAt
      schoolName
    }
    children {
      consented
      givenAt
      source
      student {
        id
        fullName
        firstName
        currentArm {
          label
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MyConsentQuery, MyConsentQueryVariables>;
export const ResendEmailConfirmationDocument = new TypedDocumentString(`
    mutation ResendEmailConfirmation($identifier: String!) {
  resendEmailConfirmation(identifier: $identifier)
}
    `) as unknown as TypedDocumentString<ResendEmailConfirmationMutation, ResendEmailConfirmationMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    permissions
    roles
    accessMode
    isPlatformAdmin
    viaSupport
    mustChangePassword
    user {
      id
      fullName
      firstName
      phone
      email
    }
    membership {
      id
    }
    billingAlert {
      kind
      date
      invoice {
        number
        periodLabel
        amountKobo
        studentCount
      }
    }
  }
  school {
    name
    slug
    motto
    address
    phone
    email
    primaryColor
    secondaryColor
    logoUrl
  }
  currentTerm {
    id
    label
    number
    isCurrent
    session {
      id
      name
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;