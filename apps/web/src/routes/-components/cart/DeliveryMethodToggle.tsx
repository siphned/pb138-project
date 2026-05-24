import { MapPinIcon, TruckIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeliveryMethodToggleProps = {
  value: "pickup" | "shipping";
  onChange: (value: "pickup" | "shipping") => void;
};

export function DeliveryMethodToggle({ value, onChange }: DeliveryMethodToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        className={cn(
          "flex p-8 items-center justify-center gap-2 border-2",
          value === "pickup"
            ? "border-primary bg-primary/5 text-primary"
            : "border-secondary bg-secondary/20 text-secondary-foreground"
        )}
        onClick={() => onChange("pickup")}
        type="button"
        variant="ghost"
      >
        <MapPinIcon className="h-6 w-6" />
        <span className="text-xs font-semibold">Personal Pickup</span>
      </Button>
      <Button
        className={cn(
          "flex p-8 items-center justify-center gap-2 border-2",
          value === "shipping"
            ? "border-primary bg-primary/5 text-primary"
            : "border-secondary bg-secondary/20 text-secondary-foreground"
        )}
        onClick={() => onChange("shipping")}
        type="button"
        variant="ghost"
      >
        <TruckIcon className="h-6 w-6" />
        <span className="text-xs font-semibold">Home Delivery</span>
      </Button>
    </div>
  );
}
