-- ============================================================================
-- Flyway Migration: V8__seguimiento_clases_y_semaforo_avance.sql
-- Module: Seguimiento Agil de Sesion Docente y Semaforo Curricular de Carrera
-- Author: GentleAI SISA Architecture Team
-- Management: II-2026 (Semana 13 de Corte)
-- ============================================================================

-- 1. Crear Tabla de Seguimiento de Sesiones Docentes
CREATE TABLE IF NOT EXISTS seguimientos_clases (
    id BIGSERIAL PRIMARY KEY,
    sesion_matriz7_id BIGINT REFERENCES sesiones_matriz7(id) ON DELETE SET NULL,
    materia_codigo VARCHAR(30) NOT NULL,
    carrera_codigo VARCHAR(30) NOT NULL DEFAULT 'CARSIS',
    docente_ci VARCHAR(30) NOT NULL,
    fecha_ejecucion DATE NOT NULL,
    tipo_clase VARCHAR(20) NOT NULL DEFAULT 'TEORICA',
    comision VARCHAR(20) NOT NULL DEFAULT 'TA-01',
    tema_oficial VARCHAR(500),
    tema_ejecutado VARCHAR(500),
    recursos_planificados JSONB NOT NULL DEFAULT '[]'::jsonb,
    recursos_utilizados JSONB NOT NULL DEFAULT '[]'::jsonb,
    momento_inicio_cumplido BOOLEAN NOT NULL DEFAULT TRUE,
    momento_desarrollo_cumplido BOOLEAN NOT NULL DEFAULT TRUE,
    momento_cierre_cumplido BOOLEAN NOT NULL DEFAULT TRUE,
    estado_cumplimiento VARCHAR(30) NOT NULL DEFAULT 'TOTALMENTE_CUMPLIDO',
    cumplimiento_score NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    observaciones_docente TEXT,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de Dominio
    CONSTRAINT chk_estado_cumplimiento CHECK (
        estado_cumplimiento IN ('TOTALMENTE_CUMPLIDO', 'PARCIALMENTE_CUMPLIDO', 'NO_CUMPLIDO')
    ),
    CONSTRAINT chk_cumplimiento_score CHECK (cumplimiento_score IN (0.00, 0.50, 1.00)),
    CONSTRAINT chk_tipo_clase_seg CHECK (tipo_clase IN ('TEORICA', 'PRACTICA', 'LABORATORIO', 'CLINICA')),

    -- Restriccion de Unicidad por Sesion de Planificacion
    CONSTRAINT uq_seguimiento_sesion_matriz7 UNIQUE (sesion_matriz7_id),

    -- Restriccion de Unicidad por Coordenadas Fisicas de Clase
    CONSTRAINT uq_seguimiento_materia_fecha_comision UNIQUE (materia_codigo, fecha_ejecucion, tipo_clase, comision)
);

-- 2. Indices de Alto Desempeno
CREATE INDEX IF NOT EXISTS idx_seguimientos_materia_codigo ON seguimientos_clases(materia_codigo);
CREATE INDEX IF NOT EXISTS idx_seguimientos_docente_ci ON seguimientos_clases(docente_ci);
CREATE INDEX IF NOT EXISTS idx_seguimientos_fecha ON seguimientos_clases(fecha_ejecucion);
CREATE INDEX IF NOT EXISTS idx_seguimientos_carrera ON seguimientos_clases(carrera_codigo);
CREATE INDEX IF NOT EXISTS idx_seguimientos_sesion_matriz7 ON seguimientos_clases(sesion_matriz7_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_cumplimiento ON seguimientos_clases(estado_cumplimiento);

-- 3. Semillas de Datos Representativas para la Demo Institucional (Semana 13 de Corte)
-- Caso 1: Materia VERDE (SIS-213 Programacion III - Carlos Mendoza CI: 4892104)
INSERT INTO seguimientos_clases (
    sesion_matriz7_id, materia_codigo, carrera_codigo, docente_ci, fecha_ejecucion,
    tipo_clase, comision, tema_oficial, tema_ejecutado, recursos_planificados, recursos_utilizados,
    momento_inicio_cumplido, momento_desarrollo_cumplido, momento_cierre_cumplido,
    estado_cumplimiento, cumplimiento_score, observaciones_docente
) VALUES
(NULL, 'SIS-213', 'CARSIS', '4892104', '2026-10-30', 'TEORICA', 'TA-01',
 'Mapeo Objeto-Relacional Avanzado y Herencia en JPA',
 'Mapeo Objeto-Relacional Avanzado y Herencia en JPA',
 '["Proyector multimedia", "IDE IntelliJ IDEA", "Pizarra acrilica"]'::jsonb,
 '["Proyector multimedia", "IDE IntelliJ IDEA", "Pizarra acrilica"]'::jsonb,
 TRUE, TRUE, TRUE, 'TOTALMENTE_CUMPLIDO', 1.00, 'Sesion completada al 100% con ejercicios practicos.'),
(NULL, 'SIS-213', 'CARSIS', '4892104', '2026-10-28', 'TEORICA', 'TA-01',
 'Relaciones OneToMany y ManyToOne bidireccionales',
 'Relaciones OneToMany y ManyToOne bidireccionales',
 '["Proyector multimedia", "IDE IntelliJ IDEA"]'::jsonb,
 '["Proyector multimedia", "IDE IntelliJ IDEA"]'::jsonb,
 TRUE, TRUE, TRUE, 'TOTALMENTE_CUMPLIDO', 1.00, 'Ejercicios de codigo en vivo sin incidencias.'),
(NULL, 'SIS-213', 'CARSIS', '4892104', '2026-10-23', 'TEORICA', 'TA-01',
 'Consultas JPQL avanzadas y Proyecciones',
 'Consultas JPQL avanzadas y Proyecciones',
 '["Proyector multimedia", "Pizarra acrilica"]'::jsonb,
 '["Proyector multimedia"]'::jsonb,
 TRUE, TRUE, FALSE, 'PARCIALMENTE_CUMPLIDO', 0.50, 'Falto tiempo para concluir el cierre evaluativo; se retoma.');

-- Caso 2: Materia AMARILLO (SIS-311 Base de Datos I - Roberto Gomez CI: 3719024)
INSERT INTO seguimientos_clases (
    sesion_matriz7_id, materia_codigo, carrera_codigo, docente_ci, fecha_ejecucion,
    tipo_clase, comision, tema_oficial, tema_ejecutado, recursos_planificados, recursos_utilizados,
    momento_inicio_cumplido, momento_desarrollo_cumplido, momento_cierre_cumplido,
    estado_cumplimiento, cumplimiento_score, observaciones_docente
) VALUES
(NULL, 'SIS-311', 'CARSIS', '3719024', '2026-10-29', 'TEORICA', 'TA-01',
 'Formas Normales 1FN, 2FN y 3FN',
 'Formas Normales 1FN y 2FN',
 '["Proyector multimedia", "Pizarra acrilica"]'::jsonb,
 '["Proyector multimedia", "Pizarra acrilica"]'::jsonb,
 TRUE, TRUE, FALSE, 'PARCIALMENTE_CUMPLIDO', 0.50, 'Se requirio reforzar 2FN; la 3FN se difiere.'),
(NULL, 'SIS-311', 'CARSIS', '3719024', '2026-10-27', 'TEORICA', 'TA-01',
 'Dependencias Funcionales y Diagramas de Dependencia',
 'Dependencias Funcionales',
 '["Pizarra acrilica"]'::jsonb,
 '["Pizarra acrilica"]'::jsonb,
 TRUE, TRUE, TRUE, 'TOTALMENTE_CUMPLIDO', 1.00, 'Clase normal.');

-- Caso 3: Materia ROJO POR DESFASE GRAVE (MAT-101 Calculo I - Jaime Villarroel CI: 5291038)
INSERT INTO seguimientos_clases (
    sesion_matriz7_id, materia_codigo, carrera_codigo, docente_ci, fecha_ejecucion,
    tipo_clase, comision, tema_oficial, tema_ejecutado, recursos_planificados, recursos_utilizados,
    momento_inicio_cumplido, momento_desarrollo_cumplido, momento_cierre_cumplido,
    estado_cumplimiento, cumplimiento_score, observaciones_docente
) VALUES
(NULL, 'MAT-101', 'CARSIS', '5291038', '2026-10-28', 'TEORICA', 'TA-01',
 'Derivadas de Funciones Compuestas (Regla de la Cadena)',
 'Repaso de Derivadas Basicas',
 '["Pizarra acrilica"]'::jsonb,
 '["Pizarra acrilica"]'::jsonb,
 TRUE, FALSE, FALSE, 'NO_CUMPLIDO', 0.00, 'Bajo nivel de comprension inicial; se debio retroceder a conceptos previos.');
