import { SignUp } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
  component: RegisterComponent,
});

function RegisterComponent() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <SignUp signInUrl="/auth/login" forceRedirectUrl="/dashboard" />
    </div>
  );
}
