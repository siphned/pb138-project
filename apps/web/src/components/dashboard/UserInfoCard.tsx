import { Pencil } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// 1. Import the Dialog components
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";

// 2. Import your brand new form!
import { ProfileEditForm } from "./ProfileEditForm";

export function UserInfoCard({ onEdit }: { onEdit?: () => void }) {
  const { user } = useUser();
  // 3. Add state to control when the dialog is open or closed
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fullName = `${user?.fname || ""} ${user?.lname || ""}`.trim() || "User";
  const initials = fullName.substring(0, 2).toUpperCase();

  return (
    <Card class="bg-secondary/40 border-none shadow-none rounded-3xl">
      <CardContent class="p-6 md:p-8">
        <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <Avatar class="h-24 w-24 md:h-28 md:w-28 flex-none">
            <AvatarFallback class="bg-primary text-primary-foreground font-heading text-2xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div class="flex-1 flex flex-col gap-4 w-full">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div class="space-y-1.5">
                <h1 class="font-heading text-2xl md:text-3xl font-semibold">{fullName}</h1>
                <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{user.email}</span>
                </div>
              </div>

              {/* 4. WRAP THE BUTTON IN THE DIALOG */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      class="bg-background shrink-0 rounded-full px-5"
                      onClick={(e) => {
                        if (onEdit) {
                          e.preventDefault();
                          onEdit();
                        }
                      }}
                    >
                      <Pencil class="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  }
                />

                {/* 5. RENDER THE FORM INSIDE THE DIALOG CONTENT */}
                <DialogContent class="sm:max-w-2xl bg-background border-border p-0 overflow-hidden rounded-3xl">
                  {/* Notice how it is properly rendered with < /> */}
                  <ProfileEditForm
                    onCancel={() => setIsEditDialogOpen(false)}
                    onSuccess={() => setIsEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
