import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  return <RouteStub title="Log Out" />;
}
