package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

/**
 * Request payload for saving or updating didactical class tracking in classroom.
 *
 * @author GentleAI SISA Architecture Team
 */
public record GuardarSeguimientoClaseRequest(
        Long sesionMatriz7Id,
        @NotBlank String materiaCodigo,
        String carreraCodigo,
        @NotBlank String docenteCi,
        @NotNull LocalDate fechaEjecucion,
        @NotNull TipoSesion tipoClase,
        @NotBlank String comision,
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
        @NotNull EstadoCumplimientoTema estadoCumplimiento,
        String observacionesDocente
) {}
