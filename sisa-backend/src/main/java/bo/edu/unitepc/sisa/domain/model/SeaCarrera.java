package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Local mirror entity for UNITEPC SEA Gateway Careers.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sea_carreras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeaCarrera {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "sede_codigo", length = 20)
    private String sedeCodigo;
}
