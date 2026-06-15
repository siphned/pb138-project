import { useUser as useClerkUser } from "@clerk/react";
import { Mail01Icon, User02Icon } from "@hugeicons/core-free-icons";
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

const nameFormSchema = z.object({
  firstName: z.string().refine((v) => v.trim().length > 0, { message: "First name is required" }),
  lastName: z.string().refine((v) => v.trim().length > 0, { message: "Last name is required" }),
});

type NameFormValues = z.infer<typeof nameFormSchema>;

function buildResolver(): Resolver<NameFormValues> {
  return (values) => {
    const result = nameFormSchema.safeParse(values);
    if (result.success) {
      return { errors: {}, values: result.data };
    }
    const fieldErrors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.map(String).join(".");
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = { message: issue.message, type: issue.code };
      }
    }
    return { errors: fieldErrors as never, values: {} as NameFormValues };
  };
}

export function ClerkNameForm() {
  const { user } = useClerkUser();
  const resolver = useMemo(() => buildResolver(), []);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<NameFormValues>({
    mode: "onSubmit",
    resolver,
    reValidateMode: "onChange",
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  const clearFieldErrorOnChange = (field: "firstName" | "lastName") => () => {
    if (errors[field]) clearErrors(field);
    if (saved) setSaved(false);
  };

  const onSubmit = async (data: NameFormValues) => {
    if (!user) return;
    try {
      await user.update({ firstName: data.firstName, lastName: data.lastName });
      setSaved(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save changes. Please try again.";
      setError("root", { message });
    }
  };

  return (
    <Card className="flex w-full flex-1 flex-col rounded-3xl border-none bg-background shadow-none">
      <CardHeader className="px-6 pb-4 pt-8">
        <CardTitle className="font-heading text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your name. Your email is shown for reference.</CardDescription>
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="firstName">
                <HugeiconsIcon className="h-4 w-4" icon={User02Icon} /> First Name
              </Label>
              <Input
                aria-invalid={!!errors.firstName || undefined}
                className={
                  errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""
                }
                id="firstName"
                placeholder="John"
                {...register("firstName", { onChange: clearFieldErrorOnChange("firstName") })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="lastName">
                <HugeiconsIcon className="h-4 w-4" icon={User02Icon} /> Last Name
              </Label>
              <Input
                aria-invalid={!!errors.lastName || undefined}
                className={
                  errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""
                }
                id="lastName"
                placeholder="Doe"
                {...register("lastName", { onChange: clearFieldErrorOnChange("lastName") })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="email">
              <HugeiconsIcon className="h-4 w-4" icon={Mail01Icon} /> Email
            </Label>
            <Input
              disabled
              id="email"
              readOnly
              value={user?.primaryEmailAddress?.emailAddress ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Email changes require verification and aren't editable here.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3 border-t px-6 py-8">
          {saved && !isSubmitting && (
            <p className="mr-auto text-sm text-muted-foreground">Saved.</p>
          )}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
