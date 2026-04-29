import { useGetShopsByIdAvailability } from "@/generated/hooks/useGetShopsByIdAvailability";

interface ShopHoursDisplayProps {
  shopId: string;
}

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ShopHoursDisplay({ shopId }: ShopHoursDisplayProps) {
  const { data, isLoading } = useGetShopsByIdAvailability(shopId);

  if (isLoading) {
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
    </div>
  );
}
