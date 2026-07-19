import { describe, it, expect } from 'vitest';
import { costPerUnitUsd } from '../src/lib/cost';

// See CLAUDE.md "Cost calculation". The critical invariant: calls_per_unit is
// NOT a multiplier. Stored tokens are already summed across calls.

describe('costPerUnitUsd', () => {
  it('applies the per-million formula', () => {
    // 1850 in @ $1/M + 240 out @ $5/M = 0.00185 + 0.0012 = 0.00305
    const cost = costPerUnitUsd(1850, 240, { input: 1.0, output: 5.0 });
    expect(cost).toBeCloseTo(0.00305, 10);
  });

  it('does not multiply by calls_per_unit (no double counting)', () => {
    // An agentic entry with calls_per_unit 2.3 stores tokens already summed
    // across those calls. The cost must depend only on the stored medians and
    // the price, never on the call count.
    const stored = costPerUnitUsd(5200, 480, { input: 0.25, output: 2.0 });
    // 5200 * 0.25 + 480 * 2.0 = 1300 + 960 = 2260 / 1e6 = 0.00226
    expect(stored).toBeCloseTo(0.00226, 10);
  });

  it('is zero when both prices are zero', () => {
    expect(costPerUnitUsd(1000, 1000, { input: 0, output: 0 })).toBe(0);
  });

  it('scales linearly with token counts', () => {
    const price = { input: 3.0, output: 15.0 };
    const single = costPerUnitUsd(1000, 100, price);
    const double = costPerUnitUsd(2000, 200, price);
    expect(double).toBeCloseTo(single * 2, 10);
  });
});
