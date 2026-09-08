package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuPacDto;
import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.domain.enums.ComponentType;
import bo.edu.unitepc.sisa.domain.enums.CourseType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link ComponentType}, {@link CourseType}, and DTO backwards compatibility.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ComponentAndCourseTypeTest {

    @Test
    @DisplayName("ComponentType enum resolves prefixes correctly")
    void testComponentTypeResolution() {
        assertEquals(ComponentType.TA, ComponentType.fromGroupCode("TA-01"));
        assertEquals(ComponentType.TA, ComponentType.fromGroupCode("ta-10"));
        assertEquals(ComponentType.PA, ComponentType.fromGroupCode("PA-02"));
        assertEquals(ComponentType.PL, ComponentType.fromGroupCode("PL-03"));
        assertEquals(ComponentType.PS, ComponentType.fromGroupCode("PS-01"));
        assertNull(ComponentType.fromGroupCode("G1"));
        assertNull(ComponentType.fromGroupCode(null));
        assertNull(ComponentType.fromGroupCode(""));

        assertTrue(ComponentType.TA.isTheory());
        assertFalse(ComponentType.TA.isPractice());

        assertFalse(ComponentType.PA.isTheory());
        assertTrue(ComponentType.PA.isPractice());
        assertTrue(ComponentType.PL.isPractice());
        assertTrue(ComponentType.PS.isPractice());
    }

    @Test
    @DisplayName("CourseType enum resolves from hours correctly")
    void testCourseTypeFromHours() {
        assertEquals(CourseType.TEORICO_PRACTICO, CourseType.fromHours(4, 2));
        assertEquals(CourseType.TEORICO, CourseType.fromHours(4, 0));
        assertEquals(CourseType.PRACTICO, CourseType.fromHours(0, 4));
        assertEquals(CourseType.TEORICO, CourseType.fromHours(0, 0));

        assertTrue(CourseType.TEORICO.isTeorico());
        assertTrue(CourseType.PRACTICO.isPractico());
        assertTrue(CourseType.TEORICO_PRACTICO.isTeoricoPractico());
    }

    @Test
    @DisplayName("ScuPlanClaseDto backwards compatibility and sync with Shared/Personal data")
    void testPlanClaseDtoSync() {
        ScuPlanClaseRequest plan = new ScuPlanClaseRequest();
        plan.setContenidoTema("Algoritmos de Ordenamiento");
        plan.setNombreDocente("Ing. Harold Iriarte");
        plan.setObjetivoSesion("Dominar QuickSort");
        plan.setDuracionTotalMin(180);

        // Verification of flat getters
        assertEquals("Algoritmos de Ordenamiento", plan.getContenidoTema());
        assertEquals("Ing. Harold Iriarte", plan.getNombreDocente());
        assertEquals("Dominar QuickSort", plan.getObjetivoSesion());
        assertEquals(180, plan.getDuracionTotalMin());

        // Verification of nested SharedPlanData
        assertNotNull(plan.getSharedData());
        assertEquals("Algoritmos de Ordenamiento", plan.getSharedData().getContenidoTema());
        assertEquals("Dominar QuickSort", plan.getSharedData().getObjetivoSesion());
        assertEquals(180, plan.getSharedData().getDuracionTotalMin());

        // Verification of nested PersonalPlanData
        assertNotNull(plan.getPersonalData());
        assertEquals("Ing. Harold Iriarte", plan.getPersonalData().getNombreDocente());
    }

    @Test
    @DisplayName("ScuPacDto & ScuPacRequest backwards compatibility")
    void testPacDtoCompatibility() {
        ScuPacRequest pac = new ScuPacRequest();
        pac.setAsignacionId(10L);
        pac.setPacType("GRAL");
        pac.setComponentType("TA");
        pac.setNombreAsignatura("Informática Médica");

        assertEquals(10L, pac.getAsignacionId());
        assertEquals("GRAL", pac.getPacType());
        assertEquals("TA", pac.getComponentType());
        assertEquals("Informática Médica", pac.getNombreAsignatura());
    }
}
