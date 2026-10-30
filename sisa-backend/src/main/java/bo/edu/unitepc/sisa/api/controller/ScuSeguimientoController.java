package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.dto.ResumenMateriaSeguimientoResponse;
import bo.edu.unitepc.sisa.api.dto.SeguimientoClaseDto;
import bo.edu.unitepc.sisa.api.dto.SemaforoCarreraResponse;
import bo.edu.unitepc.sisa.api.request.GuardarSeguimientoClaseRequest;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.service.command.ScuGetMateriaAuditoriaCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetSeguimientoSesionCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetSemaforoCarreraCmd;
import bo.edu.unitepc.sisa.service.command.ScuSaveSeguimientoClaseCmd;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Classroom Didactic Tracking and Career Curricular Traffic Light.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/seguimiento", "/api/v1/system/seguimiento"})
public class ScuSeguimientoController {

    private final ScuSaveSeguimientoClaseCmd saveSeguimientoCmd;
    private final ScuGetSeguimientoSesionCmd getSeguimientoSesionCmd;
    private final ScuGetMateriaAuditoriaCmd getMateriaAuditoriaCmd;
    private final ScuGetSemaforoCarreraCmd getSemaforoCarreraCmd;

    public ScuSeguimientoController(
            ScuSaveSeguimientoClaseCmd saveSeguimientoCmd,
            ScuGetSeguimientoSesionCmd getSeguimientoSesionCmd,
            ScuGetMateriaAuditoriaCmd getMateriaAuditoriaCmd,
            ScuGetSemaforoCarreraCmd getSemaforoCarreraCmd) {
        this.saveSeguimientoCmd = saveSeguimientoCmd;
        this.getSeguimientoSesionCmd = getSeguimientoSesionCmd;
        this.getMateriaAuditoriaCmd = getMateriaAuditoriaCmd;
        this.getSemaforoCarreraCmd = getSemaforoCarreraCmd;
    }

    @PostMapping("/sesion")
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> saveSeguimiento(
            @Valid @RequestBody GuardarSeguimientoClaseRequest request) {
        SeguimientoClaseDto saved = this.saveSeguimientoCmd.execute(request);
        return ResponseEntity.ok(
                ResourceBuilder.of(saved)
                        .message("Seguimiento didáctico de sesión registrado exitosamente")
                        .build()
        );
    }

    @GetMapping("/sesion/{sesionId}")
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSeguimientoBySesion(
            @PathVariable Long sesionId) {
        return this.getSeguimientoSesionCmd.execute(sesionId)
                .map(dto -> ResponseEntity.ok(
                        ResourceBuilder.of(dto)
                                .message("Seguimiento de sesión obtenido exitosamente")
                                .build()
                ))
                .orElseGet(() -> ResponseEntity.ok(
                        ResourceBuilder.<SeguimientoClaseDto>of(null)
                                .message("No se encontró seguimiento didáctico registrado para la sesión indicada")
                                .build()
                ));
    }

    @GetMapping("/materia/{materiaCodigo}")
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMateriaAuditoria(
            @PathVariable String materiaCodigo,
            @RequestParam(defaultValue = "2-2026") String gestionCodigo) {
        ResumenMateriaSeguimientoResponse resumen =
                this.getMateriaAuditoriaCmd.execute(materiaCodigo, gestionCodigo);
        return ResponseEntity.ok(
                ResourceBuilder.of(resumen)
                        .message("Auditoría longitudinal de materia obtenida exitosamente")
                        .build()
        );
    }

    @GetMapping("/semaforo-carrera/{carreraCodigo}")
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', " +
            "'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSemaforoCarrera(
            @PathVariable String carreraCodigo,
            @RequestParam(defaultValue = "2-2026") String gestionCodigo,
            @RequestParam(defaultValue = "13") Integer semanaCorte) {
        SemaforoCarreraResponse response =
                this.getSemaforoCarreraCmd.execute(carreraCodigo, gestionCodigo, semanaCorte);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Semáforo curricular de carrera calculado exitosamente")
                        .build()
        );
    }
}
