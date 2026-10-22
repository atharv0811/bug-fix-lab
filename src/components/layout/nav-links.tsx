"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { GitHubMark } from "@/components/ui/github-mark";
import { siteConfig } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

type SectionId = "bug-cases" | "how-it-works";

type NavItem = {
  label: string;
  href: string;
  /** Homepage section this item points at, used for scroll-based active state. */
  section?: SectionId;
  isActive: (pathname: string, section: SectionId | null) => boolean;
};

const navigation: NavItem[] = [
  { label: "Home", href: "/", isActive: (pathname, section) => pathname === "/" && section === null },
  {
    label: "Bug Cases",
    href: "/#bug-cases",
    section: "bug-cases",
    isActive: (pathname, section) =>
      pathname.startsWith("/bug-cases") || (pathname === "/" && section === "bug-cases"),
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    section: "how-it-works",
    isActive: (pathname, section) => pathname === "/" && section === "how-it-works",
  },
];

const trackedSections: SectionId[] = ["bug-cases", "how-it-works"];

/**
 * On the homepage, reports which tracked section sits under the navbar so the
 * matching link is highlighted while scrolling. Elsewhere it returns null.
 */
function useActiveSection(pathname: string | null) {
  const [section, setSection] = useState<SectionId | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = 96; // just below the 64px sticky navbar
      let current: SectionId | null = null;
      for (const id of trackedSections) {
        const element = document.getElementById(id);
        if (!element) continue;
        const { top, bottom } = element.getBoundingClientRect();
        if (top <= probe && bottom > probe) current = id;
      }
      setSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return pathname === "/" ? section : null;
}

/** Transparent links; the active one gets full-contrast text and a short accent underline. */
function navLinkClass(active: boolean) {
  return `relative inline-flex h-16 items-center px-3 text-sm font-medium transition-colors duration-150 after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors motion-reduce:transition-none ${
    active ? "text-fg after:bg-accent" : "text-muted after:bg-transparent hover:text-fg"
  }`;
}

function DesktopLinks({ pathname, section }: { pathname: string | null; section: SectionId | null }) {
  return (
    <div className="flex items-center">
      {navigation.map((item) => {
        const active = pathname !== null && item.isActive(pathname, section);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? (item.section && pathname === "/" ? "location" : "page") : undefined}
            className={navLinkClass(active)}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function DesktopNavLinks() {
  const pathname = usePathname();
  const section = useActiveSection(pathname);
  return <DesktopLinks pathname={pathname} section={section} />;
}

/** Rendered while the pathname is unavailable during prerendering. */
export function DesktopNavLinksFallback() {
  return <DesktopLinks pathname={null} section={null} />;
}

export function MobileNavFallback() {
  return <span className="size-9 md:hidden" aria-hidden="true" />;
}

export function MobileNav() {
  const pathname = usePathname();
  const section = useActiveSection(pathname);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className={buttonClass({ variant: "icon", className: "md:hidden" })}
      >
        {isOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-line bg-surface px-4 pb-4 pt-3 shadow-elevated md:hidden"
        >
          <ul className="flex flex-col gap-0.5">
            {navigation.map((item) => {
              const active = item.isActive(pathname, section);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-surface-3 text-fg before:absolute before:inset-y-2.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent"
                        : "text-muted hover:bg-surface-3/60 hover:text-fg"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href={siteConfig.githubProfileUrl}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-3/60 hover:text-fg"
              >
                <GitHubMark size={15} />
                GitHub profile
                <ExternalLink size={13} className="opacity-70" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <Link
            href="/#bug-cases"
            onClick={close}
            className={buttonClass({ size: "lg", className: "mt-3 w-full" })}
          >
            Explore cases
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
