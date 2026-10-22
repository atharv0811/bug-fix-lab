"use client";

import type { LucideIcon } from "lucide-react";
import { useRovingRadio, type ControlTone } from "@/components/ui/mode-switch";

export type Choice<T extends string> = {
  value: T;
  title: string;
  hint: string;
  icon?: LucideIcon;
  tone?: ControlTone;
  /** Render the title in monospace. */
  code?: boolean;
};

const checkedTone: Record<ControlTone, string> = {
  neutral: "border-accent-line bg-accent-soft/60 ring-1 ring-accent-line",
  broken: "border-danger-line bg-danger-soft ring-1 ring-danger-line",
  fixed: "border-success-line bg-success-soft ring-1 ring-success-line",
};

const iconTone: Record<ControlTone, string> = {
  neutral: "text-accent-text",
  broken: "text-danger",
  fixed: "text-success",
};

type ChoiceGroupProps<T extends string> = {
  label: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Column count from the `sm` breakpoint up. */
  columns?: 2 | 3 | 4;
};

const columnClasses = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 xl:grid-cols-4" };

/**
 * Radio cards for options that need a short explanation — scenarios and
 * strategies rather than simple on/off modes.
 */
export function ChoiceGroup<T extends string>({ label, choices, value, onChange, columns = 3 }: ChoiceGroupProps<T>) {
  const { itemProps } = useRovingRadio(
    choices.map((choice) => choice.value),
    value,
    onChange,
  );

  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${columnClasses[columns]}`}>
      {choices.map((choice, index) => {
        const tone = choice.tone ?? "neutral";
        const checked = choice.value === value;
        const Icon = choice.icon;

        return (
          <button
            key={choice.value}
            type="button"
            {...itemProps(index)}
            className={`flex min-w-0 items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 motion-reduce:transition-none ${
              checked ? checkedTone[tone] : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"
            }`}
          >
            {Icon && (
              <Icon
                size={15}
                className={`mt-0.5 shrink-0 ${checked ? iconTone[tone] : "text-subtle"}`}
                aria-hidden="true"
              />
            )}
            <span className="min-w-0">
              <span
                className={`block truncate text-[13px] font-semibold ${checked ? "text-fg" : "text-fg-2"} ${
                  choice.code ? "font-mono" : ""
                }`}
              >
                {choice.title}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-muted">{choice.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
