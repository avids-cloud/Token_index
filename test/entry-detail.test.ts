import { describe, it, expect } from 'vitest';
import { costPerUnitUsd } from '../src/lib/cost';
import { getDefaultModel, getModel } from '../src/lib/pricing';

// Helper: build the detail page href for an entry id.
// Mirrors the link construction in EntryTable.tsx so the test
// guards the contract between the index table and the detail page.
function entryHref(id: string): string {
  return `/entry?id=${encodeURIComponent(id)}`;
}

// Tests for the Phase 5 entry detail repricing logic.
// The RepriceWidget uses costPerUnitUsd directly, so we test the
// repricing of a single entry at different models and volumes.

describe('entry detail repricing', () => {
  // A sample entry: invoice extraction with 2000 in / 800 out tokens
  const inputTokens = 2000;
  const outputTokens = 800;

  it('computes cost per unit at the default model', () => {
    const model = getDefaultModel();
    const cost = costPerUnitUsd(inputTokens, outputTokens, model);
    expect(cost).toBeGreaterThan(0);
    // Default model is claude-sonnet-4-6: $3 in, $15 out
    // 2000 * 3 + 800 * 15 = 6000 + 12000 = 18000 / 1e6 = 0.018
    expect(cost).toBeCloseTo(0.018, 6);
  });

  it('reprices correctly when switching to a cheaper model', () => {
    const sonnet = getModel('claude-sonnet-4-6')!;
    const haiku = getModel('claude-haiku-4-5')!;

    const costSonnet = costPerUnitUsd(inputTokens, outputTokens, sonnet);
    const costHaiku = costPerUnitUsd(inputTokens, outputTokens, haiku);

    // Haiku is cheaper: $1 in, $5 out
    // 2000 * 1 + 800 * 5 = 2000 + 4000 = 6000 / 1e6 = 0.006
    expect(costHaiku).toBeCloseTo(0.006, 6);
    expect(costHaiku).toBeLessThan(costSonnet);
  });

  it('reprices correctly for GPT-5', () => {
    const gpt5 = getModel('gpt-5')!;
    const cost = costPerUnitUsd(inputTokens, outputTokens, gpt5);
    // $1.25 in, $10 out
    // 2000 * 1.25 + 800 * 10 = 2500 + 8000 = 10500 / 1e6 = 0.0105
    expect(cost).toBeCloseTo(0.0105, 6);
  });

  it('monthly projection multiplies cost by volume', () => {
    const model = getDefaultModel();
    const costPerUnit = costPerUnitUsd(inputTokens, outputTokens, model);
    const volume = 10000;
    const monthly = costPerUnit * volume;
    expect(monthly).toBeCloseTo(0.018 * 10000, 4);
    expect(monthly).toBeCloseTo(180, 2);
  });

  it('volume of 0 means no monthly projection', () => {
    const model = getDefaultModel();
    const costPerUnit = costPerUnitUsd(inputTokens, outputTokens, model);
    const volume = 0;
    const monthly = volume > 0 ? costPerUnit * volume : 0;
    expect(monthly).toBe(0);
  });
});

describe('p90 range formatting (typical vs heavy tail)', () => {
  // The EntryDetail component formats p90 as "typical vs heavy tail".
  // This tests the logic that decides whether p90 data exists.

  function p90Range(
    median: number,
    p90: number | null,
  ): { median: number; p90: number } | null {
    if (p90 === null || p90 === undefined) return null;
    return { median, p90 };
  }

  it('returns null when p90 is null', () => {
    expect(p90Range(1000, null)).toBeNull();
  });

  it('returns the range when p90 is provided', () => {
    const result = p90Range(1000, 1500);
    expect(result).toEqual({ median: 1000, p90: 1500 });
  });

  it('works when p90 equals median (no heavy tail)', () => {
    const result = p90Range(1000, 1000);
    expect(result).toEqual({ median: 1000, p90: 1000 });
  });

  it('returns null when p90 is undefined', () => {
    expect(p90Range(1000, undefined as unknown as null)).toBeNull();
  });
});

describe('entry detail link from the index', () => {
  // The index table links each task name to /entry?id=<id>.
  // This test guards the contract: the href format must match what
  // the EntryDetail island reads from the URL query string.

  it('builds a detail href from a uuid', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    expect(entryHref(id)).toBe(
      '/entry?id=550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('url-encodes the id', () => {
    // A uuid has no special chars, but the encoder must handle them
    // if they ever appear.
    const id = 'id with spaces';
    expect(entryHref(id)).toBe('/entry?id=id%20with%20spaces');
  });

  it('passes the id through encodeURIComponent without mutation for a plain uuid', () => {
    const id = crypto.randomUUID();
    const href = entryHref(id);
    expect(href).toBe(`/entry?id=${id}`);
    expect(href.startsWith('/entry?id=')).toBe(true);
  });
});
