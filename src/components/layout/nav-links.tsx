"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site";

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

const navigation: NavItem[] = [
  { label: "Home", href: "/", isActive: (pathname) => pathname === "/" },
  {
    label: "Bug Cases",
    href: "/#bug-cases",
    isActive: (pathname) => pathname.startsWith("/bug-cases"),
  },
  { label: "How it works", href: "/#how-it-works", isActive: () => false },
];

function desktopLinkClass(active: boolean) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-indigo-50 text-indigo-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

function DesktopActions() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <a
        href={siteConfig.githubProfileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        GitHub
        <ExternalLink size={14} aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <Link
        href="/#bug-cases"
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        Explore cases
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

/** Rendered while the pathname is unavailable during prerendering. */
export function NavLinksFallback() {
  return (
    <>
      <div className="hidden items-center gap-1 md:flex">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className={desktopLinkClass(false)}>
            {item.label}
          </Link>
        ))}
      </div>
      <DesktopActions />
      <span className="h-9 w-9 md:hidden" aria-hidden="true" />
    </>
  );
}

export function NavLinks() {
  const pathname = usePathname();
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
      <div className="hidden items-center gap-1 md:flex">
        {navigation.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={desktopLinkClass(active)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <DesktopActions />

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
      >
        {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white px-4 pb-4 pt-2 shadow-lg shadow-slate-200/60 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navigation.map((item) => {
              const active = item.isActive(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100"
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
                className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                GitHub profile
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <Link
            href="/#bug-cases"
            onClick={close}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Explore cases
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
