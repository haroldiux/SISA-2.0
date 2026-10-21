package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.dto.AsistenciaEstudianteResumenDto;
import bo.edu.unitepc.sisa.api.dto.AsistenciaResumenDto;
import bo.edu.unitepc.sisa.api.dto.AsistenciaSesionDto;
import bo.edu.unitepc.sisa.api.request.AsistenciaEstudianteRequest;
import bo.edu.unitepc.sisa.api.request.GuardarAsistenciaRequest;
import bo.edu.unitepc.sisa.domain.enums.EstadoAsistencia;
import bo.edu.unitepc.sisa.domain.model.AsistenciaEstudiante;
import bo.edu.unitepc.sisa.domain.model.AsistenciaSesion;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaEstudianteRepository;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaSesionRepository;
import bo.edu.unitepc.sisa.service.command.ScuGetAsistenciaResumenCmd;
import bo.edu.unitepc.sisa.service.command.ScuSaveAsistenciaCmd;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ScuSaveAsistenciaCmd and ScuGetAsistenciaResumenCmd.
 *
 * @author GentleAI SISA Architecture Team
 */
@ExtendWith(MockitoExtension.class)
public class ScuAsistenciaCommandsTest {

    @Mock
    private AsistenciaSesionRepository sesionRepository;

    @Mock
    private AsistenciaEstudianteRepository estudianteRepository;

    private ScuSaveAsistenciaCmd saveAsistenciaCmd;
    private ScuGetAsistenciaResumenCmd getResumenCmd;

    @BeforeEach
    void setUp() {
        this.saveAsistenciaCmd = new ScuSaveAsistenciaCmd(this.sesionRepository);
        this.getResumenCmd = new ScuGetAsistenciaResumenCmd(this.sesionRepository, this.estudianteRepository);
    }

    @Test
    @DisplayName("Should create new session and child student marks when not previously registered")
    void shouldCreateNewSessionWhenNotFound() {
        LocalDate fecha = LocalDate.of(2026, 10, 21);
        GuardarAsistenciaRequest request = new GuardarAsistenciaRequest(
                "SIS-213",
                "Programación III",
                "2-2026",
                fecha,
                "TEORICA",
                "TA-01",
                "Patrones de Diseño",
                "Sin observaciones",
                List.of(
                        new AsistenciaEstudianteRequest("SIS-2024-001", "Mamani Flores Kevin", "CARSIS", "Ingeniería de Sistemas", "PRESENTE", null),
                        new AsistenciaEstudianteRequest("TEL-2024-015", "Condori Quispe Marisol", "CARELE", "Ingeniería de Telecomunicaciones", "FALTA", "Sin aviso")
                )
        );

        when(this.sesionRepository.findByMateriaCodigoAndFechaAndTipoClaseAndComisionWithEstudiantes(
                "SIS-213", fecha, "TEORICA", "TA-01")).thenReturn(Optional.empty());

        when(this.sesionRepository.save(any(AsistenciaSesion.class))).thenAnswer(invocation -> {
            AsistenciaSesion s = invocation.getArgument(0);
            s.setId(101L);
            long childId = 1L;
            for (AsistenciaEstudiante e : s.getEstudiantes()) {
                e.setId(childId++);
            }
            return s;
        });

        AsistenciaSesionDto result = this.saveAsistenciaCmd.execute(request, "docente.1001");

        assertNotNull(result);
        assertEquals(101L, result.id());
        assertEquals("SIS-213", result.materiaCodigo());
        assertEquals("TEORICA", result.tipoClase());
        assertEquals("TA-01", result.comision());
        assertEquals(2, result.estudiantes().size());
        assertEquals("docente.1001", result.registradoPor());
    }

    @Test
    @DisplayName("Should update existing session and preserve idempotency without duplicating records")
    void shouldUpdateExistingSessionIdempotently() {
        LocalDate fecha = LocalDate.of(2026, 10, 21);
        GuardarAsistenciaRequest request = new GuardarAsistenciaRequest(
                "SIS-213",
                "Programación III",
                "2-2026",
                fecha,
                "TEORICA",
                "TA-01",
                "Patrones Actualizados",
                "Actualización de tema",
                List.of(
                        new AsistenciaEstudianteRequest("SIS-2024-001", "Mamani Flores Kevin", "CARSIS", "Ingeniería de Sistemas", "PRESENTE", null),
                        new AsistenciaEstudianteRequest("TEL-2024-015", "Condori Quispe Marisol", "CARELE", "Ingeniería de Telecomunicaciones", "LICENCIA", "Licencia Médica")
                )
        );

        AsistenciaSesion existingSession = new AsistenciaSesion();
        existingSession.setId(50L);
        existingSession.setMateriaCodigo("SIS-213");
        existingSession.setFecha(fecha);
        existingSession.setTipoClase("TEORICA");
        existingSession.setComision("TA-01");
        existingSession.setTema("Tema anterior");

        AsistenciaEstudiante est1 = new AsistenciaEstudiante();
        est1.setId(1L);
        est1.setEstudianteCodigo("SIS-2024-001");
        est1.setEstudianteNombre("Mamani Flores Kevin");
        est1.setEstado(EstadoAsistencia.FALTA);
        existingSession.addEstudiante(est1);

        when(this.sesionRepository.findByMateriaCodigoAndFechaAndTipoClaseAndComisionWithEstudiantes(
                "SIS-213", fecha, "TEORICA", "TA-01")).thenReturn(Optional.of(existingSession));

        when(this.sesionRepository.save(any(AsistenciaSesion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AsistenciaSesionDto result = this.saveAsistenciaCmd.execute(request, "docente.1001");

        assertNotNull(result);
        assertEquals(50L, result.id());
        assertEquals("Patrones Actualizados", result.tema());
        // Verify est1 status was updated to PRESENTE and TEL-2024-015 was added
        assertEquals(2, result.estudiantes().size());
        assertTrue(result.estudiantes().stream().anyMatch(e -> e.estudianteCodigo().equals("SIS-2024-001") && e.estado().equals("PRESENTE")));
        assertTrue(result.estudiantes().stream().anyMatch(e -> e.estudianteCodigo().equals("TEL-2024-015") && e.estado().equals("LICENCIA")));
    }

    @Test
    @DisplayName("Should accurately calculate 80% rule compliance and identify students at risk")
    void shouldCalculate80PercentRuleCompliance() {
        String materiaCodigo = "SIS-213";
        String gestionCodigo = "2-2026";

        List<AsistenciaSesion> mockSesiones = new ArrayList<>();
        for (int i = 1; i <= 16; i++) {
            AsistenciaSesion s = new AsistenciaSesion();
            s.setId((long) i);
            s.setMateriaCodigo(materiaCodigo);
            s.setMateriaNombre("Programación III");
            s.setGestionCodigo(gestionCodigo);
            s.setFecha(LocalDate.of(2026, 8, 1).plusDays(i));
            mockSesiones.add(s);
        }

        List<AsistenciaEstudiante> mockMarks = new ArrayList<>();

        // Student 1: 15 Presentes, 1 Falta => (15 / 16) * 100 = 93.75% -> Cumple
        for (int i = 1; i <= 15; i++) {
            AsistenciaEstudiante ae = new AsistenciaEstudiante();
            ae.setEstudianteCodigo("SIS-2024-001");
            ae.setEstudianteNombre("Mamani Kevin");
            ae.setCarreraCodigo("CARSIS");
            ae.setCarreraNombre("Ingeniería de Sistemas");
            ae.setEstado(EstadoAsistencia.PRESENTE);
            mockMarks.add(ae);
        }
        AsistenciaEstudiante aeFalta1 = new AsistenciaEstudiante();
        aeFalta1.setEstudianteCodigo("SIS-2024-001");
        aeFalta1.setEstudianteNombre("Mamani Kevin");
        aeFalta1.setCarreraCodigo("CARSIS");
        aeFalta1.setCarreraNombre("Ingeniería de Sistemas");
        aeFalta1.setEstado(EstadoAsistencia.FALTA);
        mockMarks.add(aeFalta1);

        // Student 2: 11 Presentes, 5 Faltas => (11 / 16) * 100 = 68.75% -> En Riesgo (<80%)
        for (int i = 1; i <= 11; i++) {
            AsistenciaEstudiante ae = new AsistenciaEstudiante();
            ae.setEstudianteCodigo("SIS-2024-022");
            ae.setEstudianteNombre("Torrico Ramiro");
            ae.setCarreraCodigo("CARSIS");
            ae.setCarreraNombre("Ingeniería de Sistemas");
            ae.setEstado(EstadoAsistencia.PRESENTE);
            mockMarks.add(ae);
        }
        for (int i = 1; i <= 5; i++) {
            AsistenciaEstudiante ae = new AsistenciaEstudiante();
            ae.setEstudianteCodigo("SIS-2024-022");
            ae.setEstudianteNombre("Torrico Ramiro");
            ae.setCarreraCodigo("CARSIS");
            ae.setCarreraNombre("Ingeniería de Sistemas");
            ae.setEstado(EstadoAsistencia.FALTA);
            mockMarks.add(ae);
        }

        // Student 3: 14 Presentes, 2 Atrasos (0.5 weight) => (14 + 1.0) / 16 = 15/16 = 93.75% -> Cumple
        for (int i = 1; i <= 14; i++) {
            AsistenciaEstudiante ae = new AsistenciaEstudiante();
            ae.setEstudianteCodigo("TEL-2024-005");
            ae.setEstudianteNombre("Vargas Lucia");
            ae.setCarreraCodigo("CARELE");
            ae.setCarreraNombre("Ingeniería de Telecomunicaciones");
            ae.setEstado(EstadoAsistencia.PRESENTE);
            mockMarks.add(ae);
        }
        for (int i = 1; i <= 2; i++) {
            AsistenciaEstudiante ae = new AsistenciaEstudiante();
            ae.setEstudianteCodigo("TEL-2024-005");
            ae.setEstudianteNombre("Vargas Lucia");
            ae.setCarreraCodigo("CARELE");
            ae.setCarreraNombre("Ingeniería de Telecomunicaciones");
            ae.setEstado(EstadoAsistencia.ATRASO);
            mockMarks.add(ae);
        }

        when(this.sesionRepository.findByMateriaCodigoAndGestionCodigoOrderByFechaDesc(materiaCodigo, gestionCodigo))
                .thenReturn(mockSesiones);
        when(this.estudianteRepository.findByMateriaAndGestion(materiaCodigo, gestionCodigo))
                .thenReturn(mockMarks);

        AsistenciaResumenDto resumen = this.getResumenCmd.execute(materiaCodigo, gestionCodigo);

        assertNotNull(resumen);
        assertEquals(16, resumen.totalSesionesRegistradas());
        assertEquals(3, resumen.totalEstudiantesInscritos());
        assertEquals(1, resumen.estudiantesEnRiesgoCount()); // Only Torrico Ramiro is < 80%

        AsistenciaEstudianteResumenDto torrico = resumen.estudiantesResumen().stream()
                .filter(e -> e.estudianteCodigo().equals("SIS-2024-022"))
                .findFirst().orElseThrow();
        assertEquals(68.75, torrico.porcentajeAsistencia());
        assertFalse(torrico.cumpleNormativa80Pct());

        AsistenciaEstudianteResumenDto mamani = resumen.estudiantesResumen().stream()
                .filter(e -> e.estudianteCodigo().equals("SIS-2024-001"))
                .findFirst().orElseThrow();
        assertEquals(93.75, mamani.porcentajeAsistencia());
        assertTrue(mamani.cumpleNormativa80Pct());

        AsistenciaEstudianteResumenDto vargas = resumen.estudiantesResumen().stream()
                .filter(e -> e.estudianteCodigo().equals("TEL-2024-005"))
                .findFirst().orElseThrow();
        assertEquals(93.75, vargas.porcentajeAsistencia());
        assertTrue(vargas.cumpleNormativa80Pct());
    }
}
