import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    navigate({ search: { q }, to: "/search" });
    setOpen(false);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setValue("");
      setOpen(false);
    }
  };

  const handleBlur = () => {
    if (!value) setOpen(false);
  };

  if (!open) {
    return (
      <Button
        aria-label="Open search"
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <HugeiconsIcon className="h-5 w-5" icon={Search01Icon} strokeWidth={2} />
      </Button>
    );
  }

  return (
    <form className="flex items-center" onSubmit={handleSubmit}>
      <Input
        aria-label="Search the catalog"
        className="w-36 sm:w-48 lg:w-64"
        onBlur={handleBlur}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search…"
        ref={inputRef}
        value={value}
      />
    </form>
  );
}
