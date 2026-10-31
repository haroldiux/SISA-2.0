package bo.edu.unitepc.sisa.api.dto;

import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Canonical Data Transfer Object for SeguimientoClase entity.
 *
 * @author GentleAI SISA Architecture Team
 */
public record SeguimientoClaseDto(
        Long id,
        Long sesionMatriz7Id,
        String materiaCodigo,
        String carreraCodigo,
        String docenteCi,
        LocalDate fechaEjecucion,
        TipoSesion tipoClase,
        String comision,
        String temaOficial,
        String temaEjecutado,
        List<String> recursosPlanificados,
        List<String> recursosUtilizados,
        Boolean momentoInicioCumplido,
        Boolean momentoDesarrolloCumplido,
        Boolean momentoCierreCumplido,
        Boolean secuenciaIntroduccion,
        Boolean secuenciaResultados,
        Boolean secuenciaContenidos,
        Boolean secuenciaCuerpo,
        Boolean secuenciaCierre,
        EstadoCumplimientoTema estadoCumplimiento,
        BigDecimal cumplimientoScore,
        String observacionesDocente,
        String planClaseEstadoActualizado,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn
) {}
