// EntryDetail: React island for the /entry?id=xxx page.
// Two-column layout: figures left, methodology right.
// Reads the entry ID from the URL query string.
// See BUILD_PLAN Phase 5 and DESIGN.md "Layout".

import { useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '../lib/supabase';
import type { PublicEntryRow } from '../lib/database.types';
import RepriceWidget from './RepriceWidget';

type LoadState =
  | { status: 'loading' }
  | { status: 'noid' }
  | { status: 'notfound' }
  | { status: 'error'; message: string }
  | { status: 'success'; entry: PublicEntryRow };

// Extracted so tests can call it without a live Supabase connection.
export async function fetchEntryById(id: string): Promise<PublicEntryRow | null> {
  const { data, error } = await getSupabase()
    .from('public_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Helper: format p90 range as "typical vs heavy tail" label.
// Returns null if no p90 data.
function p90Range(
  median: number,
  p90: number | null,
): { median: number; p90: number } | null {
  if (p90 === null || p90 === undefined) return null;
  return { median, p90 };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-rule py-2">
      <dt className="text-xs font-semibold tracking-tight text-ink">{label}</dt>
      <dd className="m-0 text-sm">{children}</dd>
    </div>
  );
}

export default function EntryDetail() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') ?? '';

    if (!id) {
      setState({ status: 'noid' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });
    fetchEntryById(id)
      .then((entry) => {
        if (cancelled) return;
        if (entry) {
          setState({ status: 'success', entry });
        } else {
          setState({ status: 'notfound' });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Could not load this entry. Try again later.';
        setState({ status: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <p
        className="py-12 text-center text-sm"
        role="status"
        aria-live="polite"
      >
        Loading entry...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="border border-delta px-4 py-8 text-center">
        <p className="m-0 text-sm text-delta">{state.message}</p>
      </div>
    );
  }

  if (state.status === 'noid') {
    return (
      <div className="px-4 py-12 text-center">
        <p className="m-0 text-base">
          No entry ID provided. Use a link from the index to open an entry.
        </p>
        <p className="mt-4">
          <a href="/" className="text-accent underline">
            Back to the index
          </a>
        </p>
      </div>
    );
  }

  if (state.status === 'notfound') {
    return (
      <div className="px-4 py-12 text-center">
        <p className="m-0 text-base">
          This entry could not be found. It may not have been approved yet, or
          the link may be wrong.
        </p>
        <p className="mt-4">
          <a href="/" className="text-accent underline">
            Back to the index
          </a>
        </p>
      </div>
    );
  }

  const entry = state.entry;
  const inputP90 = p90Range(entry.input_tokens_median, entry.input_tokens_p90);
  const outputP90 = p90Range(
    entry.output_tokens_median,
    entry.output_tokens_p90,
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left column: figures */}
      <div className="lg:w-2/3">
        <h1 className="text-figure m-0 text-2xl font-semibold tracking-tight">
          {entry.task_name}
        </h1>
        <p className="mt-1 text-sm text-ink">
          {entry.task_pattern.replace(/_/g, ' ')}
          {' · '}
          {entry.industry_tags.join(', ').replace(/_/g, ' ')}
        </p>

        <RepriceWidget
          inputTokensMedian={entry.input_tokens_median}
          outputTokensMedian={entry.output_tokens_median}
        />

        <dl className="mt-6">
          <Field label="Task unit">{entry.task_unit}</Field>
          <Field label="Provider">{entry.provider}</Field>
          <Field label="Model">{entry.model}</Field>
          <Field label="Prompt strategy">
            {entry.prompt_strategy.replace(/_/g, ' ')}
          </Field>
          <Field label="Calls per unit">{entry.calls_per_unit}</Field>
          <Field label="Includes retries">
            {entry.includes_retries ? 'Yes' : 'No'}
          </Field>
          <Field label="Input tokens (median)">
            <span className="figure">
              {entry.input_tokens_median.toLocaleString()}
            </span>
          </Field>
          {inputP90 && (
            <Field label="Input tokens (p90, typical vs heavy tail)">
              <span className="figure">
                {inputP90.p90.toLocaleString()}
              </span>{' '}
              <span className="text-xs text-ink">
                (median {inputP90.median.toLocaleString()})
              </span>
            </Field>
          )}
          <Field label="Output tokens (median)">
            <span className="figure">
              {entry.output_tokens_median.toLocaleString()}
            </span>
          </Field>
          {outputP90 && (
            <Field label="Output tokens (p90, typical vs heavy tail)">
              <span className="figure">
                {outputP90.p90.toLocaleString()}
              </span>{' '}
              <span className="text-xs text-ink">
                (median {outputP90.median.toLocaleString()})
              </span>
            </Field>
          )}
          <Field label="Sample size">
            <span className="figure">{entry.sample_size}</span> task units
          </Field>
          <Field label="Measured on">{entry.measurement_date}</Field>
          <Field label="Submitted by">
            {entry.submitter_display ?? 'Anonymous'}
          </Field>
        </dl>
      </div>

      {/* Right column: methodology + source */}
      <div className="lg:w-1/3">
        <h2 className="text-sm font-semibold tracking-tight">
          Methodology
        </h2>
        <p className="mt-2 text-sm leading-relaxed">{entry.methodology}</p>

        {entry.source_url && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold tracking-tight">Source</h3>
            <p className="mt-1 text-sm">
              <a
                href={entry.source_url}
                className="text-accent underline break-all"
                rel="noopener noreferrer"
              >
                {entry.source_url}
              </a>
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-rule pt-4">
          <a href="/" className="text-sm text-accent underline">
            Back to the index
          </a>
        </div>
      </div>
    </div>
  );
}
