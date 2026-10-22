import Link from "next/link";
import { Suspense } from "react";
import { Bug } from "lucide-react";
import { NavLinks, NavLinksFallback } from "@/components/layout/nav-links";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Bug Fix Lab home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bug size={18} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            Bug Fix <span className="text-indigo-600">Lab</span>
          </span>
        </Link>

        {/*
          usePathname() suspends during prerendering for params that are not
          known at build time (Cache Components), so the active-state links get
          their own boundary with an equivalent static fallback.
        */}
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>
      </nav>
    </header>
  );
};
