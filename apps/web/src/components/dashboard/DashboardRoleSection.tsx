import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { usePostRoleRequests } from "@/generated/hooks/usePostRoleRequests";

type RequestType = "winemaker" | "shop_owner";

const TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: "winemaker", label: "Winemaker" },
  { value: "shop_owner", label: "Shop owner" },
];

function is409Error(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number }; status?: number };
  return maybe.response?.status === 409 || maybe.status === 409;
}

export function DashboardRoleSection() {
  const { user } = useUser();
  const [type, setType] = useState<RequestType>("winemaker");
  const [businessName, setBusinessName] = useState("");
  const [details, setDetails] = useState("");
  const mutation = usePostRoleRequests();

  if (!user) return null;

  const roles = user.roles ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    mutation.mutate({
      data: {
        businessName: businessName.trim(),
        type,
        ...(details.trim() ? { details: details.trim() } : {}),
      },
    });
  };

  const alreadyPending = is409Error(mutation.error);

  return (
    <div className="space-y-6" data-slot="dashboard-role-section">
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <Badge key={role} variant="secondary">
            {role}
          </Badge>
        ))}
      </div>

      {mutation.isSuccess ? (
        <p className="rounded-md border border-border bg-muted p-4 text-sm text-foreground">
          Request submitted, awaiting admin approval.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="request-type">Request a new role</Label>
            <Select onValueChange={(v) => setType(v as RequestType)} value={type}>
              <SelectTrigger id="request-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Hron Vineyards"
              value={businessName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Notes (optional)</Label>
            <Input
              id="details"
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Anything else the admin team should know"
              value={details}
            />
          </div>

          {alreadyPending && (
            <p className="text-sm text-destructive">
              You already have a pending request for this role.
            </p>
          )}

          <Button disabled={mutation.isPending || !businessName.trim()} type="submit">
            {mutation.isPending ? "Submitting..." : "Request access"}
          </Button>
        </form>
      )}
    </div>
  );
}
