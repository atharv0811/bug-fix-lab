import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type DemoToolbarProps = {
  /** What the demo is operating on, e.g. "Simulated phone viewport". */
  context: ReactNode;
  icon?: LucideIcon;
  /** Live status shown on the right of the header row (badges, measurements). */
  status?: ReactNode;
  children: ReactNode;
};

/**
 * Two-row toolbar for interactive demos: a quiet header row for context and
 * live status, and a body row for the controls themselves.
 */
export function DemoToolbar({ context, icon: Icon, status, children }: DemoToolbarProps) {
  return (
    <div className="mb-5 overflow-hidden rounded-lg border border-line bg-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-3 py-2">
        <p className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted">
          {Icon && <Icon size={14} className="shrink-0 text-subtle" aria-hidden="true" />}
          <span className="min-w-0">{context}</span>
        </p>
        {status && <div className="flex flex-wrap items-center gap-1.5">{status}</div>}
      </div>
      <div className="flex flex-col gap-3 p-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">{children}</div>
    </div>
  );
}
