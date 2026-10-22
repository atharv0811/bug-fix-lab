import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  ChevronRight,
  CircleCheck,
  FlaskConical,
  Hash,
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
  type BugCase,
} from "@/lib/bug-cases";
import BugCaseCard, { categoryIcons } from "@/components/bug-cases/bug-case-card";
import { CaseNavigation } from "@/components/bug-cases/case-navigation";
import { VerificationChecklist } from "@/components/bug-cases/verification-checklist";
import { caseDemos } from "@/components/demos";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { card, eyebrow } from "@/lib/ui";

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
  { id: "symptoms", label: "Symptoms", icon: TriangleAlert, tone: "text-danger" },
  { id: "reproduce", label: "Reproduce", icon: ListOrdered, tone: "text-fg-2" },
  { id: "demo", label: "Interactive demo", icon: MousePointerClick, tone: "text-accent-text" },
  { id: "investigate", label: "Investigate", icon: Search, tone: "text-warning" },
  { id: "root-cause", label: "Root cause", icon: Microscope, tone: "text-accent-text" },
  { id: "fix", label: "Fix", icon: Wrench, tone: "text-info" },
  { id: "verify", label: "Verify", icon: CircleCheck, tone: "text-success" },
] as const;

type SectionId = (typeof sections)[number]["id"];

const navSections = sections.map(({ id, label }) => ({ id, label }));

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
  const { label, icon: Icon, tone } = sections[index];

  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <div className="mb-4 flex items-center gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface shadow-card ${tone}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="flex items-baseline gap-2 text-lg font-semibold tracking-tight text-fg">
            <span className="font-mono text-xs font-medium text-subtle">
              {String(index + 1).padStart(2, "0")}
            </span>
            {label}
          </h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function NumberedSteps({ steps, tone }: { steps: string[]; tone: "neutral" | "warning" }) {
  return (
    <ol className={`${card} divide-y divide-line`}>
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 px-4 py-3 text-sm leading-6 text-fg-2">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold ${
              tone === "warning"
                ? "border-warning-line bg-warning-soft text-warning"
                : "border-line bg-surface-3 text-fg-2"
            }`}
          >
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function AdjacentLink({
  bugCase,
  direction,
}: {
  bugCase: BugCase | undefined;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  const href = bugCase ? `/bug-cases/${bugCase.slug}` : "/#bug-cases";
  const caption = bugCase ? (isNext ? "Next case" : "Previous case") : "Back to";
  const title = bugCase ? bugCase.title : "All cases";

  return (
    <Link
      href={href}
      className={`${card} group flex items-center gap-4 p-4 transition-[border-color,box-shadow] hover:border-accent-line hover:shadow-elevated ${
        isNext ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted transition-colors group-hover:text-accent-text">
        {isNext ? <ArrowRight size={16} aria-hidden="true" /> : <ArrowLeft size={16} aria-hidden="true" />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted">{caption}</span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-fg group-hover:text-accent-text">
          {title}
        </span>
      </span>
    </Link>
  );
}

/**
 * URL-independent placeholder with the same structure as a case page. With
 * Partial Prefetching, this is the shared App Shell that <Link> prefetches,
 * so client navigations paint immediately while the case content streams in.
 */
function CaseWorkspaceSkeleton() {
  const bar = "rounded-md bg-surface-3";
  return (
    <div className="animate-shell-in pb-20" aria-busy="true" aria-label="Loading case">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl animate-pulse px-4 pb-8 pt-6 motion-reduce:animate-none sm:px-8 sm:pb-10">
          <div className={`mb-6 h-4 w-56 ${bar}`} />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl flex-1">
              <div className="mb-4 flex items-center gap-3">
                <div className={`size-11 rounded-xl ${bar}`} />
                <div className="space-y-2">
                  <div className={`h-3 w-20 ${bar}`} />
                  <div className={`h-3.5 w-36 ${bar}`} />
                </div>
              </div>
              <div className={`h-9 w-2/3 ${bar}`} />
              <div className="mt-5 space-y-2.5">
                <div className={`h-4 w-full ${bar}`} />
                <div className={`h-4 w-11/12 ${bar}`} />
                <div className={`h-4 w-3/5 ${bar}`} />
              </div>
            </div>
            <div className="h-19 rounded-xl border border-line bg-surface-2 lg:w-md" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl animate-pulse px-4 pt-10 motion-reduce:animate-none sm:px-8 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="space-y-6">
            <div className={`h-6 w-40 ${bar}`} />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-14 rounded-xl border border-line bg-surface" />
              ))}
            </div>
            <div className="h-72 rounded-xl border border-line bg-surface" />
          </div>
          <div className="hidden space-y-2 lg:block">
            {[0, 1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className={`h-4 w-32 ${bar}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// The page itself stays URL-independent; only the boundary below reads params.
export default function BugCaseDetailPage({ params }: BugCasePageProps) {
  return (
    <Suspense fallback={<CaseWorkspaceSkeleton />}>
      <CaseWorkspace params={params} />
    </Suspense>
  );
}

async function CaseWorkspace({ params }: BugCasePageProps) {
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
  const isLive = bugCase.demo.kind === "live";

  return (
    <div className="pb-20">
      {/* Case header */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-8 sm:pb-10">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-fg">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-subtle">
                <ChevronRight size={14} />
              </li>
              <li>
                <Link href="/#bug-cases" className="hover:text-fg">
                  Bug cases
                </Link>
              </li>
              <li aria-hidden="true" className="text-subtle">
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="min-w-0 truncate font-medium text-fg">
                {bugCase.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-line bg-accent-soft text-accent-text">
                  <CategoryIcon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-subtle">
                    Case {String(caseNumber).padStart(2, "0")} / {String(bugCases.length).padStart(2, "0")}
                  </p>
                  <p className="truncate text-sm font-medium text-muted">{bugCase.category}</p>
                </div>
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.02em] text-fg sm:text-4xl">{bugCase.title}</h1>
              <p className="mt-4 text-base leading-7 text-muted">{bugCase.problem}</p>
            </div>

            <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm sm:grid-cols-3 lg:w-md">
              <div className="bg-surface-2 px-4 py-3">
                <dt className={eyebrow}>Difficulty</dt>
                <dd className="mt-1.5">
                  <DifficultyBadge difficulty={bugCase.difficulty} />
                </dd>
              </div>
              <div className="bg-surface-2 px-4 py-3">
                <dt className={eyebrow}>Demo</dt>
                <dd className="mt-1.5">
                  <Badge tone={isLive ? "success" : "info"} dot>
                    {isLive ? "Live" : "Simulated"}
                  </Badge>
                </dd>
              </div>
              <div className="col-span-2 min-w-0 bg-surface-2 px-4 py-3 sm:col-span-1">
                <dt className={eyebrow}>Area</dt>
                <dd className="mt-1.5 truncate font-medium text-fg">{bugCase.area}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0 space-y-12">
            <CaseSection id="symptoms" description="What a user or developer would observe.">
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {bugCase.symptoms.map((symptom) => (
                  <li
                    key={symptom}
                    className={`${card} flex items-start gap-3 px-4 py-3 text-sm leading-6 text-fg-2`}
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger-solid" aria-hidden="true" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </CaseSection>

            <CaseSection id="reproduce" description="A reliable sequence that triggers the bug.">
              <NumberedSteps steps={bugCase.reproduction} tone="neutral" />
            </CaseSection>

            <CaseSection id="demo" description="Trigger the bug, then switch to the fixed version.">
              <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                <div className="flex flex-col gap-2 border-b border-line bg-surface-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
                  <Badge
                    tone={isLive ? "success" : "info"}
                    icon={<FlaskConical size={12} aria-hidden="true" />}
                    className="shrink-0 self-start sm:self-auto"
                  >
                    {isLive ? "Live demo" : "Simulated demo"}
                  </Badge>
                  <p className="text-xs leading-5 text-muted">{bugCase.demo.note}</p>
                </div>
                <div className="p-4 sm:p-6">{Demo ? <Demo /> : null}</div>
              </div>
            </CaseSection>

            <CaseSection id="investigate" description="How to narrow down the cause.">
              <NumberedSteps steps={bugCase.investigation} tone="warning" />
              {bugCase.investigationSnippet && (
                <div className="mt-4">
                  <CodeBlock sample={bugCase.investigationSnippet} />
                </div>
              )}
            </CaseSection>

            <CaseSection id="root-cause">
              <div className="relative overflow-hidden rounded-xl border border-accent-line bg-accent-soft p-5 sm:p-6">
                <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden="true" />
                <p className="text-[15px] leading-7 text-fg sm:text-base sm:leading-7">{bugCase.rootCause}</p>
              </div>
            </CaseSection>

            <CaseSection id="fix" description="The change, and why it addresses the cause.">
              <p className="mb-5 text-[15px] leading-7 text-fg-2">{bugCase.solution}</p>
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
            <div className="sticky top-24 space-y-6">
              <div>
                <p className={`${eyebrow} mb-3 flex items-center gap-1.5`}>
                  <Hash size={12} aria-hidden="true" />
                  On this page
                </p>
                <CaseNavigation sections={navSections} />
              </div>

              <div className={`${card} p-4`}>
                <p className={eyebrow}>Case</p>
                <p className="mt-1.5 text-sm font-semibold text-fg">{bugCase.title}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <DifficultyBadge difficulty={bugCase.difficulty} />
                  <Badge tone={isLive ? "success" : "info"} dot>
                    {isLive ? "Live" : "Simulated"}
                  </Badge>
                </div>
                {next && (
                  <Link
                    href={`/bug-cases/${next.slug}`}
                    className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs font-medium text-muted hover:text-accent-text"
                  >
                    <span className="truncate">Next: {next.title}</span>
                    <ArrowRight size={13} className="shrink-0" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>

        {relatedCases.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20 border-t border-line pt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 id="related-heading" className="text-lg font-semibold tracking-tight text-fg">
                Related cases
              </h2>
              <Link href="/#bug-cases" className="text-sm font-medium text-accent-text hover:underline">
                All cases
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCases.map((related) => (
                <li key={related.slug}>
                  <BugCaseCard bugCase={related} index={bugCases.indexOf(related) + 1} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Case navigation" className="mt-10 grid gap-4 sm:grid-cols-2">
          <AdjacentLink bugCase={previous} direction="previous" />
          <AdjacentLink bugCase={next} direction="next" />
        </nav>
      </div>
    </div>
  );
}
