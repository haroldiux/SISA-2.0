package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.NivelParametro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad JPA para la parametrizacion jerarquica de reglas de negocio, umbrales de asistencia,
 * semaforos de avance curricular y tolerancias de marcacion docente.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(
        name = "parametros_configuracion",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_parametro_nivel_ambito", columnNames = {"nivel", "codigo_ambito"})
        }
)
@Getter
@Setter
@NoArgsConstructor
public class ParametroConfiguracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NivelParametro nivel;

    @Column(name = "codigo_ambito", nullable = false, length = 50)
    private String codigoAmbito; // 'GLOBAL', 'CBA', 'CARSIS', etc.

    @Column(name = "nombre_ambito", nullable = false, length = 150)
    private String nombreAmbito;

    @Column(name = "asistencia_minima_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal asistenciaMinimaPct = new BigDecimal("80.00");

    @Column(name = "asistencia_alerta_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal asistenciaAlertaPct = new BigDecimal("85.00");

    @Column(name = "faltas_consecutivas_alerta", nullable = false)
    private Integer faltasConsecutivasAlerta = 2;

    @Column(name = "semaforo_verde_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal semaforoVerdePct = new BigDecimal("-10.00");

    @Column(name = "semaforo_amarillo_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal semaforoAmarilloPct = new BigDecimal("-25.00");

    @Column(name = "horas_gracia_registro_docente", nullable = false)
    private Integer horasGraciaRegistroDocente = 2;

    @Column(name = "sesiones_sin_asentar_alerta", nullable = false)
    private Integer sesionesSinAsentarAlerta = 2;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by", length = 100)
    private String updatedBy = "SYSTEM";

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();
        if (this.codigoAmbito != null) {
            this.codigoAmbito = this.codigoAmbito.trim().toUpperCase();
        }
    }
}
