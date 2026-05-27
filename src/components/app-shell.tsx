import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}