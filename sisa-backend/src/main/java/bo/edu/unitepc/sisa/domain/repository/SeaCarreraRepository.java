package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SeaCarrera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeaCarreraRepository extends JpaRepository<SeaCarrera, String> {
    List<SeaCarrera> findBySedeCodigo(String sedeCodigo);
    Optional<SeaCarrera> findByCodigoAndSedeCodigo(String codigo, String sedeCodigo);
    Optional<SeaCarrera> findByCodigo(String codigo);
}
