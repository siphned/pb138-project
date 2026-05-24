import { zodResolver } from "@hookform/resolvers/zod";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
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

const profileSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      fname: user?.fname ?? "",
      lname: user?.lname ?? "",
    },
    resolver: zodResolver(profileSchema),
    values: {
      fname: user?.fname ?? "",
      lname: user?.lname ?? "",
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      await updateUser(data);
      onSuccess?.();
    } catch {
      setError("root", { message: "Failed to update profile. Please try again." });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-none bg-background rounded-3xl">
      <CardHeader className="px-6 pt-8 pb-4">
        <CardTitle className="font-heading text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your name information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-6 space-y-6">
          {errors.root && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="fname">
                <HugeiconsIcon className="h-4 w-4" icon={UserIcon} /> First Name
              </Label>
              <Input
                className={errors.fname ? "border-destructive focus-visible:ring-destructive" : ""}
                id="fname"
                placeholder="John"
                {...register("fname")}
              />
              {errors.fname && <p className="text-xs text-destructive mt-1">{errors.fname.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="lname">
                <HugeiconsIcon className="h-4 w-4" icon={UserIcon} /> Last Name
              </Label>
              <Input
                className={errors.lname ? "border-destructive focus-visible:ring-destructive" : ""}
                id="lname"
                placeholder="Doe"
                {...register("lname")}
              />
              {errors.lname && <p className="text-xs text-destructive mt-1">{errors.lname.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-8 flex justify-end gap-3 border-t">
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
