"use client";

import { useId, useState } from "react";
import { Check, CircleCheck } from "lucide-react";

/**
 * Checks the visitor can tick off while re-testing the demo. Progress is local
 * to this page visit — it reports what the visitor checked, not a test result.
 */
export function VerificationChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const baseId = useId();
  const completed = checked.filter(Boolean).length;
  const allDone = completed === items.length;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-3">
        <p
          className={`flex items-center gap-1.5 text-sm ${allDone ? "font-medium text-success" : "text-muted"}`}
          aria-live="polite"
        >
          {allDone && <CircleCheck size={15} aria-hidden="true" />}
          {allDone ? "All checks confirmed by you" : `${completed} of ${items.length} checked by you`}
        </p>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-3 ring-1 ring-inset ring-line" aria-hidden="true">
          <div
            className="h-full rounded-full bg-success-solid transition-[width] duration-300"
            style={{ width: `${(completed / items.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-line">
        {items.map((item, index) => {
          const id = `${baseId}-${index}`;
          return (
            <li key={item}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked[index]}
                  onChange={() =>
                    setChecked((current) =>
                      current.map((value, valueIndex) => (valueIndex === index ? !value : value)),
                    )
                  }
                  className="peer sr-only"
                />
                <span
                  className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border border-subtle bg-surface text-transparent transition-colors peer-checked:border-success-solid peer-checked:bg-success-solid peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
                  aria-hidden="true"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span
                  className={`text-sm leading-6 transition-colors ${checked[index] ? "text-muted line-through decoration-line-strong" : "text-fg-2"}`}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
