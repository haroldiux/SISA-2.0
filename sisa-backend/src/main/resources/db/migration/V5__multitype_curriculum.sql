-- ============================================================================
-- Flyway Migration: V5__multitype_curriculum.sql
-- Module: Multitype Curriculum Coordination (Change 07)
-- ============================================================================

-- 1. SEA Gateway Catalog tables
ALTER TABLE IF EXISTS sea_materias ADD COLUMN IF NOT EXISTS course_type VARCHAR(50);
ALTER TABLE IF EXISTS sea_grupos ADD COLUMN IF NOT EXISTS component_type VARCHAR(10);

-- 2. Core SISA Planning tables
ALTER TABLE IF EXISTS pacs ADD COLUMN IF NOT EXISTS pac_type VARCHAR(20);
ALTER TABLE IF EXISTS planes_clase ADD COLUMN IF NOT EXISTS plan_type VARCHAR(30);

-- 3. Teacher Assignments & Courses
ALTER TABLE IF EXISTS asignaciones_docentes ADD COLUMN IF NOT EXISTS course_type VARCHAR(50);
ALTER TABLE IF EXISTS asignaciones_docentes ADD COLUMN IF NOT EXISTS component_type VARCHAR(10);
ALTER TABLE IF EXISTS asignaturas ADD COLUMN IF NOT EXISTS course_type VARCHAR(50);

-- 4. Compatibility fallback aliases (if defined with scu_ prefix in specific environments)
ALTER TABLE IF EXISTS scu_asignaciones_docente ADD COLUMN IF NOT EXISTS course_type VARCHAR(50);
ALTER TABLE IF EXISTS scu_asignaciones_docente ADD COLUMN IF NOT EXISTS component_type VARCHAR(10);
ALTER TABLE IF EXISTS scu_pacs ADD COLUMN IF NOT EXISTS pac_type VARCHAR(20);
ALTER TABLE IF EXISTS scu_planes_clase ADD COLUMN IF NOT EXISTS plan_type VARCHAR(30);
ALTER TABLE IF EXISTS scu_course ADD COLUMN IF NOT EXISTS course_type VARCHAR(50);
ALTER TABLE IF EXISTS scu_group ADD COLUMN IF NOT EXISTS component_type VARCHAR(10);
ALTER TABLE IF EXISTS scu_pac ADD COLUMN IF NOT EXISTS pac_type VARCHAR(20);
ALTER TABLE IF EXISTS scu_plan_clase ADD COLUMN IF NOT EXISTS plan_type VARCHAR(30);

-- 5. Indexes for fast lookup by component and document types
CREATE INDEX IF NOT EXISTS idx_sea_grupos_component_type ON sea_grupos(component_type);
CREATE INDEX IF NOT EXISTS idx_pacs_pac_type ON pacs(pac_type);
CREATE INDEX IF NOT EXISTS idx_planes_clase_plan_type ON planes_clase(plan_type);
