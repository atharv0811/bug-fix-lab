"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type ControlTone = "neutral" | "broken" | "fixed";

const activeText: Record<ControlTone, string> = {
  neutral: "text-fg",
  broken: "text-danger",
  fixed: "text-success",
};

const toneDot: Record<ControlTone, string> = {
  neutral: "bg-accent",
  broken: "bg-danger-solid",
  fixed: "bg-success-solid",
};

/**
 * Keyboard support shared by radio-style controls (WAI-ARIA radio group):
 * only the checked option is in the tab order, and arrow keys move and select.
 */
export function useRovingRadio<T extends string>(values: T[], value: T, onChange: (value: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    let next = index + step;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = values.length - 1;
    if (next === index) return;

    event.preventDefault();
    next = (next + values.length) % values.length;
    onChange(values[next]);
    refs.current[next]?.focus();
  }

  return {
    itemProps: (index: number) => ({
      ref: (element: HTMLButtonElement | null) => {
        refs.current[index] = element;
      },
      role: "radio" as const,
      "aria-checked": values[index] === value,
      tabIndex: values[index] === value ? 0 : -1,
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, index),
      onClick: () => onChange(values[index]),
    }),
  };
}

export type ModeOption<T extends string> = {
  value: T;
  label: string;
  tone?: ControlTone;
  icon?: LucideIcon;
  /** Render the label in monospace (for code-like options such as `await params`). */
  code?: boolean;
};

type ModeSwitchProps<T extends string> = {
  label: string;
  options: ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
};

/**
 * Compact switch for choosing between a few mutually exclusive modes
 * (Broken / Fixed / Compare, Buggy / Fixed, …). Tones carry semantic colour
 * only on the selected option so the control stays quiet at rest.
 */
export function ModeSwitch<T extends string>({ label, options, value, onChange, size = "md" }: ModeSwitchProps<T>) {
  const { itemProps } = useRovingRadio(
    options.map((option) => option.value),
    value,
    onChange,
  );

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-line bg-surface-3/70 p-0.5"
    >
      {options.map((option, index) => {
        const tone = option.tone ?? "neutral";
        const checked = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            {...itemProps(index)}
            className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-[color,background-color,box-shadow] duration-150 motion-reduce:transition-none ${
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]"
            } ${option.code ? "font-mono" : ""} ${
              checked
                ? `bg-surface shadow-card ring-1 ring-line-strong ${activeText[tone]}`
                : "text-muted hover:bg-surface/60 hover:text-fg"
            }`}
          >
            {Icon ? (
              <Icon size={14} className={checked ? "" : "opacity-70"} aria-hidden="true" />
            ) : (
              tone !== "neutral" && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${checked ? toneDot[tone] : "bg-subtle/60"}`}
                  aria-hidden="true"
                />
              )
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small uppercase label placed above a control group. */
export function ControlLabel({ children, htmlFor, id }: { children: ReactNode; htmlFor?: string; id?: string }) {
  const className = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle";
  return htmlFor ? (
    <label htmlFor={htmlFor} id={id} className={className}>
      {children}
    </label>
  ) : (
    <p id={id} className={className}>
      {children}
    </p>
  );
}
