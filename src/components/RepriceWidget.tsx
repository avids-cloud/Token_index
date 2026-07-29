// RepriceWidget: compact repricing control for a single entry on the detail page.
// Model dropdown + volume input + live cost display with count-up animation.
// Reuses the pricing module and count-up hook from Phase 4.

import { useState, useMemo } from 'react';
import { getAllModels, getModel, getDefaultModel, getAsOfLabel } from '../lib/pricing';
import type { ModelPricing } from '../lib/pricing';
import { costPerUnitUsd } from '../lib/cost';
import { useCountUp } from '../lib/countUp';

interface Props {
  inputTokensMedian: number;
  outputTokensMedian: number;
}

export default function RepriceWidget({
  inputTokensMedian,
  outputTokensMedian,
}: Props) {
  const models = getAllModels();
  const defaultModel = getDefaultModel();
  const [selectedSlug, setSelectedSlug] = useState(defaultModel.model);
  const [volume, setVolume] = useState(0);

  const model: ModelPricing = useMemo(
    () => getModel(selectedSlug) ?? defaultModel,
    [selectedSlug, defaultModel],
  );

  const costPerUnit = useMemo(
    () =>
      costPerUnitUsd(inputTokensMedian, outputTokensMedian, {
        input: model.input,
        output: model.output,
      }),
    [inputTokensMedian, outputTokensMedian, model],
  );

  const animatedCost = useCountUp(costPerUnit, { decimals: 4 });
  const monthly = volume > 0 ? costPerUnit * volume : 0;
  const animatedMonthly = useCountUp(monthly, {
    decimals: 2,
    enabled: volume > 0,
  });

  // Group models by provider
  const byProvider = models.reduce<Record<string, ModelPricing[]>>((acc, m) => {
    (acc[m.provider] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div
      className="border border-rule bg-paper p-4"
      role="region"
      aria-label="Reprice this entry"
    >
      <h2 className="m-0 mb-3 text-sm font-semibold tracking-tight">
        Reprice this entry
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="detail-model"
            className="text-xs font-semibold tracking-tight"
          >
            Model
          </label>
          <select
            id="detail-model"
            className="border border-rule bg-paper px-2 py-1.5 text-sm font-sans focus:outline-none"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.currentTarget.value)}
          >
            {Object.entries(byProvider).map(([provider, providerModels]) => (
              <optgroup key={provider} label={provider}>
                {providerModels.map((m) => (
                  <option key={m.model} value={m.model}>
                    {m.display_name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="detail-volume"
            className="text-xs font-semibold tracking-tight"
          >
            Units per month
          </label>
          <input
            id="detail-volume"
            type="number"
            min="0"
            step="100"
            className="figure w-28 border border-rule bg-paper px-2 py-1.5 text-sm focus:outline-none"
            placeholder="0"
            value={volume > 0 ? volume : ''}
            onChange={(e) => {
              const v = parseInt(e.currentTarget.value, 10);
              setVolume(isNaN(v) || v < 0 ? 0 : v);
            }}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-rule pt-3">
        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-ink">Cost per unit</dt>
          <dd className="figure m-0 text-right text-figure">
            ${animatedCost}
          </dd>
          {volume > 0 && (
            <>
              <dt className="text-ink">Monthly cost</dt>
              <dd className="figure m-0 text-right text-figure">
                ${animatedMonthly}
              </dd>
            </>
          )}
          <dt className="text-ink">Pricing as of</dt>
          <dd className="m-0 text-right">{getAsOfLabel(model.as_of)}</dd>
        </dl>
      </div>
    </div>
  );
}
