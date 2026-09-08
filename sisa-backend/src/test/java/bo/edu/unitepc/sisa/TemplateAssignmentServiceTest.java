package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.domain.enums.ComponentType;
import bo.edu.unitepc.sisa.domain.service.TemplateAssignmentService;
import bo.edu.unitepc.sisa.domain.service.TemplateAssignmentService.AssignmentResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link TemplateAssignmentService} validating the official UNITEPC
 * Document Assignment Matrix rules and all 6 specification scenarios.
 *
 * @author GentleAI SISA Architecture Team
 */
public class TemplateAssignmentServiceTest {

    private TemplateAssignmentService service;

    @BeforeEach
    void setUp() {
        this.service = new TemplateAssignmentService();
    }

    @Test
    @DisplayName("Scenario 1: Same teacher teaches TA and PA -> PAC GRAL + Plan TEÓRICO-PRÁCTICO")
    void testScenario1_SameTeacher_TA_and_PA() {
        // Given teacher "Harold" is assigned to group "TA-01" and "PA-01" for "Informática Médica"
        List<String> groups = List.of("TA-01", "PA-01");

        // When the system determines template assignments
        AssignmentResult result = service.determineAssignments(groups);

        // Then Harold is assigned a single "PAC GRAL" template
        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL), result.requiredPacTypes());
        // And Harold is assigned a single "Plan TEÓRICO-PRÁCTICO" template
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO_PRACTICO), result.requiredPlanTypes());
        assertTrue(result.hasTA());
        assertTrue(result.hasPA());
        assertFalse(result.hasPL());
        assertFalse(result.hasPS());
        assertTrue(result.hasTheory());
        assertTrue(result.hasPractice());
        assertFalse(result.requiresMultiplePacs());
        assertFalse(result.requiresMultiplePlans());
    }

    @Test
    @DisplayName("Scenario 2: Same teacher teaches TA and PL/PS -> PAC GRAL + PAC PRÁCTICO & Plan TEÓRICO + Plan PRÁCTICO")
    void testScenario2_SameTeacher_TA_and_PL_or_PS() {
        // Case A: TA + PL
        List<String> groupsPL = List.of("TA-02", "PL-01");
        AssignmentResult resultPL = service.determineAssignments(groupsPL);

        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL, TemplateAssignmentService.PAC_PRACTICO),
                resultPL.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO, TemplateAssignmentService.PLAN_PRACTICO),
                resultPL.requiredPlanTypes());
        assertTrue(resultPL.requiresMultiplePacs());
        assertTrue(resultPL.requiresMultiplePlans());

        // Case B: TA + PS (Simulation)
        List<String> groupsPS = List.of("TA-01", "PS-01");
        AssignmentResult resultPS = service.determineAssignments(groupsPS);

        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL, TemplateAssignmentService.PAC_PRACTICO),
                resultPS.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO, TemplateAssignmentService.PLAN_PRACTICO),
                resultPS.requiredPlanTypes());

        // Case C: TA + PA + PL (Theory + Classroom Practice + Lab) -> still requires both templates
        List<String> groupsAll = List.of("TA-01", "PA-01", "PL-01");
        AssignmentResult resultAll = service.determineAssignments(groupsAll);
        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL, TemplateAssignmentService.PAC_PRACTICO),
                resultAll.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO, TemplateAssignmentService.PLAN_PRACTICO),
                resultAll.requiredPlanTypes());
    }

    @Test
    @DisplayName("Scenario 3: Teacher teaches only TA (Theory only) -> PAC GRAL + Plan TEÓRICO")
    void testScenario3_Teacher_TA_Only() {
        // Given teacher "Juan" is assigned only to group "TA-03" for "Historia"
        List<String> groups = List.of("TA-03");

        AssignmentResult result = service.determineAssignments(groups);

        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL), result.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO), result.requiredPlanTypes());
        assertTrue(result.hasTheory());
        assertFalse(result.hasPractice());
    }

    @Test
    @DisplayName("Scenario 4: Teacher teaches only PA (Classroom Practice only) -> PAC PRÁCTICO + Plan PRÁCTICO")
    void testScenario4_Teacher_PA_Only() {
        // Given teacher "Ana" is assigned only to group "PA-02" for "Matemáticas"
        List<String> groups = List.of("PA-02");

        AssignmentResult result = service.determineAssignments(groups);

        assertEquals(List.of(TemplateAssignmentService.PAC_PRACTICO), result.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_PRACTICO), result.requiredPlanTypes());
        assertFalse(result.hasTheory());
        assertTrue(result.hasPractice());
    }

    @Test
    @DisplayName("Scenario 5: Teacher teaches only PL or PS (Lab/Sim Practice only) -> PAC PRÁCTICO + Plan PRÁCTICO")
    void testScenario5_Teacher_PL_or_PS_Only() {
        // Given teacher "Carlos" is assigned only to group "PL-02" for "Física"
        List<String> groupsPL = List.of("PL-02");
        AssignmentResult resultPL = service.determineAssignments(groupsPL);

        assertEquals(List.of(TemplateAssignmentService.PAC_PRACTICO), resultPL.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_PRACTICO), resultPL.requiredPlanTypes());
        assertTrue(resultPL.hasPL());

        // Simulation PS
        List<String> groupsPS = List.of("PS-01");
        AssignmentResult resultPS = service.determineAssignments(groupsPS);

        assertEquals(List.of(TemplateAssignmentService.PAC_PRACTICO), resultPS.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_PRACTICO), resultPS.requiredPlanTypes());
        assertTrue(resultPS.hasPS());
    }

    @Test
    @DisplayName("Scenario 6: Different teachers for TA and Practice -> Distinct individual assignments")
    void testScenario6_DifferentTeachers() {
        // Given teacher "Harold" is assigned to "TA-01" and teacher "Martin" is assigned to "PL-01" for the same subject
        Map<String, List<String>> courseAssignments = Map.of(
                "docente-harold", List.of("TA-01"),
                "docente-martin", List.of("PL-01")
        );

        Map<String, AssignmentResult> resultMap = service.determineAssignmentsForCourse(courseAssignments);

        AssignmentResult haroldResult = resultMap.get("docente-harold");
        assertNotNull(haroldResult);
        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL), haroldResult.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO), haroldResult.requiredPlanTypes());

        AssignmentResult martinResult = resultMap.get("docente-martin");
        assertNotNull(martinResult);
        assertEquals(List.of(TemplateAssignmentService.PAC_PRACTICO), martinResult.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_PRACTICO), martinResult.requiredPlanTypes());
    }

    @Test
    @DisplayName("Enum-based assignment resolution")
    void testDetermineAssignmentsForComponents() {
        AssignmentResult result = service.determineAssignmentsForComponents(
                List.of(ComponentType.TA, ComponentType.PA)
        );
        assertEquals(List.of(TemplateAssignmentService.PAC_GRAL), result.requiredPacTypes());
        assertEquals(List.of(TemplateAssignmentService.PLAN_TEORICO_PRACTICO), result.requiredPlanTypes());
    }

    @Test
    @DisplayName("Empty or null input handling")
    void testEmptyAndNullInput() {
        AssignmentResult empty = service.determineAssignments(List.of());
        assertTrue(empty.requiredPacTypes().isEmpty());
        assertTrue(empty.requiredPlanTypes().isEmpty());

        AssignmentResult nullResult = service.determineAssignments(null);
        assertTrue(nullResult.requiredPacTypes().isEmpty());
        assertTrue(nullResult.requiredPlanTypes().isEmpty());
    }
}
