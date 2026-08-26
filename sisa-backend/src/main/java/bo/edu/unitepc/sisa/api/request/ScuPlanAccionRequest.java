package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Remediation Action Plan creation request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuPlanAccionRequest {

    @NotNull(message = "El ID de reincidencia es obligatorio")
    private Long reincidenciaId;

    @NotBlank(message = "El compromiso de mejora es obligatorio")
    private String compromisoMejora;

    @NotNull(message = "La fecha límite de cumplimiento es obligatoria")
    @Future(message = "La fecha límite debe ser futura")
    private LocalDate fechaLimiteCumplimiento;
}
