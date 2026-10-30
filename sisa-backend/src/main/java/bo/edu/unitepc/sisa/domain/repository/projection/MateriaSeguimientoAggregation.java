package bo.edu.unitepc.sisa.domain.repository.projection;

/**
 * Proyeccion nativa SQL para agregacion masiva de seguimiento por asignatura y carrera.
 *
 * @author GentleAI SISA Architecture Team
 */
public interface MateriaSeguimientoAggregation {

    String getMateriaCodigo();

    Long getTotalSesionesRegistradas();

    Double getPuntajeTotal();

    Long getCountInicio();

    Long getCountDesarrollo();

    Long getCountCierre();
}
