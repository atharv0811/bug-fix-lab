/**
 * Shared class presets built on the semantic design tokens in globals.css.
 * Kept as plain strings so they work on <button>, <a>, and <Link> alike.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out " +
  "active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  // Solid accent; accent-fg is white in both themes (≥4.8:1 on accent and hover).
  primary: "bg-accent font-semibold text-accent-fg shadow-button hover:bg-accent-hover",
  secondary:
    "border border-line-strong bg-surface text-fg shadow-card hover:border-subtle/60 hover:bg-surface-3",
  ghost: "text-muted hover:bg-surface-3 hover:text-fg",
  icon: "border border-line bg-surface text-fg-2 shadow-card hover:bg-surface-3 hover:text-fg",
  // For destructive or error-recovery actions only; tinted rather than solid.
  danger: "border border-danger-line bg-danger-soft text-danger hover:border-danger-solid/50 hover:bg-danger-solid/15",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-9 gap-1.5 px-3.5",
  lg: "h-10 gap-2 px-4",
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
};

/**
 * Class names for the shared button variants. Works on <button>, <a>, and
 * <Link>, so actions and navigation share one visual system.
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  const sizing = variant === "icon" ? iconSizes[size] : buttonSizes[size];
  return `${buttonBase} ${buttonVariants[variant]} ${sizing} ${className}`.trim();
}

export const card = "rounded-xl border border-line bg-surface shadow-card";

export const input =
  "block w-full rounded-lg border bg-surface px-3 py-2 text-sm text-fg shadow-card placeholder:text-subtle transition-[border-color,box-shadow] focus:outline-none focus:ring-4";

export const inputState = {
  default: "border-line-strong focus:border-accent focus:ring-accent/15",
  invalid: "border-danger-solid/70 focus:border-danger-solid focus:ring-danger-solid/15",
};

export const eyebrow = "text-xs font-semibold uppercase tracking-[0.08em] text-subtle";

export const inlineCode =
  "rounded border border-line bg-surface-3 px-1 py-px font-mono text-[0.85em] text-fg";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

/** Soft background + border + text for each semantic tone. */
export const toneSoft: Record<Tone, string> = {
  neutral: "border-line bg-surface-2 text-fg-2",
  accent: "border-accent-line bg-accent-soft text-accent-text",
  success: "border-success-line bg-success-soft text-success",
  warning: "border-warning-line bg-warning-soft text-warning",
  danger: "border-danger-line bg-danger-soft text-danger",
  info: "border-info-line bg-info-soft text-info",
};

export const toneText: Record<Tone, string> = {
  neutral: "text-muted",
  accent: "text-accent-text",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

export const toneDot: Record<Tone, string> = {
  neutral: "bg-subtle",
  accent: "bg-accent",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  info: "bg-info-solid",
};
