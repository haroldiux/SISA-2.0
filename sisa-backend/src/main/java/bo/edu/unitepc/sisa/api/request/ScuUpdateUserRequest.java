package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request payload for updating an existing user by an administrator.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuUpdateUserRequest {

    private String nombreCompleto;

    private String email;

    private RolUsuario rol;

    @JsonProperty("activo")
    private Boolean activo;

    @JsonProperty("isActive")
    public void setIsActive(Boolean isActive) {
        if (isActive != null) {
            this.activo = isActive;
        }
    }

    @JsonProperty("isActive")
    public Boolean getIsActive() {
        return this.activo;
    }

    private List<AcademicaAsignacionDto> asignaciones;
}
