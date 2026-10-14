"use client";

import { IconMessage } from "@/components/icons";
import { Card, Empty, Loading } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";

const NoticesDocument = graphql(`
  query Notices {
    notices(limit: 5) { id title body createdAt }
  }
`);

/** The latest in-app announcements for whoever is signed in: staff, or a parent (school-wide and their children's classes). */
export function NoticesCard({ emptyText }: { emptyText: string }) {
  const notices = useGql(NoticesDocument, {});
  return (
    <Card title="Notices" description="Announcements from the school">
      {notices.isLoading ? (
        <Loading />
      ) : notices.data?.notices.length ? (
        <ul className="divide-y divide-line">
          {notices.data.notices.map((n) => (
            <li key={n.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm font-medium text-ink">{n.title || "Announcement"}</div>
                <time className="flex-none text-xs text-muted">{new Date(n.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</time>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">{n.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="No notices yet" icon={<IconMessage size={18} />}>{emptyText}</Empty>
      )}
    </Card>
  );
}
