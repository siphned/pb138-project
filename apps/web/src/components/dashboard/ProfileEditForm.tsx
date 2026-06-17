import { User02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
import { useUser } from "@/context/UserContext";

const profileFormSchema = z.object({
  fname: z.string().refine((v) => v.trim().length > 0, { message: "First name is required" }),
  lname: z.string().refine((v) => v.trim().length > 0, { message: "Last name is required" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useUser();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    mode: "onSubmit",
    resolver: standardSchemaResolver(profileFormSchema) as Resolver<ProfileFormValues>,
    reValidateMode: "onChange",
    values: {
      fname: user?.fname ?? "",
      lname: user?.lname ?? "",
    },
  });

  const clearFieldErrorOnChange = (field: "fname" | "lname") => () => {
    if (errors[field]) clearErrors(field);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUser(data);
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save changes. Please try again.";
      setError("root", { message });
    }
  };

  return (
    <Card className="mx-auto max-w-2xl rounded-3xl border-none bg-background shadow-none">
      <CardHeader className="px-6 pb-4 pt-8">
        <CardTitle className="font-heading text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your name information.</CardDescription>
      </CardHeader>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 px-6">
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
              <Label className="flex items-center gap-2" htmlFor="fname">
                <HugeiconsIcon className="h-4 w-4" icon={User02Icon} /> First Name
              </Label>
              <Input
                aria-invalid={!!errors.fname || undefined}
                className={errors.fname ? "border-destructive focus-visible:ring-destructive" : ""}
                id="fname"
                placeholder="John"
                {...register("fname", { onChange: clearFieldErrorOnChange("fname") })}
              />
              {errors.fname && (
                <p className="mt-1 text-xs text-destructive">{errors.fname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="lname">
                <HugeiconsIcon className="h-4 w-4" icon={User02Icon} /> Last Name
              </Label>
              <Input
                aria-invalid={!!errors.lname || undefined}
                className={errors.lname ? "border-destructive focus-visible:ring-destructive" : ""}
                id="lname"
                placeholder="Doe"
                {...register("lname", { onChange: clearFieldErrorOnChange("lname") })}
              />
              {errors.lname && (
                <p className="mt-1 text-xs text-destructive">{errors.lname.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t px-6 py-8">
          <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
