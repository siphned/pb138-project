import { Pencil } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  if (!user) return null;

  const initials = `${user.fname[0]}${user.lname[0]}`.toUpperCase();
  const fullName = `${user.fname} ${user.lname}`;

  return (
    <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 flex-none">
            <AvatarImage src="" alt={fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground font-heading text-2xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="font-heading text-2xl md:text-3xl font-semibold">{fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{user.email}</span>
                </div>
              </div>

              {/* 4. WRAP THE BUTTON IN THE DIALOG */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="bg-background shrink-0 rounded-full px-5"
                      onClick={(e) => {
                        if (onEdit) {
                          e.preventDefault();
                          onEdit();
                        }
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  }
                />

                {/* 5. RENDER THE FORM INSIDE THE DIALOG CONTENT */}
                <DialogContent className="sm:max-w-2xl bg-background border-border p-0 overflow-hidden rounded-3xl">
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
