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
