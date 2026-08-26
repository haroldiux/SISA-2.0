package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.TurnoClase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

/**
 * Teacher subject assignment request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuAsignacionDocenteRequest {

    private Long id;

    @NotNull(message = "La gestión es obligatoria")
    private Long gestionId;

    @NotNull(message = "El docente es obligatorio")
    private Long docenteId;

    @NotNull(message = "La carrera es obligatoria")
    private Long carreraId;

    @NotNull(message = "La asignatura es obligatoria")
    private Long asignaturaId;

    @NotNull(message = "El campus es obligatorio")
    private Long campusId;

    @NotBlank(message = "El grupo/paralelo es obligatorio")
    private String grupoParalelo;

    @NotNull(message = "El turno es obligatorio")
    private TurnoClase turno;

    @NotBlank(message = "El aula es obligatoria")
    private String aula;

    @NotBlank(message = "Los días de semana son obligatorios")
    private String diasSemana;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horarioInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horarioFin;
}
