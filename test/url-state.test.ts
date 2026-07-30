import { describe, it, expect } from 'vitest';
import {
  parseState,
  serializeState,
  DEFAULT_STATE,
  type IndexViewState,
} from '../src/lib/useUrlState';

// Round-trip tests against the real parse/serialize exports from
// src/lib/useUrlState.ts (not a re-implemented copy), so these tests fail if
// the production logic drifts. Validation of invalid params lives in
// url-state-validation.test.ts.

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
    const parsed = parseState(serializeState(state));
    expect(parsed.filters.pattern).toBe('extraction');
  });

  it('round-trips provider filter', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      filters: { ...DEFAULT_STATE.filters, provider: 'openai' },
    };
    const parsed = parseState(serializeState(state));
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
    const parsed = parseState(serializeState(state));
    expect(parsed.filters.industries).toEqual(['accounting', 'finance', 'legal']);
  });

  it('round-trips selected model', () => {
    const state: IndexViewState = { ...DEFAULT_STATE, selectedModel: 'gpt-5' };
    const parsed = parseState(serializeState(state));
    expect(parsed.selectedModel).toBe('gpt-5');
  });

  it('round-trips volume', () => {
    const state: IndexViewState = { ...DEFAULT_STATE, volume: 10000 };
    const parsed = parseState(serializeState(state));
    expect(parsed.volume).toBe(10000);
  });

  it('round-trips sort key and direction', () => {
    const state: IndexViewState = {
      ...DEFAULT_STATE,
      sort: { key: 'sample_size', dir: 'desc' },
    };
    const parsed = parseState(serializeState(state));
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
    expect(parseState(serializeState(state))).toEqual(state);
  });

  it('parses empty query string as defaults', () => {
    expect(parseState('')).toEqual(DEFAULT_STATE);
  });
});
