package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic career / program from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param code Career code (e.g., SIS, CARCCP, IND, MED)
 * @param name Full name of the career
 * @param branchOfficeCode Associated branch office code
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CareerDto(
        @JsonAlias({"careerId", "id"})
        String id,
        String code,
        String name,
        String branchOfficeCode
) {}

