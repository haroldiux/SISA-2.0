package bo.edu.unitepc.sisa.api.dto;

/**
 * Data transfer record representing cumulative semester attendance metrics for a single student.
 *
 * @author GentleAI SISA Architecture Team
 */
public record AsistenciaEstudianteResumenDto(
        String estudianteCodigo,
        String estudianteNombre,
        String carreraCodigo,
        String carreraNombre,
        int totalSesiones,
        int presentes,
        int faltas,
        int atrasos,
        int licencias,
        double porcentajeAsistencia,
        boolean cumpleNormativa80Pct
) {}
