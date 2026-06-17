import type React from "react";
import { Header } from "./Header";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex h-full min-h-dvh w-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
