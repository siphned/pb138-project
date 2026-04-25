import { Link } from "@tanstack/react-router";

interface RouteStubProps {
  title: string;
}

export function RouteStub({ title }: RouteStubProps) {
  return (
    <main class="mx-auto max-w-4xl space-y-4 p-6">
      <h1 class="text-2xl font-semibold">{title}</h1>
      <p class="text-muted-foreground">This page is not implemented yet.</p>
      <Link
        to="/dashboard"
        class="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
