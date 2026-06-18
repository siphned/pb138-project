import { Button } from "@/components/ui/button";

interface AccountBlockedScreenProps {
  onSignOut: () => void;
}

export function AccountBlockedScreen({ onSignOut }: AccountBlockedScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="font-heading text-3xl font-bold text-foreground">Account suspended</h1>
      <p className="max-w-md text-muted-foreground">
        Your account has been suspended or banned, so you can&apos;t access WineMarket right now. If
        you think this is a mistake, please contact support.
      </p>
      <Button onClick={onSignOut}>Sign out</Button>
    </div>
  );
}
