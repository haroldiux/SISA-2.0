package bo.edu.unitepc.sisa.infrastructure.security;

import bo.edu.unitepc.sisa.api.controller.ScuOfficeController;
import bo.edu.unitepc.sisa.api.controller.ScuPlanningController;
import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPacReviewRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.service.command.ScuBatchReviewPacCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportAsistenciaXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportPacXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportPlanClasesXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportProgramaDocxCmd;
import bo.edu.unitepc.sisa.service.command.ScuGetPacByCarreraCmd;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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
    private ScuGetPacByCarreraCmd getPacByCarreraCmd;
    @MockBean
    private ScuReviewPacCmd reviewPacCmd;
    @MockBean
    private ScuBatchReviewPacCmd batchReviewPacCmd;
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
    private ScuExportAsistenciaXlsxCmd exportAsistenciaCmd;
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
                "/api/v1/planificaciones/pac/by-carrera/2",
                "/api/v1/system/planning/pac/by-carrera/2")) {
            this.mockMvc.perform(get(path)).andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Master planning writes and Office imports declare DIR_CARRERA and ADMIN, excluding DOCENTE")
    void shouldRestrictMasterPlanningWritesAndOfficeImportsToDirectorOrAdmin() throws Exception {
        assertDirectorOrAdminExcludesDocente(getMethodByName(ScuPlanningController.class, "savePac"));
        assertDirectorOrAdminExcludesDocente(getMethodByName(ScuPlanningController.class, "submitPacById"));
        assertDirectorOrAdminExcludesDocente(getMethodByName(ScuPlanningController.class, "saveProgramaAnalitico"));
        assertDirectorOrAdminExcludesDocente(getMethodByName(ScuOfficeController.class, "importCronograma"));
        assertDirectorOrAdminExcludesDocente(getMethodByName(ScuOfficeController.class, "importPac"));
        assertDirectorOrAdminExcludesDocente(getMethodByName(ScuOfficeController.class, "importPrograma"));
    }

    @Test
    @DisplayName("Personal class plans management authorizes DOCENTE")
    void shouldAuthorizeDocenteToManagePersonalPlanes() throws Exception {
        assertContainsDocente(getMethodByName(ScuPlanningController.class, "savePlanClase"));
        assertContainsDocente(getMethodByName(ScuOfficeController.class, "importPlanesClase"));
        assertContainsDocente(getMethodByName(ScuOfficeController.class, "exportPlanClases"));
    }

    @Test
    @DisplayName("Master exports declare DIR_CARRERA, DIR_ACADEMICA, ADMIN and exclude DOCENTE")
    void shouldRestrictMasterExportsToDirectorOrAdmin() throws Exception {
        assertMasterExportRoles(getMethodByName(ScuOfficeController.class, "exportPac"));
        assertMasterExportRoles(getMethodByName(ScuOfficeController.class, "exportProgramaDocx"));
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    @DisplayName("Teacher receives 403 Forbidden when calling master import endpoints")
    void shouldForbidTeacherFromMasterImports() throws Exception {
        MockMultipartFile dummyFile = new MockMultipartFile("file", "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content".getBytes());

        this.mockMvc.perform(multipart("/api/v1/office/import/pac")
                        .file(dummyFile))
                .andExpect(status().isForbidden());

        this.mockMvc.perform(multipart("/api/v1/office/import/cronograma")
                        .file(dummyFile))
                .andExpect(status().isForbidden());

        MockMultipartFile dummyDocx = new MockMultipartFile("file", "test.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "content".getBytes());

        this.mockMvc.perform(multipart("/api/v1/office/import/programa-analitico")
                        .file(dummyDocx))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    @DisplayName("Teacher receives 403 Forbidden when calling master export endpoints")
    void shouldForbidTeacherFromMasterExports() throws Exception {
        this.mockMvc.perform(get("/api/v1/office/export/pac"))
                .andExpect(status().isForbidden());

        this.mockMvc.perform(get("/api/v1/office/export/programa-analitico"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    @DisplayName("Teacher retains access on personal export endpoints")
    void shouldAllowTeacherToExportPersonalDocuments() throws Exception {
        when(this.exportPlanClasesCmd.execute(anyLong(), any(), any(), any()))
                .thenReturn(new byte[0]);

        when(this.exportAsistenciaCmd.execute(anyString(), anyString(), any()))
                .thenReturn(new byte[0]);

        this.mockMvc.perform(get("/api/v1/office/export/plan-clase"))
                .andExpect(status().isOk());

        this.mockMvc.perform(get("/api/v1/office/export/asistencia").param("materiaCodigo", "SIS-213"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Unauthenticated requests to export routes are rejected with 401 or 403")
    void shouldRejectUnauthenticatedExportRequests() throws Exception {
        for (String path : Arrays.asList(
                "/api/v1/office/export/pac",
                "/api/v1/office/export/programa-analitico",
                "/api/v1/office/export/plan-clase",
                "/api/v1/office/export/asistencia")) {
            this.mockMvc.perform(get(path))
                    .andExpect(result -> {
                        int code = result.getResponse().getStatus();
                        assertTrue(code == 401 || code == 403,
                                "Expected 401 or 403 for unauthenticated request to " + path + " but was " + code);
                    });
        }
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

    @Test
    @DisplayName("PAC by-carrera includes all director roles and ADMIN")
    void shouldAuthorizeDirectorsAndAdminToGetPacByCarrera() throws Exception {
        PreAuthorize preAuthorize = ScuPlanningController.class.getMethod(
                "getPacByCarrera", String.class, Long.class).getAnnotation(PreAuthorize.class);

        assertTrue(preAuthorize != null);
        assertTrue(preAuthorize.value().contains("ROLE_DIR_CARRERA"));
        assertTrue(preAuthorize.value().contains("ROLE_DIR_ACADEMICA"));
        assertTrue(preAuthorize.value().contains("ROLE_VICERRECTOR_SEDE"));
        assertTrue(preAuthorize.value().contains("ROLE_VICERRECTOR_NACIONAL"));
        assertTrue(preAuthorize.value().contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Asistencia export includes DOCENTE, DIR_CARRERA, and ADMIN")
    void shouldAuthorizeDocenteDirCarreraAndAdminToExportAsistencia() throws Exception {
        PreAuthorize preAuthorize = ScuOfficeController.class.getMethod(
                "exportAsistencia", String.class, String.class, String.class).getAnnotation(PreAuthorize.class);

        assertTrue(preAuthorize != null);
        assertTrue(preAuthorize.value().contains("ROLE_DOCENTE"));
        assertTrue(preAuthorize.value().contains("ROLE_DIR_CARRERA"));
        assertTrue(preAuthorize.value().contains("ROLE_ADMIN"));
    }

    private static Method getMethodByName(Class<?> clazz, String methodName) {
        for (Method m : clazz.getDeclaredMethods()) {
            if (m.getName().equals(methodName)) {
                return m;
            }
        }
        throw new NoSuchMethodError("Method not found: " + methodName + " on class " + clazz.getName());
    }

    private static void assertDirectorOrAdminExcludesDocente(Method method) {
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuthorize != null, () -> method.getName() + " must declare @PreAuthorize");
        assertTrue(preAuthorize.value().contains("ROLE_DIR_CARRERA"));
        assertTrue(preAuthorize.value().contains("ROLE_ADMIN"));
        assertFalse(preAuthorize.value().contains("ROLE_DOCENTE"),
                () -> method.getName() + " must NOT permit ROLE_DOCENTE");
    }

    private static void assertContainsDocente(Method method) {
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuthorize != null, () -> method.getName() + " must declare @PreAuthorize");
        assertTrue(preAuthorize.value().contains("ROLE_DOCENTE"));
    }

    private static void assertMasterExportRoles(Method method) {
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuthorize != null, () -> method.getName() + " must declare @PreAuthorize");
        assertTrue(preAuthorize.value().contains("ROLE_DIR_CARRERA"));
        assertTrue(preAuthorize.value().contains("ROLE_DIR_ACADEMICA"));
        assertTrue(preAuthorize.value().contains("ROLE_ADMIN"));
        assertFalse(preAuthorize.value().contains("ROLE_DOCENTE"),
                () -> method.getName() + " must NOT permit ROLE_DOCENTE");
    }

    @TestConfiguration
    static class JwtFilterTestConfig {

        @Bean
        ScuJwtAuthenticationFilter scuJwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
            return new ScuJwtAuthenticationFilter(jwtTokenProvider);
        }
    }
}
