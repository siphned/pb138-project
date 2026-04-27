import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  let _values: number[];
  if (Array.isArray(value)) {
    _values = value;
  } else if (Array.isArray(defaultValue)) {
    _values = defaultValue;
  } else {
    _values = [min, max];
  }

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={value !== undefined ? undefined : defaultValue}
      max={max}
      min={min}
      thumbAlignment="edge"
      value={value}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          className="relative grow overflow-hidden rounded-4xl bg-primary/30 select-none data-horizontal:h-3 data-horizontal:w-full data-vertical:h-full data-vertical:w-3"
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            className="block size-4 shrink-0 rounded-4xl border border-primary bg-white shadow-sm ring-ring/50 transition-colors select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            data-slot="slider-thumb"
            key={index}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
