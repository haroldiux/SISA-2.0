package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuAuditoriaInSituRequest;
import bo.edu.unitepc.sisa.api.request.ScuAuditoriaSignRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuditoriaInSituResponse;
import bo.edu.unitepc.sisa.api.response.ScuReincidenciaResponse;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.service.command.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for in situ audits and 3-strike disciplinary recurrence monitoring.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/auditorias", "/api/v1/system/audit"})
public class ScuAuditController {

    private final ScuInitiateAuditoriaInSituCmd initiateAuditCmd;
    private final ScuFinalizeAuditoriaInSituCmd finalizeAuditCmd;
    private final ScuSignAuditoriaInSituCmd signAuditCmd;
    private final ScuListReincidenciasCmd listReincidenciasCmd;

    public ScuAuditController(
            ScuInitiateAuditoriaInSituCmd initiateAuditCmd,
            ScuFinalizeAuditoriaInSituCmd finalizeAuditCmd,
            ScuSignAuditoriaInSituCmd signAuditCmd,
            ScuListReincidenciasCmd listReincidenciasCmd) {
        this.initiateAuditCmd = initiateAuditCmd;
        this.finalizeAuditCmd = finalizeAuditCmd;
        this.signAuditCmd = signAuditCmd;
        this.listReincidenciasCmd = listReincidenciasCmd;
    }

    @GetMapping("/in-situ/match")
    @PreAuthorize("hasAnyRole('ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL')")
    public ResponseEntity<Map<String, Object>> matchClass(
            @RequestParam Long campusId,
            @RequestParam String aula,
            @RequestParam String dia,
            @RequestParam(required = false) String hora) {
        LocalTime time = (hora != null) ? LocalTime.parse(hora) : LocalTime.now();
        Map<String, Object> result = this.initiateAuditCmd.execute(campusId, aula, dia, time);
        return ResponseEntity.ok(
                ResourceBuilder.of(result)
                        .message("Resultado de radar de clase activa")
                        .build()
        );
    }

    @PostMapping("/in-situ/finalize")
    @PreAuthorize("hasAnyRole('ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL')")
    public ResponseEntity<Map<String, Object>> finalizeAudit(
            @Valid @RequestBody ScuAuditoriaInSituRequest request) {
        ScuAuditoriaInSituResponse response = this.finalizeAuditCmd.execute(request);
        return new ResponseEntity<>(
                ResourceBuilder.of(response)
                        .message("Auditoría in situ finalizada y firmada digitalmente")
                        .status(HttpStatus.CREATED.value())
                        .build(),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/in-situ/{id}/sign")
    public ResponseEntity<Map<String, Object>> signAudit(
            @PathVariable Long id,
            @Valid @RequestBody ScuAuditoriaSignRequest request) {
        ScuAuditoriaInSituResponse response = this.signAuditCmd.execute(id, request);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Firma y conformidad docente registradas")
                        .build()
        );
    }

    @GetMapping("/recurrence")
    @PreAuthorize("hasAnyRole('ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL')")
    public ResponseEntity<Map<String, Object>> listRecurrences(
            @RequestParam(required = false) Long gestionId,
            @RequestParam(required = false) Long docenteId) {
        List<ScuReincidenciaResponse> list = this.listReincidenciasCmd.execute(gestionId, docenteId);
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de reincidencias disciplinarias")
                        .build()
        );
    }
}
