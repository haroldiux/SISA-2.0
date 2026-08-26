package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.HitoEvaluativo;
import bo.edu.unitepc.sisa.domain.enums.InstrumentoEvaluacion;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Matriz 7 individual class session (20-week coverage / 36+ sessions).
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sesiones_matriz7")
@Getter
@Setter
@NoArgsConstructor
public class SesionMatriz7 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pac_id", nullable = false)
    private Pac pac;

    @Column(nullable = false)
    private Integer semana;

    @Column(name = "nro_sesion", nullable = false)
    private Integer nroSesion;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sesion", nullable = false, length = 20)
    private TipoSesion tipoSesion;

    @Column(name = "unidad_tematica", nullable = false, length = 255)
    private String unidadTematica;

    @Column(name = "contenido_especifico", nullable = false, columnDefinition = "TEXT")
    private String contenidoEspecifico;

    @Column(name = "saber_conceptual", nullable = false, columnDefinition = "TEXT")
    private String saberConceptual;

    @Column(name = "saber_procedimental", nullable = false, columnDefinition = "TEXT")
    private String saberProcedimental;

    @Column(name = "saber_actitudinal", nullable = false, columnDefinition = "TEXT")
    private String saberActitudinal;

    @Column(name = "criterio_desempeno", nullable = false, columnDefinition = "TEXT")
    private String criterioDesempeno;

    @Column(name = "evidencia_aprendizaje", nullable = false, columnDefinition = "TEXT")
    private String evidenciaAprendizaje;

    @Enumerated(EnumType.STRING)
    @Column(name = "instrumento_evaluacion", nullable = false, length = 30)
    private InstrumentoEvaluacion instrumentoEvaluacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "hito_evaluativo", nullable = false, length = 30)
    private HitoEvaluativo hitoEvaluativo;

    @OneToOne(mappedBy = "sesion", cascade = CascadeType.ALL, orphanRemoval = true)
    private PlanDeClase planDeClase;
}
