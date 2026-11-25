package bo.edu.unitepc.sisa.api.dto;

import bo.edu.unitepc.sisa.domain.enums.NivelParametro;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO representing an active or effective parameter configuration with hierarchical inheritance metadata.
 *
 * @author GentleAI SISA Architecture Team
 */
@Builder
public record ParametroConfiguracionDto(
        Long id,
        NivelParametro nivel,
        String codigoAmbito,
        String nombreAmbito,
        BigDecimal asistenciaMinimaPct,
        BigDecimal asistenciaAlertaPct,
        Integer faltasConsecutivasAlerta,
        BigDecimal semaforoVerdePct,
        BigDecimal semaforoAmarilloPct,
        Integer horasGraciaRegistroDocente,
        Integer sesionesSinAsentarAlerta,
        String observaciones,
        String fuenteHerencia, // 'GLOBAL', 'SEDE', 'CARRERA'
        boolean esSobreescritura,
        LocalDateTime updatedAt,
        String updatedBy
) {
}
