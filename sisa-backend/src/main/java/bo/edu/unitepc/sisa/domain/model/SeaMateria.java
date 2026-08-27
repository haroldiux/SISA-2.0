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
 * Local mirror entity for UNITEPC SEA Gateway Courses / Subjects (Materias).
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "sea_materias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeaMateria {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false)
    private Short semestre = 1;

    @Column(name = "syllabus_course_id", length = 64)
    private String syllabusCourseId;

    @Column(name = "carrera_id", length = 64)
    private String carreraId;
}
