package bo.edu.unitepc.sisa.infrastructure.office.strategy.impl;

import bo.edu.unitepc.sisa.api.request.ScuPacDto;
import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.domain.enums.HitoEvaluativo;
import bo.edu.unitepc.sisa.domain.enums.InstrumentoEvaluacion;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import bo.edu.unitepc.sisa.infrastructure.office.XlsxTemplateCloner;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.PacParserStrategy;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Concrete strategy for parsing and generating UNITEPC PAC General (PAC GRAL) Excel workbooks.
 * Standard 7-11 sections and 20-week cronograma matrix.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class PacGeneralParser implements PacParserStrategy {

    private static final Logger log = LoggerFactory.getLogger(PacGeneralParser.class);

    private final ResourceLoader resourceLoader;

    public PacGeneralParser(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public boolean supports(String pacType) {
        if (pacType == null) return false;
        String t = pacType.trim().toUpperCase();
        return t.equals("GRAL") || t.equals("GENERAL") || t.equals("TA") || t.equals("TEORICO")
                || (t.contains("PROGRAMA DE ASIGNATURA") && !t.contains("PRÁCTIC") && !t.contains("PRACTIC"));
    }

    @Override
    public ScuPacDto parse(InputStream inputStream, String filename) {
        ScuPacDto dto = new ScuPacDto();
        dto.setPacType("GRAL");
        dto.setComponentType("TA");

        try {
            byte[] bytes = inputStream.readAllBytes();
            try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
                List<ScuSesionMatriz7Dto> bestSessions = new ArrayList<>();

                for (int si = 0; si < wb.getNumberOfSheets(); si++) {
                    XSSFSheet sh = wb.getSheetAt(si);
                    if (sh.getSheetName().toUpperCase().contains("EJEMPLO")) continue;

                    List<ScuSesionMatriz7Dto> sheetSessions = new ArrayList<>();
                    parseSheetDynamic(sh, dto, sheetSessions);
                    if (sheetSessions.size() > bestSessions.size()) {
                        bestSessions = sheetSessions;
                    }
                }

                if (bestSessions.isEmpty()) {
                    bestSessions = createDefaultGralSessions();
                }
                dto.setMatriz7(bestSessions);
            }
        } catch (Exception e) {
            log.error("Error parsing PAC General spreadsheet: {}", e.getMessage(), e);
            throw new RuntimeException("Error al parsear documento PAC GRAL: " + e.getMessage(), e);
        }

        return dto;
    }

    @Override
    public byte[] generate(ScuPacDto pacDto, Map<String, Object> context) {
        try (InputStream templateIs = openTemplateStream()) {
            if (templateIs != null) {
                try (XlsxTemplateCloner cloner = new XlsxTemplateCloner(templateIs)) {
                    XSSFSheet sheet = cloner.getSheetAt(0);
                    populateGralSheet(sheet, pacDto);
                    return cloner.toByteArray();
                }
            }
        } catch (Exception e) {
            log.warn("Could not load PAC GRAL template, building programmatically: {}", e.getMessage());
        }

        return buildProgrammaticWorkbook(pacDto);
    }

    private void parseSheetDynamic(XSSFSheet sh, ScuPacDto req, List<ScuSesionMatriz7Dto> outSessions) {
        String currentSection = null;
        int currentWeek = 1;
        String currentUnit = "";

        StringBuilder justBuilder = new StringBuilder();
        StringBuilder propBuilder = new StringBuilder();
        StringBuilder evalBuilder = new StringBuilder();
        StringBuilder normBuilder = new StringBuilder();
        StringBuilder bibBuilder = new StringBuilder();

        for (int r = 0; r <= sh.getLastRowNum(); r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String colB = cellStr(row, 1);
            String colC = cellStr(row, 2);
            String colD = cellStr(row, 3);
            String colF = cellStr(row, 5);

            // Detect Main Section Boundaries
            if (matchesAnchor(colB, "1.- Identificación", "1. Identificación", "1. IDENTIFICACIÓN", "1. DATOS GENERALES")) {
                currentSection = "SEC_1";
            } else if (matchesAnchor(colB, "2.- Docente", "2. Docente", "2. DOCENTE", "2. INFORMACIÓN DOCENTE")) {
                currentSection = "SEC_2";
            } else if (matchesAnchor(colB, "3.- Justificación", "3. Justificación", "3. JUSTIFICACIÓN")) {
                currentSection = "SEC_3";
                continue;
            } else if (matchesAnchor(colB, "4.- Propósito", "4. Propósito", "4. PROPÓSITO")) {
                currentSection = "SEC_4";
                continue;
            } else if (matchesAnchor(colB, "5.- Competencias", "5. Competencias", "5. COMPETENCIAS")) {
                currentSection = "SEC_5";
            } else if (matchesAnchor(colB, "6.- Elementos", "6. Elementos", "6. ELEMENTOS")) {
                currentSection = "SEC_6";
            } else if (matchesAnchor(colB, "7.- Estructura", "7. Estructura", "7. ESTRUCTURA", "CRONOGRAMA")) {
                currentSection = "SEC_7";
            } else if (matchesAnchor(colB, "8. Metodología", "8.- Metodología", "8. METODOLOGÍA", "8. METODOLOGÍAS")) {
                currentSection = "SEC_8";
            } else if (matchesAnchor(colB, "9. Sistema", "9.- Sistema", "9. SISTEMA")) {
                currentSection = "SEC_9";
            } else if (matchesAnchor(colB, "10. REGLAMENTO", "10.- Reglamento", "12.- Criterios", "12. Criterios", "12. CRITERIOS", "12.- Normativa")) {
                currentSection = "SEC_10";
            } else if (matchesAnchor(colB, "11. BIBLIOGRAFÍA", "14.- Bibliografía", "14. Bibliografía", "14. BIBLIOGRAFÍA")) {
                currentSection = "SEC_11";
                continue;
            }

            if ("SEC_1".equals(currentSection)) {
                for (int c = 0; c < row.getLastCellNum(); c++) {
                    String val = cellStr(row, c).toUpperCase();
                    if (val.contains("ASIGNATURA:")) req.setNombreAsignatura(cellStr(row, c + 1));
                    else if (val.contains("CÓDIGO:")) req.setCodigoAsignatura(cellStr(row, c + 1));
                    else if (val.contains("CARRERA:")) req.setCarrera(cellStr(row, c + 1));
                    else if (val.contains("TIPO DE CURSO:")) req.setTipoCurso(cellStr(row, c + 1));
                    else if (val.contains("MODALIDAD:")) req.setModalidad(cellStr(row, c + 1));
                    else if (val.contains("SEMESTRE:")) req.setSemestre(cellStr(row, c + 1));
                    else if (val.contains("PRE-REQUISITO:")) req.setPreRequisito(cellStr(row, c + 1));
                    else if (val.contains("CRÉDITOS:")) req.setCreditos(cellStr(row, c + 1));
                    else if (val.contains("CARGA HORARIA")) req.setCargaHorariaTotal(cellStr(row, c + 1));
                    else if (val.contains("HORAS TEÓRICAS") || val.contains("HORAS T/P")) req.setHorasTeoricasPracticas(cellStr(row, c + 1));
                    else if (val.contains("SESIONES SEMANALES:")) req.setSesionesSemanales(cellStr(row, c + 1));
                }
            } else if ("SEC_2".equals(currentSection)) {
                for (int c = 0; c < row.getLastCellNum(); c++) {
                    String val = cellStr(row, c).toLowerCase();
                    if (val.contains("nombre del docente:")) req.setNombreDocente(cellStr(row, c + 1));
                    else if (val.contains("email") || val.contains("correo")) req.setEmailDocente(cellStr(row, c + 1));
                    else if (val.contains("formación:") || val.contains("formacion:")) req.setFormacionDocente(cellStr(row, c + 1));
                    else if (val.contains("teléfono:") || val.contains("telefono:")) req.setTelefonoDocente(cellStr(row, c + 1));
                }
            } else if ("SEC_3".equals(currentSection)) {
                if (!colB.isEmpty() && !colB.startsWith("4.-") && !colB.startsWith("4.")) {
                    if (justBuilder.length() > 0) justBuilder.append("\n");
                    justBuilder.append(colB);
                }
            } else if ("SEC_4".equals(currentSection)) {
                if (!colB.isEmpty() && !colB.startsWith("5.-") && !colB.startsWith("5.")) {
                    if (propBuilder.length() > 0) propBuilder.append("\n");
                    propBuilder.append(colB);
                }
            } else if ("SEC_5".equals(currentSection)) {
                if (colB.toLowerCase().contains("competencia global")) {
                    String cg = !colD.isEmpty() ? colD : colC;
                    if (!cg.isEmpty()) req.setCompetenciaGlobal(cg);
                } else if (colB.toLowerCase().contains("unidad de competencia")) {
                    String uc = !colD.isEmpty() ? colD : colC;
                    if (!uc.isEmpty()) req.setUnidadCompetencia(uc);
                }
            } else if ("SEC_6".equals(currentSection)) {
                if (colB.toLowerCase().contains("elemento de competencia")) {
                    String val = !colD.isEmpty() ? colD : (!colC.isEmpty() ? colC : cellStr(row, 4));
                    if (!val.isBlank()) {
                        req.getElementosCompetencia().add(val.trim());
                        if (colB.contains("1") && req.getElementoCompetencia1() == null) {
                            req.setElementoCompetencia1(val.trim());
                        } else if (colB.contains("2") && req.getElementoCompetencia2() == null) {
                            req.setElementoCompetencia2(val.trim());
                        }
                    }
                }
            } else if ("SEC_7".equals(currentSection)) {
                if (colB.toUpperCase().startsWith("UNIDAD ") || colB.toUpperCase().startsWith("UNIDAD:")) {
                    currentUnit = colB.trim();
                }

                Integer parsedWeek = parseNumericWeek(colB);
                if (parsedWeek != null) {
                    currentWeek = parsedWeek;
                }

                Integer nroSes = parseOrdinal(colC);
                if (nroSes != null) {
                    String nroTema = cellStr(row, 3);
                    String titTema = cellStr(row, 4);
                    String conc    = cellStr(row, 5);
                    String proc    = cellStr(row, 6);
                    String act     = cellStr(row, 7);
                    String crit    = cellStr(row, 8);
                    String inst    = cellStr(row, 9);

                    String ut = currentUnit;
                    if (ut == null || ut.isEmpty()) {
                        ut = !nroTema.isEmpty() ? nroTema : ("Unidad " + (Math.min((currentWeek - 1) / 5 + 1, 4)));
                    }

                    String temaEsp;
                    if (!nroTema.isEmpty() && !titTema.isEmpty()) {
                        String cleanNro = nroTema.trim();
                        if (!cleanNro.endsWith(":") && !cleanNro.endsWith("-")) {
                            cleanNro += ":";
                        }
                        temaEsp = cleanNro + " " + titTema.trim();
                    } else if (!titTema.isEmpty()) {
                        temaEsp = titTema.trim();
                    } else if (!nroTema.isEmpty()) {
                        temaEsp = nroTema.trim();
                    } else {
                        temaEsp = "";
                    }

                    TipoSesion t = (nroTema + " " + titTema).toUpperCase().contains("PRACT") ? TipoSesion.PRACTICA : TipoSesion.TEORICA;

                    outSessions.add(ScuSesionMatriz7Dto.builder()
                            .semana(currentWeek)
                            .nroSesion(nroSes)
                            .fechaProgramada(LocalDate.now())
                            .tipoSesion(t)
                            .unidadTematica(ut)
                            .contenidoEspecifico(temaEsp)
                            .saberConceptual(conc)
                            .saberProcedimental(proc)
                            .saberActitudinal(act)
                            .criterioDesempeno(crit)
                            .evidenciaAprendizaje(inst)
                            .instrumentoEvaluacion(instrEnum(inst))
                            .hitoEvaluativo(hitoEnum(nroTema + " " + titTema))
                            .build());
                }
            } else if ("SEC_8".equals(currentSection)) {
                if (colB.toLowerCase().contains("aula:")) {
                    req.setMetodologiaAula(colC);
                } else if (!colB.isEmpty() && !colB.startsWith("8.") && req.getMetodologiaAula() == null) {
                    req.setMetodologiaAula(colB);
                }
            } else if ("SEC_9".equals(currentSection)) {
                if (!colB.isEmpty() && !colB.startsWith("10.") && !colB.startsWith("11.") && !colB.startsWith("12.")) {
                    String textB = colB;
                    if (textB.contains("1er Parcial") || textB.contains("Nota teórica") || textB.contains("parámetros")) {
                        parseEvaluationScores(textB, req);
                    }
                    if (!textB.isBlank() && !textB.startsWith("9. Sistema") && !textB.startsWith("9.- Sistema")) {
                        if (evalBuilder.length() > 0) evalBuilder.append("\n\n");
                        evalBuilder.append(textB);
                    }
                    if (!colF.isEmpty()) {
                        if (evalBuilder.length() > 0) evalBuilder.append("\n\n");
                        evalBuilder.append(colF);
                    }
                }
            } else if ("SEC_10".equals(currentSection)) {
                String text = !colF.isEmpty() ? colF : colB;
                if (!text.isEmpty() && !text.startsWith("10.") && !text.startsWith("11.") && !text.startsWith("12.")) {
                    if (normBuilder.length() > 0) normBuilder.append("\n");
                    normBuilder.append(text);
                }
            } else if ("SEC_11".equals(currentSection)) {
                if (!colB.isEmpty() && !colB.startsWith("11.") && !colB.startsWith("14.")) {
                    if (bibBuilder.length() > 0) bibBuilder.append("\n\n");
                    bibBuilder.append(colB);
                }
            }
        }

        if (justBuilder.length() > 0 && (req.getJustificacion() == null || req.getJustificacion().isEmpty())) {
            req.setJustificacion(justBuilder.toString());
        }
        if (propBuilder.length() > 0 && (req.getPropositoGeneral() == null || req.getPropositoGeneral().isEmpty())) {
            req.setPropositoGeneral(propBuilder.toString());
        }
        if (evalBuilder.length() > 0 && (req.getSistemaEvaluacion() == null || req.getSistemaEvaluacion().isEmpty())) {
            req.setSistemaEvaluacion(evalBuilder.toString());
        }
        if (normBuilder.length() > 0 && (req.getNormativaCurso() == null || req.getNormativaCurso().isEmpty())) {
            req.setNormativaCurso(normBuilder.toString());
        }
        if (bibBuilder.length() > 0 && (req.getBibliografiaOficial() == null || req.getBibliografiaOficial().isEmpty())) {
            req.setBibliografiaOficial(bibBuilder.toString());
        }
    }

    private void populateGralSheet(XSSFSheet sheet, ScuPacDto dto) {
        if (dto == null) return;

        setCell(sheet, 11, 2, dto.getCarrera());
        setCell(sheet, 12, 2, dto.getNombreAsignatura());
        setCell(sheet, 12, 7, dto.getCodigoAsignatura());
        setCell(sheet, 13, 7, dto.getTipoCurso());
        setCell(sheet, 14, 2, dto.getModalidad());
        setCell(sheet, 14, 7, dto.getSemestre());
        setCell(sheet, 15, 2, dto.getPreRequisito());
        setCell(sheet, 15, 7, dto.getCreditos());
        setCell(sheet, 16, 2, dto.getCargaHorariaTotal());
        setCell(sheet, 16, 7, dto.getHorasTeoricasPracticas());
        setCell(sheet, 17, 2, dto.getSesionesSemanales());

        // Docente
        setCell(sheet, 21, 2, dto.getNombreDocente());
        setCell(sheet, 21, 7, dto.getEmailDocente());
        setCell(sheet, 22, 2, dto.getFormacionDocente());
        setCell(sheet, 22, 7, dto.getTelefonoDocente());

        // Justificación & Propósito
        if (dto.getJustificacion() != null) setCell(sheet, 25, 1, dto.getJustificacion());
        if (dto.getPropositoGeneral() != null) setCell(sheet, 29, 1, dto.getPropositoGeneral());

        // Competencias
        if (dto.getCompetenciaGlobal() != null) setCell(sheet, 34, 2, dto.getCompetenciaGlobal());
        if (dto.getUnidadCompetencia() != null) setCell(sheet, 35, 2, dto.getUnidadCompetencia());

        // Elementos
        if (dto.getElementosCompetencia() != null) {
            for (int i = 0; i < dto.getElementosCompetencia().size() && i < 8; i++) {
                setCell(sheet, 39 + i, 2, dto.getElementosCompetencia().get(i));
            }
        }

        // Populate sessions in cronograma matrix
        if (dto.getMatriz7() != null) {
            int rowIdx = 54;
            for (ScuSesionMatriz7Dto ses : dto.getMatriz7()) {
                while (rowIdx <= sheet.getLastRowNum()) {
                    Row r = sheet.getRow(rowIdx);
                    if (r != null) {
                        String colC = cellStr(r, 2);
                        if (colC.endsWith("°") || parseOrdinal(colC) != null) {
                            setCell(sheet, rowIdx, 3, ses.getContenidoEspecifico());
                            setCell(sheet, rowIdx, 4, ses.getContenidoEspecifico());
                            setCell(sheet, rowIdx, 5, ses.getSaberConceptual());
                            setCell(sheet, rowIdx, 6, ses.getSaberProcedimental());
                            setCell(sheet, rowIdx, 7, ses.getSaberActitudinal());
                            setCell(sheet, rowIdx, 8, ses.getCriterioDesempeno());
                            setCell(sheet, rowIdx, 9, ses.getEvidenciaAprendizaje());
                            rowIdx++;
                            break;
                        }
                    }
                    rowIdx++;
                }
            }
        }
    }

    private byte[] buildProgrammaticWorkbook(ScuPacDto dto) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("PAC");

            Row r0 = sheet.createRow(2);
            r0.createCell(1).setCellValue("UNIVERSIDAD TÉCNICA PRIVADA COSMOS");
            Row r1 = sheet.createRow(5);
            r1.createCell(1).setCellValue("PROGRAMA DE ASIGNATURA");

            Row r2 = sheet.createRow(9);
            r2.createCell(1).setCellValue("1. DATOS GENERALES DE LA ASIGNATURA");
            Row r3 = sheet.createRow(11);
            r3.createCell(1).setCellValue("CARRERA:");
            r3.createCell(2).setCellValue(dto.getCarrera() != null ? dto.getCarrera() : "");
            Row r4 = sheet.createRow(12);
            r4.createCell(1).setCellValue("ASIGNATURA:");
            r4.createCell(2).setCellValue(dto.getNombreAsignatura() != null ? dto.getNombreAsignatura() : "");
            r4.createCell(6).setCellValue("CÓDIGO:");
            r4.createCell(7).setCellValue(dto.getCodigoAsignatura() != null ? dto.getCodigoAsignatura() : "");

            Row r5 = sheet.createRow(19);
            r5.createCell(1).setCellValue("2. INFORMACIÓN DOCENTE");
            Row r6 = sheet.createRow(21);
            r6.createCell(1).setCellValue("Nombre del docente:");
            r6.createCell(2).setCellValue(dto.getNombreDocente() != null ? dto.getNombreDocente() : "");

            Row r7 = sheet.createRow(48);
            r7.createCell(1).setCellValue("7. ESTRUCTURA DE UNIDADES DE APRENDIZAJE");

            Row headerRow = sheet.createRow(52);
            headerRow.createCell(1).setCellValue("SEMANAS");
            headerRow.createCell(2).setCellValue("SESIONES");
            headerRow.createCell(3).setCellValue("N° TEMA");
            headerRow.createCell(4).setCellValue("TITULO DEL TEMA");
            headerRow.createCell(5).setCellValue("CONCEPTUAL");
            headerRow.createCell(6).setCellValue("PROCEDIMENTAL");
            headerRow.createCell(7).setCellValue("ACTITUDINAL");
            headerRow.createCell(8).setCellValue("CRITERIOS DE DESEMPEÑO");
            headerRow.createCell(9).setCellValue("INSTRUMENTOS DE EVALUACION");

            List<ScuSesionMatriz7Dto> sessions = dto.getMatriz7() != null ? dto.getMatriz7() : createDefaultGralSessions();
            int curRow = 54;
            for (ScuSesionMatriz7Dto s : sessions) {
                Row sr = sheet.createRow(curRow++);
                sr.createCell(1).setCellValue(s.getSemana() != null ? s.getSemana() : 1);
                sr.createCell(2).setCellValue(s.getNroSesion() != null ? s.getNroSesion() + "°" : "");
                sr.createCell(3).setCellValue("Tema " + (s.getNroSesion() != null ? s.getNroSesion() : 1) + ":");
                sr.createCell(4).setCellValue(s.getContenidoEspecifico() != null ? s.getContenidoEspecifico() : "");
                sr.createCell(5).setCellValue(s.getSaberConceptual() != null ? s.getSaberConceptual() : "");
                sr.createCell(6).setCellValue(s.getSaberProcedimental() != null ? s.getSaberProcedimental() : "");
                sr.createCell(7).setCellValue(s.getSaberActitudinal() != null ? s.getSaberActitudinal() : "");
                sr.createCell(8).setCellValue(s.getCriterioDesempeno() != null ? s.getCriterioDesempeno() : "");
                sr.createCell(9).setCellValue(s.getEvidenciaAprendizaje() != null ? s.getEvidenciaAprendizaje() : "");
            }

            wb.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PAC GRAL workbook: " + e.getMessage(), e);
        }
    }

    private InputStream openTemplateStream() {
        try {
            Resource res = resourceLoader.getResource("classpath:templates/template_pac_gral.xlsx");
            if (res.exists()) return res.getInputStream();
            res = resourceLoader.getResource("classpath:templates/template_pac.xlsx");
            if (res.exists()) return res.getInputStream();
        } catch (Exception ignored) {}

        String[] paths = {
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 GRAL_.xlsx",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 GRAL_.xlsx",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 GRAL_.xlsx",
                "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 GRAL_.xlsx"
        };
        for (String p : paths) {
            File f = new File(p);
            if (f.exists()) {
                try {
                    return new FileInputStream(f);
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private List<ScuSesionMatriz7Dto> createDefaultGralSessions() {
        List<ScuSesionMatriz7Dto> list = new ArrayList<>();
        for (int w = 1; w <= 20; w++) {
            for (int s = 1; s <= 2; s++) {
                int totalS = (w - 1) * 2 + s;
                list.add(ScuSesionMatriz7Dto.builder()
                        .semana(w)
                        .nroSesion(totalS)
                        .fechaProgramada(LocalDate.now())
                        .tipoSesion(TipoSesion.TEORICA)
                        .unidadTematica("Unidad " + ((w - 1) / 5 + 1))
                        .contenidoEspecifico("Tema " + totalS)
                        .saberConceptual("Fundamentos conceptuales de la sesión " + totalS)
                        .saberProcedimental("Aplicación guiada de ejercicios y análisis")
                        .saberActitudinal("Participación proactiva y responsabilidad")
                        .criterioDesempeno("Demuestra comprensión del contenido planificado")
                        .evidenciaAprendizaje("Rúbrica de evaluación continua")
                        .instrumentoEvaluacion(InstrumentoEvaluacion.RUBRICA)
                        .hitoEvaluativo(w == 7 ? HitoEvaluativo.PRIMER_PARCIAL : (w == 13 ? HitoEvaluativo.SEGUNDO_PARCIAL : (w == 18 ? HitoEvaluativo.EXAMEN_FINAL : (w == 20 ? HitoEvaluativo.SEGUNDA_INSTANCIA : HitoEvaluativo.REGULAR))))
                        .build());
            }
        }
        return list;
    }

    private void setCell(XSSFSheet sheet, int r, int c, String val) {
        if (val == null) return;
        Row row = sheet.getRow(r);
        if (row == null) row = sheet.createRow(r);
        Cell cell = row.getCell(c);
        if (cell == null) cell = row.createCell(c);
        cell.setCellValue(val);
    }

    private boolean matchesAnchor(String text, String... anchors) {
        if (text == null || text.isBlank()) return false;
        String t = text.trim();
        for (String a : anchors) {
            if (t.contains(a)) return true;
        }
        return false;
    }

    private Integer parseNumericWeek(String text) {
        if (text == null || text.isBlank()) return null;
        Pattern p = Pattern.compile("^(\\d+)");
        Matcher m = p.matcher(text.trim());
        if (m.find()) {
            try {
                int w = Integer.parseInt(m.group(1));
                return (w >= 1 && w <= 30) ? w : null;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String cellStr(Row row, int colIndex) {
        if (row == null) return "";
        Cell c = row.getCell(colIndex);
        return rawStr(c);
    }

    private String rawStr(Cell cell) {
        if (cell == null) return "";
        String s = "";
        if (cell.getCellType() == CellType.STRING) s = cell.getStringCellValue().trim();
        else if (cell.getCellType() == CellType.NUMERIC) {
            double v = cell.getNumericCellValue();
            s = (v == Math.floor(v)) ? String.valueOf((long) v) : String.valueOf(v);
        }
        return cleanText(s);
    }

    private String cleanText(String str) {
        if (str == null || str.isEmpty()) return "";
        return str.replace("_x0093_", "\"")
                .replace("_x0094_", "\"")
                .replace("_x0092_", "'")
                .replace("_x0091_", "'")
                .replace("_x0096_", "-")
                .replace("_x0097_", "-")
                .replaceAll("[\\u007F-\\u009F]", "")
                .trim();
    }

    private Integer parseOrdinal(String s) {
        if (s == null || s.isBlank()) return null;
        String trimmed = s.trim();
        Matcher m = Pattern.compile("^(\\d+)").matcher(trimmed);
        if (m.find()) {
            try {
                int v = Integer.parseInt(m.group(1));
                return (v >= 1 && v <= 80) ? v : null;
            } catch (Exception ignored) {}
        }
        String d = trimmed.replaceAll("[^0-9]", "");
        if (!d.isEmpty()) {
            try {
                int v = Integer.parseInt(d);
                return (v >= 1 && v <= 80) ? v : null;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private InstrumentoEvaluacion instrEnum(String v) {
        if (v == null || v.isBlank()) return InstrumentoEvaluacion.RUBRICA;
        String n = v.toUpperCase();
        if (n.contains("COTEJO")) return InstrumentoEvaluacion.LISTA_COTEJO;
        if (n.contains("ESCRIT") || n.contains("EXAMEN") || n.contains("PRUEBA") || n.contains("CUESTIONARIO")) return InstrumentoEvaluacion.PRUEBA_ESCRITA;
        if (n.contains("ESTIMAT") || n.contains("ESCALA") || n.contains("RANGO") || n.contains("GUÍA") || n.contains("GUIA")) return InstrumentoEvaluacion.ESCALA_ESTIMATIVA;
        return InstrumentoEvaluacion.RUBRICA;
    }

    private HitoEvaluativo hitoEnum(String label) {
        if (label == null) return HitoEvaluativo.REGULAR;
        String n = label.toUpperCase();
        if (n.contains("FINAL")) return HitoEvaluativo.EXAMEN_FINAL;
        if (n.contains("2DO") || n.contains("SEGUNDO")) return HitoEvaluativo.SEGUNDO_PARCIAL;
        if (n.contains("1ER") || n.contains("PRIMER")) return HitoEvaluativo.PRIMER_PARCIAL;
        if (n.contains("INSTANCIA")) return HitoEvaluativo.SEGUNDA_INSTANCIA;
        return HitoEvaluativo.REGULAR;
    }

    private void parseEvaluationScores(String text, ScuPacDto req) {
        if (text == null) return;
        Pattern p = Pattern.compile("(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)");
        Matcher m = p.matcher(text);
        if (m.find()) {
            try {
                req.setP1NotaTeorica(Integer.parseInt(m.group(1)));
                req.setP1NotaPractica(Integer.parseInt(m.group(2)));
                req.setP2NotaTeorica(Integer.parseInt(m.group(3)));
                req.setP2NotaPractica(Integer.parseInt(m.group(4)));
                req.setEfNotaTeorica(Integer.parseInt(m.group(5)));
                req.setEfNotaPractica(Integer.parseInt(m.group(6)));
            } catch (Exception ignored) {}
        }
    }
}
