package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Academic career / department entity (e.g. Medicina, Sistemas).
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "carreras")
@Getter
@Setter
@NoArgsConstructor
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String facultad;

    @Column(nullable = false)
    private Boolean activo = true;

    public Carrera(String codigo, String nombre, String facultad) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.facultad = facultad;
        this.activo = true;
    }
}
