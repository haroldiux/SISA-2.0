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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

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
     * List groups filtered by term, branchOfficeId, careerId, syllabusCourseId, or teacherCi.
     */
    @GetMapping("/groups")
    public ResponseEntity<List<GroupItemDto>> getGroups(
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String branchOfficeId,
            @RequestParam(required = false) String careerId,
            @RequestParam(required = false) String syllabusCourseId,
            @RequestParam(required = false) String teacherCi) {
        try {
            List<GroupItemDto> remote = this.gatewayClient.getGroups(term, branchOfficeId, careerId, syllabusCourseId);
            if (remote != null && !remote.isEmpty()) {
                if (teacherCi != null && !teacherCi.isBlank()) {
                    remote = remote.stream()
                            .filter(g -> teacherCi.equalsIgnoreCase(g.teacherCi()))
                            .toList();
                }
                return ResponseEntity.ok(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway groups unreachable ({}), activating local mirror fallback", ex.getMessage());
        }

        // Local mirror fallback
        var query = (teacherCi != null && !teacherCi.isBlank())
                ? this.seaGrupoRepository.findByDocenteCi(teacherCi)
                : this.seaGrupoRepository.findAll();

        List<GroupItemDto> fallback = query.stream()
                .map(g -> new GroupItemDto(
                        g.getId(),
                        g.getCodigoGrupo(),
                        g.getTipoClase(),
                        g.getDocenteNombre(),
                        g.getDocenteCi(),
                        g.getAula(),
                        g.getHorario(),
                        g.getCampus(),
                        35
                ))
                .toList();
        return ResponseEntity.ok(fallback);
    }

    /**
     * List all distinct teachers (Docentes) available in the system catalog.
     * Prioritizes live UNITEPC Gateway data and updates PostgreSQL local mirror cache.
     */
    @Cacheable(value = "catalogo-docentes", key = "#branchOfficeId != null ? #branchOfficeId : 'default'")
    @GetMapping("/docentes")
    public ResponseEntity<List<DocenteItemDto>> getDocentes(
            @RequestParam(required = false, defaultValue = "ea4fb26e-11a9-452f-9bae-4962de2dd931") String branchOfficeId) {
        List<GroupItemDto> allGruposDtos = null;
        try {
            List<GroupItemDto> remote = this.gatewayClient.getGroups("2-2026", branchOfficeId, null, null);
            if (remote != null && !remote.isEmpty()) {
                allGruposDtos = remote;
                // Sync remote groups to local cache
                updateLocalGroupsCache(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway groups unreachable for docentes list ({}), falling back to local database", ex.getMessage());
        }

        if (allGruposDtos != null && !allGruposDtos.isEmpty()) {
            // Group by teacher CI from remote gateway response
            Map<String, List<GroupItemDto>> porCi = allGruposDtos.stream()
                    .filter(g -> g.teacherCi() != null && !g.teacherCi().isBlank())
                    .collect(java.util.stream.Collectors.groupingBy(GroupItemDto::teacherCi));

            List<DocenteItemDto> remoteDocentes = porCi.entrySet().stream()
                    .map(entry -> {
                        String ci = entry.getKey();
                        var gruposDocente = entry.getValue();
                        var primerGrupo = gruposDocente.get(0);
                        String nombre = primerGrupo.teacherName();
                        String email = deriveTeacherEmail(nombre, ci);

                        List<String> materiasNombres = gruposDocente.stream()
                                .map(g -> (g.courseName() != null ? g.courseName() : (g.name() != null ? g.name() : "Materia Asignada")))
                                .distinct()
                                .toList();

                        return new DocenteItemDto(
                                ci,
                                nombre,
                                email,
                                "CBA",
                                primerGrupo.careerCode() != null ? primerGrupo.careerCode() : "Facultad de Tecnología",
                                materiasNombres,
                                gruposDocente
                        );
                    })
                    .toList();

            return ResponseEntity.ok(remoteDocentes);
        }

        // Local mirror fallback
        var allGrupos = this.seaGrupoRepository.findAll();
        Map<String, List<bo.edu.unitepc.sisa.domain.model.SeaGrupo>> porCi = allGrupos.stream()
                .filter(g -> g.getDocenteCi() != null && !g.getDocenteCi().isBlank())
                .collect(java.util.stream.Collectors.groupingBy(bo.edu.unitepc.sisa.domain.model.SeaGrupo::getDocenteCi));

        List<DocenteItemDto> result = porCi.entrySet().stream()
                .map(entry -> {
                    String ci = entry.getKey();
                    var gruposDocente = entry.getValue();
                    var primerGrupo = gruposDocente.get(0);
                    String nombre = primerGrupo.getDocenteNombre();
                    String email = deriveTeacherEmail(nombre, ci);

                    List<String> materiasNombres = gruposDocente.stream()
                            .map(g -> {
                                if (g.getMateriaId() != null) {
                                    return this.seaMateriaRepository.findById(g.getMateriaId())
                                            .map(m -> m.getCodigo() + " - " + m.getNombre())
                                            .orElse(g.getMateriaId());
                                }
                                return "Materia Asignada";
                            })
                            .distinct()
                            .toList();

                    List<GroupItemDto> groupDtos = gruposDocente.stream()
                            .map(g -> new GroupItemDto(
                                    g.getId(),
                                    g.getCodigoGrupo(),
                                    g.getTipoClase(),
                                    g.getDocenteNombre(),
                                    g.getDocenteCi(),
                                    g.getAula(),
                                    g.getHorario(),
                                    g.getCampus(),
                                    35
                            ))
                            .toList();

                    return new DocenteItemDto(
                            ci,
                            nombre,
                            email,
                            "CBBA",
                            "Facultad de Ingeniería y Tecnología",
                            materiasNombres,
                            groupDtos
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * List courses assigned to a specific teacher by CI.
     */
    @GetMapping("/docentes/{ci}/materias")
    public ResponseEntity<List<CourseDto>> getDocenteMaterias(@PathVariable String ci) {
        var grupos = this.seaGrupoRepository.findByDocenteCi(ci);
        List<String> materiaIds = grupos.stream()
                .map(bo.edu.unitepc.sisa.domain.model.SeaGrupo::getMateriaId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        List<CourseDto> courses = materiaIds.stream()
                .map(this.seaMateriaRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(m -> new CourseDto(
                        m.getId(),
                        m.getCodigo(),
                        m.getNombre(),
                        m.getSemestre() != null ? m.getSemestre().intValue() : 1,
                        m.getSyllabusCourseId(),
                        m.getCarreraId()
                ))
                .toList();

        if (!courses.isEmpty()) {
            return ResponseEntity.ok(courses);
        }

        // Live Gateway resolution fallback
        try {
            List<GroupItemDto> remoteGroups = this.gatewayClient.getGroups("2-2026", null, null, null);
            List<GroupItemDto> teacherGroups = remoteGroups.stream()
                    .filter(g -> ci.equalsIgnoreCase(g.teacherCi()))
                    .toList();

            Set<String> careerCodes = teacherGroups.stream()
                    .map(GroupItemDto::careerCode)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, CourseDto> syllabusMap = new HashMap<>();
            for (String careerCode : careerCodes) {
                try {
                    List<CourseDto> careerCourses = this.gatewayClient.getCourses("CBA", careerCode);
                    for (CourseDto c : careerCourses) {
                        if (c.syllabusCourseId() != null) {
                            syllabusMap.put(c.syllabusCourseId(), c);
                        }
                        if (c.name() != null) {
                            syllabusMap.put(careerCode + "_" + c.name().trim().toUpperCase(), c);
                        }
                    }
                } catch (Exception ignored) {}
            }

            List<CourseDto> resolvedCourses = new ArrayList<>();
            Set<String> seenCourseIds = new HashSet<>();
            for (GroupItemDto g : teacherGroups) {
                CourseDto matched = null;
                if (g.syllabusCourseId() != null && syllabusMap.containsKey(g.syllabusCourseId())) {
                    matched = syllabusMap.get(g.syllabusCourseId());
                } else if (g.courseName() != null && syllabusMap.containsKey(g.careerCode() + "_" + g.courseName().trim().toUpperCase())) {
                    matched = syllabusMap.get(g.careerCode() + "_" + g.courseName().trim().toUpperCase());
                }
                if (matched != null) {
                    String uniqueKey = matched.code() != null ? matched.code() : (matched.name() + "_" + g.careerCode());
                    if (seenCourseIds.add(uniqueKey)) {
                        resolvedCourses.add(matched);
                    }
                }
            }
            return ResponseEntity.ok(resolvedCourses);
        } catch (Exception ex) {
            log.warn("Failed to dynamically resolve teacher courses from Gateway for CI {}: {}", ci, ex.getMessage());
        }

        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * Helper to derive an official institutional email for display.
     */
    private String deriveTeacherEmail(String nombreCompleto, String ci) {
        if (nombreCompleto == null) return "docente@unitepc.edu.bo";
        String clean = nombreCompleto.toLowerCase()
                .replace("ing.", "")
                .replace("lic.", "")
                .replace("dr.", "")
                .replace("dra.", "")
                .replace("msc.", "")
                .trim();
        String[] parts = clean.split("\\s+");
        if (parts.length >= 2) {
            return parts[0] + "." + parts[1] + "@unitepc.edu.bo";
        }
        return "docente." + ci.replaceAll("[^0-9]", "") + "@unitepc.edu.bo";
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
     * List all academic timeframes.
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

    /**
     * Get active academic timeframe.
     */
    @GetMapping("/timeFrames/active")
    public ResponseEntity<TimeFrameDto> getActiveTimeFrame() {
        try {
            TimeFrameDto remote = this.gatewayClient.getActiveTimeFrame();
            if (remote != null) {
                return ResponseEntity.ok(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway timeFrames/active unreachable ({}), returning fallback active timeframe", ex.getMessage());
        }
        return ResponseEntity.ok(new TimeFrameDto("tf-2026-2", "Gestión II-2026", "2026", "II", true));
    }

    /**
     * List academic timeframes by career and branch office.
     */
    @GetMapping("/timeFrameCareers")
    public ResponseEntity<List<TimeFrameDto>> getTimeFrameCareers(
            @RequestParam(required = false, defaultValue = "CBA") String branchOfficeCode,
            @RequestParam(required = false, defaultValue = "CARCCP") String careerCode) {
        try {
            List<TimeFrameDto> remote = this.gatewayClient.getTimeFrameCareers(branchOfficeCode, careerCode);
            return ResponseEntity.ok(remote != null ? remote : Collections.emptyList());
        } catch (Exception ex) {
            log.warn("Gateway timeFrameCareers unreachable ({}), returning default timeframe for career", ex.getMessage());
            return ResponseEntity.ok(List.of(
                    new TimeFrameDto("tf-2026-2", "Gestión II-2026", "2026", "II", true, branchOfficeCode, careerCode)
            ));
        }
    }

    /**
     * Get active academic timeframe by career and branch office.
     */
    @GetMapping("/timeFrameCareers/active")
    public ResponseEntity<TimeFrameDto> getActiveTimeFrameCareer(
            @RequestParam(required = false, defaultValue = "CBA") String branchOfficeCode,
            @RequestParam(required = false, defaultValue = "CARCCP") String careerCode) {
        try {
            TimeFrameDto remote = this.gatewayClient.getActiveTimeFrameCareer(branchOfficeCode, careerCode);
            if (remote != null) {
                return ResponseEntity.ok(remote);
            }
        } catch (Exception ex) {
            log.warn("Gateway timeFrameCareers/active unreachable ({}), returning fallback", ex.getMessage());
        }
        return ResponseEntity.ok(new TimeFrameDto("tf-2026-2", "Gestión II-2026", "2026", "II", true, branchOfficeCode, careerCode));
    }

    /**
     * Get analytical program for a course (currently on hold / en pausa in SEA).
     */
    @GetMapping("/analyticalProgram")
    public ResponseEntity<Map<String, Object>> getAnalyticalProgram(
            @RequestParam String courseCode,
            @RequestParam(required = false, defaultValue = "CBA") String branchOfficeCode,
            @RequestParam(required = false, defaultValue = "CARCCP") String careerCode) {
        var resultOpt = this.gatewayClient.getAnalyticalProgram(courseCode, branchOfficeCode, careerCode);
        if (resultOpt.isPresent()) {
            return ResponseEntity.ok(resultOpt.get());
        }
        return ResponseEntity.ok(Map.of(
                "status", "on-hold",
                "message", "El programa analítico central está temporalmente en pausa en la pasarela SEA.",
                "courseCode", courseCode,
                "branchOfficeCode", branchOfficeCode,
                "careerCode", careerCode
        ));
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

    private void updateLocalGroupsCache(List<GroupItemDto> remoteGroups) {
        if (remoteGroups == null || remoteGroups.isEmpty()) return;
        try {
            for (GroupItemDto dto : remoteGroups) {
                if (dto.id() == null) continue;
                var existing = this.seaGrupoRepository.findById(dto.id());
                if (existing.isEmpty()) {
                    var nuevo = new bo.edu.unitepc.sisa.domain.model.SeaGrupo(
                            dto.id(),
                            dto.name() != null ? dto.name() : "G1",
                            dto.classType() != null ? dto.classType() : "TEORICA",
                            dto.teacherName() != null ? dto.teacherName() : "DOCENTE UNITEPC",
                            dto.teacherCi() != null ? dto.teacherCi() : "0000000",
                            dto.schedule() != null ? dto.schedule() : "Horario regular",
                            dto.classroom() != null ? dto.classroom() : "Aula 101",
                            dto.campus() != null ? dto.campus() : "Campus Central",
                            dto.syllabusCourseId() != null ? dto.syllabusCourseId() : "mat-gen"
                    );
                    this.seaGrupoRepository.save(nuevo);
                }
            }
        } catch (Exception e) {
            log.warn("Could not sync remote groups to local cache: {}", e.getMessage());
        }
    }
}
