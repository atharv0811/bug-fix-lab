"use client";

/**
 * Inline script that runs during HTML parsing (before first paint) on hard
 * navigations. On the client it renders as `text/plain`, so React does not
 * warn about rendering a <script> and the browser never re-executes it;
 * suppressHydrationWarning covers the type difference. This is the pattern
 * from the Next.js "Preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
