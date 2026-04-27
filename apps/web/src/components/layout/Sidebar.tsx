import { useClerk } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingBag,
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
  const { signOut } = useClerk();
  const { user } = useUser();
  const currentActiveRole = activeRole || userRoles[0];
  const [accordionState, setAccordionState] = useState<string[]>([]);

  const initials = user ? `${user.fname[0]}${user.lname[0]}`.toUpperCase() : "WE";
  const hasMultipleRoles = userRoles.length > 1;

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
        {/* FIXED HEADER */}
        <div className="flex-none  border-b bg-background z-10">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-3 font-heading text-xl px-4 py-4">
              {user && (
                <>
                  <Avatar className="h-14 w-14">
                    <AvatarImage alt={user.fname} src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-heading text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {user.fname}
                </>
              )}
              {!user && (
                <>
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary text-primary-foreground font-heading text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  User
                </>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* SCROLLABLE MIDDLE CONTAINER */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-2 px-4 py-4">
            {/* 3. CONDITIONAL ROLE SWITCHER */}
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
                          // biome-ignore lint/a11y/useButtonType: This button does not need a type as it is not part of a form
                          <button
                            className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
                            key={role}
                            onClick={() => {
                              setAccordionState([]);
                              if (onRoleChange) {
                                onRoleChange(role);
                              }
                            }}
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

            {/* ROLE-AWARE LINKS */}
            {currentActiveRole === Role.customer ? (
              <>
                <Link
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                  to="/orders"
                >
                  <ShoppingBag className="h-4 w-4" /> Order History
                </Link>
                <Link
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
                  to="/explore"
                >
                  <Search className="h-4 w-4" /> Explore Wines
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                  to="/shops"
                >
                  <Wine className="h-4 w-4" /> My Wines
                </Link>
                <Link
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                  to="/shops"
                >
                  <Package className="h-4 w-4" /> Bundles
                </Link>
              </>
            )}

            <Link
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
              to="/events"
            >
              <Calendar className="h-4 w-4" /> Events
            </Link>

            <Link
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
              to="/search"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
            <Link
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
              to="/cart"
            >
              <ShoppingCart className="h-4 w-4" /> Shopping cart
            </Link>

            <Link
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground mt-2"
              to="/settings"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </nav>
        </div>

        {/* FIXED FOOTER */}
        <div className="flex-none border-t pt-4 pb-6 px-6 flex flex-col gap-1 bg-background z-10">
          {/* biome-ignore lint/a11y/useButtonType: This button does not need a type as it is not part of a form */}
          <button className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground w-full text-left">
            Theme
            <Moon className="h-4 w-4" />
          </button>

          {/* biome-ignore lint/a11y/useButtonType: logout action, not a form submission */}
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm font-medium text-muted-foreground hover:text-destructive mt-2 w-full text-left"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
