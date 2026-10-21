-- ============================================================================
-- Flyway Migration: V7__student_attendance_tracking.sql
-- Module: Student Roster & Attendance Tracking with Cross-Career Grouping
-- ============================================================================

-- 1. Class Attendance Sessions Table
CREATE TABLE IF NOT EXISTS asistencias_sesiones (
    id BIGSERIAL PRIMARY KEY,
    materia_codigo VARCHAR(30) NOT NULL,
    materia_nombre VARCHAR(255) NOT NULL,
    gestion_codigo VARCHAR(20) NOT NULL DEFAULT '2-2026',
    fecha DATE NOT NULL,
    tipo_clase VARCHAR(20) NOT NULL DEFAULT 'TEORICA',
    comision VARCHAR(20) NOT NULL DEFAULT 'TA-01',
    tema VARCHAR(500),
    observaciones TEXT,
    registrado_por VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tipo_clase CHECK (tipo_clase IN ('TEORICA', 'PRACTICA', 'LABORATORIO', 'CLINICA')),
    CONSTRAINT uq_sesion_asistencia UNIQUE (materia_codigo, fecha, tipo_clase, comision)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_sesiones_materia ON asistencias_sesiones(materia_codigo);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesiones_fecha ON asistencias_sesiones(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesiones_gestion ON asistencias_sesiones(gestion_codigo);

-- 2. Student Attendance Marks Table
CREATE TABLE IF NOT EXISTS asistencias_estudiantes (
    id BIGSERIAL PRIMARY KEY,
    sesion_id BIGINT NOT NULL REFERENCES asistencias_sesiones(id) ON DELETE CASCADE,
    estudiante_codigo VARCHAR(50) NOT NULL,
    estudiante_nombre VARCHAR(255) NOT NULL,
    carrera_codigo VARCHAR(30) NOT NULL DEFAULT 'CARSIS',
    carrera_nombre VARCHAR(255) NOT NULL DEFAULT 'Ingeniería de Sistemas',
    estado VARCHAR(20) NOT NULL DEFAULT 'PRESENTE',
    observacion VARCHAR(500),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_estado_asistencia CHECK (estado IN ('PRESENTE', 'FALTA', 'ATRASO', 'LICENCIA')),
    CONSTRAINT uq_estudiante_sesion UNIQUE (sesion_id, estudiante_codigo)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_est_sesion ON asistencias_estudiantes(sesion_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_est_codigo ON asistencias_estudiantes(estudiante_codigo);
CREATE INDEX IF NOT EXISTS idx_asistencias_est_carrera ON asistencias_estudiantes(carrera_codigo);
CREATE INDEX IF NOT EXISTS idx_asistencias_est_estado ON asistencias_estudiantes(estado);
