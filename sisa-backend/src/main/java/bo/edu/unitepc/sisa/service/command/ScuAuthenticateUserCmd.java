package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuLoginRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuthResponse;
import bo.edu.unitepc.sisa.api.response.ScuUserResponse;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuAuthException;
import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Command for authenticating user credentials and issuing JWT token envelopes.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuAuthenticateUserCmd {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public ScuAuthenticateUserCmd(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional(readOnly = true)
    public ScuAuthResponse execute(ScuLoginRequest request) {
        Usuario user = this.usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ScuAuthException("Credenciales inválidas para usuario: " + request.getUsername()));

        if (!Boolean.TRUE.equals(user.getActivo())) {
            throw new ScuAuthException("La cuenta de usuario está desactivada.");
        }

        if (!this.passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ScuAuthException("Credenciales inválidas para usuario: " + request.getUsername());
        }

        String accessToken = this.jwtTokenProvider.generateAccessToken(user);
        String refreshToken = this.jwtTokenProvider.generateRefreshToken(user);

        ScuUserResponse userResponse = ScuUserResponse.builder()
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

        return ScuAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(28800L)
                .user(userResponse)
                .build();
    }
}
