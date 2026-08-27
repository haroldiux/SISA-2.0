/**
 * Backend API endpoint path constants adhering to SEA and canonical clean routing.
 *
 * @author GentleAI SISA Architecture Team
 */
export const SCU_API = {
  BASE_URL: '/api/v1',
  AUTH: {
    LOGIN: '/api/v1/system/auth/login',
    REFRESH: '/api/v1/system/auth/refresh',
    ME: '/api/v1/system/auth/me'
  },
  ACADEMIC: {
    ASSIGNMENTS: '/api/v1/academic/assignments',
    CARRERAS: '/api/v1/academic/carreras',
    GESTIONES: '/api/v1/academic/gestiones',
    SEDES: '/api/v1/academic/sedes'
  },
  PLANNING: {
    PAC: '/api/v1/planificaciones/pac',
    PAC_BY_ASSIGNMENT: '/api/v1/planificaciones/pac/by-assignment',
    PAC_REVIEW: '/api/v1/planificaciones/pac',
    PAC_SUBMIT: '/api/v1/planificaciones/pac',
    SUBMIT: '/api/v1/planificaciones/submit',
    PROGRAMA: '/api/v1/planificaciones/programa-analitico',
    PROGRAMA_BY_ASSIGNMENT: '/api/v1/planificaciones/programa-analitico/by-assignment',
    PLAN_CLASE: '/api/v1/planificaciones/plan-clase',
    PLAN_CLASE_BY_SESSION: '/api/v1/planificaciones/plan-clase/by-session'
  },
  AUDIT: {
    MATCH: '/api/v1/auditorias/in-situ/match',
    FINALIZE: '/api/v1/auditorias/in-situ/finalize',
    SIGN: '/api/v1/auditorias/in-situ',
    RECURRENCE: '/api/v1/auditorias/recurrence'
  },
  OFFICE: {
    EXPORT_PAC: '/api/v1/office/export/pac',
    EXPORT_PLAN: '/api/v1/office/export/plan-clase',
    EXPORT_PROGRAMA: '/api/v1/office/export/programa-analitico',
    IMPORT_PAC: '/api/v1/office/import/pac',
    IMPORT_PLAN: '/api/v1/office/import/plan-clase',
    IMPORT_PROGRAMA: '/api/v1/office/import/programa-analitico'
  },
  CATALOGO_ACADEMICO: {
    BASE: '/api/v1/catalogo-academico',
    STATUS: '/api/v1/catalogo-academico/status',
    BRANCH_OFFICES: '/api/v1/catalogo-academico/branchOffices',
    CAREERS: '/api/v1/catalogo-academico/careers',
    COURSES: '/api/v1/catalogo-academico/courses',
    STUDENTS_BY_GROUP: '/api/v1/catalogo-academico/students/byGroup',
    CAMPUSES: '/api/v1/catalogo-academico/campuses',
    TIME_FRAMES: '/api/v1/catalogo-academico/timeFrames'
  }
};
