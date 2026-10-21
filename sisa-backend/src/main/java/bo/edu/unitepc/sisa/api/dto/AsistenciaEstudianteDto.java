package bo.edu.unitepc.sisa.api.dto;

/**
 * Data transfer record representing a student's attendance record in a session.
 *
 * @author GentleAI SISA Architecture Team
 */
public record AsistenciaEstudianteDto(
        Long id,
        String estudianteCodigo,
        String estudianteNombre,
        String carreraCodigo,
        String carreraNombre,
        String estado,
        String observacion
) {}
