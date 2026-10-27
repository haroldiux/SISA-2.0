package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SeaGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeaGrupoRepository extends JpaRepository<SeaGrupo, String> {
    List<SeaGrupo> findByMateriaId(String materiaId);
    List<SeaGrupo> findByDocenteCi(String docenteCi);

    @Query("SELECT g FROM SeaGrupo g WHERE g.docenteCi = :ci OR g.docenteCi LIKE CONCAT(:ci, '-%') OR :ci LIKE CONCAT(g.docenteCi, '-%')")
    List<SeaGrupo> findByDocenteCiFlexible(@Param("ci") String ci);
}

