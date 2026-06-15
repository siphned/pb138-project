import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CatalogPaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({ total, page, limit, onPageChange }: CatalogPaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const [inputValue, setInputValue] = useState(String(page));

  useEffect(() => {
    setInputValue(String(page));
  }, [page]);

  if (totalPages <= 1) return null;

  const commitInput = () => {
    const parsed = Number.parseInt(inputValue, 10);
    if (!Number.isNaN(parsed)) {
      onPageChange(Math.min(Math.max(1, parsed), totalPages));
    } else {
      setInputValue(String(page));
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={() => onPageChange(Math.max(1, page - 1))}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, i, arr) => (
              <React.Fragment key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
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
            ))}

          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Go to page</span>
        <Input
          className="h-7 w-14 px-2 text-center text-sm"
          max={totalPages}
          min={1}
          onBlur={commitInput}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInput();
          }}
          type="number"
          value={inputValue}
        />
        <span>of {totalPages}</span>
      </div>
    </div>
  );
}
