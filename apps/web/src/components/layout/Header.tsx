import { Show, useClerk } from "@clerk/react";
import { ShoppingCart01Icon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { HeaderSearch } from "./HeaderSearch";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { user: clerkUser } = useClerk();
  const initials = clerkUser ? (clerkUser.fullName || "User").substring(0, 2).toUpperCase() : "GU";
  const { user, activeRole, setActiveRole } = useUser();
  const roles = user?.roles ?? [];

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
            <HugeiconsIcon className="h-5 w-5" icon={ShoppingCart01Icon} />
          </Link>
        </Button>

        <Show when="signed-out">
          <Link to="/auth/login">
            <Button className="rounded-full" size="icon" variant="ghost">
              <HugeiconsIcon className="h-5 w-5" icon={UserCircleIcon} />
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
