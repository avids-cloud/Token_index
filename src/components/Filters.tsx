// Filters: left rail on desktop, top sheet on mobile.
// One responsibility: collect filter selections from the user.
// See BUILD_PLAN Phase 4: filters URL-persisted so filtered views are shareable.

import { TASK_PATTERNS, INDUSTRY_TAGS } from '../lib/entry-schema';

interface Props {
  pattern: string;
  industries: string[];
  provider: string;
  providers: string[];
  onPatternChange: (pattern: string) => void;
  onIndustryToggle: (industry: string) => void;
  onProviderChange: (provider: string) => void;
  onClear: () => void;
  activeCount: number;
}

export default function Filters({
  pattern,
  industries,
  provider,
  providers,
  onPatternChange,
  onIndustryToggle,
  onProviderChange,
  onClear,
  activeCount,
}: Props) {
  return (
    <aside
      className="border border-rule bg-paper"
      aria-label="Filter entries"
    >
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <h2 className="m-0 text-sm font-semibold tracking-tight">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            className="text-xs text-accent underline focus:outline-none"
            onClick={onClear}
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        {/* Task pattern */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-pattern"
            className="text-xs font-semibold tracking-tight"
          >
            Task pattern
          </label>
          <select
            id="filter-pattern"
            className="border border-rule bg-paper px-2 py-1.5 text-sm font-sans focus:outline-none"
            value={pattern}
            onChange={(e) => onPatternChange(e.currentTarget.value)}
          >
            <option value="">All patterns</option>
            {TASK_PATTERNS.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Provider */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-provider"
            className="text-xs font-semibold tracking-tight"
          >
            Provider
          </label>
          <select
            id="filter-provider"
            className="border border-rule bg-paper px-2 py-1.5 text-sm font-sans focus:outline-none"
            value={provider}
            onChange={(e) => onProviderChange(e.currentTarget.value)}
          >
            <option value="">All providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Industry tags */}
        <fieldset className="flex flex-col gap-1.5 border-0 p-0">
          <legend className="mb-1 text-xs font-semibold tracking-tight">
            Industry
          </legend>
          {INDUSTRY_TAGS.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                className="focus:outline-none"
                checked={industries.includes(tag)}
                onChange={() => onIndustryToggle(tag)}
              />
              {tag.replace(/_/g, ' ')}
            </label>
          ))}
        </fieldset>
      </div>
    </aside>
  );
}
