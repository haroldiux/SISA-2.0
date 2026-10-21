package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.response.ScuPacResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoGestion;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Asignatura;
import bo.edu.unitepc.sisa.domain.model.Campus;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.model.Gestion;
import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.AsignaturaRepository;
import bo.edu.unitepc.sisa.domain.repository.CampusRepository;
import bo.edu.unitepc.sisa.domain.repository.CarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.GestionRepository;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaMateriaRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.service.command.ScuGetPacByCarreraCmd;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ScuGetPacByCarreraCmd career-scoped PAC retrieval, code resolution,
 * and resilient auto-provisioning fallback.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
public class ScuGetPacByCarreraCmdTest {

    @Mock
    private PacRepository pacRepository;
    @Mock
    private CarreraRepository carreraRepository;
    @Mock
    private GestionRepository gestionRepository;
    @Mock
    private AsignacionDocenteRepository asignacionDocenteRepository;
    @Mock
    private AsignaturaRepository asignaturaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CampusRepository campusRepository;
    @Mock
    private SeaMateriaRepository seaMateriaRepository;

    private ScuGetPacByCarreraCmd getPacByCarreraCmd;

    @BeforeEach
    void setUp() {
        this.getPacByCarreraCmd = new ScuGetPacByCarreraCmd(
                this.pacRepository,
                this.carreraRepository,
                this.gestionRepository,
                this.asignacionDocenteRepository,
                this.asignaturaRepository,
                this.usuarioRepository,
                this.campusRepository,
                this.seaMateriaRepository
        );
    }

    @Test
    @DisplayName("Should query PAC entities and map audit metadata and course info to ScuPacResponse")
    void shouldQueryPacsAndMapResponse() {
        Carrera carrera = new Carrera("SIS", "Ingeniería de Sistemas", "Facultad de Ingeniería");
        carrera.setId(2L);

        Asignatura asignatura = new Asignatura();
        asignatura.setId(101L);
        asignatura.setCodigo("SIS-213");
        asignatura.setNombre("Programación III");
        asignatura.setSemestre(3);

        Usuario docente = new Usuario();
        docente.setId(5L);
        docente.setNombres("Carlos");
        docente.setApellidos("Mendoza");
        docente.setCi("4859201");

        Usuario reviewer = new Usuario();
        reviewer.setId(2L);
        reviewer.setNombres("Mariana");
        reviewer.setApellidos("Rios Vargas");

        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(50L);
        asig.setCarrera(carrera);
        asig.setAsignatura(asignatura);
        asig.setDocente(docente);

        Pac pac = new Pac();
        pac.setId(142L);
        pac.setAsignacion(asig);
        pac.setEstado(EstadoPlanificacion.ENVIADO_REVISION);
        pac.setObservacionesRevision("Revisión preliminar conforme");
        pac.setRevisadoPor(reviewer);
        pac.setRevisadoEn(OffsetDateTime.now());

        SesionMatriz7 s1 = new SesionMatriz7();
        s1.setId(1L);
        s1.setSemana(1);
        s1.setNroSesion(1);
        pac.addSesion(s1);

        when(this.pacRepository.findByCarreraAndGestion(2L, 1L))
                .thenReturn(List.of(pac));

        List<ScuPacResponse> responses = this.getPacByCarreraCmd.execute(2L, 1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        ScuPacResponse resp = responses.get(0);
        assertEquals(142L, resp.getId());
        assertEquals(50L, resp.getAsignacionId());
        assertEquals("SIS-213", resp.getCodigoAsignatura());
        assertEquals("Programación III", resp.getNombreAsignatura());
        assertEquals(3, resp.getSemestre());
        assertEquals(5L, resp.getDocenteId());
        assertEquals("Carlos Mendoza", resp.getDocenteNombre());
        assertEquals("4859201", resp.getDocenteCi());
        assertEquals(EstadoPlanificacion.ENVIADO_REVISION, resp.getEstado());
        assertEquals(2L, resp.getRevisadoPorId());
        assertEquals("Mariana Rios Vargas", resp.getRevisadoPorNombre());
        assertNotNull(resp.getRevisadoEn());
        assertEquals("Revisión preliminar conforme", resp.getObservacionesRevision());
        assertEquals(1, resp.getMatriz7Count());
    }

    @Test
    @DisplayName("Should resolve string career code CARSIS and default null gestion to active term")
    void shouldResolveStringCareerAndDefaultGestion() {
        Carrera carrera = new Carrera("SIS", "Ingeniería de Sistemas", "Facultad de Ingeniería");
        carrera.setId(2L);
        when(this.carreraRepository.findByCodigo("SIS")).thenReturn(Optional.of(carrera));

        Gestion gestionActiva = new Gestion();
        gestionActiva.setId(1L);
        gestionActiva.setCodigo("2-2026");
        gestionActiva.setEstado(EstadoGestion.PLANIFICACION);
        when(this.gestionRepository.findByEstado(EstadoGestion.PLANIFICACION))
                .thenReturn(List.of(gestionActiva));

        when(this.pacRepository.findByCarreraAndGestion(2L, 1L))
                .thenReturn(Collections.emptyList());

        List<ScuPacResponse> responses = this.getPacByCarreraCmd.execute("CARSIS", null);

        assertNotNull(responses);
        verify(this.pacRepository).findByCarreraAndGestion(2L, 1L);
    }

    @Test
    @DisplayName("Should auto-provision provisional PAC in ENVIADO_REVISION when assignment lacks PAC")
    void shouldAutoProvisionProvisionalPacWhenAssignmentLacksPac() {
        Carrera carrera = new Carrera("SIS", "Ingeniería de Sistemas", "Facultad de Ingeniería");
        carrera.setId(2L);

        Asignatura asignatura = new Asignatura();
        asignatura.setId(101L);
        asignatura.setCodigo("SIS-101");
        asignatura.setNombre("Algoritmos I");
        asignatura.setSemestre(1);

        Usuario docente = new Usuario();
        docente.setId(1L);
        docente.setNombres("Carlos");
        docente.setApellidos("Montaño Pérez");
        docente.setRol(RolUsuario.ROLE_DOCENTE);

        AsignacionDocente asig = new AsignacionDocente();
        asig.setId(99L);
        asig.setCarrera(carrera);
        asig.setAsignatura(asignatura);
        asig.setDocente(docente);

        when(this.asignacionDocenteRepository.findByGestionIdAndCarreraId(1L, 2L))
                .thenReturn(List.of(asig));
        when(this.pacRepository.findByAsignacionId(99L))
                .thenReturn(Optional.empty());

        when(this.pacRepository.save(any(Pac.class))).thenAnswer(invocation -> {
            Pac p = invocation.getArgument(0);
            p.setId(500L);
            return p;
        });

        Pac provisioned = new Pac();
        provisioned.setId(500L);
        provisioned.setAsignacion(asig);
        provisioned.setEstado(EstadoPlanificacion.ENVIADO_REVISION);

        when(this.pacRepository.findByCarreraAndGestion(2L, 1L))
                .thenReturn(List.of(provisioned));

        List<ScuPacResponse> responses = this.getPacByCarreraCmd.execute(2L, 1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(EstadoPlanificacion.ENVIADO_REVISION, responses.get(0).getEstado());
        verify(this.pacRepository, atLeastOnce()).save(any(Pac.class));
    }

    @Test
    @DisplayName("Should auto-provision course and PAC directly via autoProvisionPacForCourse")
    void shouldAutoProvisionPacForSpecificCourse() {
        Carrera carrera = new Carrera("SIS", "Ingeniería de Sistemas", "Facultad de Ingeniería");
        carrera.setId(2L);
        when(this.carreraRepository.findById(2L)).thenReturn(Optional.of(carrera));

        Asignatura asignatura = new Asignatura();
        asignatura.setId(201L);
        asignatura.setCodigo("SIS-301");
        asignatura.setNombre("Programación III");
        asignatura.setSemestre(3);

        when(this.asignaturaRepository.findByCodigo("SIS-301")).thenReturn(Optional.of(asignatura));
        when(this.asignacionDocenteRepository.findByGestionIdAndCarreraId(1L, 2L))
                .thenReturn(Collections.emptyList());

        Usuario docente = new Usuario();
        docente.setId(1L);
        docente.setNombres("Docente");
        docente.setApellidos("Titular");
        docente.setRol(RolUsuario.ROLE_DOCENTE);
        when(this.usuarioRepository.findAll()).thenReturn(List.of(docente));

        Campus campus = new Campus();
        campus.setId(1L);
        when(this.campusRepository.findAll()).thenReturn(List.of(campus));

        when(this.asignacionDocenteRepository.save(any(AsignacionDocente.class))).thenAnswer(i -> {
            AsignacionDocente a = i.getArgument(0);
            a.setId(77L);
            return a;
        });

        when(this.pacRepository.findByAsignacionId(77L)).thenReturn(Optional.empty());
        when(this.pacRepository.save(any(Pac.class))).thenAnswer(i -> {
            Pac p = i.getArgument(0);
            p.setId(900L);
            return p;
        });

        ScuPacResponse resp = this.getPacByCarreraCmd.autoProvisionPacForCourse("SIS-301", 2L, 1L);

        assertNotNull(resp);
        assertEquals(900L, resp.getId());
        assertEquals(77L, resp.getAsignacionId());
        assertEquals("SIS-301", resp.getCodigoAsignatura());
        assertEquals(EstadoPlanificacion.ENVIADO_REVISION, resp.getEstado());
        assertEquals(20, resp.getMatriz7Count());
    }
}
