"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Boxes, CircleCheck, CircleX, Globe, Route, TriangleAlert } from "lucide-react";
import { ChoiceGroup, type Choice } from "@/components/ui/choice-group";
import { ControlLabel, ModeSwitch } from "@/components/ui/mode-switch";
import { SelectField } from "@/components/ui/select-field";
import { StatusPanel } from "@/components/ui/status-panel";
import { Tabs } from "@/components/ui/tabs";
import { inlineCode } from "@/lib/ui";

type Tab = "params" | "boundary";
type Access = "sync" | "await";
type Boundary = "hook-in-server" | "client-page" | "client-leaf";

/** Titles only — the simulation needs a lookup table, not the full case data. */
const knownCases: Record<string, string> = {
  "react-state-update": "React State Update Bug",
  "form-validation": "Form Validation Bug",
  "unnecessary-rerenders": "Unnecessary React Re-renders",
};

const urls = [...Object.keys(knownCases), "does-not-exist"];

type TraceStep = { label: string; code: string; ok: boolean };

function ParamsSimulation() {
  const [slug, setSlug] = useState(urls[0]);
  const [access, setAccess] = useState<Access>("sync");

  // Simulated resolution: models what the page reads, it does not run Next.js.
  const resolvedSlug = access === "await" ? slug : undefined;
  const title = resolvedSlug ? knownCases[resolvedSlug] : undefined;

  const trace: TraceStep[] = [
    { label: "Match route", code: "/bug-cases/[slug]", ok: true },
    { label: "Receive params", code: `Promise<{ slug: "${slug}" }>`, ok: true },
    access === "sync"
      ? { label: "Read slug", code: "params.slug  // → undefined", ok: false }
      : { label: "Read slug", code: `(await params).slug  // → "${slug}"`, ok: true },
    {
      label: "Look up case",
      code: title ? `found "${title}"` : `bugCases.find(…)  // → undefined`,
      ok: Boolean(title),
    },
    {
      label: "Render",
      code: title ? "<CaseView />" : "notFound()  // → 404",
      ok: Boolean(title) || (access === "await" && !title),
    },
  ];

  const expectedNotFound = !(slug in knownCases);
  const correct = access === "await" || expectedNotFound;
  const accidental = correct && expectedNotFound && access === "sync";

  return (
    <div>
      <div className="mb-5 grid gap-4 rounded-lg border border-line bg-surface-2 p-3 md:grid-cols-2">
        <div className="min-w-0">
          <ControlLabel htmlFor="routing-url">Requested URL</ControlLabel>
          <SelectField
            id="routing-url"
            icon={Globe}
            mono
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          >
            {urls.map((url) => (
              <option key={url} value={url}>
                /bug-cases/{url}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="min-w-0">
          <ControlLabel>How the page reads params</ControlLabel>
          <ModeSwitch
            label="How the page reads params"
            value={access}
            onChange={setAccess}
            options={[
              { value: "sync", label: "params.slug", tone: "broken", code: true },
              { value: "await", label: "(await params).slug", tone: "fixed", code: true },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-code-line bg-code">
          <p className="border-b border-code-line bg-code-header px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-code-muted">
            Resolution trace · simulated
          </p>
          <ol className="p-4 font-mono text-xs">
            {trace.map((step, index) => (
              <li key={step.label} className="flex gap-3 py-1.5">
                <span className="w-4 shrink-0 text-code-gutter">{index + 1}</span>
                <span className="w-24 shrink-0 text-code-dim">{step.label}</span>
                <span className={`min-w-0 break-all ${step.ok ? "text-code-success" : "text-code-danger"}`}>
                  {step.code}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
            <Globe size={14} className="shrink-0 text-subtle" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted">
              /bug-cases/{slug}
            </span>
          </div>
          <div className="flex h-32 flex-col justify-center px-5">
            {title ? (
              <>
                <p className="text-xs font-medium text-muted">Case page</p>
                <p className="mt-1 text-lg font-semibold text-fg">{title}</p>
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-muted">404</p>
                <p className="mt-1 text-lg font-semibold text-fg">This page could not be found</p>
              </>
            )}
          </div>
          <div
            className={`flex items-center gap-2 border-t px-4 py-2.5 text-sm ${
              accidental
                ? "border-warning-line bg-warning-soft text-warning"
                : correct
                  ? "border-success-line bg-success-soft text-success"
                  : "border-danger-line bg-danger-soft text-danger"
            }`}
          >
            {accidental ? (
              <TriangleAlert size={15} className="shrink-0" aria-hidden="true" />
            ) : correct ? (
              <CircleCheck size={15} className="shrink-0" aria-hidden="true" />
            ) : (
              <CircleX size={15} className="shrink-0" aria-hidden="true" />
            )}
            {accidental
              ? "404 is right here — but only by accident: every slug 404s."
              : correct
                ? expectedNotFound
                  ? "Correct: unknown slugs should 404."
                  : "Correct: the existing case renders."
                : "Wrong: this case exists but rendered a 404."}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Compare with the real app:{" "}
        <Link
          href={`/bug-cases/${slug}`}
          className="inline-flex items-center gap-0.5 font-semibold text-accent-text hover:underline"
        >
          open /bug-cases/{slug}
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}

const boundaryChoices: Choice<Boundary>[] = [
  { value: "hook-in-server", title: "Hook in page", hint: "useState in a Server Component", tone: "broken", icon: CircleX },
  { value: "client-page", title: '"use client" on page', hint: "Works, but everything ships", icon: TriangleAlert },
  { value: "client-leaf", title: "Client leaf", hint: "Only the demo is a Client Component", tone: "fixed", icon: CircleCheck },
];

type TreeNode = { name: string; file: string; client: boolean; note?: string };

function BoundarySimulation() {
  const [boundary, setBoundary] = useState<Boundary>("hook-in-server");

  const pageIsClient = boundary === "client-page";
  const tree: TreeNode[] = [
    { name: "RootLayout", file: "app/layout.tsx", client: false },
    {
      name: "BugCasePage",
      file: "app/bug-cases/[slug]/page.tsx",
      client: pageIsClient,
      note: boundary === "hook-in-server" ? "calls useState()" : pageIsClient ? '"use client"' : "async, awaits params",
    },
    { name: "CaseHeader", file: "case-header.tsx", client: pageIsClient },
    { name: "CodeBlock", file: "code-block.tsx", client: pageIsClient },
    {
      name: "CaseDemo",
      file: "case-demo.tsx",
      client: boundary !== "hook-in-server",
      note: boundary === "client-leaf" ? '"use client" · owns useState()' : undefined,
    },
  ];

  return (
    <div>
      <div className="mb-5 rounded-lg border border-line bg-surface-2 p-2.5">
        <ControlLabel>Where the interactive state lives</ControlLabel>
        <ChoiceGroup label="Where the interactive state lives" choices={boundaryChoices} value={boundary} onChange={setBoundary} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Component tree</p>
            <span className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-info-solid" aria-hidden="true" />
                Server
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-warning-solid" aria-hidden="true" />
                Client
              </span>
            </span>
          </div>
          <ul className="p-2">
            {tree.map((node, index) => (
              <li
                key={node.name}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2"
                style={{ paddingLeft: `${0.5 + Math.min(index, 2) * 1.25}rem` }}
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm text-fg">{`<${node.name}>`}</span>
                  <span className="block truncate text-xs text-muted">
                    {node.file}
                    {node.note && <span className="text-accent-text"> · {node.note}</span>}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
                    node.client
                      ? "border-warning-line bg-warning-soft text-warning"
                      : "border-info-line bg-info-soft text-info"
                  }`}
                >
                  {node.client ? "Client" : "Server"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {boundary === "hook-in-server" && (
          <StatusPanel tone="danger" title="Build error" className="self-start">
            <p>
              Next.js reports that the file imports a component needing{" "}
              <code className={inlineCode}>useState</code>, which only works in a Client
              Component, and suggests adding the{" "}
              <code className={inlineCode}>&quot;use client&quot;</code> directive.
            </p>
            <p className="mt-2 text-xs text-muted">Paraphrased — exact wording varies by version.</p>
          </StatusPanel>
        )}
        {boundary === "client-page" && (
          <StatusPanel tone="warning" title="Works, but over-corrected" className="self-start">
            Every component imported by the page becomes part of the client bundle,
            and the page can no longer be an async Server Component — so it cannot
            simply <code className={inlineCode}>await params</code> or read
            server-only data.
          </StatusPanel>
        )}
        {boundary === "client-leaf" && (
          <StatusPanel tone="success" title="Fixed" className="self-start">
            The page stays a Server Component and is prerendered. Only{" "}
            <code className={inlineCode}>CaseDemo</code> is a Client Component, so
            only its code ships to the browser for interactivity. This is how the
            page you&apos;re reading is built.
          </StatusPanel>
        )}
      </div>
    </div>
  );
}

export function RoutingDemo() {
  const [tab, setTab] = useState<Tab>("params");

  return (
    <div>
      <Tabs
        label="Routing demos"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "params", label: "Async params", icon: Route },
          { value: "boundary", label: "Component boundary", icon: Boxes },
        ]}
      >
        {tab === "params" ? <ParamsSimulation /> : <BoundarySimulation />}
      </Tabs>
    </div>
  );
}
