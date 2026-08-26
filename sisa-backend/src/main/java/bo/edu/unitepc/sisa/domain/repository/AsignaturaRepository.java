package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Asignatura entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface AsignaturaRepository extends JpaRepository<Asignatura, Long> {
    Optional<Asignatura> findByCodigo(String codigo);
    List<Asignatura> findByCarreraId(Long carreraId);
    List<Asignatura> findByCarreraIdAndSemestre(Long carreraId, Integer semestre);
}
