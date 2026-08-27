package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic campus / physical facility from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param name Campus name (e.g., Campus Colonial, Campus Juan Pablo II)
 * @param branchOfficeId Associated branch office ID
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CampusDto(
        String id,
        String name,
        String branchOfficeId
) {}
