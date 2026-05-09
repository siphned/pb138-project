import type { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type ActorRole, StubPage } from "./StubPage";

interface StubMutationProps<TData, TVariables> {
  title: string;
  actorRole?: ActorRole;
  hookName: string;
  mutation: UseMutationResult<TData, unknown, TVariables>;
  payloadExample?: TVariables;
}

export function StubMutation<TData, TVariables>({
  title,
  actorRole,
  hookName,
  mutation,
  payloadExample,
}: StubMutationProps<TData, TVariables>) {
  const [payload, setPayload] = useState(JSON.stringify(payloadExample ?? {}, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFire = () => {
    try {
      const parsed = JSON.parse(payload) as TVariables;
      setParseError(null);
      mutation.mutate(parsed);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON payload");
    }
  };

  return (
    <StubPage hookName={hookName} actorRole={actorRole} title={title}>
      <div className="space-y-4 border rounded-lg p-4 bg-background">
        <label className="space-y-2 block">
          <span className="text-xs font-bold uppercase text-muted-foreground">
            Payload (JSON)
          </span>
          <textarea
            className="w-full h-40 p-2 font-mono text-xs bg-muted border rounded"
            onChange={(e) => setPayload(e.target.value)}
            value={payload}
          />
        </label>

        {parseError && (
          <p className="text-destructive text-sm">JSON parse error: {parseError}</p>
        )}

        <div className="flex items-center gap-4">
          <Button disabled={mutation.isPending} onClick={handleFire} variant="default">
            {mutation.isPending ? "Firing..." : "Fire Mutation"}
          </Button>

          <div className="text-xs font-mono">
            Status: <span className="px-1 rounded bg-muted">{mutation.status}</span>
          </div>
        </div>

        {mutation.error && (
          <pre className="p-4 bg-destructive/10 text-destructive rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(mutation.error, null, 2)}
          </pre>
        )}

        {mutation.data !== undefined && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Response</span>
            <pre className="p-4 bg-green-50 text-green-900 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(mutation.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </StubPage>
  );
}
