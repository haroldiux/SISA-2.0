package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuPacReviewRequest;
import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.service.command.ScuReviewPacCmd;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for PAC approval and observation state machine transitions.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
public class PacWorkflowStateMachineTest {

    @Mock
    private PacRepository pacRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private ScuReviewPacCmd reviewPacCmd;

    @BeforeEach
    void setUp() {
        this.reviewPacCmd = new ScuReviewPacCmd(this.pacRepository, this.usuarioRepository);
    }

    @Test
    @DisplayName("Should transition state to APROBADO upon successful review")
    void shouldTransitionToAprobado() {
        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(10L);

        Pac pac = new Pac();
        pac.setId(1L);
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.ENVIADO_REVISION);

        when(this.pacRepository.findById(1L)).thenReturn(Optional.of(pac));
        when(this.pacRepository.save(any(Pac.class))).thenAnswer(i -> i.getArgument(0));

        ScuPacReviewRequest request = new ScuPacReviewRequest(EstadoPlanificacion.APROBADO, "Conforme a lineamientos");
        ScuPacResponse response = this.reviewPacCmd.execute(1L, request);

        assertEquals(EstadoPlanificacion.APROBADO, response.getEstado());
        assertEquals("Conforme a lineamientos", response.getObservacionesRevision());
    }

    @Test
    @DisplayName("Should transition state to OBSERVADO with feedback remarks")
    void shouldTransitionToObservado() {
        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(10L);

        Pac pac = new Pac();
        pac.setId(1L);
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.ENVIADO_REVISION);

        when(this.pacRepository.findById(1L)).thenReturn(Optional.of(pac));
        when(this.pacRepository.save(any(Pac.class))).thenAnswer(i -> i.getArgument(0));

        ScuPacReviewRequest request = new ScuPacReviewRequest(EstadoPlanificacion.OBSERVADO, "Revisar saberes procedimentales de semana 4");
        ScuPacResponse response = this.reviewPacCmd.execute(1L, request);

        assertEquals(EstadoPlanificacion.OBSERVADO, response.getEstado());
        assertEquals("Revisar saberes procedimentales de semana 4", response.getObservacionesRevision());
    }
}
