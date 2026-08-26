package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuAuditoriaInSituRequest;
import bo.edu.unitepc.sisa.api.response.ScuAuditoriaInSituResponse;
import bo.edu.unitepc.sisa.domain.enums.*;
import bo.edu.unitepc.sisa.domain.model.*;
import bo.edu.unitepc.sisa.domain.repository.*;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import bo.edu.unitepc.sisa.service.command.ScuFinalizeAuditoriaInSituCmd;
import bo.edu.unitepc.sisa.service.command.ScuInitiateAuditoriaInSituCmd;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test suite for In-Situ Classroom Radar and 3-Strike Disciplinary Recurrence Engine.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
public class InSituAuditAndStrikeEngineTest {

    @Mock
    private AuditoriaInSituRepository auditoriaRepository;

    @Mock
    private AsignacionDocenteRepository asignacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SesionMatriz7Repository sesionRepository;

    @Mock
    private ReincidenciaDocenteRepository reincidenciaRepository;

    @Mock
    private PacRepository pacRepository;

    private ScuFinalizeAuditoriaInSituCmd finalizeCmd;
    private ScuInitiateAuditoriaInSituCmd initiateCmd;

    private AsignacionDocente testAsignacion;
    private Usuario testDocente;
    private Usuario testAuditor;
    private Gestion testGestion;

    @BeforeEach
    void setUp() {
        this.finalizeCmd = new ScuFinalizeAuditoriaInSituCmd(
                this.auditoriaRepository,
                this.asignacionRepository,
                this.usuarioRepository,
                this.sesionRepository,
                this.reincidenciaRepository
        );

        this.initiateCmd = new ScuInitiateAuditoriaInSituCmd(
                this.asignacionRepository,
                this.pacRepository,
                this.sesionRepository
        );

        this.testGestion = new Gestion();
        this.testGestion.setId(1L);
        this.testGestion.setCodigo("1-2026");

        this.testDocente = new Usuario();
        this.testDocente.setId(10L);
        this.testDocente.setNombres("Carlos");
        this.testDocente.setApellidos("Montaño");

        this.testAuditor = new Usuario();
        this.testAuditor.setId(20L);
        this.testAuditor.setNombres("Gonzalo");
        this.testAuditor.setApellidos("Gutiérrez");

        Carrera testCarrera = new Carrera();
        testCarrera.setId(2L);
        testCarrera.setNombre("Ingeniería de Sistemas");

        Asignatura testAsignatura = new Asignatura();
        testAsignatura.setId(1L);
        testAsignatura.setCodigo("SIS-301");
        testAsignatura.setNombre("Programación III");

        Campus testCampus = new Campus();
        testCampus.setId(1L);
        testCampus.setNombre("Campus Colonial CBB");

        this.testAsignacion = new AsignacionDocente();
        this.testAsignacion.setId(101L);
        this.testAsignacion.setGestion(this.testGestion);
        this.testAsignacion.setDocente(this.testDocente);
        this.testAsignacion.setCarrera(testCarrera);
        this.testAsignacion.setAsignatura(testAsignatura);
        this.testAsignacion.setCampus(testCampus);
        this.testAsignacion.setAula("Lab-302");
        this.testAsignacion.setDiasSemana("LUNES");
        this.testAsignacion.setHorarioInicio(LocalTime.of(8, 0));
        this.testAsignacion.setHorarioFin(LocalTime.of(11, 0));

        TenantInfo tenant = TenantInfo.builder()
                .userId(20L)
                .username("dir.academica")
                .rol(RolUsuario.ROLE_DIR_ACADEMICA)
                .sedeId(1L)
                .build();
        TenantContext.setTenantInfo(tenant);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Radar should match active class when room, day, and time coordinates align")
    void shouldMatchActiveClassInRadar() {
        when(this.asignacionRepository.findActiveClassesInRoom(1L, "Lab-302", "LUNES", LocalTime.of(9, 30)))
                .thenReturn(List.of(this.testAsignacion));
        when(this.pacRepository.findByAsignacionId(101L)).thenReturn(Optional.empty());

        Map<String, Object> result = this.initiateCmd.execute(1L, "Lab-302", "LUNES", LocalTime.of(9, 30));

        assertNotNull(result);
        assertEquals(true, result.get("matched"));
        assertEquals(101L, result.get("asignacionId"));
        assertEquals("Programación III", result.get("asignaturaNombre"));
        assertEquals("Carlos Montaño", result.get("docenteNombre"));
    }

    @Test
    @DisplayName("Radar should return matched=false for unscheduled room or time")
    void shouldReturnNotMatchedForEmptyRoom() {
        when(this.asignacionRepository.findActiveClassesInRoom(1L, "Aula-999", "DOMINGO", LocalTime.of(9, 30)))
                .thenReturn(List.of());

        Map<String, Object> result = this.initiateCmd.execute(1L, "Aula-999", "DOMINGO", LocalTime.of(9, 30));

        assertNotNull(result);
        assertEquals(false, result.get("matched"));
        assertTrue(result.get("message").toString().contains("No se encontró"));
    }

    @Test
    @DisplayName("Should finalize conforming audit with SHA-256 hash and zero disciplinary strikes")
    void shouldFinalizeConformingAudit() {
        when(this.asignacionRepository.findById(101L)).thenReturn(Optional.of(this.testAsignacion));
        when(this.usuarioRepository.findById(20L)).thenReturn(Optional.of(this.testAuditor));
        when(this.auditoriaRepository.save(any(AuditoriaInSitu.class))).thenAnswer(i -> {
            AuditoriaInSitu a = i.getArgument(0);
            a.setId(500L);
            return a;
        });

        ScuAuditoriaInSituRequest req = ScuAuditoriaInSituRequest.builder()
                .asignacionId(101L)
                .puntualidadDocente(PuntualidadDocente.PUNTUAL)
                .concordanciaTema(ConcordanciaTema.CONFORME_PAC)
                .momentoObservado(TipoMomentoPedagogico.DESARROLLO)
                .recursosVerificados(List.of("Pizarra", "Proyector"))
                .estudiantesPresentes(28)
                .estudiantesInscritos(30)
                .observacionesAuditor("Clase conforme")
                .build();

        ScuAuditoriaInSituResponse res = this.finalizeCmd.execute(req);

        assertNotNull(res);
        assertEquals(EstadoAuditoria.FINALIZADA_CONFORME, res.getEstado());
        assertNotNull(res.getHashFirmaDigital());
        assertEquals(64, res.getHashFirmaDigital().length(), "SHA-256 hash must be 64 hex characters");
        verify(this.reincidenciaRepository, never()).save(any(ReincidenciaDocente.class));
    }

    @Test
    @DisplayName("Non-conforming audit (TEMA_NO_PLANIFICADO) should trigger Strike 1 (NIVEL_1 / NOTIFICADO)")
    void shouldTriggerStrike1OnFirstInfraction() {
        when(this.asignacionRepository.findById(101L)).thenReturn(Optional.of(this.testAsignacion));
        when(this.usuarioRepository.findById(20L)).thenReturn(Optional.of(this.testAuditor));
        when(this.auditoriaRepository.save(any(AuditoriaInSitu.class))).thenAnswer(i -> {
            AuditoriaInSitu a = i.getArgument(0);
            a.setId(501L);
            return a;
        });
        when(this.reincidenciaRepository.countInfraccionesByDocenteAndGestion(10L, 1L)).thenReturn(0);

        ScuAuditoriaInSituRequest req = ScuAuditoriaInSituRequest.builder()
                .asignacionId(101L)
                .puntualidadDocente(PuntualidadDocente.PUNTUAL)
                .concordanciaTema(ConcordanciaTema.TEMA_NO_PLANIFICADO)
                .momentoObservado(TipoMomentoPedagogico.INICIO)
                .estudiantesPresentes(20)
                .estudiantesInscritos(30)
                .observacionesAuditor("Tema no planificado")
                .build();

        ScuAuditoriaInSituResponse res = this.finalizeCmd.execute(req);

        assertEquals(EstadoAuditoria.OBSERVADA_NO_CONFORME, res.getEstado());

        ArgumentCaptor<ReincidenciaDocente> captor = ArgumentCaptor.forClass(ReincidenciaDocente.class);
        verify(this.reincidenciaRepository).save(captor.capture());

        ReincidenciaDocente strike = captor.getValue();
        assertEquals(1, strike.getNroInfraccion());
        assertEquals(NivelReincidencia.NIVEL_1, strike.getNivel());
        assertEquals(EstadoReincidencia.NOTIFICADO, strike.getEstado());
    }

    @Test
    @DisplayName("Third non-conformance should escalate to Strike 3 (NIVEL_3 / ESCALADO_VICERRECTORADO)")
    void shouldTriggerStrike3OnThirdInfraction() {
        when(this.asignacionRepository.findById(101L)).thenReturn(Optional.of(this.testAsignacion));
        when(this.usuarioRepository.findById(20L)).thenReturn(Optional.of(this.testAuditor));
        when(this.auditoriaRepository.save(any(AuditoriaInSitu.class))).thenAnswer(i -> {
            AuditoriaInSitu a = i.getArgument(0);
            a.setId(502L);
            return a;
        });
        when(this.reincidenciaRepository.countInfraccionesByDocenteAndGestion(10L, 1L)).thenReturn(2);

        ScuAuditoriaInSituRequest req = ScuAuditoriaInSituRequest.builder()
                .asignacionId(101L)
                .puntualidadDocente(PuntualidadDocente.AUSENTE)
                .concordanciaTema(ConcordanciaTema.CONFORME_PAC)
                .momentoObservado(TipoMomentoPedagogico.INICIO)
                .estudiantesPresentes(0)
                .estudiantesInscritos(30)
                .observacionesAuditor("Docente ausente sin reemplazo")
                .build();

        ScuAuditoriaInSituResponse res = this.finalizeCmd.execute(req);

        assertEquals(EstadoAuditoria.OBSERVADA_NO_CONFORME, res.getEstado());

        ArgumentCaptor<ReincidenciaDocente> captor = ArgumentCaptor.forClass(ReincidenciaDocente.class);
        verify(this.reincidenciaRepository).save(captor.capture());

        ReincidenciaDocente strike = captor.getValue();
        assertEquals(3, strike.getNroInfraccion());
        assertEquals(NivelReincidencia.NIVEL_3, strike.getNivel());
        assertEquals(EstadoReincidencia.ESCALADO_VICERRECTORADO, strike.getEstado());
    }
}
