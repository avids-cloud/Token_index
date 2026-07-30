import { describe, it, expect } from 'vitest';
import { applyFiltersAndSort, type SortableEntry } from '../src/lib/entry-ops';
import { priceEntries } from '../src/components/EntryTable';
import { getModel } from '../src/lib/pricing';
import type { PublicEntryRow } from '../src/lib/database.types';

// Regression tests for the cost-per-unit sort bug: sorting by cost previously
// used a token-sum proxy (input + output), which misorders rows whenever input
// and output token prices differ. These tests prove the fix sorts by the real
// computed dollar cost at the selected model.

function mockEntry(overrides: Partial<PublicEntryRow>): PublicEntryRow {
  return {
    id: crypto.randomUUID(),
    task_name: 'Test task',
    task_pattern: 'extraction',
    industry_tags: ['accounting'],
    task_unit: 'per invoice',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    prompt_strategy: 'zero_shot',
    calls_per_unit: 1,
    includes_retries: false,
    input_tokens_median: 1000,
    output_tokens_median: 500,
    input_tokens_p90: null,
    output_tokens_p90: null,
    sample_size: 50,
    measurement_date: '2026-01-10',
    methodology:
      'Measured from the billing dashboard over 50 invoice processing runs',
    source_url: null,
    submitter_display: null,
    created_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

describe('cost-per-unit sort uses real computed cost, not a token-sum proxy', () => {
  // Claude Sonnet 4.6: input $3/M, output $15/M. Output tokens cost 5x input,
  // so a small number of output tokens outweighs a large number of input tokens.
  const model = getModel('claude-sonnet-4-6')!;

  it('orders by computed cost, not input+output token sum', () => {
    // Entry A: heavy on cheap input tokens, light on expensive output tokens.
    //   cost = (10000*3 + 100*15)/1e6 = (30000 + 1500)/1e6 = 0.0315
    //   token sum = 10100
    const cheapHeavyInput = mockEntry({
      task_name: 'A cheap',
      input_tokens_median: 10000,
      output_tokens_median: 100,
    });
    // Entry B: light on input, heavy on expensive output tokens.
    //   cost = (1000*3 + 3000*15)/1e6 = (3000 + 45000)/1e6 = 0.048
    //   token sum = 4000  (LOWER token sum, but HIGHER cost)
    const dearLightInput = mockEntry({
      task_name: 'B dear',
      input_tokens_median: 1000,
      output_tokens_median: 3000,
    });

    const entries = priceEntries([cheapHeavyInput, dearLightInput], model);

    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'cost_per_unit', dir: 'asc' },
    );

    // Real-cost ascending: A (0.0315) before B (0.048).
    // The old token-sum proxy would wrongly put B (4000) before A (10100).
    expect(result[0].task_name).toBe('A cheap');
    expect(result[1].task_name).toBe('B dear');
  });

  it('reverses correctly for descending cost sort', () => {
    const cheapHeavyInput = mockEntry({
      task_name: 'A cheap',
      input_tokens_median: 10000,
      output_tokens_median: 100,
    });
    const dearLightInput = mockEntry({
      task_name: 'B dear',
      input_tokens_median: 1000,
      output_tokens_median: 3000,
    });

    const entries = priceEntries([cheapHeavyInput, dearLightInput], model);

    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'cost_per_unit', dir: 'desc' },
    );

    expect(result[0].task_name).toBe('B dear');
    expect(result[1].task_name).toBe('A cheap');
  });

  it('still filters before sorting by cost', () => {
    const a = mockEntry({
      task_name: 'A',
      task_pattern: 'extraction',
      input_tokens_median: 100,
      output_tokens_median: 100,
    });
    const b = mockEntry({
      task_name: 'B',
      task_pattern: 'generation',
      input_tokens_median: 999999,
      output_tokens_median: 999999,
    });
    const entries = priceEntries([a, b], model);

    const result = applyFiltersAndSort(
      entries,
      { pattern: 'extraction', industries: [], provider: '' },
      { key: 'cost_per_unit', dir: 'desc' },
    );

    // B filtered out despite being far more expensive.
    expect(result).toHaveLength(1);
    expect(result[0].task_name).toBe('A');
  });

  it('accepts already-priced rows (SortableEntry carries optional costPerUnit)', () => {
    // Compile-time + runtime check that the function takes priced rows.
    const priced: SortableEntry[] = priceEntries(
      [mockEntry({ task_name: 'X' })],
      model,
    );
    const result = applyFiltersAndSort(
      priced,
      { pattern: '', industries: [], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result[0].task_name).toBe('X');
  });
});
