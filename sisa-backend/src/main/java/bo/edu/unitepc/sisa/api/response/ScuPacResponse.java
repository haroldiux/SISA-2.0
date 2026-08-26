package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PAC curriculum planning response DTO with embedded Matriz 7 sessions.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuPacResponse {
    private Long id;
    private Long asignacionId;
    private EstadoPlanificacion estado;
    @Builder.Default
    private Map<String, Object> seccionesIdentificacion = new HashMap<>();
    @Builder.Default
    private List<String> estrategiasMetodologicas = new ArrayList<>();
    @Builder.Default
    private List<String> recursosDidacticos = new ArrayList<>();
    @Builder.Default
    private List<String> normasCurso = new ArrayList<>();
    private String observacionesRevision;
    private Long revisadoPorId;
    private String revisadoPorNombre;
    private OffsetDateTime revisadoEn;
    @Builder.Default
    private List<ScuSesionMatriz7Dto> matriz7 = new ArrayList<>();
    private OffsetDateTime creadoEn;
    private OffsetDateTime actualizadoEn;
}
