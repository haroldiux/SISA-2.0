import { ScuAuditStatusEnum } from '../enums/scu-audit-status.enum';

/**
 * In situ audit and recurrence models.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuAuditoriaInSituModel {
  id?: number;
  asignacionId: number;
  asignaturaNombre?: string;
  docenteNombre?: string;
  carreraNombre?: string;
  sedeNombre?: string;
  aula?: string;
  auditorId?: number;
  auditorNombre?: string;
  sesionProgramadaId?: number;
  semanaProgramada?: number;
  nroSesionProgramada?: number;
  temaProgramado?: string;
  fechaHoraAuditoria?: string;
  puntualidadDocente: 'PUNTUAL' | 'ATRASO_LEVE' | 'ATRASO_GRAVE' | 'AUSENTE';
  concordanciaTema: 'CONFORME_PAC' | 'TEMA_ADELANTADO' | 'TEMA_ATRASADO' | 'TEMA_NO_PLANIFICADO';
  momentoObservado: 'INICIO' | 'DESARROLLO' | 'CIERRE';
  recursosVerificados?: string[];
  estudiantesPresentes: number;
  estudiantesInscritos: number;
  porcentajeAsistencia?: number;
  observacionesAuditor?: string;
  estado: ScuAuditStatusEnum;
  conformidadDocente?: string;
  observacionesDocente?: string;
  fechaFirmaDocente?: string;
  hashFirmaDigital?: string;
}

export interface ScuReincidenciaModel {
  id: number;
  docenteId: number;
  docenteNombre: string;
  gestionId: number;
  gestionCodigo: string;
  auditoriaId?: number;
  nroInfraccion: number;
  nivel: 'NIVEL_1' | 'NIVEL_2' | 'NIVEL_3';
  motivo: string;
  estado: 'NOTIFICADO' | 'PLAN_ACCION_REQUERIDO' | 'ESCALADO_VICERRECTORADO' | 'SUBSANADO';
  planAccionId?: number;
  planCompromisoMejora?: string;
  planFechaLimite?: string;
  planEstado?: string;
  creadoEn: string;
}
