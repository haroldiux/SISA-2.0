package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.domain.enums.TurnoClase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

/**
 * Teacher assignment response DTO with related entity metadata.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuAsignacionDocenteResponse {
    private Long id;
    private Long gestionId;
    private String gestionCodigo;
    private Long docenteId;
    private String docenteNombre;
    private Long carreraId;
    private String carreraNombre;
    private Long asignaturaId;
    private String asignaturaCodigo;
    private String asignaturaNombre;
    private Integer semestre;
    private Long campusId;
    private String campusNombre;
    private Long sedeId;
    private String sedeNombre;
    private String grupoParalelo;
    private TurnoClase turno;
    private String aula;
    private String diasSemana;
    private LocalTime horarioInicio;
    private LocalTime horarioFin;
}
