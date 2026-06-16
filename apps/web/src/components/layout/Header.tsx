import { Show, useClerk } from "@clerk/react";
import { ShoppingCart02Icon, User02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme, useUser } from "@/context";
import { useGetCarts } from "@/generated/hooks/useGetCarts";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "./HeaderSearch";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { user: clerkUser } = useClerk();
  const initials = clerkUser ? (clerkUser.fullName || "User").substring(0, 2).toUpperCase() : "GU";
  const { user, activeRole, setActiveRole, isLoading, isCartReady } = useUser();
  const { theme } = useTheme();
  const roles = user?.roles ?? [];

  const { data: cart } = useGetCarts({ query: { enabled: isCartReady } });
  const cartCount = cart?.items.reduce((acc, item) => acc + Number(item.quantity || 0), 0) ?? 0;

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 lg:px-12">
      <Link to="/">
        <img
          alt="Wine Enjoyers"
          className="h-10 w-auto"
          src={theme === "dark" ? "/logo_dark.webp" : "/logo.png"}
        />
      </Link>

      <div className="flex items-center gap-4">
        <HeaderSearch />

        <Link
          aria-label={cartCount > 0 ? `Shopping cart (${cartCount} items)` : "Shopping cart"}
          className={cn(
            buttonVariants({ size: "icon", variant: "ghost" }),
            "relative hidden sm:flex"
          )}
          to="/cart"
        >
          <HugeiconsIcon className="h-5 w-5" icon={ShoppingCart02Icon} strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {isLoading ? (
          // Reserve the avatar slot until auth + profile resolve, so the icon
          // doesn't pop in (and shift layout) after a beat.
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : (
          <>
            <Show when="signed-out">
              <Link
                className={cn(
                  buttonVariants({ size: "icon", variant: "ghost" }),
                  "relative hidden sm:flex"
                )}
                to="/auth/login"
              >
                <HugeiconsIcon className="h-5 w-5" icon={User02Icon} strokeWidth={2} />
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
          </>
        )}

        <Sidebar activeRole={activeRole} onRoleChange={setActiveRole} userRoles={roles} />
      </div>
    </header>
  );
}
