package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.dto.AsistenciaResumenDto;
import bo.edu.unitepc.sisa.api.dto.AsistenciaSesionDto;
import bo.edu.unitepc.sisa.api.request.GuardarAsistenciaRequest;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaSesionRepository;
import bo.edu.unitepc.sisa.service.command.ScuGetAsistenciaResumenCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetAsistenciaSesionCmd;
import bo.edu.unitepc.sisa.service.command.ScuSaveAsistenciaCmd;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for taking, auditing, and managing student attendance sessions and 80% rule compliance.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/asistencias", "/api/v1/system/asistencias"})
@PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")
public class ScuAsistenciaController {

    private final ScuSaveAsistenciaCmd saveAsistenciaCmd;
    private final ScuGetAsistenciaSesionCmd getAsistenciaSesionCmd;
    private final ScuGetAsistenciaResumenCmd getAsistenciaResumenCmd;
    private final AsistenciaSesionRepository sesionRepository;

    public ScuAsistenciaController(
            ScuSaveAsistenciaCmd saveAsistenciaCmd,
            ScuGetAsistenciaSesionCmd getAsistenciaSesionCmd,
            ScuGetAsistenciaResumenCmd getAsistenciaResumenCmd,
            AsistenciaSesionRepository sesionRepository) {
        this.saveAsistenciaCmd = saveAsistenciaCmd;
        this.getAsistenciaSesionCmd = getAsistenciaSesionCmd;
        this.getAsistenciaResumenCmd = getAsistenciaResumenCmd;
        this.sesionRepository = sesionRepository;
    }

    @PostMapping("/sesion")
    public ResponseEntity<Map<String, Object>> saveSesion(
            @Valid @RequestBody GuardarAsistenciaRequest request) {
        AsistenciaSesionDto saved = this.saveAsistenciaCmd.execute(request);
        return ResponseEntity.ok(
                ResourceBuilder.of(saved)
                        .message("Asistencia de la sesión registrada exitosamente")
                        .build()
        );
    }

    @GetMapping("/sesion")
    public ResponseEntity<Map<String, Object>> getSesion(
            @RequestParam String materiaCodigo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(defaultValue = "TEORICA") String tipoClase,
            @RequestParam(defaultValue = "TA-01") String comision) {
        return this.getAsistenciaSesionCmd.execute(materiaCodigo, fecha, tipoClase, comision)
                .map(dto -> ResponseEntity.ok(
                        ResourceBuilder.of(dto)
                                .message("Sesión de asistencia obtenida exitosamente")
                                .build()))
                .orElseGet(() -> ResponseEntity.ok(
                        ResourceBuilder.<AsistenciaSesionDto>of(null)
                                .message("No se encontró registro de asistencia previo para la sesión especificada")
                                .build()
                ));
    }

    @GetMapping("/sesiones/{materiaCodigo}")
    public ResponseEntity<Map<String, Object>> listSesionesByMateria(
            @PathVariable String materiaCodigo,
            @RequestParam(defaultValue = "2-2026") String gestionCodigo) {
        List<AsistenciaSesionDto> list = this.sesionRepository
                .findByMateriaCodigoAndGestionCodigoOrderByFechaDesc(materiaCodigo, gestionCodigo)
                .stream()
                .map(ScuSaveAsistenciaCmd::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Historial de sesiones de asistencia obtenido exitosamente")
                        .build()
        );
    }

    @GetMapping("/resumen/{materiaCodigo}")
    public ResponseEntity<Map<String, Object>> getResumenAsistencia(
            @PathVariable String materiaCodigo,
            @RequestParam(defaultValue = "2-2026") String gestionCodigo) {
        AsistenciaResumenDto resumen = this.getAsistenciaResumenCmd.execute(materiaCodigo, gestionCodigo);
        return ResponseEntity.ok(
                ResourceBuilder.of(resumen)
                        .message("Resumen de asistencia y cumplimiento 80% obtenido exitosamente")
                        .build()
        );
    }
}
