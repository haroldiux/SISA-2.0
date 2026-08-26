package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuPacReviewRequest;
import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for Career Director PAC review (Approval or Observation feedback).
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuReviewPacCmd {

    private final PacRepository pacRepository;
    private final UsuarioRepository usuarioRepository;

    public ScuReviewPacCmd(
            PacRepository pacRepository,
            UsuarioRepository usuarioRepository) {
        this.pacRepository = pacRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ScuPacResponse execute(Long pacId, ScuPacReviewRequest request) {
        Pac pac = this.pacRepository.findById(pacId)
                .orElseThrow(() -> new ScuException(
                        "PAC_NOT_FOUND", "PAC no encontrado con ID: " + pacId, HttpStatus.NOT_FOUND
                ));

        EstadoPlanificacion nuevoEstado = request.getNuevoEstado();
        if (nuevoEstado == EstadoPlanificacion.OBSERVADO) {
            String obs = request.getObservaciones();
            if (obs == null || obs.trim().length() < 10) {
                throw new ScuException(
                        "OBSERVATIONS_REQUIRED",
                        "Debe ingresar observaciones justificando el estado " + nuevoEstado + " (mínimo 10 caracteres)",
                        HttpStatus.BAD_REQUEST
                );
            }
        }

        TenantInfo tenant = TenantContext.getTenantInfo();
        Usuario reviewer = (tenant != null && tenant.getUserId() != null)
                ? this.usuarioRepository.findById(tenant.getUserId()).orElse(null)
                : null;

        pac.setEstado(nuevoEstado);
        pac.setObservacionesRevision(request.getObservaciones());
        pac.setRevisadoPor(reviewer);
        pac.setRevisadoEn(OffsetDateTime.now());
        pac.setActualizadoEn(OffsetDateTime.now());

        Pac saved = this.pacRepository.save(pac);

        List<ScuSesionMatriz7Dto> sDtos = saved.getSesiones().stream()
                .map(s -> ScuSesionMatriz7Dto.builder()
                        .id(s.getId())
                        .semana(s.getSemana())
                        .nroSesion(s.getNroSesion())
                        .fechaProgramada(s.getFechaProgramada())
                        .tipoSesion(s.getTipoSesion())
                        .unidadTematica(s.getUnidadTematica())
                        .contenidoEspecifico(s.getContenidoEspecifico())
                        .saberConceptual(s.getSaberConceptual())
                        .saberProcedimental(s.getSaberProcedimental())
                        .saberActitudinal(s.getSaberActitudinal())
                        .criterioDesempeno(s.getCriterioDesempeno())
                        .evidenciaAprendizaje(s.getEvidenciaAprendizaje())
                        .instrumentoEvaluacion(s.getInstrumentoEvaluacion())
                        .hitoEvaluativo(s.getHitoEvaluativo())
                        .build())
                .collect(Collectors.toList());

        return ScuPacResponse.builder()
                .id(saved.getId())
                .asignacionId(saved.getAsignacion().getId())
                .estado(saved.getEstado())
                .seccionesIdentificacion(saved.getSeccionesIdentificacion())
                .estrategiasMetodologicas(saved.getEstrategiasMetodologicas())
                .recursosDidacticos(saved.getRecursosDidacticos())
                .normasCurso(saved.getNormasCurso())
                .observacionesRevision(saved.getObservacionesRevision())
                .revisadoPorId(saved.getRevisadoPor() != null ? saved.getRevisadoPor().getId() : null)
                .revisadoPorNombre(saved.getRevisadoPor() != null ? saved.getRevisadoPor().getNombreCompleto() : null)
                .revisadoEn(saved.getRevisadoEn())
                .matriz7(sDtos)
                .creadoEn(saved.getCreadoEn())
                .actualizadoEn(saved.getActualizadoEn())
                .build();
    }
}
