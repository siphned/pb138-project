import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Alert01Icon, ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
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

function getStatusBadgeClass(status: string): string {
  if (status === "active") {
    return "bg-green-100/30 text-green-700 dark:text-green-400";
  }
  if (status === "suspended") {
    return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
  }
  return "bg-destructive/30 text-destructive dark:text-red-400";
}

function getRoleColor(role: string): string {
  switch (role) {
    case "admin":
      return "bg-purple-100/30 text-purple-700 dark:text-purple-400";
    case "winemaker":
      return "bg-blue-100/30 text-blue-700 dark:text-blue-400";
    case "shop_owner":
      return "bg-orange-100/30 text-orange-700 dark:text-orange-400";
    default:
      return "bg-gray-100/30 text-gray-700 dark:text-gray-400";
  }
}

function getStatusLabel(status: "suspended" | "banned"): string {
  return status === "suspended" ? "Suspended" : "Banned";
}

function getStatusMessage(status: "suspended" | "banned"): string {
  return status === "suspended"
    ? "This user cannot log in or perform any actions."
    : "This user is restricted from using the platform.";
}

interface ConfirmationTextParams {
  action: ConfirmAction;
  fname?: string;
  lname?: string;
}

function getConfirmationText({ action, fname = "User", lname = "" }: ConfirmationTextParams) {
  const fullName = `${fname} ${lname}`.trim();

  switch (action) {
    case "suspend":
      return {
        confirmText: "Suspend Account",
        description: `Are you sure you want to suspend ${fullName}'s account? They will not be able to log in or perform any actions.`,
        title: "Suspend User Account",
      };
    case "ban":
      return {
        confirmText: "Ban Account",
        description: `Are you sure you want to ban ${fullName}'s account? This is a permanent action that can be reversed only by an admin.`,
        title: "Ban User Account",
      };
    case "reactivate":
      return {
        confirmText: "Reactivate Account",
        description: `Reactivate ${fullName}'s account? They will be able to log in and use the platform again.`,
        title: "Reactivate User Account",
      };
    default:
      return { confirmText: "", description: "", title: "" };
  }
}

function ErrorCard({ id }: { id: string }) {
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <Button className="mb-4" onClick={() => navigate({ to: "/users" })} size="sm" variant="ghost">
        <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft02Icon} />
        Back to Users
      </Button>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">User Not Found</CardTitle>
          <CardDescription>Could not load user details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The user with ID <code className="font-mono">{id}</code> could not be found or you do
            not have permission to view it.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function LoadingCard() {
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate({ to: "/users" })} size="sm" variant="ghost">
          <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft02Icon} />
          Back
        </Button>
        <h1 className="text-3xl font-semibold">User Details</h1>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="space-y-2" key={i}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

interface UserProfileProps {
  user: AdminUser;
}

function UserProfile({ user }: UserProfileProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {user.fname} {user.lname}
            </CardTitle>
            <CardDescription className="font-mono text-sm">{user.email}</CardDescription>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(user.status)}`}
          >
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Roles</p>
          <div className="flex flex-wrap gap-2">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => (
                <Badge className={`${getRoleColor(role.role)} border-0`} key={role.id}>
                  {role.role.replace("_", " ")}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Member Since</p>
          <p className="text-sm">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionButtonsProps {
  user: AdminUser;
  isUpdating: boolean;
  onOpenDialog: (action: ConfirmAction) => void;
}

function ActionButtons({ isUpdating, onOpenDialog, user }: ActionButtonsProps) {
  if (user.status === "active") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
          disabled={isUpdating}
          onClick={() => onOpenDialog("suspend")}
          variant="outline"
        >
          Suspend Account
        </Button>
        <Button disabled={isUpdating} onClick={() => onOpenDialog("ban")} variant="destructive">
          Ban Account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md bg-yellow-50 p-4 dark:bg-yellow-950/20">
        <HugeiconsIcon className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" icon={Alert01Icon} />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
            Account is {getStatusLabel(user.status as "suspended" | "banned")}
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            {getStatusMessage(user.status as "suspended" | "banned")}
          </p>
        </div>
      </div>
      <Button className="w-full" disabled={isUpdating} onClick={() => onOpenDialog("reactivate")}>
        Reactivate Account
      </Button>
    </div>
  );
}

interface ActionPanelProps {
  user: AdminUser;
  isUpdating: boolean;
  onOpenDialog: (action: ConfirmAction) => void;
}

function ActionPanel({ isUpdating, onOpenDialog, user }: ActionPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>Manage user account status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionButtons isUpdating={isUpdating} onOpenDialog={onOpenDialog} user={user} />
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
  const text = getConfirmationText({
    action,
    fname: user?.fname,
    lname: user?.lname,
  });

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
            {isUpdating ? "Processing..." : text.confirmText}
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

  const handleStatusChange = (newStatus: "active" | "suspended" | "banned") => {
    if (!user) return;
    updateStatus(
      {
        data: { status: newStatus },
        id: user.id,
      },
      {
        onSuccess: () => {
          setConfirmAction(null);
        },
      }
    );
  };

  const handleConfirm = () => {
    if (!confirmAction) return;

    const statusMap: Record<"suspend" | "ban" | "reactivate", "active" | "suspended" | "banned"> = {
      ban: "banned",
      reactivate: "active",
      suspend: "suspended",
    };

    handleStatusChange(statusMap[confirmAction]);
  };

  if (error) {
    return <ErrorCard id={id} />;
  }

  if (isLoading) {
    return <LoadingCard />;
  }

  if (!user) {
    return <ErrorCard id={id} />;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate({ to: "/users" })} size="sm" variant="ghost">
          <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft02Icon} />
          Back
        </Button>
        <h1 className="text-3xl font-semibold">User Details</h1>
      </div>

      <UserProfile user={user} />
      <ActionPanel isUpdating={isUpdating} onOpenDialog={setConfirmAction} user={user} />

      <ConfirmationDialog
        action={confirmAction}
        isOpen={confirmAction !== null}
        isUpdating={isUpdating}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        user={user}
      />
    </main>
  );
}
