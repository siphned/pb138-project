import { useUser as useClerkUser } from "@clerk/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

export function DashboardProfileCard() {
  const { user, activeRole } = useUser();
  const { user: clerkUser } = useClerkUser();

  if (!user) return null;

  const fullName = `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "Your profile";
  const initials =
    `${user.fname?.[0] ?? ""}${user.lname?.[0] ?? ""}`.toUpperCase() ||
    user.email.slice(0, 2).toUpperCase();

  return (
    <Card variant="section">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-24 w-24">
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
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{activeRole}</Badge>
            {user.roles.length > 1 && (
              <Badge variant="outline">{user.roles.length} roles</Badge>
            )}
          </div>

          <Button render={<Link to="/settings" />} size="sm" variant="outline">
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={Settings01Icon} />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
