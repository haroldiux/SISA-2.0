package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.infrastructure.persistence.converter.JsonbStringListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Micro-curricular single class didactic plan entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "planes_clase")
@Getter
@Setter
@NoArgsConstructor
public class PlanDeClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_id", nullable = false, unique = true)
    private SesionMatriz7 sesion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPlanificacion estado = EstadoPlanificacion.BORRADOR;

    @Column(name = "duracion_total_min", nullable = false)
    private Integer duracionTotalMin;

    @Column(name = "objetivo_sesion", nullable = false, columnDefinition = "TEXT")
    private String objetivoSesion;

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "recursos_didacticos", nullable = false, columnDefinition = "JSONB")
    private List<String> recursosDidacticos = new ArrayList<>();

    @OneToMany(mappedBy = "planClase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MomentoPedagogico> momentos = new ArrayList<>();

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    public void addMomento(MomentoPedagogico momento) {
        this.momentos.add(momento);
        momento.setPlanClase(this);
    }
}
