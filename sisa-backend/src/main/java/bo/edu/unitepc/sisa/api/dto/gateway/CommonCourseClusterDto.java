package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * DTO representing a clustered academic offering for a teacher across multiple careers.
 * Enables single-point ingestion and deduplicated planning for common subjects.
 *
 * @author GentleAI SISA Architecture Team
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CommonCourseClusterDto(
        String clusterKey,
        Long asignaturaId,
        String courseCode,
        String courseName,
        boolean isCommon,
        List<CareerDto> associatedCareers,
        List<Long> asignacionIds
) {}
