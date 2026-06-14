import type { UseQueryResult } from "@tanstack/react-query";
import { type ActorRole, StubPage } from "@/routes/-components/StubPage";

interface StubGetProps {
  title: string;
  actorRole?: ActorRole;
  hookName: string;
  query: UseQueryResult<unknown, unknown>;
}

export function StubGet({ title, actorRole, hookName, query }: StubGetProps) {
  const { data, status, error, isLoading } = query;

  return (
    <StubPage actorRole={actorRole} hookName={hookName} title={title}>
      <div className="space-y-2">
        <div className="flex gap-2 text-xs font-mono">
          <span
            className={`px-1 rounded ${status === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
          >
            {status}
          </span>
          {isLoading && <span className="animate-pulse">Loading...</span>}
        </div>

        {error ? (
          <pre className="p-4 bg-destructive/10 text-destructive rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : null}

        <pre className="p-4 bg-muted rounded text-xs overflow-auto max-h-[50vh]">
          {data ? JSON.stringify(data, null, 2) : "// No data yet or loading"}
        </pre>
      </div>
    </StubPage>
  );
}
