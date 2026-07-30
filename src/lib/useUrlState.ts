// URL-persisted filter and sort state.
// One responsibility: read and write the index view state to the URL query
// string so filtered views are shareable links. See BUILD_PLAN Phase 4.

import { useCallback, useEffect, useState } from 'react';

export type SortKey =
  | 'task_name'
  | 'task_pattern'
  | 'industry_tags'
  | 'model'
  | 'input_tokens_median'
  | 'output_tokens_median'
  | 'cost_per_unit'
  | 'sample_size'
  | 'measurement_date';

export type SortDir = 'asc' | 'desc';

export interface FilterState {
  pattern: string; // '' = all
  industries: string[]; // [] = all
  provider: string; // '' = all
}

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

export interface IndexViewState {
  filters: FilterState;
  sort: SortState;
  selectedModel: string; // model slug
  volume: number; // units per month, 0 = not shown
}

const DEFAULT_STATE: IndexViewState = {
  filters: { pattern: '', industries: [], provider: '' },
  sort: { key: 'task_name', dir: 'asc' },
  selectedModel: '',
  volume: 0,
};

// Whitelists for untrusted URL params. Anything outside these falls back to
// the default rather than flowing into state.
const SORT_KEYS: readonly SortKey[] = [
  'task_name',
  'task_pattern',
  'industry_tags',
  'model',
  'input_tokens_median',
  'output_tokens_median',
  'cost_per_unit',
  'sample_size',
  'measurement_date',
];
const SORT_DIRS: readonly SortDir[] = ['asc', 'desc'];

function parseSortKey(raw: string | null): SortKey {
  return SORT_KEYS.includes(raw as SortKey)
    ? (raw as SortKey)
    : DEFAULT_STATE.sort.key;
}

function parseSortDir(raw: string | null): SortDir {
  return SORT_DIRS.includes(raw as SortDir)
    ? (raw as SortDir)
    : DEFAULT_STATE.sort.dir;
}

function parseVolume(raw: string | null): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

// Exported so tests exercise this exact logic (not a re-implemented copy).
export function parseState(search: string): IndexViewState {
  const params = new URLSearchParams(search);
  return {
    filters: {
      pattern: params.get('pattern') ?? '',
      industries: params.getAll('industry'),
      provider: params.get('provider') ?? '',
    },
    sort: {
      key: parseSortKey(params.get('sort')),
      dir: parseSortDir(params.get('dir')),
    },
    selectedModel: params.get('model') ?? '',
    volume: parseVolume(params.get('volume')),
  };
}

// Exported so tests exercise this exact logic.
export function serializeState(state: IndexViewState): string {
  const params = new URLSearchParams();
  if (state.filters.pattern) params.set('pattern', state.filters.pattern);
  for (const ind of state.filters.industries) {
    params.append('industry', ind);
  }
  if (state.filters.provider) params.set('provider', state.filters.provider);
  params.set('sort', state.sort.key);
  params.set('dir', state.sort.dir);
  if (state.selectedModel) params.set('model', state.selectedModel);
  if (state.volume > 0) params.set('volume', String(state.volume));
  return params.toString();
}

export function useUrlState(): [
  IndexViewState,
  (updates: Partial<IndexViewState>) => void,
  () => void,
] {
  const [state, setState] = useState<IndexViewState>(() =>
    parseState(typeof window !== 'undefined' ? window.location.search : ''),
  );

  useEffect(() => {
    const qs = serializeState(state);
    const newUrl = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [state]);

  const update = useCallback((updates: Partial<IndexViewState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      filters: updates.filters
        ? { ...prev.filters, ...updates.filters }
        : prev.filters,
      sort: updates.sort ?? prev.sort,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return [state, update, reset];
}

export { DEFAULT_STATE };
