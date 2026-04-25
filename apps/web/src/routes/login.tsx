import { SignIn } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div class="flex min-h-screen items-center justify-center bg-background">
      <SignIn />
    </div>
  );
}
