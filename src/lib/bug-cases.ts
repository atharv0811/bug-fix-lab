export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/** Broad grouping used by the homepage filter. */
export type CaseArea = "Layout & CSS" | "React" | "Data & Forms" | "Next.js";

export type CodeLanguage = "tsx" | "ts" | "css";

export type CodeSample = {
  filename: string;
  language: CodeLanguage;
  code: string;
};

export type BugCase = {
  slug: string;
  title: string;
  category: string;
  area: CaseArea;
  difficulty: Difficulty;
  /** One-line summary used on cards. */
  description: string;
  /** Longer problem statement shown on the detail page. */
  problem: string;
  symptoms: string[];
  reproduction: string[];
  investigation: string[];
  investigationSnippet?: CodeSample;
  rootCause: string;
  solution: string;
  verification: string[];
  code: {
    broken: CodeSample;
    fixed: CodeSample;
  };
  demo: {
    /** "live" runs real React behaviour; "simulated" models it locally. */
    kind: "live" | "simulated";
    note: string;
  };
  relatedSlugs: string[];
};

export const caseAreas: CaseArea[] = [
  "Layout & CSS",
  "React",
  "Data & Forms",
  "Next.js",
];

export const bugCases: BugCase[] = [
  {
    slug: "responsive-layout-overflow",
    title: "Responsive Layout Overflow",
    category: "CSS & Responsive Design",
    area: "Layout & CSS",
    difficulty: "Beginner",
    description:
      "Investigate a layout that creates unwanted horizontal scrolling on smaller screens.",
    problem:
      "A dashboard card looks correct on a laptop, but on phones the page can be dragged sideways and the right edge of the card is cut off. Nothing is broken at wider breakpoints, so the issue is easy to miss during desktop-only testing.",
    symptoms: [
      "A horizontal scrollbar appears on mobile viewports",
      "Content is clipped at the right edge of the screen",
      "The page can be panned sideways on touch devices",
      "The issue disappears once the viewport is wider than the card",
    ],
    reproduction: [
      "Open the demo below in Broken mode.",
      "The simulated phone viewport is narrower than the card's fixed 440px width.",
      "Scroll horizontally inside the phone frame — the card extends past the right edge.",
      "Read the overflow meter: the content's scrollWidth is larger than the viewport's clientWidth.",
    ],
    investigation: [
      "Open DevTools, enable the device toolbar, and test at 320px, 375px, and 414px widths.",
      "Run a console snippet to list elements whose right edge is past the viewport.",
      "Inspect the computed width of each match and look for fixed widths, min-width, 100vw, or negative margins.",
      "Check for long unbroken strings (URLs, tokens) that can also force a container wider.",
    ],
    investigationSnippet: {
      filename: "find-overflow.js",
      language: "ts",
      code: `// Paste into the browser console to list elements wider than the viewport
const viewportWidth = document.documentElement.clientWidth;

document.querySelectorAll("*").forEach((element) => {
  if (element.getBoundingClientRect().right > viewportWidth) {
    console.log(element);
  }
});`,
    },
    rootCause:
      "The card declares a fixed width of 440px. An element with an explicit width does not shrink with its container, so on any viewport narrower than 440px plus padding it overflows its parent and increases the document's scroll width.",
    solution:
      "Replace the fixed width with a fluid width and a cap: width: 100% with max-width: 440px (w-full max-w-[440px] in Tailwind). The card fills small screens and stops growing at 440px on larger ones. Avoid hiding the symptom with overflow-x: hidden on the body — it masks the cause and can break sticky positioning.",
    verification: [
      "The demo's overflow meter reports scrollWidth equal to clientWidth in Fixed mode.",
      "No horizontal scrollbar at 320px, 375px, or 414px viewport widths.",
      "On wide screens the card is still capped at 440px.",
      "Text inside the card wraps without being clipped.",
    ],
    code: {
      broken: {
        filename: "stats-card.tsx",
        language: "tsx",
        code: `export function StatsCard() {
  return (
    // Fixed width: never shrinks below 440px
    <div className="w-[440px] rounded-xl border p-4">
      <h3>Analytics overview</h3>
      <StatsGrid />
    </div>
  );
}`,
      },
      fixed: {
        filename: "stats-card.tsx",
        language: "tsx",
        code: `export function StatsCard() {
  return (
    // Fluid width with a cap: fills small screens, stops at 440px
    <div className="w-full max-w-[440px] rounded-xl border p-4">
      <h3>Analytics overview</h3>
      <StatsGrid />
    </div>
  );
}`,
      },
    },
    demo: {
      kind: "live",
      note: "Real CSS rendered inside a simulated phone-sized viewport. The overflow meter reads the element's actual scrollWidth and clientWidth.",
    },
    relatedSlugs: ["form-validation", "unnecessary-rerenders"],
  },
  {
    slug: "react-state-update",
    title: "React State Update Bug",
    category: "React & State",
    area: "React",
    difficulty: "Intermediate",
    description:
      "Investigate a component that displays stale or unexpected state after user interaction.",
    problem:
      'An "Add 3" button calls the state setter three times, but the counter only increases by one. There is no error in the console, and each individual call looks correct when read in isolation.',
    symptoms: [
      'Clicking "Add 3" increases the value by 1 instead of 3',
      "Multiple state updates in one event handler collapse into one",
      "No warning or error is logged",
      "The bug is consistent and repeatable, not intermittent",
    ],
    reproduction: [
      "Reset both counters in the demo to 0.",
      'Click "Add 3" in the Buggy panel and note the result.',
      "Click the same button in the Fixed panel.",
      "Compare the expected and actual change reported under each counter.",
    ],
    investigation: [
      "Log count inside the handler — every call reads the same value.",
      "Recall that state is a snapshot: a value read during a render does not change until the next render.",
      "React batches state updates made in the same event handler and applies them after the handler finishes.",
      "React DevTools shows a single re-render, which confirms the three updates were batched.",
    ],
    rootCause:
      "Each setCount(count + 1) call reads count from the current render's closure. All three calls compute 0 + 1, so React queues “set to 1” three times. The state variable is not updated between the calls, because it only changes on the next render.",
    solution:
      "Pass an updater function instead of a value: setCount((current) => current + 1). React queues updater functions and applies each one to the result of the previous one, so three updaters produce +3. Use the updater form whenever the next state depends on the previous state — it also avoids stale values in callbacks created during an earlier render.",
    verification: [
      'From 0, "Add 3" in the Fixed panel produces 3.',
      "From any value n, the Fixed panel produces n + 3 on every click.",
      "The Buggy panel consistently produces n + 1, confirming the reproduction.",
      "The measured change matches the expected change in the Fixed panel.",
    ],
    code: {
      broken: {
        filename: "counter.tsx",
        language: "tsx",
        code: `function Counter() {
  const [count, setCount] = useState(0);

  function addThree() {
    // All three calls read the same \`count\` snapshot
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onClick={addThree}>Add 3 ({count})</button>;
}`,
      },
      fixed: {
        filename: "counter.tsx",
        language: "tsx",
        code: `function Counter() {
  const [count, setCount] = useState(0);

  function addThree() {
    // Each updater receives the result of the previous one
    setCount((current) => current + 1);
    setCount((current) => current + 1);
    setCount((current) => current + 1);
  }

  return <button onClick={addThree}>Add 3 ({count})</button>;
}`,
      },
    },
    demo: {
      kind: "live",
      note: "Both panels run real React state updates. The reported change is computed from the actual state before and after the click.",
    },
    relatedSlugs: ["unnecessary-rerenders", "api-loading-and-errors"],
  },
  {
    slug: "api-loading-and-errors",
    title: "API Loading and Error States",
    category: "API & Data Fetching",
    area: "Data & Forms",
    difficulty: "Intermediate",
    description:
      "Handle loading, successful responses, failures, and retry behavior consistently.",
    problem:
      "A project list fetches data when the user requests it. When the request fails, the spinner never goes away. When the request succeeds with no results, the panel is simply blank — users cannot tell whether something is still loading, broke, or returned nothing.",
    symptoms: [
      "The loading indicator never disappears after a failed request",
      "An empty response renders a blank area with no explanation",
      "There is no way to retry without reloading the page",
      "Error and empty states are visually indistinguishable",
    ],
    reproduction: [
      'Select the "Server error" scenario and the Buggy implementation.',
      "Send the request — the spinner stays forever.",
      'Select the "Empty response" scenario and send again — the panel is blank.',
      "Switch to the Fixed implementation and repeat both scenarios.",
    ],
    investigation: [
      "Trace every exit path of the request function: success, empty result, and thrown error.",
      "Note which paths reset the loading flag — only the success path does.",
      "Check how the UI decides what to render: it only checks whether data is truthy.",
      "List the possible combinations of loading, data, and error flags — several are impossible but still representable.",
    ],
    rootCause:
      "The loading flag is only reset in the success path. When the request throws, execution leaves the function before setLoading(false) runs, and the error is never stored. The UI renders based on whether data exists, so an empty array and a failure both produce an empty panel.",
    solution:
      'Model the request as a single discriminated union: "idle" | "loading" | "success" | "empty" | "error". Every exit path sets exactly one status, and the UI renders each one explicitly. The error state includes a retry action that calls the same load function. A request counter ignores responses from superseded requests.',
    verification: [
      "Success shows the project rows and no spinner.",
      "Empty response shows an explanatory empty state.",
      "Server error shows the message and a Retry button.",
      '"Fail once, then succeed" recovers on the second attempt after Retry.',
      "The spinner never remains after a request has settled.",
    ],
    code: {
      broken: {
        filename: "project-list.tsx",
        language: "tsx",
        code: `const [loading, setLoading] = useState(false);
const [projects, setProjects] = useState<Project[] | null>(null);

async function load() {
  setLoading(true);
  const response = await fetch("/api/projects");
  // Throwing here skips setLoading(false) — the spinner never stops
  if (!response.ok) throw new Error("Request failed");
  setProjects(await response.json());
  setLoading(false);
}

if (loading) return <Spinner />;
// Empty results and failures both render nothing
return <ProjectRows projects={projects ?? []} />;`,
      },
      fixed: {
        filename: "project-list.tsx",
        language: "tsx",
        code: `type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; projects: Project[] }
  | { status: "empty" }
  | { status: "error"; message: string };

const [state, setState] = useState<RequestState>({ status: "idle" });
const latestRequest = useRef(0);

async function load() {
  const requestId = ++latestRequest.current;
  setState({ status: "loading" });

  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error(\`Request failed (\${response.status})\`);
    const projects: Project[] = await response.json();

    if (requestId !== latestRequest.current) return; // superseded
    setState(projects.length > 0
      ? { status: "success", projects }
      : { status: "empty" });
  } catch (error) {
    if (requestId !== latestRequest.current) return;
    setState({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}`,
      },
    },
    demo: {
      kind: "simulated",
      note: "No network request is made. A local mock function resolves or rejects after a fixed 800ms latency so each state stays visible long enough to observe.",
    },
    relatedSlugs: ["form-validation", "react-state-update"],
  },
  {
    slug: "form-validation",
    title: "Form Validation Bug",
    category: "Forms & Validation",
    area: "Data & Forms",
    difficulty: "Beginner",
    description:
      "Investigate a form that accepts invalid input or provides unclear validation feedback.",
    problem:
      'A contact form submits with an empty name and an email like "alex@". When validation does fail, the feedback is a single generic message that does not say which field is wrong, and keyboard and screen-reader users are left to find the problem themselves.',
    symptoms: [
      "Empty required fields are accepted",
      'Malformed emails such as "alex@" pass validation',
      "Error messages are missing, generic, or not tied to a field",
      "Focus does not move to the field that needs attention",
    ],
    reproduction: [
      "Select Buggy validation in the demo.",
      'Leave the name empty, type "alex@" as the email, and submit.',
      "The form reports success and shows the invalid values it accepted.",
      "Switch to Fixed validation and submit the same values.",
    ],
    investigation: [
      "Read the submit handler and list exactly which rules are checked.",
      'The email rule only tests email.includes("@").',
      "Required fields are never checked, and values are not trimmed.",
      "Error text is not connected to inputs with aria-describedby, so assistive technology cannot announce it.",
    ],
    rootCause:
      "Validation is incomplete and the submit handler does not stop when a rule fails. Required fields are never checked, whitespace-only values count as filled in, and the email rule only looks for an @ character.",
    solution:
      "Centralise the rules in one validate(values) function that returns an error per field. Run it on submit and on blur once a field has been touched. Block submission when any error exists, render inline messages linked with aria-describedby and aria-invalid, and move focus to the first invalid field. In a real application, the server must validate the same rules again.",
    verification: [
      "Submitting the empty form shows an inline error for each required field and nothing is submitted.",
      '"alex@" shows an email-format error.',
      "A name containing only spaces is rejected.",
      "Correcting a field clears its error.",
      "Valid values show the success state.",
      "The whole flow works with the keyboard alone.",
    ],
    code: {
      broken: {
        filename: "contact-form.tsx",
        language: "tsx",
        code: `function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  // Only checks for an "@" — required fields are never validated
  if (!values.email.includes("@")) {
    alert("Something is wrong");
  }

  // Runs even when the check above fails
  submit(values);
}`,
      },
      fixed: {
        filename: "contact-form.tsx",
        language: "tsx",
        code: `const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "Enter an email address like name@example.com.";
  if (values.message.trim().length < 20)
    errors.message = "Enter a message of at least 20 characters.";
  return errors;
}

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const nextErrors = validate(values);
  setErrors(nextErrors);

  const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
  if (firstInvalid) {
    fieldRefs[firstInvalid].current?.focus();
    return; // block submission
  }

  submit(values);
}`,
      },
    },
    demo: {
      kind: "live",
      note: "Validation runs entirely in your browser. Nothing you type is stored or sent anywhere.",
    },
    relatedSlugs: ["api-loading-and-errors", "responsive-layout-overflow"],
  },
  {
    slug: "nextjs-routing-rendering",
    title: "Next.js Routing and Rendering",
    category: "Next.js",
    area: "Next.js",
    difficulty: "Advanced",
    description:
      "Investigate a route or rendering issue caused by incorrect assumptions about the App Router.",
    problem:
      "After upgrading to a recent Next.js version, every dynamic case page renders the not-found page, even for slugs that exist. A follow-up attempt to add an interactive toggle directly to the page component then fails because the page is a Server Component.",
    symptoms: [
      "Every /bug-cases/[slug] URL renders the 404 page",
      "params.slug is undefined when logged",
      'TypeScript reports that "slug" does not exist on a Promise type',
      "Adding useState to page.tsx fails with an error about Client Component hooks",
    ],
    reproduction: [
      "Pick a URL in the route resolver demo.",
      'Select "Synchronous params access" and resolve the route — the slug is undefined, so the lookup falls through to notFound().',
      'Switch to "await params" and resolve the same URL.',
      "Open the Component boundary tab to compare where the \"use client\" directive is placed.",
    ],
    investigation: [
      "Log params in the page — it is a Promise, not a plain object.",
      "Check the upgrade guide: since Next.js 15, params and searchParams are asynchronous, and Next.js 16 removed the temporary synchronous compatibility.",
      "Read the hook error carefully: it names the hook and the file that needs to be a Client Component.",
      "Check which components actually need browser state before moving the boundary.",
    ],
    rootCause:
      "In the App Router, params is a Promise. Reading params.slug without awaiting it returns undefined, so the case lookup fails and notFound() runs for every slug. Separately, page.tsx is a Server Component by default, and hooks like useState only work in Client Components.",
    solution:
      'Make the page async and read the slug with const { slug } = await params. Keep generateStaticParams so known slugs are prerendered, and call notFound() for unknown ones. For interactivity, move the interactive part into a small component marked "use client" and render it from the server page, instead of turning the whole page into a Client Component.',
    verification: [
      "Every slug returned by generateStaticParams renders its case page.",
      "An unknown slug renders the not-found page.",
      "The production build lists the case routes as prerendered.",
      "Only the interactive demo components are Client Components — this page itself uses this pattern.",
    ],
    code: {
      broken: {
        filename: "app/bug-cases/[slug]/page.tsx",
        language: "tsx",
        code: `import { useState } from "react";

type Props = { params: { slug: string } }; // params is actually a Promise

export default function BugCasePage({ params }: Props) {
  const [isFixed, setIsFixed] = useState(false); // hook in a Server Component
  const bugCase = bugCases.find((item) => item.slug === params.slug);

  if (!bugCase) notFound(); // runs for every slug
  return <CaseView bugCase={bugCase} isFixed={isFixed} />;
}`,
      },
      fixed: {
        filename: "app/bug-cases/[slug]/page.tsx",
        language: "tsx",
        code: `type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return bugCases.map(({ slug }) => ({ slug }));
}

export default async function BugCasePage({ params }: Props) {
  const { slug } = await params;
  const bugCase = bugCases.find((item) => item.slug === slug);

  if (!bugCase) notFound();
  // <CaseDemo> is a small "use client" component that owns the toggle state
  return <CaseView bugCase={bugCase} demo={<CaseDemo />} />;
}`,
      },
    },
    demo: {
      kind: "simulated",
      note: "This demo models route resolution and component boundaries in the browser — it does not render real Next.js routes. The page you are reading is the real implementation of the fixed pattern.",
    },
    relatedSlugs: ["unnecessary-rerenders", "react-state-update"],
  },
  {
    slug: "unnecessary-rerenders",
    title: "Unnecessary React Re-renders",
    category: "Performance",
    area: "React",
    difficulty: "Advanced",
    description:
      "Investigate avoidable rendering work and identify whether it affects actual performance.",
    problem:
      "Typing into a search field re-renders every row in a list, even though the rows do not use the search value. With a few rows this is harmless, but in a large or expensive list the extra work can make typing feel sluggish.",
    symptoms: [
      "Every row re-renders on each keystroke in an unrelated input",
      "Wrapping rows in memo() appears to have no effect",
      "React DevTools highlights the whole list on every update",
      "Interactions may feel slower as the list grows",
    ],
    reproduction: [
      'Select "No memo" and type into the input — every row counter increases.',
      'Select "memo + inline callback" and type again — rows still re-render.',
      'Select "memo + useCallback" and type — row counters stay the same.',
      "Click a row in each mode to see which rows re-render when selection changes.",
    ],
    investigation: [
      "Use the React DevTools Profiler to record a keystroke and see which components rendered and why.",
      "A parent re-render re-renders all of its children by default, regardless of whether their props changed.",
      "memo() skips a re-render only when every prop is equal by Object.is.",
      "An inline arrow function is a new function on every render, so it breaks memo()'s comparison.",
    ],
    rootCause:
      "The search state lives in the list's parent, so each keystroke re-renders the parent and, by default, every child. Adding memo() alone does not help because the parent passes a new inline onSelect function each render, so the props are never equal.",
    solution:
      "Wrap the row in memo() and pass a stable callback created with useCallback, using a functional state update so the callback needs no dependencies. Alternatively, move the input state down into its own component so the list is not under it. Only do this after profiling shows the renders are a real cost — memoization adds comparison work and complexity, and the React Compiler can apply it automatically.",
    verification: [
      'In "memo + useCallback" mode, typing does not increase any row counter.',
      "Selecting a row re-renders only the rows whose selected state changed.",
      "The parent still re-renders on every keystroke — that is expected.",
      "The list still displays and selects items correctly in every mode.",
    ],
    code: {
      broken: {
        filename: "project-list.tsx",
        language: "tsx",
        code: `const Row = memo(function Row({ item, selected, onSelect }: RowProps) {
  return <button onClick={onSelect}>{item.name}</button>;
});

function ProjectList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return items.map((item) => (
    <Row
      key={item.id}
      item={item}
      selected={item.id === selectedId}
      // New function every render — memo() can never skip this row
      onSelect={() => setSelectedId(item.id)}
    />
  ));
}`,
      },
      fixed: {
        filename: "project-list.tsx",
        language: "tsx",
        code: `const Row = memo(function Row({ item, selected, onSelect }: RowProps) {
  return <button onClick={() => onSelect(item.id)}>{item.name}</button>;
});

function ProjectList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Stable identity across renders, so memo() can compare props
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return items.map((item) => (
    <Row
      key={item.id}
      item={item}
      selected={item.id === selectedId}
      onSelect={handleSelect}
    />
  ));
}`,
      },
    },
    demo: {
      kind: "live",
      note: "Counters show how many times each component committed a render. This illustrates render behaviour; it is not a timing benchmark and does not measure performance.",
    },
    relatedSlugs: ["react-state-update", "nextjs-routing-rendering"],
  },
];

export function getBugCase(slug: string): BugCase | undefined {
  return bugCases.find((bugCase) => bugCase.slug === slug);
}

export function getAdjacentCases(slug: string) {
  const index = bugCases.findIndex((bugCase) => bugCase.slug === slug);

  return {
    previous: index > 0 ? bugCases[index - 1] : undefined,
    next: index >= 0 && index < bugCases.length - 1 ? bugCases[index + 1] : undefined,
  };
}

export function getRelatedCases(bugCase: BugCase): BugCase[] {
  return bugCase.relatedSlugs
    .map((slug) => getBugCase(slug))
    .filter((related): related is BugCase => related !== undefined);
}
