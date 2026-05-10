import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubPage } from "@/components/dev/StubPage";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetWines } from "@/generated/hooks/useGetWines";

export const Route = createFileRoute("/")({
  component: HomeStub,
});

function HomeStub() {
  const winesQuery = useGetWines();
  const winemakersQuery = useGetWinemakers();
  const eventsQuery = useGetEvents();
  return (
    <StubPage
      actorRole="guest+"
      hookName="useGetWines + useGetWinemakers + useGetEvents (limited)"
      title="Home / Featured"
    >
      <StubGet
        actorRole="guest+"
        hookName="useGetWines"
        query={winesQuery}
        title="Featured wines"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetWinemakers"
        query={winemakersQuery}
        title="Featured winemakers"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetEvents"
        query={eventsQuery}
        title="Featured events"
      />
    </StubPage>
  );
}
