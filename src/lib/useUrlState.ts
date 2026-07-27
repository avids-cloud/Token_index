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

function parseState(search: string): IndexViewState {
  const params = new URLSearchParams(search);
  return {
    filters: {
      pattern: params.get('pattern') ?? '',
      industries: params.getAll('industry'),
      provider: params.get('provider') ?? '',
    },
    sort: {
      key: (params.get('sort') as SortKey) ?? DEFAULT_STATE.sort.key,
      dir: (params.get('dir') as SortDir) ?? DEFAULT_STATE.sort.dir,
    },
    selectedModel: params.get('model') ?? '',
    volume: params.get('volume') ? parseInt(params.get('volume')!, 10) : 0,
  };
}

function serializeState(state: IndexViewState): string {
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
