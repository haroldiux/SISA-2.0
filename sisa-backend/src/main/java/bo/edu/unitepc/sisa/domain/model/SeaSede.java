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
 * Local mirror entity for UNITEPC SEA Gateway Branch Offices (Sedes).
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sea_sedes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeaSede {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;
}
