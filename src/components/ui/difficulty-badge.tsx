import type { Difficulty } from "@/lib/bug-cases";

const levels: Record<Difficulty, { value: number; bar: string; text: string }> = {
  Beginner: { value: 1, bar: "bg-success-solid", text: "text-success" },
  Intermediate: { value: 2, bar: "bg-warning-solid", text: "text-warning" },
  Advanced: { value: 3, bar: "bg-danger-solid", text: "text-danger" },
};

/** Difficulty shown as text plus a three-step meter (the text carries the meaning). */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const level = levels[difficulty];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs font-medium ${level.text}`}
    >
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={`w-1 rounded-sm ${step <= level.value ? level.bar : "bg-line-strong"}`}
            style={{ height: `${4 + step * 3}px` }}
          />
        ))}
      </span>
      {difficulty}
    </span>
  );
}
