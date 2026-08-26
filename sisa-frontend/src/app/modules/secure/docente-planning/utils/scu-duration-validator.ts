import { ScuDurationValidationResultModel } from '@shared/models/scu-plan-clase.model';

/**
 * Pure mathematical validator for Plan de Clase 3-moments 180-minute duration balance.
 *
 * Enforces the strict invariant: Inicio + Desarrollo + Cierre === 180 min (tolerance +-0 min).
 *
 * @author GentleAI SISA Architecture Team
 */
export class ScuDurationValidator {
  public static readonly TARGET_DURATION_MIN = 180;

  public static validate(
    inicioMin: number | null | undefined,
    desarrolloMin: number | null | undefined,
    cierreMin: number | null | undefined,
    target: number = ScuDurationValidator.TARGET_DURATION_MIN
  ): ScuDurationValidationResultModel {
    const validTarget = Math.max(1, Number(target) || ScuDurationValidator.TARGET_DURATION_MIN);
    const ini = Math.max(0, Number(inicioMin) || 0);
    const des = Math.max(0, Number(desarrolloMin) || 0);
    const cie = Math.max(0, Number(cierreMin) || 0);

    const sum = ini + des + cie;
    const diff = sum - validTarget;

    if (diff === 0) {
      return {
        sum,
        target: validTarget,
        difference: 0,
        isValid: true,
        status: 'VALIDO',
        message: `${validTarget} / ${validTarget} min - Balance Válido`
      };
    } else if (diff > 0) {
      return {
        sum,
        target: validTarget,
        difference: diff,
        isValid: false,
        status: 'EXCESO',
        message: `Exceso: +${diff} min (Total: ${sum} min)`
      };
    } else {
      return {
        sum,
        target: validTarget,
        difference: diff,
        isValid: false,
        status: 'DEFICIT',
        message: `Déficit: ${diff} min (Faltan ${Math.abs(diff)} min para ${validTarget} min)`
      };
    }
  }
}
