package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for formal submission of the PAC and academic planning trilogy to Career Direction.
 * Transitions planning state from BORRADOR/OBSERVADO to ENVIADO_REVISION.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSubmitPacCmd {

    private final PacRepository pacRepository;
    private final AsignacionDocenteRepository asignacionRepository;

    public ScuSubmitPacCmd(
            PacRepository pacRepository,
            AsignacionDocenteRepository asignacionRepository) {
        this.pacRepository = pacRepository;
        this.asignacionRepository = asignacionRepository;
    }

    @Transactional
    public ScuPacResponse executeById(Long pacId) {
        Pac pac = this.pacRepository.findById(pacId)
                .orElseThrow(() -> new ScuException(
                        "PAC_NOT_FOUND", "PAC no encontrado con ID: " + pacId, HttpStatus.NOT_FOUND
                ));

        return this._transitionToEnviado(pac);
    }

    @Transactional
    public ScuPacResponse executeByAsignacionId(Long asignacionId) {
        Pac pac = this.pacRepository.findByAsignacionId(asignacionId)
                .orElseThrow(() -> new ScuException(
                        "PAC_NOT_FOUND", "PAC no encontrado para la asignación: " + asignacionId, HttpStatus.NOT_FOUND
                ));

        return this._transitionToEnviado(pac);
    }

    private ScuPacResponse _transitionToEnviado(Pac pac) {
        if (pac.getEstado() == EstadoPlanificacion.APROBADO) {
            throw new ScuException(
                    "INVALID_STATUS_TRANSITION",
                    "No se puede enviar a revisión una planificación que ya ha sido APROBADA.",
                    HttpStatus.BAD_REQUEST
            );
        }

        pac.setEstado(EstadoPlanificacion.ENVIADO_REVISION);
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
