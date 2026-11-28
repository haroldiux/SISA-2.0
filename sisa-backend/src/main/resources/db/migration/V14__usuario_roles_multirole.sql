-- Flyway V14: Soporte Multi-Rol por Usuario (ej. Director de Carrera + Docente en una sola cuenta)
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(30) NOT NULL,
    PRIMARY KEY (usuario_id, rol)
);

CREATE INDEX IF NOT EXISTS idx_usuario_roles_rol ON usuario_roles(rol);

-- Migrar roles actuales a usuario_roles
INSERT INTO usuario_roles (usuario_id, rol)
SELECT id, rol
FROM usuarios
WHERE rol IS NOT NULL
ON CONFLICT DO NOTHING;

-- Configurar doble rol (ROLE_DIR_CARRERA + ROLE_DOCENTE) para José James Claure Ricaldi (5188558) en Ingeniería de Sistemas
UPDATE usuarios
SET rol = 'ROLE_DIR_CARRERA'
WHERE username = '5188558' AND rol = 'ROLE_DOCENTE';

INSERT INTO usuario_roles (usuario_id, rol)
SELECT id, r.rol
FROM usuarios u
CROSS JOIN (VALUES ('ROLE_DIR_CARRERA'), ('ROLE_DOCENTE')) AS r(rol)
WHERE u.username = '5188558'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id, creado_en)
SELECT
    u.id,
    COALESCE(u.sede_id, (SELECT id FROM sedes WHERE codigo IN ('CBA', 'CBB') ORDER BY id LIMIT 1)),
    c.id,
    NULL,
    CURRENT_TIMESTAMP
FROM usuarios u
CROSS JOIN LATERAL (
    SELECT id FROM carreras WHERE codigo IN ('SIS', 'CARSIS') ORDER BY id LIMIT 1
) c
WHERE u.username = '5188558'
  AND NOT EXISTS (
      SELECT 1
      FROM usuario_asignaciones_academicas ua
      WHERE ua.usuario_id = u.id
        AND ua.carrera_id = c.id
        AND ua.asignatura_id IS NULL
  );

-- Configurar también doble rol para Manuel Camacho Arce (6420833) heredando asignaciones directivas de dir.camacho.enf
UPDATE usuarios
SET rol = 'ROLE_DIR_CARRERA'
WHERE username = '6420833' AND rol = 'ROLE_DOCENTE';

INSERT INTO usuario_roles (usuario_id, rol)
SELECT id, r.rol
FROM usuarios u
CROSS JOIN (VALUES ('ROLE_DIR_CARRERA'), ('ROLE_DOCENTE')) AS r(rol)
WHERE u.username = '6420833'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id, creado_en)
SELECT
    u_doc.id,
    ua.sede_id,
    ua.carrera_id,
    NULL,
    CURRENT_TIMESTAMP
FROM usuarios u_doc
JOIN usuarios u_dir ON u_dir.username = 'dir.camacho.enf'
JOIN usuario_asignaciones_academicas ua ON ua.usuario_id = u_dir.id AND ua.asignatura_id IS NULL
WHERE u_doc.username = '6420833'
  AND NOT EXISTS (
      SELECT 1
      FROM usuario_asignaciones_academicas existing
      WHERE existing.usuario_id = u_doc.id
        AND existing.carrera_id = ua.carrera_id
        AND existing.asignatura_id IS NULL
  );
