package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for retrieving PAC by assignment ID or PAC ID.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetPacCmd {

    private final PacRepository pacRepository;

    public ScuGetPacCmd(PacRepository pacRepository) {
        this.pacRepository = pacRepository;
    }

    @Transactional(readOnly = true)
    public ScuPacResponse executeByAsignacionId(Long asignacionId) {
        Pac p = this.pacRepository.findByAsignacionId(asignacionId)
                .orElseThrow(() -> new ScuException("PAC_NOT_FOUND", "PAC no encontrado para la asignación: " + asignacionId, HttpStatus.NOT_FOUND));

        return this._mapToResponse(p);
    }

    @Transactional(readOnly = true)
    public ScuPacResponse executeById(Long id) {
        Pac p = this.pacRepository.findById(id)
                .orElseThrow(() -> new ScuException("PAC_NOT_FOUND", "PAC no encontrado con ID: " + id, HttpStatus.NOT_FOUND));

        return this._mapToResponse(p);
    }

    private ScuPacResponse _mapToResponse(Pac p) {
        List<ScuSesionMatriz7Dto> sDtos = p.getSesiones().stream()
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
                .id(p.getId())
                .asignacionId(p.getAsignacion().getId())
                .estado(p.getEstado())
                .seccionesIdentificacion(p.getSeccionesIdentificacion())
                .estrategiasMetodologicas(p.getEstrategiasMetodologicas())
                .recursosDidacticos(p.getRecursosDidacticos())
                .normasCurso(p.getNormasCurso())
                .observacionesRevision(p.getObservacionesRevision())
                .revisadoPorId(p.getRevisadoPor() != null ? p.getRevisadoPor().getId() : null)
                .revisadoPorNombre(p.getRevisadoPor() != null ? p.getRevisadoPor().getNombreCompleto() : null)
                .revisadoEn(p.getRevisadoEn())
                .matriz7(sDtos)
                .creadoEn(p.getCreadoEn())
                .actualizadoEn(p.getActualizadoEn())
                .build();
    }
}
