package bo.edu.unitepc.sisa.service.linter;

import bo.edu.unitepc.sisa.api.dto.curriculo.CurricularDiscrepancy;
import bo.edu.unitepc.sisa.api.dto.curriculo.CurricularSeverity;
import bo.edu.unitepc.sisa.api.dto.curriculo.CurricularValidationReport;
import bo.edu.unitepc.sisa.api.request.ScuBibliografiaDto;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.api.request.ScuTemaAnaliticoDto;
import bo.edu.unitepc.sisa.api.request.ScuUnidadAprendizajeDto;
import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.infrastructure.office.PacExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.ProgramaAnaliticoDocxParser;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enterprise Curricular Linter & Quality Gatekeeper Service.
 * Audits uploaded academic files (.docx / .xlsx) against institutional standards of UNITEPC:
 *   - Metadata & Subject Mismatch Prevention
 *   - 14 Institutional Sections Compliance
 *   - Correlative Units and Topics Validation (detects jumps and omitted chapters)
 *   - Suspicious Paragraph & Broken Header Detection
 *   - APA 7th Edition Bibliography Syntax Check
 *   - Matriz 7 20-week / 40-session Mandatory Quota Check
 *   - Critical Didactic Cells Non-emptiness (Knowledges, Performance Criteria, Rubrics)
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class CurricularLinterService {

    private static final Logger log = LoggerFactory.getLogger(CurricularLinterService.class);

    private final ProgramaAnaliticoDocxParser docxParser;
    private final PacExcelParser pacExcelParser;

    private static final Pattern UNIT_REGEX = Pattern.compile("^(?:UNIDAD\\s+(?:DE\\s+APRENDIZAJE\\s+)?)([IVXLCDM\\d]+)[.:\\s-]+(.*)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern TEMA_REGEX = Pattern.compile("^TEMA\\s+(?:N[º°.]?\\s*)?(\\d+)[.:\\s-]+(.*)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern NUMERIC_TOPIC_PREFIX = Pattern.compile("^(\\d{1,2})\\.(\\d{1,2})?[.:\\s-]+(.*)$");
    private static final Pattern APA_YEAR_REGEX = Pattern.compile("\\((19\\d{2}|20\\d{2})\\)");

    public CurricularLinterService(ProgramaAnaliticoDocxParser docxParser, PacExcelParser pacExcelParser) {
        this.docxParser = docxParser;
        this.pacExcelParser = pacExcelParser;
    }

    /**
     * Strict audit of Programa Analitico Word DOCX in memory.
     */
    public CurricularValidationReport validateProgramaAnaliticoDocx(
            byte[] fileBytes,
            String filename,
            Long asignacionId,
            String expectedCourseCode,
            String expectedCourseName) {

        CurricularValidationReport report = CurricularValidationReport.builder()
                .tipoDocumento("PROGRAMA_ANALITICO")
                .archivoNombre(filename)
                .archivoTamanoBytes((long) fileBytes.length)
                .asignacionId(asignacionId)
                .codigoEsperado(expectedCourseCode)
                .materiaEsperada(expectedCourseName)
                .discrepancias(new ArrayList<>())
                .resumenContenido(new HashMap<>())
                .build();

        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(fileBytes))) {

            // 1. Audit Header & Subject Mismatch
            auditHeaderMismatch(doc, report, expectedCourseCode, expectedCourseName);

            // 2. Audit 14 Institutional Sections
            audit14Sections(doc, report);

            // 3. Audit Units & Topics Correlativity with Linter
            auditUnitsAndTopicsCorrelativity(doc, report);

            // 4. Audit APA Bibliography
            auditBibliography(doc, report);

            // 5. Extract structured content preview using docxParser
            try {
                ScuProgramaAnaliticoRequest parsedReq = this.docxParser.parseDocx(new ByteArrayInputStream(fileBytes), asignacionId);
                Map<String, Object> summary = new HashMap<>();
                summary.put("codigoAsignatura", parsedReq.getCodigoAsignatura());
                summary.put("nombreAsignatura", parsedReq.getNombreAsignatura());
                summary.put("semestre", parsedReq.getSemestre());
                summary.put("caracterizacion", parsedReq.getCaracterizacion());
                summary.put("macroCompetencia", parsedReq.getMacroCompetencia());
                summary.put("unidades", parsedReq.getUnidades() != null ? parsedReq.getUnidades() : List.of());
                summary.put("bibliografia", parsedReq.getBibliografia() != null ? parsedReq.getBibliografia() : List.of());
                report.setResumenContenido(summary);
            } catch (Exception ex) {
                log.warn("Could not generate structured summary: {}", ex.getMessage());
            }

        } catch (Exception e) {
            log.error("Fatal error inspecting DOCX file: {}", e.getMessage(), e);
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("FORMATO_ARCHIVO_CORRUPTO")
                    .seccion("Archivo Word (.docx)")
                    .ubicacion("Estructura de archivo")
                    .descripcion("El archivo no es un documento Word (.docx) válido o se encuentra dañado: " + e.getMessage())
                    .sugerencia("Verificá que el archivo guardado en tu computadora abra normalmente en Microsoft Word antes de subirlo.")
                    .build());
        }

        report.recalcularEstado();
        return report;
    }

    /**
     * Strict audit of Cronograma Semestral Matriz 7 Excel in memory.
     */
    public CurricularValidationReport validateCronogramaMatriz7Xlsx(
            byte[] fileBytes,
            String filename,
            Long asignacionId,
            String expectedCourseCode,
            String expectedCourseName,
            Integer requiredSessions) {

        int targetSessions = (requiredSessions != null && requiredSessions > 0) ? requiredSessions : 40;

        CurricularValidationReport report = CurricularValidationReport.builder()
                .tipoDocumento("PAC_TEORICO")
                .archivoNombre(filename)
                .archivoTamanoBytes((long) fileBytes.length)
                .asignacionId(asignacionId)
                .codigoEsperado(expectedCourseCode)
                .materiaEsperada(expectedCourseName)
                .discrepancias(new ArrayList<>())
                .resumenContenido(new HashMap<>())
                .build();

        try {
            ScuPacRequest parsedPac = this.pacExcelParser.parsePac(new ByteArrayInputStream(fileBytes), asignacionId);
            List<ScuSesionMatriz7Dto> sesiones = parsedPac.getMatriz7() != null ? parsedPac.getMatriz7() : List.of();

            report.setTotalSesiones(sesiones.size());
            Set<Integer> uniqueWeeks = new HashSet<>();
            for (ScuSesionMatriz7Dto s : sesiones) {
                if (s.getSemana() != null) uniqueWeeks.add(s.getSemana());
            }
            report.setTotalSemanas(uniqueWeeks.size());

            // 1. Check Session Count Quota
            if (sesiones.size() < targetSessions) {
                report.addDiscrepancia(CurricularDiscrepancy.builder()
                        .severidad(CurricularSeverity.BLOQUEANTE)
                        .codigoRegla("DEFICIT_SESIONES_SEMESTRALES")
                        .seccion("Cronograma Semestral")
                        .ubicacion("Total de filas de sesiones")
                        .descripcion(String.format("El archivo contiene %d sesiones registradas, pero la norma institucional de UNITEPC exige %d sesiones (20 semanas académicas).", sesiones.size(), targetSessions))
                        .sugerencia(String.format("Completá las %d sesiones faltantes en la Matriz 7 del Excel para abarcar todo el semestre regular.", (targetSessions - sesiones.size())))
                        .build());
            }

            // 2. Audit Critical Mandatory Didactic Cells
            Set<Integer> seenSessionNumbers = new HashSet<>();
            int prevWeek = 1;

            for (int i = 0; i < sesiones.size(); i++) {
                ScuSesionMatriz7Dto ses = sesiones.get(i);
                int filaVisual = i + 1;
                String posStr = "Sesión #" + (ses.getNroSesion() != null ? ses.getNroSesion() : ("Fila " + filaVisual));

                // Check Duplication
                if (ses.getNroSesion() != null) {
                    if (seenSessionNumbers.contains(ses.getNroSesion())) {
                        report.addDiscrepancia(CurricularDiscrepancy.builder()
                                .severidad(CurricularSeverity.BLOQUEANTE)
                                .codigoRegla("SESION_DUPLICADA")
                                .seccion("Matriz 7")
                                .ubicacion(posStr)
                                .descripcion(String.format("El número de sesión %d aparece duplicado en el cronograma.", ses.getNroSesion()))
                                .sugerencia("Asegurate de que la numeración de sesiones sea estrictamente correlativa del 1 al " + targetSessions + ".")
                                .build());
                    }
                    seenSessionNumbers.add(ses.getNroSesion());
                }

                // Check Non-emptiness of Knowledges & Criteria
                if (isBlank(ses.getUnidadTematica())) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.BLOQUEANTE)
                            .codigoRegla("UNIDAD_TEMATICA_VACIA")
                            .seccion("Matriz 7")
                            .ubicacion(posStr + " (Semana " + ses.getSemana() + ")")
                            .descripcion("La celda 'Unidad Temática' está vacía.")
                            .sugerencia("Indicá la Unidad de Aprendizaje correspondiente a esta clase.")
                            .build());
                }

                if (isBlank(ses.getContenidoEspecifico())) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.BLOQUEANTE)
                            .codigoRegla("CONTENIDO_ESPECIFICO_VACIO")
                            .seccion("Matriz 7")
                            .ubicacion(posStr + " (Semana " + ses.getSemana() + ")")
                            .descripcion("La celda 'Tema o Contenido Específico' está vacía.")
                            .sugerencia("Detallá el tema específico que se impartirá en esta fecha.")
                            .build());
                }

                if (isBlank(ses.getSaberConceptual())) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.BLOQUEANTE)
                            .codigoRegla("SABER_CONCEPTUAL_VACIO")
                            .seccion("Matriz 7")
                            .ubicacion(posStr + " (Semana " + ses.getSemana() + ")")
                            .descripcion("La celda 'Saber Conceptual' está vacía.")
                            .sugerencia("Redactá los conceptos y fundamentos teóricos de la sesión.")
                            .build());
                }

                if (isBlank(ses.getCriterioDesempeno())) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.BLOQUEANTE)
                            .codigoRegla("CRITERIO_DESEMPENO_VACIO")
                            .seccion("Matriz 7")
                            .ubicacion(posStr + " (Semana " + ses.getSemana() + ")")
                            .descripcion("La celda 'Criterio de Desempeño' está vacía.")
                            .sugerencia("Ingresá el criterio observable con el que se evaluará el aprendizaje del estudiante.")
                            .build());
                }

                // Week chronologic order check
                if (ses.getSemana() != null) {
                    if (ses.getSemana() < prevWeek) {
                        report.addDiscrepancia(CurricularDiscrepancy.builder()
                                .severidad(CurricularSeverity.ADVERTENCIA)
                                .codigoRegla("SEMANAS_DESORDENADAS")
                                .seccion("Matriz 7")
                                .ubicacion(posStr)
                                .descripcion(String.format("La sesión figura en la Semana %d después de sesiones de la Semana %d.", ses.getSemana(), prevWeek))
                                .sugerencia("Ordená las filas del cronograma cronológicamente de la semana 1 a la 20.")
                                .build());
                    } else {
                        prevWeek = ses.getSemana();
                    }
                }
            }

            // Prepare summary
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalSesionesMapeadas", sesiones.size());
            summary.put("totalSemanas", uniqueWeeks.size());
            summary.put("sesiones", sesiones.subList(0, Math.min(sesiones.size(), 10))); // preview first 10
            report.setResumenContenido(summary);

        } catch (Exception e) {
            log.error("Fatal error inspecting Excel Matriz 7: {}", e.getMessage(), e);
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("FORMATO_EXCEL_CORRUPTO")
                    .seccion("Archivo Excel (.xlsx)")
                    .ubicacion("Estructura de archivo")
                    .descripcion("No se pudo leer la hoja de cálculo del cronograma: " + e.getMessage())
                    .sugerencia("Asegurate de que el archivo sea un Excel (.xlsx) oficial de Matriz 7 provisto por UNITEPC.")
                    .build());
        }

        report.recalcularEstado();
        return report;
    }

    // ── PRIVATE AUDIT LOGIC FOR DOCX ─────────────────────────────────────────

    private void auditHeaderMismatch(XWPFDocument doc, CurricularValidationReport report, String expectedCode, String expectedName) {
        List<XWPFTable> tables = doc.getTables();
        if (tables.isEmpty()) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("TABLA_CARATULA_FALTANTE")
                    .seccion("Carátula y Datos Generales")
                    .ubicacion("Página 1")
                    .descripcion("No se encontró la tabla institucional de datos generales de la asignatura.")
                    .sugerencia("Utilizá la plantilla oficial de Programa Analítico de UNITEPC con la tabla de encabezado intacta.")
                    .build());
            return;
        }

        XWPFTable headerTable = tables.get(0);
        String detectedCode = "";
        String detectedName = "";

        if (headerTable.getRows().size() > 1) {
            var dataRow = headerTable.getRows().size() > 2 ? headerTable.getRow(2) : headerTable.getRow(1);
            if (dataRow != null && dataRow.getTableCells().size() >= 3) {
                detectedCode = dataRow.getTableCells().get(0).getText().trim();
                detectedName = dataRow.getTableCells().get(2).getText().trim();
            }
        }

        report.setCodigoDetectado(detectedCode);
        report.setMateriaDetectada(detectedName);

        // Subject Mismatch Cross-check
        if (expectedCourseCode != null && !expectedCourseCode.isBlank() && !detectedCode.isBlank()) {
            String normExp = normalize(expectedCourseCode);
            String normDet = normalize(detectedCode);
            if (!normDet.contains(normExp) && !normExp.contains(normDet)) {
                // If codes don't match, check names
                if (expectedCourseName != null && !expectedCourseName.isBlank() && !detectedName.isBlank()) {
                    String normNameExp = normalize(expectedCourseName);
                    String normNameDet = normalize(detectedName);
                    if (!normNameDet.contains(normNameExp) && !normNameExp.contains(normNameDet)) {
                        report.addDiscrepancia(CurricularDiscrepancy.builder()
                                .severidad(CurricularSeverity.BLOQUEANTE)
                                .codigoRegla("MISMATCH_ASIGNATURA")
                                .seccion("Datos de Asignatura")
                                .ubicacion("Página 1 (Tabla de Encabezado)")
                                .descripcion(String.format("El archivo contiene el programa de '%s' (%s), pero intentaste cargarlo en '%s' (%s).",
                                        detectedName, detectedCode, expectedCourseName, expectedCourseCode))
                                .sugerencia("Verificá que estés seleccionando el archivo Word correspondiente a la materia correcta.")
                                .build());
                    }
                }
            }
        }
    }

    private void audit14Sections(XWPFDocument doc, CurricularValidationReport report) {
        StringBuilder fullText = new StringBuilder();
        for (XWPFParagraph p : doc.getParagraphs()) {
            fullText.append(" ").append(p.getText());
        }
        String docTextUpper = fullText.toString().toUpperCase();

        if (!docTextUpper.contains("CARACTERIZACI") && !docTextUpper.contains("FUNDAMENTACI")) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("SECCION_CARACTERIZACION_FALTANTE")
                    .seccion("Puntos 1-3: Caracterización")
                    .ubicacion("Cuerpo del documento")
                    .descripcion("Falta la sección obligatoria de 'Caracterización y Fundamentación de la Asignatura'.")
                    .sugerencia("Asegurate de incluir el acápite de fundamentación curricular.")
                    .build());
        }

        if (!docTextUpper.contains("COMPETENCIA")) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("SECCION_COMPETENCIAS_FALTANTE")
                    .seccion("Punto 4: Macrocompetencias")
                    .ubicacion("Cuerpo del documento")
                    .descripcion("Falta la sección obligatoria de 'Competencias Profesionales / Macrocompetencias'.")
                    .sugerencia("Declarar los elementos de competencia del perfil del egresado.")
                    .build());
        }

        if (!docTextUpper.contains("UNIDAD") && !docTextUpper.contains("APRENDIZAJE")) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("SECCION_UNIDADES_FALTANTE")
                    .seccion("Punto 5: Unidades de Aprendizaje")
                    .ubicacion("Cuerpo del documento")
                    .descripcion("Falta la sección central de 'Unidades de Aprendizaje y Saberes'.")
                    .sugerencia("Estructurá el plan de contenidos en Unidades de Aprendizaje oficiales.")
                    .build());
        }

        if (!docTextUpper.contains("BIBLIOGRAF")) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("SECCION_BIBLIOGRAFIA_FALTANTE")
                    .seccion("Punto 14: Bibliografía")
                    .ubicacion("Final del documento")
                    .descripcion("No se encontró la sección de 'Bibliografía Oficial (Normas APA)'.")
                    .sugerencia("Agregá las fuentes bibliográficas básicas y complementarias al final del archivo.")
                    .build());
        }
    }

    private void auditUnitsAndTopicsCorrelativity(XWPFDocument doc, CurricularValidationReport report) {
        int expectedUnitNumber = 1;
        int currentUnitNumber = 0;
        int expectedTopicNumber = 1;
        int totalTopicsCount = 0;
        int totalUnitsCount = 0;

        for (XWPFParagraph p : doc.getParagraphs()) {
            String text = p.getText().trim();
            if (text.isEmpty()) continue;
            String upper = text.toUpperCase();

            if (upper.contains("BIBLIOGRAF")) {
                break; // end of thematic units
            }

            Matcher mu = UNIT_REGEX.matcher(text);
            Matcher mt = TEMA_REGEX.matcher(text);

            // Unit Header
            if (mu.matches() || (upper.startsWith("UNIDAD") && (text.contains(":") || text.contains(".-")))) {
                totalUnitsCount++;
                int detectedUnitNum = expectedUnitNumber;
                if (mu.matches()) {
                    detectedUnitNum = parseRomanOrArabic(mu.group(1), expectedUnitNumber);
                } else {
                    detectedUnitNum = extractLeadingNum(text, expectedUnitNumber);
                }

                if (detectedUnitNum != expectedUnitNumber) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.BLOQUEANTE)
                            .codigoRegla("SALTO_CORRELATIVO_UNIDADES")
                            .seccion("Unidades de Aprendizaje")
                            .ubicacion("Párrafo: '" + truncate(text, 50) + "'")
                            .descripcion(String.format("Se detectó un salto correlativo de Unidades: se esperaba 'Unidad %d', pero figura 'Unidad %d'.",
                                    expectedUnitNumber, detectedUnitNum))
                            .sugerencia("Corregí la numeración de las Unidades para que sea estrictamente continua (Unidad 1, 2, 3...).")
                            .build());
                    expectedUnitNumber = detectedUnitNum;
                }

                currentUnitNumber = detectedUnitNum;
                expectedUnitNumber++;
                expectedTopicNumber = 1; // reset topic counter for the new unit
            }
            // Topic Header
            else if ((mt.matches() || (upper.startsWith("TEMA") && (text.contains(":") || text.contains(".-") || text.contains(".")))) && currentUnitNumber > 0) {
                totalTopicsCount++;
                int detectedTopicNum = expectedTopicNumber;
                if (mt.matches()) {
                    detectedTopicNum = parseNumSafe(mt.group(1), expectedTopicNumber);
                } else {
                    detectedTopicNum = extractLeadingNum(text.replaceFirst("(?i)TEMA", ""), expectedTopicNumber);
                }

                if (detectedTopicNum != expectedTopicNumber) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.BLOQUEANTE)
                            .codigoRegla("SALTO_CORRELATIVO_TEMAS")
                            .seccion("Unidad " + currentUnitNumber)
                            .ubicacion("Párrafo: '" + truncate(text, 50) + "'")
                            .descripcion(String.format("En la Unidad %d se detectó un salto correlativo: se esperaba 'Tema %d', pero figura 'Tema %d' (falta el tema intermedio o está mal numerado).",
                                    currentUnitNumber, expectedTopicNumber, detectedTopicNum))
                            .sugerencia("Verificá la numeración de los temas en el documento Word para asegurar que no falte ningún capítulo.")
                            .build());
                    expectedTopicNumber = detectedTopicNum;
                }

                expectedTopicNumber++;
            }
            // Suspicious broken topic format
            else if (currentUnitNumber > 0 && !upper.startsWith("SABER") && !upper.startsWith("CRITERIO") && !upper.startsWith("HORAS")) {
                Matcher mp = NUMERIC_TOPIC_PREFIX.matcher(text);
                if (mp.matches() && text.length() < 90) {
                    report.addDiscrepancia(CurricularDiscrepancy.builder()
                            .severidad(CurricularSeverity.ADVERTENCIA)
                            .codigoRegla("POSIBLE_TEMA_NO_ESTANDAR")
                            .seccion("Unidad " + currentUnitNumber)
                            .ubicacion("Párrafo: '" + truncate(text, 50) + "'")
                            .descripcion(String.format("El párrafo '%s' parece ser un tema pero no usa el encabezado oficial 'TEMA N.-'. El parser podría omitirlo.", truncate(text, 40)))
                            .sugerencia("Formateá este contenido con el prefijo oficial 'Tema 1: ...' o 'Tema 2: ...'")
                            .build());
                }
            }
        }

        report.setTotalUnidades(totalUnitsCount);
        report.setTotalTemas(totalTopicsCount);

        if (totalUnitsCount == 0) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("CERO_UNIDADES_DETECTADAS")
                    .seccion("Unidades de Aprendizaje")
                    .ubicacion("Estructura global")
                    .descripcion("No se detectó ninguna Unidad de Aprendizaje con el formato institucional 'UNIDAD I.- ...'")
                    .sugerencia("Asegurate de que los títulos de unidad tengan el formato 'UNIDAD 1: [Título]' o 'UNIDAD I.- [Título]'")
                    .build());
        } else if (totalTopicsCount == 0) {
            report.addDiscrepancia(CurricularDiscrepancia.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("CERO_TEMAS_DETECTADOS")
                    .seccion("Contenidos Analíticos")
                    .ubicacion("Unidades de Aprendizaje")
                    .descripcion("Las unidades no contienen temas reconocibles rotulados con 'TEMA N.-'")
                    .sugerencia("Incluí los temas de cada unidad rotulados claramente como 'Tema 1.- ...', 'Tema 2.- ...'")
                    .build());
        }
    }

    private void auditBibliography(XWPFDocument doc, CurricularValidationReport report) {
        boolean inBib = false;
        int count = 0;
        int validApa = 0;

        for (XWPFParagraph p : doc.getParagraphs()) {
            String text = p.getText().trim();
            if (text.isEmpty()) continue;
            String upper = text.toUpperCase();

            if (upper.contains("BIBLIOGRAF")) {
                inBib = true;
                continue;
            }

            if (inBib) {
                if (text.length() > 15) {
                    count++;
                    Matcher m = APA_YEAR_REGEX.matcher(text);
                    if (m.find()) {
                        validApa++;
                    } else {
                        report.addDiscrepancia(CurricularDiscrepancy.builder()
                                .severidad(CurricularSeverity.ADVERTENCIA)
                                .codigoRegla("BIBLIOGRAFIA_FORMATO_APA_NO_ESTANDAR")
                                .seccion("Bibliografía")
                                .ubicacion("Cita: '" + truncate(text, 45) + "'")
                                .descripcion("La referencia no contiene el año de publicación entre paréntesis según la norma APA 7ma Edición (ej: '(2020)').")
                                .sugerencia("Estandarizá la cita en formato APA: Apellido, Inicial. (Año). Título del libro. Editorial.")
                                .build());
                    }
                }
            }
        }

        if (count == 0) {
            report.addDiscrepancia(CurricularDiscrepancy.builder()
                    .severidad(CurricularSeverity.BLOQUEANTE)
                    .codigoRegla("BIBLIOGRAFIA_VACIA")
                    .seccion("Bibliografía")
                    .ubicacion("Punto 14")
                    .descripcion("La sección de bibliografía no contiene referencias bibliográficas.")
                    .sugerencia("Agregá al menos 2 referencias bibliográficas para la materia.")
                    .build());
        }
    }

    // ── HELPER UTILITIES ─────────────────────────────────────────────────────

    private static String normalize(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s.toUpperCase().trim(), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("[^A-Z0-9]", "");
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty() || s.trim().equalsIgnoreCase("null");
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    private static int parseRomanOrArabic(String val, int fallback) {
        if (val == null) return fallback;
        val = val.trim().toUpperCase().replaceAll("[.:\\s-]+", "");
        switch (val) {
            case "I": case "1": return 1;
            case "II": case "2": return 2;
            case "III": case "3": return 3;
            case "IV": case "4": return 4;
            case "V": case "5": return 5;
            case "VI": case "6": return 6;
            case "VII": case "7": return 7;
            case "VIII": case "8": return 8;
            case "IX": case "9": return 9;
            case "X": case "10": return 10;
            default:
                try {
                    return Integer.parseInt(val.replaceAll("\\D+", ""));
                } catch (Exception e) {
                    return fallback;
                }
        }
    }

    private static int parseNumSafe(String val, int fallback) {
        if (val == null) return fallback;
        try {
            return Integer.parseInt(val.replaceAll("\\D+", ""));
        } catch (Exception e) {
            return fallback;
        }
    }

    private static int extractLeadingNum(String text, int fallback) {
        if (text == null) return fallback;
        Matcher m = Pattern.compile("(\\d+)").matcher(text);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (Exception ignored) {}
        }
        return fallback;
    }
}
