package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.infrastructure.office.PacExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.PlanesClaseExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.ProgramaAnaliticoDocxParser;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test verifying high-fidelity ingestion of official UNITEPC base documents.
 *
 * @author GentleAI SISA Architecture Team
 */
public class RealDocumentIngestionIntegrationTest {

    private final PacExcelParser pacParser = new PacExcelParser();
    private final PlanesClaseExcelParser planesParser = new PlanesClaseExcelParser();
    private final ProgramaAnaliticoDocxParser docxParser = new ProgramaAnaliticoDocxParser();

    private File _findBaseDocument(String filename) {
        String[] dirs = {
            "../DOCUMENTOS BASE/",
            "DOCUMENTOS BASE/",
            "../../DOCUMENTOS BASE/",
            "c:/PROYECTOS/SISA/DOCUMENTOS BASE/",
            "/workspace/DOCUMENTOS BASE/",
            "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/",
            "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/",
            "../../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/",
            "c:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/",
            "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/"
        };
        for (String d : dirs) {
            File f = new File(d + filename);
            if (f.exists()) return f;
        }
        return new File("../DOCUMENTOS BASE/" + filename);
    }

    @Test
    @DisplayName("Should ingest real PAC TALLER DE IDIOMAS.xlsx file with full Matriz 7 sessions")
    void shouldParseRealPacExcelDocument() throws Exception {
        File file = this._findBaseDocument("PAC TALLER DE IDIOMAS.xlsx");
        Assumptions.assumeTrue(file.exists(), "PAC Excel base document must exist to run live ingestion test");

        try (InputStream is = new FileInputStream(file)) {
            ScuPacRequest request = this.pacParser.parsePac(is, 101L);

            assertNotNull(request);
            assertEquals(101L, request.getAsignacionId());
            assertNotNull(request.getMatriz7());
            assertFalse(request.getMatriz7().isEmpty(), "Matriz 7 sessions must not be empty");
            assertTrue(request.getMatriz7().size() >= 30, "Should parse all sessions (found " + request.getMatriz7().size() + ")");
            assertEquals(39, request.getMatriz7().size(), "PAC Taller de Idiomas must parse exactly 39 sessions");

            // Check first session
            var firstSession = request.getMatriz7().get(0);
            assertEquals(1, firstSession.getSemana());
            assertEquals(1, firstSession.getNroSesion());
            assertNotNull(firstSession.getTipoSesion());
            assertNotNull(firstSession.getUnidadTematica());
        }
    }

    @Test
    @DisplayName("Should ingest real PLAN DE CLASES TALLER DE IDIOMAS.xlsx with 3 pedagogical moments per sheet")
    void shouldParseRealPlanClasesExcelDocument() throws Exception {
        File file = this._findBaseDocument("PLAN DE CLASES TALLER DE IDIOMAS.xlsx");
        Assumptions.assumeTrue(file.exists(), "Plan de Clases Excel base document must exist to run live ingestion test");

        try (InputStream is = new FileInputStream(file)) {
            List<ScuPlanClaseRequest> planes = this.planesParser.parsePlanes(is, 1L);

            assertNotNull(planes);
            assertEquals(6, planes.size(), "Should parse all 6 Plan de Clase sheets");

            for (ScuPlanClaseRequest plan : planes) {
                assertNotNull(plan.getObjetivoSesion());
                assertTrue(plan.getDuracionTotalMin() >= 45, "Duration should be at least 45 minutes");
                assertNotNull(plan.getMomentos());
                assertEquals(3, plan.getMomentos().size(), "Must contain exactly 3 pedagogical moments (Inicio, Desarrollo, Cierre)");
                assertTrue(plan.getMomentos().stream().noneMatch(m -> m.getDuracionMin() == 0),
                        "All moments must retain positive valid duration (no 0-duration duplicates)");
            }
        }
    }

    @Test
    @DisplayName("Should ingest real Programa Analitico PROGRAMACION III.docx with units and APA bibliography")
    void shouldParseRealProgramaAnaliticoDocx() throws Exception {
        File file = this._findBaseDocument("Programa Analitico PROGRAMACION III.docx");
        if (!file.exists()) {
            file = this._findBaseDocument("PROGRAMACIÓN III.docx");
        }
        Assumptions.assumeTrue(file.exists(), "Programa Analítico Word base document must exist to run live ingestion test");

        try (InputStream is = new FileInputStream(file)) {
            ScuProgramaAnaliticoRequest request = this.docxParser.parseDocx(is, 101L);

            assertNotNull(request);
            assertEquals(101L, request.getAsignacionId());
            assertNotNull(request.getCaracterizacion());
            assertNotNull(request.getMacroCompetencia());
            assertNotNull(request.getSistemaEvaluacion());
            assertNotNull(request.getUnidades());
            assertFalse(request.getUnidades().isEmpty(), "Should extract learning units");
            assertNotNull(request.getBibliografia());
            assertFalse(request.getBibliografia().isEmpty(), "Should extract bibliography entries");
        }
    }

    @Test
    @DisplayName("Should ingest real PROGRAMA ANALITICO TALLER DE IDIOMAS ICEC 23.docx with bullet topics extracted")
    void shouldParseRealProgramaAnaliticoTallerIdiomasDocx() throws Exception {
        File file = this._findBaseDocument("PROGRAMA ANALITICO TALLER DE IDIOMAS ICEC 23.docx");
        Assumptions.assumeTrue(file.exists(), "Taller de Idiomas Word base document must exist to run live ingestion test");

        try (InputStream is = new FileInputStream(file)) {
            ScuProgramaAnaliticoRequest request = this.docxParser.parseDocx(is, 101L);

            assertNotNull(request);
            assertEquals(101L, request.getAsignacionId());
            assertNotNull(request.getUnidades());
            assertEquals(2, request.getUnidades().size(), "Should extract 2 learning units");

            // Verify Unidad 1 has all 3 bullet topics extracted
            var u1 = request.getUnidades().get(0);
            assertNotNull(u1.getTemas());
            assertEquals(3, u1.getTemas().size(), "Unidad 1 must have 3 extracted topics");
            assertNotNull(u1.getSaberesConceptuales());
            assertFalse(u1.getSaberesConceptuales().isBlank(), "Saberes conceptuales must be populated");
            assertTrue(u1.getSaberesConceptuales().contains("CONCEPTOS DE LINGÜÍSTICA GENERAL"));

            // Verify Unidad 2 has all 3 bullet topics extracted
            var u2 = request.getUnidades().get(1);
            assertNotNull(u2.getTemas());
            assertEquals(3, u2.getTemas().size(), "Unidad 2 must have 3 extracted topics");
            assertNotNull(u2.getSaberesConceptuales());
            assertFalse(u2.getSaberesConceptuales().isBlank(), "Saberes conceptuales must be populated");
            assertTrue(u2.getSaberesConceptuales().contains("MORFOLOGÍA NOMINAL DEL QUECHUA"));

            // Verify bibliography
            assertNotNull(request.getBibliografia());
            assertFalse(request.getBibliografia().isEmpty(), "Should extract bibliography entries");
        }
    }
}
