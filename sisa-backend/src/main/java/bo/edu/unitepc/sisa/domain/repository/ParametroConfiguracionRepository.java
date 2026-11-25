package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.NivelParametro;
import bo.edu.unitepc.sisa.domain.model.ParametroConfiguracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for hierarchical parameter configurations.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface ParametroConfiguracionRepository extends JpaRepository<ParametroConfiguracion, Long> {

    Optional<ParametroConfiguracion> findByNivelAndCodigoAmbito(NivelParametro nivel, String codigoAmbito);

    List<ParametroConfiguracion> findByNivelOrderByCodigoAmbitoAsc(NivelParametro nivel);

    void deleteByNivelAndCodigoAmbito(NivelParametro nivel, String codigoAmbito);
}
