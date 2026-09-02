package bo.edu.unitepc.sisa.infrastructure.office;

import bo.edu.unitepc.sisa.api.request.ScuBibliografiaDto;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.api.request.ScuTemaAnaliticoDto;
import bo.edu.unitepc.sisa.api.request.ScuUnidadAprendizajeDto;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic parser for Programa Analitico Word DOCX.
 * Extracts:
 *   - Header table: codigo, semestre, nombreAsignatura, creditos, horasTeoricas, horasPracticas
 *   - Dynamic learning units (1 to N)
 *   - Dynamic topics (Tema 1 to M) per unit with all bullet points/contents
 *   - Basic and Complementary APA bibliographies
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class ProgramaAnaliticoDocxParser {

    private static final java.util.regex.Pattern UNIT_PATTERN =
            java.util.regex.Pattern.compile("^(?:UNIDAD\\s+(?:DE\\s+APRENDIZAJE\\s+)?)([IVXLCDM\\d]+)[.:\\s-]+(.*)$", java.util.regex.Pattern.CASE_INSENSITIVE);
    private static final java.util.regex.Pattern TEMA_PATTERN =
            java.util.regex.Pattern.compile("^TEMA\\s+(?:N[º°.]?\\s*)?(\\d+)[.:\\s-]+(.*)$", java.util.regex.Pattern.CASE_INSENSITIVE);

    public ScuProgramaAnaliticoRequest parseDocx(InputStream docxStream, Long asignacionId) throws Exception {
        try (XWPFDocument doc = new XWPFDocument(docxStream)) {
            ScuProgramaAnaliticoRequest req = new ScuProgramaAnaliticoRequest();
            req.setAsignacionId(asignacionId);

            // Header from first table, data row (index 2)
            List<XWPFTable> tables = doc.getTables();
            if (!tables.isEmpty()) {
                List<XWPFTableRow> rows = tables.get(0).getRows();
                XWPFTableRow dataRow = rows.size() > 2 ? rows.get(2)
                        : rows.size() > 1 ? rows.get(rows.size() - 1) : null;
                if (dataRow != null) {
                    List<XWPFTableCell> cells = dataRow.getTableCells();
                    req.setCodigoAsignatura(get(cells, 0));
                    req.setSemestre(get(cells, 1));
                    req.setNombreAsignatura(get(cells, 2));
                    req.setCreditos(parseInt(get(cells, 3)));
                    req.setHorasTeoricas(parseInt(get(cells, 4)));
                    req.setHorasPracticas(parseInt(get(cells, 5)));
                    req.setHorasSemestre(parseInt(get(cells, 6)));
                }
            }

            req.setCaracterizacion(section(doc, "CARACTERIZACI",
                    "Asignatura fundamental para el perfil profesional del egresado"));
            req.setMacroCompetencia(section(doc, "COMPETENCIA",
                    "Aplica principios y metodologías para la resolución de problemas"));
            req.setSistemaEvaluacion(section(doc, "EVALUACI",
                    "Evaluación continua diagnóstica, formativa y sumativa por competencias"));

            // Dynamic Units & Topics from paragraphs
            List<ScuUnidadAprendizajeDto> unidades = extractDynamicUnidades(doc);
            if (unidades.isEmpty()) {
                ScuUnidadAprendizajeDto u = ScuUnidadAprendizajeDto.builder()
                        .numeroUnidad(1)
                        .titulo("Unidad 1: Fundamentos Generales")
                        .saberesConceptuales("Conceptos esenciales y principios teóricos")
                        .saberesProcedimentales("Análisis, diseño y resolución de problemas")
                        .saberesActitudinales("Responsabilidad profesional y ética")
                        .criteriosDesempeno("Demuestra dominio de los saberes conceptuales")
                        .horasAcademicas(20)
                        .temas(new ArrayList<>())
                        .build();
                unidades.add(u);
            }

            // Dynamic Bibliography from paragraphs
            List<ScuBibliografiaDto> biblio = extractDynamicBibliografia(doc);
            if (biblio.isEmpty()) {
                ScuBibliografiaDto b = new ScuBibliografiaDto();
                b.setTipo("BASICA");
                b.setCitaApa("UNITEPC. (2026). Guía Curricular Institucional. Cochabamba: UNITEPC.");
                b.setAutor("UNITEPC");
                b.setAnio(2026);
                b.setTitulo("Guía Curricular Institucional");
                biblio.add(b);
            }

            req.setUnidades(unidades);
            req.setBibliografia(biblio);
            return req;
        }
    }

    private List<ScuUnidadAprendizajeDto> extractDynamicUnidades(XWPFDocument doc) {
        List<ScuUnidadAprendizajeDto> list = new ArrayList<>();
        ScuUnidadAprendizajeDto currentUnit = null;
        ScuTemaAnaliticoDto currentTema = null;
        List<String> currentPuntos = new ArrayList<>();

        for (XWPFParagraph p : doc.getParagraphs()) {
            String text = p.getText().trim();
            if (text.isEmpty()) continue;
            String upper = text.toUpperCase();

            // Stop when reaching bibliography section
            if (upper.contains("BIBLIOGRAF")) {
                break;
            }

            java.util.regex.Matcher mu = UNIT_PATTERN.matcher(text);
            java.util.regex.Matcher mt = TEMA_PATTERN.matcher(text);

            // Unit Header: e.g. "UNIDAD DE APRENDIZAJE I.- PROGRAMACIÓN ORIENTADA A OBJETOS." or "UNIDAD 1: ..."
            if (mu.matches() || (upper.startsWith("UNIDAD") && (text.contains(":") || text.contains(".-")))) {
                if (currentTema != null) {
                    currentTema.setContenido(String.join("\n", currentPuntos));
                }
                currentTema = null;
                currentPuntos = new ArrayList<>();

                int num;
                String titulo;
                if (mu.matches()) {
                    num = parseRomanOrArabic(mu.group(1), list.size() + 1);
                    titulo = mu.group(2).replaceAll("^[.:\\s-]+", "").replaceAll("[.:\\s-]+$", "").trim();
                } else {
                    int sepIdx = text.indexOf(":");
                    if (sepIdx == -1) sepIdx = text.indexOf(".-");
                    String unitPrefix = sepIdx != -1 ? text.substring(0, sepIdx) : text;
                    num = parseRomanOrArabic(unitPrefix, list.size() + 1);
                    titulo = sepIdx != -1 ? text.substring(sepIdx + (text.charAt(sepIdx) == ':' ? 1 : 2)).trim() : text;
                }

                currentUnit = ScuUnidadAprendizajeDto.builder()
                        .numeroUnidad(num)
                        .titulo(titulo.isEmpty() ? ("Unidad " + num) : titulo)
                        .horasAcademicas(20)
                        .temas(new ArrayList<>())
                        .build();
                list.add(currentUnit);
            }
            // Topic Header: e.g. "TEMA Nº 1. CONCEPTOS..." or "Tema 1: Anatomía..."
            else if ((mt.matches() || (upper.startsWith("TEMA") && (text.contains(":") || text.contains(".-") || text.contains(".")))) && currentUnit != null) {
                if (currentTema != null) {
                    currentTema.setContenido(String.join("\n", currentPuntos));
                }
                currentPuntos = new ArrayList<>();

                int numTema;
                String tituloTema;
                if (mt.matches()) {
                    numTema = parseNumSafe(mt.group(1), currentUnit.getTemas().size() + 1);
                    tituloTema = mt.group(2).replaceAll("^[.:\\s-]+", "").replaceAll("[.:\\s-]+$", "").trim();
                } else {
                    int sepIdx = text.indexOf(":");
                    if (sepIdx == -1) sepIdx = text.indexOf(".-");
                    if (sepIdx == -1) sepIdx = text.indexOf(".");
                    String temaPrefix = sepIdx != -1 ? text.substring(0, sepIdx) : text;
                    numTema = parseNumSafe(temaPrefix, currentUnit.getTemas().size() + 1);
                    tituloTema = sepIdx != -1 ? text.substring(sepIdx + 1).trim() : text;
                }

                currentTema = ScuTemaAnaliticoDto.builder()
                        .numeroTema(numTema)
                        .titulo(tituloTema.isEmpty() ? ("Tema " + numTema) : tituloTema)
                        .build();
                currentUnit.getTemas().add(currentTema);
            }
            // Topic Content / Bullet Points
            else if (currentTema != null) {
                currentPuntos.add(text);
            }
        }

        if (currentTema != null) {
            currentTema.setContenido(String.join("\n", currentPuntos));
        }

        for (ScuUnidadAprendizajeDto u : list) {
            if (u.getTemas() != null && !u.getTemas().isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (ScuTemaAnaliticoDto t : u.getTemas()) {
                    sb.append("Tema ").append(t.getNumeroTema()).append(": ").append(t.getTitulo()).append("\n");
                    if (t.getContenido() != null && !t.getContenido().isEmpty()) {
                        sb.append(t.getContenido()).append("\n");
                    }
                }
                u.setSaberesConceptuales(sb.toString().trim());
            }
            if (u.getSaberesProcedimentales() == null) u.setSaberesProcedimentales("Aplicación práctica y desarrollo de proyectos");
            if (u.getSaberesActitudinales() == null) u.setSaberesActitudinales("Responsabilidad profesional, ética y trabajo en equipo");
            if (u.getCriteriosDesempeno() == null) u.setCriteriosDesempeno("Demuestra dominio de los saberes conceptuales y procedimentales");
        }

        return list;
    }

    private List<ScuBibliografiaDto> extractDynamicBibliografia(XWPFDocument doc) {
        List<ScuBibliografiaDto> list = new ArrayList<>();
        boolean inBasica = false;
        boolean inComp = false;

        for (XWPFParagraph p : doc.getParagraphs()) {
            String text = p.getText().trim();
            if (text.isEmpty()) continue;
            String upper = text.toUpperCase();

            if (upper.contains("BIBLIOGRAFÍA COMPLEMENTARIA") || upper.contains("BIBLIOGRAFIA COMPLEMENTARIA")) {
                inComp = true;
                inBasica = false;
                continue;
            } else if (upper.contains("BIBLIOGRAFÍA") || upper.contains("BIBLIOGRAFIA")) {
                inBasica = true;
                inComp = false;
                continue;
            }

            if (inBasica && text.length() > 10) {
                ScuBibliografiaDto b = new ScuBibliografiaDto();
                b.setTipo("BASICA");
                b.setCitaApa(text);
                b.setAutor("UNITEPC");
                b.setAnio(2026);
                b.setTitulo(text);
                list.add(b);
            } else if (inComp && text.length() > 10) {
                ScuBibliografiaDto b = new ScuBibliografiaDto();
                b.setTipo("COMPLEMENTARIA");
                b.setCitaApa(text);
                b.setAutor("UNITEPC");
                b.setAnio(2026);
                b.setTitulo(text);
                list.add(b);
            }
        }

        return list;
    }

    private String section(XWPFDocument doc, String keyword, String def) {
        List<XWPFParagraph> ps = doc.getParagraphs();
        for (int i = 0; i < ps.size(); i++) {
            String t = ps.get(i).getText();
            if (t != null && t.toUpperCase().contains(keyword)) {
                if (i + 1 < ps.size()) {
                    String next = ps.get(i + 1).getText().trim();
                    if (!next.isEmpty() && next.length() > 10) return next;
                }
                if (t.contains(":")) {
                    String after = t.substring(t.indexOf(":") + 1).trim();
                    if (after.length() > 5) return after;
                }
            }
        }
        return def;
    }

    private String get(List<XWPFTableCell> cells, int idx) {
        return cells.size() > idx ? cells.get(idx).getText().trim() : "";
    }

    private int parseInt(String s) {
        if (s == null || s.isBlank()) return 0;
        try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception e) { return 0; }
    }

    private int parseNumSafe(String s, int fallback) {
        if (s == null || s.isBlank()) return fallback;
        String digits = s.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return fallback;
        try { return Integer.parseInt(digits); } catch (Exception e) { return fallback; }
    }

    private int parseRomanOrArabic(String s, int fallback) {
        if (s == null || s.isBlank()) return fallback;
        String clean = s.trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
        switch (clean) {
            case "I": return 1;
            case "II": return 2;
            case "III": return 3;
            case "IV": return 4;
            case "V": return 5;
            case "VI": return 6;
            case "VII": return 7;
            case "VIII": return 8;
            case "IX": return 9;
            case "X": return 10;
            default: return parseNumSafe(clean, fallback);
        }
    }
}

