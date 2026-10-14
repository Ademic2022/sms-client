/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {\n    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)\n  }\n": typeof types.ChangePasswordDocument,
    "\n  query Register($armId: ID!, $date: Date!) {\n    register(armId: $armId, date: $date) {\n      date\n      rows { status student { id fullName admissionNumber currentArm { label } } }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation MarkAttendance($armId: ID!, $date: Date!, $entries: [AttendanceEntry!]!) {\n    markAttendance(armId: $armId, date: $date, entries: $entries) {\n      saved\n      conflicts { studentId serverStatus }\n    }\n  }\n": typeof types.MarkAttendanceDocument,
    "\n  query AttendanceClasses($all: Boolean!) {\n    myClasses { classArms { id label studentCount } }\n    arms @include(if: $all) { id label studentCount }\n  }\n": typeof types.AttendanceClassesDocument,
    "\n  query AuditLog($prefix: String, $offset: Int!) {\n    auditLog(actionPrefix: $prefix, offset: $offset, limit: 50) { total items { id action summary userName viaSupport createdAt } }\n  }\n": typeof types.AuditLogDocument,
    "\n  query PlatformSchools($search: String, $offset: Int!) {\n    platformOverview { schools activeStudents onTrial pendingSenders { schoolId schoolName senderId } }\n    platformSchools(search: $search, offset: $offset, limit: 50) {\n      total\n      items {\n        id name slug status accessMode plan studentCount trialEndsAt lastActivityAt createdAt smsSenderId smsSenderStatus\n        usage { signIns7d activeUsers7d smsUnits30d collected30dKobo onlineShare30d unpaidInvoices }\n      }\n    }\n  }\n": typeof types.PlatformSchoolsDocument,
    "\n  mutation SetSchoolStatus($schoolId: ID!, $status: String!, $reason: String!) { setSchoolStatus(schoolId: $schoolId, status: $status, reason: $reason) { id status } }\n": typeof types.SetSchoolStatusDocument,
    "mutation SetSenderStatus($schoolId: ID!, $status: String!) { setSenderIdStatus(schoolId: $schoolId, status: $status) }": typeof types.SetSenderStatusDocument,
    "\n  mutation CreditSms($schoolId: ID!, $units: Int!, $reason: String!) { creditSmsUnits(schoolId: $schoolId, units: $units, reason: $reason) }\n": typeof types.CreditSmsDocument,
    "\n  query OwnerDashboard {\n    ownerDashboard {\n      termLabel\n      activeStudents\n      classesPublished\n      classesTotal\n      studentsByLevel { level students }\n      fees { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n    }\n  }\n": typeof types.OwnerDashboardDocument,
    "\n  query MyClasses {\n    myClasses {\n      classArms { id label studentCount }\n      subjectAssignments { id arm { id label } subject { id name } }\n    }\n  }\n": typeof types.MyClassesDocument,
    "\n  query BursarSummary($termId: ID!) {\n    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n  }\n": typeof types.BursarSummaryDocument,
    "\n  query FeesOverview($termId: ID!, $armId: ID, $offset: Int!) {\n    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n    debtors(armId: $armId, offset: $offset, limit: 50) { total totalBalanceKobo items { balanceKobo student { id fullName admissionNumber currentArm { label } } } }\n  }\n": typeof types.FeesOverviewDocument,
    "\n  mutation GenerateBills($termId: ID!) { generateBills(termId: $termId) }\n": typeof types.GenerateBillsDocument,
    "\n  mutation RemindDebtors($body: String!) {\n    sendMessage(audience: \"debtors\", body: $body, showInApp: false) { id unitsUsed }\n  }\n": typeof types.RemindDebtorsDocument,
    "\n  query RecentPayments($method: String, $offset: Int!) {\n    payments(method: $method, offset: $offset, limit: 50) {\n      total\n      items {\n        id amountKobo method status receiptNumber reference paidAt\n        student { id fullName admissionNumber }\n        recordedBy { fullName }\n      }\n    }\n  }\n": typeof types.RecentPaymentsDocument,
    "\n  mutation RecordPayment($studentId: ID!, $amountKobo: Kobo!, $method: String!, $paidAt: DateTime!, $reference: String!, $note: String!) {\n    recordPayment(studentId: $studentId, amountKobo: $amountKobo, method: $method, paidAt: $paidAt, reference: $reference, note: $note) {\n      id receiptNumber\n    }\n  }\n": typeof types.RecordPaymentDocument,
    "\n  query StudentBalance($studentId: ID!) { ledger(studentId: $studentId) { balanceKobo } }\n": typeof types.StudentBalanceDocument,
    "\n  query FeeSetup($termId: ID!) {\n    feeItems { id name order }\n    levels { id name }\n    feeSchedules(termId: $termId) { id amountKobo isCompulsory levelId item { id } }\n  }\n": typeof types.FeeSetupDocument,
    "mutation SaveFeeItem($name: String!, $order: Int!) { saveFeeItem(name: $name, order: $order) { id } }": typeof types.SaveFeeItemDocument,
    "\n  mutation SetFeeSchedule($termId: ID!, $schedules: [ScheduleInput!]!) {\n    setFeeSchedule(termId: $termId, schedules: $schedules) { id }\n  }\n": typeof types.SetFeeScheduleDocument,
    "\n  query Ledger($studentId: ID!) {\n    ledger(studentId: $studentId) {\n      balanceKobo chargedKobo paidKobo\n      openingBalance { amountKobo asOf note }\n      student { id fullName admissionNumber currentArm { label } }\n      bills { id broughtForwardKobo totalKobo term { id label } lines { id kind description amountKobo isOptional } }\n      payments { id amountKobo method status receiptNumber reference paidAt reversedReason }\n      discounts { id name kind value item { name } term { label } }\n    }\n    feeItems { id name }\n  }\n": typeof types.LedgerDocument,
    "\n  mutation SetOpeningBalance($studentId: ID!, $amountKobo: Int, $asOf: Date, $note: String!) {\n    setOpeningBalance(studentId: $studentId, amountKobo: $amountKobo, asOf: $asOf, note: $note) { amountKobo }\n  }\n": typeof types.SetOpeningBalanceDocument,
    "\n  mutation AddDiscount($studentId: ID!, $name: String!, $kind: String!, $value: Kobo!, $itemId: ID) {\n    addDiscount(studentId: $studentId, name: $name, kind: $kind, value: $value, itemId: $itemId) { id }\n  }\n": typeof types.AddDiscountDocument,
    "\n  mutation AddBillItem($billId: ID!, $description: String!, $amountKobo: Kobo!, $itemId: ID, $reason: String!) {\n    addBillItem(billId: $billId, description: $description, amountKobo: $amountKobo, itemId: $itemId, reason: $reason) { id }\n  }\n": typeof types.AddBillItemDocument,
    "\n  mutation RemoveBillItem($lineId: ID!, $reason: String!) { removeBillItem(lineId: $lineId, reason: $reason) { id } }\n": typeof types.RemoveBillItemDocument,
    "\n  mutation ReversePayment($paymentId: ID!, $reason: String!) { reversePayment(paymentId: $paymentId, reason: $reason) { id status } }\n": typeof types.ReversePaymentDocument,
    "mutation ResendFailed($messageId: ID!) { resendFailed(messageId: $messageId) { id unitsUsed } }": typeof types.ResendFailedDocument,
    "\n  query Messages($offset: Int!) {\n    smsWalletBalance\n    messages(offset: $offset, limit: 20) {\n      total\n      items {\n        id kind audience title body unitsUsed createdAt sendSms isAutomatic\n        arm { label }\n        delivery { queued sent delivered failed skipped }\n        failedRecipients { id phone error }\n      }\n    }\n  }\n": typeof types.MessagesDocument,
    "\n  query EstimateMessage($body: String!, $audience: String!, $armId: ID) {\n    estimateMessage(body: $body, audience: $audience, armId: $armId) { recipients units walletBalance senderId }\n  }\n": typeof types.EstimateMessageDocument,
    "\n  mutation SendMessage($audience: String!, $body: String!, $title: String!, $armId: ID, $sendSms: Boolean!, $showInApp: Boolean!) {\n    sendMessage(audience: $audience, body: $body, title: $title, armId: $armId, sendSms: $sendSms, showInApp: $showInApp) { id unitsUsed }\n  }\n": typeof types.SendMessageDocument,
    "\n  query ChildLedger($studentId: ID!) {\n    ledger(studentId: $studentId) {\n      balanceKobo\n      student { fullName admissionNumber currentArm { label } }\n      payments { id amountKobo method status receiptNumber paidAt }\n    }\n  }\n": typeof types.ChildLedgerDocument,
    "\n  mutation GiveConsent($studentIds: [ID!]!) { giveConsent(studentIds: $studentIds) { pending } }\n": typeof types.GiveConsentDocument,
    "\n  mutation WithdrawMyConsent($studentId: ID!, $reason: String!) { withdrawMyConsent(studentId: $studentId, reason: $reason) { pending } }\n": typeof types.WithdrawMyConsentDocument,
    "\n  query MyChildren {\n    myChildren {\n      balanceKobo\n      student { id fullName firstName admissionNumber currentArm { label } }\n      currentBill { totalKobo term { label } lines { id description amountKobo } }\n    }\n  }\n": typeof types.MyChildrenDocument,
    "\n  mutation StartCheckout($payFor: [PayFor!]!, $callbackUrl: String!, $email: String) {\n    startCheckout(payFor: $payFor, callbackUrl: $callbackUrl, email: $email) {\n      reference authorizationUrl totalKobo convenienceFeeKobo\n    }\n  }\n": typeof types.StartCheckoutDocument,
    "\n  query CheckoutStatus($reference: String!) {\n    checkoutStatus(reference: $reference) { reference status amountKobo }\n  }\n": typeof types.CheckoutStatusDocument,
    "\n  query Broadsheet($armId: ID!, $termId: ID!) {\n    broadsheet(armId: $armId, termId: $termId) {\n      armLabel status classSize classAverage isThirdTerm showPosition\n      subjects { id name }\n      missing { subject students }\n      students {\n        student { id fullName admissionNumber }\n        total average position cumulativeAverage cumulativePosition missingSubjects\n        subjects { subjectId total grade }\n      }\n    }\n  }\n": typeof types.BroadsheetDocument,
    "\n  query ClassReportInputs($armId: ID!, $termId: ID!) {\n    classReportInputs(armId: $armId, termId: $termId) {\n      traits { id name kind }\n      ratings { studentId traitId rating }\n      comments { studentId classTeacherComment principalComment suggestedClassTeacherComment suggestedPrincipalComment }\n    }\n  }\n": typeof types.ClassReportInputsDocument,
    "\n  mutation SaveReportComments($armId: ID!, $termId: ID!, $comments: [CommentInput!]!) {\n    saveReportComments(armId: $armId, termId: $termId, comments: $comments)\n  }\n": typeof types.SaveReportCommentsDocument,
    "\n  mutation SaveTraitRatings($armId: ID!, $termId: ID!, $ratings: [RatingInput!]!) {\n    saveTraitRatings(armId: $armId, termId: $termId, ratings: $ratings)\n  }\n": typeof types.SaveTraitRatingsDocument,
    "mutation ApproveResults($armId: ID!, $termId: ID!) { approveResults(armId: $armId, termId: $termId) }": typeof types.ApproveResultsDocument,
    "mutation UnlockResults($armId: ID!, $termId: ID!, $reason: String!) { unlockResults(armId: $armId, termId: $termId, reason: $reason) }": typeof types.UnlockResultsDocument,
    "\n  mutation PublishResults($armId: ID!, $termId: ID!, $publishAt: DateTime, $notify: Boolean!) {\n    publishResults(armId: $armId, termId: $termId, publishAt: $publishAt, notifyParents: $notify)\n  }\n": typeof types.PublishResultsDocument,
    "mutation GenerateReportCards($armId: ID!, $termId: ID!) { generateReportCards(armId: $armId, termId: $termId) }": typeof types.GenerateReportCardsDocument,
    "\n  query ClassResultStatuses($termId: ID!) {\n    classResultStatuses(termId: $termId) { armId armLabel status publishAt missingCells }\n  }\n": typeof types.ClassResultStatusesDocument,
    "\n  query MyResultArms {\n    myClasses { classArms { id label } }\n  }\n": typeof types.MyResultArmsDocument,
    "\n  query ScoreSheet($armId: ID!, $subjectId: ID!, $termId: ID!) {\n    scoreSheet(armId: $armId, subjectId: $subjectId, termId: $termId) {\n      armLabel\n      locked\n      status\n      subject { id name }\n      components { id name maxScore }\n      students { id fullName admissionNumber }\n      scores { studentId componentId value }\n    }\n  }\n": typeof types.ScoreSheetDocument,
    "\n  mutation SaveScores($armId: ID!, $subjectId: ID!, $termId: ID!, $entries: [ScoreEntry!]!) {\n    saveScores(armId: $armId, subjectId: $subjectId, termId: $termId, entries: $entries) {\n      saved\n      conflicts { studentId componentId serverValue }\n    }\n  }\n": typeof types.SaveScoresDocument,
    "\n  query ScoreTargets {\n    myClasses { subjectAssignments { id arm { id label } subject { id name } } }\n  }\n": typeof types.ScoreTargetsDocument,
    "\n  query AllClassesAndSubjects {\n    levels { id name arms { id label } levelSubjects { subject { id name } } }\n  }\n": typeof types.AllClassesAndSubjectsDocument,
    "\n  query AcademicSetup {\n    sessions { id name startDate endDate isCurrent }\n    terms { id number label startDate endDate daysOpened nextTermBegins isCurrent session { id } }\n    levels {\n      id name section order hasSubjectSelection reportTemplate\n      gradingScale { id name }\n      nextLevel { id name }\n      arms { id name label studentCount classTeacher { id user { fullName } } }\n      components { id name maxScore }\n      levelSubjects { category subject { id name } }\n    }\n    staff { id user { fullName } }\n    gradingScales { id name bands { grade minScore maxScore remark } }\n    subjects { id name }\n  }\n": typeof types.AcademicSetupDocument,
    "mutation SaveSession($name: String!, $startDate: Date!, $endDate: Date!) { saveSession(name: $name, startDate: $startDate, endDate: $endDate) { id } }": typeof types.SaveSessionDocument,
    "\n  mutation SaveTerm($id: ID, $sessionId: ID!, $number: Int!, $startDate: Date!, $endDate: Date!, $daysOpened: Int!, $nextTermBegins: Date) {\n    saveTerm(id: $id, sessionId: $sessionId, number: $number, startDate: $startDate, endDate: $endDate, daysOpened: $daysOpened, nextTermBegins: $nextTermBegins) { id }\n  }\n": typeof types.SaveTermDocument,
    "mutation SetCurrentTerm($termId: ID!) { setCurrentTerm(termId: $termId) { id } }": typeof types.SetCurrentTermDocument,
    "mutation SaveArm($id: ID, $levelId: ID!, $name: String!, $classTeacherId: ID) { saveArm(id: $id, levelId: $levelId, name: $name, classTeacherId: $classTeacherId) { id } }": typeof types.SaveArmDocument,
    "\n  mutation SetComponents($levelId: ID!, $components: [ComponentInput!]!) { setAssessmentComponents(levelId: $levelId, components: $components) { id } }\n": typeof types.SetComponentsDocument,
    "\n  query Billing {\n    billing {\n      plan { name pricePerStudentKobo minimumKobo }\n      accessMode trialEndsAt inTrial graceDays activeStudents outstandingKobo\n      invoices { id number periodLabel studentCount pricePerStudentKobo amountKobo dueDate status paidAt paidVia readOnlyFrom isOverdue pdfUrl }\n      smsBalance smsUnitPriceKobo smsMinUnits smsMaxUnits\n      smsPurchases { id units amountKobo reason createdAt }\n      bank { bankName accountNumber accountName }\n      billingEmail\n    }\n  }\n": typeof types.BillingDocument,
    "\n  mutation PayInvoice($invoiceId: ID!, $returnPath: String!) { payInvoice(invoiceId: $invoiceId, returnPath: $returnPath) { authorizationUrl } }\n": typeof types.PayInvoiceDocument,
    "\n  mutation BuySmsUnits($units: Int!, $returnPath: String!) { buySmsUnits(units: $units, returnPath: $returnPath) { authorizationUrl } }\n": typeof types.BuySmsUnitsDocument,
    "\n  mutation ConfirmPlatformPayment($reference: String!) {\n    confirmPlatformPayment(reference: $reference) { reference status purpose units amountKobo invoiceNumber smsBalance }\n  }\n": typeof types.ConfirmPlatformPaymentDocument,
    "\n  query SchoolSettings {\n    school { name motto address phone email primaryColor secondaryColor }\n    schoolSettings {\n      showClassPosition admissionNumberFormat admissionNumberPrefix resultDebtThresholdKobo transactionChargeBearer\n      smsSenderId smsSenderStatus notifyParentOnAbsence reportTemplate principalTitle\n      feeRemindersEnabled feeReminderEveryDays feeReminderMinBalanceKobo feeReminderTemplate\n    }\n    supportGrants { id reason expiresAt grantedBy }\n    schoolBranding { logoUrl signatureUrl stampUrl }\n  }\n": typeof types.SchoolSettingsDocument,
    "\n  mutation UpdateSchoolSettings($name: String, $motto: String, $address: String, $phone: String, $email: String, $primaryColor: String, $settingsJson: JSON) {\n    updateSchoolSettings(name: $name, motto: $motto, address: $address, phone: $phone, email: $email, primaryColor: $primaryColor, settingsJson: $settingsJson) {\n      showClassPosition\n    }\n  }\n": typeof types.UpdateSchoolSettingsDocument,
    "\n  query FeeReminderStatus { feeReminderStatus { enabled nextDueOn lastSentAt recipients units walletBalance sample } }\n": typeof types.FeeReminderStatusDocument,
    "mutation GrantSupport($reason: String!, $hours: Int!) { grantSupportAccess(reason: $reason, hours: $hours) { id } }": typeof types.GrantSupportDocument,
    "mutation RevokeSupport($id: ID!) { revokeSupportAccess(grantId: $id) }": typeof types.RevokeSupportDocument,
    "\n  query ConsentOverview {\n    consentOverview(limit: 50) {\n      notice { version body publishedAt }\n      activeStudents withConsent dpaVersion dpaAcceptedAt dpaAcceptedBy\n      missing { id fullName admissionNumber currentArm { label } }\n    }\n  }\n": typeof types.ConsentOverviewDocument,
    "\n  mutation PublishPrivacyNotice($body: String!) { publishPrivacyNotice(body: $body) { version } }\n": typeof types.PublishPrivacyNoticeDocument,
    "\n  query PromotionSessions { sessions { id name startDate isCurrent } schoolSettings { promotionPassMark } }\n": typeof types.PromotionSessionsDocument,
    "\n  query PromotionPreview($from: ID!, $to: ID!, $passMark: Float) {\n    promotionPreview(fromSessionId: $from, toSessionId: $to, passMark: $passMark) {\n      arm { id label } movesTo\n      rows { student { id fullName admissionNumber } average suggestion }\n    }\n  }\n": typeof types.PromotionPreviewDocument,
    "\n  mutation PromoteSchool($from: ID!, $to: ID!, $decisions: [PromotionDecision!]!, $passMark: Float) {\n    promoteSchool(fromSessionId: $from, toSessionId: $to, decisions: $decisions, passMark: $passMark) { promoted repeated graduated }\n  }\n": typeof types.PromoteSchoolDocument,
    "\n  query Staff {\n    staff { id title isActive user { id fullName phone email } roles { code name } }\n    roles { code name isSystem }\n    levels { id arms { id label } levelSubjects { subject { id name } } }\n    subjectAssignments { id arm { label } subject { name } teacher { user { fullName } } }\n  }\n": typeof types.StaffDocument,
    "\n  mutation AddStaff($firstName: String!, $lastName: String!, $phone: String, $email: String, $roleCodes: [String!]!) {\n    addStaff(firstName: $firstName, lastName: $lastName, phone: $phone, email: $email, roleCodes: $roleCodes) { id }\n  }\n": typeof types.AddStaffDocument,
    "\n  mutation SetStaffRoles($id: ID!, $roleCodes: [String!]!, $isActive: Boolean!) {\n    setStaffRoles(membershipId: $id, roleCodes: $roleCodes, isActive: $isActive) { id }\n  }\n": typeof types.SetStaffRolesDocument,
    "\n  mutation AssignSubjectTeacher($armId: ID!, $subjectId: ID!, $teacherId: ID!) {\n    assignSubjectTeacher(armId: $armId, subjectId: $subjectId, teacherId: $teacherId) { id }\n  }\n": typeof types.AssignSubjectTeacherDocument,
    "\n  query MyStudent { myStudent { id fullName firstName admissionNumber currentArm { label } } }\n": typeof types.MyStudentDocument,
    "\n  query StudentProfile($id: ID!, $withFees: Boolean!, $withSubjects: Boolean!) {\n    student(id: $id) {\n      id fullName firstName middleName lastName admissionNumber gender dateOfBirth admittedOn status examNumbers photoUrl\n      medicalNotes emergencyContactName emergencyContactPhone\n      currentArm { id label levelId }\n      guardianLinks { relationship isPrimary guardian { id title firstName lastName phone email } }\n    }\n    ledger(studentId: $id) @include(if: $withFees) { balanceKobo chargedKobo paidKobo }\n    studentSubjects(studentId: $id) @include(if: $withSubjects) { id name }\n  }\n": typeof types.StudentProfileDocument,
    "\n  query LevelElectives {\n    levels { id hasSubjectSelection levelSubjects { category subject { id name } } }\n  }\n": typeof types.LevelElectivesDocument,
    "\n  mutation ChangeStudentStatus($id: ID!, $status: String!, $reason: String!) {\n    changeStudentStatus(id: $id, status: $status, reason: $reason) { id status }\n  }\n": typeof types.ChangeStudentStatusDocument,
    "\n  query ClassStudentLogins($armId: ID) {\n    students(armId: $armId, status: \"active\", limit: 200) { total items { id fullName admissionNumber hasLogin currentArm { label } } }\n  }\n": typeof types.ClassStudentLoginsDocument,
    "\n  mutation CreateStudentLogins($armId: ID!) {\n    createStudentLogins(armId: $armId) { password student { id fullName admissionNumber currentArm { label } } }\n  }\n": typeof types.CreateStudentLoginsDocument,
    "\n  mutation ResetStudentPassword($studentId: ID!) {\n    resetStudentPassword(studentId: $studentId) { password student { id fullName admissionNumber currentArm { label } } }\n  }\n": typeof types.ResetStudentPasswordDocument,
    "\n  mutation CreateStudent($data: StudentInput!, $guardians: [GuardianInput!]!) {\n    createStudent(data: $data, guardians: $guardians) { id }\n  }\n": typeof types.CreateStudentDocument,
    "\n  query Students($armId: ID, $search: String, $status: String, $offset: Int!) {\n    students(armId: $armId, search: $search, status: $status, offset: $offset, limit: 50) {\n      total\n      items { id fullName admissionNumber gender status currentArm { id label } }\n    }\n  }\n": typeof types.StudentsDocument,
    "\n  mutation ConfirmEmail($token: String!) { confirmEmail(token: $token) { email schoolName schoolUrl } }\n": typeof types.ConfirmEmailDocument,
    "\n  mutation RequestReset($identifier: String!) {\n    requestPasswordReset(identifier: $identifier)\n  }\n": typeof types.RequestResetDocument,
    "\n  mutation ResetPassword($identifier: String!, $code: String!, $newPassword: String!) {\n    resetPassword(identifier: $identifier, code: $code, newPassword: $newPassword)\n  }\n": typeof types.ResetPasswordDocument,
    "\n  mutation Login($identifier: String!, $password: String!) {\n    login(identifier: $identifier, password: $password) {\n      permissions\n      isPlatformAdmin\n      mustChangePassword\n    }\n  }\n": typeof types.LoginDocument,
    "\n  query PublicPrivacyNotice {\n    privacyNotice { version body publishedAt schoolName }\n  }\n": typeof types.PublicPrivacyNoticeDocument,
    "\n  mutation SignUpSchool(\n    $name: String!\n    $slug: String!\n    $adminFirstName: String!\n    $adminLastName: String!\n    $adminPhone: String!\n    $adminEmail: String\n    $password: String!\n    $sections: [String!]!\n    $accept: Boolean!\n  ) {\n    signUpSchool(\n      name: $name\n      slug: $slug\n      adminFirstName: $adminFirstName\n      adminLastName: $adminLastName\n      adminPhone: $adminPhone\n      adminEmail: $adminEmail\n      password: $password\n      sections: $sections\n      acceptDataProcessingAgreement: $accept\n    ) {\n      slug\n      schoolUrl\n      confirmationSentTo\n    }\n  }\n": typeof types.SignUpSchoolDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query Notices {\n    notices(limit: 5) { id title body createdAt }\n  }\n": typeof types.NoticesDocument,
    "\n  query PayoutAccount { payoutAccount { connected bankName accountNumber accountName canChange } }\n": typeof types.PayoutAccountDocument,
    "query PayoutBanks { payoutBanks { code name } }": typeof types.PayoutBanksDocument,
    "\n  mutation ResolvePayoutAccount($bankCode: String!, $accountNumber: String!) { resolvePayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) }\n": typeof types.ResolvePayoutAccountDocument,
    "\n  mutation ConnectPayoutAccount($bankCode: String!, $accountNumber: String!) {\n    connectPayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) { connected }\n  }\n": typeof types.ConnectPayoutAccountDocument,
    "\n  query PlatformInvoices($status: String) {\n    platformInvoices(status: $status) {\n      schoolName schoolSlug\n      invoice { id number periodLabel studentCount amountKobo dueDate status paidAt paidVia paymentReference voidReason isOverdue readOnlyFrom }\n    }\n  }\n": typeof types.PlatformInvoicesDocument,
    "mutation GenerateInvoices { generateInvoices { schoolName invoice { number } } }": typeof types.GenerateInvoicesDocument,
    "\n  mutation MarkInvoicePaid($invoiceId: ID!, $reference: String!) { markInvoicePaid(invoiceId: $invoiceId, reference: $reference) { id status } }\n": typeof types.MarkInvoicePaidDocument,
    "\n  mutation VoidInvoice($invoiceId: ID!, $reason: String!) { voidInvoice(invoiceId: $invoiceId, reason: $reason) { id status } }\n": typeof types.VoidInvoiceDocument,
    "\n  query ChildResult($studentId: ID!, $termId: ID!) {\n    childResult(studentId: $studentId, termId: $termId) {\n      visible reason classSize classAverage reportCardUrl\n      result {\n        total average position cumulativeAverage cumulativePosition\n        student { fullName currentArm { label } }\n        subjects { subjectId subjectName total grade remark position cumulativeAverage cumulativeGrade }\n      }\n    }\n  }\n": typeof types.ChildResultDocument,
    "\n  query ChildAttendance($studentId: ID!, $termId: ID!) {\n    attendanceHistory(studentId: $studentId, termId: $termId) { id date status }\n  }\n": typeof types.ChildAttendanceDocument,
    "\n  mutation SaveLevel(\n    $id: ID\n    $name: String!\n    $section: String!\n    $gradingScaleId: ID\n    $nextLevelId: ID\n    $hasSubjectSelection: Boolean!\n    $reportTemplate: String!\n  ) {\n    saveLevel(\n      id: $id\n      name: $name\n      section: $section\n      gradingScaleId: $gradingScaleId\n      nextLevelId: $nextLevelId\n      hasSubjectSelection: $hasSubjectSelection\n      reportTemplate: $reportTemplate\n    ) {\n      id\n    }\n  }\n": typeof types.SaveLevelDocument,
    "mutation SaveSubject($name: String!) { saveSubject(name: $name) { id name } }": typeof types.SaveSubjectDocument,
    "\n  mutation SetLevelSubjects($levelId: ID!, $subjects: [LevelSubjectInput!]!) { setLevelSubjects(levelId: $levelId, subjects: $subjects) { id } }\n": typeof types.SetLevelSubjectsDocument,
    "\n  mutation SaveGradingScale($id: ID, $name: String!, $bands: [BandInput!]!) { saveGradingScale(id: $id, name: $name, bands: $bands) { id } }\n": typeof types.SaveGradingScaleDocument,
    "\n  query StudentConsent($studentId: ID!) {\n    studentConsent(studentId: $studentId) {\n      noticeVersion\n      guardians { guardianId guardianName relationship consent { id source givenAt recordedBy } }\n      history { id guardianName noticeVersion source givenAt recordedBy withdrawnAt withdrawalReason }\n    }\n  }\n": typeof types.StudentConsentDocument,
    "\n  mutation RecordPaperConsent($studentId: ID!, $guardianId: ID!, $givenOn: Date!) {\n    recordPaperConsent(studentId: $studentId, guardianId: $guardianId, givenOn: $givenOn)\n  }\n": typeof types.RecordPaperConsentDocument,
    "\n  mutation RecordConsentWithdrawal($consentId: ID!, $reason: String!) { recordConsentWithdrawal(consentId: $consentId, reason: $reason) }\n": typeof types.RecordConsentWithdrawalDocument,
    "\n  mutation UpdateStudent($id: ID!, $data: StudentInput!) { updateStudent(id: $id, data: $data) { id } }\n": typeof types.UpdateStudentDocument,
    "\n  mutation AddGuardian($studentId: ID!, $guardian: GuardianInput!) { addGuardian(studentId: $studentId, guardian: $guardian) { id } }\n": typeof types.AddGuardianDocument,
    "\n  mutation SetStudentSubjects($studentId: ID!, $subjectIds: [ID!]!) { setStudentSubjects(studentId: $studentId, subjectIds: $subjectIds) { id } }\n": typeof types.SetStudentSubjectsDocument,
    "\n  query Arms {\n    arms { id label levelId studentCount }\n  }\n": typeof types.ArmsDocument,
    "\n  query Terms {\n    terms { id label number isCurrent session { id name } }\n  }\n": typeof types.TermsDocument,
    "\n  query StudentSearch($search: String!) {\n    students(search: $search, limit: 8) { items { id fullName admissionNumber currentArm { label } } }\n  }\n": typeof types.StudentSearchDocument,
    "\n  query MyConsent {\n    myConsent {\n      pending\n      notice { version body publishedAt schoolName }\n      children { consented givenAt source student { id fullName firstName currentArm { label } } }\n    }\n  }\n": typeof types.MyConsentDocument,
    "\n  mutation ResendEmailConfirmation($identifier: String!) { resendEmailConfirmation(identifier: $identifier) }\n": typeof types.ResendEmailConfirmationDocument,
    "\n  query Me {\n    me {\n      permissions\n      roles\n      accessMode\n      isPlatformAdmin\n      viaSupport\n      mustChangePassword\n      user { id fullName firstName phone email }\n      membership { id }\n      billingAlert { kind date invoice { number periodLabel amountKobo studentCount } }\n    }\n    school { name slug motto address phone email primaryColor secondaryColor logoUrl }\n    currentTerm { id label number isCurrent session { id name } }\n  }\n": typeof types.MeDocument,
};
const documents: Documents = {
    "\n  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {\n    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)\n  }\n": types.ChangePasswordDocument,
    "\n  query Register($armId: ID!, $date: Date!) {\n    register(armId: $armId, date: $date) {\n      date\n      rows { status student { id fullName admissionNumber currentArm { label } } }\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation MarkAttendance($armId: ID!, $date: Date!, $entries: [AttendanceEntry!]!) {\n    markAttendance(armId: $armId, date: $date, entries: $entries) {\n      saved\n      conflicts { studentId serverStatus }\n    }\n  }\n": types.MarkAttendanceDocument,
    "\n  query AttendanceClasses($all: Boolean!) {\n    myClasses { classArms { id label studentCount } }\n    arms @include(if: $all) { id label studentCount }\n  }\n": types.AttendanceClassesDocument,
    "\n  query AuditLog($prefix: String, $offset: Int!) {\n    auditLog(actionPrefix: $prefix, offset: $offset, limit: 50) { total items { id action summary userName viaSupport createdAt } }\n  }\n": types.AuditLogDocument,
    "\n  query PlatformSchools($search: String, $offset: Int!) {\n    platformOverview { schools activeStudents onTrial pendingSenders { schoolId schoolName senderId } }\n    platformSchools(search: $search, offset: $offset, limit: 50) {\n      total\n      items {\n        id name slug status accessMode plan studentCount trialEndsAt lastActivityAt createdAt smsSenderId smsSenderStatus\n        usage { signIns7d activeUsers7d smsUnits30d collected30dKobo onlineShare30d unpaidInvoices }\n      }\n    }\n  }\n": types.PlatformSchoolsDocument,
    "\n  mutation SetSchoolStatus($schoolId: ID!, $status: String!, $reason: String!) { setSchoolStatus(schoolId: $schoolId, status: $status, reason: $reason) { id status } }\n": types.SetSchoolStatusDocument,
    "mutation SetSenderStatus($schoolId: ID!, $status: String!) { setSenderIdStatus(schoolId: $schoolId, status: $status) }": types.SetSenderStatusDocument,
    "\n  mutation CreditSms($schoolId: ID!, $units: Int!, $reason: String!) { creditSmsUnits(schoolId: $schoolId, units: $units, reason: $reason) }\n": types.CreditSmsDocument,
    "\n  query OwnerDashboard {\n    ownerDashboard {\n      termLabel\n      activeStudents\n      classesPublished\n      classesTotal\n      studentsByLevel { level students }\n      fees { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n    }\n  }\n": types.OwnerDashboardDocument,
    "\n  query MyClasses {\n    myClasses {\n      classArms { id label studentCount }\n      subjectAssignments { id arm { id label } subject { id name } }\n    }\n  }\n": types.MyClassesDocument,
    "\n  query BursarSummary($termId: ID!) {\n    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n  }\n": types.BursarSummaryDocument,
    "\n  query FeesOverview($termId: ID!, $armId: ID, $offset: Int!) {\n    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n    debtors(armId: $armId, offset: $offset, limit: 50) { total totalBalanceKobo items { balanceKobo student { id fullName admissionNumber currentArm { label } } } }\n  }\n": types.FeesOverviewDocument,
    "\n  mutation GenerateBills($termId: ID!) { generateBills(termId: $termId) }\n": types.GenerateBillsDocument,
    "\n  mutation RemindDebtors($body: String!) {\n    sendMessage(audience: \"debtors\", body: $body, showInApp: false) { id unitsUsed }\n  }\n": types.RemindDebtorsDocument,
    "\n  query RecentPayments($method: String, $offset: Int!) {\n    payments(method: $method, offset: $offset, limit: 50) {\n      total\n      items {\n        id amountKobo method status receiptNumber reference paidAt\n        student { id fullName admissionNumber }\n        recordedBy { fullName }\n      }\n    }\n  }\n": types.RecentPaymentsDocument,
    "\n  mutation RecordPayment($studentId: ID!, $amountKobo: Kobo!, $method: String!, $paidAt: DateTime!, $reference: String!, $note: String!) {\n    recordPayment(studentId: $studentId, amountKobo: $amountKobo, method: $method, paidAt: $paidAt, reference: $reference, note: $note) {\n      id receiptNumber\n    }\n  }\n": types.RecordPaymentDocument,
    "\n  query StudentBalance($studentId: ID!) { ledger(studentId: $studentId) { balanceKobo } }\n": types.StudentBalanceDocument,
    "\n  query FeeSetup($termId: ID!) {\n    feeItems { id name order }\n    levels { id name }\n    feeSchedules(termId: $termId) { id amountKobo isCompulsory levelId item { id } }\n  }\n": types.FeeSetupDocument,
    "mutation SaveFeeItem($name: String!, $order: Int!) { saveFeeItem(name: $name, order: $order) { id } }": types.SaveFeeItemDocument,
    "\n  mutation SetFeeSchedule($termId: ID!, $schedules: [ScheduleInput!]!) {\n    setFeeSchedule(termId: $termId, schedules: $schedules) { id }\n  }\n": types.SetFeeScheduleDocument,
    "\n  query Ledger($studentId: ID!) {\n    ledger(studentId: $studentId) {\n      balanceKobo chargedKobo paidKobo\n      openingBalance { amountKobo asOf note }\n      student { id fullName admissionNumber currentArm { label } }\n      bills { id broughtForwardKobo totalKobo term { id label } lines { id kind description amountKobo isOptional } }\n      payments { id amountKobo method status receiptNumber reference paidAt reversedReason }\n      discounts { id name kind value item { name } term { label } }\n    }\n    feeItems { id name }\n  }\n": types.LedgerDocument,
    "\n  mutation SetOpeningBalance($studentId: ID!, $amountKobo: Int, $asOf: Date, $note: String!) {\n    setOpeningBalance(studentId: $studentId, amountKobo: $amountKobo, asOf: $asOf, note: $note) { amountKobo }\n  }\n": types.SetOpeningBalanceDocument,
    "\n  mutation AddDiscount($studentId: ID!, $name: String!, $kind: String!, $value: Kobo!, $itemId: ID) {\n    addDiscount(studentId: $studentId, name: $name, kind: $kind, value: $value, itemId: $itemId) { id }\n  }\n": types.AddDiscountDocument,
    "\n  mutation AddBillItem($billId: ID!, $description: String!, $amountKobo: Kobo!, $itemId: ID, $reason: String!) {\n    addBillItem(billId: $billId, description: $description, amountKobo: $amountKobo, itemId: $itemId, reason: $reason) { id }\n  }\n": types.AddBillItemDocument,
    "\n  mutation RemoveBillItem($lineId: ID!, $reason: String!) { removeBillItem(lineId: $lineId, reason: $reason) { id } }\n": types.RemoveBillItemDocument,
    "\n  mutation ReversePayment($paymentId: ID!, $reason: String!) { reversePayment(paymentId: $paymentId, reason: $reason) { id status } }\n": types.ReversePaymentDocument,
    "mutation ResendFailed($messageId: ID!) { resendFailed(messageId: $messageId) { id unitsUsed } }": types.ResendFailedDocument,
    "\n  query Messages($offset: Int!) {\n    smsWalletBalance\n    messages(offset: $offset, limit: 20) {\n      total\n      items {\n        id kind audience title body unitsUsed createdAt sendSms isAutomatic\n        arm { label }\n        delivery { queued sent delivered failed skipped }\n        failedRecipients { id phone error }\n      }\n    }\n  }\n": types.MessagesDocument,
    "\n  query EstimateMessage($body: String!, $audience: String!, $armId: ID) {\n    estimateMessage(body: $body, audience: $audience, armId: $armId) { recipients units walletBalance senderId }\n  }\n": types.EstimateMessageDocument,
    "\n  mutation SendMessage($audience: String!, $body: String!, $title: String!, $armId: ID, $sendSms: Boolean!, $showInApp: Boolean!) {\n    sendMessage(audience: $audience, body: $body, title: $title, armId: $armId, sendSms: $sendSms, showInApp: $showInApp) { id unitsUsed }\n  }\n": types.SendMessageDocument,
    "\n  query ChildLedger($studentId: ID!) {\n    ledger(studentId: $studentId) {\n      balanceKobo\n      student { fullName admissionNumber currentArm { label } }\n      payments { id amountKobo method status receiptNumber paidAt }\n    }\n  }\n": types.ChildLedgerDocument,
    "\n  mutation GiveConsent($studentIds: [ID!]!) { giveConsent(studentIds: $studentIds) { pending } }\n": types.GiveConsentDocument,
    "\n  mutation WithdrawMyConsent($studentId: ID!, $reason: String!) { withdrawMyConsent(studentId: $studentId, reason: $reason) { pending } }\n": types.WithdrawMyConsentDocument,
    "\n  query MyChildren {\n    myChildren {\n      balanceKobo\n      student { id fullName firstName admissionNumber currentArm { label } }\n      currentBill { totalKobo term { label } lines { id description amountKobo } }\n    }\n  }\n": types.MyChildrenDocument,
    "\n  mutation StartCheckout($payFor: [PayFor!]!, $callbackUrl: String!, $email: String) {\n    startCheckout(payFor: $payFor, callbackUrl: $callbackUrl, email: $email) {\n      reference authorizationUrl totalKobo convenienceFeeKobo\n    }\n  }\n": types.StartCheckoutDocument,
    "\n  query CheckoutStatus($reference: String!) {\n    checkoutStatus(reference: $reference) { reference status amountKobo }\n  }\n": types.CheckoutStatusDocument,
    "\n  query Broadsheet($armId: ID!, $termId: ID!) {\n    broadsheet(armId: $armId, termId: $termId) {\n      armLabel status classSize classAverage isThirdTerm showPosition\n      subjects { id name }\n      missing { subject students }\n      students {\n        student { id fullName admissionNumber }\n        total average position cumulativeAverage cumulativePosition missingSubjects\n        subjects { subjectId total grade }\n      }\n    }\n  }\n": types.BroadsheetDocument,
    "\n  query ClassReportInputs($armId: ID!, $termId: ID!) {\n    classReportInputs(armId: $armId, termId: $termId) {\n      traits { id name kind }\n      ratings { studentId traitId rating }\n      comments { studentId classTeacherComment principalComment suggestedClassTeacherComment suggestedPrincipalComment }\n    }\n  }\n": types.ClassReportInputsDocument,
    "\n  mutation SaveReportComments($armId: ID!, $termId: ID!, $comments: [CommentInput!]!) {\n    saveReportComments(armId: $armId, termId: $termId, comments: $comments)\n  }\n": types.SaveReportCommentsDocument,
    "\n  mutation SaveTraitRatings($armId: ID!, $termId: ID!, $ratings: [RatingInput!]!) {\n    saveTraitRatings(armId: $armId, termId: $termId, ratings: $ratings)\n  }\n": types.SaveTraitRatingsDocument,
    "mutation ApproveResults($armId: ID!, $termId: ID!) { approveResults(armId: $armId, termId: $termId) }": types.ApproveResultsDocument,
    "mutation UnlockResults($armId: ID!, $termId: ID!, $reason: String!) { unlockResults(armId: $armId, termId: $termId, reason: $reason) }": types.UnlockResultsDocument,
    "\n  mutation PublishResults($armId: ID!, $termId: ID!, $publishAt: DateTime, $notify: Boolean!) {\n    publishResults(armId: $armId, termId: $termId, publishAt: $publishAt, notifyParents: $notify)\n  }\n": types.PublishResultsDocument,
    "mutation GenerateReportCards($armId: ID!, $termId: ID!) { generateReportCards(armId: $armId, termId: $termId) }": types.GenerateReportCardsDocument,
    "\n  query ClassResultStatuses($termId: ID!) {\n    classResultStatuses(termId: $termId) { armId armLabel status publishAt missingCells }\n  }\n": types.ClassResultStatusesDocument,
    "\n  query MyResultArms {\n    myClasses { classArms { id label } }\n  }\n": types.MyResultArmsDocument,
    "\n  query ScoreSheet($armId: ID!, $subjectId: ID!, $termId: ID!) {\n    scoreSheet(armId: $armId, subjectId: $subjectId, termId: $termId) {\n      armLabel\n      locked\n      status\n      subject { id name }\n      components { id name maxScore }\n      students { id fullName admissionNumber }\n      scores { studentId componentId value }\n    }\n  }\n": types.ScoreSheetDocument,
    "\n  mutation SaveScores($armId: ID!, $subjectId: ID!, $termId: ID!, $entries: [ScoreEntry!]!) {\n    saveScores(armId: $armId, subjectId: $subjectId, termId: $termId, entries: $entries) {\n      saved\n      conflicts { studentId componentId serverValue }\n    }\n  }\n": types.SaveScoresDocument,
    "\n  query ScoreTargets {\n    myClasses { subjectAssignments { id arm { id label } subject { id name } } }\n  }\n": types.ScoreTargetsDocument,
    "\n  query AllClassesAndSubjects {\n    levels { id name arms { id label } levelSubjects { subject { id name } } }\n  }\n": types.AllClassesAndSubjectsDocument,
    "\n  query AcademicSetup {\n    sessions { id name startDate endDate isCurrent }\n    terms { id number label startDate endDate daysOpened nextTermBegins isCurrent session { id } }\n    levels {\n      id name section order hasSubjectSelection reportTemplate\n      gradingScale { id name }\n      nextLevel { id name }\n      arms { id name label studentCount classTeacher { id user { fullName } } }\n      components { id name maxScore }\n      levelSubjects { category subject { id name } }\n    }\n    staff { id user { fullName } }\n    gradingScales { id name bands { grade minScore maxScore remark } }\n    subjects { id name }\n  }\n": types.AcademicSetupDocument,
    "mutation SaveSession($name: String!, $startDate: Date!, $endDate: Date!) { saveSession(name: $name, startDate: $startDate, endDate: $endDate) { id } }": types.SaveSessionDocument,
    "\n  mutation SaveTerm($id: ID, $sessionId: ID!, $number: Int!, $startDate: Date!, $endDate: Date!, $daysOpened: Int!, $nextTermBegins: Date) {\n    saveTerm(id: $id, sessionId: $sessionId, number: $number, startDate: $startDate, endDate: $endDate, daysOpened: $daysOpened, nextTermBegins: $nextTermBegins) { id }\n  }\n": types.SaveTermDocument,
    "mutation SetCurrentTerm($termId: ID!) { setCurrentTerm(termId: $termId) { id } }": types.SetCurrentTermDocument,
    "mutation SaveArm($id: ID, $levelId: ID!, $name: String!, $classTeacherId: ID) { saveArm(id: $id, levelId: $levelId, name: $name, classTeacherId: $classTeacherId) { id } }": types.SaveArmDocument,
    "\n  mutation SetComponents($levelId: ID!, $components: [ComponentInput!]!) { setAssessmentComponents(levelId: $levelId, components: $components) { id } }\n": types.SetComponentsDocument,
    "\n  query Billing {\n    billing {\n      plan { name pricePerStudentKobo minimumKobo }\n      accessMode trialEndsAt inTrial graceDays activeStudents outstandingKobo\n      invoices { id number periodLabel studentCount pricePerStudentKobo amountKobo dueDate status paidAt paidVia readOnlyFrom isOverdue pdfUrl }\n      smsBalance smsUnitPriceKobo smsMinUnits smsMaxUnits\n      smsPurchases { id units amountKobo reason createdAt }\n      bank { bankName accountNumber accountName }\n      billingEmail\n    }\n  }\n": types.BillingDocument,
    "\n  mutation PayInvoice($invoiceId: ID!, $returnPath: String!) { payInvoice(invoiceId: $invoiceId, returnPath: $returnPath) { authorizationUrl } }\n": types.PayInvoiceDocument,
    "\n  mutation BuySmsUnits($units: Int!, $returnPath: String!) { buySmsUnits(units: $units, returnPath: $returnPath) { authorizationUrl } }\n": types.BuySmsUnitsDocument,
    "\n  mutation ConfirmPlatformPayment($reference: String!) {\n    confirmPlatformPayment(reference: $reference) { reference status purpose units amountKobo invoiceNumber smsBalance }\n  }\n": types.ConfirmPlatformPaymentDocument,
    "\n  query SchoolSettings {\n    school { name motto address phone email primaryColor secondaryColor }\n    schoolSettings {\n      showClassPosition admissionNumberFormat admissionNumberPrefix resultDebtThresholdKobo transactionChargeBearer\n      smsSenderId smsSenderStatus notifyParentOnAbsence reportTemplate principalTitle\n      feeRemindersEnabled feeReminderEveryDays feeReminderMinBalanceKobo feeReminderTemplate\n    }\n    supportGrants { id reason expiresAt grantedBy }\n    schoolBranding { logoUrl signatureUrl stampUrl }\n  }\n": types.SchoolSettingsDocument,
    "\n  mutation UpdateSchoolSettings($name: String, $motto: String, $address: String, $phone: String, $email: String, $primaryColor: String, $settingsJson: JSON) {\n    updateSchoolSettings(name: $name, motto: $motto, address: $address, phone: $phone, email: $email, primaryColor: $primaryColor, settingsJson: $settingsJson) {\n      showClassPosition\n    }\n  }\n": types.UpdateSchoolSettingsDocument,
    "\n  query FeeReminderStatus { feeReminderStatus { enabled nextDueOn lastSentAt recipients units walletBalance sample } }\n": types.FeeReminderStatusDocument,
    "mutation GrantSupport($reason: String!, $hours: Int!) { grantSupportAccess(reason: $reason, hours: $hours) { id } }": types.GrantSupportDocument,
    "mutation RevokeSupport($id: ID!) { revokeSupportAccess(grantId: $id) }": types.RevokeSupportDocument,
    "\n  query ConsentOverview {\n    consentOverview(limit: 50) {\n      notice { version body publishedAt }\n      activeStudents withConsent dpaVersion dpaAcceptedAt dpaAcceptedBy\n      missing { id fullName admissionNumber currentArm { label } }\n    }\n  }\n": types.ConsentOverviewDocument,
    "\n  mutation PublishPrivacyNotice($body: String!) { publishPrivacyNotice(body: $body) { version } }\n": types.PublishPrivacyNoticeDocument,
    "\n  query PromotionSessions { sessions { id name startDate isCurrent } schoolSettings { promotionPassMark } }\n": types.PromotionSessionsDocument,
    "\n  query PromotionPreview($from: ID!, $to: ID!, $passMark: Float) {\n    promotionPreview(fromSessionId: $from, toSessionId: $to, passMark: $passMark) {\n      arm { id label } movesTo\n      rows { student { id fullName admissionNumber } average suggestion }\n    }\n  }\n": types.PromotionPreviewDocument,
    "\n  mutation PromoteSchool($from: ID!, $to: ID!, $decisions: [PromotionDecision!]!, $passMark: Float) {\n    promoteSchool(fromSessionId: $from, toSessionId: $to, decisions: $decisions, passMark: $passMark) { promoted repeated graduated }\n  }\n": types.PromoteSchoolDocument,
    "\n  query Staff {\n    staff { id title isActive user { id fullName phone email } roles { code name } }\n    roles { code name isSystem }\n    levels { id arms { id label } levelSubjects { subject { id name } } }\n    subjectAssignments { id arm { label } subject { name } teacher { user { fullName } } }\n  }\n": types.StaffDocument,
    "\n  mutation AddStaff($firstName: String!, $lastName: String!, $phone: String, $email: String, $roleCodes: [String!]!) {\n    addStaff(firstName: $firstName, lastName: $lastName, phone: $phone, email: $email, roleCodes: $roleCodes) { id }\n  }\n": types.AddStaffDocument,
    "\n  mutation SetStaffRoles($id: ID!, $roleCodes: [String!]!, $isActive: Boolean!) {\n    setStaffRoles(membershipId: $id, roleCodes: $roleCodes, isActive: $isActive) { id }\n  }\n": types.SetStaffRolesDocument,
    "\n  mutation AssignSubjectTeacher($armId: ID!, $subjectId: ID!, $teacherId: ID!) {\n    assignSubjectTeacher(armId: $armId, subjectId: $subjectId, teacherId: $teacherId) { id }\n  }\n": types.AssignSubjectTeacherDocument,
    "\n  query MyStudent { myStudent { id fullName firstName admissionNumber currentArm { label } } }\n": types.MyStudentDocument,
    "\n  query StudentProfile($id: ID!, $withFees: Boolean!, $withSubjects: Boolean!) {\n    student(id: $id) {\n      id fullName firstName middleName lastName admissionNumber gender dateOfBirth admittedOn status examNumbers photoUrl\n      medicalNotes emergencyContactName emergencyContactPhone\n      currentArm { id label levelId }\n      guardianLinks { relationship isPrimary guardian { id title firstName lastName phone email } }\n    }\n    ledger(studentId: $id) @include(if: $withFees) { balanceKobo chargedKobo paidKobo }\n    studentSubjects(studentId: $id) @include(if: $withSubjects) { id name }\n  }\n": types.StudentProfileDocument,
    "\n  query LevelElectives {\n    levels { id hasSubjectSelection levelSubjects { category subject { id name } } }\n  }\n": types.LevelElectivesDocument,
    "\n  mutation ChangeStudentStatus($id: ID!, $status: String!, $reason: String!) {\n    changeStudentStatus(id: $id, status: $status, reason: $reason) { id status }\n  }\n": types.ChangeStudentStatusDocument,
    "\n  query ClassStudentLogins($armId: ID) {\n    students(armId: $armId, status: \"active\", limit: 200) { total items { id fullName admissionNumber hasLogin currentArm { label } } }\n  }\n": types.ClassStudentLoginsDocument,
    "\n  mutation CreateStudentLogins($armId: ID!) {\n    createStudentLogins(armId: $armId) { password student { id fullName admissionNumber currentArm { label } } }\n  }\n": types.CreateStudentLoginsDocument,
    "\n  mutation ResetStudentPassword($studentId: ID!) {\n    resetStudentPassword(studentId: $studentId) { password student { id fullName admissionNumber currentArm { label } } }\n  }\n": types.ResetStudentPasswordDocument,
    "\n  mutation CreateStudent($data: StudentInput!, $guardians: [GuardianInput!]!) {\n    createStudent(data: $data, guardians: $guardians) { id }\n  }\n": types.CreateStudentDocument,
    "\n  query Students($armId: ID, $search: String, $status: String, $offset: Int!) {\n    students(armId: $armId, search: $search, status: $status, offset: $offset, limit: 50) {\n      total\n      items { id fullName admissionNumber gender status currentArm { id label } }\n    }\n  }\n": types.StudentsDocument,
    "\n  mutation ConfirmEmail($token: String!) { confirmEmail(token: $token) { email schoolName schoolUrl } }\n": types.ConfirmEmailDocument,
    "\n  mutation RequestReset($identifier: String!) {\n    requestPasswordReset(identifier: $identifier)\n  }\n": types.RequestResetDocument,
    "\n  mutation ResetPassword($identifier: String!, $code: String!, $newPassword: String!) {\n    resetPassword(identifier: $identifier, code: $code, newPassword: $newPassword)\n  }\n": types.ResetPasswordDocument,
    "\n  mutation Login($identifier: String!, $password: String!) {\n    login(identifier: $identifier, password: $password) {\n      permissions\n      isPlatformAdmin\n      mustChangePassword\n    }\n  }\n": types.LoginDocument,
    "\n  query PublicPrivacyNotice {\n    privacyNotice { version body publishedAt schoolName }\n  }\n": types.PublicPrivacyNoticeDocument,
    "\n  mutation SignUpSchool(\n    $name: String!\n    $slug: String!\n    $adminFirstName: String!\n    $adminLastName: String!\n    $adminPhone: String!\n    $adminEmail: String\n    $password: String!\n    $sections: [String!]!\n    $accept: Boolean!\n  ) {\n    signUpSchool(\n      name: $name\n      slug: $slug\n      adminFirstName: $adminFirstName\n      adminLastName: $adminLastName\n      adminPhone: $adminPhone\n      adminEmail: $adminEmail\n      password: $password\n      sections: $sections\n      acceptDataProcessingAgreement: $accept\n    ) {\n      slug\n      schoolUrl\n      confirmationSentTo\n    }\n  }\n": types.SignUpSchoolDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query Notices {\n    notices(limit: 5) { id title body createdAt }\n  }\n": types.NoticesDocument,
    "\n  query PayoutAccount { payoutAccount { connected bankName accountNumber accountName canChange } }\n": types.PayoutAccountDocument,
    "query PayoutBanks { payoutBanks { code name } }": types.PayoutBanksDocument,
    "\n  mutation ResolvePayoutAccount($bankCode: String!, $accountNumber: String!) { resolvePayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) }\n": types.ResolvePayoutAccountDocument,
    "\n  mutation ConnectPayoutAccount($bankCode: String!, $accountNumber: String!) {\n    connectPayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) { connected }\n  }\n": types.ConnectPayoutAccountDocument,
    "\n  query PlatformInvoices($status: String) {\n    platformInvoices(status: $status) {\n      schoolName schoolSlug\n      invoice { id number periodLabel studentCount amountKobo dueDate status paidAt paidVia paymentReference voidReason isOverdue readOnlyFrom }\n    }\n  }\n": types.PlatformInvoicesDocument,
    "mutation GenerateInvoices { generateInvoices { schoolName invoice { number } } }": types.GenerateInvoicesDocument,
    "\n  mutation MarkInvoicePaid($invoiceId: ID!, $reference: String!) { markInvoicePaid(invoiceId: $invoiceId, reference: $reference) { id status } }\n": types.MarkInvoicePaidDocument,
    "\n  mutation VoidInvoice($invoiceId: ID!, $reason: String!) { voidInvoice(invoiceId: $invoiceId, reason: $reason) { id status } }\n": types.VoidInvoiceDocument,
    "\n  query ChildResult($studentId: ID!, $termId: ID!) {\n    childResult(studentId: $studentId, termId: $termId) {\n      visible reason classSize classAverage reportCardUrl\n      result {\n        total average position cumulativeAverage cumulativePosition\n        student { fullName currentArm { label } }\n        subjects { subjectId subjectName total grade remark position cumulativeAverage cumulativeGrade }\n      }\n    }\n  }\n": types.ChildResultDocument,
    "\n  query ChildAttendance($studentId: ID!, $termId: ID!) {\n    attendanceHistory(studentId: $studentId, termId: $termId) { id date status }\n  }\n": types.ChildAttendanceDocument,
    "\n  mutation SaveLevel(\n    $id: ID\n    $name: String!\n    $section: String!\n    $gradingScaleId: ID\n    $nextLevelId: ID\n    $hasSubjectSelection: Boolean!\n    $reportTemplate: String!\n  ) {\n    saveLevel(\n      id: $id\n      name: $name\n      section: $section\n      gradingScaleId: $gradingScaleId\n      nextLevelId: $nextLevelId\n      hasSubjectSelection: $hasSubjectSelection\n      reportTemplate: $reportTemplate\n    ) {\n      id\n    }\n  }\n": types.SaveLevelDocument,
    "mutation SaveSubject($name: String!) { saveSubject(name: $name) { id name } }": types.SaveSubjectDocument,
    "\n  mutation SetLevelSubjects($levelId: ID!, $subjects: [LevelSubjectInput!]!) { setLevelSubjects(levelId: $levelId, subjects: $subjects) { id } }\n": types.SetLevelSubjectsDocument,
    "\n  mutation SaveGradingScale($id: ID, $name: String!, $bands: [BandInput!]!) { saveGradingScale(id: $id, name: $name, bands: $bands) { id } }\n": types.SaveGradingScaleDocument,
    "\n  query StudentConsent($studentId: ID!) {\n    studentConsent(studentId: $studentId) {\n      noticeVersion\n      guardians { guardianId guardianName relationship consent { id source givenAt recordedBy } }\n      history { id guardianName noticeVersion source givenAt recordedBy withdrawnAt withdrawalReason }\n    }\n  }\n": types.StudentConsentDocument,
    "\n  mutation RecordPaperConsent($studentId: ID!, $guardianId: ID!, $givenOn: Date!) {\n    recordPaperConsent(studentId: $studentId, guardianId: $guardianId, givenOn: $givenOn)\n  }\n": types.RecordPaperConsentDocument,
    "\n  mutation RecordConsentWithdrawal($consentId: ID!, $reason: String!) { recordConsentWithdrawal(consentId: $consentId, reason: $reason) }\n": types.RecordConsentWithdrawalDocument,
    "\n  mutation UpdateStudent($id: ID!, $data: StudentInput!) { updateStudent(id: $id, data: $data) { id } }\n": types.UpdateStudentDocument,
    "\n  mutation AddGuardian($studentId: ID!, $guardian: GuardianInput!) { addGuardian(studentId: $studentId, guardian: $guardian) { id } }\n": types.AddGuardianDocument,
    "\n  mutation SetStudentSubjects($studentId: ID!, $subjectIds: [ID!]!) { setStudentSubjects(studentId: $studentId, subjectIds: $subjectIds) { id } }\n": types.SetStudentSubjectsDocument,
    "\n  query Arms {\n    arms { id label levelId studentCount }\n  }\n": types.ArmsDocument,
    "\n  query Terms {\n    terms { id label number isCurrent session { id name } }\n  }\n": types.TermsDocument,
    "\n  query StudentSearch($search: String!) {\n    students(search: $search, limit: 8) { items { id fullName admissionNumber currentArm { label } } }\n  }\n": types.StudentSearchDocument,
    "\n  query MyConsent {\n    myConsent {\n      pending\n      notice { version body publishedAt schoolName }\n      children { consented givenAt source student { id fullName firstName currentArm { label } } }\n    }\n  }\n": types.MyConsentDocument,
    "\n  mutation ResendEmailConfirmation($identifier: String!) { resendEmailConfirmation(identifier: $identifier) }\n": types.ResendEmailConfirmationDocument,
    "\n  query Me {\n    me {\n      permissions\n      roles\n      accessMode\n      isPlatformAdmin\n      viaSupport\n      mustChangePassword\n      user { id fullName firstName phone email }\n      membership { id }\n      billingAlert { kind date invoice { number periodLabel amountKobo studentCount } }\n    }\n    school { name slug motto address phone email primaryColor secondaryColor logoUrl }\n    currentTerm { id label number isCurrent session { id name } }\n  }\n": types.MeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {\n    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)\n  }\n"): typeof import('./graphql').ChangePasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Register($armId: ID!, $date: Date!) {\n    register(armId: $armId, date: $date) {\n      date\n      rows { status student { id fullName admissionNumber currentArm { label } } }\n    }\n  }\n"): typeof import('./graphql').RegisterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAttendance($armId: ID!, $date: Date!, $entries: [AttendanceEntry!]!) {\n    markAttendance(armId: $armId, date: $date, entries: $entries) {\n      saved\n      conflicts { studentId serverStatus }\n    }\n  }\n"): typeof import('./graphql').MarkAttendanceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AttendanceClasses($all: Boolean!) {\n    myClasses { classArms { id label studentCount } }\n    arms @include(if: $all) { id label studentCount }\n  }\n"): typeof import('./graphql').AttendanceClassesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AuditLog($prefix: String, $offset: Int!) {\n    auditLog(actionPrefix: $prefix, offset: $offset, limit: 50) { total items { id action summary userName viaSupport createdAt } }\n  }\n"): typeof import('./graphql').AuditLogDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlatformSchools($search: String, $offset: Int!) {\n    platformOverview { schools activeStudents onTrial pendingSenders { schoolId schoolName senderId } }\n    platformSchools(search: $search, offset: $offset, limit: 50) {\n      total\n      items {\n        id name slug status accessMode plan studentCount trialEndsAt lastActivityAt createdAt smsSenderId smsSenderStatus\n        usage { signIns7d activeUsers7d smsUnits30d collected30dKobo onlineShare30d unpaidInvoices }\n      }\n    }\n  }\n"): typeof import('./graphql').PlatformSchoolsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetSchoolStatus($schoolId: ID!, $status: String!, $reason: String!) { setSchoolStatus(schoolId: $schoolId, status: $status, reason: $reason) { id status } }\n"): typeof import('./graphql').SetSchoolStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SetSenderStatus($schoolId: ID!, $status: String!) { setSenderIdStatus(schoolId: $schoolId, status: $status) }"): typeof import('./graphql').SetSenderStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreditSms($schoolId: ID!, $units: Int!, $reason: String!) { creditSmsUnits(schoolId: $schoolId, units: $units, reason: $reason) }\n"): typeof import('./graphql').CreditSmsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OwnerDashboard {\n    ownerDashboard {\n      termLabel\n      activeStudents\n      classesPublished\n      classesTotal\n      studentsByLevel { level students }\n      fees { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n    }\n  }\n"): typeof import('./graphql').OwnerDashboardDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyClasses {\n    myClasses {\n      classArms { id label studentCount }\n      subjectAssignments { id arm { id label } subject { id name } }\n    }\n  }\n"): typeof import('./graphql').MyClassesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BursarSummary($termId: ID!) {\n    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n  }\n"): typeof import('./graphql').BursarSummaryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FeesOverview($termId: ID!, $armId: ID, $offset: Int!) {\n    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }\n    debtors(armId: $armId, offset: $offset, limit: 50) { total totalBalanceKobo items { balanceKobo student { id fullName admissionNumber currentArm { label } } } }\n  }\n"): typeof import('./graphql').FeesOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GenerateBills($termId: ID!) { generateBills(termId: $termId) }\n"): typeof import('./graphql').GenerateBillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemindDebtors($body: String!) {\n    sendMessage(audience: \"debtors\", body: $body, showInApp: false) { id unitsUsed }\n  }\n"): typeof import('./graphql').RemindDebtorsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RecentPayments($method: String, $offset: Int!) {\n    payments(method: $method, offset: $offset, limit: 50) {\n      total\n      items {\n        id amountKobo method status receiptNumber reference paidAt\n        student { id fullName admissionNumber }\n        recordedBy { fullName }\n      }\n    }\n  }\n"): typeof import('./graphql').RecentPaymentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RecordPayment($studentId: ID!, $amountKobo: Kobo!, $method: String!, $paidAt: DateTime!, $reference: String!, $note: String!) {\n    recordPayment(studentId: $studentId, amountKobo: $amountKobo, method: $method, paidAt: $paidAt, reference: $reference, note: $note) {\n      id receiptNumber\n    }\n  }\n"): typeof import('./graphql').RecordPaymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentBalance($studentId: ID!) { ledger(studentId: $studentId) { balanceKobo } }\n"): typeof import('./graphql').StudentBalanceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FeeSetup($termId: ID!) {\n    feeItems { id name order }\n    levels { id name }\n    feeSchedules(termId: $termId) { id amountKobo isCompulsory levelId item { id } }\n  }\n"): typeof import('./graphql').FeeSetupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SaveFeeItem($name: String!, $order: Int!) { saveFeeItem(name: $name, order: $order) { id } }"): typeof import('./graphql').SaveFeeItemDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetFeeSchedule($termId: ID!, $schedules: [ScheduleInput!]!) {\n    setFeeSchedule(termId: $termId, schedules: $schedules) { id }\n  }\n"): typeof import('./graphql').SetFeeScheduleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Ledger($studentId: ID!) {\n    ledger(studentId: $studentId) {\n      balanceKobo chargedKobo paidKobo\n      openingBalance { amountKobo asOf note }\n      student { id fullName admissionNumber currentArm { label } }\n      bills { id broughtForwardKobo totalKobo term { id label } lines { id kind description amountKobo isOptional } }\n      payments { id amountKobo method status receiptNumber reference paidAt reversedReason }\n      discounts { id name kind value item { name } term { label } }\n    }\n    feeItems { id name }\n  }\n"): typeof import('./graphql').LedgerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetOpeningBalance($studentId: ID!, $amountKobo: Int, $asOf: Date, $note: String!) {\n    setOpeningBalance(studentId: $studentId, amountKobo: $amountKobo, asOf: $asOf, note: $note) { amountKobo }\n  }\n"): typeof import('./graphql').SetOpeningBalanceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddDiscount($studentId: ID!, $name: String!, $kind: String!, $value: Kobo!, $itemId: ID) {\n    addDiscount(studentId: $studentId, name: $name, kind: $kind, value: $value, itemId: $itemId) { id }\n  }\n"): typeof import('./graphql').AddDiscountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddBillItem($billId: ID!, $description: String!, $amountKobo: Kobo!, $itemId: ID, $reason: String!) {\n    addBillItem(billId: $billId, description: $description, amountKobo: $amountKobo, itemId: $itemId, reason: $reason) { id }\n  }\n"): typeof import('./graphql').AddBillItemDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveBillItem($lineId: ID!, $reason: String!) { removeBillItem(lineId: $lineId, reason: $reason) { id } }\n"): typeof import('./graphql').RemoveBillItemDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReversePayment($paymentId: ID!, $reason: String!) { reversePayment(paymentId: $paymentId, reason: $reason) { id status } }\n"): typeof import('./graphql').ReversePaymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ResendFailed($messageId: ID!) { resendFailed(messageId: $messageId) { id unitsUsed } }"): typeof import('./graphql').ResendFailedDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Messages($offset: Int!) {\n    smsWalletBalance\n    messages(offset: $offset, limit: 20) {\n      total\n      items {\n        id kind audience title body unitsUsed createdAt sendSms isAutomatic\n        arm { label }\n        delivery { queued sent delivered failed skipped }\n        failedRecipients { id phone error }\n      }\n    }\n  }\n"): typeof import('./graphql').MessagesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EstimateMessage($body: String!, $audience: String!, $armId: ID) {\n    estimateMessage(body: $body, audience: $audience, armId: $armId) { recipients units walletBalance senderId }\n  }\n"): typeof import('./graphql').EstimateMessageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendMessage($audience: String!, $body: String!, $title: String!, $armId: ID, $sendSms: Boolean!, $showInApp: Boolean!) {\n    sendMessage(audience: $audience, body: $body, title: $title, armId: $armId, sendSms: $sendSms, showInApp: $showInApp) { id unitsUsed }\n  }\n"): typeof import('./graphql').SendMessageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChildLedger($studentId: ID!) {\n    ledger(studentId: $studentId) {\n      balanceKobo\n      student { fullName admissionNumber currentArm { label } }\n      payments { id amountKobo method status receiptNumber paidAt }\n    }\n  }\n"): typeof import('./graphql').ChildLedgerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GiveConsent($studentIds: [ID!]!) { giveConsent(studentIds: $studentIds) { pending } }\n"): typeof import('./graphql').GiveConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation WithdrawMyConsent($studentId: ID!, $reason: String!) { withdrawMyConsent(studentId: $studentId, reason: $reason) { pending } }\n"): typeof import('./graphql').WithdrawMyConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyChildren {\n    myChildren {\n      balanceKobo\n      student { id fullName firstName admissionNumber currentArm { label } }\n      currentBill { totalKobo term { label } lines { id description amountKobo } }\n    }\n  }\n"): typeof import('./graphql').MyChildrenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartCheckout($payFor: [PayFor!]!, $callbackUrl: String!, $email: String) {\n    startCheckout(payFor: $payFor, callbackUrl: $callbackUrl, email: $email) {\n      reference authorizationUrl totalKobo convenienceFeeKobo\n    }\n  }\n"): typeof import('./graphql').StartCheckoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CheckoutStatus($reference: String!) {\n    checkoutStatus(reference: $reference) { reference status amountKobo }\n  }\n"): typeof import('./graphql').CheckoutStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Broadsheet($armId: ID!, $termId: ID!) {\n    broadsheet(armId: $armId, termId: $termId) {\n      armLabel status classSize classAverage isThirdTerm showPosition\n      subjects { id name }\n      missing { subject students }\n      students {\n        student { id fullName admissionNumber }\n        total average position cumulativeAverage cumulativePosition missingSubjects\n        subjects { subjectId total grade }\n      }\n    }\n  }\n"): typeof import('./graphql').BroadsheetDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClassReportInputs($armId: ID!, $termId: ID!) {\n    classReportInputs(armId: $armId, termId: $termId) {\n      traits { id name kind }\n      ratings { studentId traitId rating }\n      comments { studentId classTeacherComment principalComment suggestedClassTeacherComment suggestedPrincipalComment }\n    }\n  }\n"): typeof import('./graphql').ClassReportInputsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveReportComments($armId: ID!, $termId: ID!, $comments: [CommentInput!]!) {\n    saveReportComments(armId: $armId, termId: $termId, comments: $comments)\n  }\n"): typeof import('./graphql').SaveReportCommentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveTraitRatings($armId: ID!, $termId: ID!, $ratings: [RatingInput!]!) {\n    saveTraitRatings(armId: $armId, termId: $termId, ratings: $ratings)\n  }\n"): typeof import('./graphql').SaveTraitRatingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ApproveResults($armId: ID!, $termId: ID!) { approveResults(armId: $armId, termId: $termId) }"): typeof import('./graphql').ApproveResultsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UnlockResults($armId: ID!, $termId: ID!, $reason: String!) { unlockResults(armId: $armId, termId: $termId, reason: $reason) }"): typeof import('./graphql').UnlockResultsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishResults($armId: ID!, $termId: ID!, $publishAt: DateTime, $notify: Boolean!) {\n    publishResults(armId: $armId, termId: $termId, publishAt: $publishAt, notifyParents: $notify)\n  }\n"): typeof import('./graphql').PublishResultsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation GenerateReportCards($armId: ID!, $termId: ID!) { generateReportCards(armId: $armId, termId: $termId) }"): typeof import('./graphql').GenerateReportCardsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClassResultStatuses($termId: ID!) {\n    classResultStatuses(termId: $termId) { armId armLabel status publishAt missingCells }\n  }\n"): typeof import('./graphql').ClassResultStatusesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyResultArms {\n    myClasses { classArms { id label } }\n  }\n"): typeof import('./graphql').MyResultArmsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ScoreSheet($armId: ID!, $subjectId: ID!, $termId: ID!) {\n    scoreSheet(armId: $armId, subjectId: $subjectId, termId: $termId) {\n      armLabel\n      locked\n      status\n      subject { id name }\n      components { id name maxScore }\n      students { id fullName admissionNumber }\n      scores { studentId componentId value }\n    }\n  }\n"): typeof import('./graphql').ScoreSheetDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveScores($armId: ID!, $subjectId: ID!, $termId: ID!, $entries: [ScoreEntry!]!) {\n    saveScores(armId: $armId, subjectId: $subjectId, termId: $termId, entries: $entries) {\n      saved\n      conflicts { studentId componentId serverValue }\n    }\n  }\n"): typeof import('./graphql').SaveScoresDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ScoreTargets {\n    myClasses { subjectAssignments { id arm { id label } subject { id name } } }\n  }\n"): typeof import('./graphql').ScoreTargetsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllClassesAndSubjects {\n    levels { id name arms { id label } levelSubjects { subject { id name } } }\n  }\n"): typeof import('./graphql').AllClassesAndSubjectsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AcademicSetup {\n    sessions { id name startDate endDate isCurrent }\n    terms { id number label startDate endDate daysOpened nextTermBegins isCurrent session { id } }\n    levels {\n      id name section order hasSubjectSelection reportTemplate\n      gradingScale { id name }\n      nextLevel { id name }\n      arms { id name label studentCount classTeacher { id user { fullName } } }\n      components { id name maxScore }\n      levelSubjects { category subject { id name } }\n    }\n    staff { id user { fullName } }\n    gradingScales { id name bands { grade minScore maxScore remark } }\n    subjects { id name }\n  }\n"): typeof import('./graphql').AcademicSetupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SaveSession($name: String!, $startDate: Date!, $endDate: Date!) { saveSession(name: $name, startDate: $startDate, endDate: $endDate) { id } }"): typeof import('./graphql').SaveSessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveTerm($id: ID, $sessionId: ID!, $number: Int!, $startDate: Date!, $endDate: Date!, $daysOpened: Int!, $nextTermBegins: Date) {\n    saveTerm(id: $id, sessionId: $sessionId, number: $number, startDate: $startDate, endDate: $endDate, daysOpened: $daysOpened, nextTermBegins: $nextTermBegins) { id }\n  }\n"): typeof import('./graphql').SaveTermDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SetCurrentTerm($termId: ID!) { setCurrentTerm(termId: $termId) { id } }"): typeof import('./graphql').SetCurrentTermDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SaveArm($id: ID, $levelId: ID!, $name: String!, $classTeacherId: ID) { saveArm(id: $id, levelId: $levelId, name: $name, classTeacherId: $classTeacherId) { id } }"): typeof import('./graphql').SaveArmDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetComponents($levelId: ID!, $components: [ComponentInput!]!) { setAssessmentComponents(levelId: $levelId, components: $components) { id } }\n"): typeof import('./graphql').SetComponentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Billing {\n    billing {\n      plan { name pricePerStudentKobo minimumKobo }\n      accessMode trialEndsAt inTrial graceDays activeStudents outstandingKobo\n      invoices { id number periodLabel studentCount pricePerStudentKobo amountKobo dueDate status paidAt paidVia readOnlyFrom isOverdue pdfUrl }\n      smsBalance smsUnitPriceKobo smsMinUnits smsMaxUnits\n      smsPurchases { id units amountKobo reason createdAt }\n      bank { bankName accountNumber accountName }\n      billingEmail\n    }\n  }\n"): typeof import('./graphql').BillingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PayInvoice($invoiceId: ID!, $returnPath: String!) { payInvoice(invoiceId: $invoiceId, returnPath: $returnPath) { authorizationUrl } }\n"): typeof import('./graphql').PayInvoiceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation BuySmsUnits($units: Int!, $returnPath: String!) { buySmsUnits(units: $units, returnPath: $returnPath) { authorizationUrl } }\n"): typeof import('./graphql').BuySmsUnitsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConfirmPlatformPayment($reference: String!) {\n    confirmPlatformPayment(reference: $reference) { reference status purpose units amountKobo invoiceNumber smsBalance }\n  }\n"): typeof import('./graphql').ConfirmPlatformPaymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SchoolSettings {\n    school { name motto address phone email primaryColor secondaryColor }\n    schoolSettings {\n      showClassPosition admissionNumberFormat admissionNumberPrefix resultDebtThresholdKobo transactionChargeBearer\n      smsSenderId smsSenderStatus notifyParentOnAbsence reportTemplate principalTitle\n      feeRemindersEnabled feeReminderEveryDays feeReminderMinBalanceKobo feeReminderTemplate\n    }\n    supportGrants { id reason expiresAt grantedBy }\n    schoolBranding { logoUrl signatureUrl stampUrl }\n  }\n"): typeof import('./graphql').SchoolSettingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSchoolSettings($name: String, $motto: String, $address: String, $phone: String, $email: String, $primaryColor: String, $settingsJson: JSON) {\n    updateSchoolSettings(name: $name, motto: $motto, address: $address, phone: $phone, email: $email, primaryColor: $primaryColor, settingsJson: $settingsJson) {\n      showClassPosition\n    }\n  }\n"): typeof import('./graphql').UpdateSchoolSettingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FeeReminderStatus { feeReminderStatus { enabled nextDueOn lastSentAt recipients units walletBalance sample } }\n"): typeof import('./graphql').FeeReminderStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation GrantSupport($reason: String!, $hours: Int!) { grantSupportAccess(reason: $reason, hours: $hours) { id } }"): typeof import('./graphql').GrantSupportDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RevokeSupport($id: ID!) { revokeSupportAccess(grantId: $id) }"): typeof import('./graphql').RevokeSupportDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ConsentOverview {\n    consentOverview(limit: 50) {\n      notice { version body publishedAt }\n      activeStudents withConsent dpaVersion dpaAcceptedAt dpaAcceptedBy\n      missing { id fullName admissionNumber currentArm { label } }\n    }\n  }\n"): typeof import('./graphql').ConsentOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishPrivacyNotice($body: String!) { publishPrivacyNotice(body: $body) { version } }\n"): typeof import('./graphql').PublishPrivacyNoticeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PromotionSessions { sessions { id name startDate isCurrent } schoolSettings { promotionPassMark } }\n"): typeof import('./graphql').PromotionSessionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PromotionPreview($from: ID!, $to: ID!, $passMark: Float) {\n    promotionPreview(fromSessionId: $from, toSessionId: $to, passMark: $passMark) {\n      arm { id label } movesTo\n      rows { student { id fullName admissionNumber } average suggestion }\n    }\n  }\n"): typeof import('./graphql').PromotionPreviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PromoteSchool($from: ID!, $to: ID!, $decisions: [PromotionDecision!]!, $passMark: Float) {\n    promoteSchool(fromSessionId: $from, toSessionId: $to, decisions: $decisions, passMark: $passMark) { promoted repeated graduated }\n  }\n"): typeof import('./graphql').PromoteSchoolDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Staff {\n    staff { id title isActive user { id fullName phone email } roles { code name } }\n    roles { code name isSystem }\n    levels { id arms { id label } levelSubjects { subject { id name } } }\n    subjectAssignments { id arm { label } subject { name } teacher { user { fullName } } }\n  }\n"): typeof import('./graphql').StaffDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddStaff($firstName: String!, $lastName: String!, $phone: String, $email: String, $roleCodes: [String!]!) {\n    addStaff(firstName: $firstName, lastName: $lastName, phone: $phone, email: $email, roleCodes: $roleCodes) { id }\n  }\n"): typeof import('./graphql').AddStaffDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetStaffRoles($id: ID!, $roleCodes: [String!]!, $isActive: Boolean!) {\n    setStaffRoles(membershipId: $id, roleCodes: $roleCodes, isActive: $isActive) { id }\n  }\n"): typeof import('./graphql').SetStaffRolesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AssignSubjectTeacher($armId: ID!, $subjectId: ID!, $teacherId: ID!) {\n    assignSubjectTeacher(armId: $armId, subjectId: $subjectId, teacherId: $teacherId) { id }\n  }\n"): typeof import('./graphql').AssignSubjectTeacherDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyStudent { myStudent { id fullName firstName admissionNumber currentArm { label } } }\n"): typeof import('./graphql').MyStudentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentProfile($id: ID!, $withFees: Boolean!, $withSubjects: Boolean!) {\n    student(id: $id) {\n      id fullName firstName middleName lastName admissionNumber gender dateOfBirth admittedOn status examNumbers photoUrl\n      medicalNotes emergencyContactName emergencyContactPhone\n      currentArm { id label levelId }\n      guardianLinks { relationship isPrimary guardian { id title firstName lastName phone email } }\n    }\n    ledger(studentId: $id) @include(if: $withFees) { balanceKobo chargedKobo paidKobo }\n    studentSubjects(studentId: $id) @include(if: $withSubjects) { id name }\n  }\n"): typeof import('./graphql').StudentProfileDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LevelElectives {\n    levels { id hasSubjectSelection levelSubjects { category subject { id name } } }\n  }\n"): typeof import('./graphql').LevelElectivesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeStudentStatus($id: ID!, $status: String!, $reason: String!) {\n    changeStudentStatus(id: $id, status: $status, reason: $reason) { id status }\n  }\n"): typeof import('./graphql').ChangeStudentStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClassStudentLogins($armId: ID) {\n    students(armId: $armId, status: \"active\", limit: 200) { total items { id fullName admissionNumber hasLogin currentArm { label } } }\n  }\n"): typeof import('./graphql').ClassStudentLoginsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateStudentLogins($armId: ID!) {\n    createStudentLogins(armId: $armId) { password student { id fullName admissionNumber currentArm { label } } }\n  }\n"): typeof import('./graphql').CreateStudentLoginsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetStudentPassword($studentId: ID!) {\n    resetStudentPassword(studentId: $studentId) { password student { id fullName admissionNumber currentArm { label } } }\n  }\n"): typeof import('./graphql').ResetStudentPasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateStudent($data: StudentInput!, $guardians: [GuardianInput!]!) {\n    createStudent(data: $data, guardians: $guardians) { id }\n  }\n"): typeof import('./graphql').CreateStudentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Students($armId: ID, $search: String, $status: String, $offset: Int!) {\n    students(armId: $armId, search: $search, status: $status, offset: $offset, limit: 50) {\n      total\n      items { id fullName admissionNumber gender status currentArm { id label } }\n    }\n  }\n"): typeof import('./graphql').StudentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConfirmEmail($token: String!) { confirmEmail(token: $token) { email schoolName schoolUrl } }\n"): typeof import('./graphql').ConfirmEmailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestReset($identifier: String!) {\n    requestPasswordReset(identifier: $identifier)\n  }\n"): typeof import('./graphql').RequestResetDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPassword($identifier: String!, $code: String!, $newPassword: String!) {\n    resetPassword(identifier: $identifier, code: $code, newPassword: $newPassword)\n  }\n"): typeof import('./graphql').ResetPasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($identifier: String!, $password: String!) {\n    login(identifier: $identifier, password: $password) {\n      permissions\n      isPlatformAdmin\n      mustChangePassword\n    }\n  }\n"): typeof import('./graphql').LoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PublicPrivacyNotice {\n    privacyNotice { version body publishedAt schoolName }\n  }\n"): typeof import('./graphql').PublicPrivacyNoticeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SignUpSchool(\n    $name: String!\n    $slug: String!\n    $adminFirstName: String!\n    $adminLastName: String!\n    $adminPhone: String!\n    $adminEmail: String\n    $password: String!\n    $sections: [String!]!\n    $accept: Boolean!\n  ) {\n    signUpSchool(\n      name: $name\n      slug: $slug\n      adminFirstName: $adminFirstName\n      adminLastName: $adminLastName\n      adminPhone: $adminPhone\n      adminEmail: $adminEmail\n      password: $password\n      sections: $sections\n      acceptDataProcessingAgreement: $accept\n    ) {\n      slug\n      schoolUrl\n      confirmationSentTo\n    }\n  }\n"): typeof import('./graphql').SignUpSchoolDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): typeof import('./graphql').LogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Notices {\n    notices(limit: 5) { id title body createdAt }\n  }\n"): typeof import('./graphql').NoticesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PayoutAccount { payoutAccount { connected bankName accountNumber accountName canChange } }\n"): typeof import('./graphql').PayoutAccountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PayoutBanks { payoutBanks { code name } }"): typeof import('./graphql').PayoutBanksDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResolvePayoutAccount($bankCode: String!, $accountNumber: String!) { resolvePayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) }\n"): typeof import('./graphql').ResolvePayoutAccountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConnectPayoutAccount($bankCode: String!, $accountNumber: String!) {\n    connectPayoutAccount(bankCode: $bankCode, accountNumber: $accountNumber) { connected }\n  }\n"): typeof import('./graphql').ConnectPayoutAccountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlatformInvoices($status: String) {\n    platformInvoices(status: $status) {\n      schoolName schoolSlug\n      invoice { id number periodLabel studentCount amountKobo dueDate status paidAt paidVia paymentReference voidReason isOverdue readOnlyFrom }\n    }\n  }\n"): typeof import('./graphql').PlatformInvoicesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation GenerateInvoices { generateInvoices { schoolName invoice { number } } }"): typeof import('./graphql').GenerateInvoicesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkInvoicePaid($invoiceId: ID!, $reference: String!) { markInvoicePaid(invoiceId: $invoiceId, reference: $reference) { id status } }\n"): typeof import('./graphql').MarkInvoicePaidDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VoidInvoice($invoiceId: ID!, $reason: String!) { voidInvoice(invoiceId: $invoiceId, reason: $reason) { id status } }\n"): typeof import('./graphql').VoidInvoiceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChildResult($studentId: ID!, $termId: ID!) {\n    childResult(studentId: $studentId, termId: $termId) {\n      visible reason classSize classAverage reportCardUrl\n      result {\n        total average position cumulativeAverage cumulativePosition\n        student { fullName currentArm { label } }\n        subjects { subjectId subjectName total grade remark position cumulativeAverage cumulativeGrade }\n      }\n    }\n  }\n"): typeof import('./graphql').ChildResultDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChildAttendance($studentId: ID!, $termId: ID!) {\n    attendanceHistory(studentId: $studentId, termId: $termId) { id date status }\n  }\n"): typeof import('./graphql').ChildAttendanceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveLevel(\n    $id: ID\n    $name: String!\n    $section: String!\n    $gradingScaleId: ID\n    $nextLevelId: ID\n    $hasSubjectSelection: Boolean!\n    $reportTemplate: String!\n  ) {\n    saveLevel(\n      id: $id\n      name: $name\n      section: $section\n      gradingScaleId: $gradingScaleId\n      nextLevelId: $nextLevelId\n      hasSubjectSelection: $hasSubjectSelection\n      reportTemplate: $reportTemplate\n    ) {\n      id\n    }\n  }\n"): typeof import('./graphql').SaveLevelDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SaveSubject($name: String!) { saveSubject(name: $name) { id name } }"): typeof import('./graphql').SaveSubjectDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetLevelSubjects($levelId: ID!, $subjects: [LevelSubjectInput!]!) { setLevelSubjects(levelId: $levelId, subjects: $subjects) { id } }\n"): typeof import('./graphql').SetLevelSubjectsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveGradingScale($id: ID, $name: String!, $bands: [BandInput!]!) { saveGradingScale(id: $id, name: $name, bands: $bands) { id } }\n"): typeof import('./graphql').SaveGradingScaleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentConsent($studentId: ID!) {\n    studentConsent(studentId: $studentId) {\n      noticeVersion\n      guardians { guardianId guardianName relationship consent { id source givenAt recordedBy } }\n      history { id guardianName noticeVersion source givenAt recordedBy withdrawnAt withdrawalReason }\n    }\n  }\n"): typeof import('./graphql').StudentConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RecordPaperConsent($studentId: ID!, $guardianId: ID!, $givenOn: Date!) {\n    recordPaperConsent(studentId: $studentId, guardianId: $guardianId, givenOn: $givenOn)\n  }\n"): typeof import('./graphql').RecordPaperConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RecordConsentWithdrawal($consentId: ID!, $reason: String!) { recordConsentWithdrawal(consentId: $consentId, reason: $reason) }\n"): typeof import('./graphql').RecordConsentWithdrawalDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateStudent($id: ID!, $data: StudentInput!) { updateStudent(id: $id, data: $data) { id } }\n"): typeof import('./graphql').UpdateStudentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddGuardian($studentId: ID!, $guardian: GuardianInput!) { addGuardian(studentId: $studentId, guardian: $guardian) { id } }\n"): typeof import('./graphql').AddGuardianDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetStudentSubjects($studentId: ID!, $subjectIds: [ID!]!) { setStudentSubjects(studentId: $studentId, subjectIds: $subjectIds) { id } }\n"): typeof import('./graphql').SetStudentSubjectsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Arms {\n    arms { id label levelId studentCount }\n  }\n"): typeof import('./graphql').ArmsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Terms {\n    terms { id label number isCurrent session { id name } }\n  }\n"): typeof import('./graphql').TermsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentSearch($search: String!) {\n    students(search: $search, limit: 8) { items { id fullName admissionNumber currentArm { label } } }\n  }\n"): typeof import('./graphql').StudentSearchDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyConsent {\n    myConsent {\n      pending\n      notice { version body publishedAt schoolName }\n      children { consented givenAt source student { id fullName firstName currentArm { label } } }\n    }\n  }\n"): typeof import('./graphql').MyConsentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResendEmailConfirmation($identifier: String!) { resendEmailConfirmation(identifier: $identifier) }\n"): typeof import('./graphql').ResendEmailConfirmationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      permissions\n      roles\n      accessMode\n      isPlatformAdmin\n      viaSupport\n      mustChangePassword\n      user { id fullName firstName phone email }\n      membership { id }\n      billingAlert { kind date invoice { number periodLabel amountKobo studentCount } }\n    }\n    school { name slug motto address phone email primaryColor secondaryColor logoUrl }\n    currentTerm { id label number isCurrent session { id name } }\n  }\n"): typeof import('./graphql').MeDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
