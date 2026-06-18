import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { type Resolver, useForm } from "react-hook-form";
import z from "zod";
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

const roleRequestSchema = z.object({
  businessName: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Business name is required" }),
  details: z.string().optional(),
  type: z.enum(["winemaker", "shop_owner"]),
});

type RoleRequestValues = z.infer<typeof roleRequestSchema>;

const TYPE_OPTIONS: { value: RoleRequestValues["type"]; label: string }[] = [
  { label: "Winemaker", value: "winemaker" },
  { label: "Shop owner", value: "shop_owner" },
];

function is409Error(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number }; status?: number };
  return maybe.response?.status === 409 || maybe.status === 409;
}

export function DashboardRoleSection() {
  const { user } = useUser();
  const mutation = usePostRoleRequests();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleRequestValues>({
    defaultValues: { businessName: "", details: "", type: "winemaker" },
    mode: "onSubmit",
    resolver: standardSchemaResolver(roleRequestSchema) as Resolver<RoleRequestValues>,
    reValidateMode: "onChange",
  });

  const type = watch("type");
  const alreadyPending = is409Error(mutation.error);

  if (!user) return null;

  const roles = user.roles ?? [];

  const onSubmit = (data: RoleRequestValues) => {
    mutation.mutate({
      data: {
        businessName: data.businessName.trim(),
        type: data.type,
        ...(data.details?.trim() ? { details: data.details.trim() } : {}),
      },
    });
  };

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
        <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="request-type">Request a new role</Label>
            <Select
              onValueChange={(v) => setValue("type", v as RoleRequestValues["type"])}
              value={type}
            >
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
              aria-invalid={!!errors.businessName || undefined}
              id="business-name"
              placeholder="e.g. Hron Vineyards"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="mt-1 text-xs text-destructive">{errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Notes (optional)</Label>
            <Input
              id="details"
              placeholder="Anything else the admin team should know"
              {...register("details")}
            />
          </div>

          {alreadyPending && (
            <p className="text-sm text-destructive">
              You already have a pending request for this role.
            </p>
          )}

          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Submitting..." : "Request access"}
          </Button>
        </form>
      )}
    </div>
  );
}
