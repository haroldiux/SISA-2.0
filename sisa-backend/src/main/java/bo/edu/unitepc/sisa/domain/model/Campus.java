package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * University physical campus branch entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "campus")
@Getter
@Setter
@NoArgsConstructor
public class Campus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(nullable = false)
    private Boolean activo = true;

    public Campus(Sede sede, String nombre, String direccion) {
        this.sede = sede;
        this.nombre = nombre;
        this.direccion = direccion;
        this.activo = true;
    }
}
