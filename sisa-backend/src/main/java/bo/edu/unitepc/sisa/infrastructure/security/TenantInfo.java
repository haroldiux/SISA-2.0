package bo.edu.unitepc.sisa.infrastructure.security;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Tenant execution context information holding current user Sede and Carrera scopes.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantInfo {
    private Long userId;
    private String username;
    private RolUsuario rol;
    private Long sedeId;
    private List<Long> carreraIds;

    public boolean isNationalScope() {
        return RolUsuario.ROLE_VICERRECTOR_NACIONAL.equals(this.rol) || this.sedeId == null;
    }
}
