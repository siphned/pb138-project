import { Show, useAuth, useClerk, useUser as useClerkUser } from "@clerk/react";
import {
  Calendar01Icon,
  ChartBarLineIcon,
  LogoutSquare02Icon,
  Menu01Icon,
  Moon01Icon,
  Package01Icon,
  Search01Icon,
  ShoppingCart02Icon,
  Store01Icon,
  Sun01Icon,
  User02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Wine } from "lucide-react";
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
import { useTheme, useUser } from "@/context";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";

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
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const currentActiveRole = activeRole || userRoles[0];
  const [accordionState, setAccordionState] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const closeSheet = () => setOpen(false);

  // Fetch the user's winemaker / shop profile so "My Wines" / "My Bundles" /
  // "My Events" links can carry the real ids instead of a magic `"me"` string.
  // Each hook is gated by the active role so we don't 404 non-winemakers etc.
  const winemakerProfile = useGetWinemakersMe({
    query: {
      enabled: isSignedIn === true && currentActiveRole === Role.winemaker,
    },
  });
  const shopOwnerProfile = useGetShopsMe({
    query: {
      enabled: isSignedIn === true && currentActiveRole === Role.shopOwner,
    },
  });
  const winemakerId = winemakerProfile.data?.id;
  const winemakerName = winemakerProfile.data?.name;
  const firstShopId = shopOwnerProfile.data?.[0]?.id;

  const displayUserName = isSignedIn ? clerkUser?.fullName || "User" : "Guest";
  const fullName = user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "Guest";
  const initials = fullName === "Guest" ? "G" : fullName.substring(0, 2).toUpperCase() || "U";
  const hasMultipleRoles = userRoles.length > 1;

  const handleLogout = async () => {
    closeSheet();
    try {
      await signOut({ redirectUrl: "/" });
    } catch (_error) {
      /* sign-out navigation is optimistic; error here is non-critical */
    }
    navigate({ to: "/" });
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={
          <Button size="icon" variant="ghost">
            <HugeiconsIcon icon={Menu01Icon} />
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
            <Link className="mt-4 block" onClick={closeSheet} to="/auth/login">
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
                        <HugeiconsIcon icon={User02Icon} />
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
                  <HugeiconsIcon icon={User02Icon} />
                  {currentActiveRole}
                </NavItem>
              )}
            </Show>

            {/* SHARED PUBLIC LINKS */}
            <NavItem
              className="sm:hidden"
              onClick={closeSheet}
              render={<Link to="/search" />}
              variant="active"
            >
              <HugeiconsIcon icon={Search01Icon} /> Search
            </NavItem>

            <NavItem
              className="sm:hidden"
              onClick={closeSheet}
              render={<Link to="/cart" />}
              variant="active"
            >
              <HugeiconsIcon icon={ShoppingCart02Icon} /> Shopping cart
            </NavItem>

            <NavItem onClick={closeSheet} render={<Link to="/explore" />} variant="active">
              <Wine className="h-5 w-5" /> Explore Wines
            </NavItem>

            <NavItem onClick={closeSheet} render={<Link to="/products" />} variant="active">
              <HugeiconsIcon icon={Package01Icon} /> Products
            </NavItem>

            <NavItem onClick={closeSheet} render={<Link to="/winemakers" />} variant="active">
              <HugeiconsIcon icon={UserGroupIcon} /> Winemakers
            </NavItem>

            <NavItem onClick={closeSheet} render={<Link to="/events" />} variant="active">
              <HugeiconsIcon icon={Calendar01Icon} /> Events
            </NavItem>

            <NavItem onClick={closeSheet} render={<Link to="/shops" />} variant="active">
              <HugeiconsIcon icon={Store01Icon} /> Shops
            </NavItem>

            <Show when="signed-in">
              <RoleNavItems
                closeSheet={closeSheet}
                firstShopId={firstShopId}
                role={currentActiveRole}
                userId={user?.id}
                winemakerId={winemakerId}
                winemakerName={winemakerName}
              />

              <NavItem onClick={closeSheet} render={<Link to="/stats" />} variant="active">
                <HugeiconsIcon icon={ChartBarLineIcon} /> Statistics
              </NavItem>
            </Show>

            <Show when="signed-in">
              <NavItem
                className="mt-2"
                onClick={closeSheet}
                render={<Link to="/dashboard" />}
                variant="muted"
              >
                <HugeiconsIcon icon={User02Icon} /> Profile Settings
              </NavItem>
            </Show>
          </nav>
        </div>

        <div className="flex-none border-t pt-4 pb-6 px-6 flex flex-col gap-1 bg-background z-10">
          <Button
            className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-muted-foreground w-full"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            variant="ghost"
          >
            Theme
            <HugeiconsIcon icon={theme === "light" ? Moon01Icon : Sun01Icon} />
          </Button>

          <Show when="signed-in">
            <NavItem className="mt-2 w-full text-left" onClick={handleLogout} variant="destructive">
              <HugeiconsIcon icon={LogoutSquare02Icon} /> Log out
            </NavItem>
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface RoleNavItemsProps {
  role: Role;
  closeSheet: () => void;
  userId?: string;
  winemakerId?: string;
  winemakerName?: string;
  firstShopId?: string;
}

function RoleNavItems({
  role,
  closeSheet,
  userId,
  winemakerId,
  winemakerName,
  firstShopId,
}: RoleNavItemsProps) {
  if (role === Role.customer) {
    return (
      <>
        <NavItem onClick={closeSheet} render={<Link to="/orders" />} variant="active">
          <HugeiconsIcon icon={Package01Icon} /> Order History
        </NavItem>
        <NavItem onClick={closeSheet} render={<Link to="/events" />} variant="active">
          <HugeiconsIcon icon={Calendar01Icon} /> My Events
        </NavItem>
      </>
    );
  }

  if (role === Role.winemaker) {
    return (
      <>
        <NavItem
          onClick={closeSheet}
          render={<Link search={winemakerId ? { winemakerId } : undefined} to="/explore" />}
          variant="active"
        >
          <Wine className="h-4 w-4" /> My Wines
        </NavItem>
        <NavItem
          onClick={closeSheet}
          render={<Link search={winemakerName ? { winemakerName } : undefined} to="/events" />}
          variant="active"
        >
          <HugeiconsIcon icon={Calendar01Icon} /> My Events
        </NavItem>
      </>
    );
  }

  if (role === Role.shopOwner) {
    return (
      <>
        <NavItem
          onClick={closeSheet}
          render={<Link search={userId ? { ownerUserId: userId } : undefined} to="/shops" />}
          variant="active"
        >
          <HugeiconsIcon icon={Store01Icon} /> My Shops
        </NavItem>
        <NavItem
          onClick={closeSheet}
          render={
            <Link search={firstShopId ? { shopId: firstShopId } : undefined} to="/products" />
          }
          variant="active"
        >
          <HugeiconsIcon icon={Package01Icon} /> My Products
        </NavItem>
      </>
    );
  }

  return null;
}
