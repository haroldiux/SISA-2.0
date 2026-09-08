-- ============================================================================
-- Flyway Migration: V6__user_management_and_academic_assignments.sql
-- Module: Access Control & User Management (Change 08)
-- ============================================================================

-- 1. Extend usuarios table with password rotation and identity fields
ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS ci VARCHAR(30);
CREATE INDEX IF NOT EXISTS idx_usuarios_ci ON usuarios(ci);

-- 2. Update rol check constraint on usuarios to support ROLE_ADMIN
ALTER TABLE IF EXISTS usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE IF EXISTS usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN (
    'ROLE_ADMIN',
    'ROLE_DOCENTE',
    'ROLE_DIR_CARRERA',
    'ROLE_DIR_ACADEMICA',
    'ROLE_VICERRECTOR_SEDE',
    'ROLE_VICERRECTOR_NACIONAL'
));

-- 3. Academic Assignments table (multi-sede, multi-carrera, optional asignatura mapping)
CREATE TABLE IF NOT EXISTS usuario_asignaciones_academicas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    sede_id BIGINT REFERENCES sedes(id) ON DELETE SET NULL,
    carrera_id BIGINT REFERENCES carreras(id) ON DELETE SET NULL,
    asignatura_id BIGINT REFERENCES asignaturas(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_u_asig_usuario ON usuario_asignaciones_academicas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_u_asig_sede ON usuario_asignaciones_academicas(sede_id);
CREATE INDEX IF NOT EXISTS idx_u_asig_carrera ON usuario_asignaciones_academicas(carrera_id);
