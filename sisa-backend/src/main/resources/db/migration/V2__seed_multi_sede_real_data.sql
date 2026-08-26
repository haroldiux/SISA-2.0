-- ============================================================================
-- SISA • Database DDL V2 Migration: Multi-Sede Comprehensive Relational Data Seed
-- PostgreSQL 16+
-- Schema: public
-- Author: GentleAI SISA Architecture Team
-- ============================================================================

-- Additional Campuses for full Multi-Sede coverage
INSERT INTO campus (sede_id, nombre, direccion) VALUES
(2, 'Campus Calacoto LPZ', 'Calle 15 de Calacoto #820'),
(3, 'Campus Villa Esperanza EAL', 'Av. Juan Pablo II #2500'),
(4, 'Campus Pando Universitario CBJ', 'Av. Las Palmas esq. Av. Universitaria')
ON CONFLICT DO NOTHING;

-- Seed Additional Multi-Sede Users (Password: Unitepc2026!)
INSERT INTO usuarios (sede_id, username, email, password_hash, rol, nombres, apellidos) VALUES
-- Sede La Paz
(2, 'docente.lpz', 'docente.lpz@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DOCENTE', 'Alejandro', 'Quispe Mamani'),
(2, 'dir.carrera.sis.lpz', 'dir.sistemas.lpz@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DIR_CARRERA', 'Gabriela', 'Paredes Flores'),
(2, 'dir.academica.lpz', 'dir.academica.lpz@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DIR_ACADEMICA', 'Fernando', 'Torrico Arce'),
(2, 'vicerrector.lpz', 'vicerrector.lpz@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_VICERRECTOR_SEDE', 'Patricia', 'Camacho Ruiz'),

-- Sede El Alto
(3, 'docente.eal', 'docente.eal@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DOCENTE', 'Javier', 'Condori Huanca'),
(3, 'dir.academica.eal', 'dir.academica.eal@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DIR_ACADEMICA', 'Ramiro', 'Choque Tintaya'),
(3, 'vicerrector.eal', 'vicerrector.eal@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_VICERRECTOR_SEDE', 'Sonia', 'Apaza Laura'),

-- Sede Cobija
(4, 'docente.cbj', 'docente.cbj@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DOCENTE', 'Marcelo', 'Vargas Justiniano'),
(4, 'dir.academica.cbj', 'dir.academica.cbj@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_DIR_ACADEMICA', 'Claudia', 'Silva Roca'),
(4, 'vicerrector.cbj', 'vicerrector.cbj@unitepc.edu.bo', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/4g3/tV01Yf/c/z8P23kK63S1N6cO', 'ROLE_VICERRECTOR_SEDE', 'Ernesto', 'Castillo Pinto')
ON CONFLICT DO NOTHING;

-- Seed Multi-Sede Teacher Assignments
INSERT INTO asignaciones_docentes (gestion_id, docente_id, carrera_id, asignatura_id, campus_id, grupo_paralelo, turno, aula, dias_semana, horario_inicio, horario_fin) VALUES
-- Sede La Paz Assignment
(1, COALESCE((SELECT id FROM usuarios WHERE username = 'docente.lpz' LIMIT 1), 1), 2, 1, COALESCE((SELECT id FROM campus WHERE nombre LIKE '%LPZ%' LIMIT 1), 1), '1A', 'MANANA', 'Aula-201', 'LUNES,MIERCOLES', '08:00:00', '11:00:00'),
-- Sede El Alto Assignment
(1, COALESCE((SELECT id FROM usuarios WHERE username = 'docente.eal' LIMIT 1), 1), 2, 1, COALESCE((SELECT id FROM campus WHERE nombre LIKE '%EAL%' LIMIT 1), 1), '1A', 'TARDE', 'Lab-Inf-1', 'MARTES,JUEVES', '14:00:00', '17:00:00'),
-- Sede Cobija Assignment
(1, COALESCE((SELECT id FROM usuarios WHERE username = 'docente.cbj' LIMIT 1), 1), 2, 2, COALESCE((SELECT id FROM campus WHERE nombre LIKE '%CBJ%' LIMIT 1), 1), '1A', 'NOCHE', 'Aula-101', 'MIERCOLES,VIERNES', '18:30:00', '21:30:00')
ON CONFLICT DO NOTHING;

-- Seed PAC Matriz 7 for Assignment 1 (40 Sessions)
INSERT INTO pacs (asignacion_id, estado, secciones_identificacion, estrategias_metodologicas, recursos_didacticos, normas_curso, creado_en, actualizado_en)
VALUES (
    1,
    'APROBADO',
    '{"sede": "Cochabamba", "carrera": "Ingeniería de Sistemas", "semestre": "Tercero", "paralelo": "1A", "cargaHoraria": "80 horas"}'::jsonb,
    '["Aprendizaje basado en problemas", "Resolución de casos de estudio prácticos", "Desarrollo de proyectos modulares", "Talleres de codificación interactiva"]'::jsonb,
    '["Proyector interactivo", "Entorno IDE IntelliJ IDEA", "Plataforma Moodle/SISA", "Repositorio GitHub Institucional"]'::jsonb,
    '["Puntualidad obligatoria con tolerancia máxima de 10 min", "Asistencia mínima 80% para habilitación a examen final", "Código de honor en desarrollo de software", "Uso exclusivo de equipos de laboratorio para fines académicos"]'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Populate 40 Matriz 7 sessions for PAC 1
DO $$
DECLARE
    v_pac_id BIGINT;
    v_semana INT;
    v_sesion INT;
    v_fecha DATE := '2026-02-02';
    v_tipo VARCHAR(20);
    v_hito VARCHAR(30);
BEGIN
    SELECT id INTO v_pac_id FROM pacs WHERE asignacion_id = 1 LIMIT 1;
    IF v_pac_id IS NOT NULL THEN
        -- Delete existing if any to avoid duplication
        DELETE FROM sesiones_matriz7 WHERE pac_id = v_pac_id;
        
        FOR v_semana IN 1..20 LOOP
            FOR v_sesion IN 1..2 LOOP
                v_tipo := CASE WHEN (v_semana * 2 + v_sesion) % 3 = 0 THEN 'PRACTICA'
                               WHEN (v_semana * 2 + v_sesion) % 5 = 0 THEN 'LABORATORIO'
                               ELSE 'TEORICA' END;
                
                v_hito := CASE WHEN v_semana = 7 AND v_sesion = 2 THEN 'PRIMER_PARCIAL'
                               WHEN v_semana = 14 AND v_sesion = 2 THEN 'SEGUNDO_PARCIAL'
                               WHEN v_semana = 20 AND v_sesion = 2 THEN 'EXAMEN_FINAL'
                               ELSE 'REGULAR' END;

                INSERT INTO sesiones_matriz7 (
                    pac_id, semana, nro_sesion, fecha_programada, tipo_sesion,
                    unidad_tematica, contenido_especifico, saber_conceptual,
                    saber_procedimental, saber_actitudinal, criterio_desempeno,
                    evidencia_aprendizaje, instrumento_evaluacion, hito_evaluativo
                ) VALUES (
                    v_pac_id,
                    v_semana,
                    ((v_semana - 1) * 2) + v_sesion,
                    v_fecha + ((v_semana - 1) * 7 + (v_sesion - 1) * 2),
                    v_tipo,
                    'Unidad ' || ((v_semana - 1) / 5 + 1) || ': Estructuras de Datos y Algoritmos Avanzados',
                    'Tema ' || (((v_semana - 1) * 2) + v_sesion) || ': Implementación de Estructuras y Algoritmos',
                    'Comprende los fundamentos teóricos, taxonomía y complejidad algorítmica Big-O',
                    'Diseña, codifica y optimiza algoritmos eficientes en lenguaje Java/C++',
                    'Demuestra responsabilidad, pensamiento analítico y rigurosidad técnica',
                    'Implementa estructuras de datos con complejidad computacional óptima',
                    'Código fuente documentado y casos de prueba unitarios aprobados',
                    'RUBRICA',
                    v_hito
                );
            END LOOP;
        END LOOP;
    END IF;
END $$;

-- Seed Micro-Plan de Clase for Session 1
DO $$
DECLARE
    v_sesion_id BIGINT;
    v_plan_id BIGINT;
BEGIN
    SELECT id INTO v_sesion_id FROM sesiones_matriz7 WHERE nro_sesion = 1 LIMIT 1;
    IF v_sesion_id IS NOT NULL THEN
        INSERT INTO planes_clase (sesion_id, estado, duracion_total_min, objetivo_sesion, recursos_didacticos)
        VALUES (
            v_sesion_id,
            'APROBADO',
            180,
            'Comprender la taxonomía y análisis asintótico de estructuras de datos lineales y no lineales',
            '["Pizarra interactiva", "IDE Java 21", "Guía de laboratorio #1"]'::jsonb
        ) ON CONFLICT (sesion_id) DO NOTHING;

        SELECT id INTO v_plan_id FROM planes_clase WHERE sesion_id = v_sesion_id LIMIT 1;

        IF v_plan_id IS NOT NULL THEN
            INSERT INTO momentos_pedagogicos (plan_clase_id, tipo_momento, duracion_min, actividades_docente, actividades_estudiante, indicador_evaluacion)
            VALUES
            (v_plan_id, 'INICIO', 25, 'Presentación de la competencia y preguntas motivadoras', 'Participación activa en el debate diagnóstico', 'Identificación precisa de conceptos previos'),
            (v_plan_id, 'DESARROLLO', 100, 'Exposición magistral dialogada y modelado de algoritmos en vivo', 'Resolución de ejercicios prácticos guiados en el laboratorio', 'Construcción correcta de estructuras de datos'),
            (v_plan_id, 'CIERRE', 55, 'Síntesis integradora y asignación del reto formativo', 'Autoevaluación y entrega de conclusiones en plataforma', 'Demostración de dominio de la técnica algorítmica')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- Seed In-Situ Audit Records with SHA-256 Signatures
INSERT INTO auditorias_in_situ (
    asignacion_id, auditor_id, fecha_hora_auditoria,
    puntualidad_docente, concordancia_tema, momento_observado,
    recursos_verificados, estudiantes_presentes, estudiantes_inscritos,
    observaciones_auditor, estado, conformidad_docente, hash_firma_digital
) VALUES (
    1, COALESCE((SELECT id FROM usuarios WHERE rol = 'ROLE_DIR_ACADEMICA' LIMIT 1), 1), CURRENT_TIMESTAMP - INTERVAL '7 days',
    'PUNTUAL', 'CONFORME_PAC', 'DESARROLLO',
    '["Proyector", "Laboratorio", "Guía de laboratorio"]'::jsonb,
    28, 30,
    'Clase desarrollada con excelente rigurosidad pedagógica y seguimiento estricto del PAC Matriz 7.',
    'FINALIZADA_CONFORME', 'CONFORME',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
) ON CONFLICT DO NOTHING;

-- Seed Disciplinary Recurrence Record
INSERT INTO reincidencias_docentes (
    docente_id, gestion_id, auditoria_id, nro_infraccion,
    nivel, motivo, estado, creado_en
) VALUES (
    COALESCE((SELECT id FROM usuarios WHERE rol = 'ROLE_DOCENTE' LIMIT 1), 1), 1, 1, 1,
    'NIVEL_1',
    'Notificación formal preventiva de registro de puntualidad docente.',
    'NOTIFICADO',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
) ON CONFLICT DO NOTHING;
