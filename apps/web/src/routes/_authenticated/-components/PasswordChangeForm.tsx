import { useUser as useClerkUser, useReverification } from "@clerk/react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function buildSchema(requireCurrent: boolean) {
  return z
    .object({
      confirmPassword: z.string(),
      currentPassword: z.string(),
      newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
    })
    .superRefine((data, ctx) => {
      if (requireCurrent && data.currentPassword.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current password is required",
          path: ["currentPassword"],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    });
}

// Clerk throws a ClerkAPIResponseError whose `errors` array carries the
// human-readable reason (wrong password, breached password, etc.).
function clerkErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const arr = (err as { errors?: { longMessage?: string; message?: string }[] }).errors;
    const first = arr?.[0];
    if (first) return first.longMessage || first.message || "Failed to update password.";
  }
  if (err instanceof Error) return err.message;
  return "Failed to update password. Please try again.";
}

export function PasswordChangeForm() {
  const { user } = useClerkUser();
  // Changing a password is a sensitive action: Clerk may demand re-verification
  // ("You need to provide additional verification..."). useReverification wraps
  // the call so Clerk's re-auth prompt runs, then retries the update.
  const changePassword = useReverification(
    (...args: Parameters<NonNullable<typeof user>["updatePassword"]>) =>
      // biome-ignore lint/style/noNonNullAssertion: guarded by `if (!user)` in onSubmit
      user!.updatePassword(...args)
  );
  const requireCurrent = user?.passwordEnabled ?? false;
  const schema = useMemo(() => buildSchema(requireCurrent), [requireCurrent]);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    defaultValues: { confirmPassword: "", currentPassword: "", newPassword: "" },
    mode: "onSubmit",
    resolver: standardSchemaResolver(schema) as Resolver<PasswordFormValues>,
    reValidateMode: "onChange",
  });

  const clearFieldErrorOnChange = (field: keyof PasswordFormValues) => () => {
    if (errors[field]) clearErrors(field);
    if (saved) setSaved(false);
  };

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    try {
      await changePassword({
        newPassword: data.newPassword,
        signOutOfOtherSessions: true,
        ...(requireCurrent ? { currentPassword: data.currentPassword } : {}),
      });
      reset({ confirmPassword: "", currentPassword: "", newPassword: "" });
      setSaved(true);
    } catch (err) {
      setError("root", { message: clerkErrorMessage(err) });
    }
  };

  return (
    <Card className="flex w-full flex-1 flex-col rounded-3xl border-none bg-background shadow-none">
      <CardHeader className="px-6 pb-4 pt-8">
        <CardTitle className="font-heading text-2xl">Change Password</CardTitle>
        <CardDescription>
          {requireCurrent
            ? "Enter your current password and choose a new one."
            : "Set a password for your account."}
        </CardDescription>
      </CardHeader>
      <form className="flex flex-1 flex-col" noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex-1 space-y-6 px-6">
          {errors.root?.message && (
            <p
              aria-live="polite"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {errors.root.message}
            </p>
          )}

          {requireCurrent && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="currentPassword">
                <HugeiconsIcon className="h-4 w-4" icon={LockPasswordIcon} /> Current password
              </Label>
              <Input
                aria-invalid={!!errors.currentPassword || undefined}
                autoComplete="current-password"
                className={
                  errors.currentPassword ? "border-destructive focus-visible:ring-destructive" : ""
                }
                id="currentPassword"
                type="password"
                {...register("currentPassword", {
                  onChange: clearFieldErrorOnChange("currentPassword"),
                })}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="newPassword">
                <HugeiconsIcon className="h-4 w-4" icon={LockPasswordIcon} /> New password
              </Label>
              <Input
                aria-invalid={!!errors.newPassword || undefined}
                autoComplete="new-password"
                className={
                  errors.newPassword ? "border-destructive focus-visible:ring-destructive" : ""
                }
                id="newPassword"
                type="password"
                {...register("newPassword", { onChange: clearFieldErrorOnChange("newPassword") })}
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="confirmPassword">
                <HugeiconsIcon className="h-4 w-4" icon={LockPasswordIcon} /> Confirm password
              </Label>
              <Input
                aria-invalid={!!errors.confirmPassword || undefined}
                autoComplete="new-password"
                className={
                  errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                }
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  onChange: clearFieldErrorOnChange("confirmPassword"),
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3 border-t px-6 py-8">
          {saved && !isSubmitting && (
            <p className="mr-auto text-sm text-muted-foreground">Password updated.</p>
          )}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
