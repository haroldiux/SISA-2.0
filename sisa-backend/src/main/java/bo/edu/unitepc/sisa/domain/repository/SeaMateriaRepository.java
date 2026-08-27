package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SeaMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeaMateriaRepository extends JpaRepository<SeaMateria, String> {
    List<SeaMateria> findByCarreraId(String carreraId);
    Optional<SeaMateria> findByCodigo(String codigo);
}
