package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.EstadoGestion;
import bo.edu.unitepc.sisa.domain.model.Gestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Gestion entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface GestionRepository extends JpaRepository<Gestion, Long> {
    Optional<Gestion> findByCodigo(String codigo);
    List<Gestion> findByEstado(EstadoGestion estado);
}
