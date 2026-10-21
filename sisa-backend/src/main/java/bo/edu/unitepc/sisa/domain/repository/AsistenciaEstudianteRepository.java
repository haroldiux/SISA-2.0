package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.AsistenciaEstudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for individual student attendance marks.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface AsistenciaEstudianteRepository extends JpaRepository<AsistenciaEstudiante, Long> {

    List<AsistenciaEstudiante> findBySesionId(Long sesionId);

    @Query("SELECT ae FROM AsistenciaEstudiante ae JOIN ae.sesion s " +
           "WHERE s.materiaCodigo = :materiaCodigo AND s.gestionCodigo = :gestionCodigo")
    List<AsistenciaEstudiante> findByMateriaAndGestion(
            @Param("materiaCodigo") String materiaCodigo,
            @Param("gestionCodigo") String gestionCodigo);
}
