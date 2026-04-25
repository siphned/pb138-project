import { Role } from "@/types/roles";
import { CustomerEvents } from "./events/CustomerEvents";
import { ShopOwnerEvents } from "./events/ShopOwnerEvents";
import { WinemakerEvents } from "./events/WinemakerEvents";

export function EventsTab({ role }: { role: Role }) {
  const renderEventsContent = () => {
    switch (role) {
      case Role.customer:
        return <CustomerEvents />;
      case Role.shopOwner:
        return <ShopOwnerEvents />;
      default:
        return <WinemakerEvents />;
    }
  };

  return <div class="">{renderEventsContent()}</div>;
}
