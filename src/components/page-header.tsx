import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 text-base">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}