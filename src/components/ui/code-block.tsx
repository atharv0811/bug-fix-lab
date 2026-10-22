import { CircleCheck, CircleX, FileCode2 } from "lucide-react";
import type { CodeSample } from "@/lib/bug-cases";
import { tokenizeLines, type TokenKind } from "@/lib/highlight";
import { CopyButton } from "@/components/ui/copy-button";

type CodeVariant = "broken" | "fixed" | "neutral";

const tokenColors: Record<TokenKind, string> = {
  plain: "text-slate-200",
  comment: "text-slate-500 italic",
  string: "text-emerald-300",
  keyword: "text-violet-300",
  number: "text-amber-300",
  type: "text-sky-300",
  function: "text-indigo-200",
};

const variants: Record<
  CodeVariant,
  { label: string; icon: typeof CircleX | null; badge: string; accent: string }
> = {
  broken: {
    label: "Before",
    icon: CircleX,
    badge: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    accent: "before:bg-rose-500",
  },
  fixed: {
    label: "After",
    icon: CircleCheck,
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    accent: "before:bg-emerald-500",
  },
  neutral: {
    label: "",
    icon: null,
    badge: "",
    accent: "before:bg-indigo-500",
  },
};

type CodeBlockProps = {
  sample: CodeSample;
  variant?: CodeVariant;
};

export function CodeBlock({ sample, variant = "neutral" }: CodeBlockProps) {
  const lines = tokenizeLines(sample.code);
  const style = variants[variant];
  const VariantIcon = style.icon;
  const copyLabel = `${style.label ? `${style.label.toLowerCase()} example ` : ""}${sample.filename}`;

  return (
    <figure
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-0.5 ${style.accent}`}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          {VariantIcon ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.badge}`}
            >
              <VariantIcon size={12} aria-hidden="true" />
              {style.label}
            </span>
          ) : (
            <FileCode2 size={14} className="shrink-0 text-slate-500" aria-hidden="true" />
          )}
          <span className="truncate font-mono text-xs text-slate-400">{sample.filename}</span>
        </span>
        <CopyButton code={sample.code} label={copyLabel} />
      </figcaption>

      <pre className="flex-1 overflow-x-auto py-4 text-[13px] leading-6">
        <code className="grid min-w-max font-mono">
          {lines.map((line, lineIndex) => (
            <span key={lineIndex} className="flex pr-4">
              <span
                className="w-10 shrink-0 select-none pr-4 text-right text-slate-600"
                aria-hidden="true"
              >
                {lineIndex + 1}
              </span>
              <span>
                {line.length === 0
                  ? " "
                  : line.map((token, tokenIndex) => (
                      <span key={tokenIndex} className={tokenColors[token.kind]}>
                        {token.text}
                      </span>
                    ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
