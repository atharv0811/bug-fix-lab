import Link from "next/link";
import {
  ArrowRight,
  Columns2,
  ExternalLink,
  ListChecks,
  Microscope,
  MousePointerClick,
  Search,
  TriangleAlert,
  Wrench,
  CircleCheck,
} from "lucide-react";
import { CaseLibrary } from "@/components/bug-cases/case-library";
import { HeroPreview } from "@/components/home/hero-preview";
import { siteConfig } from "@/lib/site";

const capabilities = [
  {
    icon: MousePointerClick,
    title: "Interactive reproductions",
    description: "Trigger each bug yourself in a contained demo.",
  },
  {
    icon: Microscope,
    title: "Root-cause explanations",
    description: "Why it happens, not only what to change.",
  },
  {
    icon: Columns2,
    title: "Before / after comparisons",
    description: "Broken and fixed code side by side.",
  },
  {
    icon: ListChecks,
    title: "Verification steps",
    description: "Concrete checks that confirm the fix works.",
  },
];

const workflow = [
  {
    icon: TriangleAlert,
    title: "Reproduce the issue",
    description:
      "Find a reliable sequence of steps that triggers the bug, so the fix can be tested against it.",
  },
  {
    icon: Search,
    title: "Identify the root cause",
    description:
      "Use DevTools, logs, and the code path to explain why the behaviour happens — not just where.",
  },
  {
    icon: Wrench,
    title: "Apply the fix",
    description:
      "Make the smallest change that addresses the cause, without hiding the symptom.",
  },
  {
    icon: CircleCheck,
    title: "Verify the behaviour",
    description:
      "Repeat the reproduction and check the edge cases, so the fix is confirmed rather than assumed.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16 lg:py-24">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              <Wrench size={13} aria-hidden="true" />
              Frontend debugging lab
            </p>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance text-slate-950 sm:text-5xl sm:leading-[1.08]">
              Debug smarter. Understand the cause.{" "}
              <span className="text-indigo-600">Ship the fix.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Six reproducible React, Next.js, CSS, API, and form bugs — each
              with an interactive demo, a root-cause explanation, the fix, and
              the steps to verify it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#bug-cases"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Explore bug cases
                <ArrowRight size={16} aria-hidden="true" />
              </Link>

              {siteConfig.repositoryUrl ? (
                <a
                  href={siteConfig.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  View source code
                  <ExternalLink size={15} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  How it works
                </Link>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section aria-labelledby="capabilities-heading" className="border-b border-slate-200 bg-slate-50">
        <h2 id="capabilities-heading" className="sr-only">
          What each case includes
        </h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3 bg-slate-50 px-4 py-5 sm:px-8">
              <Icon size={18} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Case library */}
      <section
        id="bug-cases"
        aria-labelledby="bug-cases-heading"
        className="scroll-mt-16 px-4 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-sm font-semibold text-indigo-600">Case library</p>
            <h2
              id="bug-cases-heading"
              className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Common frontend bugs, taken apart
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Each case follows the same structure: symptoms, reproduction,
              investigation, root cause, fix, and verification. Filter by area
              or open any case to start debugging.
            </p>
          </div>

          <CaseLibrary />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="scroll-mt-16 border-y border-slate-200 bg-white px-4 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-sm font-semibold text-indigo-600">How it works</p>
            <h2
              id="how-it-works-heading"
              className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              One repeatable debugging workflow
            </h2>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="scroll-mt-16 px-4 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="mb-2 text-sm font-semibold text-indigo-600">About the project</p>
            <h2
              id="about-heading"
              className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              An educational lab for frontend debugging practice
            </h2>
          </div>
          <div className="space-y-4 text-base leading-7 text-slate-600">
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
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
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
