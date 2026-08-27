package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.dto.gateway.*;
import bo.edu.unitepc.sisa.domain.model.SeaCarrera;
import bo.edu.unitepc.sisa.domain.model.SeaMateria;
import bo.edu.unitepc.sisa.domain.model.SeaSede;
import bo.edu.unitepc.sisa.domain.repository.SeaCarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaGrupoRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaMateriaRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaSedeRepository;
import bo.edu.unitepc.sisa.infrastructure.gateway.UnitepcGatewayClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Proxy REST Controller serving UNITEPC Gateway Academic Catalog data to frontend clients.
 * Incorporates Cache-Aside and Anti-Corruption Layer (ACL) pattern with local PostgreSQL fallback.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/catalogo-academico", "/api/v1/system/catalogo-academico"})
public class CatalogoAcademicoController {

    private static final Logger log = LoggerFactory.getLogger(CatalogoAcademicoController.class);

    private final UnitepcGatewayClient gatewayClient;
    private final SeaSedeRepository seaSedeRepository;
    private final SeaCarreraRepository seaCarreraRepository;
    private final SeaMateriaRepository seaMateriaRepository;
    private final SeaGrupoRepository seaGrupoRepository;

    public CatalogoAcademicoController(
            UnitepcGatewayClient gatewayClient,
            SeaSedeRepository seaSedeRepository,
            SeaCarreraRepository seaCarreraRepository,
            SeaMateriaRepository seaMateriaRepository,
            SeaGrupoRepository seaGrupoRepository) {
        this.gatewayClient = gatewayClient;
        this.seaSedeRepository = seaSedeRepository;
        this.seaCarreraRepository = seaCarreraRepository;
        this.seaMateriaRepository = seaMateriaRepository;
        this.seaGrupoRepository = seaGrupoRepository;
    }

    /**
     * Gateway connection health status endpoint.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean online = this.gatewayClient.isOnline();
        return ResponseEntity.ok(Map.of(
                "status", online ? "online" : "offline",
                "timestamp", Instant.now().toString(),
                "gateway", "UNITEPC Central Gateway (gw-dev.unitepc.solutions)"
        ));
    }

    /**
     * List all academic branch offices (Sedes).
     * Proxies to gateway with Cache-Aside local fallback.
     */
    @GetMapping("/branchOffices")
    public ResponseEntity<List<BranchOfficeDto>> getBranchOffices() {
        try {
            List<BranchOfficeDto> remote = this.gatewayClient.getBranchOffices();
            if (remote != null && !remote.isEmpty()) {
                // Async/Background cache update
                updateLocalSedesCache(remote);
                return ResponseEntity.ok(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway branchOffices unreachable ({}), activating local mirror fallback", ex.getMessage());
        }

        // Local mirror fallback
        List<BranchOfficeDto> fallback = this.seaSedeRepository.findAll().stream()
                .map(s -> new BranchOfficeDto(s.getId(), s.getCodigo(), s.getNombre()))
                .toList();
        return ResponseEntity.ok(fallback);
    }

    /**
     * List careers filtered by branch office code.
     */
    @GetMapping("/careers")
    public ResponseEntity<List<CareerDto>> getCareers(
            @RequestParam(required = false) String branchOfficeCode) {
        try {
            List<CareerDto> remote = this.gatewayClient.getCareers(branchOfficeCode);
            if (remote != null && !remote.isEmpty()) {
                updateLocalCareersCache(remote);
                return ResponseEntity.ok(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway careers unreachable ({}), activating local mirror fallback", ex.getMessage());
        }

        // Local mirror fallback
        List<SeaCarrera> list = (branchOfficeCode != null && !branchOfficeCode.isBlank())
                ? this.seaCarreraRepository.findBySedeCodigo(branchOfficeCode)
                : this.seaCarreraRepository.findAll();

        List<CareerDto> fallback = list.stream()
                .map(c -> new CareerDto(c.getId(), c.getCodigo(), c.getNombre(), c.getSedeCodigo()))
                .toList();
        return ResponseEntity.ok(fallback);
    }

    /**
     * List courses filtered by branch office and career code.
     */
    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto>> getCourses(
            @RequestParam(required = false) String branchOfficeCode,
            @RequestParam(required = false) String careerCode) {
        try {
            List<CourseDto> remote = this.gatewayClient.getCourses(branchOfficeCode, careerCode);
            if (remote != null && !remote.isEmpty()) {
                updateLocalCoursesCache(remote);
                return ResponseEntity.ok(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway courses unreachable ({}), activating local mirror fallback", ex.getMessage());
        }

        // Local mirror fallback
        List<SeaMateria> list;
        if (careerCode != null && !careerCode.isBlank()) {
            Optional<SeaCarrera> carreraOpt = this.seaCarreraRepository.findByCodigo(careerCode);
            if (carreraOpt.isPresent()) {
                list = this.seaMateriaRepository.findByCarreraId(carreraOpt.get().getId());
            } else {
                list = this.seaMateriaRepository.findAll();
            }
        } else {
            list = this.seaMateriaRepository.findAll();
        }

        List<CourseDto> fallback = list.stream()
                .map(m -> new CourseDto(
                        m.getId(),
                        m.getCodigo(),
                        m.getNombre(),
                        m.getSemestre() != null ? m.getSemestre().intValue() : 1,
                        m.getSyllabusCourseId(),
                        careerCode
                ))
                .toList();
        return ResponseEntity.ok(fallback);
    }

    /**
     * List enrolled students by group ID.
     */
    @GetMapping("/students/byGroup")
    public ResponseEntity<List<StudentItemDto>> getStudentsByGroup(
            @RequestParam String groupId) {
        try {
            List<StudentItemDto> remote = this.gatewayClient.getStudentsByGroup(groupId);
            return ResponseEntity.ok(remote != null ? remote : Collections.emptyList());
        } catch (Exception ex) {
            log.warn("Gateway students/byGroup unreachable ({}), returning empty fallback", ex.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * List campuses filtered by branch office ID.
     */
    @GetMapping("/campuses")
    public ResponseEntity<List<CampusDto>> getCampuses(
            @RequestParam(required = false) String branchOfficeId) {
        try {
            List<CampusDto> remote = this.gatewayClient.getCampuses(branchOfficeId);
            return ResponseEntity.ok(remote != null ? remote : Collections.emptyList());
        } catch (Exception ex) {
            log.warn("Gateway campuses unreachable ({}), returning empty fallback", ex.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * List academic timeframes.
     */
    @GetMapping("/timeFrames")
    public ResponseEntity<List<TimeFrameDto>> getTimeFrames() {
        try {
            List<TimeFrameDto> remote = this.gatewayClient.getTimeFrames();
            return ResponseEntity.ok(remote != null ? remote : Collections.emptyList());
        } catch (Exception ex) {
            log.warn("Gateway timeFrames unreachable ({}), returning default active timeframe", ex.getMessage());
            return ResponseEntity.ok(List.of(
                    new TimeFrameDto("tf-2026-2", "Gestión II-2026", "2026", "II", true)
            ));
        }
    }

    // --- Private Cache-Aside synchronizers ---

    private void updateLocalSedesCache(List<BranchOfficeDto> dtos) {
        try {
            for (BranchOfficeDto dto : dtos) {
                if (dto.id() != null && dto.code() != null) {
                    this.seaSedeRepository.save(new SeaSede(dto.id(), dto.code(), dto.name()));
                }
            }
        } catch (Exception e) {
            log.debug("Could not persist sedes cache: {}", e.getMessage());
        }
    }

    private void updateLocalCareersCache(List<CareerDto> dtos) {
        try {
            for (CareerDto dto : dtos) {
                if (dto.id() != null && dto.code() != null) {
                    this.seaCarreraRepository.save(new SeaCarrera(dto.id(), dto.code(), dto.name(), dto.branchOfficeCode()));
                }
            }
        } catch (Exception e) {
            log.debug("Could not persist careers cache: {}", e.getMessage());
        }
    }

    private void updateLocalCoursesCache(List<CourseDto> dtos) {
        try {
            for (CourseDto dto : dtos) {
                if (dto.id() != null && dto.code() != null) {
                    this.seaMateriaRepository.save(new SeaMateria(
                            dto.id(),
                            dto.code(),
                            dto.name(),
                            dto.semester() != null ? dto.semester().shortValue() : (short) 1,
                            dto.syllabusCourseId(),
                            dto.careerCode()
                    ));
                }
            }
        } catch (Exception e) {
            log.debug("Could not persist courses cache: {}", e.getMessage());
        }
    }
}
