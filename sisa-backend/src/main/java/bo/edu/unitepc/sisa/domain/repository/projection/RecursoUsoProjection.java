package bo.edu.unitepc.sisa.domain.repository.projection;

/**
 * Proyeccion nativa SQL para el histograma de recursos didacticos utilizados.
 *
 * @author GentleAI SISA Architecture Team
 */
public interface RecursoUsoProjection {

    String getRecurso();

    Long getUsos();
}
