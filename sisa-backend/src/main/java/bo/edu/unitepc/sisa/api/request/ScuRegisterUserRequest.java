package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Request payload for registering a new user by an administrator.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuRegisterUserRequest {

    @NotBlank(message = "El CI / Usuario es obligatorio")
    private String ci;

    @NotNull(message = "El rol institucional es obligatorio")
    private RolUsuario rol;

    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;

    private String email;

    @Builder.Default
    @JsonProperty("activo")
    private Boolean activo = true;

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

    @Builder.Default
    private List<AcademicaAsignacionDto> asignaciones = new ArrayList<>();
}
