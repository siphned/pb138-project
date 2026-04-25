import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/react";

export const Route = createFileRoute("/auth/login")({
  component: LoginComponent,
});

function LoginComponent() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <SignIn 
        signUpUrl="/auth/register" 
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
