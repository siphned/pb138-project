import { type ProfileUpdate, ProfileUpdateSchema } from "@repo/shared";
import { Globe, Mail, MapPin, User } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";

interface ProfileEditFormProps {
  initialData?: ProfileUpdate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ initialData, onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState<ProfileUpdate>(initialData || user);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileUpdate, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialData) {
      setFormData(user);
    }
  }, [user, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof ProfileUpdate]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    // 1. Validate using Zod
    const result = ProfileUpdateSchema.safeParse(formData);

    if (!result.success) {
      // 2. Handle validation errors
      const formattedErrors: Partial<Record<keyof ProfileUpdate, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ProfileUpdate;
        if (!formattedErrors[path]) {
          formattedErrors[path] = issue.message;
        }
      }
      setErrors(formattedErrors);
      setIsSaving(false);
      return;
    }

    try {
      // 3. Submit validated data
      await updateUser(result.data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-none bg-background rounded-3xl">
      <CardHeader className="px-6 pt-8 pb-4">
        <CardTitle className="font-heading text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your winemaker information visible to other users.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="px-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Winemaker Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Chateau Montrose"
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@winery.com"
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bordeaux, France"
                className={
                  errors.location ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.location && (
                <p className="text-xs text-destructive mt-1">{errors.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Website
              </Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                className={
                  errors.website ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.website && <p className="text-xs text-destructive mt-1">{errors.website}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Describe your wine estate and history..."
              className={`min-h-[120px] ${errors.bio ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio}</p>}
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
