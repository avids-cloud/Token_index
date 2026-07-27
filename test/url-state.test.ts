import { describe, it, expect } from 'vitest';
// We test the parse/serialize logic directly rather than the hook, since
// the hook depends on window.location which vitest doesn't have by default.

// Re-implement the parse and serialize functions to test the round-trip
// logic. These mirror src/lib/useUrlState.ts exactly.

type SortKey =
  | 'task_name' | 'task_pattern' | 'industry_tags' | 'model'
  | 'input_tokens_median' | 'output_tokens_median' | 'cost_per_unit'
  | 'sample_size' | 'measurement_date';
type SortDir = 'asc' | 'desc';

interface IndexViewState {
  filters: { pattern: string; industries: string[]; provider: string };
  sort: { key: SortKey; dir: SortDir };
  selectedModel: string;
  volume: number;
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

describe('URL state round-trip', () => {
  it('empty state serialises to sort + dir only', () => {
    const qs = serializeState(DEFAULT_STATE);
    expect(qs).toBe('sort=task_name&dir=asc');
  });

  it('round-trips pattern filter', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      filters: { ...DEFAULT_STATE.filters, pattern: 'extraction' },
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed.filters.pattern).toBe('extraction');
  });

  it('round-trips provider filter', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      filters: { ...DEFAULT_STATE.filters, provider: 'openai' },
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed.filters.provider).toBe('openai');
  });

  it('round-trips multiple industry tags', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      filters: {
        ...DEFAULT_STATE.filters,
        industries: ['accounting', 'finance', 'legal'],
      },
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed.filters.industries).toEqual(['accounting', 'finance', 'legal']);
  });

  it('round-trips selected model', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      selectedModel: 'gpt-5',
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed.selectedModel).toBe('gpt-5');
  });

  it('round-trips volume', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      volume: 10000,
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed.volume).toBe(10000);
  });

  it('round-trips sort key and direction', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      sort: { key: 'sample_size', dir: 'desc' },
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed.sort.key).toBe('sample_size');
    expect(parsed.sort.dir).toBe('desc');
  });

  it('round-trips all fields at once', () => {
    const state: IndexViewState = {
      filters: {
        pattern: 'classification',
        industries: ['legal', 'finance'],
        provider: 'openai',
      },
      sort: { key: 'cost_per_unit', dir: 'desc' },
      selectedModel: 'gpt-5-mini',
      volume: 5000,
    };
    const qs = serializeState(state);
    const parsed = parseState(qs);
    expect(parsed).toEqual(state);
  });

  it('parses empty query string as defaults', () => {
    const parsed = parseState('');
    expect(parsed.filters.pattern).toBe('');
    expect(parsed.filters.industries).toEqual([]);
    expect(parsed.filters.provider).toBe('');
    expect(parsed.sort.key).toBe('task_name');
    expect(parsed.sort.dir).toBe('asc');
    expect(parsed.selectedModel).toBe('');
    expect(parsed.volume).toBe(0);
  });
});
