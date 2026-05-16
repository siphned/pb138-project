import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { SectionLabel } from "@/components/primitives/section-label";
import { cn } from "@/lib/utils";

interface SectionProps extends useRender.ComponentProps<"section"> {
  heading?: string;
  children: ReactNode;
}

export function Section({ heading, className, children, render, ...props }: SectionProps) {
  return useRender({
    defaultTagName: "section",
    props: mergeProps<"section">(
      { className: cn("space-y-4", className) },
      {
        children: (
          <>
            {heading && <SectionLabel>{heading}</SectionLabel>}
            {children}
          </>
        ),
      },
      props
    ),
    render,
    state: { slot: "section" },
  });
}
