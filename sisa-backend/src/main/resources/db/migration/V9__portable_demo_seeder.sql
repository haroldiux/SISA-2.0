-- ============================================================================
-- Flyway Migration: V9__portable_demo_seeder.sql
-- Module: Seeder Universal Portátil para Demostraciones y Evaluaciones SISA 2.0
-- Author: GentleAI SISA Architecture Team
-- ============================================================================

-- 1. USUARIOS Y CREDENCIALES OFICIALES (Idempotente)
-- Contraseña 'Unitepc2026!': $2a$10$ce.mGCxMRCKnnDZiSfypBe441TCEpgbAbfZfApdA07eoujwZGwhZ2
-- Contraseña '3065087':     $2a$10$abUv3EYKaXVH4V67p.sL3ukf0jpdP7SBV.CMtkOFWN7V4bYhGUyQu
-- Contraseña '9465510':     $2a$10$FT.TNinH86ZJ2KcSwRPKV.T4AvlaPjbL5XwCffiGNsfod6kVU/P/K

INSERT INTO usuarios (sede_id, username, email, password_hash, rol, nombres, apellidos, ci, must_change_password, activo)
VALUES
    -- Administrador Nacional (Acceso total a todas las sedes y carreras)
    (NULL, 'admin', 'admin@unitepc.edu.bo', '$2a$10$ce.mGCxMRCKnnDZiSfypBe441TCEpgbAbfZfApdA07eoujwZGwhZ2', 'ROLE_ADMIN', 'Administrador', 'Nacional UNITEPC', '1000001', FALSE, TRUE),
    
    -- Directora de Carrera Multicarrera (Sistemas + Medicina en Cochabamba)
    (1, 'dir.carrera.sis', 'dir.sistemas@unitepc.edu.bo', '$2a$10$ce.mGCxMRCKnnDZiSfypBe441TCEpgbAbfZfApdA07eoujwZGwhZ2', 'ROLE_DIR_CARRERA', 'Mariana', 'Rios Vargas', '2000001', FALSE, TRUE),
    
    -- Docente Oficial: Rosmery Luizaga (Usuario = CI = 3065087)
    (1, '3065087', 'rosmery.luizaga@unitepc.edu.bo', '$2a$10$abUv3EYKaXVH4V67p.sL3ukf0jpdP7SBV.CMtkOFWN7V4bYhGUyQu', 'ROLE_DOCENTE', 'Rosmery', 'Luizaga', '3065087', FALSE, TRUE),
    
    -- Docente Oficial SEA (Usuario = CI = 9465510)
    (1, '9465510', 'docente.9465510@unitepc.edu.bo', '$2a$10$FT.TNinH86ZJ2KcSwRPKV.T4AvlaPjbL5XwCffiGNsfod6kVU/P/K', 'ROLE_DOCENTE', 'Docente', 'SEA', '9465510', FALSE, TRUE),
    
    -- Director Académico de Sede Cochabamba
    (1, 'dir.academica.cbb', 'dir.academica.cbb@unitepc.edu.bo', '$2a$10$ce.mGCxMRCKnnDZiSfypBe441TCEpgbAbfZfApdA07eoujwZGwhZ2', 'ROLE_DIR_ACADEMICA', 'Gonzalo', 'Gutiérrez Morales', '2000002', FALSE, TRUE),
    
    -- Vicerrector de Sede Cochabamba
    (1, 'vicerrector.cbb', 'vicerrector.cbb@unitepc.edu.bo', '$2a$10$ce.mGCxMRCKnnDZiSfypBe441TCEpgbAbfZfApdA07eoujwZGwhZ2', 'ROLE_VICERRECTOR_SEDE', 'Rodrigo', 'Vallejos Salinas', '2000003', FALSE, TRUE),
    
    -- Vicerrector Nacional
    (NULL, 'vicerrector.nacional', 'vicerrector.nacional@unitepc.edu.bo', '$2a$10$ce.mGCxMRCKnnDZiSfypBe441TCEpgbAbfZfApdA07eoujwZGwhZ2', 'ROLE_VICERRECTOR_NACIONAL', 'Hernán', 'García Romero', '2000004', FALSE, TRUE)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email,
    rol = EXCLUDED.rol,
    nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    ci = EXCLUDED.ci,
    must_change_password = FALSE,
    activo = TRUE;

-- 2. ASIGNACIONES ACADÉMICAS INSTITUCIONALES (Gobernanza RBAC)
DELETE FROM usuario_asignaciones_academicas 
WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE username IN ('admin', 'dir.carrera.sis', '3065087', '9465510')
);

-- Mariana Rios Vargas (dir.carrera.sis): Multicarrera Sistemas (carrera_id=2) + Medicina (carrera_id=1)
INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id)
SELECT u.id, 1, 2, NULL
FROM usuarios u WHERE u.username = 'dir.carrera.sis'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id)
SELECT u.id, 1, 1, NULL
FROM usuarios u WHERE u.username = 'dir.carrera.sis'
ON CONFLICT DO NOTHING;

-- Rosmery Luizaga (3065087): Asignada a Programación III (SIS-213) y Base de Datos I (SIS-311)
INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id)
SELECT u.id, 1, 2, 1
FROM usuarios u WHERE u.username = '3065087'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id)
SELECT u.id, 1, 2, 2
FROM usuarios u WHERE u.username = '3065087'
ON CONFLICT DO NOTHING;

-- Docente SEA (9465510): Asignada a Cálculo I (MAT-101)
INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id)
SELECT u.id, 1, 2, NULL
FROM usuarios u WHERE u.username = '9465510'
ON CONFLICT DO NOTHING;

-- 3. CATÁLOGO SEA LOCAL Y GRUPOS (Espejo para la demo)
INSERT INTO sea_materias (id, codigo, nombre, semestre, syllabus_course_id, carrera_id) VALUES
    ('mat-sis213', 'SIS-213', 'PROGRAMACIÓN III', 3, 'syl-sis213', 'car-sistemas-cbba'),
    ('mat-sis311', 'SIS-311', 'BASE DE DATOS I', 4, 'syl-sis311', 'car-sistemas-cbba'),
    ('mat-mat101', 'MAT-101', 'CÁLCULO I', 1, 'syl-mat101', 'car-sistemas-cbba'),
    ('mat-sis412', 'SIS-412', 'SISTEMAS OPERATIVOS', 5, 'syl-sis412', 'car-sistemas-cbba')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre,
    semestre = EXCLUDED.semestre;

INSERT INTO sea_grupos (id, codigo_grupo, tipo_clase, docente_nombre, docente_ci, horario, aula, campus, materia_id, component_type) VALUES
    ('grp-sis213-g1', 'G1', 'TEORICA', 'Lic. Rosmery Luizaga', '3065087', 'Lun/Mie 08:00-10:15', 'Aula 204 - Bloque A', 'Campus Juan Pablo II', 'mat-sis213', 'TEO'),
    ('grp-sis213-g2', 'G2', 'PRACTICA', 'Lic. Rosmery Luizaga', '3065087', 'Vie 14:00-16:15', 'Lab Inf 3', 'Campus Juan Pablo II', 'mat-sis213', 'PRA'),
    ('grp-sis311-g1', 'G1', 'TEORICA', 'Lic. Rosmery Luizaga', '3065087', 'Mar/Jue 10:30-12:45', 'Lab Inf 2', 'Campus Juan Pablo II', 'mat-sis311', 'TEO'),
    ('grp-mat101-g1', 'G1', 'TEORICA', 'Docente SEA', '9465510', 'Lun/Mie 10:30-12:00', 'Aula 102', 'Campus Juan Pablo II', 'mat-mat101', 'TEO'),
    ('grp-sis412-g1', 'G1', 'TEORICA', 'Docente SEA', '9465510', 'Mar/Jue 08:00-09:30', 'Aula 201', 'Campus Juan Pablo II', 'mat-sis412', 'TEO')
ON CONFLICT (id) DO UPDATE SET
    codigo_grupo = EXCLUDED.codigo_grupo,
    tipo_clase = EXCLUDED.tipo_clase,
    docente_nombre = EXCLUDED.docente_nombre,
    docente_ci = EXCLUDED.docente_ci,
    horario = EXCLUDED.horario,
    aula = EXCLUDED.aula,
    campus = EXCLUDED.campus,
    materia_id = EXCLUDED.materia_id,
    component_type = EXCLUDED.component_type;

-- 4. PAC Y SESIONES MATRIZ 7 DE REFERENCIA
INSERT INTO pacs (asignacion_id, estado, pac_type)
VALUES (1, 'APROBADO', 'TEORICO')
ON CONFLICT (asignacion_id) DO UPDATE SET
    estado = EXCLUDED.estado,
    pac_type = EXCLUDED.pac_type;

-- Crear sesión Matriz 7 para la clase activa de hoy (Sesión 13, Semana 13)
INSERT INTO sesiones_matriz7 (
    pac_id, semana, nro_sesion, fecha_programada, tipo_sesion, unidad_tematica,
    contenido_especifico, saber_conceptual, saber_procedimental, saber_actitudinal,
    criterio_desempeno, evidencia_aprendizaje, instrumento_evaluacion, hito_evaluativo
) VALUES (
    (SELECT id FROM pacs WHERE asignacion_id = 1 LIMIT 1),
    13, 13, CURRENT_DATE, 'TEORICA',
    'Unidad III: Mapeo Objeto-Relacional y Persistencia JPA',
    'Configuración de Entidades, Relaciones y Ciclo de Vida en Spring Data JPA',
    'Conceptos de persistencia relacional, ORM y anotaciones JPA',
    'Implementación de entidades con JPA y repositorios Spring Data',
    'Rigor técnico y buenas prácticas en modelado relacional',
    'Aplica correctamente los mapeos entidad-relación en Spring Boot',
    'Código fuente compilable con entidades y pruebas unitarias',
    'RUBRICA', 'REGULAR'
) ON CONFLICT (pac_id, nro_sesion) DO NOTHING;

-- Crear Plan de Clase asociado a la sesión Matriz 7
INSERT INTO planes_clase (
    sesion_id, estado, plan_type, duracion_total_min, objetivo_sesion, recursos_didacticos
)
SELECT 
    s.id, 'APROBADO', 'TEORICO', 90,
    'Dominar los fundamentos del mapeo objeto-relacional y las operaciones CRUD con Spring Data JPA',
    '["Proyector multimedia", "Pizarra acrilica", "IDE IntelliJ IDEA / Eclipse", "PostgreSQL Docker"]'::jsonb
FROM sesiones_matriz7 s
WHERE s.nro_sesion = 13 AND s.pac_id = (SELECT id FROM pacs WHERE asignacion_id = 1 LIMIT 1)
LIMIT 1
ON CONFLICT (sesion_id) DO NOTHING;

-- Momentos pedagógicos (15' Inicio, 60' Desarrollo, 15' Cierre)
INSERT INTO momentos_pedagogicos (plan_clase_id, tipo_momento, duracion_min, actividades_docente, actividades_estudiante, indicador_evaluacion)
SELECT 
    p.id, 'INICIO', 15,
    'Presentación del objetivo de la clase y sondeo de conceptos previos sobre persistencia relacional.',
    'Participación activa respondiendo preguntas disparadoras y compartiendo experiencias previas.',
    'Identifica con precisión la diferencia entre una tabla relacional y un objeto de dominio.'
FROM planes_clase p
JOIN sesiones_matriz7 s ON p.sesion_id = s.id
WHERE s.nro_sesion = 13 AND s.pac_id = (SELECT id FROM pacs WHERE asignacion_id = 1 LIMIT 1)
LIMIT 1
ON CONFLICT (plan_clase_id, tipo_momento) DO NOTHING;

INSERT INTO momentos_pedagogicos (plan_clase_id, tipo_momento, duracion_min, actividades_docente, actividades_estudiante, indicador_evaluacion)
SELECT 
    p.id, 'DESARROLLO', 60,
    'Explicación guiada de anotaciones JPA (@Entity, @Table, @Id) y modelado de relaciones @OneToMany.',
    'Implementación en vivo del código en IDE y resolución guiada de errores comunes.',
    'Codifica entidades JPA funcionales que generan tablas automáticamente en base de datos.'
FROM planes_clase p
JOIN sesiones_matriz7 s ON p.sesion_id = s.id
WHERE s.nro_sesion = 13 AND s.pac_id = (SELECT id FROM pacs WHERE asignacion_id = 1 LIMIT 1)
LIMIT 1
ON CONFLICT (plan_clase_id, tipo_momento) DO NOTHING;

INSERT INTO momentos_pedagogicos (plan_clase_id, tipo_momento, duracion_min, actividades_docente, actividades_estudiante, indicador_evaluacion)
SELECT 
    p.id, 'CIERRE', 15,
    'Síntesis conceptual de los puntos clave aprendidos y ronda rápida de preguntas formativas.',
    'Resumen verbal de los conceptos principales y entrega del ejercicio práctico de clase.',
    'Responde acertadamente preguntas clave de síntesis sobre transaccionalidad y JPA.'
FROM planes_clase p
JOIN sesiones_matriz7 s ON p.sesion_id = s.id
WHERE s.nro_sesion = 13 AND s.pac_id = (SELECT id FROM pacs WHERE asignacion_id = 1 LIMIT 1)
LIMIT 1
ON CONFLICT (plan_clase_id, tipo_momento) DO NOTHING;

-- 5. HISTÓRICO DE SEGUIMIENTOS PARA DEMOSTRACIÓN DEL SEMÁFORO DE AVANCE
-- SIS-213: 23 sesiones completadas (63.89% avance real -> VERDE con corte al 65%)
INSERT INTO seguimientos_clases (
    materia_codigo, carrera_codigo, docente_ci, fecha_ejecucion, tipo_clase, comision,
    tema_oficial, tema_ejecutado, recursos_planificados, recursos_utilizados,
    momento_inicio_cumplido, momento_desarrollo_cumplido, momento_cierre_cumplido,
    estado_cumplimiento, cumplimiento_score, observaciones_docente
)
SELECT 
    'SIS-213', 'CARSIS', '3065087',
    DATE '2026-08-03' + (i * 3 || ' days')::interval,
    'TEORICA', 'G1',
    'Tema ' || i || ': Arquitectura de Software y Persistencia',
    'Tema ' || i || ' ejecutado conforme a la planificación didáctica',
    '["Proyector multimedia", "Pizarra acrilica", "IDE IntelliJ IDEA"]'::jsonb,
    '["Proyector multimedia", "Pizarra acrilica", "IDE IntelliJ IDEA"]'::jsonb,
    TRUE, TRUE, TRUE,
    'TOTALMENTE_CUMPLIDO', 1.00,
    'Sesión completada con alta participación estudiantil.'
FROM generate_series(1, 23) AS i
ON CONFLICT (materia_codigo, fecha_ejecucion, tipo_clase, comision) DO NOTHING;

-- SIS-311: 18 sesiones completadas (50.00% avance real -> AMARILLO desfase moderado)
INSERT INTO seguimientos_clases (
    materia_codigo, carrera_codigo, docente_ci, fecha_ejecucion, tipo_clase, comision,
    tema_oficial, tema_ejecutado, recursos_planificados, recursos_utilizados,
    momento_inicio_cumplido, momento_desarrollo_cumplido, momento_cierre_cumplido,
    estado_cumplimiento, cumplimiento_score, observaciones_docente
)
SELECT 
    'SIS-311', 'CARSIS', '3065087',
    DATE '2026-08-04' + (i * 4 || ' days')::interval,
    'TEORICA', 'G1',
    'Tema ' || i || ': Modelado y Normalización de Base de Datos',
    'Tema ' || i || ' desarrollado en aula de laboratorio',
    '["Laboratorio de computo", "PostgreSQL Docker"]'::jsonb,
    '["Laboratorio de computo", "PostgreSQL Docker"]'::jsonb,
    TRUE, TRUE, (i % 2 = 0),
    'TOTALMENTE_CUMPLIDO', 1.00,
    'Se requiere acelerar ritmo en consultas avanzadas SQL.'
FROM generate_series(1, 18) AS i
ON CONFLICT (materia_codigo, fecha_ejecucion, tipo_clase, comision) DO NOTHING;

-- MAT-101: 10 sesiones completadas (27.78% avance real -> ROJO desfase crítico)
INSERT INTO seguimientos_clases (
    materia_codigo, carrera_codigo, docente_ci, fecha_ejecucion, tipo_clase, comision,
    tema_oficial, tema_ejecutado, recursos_planificados, recursos_utilizados,
    momento_inicio_cumplido, momento_desarrollo_cumplido, momento_cierre_cumplido,
    estado_cumplimiento, cumplimiento_score, observaciones_docente
)
SELECT 
    'MAT-101', 'CARSIS', '9465510',
    DATE '2026-08-05' + (i * 6 || ' days')::interval,
    'TEORICA', 'G1',
    'Tema ' || i || ': Límites y Derivadas Fundamentales',
    'Tema ' || i || ' dictado con pizarra acrílica',
    '["Pizarra acrilica"]'::jsonb,
    '["Pizarra acrilica"]'::jsonb,
    TRUE, TRUE, TRUE,
    'TOTALMENTE_CUMPLIDO', 1.00,
    'Retraso acumulado por suspensión de actividades y feriados.'
FROM generate_series(1, 10) AS i
ON CONFLICT (materia_codigo, fecha_ejecucion, tipo_clase, comision) DO NOTHING;
