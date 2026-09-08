package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.api.request.AcademicaAsignacionDto;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Detailed user response DTO for administrator management views and operations.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuUserDetailResponse {

    private Long id;
    private String username;
    private String ci;
    private String nombreCompleto;
    private String nombres;
    private String apellidos;
    private String email;
    private RolUsuario rol;
    private Boolean activo;
    private Boolean mustChangePassword;
    private OffsetDateTime creadoEn;
    private Long sedeId;
    private String sedeNombre;

    @Builder.Default
    private List<AcademicaAsignacionDto> asignaciones = new ArrayList<>();

    @JsonProperty("isActive")
    public Boolean getIsActive() {
        return this.activo;
    }
}
