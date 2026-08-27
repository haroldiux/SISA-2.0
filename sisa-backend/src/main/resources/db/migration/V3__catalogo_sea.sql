-- ============================================================================
-- Flyway Migration: V3__catalogo_sea.sql
-- Module: UNITEPC SEA Gateway Catalog & Local Mirroring Schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS sea_sedes (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS sea_carreras (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    sede_codigo VARCHAR(20) REFERENCES sea_sedes(codigo)
);

CREATE TABLE IF NOT EXISTS sea_materias (
    id VARCHAR(64) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    semestre SMALLINT NOT NULL DEFAULT 1,
    syllabus_course_id VARCHAR(64) NULL,
    carrera_id VARCHAR(64) REFERENCES sea_carreras(id)
);

CREATE TABLE IF NOT EXISTS sea_grupos (
    id VARCHAR(64) PRIMARY KEY,
    codigo_grupo VARCHAR(20) NOT NULL,
    tipo_clase VARCHAR(20) NOT NULL DEFAULT 'TEORICA',
    docente_nombre VARCHAR(150) NOT NULL,
    docente_ci VARCHAR(30) NULL,
    horario VARCHAR(80) NULL,
    aula VARCHAR(50) NULL,
    campus VARCHAR(100) NULL,
    materia_id VARCHAR(64) REFERENCES sea_materias(id)
);

CREATE INDEX IF NOT EXISTS idx_sea_carreras_sede ON sea_carreras(sede_codigo);
CREATE INDEX IF NOT EXISTS idx_sea_materias_carrera ON sea_materias(carrera_id);
CREATE INDEX IF NOT EXISTS idx_sea_grupos_materia ON sea_grupos(materia_id);

-- Initial seed data for offline fallback resilience (ACL Cache)
INSERT INTO sea_sedes (id, codigo, nombre) VALUES
    ('sede-cbba', 'CBBA', 'Cochabamba - Campus Colonial / Juan Pablo II'),
    ('sede-lpz', 'LPZ', 'La Paz - Campus Central'),
    ('sede-scz', 'SCZ', 'Santa Cruz - Campus El Bajío'),
    ('sede-cbb-tun', 'CBB-TUN', 'Cochabamba - Sub Sede Tunari'),
    ('sede-oru', 'ORU', 'Oruro - Campus Pagador')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre;

INSERT INTO sea_carreras (id, codigo, nombre, sede_codigo) VALUES
    ('car-sistemas-cbba', 'SIS', 'Ingeniería de Sistemas', 'CBBA'),
    ('car-industrial-cbba', 'IND', 'Ingeniería Industrial', 'CBBA'),
    ('car-medicina-cbba', 'MED', 'Medicina Humana', 'CBBA'),
    ('car-facefa-cbba', 'FAC', 'Ciencias Económicas y Financieras (FACEFA)', 'CBBA'),
    ('car-derecho-cbba', 'DER', 'Derecho y Ciencias Jurídicas', 'CBBA')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    sede_codigo = EXCLUDED.sede_codigo;

INSERT INTO sea_materias (id, codigo, nombre, semestre, syllabus_course_id, carrera_id) VALUES
    ('mat-sis213', 'SIS-213', 'PROGRAMACIÓN III', 3, 'syl-sis213', 'car-sistemas-cbba'),
    ('mat-ind211', 'IND-211', 'COMPUTACIÓN APLICADA', 2, 'syl-ind211', 'car-industrial-cbba'),
    ('mat-idi101', 'IDI-101', 'TALLER DE IDIOMAS (QUECHUA/AYMARA)', 1, 'syl-idi101', 'car-facefa-cbba'),
    ('mat-sis101', 'SIS-101', 'ALGORITMOS Y PROGRAMACIÓN I', 1, 'syl-sis101', 'car-sistemas-cbba'),
    ('mat-med101', 'MED-101', 'ANATOMÍA HUMANA I', 1, 'syl-med101', 'car-medicina-cbba')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    semestre = EXCLUDED.semestre,
    syllabus_course_id = EXCLUDED.syllabus_course_id,
    carrera_id = EXCLUDED.carrera_id;

INSERT INTO sea_grupos (id, codigo_grupo, tipo_clase, docente_nombre, docente_ci, horario, aula, campus, materia_id) VALUES
    ('grp-sis213-g1', 'G1', 'TEORICA', 'Ing. Marcos Rojas', '4589201-CB', 'Lun/Mie 07:30-09:00', 'Aula 302', 'Juan Pablo II', 'mat-sis213'),
    ('grp-sis213-g2', 'G2', 'PRACTICA', 'Ing. Marcos Rojas', '4589201-CB', 'Mar/Jue 09:15-11:30', 'Lab 104', 'Juan Pablo II', 'mat-sis213'),
    ('grp-ind211-g1', 'G1', 'TEORICA', 'Ing. Marcos Rojas', '4589201-CB', 'Vie 14:00-17:00', 'Aula 204', 'Central', 'mat-ind211'),
    ('grp-idi101-g1', 'G1', 'PRACTICA', 'Lic. Martha Mamani', '3321874-CB', 'Sab 08:00-11:00', 'Aula 101', 'Central', 'mat-idi101')
ON CONFLICT (id) DO UPDATE SET
    codigo_grupo = EXCLUDED.codigo_grupo,
    tipo_clase = EXCLUDED.tipo_clase,
    docente_nombre = EXCLUDED.docente_nombre,
    docente_ci = EXCLUDED.docente_ci,
    horario = EXCLUDED.horario,
    aula = EXCLUDED.aula,
    campus = EXCLUDED.campus,
    materia_id = EXCLUDED.materia_id;
