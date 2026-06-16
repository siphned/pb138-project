import { SignIn } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  component: LoginComponent,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
});

function LoginComponent() {
  const { redirect } = Route.useSearch();
  const signUpUrl = redirect
    ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
    : "/auth/register";
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <SignIn forceRedirectUrl={redirect ?? "/dashboard"} signUpUrl={signUpUrl} />
    </div>
  );
}
