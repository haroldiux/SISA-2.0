package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Pedagogical moment DTO (Inicio, Desarrollo, Cierre).
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuMomentoPedagogicoDto {

    private Long id;

    private String nombreMomento;

    @NotNull(message = "El tipo de momento pedagógico es obligatorio")
    private TipoMomentoPedagogico tipoMomento;

    @NotNull(message = "La duración en minutos es obligatoria")
    @Min(value = 0, message = "La duración mínima es 0 minutos")
    private Integer duracionMin;

    @NotBlank(message = "Las actividades del docente son obligatorias")
    private String actividadesDocente;

    private String actividadesEstudiante;

    private String indicadorEvaluacion;
}
