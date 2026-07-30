// Pure data operations for the index viewer: filtering, sorting.
// Extracted from EntryIndex so they can be tested without importing
// the Supabase client (which throws without env vars).
// One responsibility: filter and sort entry arrays.

import type { PublicEntryRow } from './database.types';
import type { ModelPricing } from './pricing';
import { getDefaultModel } from './pricing';
import { costPerUnitUsd } from './cost';
import type { SortKey, SortDir } from './useUrlState';

// An entry that may already carry a computed costPerUnit (added by
// priceEntries in EntryTable). Sorting by cost uses it when present.
export type SortableEntry = PublicEntryRow & { costPerUnit?: number };

export function applyFiltersAndSort(
  entries: SortableEntry[],
  filters: { pattern: string; industries: string[]; provider: string },
  sort: { key: SortKey; dir: SortDir },
  price: ModelPricing = getDefaultModel(),
): SortableEntry[] {
  let result = entries;

  if (filters.pattern) {
    result = result.filter((e) => e.task_pattern === filters.pattern);
  }
  if (filters.provider) {
    result = result.filter((e) => e.provider === filters.provider);
  }
  if (filters.industries.length > 0) {
    result = result.filter((e) =>
      filters.industries.some((ind) => e.industry_tags.includes(ind)),
    );
  }

  // Cost per unit is computed from stored tokens at the selected model's
  // rates. Use the pre-computed value when the row has one; otherwise derive
  // it here so cost ordering is always by real dollars, never a token proxy.
  // Sorting by a token sum is wrong whenever input and output prices differ
  // (they always do: output tokens cost more).
  const costOf = (e: SortableEntry): number =>
    e.costPerUnit ??
    costPerUnitUsd(e.input_tokens_median, e.output_tokens_median, {
      input: price.input,
      output: price.output,
    });

  const dir = sort.dir === 'asc' ? 1 : -1;
  const sorted = [...result].sort((a, b) => {
    let cmp: number;
    switch (sort.key) {
      case 'task_name':
        cmp = a.task_name.localeCompare(b.task_name);
        break;
      case 'task_pattern':
        cmp = a.task_pattern.localeCompare(b.task_pattern);
        break;
      case 'model':
        cmp = a.model.localeCompare(b.model);
        break;
      case 'industry_tags':
        cmp = a.industry_tags.join(',').localeCompare(b.industry_tags.join(','));
        break;
      case 'measurement_date':
        cmp = a.measurement_date.localeCompare(b.measurement_date);
        break;
      case 'input_tokens_median':
        cmp = a.input_tokens_median - b.input_tokens_median;
        break;
      case 'output_tokens_median':
        cmp = a.output_tokens_median - b.output_tokens_median;
        break;
      case 'cost_per_unit':
        cmp = costOf(a) - costOf(b);
        break;
      case 'sample_size':
        cmp = a.sample_size - b.sample_size;
        break;
      default:
        cmp = 0;
    }
    return cmp * dir;
  });

  return sorted;
}
