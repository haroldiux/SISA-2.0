package bo.edu.unitepc.sisa.infrastructure.security;

import bo.edu.unitepc.sisa.api.controller.ScuOfficeController;
import bo.edu.unitepc.sisa.api.controller.ScuPlanningController;
import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPacReviewRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.service.command.ScuExportPacXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportPlanClasesXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportProgramaDocxCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetPacCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetPlanClaseCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetProgramaAnaliticoCmd;
import bo.edu.unitepc.sisa.service.command.ScuListDocenteAsignacionesCmd;
import bo.edu.unitepc.sisa.service.command.ScuReviewPacCmd;
import bo.edu.unitepc.sisa.service.command.ScuSavePacCmd;
import bo.edu.unitepc.sisa.service.command.ScuSavePlanClaseCmd;
import bo.edu.unitepc.sisa.service.command.ScuSaveProgramaAnaliticoCmd;
import bo.edu.unitepc.sisa.service.command.ScuSubmitPacCmd;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP-chain and method-security regression tests for planning and Office endpoints.
 *
 * @author GentleAI SISA Architecture Team
 */
@WebMvcTest(controllers = {ScuPlanningController.class, ScuOfficeController.class})
@Import({SecurityConfig.class, SecurityEndpointAccessTest.JwtFilterTestConfig.class})
class SecurityEndpointAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private ScuUserDetailsService userDetailsService;

    @MockBean
    private ScuSavePacCmd savePacCmd;
    @MockBean
    private ScuGetPacCmd getPacCmd;
    @MockBean
    private ScuReviewPacCmd reviewPacCmd;
    @MockBean
    private ScuSubmitPacCmd submitPacCmd;
    @MockBean
    private ScuSaveProgramaAnaliticoCmd saveProgramaCmd;
    @MockBean
    private ScuGetProgramaAnaliticoCmd getProgramaCmd;
    @MockBean
    private ScuSavePlanClaseCmd savePlanClaseCmd;
    @MockBean
    private ScuGetPlanClaseCmd getPlanClaseCmd;
    @MockBean
    private ScuListDocenteAsignacionesCmd listDocenteAsignacionesCmd;
    @MockBean
    private ScuExportPacXlsxCmd exportPacCmd;
    @MockBean
    private ScuExportPlanClasesXlsxCmd exportPlanClasesCmd;
    @MockBean
    private ScuExportProgramaDocxCmd exportProgramaCmd;
    @MockBean
    private bo.edu.unitepc.sisa.infrastructure.office.PacExcelParser pacExcelParser;
    @MockBean
    private bo.edu.unitepc.sisa.infrastructure.office.PlanesClaseExcelParser planesClaseParser;
    @MockBean
    private bo.edu.unitepc.sisa.infrastructure.office.ProgramaAnaliticoDocxParser programaParser;
    @MockBean
    private bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory parserFactory;

    @Test
    @DisplayName("Planning and Office canonical and legacy aliases reject anonymous requests")
    void shouldRequireAuthenticationForPlanningAndOfficeAliases() throws Exception {
        for (String path : Arrays.asList(
                "/api/v1/planificaciones/pac/1",
                "/api/v1/system/planning/pac/1",
                "/api/v1/office/export/pac/1",
                "/api/v1/system/office/export/pac/1")) {
            this.mockMvc.perform(get(path)).andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Planning writes and Office imports declare DOCENTE or ADMIN authority")
    void shouldRestrictPlanningWritesAndOfficeImportsToDocenteOrAdmin() throws Exception {
        assertDocenteOrAdmin(ScuPlanningController.class.getMethod("savePac", ScuPacRequest.class));
        assertDocenteOrAdmin(ScuPlanningController.class.getMethod(
                "submitPacById", Long.class));
        assertDocenteOrAdmin(ScuPlanningController.class.getMethod(
                "saveProgramaAnalitico", ScuProgramaAnaliticoRequest.class));
        assertDocenteOrAdmin(ScuPlanningController.class.getMethod("savePlanClase", ScuPlanClaseRequest.class));
        assertDocenteOrAdmin(ScuOfficeController.class.getMethod(
                "importCronograma", org.springframework.web.multipart.MultipartFile.class,
                String.class, String.class, Long.class));
        assertDocenteOrAdmin(ScuOfficeController.class.getMethod(
                "importPac", org.springframework.web.multipart.MultipartFile.class,
                String.class, String.class, Long.class));
        assertDocenteOrAdmin(ScuOfficeController.class.getMethod(
                "importPlanesClase", org.springframework.web.multipart.MultipartFile.class,
                String.class, String.class, Long.class, Long.class));
        assertDocenteOrAdmin(ScuOfficeController.class.getMethod(
                "importPrograma", org.springframework.web.multipart.MultipartFile.class, Long.class));
    }

    @Test
    @DisplayName("PAC review includes all director roles and ADMIN")
    void shouldAuthorizeDirectorsAndAdminToReviewPac() throws Exception {
        PreAuthorize preAuthorize = ScuPlanningController.class.getMethod(
                "reviewPac", Long.class, ScuPacReviewRequest.class).getAnnotation(PreAuthorize.class);

        assertTrue(preAuthorize.value().contains("ROLE_DIR_CARRERA"));
        assertTrue(preAuthorize.value().contains("ROLE_DIR_ACADEMICA"));
        assertTrue(preAuthorize.value().contains("ROLE_VICERRECTOR_SEDE"));
        assertTrue(preAuthorize.value().contains("ROLE_VICERRECTOR_NACIONAL"));
        assertTrue(preAuthorize.value().contains("ROLE_ADMIN"));
    }

    private static void assertDocenteOrAdmin(Method method) {
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuthorize != null, () -> method.getName() + " must declare @PreAuthorize");
        assertTrue(preAuthorize.value().contains("ROLE_DOCENTE"));
        assertTrue(preAuthorize.value().contains("ROLE_ADMIN"));
    }

    @TestConfiguration
    static class JwtFilterTestConfig {

        @Bean
        ScuJwtAuthenticationFilter scuJwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
            return new ScuJwtAuthenticationFilter(jwtTokenProvider);
        }
    }
}
