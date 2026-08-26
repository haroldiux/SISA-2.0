package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuAsignacionDocenteRequest;
import bo.edu.unitepc.sisa.api.response.ScuAsignacionDocenteResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoGestion;
import bo.edu.unitepc.sisa.domain.model.*;
import bo.edu.unitepc.sisa.domain.repository.*;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.exception.ScuGestionClosedException;
import bo.edu.unitepc.sisa.exception.ScuScheduleOverlapException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Command for validating and creating academic teacher assignments with schedule collision checks.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuCreateAsignacionDocenteCmd {

    private final AsignacionDocenteRepository asignacionRepository;
    private final GestionRepository gestionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarreraRepository carreraRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final CampusRepository campusRepository;

    public ScuCreateAsignacionDocenteCmd(
            AsignacionDocenteRepository asignacionRepository,
            GestionRepository gestionRepository,
            UsuarioRepository usuarioRepository,
            CarreraRepository carreraRepository,
            AsignaturaRepository asignaturaRepository,
            CampusRepository campusRepository) {
        this.asignacionRepository = asignacionRepository;
        this.gestionRepository = gestionRepository;
        this.usuarioRepository = usuarioRepository;
        this.carreraRepository = carreraRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.campusRepository = campusRepository;
    }

    @Transactional
    public ScuAsignacionDocenteResponse execute(ScuAsignacionDocenteRequest request) {
        Gestion gestion = this.gestionRepository.findById(request.getGestionId())
                .orElseThrow(() -> new ScuException("GESTION_NOT_FOUND", "Gestión académica no encontrada", HttpStatus.NOT_FOUND));

        if (EstadoGestion.CERRADA.equals(gestion.getEstado())) {
            throw new ScuGestionClosedException("No se pueden modificar asignaciones en una gestión académica cerrada");
        }

        Usuario docente = this.usuarioRepository.findById(request.getDocenteId())
                .orElseThrow(() -> new ScuException("DOCENTE_NOT_FOUND", "Docente no encontrado", HttpStatus.NOT_FOUND));

        Carrera carrera = this.carreraRepository.findById(request.getCarreraId())
                .orElseThrow(() -> new ScuException("CARRERA_NOT_FOUND", "Carrera no encontrada", HttpStatus.NOT_FOUND));

        Asignatura asignatura = this.asignaturaRepository.findById(request.getAsignaturaId())
                .orElseThrow(() -> new ScuException("ASIGNATURA_NOT_FOUND", "Asignatura no encontrada", HttpStatus.NOT_FOUND));

        Campus campus = this.campusRepository.findById(request.getCampusId())
                .orElseThrow(() -> new ScuException("CAMPUS_NOT_FOUND", "Campus no encontrado", HttpStatus.NOT_FOUND));

        // Schedule collision detection
        List<AsignacionDocente> overlaps = this.asignacionRepository.findOverlappingAssignments(
                gestion.getId(),
                docente.getId(),
                request.getDiasSemana(),
                request.getHorarioInicio(),
                request.getHorarioFin(),
                request.getId()
        );

        if (!overlaps.isEmpty()) {
            throw new ScuScheduleOverlapException(
                    "Conflicto de horario detectado para el docente en los días " + request.getDiasSemana() +
                    " entre " + request.getHorarioInicio() + " y " + request.getHorarioFin()
            );
        }

        AsignacionDocente asignacion = (request.getId() != null)
                ? this.asignacionRepository.findById(request.getId()).orElse(new AsignacionDocente())
                : new AsignacionDocente();

        asignacion.setGestion(gestion);
        asignacion.setDocente(docente);
        asignacion.setCarrera(carrera);
        asignacion.setAsignatura(asignatura);
        asignacion.setCampus(campus);
        asignacion.setGrupoParalelo(request.getGrupoParalelo());
        asignacion.setTurno(request.getTurno());
        asignacion.setAula(request.getAula());
        asignacion.setDiasSemana(request.getDiasSemana());
        asignacion.setHorarioInicio(request.getHorarioInicio());
        asignacion.setHorarioFin(request.getHorarioFin());
        asignacion.setActivo(true);

        AsignacionDocente saved = this.asignacionRepository.save(asignacion);

        return ScuAsignacionDocenteResponse.builder()
                .id(saved.getId())
                .gestionId(gestion.getId())
                .gestionCodigo(gestion.getCodigo())
                .docenteId(docente.getId())
                .docenteNombre(docente.getNombreCompleto())
                .carreraId(carrera.getId())
                .carreraNombre(carrera.getNombre())
                .asignaturaId(asignatura.getId())
                .asignaturaCodigo(asignatura.getCodigo())
                .asignaturaNombre(asignatura.getNombre())
                .semestre(asignatura.getSemestre())
                .campusId(campus.getId())
                .campusNombre(campus.getNombre())
                .sedeId(campus.getSede() != null ? campus.getSede().getId() : null)
                .sedeNombre(campus.getSede() != null ? campus.getSede().getNombre() : "")
                .grupoParalelo(saved.getGrupoParalelo())
                .turno(saved.getTurno())
                .aula(saved.getAula())
                .diasSemana(saved.getDiasSemana())
                .horarioInicio(saved.getHorarioInicio())
                .horarioFin(saved.getHorarioFin())
                .build();
    }
}
