import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isPending: boolean;
  disabled?: boolean;
  /** Label shown while idle (e.g. "Create event"). */
  children: ReactNode;
  /** Label shown while the mutation is in flight. Defaults to "Saving…". */
  pendingLabel?: ReactNode;
}

export function SubmitButton({
  isPending,
  disabled,
  children,
  pendingLabel = "Saving…",
}: SubmitButtonProps) {
  return (
    <Button className="w-full" disabled={isPending || disabled} type="submit">
      {isPending ? pendingLabel : children}
    </Button>
  );
}
