import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/roles";
import { Sidebar } from "./Sidebar";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Show, useClerk } from "@clerk/react";


interface HeaderProps {
  activeRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function Header({ activeRole, onRoleChange }: HeaderProps) {
  const {user: clerkUser} = useClerk();
  const initials = clerkUser ? (clerkUser.fullName || "User").substring(0, 2).toUpperCase() : "GU";
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

        <Show when="signed-out">
          <Link to="/auth/login">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </Show>

        <Show when="signed-in">
          <Link to="/dashboard">
          <Avatar className="h-8 w-8">
              <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground font-heading text-xs">
                {initials}
              </AvatarFallback>
          </Avatar>
          </Link>
        </Show>

        <Sidebar
          userRoles={[Role.WINEMAKER, Role.SHOP_OWNER, Role.CUSTOMER]}
          activeRole={activeRole}
          onRoleChange={onRoleChange}
        />
      </div>
    </header>
  );
}
