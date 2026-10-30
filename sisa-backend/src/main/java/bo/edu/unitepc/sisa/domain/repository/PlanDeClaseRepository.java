package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for PlanDeClase entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface PlanDeClaseRepository
        extends JpaRepository<PlanDeClase, Long>, JpaSpecificationExecutor<PlanDeClase> {

    Optional<PlanDeClase> findBySesionId(Long sesionId);

    @Query(value = """
        SELECT COUNT(pc.id)
        FROM planes_clase pc
        JOIN sesiones_matriz7 sm ON pc.sesion_id = sm.id
        JOIN pacs p ON sm.pac_id = p.id
        JOIN asignaciones_docentes ad ON p.asignacion_id = ad.id
        JOIN asignaturas a ON ad.asignatura_id = a.id
        WHERE a.codigo = :materiaCodigo
        """, nativeQuery = true)
    long countPlanesByMateriaCodigo(@Param("materiaCodigo") String materiaCodigo);
}
