package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Entity for audit logging of SEA Gateway synchronization executions
 * (Global catalog sync, individual teacher sync, batch teacher sync).
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sea_sync_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeaSyncAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_sync", nullable = false, length = 30)
    private String tipoSync; // GLOBAL, INDIVIDUAL, BATCH

    @Column(name = "ejecutado_por", nullable = false, length = 100)
    private String ejecutadoPor;

    @Column(name = "ci_objetivo", length = 255)
    private String ciObjetivo;

    @Column(name = "sedes_count")
    @Builder.Default
    private Integer sedesCount = 0;

    @Column(name = "carreras_count")
    @Builder.Default
    private Integer carrerasCount = 0;

    @Column(name = "materias_count")
    @Builder.Default
    private Integer materiasCount = 0;

    @Column(name = "grupos_count")
    @Builder.Default
    private Integer gruposCount = 0;

    @Column(name = "docentes_count")
    @Builder.Default
    private Integer docentesCount = 0;

    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "EXITOSO";

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "creado_en", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime creadoEn = OffsetDateTime.now();
}
