import { Show, useClerk } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { user: clerkUser } = useClerk();
  const initials = clerkUser ? (clerkUser.fullName || "User").substring(0, 2).toUpperCase() : "GU";
  const { activeRole, setActiveRole, user } = useUser();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 lg:px-12">
      {/* Left: Logo Area */}
      <Link to="/">
        <div className="flex items-center gap-2 font-heading font-bold text-xl">
          <img alt="Wine Enjoyers Logo" className="h-8 w-8 rounded-full" src="/logo.png" />
          Wine Enjoyers
        </div>
      </Link>

      {/* Right: Icons & Menus */}
      <div className="flex items-center gap-4">
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <Link to="/search">
            <Search className="h-5 w-5" />
          </Link>
        </Button>
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

        <Sidebar activeRole={activeRole} onRoleChange={setActiveRole} userRoles={user?.roles} />
      </div>
    </header>
  );
}
