package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Career director review decision request DTO for PAC.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuPacReviewRequest {

    @NotNull(message = "El nuevo estado es obligatorio (APROBADO u OBSERVADO)")
    private EstadoPlanificacion nuevoEstado;

    private String observaciones;
}
