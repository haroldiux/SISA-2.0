package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoGestion;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.enums.HitoEvaluativo;
import bo.edu.unitepc.sisa.domain.enums.InstrumentoEvaluacion;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.enums.TipoPeriodo;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.domain.enums.TurnoClase;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Asignatura;
import bo.edu.unitepc.sisa.domain.model.Campus;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.model.Gestion;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.model.SeaMateria;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.AsignaturaRepository;
import bo.edu.unitepc.sisa.domain.repository.CampusRepository;
import bo.edu.unitepc.sisa.domain.repository.CarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.GestionRepository;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaMateriaRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Command for querying PAC planning status across all courses in a career and academic term,
 * featuring resilient auto-provisioning fallback for uninitialized courses.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetPacByCarreraCmd {

    private static final Logger log = LoggerFactory.getLogger(ScuGetPacByCarreraCmd.class);

    private final PacRepository pacRepository;
    private final CarreraRepository carreraRepository;
    private final GestionRepository gestionRepository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CampusRepository campusRepository;
    private final SeaMateriaRepository seaMateriaRepository;

    public ScuGetPacByCarreraCmd(
            PacRepository pacRepository,
            CarreraRepository carreraRepository,
            GestionRepository gestionRepository,
            AsignacionDocenteRepository asignacionDocenteRepository,
            AsignaturaRepository asignaturaRepository,
            UsuarioRepository usuarioRepository,
            CampusRepository campusRepository,
            SeaMateriaRepository seaMateriaRepository) {
        this.pacRepository = pacRepository;
        this.carreraRepository = carreraRepository;
        this.gestionRepository = gestionRepository;
        this.asignacionDocenteRepository = asignacionDocenteRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.usuarioRepository = usuarioRepository;
        this.campusRepository = campusRepository;
        this.seaMateriaRepository = seaMateriaRepository;
    }

    /**
     * Resolves career ID and executes PAC status query for the specified career and academic term.
     *
     * @param carreraParam Numeric ID, carrera code (e.g. 'CARSIS', 'SIS'), or SEA UUID
     * @param gestionId    Academic term ID, defaults to 1L or active term if null
     * @return List of mapped ScuPacResponse items
     */
    @Transactional
    public List<ScuPacResponse> execute(String carreraParam, Long gestionId) {
        Long carreraId = resolveCarreraId(carreraParam);
        return execute(carreraId, gestionId);
    }

    /**
     * Queries PAC records for the specified career ID and academic term, auto-provisioning
     * provisional PACs in ENVIADO_REVISION state if assignments lack planning records.
     *
     * @param carreraId Career identifier
     * @param gestionId Academic term ID, defaults to 1L or active term if null
     * @return List of ScuPacResponse items
     */
    @Transactional
    public List<ScuPacResponse> execute(Long carreraId, Long gestionId) {
        Long effectiveGestionId = resolveEffectiveGestionId(gestionId);
        Long effectiveCarreraId = (carreraId != null) ? carreraId : 2L;

        // Auto-provisioning fallback: ensure courses have PAC entities
        _ensurePacsExistForCarreraAndGestion(effectiveCarreraId, effectiveGestionId);

        List<Pac> pacList = this.pacRepository.findByCarreraAndGestion(effectiveCarreraId, effectiveGestionId);

        return pacList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Resolves career ID from String representation (code, UUID, or numeric ID).
     */
    public Long resolveCarreraId(String carreraParam) {
        if (carreraParam == null || carreraParam.isBlank()) {
            return 2L; // Default Sistemas pilot
        }
        try {
            return Long.parseLong(carreraParam);
        } catch (NumberFormatException ignored) {
            // Not a number, resolve by code or UUID
        }

        String normalized = carreraParam.trim();
        if ("CARSIS".equalsIgnoreCase(normalized) || "SIS".equalsIgnoreCase(normalized)
                || "648febfd-dc79-4dd8-a8aa-dc7549ef649b".equalsIgnoreCase(normalized)) {
            return this.carreraRepository.findByCodigo("SIS").map(Carrera::getId).orElse(2L);
        }
        if ("CARMED".equalsIgnoreCase(normalized) || "MED".equalsIgnoreCase(normalized)) {
            return this.carreraRepository.findByCodigo("MED").map(Carrera::getId).orElse(1L);
        }
        if ("CARDER".equalsIgnoreCase(normalized) || "DER".equalsIgnoreCase(normalized)) {
            return this.carreraRepository.findByCodigo("DER").map(Carrera::getId).orElse(3L);
        }
        if ("CARELE".equalsIgnoreCase(normalized) || "ELE".equalsIgnoreCase(normalized)) {
            return this.carreraRepository.findByCodigo("ELE").map(Carrera::getId)
                    .or(() -> this.carreraRepository.findByCodigo("SIS").map(Carrera::getId))
                    .orElse(2L);
        }

        return this.carreraRepository.findByCodigo(normalized)
                .map(Carrera::getId)
                .orElse(2L);
    }

    /**
     * Resolves effective gestion ID, defaulting to active term or 1L.
     */
    public Long resolveEffectiveGestionId(Long gestionId) {
        if (gestionId != null) {
            return gestionId;
        }
        List<Gestion> planificando = this.gestionRepository.findByEstado(EstadoGestion.PLANIFICACION);
        if (!planificando.isEmpty()) {
            return planificando.get(0).getId();
        }
        List<Gestion> enCurso = this.gestionRepository.findByEstado(EstadoGestion.EN_CURSO);
        if (!enCurso.isEmpty()) {
            return enCurso.get(0).getId();
        }
        return 1L;
    }

    /**
     * Auto-provisions provisional PAC in ENVIADO_REVISION state for a specific course code if missing.
     */
    @Transactional
    public ScuPacResponse autoProvisionPacForCourse(String courseCode, Long carreraId, Long gestionId) {
        Long effectiveGestionId = resolveEffectiveGestionId(gestionId);
        Long effectiveCarreraId = (carreraId != null) ? carreraId : 2L;

        Optional<Asignatura> materiaOpt = this.asignaturaRepository.findByCodigo(courseCode);
        Asignatura materia;
        if (materiaOpt.isPresent()) {
            materia = materiaOpt.get();
        } else {
            Carrera c = this.carreraRepository.findById(effectiveCarreraId).orElse(null);
            materia = new Asignatura();
            materia.setCarrera(c);
            materia.setCodigo(courseCode);
            materia.setNombre("Asignatura " + courseCode);
            materia.setSemestre(1);
            materia.setTipoPeriodo(TipoPeriodo.SEMESTRAL);
            materia.setCreditos(5);
            materia.setHorasTeoricas(4);
            materia.setHorasPracticas(2);
            materia.setActivo(true);
            materia = this.asignaturaRepository.save(materia);
        }

        List<AsignacionDocente> asigs = this.asignacionDocenteRepository.findByGestionIdAndCarreraId(effectiveGestionId, effectiveCarreraId);
        final Asignatura finalMateria = materia;
        AsignacionDocente targetAsig = asigs.stream()
                .filter(a -> a.getAsignatura() != null && courseCode.equalsIgnoreCase(a.getAsignatura().getCodigo()))
                .findFirst()
                .orElseGet(() -> _createDefaultAssignment(finalMateria, effectiveCarreraId, effectiveGestionId));

        Pac pac = this.pacRepository.findByAsignacionId(targetAsig.getId())
                .orElseGet(() -> _createProvisionalPac(targetAsig));

        return mapToResponse(pac);
    }

    private void _ensurePacsExistForCarreraAndGestion(Long carreraId, Long gestionId) {
        try {
            List<AsignacionDocente> existingAsigs = this.asignacionDocenteRepository.findByGestionIdAndCarreraId(gestionId, carreraId);

            // 1. Ensure all existing assignments have a PAC entity
            for (AsignacionDocente asig : existingAsigs) {
                if (this.pacRepository.findByAsignacionId(asig.getId()).isEmpty()) {
                    log.info("Auto-provisioning provisional PAC for existing assignment ID: {}", asig.getId());
                    _createProvisionalPac(asig);
                }
            }

            // 2. Ensure catalog courses without assignments get auto-provisioned
            List<Asignatura> materias = this.asignaturaRepository.findByCarreraId(carreraId);
            for (Asignatura mat : materias) {
                boolean hasAsig = existingAsigs.stream()
                        .anyMatch(a -> a.getAsignatura() != null && a.getAsignatura().getId().equals(mat.getId()));
                if (!hasAsig) {
                    log.info("Auto-provisioning assignment and PAC for subject: {}", mat.getCodigo());
                    AsignacionDocente newAsig = _createDefaultAssignment(mat, carreraId, gestionId);
                    _createProvisionalPac(newAsig);
                }
            }

            // 3. Check SEA Materias fallback if catalog is empty
            if (materias.isEmpty()) {
                Carrera carrera = this.carreraRepository.findById(carreraId).orElse(null);
                String carreraCodigo = (carrera != null) ? carrera.getCodigo() : "SIS";
                List<SeaMateria> seaMaterias = this.seaMateriaRepository.findAll().stream()
                        .filter(sm -> sm.getCodigo() != null && sm.getCodigo().startsWith(carreraCodigo))
                        .collect(Collectors.toList());

                for (SeaMateria sm : seaMaterias) {
                    Optional<Asignatura> opt = this.asignaturaRepository.findByCodigo(sm.getCodigo());
                    Asignatura asigMat = opt.orElseGet(() -> {
                        Asignatura a = new Asignatura();
                        a.setCarrera(carrera);
                        a.setCodigo(sm.getCodigo());
                        a.setNombre(sm.getNombre());
                        a.setSemestre(sm.getSemestre() != null ? sm.getSemestre().intValue() : 1);
                        a.setTipoPeriodo(TipoPeriodo.SEMESTRAL);
                        a.setCreditos(5);
                        a.setHorasTeoricas(4);
                        a.setHorasPracticas(2);
                        a.setActivo(true);
                        return this.asignaturaRepository.save(a);
                    });
                    AsignacionDocente newAsig = _createDefaultAssignment(asigMat, carreraId, gestionId);
                    _createProvisionalPac(newAsig);
                }
            }
        } catch (Exception ex) {
            log.warn("Auto-provisioning notice during PAC resolution: {}", ex.getMessage());
        }
    }

    private AsignacionDocente _createDefaultAssignment(Asignatura mat, Long carreraId, Long gestionId) {
        Gestion gestion = this.gestionRepository.findById(gestionId).orElse(null);
        Carrera carrera = this.carreraRepository.findById(carreraId).orElse(null);
        Usuario docente = this.usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == RolUsuario.ROLE_DOCENTE)
                .findFirst()
                .orElseGet(() -> this.usuarioRepository.findById(1L).orElse(null));
        Campus campus = this.campusRepository.findAll().stream().findFirst().orElse(null);

        AsignacionDocente asig = new AsignacionDocente();
        asig.setGestion(gestion);
        asig.setCarrera(carrera);
        asig.setAsignatura(mat);
        asig.setDocente(docente);
        asig.setCampus(campus);
        asig.setGrupoParalelo("1A");
        asig.setTurno(TurnoClase.MANANA);
        asig.setAula("Aula-301");
        asig.setDiasSemana("LUNES,MIERCOLES");
        asig.setHorarioInicio(LocalTime.of(7, 30));
        asig.setHorarioFin(LocalTime.of(10, 30));
        asig.setActivo(true);
        return this.asignacionDocenteRepository.save(asig);
    }

    private Pac _createProvisionalPac(AsignacionDocente asig) {
        Pac pac = new Pac();
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.ENVIADO_REVISION);
        pac.setPacType("REGULAR");
        pac.setCreadoEn(OffsetDateTime.now());
        pac.setActualizadoEn(OffsetDateTime.now());

        Map<String, Object> sec = new HashMap<>();
        sec.put("carrera", asig.getCarrera() != null ? asig.getCarrera().getNombre() : "Ingeniería de Sistemas");
        sec.put("asignatura", asig.getAsignatura() != null ? asig.getAsignatura().getNombre() : "");
        sec.put("codigo", asig.getAsignatura() != null ? asig.getAsignatura().getCodigo() : "");
        sec.put("docente", asig.getDocente() != null ? asig.getDocente().getNombreCompleto() : "");
        pac.setSeccionesIdentificacion(sec);

        List<String> estrategias = List.of(
                "Aprendizaje Basado en Problemas (ABP)",
                "Estudio de Casos y Talleres Prácticos",
                "Desarrollo de Proyectos Integradores"
        );
        pac.setEstrategiasMetodologicas(new ArrayList<>(estrategias));

        List<String> recursos = List.of(
                "Plataforma SISA / Campus Virtual",
                "Entorno de Desarrollo Integrado (IDE)",
                "Bibliografía institucional física y digital"
        );
        pac.setRecursosDidacticos(new ArrayList<>(recursos));

        List<String> normas = List.of(
                "Puntualidad en el ingreso a sesiones presenciales y virtuales",
                "Cumplimiento del 80% de asistencia mínima",
                "Ética e integridad académica en entregas y evaluaciones"
        );
        pac.setNormasCurso(new ArrayList<>(normas));

        LocalDate startDate = LocalDate.now();
        for (int semana = 1; semana <= 20; semana++) {
            SesionMatriz7 s = new SesionMatriz7();
            s.setSemana(semana);
            s.setNroSesion(semana);
            s.setFechaProgramada(startDate.plusWeeks(semana - 1));
            s.setTipoSesion(TipoSesion.TEORICA);
            s.setUnidadTematica("Unidad " + ((semana - 1) / 5 + 1) + ": Fundamentos y Aplicación Pedagógica");
            s.setContenidoEspecifico("Desarrollo temático de la sesión semanal número " + semana);
            s.setSaberConceptual("Comprensión de los conceptos teóricos correspondientes a la unidad");
            s.setSaberProcedimental("Aplicación práctica de saberes y resolución de ejercicios");
            s.setSaberActitudinal("Participación activa, pensamiento crítico y ética profesional");
            s.setCriterioDesempeno("Demuestra dominio de competencias y criterios definidos en la malla");
            s.setEvidenciaAprendizaje("Informe de avance y productos evaluables de aprendizaje");
            s.setInstrumentoEvaluacion(InstrumentoEvaluacion.RUBRICA);

            HitoEvaluativo hito;
            if (semana == 7) {
                hito = HitoEvaluativo.PRIMER_PARCIAL;
            } else if (semana == 14) {
                hito = HitoEvaluativo.SEGUNDO_PARCIAL;
            } else if (semana == 20) {
                hito = HitoEvaluativo.EXAMEN_FINAL;
            } else {
                hito = HitoEvaluativo.REGULAR;
            }
            s.setHitoEvaluativo(hito);
            pac.addSesion(s);
        }

        return this.pacRepository.save(pac);
    }

    public ScuPacResponse mapToResponse(Pac p) {
        AsignacionDocente asig = p.getAsignacion();
        Asignatura materia = (asig != null) ? asig.getAsignatura() : null;
        Usuario docente = (asig != null) ? asig.getDocente() : null;

        List<ScuSesionMatriz7Dto> sDtos = (p.getSesiones() != null)
                ? p.getSesiones().stream()
                .map(s -> ScuSesionMatriz7Dto.builder()
                        .id(s.getId())
                        .semana(s.getSemana())
                        .nroSesion(s.getNroSesion())
                        .fechaProgramada(s.getFechaProgramada())
                        .tipoSesion(s.getTipoSesion())
                        .unidadTematica(s.getUnidadTematica())
                        .contenidoEspecifico(s.getContenidoEspecifico())
                        .saberConceptual(s.getSaberConceptual())
                        .saberProcedimental(s.getSaberProcedimental())
                        .saberActitudinal(s.getSaberActitudinal())
                        .criterioDesempeno(s.getCriterioDesempeno())
                        .evidenciaAprendizaje(s.getEvidenciaAprendizaje())
                        .instrumentoEvaluacion(s.getInstrumentoEvaluacion())
                        .hitoEvaluativo(s.getHitoEvaluativo())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        return ScuPacResponse.builder()
                .id(p.getId())
                .asignacionId(asig != null ? asig.getId() : null)
                .codigoAsignatura(materia != null ? materia.getCodigo() : null)
                .nombreAsignatura(materia != null ? materia.getNombre() : null)
                .semestre(materia != null ? materia.getSemestre() : null)
                .docenteId(docente != null ? docente.getId() : null)
                .docenteNombre(docente != null ? docente.getNombreCompleto() : null)
                .docenteCi(docente != null ? docente.getCi() : null)
                .estado(p.getEstado())
                .seccionesIdentificacion(p.getSeccionesIdentificacion())
                .estrategiasMetodologicas(p.getEstrategiasMetodologicas())
                .recursosDidacticos(p.getRecursosDidacticos())
                .normasCurso(p.getNormasCurso())
                .observacionesRevision(p.getObservacionesRevision())
                .revisadoPorId(p.getRevisadoPor() != null ? p.getRevisadoPor().getId() : null)
                .revisadoPorNombre(p.getRevisadoPor() != null ? p.getRevisadoPor().getNombreCompleto() : null)
                .revisadoEn(p.getRevisadoEn())
                .matriz7Count(p.getSesiones() != null ? p.getSesiones().size() : 0)
                .matriz7(sDtos)
                .creadoEn(p.getCreadoEn())
                .actualizadoEn(p.getActualizadoEn())
                .build();
    }
}
