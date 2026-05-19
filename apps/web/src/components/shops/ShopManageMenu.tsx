import {
  Calendar03Icon,
  Edit01Icon,
  Image01Icon,
  MoreVerticalIcon,
  PackageIcon,
  ShoppingBasket01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopManageMenuProps {
  shop: GetShopsById200;
}

export function ShopManageMenu({ shop }: ShopManageMenuProps) {
  const { id, ownerUserId } = shop;

  return (
    <ShowOwner ownerUserId={ownerUserId}>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="shop-manage-menu"
          render={<Button size="icon" variant="ghost" />}
        >
          <HugeiconsIcon className="h-5 w-5" icon={MoreVerticalIcon} />
          <span className="sr-only">Open management menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Shop Management</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link params={{ id: id }} to="/shops/$id/edit" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Edit01Icon} />
              <span>Edit shop details</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link params={{ id: id }} to="/shops/$id/images" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Image01Icon} />
              <span>Manage images</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link params={{ id }} to="/shops/$id/availability" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Calendar03Icon} />
              <span>Manage availability</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <Link params={{ id }} search={{ isBundle: undefined }} to="/shops/$id/inventory" />
              }
            >
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={PackageIcon} />
              <span>Manage inventory</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link params={{ id }} to="/shops/$id/orders" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={ShoppingBasket01Icon} />
              <span>Incoming orders</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link params={{ id }} to="/shops/$id/supply-browse" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={TruckIcon} />
              <span>Supply agreements</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ShowOwner>
  );
}
