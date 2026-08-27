import { ScuDurationValidationResultModel, ScuMomentoPedagogicoModel } from '@shared/models/scu-plan-clase.model';

/**
 * Mathematical validator for Plan de Clase pedagogical moments configurable duration balance.
 *
 * Validates that sum of moment durations equals target session minutes configured by the docente.
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
    return this.validateSum(ini + des + cie, validTarget);
  }

  public static validateMoments(
    momentos: ScuMomentoPedagogicoModel[] | undefined,
    target: number = ScuDurationValidator.TARGET_DURATION_MIN
  ): ScuDurationValidationResultModel {
    const validTarget = Math.max(1, Number(target) || ScuDurationValidator.TARGET_DURATION_MIN);
    const sum = (momentos || []).reduce((acc, m) => acc + (Math.max(0, Number(m.duracionMin) || 0)), 0);
    return this.validateSum(sum, validTarget);
  }

  public static validateSum(sum: number, validTarget: number): ScuDurationValidationResultModel {
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
