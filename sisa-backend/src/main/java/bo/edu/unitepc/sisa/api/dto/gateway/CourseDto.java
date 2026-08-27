package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic course / subject (Materia) from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param code Course code (e.g., SIS-213)
 * @param name Course name (e.g., PROGRAMACIÓN III)
 * @param semester Academic semester level (e.g., 1 to 10)
 * @param syllabusCourseId ID of the syllabus course if linked
 * @param careerCode Associated career code
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CourseDto(
        String id,
        String code,
        String name,
        Integer semester,
        String syllabusCourseId,
        String careerCode
) {}
