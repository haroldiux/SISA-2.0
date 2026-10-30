package bo.edu.unitepc.sisa.api.dto;

import bo.edu.unitepc.sisa.domain.enums.ColorSemaforo;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Career-level Didactic Progress Traffic Light Response DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
public record SemaforoCarreraResponse(
        String carreraCodigo,
        String carreraNombre,
        String gestionCodigo,
        Integer semanaCorte,
        BigDecimal avancePlaneadoGlobal,
        SemaforoKpisDto kpis,
        List<SemaforoMateriaDto> materias
) {

    public record SemaforoKpisDto(
            int totalMaterias,
            int materiasAlDiaVerde,
            int materiasAtencionAmarillo,
            int materiasCriticoRojo,
            int materiasSinPlanClase,
            BigDecimal avanceRealPromedioPorcentaje
    ) {}

    public record MomentosStatsDto(
            BigDecimal inicioPorcentaje,
            BigDecimal desarrolloPorcentaje,
            BigDecimal cierrePorcentaje
    ) {}

    @Builder
    public record SemaforoMateriaDto(
            String materiaCodigo,
            String materiaNombre,
            Integer semestre,
            String docenteCi,
            String docenteNombre,
            boolean tienePlanClase,
            int totalPlanesRegistrados,
            int totalSesionesProgramadas,
            int totalSesionesRegistradas,
            BigDecimal puntajeRealTotal,
            BigDecimal avancePlaneadoPorcentaje,
            BigDecimal avanceRealPorcentaje,
            BigDecimal diferenciaPorcentaje,
            ColorSemaforo colorSemaforo,
            String motivoAlerta,
            MomentosStatsDto momentosCumplimiento
    ) {}
}
