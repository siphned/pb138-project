import { Alert01Icon, ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminUsersById } from "@/generated/hooks/useGetAdminUsersById";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { usePatchAdminUsersByIdStatus } from "@/generated/hooks/usePatchAdminUsersByIdStatus";

export const Route = createFileRoute("/_authenticated/_admin/users/$id")({
  component: AdminUserDetail,
});

type AdminUser = {
  id: string;
  email: string;
  fname: string;
  lname: string;
  status: "active" | "suspended" | "banned";
  roles: { id: string; role: string }[];
  createdAt: string;
};

type ConfirmAction = "suspend" | "ban" | "reactivate" | null;

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  customer: "Customer",
  shop_owner: "Shop Owner",
  winemaker: "Winemaker",
};

function statusVariant(status: string): "secondary" | "outline" | "destructive" {
  if (status === "active") return "secondary";
  if (status === "suspended") return "outline";
  return "destructive";
}

function ProfileCard({ user }: { user: AdminUser }) {
  const fullName = `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "Unnamed user";
  const initials =
    `${user.fname?.[0] ?? ""}${user.lname?.[0] ?? ""}`.toUpperCase() ||
    user.email.slice(0, 2).toUpperCase();
  const statusLabel = user.status.charAt(0).toUpperCase() + user.status.slice(1);

  return (
    <Card variant="section">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-2xl font-heading font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold leading-tight text-foreground">
                {fullName}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant={statusVariant(user.status)}>{statusLabel}</Badge>
                {user.roles?.map((r) => (
                  <Badge key={r.id} variant="outline">
                    {ROLE_LABEL[r.role] ?? r.role}
                  </Badge>
                ))}
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <Badge className="self-start" variant="outline">
            Admin view
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface UserShop {
  id: string;
  name: string;
  description?: string;
  address?: { city?: string; country?: string };
}

function UserShopsSection({ userId }: { userId: string }) {
  const query = useGetShops({ ownerUserId: userId });
  const shops = (Array.isArray(query.data) ? query.data : []) as UserShop[];

  const renderShops = () => {
    if (query.isLoading) {
      return (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton className="h-14 w-full rounded-md" key={i} />
          ))}
        </div>
      );
    }
    if (query.isError) {
      return <p className="text-sm text-destructive">Could not load this user's shops.</p>;
    }
    if (shops.length === 0) {
      return <p className="text-sm text-muted-foreground">This user doesn't own any shops yet.</p>;
    }
    return (
      <ul className="divide-y divide-border rounded-md border border-border">
        {shops.map((s) => (
          <li className="p-4" key={s.id}>
            <Link
              className="block transition-colors hover:text-primary"
              params={{ id: s.id }}
              to="/shops/$id"
            >
              <span className="font-medium text-foreground">{s.name}</span>
              {s.address && (
                <p className="text-xs text-muted-foreground">
                  {[s.address.city, s.address.country].filter(Boolean).join(", ")}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card variant="section">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Shops owned</CardTitle>
        <CardDescription>
          Public shops owned by this user. Click a shop to view its catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>{renderShops()}</CardContent>
    </Card>
  );
}

interface ActionsCardProps {
  user: AdminUser;
  isUpdating: boolean;
  onOpenDialog: (action: ConfirmAction) => void;
}

function ActionsCard({ user, isUpdating, onOpenDialog }: ActionsCardProps) {
  return (
    <Card variant="section">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Account actions</CardTitle>
        <CardDescription>Suspend, ban, or reactivate this user.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.status !== "active" && (
          <div className="flex items-start gap-3 rounded-md border border-yellow-300/50 bg-yellow-50/40 p-4 dark:border-yellow-800/50 dark:bg-yellow-950/20">
            <HugeiconsIcon
              className="mt-0.5 h-5 w-5 text-yellow-700 dark:text-yellow-400"
              icon={Alert01Icon}
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                Account is {user.status === "suspended" ? "suspended" : "banned"}
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                {user.status === "suspended"
                  ? "This user cannot log in or perform any actions."
                  : "This user is restricted from using the platform."}
              </p>
            </div>
          </div>
        )}

        {user.status === "active" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={isUpdating} onClick={() => onOpenDialog("suspend")} variant="outline">
              Suspend account
            </Button>
            <Button disabled={isUpdating} onClick={() => onOpenDialog("ban")} variant="destructive">
              Ban account
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            disabled={isUpdating}
            onClick={() => onOpenDialog("reactivate")}
          >
            Reactivate account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface ConfirmDialogProps {
  action: ConfirmAction;
  isOpen: boolean;
  isUpdating: boolean;
  user: AdminUser | undefined;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmationDialog({
  action,
  isOpen,
  isUpdating,
  onClose,
  onConfirm,
  user,
}: ConfirmDialogProps) {
  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "this user";
  const text = (() => {
    switch (action) {
      case "suspend":
        return {
          confirmText: "Suspend account",
          description: `${fullName} will not be able to log in or perform any actions.`,
          title: "Suspend user account",
        };
      case "ban":
        return {
          confirmText: "Ban account",
          description: `${fullName} will be permanently restricted. Reversible only by an admin.`,
          title: "Ban user account",
        };
      case "reactivate":
        return {
          confirmText: "Reactivate account",
          description: `${fullName} will be able to log in and use the platform again.`,
          title: "Reactivate user account",
        };
      default:
        return { confirmText: "", description: "", title: "" };
    }
  })();

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={isUpdating} onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            className={
              action === "ban" || action === "suspend"
                ? "bg-destructive hover:bg-destructive/90"
                : ""
            }
            disabled={isUpdating}
            onClick={onConfirm}
          >
            {isUpdating ? "Processing…" : text.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminUserDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetAdminUsersById(id);
  const { isPending: isUpdating, mutate: updateStatus } = usePatchAdminUsersByIdStatus();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const user = data as any as AdminUser | undefined;

  const handleConfirm = () => {
    if (!confirmAction || !user) return;
    const statusMap: Record<"suspend" | "ban" | "reactivate", "active" | "suspended" | "banned"> = {
      ban: "banned",
      reactivate: "active",
      suspend: "suspended",
    };
    updateStatus(
      { data: { status: statusMap[confirmAction] }, id: user.id },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto space-y-6 px-6 py-8 lg:px-12">
        <Button onClick={() => navigate({ to: "/dashboard" })} size="sm" variant="ghost">
          <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft02Icon} />
          Back to dashboard
        </Button>
        <Card variant="section">
          <CardHeader>
            <CardTitle className="text-destructive">User not found</CardTitle>
            <CardDescription>
              The user with ID <code className="font-mono">{id}</code> could not be loaded.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isShopOwner = user.roles?.some((r) => r.role === "shop_owner") ?? false;

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Button onClick={() => navigate({ to: "/dashboard" })} size="sm" variant="ghost">
        <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft02Icon} />
        Back to dashboard
      </Button>

      <ProfileCard user={user} />

      {isShopOwner && <UserShopsSection userId={user.id} />}

      <ActionsCard isUpdating={isUpdating} onOpenDialog={setConfirmAction} user={user} />

      <ConfirmationDialog
        action={confirmAction}
        isOpen={confirmAction !== null}
        isUpdating={isUpdating}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        user={user}
      />
    </div>
  );
}
