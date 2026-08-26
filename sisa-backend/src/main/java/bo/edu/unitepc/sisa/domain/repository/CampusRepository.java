package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for Campus entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface CampusRepository extends JpaRepository<Campus, Long> {
    List<Campus> findBySedeId(Long sedeId);
}
