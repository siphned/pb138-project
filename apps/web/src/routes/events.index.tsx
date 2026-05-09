import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetEvents } from "@/generated/hooks/useGetEvents";

export const Route = createFileRoute("/events/")({
  component: EventsListStub,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    winemakerId: typeof search.winemakerId === "string" ? search.winemakerId : undefined,
  }),
});

function EventsListStub() {
  const search = Route.useSearch();
  const query = useGetEvents(search);
  return (
    <StubGet
      title={`All events${Object.keys(search).length ? " (filtered)" : ""}`}
      role="guest+"
      hookName="useGetEvents"
      query={query}
    />
  );
}
