package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.service.command.ScuSubmitPacCmd;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ScuSubmitPacCmd formal submission workflow.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
public class ScuPlanningSubmitCmdTest {

    @Mock
    private PacRepository pacRepository;

    @Mock
    private AsignacionDocenteRepository asignacionRepository;

    private ScuSubmitPacCmd submitPacCmd;

    @BeforeEach
    void setUp() {
        this.submitPacCmd = new ScuSubmitPacCmd(this.pacRepository, this.asignacionRepository);
    }

    @Test
    @DisplayName("Should transition state to ENVIADO_REVISION by PAC ID")
    void shouldTransitionToEnviadoRevisionById() {
        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(5L);

        Pac pac = new Pac();
        pac.setId(10L);
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.BORRADOR);
        pac.setSesiones(new ArrayList<>());

        when(this.pacRepository.findById(10L)).thenReturn(Optional.of(pac));
        when(this.pacRepository.save(any(Pac.class))).thenAnswer(i -> i.getArgument(0));

        ScuPacResponse response = this.submitPacCmd.executeById(10L);

        assertEquals(EstadoPlanificacion.ENVIADO_REVISION, response.getEstado());
        assertEquals(5L, response.getAsignacionId());
    }

    @Test
    @DisplayName("Should transition state to ENVIADO_REVISION by Asignacion ID")
    void shouldTransitionToEnviadoRevisionByAsignacionId() {
        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(5L);

        Pac pac = new Pac();
        pac.setId(10L);
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.OBSERVADO);
        pac.setSesiones(new ArrayList<>());

        when(this.pacRepository.findByAsignacionId(5L)).thenReturn(Optional.of(pac));
        when(this.pacRepository.save(any(Pac.class))).thenAnswer(i -> i.getArgument(0));

        ScuPacResponse response = this.submitPacCmd.executeByAsignacionId(5L);

        assertEquals(EstadoPlanificacion.ENVIADO_REVISION, response.getEstado());
    }

    @Test
    @DisplayName("Should reject submission if PAC is already APROBADO")
    void shouldRejectIfAlreadyAprobado() {
        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(5L);

        Pac pac = new Pac();
        pac.setId(10L);
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.APROBADO);

        when(this.pacRepository.findById(10L)).thenReturn(Optional.of(pac));

        assertThrows(ScuException.class, () -> this.submitPacCmd.executeById(10L));
    }
}
