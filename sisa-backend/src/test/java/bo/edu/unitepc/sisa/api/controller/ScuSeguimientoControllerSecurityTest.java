package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.infrastructure.security.JwtTokenProvider;
import bo.edu.unitepc.sisa.infrastructure.security.ScuJwtAuthenticationFilter;
import bo.edu.unitepc.sisa.infrastructure.security.ScuUserDetailsService;
import bo.edu.unitepc.sisa.infrastructure.security.SecurityConfig;
import bo.edu.unitepc.sisa.service.command.ScuGetMateriaAuditoriaCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetSeguimientoSesionCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetSemaforoCarreraCmd;
import bo.edu.unitepc.sisa.service.command.ScuSaveSeguimientoClaseCmd;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security and role-based access control tests for {@link ScuSeguimientoController}.
 * Verifies that:
 * - Anonymous requests are denied.
 * - Docente and Admin are authorized for session tracking.
 * - Directors and Admins are authorized for traffic light dashboard.
 * - Docente is forbidden (HTTP 403) from accessing career-level traffic light.
 *
 * @author GentleAI SISA Architecture Team
 */
@WebMvcTest(controllers = {ScuSeguimientoController.class})
@Import({SecurityConfig.class, ScuSeguimientoControllerSecurityTest.JwtFilterTestConfig.class})
class ScuSeguimientoControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private ScuUserDetailsService userDetailsService;

    @MockBean
    private ScuSaveSeguimientoClaseCmd saveSeguimientoCmd;

    @MockBean
    private ScuGetSeguimientoSesionCmd getSeguimientoSesionCmd;

    @MockBean
    private ScuGetMateriaAuditoriaCmd getMateriaAuditoriaCmd;

    @MockBean
    private ScuGetSemaforoCarreraCmd getSemaforoCarreraCmd;

    @Test
    @DisplayName("Rutas de seguimiento rechazan peticiones anónimas no autenticadas")
    void shouldRejectAnonymousRequests() throws Exception {
        for (String path : Arrays.asList(
                "/api/v1/seguimiento/sesion/10",
                "/api/v1/seguimiento/materia/SIS-213",
                "/api/v1/seguimiento/semaforo-carrera/CARSIS")) {
            this.mockMvc.perform(get(path))
                    .andExpect(result -> {
                        int code = result.getResponse().getStatus();
                        assertTrue(code == 401 || code == 403,
                                "Esperado 401 o 403 para petición anónima a " + path + " pero fue " + code);
                    });
        }
    }

    @Test
    @DisplayName("POST /sesion autoriza ROLE_DOCENTE y ROLE_ADMIN")
    void shouldAuthorizeDocenteAndAdminForSaveSeguimiento() throws Exception {
        Method method = getMethodByName(ScuSeguimientoController.class, "saveSeguimiento");
        PreAuthorize preAuth = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuth != null, "saveSeguimiento debe tener @PreAuthorize");
        assertTrue(preAuth.value().contains("ROLE_DOCENTE"));
        assertTrue(preAuth.value().contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("GET /semaforo-carrera autoriza directores y administradores pero excluye DOCENTE")
    void shouldAuthorizeDirectorsForSemaforoAndExcludeDocente() throws Exception {
        Method method = getMethodByName(ScuSeguimientoController.class, "getSemaforoCarrera");
        PreAuthorize preAuth = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuth != null, "getSemaforoCarrera debe tener @PreAuthorize");
        assertTrue(preAuth.value().contains("ROLE_DIR_CARRERA"));
        assertTrue(preAuth.value().contains("ROLE_DIR_ACADEMICA"));
        assertTrue(preAuth.value().contains("ROLE_ADMIN"));
        assertFalse(preAuth.value().contains("ROLE_DOCENTE"), "DOCENTE no debe tener acceso a semáforo de carrera");
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    @DisplayName("DOCENTE recibe HTTP 403 Forbidden al consultar semáforo general de carrera")
    void shouldForbidDocenteFromAccessingSemaforoCarrera() throws Exception {
        this.mockMvc.perform(get("/api/v1/seguimiento/semaforo-carrera/CARSIS"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DIR_CARRERA")
    @DisplayName("DIR_CARRERA tiene acceso permitido a semáforo de carrera")
    void shouldAllowDirCarreraToAccessSemaforoCarrera() throws Exception {
        this.mockMvc.perform(get("/api/v1/seguimiento/semaforo-carrera/CARSIS"))
                .andExpect(status().isOk());
    }

    private static Method getMethodByName(Class<?> clazz, String methodName) {
        for (Method m : clazz.getDeclaredMethods()) {
            if (m.getName().equals(methodName)) {
                return m;
            }
        }
        throw new NoSuchMethodError("Método no encontrado: " + methodName + " en " + clazz.getName());
    }

    @TestConfiguration
    static class JwtFilterTestConfig {
        @Bean
        ScuJwtAuthenticationFilter scuJwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
            return new ScuJwtAuthenticationFilter(jwtTokenProvider);
        }
    }
}
