package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuAsignacionDocenteRequest;
import bo.edu.unitepc.sisa.api.response.ScuAsignacionDocenteResponse;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.model.Gestion;
import bo.edu.unitepc.sisa.domain.model.Sede;
import bo.edu.unitepc.sisa.domain.repository.CarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.GestionRepository;
import bo.edu.unitepc.sisa.domain.repository.SedeRepository;
import bo.edu.unitepc.sisa.service.command.ScuCreateAsignacionDocenteCmd;
import bo.edu.unitepc.sisa.service.command.ScuListAsignacionesDocentesCmd;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for academic management, career structures, gestiones, and teacher assignments.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/academic", "/api/v1/system/academic"})
public class ScuAcademicController {

    private final ScuListAsignacionesDocentesCmd listAsignacionesCmd;
    private final ScuCreateAsignacionDocenteCmd createAsignacionCmd;
    private final CarreraRepository carreraRepository;
    private final GestionRepository gestionRepository;
    private final SedeRepository sedeRepository;

    public ScuAcademicController(
            ScuListAsignacionesDocentesCmd listAsignacionesCmd,
            ScuCreateAsignacionDocenteCmd createAsignacionCmd,
            CarreraRepository carreraRepository,
            GestionRepository gestionRepository,
            SedeRepository sedeRepository) {
        this.listAsignacionesCmd = listAsignacionesCmd;
        this.createAsignacionCmd = createAsignacionCmd;
        this.carreraRepository = carreraRepository;
        this.gestionRepository = gestionRepository;
        this.sedeRepository = sedeRepository;
    }

    @GetMapping("/assignments")
    public ResponseEntity<Map<String, Object>> listAssignments(
            @RequestParam(required = false) Long gestionId,
            @RequestParam(required = false) Long carreraId,
            @RequestParam(required = false) Long docenteId) {
        List<ScuAsignacionDocenteResponse> list = this.listAsignacionesCmd.execute(gestionId, carreraId, docenteId);
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de asignaciones docentes")
                        .build()
        );
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', " +
            "'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL')")
    public ResponseEntity<Map<String, Object>> createAssignment(
            @Valid @RequestBody ScuAsignacionDocenteRequest request) {
        ScuAsignacionDocenteResponse response = this.createAsignacionCmd.execute(request);
        return new ResponseEntity<>(
                ResourceBuilder.of(response)
                        .message("Asignación docente creada exitosamente")
                        .status(HttpStatus.CREATED.value())
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/carreras")
    public ResponseEntity<Map<String, Object>> listCarreras() {
        List<Carrera> list = this.carreraRepository.findAll();
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de carreras")
                        .build()
        );
    }

    @GetMapping("/gestiones")
    public ResponseEntity<Map<String, Object>> listGestiones() {
        List<Gestion> list = this.gestionRepository.findAll();
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de gestiones académicas")
                        .build()
        );
    }

    @GetMapping("/sedes")
    public ResponseEntity<Map<String, Object>> listSedes() {
        List<Sede> list = this.sedeRepository.findAll();
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de sedes")
                        .build()
        );
    }
}
