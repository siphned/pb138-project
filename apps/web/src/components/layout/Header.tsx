import { Search, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Role } from "@/types/roles";
import { Sidebar } from "./Sidebar"; // Import your new component here!

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  activeRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function Header({ user: propUser, activeRole, onRoleChange }: HeaderProps) {
  const { user: contextUser } = useUser();
  const currentUser = propUser || contextUser;

  const initials = currentUser.name.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 lg:px-12">
      {/* Left: Logo Area */}
      <div className="flex items-center gap-2 font-heading font-bold text-xl">
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
          WE
        </div>
        Wine Enjoyers
      </div>

      {/* Right: Icons & Menus */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <ShoppingCart className="h-5 w-5" />
        </Button>

        <a
          href="/profile"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </a>

        {/* Drop the Sidebar right here! */}
        <Sidebar
          userRoles={[Role.WINEMAKER, Role.SHOP_OWNER, Role.CUSTOMER]}
          activeRole={activeRole}
          onRoleChange={onRoleChange}
        />
      </div>
    </header>
  );
}
