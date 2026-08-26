package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.HitoEvaluativo;
import bo.edu.unitepc.sisa.domain.enums.InstrumentoEvaluacion;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Matriz 7 class session DTO (part of 20-week PAC planning).
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuSesionMatriz7Dto {

    private Long id;

    @NotNull(message = "La semana es obligatoria (1-20)")
    @Min(value = 1, message = "La semana mínima es 1")
    @Max(value = 20, message = "La semana máxima es 20")
    private Integer semana;

    @NotNull(message = "El número de sesión es obligatorio (1-50)")
    @Min(value = 1, message = "El número de sesión mínimo es 1")
    @Max(value = 50, message = "El número de sesión máximo es 50")
    private Integer nroSesion;

    @NotNull(message = "La fecha programada es obligatoria")
    private LocalDate fechaProgramada;

    @NotNull(message = "El tipo de sesión es obligatorio")
    private TipoSesion tipoSesion;

    @NotBlank(message = "La unidad temática es obligatoria")
    private String unidadTematica;

    @NotBlank(message = "El contenido específico es obligatorio")
    private String contenidoEspecifico;

    @NotBlank(message = "El saber conceptual es obligatorio")
    private String saberConceptual;

    @NotBlank(message = "El saber procedimental es obligatorio")
    private String saberProcedimental;

    @NotBlank(message = "El saber actitudinal es obligatorio")
    private String saberActitudinal;

    @NotBlank(message = "El criterio de desempeño es obligatorio")
    private String criterioDesempeno;

    @NotBlank(message = "La evidencia de aprendizaje es obligatoria")
    private String evidenciaAprendizaje;

    @NotNull(message = "El instrumento de evaluación es obligatorio")
    private InstrumentoEvaluacion instrumentoEvaluacion;

    @NotNull(message = "El hito evaluativo es obligatorio")
    private HitoEvaluativo hitoEvaluativo;
}
