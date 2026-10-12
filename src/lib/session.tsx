"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { graphql } from "@/gql";
import type { MeQuery } from "@/gql/graphql";

import { useGql } from "./api";

export const MeDocument = graphql(`
  query Me {
    me {
      permissions
      roles
      accessMode
      isPlatformAdmin
      viaSupport
      mustChangePassword
      user { id fullName firstName phone email }
      membership { id }
      billingAlert { kind date invoice { number periodLabel amountKobo studentCount } }
    }
    school { name slug motto address phone email primaryColor secondaryColor logoUrl }
    currentTerm { id label number isCurrent session { id name } }
  }
`);

export type Me = NonNullable<MeQuery["me"]>;
export type School = NonNullable<MeQuery["school"]>;
export type CurrentTerm = MeQuery["currentTerm"];

interface SessionValue {
  loading: boolean;
  error?: Error;
  me: Me | null;
  school: School | null;
  term: CurrentTerm | null;
  can: (...perms: string[]) => boolean;
  refresh: () => Promise<unknown>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useGql(MeDocument, {});
  const value = useMemo<SessionValue>(() => {
    const me = data?.me ?? null;
    const granted = new Set(me?.permissions ?? []);
    return {
      loading: isLoading,
      error,
      me,
      school: data?.school ?? null,
      term: data?.currentTerm ?? null,
      can: (...perms) => perms.some((p) => granted.has(p)),
      refresh: () => mutate(),
    };
  }, [data, error, isLoading, mutate]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
