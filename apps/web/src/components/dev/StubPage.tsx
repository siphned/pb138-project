import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StubPageProps {
  title: string;
  role?: string;
  hookName: string;
  children: ReactNode;
}

export function StubPage({ title, role, hookName, children }: StubPageProps) {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card variant="section" className="p-4 space-y-1">
        <h1 className="font-heading text-2xl">[STUB] {title}</h1>
        <p className="text-muted-foreground text-sm">
          Hook: <code>{hookName}</code>
          {role && <> · Role: <code>{role}</code></>}
        </p>
      </Card>
      {children}
    </div>
  );
}
