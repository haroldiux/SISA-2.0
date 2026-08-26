package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Multi-Tenant Sede isolation context.
 *
 * @author GentleAI SISA Architecture Team
 */
public class MultiTenantSedeSecurityTest {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Regional Director context should isolate to assigned Sede ID")
    void shouldScopeToRegionalSede() {
        TenantInfo regionalTenant = TenantInfo.builder()
                .userId(10L)
                .username("dir.cbb")
                .rol(RolUsuario.ROLE_DIR_CARRERA)
                .sedeId(1L)
                .build();

        TenantContext.setTenantInfo(regionalTenant);

        assertNotNull(TenantContext.getTenantInfo());
        assertEquals(1L, TenantContext.getCurrentSedeId());
        assertFalse(TenantContext.getTenantInfo().isNationalScope());
    }

    @Test
    @DisplayName("National Vice-Rector context should have national cross-sede scope")
    void shouldHaveNationalScope() {
        TenantInfo nationalTenant = TenantInfo.builder()
                .userId(1L)
                .username("vicerrector.nacional")
                .rol(RolUsuario.ROLE_VICERRECTOR_NACIONAL)
                .sedeId(null)
                .build();

        TenantContext.setTenantInfo(nationalTenant);

        assertNotNull(TenantContext.getTenantInfo());
        assertNull(TenantContext.getCurrentSedeId());
        assertTrue(TenantContext.getTenantInfo().isNationalScope());
    }
}
