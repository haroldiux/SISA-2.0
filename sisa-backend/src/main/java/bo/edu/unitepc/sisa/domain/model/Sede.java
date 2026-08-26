package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Regional branch entity (Cochabamba, La Paz, El Alto, Cobija).
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sedes")
@Getter
@Setter
@NoArgsConstructor
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String departamento;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    public Sede(String codigo, String nombre, String departamento) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.departamento = departamento;
        this.activo = true;
        this.creadoEn = OffsetDateTime.now();
    }
}
