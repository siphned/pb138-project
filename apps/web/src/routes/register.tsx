import { SignUp } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div class="flex min-h-screen items-center justify-center bg-background">
      <SignUp />
    </div>
  );
}
