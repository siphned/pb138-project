import { Link } from "@tanstack/react-router";
import {
  Calendar,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const currentActiveRole = activeRole || userRoles[0];
  const [accordionState, setAccordionState] = useState<string[]>([]);

  const fullName = `${user?.fname || ""} ${user?.lname || ""}`.trim() || "User";
  const initials = fullName.substring(0, 2).toUpperCase();
  const hasMultipleRoles = userRoles.length > 1;

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
        {/* FIXED HEADER */}
        <div className="flex-none  border-b bg-background z-10">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-3 font-heading text-xl px-4 py-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground font-heading text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {fullName}
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
                          // biome-ignore lint/a11y/useButtonType: This button does not need a type as it is not part of a form
                          <button
                            key={role}
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

            {/* ROLE-AWARE LINKS */}
            {currentActiveRole === Role.customer ? (
              <>
                <Link
                  to="/orders"
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                >
                  <ShoppingBag className="h-4 w-4" /> Order History
                </Link>
                <Link
                  to="/explore"
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
                >
                  <Search className="h-4 w-4" /> Explore Wines
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/wines"
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                >
                  <Wine className="h-4 w-4" /> My Wines
                </Link>
                <Link
                  to="/shops"
                  className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                >
                  <Package className="h-4 w-4" /> Shops
                </Link>
              </>
            )}

            <Link
              to="/events"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
            >
              <Calendar className="h-4 w-4" /> Events
            </Link>

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
              to="/settings"
              className="flex-none flex items-center gap-3 px-3 py-3 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground mt-2"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
