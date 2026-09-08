package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for user password update / first-login password rotation.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuChangePasswordRequest {

    private String username;

    private String currentPassword;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    private String newPassword;

    private String confirmPassword;
}
