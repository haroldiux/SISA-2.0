package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.SemaforoCarreraResponse;
import bo.edu.unitepc.sisa.api.dto.SemaforoCarreraResponse.SemaforoKpisDto;
import bo.edu.unitepc.sisa.api.dto.SemaforoCarreraResponse.SemaforoMateriaDto;
import bo.edu.unitepc.sisa.domain.enums.ColorSemaforo;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.repository.AsignaturaRepository;
import bo.edu.unitepc.sisa.domain.repository.CarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaMateriaRepository;
import bo.edu.unitepc.sisa.domain.repository.SeguimientoClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.projection.MateriaSeguimientoAggregation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit test suite for {@link ScuGetSemaforoCarreraCmd}.
 * Verifies tri-color pedagogical traffic light classification:
 * - Green (>= -10% delta): On track / within institutional tolerance.
 * - Yellow (-25% <= delta < -10%): Moderate delay / requires rescheduling.
 * - Red (< -25% delta): Critical delay / severe gap.
 * - Red (Forced normative penalty): Missing lesson plan (tienePlanClase == false).
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
class ScuGetSemaforoCarreraCmdTest {

    @Mock
    private SeguimientoClaseRepository seguimientoRepository;

    @Mock
    private PlanDeClaseRepository planDeClaseRepository;

    @Mock
    private CarreraRepository carreraRepository;

    @Mock
    private AsignaturaRepository asignaturaRepository;

    @Mock
    private SeaMateriaRepository seaMateriaRepository;

    @InjectMocks
    private ScuGetSemaforoCarreraCmd cmd;

    @BeforeEach
    void setUp() {
        Carrera mockCarrera = new Carrera();
        mockCarrera.setCodigo("CARSIS");
        mockCarrera.setNombre("Ingeniería de Sistemas");

        lenient().when(carreraRepository.findByCodigo(anyString())).thenReturn(Optional.of(mockCarrera));
        lenient().when(asignaturaRepository.findByCarreraId(any())).thenReturn(Collections.emptyList());
        lenient().when(seaMateriaRepository.findAll()).thenReturn(Collections.emptyList());
        lenient().when(seguimientoRepository.aggregateByCarrera(anyString())).thenReturn(Collections.emptyList());
        lenient().when(planDeClaseRepository.countPlanesByMateriaCodigo(anyString())).thenReturn(0L);
    }

    @Test
    @DisplayName("Caso 1: SIS-213 debe clasificarse como VERDE (Al día, delta >= -10.0%)")
    void testExecute_Verde_MateriaAlDia() {
        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 13);

        assertNotNull(response);
        assertEquals("CARSIS", response.carreraCodigo());
        assertEquals("Ingeniería de Sistemas", response.carreraNombre());
        assertEquals(13, response.semanaCorte());
        assertEquals(new BigDecimal("65.00"), response.avancePlaneadoGlobal());

        SemaforoMateriaDto sis213 = response.materias().stream()
                .filter(m -> "SIS-213".equalsIgnoreCase(m.materiaCodigo()))
                .findFirst()
                .orElse(null);

        assertNotNull(sis213, "SIS-213 debe estar en el catálogo evaluado");
        assertTrue(sis213.tienePlanClase(), "SIS-213 debe tener plan de clase registrado");
        assertEquals(ColorSemaforo.VERDE, sis213.colorSemaforo());
        assertEquals(new BigDecimal("59.72"), sis213.avanceRealPorcentaje());
        assertEquals(new BigDecimal("-5.28"), sis213.diferenciaPorcentaje());
        assertTrue(sis213.diferenciaPorcentaje().compareTo(new BigDecimal("-10.00")) >= 0);
        assertTrue(sis213.motivoAlerta().contains("tolerable"));
        assertNotNull(sis213.momentosCumplimiento());
    }

    @Test
    @DisplayName("Caso 2: SIS-311 debe clasificarse como AMARILLO (Riesgo moderado, -25.0% <= delta < -10.0%)")
    void testExecute_Amarillo_MateriaRiesgoModerado() {
        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 13);

        SemaforoMateriaDto sis311 = response.materias().stream()
                .filter(m -> "SIS-311".equalsIgnoreCase(m.materiaCodigo()))
                .findFirst()
                .orElse(null);

        assertNotNull(sis311, "SIS-311 debe estar en el catálogo evaluado");
        assertTrue(sis311.tienePlanClase());
        assertEquals(ColorSemaforo.AMARILLO, sis311.colorSemaforo());
        assertEquals(new BigDecimal("47.22"), sis311.avanceRealPorcentaje());
        assertEquals(new BigDecimal("-17.78"), sis311.diferenciaPorcentaje());
        assertTrue(sis311.diferenciaPorcentaje().compareTo(new BigDecimal("-25.00")) >= 0);
        assertTrue(sis311.diferenciaPorcentaje().compareTo(new BigDecimal("-10.00")) < 0);
        assertTrue(sis311.motivoAlerta().contains("moderado") || sis311.motivoAlerta().contains("reprogramación"));
    }

    @Test
    @DisplayName("Caso 3: MAT-101 debe clasificarse como ROJO (Desfase grave, delta < -25.0%)")
    void testExecute_Rojo_DesfaseGrave() {
        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 13);

        SemaforoMateriaDto mat101 = response.materias().stream()
                .filter(m -> "MAT-101".equalsIgnoreCase(m.materiaCodigo()))
                .findFirst()
                .orElse(null);

        assertNotNull(mat101, "MAT-101 debe estar en el catálogo evaluado");
        assertTrue(mat101.tienePlanClase());
        assertEquals(ColorSemaforo.ROJO, mat101.colorSemaforo());
        assertEquals(new BigDecimal("30.56"), mat101.avanceRealPorcentaje());
        assertEquals(new BigDecimal("-34.44"), mat101.diferenciaPorcentaje());
        assertTrue(mat101.diferenciaPorcentaje().compareTo(new BigDecimal("-25.00")) < 0);
        assertTrue(mat101.motivoAlerta().contains("grave") || mat101.motivoAlerta().contains("crítico"));
    }

    @Test
    @DisplayName("Caso 4: SIS-412 debe clasificarse como ROJO por penalización crítica (Sin Plan de Clase)")
    void testExecute_Rojo_PenalizacionSinPlanDeClase() {
        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 13);

        SemaforoMateriaDto sis412 = response.materias().stream()
                .filter(m -> "SIS-412".equalsIgnoreCase(m.materiaCodigo()))
                .findFirst()
                .orElse(null);

        assertNotNull(sis412, "SIS-412 debe estar en el catálogo evaluado");
        assertFalse(sis412.tienePlanClase(), "SIS-412 no debe tener planes de clase");
        assertEquals(0, sis412.totalPlanesRegistrados());
        assertEquals(ColorSemaforo.ROJO, sis412.colorSemaforo());
        assertEquals("Penalización crítica: Asignatura sin Plan de Clase registrado", sis412.motivoAlerta());
    }

    @Test
    @DisplayName("Caso 5: Verificación de KPIs consolidados a nivel de carrera")
    void testExecute_KpisConsolidadosCarrera() {
        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 13);

        SemaforoKpisDto kpis = response.kpis();
        assertNotNull(kpis);
        assertEquals(4, kpis.totalMaterias());
        assertEquals(1, kpis.materiasAlDiaVerde(), "Debe haber 1 verde (SIS-213)");
        assertEquals(1, kpis.materiasAtencionAmarillo(), "Debe haber 1 amarillo (SIS-311)");
        assertEquals(2, kpis.materiasCriticoRojo(), "Debe haber 2 rojos (MAT-101 por desfase y SIS-412 por falta de plan)");
        assertEquals(1, kpis.materiasSinPlanClase(), "Debe haber 1 sin plan (SIS-412)");

        // Avance promedio real = (59.72 + 47.22 + 30.56 + 0.00) / 4 = 137.50 / 4 = 34.38%
        assertNotNull(kpis.avanceRealPromedioPorcentaje());
        assertEquals(new BigDecimal("34.38"), kpis.avanceRealPromedioPorcentaje());
    }

    @Test
    @DisplayName("Caso 6: Avance planeado con semana de corte personalizada")
    void testExecute_SemanaCortePersonalizada() {
        // Semana 10 de corte sobre 20 semanas = (10 / 20.0) * 100% = 50.00%
        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 10);

        assertEquals(10, response.semanaCorte());
        assertEquals(new BigDecimal("50.00"), response.avancePlaneadoGlobal());
    }

    @Test
    @DisplayName("Caso 7: Materia dinámica con agregación SQL personalizada")
    void testExecute_MateriaDinamicaConAgregacion() {
        // Mock de agregación nativa para asignatura adicional
        MateriaSeguimientoAggregation aggMock = mock(MateriaSeguimientoAggregation.class);
        when(aggMock.getMateriaCodigo()).thenReturn("SIS-501");
        when(aggMock.getTotalSesionesRegistradas()).thenReturn(30L);
        when(aggMock.getPuntajeTotal()).thenReturn(30.0);
        when(aggMock.getCountInicio()).thenReturn(30L);
        when(aggMock.getCountDesarrollo()).thenReturn(30L);
        when(aggMock.getCountCierre()).thenReturn(30L);

        when(seguimientoRepository.aggregateByCarrera("CARSIS")).thenReturn(List.of(aggMock));
        when(planDeClaseRepository.countPlanesByMateriaCodigo("SIS-501")).thenReturn(30L);

        SemaforoCarreraResponse response = cmd.execute("CARSIS", "2-2026", 13);

        SemaforoMateriaDto sis501 = response.materias().stream()
                .filter(m -> "SIS-501".equalsIgnoreCase(m.materiaCodigo()))
                .findFirst()
                .orElse(null);

        assertNotNull(sis501, "SIS-501 agregada dinámicamente debe evaluarse");
        assertTrue(sis501.tienePlanClase());
        assertEquals(30, sis501.totalPlanesRegistrados());
        assertEquals(ColorSemaforo.VERDE, sis501.colorSemaforo());
        // Puntaje real 30.0 / 36 = 83.33% avance real vs 65.00% planeado = +18.33% delta
        assertEquals(new BigDecimal("83.33"), sis501.avanceRealPorcentaje());
        assertEquals(new BigDecimal("18.33"), sis501.diferenciaPorcentaje());
    }
}
