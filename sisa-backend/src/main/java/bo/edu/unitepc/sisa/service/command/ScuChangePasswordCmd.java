package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuChangePasswordRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuthResponse;
import bo.edu.unitepc.sisa.api.response.ScuUserResponse;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuAuthException;
import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Command for validating password policies, updating user password,
 * clearing mustChangePassword flag, and issuing a full-access JWT envelope.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuChangePasswordCmd {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public ScuChangePasswordCmd(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public ScuAuthResponse execute(ScuChangePasswordRequest request) {
        if (request == null) {
            throw new ScuAuthException("La solicitud de cambio de contraseña no puede ser nula");
        }

        // 1. Resolve target username (from body or current security/tenant context)
        String username = request.getUsername();
        if (!StringUtils.hasText(username)) {
            if (TenantContext.getTenantInfo() != null && StringUtils.hasText(TenantContext.getTenantInfo().getUsername())) {
                username = TenantContext.getTenantInfo().getUsername();
            } else {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    username = auth.getName();
                }
            }
        }

        if (!StringUtils.hasText(username)) {
            throw new ScuAuthException("No se especificó el usuario para el cambio de contraseña");
        }

        final String targetUsername = username;
        Usuario user = this.usuarioRepository.findByUsername(targetUsername)
                .or(() -> this.usuarioRepository.findByCi(targetUsername))
                .orElseThrow(() -> new ScuAuthException("Usuario no encontrado: " + targetUsername));

        if (!Boolean.TRUE.equals(user.getActivo())) {
            throw new ScuAuthException("La cuenta de usuario está desactivada.");
        }

        // 2. Validate current password (or token session)
        if (StringUtils.hasText(request.getCurrentPassword())) {
            if (!this.passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new ScuAuthException("La contraseña actual es incorrecta");
            }
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean tokenValid = auth != null && auth.isAuthenticated() && username.equals(auth.getName());
            if (!tokenValid) {
                throw new ScuAuthException("Debe proporcionar la contraseña actual o estar autenticado con un token válido");
            }
        }

        // 3. Validate confirmation password if provided
        if (StringUtils.hasText(request.getConfirmPassword())
                && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ScuAuthException("La nueva contraseña y su confirmación no coinciden");
        }

        // 4. Validate new password complexity
        String newPassword = request.getNewPassword();
        if (!StringUtils.hasText(newPassword)) {
            throw new ScuAuthException("La nueva contraseña es obligatoria");
        }

        if (this.passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new ScuAuthException("La nueva contraseña no puede ser igual a la contraseña actual");
        }

        if (StringUtils.hasText(user.getCi())) {
            String cleanCi = user.getCi().trim();
            String baseCi = cleanCi.split("-")[0].trim();
            if (newPassword.equalsIgnoreCase(cleanCi) || newPassword.equalsIgnoreCase(baseCi)) {
                throw new ScuAuthException("La nueva contraseña no puede ser igual al número de carnet de identidad (CI)");
            }
        }

        if (newPassword.equalsIgnoreCase(user.getUsername())) {
            throw new ScuAuthException("La nueva contraseña no puede ser igual al nombre de usuario");
        }

        if (newPassword.trim().length() < 8) {
            throw new ScuAuthException("La nueva contraseña debe tener al menos 8 caracteres");
        }

        // 5. Update user password and clear mustChangePassword flag
        user.setPasswordHash(this.passwordEncoder.encode(newPassword.trim()));
        user.setMustChangePassword(false);
        Usuario savedUser = this.usuarioRepository.save(user);

        // 6. Issue full access token
        String accessToken = this.jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = this.jwtTokenProvider.generateRefreshToken(savedUser);

        ScuUserResponse userResponse = ScuUserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRol())
                .sedeId(savedUser.getSede() != null ? savedUser.getSede().getId() : null)
                .sedeNombre(savedUser.getSede() != null ? savedUser.getSede().getNombre() : "Nacional")
                .nombres(savedUser.getNombres())
                .apellidos(savedUser.getApellidos())
                .nombreCompleto(savedUser.getNombreCompleto())
                .mustChangePassword(false)
                .build();

        return ScuAuthResponse.builder()
                .accessToken(accessToken)
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(28800L)
                .mustChangePassword(false)
                .user(userResponse)
                .build();
    }
}
