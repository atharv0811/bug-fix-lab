import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  ChevronRight,
  CircleCheck,
  FlaskConical,
  ListOrdered,
  Microscope,
  MousePointerClick,
  Search,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  bugCases,
  getAdjacentCases,
  getBugCase,
  getRelatedCases,
} from "@/lib/bug-cases";
import BugCaseCard, { categoryIcons } from "@/components/bug-cases/bug-case-card";
import { VerificationChecklist } from "@/components/bug-cases/verification-checklist";
import { caseDemos } from "@/components/demos";
import { CodeBlock } from "@/components/ui/code-block";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

type BugCasePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return bugCases.map((bugCase) => ({
    slug: bugCase.slug,
  }));
}

export async function generateMetadata({ params }: BugCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const bugCase = getBugCase(slug);

  if (!bugCase) return { title: "Case not found" };

  return { title: bugCase.title, description: bugCase.description };
}

const sections = [
  { id: "symptoms", label: "Symptoms", icon: TriangleAlert },
  { id: "reproduce", label: "Reproduce", icon: ListOrdered },
  { id: "demo", label: "Interactive demo", icon: MousePointerClick },
  { id: "investigate", label: "Investigate", icon: Search },
  { id: "root-cause", label: "Root cause", icon: Microscope },
  { id: "fix", label: "Fix", icon: Wrench },
  { id: "verify", label: "Verify", icon: CircleCheck },
] as const;

type SectionId = (typeof sections)[number]["id"];

function CaseSection({
  id,
  children,
  description,
}: {
  id: SectionId;
  children: React.ReactNode;
  description?: string;
}) {
  const index = sections.findIndex((section) => section.id === id);
  const { label, icon: Icon } = sections[index];

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600">
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="flex items-baseline gap-2 text-lg font-semibold tracking-tight text-slate-950">
            <span className="font-mono text-xs font-medium text-slate-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            {label}
          </h2>
          {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function BugCaseDetailPage({ params }: BugCasePageProps) {
  const { slug } = await params;
  const bugCase = getBugCase(slug);

  if (!bugCase) {
    notFound();
  }

  const CategoryIcon = categoryIcons[bugCase.category] ?? Bug;
  const Demo = caseDemos[bugCase.slug];
  const { previous, next } = getAdjacentCases(bugCase.slug);
  const relatedCases = getRelatedCases(bugCase);
  const caseNumber = bugCases.indexOf(bugCase) + 1;

  return (
    <div className="px-4 pb-20 pt-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-indigo-700">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li>
              <Link href="/#bug-cases" className="hover:text-indigo-700">
                Bug cases
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li aria-current="page" className="min-w-0 truncate font-medium text-slate-800">
              {bugCase.title}
            </li>
          </ol>
        </nav>

        <header className="mb-10 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
              <CategoryIcon size={13} aria-hidden="true" />
              {bugCase.category}
            </span>
            <DifficultyBadge difficulty={bugCase.difficulty} />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
              <FlaskConical size={13} aria-hidden="true" />
              {bugCase.demo.kind === "live" ? "Live demo" : "Simulated demo"}
            </span>
          </div>

          <p className="font-mono text-xs text-slate-400">
            Case {String(caseNumber).padStart(2, "0")} of {String(bugCases.length).padStart(2, "0")}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {bugCase.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{bugCase.problem}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <div className="min-w-0 space-y-12">
            <CaseSection id="symptoms" description="What a user or developer would observe.">
              <ul className="grid gap-2 sm:grid-cols-2">
                {bugCase.symptoms.map((symptom) => (
                  <li
                    key={symptom}
                    className="flex items-start gap-2.5 rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-sm leading-6 text-slate-700"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden="true" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </CaseSection>

            <CaseSection id="reproduce" description="A reliable sequence that triggers the bug.">
              <ol className="space-y-2">
                {bugCase.reproduction.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CaseSection>

            <CaseSection id="demo">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-md px-2 py-0.5 text-xs font-semibold ${
                      bugCase.demo.kind === "live"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    <FlaskConical size={12} aria-hidden="true" />
                    {bugCase.demo.kind === "live" ? "Live" : "Simulated"}
                  </span>
                  <p className="text-xs leading-5 text-slate-600">{bugCase.demo.note}</p>
                </div>
                <div className="p-4 sm:p-6">{Demo ? <Demo /> : null}</div>
              </div>
            </CaseSection>

            <CaseSection id="investigate" description="How to narrow down the cause.">
              <ol className="space-y-2">
                {bugCase.investigation.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 font-mono text-xs font-semibold text-amber-700">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {bugCase.investigationSnippet && (
                <div className="mt-5">
                  <CodeBlock sample={bugCase.investigationSnippet} />
                </div>
              )}
            </CaseSection>

            <CaseSection id="root-cause">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 text-sm leading-7 text-slate-800 sm:text-base sm:leading-7">
                {bugCase.rootCause}
              </div>
            </CaseSection>

            <CaseSection id="fix">
              <p className="mb-5 text-sm leading-7 text-slate-700 sm:text-base sm:leading-7">
                {bugCase.solution}
              </p>
              <div className="grid gap-4">
                <CodeBlock sample={bugCase.code.broken} variant="broken" />
                <CodeBlock sample={bugCase.code.fixed} variant="fixed" />
              </div>
            </CaseSection>

            <CaseSection id="verify" description="Re-run the demo and tick each check as you confirm it.">
              <VerificationChecklist items={bugCase.verification} />
            </CaseSection>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                On this page
              </p>
              <nav aria-label="On this page">
                <ul className="space-y-0.5 border-l border-slate-200">
                  {sections.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-700"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        </div>

        {relatedCases.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-slate-200 pt-10">
            <h2 id="related-heading" className="mb-5 text-lg font-semibold tracking-tight text-slate-950">
              Related cases
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCases.map((related) => (
                <li key={related.slug}>
                  <BugCaseCard bugCase={related} index={bugCases.indexOf(related) + 1} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav
          aria-label="Case navigation"
          className="mt-10 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={`/bug-cases/${previous.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ArrowLeft size={13} aria-hidden="true" />
                Previous case
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                {previous.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/#bug-cases"
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ArrowLeft size={13} aria-hidden="true" />
                Back to
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                All cases
              </span>
            </Link>
          )}
          {next ? (
            <Link
              href={`/bug-cases/${next.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-right transition-colors hover:border-indigo-200"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500">
                Next case
                <ArrowRight size={13} aria-hidden="true" />
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/#bug-cases"
              className="group rounded-xl border border-slate-200 bg-white p-4 text-right transition-colors hover:border-indigo-200"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500">
                Back to
                <ArrowRight size={13} aria-hidden="true" />
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                All cases
              </span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
