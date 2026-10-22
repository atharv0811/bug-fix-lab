"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  CircleX,
  FolderOpen,
  Inbox,
  LoaderCircle,
  Network,
  RefreshCw,
  Send,
  ServerCrash,
  Terminal,
} from "lucide-react";
import { ChoiceGroup, type Choice } from "@/components/ui/choice-group";
import { DemoToolbar } from "@/components/ui/demo-toolbar";
import { ControlLabel, ModeSwitch } from "@/components/ui/mode-switch";
import { buttonClass } from "@/lib/ui";

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

const scenarioChoices: Choice<Scenario>[] = [
  { value: "success", title: "Success", hint: "Returns 3 projects", icon: CircleCheck },
  { value: "empty", title: "Empty response", hint: "Succeeds with []", icon: Inbox },
  { value: "error", title: "Server error", hint: "Always fails with 500", icon: ServerCrash },
  { value: "flaky", title: "Fail once, then succeed", hint: "Attempt 1 fails, retry works", icon: RefreshCw },
];

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
  Active: "border-success-line bg-success-soft text-success",
  Paused: "border-warning-line bg-warning-soft text-warning",
  Done: "border-line bg-surface-3 text-muted",
};

const logTones: Record<LogEntry["tone"], string> = {
  error: "text-code-danger",
  success: "text-code-success",
  warning: "text-code-number",
  info: "text-code-fg",
};

function ProjectRows({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-line">
      {projects.map((project) => (
        <li key={project.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="flex min-w-0 items-center gap-2.5 text-sm text-fg">
            <FolderOpen size={15} className="shrink-0 text-subtle" aria-hidden="true" />
            <span className="truncate">{project.name}</span>
          </span>
          <span className={`rounded-md border px-1.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}>
            {project.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Spinner() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
      <LoaderCircle size={22} className="animate-spin text-accent-text motion-reduce:animate-none" aria-hidden="true" />
      <p className="text-sm">Loading projects…</p>
    </div>
  );
}

function StateMessage({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: typeof Inbox;
  iconClass: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 text-center">
      <span className={`mb-1 flex h-10 w-10 items-center justify-center rounded-xl border ${iconClass}`}>
        <Icon size={19} aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-fg">{title}</p>
      {children}
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
          <StateMessage icon={Send} iconClass="border-line bg-surface-2 text-subtle" title="No request sent yet">
            <p className="text-sm text-muted">Send a request to load the project list.</p>
          </StateMessage>
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
          <StateMessage icon={Inbox} iconClass="border-line bg-surface-2 text-muted" title="No projects yet">
            <p className="text-sm text-muted">The request succeeded but returned an empty list.</p>
          </StateMessage>
        );
        break;
      case "error":
        body = (
          <StateMessage icon={ServerCrash} iconClass="border-danger-line bg-danger-soft text-danger" title="Couldn't load projects">
            <p className="text-sm text-muted">{state.message}</p>
            <button type="button" onClick={loadFixed} className={buttonClass({ variant: "secondary", size: "sm", className: "mt-2" })}>
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </StateMessage>
        );
        break;
    }
  }

  const statusLabel = isBuggy
    ? `loading: ${loading} · projects: ${projects === null ? "null" : `[${projects.length}]`}`
    : `status: "${state.status}"`;

  const busy = isBuggy ? loading : state.status === "loading";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-fg">
            Projects
            <span className="rounded border border-line bg-surface-2 px-1.5 font-mono text-[11px] font-normal text-muted">
              GET /api/projects
            </span>
          </p>
          <button type="button" onClick={load} className={buttonClass({ size: "sm" })}>
            <Send size={14} aria-hidden="true" />
            Send request
          </button>
        </div>
        <div className="h-56" aria-live="polite" aria-busy={busy}>
          {body}
        </div>
        <p className="flex items-center gap-2 truncate border-t border-line bg-surface-2 px-4 py-2 font-mono text-xs text-muted">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${busy ? "bg-warning-solid" : "bg-subtle"}`}
            aria-hidden="true"
          />
          {statusLabel}
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-code-line bg-code">
        <p className="flex items-center gap-1.5 border-b border-code-line bg-code-header px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-code-muted">
          <Terminal size={12} aria-hidden="true" />
          Request log
        </p>
        <div className="flex-1 p-3">
          {log.length === 0 ? (
            <p className="font-mono text-xs text-code-muted">Waiting for a request…</p>
          ) : (
            <ul className="space-y-1.5 font-mono text-xs">
              {log.map((entry) => (
                <li key={entry.id} className={logTones[entry.tone]}>
                  {entry.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ApiStatesDemo() {
  const [implementation, setImplementation] = useState<Implementation>("buggy");
  const [scenario, setScenario] = useState<Scenario>("error");

  return (
    <div>
      <DemoToolbar
        icon={Network}
        context={
          <>
            Mock <code className="font-mono text-fg-2">GET /api/projects</code>
            <span className="text-subtle"> · {LATENCY_MS}ms simulated latency</span>
          </>
        }
      >
        <div className="w-full">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <ControlLabel>Implementation</ControlLabel>
              <ModeSwitch
                label="Implementation"
                value={implementation}
                onChange={setImplementation}
                options={[
                  { value: "buggy", label: "Buggy", tone: "broken", icon: CircleX },
                  { value: "fixed", label: "Fixed", tone: "fixed", icon: CircleCheck },
                ]}
              />
            </div>
            <p className="max-w-xs text-xs leading-5 text-muted">
              {implementation === "buggy"
                ? "Separate loading and data flags, as in the “before” code."
                : "One discriminated-union request state, as in the “after” code."}
            </p>
          </div>
          <ControlLabel>Mock server response</ControlLabel>
          <ChoiceGroup label="Mock server response" choices={scenarioChoices} value={scenario} onChange={setScenario} columns={4} />
        </div>
      </DemoToolbar>

      {/* Remount on every control change so each run starts from a clean state */}
      <ApiPanel key={`${implementation}-${scenario}`} implementation={implementation} scenario={scenario} />

      <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted">
        Every request takes a fixed {LATENCY_MS}ms so the loading state is
        visible. The outcome is deterministic: it depends only on the selected
        response and the attempt number.
      </p>
    </div>
  );
}
