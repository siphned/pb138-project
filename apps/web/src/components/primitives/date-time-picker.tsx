import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  /** ISO string ("2026-06-15T14:00:00.000Z") or "" when empty. */
  value: string;
  onChange: (isoOrEmpty: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Earliest allowed date — anything before is disabled in the calendar. */
  minDate?: Date;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDisplay(iso: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeFromIso(iso: string): string {
  if (!iso) return "12:00";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "12:00";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateFromIso(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function combine(date: Date, time: string): string {
  const [h, m] = time.split(":").map((p) => Number(p) || 0);
  const out = new Date(date);
  out.setHours(h, m, 0, 0);
  return out.toISOString();
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled,
  minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const display = formatDisplay(value);
  const currentDate = dateFromIso(value);
  const currentTime = timeFromIso(value);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(combine(date, currentTime));
  };

  const handleTimeChange = (time: string) => {
    const base = currentDate ?? new Date();
    onChange(combine(base, time));
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !display && "text-muted-foreground"
            )}
            disabled={disabled}
            type="button"
            variant="outline"
          />
        }
      >
        <HugeiconsIcon className="mr-2 h-4 w-4" icon={Calendar03Icon} />
        {display ?? placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          disabled={minDate ? { before: minDate } : undefined}
          mode="single"
          onSelect={handleDateSelect}
          selected={currentDate}
        />
        <div className="border-t border-border p-3">
          <Label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Time
          </Label>
          <Input
            onChange={(e) => handleTimeChange(e.target.value)}
            type="time"
            value={currentTime}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
