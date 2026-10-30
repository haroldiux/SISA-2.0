package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.AcademicaAsignacionDto;
import bo.edu.unitepc.sisa.api.request.ScuLoginRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuthResponse;
import bo.edu.unitepc.sisa.api.response.ScuUserResponse;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.model.UsuarioAsignacionAcademica;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuAuthException;
import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
                .or(() -> this.usuarioRepository.findByCi(request.getUsername()))
                .orElseThrow(() -> new ScuAuthException("Credenciales inválidas para usuario: " + request.getUsername()));

        if (!Boolean.TRUE.equals(user.getActivo())) {
            throw new ScuAuthException("La cuenta de usuario está desactivada.");
        }

        if (!this.passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ScuAuthException("Credenciales inválidas para usuario: " + request.getUsername());
        }

        boolean mustChangePassword = Boolean.TRUE.equals(user.getMustChangePassword());
        String accessToken = mustChangePassword
                ? this.jwtTokenProvider.generatePasswordChangeToken(user)
                : this.jwtTokenProvider.generateAccessToken(user);
        String refreshToken = mustChangePassword ? null : this.jwtTokenProvider.generateRefreshToken(user);

        List<AcademicaAsignacionDto> asignaciones = new ArrayList<>();
        if (user.getAsignacionesAcademicas() != null) {
            for (UsuarioAsignacionAcademica asig : user.getAsignacionesAcademicas()) {
                asignaciones.add(AcademicaAsignacionDto.builder()
                        .id(asig.getId())
                        .sedeId(asig.getSede() != null ? asig.getSede().getId() : null)
                        .sedeNombre(asig.getSede() != null ? asig.getSede().getNombre() : null)
                        .carreraId(asig.getCarrera() != null ? asig.getCarrera().getId() : null)
                        .carreraNombre(asig.getCarrera() != null ? asig.getCarrera().getNombre() : null)
                        .asignaturaId(asig.getAsignatura() != null ? asig.getAsignatura().getId() : null)
                        .asignaturaNombre(asig.getAsignatura() != null ? asig.getAsignatura().getNombre() : null)
                        .build());
            }
        }

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
                .mustChangePassword(mustChangePassword)
                .asignaciones(asignaciones)
                .build();

        return ScuAuthResponse.builder()
                .accessToken(accessToken)
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(mustChangePassword ? 1800L : 28800L)
                .mustChangePassword(mustChangePassword)
                .user(userResponse)
                .build();
    }
}
