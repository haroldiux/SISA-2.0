package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO representing an academic class group from UNITEPC Gateway.
 * Supports bidirectional mapping of documented and live Gateway API payload fields.
 *
 * @author GentleAI SISA Architecture Team
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GroupItemDto(
        @JsonAlias({"groupId", "id"})
        String id,

        @JsonAlias({"code", "name"})
        String name,

        @JsonAlias({"classType"})
        String classType,

        @JsonAlias({"teacherFullName", "teacherName"})
        String teacherName,

        @JsonAlias({"teacherIdentityNumber", "teacherCi"})
        String teacherCi,

        @JsonAlias({"classroom"})
        String classroom,

        @JsonAlias({"schedule"})
        String schedule,

        @JsonAlias({"campus"})
        String campus,

        @JsonAlias({"courseName"})
        String courseName,

        @JsonAlias({"careerCode"})
        String careerCode,

        @JsonAlias({"syllabusCourseId", "materiaId"})
        String syllabusCourseId,

        @JsonAlias({"enrolledStudentsCount"})
        Integer enrolledStudentsCount,

        @JsonAlias({"schedules"})
        java.util.List<ScheduleSlotDto> schedules
) {
    public GroupItemDto(String id, String name, String classType, String teacherName, String teacherCi, String classroom, String schedule, String campus, Integer enrolledStudentsCount) {
        this(id, name, classType, teacherName, teacherCi, classroom, schedule, campus, null, null, null, enrolledStudentsCount, java.util.Collections.emptyList());
    }

    public GroupItemDto {
        if ((schedule == null || schedule.isBlank()) && schedules != null && !schedules.isEmpty()) {
            schedule = schedules.stream()
                    .map(s -> (s.day() != null ? s.day() : "") + " " + (s.startTime() != null ? s.startTime() : "") + "-" + (s.endTime() != null ? s.endTime() : ""))
                    .filter(str -> !str.trim().isEmpty())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse(null);
        }
        if ((classroom == null || classroom.isBlank()) && schedules != null && !schedules.isEmpty()) {
            classroom = schedules.get(0).classroom();
        }
        if ((campus == null || campus.isBlank()) && schedules != null && !schedules.isEmpty()) {
            campus = schedules.get(0).campus();
        }
    }
}

