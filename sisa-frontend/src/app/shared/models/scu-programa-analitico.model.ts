import { ScuPlanningStatusEnum } from '../enums/scu-planning-status.enum';

/**
 * Macro-curricular Programa Analítico models.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuUnidadAprendizajeModel {
  id?: number;
  numeroUnidad: number;
  titulo: string;
  saberesConceptuales: string;
  saberesProcedimentales: string;
  saberesActitudinales: string;
  criteriosDesempeno: string;
  horasAcademicas: number;
}

export interface ScuBibliografiaModel {
  id?: number;
  tipo: 'BASICA' | 'COMPLEMENTARIA';
  citaApa: string;
  autor?: string;
  anio?: number;
  titulo?: string;
  editorialUrl?: string;
}

export interface ScuProgramaAnaliticoModel {
  id?: number;
  asignacionId: number;
  estado: ScuPlanningStatusEnum;
  caracterizacion: string;
  macroCompetencia: string;
  sistemaEvaluacion: string;
  unidades: ScuUnidadAprendizajeModel[];
  bibliografia: ScuBibliografiaModel[];
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ScuApaValidationItemResultModel {
  citation: string;
  isValid: boolean;
  authorMatched?: string;
  yearMatched?: number;
  titleMatched?: string;
  publisherMatched?: string;
  urlOrDoiMatched?: string;
  errorMessage?: string;
}

export interface ScuApaValidationSummaryModel {
  hasBasica: boolean;
  validBasicaCount: number;
  validTotalCount: number;
  allValid: boolean;
}
