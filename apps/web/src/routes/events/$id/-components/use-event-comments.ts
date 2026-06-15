import { useInfiniteQuery } from "@tanstack/react-query";
import { getEventsByIdComments } from "@/generated/clients/getEventsByIdComments";

const PAGE_SIZE = 10;

export interface EventComment {
  id: string;
  body: string;
  createdAt: string;
  eventId: string;
  userId: string;
  user: { id: string; fname: string; lname: string };
}

interface EventCommentsPage {
  data: EventComment[];
  total: number;
  page: number;
  limit: number;
}

export function eventCommentsQueryKey(eventId: string) {
  return ["events", eventId, "comments", "infinite"] as const;
}

export function useEventComments(eventId: string) {
  return useInfiniteQuery({
    enabled: !!eventId,
    getNextPageParam: (lastPage: EventCommentsPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }: { pageParam: number; signal: AbortSignal }) => {
      const res = await getEventsByIdComments(
        eventId,
        { limit: PAGE_SIZE, page: pageParam },
        { signal }
      );
      return res as EventCommentsPage;
    },
    queryKey: eventCommentsQueryKey(eventId),
  });
}
