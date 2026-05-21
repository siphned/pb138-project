import { Show, useClerk } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useRoles } from "@/hooks/useRoles";
import { HeaderSearch } from "./HeaderSearch";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { user: clerkUser } = useClerk();
  const initials = clerkUser ? (clerkUser.fullName || "User").substring(0, 2).toUpperCase() : "GU";
  const { activeRole, setActiveRole } = useUser();
  const roles = useRoles();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 lg:px-12">
      {/* Left: Logo Area */}
      <Link to="/">
        <img alt="Wine Enjoyers" className="h-10 w-auto" src="/logo.png" />
      </Link>

      {/* Right: Icons & Menus */}
      <div className="flex items-center gap-4">
        <HeaderSearch />
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <Link to="/cart">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </Button>

        <Show when="signed-out">
          <Link to="/auth/login">
            <Button className="rounded-full" size="icon" variant="ghost">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </Show>

        <Show when="signed-in">
          <Link to="/dashboard">
            <Avatar className="h-8 w-8">
              <AvatarImage alt={clerkUser?.fullName || "User"} src={clerkUser?.imageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground font-heading text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </Show>

        <Sidebar activeRole={activeRole} onRoleChange={setActiveRole} userRoles={roles} />
      </div>
    </header>
  );
}
