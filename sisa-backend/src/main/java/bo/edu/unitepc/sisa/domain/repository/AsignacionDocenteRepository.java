package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

/**
 * Spring Data JPA repository for AsignacionDocente entity with collision detection query.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface AsignacionDocenteRepository
        extends JpaRepository<AsignacionDocente, Long>, JpaSpecificationExecutor<AsignacionDocente> {

    List<AsignacionDocente> findByGestionIdAndDocenteId(Long gestionId, Long docenteId);

    List<AsignacionDocente> findByDocenteId(Long docenteId);

    List<AsignacionDocente> findByGestionIdAndCarreraId(Long gestionId, Long carreraId);

    @Query("SELECT a FROM AsignacionDocente a WHERE a.gestion.id = :gestionId AND a.docente.id = :docenteId " +
           "AND a.diasSemana = :diasSemana " +
           "AND ((a.horarioInicio < :horarioFin AND a.horarioFin > :horarioInicio)) " +
           "AND (:excludeId IS NULL OR a.id <> :excludeId)")
    List<AsignacionDocente> findOverlappingAssignments(
            @Param("gestionId") Long gestionId,
            @Param("docenteId") Long docenteId,
            @Param("diasSemana") String diasSemana,
            @Param("horarioInicio") LocalTime horarioInicio,
            @Param("horarioFin") LocalTime horarioFin,
            @Param("excludeId") Long excludeId
    );

    @Query("SELECT a FROM AsignacionDocente a WHERE a.campus.id = :campusId AND a.aula = :aula " +
           "AND a.diasSemana LIKE %:dia% AND :hora BETWEEN a.horarioInicio AND a.horarioFin")
    List<AsignacionDocente> findActiveClassesInRoom(
            @Param("campusId") Long campusId,
            @Param("aula") String aula,
            @Param("dia") String dia,
            @Param("hora") LocalTime hora
    );
}
