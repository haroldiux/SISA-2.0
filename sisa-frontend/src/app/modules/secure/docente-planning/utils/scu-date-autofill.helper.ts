/**
 * Holiday-aware date projection helper for UNITEPC PAC Matriz 7 scheduling.
 *
 * @author GentleAI SISA Architecture Team
 */

export interface ScuHolidayDefinition {
  date: string; // YYYY-MM-DD
  name: string;
}

export const UNITEPC_2026_HOLIDAYS: ScuHolidayDefinition[] = [
  { date: '2026-02-16', name: 'Carnaval (Lunes)' },
  { date: '2026-02-17', name: 'Carnaval (Martes)' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-05-01', name: 'Día del Trabajo' },
  { date: '2026-06-04', name: 'Corpus Christi' },
  { date: '2026-06-21', name: 'Año Nuevo Andino Amazónico' }
];

export class ScuDateAutoFillHelper {

  public static generateDates(
    startDateStr: string,
    targetWeekdays: number[], // 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
    totalSessions: number,
    holidays: ScuHolidayDefinition[] = UNITEPC_2026_HOLIDAYS
  ): string[] {
    const dates: string[] = [];
    if (!startDateStr || !targetWeekdays || targetWeekdays.length === 0 || totalSessions <= 0) {
      return dates;
    }

    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    // Parse pure UTC date components to avoid timezone offsets
    const [year, month, day] = startDateStr.split('-').map(num => parseInt(num, 10));
    const currentDate = new Date(Date.UTC(year, month - 1, day));

    let iterations = 0;
    const maxIterations = 365 * 2; // Prevent infinite loop in edge cases

    while (dates.length < totalSessions && iterations < maxIterations) {
      iterations++;
      const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 1 = Monday...
      const isoString = currentDate.toISOString().split('T')[0];

      if (dayOfWeek !== 0 && targetWeekdays.includes(dayOfWeek)) {
        if (!holidaySet.has(isoString)) {
          dates.push(isoString);
        }
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
  }
}
