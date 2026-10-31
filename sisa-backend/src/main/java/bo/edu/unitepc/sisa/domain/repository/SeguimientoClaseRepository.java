package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.domain.model.SeguimientoClase;
import bo.edu.unitepc.sisa.domain.repository.projection.MateriaSeguimientoAggregation;
import bo.edu.unitepc.sisa.domain.repository.projection.RecursoUsoProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for SeguimientoClase entity with high-performance native queries.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface SeguimientoClaseRepository extends JpaRepository<SeguimientoClase, Long> {

    Optional<SeguimientoClase> findBySesionMatriz7Id(Long sesionMatriz7Id);

    Optional<SeguimientoClase> findByMateriaCodigoAndFechaEjecucionAndTipoClaseAndComision(
            String materiaCodigo,
            LocalDate fechaEjecucion,
            TipoSesion tipoClase,
            String comision
    );

    List<SeguimientoClase> findByMateriaCodigoOrderByFechaEjecucionAsc(String materiaCodigo);

    /**
     * Agregacion masiva para calculo instantaneo del semaforo curricular (Cero problema N+1).
     * Devuelve en una sola consulta: codigo materia, cantidad sesiones, suma de puntaje,
     * total momentos inicio, desarrollo y cierre cumplidos.
     */
    @Query(value = """
        SELECT 
            s.materia_codigo AS materiaCodigo,
            COUNT(s.id) AS totalSesionesRegistradas,
            COALESCE(SUM(s.cumplimiento_score), 0.0) AS puntajeTotal,
            COALESCE(SUM(CASE WHEN s.momento_inicio_cumplido THEN 1 ELSE 0 END), 0) AS countInicio,
            COALESCE(SUM(CASE WHEN s.momento_desarrollo_cumplido THEN 1 ELSE 0 END), 0) AS countDesarrollo,
            COALESCE(SUM(CASE WHEN s.momento_cierre_cumplido THEN 1 ELSE 0 END), 0) AS countCierre
        FROM seguimientos_clases s
        WHERE (s.carrera_codigo = :carreraCodigo 
           OR (:carreraCodigo = 'SIS' AND s.carrera_codigo = 'CARSIS')
           OR (:carreraCodigo = 'CARSIS' AND s.carrera_codigo = 'SIS'))
        GROUP BY s.materia_codigo
        """, nativeQuery = true)
    List<MateriaSeguimientoAggregation> aggregateByCarrera(@Param("carreraCodigo") String carreraCodigo);

    /**
     * Proyeccion de agregacion de recursos didacticos utilizados.
     */
    @Query(value = """
        SELECT elem AS recurso, COUNT(*) AS usos
        FROM seguimientos_clases s,
        jsonb_array_elements_text(s.recursos_utilizados) AS elem
        WHERE s.materia_codigo = :materiaCodigo
        GROUP BY elem
        ORDER BY usos DESC
        LIMIT 10
        """, nativeQuery = true)
    List<RecursoUsoProjection> getRecursosHistogramaByMateria(@Param("materiaCodigo") String materiaCodigo);
}
