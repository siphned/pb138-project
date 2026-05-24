import type React from "react";
import { Header } from "./Header";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
<<<<<<< HEAD
    <div className="flex h-full min-h-dvh w-full flex-col bg-background">
=======
    <div className="flex min-h-screen w-full flex-col bg-background">
>>>>>>> origin/main
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
