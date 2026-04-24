import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return <RouteStub title="Settings" />;
}
