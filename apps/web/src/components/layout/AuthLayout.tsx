import type * as React from "react";
import type { Role } from "@/types/roles";
import { Header } from "./Header";

interface AuthLayoutProps {
  children: React.ReactNode;
  activeRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function AuthLayout({ children, activeRole, onRoleChange }: AuthLayoutProps) {
  return (
    <div class="flex min-h-screen w-full bg-background">
      {/* Left Side: Sidebar */}
      {/*<Sidebar />*/}

      {/* Right Side: Header + Page Content */}
      <div class="flex flex-col flex-1">
        <Header activeRole={activeRole} onRoleChange={onRoleChange} />

        {/* The actual page content is injected here */}
        <main class="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
