import { ScuPacModel, ScuSesionMatriz7Model } from '@shared/models/scu-pac.model';
import {
  DEFAULT_VALIDATION_CONFIG,
  ScuValidationConfig,
  ScuValidationIssueModel,
  ScuValidationResultModel
} from '@shared/models/scu-validation.model';

/**
 * Pure pedagogical validation engine for UNITEPC PAC Matriz 7 curriculum planning.
 *
 * Implements institutional rules VAL-01 through VAL-05 with zero side-effects.
 *
 * @author GentleAI SISA Architecture Team
 */
export class ScuPacValidator {

  public static validate(
    pac: ScuPacModel | null | undefined,
    config: ScuValidationConfig = DEFAULT_VALIDATION_CONFIG
  ): ScuValidationResultModel {
    const issues: ScuValidationIssueModel[] = [];

    if (!pac) {
      return {
        isValid: false,
        hasErrors: true,
        hasWarnings: false,
        totalErrors: 1,
        totalWarnings: 0,
        issues: [
          {
            id: 'val-00-null-pac',
            ruleCode: 'VAL-05-DENSITY',
            severity: 'ERROR',
            message: 'No se ha cargado información de PAC para validar.'
          }
        ],
        milestonesFound: {
          primerParcial: false,
          segundoParcial: false,
          examenFinal: false
        }
      };
    }

    const sessions = pac.matriz7 || [];

    const milestonesFound = {
      primerParcial: false,
      segundoParcial: false,
      examenFinal: false
    };

    // VAL-05: Academic Session Density Rule
    if (sessions.length < config.minSessions) {
      issues.push({
        id: 'val-05-min-density',
        ruleCode: 'VAL-05-DENSITY',
        severity: 'WARNING',
        message: `PAC con carga horaria insuficiente: Se registran ${sessions.length} sesiones (mínimo recomendado: ${config.minSessions}).`
      });
    } else if (sessions.length > config.maxSessions) {
      issues.push({
        id: 'val-05-max-density',
        ruleCode: 'VAL-05-DENSITY',
        severity: 'WARNING',
        message: `PAC excede la densidad horaria recomendada: ${sessions.length} sesiones (máximo recomendado: ${config.maxSessions}).`
      });
    }

    let prevDate: string | null = null;

    sessions.forEach((ses) => {
      // VAL-01: Chronology & Date Range Rule
      if (!ses.fechaProgramada || ses.fechaProgramada.trim() === '') {
        issues.push({
          id: `val-01-empty-date-${ses.nroSesion}`,
          ruleCode: 'VAL-01-CHRONOLOGY',
          severity: 'ERROR',
          sessionNumber: ses.nroSesion,
          fieldName: 'fechaProgramada',
          message: `Sesión #${ses.nroSesion}: La fecha programada no puede estar vacía.`
        });
      } else {
        if (ses.fechaProgramada < config.termStartDate || ses.fechaProgramada > config.termEndDate) {
          issues.push({
            id: `val-01-range-${ses.nroSesion}`,
            ruleCode: 'VAL-01-CHRONOLOGY',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'fechaProgramada',
            message: `Sesión #${ses.nroSesion}: La fecha ${ses.fechaProgramada} está fuera del periodo académico semestral (${config.termStartDate} al ${config.termEndDate}).`
          });
        }
        if (prevDate && ses.fechaProgramada < prevDate) {
          issues.push({
            id: `val-01-inversion-${ses.nroSesion}`,
            ruleCode: 'VAL-01-CHRONOLOGY',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'fechaProgramada',
            message: `Sesión #${ses.nroSesion}: Inversión cronológica detectada. La fecha ${ses.fechaProgramada} es anterior a la sesión previa (${prevDate}).`
          });
        }
        prevDate = ses.fechaProgramada;
      }

      // VAL-02: Evaluative Milestone Compliance per Row
      if (ses.hitoEvaluativo === 'PRIMER_PARCIAL') {
        milestonesFound.primerParcial = true;
        if (ses.semana < 6 || ses.semana > 8) {
          issues.push({
            id: `val-02-pos-pp-${ses.nroSesion}`,
            ruleCode: 'VAL-02-MILESTONES',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'hitoEvaluativo',
            message: `Sesión #${ses.nroSesion}: El Primer Parcial debe planificarse en la Semana 7 (ubicado actualmente en Semana ${ses.semana}).`
          });
        }
      } else if (ses.hitoEvaluativo === 'SEGUNDO_PARCIAL') {
        milestonesFound.segundoParcial = true;
        if (ses.semana < 13 || ses.semana > 15) {
          issues.push({
            id: `val-02-pos-sp-${ses.nroSesion}`,
            ruleCode: 'VAL-02-MILESTONES',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'hitoEvaluativo',
            message: `Sesión #${ses.nroSesion}: El Segundo Parcial debe planificarse en la Semana 14 (ubicado actualmente en Semana ${ses.semana}).`
          });
        }
      } else if (ses.hitoEvaluativo === 'EXAMEN_FINAL') {
        milestonesFound.examenFinal = true;
        if (ses.semana < 19 || ses.semana > 20) {
          issues.push({
            id: `val-02-pos-ef-${ses.nroSesion}`,
            ruleCode: 'VAL-02-MILESTONES',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'hitoEvaluativo',
            message: `Sesión #${ses.nroSesion}: El Examen Final debe planificarse en la Semana 20 (ubicado actualmente en Semana ${ses.semana}).`
          });
        }
      }

      // VAL-04: Instrument & Evidence Binding Rule
      if (ses.hitoEvaluativo && ses.hitoEvaluativo !== 'REGULAR') {
        if (!ses.instrumentoEvaluacion || ses.instrumentoEvaluacion === 'N_A') {
          issues.push({
            id: `val-04-inst-${ses.nroSesion}`,
            ruleCode: 'VAL-04-INSTRUMENT',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'instrumentoEvaluacion',
            message: `Sesión #${ses.nroSesion} (${ses.hitoEvaluativo}): Todo hito evaluativo requiere un instrumento formal (Rúbrica, Lista de Cotejo, Escala o Prueba Escrita).`
          });
        }
        if (!ses.evidenciaAprendizaje || ses.evidenciaAprendizaje.trim().length < 3) {
          issues.push({
            id: `val-04-evid-${ses.nroSesion}`,
            ruleCode: 'VAL-04-INSTRUMENT',
            severity: 'ERROR',
            sessionNumber: ses.nroSesion,
            fieldName: 'evidenciaAprendizaje',
            message: `Sesión #${ses.nroSesion} (${ses.hitoEvaluativo}): Debe registrarse la evidencia de aprendizaje verificable.`
          });
        }
      }

      // VAL-03: Didactic Completeness Rule
      const requiredFields: (keyof ScuSesionMatriz7Model)[] = [
        'unidadTematica',
        'contenidoEspecifico',
        'saberConceptual',
        'saberProcedimental',
        'saberActitudinal',
        'criterioDesempeno'
      ];

      requiredFields.forEach((field) => {
        const val = ses[field] as string;
        if (!val || val.trim().length < 3) {
          issues.push({
            id: `val-03-${field}-${ses.nroSesion}`,
            ruleCode: 'VAL-03-DIDACTIC',
            severity: 'WARNING',
            sessionNumber: ses.nroSesion,
            fieldName: field,
            message: `Sesión #${ses.nroSesion}: Campo '${field}' se encuentra incompleto o no detallado.`
          });
        }
      });
    });

    // Global Milestone Presence Validation
    if (!milestonesFound.primerParcial) {
      issues.push({
        id: 'val-02-missing-pp',
        ruleCode: 'VAL-02-MILESTONES',
        severity: 'ERROR',
        message: 'Falta Hito Obligatorio: Primer Parcial (debe ubicarse en Semana 7).'
      });
    }
    if (!milestonesFound.segundoParcial) {
      issues.push({
        id: 'val-02-missing-sp',
        ruleCode: 'VAL-02-MILESTONES',
        severity: 'ERROR',
        message: 'Falta Hito Obligatorio: Segundo Parcial (debe ubicarse en Semana 14).'
      });
    }
    if (!milestonesFound.examenFinal) {
      issues.push({
        id: 'val-02-missing-ef',
        ruleCode: 'VAL-02-MILESTONES',
        severity: 'ERROR',
        message: 'Falta Hito Obligatorio: Examen Final (debe ubicarse en Semana 20).'
      });
    }

    const totalErrors = issues.filter(i => i.severity === 'ERROR').length;
    const totalWarnings = issues.filter(i => i.severity === 'WARNING').length;

    return {
      isValid: totalErrors === 0,
      hasErrors: totalErrors > 0,
      hasWarnings: totalWarnings > 0,
      totalErrors,
      totalWarnings,
      issues,
      milestonesFound
    };
  }
}
