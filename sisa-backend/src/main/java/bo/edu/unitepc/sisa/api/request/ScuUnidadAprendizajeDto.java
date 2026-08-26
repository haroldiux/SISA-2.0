package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Learning unit DTO for Programa Analitico.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScuUnidadAprendizajeDto {
    private Long id;
    private Integer numeroUnidad;

    @NotBlank(message = "El título de la unidad es obligatorio")
    private String titulo;

    private String saberesConceptuales;
    private String saberesProcedimentales;
    private String saberesActitudinales;
    private String criteriosDesempeno;

    private Integer horasAcademicas;

    @Builder.Default
    private List<ScuTemaAnaliticoDto> temas = new ArrayList<>();


    public ScuUnidadAprendizajeDto(Long id, Integer numeroUnidad, String titulo, String saberesConceptuales,
                                   String saberesProcedimentales, String saberesActitudinales,
                                   String criteriosDesempeno, Integer horasAcademicas) {
        this.id = id;
        this.numeroUnidad = numeroUnidad;
        this.titulo = titulo;
        this.saberesConceptuales = saberesConceptuales;
        this.saberesProcedimentales = saberesProcedimentales;
        this.saberesActitudinales = saberesActitudinales;
        this.criteriosDesempeno = criteriosDesempeno;
        this.horasAcademicas = horasAcademicas;
        this.temas = new ArrayList<>();
    }
}


