import { describe, it, expect } from 'vitest';
import { applyFiltersAndSort } from '../src/lib/entry-ops';
import { priceEntries } from '../src/components/EntryTable';
import { costPerUnitUsd } from '../src/lib/cost';
import { getDefaultModel, getModel, getAllModels, getAsOfLabel } from '../src/lib/pricing';
import type { PublicEntryRow } from '../src/lib/database.types';

// Mock entries for testing. These never touch the live database
// (CLAUDE.md rule 3: never insert example data into the live database).
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
    methodology: 'Measured from the billing dashboard over 50 invoice processing runs',
    source_url: null,
    submitter_display: null,
    created_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

const mockEntries: PublicEntryRow[] = [
  mockEntry({
    task_name: 'Invoice extraction',
    task_pattern: 'extraction',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    industry_tags: ['accounting', 'finance'],
    input_tokens_median: 2000,
    output_tokens_median: 800,
    sample_size: 100,
    measurement_date: '2026-01-10',
  }),
  mockEntry({
    task_name: 'Contract classification',
    task_pattern: 'classification',
    provider: 'openai',
    model: 'gpt-5',
    industry_tags: ['legal'],
    input_tokens_median: 5000,
    output_tokens_median: 200,
    sample_size: 30,
    measurement_date: '2026-01-05',
  }),

  mockEntry({
    task_name: 'Support ticket summary',
    task_pattern: 'summarisation',
    provider: 'google',
    model: 'gemini-2.5-pro',
    industry_tags: ['customer_service'],
    input_tokens_median: 1500,
    output_tokens_median: 300,
    sample_size: 200,
    measurement_date: '2026-01-20',
  }),
  mockEntry({
    task_name: 'PO matching',
    task_pattern: 'reconciliation',
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    industry_tags: ['supply_chain', 'accounting'],
    input_tokens_median: 3000,
    output_tokens_median: 100,
    sample_size: 50,
    measurement_date: '2026-01-12',
  }),
  mockEntry({
    task_name: 'Email drafting',
    task_pattern: 'generation',
    provider: 'openai',
    model: 'gpt-5-mini',
    industry_tags: ['customer_service', 'hr'],
    input_tokens_median: 800,
    output_tokens_median: 600,
    sample_size: 15,
    measurement_date: '2026-01-18',
  }),
];

describe('pricing module', () => {
  it('returns all models from the pricing file', () => {
    const models = getAllModels();
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty('input');
    expect(models[0]).toHaveProperty('output');
    expect(models[0]).toHaveProperty('as_of');
  });

  it('finds a model by slug', () => {
    const model = getModel('gpt-5');
    expect(model).toBeDefined();
    expect(model!.provider).toBe('openai');
  });

  it('returns undefined for unknown model', () => {
    expect(getModel('nonexistent-model')).toBeUndefined();
  });

  it('formats as_of date as "Mon YYYY"', () => {
    expect(getAsOfLabel('2026-01-15')).toBe('Jan 2026');
    expect(getAsOfLabel('2026-07-01')).toBe('Jul 2026');
  });
});

describe('repricing', () => {
  it('prices entries at the selected model rates', () => {
    const entries = [mockEntry({ input_tokens_median: 2000, output_tokens_median: 800 })];
    const model = getDefaultModel();
    const priced = priceEntries(entries, model);

    const expected = costPerUnitUsd(2000, 800, {
      input: model.input,
      output: model.output,
    });
    expect(priced[0].costPerUnit).toBeCloseTo(expected, 10);
  });

  it('reprices differently when a different model is selected', () => {
    const entries = [mockEntry({ input_tokens_median: 2000, output_tokens_median: 800 })];

    const sonnet = getModel('claude-sonnet-4-6')!;
    const haiku = getModel('claude-haiku-4-5')!;

    const pricedSonnet = priceEntries(entries, sonnet);
    const pricedHaiku = priceEntries(entries, haiku);

    expect(pricedSonnet[0].costPerUnit).not.toBeCloseTo(
      pricedHaiku[0].costPerUnit,
      6,
    );
    expect(pricedHaiku[0].costPerUnit).toBeLessThan(pricedSonnet[0].costPerUnit);
  });

  it('volume projection multiplies cost per unit', () => {
    const entries = [mockEntry({ input_tokens_median: 2000, output_tokens_median: 800 })];
    const model = getDefaultModel();
    const priced = priceEntries(entries, model);

    const monthly = priced[0].costPerUnit * 10000;
    expect(monthly).toBeGreaterThan(0);
    expect(monthly).toBeCloseTo(
      costPerUnitUsd(2000, 800, model) * 10000,
      6,
    );
  });

  it('does not multiply by calls_per_unit (no double counting)', () => {
    const single = mockEntry({
      calls_per_unit: 1,
      input_tokens_median: 2000,
      output_tokens_median: 800,
    });
    const agentic = mockEntry({
      calls_per_unit: 3,
      input_tokens_median: 2000, // already summed across 3 calls
      output_tokens_median: 800,
    });

    const model = getDefaultModel();
    const pricedSingle = priceEntries([single], model);
    const pricedAgentic = priceEntries([agentic], model);

    // Same stored tokens = same cost, regardless of calls_per_unit
    expect(pricedSingle[0].costPerUnit).toBeCloseTo(pricedAgentic[0].costPerUnit, 10);
  });
});

describe('filters', () => {
  const entries = mockEntries;

  it('filters by task pattern', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: 'extraction', industries: [], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.every((e) => e.task_pattern === 'extraction')).toBe(true);
    expect(result.length).toBe(1);
  });

  it('filters by provider', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: 'anthropic' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.every((e) => e.provider === 'anthropic')).toBe(true);
    expect(result.length).toBe(2);
  });

  it('filters by industry tag (matches any)', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: ['accounting'], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.every((e) => e.industry_tags.includes('accounting'))).toBe(true);
    expect(result.length).toBe(2); // invoice extraction + PO matching
  });

  it('filters by multiple industries (OR logic)', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: ['legal', 'hr'], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.length).toBe(2); // contract classification + email drafting
  });

  it('combines pattern + provider filters', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: 'generation', industries: [], provider: 'openai' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.length).toBe(1);
    expect(result[0].task_name).toBe('Email drafting');
  });

  it('returns all entries when no filters set', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.length).toBe(entries.length);
  });

  it('returns empty when no match', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: 'translation', industries: [], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    expect(result.length).toBe(0);
  });
});

describe('sorting', () => {
  const entries = mockEntries;

  it('sorts by task_name ascending', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'task_name', dir: 'asc' },
    );
    for (let i = 1; i < result.length; i++) {
      expect(result[i].task_name >= result[i - 1].task_name).toBe(true);
    }
  });

  it('sorts by task_name descending', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'task_name', dir: 'desc' },
    );
    for (let i = 1; i < result.length; i++) {
      expect(result[i].task_name <= result[i - 1].task_name).toBe(true);
    }
  });

  it('sorts by input_tokens_median numerically (ascending)', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'input_tokens_median', dir: 'asc' },
    );
    for (let i = 1; i < result.length; i++) {
      expect(result[i].input_tokens_median >= result[i - 1].input_tokens_median).toBe(true);
    }
  });

  it('sorts by sample_size numerically (descending)', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'sample_size', dir: 'desc' },
    );
    for (let i = 1; i < result.length; i++) {
      expect(result[i].sample_size <= result[i - 1].sample_size).toBe(true);
    }
  });

  it('sorts by measurement_date (ascending)', () => {
    const result = applyFiltersAndSort(
      entries,
      { pattern: '', industries: [], provider: '' },
      { key: 'measurement_date', dir: 'asc' },
    );
    for (let i = 1; i < result.length; i++) {
      expect(result[i].measurement_date >= result[i - 1].measurement_date).toBe(true);
    }
  });
});
