import Link from "next/link";
import { Bug, ExternalLink } from "lucide-react";
import { bugCases } from "@/lib/bug-cases";
import { siteConfig } from "@/lib/site";

const labLinks = [
  { label: "Bug cases", href: "/#bug-cases" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About the lab", href: "/#about" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Bug size={18} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              {siteConfig.name}
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Reproducible frontend bugs with root-cause analysis, focused fixes,
            and verification steps.
          </p>
        </div>

        <nav aria-label="Lab">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Lab
          </h2>
          <ul className="mt-4 space-y-2.5">
            {labLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-600 transition-colors hover:text-indigo-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={siteConfig.githubProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-indigo-700"
              >
                GitHub profile
                <ExternalLink size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Cases">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cases
          </h2>
          <ul className="mt-4 space-y-2.5">
            {bugCases.map((bugCase) => (
              <li key={bugCase.slug}>
                <Link
                  href={`/bug-cases/${bugCase.slug}`}
                  className="text-sm text-slate-600 transition-colors hover:text-indigo-700"
                >
                  {bugCase.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{siteConfig.name}</p>
          <p>
            All cases are educational demonstrations built for this lab, not
            client projects.
          </p>
        </div>
      </div>
    </footer>
  );
}
