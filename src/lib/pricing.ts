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
  return data.models[0];
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

export const pricingFile = data;
