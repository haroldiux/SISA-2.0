package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuPacDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.PacParserStrategy;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.PlanClaseParserStrategy;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.impl.*;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.ResourceLoader;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration and unit tests verifying the 5 official UNITEPC curriculum Excel templates
 * with the new Strategy Pattern parsers and generators.
 *
 * @author GentleAI SISA Architecture Team
 */
public class MultiTypeCurriculumParsersIntegrationTest {

    private ResourceLoader resourceLoader;
    private PacGeneralParser pacGeneralParser;
    private PacPracticoParser pacPracticoParser;
    private PlanClaseTeoricoParser planTeoricoParser;
    private PlanClasePracticoParser planPracticoParser;
    private PlanClaseTeoricoPracticoParser planTeoricoPracticoParser;
    private ParserFactory parserFactory;

    @BeforeEach
    void setUp() {
        this.resourceLoader = new DefaultResourceLoader();
        this.pacGeneralParser = new PacGeneralParser(this.resourceLoader);
        this.pacPracticoParser = new PacPracticoParser(this.resourceLoader);
        this.planTeoricoParser = new PlanClaseTeoricoParser(this.resourceLoader);
        this.planPracticoParser = new PlanClasePracticoParser(this.resourceLoader);
        this.planTeoricoPracticoParser = new PlanClaseTeoricoPracticoParser(this.resourceLoader);

        this.parserFactory = new ParserFactory(
                List.of(this.pacGeneralParser, this.pacPracticoParser),
                List.of(this.planTeoricoParser, this.planPracticoParser, this.planTeoricoPracticoParser)
        );
    }

    private File findBaseDocument(String filename) {
        String[] dirs = {
                "src/main/resources/templates/",
                "src/test/resources/templates/",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/",
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/",
                "../../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/",
                "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/",
                "../DOCUMENTOS BASE/",
                "DOCUMENTOS BASE/",
                "../../DOCUMENTOS BASE/",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/",
                "/workspace/DOCUMENTOS BASE/"
        };
        for (String d : dirs) {
            File f = new File(d + filename);
            if (f.exists()) return f;
        }
        String internalName = switch (filename) {
            case "Copia de PAC-2026 GRAL_.xlsx" -> "template_pac_gral.xlsx";
            case "Copia de PAC-2026 PRACTICO.xlsx" -> "template_pac_practico.xlsx";
            case "Copia de PLAN DE CLASES PRÁCTICO.xlsx" -> "template_plan_practico.xlsx";
            case "Copia de PLAN DE CLASES TEÓRICO.xlsx" -> "template_plan_teorico.xlsx";
            case "Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx" -> "template_plan_teorico_practico.xlsx";
            default -> filename;
        };
        for (String d : dirs) {
            File f = new File(d + internalName);
            if (f.exists()) return f;
        }
        return new File("src/main/resources/templates/" + internalName);
    }

    @Test
    @DisplayName("1. Should parse official PAC-2026 GRAL_.xlsx template with 20-week matrix")
    void shouldParsePacGeneralTemplate() throws Exception {
        File file = findBaseDocument("Copia de PAC-2026 GRAL_.xlsx");
        Assumptions.assumeTrue(file.exists(), "PAC GRAL blank document must exist");

        byte[] bytes;
        try (InputStream is = new FileInputStream(file)) {
            bytes = is.readAllBytes();
        }

        // Test parser factory routing
        PacParserStrategy strategy = this.parserFactory.getPacParser("GRAL", bytes, file.getName());
        assertInstanceOf(PacGeneralParser.class, strategy);

        ScuPacDto dto = strategy.parse(new java.io.ByteArrayInputStream(bytes), file.getName());
        assertNotNull(dto);
        assertEquals("GRAL", dto.getPacType());
        assertNotNull(dto.getMatriz7(), "Matriz 7 must not be null");
        assertFalse(dto.getMatriz7().isEmpty(), "Matriz 7 must contain sessions");
        assertTrue(dto.getMatriz7().size() >= 20, "Must contain at least 20 weekly sessions, found: " + dto.getMatriz7().size());

        // Verify generation
        byte[] generated = strategy.generate(dto, null);
        assertNotNull(generated);
        assertTrue(generated.length > 5000, "Generated Excel must contain valid bytes");
    }

    @Test
    @DisplayName("2. Should parse official PAC-2026 PRACTICO.xlsx template with Contenidos, Modelo, and Cronograma")
    void shouldParsePacPracticoTemplate() throws Exception {
        File file = findBaseDocument("Copia de PAC-2026 PRACTICO.xlsx");
        Assumptions.assumeTrue(file.exists(), "PAC PRÁCTICO blank document must exist");

        byte[] bytes;
        try (InputStream is = new FileInputStream(file)) {
            bytes = is.readAllBytes();
        }

        // Test parser factory routing
        PacParserStrategy strategy = this.parserFactory.getPacParser("PRACTICO", bytes, file.getName());
        assertInstanceOf(PacPracticoParser.class, strategy);

        ScuPacDto dto = strategy.parse(new java.io.ByteArrayInputStream(bytes), file.getName());
        assertNotNull(dto);
        assertEquals("PRACTICO", dto.getPacType());
        assertNotNull(dto.getMatriz7(), "Practical sessions must not be null");
        assertFalse(dto.getMatriz7().isEmpty(), "Must contain practical sessions");

        // Verify that practical sessions have PRACTICA type
        assertTrue(dto.getMatriz7().stream().allMatch(s -> s.getTipoSesion() == TipoSesion.PRACTICA),
                "All sessions in PAC Practico must be of type PRACTICA");

        // Verify generation
        byte[] generated = strategy.generate(dto, null);
        assertNotNull(generated);
        assertTrue(generated.length > 5000, "Generated Excel must contain valid bytes");
    }

    @Test
    @DisplayName("3. Should parse official PLAN DE CLASES TEÓRICO.xlsx omitting procedimental saber")
    void shouldParsePlanClaseTeoricoTemplate() throws Exception {
        File file = findBaseDocument("Copia de PLAN DE CLASES TEÓRICO.xlsx");
        Assumptions.assumeTrue(file.exists(), "Plan Teórico blank document must exist");

        byte[] bytes;
        try (InputStream is = new FileInputStream(file)) {
            bytes = is.readAllBytes();
        }

        // Test parser factory routing
        PlanClaseParserStrategy strategy = this.parserFactory.getPlanClaseParser("TEORICO", bytes, file.getName());
        assertInstanceOf(PlanClaseTeoricoParser.class, strategy);

        List<ScuPlanClaseDto> planes = strategy.parse(new java.io.ByteArrayInputStream(bytes), file.getName());
        assertNotNull(planes);
        assertFalse(planes.isEmpty());
        assertEquals(3, planes.size(), "Should parse 3 sheets (UA-1, UA-2, UA-3)");

        for (ScuPlanClaseDto plan : planes) {
            assertEquals("TEORICO", plan.getTemplateType());
            assertNull(plan.getSaberProcedimental(), "Teórico plan MUST omit Saber Procedimental");
            assertNotNull(plan.getMomentos());
            assertEquals(3, plan.getMomentos().size(), "Must contain 3 moments (Inicio, Desarrollo, Cierre)");
            assertEquals(180, plan.getDuracionTotalMin().intValue(), "Total duration should equal 180 min");

            // Verify moments duration arithmetic
            int sum = plan.getMomentos().stream().mapToInt(m -> m.getDuracionMin()).sum();
            assertEquals(plan.getDuracionTotalMin().intValue(), sum, "Sum of moments must equal total duration");
        }

        // Verify generation
        byte[] generated = strategy.generate(planes, null);
        assertNotNull(generated);
        assertTrue(generated.length > 5000, "Generated Excel must contain valid bytes");
    }

    @Test
    @DisplayName("4. Should parse official PLAN DE CLASES PRÁCTICO.xlsx with 4-phase methodological model")
    void shouldParsePlanClasePracticoTemplate() throws Exception {
        File file = findBaseDocument("Copia de PLAN DE CLASES PRÁCTICO.xlsx");
        Assumptions.assumeTrue(file.exists(), "Plan Práctico blank document must exist");

        byte[] bytes;
        try (InputStream is = new FileInputStream(file)) {
            bytes = is.readAllBytes();
        }

        // Test parser factory routing
        PlanClaseParserStrategy strategy = this.parserFactory.getPlanClaseParser("PRACTICO", bytes, file.getName());
        assertInstanceOf(PlanClasePracticoParser.class, strategy);

        List<ScuPlanClaseDto> planes = strategy.parse(new java.io.ByteArrayInputStream(bytes), file.getName());
        assertNotNull(planes);
        assertFalse(planes.isEmpty());
        assertEquals(1, planes.size(), "Should parse sheet UA-1");

        ScuPlanClaseDto plan = planes.get(0);
        assertEquals("PRACTICO", plan.getTemplateType());
        assertNotNull(plan.getMomentos());
        assertEquals(4, plan.getMomentos().size(), "Must contain 4 practical phases (Preparación, Ejecución guiada, Ejecución autónoma, Cierre)");

        // Verify moments duration arithmetic
        int sum = plan.getMomentos().stream().mapToInt(m -> m.getDuracionMin()).sum();
        assertEquals(plan.getDuracionTotalMin().intValue(), sum, "Sum of practical moments must equal total duration");

        // Verify generation
        byte[] generated = strategy.generate(planes, null);
        assertNotNull(generated);
        assertTrue(generated.length > 5000, "Generated Excel must contain valid bytes");
    }

    @Test
    @DisplayName("5. Should parse official PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx with all 3 Saberes")
    void shouldParsePlanClaseTeoricoPracticoTemplate() throws Exception {
        File file = findBaseDocument("Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx");
        Assumptions.assumeTrue(file.exists(), "Plan Teórico-Práctico blank document must exist");

        byte[] bytes;
        try (InputStream is = new FileInputStream(file)) {
            bytes = is.readAllBytes();
        }

        // Test parser factory routing
        PlanClaseParserStrategy strategy = this.parserFactory.getPlanClaseParser("TEORICO_PRACTICO", bytes, file.getName());
        assertInstanceOf(PlanClaseTeoricoPracticoParser.class, strategy);

        List<ScuPlanClaseDto> planes = strategy.parse(new java.io.ByteArrayInputStream(bytes), file.getName());
        assertNotNull(planes);
        assertFalse(planes.isEmpty());
        assertEquals(3, planes.size(), "Should parse 3 sheets (UA-1, UA-2, UA-3)");

        for (ScuPlanClaseDto plan : planes) {
            assertEquals("TEORICO_PRACTICO", plan.getTemplateType());
            assertNotNull(plan.getMomentos());
            assertEquals(3, plan.getMomentos().size(), "Must contain 3 moments (Inicio, Desarrollo, Cierre)");

            int sum = plan.getMomentos().stream().mapToInt(m -> m.getDuracionMin()).sum();
            assertEquals(plan.getDuracionTotalMin().intValue(), sum, "Sum of moments must equal total duration");
        }

        // Verify generation
        byte[] generated = strategy.generate(planes, null);
        assertNotNull(generated);
        assertTrue(generated.length > 5000, "Generated Excel must contain valid bytes");
    }

    @Test
    @DisplayName("6. ParserFactory auto-detection correctly routes all 5 base templates without type hint")
    void shouldAutoDetectAllFiveTemplatesWithoutTypeHint() throws Exception {
        // 1. PAC GRAL
        File f1 = findBaseDocument("Copia de PAC-2026 GRAL_.xlsx");
        if (f1.exists()) {
            byte[] b1 = new FileInputStream(f1).readAllBytes();
            PacParserStrategy s1 = this.parserFactory.detectPacParser(b1, f1.getName());
            assertInstanceOf(PacGeneralParser.class, s1);
        }

        // 2. PAC PRÁCTICO
        File f2 = findBaseDocument("Copia de PAC-2026 PRACTICO.xlsx");
        if (f2.exists()) {
            byte[] b2 = new FileInputStream(f2).readAllBytes();
            PacParserStrategy s2 = this.parserFactory.detectPacParser(b2, f2.getName());
            assertInstanceOf(PacPracticoParser.class, s2);
        }

        // 3. Plan Teórico
        File f3 = findBaseDocument("Copia de PLAN DE CLASES TEÓRICO.xlsx");
        if (f3.exists()) {
            byte[] b3 = new FileInputStream(f3).readAllBytes();
            PlanClaseParserStrategy s3 = this.parserFactory.detectPlanClaseParser(b3, f3.getName());
            assertInstanceOf(PlanClaseTeoricoParser.class, s3);
        }

        // 4. Plan Práctico
        File f4 = findBaseDocument("Copia de PLAN DE CLASES PRÁCTICO.xlsx");
        if (f4.exists()) {
            byte[] b4 = new FileInputStream(f4).readAllBytes();
            PlanClaseParserStrategy s4 = this.parserFactory.detectPlanClaseParser(b4, f4.getName());
            assertInstanceOf(PlanClasePracticoParser.class, s4);
        }

        // 5. Plan Teórico-Práctico
        File f5 = findBaseDocument("Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx");
        if (f5.exists()) {
            byte[] b5 = new FileInputStream(f5).readAllBytes();
            PlanClaseParserStrategy s5 = this.parserFactory.detectPlanClaseParser(b5, f5.getName());
            assertInstanceOf(PlanClaseTeoricoPracticoParser.class, s5);
        }
    }
}
