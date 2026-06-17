import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventManageMenuProps {
  eventId: string;
  canManage: boolean;
}

export function EventManageMenu({ eventId, canManage }: EventManageMenuProps) {
  if (!canManage) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-label="Manage event" size="sm" variant="outline">
            <HugeiconsIcon aria-hidden className="h-4 w-4" icon={MoreHorizontalCircle01Icon} />
            <span>Manage</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link params={{ id: eventId }} to="/events/$id/edit" />}>
          Edit event
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link params={{ id: eventId }} to="/events/$id/images" />}>
          Manage images
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled
          title="Wired in owner-forms ticket (WINE-180)"
          variant="destructive"
        >
          Cancel event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
