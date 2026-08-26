package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.infrastructure.persistence.converter.JsonbMapConverter;
import bo.edu.unitepc.sisa.infrastructure.persistence.converter.JsonbStringListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Plan Academico Curricular (PAC) meso-curricular entity containing Matriz 7.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "pacs")
@Getter
@Setter
@NoArgsConstructor
public class Pac {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false, unique = true)
    private AsignacionDocente asignacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPlanificacion estado = EstadoPlanificacion.BORRADOR;

    @Convert(converter = JsonbMapConverter.class)
    @Column(name = "secciones_identificacion", nullable = false, columnDefinition = "JSONB")
    private Map<String, Object> seccionesIdentificacion = new HashMap<>();

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "estrategias_metodologicas", nullable = false, columnDefinition = "JSONB")
    private List<String> estrategiasMetodologicas = new ArrayList<>();

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "recursos_didacticos", nullable = false, columnDefinition = "JSONB")
    private List<String> recursosDidacticos = new ArrayList<>();

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "normas_curso", nullable = false, columnDefinition = "JSONB")
    private List<String> normasCurso = new ArrayList<>();

    @Column(name = "observaciones_revision", columnDefinition = "TEXT")
    private String observacionesRevision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisado_por_id")
    private Usuario revisadoPor;

    @Column(name = "revisado_en")
    private OffsetDateTime revisadoEn;

    @OneToMany(mappedBy = "pac", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SesionMatriz7> sesiones = new ArrayList<>();

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    public void addSesion(SesionMatriz7 sesion) {
        this.sesiones.add(sesion);
        sesion.setPac(this);
    }
}
