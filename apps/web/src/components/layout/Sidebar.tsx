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
import { NavItem } from "@/components/primitives/nav-item";
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
    try {
      await signOut({ redirectUrl: "/" });
    } catch (_error) {
      // TODO: User notification (toast)
      // console.error("Sign out error:", error);
    }
    navigate({ to: "/" });
  };

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button size="icon" variant="ghost">
            <Menu className="h-6 w-6" />
          </Button>
        }
      />

      <SheetContent className="flex flex-col w-80 p-0" side="right">
        <Show when="signed-in">
          <div className="flex-none border-b bg-background z-10">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-3 font-heading text-xl px-4 py-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage alt={clerkUser?.fullName || "User"} src={clerkUser?.imageUrl} />
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
            <Link className="mt-4 block" to="/auth/login">
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
                  onValueChange={setAccordionState}
                  value={accordionState}
                >
                  <AccordionItem className="border-none" value="user-roles">
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
                            <Button
                              className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md text-muted-foreground"
                              key={role}
                              onClick={() => {
                                setAccordionState([]);
                                if (onRoleChange) {
                                  onRoleChange(role);
                                }
                              }}
                              variant="ghost"
                            >
                              {role}
                            </Button>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <NavItem render={<div />} variant="active">
                  <UserIcon className="h-4 w-4" />
                  {currentActiveRole}
                </NavItem>
              )}
            </Show>

            {/* SHARED PUBLIC LINKS */}
            <NavItem className="sm:hidden" render={<Link to="/search" />} variant="active">
              <Search className="h-4 w-4" /> Search
            </NavItem>

            <NavItem className="sm:hidden" render={<Link to="/cart" />} variant="active">
              <ShoppingCart className="h-4 w-4" /> Shopping cart
            </NavItem>

            <NavItem render={<Link to="/explore" />} variant="active">
              <Wine className="h-4 w-4" /> Explore Wines
            </NavItem>

            <NavItem
              render={<Link search={{ isBundle: true }} to="/products" />}
              variant="active"
            >
              <Package className="h-4 w-4" /> Bundles
            </NavItem>

            <NavItem render={<Link to="/events" />} variant="active">
              <Calendar className="h-4 w-4" /> Events
            </NavItem>

            <Show when="signed-in">
              {currentActiveRole === Role.customer && (
                <NavItem render={<Link to="/orders" />} variant="active">
                  <Package className="h-4 w-4" /> Order History
                </NavItem>
              )}

              {currentActiveRole !== Role.customer && (
                <>
                  <NavItem
                    render={<Link search={{ winemakerId: "me" }} to="/explore" />}
                    variant="active"
                  >
                    <Wine className="h-4 w-4" /> My Wines
                  </NavItem>
                  <NavItem
                    render={<Link search={{ isBundle: true }} to="/products" />}
                    variant="active"
                  >
                    <Package className="h-4 w-4" /> Bundles
                  </NavItem>
                </>
              )}
            </Show>

            <Show when="signed-in">
              <NavItem className="mt-2" onClick={() => openUserProfile()} variant="muted">
                <Settings className="h-4 w-4" /> Settings
              </NavItem>
            </Show>
          </nav>
        </div>

        <div className="flex-none border-t pt-4 pb-6 px-6 flex flex-col gap-1 bg-background z-10">
          <Button
            className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-muted-foreground w-full"
            variant="ghost"
          >
            Theme
            <Moon className="h-4 w-4" />
          </Button>

          <Show when="signed-in">
            <NavItem className="mt-2 w-full text-left" onClick={handleLogout} variant="destructive">
              <LogOut className="h-4 w-4" /> Log out
            </NavItem>
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}
