import { useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";
import { TabPreviewShell } from "@/routes/_authenticated/-components/TabPreviewShell";

interface ModerationReviewRow {
  id: string;
  body?: string;
  rating?: number;
  createdAt?: string | number;
  user?: { fname?: string; lname?: string; email?: string };
}

function formatDate(value?: string | number) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminModerationTab() {
  const query = useGetAdminReviews();

  const raw = query.data;
  const list = (
    Array.isArray(raw) ? raw : ((raw as { data?: ModerationReviewRow[] } | undefined)?.data ?? [])
  ) as ModerationReviewRow[];
  const reviews = list.slice(0, 10);

  return (
    <TabPreviewShell
      emptyDescription="Reviews flagged by users will appear here for approval or removal."
      emptyTitle="No flagged reviews"
      // The full moderation page is where approve/delete happens, so always offer
      // the link out whenever there is anything flagged.
      hasMore={list.length > 0}
      isEmpty={!query.isLoading && reviews.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllLabel="Open moderation"
      viewAllTo="/moderation"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {reviews.map((r) => {
          const name =
            [r.user?.fname, r.user?.lname].filter(Boolean).join(" ") ||
            r.user?.email ||
            "Anonymous";
          const meta = [name, r.rating != null ? `${r.rating}/5` : null, formatDate(r.createdAt)]
            .filter(Boolean)
            .join(" · ");
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={r.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{r.body || "No text"}</p>
                <p className="text-xs text-muted-foreground">{meta}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </TabPreviewShell>
  );
}
