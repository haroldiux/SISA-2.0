package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuPacBatchReviewRequest;
import bo.edu.unitepc.sisa.api.response.ScuPacBatchReviewResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for executing semester-level batch endorsement and certification of PACs.
 * Updates all qualifying PACs to APROBADO atomically within a single database transaction.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuBatchReviewPacCmd {

    private static final Logger log = LoggerFactory.getLogger(ScuBatchReviewPacCmd.class);

    private final PacRepository pacRepository;
    private final UsuarioRepository usuarioRepository;
    private final ScuGetPacByCarreraCmd getPacByCarreraCmd;

    public ScuBatchReviewPacCmd(
            PacRepository pacRepository,
            UsuarioRepository usuarioRepository,
            ScuGetPacByCarreraCmd getPacByCarreraCmd) {
        this.pacRepository = pacRepository;
        this.usuarioRepository = usuarioRepository;
        this.getPacByCarreraCmd = getPacByCarreraCmd;
    }

    @Transactional
    public ScuPacBatchReviewResponse execute(ScuPacBatchReviewRequest request) {
        if (request == null) {
            throw new ScuException(
                    "EMPTY_BATCH_REVIEW",
                    "El cuerpo de la solicitud no puede ser nulo.",
                    HttpStatus.BAD_REQUEST
            );
        }

        TenantInfo tenant = TenantContext.getTenantInfo();
        Long resolvedCarreraId = (request.getCarreraId() != null)
                ? this.getPacByCarreraCmd.resolveCarreraId(request.getCarreraId())
                : null;

        // Authority validation for ROLE_DIR_CARRERA
        if (tenant != null && RolUsuario.ROLE_DIR_CARRERA.equals(tenant.getRol())
                && tenant.getCarreraIds() != null && !tenant.getCarreraIds().isEmpty()) {
            if (resolvedCarreraId != null && !tenant.getCarreraIds().contains(resolvedCarreraId)) {
                throw new ScuException(
                        "UNAUTHORIZED_CAREER_REVIEW",
                        "No tiene autorización para emitir dictamen sobre asignaturas de otra carrera.",
                        HttpStatus.FORBIDDEN
                );
            }
        }

        List<Pac> targetPacs = new ArrayList<>();

        if (request.getPacIds() != null && !request.getPacIds().isEmpty()) {
            List<Pac> found = this.pacRepository.findAllById(request.getPacIds());
            targetPacs = found.stream()
                    .filter(p -> p.getEstado() != EstadoPlanificacion.APROBADO)
                    .collect(Collectors.toList());
        } else if (resolvedCarreraId != null) {
            Long effectiveGestionId = this.getPacByCarreraCmd.resolveEffectiveGestionId(request.getGestionId());
            List<Pac> pacList = this.pacRepository.findByCarreraAndGestion(resolvedCarreraId, effectiveGestionId);
            targetPacs = pacList.stream()
                    .filter(p -> p.getEstado() != EstadoPlanificacion.APROBADO)
                    .filter(p -> {
                        if (request.getSemestre() == null) {
                            return true;
                        }
                        if (p.getAsignacion() != null && p.getAsignacion().getAsignatura() != null) {
                            return request.getSemestre().equals(p.getAsignacion().getAsignatura().getSemestre());
                        }
                        return false;
                    })
                    .collect(Collectors.toList());
        }

        // Validate that there is at least one PAC to process
        if (targetPacs.isEmpty()) {
            throw new ScuException(
                    "EMPTY_BATCH_REVIEW",
                    "No se encontraron planificaciones pendientes para certificar en lote.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // Cross-check authority on individual target PACs
        if (tenant != null && RolUsuario.ROLE_DIR_CARRERA.equals(tenant.getRol())
                && tenant.getCarreraIds() != null && !tenant.getCarreraIds().isEmpty()) {
            for (Pac p : targetPacs) {
                if (p.getAsignacion() != null
                        && p.getAsignacion().getAsignatura() != null
                        && p.getAsignacion().getAsignatura().getCarrera() != null) {
                    Long pacCarreraId = p.getAsignacion().getAsignatura().getCarrera().getId();
                    if (pacCarreraId != null && !tenant.getCarreraIds().contains(pacCarreraId)) {
                        throw new ScuException(
                                "UNAUTHORIZED_CAREER_REVIEW",
                                "No tiene autorización para certificar en lote asignaturas de otra carrera líder.",
                                HttpStatus.FORBIDDEN
                        );
                    }
                }
            }
        }

        Usuario reviewer = (tenant != null && tenant.getUserId() != null)
                ? this.usuarioRepository.findById(tenant.getUserId()).orElse(null)
                : null;

        String reviewerName = (reviewer != null && reviewer.getNombreCompleto() != null)
                ? reviewer.getNombreCompleto()
                : (tenant != null && tenant.getUsername() != null ? tenant.getUsername() : "Lic. Mariana Rios Vargas");

        OffsetDateTime nowOffset = OffsetDateTime.now();
        Instant nowInstant = nowOffset.toInstant();

        String obs = (request.getObservaciones() != null && !request.getObservaciones().isBlank())
                ? request.getObservaciones().trim()
                : "Certificación curricular en lote - Semestre " + (request.getSemestre() != null ? request.getSemestre() : "");

        for (Pac pac : targetPacs) {
            pac.setEstado(EstadoPlanificacion.APROBADO);
            pac.setObservacionesRevision(obs);
            pac.setRevisadoPor(reviewer);
            pac.setRevisadoEn(nowOffset);
            pac.setActualizadoEn(nowOffset);
        }

        List<Pac> saved = this.pacRepository.saveAll(targetPacs);
        log.info("Batch endorsement completed: {} PACs certified as APROBADO by '{}'", saved.size(), reviewerName);

        List<Long> approvedIds = saved.stream().map(Pac::getId).collect(Collectors.toList());

        return ScuPacBatchReviewResponse.builder()
                .totalReviewed(saved.size())
                .approvedIds(approvedIds)
                .carreraId(request.getCarreraId())
                .semestre(request.getSemestre())
                .revisadoPor(reviewerName)
                .revisadoEn(nowInstant)
                .build();
    }
}
