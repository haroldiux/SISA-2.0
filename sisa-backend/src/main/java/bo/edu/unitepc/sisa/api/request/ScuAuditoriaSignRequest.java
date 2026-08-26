package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Teacher digital signature acknowledgment request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuAuditoriaSignRequest {

    @NotBlank(message = "La conformidad es obligatoria (CONFORME / CON_OBSERVACIONES)")
    private String conformidadDocente;

    private String observacionesDocente;
}
