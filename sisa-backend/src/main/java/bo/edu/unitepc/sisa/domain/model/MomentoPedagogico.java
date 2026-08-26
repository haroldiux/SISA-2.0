package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Pedagogical moment (Inicio, Desarrollo, Cierre) within a Plan de Clase.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "momentos_pedagogicos")
@Getter
@Setter
@NoArgsConstructor
public class MomentoPedagogico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_clase_id", nullable = false)
    private PlanDeClase planClase;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_momento", nullable = false, length = 20)
    private TipoMomentoPedagogico tipoMomento;

    @Column(name = "duracion_min", nullable = false)
    private Integer duracionMin;

    @Column(name = "actividades_docente", nullable = false, columnDefinition = "TEXT")
    private String actividadesDocente;

    @Column(name = "actividades_estudiante", nullable = false, columnDefinition = "TEXT")
    private String actividadesEstudiante;

    @Column(name = "indicador_evaluacion", nullable = false, columnDefinition = "TEXT")
    private String indicadorEvaluacion;
}
