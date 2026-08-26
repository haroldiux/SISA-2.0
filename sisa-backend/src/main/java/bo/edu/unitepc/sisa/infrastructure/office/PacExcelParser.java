package bo.edu.unitepc.sisa.infrastructure.office;

import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuSesionMatriz7Dto;
import bo.edu.unitepc.sisa.domain.enums.HitoEvaluativo;
import bo.edu.unitepc.sisa.domain.enums.InstrumentoEvaluacion;
import bo.edu.unitepc.sisa.domain.enums.TipoSesion;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Dynamic Semantic Anchor PAC Excel Parser.
 * Uses semantic label-anchors and column contracts rather than hardcoded row numbers.
 * Resilient to variable numbers of units, competence elements, justification paragraphs, and sessions.
 */
@Component
public class PacExcelParser {

    public ScuPacRequest parsePac(InputStream in, Long asignacionId) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(in)) {
            ScuPacRequest req = new ScuPacRequest();
            req.setAsignacionId(asignacionId);
            List<ScuSesionMatriz7Dto> bestSessions = new ArrayList<>();

            for (int si = 0; si < wb.getNumberOfSheets(); si++) {
                XSSFSheet sh = wb.getSheetAt(si);
                if (sh.getSheetName().toUpperCase().contains("EJEMPLO")) continue;

                List<ScuSesionMatriz7Dto> sheetSessions = new ArrayList<>();
                parseSheetDynamic(sh, req, sheetSessions);
                if (sheetSessions.size() > bestSessions.size()) {
                    bestSessions = sheetSessions;
                }
            }

            req.setMatriz7(bestSessions);
            return req;
        }
    }

    private void parseSheetDynamic(XSSFSheet sh, ScuPacRequest req, List<ScuSesionMatriz7Dto> outSessions) {
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

            String colB = cellStr(row, 1); // Column B (idx 1)
            String colC = cellStr(row, 2); // Column C (idx 2)
            String colD = cellStr(row, 3); // Column D (idx 3)
            String colF = cellStr(row, 5); // Column F (idx 5)

            // Detect Main Section Boundaries
            if (matchesAnchor(colB, "1.- Identificación", "1. Identificación", "1. IDENTIFICACIÓN")) {
                currentSection = "SEC_1";
            } else if (matchesAnchor(colB, "2.- Docente", "2. Docente", "2. DOCENTE")) {
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
            } else if (matchesAnchor(colB, "8. Metodología", "8.- Metodología", "8. METODOLOGÍA")) {
                currentSection = "SEC_8";
            } else if (matchesAnchor(colB, "9. Sistema", "9.- Sistema", "9. SISTEMA")) {
                currentSection = "SEC_9";
            } else if (matchesAnchor(colB, "12.- Criterios", "12. Criterios", "12. CRITERIOS", "12.- Normativa")) {
                currentSection = "SEC_12";
            } else if (matchesAnchor(colB, "14.- Bibliografía", "14. Bibliografía", "14. BIBLIOGRAFÍA")) {
                currentSection = "SEC_14";
                continue;
            }


            // Extract based on semantic key search inside the row
            if ("SEC_1".equals(currentSection)) {
                for (int c = 0; c < row.getLastCellNum(); c++) {
                    String val = cellStr(row, c);
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
                    String val = cellStr(row, c);
                    if (val.contains("Nombre del docente:")) req.setNombreDocente(cellStr(row, c + 1));
                    else if (val.contains("eMail:")) req.setEmailDocente(cellStr(row, c + 1));
                    else if (val.contains("Formación:")) req.setFormacionDocente(cellStr(row, c + 1));
                    else if (val.contains("Teléfono:")) req.setTelefonoDocente(cellStr(row, c + 1));
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
                if (colB.contains("Competencia Global")) {
                    String cg = !colD.isEmpty() ? colD : colC;
                    if (!cg.isEmpty()) req.setCompetenciaGlobal(cg);
                } else if (colB.contains("Unidad de Competencia")) {
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

                // Check if this row updates the week number in Col B
                Integer parsedWeek = parseNumericWeek(colB);
                if (parsedWeek != null) {
                    currentWeek = parsedWeek;
                }

                // Check if Col C contains a session ordinal (e.g. "1°", "2°", "3°" ...)
                Integer nroSes = parseOrdinal(colC);
                if (nroSes != null) {
                    String nroTema = cellStr(row, 3); // Col D (idx 3)
                    String titTema = cellStr(row, 4); // Col E (idx 4)
                    String conc    = cellStr(row, 5); // Col F (idx 5)
                    String proc    = cellStr(row, 6); // Col G (idx 6)
                    String act     = cellStr(row, 7); // Col H (idx 7)
                    String crit    = cellStr(row, 8); // Col I (idx 8)
                    String inst    = cellStr(row, 9); // Col J (idx 9)

                    String ut = currentUnit;
                    if (ut == null || ut.isEmpty()) {
                        ut = !nroTema.isEmpty() ? nroTema : ("Unidad " + (Math.min((currentWeek - 1) / 5 + 1, 4)));
                    }

                    String temaEsp = !titTema.isEmpty() ? titTema : (!nroTema.isEmpty() ? nroTema : ("Sesión " + nroSes));

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

                if (colB.contains("En el Aula:")) {
                    req.setMetodologiaAula(colC);
                }
            } else if ("SEC_9".equals(currentSection)) {
                if (!colB.isEmpty() && !colB.startsWith("10.") && !colB.startsWith("11.") && !colB.startsWith("12.")) {
                    String textB = colB;
                    if (textB.contains("1er Parcial") || textB.contains("Nota teórica") || textB.contains("parámetros")) {
                        parseEvaluationScores(textB, req);
                        textB = cleanEvaluationTable(textB);
                    }
                    if (!textB.isBlank() && !textB.startsWith("9. Sistema")) {
                        if (evalBuilder.length() > 0) evalBuilder.append("\n\n");
                        evalBuilder.append(textB);
                    }
                    if (!colF.isEmpty()) {
                        if (evalBuilder.length() > 0) evalBuilder.append("\n\n");
                        evalBuilder.append(colF);
                    }
                }
            } else if ("SEC_12".equals(currentSection)) {
                if (!colF.isEmpty() && !colF.startsWith("13.") && !colF.startsWith("14.")) {
                    if (normBuilder.length() > 0) normBuilder.append("\n");
                    normBuilder.append(colF);
                }
            } else if ("SEC_14".equals(currentSection)) {
                if (!colB.isEmpty()) {
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
                  .replace("\u0093", "\"")
                  .replace("\u0094", "\"")
                  .replace("\u0092", "'")
                  .replace("\u0091", "'")
                  .replace("\u0096", "-")
                  .replace("\u0097", "-")
                  .replaceAll("[\\u007F-\\u009F]", "")
                  .trim();
    }

    private Integer parseOrdinal(String s) {
        if (s == null || s.isBlank()) return null;
        String trimmed = s.trim();
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("^(\\d+)").matcher(trimmed);
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
            } catch (Exception e) { return null; }
        }
        return null;
    }


    private InstrumentoEvaluacion instrEnum(String v) {
        if (v == null || v.isBlank()) return InstrumentoEvaluacion.RUBRICA;
        String n = v.toUpperCase();
        if (n.contains("COTEJO")) return InstrumentoEvaluacion.LISTA_COTEJO;
        if (n.contains("ESCRIT") || n.contains("EXAMEN")) return InstrumentoEvaluacion.PRUEBA_ESCRITA;
        if (n.contains("ESTIMAT")) return InstrumentoEvaluacion.ESCALA_ESTIMATIVA;
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

    private void parseEvaluationScores(String text, ScuPacRequest req) {
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

    private String cleanEvaluationTable(String text) {
        if (text == null) return "";
        String cleaned = text.replaceAll("(?s)1er Parcial.*?Nota práctica\\s*\\n\\s*\\d+\\s+\\d+\\s+\\d+\\s+\\d+\\s+\\d+\\s+\\d+", "");
        cleaned = cleaned.replaceAll("La evaluación considera los siguientes parámetros:\\s*", "");
        return cleaned.trim();
    }
}


