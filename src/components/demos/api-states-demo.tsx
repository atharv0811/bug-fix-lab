"use client";

import { useEffect, useRef, useState } from "react";
import { FolderOpen, Inbox, LoaderCircle, RefreshCw, Send, ServerCrash } from "lucide-react";
import { SegmentedControl } from "@/components/demos/segmented-control";

type Implementation = "buggy" | "fixed";
type Scenario = "success" | "empty" | "error" | "flaky";

type Project = { id: string; name: string; status: "Active" | "Paused" | "Done" };

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; projects: Project[] }
  | { status: "empty" }
  | { status: "error"; message: string };

type LogEntry = { id: number; message: string; tone: "info" | "success" | "error" | "warning" };

const LATENCY_MS = 800;

const sampleProjects: Project[] = [
  { id: "p1", name: "Marketing site redesign", status: "Active" },
  { id: "p2", name: "Billing dashboard", status: "Paused" },
  { id: "p3", name: "Mobile onboarding flow", status: "Done" },
];

const scenarioLabels: Record<Scenario, string> = {
  success: "Success",
  empty: "Empty response",
  error: "Server error",
  flaky: "Fail once, then succeed",
};

class MockHttpError extends Error {}

/**
 * Deterministic local stand-in for `fetch("/api/projects")`. No network
 * request is made; the outcome depends only on the scenario and attempt.
 */
function mockFetchProjects(scenario: Scenario, attempt: number, signal: AbortSignal) {
  return new Promise<Project[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (scenario === "error" || (scenario === "flaky" && attempt === 1)) {
        reject(new MockHttpError("Request failed (500 Internal Server Error)"));
      } else {
        resolve(scenario === "empty" ? [] : sampleProjects);
      }
    }, LATENCY_MS);

    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

const statusStyles: Record<Project["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Paused: "bg-amber-50 text-amber-700",
  Done: "bg-slate-100 text-slate-600",
};

function ProjectRows({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {projects.map((project) => (
        <li key={project.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="flex min-w-0 items-center gap-2.5 text-sm text-slate-800">
            <FolderOpen size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{project.name}</span>
          </span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}>
            {project.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Spinner() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
      <LoaderCircle size={22} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <p className="text-sm">Loading projects…</p>
    </div>
  );
}

function ApiPanel({ implementation, scenario }: { implementation: Implementation; scenario: Scenario }) {
  // Buggy implementation: independent flags, as in the "before" code.
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[] | null>(null);
  // Fixed implementation: one discriminated union.
  const [state, setState] = useState<RequestState>({ status: "idle" });

  const [log, setLog] = useState<LogEntry[]>([]);
  const attempts = useRef(0);
  const latestRequest = useRef(0);
  const logId = useRef(0);
  const controllers = useRef(new Set<AbortController>());

  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach((controller) => controller.abort());
  }, []);

  function addLog(message: string, tone: LogEntry["tone"]) {
    logId.current += 1;
    const entry = { id: logId.current, message, tone };
    setLog((current) => [entry, ...current].slice(0, 5));
  }

  async function request() {
    attempts.current += 1;
    const attempt = attempts.current;
    const controller = new AbortController();
    controllers.current.add(controller);
    addLog(`Attempt ${attempt}: request sent`, "info");

    try {
      return { attempt, projects: await mockFetchProjects(scenario, attempt, controller.signal) };
    } finally {
      controllers.current.delete(controller);
    }
  }

  async function loadBuggy() {
    try {
      setLoading(true);
      const { attempt, projects: result } = await request();
      setProjects(result);
      setLoading(false);
      addLog(`Attempt ${attempt}: ${result.length} projects received`, "success");
    } catch (error) {
      if (isAbort(error)) return;
      // Mirrors the bug: the thrown error skips setLoading(false) and is never stored.
      addLog("Error thrown — loading flag was never reset", "error");
    }
  }

  async function loadFixed() {
    const requestId = ++latestRequest.current;
    setState({ status: "loading" });

    try {
      const { attempt, projects: result } = await request();
      if (requestId !== latestRequest.current) {
        addLog(`Attempt ${attempt}: stale response ignored`, "warning");
        return;
      }
      setState(result.length > 0 ? { status: "success", projects: result } : { status: "empty" });
      addLog(`Attempt ${attempt}: ${result.length} projects received`, "success");
    } catch (error) {
      if (isAbort(error) || requestId !== latestRequest.current) return;
      const message = error instanceof Error ? error.message : "Unknown error";
      setState({ status: "error", message });
      addLog(`Error stored: ${message}`, "error");
    }
  }

  const isBuggy = implementation === "buggy";
  const load = isBuggy ? loadBuggy : loadFixed;

  let body: React.ReactNode;
  if (isBuggy) {
    if (loading) body = <Spinner />;
    else if (projects && projects.length > 0) body = <ProjectRows projects={projects} />;
    else body = null; // Bug: idle, empty, and failed all render nothing
  } else {
    switch (state.status) {
      case "idle":
        body = (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
            No request sent yet.
          </div>
        );
        break;
      case "loading":
        body = <Spinner />;
        break;
      case "success":
        body = <ProjectRows projects={state.projects} />;
        break;
      case "empty":
        body = (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 text-center">
            <Inbox size={22} className="text-slate-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-900">No projects yet</p>
            <p className="text-sm text-slate-500">The request succeeded but returned an empty list.</p>
          </div>
        );
        break;
      case "error":
        body = (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 text-center">
            <ServerCrash size={22} className="text-rose-500" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-900">Couldn&apos;t load projects</p>
            <p className="text-sm text-slate-500">{state.message}</p>
            <button
              type="button"
              onClick={loadFixed}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </div>
        );
        break;
    }
  }

  const statusLabel = isBuggy
    ? `loading: ${loading} · projects: ${projects === null ? "null" : `[${projects.length}]`}`
    : `status: "${state.status}"`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
          <p className="text-sm font-semibold text-slate-900">Projects</p>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Send size={14} aria-hidden="true" />
            Send request
          </button>
        </div>
        <div className="h-56" aria-live="polite" aria-busy={isBuggy ? loading : state.status === "loading"}>
          {body}
        </div>
        <p className="truncate border-t border-slate-100 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-500">
          {statusLabel}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-950 p-3">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">Request log</p>
        {log.length === 0 ? (
          <p className="font-mono text-xs text-slate-500">Waiting for a request…</p>
        ) : (
          <ul className="space-y-1.5 font-mono text-xs">
            {log.map((entry) => (
              <li
                key={entry.id}
                className={
                  entry.tone === "error"
                    ? "text-rose-300"
                    : entry.tone === "success"
                      ? "text-emerald-300"
                      : entry.tone === "warning"
                        ? "text-amber-300"
                        : "text-slate-300"
                }
              >
                {entry.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ApiStatesDemo() {
  const [implementation, setImplementation] = useState<Implementation>("buggy");
  const [scenario, setScenario] = useState<Scenario>("error");

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Implementation
          </p>
          <SegmentedControl
            label="Implementation"
            value={implementation}
            onChange={setImplementation}
            options={[
              { value: "buggy", label: "Buggy", tone: "broken" },
              { value: "fixed", label: "Fixed", tone: "fixed" },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mock server response
          </p>
          <SegmentedControl
            label="Mock server response"
            value={scenario}
            onChange={setScenario}
            options={(Object.keys(scenarioLabels) as Scenario[]).map((value) => ({
              value,
              label: scenarioLabels[value],
            }))}
          />
        </div>
      </div>

      {/* Remount on every control change so each run starts from a clean state */}
      <ApiPanel key={`${implementation}-${scenario}`} implementation={implementation} scenario={scenario} />

      <p className="mt-5 text-sm leading-6 text-slate-600">
        Every request takes a fixed {LATENCY_MS}ms so the loading state is
        visible. The outcome is deterministic: it depends only on the selected
        response and the attempt number.
      </p>
    </div>
  );
}
