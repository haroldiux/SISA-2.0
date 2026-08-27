package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SeaSede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeaSedeRepository extends JpaRepository<SeaSede, String> {
    Optional<SeaSede> findByCodigo(String codigo);
}
