package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.enums.HitoEvaluativo;
import bo.edu.unitepc.sisa.domain.enums.InstrumentoEvaluacion;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for saving PAC planning and validating 20-week Matriz 7 structure.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSavePacCmd {

    private final PacRepository pacRepository;
    private final AsignacionDocenteRepository asignacionRepository;

    public ScuSavePacCmd(
            PacRepository pacRepository,
            AsignacionDocenteRepository asignacionRepository) {
        this.pacRepository = pacRepository;
        this.asignacionRepository = asignacionRepository;
    }

    @Transactional
    public ScuPacResponse execute(ScuPacRequest request) {
        AsignacionDocente asignacion = this.asignacionRepository.findById(request.getAsignacionId())
                .orElseThrow(() -> new ScuException("ASIGNACION_NOT_FOUND", "Asignación no encontrada", HttpStatus.NOT_FOUND));

        Pac pac = this.pacRepository.findByAsignacionId(asignacion.getId())
                .orElse(new Pac());

        pac.setAsignacion(asignacion);
        if (pac.getEstado() == null || EstadoPlanificacion.OBSERVADO.equals(pac.getEstado())) {
            pac.setEstado(EstadoPlanificacion.BORRADOR);
        }
        pac.setSeccionesIdentificacion(request.getSeccionesIdentificacion());
        pac.setEstrategiasMetodologicas(request.getEstrategiasMetodologicas());
        pac.setRecursosDidacticos(request.getRecursosDidacticos());
        pac.setNormasCurso(request.getNormasCurso());
        pac.setActualizadoEn(OffsetDateTime.now());

        // Update Sesiones Matriz 7
        pac.getSesiones().clear();
        if (request.getMatriz7() != null) {
            for (ScuSesionMatriz7Dto sDto : request.getMatriz7()) {
                SesionMatriz7 s = new SesionMatriz7();
                s.setSemana(sDto.getSemana() != null ? sDto.getSemana() : 1);
                s.setNroSesion(sDto.getNroSesion() != null ? sDto.getNroSesion() : 1);
                s.setFechaProgramada(sDto.getFechaProgramada() != null ? sDto.getFechaProgramada() : LocalDate.now());
                s.setTipoSesion(sDto.getTipoSesion() != null ? sDto.getTipoSesion() : TipoSesion.TEORICA);
                s.setUnidadTematica(sDto.getUnidadTematica() != null ? sDto.getUnidadTematica() : "");
                s.setContenidoEspecifico(sDto.getContenidoEspecifico() != null ? sDto.getContenidoEspecifico() : "");
                s.setSaberConceptual(sDto.getSaberConceptual() != null ? sDto.getSaberConceptual() : "");
                s.setSaberProcedimental(sDto.getSaberProcedimental() != null ? sDto.getSaberProcedimental() : "");
                s.setSaberActitudinal(sDto.getSaberActitudinal() != null ? sDto.getSaberActitudinal() : "");
                s.setCriterioDesempeno(sDto.getCriterioDesempeno() != null ? sDto.getCriterioDesempeno() : "");
                s.setEvidenciaAprendizaje(sDto.getEvidenciaAprendizaje() != null ? sDto.getEvidenciaAprendizaje() : "");
                s.setInstrumentoEvaluacion(sDto.getInstrumentoEvaluacion() != null ? sDto.getInstrumentoEvaluacion() : InstrumentoEvaluacion.RUBRICA);
                s.setHitoEvaluativo(sDto.getHitoEvaluativo() != null ? sDto.getHitoEvaluativo() : HitoEvaluativo.REGULAR);
                pac.addSesion(s);
            }
        }

        Pac saved = this.pacRepository.save(pac);
        return this._mapToResponse(saved);
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
