package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.UsuarioAsignacionAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Data JPA repository for UsuarioAsignacionAcademica entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface UsuarioAsignacionAcademicaRepository extends JpaRepository<UsuarioAsignacionAcademica, Long> {

    List<UsuarioAsignacionAcademica> findByUsuarioId(Long usuarioId);

    @Modifying
    @Transactional
    void deleteByUsuarioId(Long usuarioId);
}
