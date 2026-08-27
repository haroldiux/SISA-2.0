package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic branch office (Sede) from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param code Branch office code (e.g., CBBA, LPZ, SCZ)
 * @param name Full name of the branch office
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record BranchOfficeDto(
        String id,
        String code,
        String name
) {}
