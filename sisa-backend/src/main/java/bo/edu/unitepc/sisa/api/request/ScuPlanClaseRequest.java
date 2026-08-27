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

    /** Sheet tab name (e.g. 'UA-1 Tema 1') */
    private String nombreHoja;

    private String nombreDocente;
    private String fecha;
    private String carrera;
    private String elementoCompetencia;
    private String logrosEsperados;
    private String indicadoresLogro;

    /** Contenidos: Los 3 Saberes */
    private String saberConceptual;
    private String saberProcedimental;
    private String saberActitudinal;

    /** Estrategias Didácticas */
    private String estrategiaEnsenanza;
    private String estrategiaAprendizaje;
    private String recursosEnsenanza;

    /** Evaluación Formativa */
    private String evaluacionFormativaActividad;
    private String evaluacionFormativaInstrumento;
    private String evaluacionFormativaEvidencia;

    /** Evaluación Sumativa */
    private String evaluacionSumativaActividad;
    private String evaluacionSumativaInstrumento;
    private String evaluacionSumativaEvidencia;

    private List<String> recursosDidacticos = new ArrayList<>();

    @NotEmpty(message = "Debe incluir los 3 momentos pedagógicos (Inicio, Desarrollo, Cierre)")
    @Valid
    private List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
}

