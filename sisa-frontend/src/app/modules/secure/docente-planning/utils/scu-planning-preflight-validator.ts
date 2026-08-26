import { ScuPacModel } from '@shared/models/scu-pac.model';
import { ScuPlanClaseModel } from '@shared/models/scu-plan-clase.model';
import { ScuProgramaAnaliticoModel } from '@shared/models/scu-programa-analitico.model';
import { ScuPreflightIssueModel, ScuPreflightResultModel } from '@shared/models/scu-planning-preflight.model';
import { ScuDurationValidator } from './scu-duration-validator';
import { ScuApaValidator } from './scu-apa-validator';
import { ScuPacValidator } from './scu-pac-validator';

/**
 * Composite 3-tier pre-flight compliance auditor for Academic Planning Trilogy.
 *
 * Evaluates Pillar 1 (Programa Analítico), Pillar 2 (PAC Matriz 7), and Pillar 3 (Planes de Clase)
 * prior to formal Career Direction submission.
 *
 * @author GentleAI SISA Architecture Team
 */
export class ScuPlanningPreflightValidator {

  public static audit(
    programa: ScuProgramaAnaliticoModel | null | undefined,
    pac: ScuPacModel | null | undefined,
    planesMap: Map<number, ScuPlanClaseModel>
  ): ScuPreflightResultModel {
    const issues: ScuPreflightIssueModel[] = [];

    // ==========================================
    // Pillar 1: Programa Analítico Audit
    // ==========================================
    let p1Valid = true;
    if (!programa) {
      issues.push({
        pillar: 'PROGRAMA',
        severity: 'ERROR',
        message: 'Programa Analítico no ha sido registrado.',
        tabIndex: 0
      });
      p1Valid = false;
    } else {
      if (!programa.caracterizacion || programa.caracterizacion.trim().length < 20) {
        issues.push({
          pillar: 'PROGRAMA',
          severity: 'ERROR',
          message: 'Caracterización de la Asignatura incompleta (mínimo 20 caracteres).',
          tabIndex: 0,
          fieldName: 'caracterizacion'
        });
        p1Valid = false;
      }

      if (!programa.macroCompetencia || programa.macroCompetencia.trim().length < 20) {
        issues.push({
          pillar: 'PROGRAMA',
          severity: 'ERROR',
          message: 'Macro-Competencia incompleta (mínimo 20 caracteres).',
          tabIndex: 0,
          fieldName: 'macroCompetencia'
        });
        p1Valid = false;
      }

      if (!programa.unidades || programa.unidades.length === 0) {
        issues.push({
          pillar: 'PROGRAMA',
          severity: 'ERROR',
          message: 'Debe registrar al menos 1 Unidad de Aprendizaje.',
          tabIndex: 0
        });
        p1Valid = false;
      } else {
        programa.unidades.forEach((u, idx) => {
          if (!u.titulo || u.titulo.trim().length < 3) {
            issues.push({
              pillar: 'PROGRAMA',
              severity: 'ERROR',
              message: `Unidad ${idx + 1}: El título de la unidad es requerido.`,
              tabIndex: 0
            });
            p1Valid = false;
          }
          if (!u.saberesConceptuales || u.saberesConceptuales.trim().length < 3) {
            issues.push({
              pillar: 'PROGRAMA',
              severity: 'ERROR',
              message: `Unidad ${idx + 1}: Saberes Conceptuales incompletos.`,
              tabIndex: 0
            });
            p1Valid = false;
          }
          if (!u.saberesProcedimentales || u.saberesProcedimentales.trim().length < 3) {
            issues.push({
              pillar: 'PROGRAMA',
              severity: 'ERROR',
              message: `Unidad ${idx + 1}: Saberes Procedimentales incompletos.`,
              tabIndex: 0
            });
            p1Valid = false;
          }
          if (!u.saberesActitudinales || u.saberesActitudinales.trim().length < 3) {
            issues.push({
              pillar: 'PROGRAMA',
              severity: 'ERROR',
              message: `Unidad ${idx + 1}: Saberes Actitudinales incompletos.`,
              tabIndex: 0
            });
            p1Valid = false;
          }
          if (!u.horasAcademicas || u.horasAcademicas <= 0) {
            issues.push({
              pillar: 'PROGRAMA',
              severity: 'ERROR',
              message: `Unidad ${idx + 1}: Horas académicas deben ser mayores a 0.`,
              tabIndex: 0
            });
            p1Valid = false;
          }
        });
      }

      const bibSummary = ScuApaValidator.validateBibliographyList(programa.bibliografia || []);
      if (!bibSummary.hasBasica || bibSummary.validBasicaCount === 0) {
        issues.push({
          pillar: 'PROGRAMA',
          severity: 'ERROR',
          message: 'Debe incluir al menos 1 Bibliografía Básica en formato válido APA 7.',
          tabIndex: 0
        });
        p1Valid = false;
      }
    }

    // ==========================================
    // Pillar 2: PAC Matriz 7 Audit
    // ==========================================
    let p2Valid = true;
    const pacResult = ScuPacValidator.validate(pac);
    const sessions = pac?.matriz7 || [];

    if (pacResult.hasErrors) {
      pacResult.issues
        .filter(i => i.severity === 'ERROR')
        .forEach(i => {
          issues.push({
            pillar: 'PAC',
            severity: 'ERROR',
            message: i.message,
            tabIndex: 1,
            sessionNumber: i.sessionNumber,
            fieldName: i.fieldName
          });
        });
      p2Valid = false;
    }

    // ==========================================
    // Pillar 3: Planes de Clase Audit
    // ==========================================
    let p3Valid = true;
    let validPlansCount = 0;

    if (sessions.length === 0) {
      issues.push({
        pillar: 'PLAN_CLASE',
        severity: 'ERROR',
        message: 'No existen sesiones programadas en PAC para verificar Planes de Clase.',
        tabIndex: 2
      });
      p3Valid = false;
    } else {
      sessions.forEach(s => {
        const plan = planesMap.get(s.nroSesion);
        if (!plan) {
          issues.push({
            pillar: 'PLAN_CLASE',
            severity: 'ERROR',
            message: `Sesión #${s.nroSesion}: Falta registrar Plan de Clase.`,
            tabIndex: 2,
            sessionNumber: s.nroSesion
          });
          p3Valid = false;
        } else {
          const ini = plan.momentos?.find(m => m.tipoMomento === 'INICIO')?.duracionMin || 0;
          const des = plan.momentos?.find(m => m.tipoMomento === 'DESARROLLO')?.duracionMin || 0;
          const cie = plan.momentos?.find(m => m.tipoMomento === 'CIERRE')?.duracionMin || 0;
          const durCheck = ScuDurationValidator.validate(ini, des, cie, plan.duracionTotalMin || 180);

          if (!durCheck.isValid) {
            issues.push({
              pillar: 'PLAN_CLASE',
              severity: 'ERROR',
              message: `Sesión #${s.nroSesion}: Desbalance de duración (${durCheck.message}).`,
              tabIndex: 2,
              sessionNumber: s.nroSesion
            });
            p3Valid = false;
          } else {
            validPlansCount++;
          }
        }
      });
    }

    const hasBlockingErrors = issues.some(i => i.severity === 'ERROR');
    const isEligible = p1Valid && p2Valid && p3Valid && !hasBlockingErrors;

    return {
      isEligible,
      pillar1Programa: {
        isValid: p1Valid,
        title: 'Programa Analítico',
        unitsCount: programa?.unidades?.length || 0
      },
      pillar2Pac: {
        isValid: p2Valid,
        title: 'PAC Matriz 7',
        sessionsCount: sessions.length,
        milestonesFound: pacResult.milestonesFound
      },
      pillar3PlanClase: {
        isValid: p3Valid,
        title: 'Planes de Clase',
        totalSessions: sessions.length,
        validPlansCount
      },
      issues
    };
  }
}
