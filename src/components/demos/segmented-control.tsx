"use client";

type Option<T extends string> = {
  value: T;
  label: string;
  tone?: "neutral" | "broken" | "fixed";
};

type SegmentedControlProps<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

const activeTones = {
  neutral: "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200",
  broken: "bg-white text-rose-700 shadow-sm ring-1 ring-rose-200",
  fixed: "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200",
};

const dotTones = {
  neutral: "bg-slate-400",
  broken: "bg-rose-500",
  fixed: "bg-emerald-500",
};

/** A group of toggle buttons; each button exposes its state with aria-pressed. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1"
    >
      {options.map((option) => {
        const tone = option.tone ?? "neutral";
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive ? activeTones[tone] : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {option.tone && option.tone !== "neutral" && (
              <span className={`h-1.5 w-1.5 rounded-full ${dotTones[tone]}`} aria-hidden="true" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
