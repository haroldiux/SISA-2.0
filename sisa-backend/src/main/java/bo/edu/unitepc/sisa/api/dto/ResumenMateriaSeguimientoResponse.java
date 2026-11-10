package bo.edu.unitepc.sisa.api.dto;

import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Audit and Longitudinal Response DTO for class tracking of a subject.
 *
 * @author GentleAI SISA Architecture Team
 */
public record ResumenMateriaSeguimientoResponse(
        String materiaCodigo,
        String materiaNombre,
        String carreraCodigo,
        String docenteCi,
        String docenteNombre,
        int totalSesionesRegistradas,
        BigDecimal puntajeTotal,
        MomentosStatsDto momentos,
        List<RecursoHistogramaDto> recursosHistograma,
        List<SesionSeguimientoItemDto> sesiones
) {

    public record MomentosStatsDto(
            BigDecimal inicioPorcentaje,
            BigDecimal desarrolloPorcentaje,
            BigDecimal cierrePorcentaje,
            BigDecimal introduccionPorcentaje,
            BigDecimal resultadosPorcentaje,
            BigDecimal contenidosPorcentaje,
            BigDecimal cuerpoPorcentaje,
            BigDecimal cierreSecuenciaPorcentaje
    ) {
        public MomentosStatsDto(BigDecimal inicio, BigDecimal desarrollo, BigDecimal cierre) {
            this(inicio, desarrollo, cierre, inicio, inicio, desarrollo, desarrollo, cierre);
        }
    }

    public record RecursoHistogramaDto(
            String recurso,
            Long usos
    ) {}

    public record SesionSeguimientoItemDto(
            Long id,
            Integer nroSesion,
            Integer semana,
            LocalDate fechaEjecucion,
            TipoSesion tipoClase,
            String comision,
            String temaOficial,
            String temaEjecutado,
            Boolean momentoInicioCumplido,
            Boolean momentoDesarrolloCumplido,
            Boolean momentoCierreCumplido,
            EstadoCumplimientoTema estadoCumplimiento,
            BigDecimal cumplimientoScore,
            String observacionesDocente,
            Boolean secuenciaIntroduccion,
            Boolean secuenciaResultados,
            Boolean secuenciaContenidos,
            Boolean secuenciaCuerpo,
            Boolean secuenciaCierre
    ) {}
}
