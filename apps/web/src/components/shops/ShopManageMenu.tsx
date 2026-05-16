import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopManageMenuProps {
  shop: GetShopsById200;
}

export function ShopManageMenu({ shop }: ShopManageMenuProps) {
  return <div data-testid="shop-manage-menu">Manage {shop.name}</div>;
}
