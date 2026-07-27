// Repricing strip: fixed bar above the table with model selector and
// monthly volume input. Changing either reprices every visible row.
// See docs/DESIGN.md "Signature element".

import { getAllModels, getAsOfLabel, type ModelPricing } from '../lib/pricing';

interface Props {
  selectedModel: string;
  volume: number;
  onModelChange: (model: string) => void;
  onVolumeChange: (volume: number) => void;
}

export default function RepricingStrip({
  selectedModel,
  volume,
  onModelChange,
  onVolumeChange,
}: Props) {
  const models = getAllModels();
  const byProvider = models.reduce<Record<string, ModelPricing[]>>((acc, m) => {
    (acc[m.provider] ??= []).push(m);
    return acc;
  }, {});

  const asOf =
    models.find((m) => m.model === selectedModel)?.as_of ?? models[0].as_of;
  const asOfLabel = getAsOfLabel(asOf);

  return (
    <div
      className="sticky top-0 z-10 border border-rule bg-paper px-4 py-3"
      role="region"
      aria-label="Repricing controls"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="model-select"
            className="text-xs font-semibold tracking-tight"
          >
            Price at
          </label>
          <select
            id="model-select"
            className="border border-rule bg-paper px-2 py-1.5 text-sm font-sans focus:outline-none"
            value={selectedModel}
            onChange={(e) => onModelChange(e.currentTarget.value)}
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
            htmlFor="volume-input"
            className="text-xs font-semibold tracking-tight"
          >
            Units per month
          </label>
          <input
            id="volume-input"
            type="number"
            min="0"
            step="100"
            className="figure w-28 border border-rule bg-paper px-2 py-1.5 text-sm focus:outline-none"
            placeholder="0"
            value={volume > 0 ? volume : ''}
            onChange={(e) => {
              const v = parseInt(e.currentTarget.value, 10);
              onVolumeChange(isNaN(v) || v < 0 ? 0 : v);
            }}
          />
        </div>

        <p className="m-0 self-center text-xs text-ink">
          Prices as of {asOfLabel}
        </p>
      </div>
    </div>
  );
}
