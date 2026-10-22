import { CircleCheck, CircleX, FileCode2 } from "lucide-react";
import type { CodeSample } from "@/lib/bug-cases";
import { tokenizeLines, type TokenKind } from "@/lib/highlight";
import { CopyButton } from "@/components/ui/copy-button";

type CodeVariant = "broken" | "fixed" | "neutral";

// Tuned for the always-dark editor surface (--code-bg) in both themes.
const tokenColors: Record<TokenKind, string> = {
  plain: "text-code-fg",
  comment: "text-code-muted italic",
  string: "text-code-string",
  keyword: "text-code-keyword",
  number: "text-code-number",
  type: "text-code-type",
  function: "text-code-function",
};

const variants: Record<
  CodeVariant,
  { label: string; icon: typeof CircleX | null; badge: string; accent: string }
> = {
  broken: {
    label: "Before",
    icon: CircleX,
    badge: "bg-danger-solid/15 text-code-danger ring-danger-solid/30",
    accent: "before:bg-danger-solid",
  },
  fixed: {
    label: "After",
    icon: CircleCheck,
    badge: "bg-success-solid/15 text-code-success ring-success-solid/30",
    accent: "before:bg-success-solid",
  },
  neutral: {
    label: "",
    icon: null,
    badge: "",
    accent: "before:bg-transparent",
  },
};

const languageLabels = { tsx: "TSX", ts: "TS", css: "CSS" } as const;

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
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-code-line bg-code shadow-card ring-1 ring-black/5 before:absolute before:inset-y-0 before:left-0 before:w-0.5 dark:ring-white/5 ${style.accent}`}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-code-line bg-code-header px-4 py-2">
        <span className="flex min-w-0 items-center gap-2.5">
          {VariantIcon ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.badge}`}
            >
              <VariantIcon size={12} aria-hidden="true" />
              {style.label}
            </span>
          ) : (
            <FileCode2 size={14} className="shrink-0 text-code-muted" aria-hidden="true" />
          )}
          <span className="truncate font-mono text-xs text-code-dim">{sample.filename}</span>
          <span className="hidden shrink-0 rounded border border-code-line px-1 font-mono text-[10px] text-code-muted sm:inline">
            {languageLabels[sample.language]}
          </span>
        </span>
        <CopyButton code={sample.code} label={copyLabel} />
      </figcaption>

      <pre className="flex-1 overflow-x-auto py-4 text-[13px] leading-6 [scrollbar-color:var(--code-line)_transparent]">
        <code className="grid min-w-max font-mono">
          {lines.map((line, lineIndex) => (
            <span key={lineIndex} className="flex pr-5">
              <span
                className="w-11 shrink-0 select-none pr-4 text-right text-code-gutter"
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
