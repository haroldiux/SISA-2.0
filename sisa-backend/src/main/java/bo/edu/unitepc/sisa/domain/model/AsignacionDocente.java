package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.TurnoClase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

/**
 * Teacher subject assignment to a specific campus, schedule, and semester.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "asignaciones_docentes")
@Getter
@Setter
@NoArgsConstructor
public class AsignacionDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gestion_id", nullable = false)
    private Gestion gestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignatura_id", nullable = false)
    private Asignatura asignatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campus_id", nullable = false)
    private Campus campus;

    @Column(name = "grupo_paralelo", nullable = false, length = 10)
    private String grupoParalelo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TurnoClase turno;

    @Column(nullable = false, length = 50)
    private String aula;

    @Column(name = "dias_semana", nullable = false, length = 50)
    private String diasSemana;

    @Column(name = "horario_inicio", nullable = false)
    private LocalTime horarioInicio;

    @Column(name = "horario_fin", nullable = false)
    private LocalTime horarioFin;

    @Column(nullable = false)
    private Boolean activo = true;
}
