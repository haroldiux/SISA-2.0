package bo.edu.unitepc.sisa.infrastructure.office;

import bo.edu.unitepc.sisa.api.request.ScuMomentoPedagogicoDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Parser for Plan de Clases Excel documents.
 * Extracts all pedagogical sheets, headers, competencies, knowledges, didactic strategies, evaluations, and moments.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class PlanesClaseExcelParser {

    public List<ScuPlanClaseRequest> parsePlanes(InputStream excelStream, Long defaultSesionId) throws Exception {
        List<ScuPlanClaseRequest> planes = new ArrayList<>();
        try (XSSFWorkbook wb = new XSSFWorkbook(excelStream)) {
            int numSheets = wb.getNumberOfSheets();
            for (int s = 0; s < numSheets; s++) {
                XSSFSheet sh = wb.getSheetAt(s);
                String sheetName = sh.getSheetName();
                if (sheetName.toUpperCase().contains("EJEMPLO")) continue;

                ScuPlanClaseRequest plan = new ScuPlanClaseRequest();
                plan.setSesionId(defaultSesionId != null ? defaultSesionId : (long) (s + 1));
                plan.setNombreHoja(sheetName);

                // Dynamic extraction from the sheet rows
                parseSheetContent(sh, plan);

                // Momentos
                List<ScuMomentoPedagogicoDto> momentos = extractMomentos(sh);
                if (momentos.isEmpty()) momentos = defaultMomentos();

                int totalMin = momentos.stream()
                        .mapToInt(m -> m.getDuracionMin() != null ? m.getDuracionMin() : 0).sum();
                plan.setDuracionTotalMin(totalMin > 0 ? totalMin : 180);
                plan.setMomentos(momentos);

                planes.add(plan);
            }
        }
        return planes;
    }

    private void parseSheetContent(XSSFSheet sh, ScuPlanClaseRequest plan) {
        int maxRow = sh.getLastRowNum();
        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String colB = cellStr(row, 1);
            String colC = cellStr(row, 2);
            String colD = cellStr(row, 3);
            String colE = cellStr(row, 4);
            String colF = cellStr(row, 5);
            String colG = cellStr(row, 6);

            // 1. Header (Docente, Fecha, Asignatura, Carrera)
            if (colB.contains("Nombre del docente:")) {
                if (!colC.isEmpty()) plan.setNombreDocente(colC);
            }
            if (colF.contains("Asignatura:") && !colG.isEmpty()) {
                plan.setNombreAsignatura(colG);
            }
            if (colB.contains("Fecha:") && !colC.isEmpty()) {
                plan.setFecha(colC);
            }
            if (colF.contains("Carrera:") && !colG.isEmpty()) {
                plan.setCarrera(colG);
            }

            // 2. Unidad, Elemento de Competencia, Tema
            if (colB.toUpperCase().startsWith("UNIDAD") && colB.contains(":")) {
                plan.setUnidadTitulo(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.toUpperCase().contains("ELEMENTO DE COMPETENCIA")) {
                plan.setElementoCompetencia(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.toUpperCase().startsWith("TEMA") && (colB.contains(":") || colB.contains(" "))) {
                plan.setContenidoTema(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }

            // 3. Resultados, Logros, Indicadores
            if (colB.contains("Resultados de Aprendizaje:")) {
                plan.setObjetivoSesion(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.contains("Logros Esperados:")) {
                plan.setLogrosEsperados(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.contains("Indicadores de Logro:")) {
                plan.setIndicadoresLogro(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }

            // 4. Los 3 Saberes
            String labelSaberes = (colB + " " + colC).toLowerCase();
            String valSaberes = !colD.isEmpty() ? colD : (!colC.isEmpty() && !colC.toLowerCase().contains("saber") ? colC : colE);

            if (labelSaberes.contains("conceptual")) {
                if (!valSaberes.isEmpty()) plan.setSaberConceptual(valSaberes);
            } else if (labelSaberes.contains("procedim")) {
                if (!valSaberes.isEmpty()) plan.setSaberProcedimental(valSaberes);
            } else if (labelSaberes.contains("actitudinal")) {
                if (!valSaberes.isEmpty()) plan.setSaberActitudinal(valSaberes);
            } else if (r >= 16 && r <= 20 && plan.getSaberConceptual() != null && plan.getSaberProcedimental() == null && !valSaberes.isEmpty() && valSaberes.startsWith("-")) {
                plan.setSaberProcedimental(valSaberes);
            }

            // 5. Estrategias Didácticas (Row 22: Col B=Docente, Col D=Estudiante, Col G=Recursos)
            if (colB.startsWith("- ") || colD.startsWith("- ") || colD.startsWith("Práctica") || colD.startsWith("Laboratorio") || colD.startsWith("Observación")) {
                if (r >= 20 && r <= 24) {
                    if (!colB.isEmpty() && plan.getEstrategiaEnsenanza() == null) plan.setEstrategiaEnsenanza(colB);
                    if (!colD.isEmpty() && plan.getEstrategiaAprendizaje() == null) plan.setEstrategiaAprendizaje(colD);
                    if (!colG.isEmpty() && plan.getRecursosEnsenanza() == null) plan.setRecursosEnsenanza(colG);
                }
            }

            // 6. Evaluación de los Aprendizajes (Formativa & Sumativa)
            if (colB.equalsIgnoreCase("FORMATIVA")) {
                plan.setEvaluacionFormativaActividad(colC);
                plan.setEvaluacionFormativaInstrumento(cellStr(row, 4)); // Col E
                plan.setEvaluacionFormativaEvidencia(cellStr(row, 7)); // Col H
            }
            if (colB.equalsIgnoreCase("SUMATIVA")) {
                plan.setEvaluacionSumativaActividad(colC);
                plan.setEvaluacionSumativaInstrumento(cellStr(row, 4)); // Col E
                plan.setEvaluacionSumativaEvidencia(cellStr(row, 7)); // Col H
            }
        }

        // Fallbacks if some headers were null or bare labels
        if (plan.getObjetivoSesion() == null || plan.getObjetivoSesion().isBlank()) {
            plan.setObjetivoSesion("Desarrollo de competencias según planificación");
        }
        if (plan.getContenidoTema() != null && plan.getContenidoTema().matches("(?i)^TEMA\\s*\\d*\\s*:?\\s*$")) {
            plan.setContenidoTema("");
        }

    }

    private String extractAfterColon(String s) {
        if (s == null) return "";
        int idx = s.indexOf(":");
        return (idx >= 0 && idx < s.length() - 1) ? s.substring(idx + 1).trim() : s.trim();
    }

    private static final java.util.Set<String> GENERIC_MOMENT_HEADERS = java.util.Set.of(
            "ACTIVIDAD", "ACTIVIDADES", "ACTIVIDADES DEL DOCENTE", "ACTIVIDADES DEL ESTUDIANTE",
            "ACTIVIDADES Y TECNICAS", "ACTIVIDAD Y TECNICA", "EVIDENCIAS DE EVALUACION",
            "EVIDENCIAS DE EVALUACIÓN", "INSTRUMENTOS", "DURACIÓN", "DURACION", "MOMENTOS",
            "SECUENCIA DIDACTICA", "SECUENCIA DIDÁCTICA", "EVALUACION DE LOS APRENDIZAJES",
            "EVALUACIÓN DE LOS APRENDIZAJES", "TIPO DE EVALUACION", "TIPO DE EVALUACIÓN"
    );

    private List<ScuMomentoPedagogicoDto> extractMomentos(XSSFSheet sh) {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        int maxRow = sh.getLastRowNum();

        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String label = cellStr(row, 1);
            if (label.isEmpty()) label = cellStr(row, 0);

            String upper = label.toUpperCase().trim();
            if (GENERIC_MOMENT_HEADERS.contains(upper)) {
                continue;
            }

            TipoMomentoPedagogico tipo = null;
            String nombre = null;

            if (upper.contains("INTRODUC") || upper.contains("INICIO") || upper.contains("APERTURA")) {
                tipo = TipoMomentoPedagogico.INICIO;
                nombre = "1. INICIO";
            } else if (upper.contains("CUERPO") || upper.contains("DESARROLLO") || upper.contains("PROCESO")) {
                tipo = TipoMomentoPedagogico.DESARROLLO;
                nombre = "2. DESARROLLO";
            } else if (upper.contains("CONCLUSION") || upper.contains("CIERRE") || upper.contains("SINTESIS")) {
                tipo = TipoMomentoPedagogico.CIERRE;
                nombre = "3. CIERRE";
            }
            if (tipo == null) continue;

            // Col C (idx 2): actividad description
            String actividad = cellStr(row, 2);
            // Col H (idx 7): duracion string like "25 minutos"
            String durStr = cellStr(row, 7);
            if (durStr.isEmpty()) durStr = cellStr(row, 6);
            if (durStr.isEmpty()) durStr = cellStr(row, 8);

            // Skip rows where both actividad and durStr are empty
            if (actividad.isBlank() && durStr.isBlank()) {
                continue;
            }

            // Skip generic header titles in actividad
            String actUpper = actividad.toUpperCase().trim();
            if (GENERIC_MOMENT_HEADERS.contains(actUpper) || actUpper.equals(upper)) {
                continue;
            }

            int duracion = parseDuracion(durStr);
            if (duracion == 0 && tipo == TipoMomentoPedagogico.INICIO) {
                duracion = 25;
            } else if (duracion == 0 && tipo == TipoMomentoPedagogico.DESARROLLO) {
                duracion = 100;
            } else if (duracion == 0 && tipo == TipoMomentoPedagogico.CIERRE) {
                duracion = 55;
            }

            list.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(tipo)
                    .nombreMomento(nombre)
                    .duracionMin(duracion)
                    .actividadesDocente(actividad.isEmpty() ? "Actividades docentes del momento " + tipo : actividad)
                    .actividadesEstudiante("Actividades de los estudiantes")
                    .indicadorEvaluacion("Indicador de evaluación del momento")
                    .build());
        }
        return list;
    }

    private List<ScuMomentoPedagogicoDto> defaultMomentos() {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.INICIO)
                .nombreMomento("1. INICIO")
                .duracionMin(25)
                .actividadesDocente("Activación cognitiva, motivación situacional y reactivación de conocimientos previos")
                .actividadesEstudiante("Participación activa en preguntas orientadoras y reflexión inicial")
                .indicadorEvaluacion("Identificación de saberes previos").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                .nombreMomento("2. DESARROLLO")
                .duracionMin(100)
                .actividadesDocente("Exposición dialogada, modelado de problemas y guía en laboratorio")
                .actividadesEstudiante("Resolución de ejercicios prácticos y trabajo colaborativo")
                .indicadorEvaluacion("Aplicación correcta de conceptos en ejercicios").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.CIERRE)
                .nombreMomento("3. CIERRE")
                .duracionMin(55)
                .actividadesDocente("Retroalimentación, síntesis y evaluación sumativa")
                .actividadesEstudiante("Conclusiones individuales y entrega de producto")
                .indicadorEvaluacion("Síntesis del aprendizaje alcanzado").build());
        return list;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String cellStr(XSSFSheet sh, int r, int c) {
        Row row = sh.getRow(r);
        return row == null ? "" : cellStr(row, c);
    }

    private String cellStr(Row row, int c) {
        if (row == null) return "";
        Cell cell = row.getCell(c);
        if (cell == null) return "";
        CellType type = cell.getCellType();
        if (type == CellType.STRING) return cleanText(cell.getStringCellValue());
        if (type == CellType.NUMERIC) {
            double v = cell.getNumericCellValue();
            return (v == (long) v) ? String.valueOf((long) v) : String.valueOf(v);
        }
        if (type == CellType.BOOLEAN) return String.valueOf(cell.getBooleanCellValue());
        return "";
    }

    private String cleanText(String s) {
        if (s == null) return "";
        return s.replace("_x0093_", "\"")
                .replace("_x0094_", "\"")
                .replace("_x0092_", "'")
                .replace("_x0091_", "'")
                .replace("_x0096_", "-")
                .replace("_x0097_", "-")
                .replaceAll("[\\u007F-\\u009F]", "")
                .trim();
    }

    private int parseDuracion(String s) {
        if (s == null || s.isBlank()) return 0;
        String d = s.replaceAll("[^0-9]", "");
        if (d.isEmpty()) return 0;
        try {
            return Integer.parseInt(d);
        } catch (Exception e) {
            return 0;
        }
    }
}
