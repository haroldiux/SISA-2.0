package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.infrastructure.persistence.converter.JsonbStringListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad de persistencia relacional para el registro de seguimiento didactico de aula.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(
        name = "seguimientos_clases",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_seguimiento_sesion_matriz7", columnNames = {"sesion_matriz7_id"}),
                @UniqueConstraint(
                        name = "uq_seguimiento_materia_fecha_comision",
                        columnNames = {"materia_codigo", "fecha_ejecucion", "tipo_clase", "comision"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class SeguimientoClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_matriz7_id")
    private SesionMatriz7 sesionMatriz7;

    @Column(name = "materia_codigo", nullable = false, length = 30)
    private String materiaCodigo;

    @Column(name = "carrera_codigo", nullable = false, length = 30)
    private String carreraCodigo = "CARSIS";

    @Column(name = "docente_ci", nullable = false, length = 30)
    private String docenteCi;

    @Column(name = "fecha_ejecucion", nullable = false)
    private LocalDate fechaEjecucion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_clase", nullable = false, length = 20)
    private TipoSesion tipoClase = TipoSesion.TEORICA;

    @Column(name = "comision", nullable = false, length = 20)
    private String comision = "TA-01";

    @Column(name = "tema_oficial", length = 500)
    private String temaOficial;

    @Column(name = "tema_ejecutado", length = 500)
    private String temaEjecutado;

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "recursos_planificados", nullable = false, columnDefinition = "JSONB")
    private List<String> recursosPlanificados = new ArrayList<>();

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "recursos_utilizados", nullable = false, columnDefinition = "JSONB")
    private List<String> recursosUtilizados = new ArrayList<>();

    @Column(name = "momento_inicio_cumplido", nullable = false)
    private Boolean momentoInicioCumplido = Boolean.TRUE;

    @Column(name = "momento_desarrollo_cumplido", nullable = false)
    private Boolean momentoDesarrolloCumplido = Boolean.TRUE;

    @Column(name = "momento_cierre_cumplido", nullable = false)
    private Boolean momentoCierreCumplido = Boolean.TRUE;

    @Column(name = "secuencia_introduccion", nullable = false)
    private Boolean secuenciaIntroduccion = Boolean.TRUE;

    @Column(name = "secuencia_resultados", nullable = false)
    private Boolean secuenciaResultados = Boolean.TRUE;

    @Column(name = "secuencia_contenidos", nullable = false)
    private Boolean secuenciaContenidos = Boolean.TRUE;

    @Column(name = "secuencia_cuerpo", nullable = false)
    private Boolean secuenciaCuerpo = Boolean.TRUE;

    @Column(name = "secuencia_cierre", nullable = false)
    private Boolean secuenciaCierre = Boolean.TRUE;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_cumplimiento", nullable = false, length = 30)
    private EstadoCumplimientoTema estadoCumplimiento = EstadoCumplimientoTema.TOTALMENTE_CUMPLIDO;

    @Column(name = "cumplimiento_score", nullable = false, precision = 3, scale = 2)
    private BigDecimal cumplimientoScore = new BigDecimal("1.00");

    @Column(name = "observaciones_docente", columnDefinition = "TEXT")
    private String observacionesDocente;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    @PrePersist
    @PreUpdate
    public void sincronizarScoreYTimestamps() {
        if (this.estadoCumplimiento != null) {
            this.cumplimientoScore = this.estadoCumplimiento.getScore();
        }
        this.actualizadoEn = OffsetDateTime.now();
    }
}
