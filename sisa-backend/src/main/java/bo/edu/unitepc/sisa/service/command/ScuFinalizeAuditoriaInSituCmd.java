package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuAuditoriaInSituRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuditoriaInSituResponse;
import bo.edu.unitepc.sisa.domain.enums.*;
import bo.edu.unitepc.sisa.domain.model.*;
import bo.edu.unitepc.sisa.domain.repository.*;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;

/**
 * Command for finalizing in situ audit with SHA-256 digital signature and 3-strike disciplinary escalation.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuFinalizeAuditoriaInSituCmd {

    private final AuditoriaInSituRepository auditoriaRepository;
    private final AsignacionDocenteRepository asignacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final SesionMatriz7Repository sesionRepository;
    private final ReincidenciaDocenteRepository reincidenciaRepository;

    public ScuFinalizeAuditoriaInSituCmd(
            AuditoriaInSituRepository auditoriaRepository,
            AsignacionDocenteRepository asignacionRepository,
            UsuarioRepository usuarioRepository,
            SesionMatriz7Repository sesionRepository,
            ReincidenciaDocenteRepository reincidenciaRepository) {
        this.auditoriaRepository = auditoriaRepository;
        this.asignacionRepository = asignacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.sesionRepository = sesionRepository;
        this.reincidenciaRepository = reincidenciaRepository;
    }

    @Transactional
    public ScuAuditoriaInSituResponse execute(ScuAuditoriaInSituRequest request) {
        AsignacionDocente asignacion = this.asignacionRepository.findById(request.getAsignacionId())
                .orElseThrow(() -> new ScuException("ASIGNACION_NOT_FOUND", "Asignación no encontrada", HttpStatus.NOT_FOUND));

        TenantInfo tenant = TenantContext.getTenantInfo();
        Long auditorId = (tenant != null && tenant.getUserId() != null) ? tenant.getUserId() : 1L;
        Usuario auditor = this.usuarioRepository.findById(auditorId)
                .orElseThrow(() -> new ScuException("AUDITOR_NOT_FOUND", "Auditor no encontrado", HttpStatus.NOT_FOUND));

        SesionMatriz7 sesion = null;
        if (request.getSesionProgramadaId() != null) {
            sesion = this.sesionRepository.findById(request.getSesionProgramadaId()).orElse(null);
        }

        OffsetDateTime timestamp = OffsetDateTime.now();
        String rawData = String.format("%d|%d|%s|%s|%s|%s",
                asignacion.getId(), auditor.getId(), timestamp.toString(),
                request.getPuntualidadDocente().name(),
                request.getConcordanciaTema().name(),
                request.getMomentoObservado().name());

        String hash = this._generateSha256(rawData);

        // Determine conforming vs non-conforming status
        boolean isInconforme = PuntualidadDocente.AUSENTE.equals(request.getPuntualidadDocente()) ||
                PuntualidadDocente.ATRASO_GRAVE.equals(request.getPuntualidadDocente()) ||
                ConcordanciaTema.TEMA_NO_PLANIFICADO.equals(request.getConcordanciaTema());

        EstadoAuditoria estado = isInconforme
                ? EstadoAuditoria.OBSERVADA_NO_CONFORME
                : EstadoAuditoria.FINALIZADA_CONFORME;

        AuditoriaInSitu audit = new AuditoriaInSitu();
        audit.setAsignacion(asignacion);
        audit.setAuditor(auditor);
        audit.setSesionProgramada(sesion);
        audit.setFechaHoraAuditoria(timestamp);
        audit.setPuntualidadDocente(request.getPuntualidadDocente());
        audit.setConcordanciaTema(request.getConcordanciaTema());
        audit.setMomentoObservado(request.getMomentoObservado());
        audit.setRecursosVerificados(request.getRecursosVerificados());
        audit.setEstudiantesPresentes(request.getEstudiantesPresentes());
        audit.setEstudiantesInscritos(request.getEstudiantesInscritos());
        audit.setObservacionesAuditor(request.getObservacionesAuditor());
        audit.setEstado(estado);
        audit.setHashFirmaDigital(hash);

        AuditoriaInSitu saved = this.auditoriaRepository.save(audit);

        // 3-Strike Disciplinary Recurrence Escalation
        if (isInconforme) {
            this._handleDisciplinaryEscalation(asignacion.getDocente(), asignacion.getGestion(), saved, request);
        }

        return this._mapToResponse(saved);
    }

    private void _handleDisciplinaryEscalation(
            Usuario docente, Gestion gestion, AuditoriaInSitu audit, ScuAuditoriaInSituRequest req) {
        int previousStrikes = this.reincidenciaRepository.countInfraccionesByDocenteAndGestion(docente.getId(), gestion.getId());
        int currentStrike = previousStrikes + 1;

        NivelReincidencia nivel;
        EstadoReincidencia estado;

        if (currentStrike == 1) {
            nivel = NivelReincidencia.NIVEL_1;
            estado = EstadoReincidencia.NOTIFICADO;
        } else if (currentStrike == 2) {
            nivel = NivelReincidencia.NIVEL_2;
            estado = EstadoReincidencia.PLAN_ACCION_REQUERIDO;
        } else {
            nivel = NivelReincidencia.NIVEL_3;
            estado = EstadoReincidencia.ESCALADO_VICERRECTORADO;
        }

        String motivo = String.format("Infracción en auditoría: %s, %s",
                req.getPuntualidadDocente().name(), req.getConcordanciaTema().name());

        ReincidenciaDocente reincidencia = new ReincidenciaDocente();
        reincidencia.setDocente(docente);
        reincidencia.setGestion(gestion);
        reincidencia.setAuditoria(audit);
        reincidencia.setNroInfraccion(currentStrike);
        reincidencia.setNivel(nivel);
        reincidencia.setMotivo(motivo);
        reincidencia.setEstado(estado);
        reincidencia.setCreadoEn(OffsetDateTime.now());

        this.reincidenciaRepository.save(reincidencia);
    }

    private String _generateSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "HASH_ERROR_" + System.currentTimeMillis();
        }
    }

    private ScuAuditoriaInSituResponse _mapToResponse(AuditoriaInSitu a) {
        double porcentaje = (a.getEstudiantesInscritos() != null && a.getEstudiantesInscritos() > 0)
                ? ((double) a.getEstudiantesPresentes() / a.getEstudiantesInscritos()) * 100.0
                : 0.0;

        return ScuAuditoriaInSituResponse.builder()
                .id(a.getId())
                .asignacionId(a.getAsignacion().getId())
                .asignaturaNombre(a.getAsignacion().getAsignatura().getNombre())
                .docenteNombre(a.getAsignacion().getDocente().getNombreCompleto())
                .carreraNombre(a.getAsignacion().getCarrera().getNombre())
                .sedeNombre(a.getAsignacion().getCampus().getSede() != null ? a.getAsignacion().getCampus().getSede().getNombre() : "")
                .aula(a.getAsignacion().getAula())
                .auditorId(a.getAuditor().getId())
                .auditorNombre(a.getAuditor().getNombreCompleto())
                .sesionProgramadaId(a.getSesionProgramada() != null ? a.getSesionProgramada().getId() : null)
                .semanaProgramada(a.getSesionProgramada() != null ? a.getSesionProgramada().getSemana() : null)
                .nroSesionProgramada(a.getSesionProgramada() != null ? a.getSesionProgramada().getNroSesion() : null)
                .temaProgramado(a.getSesionProgramada() != null ? a.getSesionProgramada().getUnidadTematica() : null)
                .fechaHoraAuditoria(a.getFechaHoraAuditoria())
                .puntualidadDocente(a.getPuntualidadDocente())
                .concordanciaTema(a.getConcordanciaTema())
                .momentoObservado(a.getMomentoObservado())
                .recursosVerificados(a.getRecursosVerificados())
                .estudiantesPresentes(a.getEstudiantesPresentes())
                .estudiantesInscritos(a.getEstudiantesInscritos())
                .porcentajeAsistencia(Math.round(porcentaje * 100.0) / 100.0)
                .observacionesAuditor(a.getObservacionesAuditor())
                .estado(a.getEstado())
                .conformidadDocente(a.getConformidadDocente())
                .observacionesDocente(a.getObservacionesDocente())
                .fechaFirmaDocente(a.getFechaFirmaDocente())
                .hashFirmaDigital(a.getHashFirmaDigital())
                .build();
    }
}
