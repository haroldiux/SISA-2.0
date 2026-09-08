package bo.edu.unitepc.sisa.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Academic assignment DTO mapping a user to a Sede, Carrera, and optionally an Asignatura.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicaAsignacionDto {
    private Long id;
    private Long sedeId;
    private String sedeNombre;
    private Long carreraId;
    private String carreraNombre;
    private Long asignaturaId;
    private String asignaturaNombre;
}
