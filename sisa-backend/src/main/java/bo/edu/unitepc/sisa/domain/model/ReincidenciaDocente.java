package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoReincidencia;
import bo.edu.unitepc.sisa.domain.enums.NivelReincidencia;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Disciplinary recurrence entity tracking 3-strike escalation.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "reincidencias_docentes")
@Getter
@Setter
@NoArgsConstructor
public class ReincidenciaDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gestion_id", nullable = false)
    private Gestion gestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditoria_id")
    private AuditoriaInSitu auditoria;

    @Column(name = "nro_infraccion", nullable = false)
    private Integer nroInfraccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NivelReincidencia nivel;

    @Column(nullable = false, length = 255)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoReincidencia estado = EstadoReincidencia.NOTIFICADO;

    @OneToOne(mappedBy = "reincidencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private PlanAccion planAccion;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();
}
