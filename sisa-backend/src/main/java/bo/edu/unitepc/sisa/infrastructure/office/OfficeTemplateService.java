package bo.edu.unitepc.sisa.infrastructure.office;

import bo.edu.unitepc.sisa.domain.model.*;
import bo.edu.unitepc.sisa.exception.ScuOfficeTemplateNotFoundException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing institutional Office template loading, caching, and document rendering.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class OfficeTemplateService {

    private final ResourceLoader resourceLoader;
    private final Map<String, byte[]> templateCache = new ConcurrentHashMap<>();

    public OfficeTemplateService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public InputStream loadTemplate(String templateName) {
        byte[] cached = this.templateCache.computeIfAbsent(templateName, name -> {
            try {
                Resource resource = this.resourceLoader.getResource("classpath:templates/" + name);
                if (!resource.exists()) {
                    throw new ScuOfficeTemplateNotFoundException("Template not found: " + name);
                }
                return resource.getInputStream().readAllBytes();
            } catch (Exception e) {
                throw new ScuOfficeTemplateNotFoundException("Failed to read template: " + name);
            }
        });
        return new ByteArrayInputStream(cached);
    }

    public byte[] exportPacXlsx(Pac pac) throws Exception {
        try (InputStream is = this.loadTemplate("template_pac.xlsx");
             XlsxTemplateCloner cloner = new XlsxTemplateCloner(is)) {

            XSSFSheet sheet = cloner.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalStateException("Sheet 0 not found in PAC template");
            }

            // Fill header information
            AsignacionDocente asig = pac.getAsignacion();
            if (asig != null) {
                this._setCellText(sheet, 5, 2, asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
                this._setCellText(sheet, 6, 2, asig.getAsignatura() != null ? asig.getAsignatura().getNombre() : "");
                this._setCellText(sheet, 7, 2, asig.getDocente() != null ? asig.getDocente().getNombreCompleto() : "");
                this._setCellText(sheet, 8, 2, asig.getGestion() != null ? asig.getGestion().getCodigo() : "");
            }

            int numSesiones = pac.getSesiones() != null ? pac.getSesiones().size() : 0;
            int startRow = 15;
            if (numSesiones > 10) {
                DynamicRowShifter.shiftAndCloneRows(sheet, startRow + 10, numSesiones - 10, startRow);
            }

            // Populate sessions
            int rIdx = startRow;
            if (pac.getSesiones() != null) {
                for (SesionMatriz7 ses : pac.getSesiones()) {
                    Row row = sheet.getRow(rIdx);
                    if (row == null) {
                        row = sheet.createRow(rIdx);
                    }
                    this._setCellValue(row, 1, ses.getSemana());
                    this._setCellValue(row, 2, ses.getNroSesion());
                    this._setCellValue(row, 3, ses.getFechaProgramada() != null ? ses.getFechaProgramada().toString() : "");
                    this._setCellValue(row, 4, ses.getTipoSesion() != null ? ses.getTipoSesion().name() : "");
                    this._setCellValue(row, 5, ses.getUnidadTematica());
                    this._setCellValue(row, 6, ses.getContenidoEspecifico());
                    this._setCellValue(row, 7, ses.getSaberConceptual());
                    this._setCellValue(row, 8, ses.getSaberProcedimental());
                    this._setCellValue(row, 9, ses.getSaberActitudinal());
                    this._setCellValue(row, 10, ses.getCriterioDesempeno());
                    this._setCellValue(row, 11, ses.getEvidenciaAprendizaje());
                    this._setCellValue(row, 12, ses.getInstrumentoEvaluacion() != null ? ses.getInstrumentoEvaluacion().name() : "");
                    this._setCellValue(row, 13, ses.getHitoEvaluativo() != null ? ses.getHitoEvaluativo().name() : "");
                    rIdx++;
                }
            }

            return cloner.toByteArray();
        }
    }

    public byte[] exportPlanClasesXlsx(PlanDeClase plan) throws Exception {
        try (InputStream is = this.loadTemplate("template_plan_clases.xlsx");
             XlsxTemplateCloner cloner = new XlsxTemplateCloner(is)) {

            XSSFSheet sheet = cloner.getSheetAt(0);
            if (sheet != null) {
                this._setCellText(sheet, 5, 2, plan.getObjetivoSesion() != null ? plan.getObjetivoSesion() : "");
                this._setCellText(sheet, 6, 2, "Duración Total: " + plan.getDuracionTotalMin() + " min");

                int r = 10;
                if (plan.getMomentos() != null) {
                    for (MomentoPedagogico m : plan.getMomentos()) {
                        Row row = sheet.getRow(r);
                        if (row == null) {
                            row = sheet.createRow(r);
                        }
                        this._setCellValue(row, 1, m.getTipoMomento() != null ? m.getTipoMomento().name() : "");
                        this._setCellValue(row, 2, m.getDuracionMin());
                        this._setCellValue(row, 3, m.getActividadesDocente());
                        this._setCellValue(row, 4, m.getActividadesEstudiante());
                        this._setCellValue(row, 5, m.getIndicadorEvaluacion());
                        r++;
                    }
                }
            }

            return cloner.toByteArray();
        }
    }

    public byte[] exportProgramaDocx(ProgramaAnalitico programa) throws Exception {
        try (InputStream is = this.loadTemplate("template_programa_analitico.docx");
             DocxTemplateCloner cloner = new DocxTemplateCloner(is)) {

            Map<String, String> placeholders = new HashMap<>();
            AsignacionDocente asig = programa.getAsignacion();
            if (asig != null) {
                placeholders.put("CARRERA", asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
                placeholders.put("ASIGNATURA", asig.getAsignatura() != null ? asig.getAsignatura().getNombre() : "");
                placeholders.put("CODIGO", asig.getAsignatura() != null ? asig.getAsignatura().getCodigo() : "");
                placeholders.put("DOCENTE", asig.getDocente() != null ? asig.getDocente().getNombreCompleto() : "");
                placeholders.put("GESTION", asig.getGestion() != null ? asig.getGestion().getCodigo() : "");
            }
            placeholders.put("CARACTERIZACION", programa.getCaracterizacion());
            placeholders.put("MACRO_COMPETENCIA", programa.getMacroCompetencia());
            placeholders.put("SISTEMA_EVALUACION", programa.getSistemaEvaluacion());

            cloner.replacePlaceholders(placeholders);

            // Dynamically inject units into table if table exists
            List<XWPFTable> tables = cloner.getDocument().getTables();
            if (!tables.isEmpty() && programa.getUnidades() != null && !programa.getUnidades().isEmpty()) {
                XWPFTable unitsTable = tables.get(0);
                for (UnidadAprendizaje u : programa.getUnidades()) {
                    List<String> values = List.of(
                            u.getTitulo() != null ? u.getTitulo() : "",
                            u.getSaberesConceptuales() != null ? u.getSaberesConceptuales() : "",
                            u.getSaberesProcedimentales() != null ? u.getSaberesProcedimentales() : "",
                            u.getSaberesActitudinales() != null ? u.getSaberesActitudinales() : "",
                            u.getCriteriosDesempeno() != null ? u.getCriteriosDesempeno() : ""
                    );
                    cloner.injectTableRow(unitsTable, unitsTable.getRows().size(), values);
                }
            }

            return cloner.toByteArray();
        }
    }

    private void _setCellText(XSSFSheet sheet, int r, int c, String text) {
        Row row = sheet.getRow(r);
        if (row == null) row = sheet.createRow(r);
        Cell cell = row.getCell(c);
        if (cell == null) cell = row.createCell(c);
        cell.setCellValue(text != null ? text : "");
    }

    private void _setCellValue(Row row, int c, Object val) {
        Cell cell = row.getCell(c);
        if (cell == null) cell = row.createCell(c);
        if (val instanceof Number) {
            cell.setCellValue(((Number) val).doubleValue());
        } else {
            cell.setCellValue(val != null ? val.toString() : "");
        }
    }
}
