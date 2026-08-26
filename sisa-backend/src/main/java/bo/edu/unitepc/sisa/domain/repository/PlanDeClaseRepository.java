package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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
}
