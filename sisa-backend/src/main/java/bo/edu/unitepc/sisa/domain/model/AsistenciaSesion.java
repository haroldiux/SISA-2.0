package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a class attendance session.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "asistencias_sesiones")
@Getter
@Setter
@NoArgsConstructor
public class AsistenciaSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "materia_codigo", nullable = false, length = 30)
    private String materiaCodigo;

    @Column(name = "materia_nombre", nullable = false, length = 255)
    private String materiaNombre;

    @Column(name = "gestion_codigo", nullable = false, length = 20)
    private String gestionCodigo = "2-2026";

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "tipo_clase", nullable = false, length = 20)
    private String tipoClase = "TEORICA";

    @Column(nullable = false, length = 20)
    private String comision = "TA-01";

    @Column(length = 500)
    private String tema;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "registrado_por", nullable = false, length = 100)
    private String registradoPor;

    @Column(name = "creado_en", nullable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn = OffsetDateTime.now();

    @OneToMany(mappedBy = "sesion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AsistenciaEstudiante> estudiantes = new ArrayList<>();

    public void addEstudiante(AsistenciaEstudiante estudiante) {
        estudiantes.add(estudiante);
        estudiante.setSesion(this);
    }

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
