import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
  /** Optional element aligned to the right on wide screens. */
  aside?: ReactNode;
};

/** Homepage section header: eyebrow, h2, and supporting copy. */
export function SectionHeading({ id, eyebrow, title, children, aside }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-text">
          <span className="h-px w-5 bg-accent/60" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-fg sm:text-[2rem] sm:leading-tight">
          {title}
        </h2>
        {children && <p className="mt-3 text-base leading-7 text-muted">{children}</p>}
      </div>
      {aside}
    </div>
  );
}
