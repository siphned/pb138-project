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
            <Menu class="h-6 w-6" />
          </Button>
        }
      />

      <SheetContent side="right" class="flex flex-col w-80 p-0">
        {/* FIXED HEADER */}
        <div class="flex-none  border-b bg-background z-10">
          <SheetHeader class="text-left">
            <SheetTitle class="flex items-center gap-3 font-heading text-xl px-4 py-4">
              <Avatar class="h-14 w-14">
                <AvatarFallback class="bg-primary text-primary-foreground font-heading text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {fullName}
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* SCROLLABLE MIDDLE CONTAINER */}
        <div class="flex-1 overflow-y-auto">
          <nav class="flex flex-col gap-2 px-4 py-4">
            {/* 3. CONDITIONAL ROLE SWITCHER */}
            {hasMultipleRoles ? (
              <Accordion
                class="w-full flex-none"
                value={accordionState}
                onValueChange={setAccordionState}
              >
                <AccordionItem value="user-roles" class="border-none">
                  <AccordionTrigger class="flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium hover:no-underline text-primary">
                    <div class="flex items-center gap-3">
                      <UserIcon class="h-4 w-4" />
                      {currentActiveRole}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent class="pb-1">
                    <div class="flex flex-col gap-1 pl-10 pr-2 pt-2">
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
                            class="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
                          >
                            {role}
                          </button>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary text-sm font-medium text-primary">
                <UserIcon class="h-4 w-4" />
                {currentActiveRole}
              </div>
            )}

            {/* ROLE-AWARE LINKS */}
            {currentActiveRole === Role.customer ? (
              <>
                <Link
                  to="/orders"
                  class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                >
                  <ShoppingBag class="h-4 w-4" /> Order History
                </Link>
                <Link
                  to="/explore"
                  class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
                >
                  <Search class="h-4 w-4" /> Explore Wines
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/inventory"
                  class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                >
                  <Wine class="h-4 w-4" /> My Wines
                </Link>
                <Link
                  to="/bundles"
                  class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
                >
                  <Package class="h-4 w-4" /> Bundles
                </Link>
              </>
            )}

            <Link
              to="/events"
              class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary"
            >
              <Calendar class="h-4 w-4" /> Events
            </Link>

            <Link
              to="/search"
              class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
            >
              <Search class="h-4 w-4" /> Search
            </Link>
            <Link
              to="/cart"
              class="flex-none flex items-center gap-3 px-3 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-primary sm:hidden"
            >
              <ShoppingCart class="h-4 w-4" /> Shopping cart
            </Link>

            <Link
              to="/settings"
              class="flex-none flex items-center gap-3 px-3 py-3 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground mt-2"
            >
              <Settings class="h-4 w-4" /> Settings
            </Link>
          </nav>
        </div>

        {/* FIXED FOOTER */}
        <div class="flex-none border-t pt-4 pb-6 px-6 flex flex-col gap-1 bg-background z-10">
          {/* biome-ignore lint/a11y/useButtonType: This button does not need a type as it is not part of a form */}
          <button class="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground w-full text-left">
            Theme
            <Moon class="h-4 w-4" />
          </button>

          <Link
            to="/logout"
            class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm font-medium text-muted-foreground hover:text-destructive mt-2"
          >
            <LogOut class="h-4 w-4" /> Log out
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
