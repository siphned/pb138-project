import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
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

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  fname: string;
  lname: string;
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState<FormData>({ fname: "", lname: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ fname: user.fname, lname: user.lname });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name as keyof FormData]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fname.trim()) newErrors.fname = "First name is required";
    if (!formData.lname.trim()) newErrors.lname = "Last name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    try {
      await updateUser(formData);
      if (onSuccess) onSuccess();
    } catch {
      // Error is handled by the form error state
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-none bg-background rounded-3xl">
      <CardHeader className="px-6 pt-8 pb-4">
        <CardTitle className="font-heading text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your name information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="px-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="fname">
                <HugeiconsIcon className="h-4 w-4" icon={UserIcon} /> First Name
              </Label>
              <Input
                className={errors.fname ? "border-destructive focus-visible:ring-destructive" : ""}
                id="fname"
                name="fname"
                onChange={handleChange}
                placeholder="John"
                value={formData.fname}
              />
              {errors.fname && <p className="text-xs text-destructive mt-1">{errors.fname}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="lname">
                <HugeiconsIcon className="h-4 w-4" icon={UserIcon} /> Last Name
              </Label>
              <Input
                className={errors.lname ? "border-destructive focus-visible:ring-destructive" : ""}
                id="lname"
                name="lname"
                onChange={handleChange}
                placeholder="Doe"
                value={formData.lname}
              />
              {errors.lname && <p className="text-xs text-destructive mt-1">{errors.lname}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-8 flex justify-end gap-3 border-t">
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
