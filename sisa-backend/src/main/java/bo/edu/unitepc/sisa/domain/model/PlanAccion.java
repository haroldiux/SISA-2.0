package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanAccion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Action Plan remediation entity associated with Level 2 disciplinary recurrence.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "planes_accion")
@Getter
@Setter
@NoArgsConstructor
public class PlanAccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reincidencia_id", nullable = false, unique = true)
    private ReincidenciaDocente reincidencia;

    @Column(name = "compromiso_mejora", nullable = false, columnDefinition = "TEXT")
    private String compromisoMejora;

    @Column(name = "fecha_limite_cumplimiento", nullable = false)
    private LocalDate fechaLimiteCumplimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPlanAccion estado = EstadoPlanAccion.EN_CUMPLIMIENTO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprobado_por_id")
    private Usuario aprobadoPor;

    @Column(name = "aprobado_en")
    private OffsetDateTime aprobadoEn;
}
