// Entry table: the full-width rate card table.
// One responsibility: render rows and handle column header sort clicks.
// See docs/DESIGN.md "Concept: the digital rate card".

import type { PublicEntryRow } from '../lib/database.types';
import type { SortKey, SortDir } from '../lib/useUrlState';
import { costPerUnitUsd } from '../lib/cost';
import type { ModelPricing } from '../lib/pricing';
import { getAsOfLabel } from '../lib/pricing';
import { useCountUp } from '../lib/countUp';

export interface PricedEntry extends PublicEntryRow {
  costPerUnit: number;
}

interface Column {
  key: SortKey;
  label: string;
  numeric: boolean;
}

const COLUMNS: Column[] = [
  { key: 'task_name', label: 'Task', numeric: false },
  { key: 'task_pattern', label: 'Pattern', numeric: false },
  { key: 'industry_tags', label: 'Industry', numeric: false },
  { key: 'model', label: 'Model', numeric: false },
  { key: 'input_tokens_median', label: 'Tokens in (median)', numeric: true },
  { key: 'output_tokens_median', label: 'Tokens out (median)', numeric: true },
  { key: 'cost_per_unit', label: 'Cost per unit', numeric: true },
  { key: 'sample_size', label: 'Sample', numeric: true },
  { key: 'measurement_date', label: 'Measured', numeric: false },
];

interface Props {
  entries: PricedEntry[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  selectedModel: ModelPricing;
  volume: number;
  asOfLabel: string;
}

function SortArrow({ dir }: { dir: SortDir | null }) {
  if (!dir) return null;
  return (
    <span className="ml-1 text-xs" aria-hidden="true">
      {dir === 'asc' ? '\u2191' : '\u2193'}
    </span>
  );
}

function CostCell({
  costPerUnit,
  volume,
}: {
  costPerUnit: number;
  volume: number;
}) {
  const animated = useCountUp(costPerUnit, { decimals: 4 });
  const monthly = volume > 0 ? costPerUnit * volume : null;
  const animatedMonthly = useCountUp(monthly ?? 0, {
    decimals: 2,
    enabled: monthly !== null,
  });

  return (
    <td className="figure px-3 py-2 text-right">
      <div>${animated}</div>
      {monthly !== null && (
        <div className="text-xs text-ink">
          ${animatedMonthly}/mo
        </div>
      )}
    </td>
  );
}

export default function EntryTable({
  entries,
  sortKey,
  sortDir,
  onSort,
  volume,
  asOfLabel,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-rule">
            {COLUMNS.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`cursor-pointer select-none border-b border-rule px-3 py-2 font-semibold ${
                    col.numeric ? 'text-right' : 'text-left'
                  } ${isSorted ? 'text-figure' : 'text-ink'}`}
                  onClick={() => onSort(col.key)}
                  aria-sort={
                    isSorted
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.label}
                  <SortArrow dir={isSorted ? sortDir : null} />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-rule hover:bg-rule/30">
              <td className="px-3 py-2">
                <a
                  href={`/entry?id=${encodeURIComponent(entry.id)}`}
                  className="text-accent underline"
                >
                  {entry.task_name}
                </a>
              </td>
              <td className="px-3 py-2">
                {entry.task_pattern.replace(/_/g, ' ')}
              </td>
              <td className="px-3 py-2">
                {entry.industry_tags.join(', ').replace(/_/g, ' ')}
              </td>
              <td className="px-3 py-2">{entry.model}</td>
              <td className="figure px-3 py-2 text-right">
                {entry.input_tokens_median.toLocaleString()}
              </td>
              <td className="figure px-3 py-2 text-right">
                {entry.output_tokens_median.toLocaleString()}
              </td>
              <CostCell costPerUnit={entry.costPerUnit} volume={volume} />
              <td className="figure px-3 py-2 text-right">
                {entry.sample_size}
              </td>
              <td className="px-3 py-2">{entry.measurement_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 px-3 text-xs text-ink">
        All costs at {asOfLabel} prices. Tokens are summed across all calls per
        task unit.
      </p>
    </div>
  );
}

// Helper to compute priced entries from raw entries and a selected model.
export function priceEntries(
  entries: PublicEntryRow[],
  model: ModelPricing,
): PricedEntry[] {
  return entries.map((entry) => ({
    ...entry,
    costPerUnit: costPerUnitUsd(
      entry.input_tokens_median,
      entry.output_tokens_median,
      { input: model.input, output: model.output },
    ),
  }));
}

export { getAsOfLabel };
