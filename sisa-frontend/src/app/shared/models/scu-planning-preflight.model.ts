import { ScuPlanningStatusEnum } from '../enums/scu-planning-status.enum';

/**
 * Pre-flight compliance verification models for Academic Planning Trilogy.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuPreflightIssueModel {
  pillar: 'PROGRAMA' | 'PAC' | 'PLAN_CLASE';
  severity: 'ERROR' | 'WARNING';
  message: string;
  tabIndex: number;
  sessionNumber?: number;
  fieldName?: string;
}

export interface ScuPillar1ProgramaAuditModel {
  isValid: boolean;
  title: string;
  unitsCount: number;
}

export interface ScuPillar2PacAuditModel {
  isValid: boolean;
  title: string;
  sessionsCount: number;
  milestonesFound: {
    primerParcial: boolean;
    segundoParcial: boolean;
    examenFinal: boolean;
  };
}

export interface ScuPillar3PlanClaseAuditModel {
  isValid: boolean;
  title: string;
  totalSessions: number;
  validPlansCount: number;
}

export interface ScuPreflightResultModel {
  isEligible: boolean;
  pillar1Programa: ScuPillar1ProgramaAuditModel;
  pillar2Pac: ScuPillar2PacAuditModel;
  pillar3PlanClase: ScuPillar3PlanClaseAuditModel;
  issues: ScuPreflightIssueModel[];
}

export interface ScuDirectorFeedbackModel {
  reviewerName?: string;
  reviewDate?: string;
  status: ScuPlanningStatusEnum;
  observationNotes?: string;
  observedComponents?: string[];
}
