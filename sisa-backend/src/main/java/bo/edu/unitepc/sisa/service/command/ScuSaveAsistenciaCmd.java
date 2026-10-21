package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.AsistenciaEstudianteDto;
import bo.edu.unitepc.sisa.api.dto.AsistenciaSesionDto;
import bo.edu.unitepc.sisa.api.request.AsistenciaEstudianteRequest;
import bo.edu.unitepc.sisa.api.request.GuardarAsistenciaRequest;
import bo.edu.unitepc.sisa.domain.enums.EstadoAsistencia;
import bo.edu.unitepc.sisa.domain.model.AsistenciaEstudiante;
import bo.edu.unitepc.sisa.domain.model.AsistenciaSesion;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaSesionRepository;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Command for saving or updating class attendance sessions with idempotent upsert semantics.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSaveAsistenciaCmd {

    private final AsistenciaSesionRepository sesionRepository;

    public ScuSaveAsistenciaCmd(AsistenciaSesionRepository sesionRepository) {
        this.sesionRepository = sesionRepository;
    }

    @Transactional
    public AsistenciaSesionDto execute(GuardarAsistenciaRequest request) {
        return execute(request, null);
    }

    @Transactional
    public AsistenciaSesionDto execute(GuardarAsistenciaRequest request, String overrideRegistradoPor) {
        String registradoPor = (overrideRegistradoPor != null && !overrideRegistradoPor.isBlank())
                ? overrideRegistradoPor.trim()
                : resolveCurrentUser();

        String materiaCodigo = request.materiaCodigo().trim();
        String tipoClase = request.tipoClase().trim().toUpperCase();
        String comision = request.comision().trim().toUpperCase();
        String gestionCodigo = (request.gestionCodigo() != null && !request.gestionCodigo().isBlank())
                ? request.gestionCodigo().trim()
                : "2-2026";

        Optional<AsistenciaSesion> existingOpt = this.sesionRepository
                .findByMateriaCodigoAndFechaAndTipoClaseAndComisionWithEstudiantes(
                        materiaCodigo, request.fecha(), tipoClase, comision);

        AsistenciaSesion sesion;
        if (existingOpt.isPresent()) {
            sesion = existingOpt.get();
            sesion.setMateriaNombre(request.materiaNombre().trim());
            sesion.setGestionCodigo(gestionCodigo);
            sesion.setTema(request.tema() != null ? request.tema().trim() : null);
            sesion.setObservaciones(request.observaciones() != null ? request.observaciones().trim() : null);
            sesion.setActualizadoEn(OffsetDateTime.now());

            Map<String, AsistenciaEstudiante> currentEstudiantesMap = sesion.getEstudiantes().stream()
                    .collect(Collectors.toMap(AsistenciaEstudiante::getEstudianteCodigo, Function.identity(), (e1, e2) -> e1));

            for (AsistenciaEstudianteRequest reqEst : request.estudiantes()) {
                EstadoAsistencia estadoEnum = parseEstado(reqEst.estado());
                AsistenciaEstudiante existingEst = currentEstudiantesMap.get(reqEst.estudianteCodigo().trim());
                if (existingEst != null) {
                    existingEst.setEstudianteNombre(reqEst.estudianteNombre().trim());
                    if (reqEst.carreraCodigo() != null && !reqEst.carreraCodigo().isBlank()) {
                        existingEst.setCarreraCodigo(reqEst.carreraCodigo().trim());
                    }
                    if (reqEst.carreraNombre() != null && !reqEst.carreraNombre().isBlank()) {
                        existingEst.setCarreraNombre(reqEst.carreraNombre().trim());
                    }
                    existingEst.setEstado(estadoEnum);
                    existingEst.setObservacion(reqEst.observacion() != null ? reqEst.observacion().trim() : null);
                    existingEst.setActualizadoEn(OffsetDateTime.now());
                } else {
                    AsistenciaEstudiante newEst = new AsistenciaEstudiante();
                    newEst.setEstudianteCodigo(reqEst.estudianteCodigo().trim());
                    newEst.setEstudianteNombre(reqEst.estudianteNombre().trim());
                    newEst.setCarreraCodigo(reqEst.carreraCodigo() != null ? reqEst.carreraCodigo().trim() : "CARSIS");
                    newEst.setCarreraNombre(reqEst.carreraNombre() != null ? reqEst.carreraNombre().trim() : "Ingeniería de Sistemas");
                    newEst.setEstado(estadoEnum);
                    newEst.setObservacion(reqEst.observacion() != null ? reqEst.observacion().trim() : null);
                    sesion.addEstudiante(newEst);
                }
            }
        } else {
            sesion = new AsistenciaSesion();
            sesion.setMateriaCodigo(materiaCodigo);
            sesion.setMateriaNombre(request.materiaNombre().trim());
            sesion.setGestionCodigo(gestionCodigo);
            sesion.setFecha(request.fecha());
            sesion.setTipoClase(tipoClase);
            sesion.setComision(comision);
            sesion.setTema(request.tema() != null ? request.tema().trim() : null);
            sesion.setObservaciones(request.observaciones() != null ? request.observaciones().trim() : null);
            sesion.setRegistradoPor(registradoPor);
            sesion.setCreadoEn(OffsetDateTime.now());
            sesion.setActualizadoEn(OffsetDateTime.now());

            for (AsistenciaEstudianteRequest reqEst : request.estudiantes()) {
                EstadoAsistencia estadoEnum = parseEstado(reqEst.estado());
                AsistenciaEstudiante est = new AsistenciaEstudiante();
                est.setEstudianteCodigo(reqEst.estudianteCodigo().trim());
                est.setEstudianteNombre(reqEst.estudianteNombre().trim());
                est.setCarreraCodigo(reqEst.carreraCodigo() != null ? reqEst.carreraCodigo().trim() : "CARSIS");
                est.setCarreraNombre(reqEst.carreraNombre() != null ? reqEst.carreraNombre().trim() : "Ingeniería de Sistemas");
                est.setEstado(estadoEnum);
                est.setObservacion(reqEst.observacion() != null ? reqEst.observacion().trim() : null);
                sesion.addEstudiante(est);
            }
        }

        AsistenciaSesion saved = this.sesionRepository.save(sesion);
        return mapToDto(saved);
    }

    private EstadoAsistencia parseEstado(String estadoRaw) {
        if (estadoRaw == null || estadoRaw.isBlank()) {
            return EstadoAsistencia.PRESENTE;
        }
        String clean = estadoRaw.trim().toUpperCase();
        try {
            return EstadoAsistencia.valueOf(clean);
        } catch (IllegalArgumentException ignored) {
            for (EstadoAsistencia val : EstadoAsistencia.values()) {
                if (val.getCodigo().equalsIgnoreCase(clean)) {
                    return val;
                }
            }
            return EstadoAsistencia.PRESENTE;
        }
    }

    private String resolveCurrentUser() {
        TenantInfo info = TenantContext.getTenantInfo();
        if (info != null && info.getUsername() != null && !info.getUsername().isBlank()) {
            return info.getUsername();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().isBlank()) {
            return auth.getName();
        }
        return "docente.1001";
    }

    public static AsistenciaSesionDto mapToDto(AsistenciaSesion sesion) {
        List<AsistenciaEstudianteDto> estudiantesDto = sesion.getEstudiantes() != null
                ? sesion.getEstudiantes().stream()
                .map(e -> new AsistenciaEstudianteDto(
                        e.getId(),
                        e.getEstudianteCodigo(),
                        e.getEstudianteNombre(),
                        e.getCarreraCodigo(),
                        e.getCarreraNombre(),
                        e.getEstado().name(),
                        e.getObservacion()
                ))
                .sorted(Comparator.comparing(AsistenciaEstudianteDto::estudianteNombre, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList())
                : Collections.emptyList();

        return new AsistenciaSesionDto(
                sesion.getId(),
                sesion.getMateriaCodigo(),
                sesion.getMateriaNombre(),
                sesion.getGestionCodigo(),
                sesion.getFecha(),
                sesion.getTipoClase(),
                sesion.getComision(),
                sesion.getTema(),
                sesion.getObservaciones(),
                sesion.getRegistradoPor(),
                sesion.getCreadoEn(),
                sesion.getActualizadoEn(),
                estudiantesDto
        );
    }
}
