"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Tab<T extends string> = { value: T; label: string; icon?: LucideIcon };

type TabsProps<T extends string> = {
  label: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
};

/**
 * WAI-ARIA tabs with automatic activation: arrow keys / Home / End move
 * between tabs, and only the selected tab is in the tab order.
 */
export function Tabs<T extends string>({ label, tabs, value, onChange, children }: TabsProps<T>) {
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = tabs.findIndex((tab) => tab.value === value);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;

    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="mb-5 flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
        {tabs.map((tab, index) => {
          const selected = index === selectedIndex;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={selected ? `${baseId}-panel` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`relative -mb-px inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-t-md px-3 text-sm font-medium transition-colors duration-150 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full motion-reduce:transition-none ${
                selected
                  ? "text-fg after:bg-accent"
                  : "text-muted after:bg-transparent hover:text-fg hover:after:bg-line-strong"
              }`}
            >
              {Icon && <Icon size={15} className={`max-sm:hidden ${selected ? "text-accent-text" : ""}`} aria-hidden="true" />}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${value}`}
      >
        {children}
      </div>
    </div>
  );
}
