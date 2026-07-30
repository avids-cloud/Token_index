// Typed access to data/model-pricing.json.
// One responsibility: expose the pricing data with typed helpers.
// See CLAUDE.md rule 5: do not verify pricing from memory. Prices are
// refreshed by Avi against provider pricing pages.

import pricingData from '../../data/model-pricing.json';

export interface ModelPricing {
  provider: string;
  model: string;
  display_name: string;
  input: number;
  output: number;
  as_of: string;
}

export interface PricingFile {
  _readme: string;
  currency: string;
  unit: string;
  models: ModelPricing[];
}

const data = pricingData as PricingFile;

export function getAllModels(): ModelPricing[] {
  return data.models;
}

export function getModel(slug: string): ModelPricing | undefined {
  return data.models.find((m) => m.model === slug);
}

export function getDefaultModel(): ModelPricing {
  const first = data.models[0];
  if (!first) {
    throw new Error(
      'data/model-pricing.json has no models. Add at least one model entry.',
    );
  }
  return first;
}

export function getAsOfLabel(asOf: string): string {
  // Format "2026-01-15" as "Jan 2026"
  const [year, month] = asOf.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${months[monthIndex]} ${year}`;
}

// How old an as_of pricing date is. CLAUDE.md rule 5: flag as_of dates older
// than 30 days. `now` is injectable so the behaviour is testable.
export interface AsOfAge {
  daysOld: number;
  monthsOld: number;
  /** True when the pricing is older than 30 days and should be flagged. */
  stale: boolean;
  /** Human label in whole months, e.g. "1 month", "6 months". */
  label: string;
}

const STALE_AFTER_DAYS = 30;
const AVG_DAYS_PER_MONTH = 30.44; // 365.25 / 12

export function getAsOfAge(asOf: string, now: Date = new Date()): AsOfAge {
  const then = new Date(`${asOf}T00:00:00Z`).getTime();
  const daysOld = Math.max(
    0,
    Math.floor((now.getTime() - then) / (24 * 60 * 60 * 1000)),
  );
  const monthsOld = Math.floor(daysOld / AVG_DAYS_PER_MONTH);
  return {
    daysOld,
    monthsOld,
    stale: daysOld > STALE_AFTER_DAYS,
    label: monthsOld === 1 ? '1 month' : `${monthsOld} months`,
  };
}

export const pricingFile = data;
