package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.EstadoReincidencia;
import bo.edu.unitepc.sisa.domain.enums.NivelReincidencia;
import bo.edu.unitepc.sisa.domain.model.ReincidenciaDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for ReincidenciaDocente entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface ReincidenciaDocenteRepository
        extends JpaRepository<ReincidenciaDocente, Long>, JpaSpecificationExecutor<ReincidenciaDocente> {

    List<ReincidenciaDocente> findByDocenteIdAndGestionId(Long docenteId, Long gestionId);

    List<ReincidenciaDocente> findByGestionIdAndNivel(Long gestionId, NivelReincidencia nivel);

    List<ReincidenciaDocente> findByGestionIdAndEstado(Long gestionId, EstadoReincidencia estado);

    @Query("SELECT COUNT(r) FROM ReincidenciaDocente r WHERE r.docente.id = :docenteId AND r.gestion.id = :gestionId")
    int countInfraccionesByDocenteAndGestion(
            @Param("docenteId") Long docenteId,
            @Param("gestionId") Long gestionId
    );

    @Query("SELECT r FROM ReincidenciaDocente r WHERE r.docente.sede.id = :sedeId AND r.gestion.id = :gestionId")
    List<ReincidenciaDocente> findBySedeAndGestion(
            @Param("sedeId") Long sedeId,
            @Param("gestionId") Long gestionId
    );
}
