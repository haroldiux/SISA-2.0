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
 *
 * Real document structure (PLAN DE CLASES TALLER DE IDIOMAS.xlsx):
 *   One sheet per topic (e.g. "UA-1 Tema 1", "UA-2 Tema 3" etc.)
 *   Row  8 (idx 7):  col B="Nombre del docente:", col G=asignatura value
 *   Row 11 (idx 10): col B="Unidad N:", col C=unidad title
 *   Row 13 (idx 12): col B="TEMA N:", col C=tema title  ← contenidoTema
 *   Row 14 (idx 13): col B="Resultados de Aprendizaje:", col C=objetivo
 *   Row 28 (idx 27): MOMENTOS header row
 *   Row 29+ (idx 28+): INTRODUCCION/DESARROLLO/CIERRE rows
 *     col B=momento label, col C=actividad description, col H=duración string
 */
@Component
public class PlanesClaseExcelParser {

    public List<ScuPlanClaseRequest> parsePlanes(InputStream excelStream, Long defaultSesionId) throws Exception {
        List<ScuPlanClaseRequest> planes = new ArrayList<>();
        try (XSSFWorkbook wb = new XSSFWorkbook(excelStream)) {
            int numSheets = wb.getNumberOfSheets();
            for (int s = 0; s < numSheets; s++) {
                XSSFSheet sh = wb.getSheetAt(s);
                ScuPlanClaseRequest plan = new ScuPlanClaseRequest();
                plan.setSesionId(defaultSesionId != null ? defaultSesionId : (long) (s + 1));

                // Row 13 col C: tema title
                String tema = cellStr(sh, 12, 2);
                plan.setContenidoTema(tema);

                // Row 14 col C: resultados de aprendizaje = objetivo
                String objetivo = cellStr(sh, 13, 2);
                if (objetivo.isEmpty()) objetivo = "Desarrollo de competencias segun planificacion";
                plan.setObjetivoSesion(objetivo);

                // Row 8 col G: asignatura
                plan.setNombreAsignatura(cellStr(sh, 7, 6));

                // Row 11 col C: unidad title
                plan.setUnidadTitulo(cellStr(sh, 10, 2));

                // Momentos: scan for INTRODUCCION/DESARROLLO/CIERRE from row 28 onward
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

    private List<ScuMomentoPedagogicoDto> extractMomentos(XSSFSheet sh) {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        int maxRow = sh.getLastRowNum();

        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            // Momento label is in col B (idx 1); fallback col A (idx 0)
            String label = cellStr(row, 1);
            if (label.isEmpty()) label = cellStr(row, 0);

            String upper = label.toUpperCase();
            TipoMomentoPedagogico tipo = null;
            if (upper.contains("INTRODUC") || upper.contains("INICIO") || upper.contains("APERTURA")) {
                tipo = TipoMomentoPedagogico.INICIO;
            } else if (upper.contains("DESARROLLO") || upper.contains("PROCESO")) {
                tipo = TipoMomentoPedagogico.DESARROLLO;
            } else if (upper.contains("CIERRE") || upper.contains("SINTESIS") || upper.contains("EVALUACION")) {
                tipo = TipoMomentoPedagogico.CIERRE;
            }
            if (tipo == null) continue;

            // Col C (idx 2): actividad description
            String actividad = cellStr(row, 2);
            // Col H (idx 7): duracion string like "25 minutos"
            String durStr = cellStr(row, 7);
            int duracion = parseDuracion(durStr);
            if (duracion == 0) {
                duracion = tipo == TipoMomentoPedagogico.INICIO ? 25
                        : tipo == TipoMomentoPedagogico.DESARROLLO ? 100 : 55;
            }

            list.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(tipo)
                    .duracionMin(duracion)
                    .actividadesDocente(actividad.isEmpty() ? "Actividades docentes del momento " + tipo : actividad)
                    .actividadesEstudiante("Actividades de los estudiantes")
                    .indicadorEvaluacion("Indicador de evaluacion del momento")
                    .build());
        }
        return list;
    }

    private List<ScuMomentoPedagogicoDto> defaultMomentos() {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.INICIO).duracionMin(25)
                .actividadesDocente("Motivacion, recuperacion de saberes previos y presentacion de objetivos")
                .actividadesEstudiante("Participacion en lluvia de ideas y preguntas orientadoras")
                .indicadorEvaluacion("Identificacion de saberes previos").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.DESARROLLO).duracionMin(100)
                .actividadesDocente("Exposicion dialogada y guia de ejercicios practicos")
                .actividadesEstudiante("Resolucion de casos y desarrollo de guia")
                .indicadorEvaluacion("Aplicacion correcta de conceptos en ejercicios").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.CIERRE).duracionMin(55)
                .actividadesDocente("Retroalimentacion, sintesis y evaluacion")
                .actividadesEstudiante("Conclusiones individuales y entrega de producto")
                .indicadorEvaluacion("Sintesis del aprendizaje alcanzado").build());
        return list;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String cellStr(XSSFSheet sh, int r, int c) {
        Row row = sh.getRow(r);
        return row == null ? "" : cellStr(row, c);
    }

    private String cellStr(Row row, int c) {
        Cell cell = row.getCell(c);
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue().trim();
        if (cell.getCellType() == CellType.NUMERIC) {
            double v = cell.getNumericCellValue();
            return v == Math.floor(v) ? String.valueOf((long) v) : String.valueOf(v);
        }
        return "";
    }

    /** Parse strings like "25 minutos", "45 minutos" → integer minutes. */
    private int parseDuracion(String s) {
        if (s == null || s.isBlank()) return 0;
        String digits = s.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return 0;
        try { return Integer.parseInt(digits); } catch (Exception e) { return 0; }
    }
}
