package bo.edu.unitepc.sisa.api.dto.gateway;

import java.util.List;

/**
 * DTO representing an academic teacher (Docente) and their course assignments from the SEA Gateway.
 *
 * @author GentleAI SISA Architecture Team
 */
public record DocenteItemDto(
        String ci,
        String nombreCompleto,
        String email,
        String sedeCodigo,
        String carreraPrincipal,
        List<String> materiasNombres,
        List<GroupItemDto> grupos
) {}
