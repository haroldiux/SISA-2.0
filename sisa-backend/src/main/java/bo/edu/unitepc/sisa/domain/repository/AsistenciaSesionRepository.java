package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.AsistenciaSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for class attendance sessions.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface AsistenciaSesionRepository extends JpaRepository<AsistenciaSesion, Long> {

    Optional<AsistenciaSesion> findByMateriaCodigoAndFechaAndTipoClaseAndComision(
            String materiaCodigo, LocalDate fecha, String tipoClase, String comision);

    List<AsistenciaSesion> findByMateriaCodigoAndGestionCodigoOrderByFechaDesc(
            String materiaCodigo, String gestionCodigo);

    @Query("SELECT DISTINCT s FROM AsistenciaSesion s LEFT JOIN FETCH s.estudiantes WHERE s.id = :id")
    Optional<AsistenciaSesion> findByIdWithEstudiantes(@Param("id") Long id);

    @Query("SELECT DISTINCT s FROM AsistenciaSesion s LEFT JOIN FETCH s.estudiantes " +
           "WHERE s.materiaCodigo = :materiaCodigo AND s.fecha = :fecha " +
           "AND s.tipoClase = :tipoClase AND s.comision = :comision")
    Optional<AsistenciaSesion> findByMateriaCodigoAndFechaAndTipoClaseAndComisionWithEstudiantes(
            @Param("materiaCodigo") String materiaCodigo,
            @Param("fecha") LocalDate fecha,
            @Param("tipoClase") String tipoClase,
            @Param("comision") String comision);
}
