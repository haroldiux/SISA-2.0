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
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Concrete strategy for parsing and generating UNITEPC PAC Práctico (PAC PRÁCTICO) Excel workbooks.
 * Handles Contenidos de la Práctica, Modelo Metodológico (4 fases), and Cronograma Semestral de la Práctica.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class PacPracticoParser implements PacParserStrategy {

    private static final Logger log = LoggerFactory.getLogger(PacPracticoParser.class);

    private final ResourceLoader resourceLoader;

    public PacPracticoParser(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public boolean supports(String pacType) {
        if (pacType == null) return false;
        String t = pacType.trim().toUpperCase();
        return t.equals("PRACTICO") || t.equals("PRÁCTICO") || t.equals("PA") || t.equals("PL") || t.equals("PS")
                || t.contains("PROGRAMA DE ASIGNATURA PRÁCTICA") || t.contains("PROGRAMA DE ASIGNATURA PRACTICA");
    }

    @Override
    public ScuPacDto parse(InputStream inputStream, String filename) {
        ScuPacDto dto = new ScuPacDto();
        dto.setPacType("PRACTICO");
        dto.setComponentType("PA");

        try {
            byte[] bytes = inputStream.readAllBytes();
            try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
                XSSFSheet sh = wb.getSheet("PAC");
                if (sh == null && wb.getNumberOfSheets() > 0) {
                    sh = wb.getSheetAt(0);
                }

                if (sh != null) {
                    parsePracticoSheet(sh, dto);
                }

                if (dto.getMatriz7() == null || dto.getMatriz7().isEmpty()) {
                    dto.setMatriz7(createDefaultPracticoSessions());
                }
            }
        } catch (Exception e) {
            log.error("Error parsing PAC Práctico spreadsheet: {}", e.getMessage(), e);
            throw new RuntimeException("Error al parsear documento PAC PRÁCTICO: " + e.getMessage(), e);
        }

        return dto;
    }

    @Override
    public byte[] generate(ScuPacDto pacDto, Map<String, Object> context) {
        try (InputStream templateIs = openTemplateStream()) {
            if (templateIs != null) {
                try (XlsxTemplateCloner cloner = new XlsxTemplateCloner(templateIs)) {
                    XSSFSheet sheet = cloner.getSheetAt(0);
                    populatePracticoSheet(sheet, pacDto);
                    return cloner.toByteArray();
                }
            }
        } catch (Exception e) {
            log.warn("Could not load PAC PRÁCTICO template, building programmatically: {}", e.getMessage());
        }

        return buildProgrammaticWorkbook(pacDto);
    }

    private void parsePracticoSheet(XSSFSheet sh, ScuPacDto req) {
        String currentSection = null;
        List<ScuSesionMatriz7Dto> sessions = new ArrayList<>();
        List<Map<String, String>> contenidosPractica = new ArrayList<>();
        Map<String, Map<String, String>> modeloMetodologico = new LinkedHashMap<>();
        List<Map<String, String>> evaluacionActividades = new ArrayList<>();

        StringBuilder justBuilder = new StringBuilder();
        StringBuilder propBuilder = new StringBuilder();

        for (int r = 0; r <= sh.getLastRowNum(); r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String colB = cellStr(row, 1);
            String colC = cellStr(row, 2);
            String colD = cellStr(row, 3);
            String colE = cellStr(row, 4);
            String colG = cellStr(row, 6);
            String colH = cellStr(row, 7);
            String colI = cellStr(row, 8);
            String colJ = cellStr(row, 9);

            // Detect section boundaries
            if (matchesAnchor(colB, "1. DATOS GENERALES", "1.- DATOS GENERALES", "1. Identificación")) {
                currentSection = "SEC_1";
            } else if (matchesAnchor(colB, "2. INFORMACIÓN DOCENTE", "2.- INFORMACIÓN DOCENTE", "2. Docente")) {
                currentSection = "SEC_2";
            } else if (matchesAnchor(colB, "3. JUSTIFICACIÓN", "3.- JUSTIFICACIÓN")) {
                currentSection = "SEC_3";
                continue;
            } else if (matchesAnchor(colB, "4. PROPÓSITO", "4.- PROPÓSITO")) {
                currentSection = "SEC_4";
                continue;
            } else if (matchesAnchor(colB, "5. ALINEACIÓN CURRICULAR", "5.- ALINEACIÓN CURRICULAR", "5. COMPETENCIAS")) {
                currentSection = "SEC_5";
            } else if (matchesAnchor(colB, "6. CONTENIDOS DE LA PRÁCTICA", "6.- CONTENIDOS DE LA PRÁCTICA")) {
                currentSection = "SEC_6";
                continue;
            } else if (matchesAnchor(colB, "7. MODELO METODOLÓGICO", "7.- MODELO METODOLÓGICO")) {
                currentSection = "SEC_7";
                continue;
            } else if (matchesAnchor(colB, "8. CRONOGRAMA SEMESTRAL", "8.- CRONOGRAMA SEMESTRAL")) {
                currentSection = "SEC_8";
                continue;
            } else if (matchesAnchor(colB, "9.  EVALUACIÓN", "9. EVALUACIÓN", "9.- EVALUACIÓN", "9. SISTEMA")) {
                currentSection = "SEC_9";
                continue;
            }

            // Parse according to active section
            if ("SEC_1".equals(currentSection)) {
                for (int c = 0; c < row.getLastCellNum(); c++) {
                    String val = cellStr(row, c).toUpperCase();
                    if (val.contains("CARRERA:")) req.setCarrera(cellStr(row, c + 1));
                    else if (val.contains("ASIGNATURA:")) req.setNombreAsignatura(cellStr(row, c + 1));
                    else if (val.contains("CÓDIGO:")) req.setCodigoAsignatura(cellStr(row, c + 1));
                    else if (val.contains("SEMESTRE:")) req.setSemestre(cellStr(row, c + 1));
                    else if (val.contains("PRE-REQUISITO:")) req.setPreRequisito(cellStr(row, c + 1));
                    else if (val.contains("CRÉDITOS:")) req.setCreditos(cellStr(row, c + 1));
                    else if (val.contains("CARGA HORARIA TOTAL:")) req.setCargaHorariaTotal(cellStr(row, c + 1));
                    else if (val.contains("HORAS PRÁCTICAS:") || val.contains("HORAS PRACTICAS:")) req.setHorasTeoricasPracticas(cellStr(row, c + 1));
                    else if (val.contains("SESIONES:")) req.setSesionesSemanales(cellStr(row, c + 1));
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
                if (!colB.isEmpty() && !colB.startsWith("4.")) {
                    if (justBuilder.length() > 0) justBuilder.append("\n");
                    justBuilder.append(colB);
                }
            } else if ("SEC_4".equals(currentSection)) {
                if (!colB.isEmpty() && !colB.startsWith("5.")) {
                    if (propBuilder.length() > 0) propBuilder.append("\n");
                    propBuilder.append(colB);
                }
            } else if ("SEC_5".equals(currentSection)) {
                if (colB.toLowerCase().contains("competencia global")) {
                    String cg = !colC.isEmpty() ? colC : colD;
                    if (!cg.isEmpty()) req.setCompetenciaGlobal(cg);
                } else if (colB.toLowerCase().contains("unidad de competencia")) {
                    String uc = !colC.isEmpty() ? colC : colD;
                    if (!uc.isEmpty()) req.setUnidadCompetencia(uc);
                }
            } else if ("SEC_6".equals(currentSection)) {
                // 6. CONTENIDOS DE LA PRÁCTICA: Col B = N° de la práctica, Col C = Título, Col G = Resultado
                Integer nroPrac = parseInteger(colB);
                if (nroPrac != null) {
                    Map<String, String> item = new HashMap<>();
                    item.put("numero", String.valueOf(nroPrac));
                    item.put("titulo", colC);
                    item.put("resultadoAprendizaje", colG);
                    contenidosPractica.add(item);
                }
            } else if ("SEC_7".equals(currentSection)) {
                // 7. MODELO METODOLÓGICO: Col B = Fase común, Col D = Finalidad, Col G = Docente, Col I = Estudiante
                String lowerB = colB.toLowerCase();
                if (lowerB.contains("preparación") || lowerB.contains("preparacion")
                        || lowerB.contains("ejecución guiada") || lowerB.contains("ejecucion guiada")
                        || lowerB.contains("ejecución autónoma") || lowerB.contains("ejecucion autonoma")
                        || lowerB.contains("cierre")) {
                    Map<String, String> phase = new HashMap<>();
                    phase.put("fase", colB);
                    phase.put("finalidad", !colD.isEmpty() ? colD : colC);
                    phase.put("actuacionDocente", colG);
                    phase.put("actuacionEstudiante", colI);
                    modeloMetodologico.put(colB.replace(":", "").trim(), phase);
                }
            } else if ("SEC_8".equals(currentSection)) {
                // 8. CRONOGRAMA SEMESTRAL DE LA PRÁCTICA:
                // Col B: Semana, Col C: Título de la práctica, Col E: Actividad de la práctica,
                // Col G: Desempeño procedimental, Col I: Instrumento de evaluación, Col J: Evidencias
                Integer w = parseNumericWeek(colB);
                if (w != null) {
                    String tit = colC;
                    String act = colE;
                    String proc = colG;
                    String inst = colI;
                    String evid = colJ;

                    String unit = !tit.isBlank() ? tit : ("Práctica Semana " + w);
                    String content = !act.isBlank() ? act : unit;

                    sessions.add(ScuSesionMatriz7Dto.builder()
                            .semana(w)
                            .nroSesion(sessions.size() + 1)
                            .fechaProgramada(LocalDate.now())
                            .tipoSesion(TipoSesion.PRACTICA)
                            .unidadTematica(unit)
                            .contenidoEspecifico(content)
                            .saberConceptual(tit)
                            .saberProcedimental(proc)
                            .saberActitudinal("Responsabilidad, bioseguridad y rigor procedimental")
                            .criterioDesempeno(proc)
                            .evidenciaAprendizaje(!evid.isBlank() ? evid : "Registro o guía de práctica evaluada")
                            .instrumentoEvaluacion(instrEnum(inst))
                            .hitoEvaluativo(hitoEnum(tit + " " + act))
                            .build());
                }
            } else if ("SEC_9".equals(currentSection)) {
                // 9. EVALUACIÓN DE LAS ACTIVIDADES:
                // Col B: Actividad, Col D: Tipo de evaluación, Col F: Instrumento, Col H: Momento, Col I: Ponderación, Col J: Evidencia
                if (!colB.isEmpty() && !colB.equalsIgnoreCase("Actividad") && !colB.startsWith("9.")) {
                    Map<String, String> evalItem = new HashMap<>();
                    evalItem.put("actividad", colB);
                    evalItem.put("tipo", colD);
                    evalItem.put("instrumento", cellStr(row, 5));
                    evalItem.put("momento", colH);
                    evalItem.put("ponderacion", colI);
                    evalItem.put("evidencia", colJ);
                    evaluacionActividades.add(evalItem);
                }
            }
        }

        if (justBuilder.length() > 0) req.setJustificacion(justBuilder.toString());
        if (propBuilder.length() > 0) req.setPropositoGeneral(propBuilder.toString());

        req.getSeccionesIdentificacion().put("contenidosPractica", contenidosPractica);
        req.getSeccionesIdentificacion().put("modeloMetodologico", modeloMetodologico);
        req.getSeccionesIdentificacion().put("evaluacionActividades", evaluacionActividades);

        if (!modeloMetodologico.isEmpty()) {
            StringBuilder mb = new StringBuilder();
            modeloMetodologico.forEach((fase, data) -> {
                mb.append(fase).append(": ").append(data.getOrDefault("finalidad", "")).append("\n");
            });
            req.setMetodologiaLaboratorio(mb.toString().trim());
        }

        req.setMatriz7(sessions);
    }

    private void populatePracticoSheet(XSSFSheet sheet, ScuPacDto dto) {
        if (dto == null) return;

        setCell(sheet, 11, 2, dto.getCarrera());
        setCell(sheet, 12, 2, dto.getNombreAsignatura());
        setCell(sheet, 12, 7, dto.getCodigoAsignatura());
        setCell(sheet, 13, 7, dto.getSemestre());
        setCell(sheet, 14, 2, dto.getPreRequisito());
        setCell(sheet, 14, 7, dto.getCreditos());
        setCell(sheet, 15, 2, dto.getCargaHorariaTotal());
        setCell(sheet, 15, 5, dto.getHorasTeoricasPracticas());
        setCell(sheet, 15, 7, dto.getSesionesSemanales());

        // Docente
        setCell(sheet, 19, 2, dto.getNombreDocente());
        setCell(sheet, 19, 7, dto.getEmailDocente());
        setCell(sheet, 20, 2, dto.getFormacionDocente());
        setCell(sheet, 20, 7, dto.getTelefonoDocente());

        // Justificación & Propósito
        if (dto.getJustificacion() != null) setCell(sheet, 24, 1, dto.getJustificacion());
        if (dto.getPropositoGeneral() != null) setCell(sheet, 28, 1, dto.getPropositoGeneral());

        // Alineación Curricular
        if (dto.getCompetenciaGlobal() != null) setCell(sheet, 32, 2, dto.getCompetenciaGlobal());
        if (dto.getUnidadCompetencia() != null) setCell(sheet, 33, 2, dto.getUnidadCompetencia());

        // Section 8: Cronograma de la Práctica (rows 90 to 109)
        if (dto.getMatriz7() != null) {
            int rowIdx = 90;
            for (ScuSesionMatriz7Dto s : dto.getMatriz7()) {
                if (rowIdx > 110) break;
                Row r = sheet.getRow(rowIdx);
                if (r == null) r = sheet.createRow(rowIdx);

                setCell(sheet, rowIdx, 2, s.getUnidadTematica()); // Título de la práctica
                setCell(sheet, rowIdx, 4, s.getContenidoEspecifico()); // Actividad de la práctica
                setCell(sheet, rowIdx, 6, s.getSaberProcedimental()); // Desempeño procedimental
                setCell(sheet, rowIdx, 8, s.getInstrumentoEvaluacion() != null ? s.getInstrumentoEvaluacion().name() : "RÚBRICA");
                setCell(sheet, rowIdx, 9, s.getEvidenciaAprendizaje());
                rowIdx++;
            }
        }
    }

    private byte[] buildProgrammaticWorkbook(ScuPacDto dto) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("PAC");

            Row r0 = sheet.createRow(2);
            r0.createCell(1).setCellValue("UNIVERSIDAD TÉCNICA PRIVADA COSMOS");
            Row r1 = sheet.createRow(5);
            r1.createCell(1).setCellValue("PROGRAMA DE ASIGNATURA PRÁCTICA");

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

            Row r5 = sheet.createRow(17);
            r5.createCell(1).setCellValue("2. INFORMACIÓN DOCENTE");
            Row r6 = sheet.createRow(19);
            r6.createCell(1).setCellValue("Nombre del docente:");
            r6.createCell(2).setCellValue(dto.getNombreDocente() != null ? dto.getNombreDocente() : "");

            Row r7 = sheet.createRow(87);
            r7.createCell(1).setCellValue("8. CRONOGRAMA SEMESTRAL DE LA PRÁCTICA");

            Row headerRow = sheet.createRow(89);
            headerRow.createCell(1).setCellValue("Semana");
            headerRow.createCell(2).setCellValue("Título de la práctica");
            headerRow.createCell(4).setCellValue("Actividad de la práctica");
            headerRow.createCell(6).setCellValue("Desempeño procedimental");
            headerRow.createCell(8).setCellValue("Instrumento de evaluación");
            headerRow.createCell(9).setCellValue("Evidencias");

            List<ScuSesionMatriz7Dto> sessions = dto.getMatriz7() != null ? dto.getMatriz7() : createDefaultPracticoSessions();
            int curRow = 90;
            for (ScuSesionMatriz7Dto s : sessions) {
                Row sr = sheet.createRow(curRow++);
                sr.createCell(1).setCellValue(s.getSemana() != null ? s.getSemana() : 1);
                sr.createCell(2).setCellValue(s.getUnidadTematica() != null ? s.getUnidadTematica() : "");
                sr.createCell(4).setCellValue(s.getContenidoEspecifico() != null ? s.getContenidoEspecifico() : "");
                sr.createCell(6).setCellValue(s.getSaberProcedimental() != null ? s.getSaberProcedimental() : "");
                sr.createCell(8).setCellValue(s.getInstrumentoEvaluacion() != null ? s.getInstrumentoEvaluacion().name() : "RÚBRICA");
                sr.createCell(9).setCellValue(s.getEvidenciaAprendizaje() != null ? s.getEvidenciaAprendizaje() : "");
            }

            wb.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PAC PRÁCTICO workbook: " + e.getMessage(), e);
        }
    }

    private InputStream openTemplateStream() {
        try {
            Resource res = resourceLoader.getResource("classpath:templates/template_pac_practico.xlsx");
            if (res.exists()) return res.getInputStream();
        } catch (Exception ignored) {}

        String[] paths = {
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 PRACTICO.xlsx",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 PRACTICO.xlsx",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 PRACTICO.xlsx",
                "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PAC-2026 PRACTICO.xlsx"
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

    private List<ScuSesionMatriz7Dto> createDefaultPracticoSessions() {
        List<ScuSesionMatriz7Dto> list = new ArrayList<>();
        for (int w = 1; w <= 19; w++) {
            list.add(ScuSesionMatriz7Dto.builder()
                    .semana(w)
                    .nroSesion(w)
                    .fechaProgramada(LocalDate.now())
                    .tipoSesion(TipoSesion.PRACTICA)
                    .unidadTematica("Práctica N° " + w)
                    .contenidoEspecifico("Ejecución guiada de protocolos de práctica " + w)
                    .saberConceptual("Protocolo y fundamento de la práctica " + w)
                    .saberProcedimental("Manejo correcto de instrumental y registro de datos")
                    .saberActitudinal("Cumplimiento de normas de bioseguridad y ética")
                    .criterioDesempeno("Ejecuta el protocolo técnico con precisión y apego al estándar")
                    .evidenciaAprendizaje("Guía de práctica de laboratorio cumplimentada y firmada")
                    .instrumentoEvaluacion(InstrumentoEvaluacion.LISTA_COTEJO)
                    .hitoEvaluativo(w == 7 ? HitoEvaluativo.PRIMER_PARCIAL : (w == 13 ? HitoEvaluativo.SEGUNDO_PARCIAL : (w == 18 ? HitoEvaluativo.EXAMEN_FINAL : HitoEvaluativo.REGULAR)))
                    .build());
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
        String cleaned = text.trim().replace(".0", "");
        Pattern p = Pattern.compile("^(\\d+)");
        Matcher m = p.matcher(cleaned);
        if (m.find()) {
            try {
                int w = Integer.parseInt(m.group(1));
                return (w >= 1 && w <= 30) ? w : null;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private Integer parseInteger(String text) {
        if (text == null || text.isBlank()) return null;
        String cleaned = text.trim().replace(".0", "");
        try {
            return Integer.parseInt(cleaned);
        } catch (Exception e) {
            return null;
        }
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

    private InstrumentoEvaluacion instrEnum(String v) {
        if (v == null || v.isBlank()) return InstrumentoEvaluacion.LISTA_COTEJO;
        String n = v.toUpperCase();
        if (n.contains("COTEJO") || n.contains("LISTA")) return InstrumentoEvaluacion.LISTA_COTEJO;
        if (n.contains("ESCRIT") || n.contains("EXAMEN") || n.contains("PRUEBA")) return InstrumentoEvaluacion.PRUEBA_ESCRITA;
        if (n.contains("ESTIMAT") || n.contains("ESCALA") || n.contains("RANGO") || n.contains("GUÍA") || n.contains("GUIA")) return InstrumentoEvaluacion.ESCALA_ESTIMATIVA;
        return InstrumentoEvaluacion.RUBRICA;
    }

    private HitoEvaluativo hitoEnum(String label) {
        if (label == null) return HitoEvaluativo.REGULAR;
        String n = label.toUpperCase();
        if (n.contains("FINAL")) return HitoEvaluativo.EXAMEN_FINAL;
        if (n.contains("2DO") || n.contains("SEGUNDO")) return HitoEvaluativo.SEGUNDO_PARCIAL;
        if (n.contains("1ER") || n.contains("PRIMER")) return HitoEvaluativo.PRIMER_PARCIAL;
        return HitoEvaluativo.REGULAR;
    }
}
