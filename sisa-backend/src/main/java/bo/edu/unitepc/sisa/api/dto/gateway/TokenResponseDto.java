package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing OAuth2 M2M token response from UNITEPC Gateway.
 *
 * @param accessToken Access token string
 * @param tokenType Token type (e.g., Bearer)
 * @param expiresIn Token lifetime in seconds (defaults to 300)
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record TokenResponseDto(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("expires_in") Integer expiresIn
) {}
