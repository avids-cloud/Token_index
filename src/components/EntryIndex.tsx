// EntryIndex: the main React island for the homepage.
// One responsibility: orchestrate data fetching, filtering, sorting,
// and repricing state, passing data down to child components.

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import type { PublicEntryRow } from '../lib/database.types';
import { getDefaultModel, getModel, getAsOfLabel } from '../lib/pricing';
import type { ModelPricing } from '../lib/pricing';
import { useUrlState, type SortKey, type SortDir } from '../lib/useUrlState';
import { applyFiltersAndSort } from '../lib/entry-ops';
import RepricingStrip from './RepricingStrip';
import Filters from './Filters';
import EntryTable, { priceEntries, type PricedEntry } from './EntryTable';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; entries: PublicEntryRow[] };

// Extracted so tests can call it without a live Supabase connection.
export async function fetchEntries(): Promise<PublicEntryRow[]> {
  const { data, error } = await getSupabase()
    .from('public_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export default function EntryIndex() {
  const [state, update, reset] = useUrlState();
  const [loadState, setLoadState] = useState<LoadState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;
    setLoadState({ status: 'loading' });
    fetchEntries()
      .then((entries) => {
        if (!cancelled) {
          setLoadState({ status: 'success', entries });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Could not load entries. Check your connection and try again.';
          setLoadState({ status: 'error', message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve the selected model
  const selectedModel: ModelPricing = useMemo(() => {
    if (state.selectedModel) {
      const found = getModel(state.selectedModel);
      if (found) return found;
    }
    return getDefaultModel();
  }, [state.selectedModel]);

  // Initialise selectedModel in URL state if empty
  useEffect(() => {
    if (!state.selectedModel) {
      update({ selectedModel: getDefaultModel().model });
    }
  }, [state.selectedModel, update]);

  // Unique providers from the loaded entries
  const providers = useMemo(() => {
    if (loadState.status !== 'success') return [];
    const set = new Set(loadState.entries.map((e) => e.provider));
    return [...set].sort();
  }, [loadState]);

  // Apply filters and sort. Sorting by cost uses the selected model's rates
  // so the displayed order matches the displayed prices.
  const visibleEntries = useMemo(() => {
    if (loadState.status !== 'success') return [];
    return applyFiltersAndSort(
      loadState.entries,
      state.filters,
      state.sort,
      selectedModel,
    );
  }, [loadState, state.filters, state.sort, selectedModel]);

  // Price the visible entries at the selected model
  const pricedEntries: PricedEntry[] = useMemo(
    () => priceEntries(visibleEntries, selectedModel),
    [visibleEntries, selectedModel],
  );

  const asOfLabel = getAsOfLabel(selectedModel.as_of);

  const activeFilterCount =
    (state.filters.pattern ? 1 : 0) +
    (state.filters.provider ? 1 : 0) +
    state.filters.industries.length;

  const handleSort = (key: SortKey) => {
    const newDir: SortDir =
      state.sort.key === key && state.sort.dir === 'asc' ? 'desc' : 'asc';
    update({ sort: { key, dir: newDir } });
  };

  const handleIndustryToggle = (industry: string) => {
    const current = state.filters.industries;
    const next = current.includes(industry)
      ? current.filter((i) => i !== industry)
      : [...current, industry];
    update({ filters: { ...state.filters, industries: next } });
  };

  if (loadState.status === 'loading') {
    return (
      <p className="py-12 text-center text-sm" role="status" aria-live="polite">
        Loading entries...
      </p>
    );
  }

  if (loadState.status === 'error') {
    return (
      <div className="border border-delta px-4 py-8 text-center">
        <p className="m-0 text-sm text-delta">{loadState.message}</p>
      </div>
    );
  }

  const hasEntries = loadState.entries.length > 0;
  const hasResults = pricedEntries.length > 0;

  if (!hasEntries) {
    return (
      <section className="border border-rule">
        <div className="border-b border-rule px-4 py-3">
          <h2 className="m-0 text-sm font-semibold tracking-tight">
            Approved entries
          </h2>
        </div>
        <div className="px-4 py-12 text-center">
          <p className="m-0 text-sm">
            The index opens once seed data is approved.
          </p>
          <p className="mt-2 text-sm">
            <a href="/submit">Submit the first one</a>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <RepricingStrip
        selectedModel={selectedModel.model}
        volume={state.volume}
        onModelChange={(model) => update({ selectedModel: model })}
        onVolumeChange={(volume) => update({ volume })}
      />

      <div className="flex flex-col gap-4 pt-4 lg:flex-row">
        <div className="lg:w-56 lg:shrink-0">
          <Filters
            pattern={state.filters.pattern}
            industries={state.filters.industries}
            provider={state.filters.provider}
            providers={providers}
            onPatternChange={(pattern) =>
              update({ filters: { ...state.filters, pattern } })
            }
            onIndustryToggle={handleIndustryToggle}
            onProviderChange={(provider) =>
              update({ filters: { ...state.filters, provider } })
            }
            onClear={reset}
            activeCount={activeFilterCount}
          />
        </div>

        <div className="min-w-0 flex-1">
          {hasResults ? (
            <EntryTable
              entries={pricedEntries}
              sortKey={state.sort.key}
              sortDir={state.sort.dir}
              onSort={handleSort}
              selectedModel={selectedModel}
              volume={state.volume}
              asOfLabel={asOfLabel}
            />
          ) : (
            <div className="border border-rule px-4 py-12 text-center">
              <p className="m-0 text-sm">
                No entries match. Clear filters or{' '}
                <a href="/submit">submit the first one</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
