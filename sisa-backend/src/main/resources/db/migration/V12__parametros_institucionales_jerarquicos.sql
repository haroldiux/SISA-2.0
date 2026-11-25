-- V12: Parametrizacion institucional jerarquica de umbrales y semaforos (Global, Sede, Carrera)
CREATE TABLE IF NOT EXISTS parametros_configuracion (
    id BIGSERIAL PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL, -- 'GLOBAL', 'SEDE', 'CARRERA'
    codigo_ambito VARCHAR(50) NOT NULL, -- 'GLOBAL', 'CBA', 'CARSIS', etc.
    nombre_ambito VARCHAR(150) NOT NULL,
    asistencia_minima_pct NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    asistencia_alerta_pct NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    faltas_consecutivas_alerta INT NOT NULL DEFAULT 2,
    semaforo_verde_pct NUMERIC(5, 2) NOT NULL DEFAULT -10.00,
    semaforo_amarillo_pct NUMERIC(5, 2) NOT NULL DEFAULT -25.00,
    horas_gracia_registro_docente INT NOT NULL DEFAULT 2,
    sesiones_sin_asentar_alerta INT NOT NULL DEFAULT 2,
    observaciones TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT uq_parametro_nivel_ambito UNIQUE (nivel, codigo_ambito)
);

CREATE INDEX IF NOT EXISTS idx_parametro_nivel ON parametros_configuracion(nivel);
CREATE INDEX IF NOT EXISTS idx_parametro_codigo_ambito ON parametros_configuracion(codigo_ambito);

-- Seed global defaults
INSERT INTO parametros_configuracion (
    nivel, codigo_ambito, nombre_ambito,
    asistencia_minima_pct, asistencia_alerta_pct, faltas_consecutivas_alerta,
    semaforo_verde_pct, semaforo_amarillo_pct,
    horas_gracia_registro_docente, sesiones_sin_asentar_alerta,
    observaciones, updated_by
) VALUES (
    'GLOBAL', 'GLOBAL', 'Configuración Base Institucional UNITEPC',
    80.00, 85.00, 2,
    -10.00, -25.00,
    2, 2,
    'Políticas institucionales predeterminadas para toda la universidad', 'ADMIN'
) ON CONFLICT (nivel, codigo_ambito) DO NOTHING;

-- Seed an example override for health sciences (e.g. Medicina with 85% attendance)
INSERT INTO parametros_configuracion (
    nivel, codigo_ambito, nombre_ambito,
    asistencia_minima_pct, asistencia_alerta_pct, faltas_consecutivas_alerta,
    semaforo_verde_pct, semaforo_amarillo_pct,
    horas_gracia_registro_docente, sesiones_sin_asentar_alerta,
    observaciones, updated_by
) VALUES (
    'CARRERA', 'CARMED', 'Licenciatura en Medicina (Normativa Prácticas Clínicas)',
    85.00, 90.00, 1,
    -8.00, -20.00,
    2, 1,
    'Exigencia reglamentaria estricta de rotación hospitalaria y campo clínico', 'ADMIN'
) ON CONFLICT (nivel, codigo_ambito) DO NOTHING;
