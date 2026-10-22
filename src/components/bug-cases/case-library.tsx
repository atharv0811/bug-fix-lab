"use client";

import { useId, useState } from "react";
import {
  Atom,
  Database,
  LayoutGrid,
  Layers,
  Route,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { bugCases, caseAreas, type BugCase, type CaseArea, type Difficulty } from "@/lib/bug-cases";
import BugCaseCard from "@/components/bug-cases/bug-case-card";
import { SelectField } from "@/components/ui/select-field";
import { buttonClass } from "@/lib/ui";

type AreaFilter = "All" | CaseArea;
type DifficultyFilter = "Any" | Difficulty;

const areaIcons: Record<AreaFilter, LucideIcon> = {
  All: Layers,
  "Layout & CSS": LayoutGrid,
  React: Atom,
  "Data & Forms": Database,
  "Next.js": Route,
};

const areaFilters: AreaFilter[] = ["All", ...caseAreas];
const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

type Filters = { query: string; area: AreaFilter; difficulty: DifficultyFilter };

function matches(bugCase: BugCase, { query, area, difficulty }: Filters) {
  const needle = query.trim().toLowerCase();
  const matchesQuery =
    needle === "" ||
    bugCase.title.toLowerCase().includes(needle) ||
    bugCase.description.toLowerCase().includes(needle);
  const matchesArea = area === "All" || bugCase.area === area;
  const matchesDifficulty = difficulty === "Any" || bugCase.difficulty === difficulty;
  return matchesQuery && matchesArea && matchesDifficulty;
}

export function CaseLibrary() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AreaFilter>("All");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("Any");
  const searchId = useId();
  const difficultyId = useId();

  const filters: Filters = { query, area, difficulty };
  const visibleCases = bugCases.filter((bugCase) => matches(bugCase, filters));
  const hasFilters = query.trim() !== "" || area !== "All" || difficulty !== "Any";

  // Faceted counts: how many cases each area would show with the other filters applied.
  const areaCount = (value: AreaFilter) =>
    bugCases.filter((bugCase) => matches(bugCase, { ...filters, area: value })).length;

  function clearFilters() {
    setQuery("");
    setArea("All");
    setDifficulty("Any");
  }

  return (
    <div>
      <div className="mb-6 rounded-xl border border-line bg-surface shadow-card">
        <div className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor={searchId} className="sr-only">
              Search cases
            </label>
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or description…"
              autoComplete="off"
              className="h-9 w-full rounded-lg border border-transparent bg-surface-2 pl-9 pr-9 text-sm text-fg placeholder:text-subtle transition-[border-color,box-shadow,background-color] hover:border-line focus:border-accent focus:bg-surface focus:outline-none focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-fg"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={difficultyId} className="sr-only">
              Difficulty
            </label>
            <SelectField
              id={difficultyId}
              icon={SlidersHorizontal}
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}
              className="w-full sm:w-44"
            >
              <option value="Any">All difficulties</option>
              {difficulties.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line px-2 py-2 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by area" className="flex flex-wrap gap-1">
            {areaFilters.map((value) => {
              const Icon = areaIcons[value];
              const count = areaCount(value);
              const selected = value === area;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setArea(value)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium transition-[color,background-color,border-color] duration-150 motion-reduce:transition-none ${
                    selected
                      ? "border-accent-line bg-accent-soft text-accent-text"
                      : "border-transparent text-muted hover:bg-surface-3 hover:text-fg"
                  }`}
                >
                  <Icon size={14} className={selected ? "" : "opacity-70"} aria-hidden="true" />
                  {value === "All" ? "All areas" : value}
                  <span
                    className={`min-w-5 rounded px-1 text-center font-mono text-[11px] tabular-nums ${
                      selected ? "bg-accent/15 text-accent-text" : "bg-surface-3 text-subtle"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 px-1 lg:justify-end">
            <p className="text-[13px] text-muted" role="status" aria-live="polite">
              <span className="font-semibold text-fg">{visibleCases.length}</span> of {bugCases.length} cases
            </p>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className={buttonClass({ variant: "ghost", size: "sm" })}
            >
              <X size={13} aria-hidden="true" />
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {visibleCases.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {visibleCases.map((bugCase) => (
            <li key={bugCase.slug}>
              <BugCaseCard bugCase={bugCase} index={bugCases.indexOf(bugCase) + 1} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-subtle">
            <SearchX size={20} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-fg">No cases match these filters</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {query.trim()
              ? `Nothing matches “${query.trim()}”${area !== "All" ? ` in ${area}` : ""}${
                  difficulty !== "Any" ? ` at ${difficulty} level` : ""
                }.`
              : "Try a different area or difficulty."}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className={buttonClass({ variant: "secondary", size: "sm", className: "mt-5" })}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
