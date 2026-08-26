package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.EstadoAuditoria;
import bo.edu.unitepc.sisa.domain.model.AuditoriaInSitu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for AuditoriaInSitu entity with statistical aggregations.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface AuditoriaInSituRepository
        extends JpaRepository<AuditoriaInSitu, Long>, JpaSpecificationExecutor<AuditoriaInSitu> {

    List<AuditoriaInSitu> findByAsignacionId(Long asignacionId);

    List<AuditoriaInSitu> findByAuditorId(Long auditorId);

    List<AuditoriaInSitu> findByEstado(EstadoAuditoria estado);

    @Query("SELECT a FROM AuditoriaInSitu a WHERE a.asignacion.campus.sede.id = :sedeId " +
           "AND a.asignacion.gestion.id = :gestionId ORDER BY a.fechaHoraAuditoria DESC")
    List<AuditoriaInSitu> findBySedeAndGestion(@Param("sedeId") Long sedeId, @Param("gestionId") Long gestionId);

    @Query("SELECT COUNT(a) FROM AuditoriaInSitu a WHERE a.asignacion.campus.sede.id = :sedeId " +
           "AND a.asignacion.gestion.id = :gestionId AND a.estado = :estado")
    long countBySedeGestionAndEstado(
            @Param("sedeId") Long sedeId,
            @Param("gestionId") Long gestionId,
            @Param("estado") EstadoAuditoria estado
    );
}
