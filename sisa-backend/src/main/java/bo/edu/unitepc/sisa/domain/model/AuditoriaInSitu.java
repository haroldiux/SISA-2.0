package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.ConcordanciaTema;
import bo.edu.unitepc.sisa.domain.enums.EstadoAuditoria;
import bo.edu.unitepc.sisa.domain.enums.PuntualidadDocente;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import bo.edu.unitepc.sisa.infrastructure.persistence.converter.JsonbStringListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Real-time in situ classroom spot audit entity with digital signature hash.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "auditorias_in_situ")
@Getter
@Setter
@NoArgsConstructor
public class AuditoriaInSitu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false)
    private AsignacionDocente asignacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditor_id", nullable = false)
    private Usuario auditor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_programada_id")
    private SesionMatriz7 sesionProgramada;

    @Column(name = "fecha_hora_auditoria", nullable = false)
    private OffsetDateTime fechaHoraAuditoria = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "puntualidad_docente", nullable = false, length = 30)
    private PuntualidadDocente puntualidadDocente;

    @Enumerated(EnumType.STRING)
    @Column(name = "concordancia_tema", nullable = false, length = 30)
    private ConcordanciaTema concordanciaTema;

    @Enumerated(EnumType.STRING)
    @Column(name = "momento_observado", nullable = false, length = 30)
    private TipoMomentoPedagogico momentoObservado;

    @Convert(converter = JsonbStringListConverter.class)
    @Column(name = "recursos_verificados", nullable = false, columnDefinition = "JSONB")
    private List<String> recursosVerificados = new ArrayList<>();

    @Column(name = "estudiantes_presentes", nullable = false)
    private Integer estudiantesPresentes = 0;

    @Column(name = "estudiantes_inscritos", nullable = false)
    private Integer estudiantesInscritos = 0;

    @Column(name = "observaciones_auditor", columnDefinition = "TEXT")
    private String observacionesAuditor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoAuditoria estado = EstadoAuditoria.FINALIZADA_CONFORME;

    @Column(name = "conformidad_docente", length = 30)
    private String conformidadDocente;

    @Column(name = "observaciones_docente", columnDefinition = "TEXT")
    private String observacionesDocente;

    @Column(name = "fecha_firma_docente")
    private OffsetDateTime fechaFirmaDocente;

    @Column(name = "hash_firma_digital", nullable = false, length = 64)
    private String hashFirmaDigital;
}
