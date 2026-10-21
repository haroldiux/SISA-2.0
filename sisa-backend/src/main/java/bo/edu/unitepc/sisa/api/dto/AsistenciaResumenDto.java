package bo.edu.unitepc.sisa.api.dto;

import java.util.List;

/**
 * Data transfer record representing cumulative semester attendance metrics for a course.
 *
 * @author GentleAI SISA Architecture Team
 */
public record AsistenciaResumenDto(
        String materiaCodigo,
        String materiaNombre,
        String gestionCodigo,
        int totalSesionesRegistradas,
        int totalEstudiantesInscritos,
        double porcentajeAsistenciaGlobal,
        int estudiantesEnRiesgoCount,
        List<AsistenciaEstudianteResumenDto> estudiantesResumen
) {}
