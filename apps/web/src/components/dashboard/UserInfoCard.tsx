import { useClerk } from "@clerk/react";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// 1. Import the Dialog components
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// 2. Import your brand new form!
import { ProfileEditForm } from "./ProfileEditForm";

export function UserInfoCard({ onEdit }: { onEdit?: () => void }) {
  const { user: clerkUser } = useClerk();

  // 3. Add state to control when the dialog is open or closed
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fullName = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || "User";
  const initials = fullName.substring(0, 2).toUpperCase();

  return (
    <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 flex-none">
            <AvatarImage alt={clerkUser?.fullName || "User"} src={clerkUser?.imageUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground font-heading text-3xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="font-heading text-2xl md:text-3xl font-semibold">{fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{clerkUser?.emailAddresses[0]?.emailAddress}</span>
                </div>
              </div>

              {/* 4. WRAP THE BUTTON IN THE DIALOG */}
              <Dialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      className="bg-background shrink-0 rounded-full px-5"
                      onClick={(e) => {
                        if (onEdit) {
                          e.preventDefault();
                          onEdit();
                        }
                      }}
                      variant="outline"
                    >
                      <HugeiconsIcon className="h-4 w-4 mr-2" icon={PencilEdit01Icon} />
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
            <div className="text-sm text-muted-foreground">
              {"This user prefers to keep an air of mystery about them."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
