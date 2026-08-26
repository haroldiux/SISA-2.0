package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.ProgramaAnalitico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for ProgramaAnalitico entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface ProgramaAnaliticoRepository
        extends JpaRepository<ProgramaAnalitico, Long>, JpaSpecificationExecutor<ProgramaAnalitico> {

    Optional<ProgramaAnalitico> findByAsignacionId(Long asignacionId);
}
