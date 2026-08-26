package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.api.request.ScuMomentoPedagogicoDto;
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
 * Plan de Clase response DTO with calculated moment sum validation flag.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuPlanClaseResponse {
    private Long id;
    private Long sesionId;
    private Integer semana;
    private Integer nroSesion;
    private String unidadTematica;
    private EstadoPlanificacion estado;
    private Integer duracionTotalMin;
    private String objetivoSesion;
    @Builder.Default
    private List<String> recursosDidacticos = new ArrayList<>();
    @Builder.Default
    private List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
    private OffsetDateTime creadoEn;
    private OffsetDateTime actualizadoEn;
}
