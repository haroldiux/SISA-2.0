package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.SeguimientoClaseDto;
import bo.edu.unitepc.sisa.api.request.GuardarSeguimientoClaseRequest;
import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.model.SeguimientoClase;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SeguimientoClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SesionMatriz7Repository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test suite for {@link ScuSaveSeguimientoClaseCmd}.
 * Verifies agile class tracking registration, idempotent upserts,
 * score calculation, and automatic transition of PlanDeClase to EJECUTADO.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
class ScuSaveSeguimientoClaseCmdTest {

    @Mock
    private SeguimientoClaseRepository seguimientoRepository;

    @Mock
    private SesionMatriz7Repository sesionMatriz7Repository;

    @Mock
    private PlanDeClaseRepository planDeClaseRepository;

    @InjectMocks
    private ScuSaveSeguimientoClaseCmd cmd;

    private GuardarSeguimientoClaseRequest baseRequest;

    @BeforeEach
    void setUp() {
        baseRequest = new GuardarSeguimientoClaseRequest(
                101L,
                "SIS-213",
                "CARSIS",
                "4892104",
                LocalDate.now(),
                TipoSesion.TEORICA,
                "TA-01",
                "Unidad III: Árboles Binarios de Búsqueda",
                "Recorrido In-Order, Pre-Order y Post-Order",
                List.of("Proyector Multimedia", "Pizarra Acrílica"),
                List.of("Proyector Multimedia", "Pizarra Acrílica", "IDE Java"),
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                EstadoCumplimientoTema.TOTALMENTE_CUMPLIDO,
                "Estudiantes participaron activamente resolviendo ejercicios"
        );
    }

    @Test
    @DisplayName("Registrar nuevo seguimiento exitosamente con score 1.00")
    void testSaveNewSeguimiento_Success() {
        when(seguimientoRepository.findBySesionMatriz7Id(101L)).thenReturn(Optional.empty());
        when(sesionMatriz7Repository.findById(101L)).thenReturn(Optional.of(new SesionMatriz7()));

        when(seguimientoRepository.save(any(SeguimientoClase.class))).thenAnswer(invocation -> {
            SeguimientoClase s = invocation.getArgument(0);
            s.setId(1L);
            return s;
        });

        when(planDeClaseRepository.findBySesionId(101L)).thenReturn(Optional.empty());

        SeguimientoClaseDto result = cmd.execute(baseRequest);

        assertNotNull(result);
        assertEquals("SIS-213", result.materiaCodigo());
        assertEquals("CARSIS", result.carreraCodigo());
        assertEquals(EstadoCumplimientoTema.TOTALMENTE_CUMPLIDO, result.estadoCumplimiento());
        assertEquals(new BigDecimal("1.00"), result.cumplimientoScore());
        assertTrue(result.momentoInicioCumplido());
        assertTrue(result.momentoDesarrolloCumplido());
        assertTrue(result.momentoCierreCumplido());
        assertEquals(3, result.recursosUtilizados().size());

        verify(seguimientoRepository, times(1)).save(any(SeguimientoClase.class));
    }

    @Test
    @DisplayName("Rechazar registro con fecha futura a más de 24 horas")
    void testSaveSeguimiento_FechaFutura_ThrowsException() {
        GuardarSeguimientoClaseRequest invalidRequest = new GuardarSeguimientoClaseRequest(
                101L,
                "SIS-213",
                "CARSIS",
                "4892104",
                LocalDate.now().plusDays(3),
                TipoSesion.TEORICA,
                "TA-01",
                "Tema Futuro",
                "Tema Futuro",
                List.of(),
                List.of(),
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                EstadoCumplimientoTema.TOTALMENTE_CUMPLIDO,
                "Observaciones"
        );

        ScuException ex = assertThrows(ScuException.class, () -> cmd.execute(invalidRequest));
        assertEquals("ERR_FECHA_FUTURA", ex.getErrorCode());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getHttpStatus());
        verify(seguimientoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Actualización idempotente in-place de seguimiento existente")
    void testSaveSeguimiento_IdempotentUpdate() {
        SeguimientoClase existing = new SeguimientoClase();
        existing.setId(42L);
        existing.setMateriaCodigo("SIS-213");
        existing.setCumplimientoScore(new BigDecimal("0.50"));
        existing.setEstadoCumplimiento(EstadoCumplimientoTema.PARCIALMENTE_CUMPLIDO);

        when(seguimientoRepository.findBySesionMatriz7Id(101L)).thenReturn(Optional.of(existing));
        when(sesionMatriz7Repository.findById(101L)).thenReturn(Optional.of(new SesionMatriz7()));
        when(seguimientoRepository.save(any(SeguimientoClase.class))).thenReturn(existing);
        when(planDeClaseRepository.findBySesionId(101L)).thenReturn(Optional.empty());

        SeguimientoClaseDto result = cmd.execute(baseRequest);

        assertNotNull(result);
        assertEquals(42L, result.id());
        assertEquals(EstadoCumplimientoTema.TOTALMENTE_CUMPLIDO, result.estadoCumplimiento());
        assertEquals(new BigDecimal("1.00"), result.cumplimientoScore());
        assertNotNull(existing.getActualizadoEn());
    }

    @Test
    @DisplayName("Transicionar automáticamente PlanDeClase a EJECUTADO cuando score > 0")
    void testSaveSeguimiento_TransitionsPlanDeClaseToEjecutado() {
        when(seguimientoRepository.findBySesionMatriz7Id(101L)).thenReturn(Optional.empty());
        when(sesionMatriz7Repository.findById(101L)).thenReturn(Optional.of(new SesionMatriz7()));
        when(seguimientoRepository.save(any(SeguimientoClase.class))).thenAnswer(i -> i.getArgument(0));

        PlanDeClase planMock = new PlanDeClase();
        planMock.setEstado(EstadoPlanificacion.APROBADO);
        when(planDeClaseRepository.findBySesionId(101L)).thenReturn(Optional.of(planMock));

        SeguimientoClaseDto result = cmd.execute(baseRequest);

        assertNotNull(result);
        assertEquals(EstadoPlanificacion.EJECUTADO.name(), result.planClaseEstadoActualizado());

        ArgumentCaptor<PlanDeClase> planCaptor = ArgumentCaptor.forClass(PlanDeClase.class);
        verify(planDeClaseRepository, times(1)).save(planCaptor.capture());
        assertEquals(EstadoPlanificacion.EJECUTADO, planCaptor.getValue().getEstado());
        assertNotNull(planCaptor.getValue().getActualizadoEn());
    }

    @Test
    @DisplayName("No transicionar PlanDeClase a EJECUTADO si el estado de cumplimiento es NO_CUMPLIDO")
    void testSaveSeguimiento_NoCumplido_DoesNotTransitionPlanDeClase() {
        GuardarSeguimientoClaseRequest noCumplidoRequest = new GuardarSeguimientoClaseRequest(
                101L,
                "SIS-213",
                "CARSIS",
                "4892104",
                LocalDate.now(),
                TipoSesion.TEORICA,
                "TA-01",
                "Tema No Dado",
                "Clase suspendida por feriado",
                List.of(),
                List.of(),
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                EstadoCumplimientoTema.NO_CUMPLIDO,
                "No se dictó la clase"
        );

        when(seguimientoRepository.findBySesionMatriz7Id(101L)).thenReturn(Optional.empty());
        when(sesionMatriz7Repository.findById(101L)).thenReturn(Optional.of(new SesionMatriz7()));
        when(seguimientoRepository.save(any(SeguimientoClase.class))).thenAnswer(i -> i.getArgument(0));

        SeguimientoClaseDto result = cmd.execute(noCumplidoRequest);

        assertNotNull(result);
        assertNull(result.planClaseEstadoActualizado());
        assertEquals(EstadoCumplimientoTema.NO_CUMPLIDO, result.estadoCumplimiento());
        assertEquals(new BigDecimal("0.00"), result.cumplimientoScore());
        verify(planDeClaseRepository, never()).save(any(PlanDeClase.class));
    }
}
