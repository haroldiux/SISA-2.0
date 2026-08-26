package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuRefreshTokenRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuthResponse;
import bo.edu.unitepc.sisa.api.response.ScuUserResponse;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuAuthException;
import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Command for rotating expired JWT access tokens using valid refresh tokens.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuRefreshTokenCmd {

    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;

    public ScuRefreshTokenCmd(
            JwtTokenProvider jwtTokenProvider,
            UsuarioRepository usuarioRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public ScuAuthResponse execute(ScuRefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!this.jwtTokenProvider.validateToken(token)) {
            throw new ScuAuthException("Refresh token inválido o expirado");
        }

        String username = this.jwtTokenProvider.getUsernameFromToken(token);
        Usuario user = this.usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ScuAuthException("Usuario no encontrado"));

        String newAccessToken = this.jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = this.jwtTokenProvider.generateRefreshToken(user);

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
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(28800L)
                .user(userResponse)
                .build();
    }
}
