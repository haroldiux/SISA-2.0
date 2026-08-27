package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an enrolled student item from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param code Student institutional code / registration number
 * @param firstName Student first name(s)
 * @param firstLastName Student primary paternal last name
 * @param secondLastName Student secondary maternal last name
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record StudentItemDto(
        String id,
        String code,
        String firstName,
        String firstLastName,
        String secondLastName
) {}
