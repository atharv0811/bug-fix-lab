"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import { bugCases, caseAreas, type CaseArea } from "@/lib/bug-cases";
import BugCaseCard from "@/components/bug-cases/bug-case-card";

type Filter = "All" | CaseArea;

const filters: Filter[] = ["All", ...caseAreas];

export function CaseLibrary() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const visibleCases =
    activeFilter === "All"
      ? bugCases
      : bugCases.filter((bugCase) => bugCase.area === activeFilter);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter cases by area"
        className="mb-6 flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const count =
            filter === "All"
              ? bugCases.length
              : bugCases.filter((bugCase) => bugCase.area === filter).length;
          const isActive = filter === activeFilter;

          return (
            <button
              key={filter}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {filter}
              <span
                className={`rounded px-1.5 text-xs tabular-nums ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {visibleCases.length} of {bugCases.length} cases
      </p>

      {visibleCases.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {visibleCases.map((bugCase) => (
            <li key={bugCase.slug}>
              <BugCaseCard
                bugCase={bugCase}
                index={bugCases.indexOf(bugCase) + 1}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <SearchX size={22} className="text-slate-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-slate-900">
            No cases in this area yet
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("All")}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Show all cases
          </button>
        </div>
      )}
    </div>
  );
}
