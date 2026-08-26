package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.ConcordanciaTema;
import bo.edu.unitepc.sisa.domain.enums.PuntualidadDocente;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * In situ audit submission request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuAuditoriaInSituRequest {

    @NotNull(message = "La asignación docente es obligatoria")
    private Long asignacionId;

    private Long sesionProgramadaId;

    @NotNull(message = "La puntualidad docente es obligatoria")
    private PuntualidadDocente puntualidadDocente;

    @NotNull(message = "La concordancia de tema es obligatoria")
    private ConcordanciaTema concordanciaTema;

    @NotNull(message = "El momento observado es obligatorio")
    private TipoMomentoPedagogico momentoObservado;

    @Builder.Default
    private List<String> recursosVerificados = new ArrayList<>();

    @NotNull(message = "El número de estudiantes presentes es obligatorio")
    @Min(value = 0, message = "Los estudiantes presentes no pueden ser negativos")
    private Integer estudiantesPresentes;

    @NotNull(message = "El número de estudiantes inscritos es obligatorio")
    @Min(value = 0, message = "Los estudiantes inscritos no pueden ser negativos")
    private Integer estudiantesInscritos;

    private String observacionesAuditor;
}
