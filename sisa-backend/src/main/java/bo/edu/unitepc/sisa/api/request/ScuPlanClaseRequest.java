package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Plan de Clase submission request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuPlanClaseRequest {

    private Long id;

    @NotNull(message = "El ID de la sesión Matriz 7 es obligatorio")
    private Long sesionId;

    @NotNull(message = "La duración total en minutos es obligatoria")
    private Integer duracionTotalMin;

    @NotBlank(message = "El objetivo de la sesión es obligatorio")
    private String objetivoSesion;

    /** Tema title extracted from row 13, col C of the Plan de Clase Excel sheet. */
    private String contenidoTema;

    /** Subject name extracted from row 8, col G of the Excel sheet. */
    private String nombreAsignatura;

    /** Unidad title extracted from row 11, col C of the Excel sheet. */
    private String unidadTitulo;

    private List<String> recursosDidacticos = new ArrayList<>();

    @NotEmpty(message = "Debe incluir los 3 momentos pedagógicos (Inicio, Desarrollo, Cierre)")
    @Valid
    private List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
}
