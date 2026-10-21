package bo.edu.unitepc.sisa.api.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Data transfer record representing an attendance session with its student marks.
 *
 * @author GentleAI SISA Architecture Team
 */
public record AsistenciaSesionDto(
        Long id,
        String materiaCodigo,
        String materiaNombre,
        String gestionCodigo,
        LocalDate fecha,
        String tipoClase,
        String comision,
        String tema,
        String observaciones,
        String registradoPor,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn,
        List<AsistenciaEstudianteDto> estudiantes
) {}
