/**
 * Frontend models corresponding to the UNITEPC SEA Gateway DTOs.
 *
 * @author GentleAI SISA Architecture Team
 */

export type SeaGatewayStatus = 'online' | 'offline' | 'sync';

export interface BranchOfficeDto {
  id: string;
  code: string;
  name: string;
}

export interface CareerDto {
  id: string;
  code: string;
  name: string;
  branchOfficeCode?: string;
}

export interface CourseDto {
  id: string;
  code: string;
  name: string;
  semester?: number;
  syllabusCourseId?: string;
  careerCode?: string;
}

export interface GroupItemDto {
  id: string;
  name: string;
  classType: string;
  teacherName: string;
  teacherCi?: string;
  classroom?: string;
  schedule?: string;
  campus?: string;
  enrolledStudentsCount?: number;
}

export interface StudentItemDto {
  id: string;
  code: string;
  firstName: string;
  firstLastName: string;
  secondLastName?: string;
}

export interface CampusDto {
  id: string;
  name: string;
  branchOfficeId?: string;
}

export interface DocenteItemDto {
  ci: string;
  nombreCompleto: string;
  email: string;
  sedeCodigo?: string;
  carreraPrincipal?: string;
  materiasNombres?: string[];
  grupos?: GroupItemDto[];
}

export interface TimeFrameDto {
  id: string;
  name: string;
  year: string;
  term: string;
  active: boolean;
}
