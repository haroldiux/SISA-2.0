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
        File f1 = new File("../DOCUMENTOS BASE/" + filename);
        if (f1.exists()) return f1;
        File f2 = new File("DOCUMENTOS BASE/" + filename);
        if (f2.exists()) return f2;
        File f3 = new File("../../DOCUMENTOS BASE/" + filename);
        if (f3.exists()) return f3;
        File f4 = new File("c:/PROYECTOS/SISA/DOCUMENTOS BASE/" + filename);
        if (f4.exists()) return f4;
        File f5 = new File("/workspace/DOCUMENTOS BASE/" + filename);
        if (f5.exists()) return f5;
        return f1;
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

            // Check first session
            var firstSession = request.getMatriz7().get(0);
            assertEquals(1, firstSession.getSemana());
            assertEquals(1, firstSession.getNroSesion());
            assertNotNull(firstSession.getTipoSesion());
            assertNotNull(firstSession.getUnidadTematica());
        }
    }

    @Test
    @DisplayName("Should ingest real PLAN DE CLASES TALLER DE IDIOMAS.xlsx with 3 pedagogical moments")
    void shouldParseRealPlanClasesExcelDocument() throws Exception {
        File file = this._findBaseDocument("PLAN DE CLASES TALLER DE IDIOMAS.xlsx");
        Assumptions.assumeTrue(file.exists(), "Plan de Clases Excel base document must exist to run live ingestion test");

        try (InputStream is = new FileInputStream(file)) {
            List<ScuPlanClaseRequest> planes = this.planesParser.parsePlanes(is, 1L);

            assertNotNull(planes);
            assertFalse(planes.isEmpty(), "Should parse at least one Plan de Clase sheet");

            ScuPlanClaseRequest plan = planes.get(0);
            assertNotNull(plan.getObjetivoSesion());
            assertTrue(plan.getDuracionTotalMin() >= 45, "Duration should be at least 45 minutes");
            assertNotNull(plan.getMomentos());
            assertEquals(3, plan.getMomentos().size(), "Must contain 3 pedagogical moments (Inicio, Desarrollo, Cierre)");
        }
    }

    @Test
    @DisplayName("Should ingest real Programa Analitico PROGRAMACION III.docx with units and APA bibliography")
    void shouldParseRealProgramaAnaliticoDocx() throws Exception {
        File file = this._findBaseDocument("Programa Analitico PROGRAMACION III.docx");
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
}
