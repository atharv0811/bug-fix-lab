import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  Columns2,
  ExternalLink,
  ListChecks,
  Microscope,
  MousePointerClick,
  Search,
  TriangleAlert,
} from "lucide-react";
import { CaseLibrary } from "@/components/bug-cases/case-library";
import { HeroPreview } from "@/components/home/hero-preview";
import { SectionHeading } from "@/components/ui/section-heading";
import { bugCases } from "@/lib/bug-cases";
import { siteConfig } from "@/lib/site";
import { buttonClass, card } from "@/lib/ui";

const capabilities = [
  {
    icon: MousePointerClick,
    title: "Interactive reproductions",
    description: "Trigger each bug yourself in a contained, resettable demo.",
  },
  {
    icon: Microscope,
    title: "Root-cause explanations",
    description: "Why the behaviour happens, not only which line to change.",
  },
  {
    icon: Columns2,
    title: "Before / after comparisons",
    description: "Broken and fixed code side by side, ready to copy.",
  },
  {
    icon: ListChecks,
    title: "Verification steps",
    description: "Concrete checks that confirm the fix instead of assuming it.",
  },
];

const workflow = [
  {
    icon: TriangleAlert,
    title: "Reproduce the issue",
    description:
      "Find a reliable sequence of steps that triggers the bug, so every fix can be tested against it.",
  },
  {
    icon: Search,
    title: "Investigate the behaviour",
    description:
      "Use DevTools, logs, and the code path to narrow down where the behaviour diverges from expectations.",
  },
  {
    icon: Microscope,
    title: "Identify the root cause",
    description:
      "Explain why it happens, then make the smallest change that addresses the cause rather than the symptom.",
  },
  {
    icon: CircleCheck,
    title: "Verify the fix",
    description:
      "Repeat the reproduction and check the edge cases, so the fix is confirmed rather than assumed.",
  },
];

const liveDemoCount = bugCases.filter(
  (bugCase) => bugCase.demo.kind === "live",
).length;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="bg-grid pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-3xl -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-14 lg:py-24">
          <div className="min-w-0">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-xs font-medium text-fg-2 shadow-card">
              <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-text">
                {bugCases.length} cases
              </span>
              Frontend debugging lab
            </p>

            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance text-fg sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]">
              Debug smarter. Understand the cause.{" "}
              <span className="text-accent-text">Ship the fix.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              Reproducible React, Next.js, CSS, API, and form bugs — each with
              an interactive demo, a root-cause explanation, the fix, and the
              steps to verify it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#bug-cases" className={buttonClass({ size: "lg" })}>
                Explore bug cases
                <ArrowRight size={16} aria-hidden="true" />
              </Link>

              {siteConfig.repositoryUrl ? (
                <a
                  href={siteConfig.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: "secondary", size: "lg" })}
                >
                  View source code
                  <ExternalLink size={15} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href="#how-it-works"
                  className={buttonClass({ variant: "secondary", size: "lg" })}
                >
                  How it works
                </Link>
              )}
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <dt className="text-muted">Live demos</dt>
                <dd className="font-semibold text-fg">{liveDemoCount}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-muted">Simulated demos</dt>
                <dd className="font-semibold text-fg">
                  {bugCases.length - liveDemoCount}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-muted">Backend required</dt>
                <dd className="font-semibold text-fg">None</dd>
              </div>
            </dl>
          </div>

          <div className="min-w-0">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section
        aria-labelledby="capabilities-heading"
        className="px-4 pt-14 sm:px-8 sm:pt-16"
      >
        <h2 id="capabilities-heading" className="sr-only">
          What each case includes
        </h2>
        <ul className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <li key={title} className={`${card} p-5`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-line bg-accent-soft text-accent-text">
                <Icon size={17} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold text-fg">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Case library */}
      <section
        id="bug-cases"
        aria-labelledby="bug-cases-heading"
        className="px-4 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="bug-cases-heading"
            eyebrow="Case library"
            title="Common frontend bugs, taken apart"
          >
            Every case follows the same structure: symptoms, reproduction,
            investigation, root cause, fix, and verification. Filter by area or
            open any case to start debugging.
          </SectionHeading>

          <CaseLibrary />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="border-y border-line bg-surface px-4 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="how-it-works-heading"
            eyebrow="How it works"
            title="One repeatable debugging workflow"
          >
            The same four steps are applied to every case, so the reasoning is
            as visible as the fix.
          </SectionHeading>

          <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            <span
              className="pointer-events-none absolute left-[12%] right-[12%] top-9.5 hidden h-px bg-line-strong lg:block"
              aria-hidden="true"
            />
            {workflow.map(({ icon: Icon, title, description }, index) => (
              <li
                key={title}
                className="relative rounded-xl border border-line bg-surface-2 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-accent-text shadow-card">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-fg">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="px-4 py-16 sm:px-8 sm:py-24"
      >
        <div
          className={`${card} mx-auto grid max-w-7xl gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16`}
        >
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-text">
              <span className="h-px w-5 bg-accent/60" aria-hidden="true" />
              About the project
            </p>
            <h2
              id="about-heading"
              className="text-2xl font-semibold tracking-tight text-fg sm:text-[2rem] sm:leading-tight"
            >
              An educational lab for frontend debugging practice
            </h2>
          </div>
          <div className="space-y-4 text-base leading-7 text-muted">
            <p>
              This is an independent portfolio project. Every case was built
              specifically for this lab to demonstrate a systematic approach:
              reproduce the issue, isolate the cause, implement a focused fix,
              and verify the result.
            </p>
            <p>
              The demonstrations are not client work and do not describe real
              client incidents. Where a demo simulates behaviour — such as a
              network request or Next.js routing — the case page says so
              explicitly.
            </p>
            <Link
              href="/bug-cases/responsive-layout-overflow"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
            >
              Start with the first case
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
