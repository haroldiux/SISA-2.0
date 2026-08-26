package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for formal planning trilogy submission.
 *
 * @author GentleAI SISA Architecture Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuPlanningSubmitRequest {

    @NotNull(message = "El ID de asignación docente es obligatorio")
    private Long asignacionId;
}
