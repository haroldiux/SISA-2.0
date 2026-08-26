package bo.edu.unitepc.sisa.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

/**
 * Regional / National executive dashboard KPI metrics response DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuRegionalKpisResponse {
    private Long sedeId;
    private String sedeNombre;
    private Long totalDocentes;
    private Long totalAsignaciones;
    private Long pacsAprobados;
    private Long pacsPendientes;
    private Double porcentajeCumplimientoPac;
    private Long totalAuditoriasRealizadas;
    private Long auditoriasConformes;
    private Long auditoriasObservadas;
    private Double tasaConformidadAuditoria;
    private Long reincidenciasNivel1;
    private Long reincidenciasNivel2;
    private Long reincidenciasNivel3;
    @Builder.Default
    private Map<String, Object> metricasAdicionales = new HashMap<>();
}
