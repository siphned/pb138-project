import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

type QuantityControlProps = {
  value: number;
  min?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
};

export function QuantityControl({
  value,
  min = 1,
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
        <HugeiconsIcon className="h-4 w-4" icon={MinusSignIcon} />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      <Button
        className="h-8 w-8"
        disabled={disabled}
        onClick={onIncrement}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={PlusSignIcon} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}
