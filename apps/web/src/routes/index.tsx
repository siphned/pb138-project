import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetEvents } from "@/generated/hooks/useGetEvents";

export const Route = createFileRoute("/")({
  component: HomeStub,
});

function HomeStub() {
  const winesQuery = useGetWines();
  const winemakersQuery = useGetWinemakers();
  const eventsQuery = useGetEvents();
  return (
    <StubPage
      title="Home / Featured"
      actorRole="guest+"
      hookName="useGetWines + useGetWinemakers + useGetEvents (limited)"
    >
      <StubGet title="Featured wines" actorRole="guest+" hookName="useGetWines" query={winesQuery} />
      <StubGet title="Featured winemakers" actorRole="guest+" hookName="useGetWinemakers" query={winemakersQuery} />
      <StubGet title="Featured events" actorRole="guest+" hookName="useGetEvents" query={eventsQuery} />
    </StubPage>
  );
}
