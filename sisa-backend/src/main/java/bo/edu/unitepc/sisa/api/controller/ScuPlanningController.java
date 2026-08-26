package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPacReviewRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanningSubmitRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.api.response.ScuPlanClaseResponse;
import bo.edu.unitepc.sisa.api.response.ScuProgramaAnaliticoResponse;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.service.command.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for academic planning trilogy (Programa Analitico, PAC Matriz 7, Plan de Clases).
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/planificaciones", "/api/v1/system/planning"})
public class ScuPlanningController {

    private final ScuSavePacCmd savePacCmd;
    private final ScuGetPacCmd getPacCmd;
    private final ScuReviewPacCmd reviewPacCmd;
    private final ScuSubmitPacCmd submitPacCmd;
    private final ScuSaveProgramaAnaliticoCmd saveProgramaCmd;
    private final ScuGetProgramaAnaliticoCmd getProgramaCmd;
    private final ScuSavePlanClaseCmd savePlanClaseCmd;
    private final ScuGetPlanClaseCmd getPlanClaseCmd;

    public ScuPlanningController(
            ScuSavePacCmd savePacCmd,
            ScuGetPacCmd getPacCmd,
            ScuReviewPacCmd reviewPacCmd,
            ScuSubmitPacCmd submitPacCmd,
            ScuSaveProgramaAnaliticoCmd saveProgramaCmd,
            ScuGetProgramaAnaliticoCmd getProgramaCmd,
            ScuSavePlanClaseCmd savePlanClaseCmd,
            ScuGetPlanClaseCmd getPlanClaseCmd) {
        this.savePacCmd = savePacCmd;
        this.getPacCmd = getPacCmd;
        this.reviewPacCmd = reviewPacCmd;
        this.submitPacCmd = submitPacCmd;
        this.saveProgramaCmd = saveProgramaCmd;
        this.getProgramaCmd = getProgramaCmd;
        this.savePlanClaseCmd = savePlanClaseCmd;
        this.getPlanClaseCmd = getPlanClaseCmd;
    }

    @PostMapping("/pac")
    public ResponseEntity<Map<String, Object>> savePac(@Valid @RequestBody ScuPacRequest request) {
        ScuPacResponse response = this.savePacCmd.execute(request);
        return new ResponseEntity<>(
                ResourceBuilder.of(response)
                        .message("PAC guardado exitosamente")
                        .status(HttpStatus.CREATED.value())
                        .build(),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/pac/{id}/submit")
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> submitPacById(@PathVariable Long id) {
        ScuPacResponse response = this.submitPacCmd.executeById(id);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Planificación enviada a revisión exitosamente")
                        .build()
        );
    }

    @PostMapping("/submit")
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> submitPacByAssignment(
            @Valid @RequestBody ScuPlanningSubmitRequest request) {
        ScuPacResponse response = this.submitPacCmd.executeByAsignacionId(request.getAsignacionId());
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Planificación enviada a revisión exitosamente")
                        .build()
        );
    }

    @GetMapping("/pac/by-assignment/{asignacionId}")
    public ResponseEntity<Map<String, Object>> getPacByAssignment(@PathVariable Long asignacionId) {
        ScuPacResponse response = this.getPacCmd.executeByAsignacionId(asignacionId);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("PAC obtenido exitosamente")
                        .build()
        );
    }

    @GetMapping("/pac/{id}")
    public ResponseEntity<Map<String, Object>> getPacById(@PathVariable Long id) {
        ScuPacResponse response = this.getPacCmd.executeById(id);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("PAC obtenido exitosamente")
                        .build()
        );
    }

    @PostMapping("/pac/{id}/review")
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', " +
            "'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL')")
    public ResponseEntity<Map<String, Object>> reviewPac(
            @PathVariable Long id,
            @Valid @RequestBody ScuPacReviewRequest request) {
        ScuPacResponse response = this.reviewPacCmd.execute(id, request);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Revisión de PAC registrada exitosamente")
                        .build()
        );
    }

    @PostMapping("/programa-analitico")
    public ResponseEntity<Map<String, Object>> saveProgramaAnalitico(
            @Valid @RequestBody ScuProgramaAnaliticoRequest request) {
        ScuProgramaAnaliticoResponse response = this.saveProgramaCmd.execute(request);
        return new ResponseEntity<>(
                ResourceBuilder.of(response)
                        .message("Programa analítico guardado exitosamente")
                        .status(HttpStatus.CREATED.value())
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/programa-analitico/by-assignment/{asignacionId}")
    public ResponseEntity<Map<String, Object>> getProgramaByAssignment(@PathVariable Long asignacionId) {
        ScuProgramaAnaliticoResponse response = this.getProgramaCmd.execute(asignacionId);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Programa analítico obtenido exitosamente")
                        .build()
        );
    }

    @PostMapping("/plan-clase")
    public ResponseEntity<Map<String, Object>> savePlanClase(
            @Valid @RequestBody ScuPlanClaseRequest request) {
        ScuPlanClaseResponse response = this.savePlanClaseCmd.execute(request);
        return new ResponseEntity<>(
                ResourceBuilder.of(response)
                        .message("Plan de clase guardado exitosamente")
                        .status(HttpStatus.CREATED.value())
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/plan-clase/by-session/{sesionId}")
    public ResponseEntity<Map<String, Object>> getPlanClaseBySession(@PathVariable Long sesionId) {
        ScuPlanClaseResponse response = this.getPlanClaseCmd.execute(sesionId);
        return ResponseEntity.ok(
                ResourceBuilder.of(response)
                        .message("Plan de clase obtenido exitosamente")
                        .build()
        );
    }
}
