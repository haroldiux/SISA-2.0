package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.domain.enums.ConcordanciaTema;
import bo.edu.unitepc.sisa.domain.enums.EstadoAuditoria;
import bo.edu.unitepc.sisa.domain.enums.PuntualidadDocente;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * In situ audit details response DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuAuditoriaInSituResponse {
    private Long id;
    private Long asignacionId;
    private String asignaturaNombre;
    private String docenteNombre;
    private String carreraNombre;
    private String sedeNombre;
    private String aula;
    private Long auditorId;
    private String auditorNombre;
    private Long sesionProgramadaId;
    private Integer semanaProgramada;
    private Integer nroSesionProgramada;
    private String temaProgramado;
    private OffsetDateTime fechaHoraAuditoria;
    private PuntualidadDocente puntualidadDocente;
    private ConcordanciaTema concordanciaTema;
    private TipoMomentoPedagogico momentoObservado;
    @Builder.Default
    private List<String> recursosVerificados = new ArrayList<>();
    private Integer estudiantesPresentes;
    private Integer estudiantesInscritos;
    private Double porcentajeAsistencia;
    private String observacionesAuditor;
    private EstadoAuditoria estado;
    private String conformidadDocente;
    private String observacionesDocente;
    private OffsetDateTime fechaFirmaDocente;
    private String hashFirmaDigital;
}
