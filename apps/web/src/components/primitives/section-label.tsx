import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

function SectionLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"h3">) {
  return useRender({
    defaultTagName: "h3",
    props: mergeProps<"h3">(
      {
        className: cn(
          "text-xs font-bold uppercase tracking-widest text-muted-foreground",
          className
        ),
      },
      props
    ),
    render,
    state: { slot: "section-label" },
  });
}

export { SectionLabel };
