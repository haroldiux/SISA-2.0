package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuAuditoriaSignRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuditoriaInSituResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoAuditoria;
import bo.edu.unitepc.sisa.domain.model.AuditoriaInSitu;
import bo.edu.unitepc.sisa.domain.repository.AuditoriaInSituRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Command for teacher digital signing and acknowledgment of audit results.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSignAuditoriaInSituCmd {

    private final AuditoriaInSituRepository auditoriaRepository;

    public ScuSignAuditoriaInSituCmd(AuditoriaInSituRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @Transactional
    public ScuAuditoriaInSituResponse execute(Long auditoriaId, ScuAuditoriaSignRequest request) {
        AuditoriaInSitu audit = this.auditoriaRepository.findById(auditoriaId)
                .orElseThrow(() -> new ScuException("AUDITORIA_NOT_FOUND", "Auditoría no encontrada: " + auditoriaId, HttpStatus.NOT_FOUND));

        audit.setConformidadDocente(request.getConformidadDocente());
        audit.setObservacionesDocente(request.getObservacionesDocente());
        audit.setFechaFirmaDocente(OffsetDateTime.now());
        audit.setEstado(EstadoAuditoria.CERRADA_CON_FIRMA);

        AuditoriaInSitu saved = this.auditoriaRepository.save(audit);

        double porcentaje = (saved.getEstudiantesInscritos() != null && saved.getEstudiantesInscritos() > 0)
                ? ((double) saved.getEstudiantesPresentes() / saved.getEstudiantesInscritos()) * 100.0
                : 0.0;

        return ScuAuditoriaInSituResponse.builder()
                .id(saved.getId())
                .asignacionId(saved.getAsignacion().getId())
                .asignaturaNombre(saved.getAsignacion().getAsignatura().getNombre())
                .docenteNombre(saved.getAsignacion().getDocente().getNombreCompleto())
                .carreraNombre(saved.getAsignacion().getCarrera().getNombre())
                .sedeNombre(saved.getAsignacion().getCampus().getSede() != null ? saved.getAsignacion().getCampus().getSede().getNombre() : "")
                .aula(saved.getAsignacion().getAula())
                .auditorId(saved.getAuditor().getId())
                .auditorNombre(saved.getAuditor().getNombreCompleto())
                .sesionProgramadaId(saved.getSesionProgramada() != null ? saved.getSesionProgramada().getId() : null)
                .semanaProgramada(saved.getSesionProgramada() != null ? saved.getSesionProgramada().getSemana() : null)
                .nroSesionProgramada(saved.getSesionProgramada() != null ? saved.getSesionProgramada().getNroSesion() : null)
                .temaProgramado(saved.getSesionProgramada() != null ? saved.getSesionProgramada().getUnidadTematica() : null)
                .fechaHoraAuditoria(saved.getFechaHoraAuditoria())
                .puntualidadDocente(saved.getPuntualidadDocente())
                .concordanciaTema(saved.getConcordanciaTema())
                .momentoObservado(saved.getMomentoObservado())
                .recursosVerificados(saved.getRecursosVerificados())
                .estudiantesPresentes(saved.getEstudiantesPresentes())
                .estudiantesInscritos(saved.getEstudiantesInscritos())
                .porcentajeAsistencia(Math.round(porcentaje * 100.0) / 100.0)
                .observacionesAuditor(saved.getObservacionesAuditor())
                .estado(saved.getEstado())
                .conformidadDocente(saved.getConformidadDocente())
                .observacionesDocente(saved.getObservacionesDocente())
                .fechaFirmaDocente(saved.getFechaFirmaDocente())
                .hashFirmaDigital(saved.getHashFirmaDigital())
                .build();
    }
}
