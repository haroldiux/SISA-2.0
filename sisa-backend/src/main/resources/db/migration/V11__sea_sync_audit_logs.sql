CREATE TABLE IF NOT EXISTS sea_sync_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tipo_sync VARCHAR(30) NOT NULL, -- GLOBAL, INDIVIDUAL, BATCH
    ejecutado_por VARCHAR(100) NOT NULL,
    ci_objetivo VARCHAR(255),
    sedes_count INT DEFAULT 0,
    carreras_count INT DEFAULT 0,
    materias_count INT DEFAULT 0,
    grupos_count INT DEFAULT 0,
    docentes_count INT DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'EXITOSO',
    detalle TEXT,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sea_sync_audit_logs_creado ON sea_sync_audit_logs(creado_en DESC);
