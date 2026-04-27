import { Show, useAuth, useClerk, useUser as useClerkUser } from "@clerk/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  User as UserIcon,
  Wine,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/context/UserContext";

import { Role } from "@/types/roles";

interface SidebarProps {
  userRoles?: Role[];
  activeRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function Sidebar({ userRoles = [Role.customer], activeRole, onRoleChange }: SidebarProps) {
  const { user } = useUser();
  const { user: clerkUser } = useClerkUser();
  const { isSignedIn } = useAuth();
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();

  const currentActiveRole = activeRole || userRoles[0];
  const [accordionState, setAccordionState] = useState<string[]>([]);

  const displayUserName = isSignedIn ? clerkUser?.fullName || "User" : "Guest";
  const fullName = user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "Guest";
  const initials = fullName === "Guest" ? "G" : fullName.substring(0, 2).toUpperCase() || "U";
  const hasMultipleRoles = userRoles.length > 1;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        }
      />

      <SheetContent side="right" className="flex flex-col w-80 p-0">
        <Show when="signed-in">
          <div className="flex-none border-b bg-background z-10">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-3 font-heading text-xl px-4 py-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-heading text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{fullName}</span>
                  {displayUserName}
                </div>
              </SheetTitle>
            </SheetHeader>
          </div>
        </Show>

        <Show when="signed-out">
          <div className="flex-none border-b bg-background z-10 px-6 py-8">
            <p className="text-sm text-muted-foreground">
              Sign in to manage your wines and orders.
            </p>
            <Link to="/auth/login" className="mt-4 block">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </Show>

        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-2 px-4 py-4">
            <Show when="signed-in">
              {hasMultipleRoles ? (
                <Accordion
                  className="w-full flex-none"
                  value={accordionState}
                  onValueChange={setAccordionState}
                >
                  <AccordionItem value="user-roles" className="border-none">
                    <AccordionTrigger className="flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium hover:no-underline text-primary">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4" />
                        {currentActiveRole}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1">
                      <div className="flex flex-col gap-1 pl-10 pr-2 pt-2">
                        {userRoles
                          .filter((role) => role !== currentActiveRole)
                          .map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                setAccordionState([]);
                                if (onRoleChange) {
                                  onRoleChange(role);
                                }
                              }}
                              className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
                            >
                              {role}
                            </button>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary text-sm font-medium text-primary">
                  <UserIcon className="h-4 w-4" />
                  {currentActiveRole}
                </div>
              )}
            </Show>

            {/* SHARED PUBLIC LINKS */}
            <Link
              to="/search"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
            >
              <Search className="h-4 w-4" /> Search
            </Link>

            <Link
              to="/cart"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
            >
              <ShoppingCart className="h-4 w-4" /> Shopping cart
            </Link>

            <Link
              to="/explore"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
            >
              <Wine className="h-4 w-4" /> Explore Wines
            </Link>

            <Link
              to="/bundles"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
            >
              <Package className="h-4 w-4" /> Bundles
            </Link>

            <Link
              to="/events"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
            >
              <Calendar className="h-4 w-4" /> Events
            </Link>

            <Show when="signed-in">
              <button
                type="button"
                onClick={() => openUserProfile()}
                className="flex-none flex items-center gap-3 px-3 py-3 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground mt-2"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
            </Show>
          </nav>
        </div>

        <div className="flex-none border-t pt-4 pb-6 px-6 flex flex-col gap-1 bg-background z-10">
          <button
            type="button"
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground w-full text-left"
          >
            Theme
            <Moon className="h-4 w-4" />
          </button>

          <Show when="signed-in">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm font-medium text-muted-foreground hover:text-destructive mt-2 w-full text-left"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}
