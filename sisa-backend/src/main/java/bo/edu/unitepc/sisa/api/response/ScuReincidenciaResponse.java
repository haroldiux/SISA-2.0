package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanAccion;
import bo.edu.unitepc.sisa.domain.enums.EstadoReincidencia;
import bo.edu.unitepc.sisa.domain.enums.NivelReincidencia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Disciplinary recurrence response DTO with optional action plan details.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuReincidenciaResponse {
    private Long id;
    private Long docenteId;
    private String docenteNombre;
    private Long gestionId;
    private String gestionCodigo;
    private Long auditoriaId;
    private Integer nroInfraccion;
    private NivelReincidencia nivel;
    private String motivo;
    private EstadoReincidencia estado;
    private Long planAccionId;
    private String planCompromisoMejora;
    private LocalDate planFechaLimite;
    private EstadoPlanAccion planEstado;
    private OffsetDateTime creadoEn;
}
