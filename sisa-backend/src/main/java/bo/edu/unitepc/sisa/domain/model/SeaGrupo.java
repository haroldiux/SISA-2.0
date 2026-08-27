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
 * Local mirror entity for UNITEPC SEA Gateway Class Groups.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sea_grupos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeaGrupo {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "codigo_grupo", nullable = false, length = 20)
    private String codigoGrupo;

    @Column(name = "tipo_clase", nullable = false, length = 20)
    private String tipoClase = "TEORICA";

    @Column(name = "docente_nombre", nullable = false, length = 150)
    private String docenteNombre;

    @Column(name = "docente_ci", length = 30)
    private String docenteCi;

    @Column(length = 80)
    private String horario;

    @Column(length = 50)
    private String aula;

    @Column(length = 100)
    private String campus;

    @Column(name = "materia_id", length = 64)
    private String materiaId;
}
