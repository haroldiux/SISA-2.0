package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.controller.ScuAuthController;
import bo.edu.unitepc.sisa.api.request.ScuChangePasswordRequest;
import bo.edu.unitepc.sisa.api.request.ScuLoginRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuthResponse;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Sede;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuAuthException;
import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.service.command.ScuAuthenticateUserCmd;
import bo.edu.unitepc.sisa.service.command.ScuChangePasswordCmd;
import bo.edu.unitepc.sisa.service.command.ScuRefreshTokenCmd;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit & integration verification for authentication, first-time forced password change,
 * and subsequent regular authentication flows.
 *
 * @author GentleAI SISA Architecture Team
 */
public class AuthenticationAndChangePasswordTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;
    private ScuAuthenticateUserCmd authenticateUserCmd;
    private ScuChangePasswordCmd changePasswordCmd;
    private ScuRefreshTokenCmd refreshTokenCmd;
    private ScuAuthController authController;

    private Usuario testUser;

    @BeforeEach
    void setUp() {
        this.usuarioRepository = mock(UsuarioRepository.class);
        this.passwordEncoder = new BCryptPasswordEncoder();

        this.jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(
                this.jwtTokenProvider,
                "jwtSecret",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
        );
        ReflectionTestUtils.setField(this.jwtTokenProvider, "jwtExpirationMs", 28800000L);
        ReflectionTestUtils.setField(this.jwtTokenProvider, "jwtRefreshExpirationMs", 604800000L);

        this.authenticateUserCmd = new ScuAuthenticateUserCmd(
                this.usuarioRepository,
                this.passwordEncoder,
                this.jwtTokenProvider
        );

        this.changePasswordCmd = new ScuChangePasswordCmd(
                this.usuarioRepository,
                this.passwordEncoder,
                this.jwtTokenProvider
        );

        this.refreshTokenCmd = new ScuRefreshTokenCmd(
                this.jwtTokenProvider,
                this.usuarioRepository
        );

        this.authController = new ScuAuthController(
                this.authenticateUserCmd,
                this.refreshTokenCmd,
                this.changePasswordCmd,
                this.usuarioRepository
        );

        Sede sedeCbb = new Sede("CBB", "Sede Central Cochabamba", "Cochabamba");
        sedeCbb.setId(1L);

        this.testUser = new Usuario();
        this.testUser.setId(100L);
        this.testUser.setUsername("harold.docente");
        this.testUser.setEmail("harold.docente@unitepc.edu.bo");
        this.testUser.setCi("5241890-CB");
        this.testUser.setNombres("Harold");
        this.testUser.setApellidos("Iriarte Rojas");
        this.testUser.setRol(RolUsuario.ROLE_DOCENTE);
        this.testUser.setSede(sedeCbb);
        this.testUser.setActivo(true);
        this.testUser.setMustChangePassword(true);
        this.testUser.setPasswordHash(this.passwordEncoder.encode("5241890"));

        when(this.usuarioRepository.findByUsername("harold.docente")).thenReturn(Optional.of(this.testUser));
        when(this.usuarioRepository.findById(100L)).thenReturn(Optional.of(this.testUser));
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Login with mustChangePassword=true issues temporary token and flag")
    void shouldIssueChangePasswordTokenWhenMustChangePasswordIsTrue() {
        ScuLoginRequest request = ScuLoginRequest.builder()
                .username("harold.docente")
                .password("5241890")
                .build();

        ScuAuthResponse response = this.authenticateUserCmd.execute(request);

        assertNotNull(response);
        assertTrue(response.isMustChangePassword());
        assertTrue(response.getMustChangePassword());
        assertNotNull(response.getAccessToken());
        assertEquals(response.getAccessToken(), response.getToken());
        assertNull(response.getRefreshToken(), "Temporary change-password token should not issue a refresh token");
        assertNotNull(response.getUser());
        assertTrue(response.getUser().getMustChangePassword());

        // Validate JWT Claims
        Claims claims = this.jwtTokenProvider.getClaimsFromToken(response.getAccessToken());
        assertEquals(Boolean.TRUE, claims.get("mustChangePassword"));
        assertEquals(Boolean.TRUE, claims.get("passwordChangeOnly"));
        assertEquals("harold.docente", claims.getSubject());
    }

    @Test
    @DisplayName("2. Change password rejects invalid current password")
    void shouldRejectChangePasswordWhenCurrentPasswordIsInvalid() {
        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("WrongPassword!")
                .newPassword("NewSecurePassword2026!")
                .confirmPassword("NewSecurePassword2026!")
                .build();

        ScuAuthException exception = assertThrows(
                ScuAuthException.class,
                () -> this.changePasswordCmd.execute(request)
        );

        assertTrue(exception.getMessage().contains("incorrecta"));
    }

    @Test
    @DisplayName("3. Change password rejects new password equal to current password")
    void shouldRejectChangePasswordWhenNewPasswordIsSameAsCurrentPassword() {
        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("5241890")
                .confirmPassword("5241890")
                .build();

        ScuAuthException exception = assertThrows(
                ScuAuthException.class,
                () -> this.changePasswordCmd.execute(request)
        );

        assertTrue(exception.getMessage().contains("igual a la contraseña actual"));
    }

    @Test
    @DisplayName("4. Change password rejects new password equal to CI")
    void shouldRejectChangePasswordWhenNewPasswordIsSameAsCi() {
        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("5241890-CB")
                .confirmPassword("5241890-CB")
                .build();

        ScuAuthException exception = assertThrows(
                ScuAuthException.class,
                () -> this.changePasswordCmd.execute(request)
        );

        assertTrue(exception.getMessage().contains("carnet de identidad (CI)"));
    }

    @Test
    @DisplayName("5. Change password rejects short password")
    void shouldRejectChangePasswordWhenTooShort() {
        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("short")
                .confirmPassword("short")
                .build();

        ScuAuthException exception = assertThrows(
                ScuAuthException.class,
                () -> this.changePasswordCmd.execute(request)
        );

        assertTrue(exception.getMessage().contains("al menos 8 caracteres"));
    }

    @Test
    @DisplayName("6. Change password rejects mismatched confirmation")
    void shouldRejectChangePasswordWhenConfirmationMismatch() {
        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("NewSecurePassword2026!")
                .confirmPassword("Different2026!")
                .build();

        ScuAuthException exception = assertThrows(
                ScuAuthException.class,
                () -> this.changePasswordCmd.execute(request)
        );

        assertTrue(exception.getMessage().contains("no coinciden"));
    }

    @Test
    @DisplayName("7. Successful password change clears mustChangePassword and issues full access token")
    void shouldSuccessfullyChangePasswordAndClearFlag() {
        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("NewSecurePassword2026!")
                .confirmPassword("NewSecurePassword2026!")
                .build();

        ScuAuthResponse response = this.changePasswordCmd.execute(request);

        assertNotNull(response);
        assertFalse(response.isMustChangePassword());
        assertFalse(response.getMustChangePassword());
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken(), "Full access token should include refresh token");

        // Verify entity updated
        assertFalse(this.testUser.getMustChangePassword());
        assertTrue(this.passwordEncoder.matches("NewSecurePassword2026!", this.testUser.getPasswordHash()));

        // Verify claims in full token
        Claims claims = this.jwtTokenProvider.getClaimsFromToken(response.getAccessToken());
        assertEquals(Boolean.FALSE, claims.get("mustChangePassword"));
        assertNull(claims.get("passwordChangeOnly"));
    }

    @Test
    @DisplayName("8. Subsequent regular login after password change succeeds with new password and fails with old")
    void shouldAllowRegularLoginAfterPasswordChange() {
        // Step 1: Change password
        ScuChangePasswordRequest changeReq = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("NewSecurePassword2026!")
                .confirmPassword("NewSecurePassword2026!")
                .build();
        this.changePasswordCmd.execute(changeReq);

        // Step 2: Login with old password must fail
        ScuLoginRequest oldLoginReq = ScuLoginRequest.builder()
                .username("harold.docente")
                .password("5241890")
                .build();
        assertThrows(ScuAuthException.class, () -> this.authenticateUserCmd.execute(oldLoginReq));

        // Step 3: Login with new password must succeed as regular login
        ScuLoginRequest newLoginReq = ScuLoginRequest.builder()
                .username("harold.docente")
                .password("NewSecurePassword2026!")
                .build();
        ScuAuthResponse loginResponse = this.authenticateUserCmd.execute(newLoginReq);

        assertNotNull(loginResponse);
        assertFalse(loginResponse.isMustChangePassword());
        assertNotNull(loginResponse.getAccessToken());
        assertNotNull(loginResponse.getRefreshToken());
    }

    @Test
    @DisplayName("9. Password change extracts username from SecurityContext when omitted in body")
    void shouldExtractUsernameFromSecurityContext() {
        // Authenticate context with user
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "harold.docente",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_DOCENTE"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        ScuChangePasswordRequest request = ScuChangePasswordRequest.builder()
                .username(null) // omitted
                .currentPassword("5241890")
                .newPassword("AnotherSecurePassword2026!")
                .confirmPassword("AnotherSecurePassword2026!")
                .build();

        ScuAuthResponse response = this.changePasswordCmd.execute(request);

        assertNotNull(response);
        assertFalse(response.isMustChangePassword());
        assertEquals("harold.docente", response.getUser().getUsername());
    }

    @Test
    @DisplayName("10. Controller endpoints /login and /change-password execute correctly")
    void shouldHandleControllerLoginAndChangePassword() {
        // Test Controller /login
        ScuLoginRequest loginRequest = ScuLoginRequest.builder()
                .username("harold.docente")
                .password("5241890")
                .build();

        ResponseEntity<Map<String, Object>> loginResult = this.authController.login(loginRequest);
        assertEquals(200, loginResult.getStatusCode().value());
        assertNotNull(loginResult.getBody());
        assertTrue(loginResult.getBody().containsKey("data"));

        // Test Controller /change-password
        ScuChangePasswordRequest changeRequest = ScuChangePasswordRequest.builder()
                .username("harold.docente")
                .currentPassword("5241890")
                .newPassword("SuperSecretPass2026!")
                .confirmPassword("SuperSecretPass2026!")
                .build();

        ResponseEntity<Map<String, Object>> changeResult = this.authController.changePassword(changeRequest);
        assertEquals(200, changeResult.getStatusCode().value());
        assertNotNull(changeResult.getBody());
        assertEquals("Contraseña actualizada exitosamente", changeResult.getBody().get("message"));
    }
}
