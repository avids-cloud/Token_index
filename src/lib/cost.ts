// Cost calculation. See CLAUDE.md "Cost calculation".
//
//   cost_per_unit_usd = (input_tokens_median * input_price
//                        + output_tokens_median * output_price) / 1_000_000
//
// Stored token figures are already summed across all calls per task unit.
// calls_per_unit is metadata for the reader, NOT a multiplier here. Multiplying
// by it would double-count agentic workflows.

export interface ModelPrice {
  /** USD per million input tokens. */
  input: number;
  /** USD per million output tokens. */
  output: number;
}

export function costPerUnitUsd(
  inputTokensMedian: number,
  outputTokensMedian: number,
  price: ModelPrice,
): number {
  return (
    (inputTokensMedian * price.input + outputTokensMedian * price.output) /
    1_000_000
  );
}
