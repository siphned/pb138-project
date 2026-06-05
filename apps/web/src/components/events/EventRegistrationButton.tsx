import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useDeleteEventsByIdRegister } from "@/generated/hooks/useDeleteEventsByIdRegister";
import { getEventsQueryKey } from "@/generated/hooks/useGetEvents";
import { getEventsByIdQueryKey } from "@/generated/hooks/useGetEventsById";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";
import { parseApiError } from "@/lib/api-errors";

interface EventRegistrationButtonProps {
  eventId: string;
  /**
   * Whether the current user is already registered. The BE detail endpoint is
   * expected to expose this (see plan §8 / §10 — BE backlog). Until then the
   * route can pass `undefined` and the button falls back to "Register".
   */
  isRegistered?: boolean;
}

function friendlyMessage(code?: string, fallback?: string): string {
  switch (code) {
    case "ALREADY_REGISTERED":
      return "You're already registered.";
    case "CAPACITY_FULL":
      return "Event is full.";
    case "EVENT_NOT_AVAILABLE":
      return "Registration closed.";
    case "EVENT_NOT_FOUND":
      return "Event not found.";
    default:
      return fallback ?? "Something went wrong.";
  }
}

export function EventRegistrationButton({ eventId, isRegistered }: EventRegistrationButtonProps) {
  const queryClient = useQueryClient();
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

  const apiError = parseApiError(registerMutation.error);
  const isAlreadyRegistered = apiError?.code === "ALREADY_REGISTERED";
  const registered = !!isRegistered || registerMutation.isSuccess || isAlreadyRegistered;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getEventsByIdQueryKey(eventId) });
  };

  if (registered) {
    const pending = cancelMutation.isPending;
    const cancelError = parseApiError(cancelMutation.error);
    return (
      <div className="space-y-1">
        <Button
          className="w-full"
          disabled={pending}
          onClick={() =>
            cancelMutation.mutate(
              { id: eventId },
              {
                onSuccess: () => {
                  registerMutation.reset();
                  invalidate();
                },
              }
            )
          }
          variant="destructive"
        >
          {pending ? "Cancelling…" : "Cancel registration"}
        </Button>
        {cancelError && (
          <p className="text-xs text-destructive" role="alert">
            {friendlyMessage(cancelError.code, cancelError.message)}
          </p>
        )}
      </div>
    );
  }

  const pending = registerMutation.isPending;
  return (
    <div className="space-y-1">
      <Button
        className="w-full"
        disabled={pending}
        onClick={() =>
          registerMutation.mutate(
            { id: eventId },
            {
              onSuccess: () => {
                cancelMutation.reset();
                invalidate();
              },
            }
          )
        }
      >
        {pending ? "Registering…" : "Register"}
      </Button>
      {apiError && (
        <p className="text-xs text-destructive" role="alert">
          {friendlyMessage(apiError.code, apiError.message)}
        </p>
      )}
    </div>
  );
}
