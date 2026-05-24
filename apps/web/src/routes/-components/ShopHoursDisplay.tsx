<<<<<<< HEAD
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetShopsByIdAvailability } from "@/generated/hooks/useGetShopsByIdAvailability";
import { cn } from "@/lib/utils";
=======
import { useGetShopsByIdAvailability } from "@/generated/hooks/useGetShopsByIdAvailability";
>>>>>>> origin/main

interface ShopHoursDisplayProps {
  shopId: string;
}

<<<<<<< HEAD
interface RegularEntry {
  dow: string | number;
  startTime: string | number;
  endTime: string | number;
}

interface HourGroup {
  startDow: number;
  endDow: number;
  startAdjusted: number;
  endAdjusted: number;
  startTimeStr: string;
  endTimeStr: string;
}

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const date = timeString.includes("T")
    ? new Date(timeString)
    : new Date(`1970-01-01T${timeString}`);
  return Number.isNaN(date.getTime())
    ? timeString
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getAdjustedDow = (dow: number) => (dow === 0 ? 7 : dow);

const toGroup = (entry: RegularEntry): HourGroup => {
  const dow = Number(entry.dow);
  const adjusted = getAdjustedDow(dow);
  return {
    endAdjusted: adjusted,
    endDow: dow,
    endTimeStr: formatTime(entry.endTime.toString()),
    startAdjusted: adjusted,
    startDow: dow,
    startTimeStr: formatTime(entry.startTime.toString()),
  };
};

const groupRegularHours = (entries: RegularEntry[]): HourGroup[] => {
  const sorted = [...entries].sort(
    (a, b) => getAdjustedDow(Number(a.dow)) - getAdjustedDow(Number(b.dow))
  );
  if (sorted.length === 0) return [];

  const groups: HourGroup[] = [];
  let current = toGroup(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const next = toGroup(sorted[i]);
    const consecutive = next.startAdjusted === current.endAdjusted + 1;
    const sameHours =
      next.startTimeStr === current.startTimeStr && next.endTimeStr === current.endTimeStr;

    if (consecutive && sameHours) {
      current.endDow = next.startDow;
      current.endAdjusted = next.startAdjusted;
    } else {
      groups.push(current);
      current = next;
    }
  }
  groups.push(current);
  return groups;
};

const formatDayLabel = (group: HourGroup) =>
  group.startDow === group.endDow
    ? DOW_NAMES[group.startDow]
    : `${DOW_NAMES[group.startDow].slice(0, 3)} – ${DOW_NAMES[group.endDow].slice(0, 3)}`;

=======
const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

>>>>>>> origin/main
export function ShopHoursDisplay({ shopId }: ShopHoursDisplayProps) {
  const { data, isLoading } = useGetShopsByIdAvailability(shopId);

  if (isLoading) {
<<<<<<< HEAD
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  const regular = data?.regular ?? [];
  const exceptions = data?.exceptions ?? [];

  if (regular.length === 0 && exceptions.length === 0) {
    return <p className="text-muted-foreground italic text-xs">No hours listed.</p>;
  }

  const groupedHours = groupRegularHours(regular);

  return (
    <div className="flex items-baseline space-x-5">
      {groupedHours.length > 0 && (
        <div className="space-y-1.5">
          {groupedHours.map((group) => (
            <div className="flex space-x-2 text-xs" key={`${group.startDow}-${group.endDow}`}>
              <span className="font-medium text-muted-foreground">{`${formatDayLabel(group)}:`}</span>
              <span className="font-semibold text-foreground">
                {group.startTimeStr} – {group.endTimeStr}
              </span>
            </div>
          ))}
        </div>
      )}

      {exceptions.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <Popover>
            <PopoverTrigger
              render={
                <button
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80"
                  type="button"
                />
              }
            >
              <HugeiconsIcon className="h-3 w-3" icon={AlertCircleIcon} />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-4">
              <h4 className="mb-3 text-sm font-bold">Holiday & Special Hours</h4>
              <div className="space-y-3">
                {exceptions.map((ex) => {
                  const start = new Date(ex.startsAt.toString());
                  const end = new Date(ex.endsAt.toString());
                  const isSameDay = start.toDateString() === end.toDateString();

                  return (
                    <div className="space-y-1 text-xs" key={ex.id}>
                      <div className="flex justify-between font-bold">
                        <span>
                          {start.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] uppercase tracking-tight",
                            ex.action === "closed"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {ex.action}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {isSameDay ? (
                          <span>
                            {formatTime(ex.startsAt.toString())} –{" "}
                            {formatTime(ex.endsAt.toString())}
                          </span>
                        ) : (
                          <span>
                            Until{" "}
                            {end.toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                      {ex.reason && <p className="italic text-muted-foreground/70">{ex.reason}</p>}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
=======
    return <div className="h-20 w-full animate-pulse rounded-lg bg-secondary/20" />;
  }

  if (!data?.regular || data.regular.length === 0) {
    return <p className="text-muted-foreground italic">No regular hours listed.</p>;
  }

  // Sort by day of week
  const sortedHours = [...data.regular].sort((a, b) => Number(a.dow) - Number(b.dow));

  return (
    <div className="space-y-1">
      {sortedHours.map((entry) => (
        <div className="flex justify-between text-xs" key={entry.id}>
          <span className="font-medium">{DOW_NAMES[Number(entry.dow)]}</span>
          <span>
            {entry.startTime} – {entry.endTime}
          </span>
        </div>
      ))}
>>>>>>> origin/main
    </div>
  );
}
