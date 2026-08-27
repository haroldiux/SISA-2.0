package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic timeframe / period (Gestión / Periodo Académico) from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param name Period name (e.g., Gestión II-2026)
 * @param year Academic year (e.g., 2026)
 * @param term Academic term/semester (e.g., II, I)
 * @param active Whether this timeframe is currently active
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record TimeFrameDto(
        String id,
        String name,
        String year,
        String term,
        Boolean active
) {}
