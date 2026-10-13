import { graphql } from "@/gql";

/** Queries used by more than one screen. */

export const ArmsDocument = graphql(`
  query Arms {
    arms { id label levelId studentCount }
  }
`);

export const TermsDocument = graphql(`
  query Terms {
    terms { id label number isCurrent session { id name } }
  }
`);

export const StudentSearchDocument = graphql(`
  query StudentSearch($search: String!) {
    students(search: $search, limit: 8) { items { id fullName admissionNumber currentArm { label } } }
  }
`);

/** A parent's children and their consent status under the school's current privacy notice. */
export const MyConsentDocument = graphql(`
  query MyConsent {
    myConsent {
      pending
      notice { version body publishedAt schoolName }
      children { consented givenAt source student { id fullName firstName currentArm { label } } }
    }
  }
`);

/** Ask for the account-confirmation email again. Always succeeds, whether or not the account exists. */
export const ResendConfirmationDocument = graphql(`
  mutation ResendEmailConfirmation($identifier: String!) { resendEmailConfirmation(identifier: $identifier) }
`);
