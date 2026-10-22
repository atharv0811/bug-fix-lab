import type { ReactNode } from "react";
import { toneDot, toneSoft, type Tone } from "@/lib/ui";

type BadgeProps = {
  tone?: Tone;
  /** Shows a small status dot before the label. */
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", dot, icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${toneSoft[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}
