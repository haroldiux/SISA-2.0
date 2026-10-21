package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * Request payload for saving or updating an attendance session.
 *
 * @author GentleAI SISA Architecture Team
 */
public record GuardarAsistenciaRequest(
        @NotBlank String materiaCodigo,
        @NotBlank String materiaNombre,
        String gestionCodigo,
        @NotNull LocalDate fecha,
        @NotBlank String tipoClase,
        @NotBlank String comision,
        String tema,
        String observaciones,
        @NotEmpty List<@Valid AsistenciaEstudianteRequest> estudiantes
) {}
