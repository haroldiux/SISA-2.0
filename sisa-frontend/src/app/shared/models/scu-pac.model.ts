import { ScuPlanningStatusEnum } from '../enums/scu-planning-status.enum';
export {
  ScuUnidadAprendizajeModel,
  ScuBibliografiaModel,
  ScuProgramaAnaliticoModel
} from './scu-programa-analitico.model';

/**
 * PAC curriculum planning models.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuSesionMatriz7Model {
  id?: number;
  semana: number;
  nroSesion: number;
  fechaProgramada: string;
  tipoSesion: 'TEORICA' | 'PRACTICA' | 'LABORATORIO' | 'TALLER';
  unidadTematica: string;
  contenidoEspecifico: string;
  saberConceptual: string;
  saberProcedimental: string;
  saberActitudinal: string;
  criterioDesempeno: string;
  evidenciaAprendizaje: string;
  instrumentoEvaluacion: 'RUBRICA' | 'LISTA_COTEJO' | 'ESCALA_ESTIMATIVA' | 'PRUEBA_ESCRITA' | 'N_A';
  hitoEvaluativo: 'PRIMER_PARCIAL' | 'SEGUNDO_PARCIAL' | 'EXAMEN_FINAL' | 'SEGUNDA_INSTANCIA' | 'REGULAR';
}

export interface ScuPacModel {
  id?: number;
  asignacionId: number;
  estado: ScuPlanningStatusEnum;
  seccionesIdentificacion?: Record<string, string | number | boolean>;
  estrategiasMetodologicas?: string[];
  recursosDidacticos?: string[];
  normasCurso?: string[];
  observacionesRevision?: string;
  revisadoPorId?: number;
  revisadoPorNombre?: string;
  revisadoEn?: string;
  matriz7: ScuSesionMatriz7Model[];
  creadoEn?: string;
  actualizadoEn?: string;
}
