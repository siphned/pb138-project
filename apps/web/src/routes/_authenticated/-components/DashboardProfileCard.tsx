import { useUser as useClerkUser } from "@clerk/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { Role } from "@/types/roles";

export function DashboardProfileCard() {
  const { user, activeRole } = useUser();
  const { user: clerkUser } = useClerkUser();

  // Only fetch the profile for the role currently in view.
  const isWinemaker = activeRole === Role.winemaker;
  const isShopOwner = activeRole === Role.shopOwner;
  const winemakerQuery = useGetWinemakersMe({ query: { enabled: isWinemaker } });
  const shopsQuery = useGetShopsMe({ query: { enabled: isShopOwner } });

  const roleName = ((): string | null => {
    if (isWinemaker) return winemakerQuery.data?.name ?? null;
    if (isShopOwner) {
      const shops = Array.isArray(shopsQuery.data) ? shopsQuery.data : [];
      if (shops.length === 0) return null;
      if (shops.length === 1) return shops[0].name;
      return `${shops[0].name} +${shops.length - 1} more`;
    }
    return null;
  })();

  if (!user) return null;

  const fullName = `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "Your profile";
  const initials =
    `${user.fname?.[0] ?? ""}${user.lname?.[0] ?? ""}`.toUpperCase() ||
    user.email.slice(0, 2).toUpperCase();

  return (
    <Card variant="section">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage alt={fullName} src={clerkUser?.imageUrl} />
              <AvatarFallback className="bg-primary text-2xl font-heading font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold leading-tight text-foreground">
                {fullName}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {roleName && (
                <p className="text-sm font-medium text-foreground">{roleName}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary">{activeRole}</Badge>
                {user.roles.length > 1 && (
                  <Badge variant="outline">{user.roles.length} roles</Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            className="self-start"
            render={<Link to="/settings" />}
            size="sm"
            variant="outline"
          >
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={Settings01Icon} />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
