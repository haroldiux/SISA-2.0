package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuMomentoPedagogicoDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SesionMatriz7Repository;
import bo.edu.unitepc.sisa.exception.ScuPlanDurationMismatchException;
import bo.edu.unitepc.sisa.service.command.ScuSavePlanClaseCmd;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for Plan de Clase 3-moment duration arithmetic validation (Inicio 25m + Desarrollo 100m + Cierre 55m == 180m).
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
public class ScuPlanClaseDurationValidatorTest {

    @Mock
    private PlanDeClaseRepository planRepository;

    @Mock
    private SesionMatriz7Repository sesionRepository;

    private ScuSavePlanClaseCmd savePlanClaseCmd;

    @BeforeEach
    void setUp() {
        this.savePlanClaseCmd = new ScuSavePlanClaseCmd(this.planRepository, this.sesionRepository);
    }

    @Test
    @DisplayName("Should succeed when Inicio (25) + Desarrollo (100) + Cierre (55) equals 180 min")
    void shouldSucceedWhenMomentsSumMatchesTotalDuration() {
        SesionMatriz7 sesion = new SesionMatriz7();
        sesion.setId(1L);
        sesion.setSemana(1);
        sesion.setNroSesion(1);
        sesion.setUnidadTematica("Unidad 1");

        when(this.sesionRepository.findById(1L)).thenReturn(Optional.of(sesion));
        when(this.planRepository.findBySesionId(1L)).thenReturn(Optional.empty());
        when(this.planRepository.save(any(PlanDeClase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScuPlanClaseRequest request = new ScuPlanClaseRequest();
        request.setSesionId(1L);
        request.setDuracionTotalMin(180);
        request.setObjetivoSesion("Desarrollar competencias algorítmicas");

        List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
        momentos.add(ScuMomentoPedagogicoDto.builder().tipoMomento(TipoMomentoPedagogico.INICIO).duracionMin(25).actividadesDocente("Docente intro").actividadesEstudiante("Estudiante escucha").indicadorEvaluacion("Saber previo").build());
        momentos.add(ScuMomentoPedagogicoDto.builder().tipoMomento(TipoMomentoPedagogico.DESARROLLO).duracionMin(100).actividadesDocente("Docente guía").actividadesEstudiante("Estudiante práctica").indicadorEvaluacion("Ejercicio resuelto").build());
        momentos.add(ScuMomentoPedagogicoDto.builder().tipoMomento(TipoMomentoPedagogico.CIERRE).duracionMin(55).actividadesDocente("Docente sintetiza").actividadesEstudiante("Estudiante concluye").indicadorEvaluacion("Producto entregado").build());
        request.setMomentos(momentos);

        assertDoesNotThrow(() -> this.savePlanClaseCmd.execute(request));
    }

    @Test
    @DisplayName("Should throw ScuPlanDurationMismatchException when sum of moments does not equal total duration")
    void shouldThrowExceptionWhenMomentsSumMismatch() {
        SesionMatriz7 sesion = new SesionMatriz7();
        sesion.setId(1L);
        when(this.sesionRepository.findById(1L)).thenReturn(Optional.of(sesion));

        ScuPlanClaseRequest request = new ScuPlanClaseRequest();
        request.setSesionId(1L);
        request.setDuracionTotalMin(180);
        request.setObjetivoSesion("Objetivo");

        List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
        momentos.add(ScuMomentoPedagogicoDto.builder().tipoMomento(TipoMomentoPedagogico.INICIO).duracionMin(30).actividadesDocente("A").actividadesEstudiante("B").indicadorEvaluacion("C").build());
        momentos.add(ScuMomentoPedagogicoDto.builder().tipoMomento(TipoMomentoPedagogico.DESARROLLO).duracionMin(100).actividadesDocente("A").actividadesEstudiante("B").indicadorEvaluacion("C").build());
        momentos.add(ScuMomentoPedagogicoDto.builder().tipoMomento(TipoMomentoPedagogico.CIERRE).duracionMin(40).actividadesDocente("A").actividadesEstudiante("B").indicadorEvaluacion("C").build()); // 30+100+40 = 170 != 180
        request.setMomentos(momentos);

        assertThrows(ScuPlanDurationMismatchException.class, () -> this.savePlanClaseCmd.execute(request));
    }
}
