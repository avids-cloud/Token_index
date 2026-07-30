import { describe, it, expect } from 'vitest';
import { getAsOfAge } from '../src/lib/pricing';

// CLAUDE.md rule 5: flag as_of dates older than 30 days. These tests pin the
// behaviour of the staleness helper used by the repricing strip and widget.

describe('getAsOfAge', () => {
  const now = new Date('2026-07-30T12:00:00Z');

  it('reports whole months and days old for a stale date', () => {
    // 2026-01-15 is about six and a half months before 2026-07-30.
    const age = getAsOfAge('2026-01-15', now);
    expect(age.daysOld).toBeGreaterThan(30);
    expect(age.stale).toBe(true);
    expect(age.monthsOld).toBe(6);
  });

  it('is not stale within 30 days', () => {
    const age = getAsOfAge('2026-07-15', now);
    expect(age.daysOld).toBeLessThanOrEqual(30);
    expect(age.stale).toBe(false);
    expect(age.monthsOld).toBe(0);
  });

  it('treats exactly 30 days as the boundary (not stale)', () => {
    const age = getAsOfAge('2026-06-30', now); // exactly 30 days
    expect(age.daysOld).toBe(30);
    expect(age.stale).toBe(false);
  });

  it('treats 31 days as stale', () => {
    const age = getAsOfAge('2026-06-29', now);
    expect(age.daysOld).toBe(31);
    expect(age.stale).toBe(true);
  });

  it('produces a human label in whole months for the UI', () => {
    const age = getAsOfAge('2026-01-15', now);
    expect(age.label).toBe('6 months');
  });

  it('uses singular "month" for one month', () => {
    const age = getAsOfAge('2026-06-15', now); // 45 days -> 1 month
    expect(age.monthsOld).toBe(1);
    expect(age.label).toBe('1 month');
  });
});
