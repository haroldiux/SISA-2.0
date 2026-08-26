package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanAccion;
import bo.edu.unitepc.sisa.domain.model.PlanAccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for PlanAccion entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface PlanAccionRepository extends JpaRepository<PlanAccion, Long> {

    Optional<PlanAccion> findByReincidenciaId(Long reincidenciaId);

    List<PlanAccion> findByEstado(EstadoPlanAccion estado);
}
