/**
 * Academic structures models.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuSedeModel {
  id: number;
  codigo: string;
  nombre: string;
  departamento: string;
  activo: boolean;
}

export interface ScuCarreraModel {
  id: number;
  codigo: string;
  nombre: string;
  facultad: string;
  activo: boolean;
}

export interface ScuGestionModel {
  id: number;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface ScuAsignacionDocenteModel {
  id: number;
  gestionId: number;
  gestionCodigo: string;
  docenteId: number;
  docenteNombre: string;
  carreraId: number;
  carreraNombre: string;
  asignaturaId: number;
  asignaturaCodigo: string;
  asignaturaNombre: string;
  semestre: number;
  campusId: number;
  campusNombre: string;
  sedeId: number;
  sedeNombre: string;
  grupoParalelo: string;
  turno: string;
  aula: string;
  diasSemana: string;
  horarioInicio: string;
  horarioFin: string;
}
