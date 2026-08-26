package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.api.request.ScuBibliografiaDto;
import bo.edu.unitepc.sisa.api.request.ScuUnidadAprendizajeDto;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Programa Analitico response DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuProgramaAnaliticoResponse {
    private Long id;
    private Long asignacionId;
    private EstadoPlanificacion estado;
    private String caracterizacion;
    private String macroCompetencia;
    private String sistemaEvaluacion;
    @Builder.Default
    private List<ScuUnidadAprendizajeDto> unidades = new ArrayList<>();
    @Builder.Default
    private List<ScuBibliografiaDto> bibliografia = new ArrayList<>();
    private OffsetDateTime creadoEn;
    private OffsetDateTime actualizadoEn;
}
