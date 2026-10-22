import type { SelectHTMLAttributes } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  icon?: LucideIcon;
  /** Monospace text, for URL or code-like values. */
  mono?: boolean;
  controlSize?: "sm" | "md";
};

/** Native <select> (keeps platform keyboard and screen-reader support) with themed chrome. */
export function SelectField({ icon: Icon, mono, controlSize = "md", className = "", children, ...props }: SelectFieldProps) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      {Icon && (
        <Icon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
      )}
      <select
        {...props}
        className={`block w-full appearance-none truncate rounded-lg border border-line-strong bg-surface pr-9 text-sm text-fg shadow-card transition-[border-color,box-shadow] hover:border-subtle/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 ${
          controlSize === "sm" ? "h-8" : "h-9"
        } ${Icon ? "pl-8.5" : "pl-3"} ${mono ? "font-mono text-[13px]" : ""}`}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
}
