package bo.edu.unitepc.sisa.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing an enrolled student item from UNITEPC Gateway.
 * Fully compatible with both standard format (id, code, names) and SEA Gateway native format (studentCode, fullName).
 *
 * @param id Unique identifier
 * @param code Student institutional code / registration number
 * @param studentCode Student code as returned directly from SEA Gateway
 * @param fullName Student full name as returned from SEA Gateway
 * @param firstName Student first name(s)
 * @param firstLastName Student primary paternal last name
 * @param secondLastName Student secondary maternal last name
 * @param courseState Enrollment state (e.g. CURSANDO)
 * @param groupId Associated group UUID
 * @param syllabusCourseId Associated syllabus course UUID
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record StudentItemDto(
        @JsonAlias({"id", "studentCode", "code"}) @JsonProperty("id") String id,
        @JsonAlias({"code", "studentCode", "id"}) @JsonProperty("code") String code,
        @JsonAlias({"studentCode", "code", "id"}) @JsonProperty("studentCode") String studentCode,
        @JsonAlias({"fullName", "nombreCompleto", "nombre"}) @JsonProperty("fullName") String fullName,
        @JsonProperty("firstName") String firstName,
        @JsonProperty("firstLastName") String firstLastName,
        @JsonProperty("secondLastName") String secondLastName,
        @JsonProperty("courseState") String courseState,
        @JsonProperty("groupId") String groupId,
        @JsonProperty("syllabusCourseId") String syllabusCourseId
) {
    public StudentItemDto {
        // Normalize student identifier
        if (code == null && studentCode != null) {
            code = studentCode;
        } else if (code == null && id != null) {
            code = id;
        }
        if (studentCode == null && code != null) {
            studentCode = code;
        }
        if (id == null && code != null) {
            id = code;
        }

        // Normalize student display full name
        if ((fullName == null || fullName.isBlank()) && (firstName != null || firstLastName != null)) {
            String fl = firstLastName != null ? firstLastName.trim() : "";
            String sl = secondLastName != null ? secondLastName.trim() : "";
            String fn = firstName != null ? firstName.trim() : "";
            fullName = (fl + " " + sl + " " + fn).trim();
        }
    }
}
