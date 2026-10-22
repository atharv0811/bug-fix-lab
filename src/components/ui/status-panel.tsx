import type { ReactNode } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { toneSoft, type Tone } from "@/lib/ui";

const defaultIcons: Partial<Record<Tone, LucideIcon>> = {
  success: CircleCheck,
  danger: CircleX,
  warning: TriangleAlert,
  info: Info,
};

type StatusPanelProps = {
  tone: Tone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: LucideIcon | null;
  className?: string;
  /** Pass through for live regions, e.g. role="status". */
  role?: string;
  "aria-live"?: "polite" | "assertive" | "off";
};

/** A tinted callout used for results, verification feedback, and explanations. */
export function StatusPanel({
  tone,
  title,
  children,
  icon,
  className = "",
  ...aria
}: StatusPanelProps) {
  const Icon = icon === null ? null : (icon ?? defaultIcons[tone]);

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${toneSoft[tone]} ${className}`} {...aria}>
      {Icon && <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {children && (
          <div className={`leading-6 text-fg-2 ${title ? "mt-0.5" : ""}`}>{children}</div>
        )}
      </div>
    </div>
  );
}
