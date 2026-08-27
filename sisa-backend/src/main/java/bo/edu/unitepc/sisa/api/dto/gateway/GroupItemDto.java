package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic class group from UNITEPC Gateway.
 *
 * @param id Unique identifier
 * @param name Group name/code (e.g., G1, G2)
 * @param classType Class modality (e.g., TEORICA, PRACTICA, INTEGRAL)
 * @param teacherName Full name of assigned teacher
 * @param teacherCi National ID of assigned teacher
 * @param classroom Assigned classroom (e.g., Aula 302, Lab 104)
 * @param schedule Scheduled time and days (e.g., Lun/Mie 07:30-09:00)
 * @param campus Campus location name
 * @param enrolledStudentsCount Number of enrolled students in group
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GroupItemDto(
        String id,
        String name,
        String classType,
        String teacherName,
        String teacherCi,
        String classroom,
        String schedule,
        String campus,
        Integer enrolledStudentsCount
) {}
