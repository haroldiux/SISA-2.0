-- ============================================================================
-- Flyway Migration: V4__docentes_adicionales_seed.sql
-- Module: Seed Docentes y Asignaciones para Pruebas del Gateway SEA
-- ============================================================================

INSERT INTO sea_grupos (id, codigo_grupo, tipo_clase, docente_nombre, docente_ci, horario, aula, campus, materia_id) VALUES
    ('grp-sis101-g1', 'G1', 'TEORICA', 'Ing. Harold Iriarte Rojas', '5241890-CB', 'Lun/Mie 09:15-10:45', 'Aula 201', 'Juan Pablo II', 'mat-sis101'),
    ('grp-sis101-g2', 'G2', 'PRACTICA', 'Ing. Harold Iriarte Rojas', '5241890-CB', 'Mar/Jue 11:00-12:30', 'Lab 102', 'Juan Pablo II', 'mat-sis101'),
    ('grp-med101-g1', 'G1', 'TEORICA', 'Dra. Elena Vargas Flores', '6109244-CB', 'Lun a Jue 08:00-09:30', 'Aula Magna A', 'Campus Colonial', 'mat-med101')
ON CONFLICT (id) DO UPDATE SET
    codigo_grupo = EXCLUDED.codigo_grupo,
    tipo_clase = EXCLUDED.tipo_clase,
    docente_nombre = EXCLUDED.docente_nombre,
    docente_ci = EXCLUDED.docente_ci,
    horario = EXCLUDED.horario,
    aula = EXCLUDED.aula,
    campus = EXCLUDED.campus,
    materia_id = EXCLUDED.materia_id;
