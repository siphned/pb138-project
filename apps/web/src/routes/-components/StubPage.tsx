import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export type ActorRole =
  | "guest"
  | "guest+"
  | "customer"
  | "customer+"
  | "winemaker"
  | "winemaker (owner)"
  | "shop_owner"
  | "shop_owner (owner)"
  | "admin"
  | "role-aware";

interface StubPageProps {
  title: string;
  actorRole?: ActorRole;
  hookName: string;
  children: ReactNode;
}

export function StubPage({ title, actorRole, hookName, children }: StubPageProps) {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card className="p-4 space-y-1" variant="section">
        <h1 className="font-heading text-2xl">[STUB] {title}</h1>
        <p className="text-muted-foreground text-sm">
          Hook: <code>{hookName}</code>
          {actorRole && (
            <>
              {" "}
              · Role: <code>{actorRole}</code>
            </>
          )}
        </p>
      </Card>
      {children}
    </div>
  );
}
