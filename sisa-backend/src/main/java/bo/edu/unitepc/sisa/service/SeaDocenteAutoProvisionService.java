package bo.edu.unitepc.sisa.service;

import bo.edu.unitepc.sisa.api.dto.gateway.DocenteItemDto;
import bo.edu.unitepc.sisa.api.dto.gateway.GroupItemDto;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.enums.TipoPeriodo;
import bo.edu.unitepc.sisa.domain.model.Asignatura;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.model.SeaGrupo;
import bo.edu.unitepc.sisa.domain.model.SeaMateria;
import bo.edu.unitepc.sisa.domain.model.SeaSyncAuditLog;
import bo.edu.unitepc.sisa.domain.model.Sede;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.model.UsuarioAsignacionAcademica;
import bo.edu.unitepc.sisa.domain.repository.AsignaturaRepository;
import bo.edu.unitepc.sisa.domain.repository.CarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaCarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaGrupoRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaMateriaRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaSyncAuditLogRepository;
import bo.edu.unitepc.sisa.domain.repository.SedeRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioAsignacionAcademicaRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.infrastructure.gateway.UnitepcGatewayClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Service responsible for automatically provisioning teacher accounts (ROLE_DOCENTE)
 * and their complete academic structures (Sedes, Carreras, Asignaturas, and Asignaciones)
 * in SISA from the UNITEPC SEA Academic Gateway catalog.
 * <p>
 * Business rules:
 * - username = CI
 * - ci = CI
 * - initial password = BCrypt(CI)
 * - must_change_password = true
 * - rol = ROLE_DOCENTE
 * - activo = true
 * - auto-creates missing Sedes, Carreras, Asignaturas and UsuarioAsignacionAcademica links
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class SeaDocenteAutoProvisionService {

    private static final Logger log = LoggerFactory.getLogger(SeaDocenteAutoProvisionService.class);

    private final UsuarioRepository usuarioRepository;
    private final SeaGrupoRepository seaGrupoRepository;
    private final SeaMateriaRepository seaMateriaRepository;
    private final SeaSyncAuditLogRepository seaSyncAuditLogRepository;
    private final UnitepcGatewayClient gatewayClient;
    private final PasswordEncoder passwordEncoder;
    private final SedeRepository sedeRepository;
    private final CarreraRepository carreraRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final UsuarioAsignacionAcademicaRepository usuarioAsignacionAcademicaRepository;
    private final SeaCarreraRepository seaCarreraRepository;

    public SeaDocenteAutoProvisionService(
            UsuarioRepository usuarioRepository,
            SeaGrupoRepository seaGrupoRepository,
            SeaMateriaRepository seaMateriaRepository,
            SeaSyncAuditLogRepository seaSyncAuditLogRepository,
            UnitepcGatewayClient gatewayClient,
            PasswordEncoder passwordEncoder,
            SedeRepository sedeRepository,
            CarreraRepository carreraRepository,
            AsignaturaRepository asignaturaRepository,
            UsuarioAsignacionAcademicaRepository usuarioAsignacionAcademicaRepository,
            SeaCarreraRepository seaCarreraRepository) {
        this.usuarioRepository = usuarioRepository;
        this.seaGrupoRepository = seaGrupoRepository;
        this.seaMateriaRepository = seaMateriaRepository;
        this.seaSyncAuditLogRepository = seaSyncAuditLogRepository;
        this.gatewayClient = gatewayClient;
        this.passwordEncoder = passwordEncoder;
        this.sedeRepository = sedeRepository;
        this.carreraRepository = carreraRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.usuarioAsignacionAcademicaRepository = usuarioAsignacionAcademicaRepository;
        this.seaCarreraRepository = seaCarreraRepository;
    }

    /**
     * Runs automatically on application startup to ensure all SEA catalog teachers
     * exist as system users with full academic structures and assignments.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("SEA Auto-Provisioning: Initializing automatic teacher provisioning and assignments from SEA catalog...");
        try {
            int created = this.syncAllSeaDocentes();
            log.info("SEA Auto-Provisioning completed on startup. {} new teachers provisioned.", created);
        } catch (Exception e) {
            log.warn("SEA Auto-Provisioning startup check completed with warning: {}", e.getMessage());
        }
    }

    /**
     * Synchronizes all teachers from SEA Gateway (or local sea_grupos mirror fallback)
     * and provisions any missing ones as SISA users, creating all academic structures.
     *
     * @return Number of newly provisioned users
     */
    @Transactional
    public int syncAllSeaDocentes() {
        List<GroupItemDto> remoteGroups = null;
        try {
            remoteGroups = this.gatewayClient.getGroups("2-2026", null, null, null);
        } catch (Exception e) {
            log.warn("Unable to fetch groups from gateway for auto-provisioning: {}", e.getMessage());
        }

        if (remoteGroups != null && !remoteGroups.isEmpty()) {
            return provisionFromGroups(remoteGroups);
        }

        // Fallback: sync from local sea_grupos table
        var localGrupos = this.seaGrupoRepository.findAll();
        if (localGrupos.isEmpty()) {
            return 0;
        }

        int count = 0;
        Map<String, List<SeaGrupo>> localByCi = new LinkedHashMap<>();
        for (var grupo : localGrupos) {
            String rawCi = grupo.getDocenteCi();
            if (!StringUtils.hasText(rawCi)) continue;
            localByCi.computeIfAbsent(rawCi.trim(), k -> new ArrayList<>()).add(grupo);
        }

        for (var entry : localByCi.entrySet()) {
            String ci = entry.getKey();
            List<SeaGrupo> tGrupos = entry.getValue();
            String name = tGrupos.stream().map(SeaGrupo::getDocenteNombre).filter(StringUtils::hasText).findFirst().orElse(null);
            if (provisionSingleDocente(ci, name)) {
                count++;
            }
            var userOpt = this.usuarioRepository.findByCi(ci).or(() -> this.usuarioRepository.findByUsername(ci));
            if (userOpt.isPresent()) {
                syncTeacherAcademicAssignmentsFromLocal(userOpt.get(), tGrupos);
            }
        }

        return count;
    }

    /**
     * Provisions teachers from a list of DocenteItemDto objects.
     */
    @Transactional
    public int provisionDocentesFromList(List<DocenteItemDto> docentes) {
        if (docentes == null || docentes.isEmpty()) return 0;
        int count = 0;
        for (DocenteItemDto d : docentes) {
            if (!StringUtils.hasText(d.ci())) continue;
            String ci = d.ci().trim();
            if (provisionSingleDocente(ci, d.nombreCompleto())) {
                count++;
            }
        }
        if (count > 0) {
            log.info("Provisioned {} new teachers from catalog list", count);
        }
        return count;
    }

    private int provisionFromGroups(List<GroupItemDto> groups) {
        int count = 0;
        Map<String, List<GroupItemDto>> groupsByCi = new LinkedHashMap<>();

        for (GroupItemDto g : groups) {
            String rawCi = g.teacherCi();
            if (!StringUtils.hasText(rawCi)) continue;
            String ci = rawCi.trim();
            groupsByCi.computeIfAbsent(ci, k -> new ArrayList<>()).add(g);
        }

        for (Map.Entry<String, List<GroupItemDto>> entry : groupsByCi.entrySet()) {
            String ci = entry.getKey();
            List<GroupItemDto> teacherGroups = entry.getValue();
            String teacherName = teacherGroups.stream()
                    .map(GroupItemDto::teacherName)
                    .filter(StringUtils::hasText)
                    .findFirst()
                    .orElse(null);

            if (provisionSingleDocente(ci, teacherName)) {
                count++;
            }

            // Sync full academic assignments (Sede, Carrera, Asignatura, and UsuarioAsignacionAcademica)
            var userOpt = this.usuarioRepository.findByCi(ci).or(() -> this.usuarioRepository.findByUsername(ci));
            if (userOpt.isPresent()) {
                syncTeacherAcademicAssignments(userOpt.get(), teacherGroups);
            }
        }

        return count;
    }

    private boolean provisionSingleDocente(String ci, String nombreCompleto) {
        // Check if user already exists by username or CI
        var userOpt = this.usuarioRepository.findByUsername(ci);
        if (userOpt.isEmpty()) {
            userOpt = this.usuarioRepository.findByCi(ci);
        }

        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            boolean changed = false;
            if (StringUtils.hasText(nombreCompleto) && ("DOCENTE UNITEPC".equalsIgnoreCase(user.getNombreCompleto()) || !StringUtils.hasText(user.getNombres()))) {
                parseAndSetNames(user, nombreCompleto);
                changed = true;
            }
            if (user.getActivo() == null || !user.getActivo()) {
                user.setActivo(true);
                changed = true;
            }
            if (changed) {
                this.usuarioRepository.save(user);
                log.debug("Updated existing SEA Docente user: CI={}, Name={}", ci, user.getNombreCompleto());
            }
            return false;
        }

        Usuario user = new Usuario();
        user.setUsername(ci);
        user.setCi(ci);
        user.setRol(RolUsuario.ROLE_DOCENTE);
        user.setActivo(true);
        user.setMustChangePassword(true);
        user.setPasswordHash(this.passwordEncoder.encode(ci));
        user.setCreadoEn(OffsetDateTime.now());

        // Parse names
        parseAndSetNames(user, nombreCompleto);

        // Derive unique email
        String email = deriveTeacherEmail(nombreCompleto, ci);
        if (this.usuarioRepository.findByEmail(email).isPresent()) {
            email = ci.toLowerCase().replaceAll("[^a-z0-9]", "") + "@unitepc.edu.bo";
            if (this.usuarioRepository.findByEmail(email).isPresent()) {
                email = ci.toLowerCase().replaceAll("[^a-z0-9]", "") + "_" + System.currentTimeMillis() + "@unitepc.edu.bo";
            }
        }
        user.setEmail(email);

        this.usuarioRepository.save(user);
        log.debug("Auto-provisioned SEA Docente user: CI={}, Name={}", ci, user.getNombreCompleto());
        return true;
    }

    /**
     * Synchronizes and links full academic structures for a teacher:
     * Sede, Carrera, Asignatura, and UsuarioAsignacionAcademica.
     */
    public int syncTeacherAcademicAssignments(Usuario user, List<GroupItemDto> groups) {
        if (user == null || groups == null || groups.isEmpty()) return 0;

        List<UsuarioAsignacionAcademica> existing = this.usuarioAsignacionAcademicaRepository.findByUsuarioId(user.getId());
        Set<Long> assignedSubjectIds = new HashSet<>();
        for (UsuarioAsignacionAcademica a : existing) {
            if (a.getAsignatura() != null && a.getAsignatura().getId() != null) {
                assignedSubjectIds.add(a.getAsignatura().getId());
            }
        }

        int createdAssignments = 0;
        Sede userPrimarySede = user.getSede();

        for (GroupItemDto g : groups) {
            String courseName = g.courseName();
            if (!StringUtils.hasText(courseName)) {
                if (this.seaMateriaRepository != null && StringUtils.hasText(g.syllabusCourseId())) {
                    var mOpt = this.seaMateriaRepository.findById(g.syllabusCourseId());
                    if (mOpt.isPresent()) {
                        courseName = mOpt.get().getNombre();
                    }
                }
            }
            if (!StringUtils.hasText(courseName)) {
                courseName = "Materia " + (g.name() != null ? g.name() : "General");
            }

            Sede sede = resolveOrCreateSede(g.campus());
            if (userPrimarySede == null && sede != null) {
                userPrimarySede = sede;
                user.setSede(sede);
                this.usuarioRepository.save(user);
            }

            Carrera carrera = resolveOrCreateCarrera(g.careerCode(), courseName);
            Asignatura asignatura = resolveOrCreateAsignatura(carrera, courseName, g.syllabusCourseId());

            if (!assignedSubjectIds.contains(asignatura.getId())) {
                UsuarioAsignacionAcademica nueva = UsuarioAsignacionAcademica.builder()
                        .usuario(user)
                        .sede(sede)
                        .carrera(carrera)
                        .asignatura(asignatura)
                        .creadoEn(OffsetDateTime.now())
                        .build();
                this.usuarioAsignacionAcademicaRepository.save(nueva);
                assignedSubjectIds.add(asignatura.getId());
                createdAssignments++;
                log.debug("Created academic assignment for teacher CI={}: Sede={}, Carrera={}, Asignatura={}",
                        user.getCi(), sede.getNombre(), carrera.getNombre(), asignatura.getNombre());
            }
        }

        return createdAssignments;
    }

    /**
     * Synchronizes and links academic structures from local mirror groups.
     */
    public int syncTeacherAcademicAssignmentsFromLocal(Usuario user, List<SeaGrupo> groups) {
        if (user == null || groups == null || groups.isEmpty()) return 0;

        List<UsuarioAsignacionAcademica> existing = this.usuarioAsignacionAcademicaRepository.findByUsuarioId(user.getId());
        Set<Long> assignedSubjectIds = new HashSet<>();
        for (UsuarioAsignacionAcademica a : existing) {
            if (a.getAsignatura() != null && a.getAsignatura().getId() != null) {
                assignedSubjectIds.add(a.getAsignatura().getId());
            }
        }

        int createdAssignments = 0;
        Sede userPrimarySede = user.getSede();

        for (SeaGrupo g : groups) {
            String courseName = null;
            String syllabusCourseId = g.getMateriaId();
            if (this.seaMateriaRepository != null && StringUtils.hasText(syllabusCourseId)) {
                var mOpt = this.seaMateriaRepository.findById(syllabusCourseId);
                if (mOpt.isPresent()) {
                    courseName = mOpt.get().getNombre();
                }
            }
            if (!StringUtils.hasText(courseName)) {
                courseName = "Materia " + (StringUtils.hasText(syllabusCourseId) ? syllabusCourseId : g.getCodigoGrupo());
            }

            Sede sede = resolveOrCreateSede(g.getCampus());
            if (userPrimarySede == null && sede != null) {
                userPrimarySede = sede;
                user.setSede(sede);
                this.usuarioRepository.save(user);
            }

            Carrera carrera = resolveOrCreateCarrera("CARMED", courseName);
            Asignatura asignatura = resolveOrCreateAsignatura(carrera, courseName, syllabusCourseId);

            if (!assignedSubjectIds.contains(asignatura.getId())) {
                UsuarioAsignacionAcademica nueva = UsuarioAsignacionAcademica.builder()
                        .usuario(user)
                        .sede(sede)
                        .carrera(carrera)
                        .asignatura(asignatura)
                        .creadoEn(OffsetDateTime.now())
                        .build();
                this.usuarioAsignacionAcademicaRepository.save(nueva);
                assignedSubjectIds.add(asignatura.getId());
                createdAssignments++;
            }
        }

        return createdAssignments;
    }

    /**
     * Resolves an existing Sede by campus code or creates it if not found.
     */
    public Sede resolveOrCreateSede(String campus) {
        if (!StringUtils.hasText(campus)) {
            return this.sedeRepository.findByCodigo("CBB")
                    .or(() -> this.sedeRepository.findByCodigo("CBA"))
                    .orElseGet(() -> this.sedeRepository.findAll().stream().findFirst().orElse(null));
        }

        String clean = campus.trim().toUpperCase();
        String targetCode;
        if (clean.contains("CBA") || clean.contains("CBBA") || clean.contains("COCHABAMBA") || clean.contains("CENTRAL") || clean.contains("COLONIAL")) {
            targetCode = "CBB";
        } else if (clean.contains("LPZ") || clean.contains("PAZ")) {
            targetCode = "LPZ";
        } else if (clean.contains("EAL") || clean.contains("ALTO")) {
            targetCode = "EAL";
        } else if (clean.contains("CBJ") || clean.contains("CIJ") || clean.contains("COBIJA") || clean.contains("PTO")) {
            targetCode = "CBJ";
        } else {
            targetCode = clean.length() > 10 ? clean.substring(0, 10) : clean;
        }

        Optional<Sede> opt = this.sedeRepository.findByCodigo(targetCode);
        if (opt.isPresent()) return opt.get();
        if ("CBB".equals(targetCode)) {
            opt = this.sedeRepository.findByCodigo("CBA");
            if (opt.isPresent()) return opt.get();
        }

        Sede s = new Sede(targetCode, "Sede " + campus, "Bolivia");
        return this.sedeRepository.save(s);
    }

    /**
     * Resolves an existing Carrera by code or creates it with correct academic faculty.
     */
    public Carrera resolveOrCreateCarrera(String careerCode, String courseName) {
        if (!StringUtils.hasText(careerCode)) {
            return this.carreraRepository.findByCodigo("MED")
                    .orElseGet(() -> this.carreraRepository.findAll().stream().findFirst().orElse(null));
        }

        String cleanCode = careerCode.trim().toUpperCase();
        if (cleanCode.length() > 20) {
            cleanCode = cleanCode.substring(0, 20);
        }

        Optional<Carrera> opt = this.carreraRepository.findByCodigo(cleanCode);
        if (opt.isPresent()) return opt.get();

        if (cleanCode.startsWith("CAR")) {
            String shortCode = cleanCode.substring(3);
            opt = this.carreraRepository.findByCodigo(shortCode);
            if (opt.isPresent()) return opt.get();
        }

        String careerName = null;
        if (this.seaCarreraRepository != null) {
            var scOpt = this.seaCarreraRepository.findFirstByCodigo(cleanCode);
            if (scOpt.isPresent() && StringUtils.hasText(scOpt.get().getNombre())) {
                careerName = scOpt.get().getNombre();
            }
        }
        if (!StringUtils.hasText(careerName)) {
            careerName = deriveCareerName(cleanCode, courseName);
        }

        String facultad = deriveFacultad(careerName);
        Carrera nueva = new Carrera(cleanCode, careerName, facultad);
        return this.carreraRepository.save(nueva);
    }

    /**
     * Resolves an existing Asignatura within the Carrera or creates it.
     */
    public Asignatura resolveOrCreateAsignatura(Carrera carrera, String courseName, String syllabusCourseId) {
        if (!StringUtils.hasText(courseName)) {
            courseName = "Asignatura Académica";
        }
        String cleanName = courseName.trim();
        if (cleanName.length() > 150) {
            cleanName = cleanName.substring(0, 150);
        }

        // 1. Check by name within this Carrera
        Optional<Asignatura> existingByName = this.asignaturaRepository.findFirstByCarreraIdAndNombreIgnoreCase(carrera.getId(), cleanName);
        if (existingByName.isPresent()) {
            return existingByName.get();
        }

        // 2. Derive subject code (guaranteed unique and length <= 20)
        String candidateCode = null;
        if (this.seaMateriaRepository != null && StringUtils.hasText(syllabusCourseId)) {
            var smOpt = this.seaMateriaRepository.findById(syllabusCourseId);
            if (smOpt.isPresent() && StringUtils.hasText(smOpt.get().getCodigo())) {
                candidateCode = smOpt.get().getCodigo().trim();
            }
        }

        if (!StringUtils.hasText(candidateCode)) {
            if (StringUtils.hasText(syllabusCourseId) && syllabusCourseId.length() <= 20 && !syllabusCourseId.contains("-")) {
                candidateCode = syllabusCourseId.toUpperCase();
            } else {
                String prefix = carrera.getCodigo().length() > 6 ? carrera.getCodigo().substring(0, 6) : carrera.getCodigo();
                String hashSuffix;
                if (StringUtils.hasText(syllabusCourseId)) {
                    String raw = syllabusCourseId.replace("-", "").toUpperCase();
                    hashSuffix = raw.length() > 6 ? raw.substring(0, 6) : raw;
                } else {
                    hashSuffix = Integer.toHexString(Math.abs(cleanName.hashCode())).toUpperCase();
                }
                candidateCode = prefix + "-" + hashSuffix;
            }
        }

        if (candidateCode.length() > 20) {
            candidateCode = candidateCode.substring(0, 20);
        }

        var existingByCode = this.asignaturaRepository.findByCodigo(candidateCode);
        if (existingByCode.isPresent()) {
            if (existingByCode.get().getNombre().equalsIgnoreCase(cleanName)) {
                return existingByCode.get();
            }
            String base = candidateCode.length() > 15 ? candidateCode.substring(0, 15) : candidateCode;
            candidateCode = base + "-" + (System.currentTimeMillis() % 1000);
            if (candidateCode.length() > 20) {
                candidateCode = candidateCode.substring(0, 20);
            }
        }

        Asignatura asig = new Asignatura();
        asig.setCarrera(carrera);
        asig.setCodigo(candidateCode);
        asig.setNombre(cleanName);
        asig.setSemestre(1);
        asig.setTipoPeriodo(TipoPeriodo.SEMESTRAL);
        asig.setCreditos(4);
        asig.setHorasTeoricas(4);
        asig.setHorasPracticas(2);
        asig.setActivo(true);

        return this.asignaturaRepository.save(asig);
    }

    private String deriveCareerName(String code, String courseName) {
        if ("CARMED".equalsIgnoreCase(code) || "MED".equalsIgnoreCase(code)) return "Licenciatura en Medicina";
        if ("CARVET".equalsIgnoreCase(code) || "VET".equalsIgnoreCase(code)) return "Medicina Veterinaria y Zootecnia";
        if ("CARSIS".equalsIgnoreCase(code) || "SIS".equalsIgnoreCase(code)) return "Ingeniería de Sistemas";
        if ("CARDER".equalsIgnoreCase(code) || "DER".equalsIgnoreCase(code)) return "Licenciatura en Derecho";
        if ("CARODO".equalsIgnoreCase(code) || "ODO".equalsIgnoreCase(code)) return "Odontología";
        if ("CARFAR".equalsIgnoreCase(code) || "FAR".equalsIgnoreCase(code)) return "Bioquímica y Farmacia";
        if ("CARCCP".equalsIgnoreCase(code) || "CARCPU".equalsIgnoreCase(code)) return "Licenciatura en Contaduría Pública";
        if ("CARADM".equalsIgnoreCase(code)) return "Licenciatura en Administración de Empresas";
        return "Carrera " + code;
    }

    private String deriveFacultad(String careerName) {
        if (careerName == null) return "Facultad de Ciencias de la Salud";
        String upper = careerName.toUpperCase();
        if (upper.contains("MEDICIN") || upper.contains("VETERINARI") || upper.contains("ENFERMER") || upper.contains("ODONTOLOG") || upper.contains("BIOQUIM") || upper.contains("FARMAC") || upper.contains("SALUD")) {
            return "Facultad de Ciencias de la Salud";
        }
        if (upper.contains("SISTEM") || upper.contains("INGENIER") || upper.contains("ELECTRONIC") || upper.contains("SONIDO") || upper.contains("BIOMEDIC") || upper.contains("INDUSTRIAL")) {
            return "Facultad de Ingeniería";
        }
        if (upper.contains("DERECHO") || upper.contains("JURIDIC") || upper.contains("SOCIAL") || upper.contains("COMUNICACION") || upper.contains("ARTE") || upper.contains("CINEMAT")) {
            return "Facultad de Ciencias Sociales";
        }
        return "Facultad de Ciencias Económicas y Administrativas";
    }

    private void parseAndSetNames(Usuario user, String nombreCompleto) {
        if (!StringUtils.hasText(nombreCompleto)) {
            user.setNombres("DOCENTE");
            user.setApellidos("UNITEPC");
            return;
        }
        String clean = nombreCompleto.trim();
        String[] parts = clean.split("\\s+");
        if (parts.length == 1) {
            user.setNombres(parts[0]);
            user.setApellidos(parts[0]);
        } else if (parts.length == 2) {
            user.setNombres(parts[0]);
            user.setApellidos(parts[1]);
        } else if (parts.length == 3) {
            user.setNombres(parts[0]);
            user.setApellidos(parts[1] + " " + parts[2]);
        } else {
            user.setNombres(parts[0] + " " + parts[1]);
            user.setApellidos(String.join(" ", Arrays.copyOfRange(parts, 2, parts.length)));
        }
    }

    private String deriveTeacherEmail(String nombreCompleto, String ci) {
        if (nombreCompleto == null) return ci + "@unitepc.edu.bo";
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
     * Analiza el catálogo docente de la gestión especificada en SEA contra los usuarios de SISA.
     * Retorna métricas de paridad y el listado consolidado de docentes con su estado de acceso.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> analyzeSeaDocentes(String term) {
        String effectiveTerm = StringUtils.hasText(term) ? term.trim() : "2-2026";

        List<GroupItemDto> remoteGroups = null;
        try {
            remoteGroups = this.gatewayClient.getGroups(effectiveTerm, null, null, null);
        } catch (Exception e) {
            log.warn("No se pudo obtener grupos del Gateway para term {}: {}", effectiveTerm, e.getMessage());
        }

        Map<String, SeaDocenteItem> seaTeachersMap = new LinkedHashMap<>();

        if (remoteGroups != null && !remoteGroups.isEmpty()) {
            for (GroupItemDto g : remoteGroups) {
                if (!StringUtils.hasText(g.teacherCi())) continue;
                String ci = g.teacherCi().trim();
                SeaDocenteItem item = seaTeachersMap.computeIfAbsent(ci, k -> new SeaDocenteItem(ci, g.teacherName()));
                item.gruposCount++;
                if (StringUtils.hasText(g.teacherName()) && (item.nombre == null || "DOCENTE UNITEPC".equalsIgnoreCase(item.nombre))) {
                    item.nombre = g.teacherName().trim();
                }
            }
        } else {
            var localGrupos = this.seaGrupoRepository.findAll();
            for (SeaGrupo g : localGrupos) {
                if (!StringUtils.hasText(g.getDocenteCi())) continue;
                String ci = g.getDocenteCi().trim();
                SeaDocenteItem item = seaTeachersMap.computeIfAbsent(ci, k -> new SeaDocenteItem(ci, g.getDocenteNombre()));
                item.gruposCount++;
                if (StringUtils.hasText(g.getDocenteNombre()) && (item.nombre == null || "DOCENTE UNITEPC".equalsIgnoreCase(item.nombre))) {
                    item.nombre = g.getDocenteNombre().trim();
                }
            }
        }

        List<Usuario> allUsers = this.usuarioRepository.findAll();
        Map<String, Usuario> usersByCi = new HashMap<>();
        Map<String, Usuario> usersByUsername = new HashMap<>();

        for (Usuario u : allUsers) {
            if (StringUtils.hasText(u.getCi())) {
                usersByCi.put(u.getCi().trim().toLowerCase(), u);
            }
            if (StringUtils.hasText(u.getUsername())) {
                usersByUsername.put(u.getUsername().trim().toLowerCase(), u);
            }
        }

        int conAcceso = 0;
        int nuevos = 0;
        int sinAcceso = 0;
        List<Map<String, Object>> teacherList = new ArrayList<>();
        Set<String> matchedSisaUserIds = new HashSet<>();

        for (SeaDocenteItem seaTeacher : seaTeachersMap.values()) {
            String ciLower = seaTeacher.ci.toLowerCase();
            Usuario matchedUser = usersByCi.get(ciLower);
            if (matchedUser == null) {
                matchedUser = usersByUsername.get(ciLower);
            }

            String status;
            Long userId = null;
            Boolean activo = null;
            Boolean mustChangePassword = null;
            String rol = null;

            if (matchedUser == null) {
                status = "NUEVO";
                nuevos++;
            } else {
                userId = matchedUser.getId();
                activo = matchedUser.getActivo();
                mustChangePassword = matchedUser.getMustChangePassword();
                rol = matchedUser.getRol() != null ? matchedUser.getRol().name() : null;
                matchedSisaUserIds.add(String.valueOf(matchedUser.getId()));

                if (Boolean.TRUE.equals(matchedUser.getActivo()) && matchedUser.getRol() == RolUsuario.ROLE_DOCENTE) {
                    status = "CON_ACCESO";
                    conAcceso++;
                } else {
                    status = "SIN_ACCESO";
                    sinAcceso++;
                }
            }

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("ci", seaTeacher.ci);
            dto.put("nombre", seaTeacher.nombre != null ? seaTeacher.nombre : "DOCENTE UNITEPC");
            dto.put("gruposCount", seaTeacher.gruposCount);
            dto.put("status", status);
            dto.put("userId", userId);
            dto.put("activo", activo);
            dto.put("mustChangePassword", mustChangePassword);
            dto.put("rol", rol);
            teacherList.add(dto);
        }

        int yaNoEstan = 0;
        for (Usuario u : allUsers) {
            if (u.getRol() == RolUsuario.ROLE_DOCENTE && !matchedSisaUserIds.contains(String.valueOf(u.getId()))) {
                String uCi = u.getCi() != null ? u.getCi().trim().toLowerCase() : "";
                String uUser = u.getUsername() != null ? u.getUsername().trim().toLowerCase() : "";
                boolean inSea = (!uCi.isEmpty() && seaTeachersMap.containsKey(uCi))
                             || (!uUser.isEmpty() && seaTeachersMap.containsKey(uUser));
                if (!inSea) {
                    yaNoEstan++;
                    Map<String, Object> dto = new LinkedHashMap<>();
                    dto.put("ci", u.getCi() != null ? u.getCi() : u.getUsername());
                    dto.put("nombre", u.getNombreCompleto());
                    dto.put("gruposCount", 0);
                    dto.put("status", "YA_NO_ESTA");
                    dto.put("userId", u.getId());
                    dto.put("activo", u.getActivo());
                    dto.put("mustChangePassword", u.getMustChangePassword());
                    dto.put("rol", u.getRol().name());
                    teacherList.add(dto);
                }
            }
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("term", effectiveTerm);
        resp.put("totalSeaDocentes", seaTeachersMap.size());
        resp.put("conAcceso", conAcceso);
        resp.put("nuevos", nuevos);
        resp.put("sinAcceso", sinAcceso);
        resp.put("yaNoEstan", yaNoEstan);
        resp.put("docentes", teacherList);
        return resp;
    }

    private static class SeaDocenteItem {
        final String ci;
        String nombre;
        int gruposCount = 0;

        SeaDocenteItem(String ci, String nombre) {
            this.ci = ci;
            this.nombre = nombre;
        }
    }

    /**
     * Sincroniza un docente individual desde el Gateway SEA o repositorio espejo local.
     * Actualiza o crea el usuario en 'usuarios', genera todas sus estructuras y registra auditoría.
     */
    @Transactional
    public Map<String, Object> syncSingleDocente(String ci, String adminUser) {
        Map<String, Object> syncResult = syncSingleDocenteInternal(ci);
        int groupsCount = (int) syncResult.getOrDefault("gruposCount", 0);
        String teacherName = (String) syncResult.get("nombre");

        SeaSyncAuditLog audit = SeaSyncAuditLog.builder()
                .tipoSync("INDIVIDUAL")
                .ejecutadoPor(StringUtils.hasText(adminUser) ? adminUser : "ADMIN")
                .ciObjetivo(ci != null ? ci.trim() : "N/A")
                .docentesCount(1)
                .gruposCount(groupsCount)
                .estado("EXITOSO")
                .detalle("Sincronización individual exitosa de docente CI: " + ci + ". Nombre: " + (teacherName != null ? teacherName : "N/A") + ". Grupos asociados: " + groupsCount)
                .creadoEn(OffsetDateTime.now())
                .build();
        this.seaSyncAuditLogRepository.save(audit);

        return syncResult;
    }

    /**
     * Sincroniza en lote una lista de docentes por su CI desde el SEA.
     */
    @Transactional
    public Map<String, Object> syncBatchDocentes(List<String> cis, String adminUser) {
        if (cis == null || cis.isEmpty()) {
            return Map.of(
                    "totalRequested", 0,
                    "syncedCount", 0,
                    "status", "SUCCESS",
                    "message", "No se proporcionaron CIs para sincronizar."
            );
        }

        List<String> distinctCis = cis.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .distinct()
                .toList();

        int syncedCount = 0;
        int totalGroups = 0;
        List<Map<String, Object>> details = new ArrayList<>();

        for (String ci : distinctCis) {
            try {
                Map<String, Object> r = syncSingleDocenteInternal(ci);
                syncedCount++;
                int gCount = (int) r.getOrDefault("gruposCount", 0);
                totalGroups += gCount;
                details.add(r);
            } catch (Exception ex) {
                log.warn("Error en sincronización en lote para CI {}: {}", ci, ex.getMessage());
            }
        }

        SeaSyncAuditLog audit = SeaSyncAuditLog.builder()
                .tipoSync("BATCH")
                .ejecutadoPor(StringUtils.hasText(adminUser) ? adminUser : "ADMIN")
                .ciObjetivo(distinctCis.size() + " docentes")
                .docentesCount(syncedCount)
                .gruposCount(totalGroups)
                .estado("EXITOSO")
                .detalle("Sincronización en lote ejecutada para " + distinctCis.size() + " docentes seleccionados. Sincronizados exitosamente: " + syncedCount)
                .creadoEn(OffsetDateTime.now())
                .build();
        this.seaSyncAuditLogRepository.save(audit);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("totalRequested", distinctCis.size());
        resp.put("syncedCount", syncedCount);
        resp.put("gruposCount", totalGroups);
        resp.put("estado", "EXITOSO");
        resp.put("status", "SUCCESS");
        resp.put("message", "Sincronización en lote finalizada. " + syncedCount + " de " + distinctCis.size() + " docentes procesados.");
        resp.put("details", details);
        return resp;
    }

    /**
     * Calcula la comparativa y diferencias detalladas entre SISA y SEA para un docente:
     * - Datos personales y estado activo/inactivo
     * - Coincidencias de asignaturas/materias
     * - Nuevas materias/grupos detectados en SEA aún no en SISA
     * - Materias asignadas en SISA no presentes en SEA
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSeaDiffForDocente(String ci) {
        String cleanCi = (ci != null) ? ci.trim() : "";

        // 1. Datos locales en SISA
        Optional<Usuario> userOpt = this.usuarioRepository.findByCi(cleanCi);
        if (userOpt.isEmpty()) {
            userOpt = this.usuarioRepository.findByUsername(cleanCi);
        }

        String nombreSisa = userOpt.map(Usuario::getNombreCompleto).orElse("NO REGISTRADO EN SISA");
        String rolSisa = userOpt.map(u -> u.getRol().name()).orElse("SIN_ROL");
        boolean activoSisa = userOpt.map(u -> Boolean.TRUE.equals(u.getActivo())).orElse(false);

        List<Map<String, Object>> sisaSubjects = new ArrayList<>();
        if (userOpt.isPresent()) {
            List<UsuarioAsignacionAcademica> asigs = this.usuarioAsignacionAcademicaRepository.findByUsuarioId(userOpt.get().getId());
            for (UsuarioAsignacionAcademica asig : asigs) {
                String code = asig.getAsignatura() != null ? asig.getAsignatura().getCodigo() : "";
                String name = asig.getAsignatura() != null ? asig.getAsignatura().getNombre()
                        : (asig.getCarrera() != null ? asig.getCarrera().getNombre() : "Asignación Académica");
                String desc = (StringUtils.hasText(code) ? code + " - " : "") + name;
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("codigo", code);
                m.put("nombre", name);
                m.put("sede", asig.getSede() != null ? asig.getSede().getNombre() : "");
                m.put("carrera", asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
                m.put("descripcion", desc);
                sisaSubjects.add(m);
            }
        }

        // 2. Datos oficiales en SEA
        List<GroupItemDto> remoteGroups = null;
        try {
            remoteGroups = this.gatewayClient.getGroups("2-2026", null, null, null);
        } catch (Exception e) {
            log.debug("Diff: Gateway groups fetch warning: {}", e.getMessage());
        }

        String nombreSea = null;
        List<Map<String, Object>> seaSubjects = new ArrayList<>();

        if (remoteGroups != null && !remoteGroups.isEmpty()) {
            List<GroupItemDto> teacherGroups = remoteGroups.stream()
                    .filter(g -> isCiMatch(g.teacherCi(), cleanCi))
                    .toList();

            for (GroupItemDto g : teacherGroups) {
                if (nombreSea == null && StringUtils.hasText(g.teacherName())) {
                    nombreSea = g.teacherName();
                }
                String code = g.syllabusCourseId() != null ? g.syllabusCourseId() : "";
                String name = g.courseName() != null ? g.courseName() : (g.name() != null ? "Grupo " + g.name() : "Materia SEA");
                if (this.seaMateriaRepository != null && StringUtils.hasText(g.syllabusCourseId())) {
                    var mOpt = this.seaMateriaRepository.findById(g.syllabusCourseId());
                    if (mOpt.isPresent()) {
                        code = mOpt.get().getCodigo();
                        name = mOpt.get().getNombre();
                    }
                }
                String grupo = g.name() != null ? g.name() : "";
                String horario = g.schedule() != null ? g.schedule() : "";
                String aula = g.classroom() != null ? g.classroom() : "";
                String desc = (StringUtils.hasText(code) ? code + " - " : "") + name + (StringUtils.hasText(grupo) ? " (" + grupo + ")" : "");
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("codigo", code);
                m.put("nombre", name);
                m.put("grupo", grupo);
                m.put("horario", horario);
                m.put("aula", aula);
                m.put("descripcion", desc);
                seaSubjects.add(m);
            }
        }

        // Fallback local sea_grupos si no se obtuvieron grupos remotos
        if (seaSubjects.isEmpty()) {
            var localGrupos = this.seaGrupoRepository.findByDocenteCiFlexible(cleanCi);
            for (SeaGrupo g : localGrupos) {
                if (nombreSea == null && StringUtils.hasText(g.getDocenteNombre())) {
                    nombreSea = g.getDocenteNombre();
                }
                String code = "";
                String name = "Materia SEA";
                if (g.getMateriaId() != null && this.seaMateriaRepository != null) {
                    var mOpt = this.seaMateriaRepository.findById(g.getMateriaId());
                    if (mOpt.isPresent()) {
                        code = mOpt.get().getCodigo();
                        name = mOpt.get().getNombre();
                    } else {
                        code = g.getMateriaId();
                    }
                }
                String grupo = g.getCodigoGrupo();
                String horario = g.getHorario();
                String aula = g.getAula();
                String desc = (StringUtils.hasText(code) ? code + " - " : "") + name + (StringUtils.hasText(grupo) ? " (" + grupo + ")" : "");
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("codigo", code);
                m.put("nombre", name);
                m.put("grupo", grupo);
                m.put("horario", horario);
                m.put("aula", aula);
                m.put("descripcion", desc);
                seaSubjects.add(m);
            }
        }

        if (nombreSea == null) {
            nombreSea = userOpt.isPresent() ? nombreSisa : "DOCENTE NO REGISTRADO EN SEA";
        }

        // 3. Comparativa y clasificación de materias
        List<Map<String, Object>> coincidencias = new ArrayList<>();
        List<Map<String, Object>> nuevasEnSea = new ArrayList<>();
        List<Map<String, Object>> soloEnSisa = new ArrayList<>();

        Set<Integer> matchedSisaIndices = new HashSet<>();

        for (Map<String, Object> seaSub : seaSubjects) {
            String seaCode = normalizeText(seaSub.get("codigo"));
            String seaName = normalizeText(seaSub.get("nombre"));
            boolean matched = false;

            for (int i = 0; i < sisaSubjects.size(); i++) {
                Map<String, Object> sisaSub = sisaSubjects.get(i);
                String sisaCode = normalizeText(sisaSub.get("codigo"));
                String sisaName = normalizeText(sisaSub.get("nombre"));

                if ((StringUtils.hasText(seaCode) && StringUtils.hasText(sisaCode) && (seaCode.contains(sisaCode) || sisaCode.contains(seaCode)))
                        || (StringUtils.hasText(seaName) && StringUtils.hasText(sisaName) && (seaName.contains(sisaName) || sisaName.contains(seaName)))) {
                    matched = true;
                    matchedSisaIndices.add(i);
                    break;
                }
            }

            if (matched) {
                coincidencias.add(seaSub);
            } else {
                nuevasEnSea.add(seaSub);
            }
        }

        for (int i = 0; i < sisaSubjects.size(); i++) {
            if (!matchedSisaIndices.contains(i)) {
                soloEnSisa.add(sisaSubjects.get(i));
            }
        }

        boolean nameDifferent = userOpt.isPresent()
                && StringUtils.hasText(nombreSea)
                && !normalizeText(nombreSea).equalsIgnoreCase(normalizeText(nombreSisa))
                && !"DOCENTE UNITEPC".equalsIgnoreCase(nombreSea);

        boolean hasDifferences = !nuevasEnSea.isEmpty()
                || !soloEnSisa.isEmpty()
                || userOpt.isEmpty()
                || !Boolean.TRUE.equals(userOpt.get().getActivo())
                || nameDifferent;

        Map<String, Object> diff = new LinkedHashMap<>();
        diff.put("ci", cleanCi);
        diff.put("nombreSisa", nombreSisa);
        diff.put("nombreSea", nombreSea);
        diff.put("rolSisa", rolSisa);
        diff.put("activoSisa", activoSisa);
        diff.put("activoSea", true);
        diff.put("totalGruposSea", seaSubjects.size());
        diff.put("totalAsignacionesSisa", sisaSubjects.size());
        diff.put("coincidencias", coincidencias);
        diff.put("nuevasEnSea", nuevasEnSea);
        diff.put("soloEnSisa", soloEnSisa);
        diff.put("hasDifferences", hasDifferences);

        return diff;
    }

    private Map<String, Object> syncSingleDocenteInternal(String ci) {
        if (!StringUtils.hasText(ci)) {
            throw new IllegalArgumentException("El CI no puede estar vacío");
        }
        String cleanCi = ci.trim();
        List<GroupItemDto> remoteGroups = null;
        try {
            remoteGroups = this.gatewayClient.getGroups("2-2026", null, null, null);
        } catch (Exception e) {
            log.warn("Unable to fetch groups from gateway for single sync: {}", e.getMessage());
        }

        String teacherName = null;
        int groupsCount = 0;
        int assignmentsCount = 0;

        if (remoteGroups != null && !remoteGroups.isEmpty()) {
            List<GroupItemDto> teacherGroups = remoteGroups.stream()
                    .filter(g -> isCiMatch(g.teacherCi(), cleanCi))
                    .toList();
            if (!teacherGroups.isEmpty()) {
                groupsCount = teacherGroups.size();
                teacherName = teacherGroups.stream()
                        .map(GroupItemDto::teacherName)
                        .filter(StringUtils::hasText)
                        .findFirst()
                        .orElse(null);
                updateLocalGroupsForTeacher(teacherGroups);
                provisionSingleDocente(cleanCi, teacherName);
                var userOpt = this.usuarioRepository.findByCi(cleanCi).or(() -> this.usuarioRepository.findByUsername(cleanCi));
                if (userOpt.isPresent()) {
                    assignmentsCount = syncTeacherAcademicAssignments(userOpt.get(), teacherGroups);
                }
            }
        }

        if (teacherName == null) {
            var localGrupos = this.seaGrupoRepository.findByDocenteCiFlexible(cleanCi);
            if (!localGrupos.isEmpty()) {
                groupsCount = localGrupos.size();
                teacherName = localGrupos.stream()
                        .map(SeaGrupo::getDocenteNombre)
                        .filter(StringUtils::hasText)
                        .findFirst()
                        .orElse(null);
                provisionSingleDocente(cleanCi, teacherName);
                var userOpt = this.usuarioRepository.findByCi(cleanCi).or(() -> this.usuarioRepository.findByUsername(cleanCi));
                if (userOpt.isPresent()) {
                    assignmentsCount = syncTeacherAcademicAssignmentsFromLocal(userOpt.get(), localGrupos);
                }
            }
        }

        // Auto-provisionar o actualizar docente en usuarios
        boolean created = provisionSingleDocente(cleanCi, teacherName);

        // Asegurar activo y nombre actualizado
        var userOpt = this.usuarioRepository.findByUsername(cleanCi);
        if (userOpt.isEmpty()) {
            userOpt = this.usuarioRepository.findByCi(cleanCi);
        }
        if (userOpt.isPresent()) {
            Usuario u = userOpt.get();
            boolean changed = false;
            if (!Boolean.TRUE.equals(u.getActivo())) {
                u.setActivo(true);
                changed = true;
            }
            if (teacherName != null && ("DOCENTE UNITEPC".equalsIgnoreCase(u.getNombreCompleto()) || !StringUtils.hasText(u.getNombres()))) {
                parseAndSetNames(u, teacherName);
                changed = true;
            }
            if (changed) {
                this.usuarioRepository.save(u);
            }
            if (teacherName == null) {
                teacherName = u.getNombreCompleto();
            }
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("ci", cleanCi);
        resp.put("nombre", teacherName);
        resp.put("gruposCount", groupsCount);
        resp.put("assignmentsCount", assignmentsCount);
        resp.put("created", created);
        resp.put("estado", "EXITOSO");
        resp.put("status", "SUCCESS");
        resp.put("message", "Docente y asignaciones académicas sincronizadas exitosamente desde SEA.");
        return resp;
    }

    private void updateLocalGroupsForTeacher(List<GroupItemDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return;
        try {
            for (GroupItemDto dto : dtos) {
                if (dto.id() == null) continue;

                // Ensure referenced materia exists in sea_materias to satisfy FK constraint
                String matId = dto.syllabusCourseId() != null ? dto.syllabusCourseId() : "mat-gen";
                if (this.seaMateriaRepository != null && !this.seaMateriaRepository.existsById(matId)) {
                    String matName = dto.courseName() != null ? dto.courseName() : "Materia " + matId;
                    String matCode = matId.length() <= 30 ? matId : "MAT-" + matId.substring(0, 10);
                    String seaCarreraId = null;
                    if (this.seaCarreraRepository != null && StringUtils.hasText(dto.careerCode())) {
                        var scOpt = this.seaCarreraRepository.findFirstByCodigo(dto.careerCode());
                        if (scOpt.isPresent()) {
                            seaCarreraId = scOpt.get().getId();
                        }
                    }
                    try {
                        this.seaMateriaRepository.save(new SeaMateria(matId, matCode, matName, (short) 1, matId, seaCarreraId));
                    } catch (Exception mEx) {
                        log.debug("Materia mirror already created or persisted: {}", mEx.getMessage());
                    }
                }

                var existing = this.seaGrupoRepository.findById(dto.id());
                if (existing.isEmpty()) {
                    var nuevo = new SeaGrupo(
                            dto.id(),
                            dto.name() != null ? dto.name() : "G1",
                            dto.classType() != null ? dto.classType() : "TEORICA",
                            dto.teacherName() != null ? dto.teacherName() : "DOCENTE UNITEPC",
                            dto.teacherCi() != null ? dto.teacherCi() : "0000000",
                            dto.schedule() != null ? dto.schedule() : "Horario regular",
                            dto.classroom() != null ? dto.classroom() : "Aula 101",
                            dto.campus() != null ? dto.campus() : "Campus Central",
                            matId
                    );
                    this.seaGrupoRepository.save(nuevo);
                } else {
                    var g = existing.get();
                    if (dto.name() != null) g.setCodigoGrupo(dto.name());
                    if (dto.classType() != null) g.setTipoClase(dto.classType());
                    if (dto.teacherName() != null) g.setDocenteNombre(dto.teacherName());
                    if (dto.teacherCi() != null) g.setDocenteCi(dto.teacherCi());
                    if (dto.schedule() != null) g.setHorario(dto.schedule());
                    if (dto.classroom() != null) g.setAula(dto.classroom());
                    if (dto.campus() != null) g.setCampus(dto.campus());
                    g.setMateriaId(matId);
                    this.seaGrupoRepository.save(g);
                }
            }
        } catch (Exception e) {
            log.warn("Could not save teacher groups to local mirror: {}", e.getMessage());
        }
    }

    private boolean isCiMatch(String rawCi, String targetCi) {
        if (!StringUtils.hasText(rawCi) || !StringUtils.hasText(targetCi)) return false;
        String r = rawCi.trim();
        String t = targetCi.trim();
        return r.equalsIgnoreCase(t)
                || r.startsWith(t + "-")
                || t.startsWith(r + "-");
    }

    private String normalizeText(Object obj) {
        if (obj == null) return "";
        return obj.toString().trim().toLowerCase()
                .replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
                .replace("ñ", "n");
    }
}
