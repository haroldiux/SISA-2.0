package bo.edu.unitepc.sisa.api.response;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * User summary response DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuUserResponse {
    private Long id;
    private String username;
    private String email;
    private RolUsuario role;
    private Long sedeId;
    private String sedeNombre;
    private String nombres;
    private String apellidos;
    private String nombreCompleto;
}
