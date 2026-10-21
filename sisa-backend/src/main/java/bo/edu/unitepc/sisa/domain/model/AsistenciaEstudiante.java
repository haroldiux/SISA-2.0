package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.EstadoAsistencia;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * JPA entity representing a student attendance mark within a session.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "asistencias_estudiantes")
@Getter
@Setter
@NoArgsConstructor
public class AsistenciaEstudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_id", nullable = false)
    private AsistenciaSesion sesion;

    @Column(name = "estudiante_codigo", nullable = false, length = 50)
    private String estudianteCodigo;

    @Column(name = "estudiante_nombre", nullable = false, length = 255)
    private String estudianteNombre;

    @Column(name = "carrera_codigo", nullable = false, length = 30)
    private String carreraCodigo = "CARSIS";

    @Column(name = "carrera_nombre", nullable = false, length = 255)
    private String carreraNombre = "Ingeniería de Sistemas";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoAsistencia estado = EstadoAsistencia.PRESENTE;

    @Column(length = 500)
    private String observacion;

    @Column(name = "creado_en", nullable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.creadoEn == null) {
            this.creadoEn = OffsetDateTime.now();
        }
        this.actualizadoEn = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.actualizadoEn = OffsetDateTime.now();
    }
}
