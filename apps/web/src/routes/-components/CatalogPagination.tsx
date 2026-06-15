import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CatalogPaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/**
 * The "…" between two visible page links. Clicking it opens a popover where the
 * user can type any page in the hidden range it represents.
 */
function PageJumpEllipsis({
  rangeStart,
  rangeEnd,
  onPick,
}: {
  rangeStart: number;
  rangeEnd: number;
  onPick: (page: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const commit = () => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onPick(Math.min(Math.max(rangeStart, parsed), rangeEnd));
    }
    setValue("");
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-label={`Jump to a page between ${rangeStart} and ${rangeEnd}`}
            className="cursor-pointer"
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon className="size-4" icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
          </Button>
        }
      />
      <PopoverContent className="w-40 gap-2">
        <p className="text-xs text-muted-foreground">
          Go to page ({rangeStart}–{rangeEnd})
        </p>
        {/* biome-ignore lint/a11y/noAutofocus: focus the field when the jump popover opens */}
        <Input
          autoFocus
          className="h-8"
          inputMode="numeric"
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={String(rangeStart)}
          value={value}
        />
      </PopoverContent>
    </Popover>
  );
}

export function CatalogPagination({ total, page, limit, onPageChange }: CatalogPaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  // Always show first, last, and the pages immediately around the current one.
  const visible = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="cursor-pointer"
            onClick={() => onPageChange(Math.max(1, page - 1))}
          />
        </PaginationItem>

        {visible.map((p, i) => {
          const prev = visible[i - 1];
          const hasGap = i > 0 && prev !== p - 1;
          return (
            <React.Fragment key={p}>
              {hasGap && (
                <PaginationItem>
                  <PageJumpEllipsis
                    onPick={onPageChange}
                    rangeEnd={p - 1}
                    rangeStart={(prev ?? 0) + 1}
                  />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  isActive={p === page}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          );
        })}

        <PaginationItem>
          <PaginationNext
            className="cursor-pointer"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
