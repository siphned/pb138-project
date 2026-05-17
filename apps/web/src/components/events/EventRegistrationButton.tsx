import { Link } from "@tanstack/react-router";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { useDeleteEventsByIdRegister } from "@/generated/hooks/useDeleteEventsByIdRegister";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";

interface EventRegistrationButtonProps {
  eventId: string;
  /**
   * Whether the current user is already registered. The BE detail endpoint is
   * expected to expose this (see plan §8 / §10 — BE backlog). Until then the
   * route can pass `undefined` and the button falls back to "Register".
   */
  isRegistered?: boolean;
}

export function EventRegistrationButton({
  eventId,
  isRegistered,
}: EventRegistrationButtonProps) {
  const { user, isLoading } = useUser();
  const registerMutation = usePostEventsByIdRegister();
  const cancelMutation = useDeleteEventsByIdRegister();

  if (isLoading) {
    return (
      <Button className="w-full" disabled>
        Loading…
      </Button>
    );
  }

  if (!user) {
    return (
      <Button className="w-full" render={<Link to="/auth/login" />}>
        Sign in to register
      </Button>
    );
  }

  if (isRegistered) {
    const pending = cancelMutation.isPending;
    return (
      <Button
        className="w-full"
        disabled={pending}
        onClick={() => cancelMutation.mutate({ id: eventId })}
        variant="destructive"
      >
        {pending ? "Cancelling…" : "Cancel registration"}
      </Button>
    );
  }

  const pending = registerMutation.isPending;
  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() => registerMutation.mutate({ id: eventId })}
    >
      {pending ? "Registering…" : "Register"}
    </Button>
  );
}
