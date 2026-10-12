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
    private final bo.edu.unitepc.sisa.domain.repository.CarreraRepository carreraRepository;
    private final Map<String, byte[]> templateCache = new ConcurrentHashMap<>();

    public OfficeTemplateService(
            ResourceLoader resourceLoader,
            bo.edu.unitepc.sisa.domain.repository.CarreraRepository carreraRepository) {
        this.resourceLoader = resourceLoader;
        this.carreraRepository = carreraRepository;
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
        return exportPacXlsx(pac, null, null);
    }

    public byte[] exportPacXlsx(Pac pac, Long carreraId) throws Exception {
        return exportPacXlsx(pac, carreraId, null);
    }

    public byte[] exportPacXlsx(Pac pac, Long carreraId, String pacType) throws Exception {
        boolean isPractico = "PRACTICO".equalsIgnoreCase(pacType) || "PRACTICO".equalsIgnoreCase(pac.getPacType());
        String templateName = isPractico ? "template_pac_practico.xlsx" : "template_pac_gral.xlsx";

        String resolvedTemplate = templateName;
        try {
            this.loadTemplate(templateName);
        } catch (Exception e) {
            resolvedTemplate = "template_pac.xlsx";
        }

        try (InputStream is = this.loadTemplate(resolvedTemplate);
             XlsxTemplateCloner cloner = new XlsxTemplateCloner(is)) {
            XSSFSheet sheet = cloner.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalStateException("Sheet 0 not found in PAC template");
            }

            AsignacionDocente asig = pac.getAsignacion();
            String carreraNombre = "";
            String asigNombre = "";
            String codigoAsig = "";
            String docenteNombre = "";
            String gestionCod = "";
            String semestre = "";

            if (carreraId != null) {
                carreraNombre = this.carreraRepository.findById(carreraId)
                        .map(Carrera::getNombre)
                        .orElse(asig != null && asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
            } else if (asig != null && asig.getCarrera() != null) {
                carreraNombre = asig.getCarrera().getNombre();
            }

            if (asig != null) {
                if (carreraNombre.isEmpty() && asig.getCarrera() != null) carreraNombre = asig.getCarrera().getNombre();
                if (asig.getAsignatura() != null) {
                    asigNombre = asig.getAsignatura().getNombre();
                    codigoAsig = asig.getAsignatura().getCodigo();
                }
                if (asig.getDocente() != null) docenteNombre = asig.getDocente().getNombreCompleto();
                if (asig.getGestion() != null) gestionCod = asig.getGestion().getCodigo();
                if (asig.getAsignatura() != null && asig.getAsignatura().getSemestre() != null) semestre = asig.getAsignatura().getSemestre() + "° Semestre";
            }

            String justificacion = pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("justificacion") != null ? pac.getSeccionesIdentificacion().get("justificacion").toString() : null;
            String propositoGeneral = pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("propositoGeneral") != null ? pac.getSeccionesIdentificacion().get("propositoGeneral").toString() : null;
            String competenciaGlobal = pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("competenciaGlobal") != null ? pac.getSeccionesIdentificacion().get("competenciaGlobal").toString() : null;
            String unidadCompetencia = pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("unidadCompetencia") != null ? pac.getSeccionesIdentificacion().get("unidadCompetencia").toString() : null;

            if (isPractico) {
                // Official PAC Práctico Coordinates
                if (!carreraNombre.isEmpty()) this._setCellText(sheet, 11, 3, carreraNombre);
                if (!asigNombre.isEmpty()) this._setCellText(sheet, 12, 3, asigNombre);
                if (!codigoAsig.isEmpty()) this._setCellText(sheet, 12, 7, codigoAsig);
                if (!semestre.isEmpty()) this._setCellText(sheet, 13, 7, semestre);
                if (!docenteNombre.isEmpty()) this._setCellText(sheet, 19, 3, docenteNombre);
                if (justificacion != null) this._setCellText(sheet, 23, 1, justificacion);
                if (propositoGeneral != null) this._setCellText(sheet, 27, 1, propositoGeneral);
                if (competenciaGlobal != null) this._setCellText(sheet, 32, 3, competenciaGlobal);
                if (unidadCompetencia != null) this._setCellText(sheet, 33, 3, unidadCompetencia);

                // Practice Schedule Table (Starts at row 90, 0-indexed)
                if (pac.getSesiones() != null && !pac.getSesiones().isEmpty()) {
                    int rIdx = 90;
                    for (SesionMatriz7 ses : pac.getSesiones()) {
                        Row row = sheet.getRow(rIdx);
                        if (row == null) row = sheet.createRow(rIdx);
                        if (ses.getSemana() != null) this._setCellValue(row, 1, ses.getSemana());
                        if (ses.getNroSesion() != null) this._setCellValue(row, 2, ses.getNroSesion());
                        if (ses.getUnidadTematica() != null) this._setCellValue(row, 3, ses.getUnidadTematica());
                        if (ses.getContenidoEspecifico() != null) this._setCellValue(row, 4, ses.getContenidoEspecifico());
                        if (ses.getSaberProcedimental() != null) this._setCellValue(row, 5, ses.getSaberProcedimental());
                        if (ses.getInstrumentoEvaluacion() != null) this._setCellValue(row, 6, ses.getInstrumentoEvaluacion().name());
                        if (ses.getEvidenciaAprendizaje() != null) this._setCellValue(row, 7, ses.getEvidenciaAprendizaje());
                        rIdx++;
                    }
                }
            } else {
                // Official PAC General (Teórico) Coordinates
                if (!carreraNombre.isEmpty()) this._setCellText(sheet, 11, 3, carreraNombre);
                if (!asigNombre.isEmpty()) this._setCellText(sheet, 12, 3, asigNombre);
                if (!codigoAsig.isEmpty()) this._setCellText(sheet, 12, 7, codigoAsig);
                if (!semestre.isEmpty()) this._setCellText(sheet, 14, 7, semestre);
                if (!docenteNombre.isEmpty()) this._setCellText(sheet, 21, 3, docenteNombre);
                if (justificacion != null) this._setCellText(sheet, 25, 1, justificacion);
                if (propositoGeneral != null) this._setCellText(sheet, 29, 1, propositoGeneral);
                if (competenciaGlobal != null) this._setCellText(sheet, 34, 3, competenciaGlobal);
                if (unidadCompetencia != null) this._setCellText(sheet, 35, 3, unidadCompetencia);

                // Matriz 7 General (Starts at row 54, 0-indexed)
                if (pac.getSesiones() != null && !pac.getSesiones().isEmpty()) {
                    int rIdx = 54;
                    for (SesionMatriz7 ses : pac.getSesiones()) {
                        Row row = sheet.getRow(rIdx);
                        if (row == null) row = sheet.createRow(rIdx);
                        if (ses.getSemana() != null) this._setCellValue(row, 1, ses.getSemana());
                        if (ses.getNroSesion() != null) this._setCellValue(row, 2, ses.getNroSesion() + "°");
                        if (ses.getContenidoEspecifico() != null) this._setCellValue(row, 4, ses.getContenidoEspecifico());
                        if (ses.getSaberConceptual() != null) this._setCellValue(row, 5, ses.getSaberConceptual());
                        if (ses.getSaberProcedimental() != null) this._setCellValue(row, 6, ses.getSaberProcedimental());
                        if (ses.getSaberActitudinal() != null) this._setCellValue(row, 7, ses.getSaberActitudinal());
                        if (ses.getCriterioDesempeno() != null) this._setCellValue(row, 8, ses.getCriterioDesempeno());
                        if (ses.getEvidenciaAprendizaje() != null) this._setCellValue(row, 9, ses.getEvidenciaAprendizaje());
                        rIdx++;
                    }
                }
            }

            return cloner.toByteArray();
        }
    }

    public byte[] exportPlanClasesXlsx(PlanDeClase plan) throws Exception {
        return exportPlanClasesXlsx(plan, null);
    }

    public byte[] exportPlanClasesXlsx(PlanDeClase plan, String planType) throws Exception {
        boolean isPractico = "PRACTICO".equalsIgnoreCase(planType);
        String templateName = isPractico ? "template_plan_practico.xlsx" : "template_plan_teorico.xlsx";

        String resolvedTemplate = templateName;
        try {
            this.loadTemplate(templateName);
        } catch (Exception e) {
            resolvedTemplate = "template_plan_clases.xlsx";
        }

        try (InputStream is = this.loadTemplate(resolvedTemplate);
             XlsxTemplateCloner cloner = new XlsxTemplateCloner(is)) {

            XSSFSheet sheet = cloner.getSheetAt(0);
            if (sheet != null) {
                if (isPractico) {
                    // PLAN DE CLASES PRÁCTICO
                    if (plan.getObjetivoSesion() != null) this._setCellText(sheet, 24, 3, plan.getObjetivoSesion());
                    this._setCellText(sheet, 19, 6, (plan.getDuracionTotalMin() != null ? plan.getDuracionTotalMin() : 90) + " min");

                    // 4 Fases Metodológicas
                    if (plan.getMomentos() != null) {
                        for (MomentoPedagogico m : plan.getMomentos()) {
                            if (m.getTipoMomento() != null) {
                                String tipo = m.getTipoMomento().name().toUpperCase();
                                int r = -1;
                                if (tipo.contains("PREP") || tipo.contains("INICIO")) r = 33;
                                else if (tipo.contains("GUIADA")) r = 34;
                                else if (tipo.contains("AUTONOMA")) r = 35;
                                else if (tipo.contains("CIERRE")) r = 36;
                                if (r != -1) {
                                    Row row = sheet.getRow(r);
                                    if (row == null) row = sheet.createRow(r);
                                    if (m.getActividadesDocente() != null) this._setCellValue(row, 5, m.getActividadesDocente());
                                    if (m.getActividadesEstudiante() != null) this._setCellValue(row, 7, m.getActividadesEstudiante());
                                }
                            }
                        }
                    }
                } else {
                    if (plan.getObjetivoSesion() != null) this._setCellText(sheet, 20, 3, plan.getObjetivoSesion());
                    if (plan.getSesion() != null) {
                        if (plan.getSesion().getSaberConceptual() != null) this._setCellText(sheet, 23, 3, plan.getSesion().getSaberConceptual());
                        if (plan.getSesion().getSaberActitudinal() != null) this._setCellText(sheet, 24, 3, plan.getSesion().getSaberActitudinal());
                    }

                    // Secuencia Didáctica (5 momentos en filas 37 a 41)
                    if (plan.getMomentos() != null) {
                        for (MomentoPedagogico m : plan.getMomentos()) {
                            if (m.getTipoMomento() != null) {
                                String tipo = m.getTipoMomento().name().toUpperCase();
                                int r = -1;
                                if (tipo.contains("INICIO") || tipo.contains("INTRO")) r = 37;
                                else if (tipo.contains("RESULTADO") || tipo.contains("LOGRO")) r = 38;
                                else if (tipo.contains("CONTENIDO")) r = 39;
                                else if (tipo.contains("CUERPO") || tipo.contains("DESARROLLO")) r = 40;
                                else if (tipo.contains("CIERRE") || tipo.contains("CONCLUSION")) r = 41;
                                if (r != -1) {
                                    Row row = sheet.getRow(r);
                                    if (row == null) row = sheet.createRow(r);
                                    if (m.getActividadesDocente() != null) this._setCellValue(row, 2, m.getActividadesDocente());
                                    if (m.getDuracionMin() != null) this._setCellValue(row, 7, m.getDuracionMin() + " min");
                                }
                            }
                        }
                    }
                }
            }

            return cloner.toByteArray();
        }
    }

    public byte[] exportProgramaDocx(ProgramaAnalitico programa) throws Exception {
        return exportProgramaDocx(programa, null);
    }

    public byte[] exportProgramaDocx(ProgramaAnalitico programa, Long carreraId) throws Exception {
        try (InputStream is = this.loadTemplate("template_programa_analitico.docx");
             DocxTemplateCloner cloner = new DocxTemplateCloner(is)) {

            Map<String, String> placeholders = new HashMap<>();
            AsignacionDocente asig = programa.getAsignacion();
            String carreraNombre = "";
            if (carreraId != null) {
                carreraNombre = this.carreraRepository.findById(carreraId)
                        .map(Carrera::getNombre)
                        .orElse(asig != null && asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
            } else if (asig != null && asig.getCarrera() != null) {
                carreraNombre = asig.getCarrera().getNombre();
            }

            if (asig != null) {
                placeholders.put("CARRERA", carreraNombre);
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
