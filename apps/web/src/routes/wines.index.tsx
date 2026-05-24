import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWines } from "@/generated/hooks/useGetWines";
import {
  type GetWinesQueryParamsColorEnumKey,
  getWinesQueryParamsColorEnum,
} from "@/generated/types/GetWines";

const COLOR_VALUES = Object.values(getWinesQueryParamsColorEnum) as readonly string[];
const isColor = (v: unknown): v is GetWinesQueryParamsColorEnumKey =>
  typeof v === "string" && COLOR_VALUES.includes(v);

export const Route = createFileRoute("/wines/")({
  component: WinesListStub,
  validateSearch: (search) => ({
    color: isColor(search.color) ? search.color : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
    winemakerId: typeof search.winemakerId === "string" ? search.winemakerId : undefined,
  }),
});

function WinesListStub() {
  const search = Route.useSearch();
  // `q` isn't a BE param on /wines yet — strip it before passing to the hook.
  const { q: _q, ...apiSearch } = search;
  const query = useGetWines(apiSearch);
  return (
    <StubGet
      actorRole="guest+"
      hookName="useGetWines"
      query={query}
      title={`All wines${Object.keys(search).length ? " (filtered)" : ""}`}
    />
  );
}
