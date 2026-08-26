-- ============================================================================
-- SISA • Database DDL Initial Migration
-- PostgreSQL 16+
-- Schema: public
-- Author: GentleAI SISA Architecture Team
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SEDES REGIONALES (Cochabamba, La Paz, El Alto, Cobija)
CREATE TABLE sedes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sedes (codigo, nombre, departamento) VALUES
('CBB', 'Sede Central Cochabamba', 'Cochabamba'),
('LPZ', 'Sede Regional La Paz', 'La Paz'),
('EAL', 'Sede Regional El Alto', 'La Paz'),
('CBJ', 'Sede Regional Cobija', 'Pando');

-- 2. CAMPUS UNIVERSITARIOS
CREATE TABLE campus (
    id BIGSERIAL PRIMARY KEY,
    sede_id BIGINT NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO campus (sede_id, nombre, direccion) VALUES
(1, 'Campus Colonial CBB', 'Av. Blanco Galindo Km 5'),
(1, 'Campus Juan Pablo II', 'Calle Santivanez y Junin'),
(2, 'Campus Miraflores LPZ', 'Av. Busch esq. Villalobos'),
(3, 'Campus Villa Dolores EAL', 'Av. Antofagasta #102'),
(4, 'Campus Central Cobija', 'Av. 9 de Febrero s/n');

-- 3. CARRERAS
CREATE TABLE carreras (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    facultad VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO carreras (codigo, nombre, facultad) VALUES
('MED', 'Medicina Humana', 'Facultad de Ciencias de la Salud'),
('SIS', 'Ingeniería de Sistemas', 'Facultad de Ingeniería'),
('DER', 'Derecho y Ciencias Jurídicas', 'Facultad de Ciencias Sociales'),
('ODO', 'Odontología', 'Facultad de Ciencias de la Salud'),
('FAR', 'Bioquímica y Farmacia', 'Facultad de Ciencias de la Salud');

-- 4. ASIGNATURAS (Malla Curricular)
CREATE TABLE asignaturas (
    id BIGSERIAL PRIMARY KEY,
    carrera_id BIGINT NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 10),
    tipo_periodo VARCHAR(20) NOT NULL CHECK (tipo_periodo IN ('SEMESTRAL', 'ANUAL')),
    creditos INTEGER NOT NULL CHECK (creditos > 0),
    horas_teoricas INTEGER NOT NULL DEFAULT 0,
    horas_practicas INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO asignaturas (carrera_id, codigo, nombre, semestre, tipo_periodo, creditos, horas_teoricas, horas_practicas) VALUES
(2, 'SIS-301', 'Programación III', 3, 'SEMESTRAL', 5, 4, 2),
(2, 'SIS-105', 'Taller de Idiomas Técnico', 1, 'SEMESTRAL', 3, 2, 2),
(1, 'MED-101', 'Anatomía Humana I', 1, 'ANUAL', 8, 4, 6),
(3, 'DER-201', 'Derecho Constitucional', 2, 'SEMESTRAL', 4, 4, 0);

-- 5. GESTIONES ACADÉMICAS
CREATE TABLE gestiones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- e.g. '1-2026', '2-2026'
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PLANIFICACION', 'EN_CURSO', 'EVALUACION', 'CERRADA')),
    CONSTRAINT chk_gestiones_fechas CHECK (fecha_fin > fecha_inicio)
);

INSERT INTO gestiones (codigo, fecha_inicio, fecha_fin, estado) VALUES
('1-2026', '2026-02-02', '2026-06-30', 'EN_CURSO'),
('2-2026', '2026-08-03', '2026-12-18', 'PLANIFICACION');

-- 6. USUARIOS Y ROLES (5-Tier RBAC)
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    sede_id BIGINT REFERENCES sedes(id) ON DELETE RESTRICT, -- NULL for National Vice-Rector
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN (
        'ROLE_DOCENTE',
        'ROLE_DIR_CARRERA',
        'ROLE_DIR_ACADEMICA',
        'ROLE_VICERRECTOR_SEDE',
        'ROLE_VICERRECTOR_NACIONAL'
    )),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_sede_rol ON usuarios(sede_id, rol);

-- Password hash for 'Unitepc2026!' ($2a$10$wN1HkY0.6bV60WjP5.3f0e0cQz8u5o8q6S/8Q9dE4pL5uG9g8i4V6 or standard bcrypt)
-- Bcrypt of 'Unitepc2026!' -> $2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO
INSERT INTO usuarios (sede_id, username, email, password_hash, rol, nombres, apellidos) VALUES
(1, 'docente.cbb', 'docente.cbb@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DOCENTE', 'Carlos', 'Montaño Pérez'),
(1, 'dir.carrera.sis', 'dir.sistemas@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DIR_CARRERA', 'Mariana', 'Rios Vargas'),
(1, 'dir.academica.cbb', 'dir.academica.cbb@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DIR_ACADEMICA', 'Gonzalo', 'Gutiérrez Morales'),
(1, 'vicerrector.cbb', 'vicerrector.cbb@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_VICERRECTOR_SEDE', 'Rodrigo', 'Vallejos Salinas'),
(NULL, 'vicerrector.nacional', 'vicerrector.nacional@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_VICERRECTOR_NACIONAL', 'Hernán', 'García Romero');

-- 7. ASIGNACIONES DOCENTES
CREATE TABLE asignaciones_docentes (
    id BIGSERIAL PRIMARY KEY,
    gestion_id BIGINT NOT NULL REFERENCES gestiones(id) ON DELETE RESTRICT,
    docente_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    carrera_id BIGINT NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
    asignatura_id BIGINT NOT NULL REFERENCES asignaturas(id) ON DELETE RESTRICT,
    campus_id BIGINT NOT NULL REFERENCES campus(id) ON DELETE RESTRICT,
    grupo_paralelo VARCHAR(10) NOT NULL,
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('MANANA', 'TARDE', 'NOCHE')),
    aula VARCHAR(50) NOT NULL,
    dias_semana VARCHAR(50) NOT NULL, -- e.g. 'LUNES,MIERCOLES'
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_asignacion_horario CHECK (horario_fin > horario_inicio)
);

CREATE INDEX idx_asignaciones_docente_gestion ON asignaciones_docentes(docente_id, gestion_id);
CREATE INDEX idx_asignaciones_campus_aula ON asignaciones_docentes(campus_id, aula, horario_inicio, horario_fin);

INSERT INTO asignaciones_docentes (gestion_id, docente_id, carrera_id, asignatura_id, campus_id, grupo_paralelo, turno, aula, dias_semana, horario_inicio, horario_fin) VALUES
(1, 1, 2, 1, 1, '1A', 'MANANA', 'Lab-302', 'LUNES,MIERCOLES', '07:30:00', '10:30:00'),
(1, 1, 2, 2, 1, '1B', 'TARDE', 'Aula-104', 'MARTES,JUEVES', '14:00:00', '17:00:00');

-- 8. PROGRAMAS ANALÍTICOS (Macro-Curricular)
CREATE TABLE programas_analiticos (
    id BIGSERIAL PRIMARY KEY,
    asignacion_id BIGINT NOT NULL UNIQUE REFERENCES asignaciones_docentes(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'ENVIADO_REVISION', 'OBSERVADO', 'APROBADO')),
    caracterizacion TEXT NOT NULL,
    macro_competencia TEXT NOT NULL,
    sistema_evaluacion TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. UNIDADES DE APRENDIZAJE Y BIBLIOGRAFÍA (Programa Analítico)
CREATE TABLE unidades_aprendizaje (
    id BIGSERIAL PRIMARY KEY,
    programa_id BIGINT NOT NULL REFERENCES programas_analiticos(id) ON DELETE CASCADE,
    numero_unidad INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    saberes_conceptuales TEXT NOT NULL,
    saberes_procedimentales TEXT NOT NULL,
    saberes_actitudinales TEXT NOT NULL,
    criterios_desempeno TEXT NOT NULL,
    horas_academicas INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE bibliografia (
    id BIGSERIAL PRIMARY KEY,
    programa_id BIGINT NOT NULL REFERENCES programas_analiticos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('BASICA', 'COMPLEMENTARIA')),
    cita_apa TEXT NOT NULL,
    autor VARCHAR(150),
    anio INTEGER,
    titulo VARCHAR(255),
    editorial_url TEXT
);

-- 10. PAC (Plan Académico Curricular - Meso-Curricular)
CREATE TABLE pacs (
    id BIGSERIAL PRIMARY KEY,
    asignacion_id BIGINT NOT NULL UNIQUE REFERENCES asignaciones_docentes(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'ENVIADO_REVISION', 'OBSERVADO', 'APROBADO')),
    secciones_identificacion JSONB NOT NULL DEFAULT '{}'::jsonb,
    estrategias_metodologicas JSONB NOT NULL DEFAULT '[]'::jsonb,
    recursos_didacticos JSONB NOT NULL DEFAULT '[]'::jsonb,
    normas_curso JSONB NOT NULL DEFAULT '[]'::jsonb,
    observaciones_revision TEXT,
    revisado_por_id BIGINT REFERENCES usuarios(id),
    revisado_en TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. SESIONES MATRIZ 7 (20 Semanas / 36+ Sesiones)
CREATE TABLE sesiones_matriz7 (
    id BIGSERIAL PRIMARY KEY,
    pac_id BIGINT NOT NULL REFERENCES pacs(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 20),
    nro_sesion INTEGER NOT NULL CHECK (nro_sesion BETWEEN 1 AND 50),
    fecha_programada DATE NOT NULL,
    tipo_sesion VARCHAR(20) NOT NULL CHECK (tipo_sesion IN ('TEORICA', 'PRACTICA', 'LABORATORIO', 'TALLER')),
    unidad_tematica VARCHAR(255) NOT NULL,
    contenido_especifico TEXT NOT NULL,
    saber_conceptual TEXT NOT NULL,
    saber_procedimental TEXT NOT NULL,
    saber_actitudinal TEXT NOT NULL,
    criterio_desempeno TEXT NOT NULL,
    evidencia_aprendizaje TEXT NOT NULL,
    instrumento_evaluacion VARCHAR(30) NOT NULL CHECK (instrumento_evaluacion IN (
        'RUBRICA',
        'LISTA_COTEJO',
        'ESCALA_ESTIMATIVA',
        'PRUEBA_ESCRITA',
        'N_A'
    )),
    hito_evaluativo VARCHAR(30) NOT NULL CHECK (hito_evaluativo IN (
        'PRIMER_PARCIAL',
        'SEGUNDO_PARCIAL',
        'EXAMEN_FINAL',
        'SEGUNDA_INSTANCIA',
        'REGULAR'
    )),
    CONSTRAINT uq_pac_nro_sesion UNIQUE (pac_id, nro_sesion)
);

CREATE INDEX idx_sesiones_matriz7_pac ON sesiones_matriz7(pac_id, semana, nro_sesion);

-- 12. PLANES DE CLASE (Micro-Curricular)
CREATE TABLE planes_clase (
    id BIGSERIAL PRIMARY KEY,
    sesion_id BIGINT NOT NULL UNIQUE REFERENCES sesiones_matriz7(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'APROBADO', 'EJECUTADO')),
    duracion_total_min INTEGER NOT NULL,
    objetivo_sesion TEXT NOT NULL,
    recursos_didacticos JSONB NOT NULL DEFAULT '[]'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. MOMENTOS PEDAGÓGICOS (3 Momentos: Inicio 25m, Desarrollo 100m, Cierre 55m = 180m)
CREATE TABLE momentos_pedagogicos (
    id BIGSERIAL PRIMARY KEY,
    plan_clase_id BIGINT NOT NULL REFERENCES planes_clase(id) ON DELETE CASCADE,
    tipo_momento VARCHAR(20) NOT NULL CHECK (tipo_momento IN ('INICIO', 'DESARROLLO', 'CIERRE')),
    duracion_min INTEGER NOT NULL CHECK (duracion_min > 0),
    actividades_docente TEXT NOT NULL,
    actividades_estudiante TEXT NOT NULL,
    indicador_evaluacion TEXT NOT NULL,
    CONSTRAINT uq_plan_momento UNIQUE (plan_clase_id, tipo_momento)
);

-- 14. AUDITORÍAS IN SITU EN TIEMPO REAL
CREATE TABLE auditorias_in_situ (
    id BIGSERIAL PRIMARY KEY,
    asignacion_id BIGINT NOT NULL REFERENCES asignaciones_docentes(id) ON DELETE RESTRICT,
    auditor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    sesion_programada_id BIGINT REFERENCES sesiones_matriz7(id) ON DELETE SET NULL,
    fecha_hora_auditoria TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    puntualidad_docente VARCHAR(30) NOT NULL CHECK (puntualidad_docente IN (
        'PUNTUAL',
        'ATRASO_LEVE',
        'ATRASO_GRAVE',
        'AUSENTE'
    )),
    concordancia_tema VARCHAR(30) NOT NULL CHECK (concordancia_tema IN (
        'CONFORME_PAC',
        'TEMA_ADELANTADO',
        'TEMA_ATRASADO',
        'TEMA_NO_PLANIFICADO'
    )),
    momento_observado VARCHAR(30) NOT NULL CHECK (momento_observado IN (
        'INICIO',
        'DESARROLLO',
        'CIERRE'
    )),
    recursos_verificados JSONB NOT NULL DEFAULT '[]'::jsonb,
    estudiantes_presentes INTEGER NOT NULL DEFAULT 0,
    estudiantes_inscritos INTEGER NOT NULL DEFAULT 0,
    observaciones_auditor TEXT,
    estado VARCHAR(30) NOT NULL CHECK (estado IN (
        'FINALIZADA_CONFORME',
        'OBSERVADA_NO_CONFORME',
        'PENDIENTE_FIRMA_DOCENTE',
        'CERRADA_CON_FIRMA'
    )),
    conformidad_docente VARCHAR(30) CHECK (conformidad_docente IN ('CONFORME', 'CON_OBSERVACIONES')),
    observaciones_docente TEXT,
    fecha_firma_docente TIMESTAMP WITH TIME ZONE,
    hash_firma_digital VARCHAR(64) NOT NULL
);

CREATE INDEX idx_auditorias_asignacion ON auditorias_in_situ(asignacion_id, fecha_hora_auditoria);

-- 15. REINCIDENCIAS DISCIPLINARIAS Y PLANES DE ACCIÓN
CREATE TABLE reincidencias_docentes (
    id BIGSERIAL PRIMARY KEY,
    docente_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    gestion_id BIGINT NOT NULL REFERENCES gestiones(id) ON DELETE RESTRICT,
    auditoria_id BIGINT REFERENCES auditorias_in_situ(id) ON DELETE SET NULL,
    nro_infraccion INTEGER NOT NULL CHECK (nro_infraccion BETWEEN 1 AND 10),
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('NIVEL_1', 'NIVEL_2', 'NIVEL_3')),
    motivo VARCHAR(255) NOT NULL,
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('NOTIFICADO', 'PLAN_ACCION_REQUERIDO', 'ESCALADO_VICERRECTORADO', 'SUBSANADO')),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE planes_accion (
    id BIGSERIAL PRIMARY KEY,
    reincidencia_id BIGINT NOT NULL UNIQUE REFERENCES reincidencias_docentes(id) ON DELETE CASCADE,
    compromiso_mejora TEXT NOT NULL,
    fecha_limite_cumplimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('EN_CUMPLIMIENTO', 'APROBADO_VICERRECTOR', 'INCUMPLIDO')),
    aprobado_por_id BIGINT REFERENCES usuarios(id),
    aprobado_en TIMESTAMP WITH TIME ZONE
);
