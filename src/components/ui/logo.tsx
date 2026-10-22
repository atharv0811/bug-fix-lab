/**
 * Bug Fix Lab brand mark: code brackets around a check — "the code, fixed".
 * The same geometry is used for app/icon.svg, favicon.ico, and apple-icon.png.
 */

type MarkProps = {
  /** Rendered size in pixels (the mark is square). */
  size?: number;
  className?: string;
};

export function LogoMark({ size = 28, className = "" }: MarkProps) {
  // Below ~24px the heavier stroke variant stays legible (it matches the favicon).
  const small = size < 24;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center bg-linear-to-b from-brand-from to-brand-to shadow-button ${className}`}
      style={{ width: size, height: size, borderRadius: size * (small ? 0.22 : 0.25) }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size} height={size} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {small ? (
          <>
            <path d="M10.5 9.5 4.8 16l5.7 6.5M21.5 9.5l5.7 6.5-5.7 6.5" className="stroke-brand-glyph" strokeWidth={3.2} />
            <path d="m12.4 16.4 2.7 2.7 4.6-5.6" className="stroke-brand-check" strokeWidth={3.2} />
          </>
        ) : (
          <>
            <path d="M11.5 10.5 6.5 16l5 5.5M20.5 10.5l5 5.5-5 5.5" className="stroke-brand-glyph" strokeWidth={2.5} />
            <path d="m12.6 16.3 2.3 2.3 4.4-5.2" className="stroke-brand-check" strokeWidth={2.5} />
          </>
        )}
      </svg>
    </span>
  );
}

type LogoProps = MarkProps & {
  /** Text next to the mark; hidden visually on very small layouts if needed. */
  wordmarkClassName?: string;
};

/** Mark + wordmark lockup used in the navbar and footer. */
export function Logo({ size = 28, className = "", wordmarkClassName = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className={`text-[15px] font-semibold tracking-[-0.015em] text-fg ${wordmarkClassName}`}>
        Bug Fix <span className="text-accent-text">Lab</span>
      </span>
    </span>
  );
}
