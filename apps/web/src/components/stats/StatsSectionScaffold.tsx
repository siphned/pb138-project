import { DataGrid } from "@/components/primitives/data-grid";
import { ErrorState } from "@/components/primitives/error-state";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const;

/**
 * Tile-shaped skeleton grid for stats sections — matches the `<StatTile>`
 * footprint so the layout doesn't shift when data arrives.
 */
export function StatTilesSkeleton({ count }: { count: number }) {
  const keys = SKELETON_KEYS.slice(0, Math.min(count, SKELETON_KEYS.length));
  return (
    <div data-slot="stat-tiles-skeleton">
      <DataGrid variant="gallery">
        {keys.map((k) => (
          <Skeleton className="h-24 rounded-2xl" key={k} />
        ))}
      </DataGrid>
    </div>
  );
}

interface StatsErrorStateProps {
  /** Display-name of the role the section is showing — `"winemaker"`, `"shop owner"`, etc. */
  roleLabel: string;
  /** True when the API responded 403 — we show a role-specific explanation. */
  isForbidden: boolean;
  onRetry: () => void;
}

/**
 * Friendlier error state for stats sections. Distinguishes 403 (role mismatch)
 * from generic failures so users can self-diagnose. 403 typically means the
 * caller's Clerk session metadata doesn't include the requested role — usually
 * fixed by signing out and back in after a role grant.
 */
export function StatsErrorState({ roleLabel, isForbidden, onRetry }: StatsErrorStateProps) {
  if (isForbidden) {
    return (
      <ErrorState
        message={`Your current session doesn't have an active ${roleLabel} role. If you were recently granted it, sign out and sign back in to refresh your token. Otherwise, ask an admin to assign the role.`}
        onRetry={onRetry}
        title={`No active ${roleLabel} role`}
      />
    );
  }
  return (
    <ErrorState
      message={`We couldn't load your ${roleLabel} stats.`}
      onRetry={onRetry}
      title="Stats unavailable"
    />
  );
}

/** Read a fetch/axios-style error and decide whether it's a 403. */
export function is403(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number }; status?: number };
  return maybe.response?.status === 403 || maybe.status === 403;
}
