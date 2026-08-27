import { ScuPlanningStatusEnum } from '../enums/scu-planning-status.enum';

/**
 * Plan de Clase microdidactic planning models.
 *
 * @author GentleAI SISA Architecture Team
 */
export type ScuTipoMomentoPedagogico =
  | 'INTRODUCCION'
  | 'RESULTADOS_LOGROS'
  | 'CONTENIDOS'
  | 'CUERPO'
  | 'CONCLUSION'
  | 'INICIO'
  | 'DESARROLLO'
  | 'CIERRE';

export interface ScuMomentoPedagogicoModel {
  id?: number;
  tipoMomento: ScuTipoMomentoPedagogico;
  nombreMomento?: string;
  duracionMin: number;
  actividadesDocente: string;
  actividadesEstudiante?: string;
  indicadorEvaluacion?: string;
}

export interface ScuPlanClaseModel {
  id?: number;
  sesionId: number;
  semana?: number;
  nroSesion?: number;
  unidadTematica?: string;
  estado: ScuPlanningStatusEnum;
  duracionTotalMin: number;
  objetivoSesion: string;
  recursosDidacticos?: string[];
  momentos: ScuMomentoPedagogicoModel[];
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ScuDurationValidationResultModel {
  sum: number;
  target: number;
  difference: number;
  isValid: boolean;
  status: 'VALIDO' | 'EXCESO' | 'DEFICIT';
  message: string;
}
