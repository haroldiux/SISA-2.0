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

    private String unidadTematica;
    private String contenidoEspecifico;
    private String saberConceptual;
    private String saberProcedimental;
    private String saberActitudinal;
    private String criterioDesempeno;
    private String evidenciaAprendizaje;
    private InstrumentoEvaluacion instrumentoEvaluacion;
    private HitoEvaluativo hitoEvaluativo;
}
