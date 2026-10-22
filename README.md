# React / Next.js Bug Fix Lab

An interactive debugging lab for common frontend issues. Each case walks through
the same workflow — **reproduce → investigate → identify the root cause → fix →
verify** — with a working demonstration you can trigger yourself.

This is an educational portfolio project. The cases were built for this lab to
demonstrate a debugging approach; they are not client projects or real incidents.

> **Screenshots:** placeholders — replace with real captures.
>
> `![Homepage](docs/screenshots/home.png)`
> `![Case detail page](docs/screenshots/case-detail.png)`
> `![Mobile layout](docs/screenshots/mobile.png)`

## Features

- **Six debugging cases** covering CSS, React state, data fetching, forms,
  Next.js routing/rendering, and re-renders.
- **Interactive demos** with broken/fixed toggles for every case.
- **Consistent case workspace:** symptoms, reproduction steps, investigation,
  root cause, fix explanation, before/after code, and a verification checklist.
- **Code examples** with lightweight, dependency-free syntax highlighting and a
  working copy button (with screen-reader feedback).
- **Filterable case library** on the homepage.
- **Responsive, accessible UI:** semantic HTML, keyboard focus states, a skip
  link, a mobile navigation menu, and `prefers-reduced-motion` support.
- **Light and dark themes** with a navbar toggle, saved preference, OS-preference
  fallback, and no flash of the wrong theme on load.

## Theming

All colours come from semantic design tokens in `src/app/globals.css`
(`--canvas`, `--surface`, `--fg`, `--muted`, `--line`, `--accent`,
`--success`/`--warning`/`--danger`/`--info`, `--code-*`, …). Each token has a
light value on `:root` and a dark value on `[data-theme="dark"]`, and is exposed
to Tailwind as a utility (`bg-surface`, `text-muted`, `border-line`, …).
Components use these utilities instead of raw palette colours. Shared class
presets (buttons, inputs, tones) live in `src/lib/ui.ts`.

How the preference works:

1. An inline script in `<head>` (`src/lib/theme.ts`) runs before first paint.
   It applies the saved choice from `localStorage` (`bug-fix-lab-theme`), or the
   OS `prefers-color-scheme` setting when nothing is saved.
2. `ThemeToggle` reads the current theme with `useSyncExternalStore`, so the
   server and client render match and there is no hydration warning. Its icon is
   switched with CSS, so the correct icon shows before hydration.
3. Toggling saves the choice. Until the visitor chooses, the site follows OS
   theme changes live.
4. Code panels use an editor surface that stays dark in both themes.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components enabled)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- [lucide-react](https://lucide.dev) icons

There is no backend, database, or authentication. No extra runtime dependencies
were added beyond the original project.

## Getting started

Requirements: Node.js 20.9 or later and npm.

```bash
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:3000
npm run lint      # run ESLint
npm run build     # create a production build
npm run start     # serve the production build
```

## Project structure

```text
src/
├── app/
│   ├── layout.tsx                 # Root layout: navbar, footer, metadata
│   ├── page.tsx                   # Homepage (hero, library, workflow, about)
│   ├── not-found.tsx              # 404 page
│   ├── globals.css                # Tailwind import, tokens, focus + motion rules
│   └── bug-cases/[slug]/page.tsx  # Case workspace (statically generated)
├── components/
│   ├── layout/                    # Navbar, nav links, theme toggle, footer
│   ├── home/hero-preview.tsx      # Debugging-workflow product preview
│   ├── bug-cases/                 # Case card, filterable library, checklist,
│   │                              # responsive overflow demo
│   ├── demos/                     # One client component per case demo,
│   │                              # shared segmented control, slug → demo map
│   └── ui/                        # Code block, copy button, badges, status panel
└── lib/
    ├── bug-cases.ts               # Typed case content + lookup helpers
    ├── highlight.ts               # Small TS/TSX/CSS tokenizer for code blocks
    ├── theme.ts                   # Theme storage key + pre-paint init script
    ├── ui.ts                      # Shared class presets on design tokens
    └── site.ts                    # Site name, GitHub profile, repository URL
```

Pages and content are Server Components. `"use client"` is only used for
components that need browser state: the nav links, the case filter, the demos,
the copy button, and the verification checklist.

## The debugging cases

| # | Case | Demo | What it demonstrates |
|---|------|------|----------------------|
| 1 | Responsive Layout Overflow | Live | A fixed `440px` card overflows a phone viewport. The demo measures the real `scrollWidth` vs `clientWidth` and compares broken/fixed side by side. |
| 2 | React State Update Bug | Live | Calling `setCount(count + 1)` three times adds 1, because each call reads the same render snapshot. Updater functions fix it. |
| 3 | API Loading and Error States | Simulated | Separate `loading`/`data` flags leave a spinner stuck on error and a blank panel on empty results. The fix uses a discriminated-union request state with retry and stale-response protection. |
| 4 | Form Validation Bug | Live | Incomplete validation accepts empty fields and `alex@`. The fix adds required/format rules, inline errors linked with `aria-describedby`, and focus on the first invalid field. |
| 5 | Next.js Routing and Rendering | Simulated | Reading `params.slug` without awaiting the `params` Promise makes every dynamic route 404, plus where to put the `"use client"` boundary. |
| 6 | Unnecessary React Re-renders | Live | Commit counters show that `memo()` alone does nothing when an inline callback is passed, and that `memo()` + `useCallback` skips row renders. |

### What is simulated

- **API Loading and Error States** makes no network request. A local mock
  resolves or rejects after a fixed 800ms delay so each state can be seen. The
  outcome depends only on the selected scenario and attempt number.
- **Next.js Routing and Rendering** models route resolution and component
  boundaries in the browser. It does not render or break any real route. The
  case page itself is the real implementation of the fixed pattern, and the
  demo links to real routes for comparison.
- **Unnecessary React Re-renders** counts committed renders. It illustrates
  render behaviour and is not a performance benchmark. The React Compiler is
  not enabled in this project; if it were, it would memoize automatically and
  change the demo's results.

## Configuration

Edit `src/lib/site.ts`:

- `githubProfileUrl` — linked from the navbar and footer.
- `repositoryUrl` — `null` by default. Set it to the public repository URL to
  show a **View source code** button in the hero.

## Status

- Lint and production build run locally.
- No automated test suite is included yet.
- Not yet deployed. Add the deployment URL here once it is live.
