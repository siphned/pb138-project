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

interface FormData {
  fname: string;
  lname: string;
}

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState<FormData>({ fname: "", lname: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      fname: user.fname || "",
      lname: user.lname || "",
    });
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    // Validate required fields
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
    }
    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    try {
      await updateUser(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to update profile", error);
      setErrors({ fname: "Failed to save changes" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-none bg-background rounded-3xl">
      <CardHeader className="px-6 pt-8 pb-4">
        <CardTitle className="font-heading text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your name.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="px-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fname">First Name</Label>
              <Input
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                placeholder="John"
                className={errors.fname ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.fname && <p className="text-xs text-destructive mt-1">{errors.fname}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">Last Name</Label>
              <Input
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                placeholder="Doe"
                className={errors.lname ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.lname && <p className="text-xs text-destructive mt-1">{errors.lname}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-8 flex justify-end gap-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
