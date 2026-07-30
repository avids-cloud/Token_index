import { describe, it, expect } from 'vitest';
import { parseState, serializeState, DEFAULT_STATE } from '../src/lib/useUrlState';

// URL params arrive as untrusted strings from pasted or hand-edited links.
// These tests pin that invalid values fall back to safe defaults rather than
// flowing into state as nonsense.

describe('parseState validates untrusted URL params', () => {
  it('falls back to the default sort key for an unknown value', () => {
    const parsed = parseState('?sort=evil');
    expect(parsed.sort.key).toBe(DEFAULT_STATE.sort.key);
  });

  it('falls back to the default sort direction for an unknown value', () => {
    const parsed = parseState('?dir=sideways');
    expect(parsed.sort.dir).toBe(DEFAULT_STATE.sort.dir);
  });

  it('keeps a valid sort key', () => {
    expect(parseState('?sort=sample_size').sort.key).toBe('sample_size');
  });

  it('keeps a valid sort direction', () => {
    expect(parseState('?dir=desc').sort.dir).toBe('desc');
  });

  it('treats a non-numeric volume as not set', () => {
    const parsed = parseState('?volume=abc');
    expect(parsed.volume).toBe(0);
  });

  it('treats a negative volume as not set', () => {
    const parsed = parseState('?volume=-50');
    expect(parsed.volume).toBe(0);
  });

  it('keeps a valid positive integer volume', () => {
    expect(parseState('?volume=10000').volume).toBe(10000);
  });

  it('round-trips a fully valid state', () => {
    const qs = serializeState({
      filters: { pattern: 'extraction', industries: ['legal'], provider: 'openai' },
      sort: { key: 'cost_per_unit', dir: 'desc' },
      selectedModel: 'gpt-5',
      volume: 5000,
    });
    const parsed = parseState(qs);
    expect(parsed.sort.key).toBe('cost_per_unit');
    expect(parsed.sort.dir).toBe('desc');
    expect(parsed.volume).toBe(5000);
    expect(parsed.filters.pattern).toBe('extraction');
    expect(parsed.filters.industries).toEqual(['legal']);
    expect(parsed.filters.provider).toBe('openai');
    expect(parsed.selectedModel).toBe('gpt-5');
  });

  it('parses an empty query string as defaults', () => {
    expect(parseState('')).toEqual(DEFAULT_STATE);
  });
});
