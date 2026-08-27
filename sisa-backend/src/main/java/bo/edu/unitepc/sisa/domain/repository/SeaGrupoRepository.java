package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SeaGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeaGrupoRepository extends JpaRepository<SeaGrupo, String> {
    List<SeaGrupo> findByMateriaId(String materiaId);
    List<SeaGrupo> findByDocenteCi(String docenteCi);
}

