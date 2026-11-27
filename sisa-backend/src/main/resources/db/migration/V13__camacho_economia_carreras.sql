-- V13: Normalizacion de nombres de carreras FACEFA/Salud y asignacion multicarrera a dir.camacho.enf
INSERT INTO carreras (codigo, nombre, facultad, activo)
VALUES ('CARECO', 'Licenciatura en Economía', 'Ciencias Empresariales', TRUE)
ON CONFLICT (codigo) DO NOTHING;

UPDATE carreras SET nombre = 'Licenciatura en Enfermería'
WHERE codigo = 'CARENL' AND (nombre LIKE 'Carrera %' OR nombre IS NULL);

UPDATE carreras SET nombre = 'Licenciatura en Ingeniería Comercial', facultad = 'Ciencias Empresariales'
WHERE codigo = 'CARICO' AND (nombre LIKE 'Carrera %' OR nombre IS NULL);

UPDATE carreras SET nombre = 'Complementaria Ingeniería Comercial', facultad = 'Ciencias Empresariales'
WHERE codigo = 'CARCIC' AND (nombre LIKE 'Carrera %' OR nombre IS NULL);

UPDATE carreras SET nombre = 'Complementaria Contaduría Pública', facultad = 'Ciencias Empresariales'
WHERE codigo = 'CARCCP';

UPDATE carreras SET nombre = 'Complementaria en Administración de Empresas', facultad = 'Ciencias Empresariales'
WHERE codigo = 'CARCAD' AND (nombre LIKE 'Carrera %' OR nombre IS NULL);

INSERT INTO usuario_asignaciones_academicas (usuario_id, sede_id, carrera_id, asignatura_id, creado_en)
SELECT u.id, COALESCE(u.sede_id, s.id), c.id, NULL, CURRENT_TIMESTAMP
FROM usuarios u
CROSS JOIN carreras c
LEFT JOIN sedes s ON s.codigo = 'CBB'
WHERE u.username = 'dir.camacho.enf'
  AND c.codigo IN ('CARENL', 'CARECO', 'CARICO', 'CARCIC', 'CARCPU', 'CARCCP')
  AND NOT EXISTS (
      SELECT 1
      FROM usuario_asignaciones_academicas ua
      WHERE ua.usuario_id = u.id
        AND ua.carrera_id = c.id
  );
