package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.Pac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for PAC entity with Sede/Carrera multi-tenant queries.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface PacRepository extends JpaRepository<Pac, Long>, JpaSpecificationExecutor<Pac> {

    Optional<Pac> findByAsignacionId(Long asignacionId);

    List<Pac> findByEstado(EstadoPlanificacion estado);

    @Query("SELECT p FROM Pac p WHERE p.asignacion.docente.id = :docenteId AND p.asignacion.gestion.id = :gestionId")
    List<Pac> findByDocenteAndGestion(@Param("docenteId") Long docenteId, @Param("gestionId") Long gestionId);

    @Query("SELECT p FROM Pac p WHERE p.asignacion.carrera.id = :carreraId AND p.asignacion.gestion.id = :gestionId")
    List<Pac> findByCarreraAndGestion(@Param("carreraId") Long carreraId, @Param("gestionId") Long gestionId);

    @Query("SELECT p FROM Pac p WHERE p.asignacion.campus.sede.id = :sedeId AND p.asignacion.gestion.id = :gestionId")
    List<Pac> findBySedeAndGestion(@Param("sedeId") Long sedeId, @Param("gestionId") Long gestionId);
}
