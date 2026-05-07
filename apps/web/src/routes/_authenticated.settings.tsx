import { useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    return (
      <AuthLayout>
        <div className="container mx-auto p-8">
          <div className="h-8 w-32 animate-pulse rounded-md bg-secondary/20" />
        </div>
      </AuthLayout>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setEditMode(false);
    } catch {
      // Silently fail - user stays in edit mode to retry
    }
  };

  return (
    <AuthLayout>
      <div className="container mx-auto max-w-4xl p-8">
        <div className="space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your profile and account preferences
            </p>
          </div>

          {/* Profile Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </div>
              {!editMode && (
                <Button onClick={() => setEditMode(true)} size="sm" variant="outline">
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    disabled={!editMode}
                    id="firstName"
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Your first name"
                    value={formData.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    disabled={!editMode}
                    id="lastName"
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Your last name"
                    value={formData.lastName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input disabled placeholder="Your email" value={formData.email} />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed in this interface. Contact support if needed.
                </p>
              </div>

              {editMode && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} variant="default">
                    Save Changes
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your orders and account
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Event Invitations</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new wine events and tastings
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Account Actions */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <p className="text-xs text-muted-foreground">
                To delete your account, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
