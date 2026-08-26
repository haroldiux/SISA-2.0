package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for SesionMatriz7 entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface SesionMatriz7Repository extends JpaRepository<SesionMatriz7, Long> {

    List<SesionMatriz7> findByPacIdOrderByNroSesionAsc(Long pacId);

    List<SesionMatriz7> findByPacIdAndSemanaOrderByNroSesionAsc(Long pacId, Integer semana);

    Optional<SesionMatriz7> findByPacIdAndNroSesion(Long pacId, Integer nroSesion);

    Optional<SesionMatriz7> findByPacIdAndFechaProgramada(Long pacId, LocalDate fechaProgramada);
}
