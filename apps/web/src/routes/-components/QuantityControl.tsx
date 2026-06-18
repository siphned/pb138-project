import { Add01Icon, Remove01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

type QuantityControlProps = {
  value: number;
  min?: number;
  max?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
};

export function QuantityControl({
  value,
  min = 1,
  max,
  onIncrement,
  onDecrement,
  disabled,
}: QuantityControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="h-8 w-8"
        disabled={disabled || value <= min}
        onClick={onDecrement}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={Remove01Icon} />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      <Button
        className="h-8 w-8"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={onIncrement}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}
