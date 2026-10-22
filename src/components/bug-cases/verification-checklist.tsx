"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";

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
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600" aria-live="polite">
          {allDone
            ? "All checks confirmed by you."
            : `${completed} of ${items.length} checked by you`}
        </p>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${(completed / items.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {items.map((item, index) => {
          const id = `${baseId}-${index}`;
          return (
            <li key={item}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
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
                  className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-white transition-colors peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2"
                  aria-hidden="true"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span
                  className={`text-sm leading-6 ${checked[index] ? "text-slate-500 line-through decoration-slate-300" : "text-slate-700"}`}
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
