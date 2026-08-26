package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Macro-curricular analytical program entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "programas_analiticos")
@Getter
@Setter
@NoArgsConstructor
public class ProgramaAnalitico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false, unique = true)
    private AsignacionDocente asignacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPlanificacion estado = EstadoPlanificacion.BORRADOR;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String caracterizacion;

    @Column(name = "macro_competencia", nullable = false, columnDefinition = "TEXT")
    private String macroCompetencia;

    @Column(name = "sistema_evaluacion", nullable = false, columnDefinition = "TEXT")
    private String sistemaEvaluacion;

    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnidadAprendizaje> unidades = new ArrayList<>();

    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bibliografia> bibliografia = new ArrayList<>();

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    public void addUnidad(UnidadAprendizaje unidad) {
        this.unidades.add(unidad);
        unidad.setPrograma(this);
    }

    public void addBibliografia(Bibliografia biblio) {
        this.bibliografia.add(biblio);
        biblio.setPrograma(this);
    }
}
