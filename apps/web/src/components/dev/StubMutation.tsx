import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { StubPage } from "./StubPage";
import { Button } from "@/components/ui/button";

interface StubMutationProps {
  title: string;
  role?: string;
  hookName: string;
  mutation: UseMutationResult<unknown, unknown, any, unknown>;
  payloadExample?: any;
}

export function StubMutation({ title, role, hookName, mutation, payloadExample }: StubMutationProps) {
  const [payload, setPayload] = useState(JSON.stringify(payloadExample || {}, null, 2));

  const handleFire = () => {
    try {
      const parsed = JSON.parse(payload);
      mutation.mutate(parsed);
    } catch (e) {
      alert("Invalid JSON payload");
    }
  };

  return (
    <StubPage title={title} role={role} hookName={hookName}>
      <div className="space-y-4 border rounded-lg p-4 bg-background">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Payload (JSON)</label>
          <textarea
            className="w-full h-40 p-2 font-mono text-xs bg-muted border rounded"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleFire} 
            disabled={mutation.isPending}
            variant="default"
          >
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

        {mutation.data && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Response</label>
            <pre className="p-4 bg-green-50 text-green-900 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(mutation.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </StubPage>
  );
}
