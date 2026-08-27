package bo.edu.unitepc.sisa.infrastructure.gateway;

import bo.edu.unitepc.sisa.api.dto.gateway.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Spring RestClient-based Gateway Client for the UNITEPC Central Gateway APIs (https://gw-dev.unitepc.solutions).
 * Implements thread-safe M2M OAuth2 client credentials authentication with proactive auto-renewal (30s buffer).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class UnitepcGatewayClient {

    private static final Logger log = LoggerFactory.getLogger(UnitepcGatewayClient.class);
    private static final int RENEWAL_BUFFER_SECONDS = 30;
    private static final int DEFAULT_TTL_SECONDS = 300;

    private final RestClient restClient;
    private final String baseUrl;
    private final String clientId;
    private final String clientSecret;
    private final String tokenEndpoint;

    private final Object tokenLock = new Object();
    private volatile String cachedToken;
    private volatile Instant tokenExpiresAt = Instant.MIN;

    @org.springframework.beans.factory.annotation.Autowired
    public UnitepcGatewayClient(
            @Value("${app.unitepc.gateway.base-url:https://gw-dev.unitepc.solutions}") String baseUrl,
            @Value("${app.unitepc.gateway.client-id:sisa-backend}") String clientId,
            @Value("${app.unitepc.gateway.client-secret:sisa-secret-2026}") String clientSecret,
            @Value("${app.unitepc.gateway.token-endpoint:/auth/token}") String tokenEndpoint) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenEndpoint = tokenEndpoint;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Alternative constructor for testing and manual instantiation.
     */
    public UnitepcGatewayClient(
            String baseUrl,
            String clientId,
            String clientSecret,
            String tokenEndpoint,
            RestClient restClient) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenEndpoint = tokenEndpoint;
        this.restClient = restClient;
    }

    /**
     * Retrieves a valid OAuth2 Bearer token, renewing proactively if expiring within 30 seconds.
     * Thread-safe double-checked locking ensures only one remote token request occurs at a time.
     *
     * @return Valid OAuth2 Bearer token
     */
    public String getToken() {
        if (isTokenValid()) {
            return this.cachedToken;
        }

        synchronized (this.tokenLock) {
            if (isTokenValid()) {
                return this.cachedToken;
            }
            log.info("Requesting new OAuth2 token from UNITEPC Gateway: {}{}", this.baseUrl, this.tokenEndpoint);
            try {
                TokenResponseDto response = this.restClient.post()
                        .uri(this.tokenEndpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of(
                                "grant_type", "client_credentials",
                                "client_id", this.clientId,
                                "client_secret", this.clientSecret
                        ))
                        .retrieve()
                        .body(TokenResponseDto.class);

                if (response != null && response.accessToken() != null) {
                    this.cachedToken = response.accessToken();
                    int expiresIn = (response.expiresIn() != null && response.expiresIn() > 0)
                            ? response.expiresIn()
                            : DEFAULT_TTL_SECONDS;
                    this.tokenExpiresAt = Instant.now().plusSeconds(expiresIn);
                    log.info("OAuth2 token successfully obtained. Expires in {}s (valid until {})",
                            expiresIn, this.tokenExpiresAt);
                    return this.cachedToken;
                } else {
                    throw new IllegalStateException("Gateway returned empty token payload");
                }
            } catch (Exception ex) {
                log.error("Failed to obtain OAuth2 token from gateway {}: {}", this.baseUrl, ex.getMessage());
                throw new RuntimeException("Gateway authentication failure: " + ex.getMessage(), ex);
            }
        }
    }

    /**
     * Checks if current token is non-null and not within the 30-second expiration buffer.
     */
    public boolean isTokenValid() {
        return this.cachedToken != null &&
                Instant.now().plusSeconds(RENEWAL_BUFFER_SECONDS).isBefore(this.tokenExpiresAt);
    }

    /**
     * Fetch all branch offices (Sedes) from the UNITEPC Central Gateway.
     */
    public List<BranchOfficeDto> getBranchOffices() {
        String token = getToken();
        try {
            List<BranchOfficeDto> result = this.restClient.get()
                    .uri("/api/v1/branch-offices")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("clientId", this.clientId)
                    .header("X-Client-Id", this.clientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<BranchOfficeDto>>() {});
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Error fetching branch offices from gateway: {}", ex.getMessage());
            throw new RuntimeException("Gateway branch offices request failed", ex);
        }
    }

    /**
     * Fetch careers filtered by branch office code.
     */
    public List<CareerDto> getCareers(String branchOfficeCode) {
        String token = getToken();
        try {
            List<CareerDto> result = this.restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/careers")
                            .queryParam("branchOfficeCode", branchOfficeCode != null ? branchOfficeCode : "")
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("clientId", this.clientId)
                    .header("X-Client-Id", this.clientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CareerDto>>() {});
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Error fetching careers for branch office {}: {}", branchOfficeCode, ex.getMessage());
            throw new RuntimeException("Gateway careers request failed", ex);
        }
    }

    /**
     * Fetch courses filtered by branch office code and career code.
     */
    public List<CourseDto> getCourses(String branchOfficeCode, String careerCode) {
        String token = getToken();
        try {
            List<CourseDto> result = this.restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/courses")
                            .queryParam("branchOfficeCode", branchOfficeCode != null ? branchOfficeCode : "")
                            .queryParam("careerCode", careerCode != null ? careerCode : "")
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("clientId", this.clientId)
                    .header("X-Client-Id", this.clientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CourseDto>>() {});
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Error fetching courses for branch {} / career {}: {}", branchOfficeCode, careerCode, ex.getMessage());
            throw new RuntimeException("Gateway courses request failed", ex);
        }
    }

    /**
     * Fetch enrolled students by group ID.
     */
    public List<StudentItemDto> getStudentsByGroup(String groupId) {
        String token = getToken();
        try {
            List<StudentItemDto> result = this.restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/students/by-group")
                            .queryParam("groupId", groupId)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("clientId", this.clientId)
                    .header("X-Client-Id", this.clientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<StudentItemDto>>() {});
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Error fetching students for group {}: {}", groupId, ex.getMessage());
            throw new RuntimeException("Gateway students request failed", ex);
        }
    }

    /**
     * Fetch campuses filtered by branch office ID.
     */
    public List<CampusDto> getCampuses(String branchOfficeId) {
        String token = getToken();
        try {
            List<CampusDto> result = this.restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/campuses")
                            .queryParam("branchOfficeId", branchOfficeId != null ? branchOfficeId : "")
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("clientId", this.clientId)
                    .header("X-Client-Id", this.clientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CampusDto>>() {});
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Error fetching campuses for branch office ID {}: {}", branchOfficeId, ex.getMessage());
            throw new RuntimeException("Gateway campuses request failed", ex);
        }
    }

    /**
     * Fetch academic timeframes.
     */
    public List<TimeFrameDto> getTimeFrames() {
        String token = getToken();
        try {
            List<TimeFrameDto> result = this.restClient.get()
                    .uri("/api/v1/timeframes")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .header("clientId", this.clientId)
                    .header("X-Client-Id", this.clientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<TimeFrameDto>>() {});
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Error fetching timeframes: {}", ex.getMessage());
            throw new RuntimeException("Gateway timeframes request failed", ex);
        }
    }

    /**
     * Test gateway connectivity and token retrieval.
     */
    public boolean isOnline() {
        try {
            String token = getToken();
            return token != null && !token.isBlank();
        } catch (Exception e) {
            return false;
        }
    }

    public Instant getTokenExpiresAt() {
        return this.tokenExpiresAt;
    }

    public void setCachedTokenForTesting(String token, Instant expiresAt) {
        synchronized (this.tokenLock) {
            this.cachedToken = token;
            this.tokenExpiresAt = expiresAt;
        }
    }
}
