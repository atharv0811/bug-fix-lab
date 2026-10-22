"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { SegmentedControl } from "@/components/demos/segmented-control";

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

  return (
    <div>
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor="routing-url"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Requested URL
          </label>
          <select
            id="routing-url"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {urls.map((url) => (
              <option key={url} value={url}>
                /bug-cases/{url}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            How the page reads params
          </p>
          <SegmentedControl
            label="How the page reads params"
            value={access}
            onChange={setAccess}
            options={[
              { value: "sync", label: "params.slug", tone: "broken" },
              { value: "await", label: "await params", tone: "fixed" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ol className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
          {trace.map((step, index) => (
            <li key={step.label} className="flex gap-3 py-1.5">
              <span className="w-4 shrink-0 text-slate-600">{index + 1}</span>
              <span className="w-24 shrink-0 text-slate-400">{step.label}</span>
              <span className={`min-w-0 break-all ${step.ok ? "text-emerald-300" : "text-rose-300"}`}>
                {step.code}
              </span>
            </li>
          ))}
        </ol>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <span className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-600">
              /bug-cases/{slug}
            </span>
          </div>
          <div className="flex h-32 flex-col justify-center px-5">
            {title ? (
              <>
                <p className="text-xs font-medium text-slate-500">Case page</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{title}</p>
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-slate-500">404</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">This page could not be found</p>
              </>
            )}
          </div>
          <div
            className={`flex items-center gap-2 border-t px-4 py-2.5 text-sm ${
              correct
                ? "border-emerald-100 bg-emerald-50/60 text-emerald-800"
                : "border-rose-100 bg-rose-50/60 text-rose-800"
            }`}
          >
            {correct ? (
              <CircleCheck size={15} className="shrink-0" aria-hidden="true" />
            ) : (
              <CircleX size={15} className="shrink-0" aria-hidden="true" />
            )}
            {correct
              ? expectedNotFound
                ? access === "sync"
                  ? "404 is right here — but only by accident: every slug 404s."
                  : "Correct: unknown slugs should 404."
                : "Correct: the existing case renders."
              : "Wrong: this case exists but rendered a 404."}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Compare with the real app:{" "}
        <Link
          href={`/bug-cases/${slug}`}
          className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 hover:text-indigo-800"
        >
          open /bug-cases/{slug}
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}

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
      <div className="mb-5">
        <SegmentedControl
          label="Where the interactive state lives"
          value={boundary}
          onChange={setBoundary}
          options={[
            { value: "hook-in-server", label: "Hook in page", tone: "broken" },
            { value: "client-page", label: '"use client" on page' },
            { value: "client-leaf", label: "Client leaf", tone: "fixed" },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ul className="rounded-xl border border-slate-200 bg-white p-3">
          {tree.map((node, index) => (
            <li
              key={node.name}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2"
              style={{ paddingLeft: `${0.5 + Math.min(index, 2) * 1.25}rem` }}
            >
              <span className="min-w-0">
                <span className="block truncate font-mono text-sm text-slate-900">{`<${node.name}>`}</span>
                <span className="block truncate text-xs text-slate-500">
                  {node.file}
                  {node.note && <span className="text-indigo-600"> · {node.note}</span>}
                </span>
              </span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                  node.client ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
                }`}
              >
                {node.client ? "Client" : "Server"}
              </span>
            </li>
          ))}
        </ul>

        <div
          className={`rounded-xl border p-4 text-sm leading-6 ${
            boundary === "hook-in-server"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : boundary === "client-page"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {boundary === "hook-in-server" && (
            <>
              <p className="flex items-center gap-2 font-semibold">
                <CircleX size={16} aria-hidden="true" />
                Build error
              </p>
              <p className="mt-2">
                Next.js reports that the file imports a component needing{" "}
                <code className="font-mono">useState</code>, which only works in a
                Client Component, and suggests adding the{" "}
                <code className="font-mono">&quot;use client&quot;</code> directive.
              </p>
              <p className="mt-2 text-xs text-rose-800/80">Paraphrased — exact wording varies by version.</p>
            </>
          )}
          {boundary === "client-page" && (
            <>
              <p className="flex items-center gap-2 font-semibold">
                <TriangleAlert size={16} aria-hidden="true" />
                Works, but over-corrected
              </p>
              <p className="mt-2">
                Every component imported by the page becomes part of the client
                bundle, and the page can no longer be an async Server Component —
                so it cannot simply <code className="font-mono">await params</code>{" "}
                or read server-only data.
              </p>
            </>
          )}
          {boundary === "client-leaf" && (
            <>
              <p className="flex items-center gap-2 font-semibold">
                <CircleCheck size={16} aria-hidden="true" />
                Fixed
              </p>
              <p className="mt-2">
                The page stays a Server Component and is prerendered. Only{" "}
                <code className="font-mono">CaseDemo</code> is a Client Component,
                so only its code ships to the browser for interactivity. This is how
                the page you&apos;re reading is built.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function RoutingDemo() {
  const [tab, setTab] = useState<Tab>("params");

  return (
    <div>
      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
        <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Simulation: this models the route logic in your browser. No real route
          is rendered or broken — use the links to compare with actual Next.js
          behaviour.
        </p>
      </div>

      <div className="mb-5 border-b border-slate-200">
        <div role="tablist" aria-label="Routing demos" className="-mb-px flex gap-4">
          {(
            [
              { value: "params", label: "Async params" },
              { value: "boundary", label: "Component boundary" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`routing-tab-${item.value}`}
              aria-selected={tab === item.value}
              aria-controls={tab === item.value ? `routing-panel-${item.value}` : undefined}
              onClick={() => setTab(item.value)}
              className={`border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors ${
                tab === item.value
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`routing-panel-${tab}`}
        aria-labelledby={`routing-tab-${tab}`}
      >
        {tab === "params" ? <ParamsSimulation /> : <BoundarySimulation />}
      </div>
    </div>
  );
}
