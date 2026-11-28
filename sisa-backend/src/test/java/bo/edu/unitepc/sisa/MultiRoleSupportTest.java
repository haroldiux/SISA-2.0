package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MultiRoleSupportTest {

    @Test
    void shouldSyncAndPreservePrimaryPlusAdditionalRoles() {
        Usuario user = new Usuario();
        user.syncRoles(
                RolUsuario.ROLE_DIR_CARRERA,
                List.of(RolUsuario.ROLE_DOCENTE, RolUsuario.ROLE_DIR_CARRERA)
        );

        assertEquals(RolUsuario.ROLE_DIR_CARRERA, user.getRol());
        assertEquals(
                List.of(RolUsuario.ROLE_DIR_CARRERA, RolUsuario.ROLE_DOCENTE),
                user.getEffectiveRoles()
        );
        assertTrue(user.hasRole(RolUsuario.ROLE_DIR_CARRERA));
        assertTrue(user.hasRole(RolUsuario.ROLE_DOCENTE));
        assertFalse(user.hasRole(RolUsuario.ROLE_ADMIN));
    }

    @Test
    void shouldEmbedAndExtractMultipleRolesInJwtToken() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(
                provider,
                "jwtSecret",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
        );
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 3600000L);
        ReflectionTestUtils.setField(provider, "jwtRefreshExpirationMs", 7200000L);

        Usuario user = new Usuario();
        user.setId(1469L);
        user.setUsername("5188558");
        user.setEmail("5188558@unitepc.edu.bo");
        user.setNombres("JOSE JAMES");
        user.setApellidos("CLAURE RICALDI");
        user.syncRoles(RolUsuario.ROLE_DIR_CARRERA, List.of(RolUsuario.ROLE_DOCENTE));

        String token = provider.generateAccessToken(user);
        assertTrue(provider.validateToken(token));
        assertEquals(RolUsuario.ROLE_DIR_CARRERA, provider.getRoleFromToken(token));
        assertEquals(
                List.of(RolUsuario.ROLE_DIR_CARRERA, RolUsuario.ROLE_DOCENTE),
                provider.getRolesFromToken(token)
        );
    }

    @Test
    void tenantInfoShouldCheckEffectiveRolesList() {
        TenantInfo tenant = TenantInfo.builder()
                .userId(1469L)
                .username("5188558")
                .rol(RolUsuario.ROLE_DIR_CARRERA)
                .roles(List.of(RolUsuario.ROLE_DIR_CARRERA, RolUsuario.ROLE_DOCENTE))
                .sedeId(1L)
                .build();

        assertTrue(tenant.hasRole(RolUsuario.ROLE_DIR_CARRERA));
        assertTrue(tenant.hasRole(RolUsuario.ROLE_DOCENTE));
        assertFalse(tenant.hasRole(RolUsuario.ROLE_ADMIN));
    }
}
