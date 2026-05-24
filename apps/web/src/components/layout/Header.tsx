<<<<<<< HEAD
import { Show, useClerk } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag01Icon, UserIcon } from "hugeicons-react";
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

=======
﻿import { Show, useClerk } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/roles";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  activeRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function Header({ activeRole, onRoleChange }: HeaderProps) {
  const { user: clerkUser } = useClerk();
  const initials = clerkUser ? (clerkUser.fullName || "User").substring(0, 2).toUpperCase() : "GU";
>>>>>>> origin/main
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 lg:px-12">
      {/* Left: Logo Area */}
      <Link to="/">
<<<<<<< HEAD
        <img alt="Wine Enjoyers" className="h-10 w-auto" src="/logo.png" />
=======
        <div className="flex items-center gap-2 font-heading font-bold text-xl">
          <img alt="Wine Enjoyers Logo" className="h-8 w-8 rounded-full" src="/logo.png" />
          Wine Enjoyers
        </div>
>>>>>>> origin/main
      </Link>

      {/* Right: Icons & Menus */}
      <div className="flex items-center gap-4">
<<<<<<< HEAD
        <HeaderSearch />
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <Link to="/cart">
            <ShoppingBag01Icon className="h-5 w-5" />
          </Link>
=======
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <Search className="h-5 w-5" />
        </Button>
        <Button className="hidden sm:flex" size="icon" variant="ghost">
          <ShoppingCart className="h-5 w-5" />
>>>>>>> origin/main
        </Button>

        <Show when="signed-out">
          <Link to="/auth/login">
            <Button className="rounded-full" size="icon" variant="ghost">
<<<<<<< HEAD
              <UserIcon className="h-5 w-5" />
=======
              <User className="h-5 w-5" />
>>>>>>> origin/main
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

<<<<<<< HEAD
        <Sidebar activeRole={activeRole} onRoleChange={setActiveRole} userRoles={roles} />
=======
        <Sidebar
          activeRole={activeRole}
          onRoleChange={onRoleChange}
          userRoles={[Role.winemaker, Role.shopOwner, Role.customer]}
        />
>>>>>>> origin/main
      </div>
    </header>
  );
}
