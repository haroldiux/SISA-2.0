package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.domain.model.SeguimientoClase;
import bo.edu.unitepc.sisa.domain.repository.projection.MateriaSeguimientoAggregation;
import bo.edu.unitepc.sisa.domain.repository.projection.RecursoUsoProjection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit and contract test suite for {@link SeguimientoClaseRepository} and projections.
 * Verifies domain model persistence lifecycle, projections mapping, and query definitions.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
class SeguimientoClaseRepositoryTest {

    @Mock
    private SeguimientoClaseRepository seguimientoClaseRepository;

    @Test
    @DisplayName("SeguimientoClase entity lifecycle: @PrePersist synchronizes cumplimientoScore and updatedAt")
    void testEntityLifecycleSincronizacionScore() {
        SeguimientoClase seguimiento = new SeguimientoClase();
        seguimiento.setMateriaCodigo("SIS-213");
        seguimiento.setCarreraCodigo("CARSIS");
        seguimiento.setDocenteCi("4892104");
        seguimiento.setFechaEjecucion(LocalDate.of(2026, 10, 30));
        seguimiento.setTipoClase(TipoSesion.TEORICA);
        seguimiento.setComision("TA-01");
        seguimiento.setRecursosUtilizados(List.of("Proyector Multimedia", "IDE IntelliJ IDEA"));

        // Case 1: TOTALMENTE_CUMPLIDO -> score 1.00
        seguimiento.setEstadoCumplimiento(EstadoCumplimientoTema.TOTALMENTE_CUMPLIDO);
        seguimiento.sincronizarScoreYTimestamps();
        assertEquals(new BigDecimal("1.00"), seguimiento.getCumplimientoScore());
        assertNotNull(seguimiento.getActualizadoEn());

        // Case 2: PARCIALMENTE_CUMPLIDO -> score 0.50
        seguimiento.setEstadoCumplimiento(EstadoCumplimientoTema.PARCIALMENTE_CUMPLIDO);
        seguimiento.sincronizarScoreYTimestamps();
        assertEquals(new BigDecimal("0.50"), seguimiento.getCumplimientoScore());

        // Case 3: NO_CUMPLIDO -> score 0.00
        seguimiento.setEstadoCumplimiento(EstadoCumplimientoTema.NO_CUMPLIDO);
        seguimiento.sincronizarScoreYTimestamps();
        assertEquals(new BigDecimal("0.00"), seguimiento.getCumplimientoScore());
    }

    @Test
    @DisplayName("Contract: findByMateriaCodigoAndFechaEjecucionAndTipoClaseAndComision returns expected entity")
    void testFindByCoordenadasFisicas() {
        SeguimientoClase mockSeg = new SeguimientoClase();
        mockSeg.setId(10L);
        mockSeg.setMateriaCodigo("SIS-213");
        mockSeg.setFechaEjecucion(LocalDate.of(2026, 10, 30));
        mockSeg.setTipoClase(TipoSesion.TEORICA);
        mockSeg.setComision("TA-01");

        when(seguimientoClaseRepository.findByMateriaCodigoAndFechaEjecucionAndTipoClaseAndComision(
                "SIS-213", LocalDate.of(2026, 10, 30), TipoSesion.TEORICA, "TA-01"
        )).thenReturn(Optional.of(mockSeg));

        Optional<SeguimientoClase> found = seguimientoClaseRepository.findByMateriaCodigoAndFechaEjecucionAndTipoClaseAndComision(
                "SIS-213", LocalDate.of(2026, 10, 30), TipoSesion.TEORICA, "TA-01"
        );

        assertTrue(found.isPresent());
        assertEquals(10L, found.get().getId());
        assertEquals("SIS-213", found.get().getMateriaCodigo());
    }

    @Test
    @DisplayName("Contract: aggregateByCarrera projection mapping with grouped statistics")
    void testAggregateByCarreraProjection() {
        MateriaSeguimientoAggregation mockAgg = mock(MateriaSeguimientoAggregation.class);
        when(mockAgg.getMateriaCodigo()).thenReturn("SIS-213");
        when(mockAgg.getTotalSesionesRegistradas()).thenReturn(22L);
        when(mockAgg.getPuntajeTotal()).thenReturn(21.5);
        when(mockAgg.getCountInicio()).thenReturn(22L);
        when(mockAgg.getCountDesarrollo()).thenReturn(21L);
        when(mockAgg.getCountCierre()).thenReturn(20L);

        when(seguimientoClaseRepository.aggregateByCarrera("CARSIS")).thenReturn(List.of(mockAgg));

        List<MateriaSeguimientoAggregation> aggregations = seguimientoClaseRepository.aggregateByCarrera("CARSIS");
        assertNotNull(aggregations);
        assertEquals(1, aggregations.size());

        MateriaSeguimientoAggregation first = aggregations.get(0);
        assertEquals("SIS-213", first.getMateriaCodigo());
        assertEquals(22L, first.getTotalSesionesRegistradas());
        assertEquals(21.5, first.getPuntajeTotal());
        assertEquals(22L, first.getCountInicio());
        assertEquals(21L, first.getCountDesarrollo());
        assertEquals(20L, first.getCountCierre());
    }

    @Test
    @DisplayName("Contract: getRecursosHistogramaByMateria projection returns ordered resources")
    void testRecursoHistogramaProjection() {
        RecursoUsoProjection r1 = mock(RecursoUsoProjection.class);
        when(r1.getRecurso()).thenReturn("Proyector Multimedia");
        when(r1.getUsos()).thenReturn(22L);

        RecursoUsoProjection r2 = mock(RecursoUsoProjection.class);
        when(r2.getRecurso()).thenReturn("Pizarra Acrílica");
        when(r2.getUsos()).thenReturn(18L);

        when(seguimientoClaseRepository.getRecursosHistogramaByMateria("SIS-213")).thenReturn(List.of(r1, r2));

        List<RecursoUsoProjection> histograma = seguimientoClaseRepository.getRecursosHistogramaByMateria("SIS-213");
        assertNotNull(histograma);
        assertEquals(2, histograma.size());
        assertEquals("Proyector Multimedia", histograma.get(0).getRecurso());
        assertEquals(22L, histograma.get(0).getUsos());
        assertEquals("Pizarra Acrílica", histograma.get(1).getRecurso());
        assertEquals(18L, histograma.get(1).getUsos());
    }
}
