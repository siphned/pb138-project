import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InfiniteScrollAreaProps {
  children: ReactNode;
  itemCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  className?: string;
}

export function InfiniteScrollArea({
  children,
  itemCount,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
}: InfiniteScrollAreaProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = boxRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    if (!sentinel || !root || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root, rootMargin: "0px 0px 120px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useLayoutEffect(() => {
    if (itemCount === 0) return;
    const viewport = boxRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    if (!viewport) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setAtBottom(scrollTop + clientHeight >= scrollHeight - 8);
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    return () => viewport.removeEventListener("scroll", update);
  }, [itemCount]);

  return (
    <div className="space-y-3" ref={boxRef}>
      <ScrollArea
        className={cn(
          "pr-4",
          className,
          !atBottom &&
            "[-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%_-_3rem),transparent)] [mask-image:linear-gradient(to_bottom,black_calc(100%_-_3rem),transparent)]"
        )}
      >
        {children}
        <div aria-hidden className="h-px w-full" ref={sentinelRef} />
        {isFetchingNextPage && (
          <div aria-busy="true" aria-live="polite" className="pt-3">
            <Skeleton className="h-20 w-full" />
          </div>
        )}
      </ScrollArea>
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            className="text-muted-foreground text-xs"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            size="sm"
            variant="ghost"
          >
            {isFetchingNextPage ? "Loading…" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
}
