package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.domain.repository.SesionMatriz7Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Command for real-time classroom in situ audit initialization and schedule matching.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuInitiateAuditoriaInSituCmd {

    private final AsignacionDocenteRepository asignacionRepository;
    private final PacRepository pacRepository;
    private final SesionMatriz7Repository sesionRepository;

    public ScuInitiateAuditoriaInSituCmd(
            AsignacionDocenteRepository asignacionRepository,
            PacRepository pacRepository,
            SesionMatriz7Repository sesionRepository) {
        this.asignacionRepository = asignacionRepository;
        this.pacRepository = pacRepository;
        this.sesionRepository = sesionRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> execute(Long campusId, String aula, String dia, LocalTime hora) {
        LocalTime searchTime = hora != null ? hora : LocalTime.now();
        List<AsignacionDocente> matches = this.asignacionRepository.findActiveClassesInRoom(
                campusId, aula, dia, searchTime
        );

        Map<String, Object> result = new HashMap<>();

        if (matches.isEmpty()) {
            result.put("matched", false);
            result.put("message", "No se encontró ninguna clase activa programada en el aula y horario indicados");
            return result;
        }

        AsignacionDocente asignacion = matches.get(0);
        LocalDate today = LocalDate.now();

        Optional<Pac> pacOpt = this.pacRepository.findByAsignacionId(asignacion.getId());
        SesionMatriz7 sesionProgramada = null;
        if (pacOpt.isPresent()) {
            Long pacId = pacOpt.get().getId();
            sesionProgramada = this.sesionRepository.findByPacIdAndFechaProgramada(pacId, today)
                    .orElseGet(() -> {
                        List<SesionMatriz7> sesiones = this.sesionRepository.findByPacIdOrderByNroSesionAsc(pacId);
                        return sesiones.isEmpty() ? null : sesiones.get(0);
                    });
        }

        result.put("matched", true);
        result.put("asignacionId", asignacion.getId());
        result.put("carreraNombre", asignacion.getCarrera() != null ? asignacion.getCarrera().getNombre() : "");
        result.put("asignaturaNombre", asignacion.getAsignatura() != null ? asignacion.getAsignatura().getNombre() : "");
        result.put("docenteNombre", asignacion.getDocente() != null ? asignacion.getDocente().getNombreCompleto() : "");
        result.put("aula", asignacion.getAula());
        result.put("horarioInicio", asignacion.getHorarioInicio());
        result.put("horarioFin", asignacion.getHorarioFin());
        result.put("sesionProgramadaId", sesionProgramada != null ? sesionProgramada.getId() : null);
        result.put("semanaProgramada", sesionProgramada != null ? sesionProgramada.getSemana() : null);
        result.put("nroSesionProgramada", sesionProgramada != null ? sesionProgramada.getNroSesion() : null);
        result.put("temaProgramado", sesionProgramada != null ? sesionProgramada.getUnidadTematica() : "Sin sesión programada para hoy");
        result.put("contenidoEspecifico", sesionProgramada != null ? sesionProgramada.getContenidoEspecifico() : "");

        return result;
    }
}
