import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { bugCases } from "@/lib/bug-cases";
import { siteConfig } from "@/lib/site";
import { eyebrow } from "@/lib/ui";

const labLinks = [
  { label: "Bug cases", href: "/#bug-cases" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About the lab", href: "/#about" },
];

const linkClass = "text-sm text-muted transition-colors hover:text-fg";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="text-sm font-semibold tracking-tight text-fg">{siteConfig.name}</span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-muted">
            Reproducible frontend bugs with root-cause analysis, focused fixes,
            and verification steps.
          </p>
        </div>

        <nav aria-label="Lab">
          <h2 className={eyebrow}>Lab</h2>
          <ul className="mt-4 space-y-2.5">
            {labLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={siteConfig.githubProfileUrl}
                target="_blank"
                rel="noreferrer"
                className={`${linkClass} inline-flex items-center gap-1.5`}
              >
                GitHub profile
                <ExternalLink size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Cases">
          <h2 className={eyebrow}>Cases</h2>
          <ul className="mt-4 space-y-2.5">
            {bugCases.map((bugCase) => (
              <li key={bugCase.slug}>
                <Link href={`/bug-cases/${bugCase.slug}`} className={linkClass}>
                  {bugCase.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{siteConfig.name}</p>
          <p>All cases are educational demonstrations built for this lab, not client projects.</p>
        </div>
      </div>
    </footer>
  );
}
