// Pure data operations for the index viewer: filtering, sorting.
// Extracted from EntryIndex so they can be tested without importing
// the Supabase client (which throws without env vars).
// One responsibility: filter and sort entry arrays.

import type { PublicEntryRow } from './database.types';
import type { SortKey, SortDir } from './useUrlState';

export function applyFiltersAndSort(
  entries: PublicEntryRow[],
  filters: { pattern: string; industries: string[]; provider: string },
  sort: { key: SortKey; dir: SortDir },
): PublicEntryRow[] {
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
        // cost_per_unit is computed at display time; compare via stored tokens
        // using default model pricing as a stable proxy.
        cmp =
          a.input_tokens_median + a.output_tokens_median -
          (b.input_tokens_median + b.output_tokens_median);
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
