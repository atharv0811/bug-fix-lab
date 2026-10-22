import type { Difficulty } from "@/lib/bug-cases";

const levels: Record<Difficulty, { value: number; bar: string; text: string }> = {
  Beginner: { value: 1, bar: "bg-emerald-500", text: "text-emerald-700" },
  Intermediate: { value: 2, bar: "bg-amber-500", text: "text-amber-700" },
  Advanced: { value: 3, bar: "bg-rose-500", text: "text-rose-700" },
};

/** Difficulty shown as text plus a three-step meter (the text carries the meaning). */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const level = levels[difficulty];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold ${level.text}`}
    >
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={`w-1 rounded-sm ${step <= level.value ? level.bar : "bg-slate-200"}`}
            style={{ height: `${4 + step * 3}px` }}
          />
        ))}
      </span>
      {difficulty}
    </span>
  );
}
