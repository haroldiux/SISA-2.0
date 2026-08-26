package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuLoginRequest;
import bo.edu.unitepc.sisa.api.request.ScuRefreshTokenRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuthResponse;
import bo.edu.unitepc.sisa.api.response.ScuUserResponse;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuAuthException;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import bo.edu.unitepc.sisa.service.command.ScuAuthenticateUserCmd;
import bo.edu.unitepc.sisa.service.command.ScuRefreshTokenCmd;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for authentication, token refresh, and user profile queries.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/auth", "/api/v1/system/auth"})
public class ScuAuthController {

    private final ScuAuthenticateUserCmd authenticateUserCmd;
    private final ScuRefreshTokenCmd refreshTokenCmd;
    private final UsuarioRepository usuarioRepository;

    public ScuAuthController(
            ScuAuthenticateUserCmd authenticateUserCmd,
            ScuRefreshTokenCmd refreshTokenCmd,
            UsuarioRepository usuarioRepository) {
        this.authenticateUserCmd = authenticateUserCmd;
        this.refreshTokenCmd = refreshTokenCmd;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody ScuLoginRequest request) {
        ScuAuthResponse response = this.authenticateUserCmd.execute(request);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Autenticación exitosa")
                        .build()
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@Valid @RequestBody ScuRefreshTokenRequest request) {
        ScuAuthResponse response = this.refreshTokenCmd.execute(request);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Token renovado exitosamente")
                        .build()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        TenantInfo tenant = TenantContext.getTenantInfo();
        if (tenant == null || tenant.getUserId() == null) {
            throw new ScuAuthException("Sesión de usuario no válida");
        }

        Usuario user = this.usuarioRepository.findById(tenant.getUserId())
                .orElseThrow(() -> new ScuAuthException("Usuario no encontrado"));

        ScuUserResponse response = ScuUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRol())
                .sedeId(user.getSede() != null ? user.getSede().getId() : null)
                .sedeNombre(user.getSede() != null ? user.getSede().getNombre() : "Nacional")
                .nombres(user.getNombres())
                .apellidos(user.getApellidos())
                .nombreCompleto(user.getNombreCompleto())
                .build();

        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Perfil obtenido")
                        .build()
        );
    }
}
