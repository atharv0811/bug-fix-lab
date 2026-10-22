import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Bug } from "lucide-react";
import { GitHubMark } from "@/components/ui/github-mark";
import {
  DesktopNavLinks,
  DesktopNavLinksFallback,
  MobileNav,
  MobileNavFallback,
} from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/site";
import { buttonClass } from "@/lib/ui";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-lg supports-backdrop-filter:bg-canvas/70">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-8"
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-md"
          aria-label="Bug Fix Lab home"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-fg shadow-button">
            <Bug size={15} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-fg">Bug Fix Lab</span>
        </Link>

        <span className="ml-5 mr-2 hidden h-5 w-px bg-line md:block" aria-hidden="true" />

        {/*
          usePathname() suspends during prerendering for params that are not
          known at build time (Cache Components), so the active-state links get
          their own boundaries with equivalent static fallbacks.
        */}
        <div className="hidden md:block">
          <Suspense fallback={<DesktopNavLinksFallback />}>
            <DesktopNavLinks />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={siteConfig.githubProfileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile (opens in a new tab)"
            title="GitHub profile"
            className={buttonClass({ variant: "icon", className: "max-md:hidden" })}
          >
            <GitHubMark size={16} />
          </a>
          <ThemeToggle />
          <span className="mx-1 h-5 w-px bg-line max-md:hidden" aria-hidden="true" />
          <Link href="/#bug-cases" className={buttonClass({ className: "max-md:hidden" })}>
            Explore cases
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Suspense fallback={<MobileNavFallback />}>
            <MobileNav />
          </Suspense>
        </div>
      </nav>
    </header>
  );
};
