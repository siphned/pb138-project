import { MapPinIcon, ShippingTruck01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeliveryMethodToggleProps = {
  value: "pickup" | "shipping";
  onChange: (value: "pickup" | "shipping") => void;
};

const optionClasses = (active: boolean) =>
  cn(
    "flex items-center justify-center gap-2 border-2 p-8",
    active
      ? "border-primary bg-primary/5 text-primary"
      : "border-border bg-muted text-muted-foreground"
  );

export function DeliveryMethodToggle({ value, onChange }: DeliveryMethodToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        className={optionClasses(value === "pickup")}
        onClick={() => onChange("pickup")}
        type="button"
        variant="ghost"
      >
        <HugeiconsIcon className="h-6 w-6" icon={MapPinIcon} />
        <span className="text-xs font-semibold">Personal Pickup</span>
      </Button>
      <Button
        className={optionClasses(value === "shipping")}
        onClick={() => onChange("shipping")}
        type="button"
        variant="ghost"
      >
        <HugeiconsIcon className="h-6 w-6" icon={ShippingTruck01Icon} />
        <span className="text-xs font-semibold">Home Delivery</span>
      </Button>
    </div>
  );
}
