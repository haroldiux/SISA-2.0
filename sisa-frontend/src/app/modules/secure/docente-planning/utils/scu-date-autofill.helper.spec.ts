import { ScuDateAutoFillHelper, UNITEPC_2026_HOLIDAYS } from './scu-date-autofill.helper';

describe('ScuDateAutoFillHelper', () => {

  it('should project chronological dates for Monday and Wednesday schedule', () => {
    // Starting on Monday 2026-02-23 (after Carnival)
    const dates = ScuDateAutoFillHelper.generateDates('2026-02-23', [1, 3], 6);

    expect(dates.length).toBe(6);
    expect(dates[0]).toBe('2026-02-23'); // Mon
    expect(dates[1]).toBe('2026-02-25'); // Wed
    expect(dates[2]).toBe('2026-03-02'); // Mon
    expect(dates[3]).toBe('2026-03-04'); // Wed
    expect(dates[4]).toBe('2026-03-09'); // Mon
    expect(dates[5]).toBe('2026-03-11'); // Wed
  });

  it('should skip configured holidays such as Carnival (Feb 16-17, 2026)', () => {
    // Starting on Carnival Monday 2026-02-16
    const dates = ScuDateAutoFillHelper.generateDates('2026-02-16', [1, 2, 3], 4);

    // 2026-02-16 (Mon) is Carnival holiday -> skipped
    // 2026-02-17 (Tue) is Carnival holiday -> skipped
    // First valid date should be Wednesday 2026-02-18
    expect(dates[0]).toBe('2026-02-18');
    expect(dates[1]).toBe('2026-02-23'); // Next Mon
    expect(dates[2]).toBe('2026-02-24'); // Next Tue
    expect(dates[3]).toBe('2026-02-25'); // Next Wed
  });

  it('should skip Viernes Santo (2026-04-03)', () => {
    const dates = ScuDateAutoFillHelper.generateDates('2026-04-01', [3, 5], 4);

    expect(dates[0]).toBe('2026-04-01'); // Wed
    // 2026-04-03 is Viernes Santo -> skipped
    expect(dates[1]).toBe('2026-04-08'); // Next Wed
    expect(dates[2]).toBe('2026-04-10'); // Next Fri
    expect(dates[3]).toBe('2026-04-15'); // Next Wed
  });

  it('should exclude Sundays unconditionally', () => {
    const dates = ScuDateAutoFillHelper.generateDates('2026-03-01', [0, 1], 3);

    // 2026-03-01 is Sunday -> dayOfWeek 0 is never included
    expect(dates[0]).toBe('2026-03-02'); // Monday
    expect(dates[1]).toBe('2026-03-09'); // Monday
    expect(dates[2]).toBe('2026-03-16'); // Monday
  });

  it('should return empty array when input parameters are invalid', () => {
    expect(ScuDateAutoFillHelper.generateDates('', [1, 3], 10)).toEqual([]);
    expect(ScuDateAutoFillHelper.generateDates('2026-02-16', [], 10)).toEqual([]);
    expect(ScuDateAutoFillHelper.generateDates('2026-02-16', [1], 0)).toEqual([]);
  });
});
