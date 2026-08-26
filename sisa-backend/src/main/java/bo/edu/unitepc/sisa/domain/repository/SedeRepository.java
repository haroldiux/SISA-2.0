package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Sede entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
    Optional<Sede> findByCodigo(String codigo);
}
