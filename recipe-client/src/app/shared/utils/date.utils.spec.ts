import { describe, expect, it } from 'vitest';

import { getMonday, toDisplayDate, toIsoDate, toIsoWeekString } from './date.utils';

describe('getMonday', () => {
  it('returns Monday for a Wednesday input', () => {
    const result = getMonday(new Date(2026, 2, 11)); // Wed March 11
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(9);
  });

  it('returns same day for a Monday input', () => {
    const result = getMonday(new Date(2026, 2, 9)); // Mon March 9
    expect(result.getDate()).toBe(9);
  });

  it('returns previous Monday for a Sunday input', () => {
    const result = getMonday(new Date(2026, 2, 15)); // Sun March 15
    expect(result.getDate()).toBe(9);
  });

  it('sets time to midnight', () => {
    const result = getMonday(new Date(2026, 2, 11, 14, 30));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe('toIsoDate', () => {
  it('formats date as yyyy-mm-dd', () => {
    expect(toIsoDate(new Date(2026, 2, 9))).toBe('2026-03-09');
  });

  it('pads single-digit month and day', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('handles December correctly', () => {
    expect(toIsoDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('toDisplayDate', () => {
  it('formats date as dd-mm-yyyy', () => {
    expect(toDisplayDate(new Date(2026, 2, 9))).toBe('09-03-2026');
  });

  it('pads single-digit day and month', () => {
    expect(toDisplayDate(new Date(2026, 0, 5))).toBe('05-01-2026');
  });
});

describe('toIsoWeekString', () => {
  it('returns correct ISO week for week 11', () => {
    expect(toIsoWeekString(new Date(2026, 2, 9))).toBe('2026-W11');
  });

  it('pads single-digit week number', () => {
    expect(toIsoWeekString(new Date(2026, 0, 5))).toBe('2026-W02');
  });

  it('handles year boundary where last days of year belong to week 1 of next year', () => {
    expect(toIsoWeekString(new Date(2025, 11, 29))).toBe('2026-W01');
  });
});
