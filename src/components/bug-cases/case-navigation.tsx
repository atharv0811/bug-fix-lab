"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string };

/** "On this page" list that highlights the section currently in view. */
export function CaseNavigation({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    // A section counts as active once its top passes just below the sticky
    // navbar; the bottom margin keeps only the upper part of the viewport live.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page">
      <ul className="space-y-0.5 border-l border-line">
        {sections.map(({ id, label }, index) => {
          const active = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setActiveId(id)}
                aria-current={active ? "location" : undefined}
                className={`-ml-px flex items-center gap-2.5 border-l py-1.5 pl-4 text-sm transition-colors ${
                  active
                    ? "border-accent font-medium text-fg"
                    : "border-transparent text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                <span className={`font-mono text-[11px] ${active ? "text-accent-text" : "text-subtle"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
