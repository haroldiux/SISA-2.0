/**
 * Validation and autosave state models for PAC Matriz 7 and academic planning.
 *
 * @author GentleAI SISA Architecture Team
 */

export enum ScuAutoSaveStateEnum {
  SIN_CAMBIOS = 'SIN_CAMBIOS',
  CAMBIOS_PENDIENTES = 'CAMBIOS_PENDIENTES',
  GUARDANDO = 'GUARDANDO',
  GUARDADO = 'GUARDADO',
  ERROR = 'ERROR'
}

export type ScuValidationRuleCode =
  | 'VAL-01-CHRONOLOGY'
  | 'VAL-02-MILESTONES'
  | 'VAL-03-DIDACTIC'
  | 'VAL-04-INSTRUMENT'
  | 'VAL-05-DENSITY';

export type ScuValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ScuValidationIssueModel {
  id: string;
  ruleCode: ScuValidationRuleCode;
  severity: ScuValidationSeverity;
  sessionNumber?: number;
  fieldName?: string;
  message: string;
}

export interface ScuValidationMilestonesFound {
  primerParcial: boolean;
  segundoParcial: boolean;
  examenFinal: boolean;
}

export interface ScuValidationResultModel {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  totalErrors: number;
  totalWarnings: number;
  issues: ScuValidationIssueModel[];
  milestonesFound: ScuValidationMilestonesFound;
}

export interface ScuValidationConfig {
  termStartDate: string;
  termEndDate: string;
  minSessions: number;
  maxSessions: number;
}

export const DEFAULT_VALIDATION_CONFIG: ScuValidationConfig = {
  termStartDate: '2026-02-16',
  termEndDate: '2026-07-03',
  minSessions: 36,
  maxSessions: 54
};
