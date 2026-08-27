package bo.edu.unitepc.sisa.infrastructure.gateway;

import bo.edu.unitepc.sisa.api.dto.gateway.BranchOfficeDto;
import bo.edu.unitepc.sisa.api.dto.gateway.CareerDto;
import bo.edu.unitepc.sisa.api.dto.gateway.CourseDto;
import bo.edu.unitepc.sisa.api.dto.gateway.StudentItemDto;
import bo.edu.unitepc.sisa.api.dto.gateway.TokenResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

/**
 * Tests for UnitepcGatewayClient: OAuth2 proactive token renewal and thread-safe operations.
 *
 * @author GentleAI SISA Architecture Team
 */
public class UnitepcGatewayClientTest {

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer mockServer;
    private UnitepcGatewayClient gatewayClient;

    private static final String BASE_URL = "https://gw-dev.unitepc.solutions";
    private static final String CLIENT_ID = "sisa-backend";
    private static final String CLIENT_SECRET = "sisa-secret-2026";
    private static final String TOKEN_ENDPOINT = "/auth/token";

    @BeforeEach
    void setUp() {
        this.restClientBuilder = RestClient.builder();
        this.mockServer = MockRestServiceServer.bindTo(this.restClientBuilder).build();
        this.gatewayClient = new UnitepcGatewayClient(
                BASE_URL,
                CLIENT_ID,
                CLIENT_SECRET,
                TOKEN_ENDPOINT,
                this.restClientBuilder.baseUrl(BASE_URL).build()
        );
    }

    @Test
    @DisplayName("Should request new OAuth2 token on first invocation")
    void shouldFetchTokenOnFirstCall() {
        String tokenJson = """
                {
                    "access_token": "mock-token-xyz-123",
                    "token_type": "Bearer",
                    "expires_in": 300
                }
                """;

        this.mockServer.expect(requestTo(BASE_URL + TOKEN_ENDPOINT))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andRespond(withSuccess(tokenJson, MediaType.APPLICATION_JSON));

        String token = this.gatewayClient.getToken();

        assertEquals("mock-token-xyz-123", token);
        assertTrue(this.gatewayClient.isTokenValid());
        this.mockServer.verify();
    }

    @Test
    @DisplayName("Should return cached token when still valid without making a new request")
    void shouldReturnCachedTokenWhenValid() {
        this.gatewayClient.setCachedTokenForTesting("cached-active-token", Instant.now().plusSeconds(250));

        String token = this.gatewayClient.getToken();

        assertEquals("cached-active-token", token);
        // No server requests should have been made
        this.mockServer.verify();
    }

    @Test
    @DisplayName("Should proactively renew token when within 30-second buffer")
    void shouldRenewTokenWithinBuffer() {
        // Expiring in 10 seconds -> within 30s buffer
        this.gatewayClient.setCachedTokenForTesting("expiring-token", Instant.now().plusSeconds(10));

        String newTokenJson = """
                {
                    "access_token": "renewed-token-456",
                    "token_type": "Bearer",
                    "expires_in": 300
                }
                """;

        this.mockServer.expect(requestTo(BASE_URL + TOKEN_ENDPOINT))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andRespond(withSuccess(newTokenJson, MediaType.APPLICATION_JSON));

        String token = this.gatewayClient.getToken();

        assertEquals("renewed-token-456", token);
        this.mockServer.verify();
    }

    @Test
    @DisplayName("Should be thread-safe when multiple threads request token concurrently")
    void shouldHandleConcurrentRequestsSafely() throws Exception {
        this.gatewayClient.setCachedTokenForTesting(null, Instant.MIN);

        String tokenJson = """
                {
                    "access_token": "single-renewed-token",
                    "token_type": "Bearer",
                    "expires_in": 300
                }
                """;

        // Expect only ONE token request despite 10 threads
        this.mockServer.expect(requestTo(BASE_URL + TOKEN_ENDPOINT))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andRespond(withSuccess(tokenJson, MediaType.APPLICATION_JSON));

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        List<String> tokens = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    String token = this.gatewayClient.getToken();
                    tokens.add(token);
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        assertEquals(threadCount, tokens.size());
        for (String t : tokens) {
            assertEquals("single-renewed-token", t);
        }
        this.mockServer.verify();
    }

    @Test
    @DisplayName("Should fetch branch offices with Authorization Bearer header")
    void shouldFetchBranchOffices() {
        this.gatewayClient.setCachedTokenForTesting("valid-auth-token", Instant.now().plusSeconds(200));

        String branchesJson = """
                [
                    { "id": "b1", "code": "CBBA", "name": "Cochabamba" },
                    { "id": "b2", "code": "LPZ", "name": "La Paz" }
                ]
                """;

        this.mockServer.expect(requestTo(BASE_URL + "/api/v1/branch-offices"))
                .andExpect(header("Authorization", "Bearer valid-auth-token"))
                .andRespond(withSuccess(branchesJson, MediaType.APPLICATION_JSON));

        List<BranchOfficeDto> list = this.gatewayClient.getBranchOffices();

        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals("CBBA", list.get(0).code());
        assertEquals("La Paz", list.get(1).name());
        this.mockServer.verify();
    }
}
