package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for individual student attendance mark within a session.
 *
 * @author GentleAI SISA Architecture Team
 */
public record AsistenciaEstudianteRequest(
        @NotBlank String estudianteCodigo,
        @NotBlank String estudianteNombre,
        String carreraCodigo,
        String carreraNombre,
        @NotBlank String estado,
        String observacion
) {}
