import { SignUp } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
  component: RegisterComponent,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
});

function RegisterComponent() {
  const { redirect } = Route.useSearch();
  const signInUrl = redirect
    ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
    : "/auth/login";
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <SignUp forceRedirectUrl={redirect ?? "/dashboard"} signInUrl={signInUrl} />
    </div>
  );
}
