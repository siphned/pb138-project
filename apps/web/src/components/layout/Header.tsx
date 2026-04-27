import { Search, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/roles";
import { Sidebar } from "./Sidebar";
import { useUser } from "@/context/UserContext";

interface HeaderProps {
  activeRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function Header({ activeRole, onRoleChange }: HeaderProps) {
  const { user } = useUser();
  
  const displayName = user ? `${user.fname} ${user.lname}` : "";
  const initials = user ? `${user.fname[0]}${user.lname[0]}`.toUpperCase() : "WE";

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 lg:px-12">
      {/* Left: Logo Area */}
      <Link to="/">
        <div className="flex items-center gap-2 font-heading font-bold text-xl">
          <img src="/logo.png" alt="Wine Enjoyers Logo" className="h-8 w-8 rounded-full" />
          Wine Enjoyers
        </div>
      </Link>

      {/* Right: Icons & Menus */}
      <div className="flex items-center gap-4">
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <Search className="h-5 w-5" />
        </Button>
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <ShoppingCart className="h-5 w-5" />
        </Button>

        {user && (
          <Link
            to="/dashboard"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity">
              <AvatarImage alt={displayName} src="" />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}

        {!user && (
          <Link to="/auth/login">
            <Button variant="outline" size="sm" className="rounded-full px-4">
              Sign In
            </Button>
          </Link>
        )}

        <Sidebar
          activeRole={activeRole}
          onRoleChange={onRoleChange}
          userRoles={[Role.winemaker, Role.shopOwner, Role.customer]}
        />
      </div>
    </header>
  );
}
