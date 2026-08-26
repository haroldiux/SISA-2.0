package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.TipoPeriodo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Academic subject / course within a curriculum mesh.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "asignaturas")
@Getter
@Setter
@NoArgsConstructor
public class Asignatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false)
    private Integer semestre;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_periodo", nullable = false, length = 20)
    private TipoPeriodo tipoPeriodo;

    @Column(nullable = false)
    private Integer creditos;

    @Column(name = "horas_teoricas", nullable = false)
    private Integer horasTeoricas = 0;

    @Column(name = "horas_practicas", nullable = false)
    private Integer horasPracticas = 0;

    @Column(nullable = false)
    private Boolean activo = true;
}
