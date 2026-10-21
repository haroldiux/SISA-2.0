package bo.edu.unitepc.sisa.infrastructure.office;

import bo.edu.unitepc.sisa.domain.model.*;
import bo.edu.unitepc.sisa.exception.ScuOfficeTemplateNotFoundException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xwpf.usermodel.*;
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
        return exportPacXlsx(pac, null, null, null);
    }

    public byte[] exportPacXlsx(Pac pac, Long carreraId) throws Exception {
        return exportPacXlsx(pac, carreraId, null, null);
    }

    public byte[] exportPacXlsx(Pac pac, Long carreraId, String pacType) throws Exception {
        return exportPacXlsx(pac, carreraId, pacType, null);
    }

    public byte[] exportPacXlsx(Pac pac, Long carreraId, String pacType, Map<String, String> meta) throws Exception {
        boolean isPractico = "PRACTICO".equalsIgnoreCase(pacType) || (pac != null && "PRACTICO".equalsIgnoreCase(pac.getPacType()));
        String templateName = isPractico ? "template_pac_practico.xlsx" : "template_pac_gral.xlsx";

        String resolvedTemplate = templateName;
        try {
            this.loadTemplate(templateName);
        } catch (Exception e) {
            resolvedTemplate = isPractico ? "template_pac_practico.xlsx" : "template_pac_gral.xlsx";
        }

        try (InputStream is = this.loadTemplate(resolvedTemplate);
             XlsxTemplateCloner cloner = new XlsxTemplateCloner(is)) {
            XSSFSheet sheet = cloner.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalStateException("Sheet 0 not found in PAC template");
            }

            AsignacionDocente asig = (pac != null) ? pac.getAsignacion() : null;
            String carreraNombre = meta != null && meta.get("carrera") != null ? meta.get("carrera") : "";
            String asigNombre = meta != null && meta.get("asignatura") != null ? meta.get("asignatura") : "";
            String codigoAsig = meta != null && meta.get("codigo") != null ? meta.get("codigo") : "";
            String docenteNombre = meta != null && meta.get("docente") != null ? meta.get("docente") : "";
            String gestionCod = meta != null && meta.get("gestion") != null ? meta.get("gestion") : "II-2026";
            String semestre = meta != null && meta.get("semestre") != null ? meta.get("semestre") : "";

            if (carreraNombre.isEmpty()) {
                if (carreraId != null) {
                    carreraNombre = this.carreraRepository.findById(carreraId)
                            .map(Carrera::getNombre)
                            .orElse(asig != null && asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
                } else if (asig != null && asig.getCarrera() != null) {
                    carreraNombre = asig.getCarrera().getNombre();
                }
            }

            if (asig != null) {
                if (carreraNombre.isEmpty() && asig.getCarrera() != null) carreraNombre = asig.getCarrera().getNombre();
                if (asigNombre.isEmpty() && asig.getAsignatura() != null) asigNombre = asig.getAsignatura().getNombre();
                if (codigoAsig.isEmpty() && asig.getAsignatura() != null) codigoAsig = asig.getAsignatura().getCodigo();
                if (docenteNombre.isEmpty() && asig.getDocente() != null) docenteNombre = asig.getDocente().getNombreCompleto();
                if (gestionCod.isEmpty() && asig.getGestion() != null) gestionCod = asig.getGestion().getCodigo();
                if (semestre.isEmpty() && asig.getAsignatura() != null && asig.getAsignatura().getSemestre() != null) {
                    semestre = asig.getAsignatura().getSemestre() + "° Semestre";
                }
            }

            String justificacion = (pac != null && pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("justificacion") != null) ? pac.getSeccionesIdentificacion().get("justificacion").toString() : null;
            String propositoGeneral = (pac != null && pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("propositoGeneral") != null) ? pac.getSeccionesIdentificacion().get("propositoGeneral").toString() : null;
            String competenciaGlobal = (pac != null && pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("competenciaGlobal") != null) ? pac.getSeccionesIdentificacion().get("competenciaGlobal").toString() : null;
            String unidadCompetencia = (pac != null && pac.getSeccionesIdentificacion() != null && pac.getSeccionesIdentificacion().get("unidadCompetencia") != null) ? pac.getSeccionesIdentificacion().get("unidadCompetencia").toString() : null;

            if (isPractico) {
                // Official PAC Práctico Coordinates
                if (!carreraNombre.isEmpty()) {
                    this._setCellText(sheet, 11, 2, carreraNombre);
                    this._setCellText(sheet, 11, 3, carreraNombre);
                }
                if (!asigNombre.isEmpty()) {
                    this._setCellText(sheet, 12, 2, asigNombre);
                    this._setCellText(sheet, 12, 3, asigNombre);
                }
                if (!codigoAsig.isEmpty()) this._setCellText(sheet, 12, 7, codigoAsig);
                if (!semestre.isEmpty()) this._setCellText(sheet, 13, 7, semestre);
                if (!docenteNombre.isEmpty()) {
                    this._setCellText(sheet, 19, 2, docenteNombre);
                    this._setCellText(sheet, 19, 3, docenteNombre);
                }
                if (justificacion != null) this._setCellText(sheet, 23, 1, justificacion);
                if (propositoGeneral != null) this._setCellText(sheet, 27, 1, propositoGeneral);
                if (competenciaGlobal != null) this._setCellText(sheet, 32, 3, competenciaGlobal);
                if (unidadCompetencia != null) this._setCellText(sheet, 33, 3, unidadCompetencia);

                // Practice Schedule Table (Starts at row 90, 0-indexed)
                if (pac != null && pac.getSesiones() != null && !pac.getSesiones().isEmpty()) {
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
                if (!carreraNombre.isEmpty()) {
                    this._setCellText(sheet, 11, 2, carreraNombre);
                    this._setCellText(sheet, 11, 3, carreraNombre);
                }
                if (!asigNombre.isEmpty()) {
                    this._setCellText(sheet, 12, 2, asigNombre);
                    this._setCellText(sheet, 12, 3, asigNombre);
                }
                if (!codigoAsig.isEmpty()) this._setCellText(sheet, 12, 7, codigoAsig);
                if (!semestre.isEmpty()) this._setCellText(sheet, 14, 7, semestre);
                if (!docenteNombre.isEmpty()) {
                    this._setCellText(sheet, 21, 2, docenteNombre);
                    this._setCellText(sheet, 21, 3, docenteNombre);
                }
                if (justificacion != null) this._setCellText(sheet, 25, 1, justificacion);
                if (propositoGeneral != null) this._setCellText(sheet, 29, 1, propositoGeneral);
                if (competenciaGlobal != null) this._setCellText(sheet, 34, 3, competenciaGlobal);
                if (unidadCompetencia != null) this._setCellText(sheet, 35, 3, unidadCompetencia);

                // Matriz 7 General (Starts at row 54, 0-indexed)
                if (pac != null && pac.getSesiones() != null && !pac.getSesiones().isEmpty()) {
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
        return exportPlanClasesXlsx(plan, null, null);
    }

    public byte[] exportPlanClasesXlsx(PlanDeClase plan, String planType) throws Exception {
        return exportPlanClasesXlsx(plan, planType, null);
    }

    public byte[] exportPlanClasesXlsx(PlanDeClase plan, String planType, Map<String, String> meta) throws Exception {
        boolean isPractico = "PRACTICO".equalsIgnoreCase(planType);
        boolean isTeoricoPractico = "TEORICO_PRACTICO".equalsIgnoreCase(planType) || "MIXTO".equalsIgnoreCase(planType);
        String templateName = isPractico ? "template_plan_practico.xlsx"
                : (isTeoricoPractico ? "template_plan_teorico_practico.xlsx" : "template_plan_teorico.xlsx");

        String resolvedTemplate = templateName;
        try {
            this.loadTemplate(templateName);
        } catch (Exception e) {
            resolvedTemplate = isPractico ? "template_plan_practico.xlsx" : "template_plan_teorico.xlsx";
        }

        try (InputStream is = this.loadTemplate(resolvedTemplate);
             XlsxTemplateCloner cloner = new XlsxTemplateCloner(is)) {

            XSSFSheet sheet = cloner.getSheetAt(0);
            if (sheet != null) {
                AsignacionDocente asig = (plan != null && plan.getSesion() != null && plan.getSesion().getPac() != null) ? plan.getSesion().getPac().getAsignacion() : null;
                String carreraNombre = meta != null && meta.get("carrera") != null ? meta.get("carrera") : "";
                String asigNombre = meta != null && meta.get("asignatura") != null ? meta.get("asignatura") : "";
                String codigoAsig = meta != null && meta.get("codigo") != null ? meta.get("codigo") : "";
                String docenteNombre = meta != null && meta.get("docente") != null ? meta.get("docente") : "";
                String semestre = meta != null && meta.get("semestre") != null ? meta.get("semestre") : "";

                if (asig != null) {
                    if (carreraNombre.isEmpty() && asig.getCarrera() != null) carreraNombre = asig.getCarrera().getNombre();
                    if (asigNombre.isEmpty() && asig.getAsignatura() != null) asigNombre = asig.getAsignatura().getNombre();
                    if (codigoAsig.isEmpty() && asig.getAsignatura() != null) codigoAsig = asig.getAsignatura().getCodigo();
                    if (docenteNombre.isEmpty() && asig.getDocente() != null) docenteNombre = asig.getDocente().getNombreCompleto();
                    if (semestre.isEmpty() && asig.getAsignatura() != null && asig.getAsignatura().getSemestre() != null) {
                        semestre = asig.getAsignatura().getSemestre() + "° Semestre";
                    }
                }

                if (isPractico) {
                    // PLAN DE CLASES PRÁCTICO
                    if (!docenteNombre.isEmpty()) this._setCellText(sheet, 11, 2, docenteNombre);
                    if (!asigNombre.isEmpty()) this._setCellText(sheet, 11, 6, asigNombre + (!codigoAsig.isEmpty() ? " (" + codigoAsig + ")" : ""));
                    if (!carreraNombre.isEmpty()) this._setCellText(sheet, 12, 6, carreraNombre);
                    if (!semestre.isEmpty()) this._setCellText(sheet, 19, 8, semestre);
                    if (!docenteNombre.isEmpty()) this._setCellText(sheet, 20, 6, docenteNombre);

                    if (plan != null && plan.getObjetivoSesion() != null) this._setCellText(sheet, 24, 3, plan.getObjetivoSesion());
                    this._setCellText(sheet, 19, 6, (plan != null && plan.getDuracionTotalMin() != null ? plan.getDuracionTotalMin() : 90) + " min");

                    // 4 Fases Metodológicas
                    if (plan != null && plan.getMomentos() != null) {
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
                    // PLAN DE CLASES TEÓRICO
                    if (!docenteNombre.isEmpty()) this._setCellText(sheet, 11, 2, docenteNombre);
                    if (!asigNombre.isEmpty()) this._setCellText(sheet, 11, 6, asigNombre + (!codigoAsig.isEmpty() ? " (" + codigoAsig + ")" : ""));
                    if (!carreraNombre.isEmpty()) this._setCellText(sheet, 12, 6, carreraNombre);

                    if (plan != null && plan.getObjetivoSesion() != null) this._setCellText(sheet, 20, 3, plan.getObjetivoSesion());
                    if (plan != null && plan.getSesion() != null) {
                        if (plan.getSesion().getSaberConceptual() != null) this._setCellText(sheet, 23, 3, plan.getSesion().getSaberConceptual());
                        if (plan.getSesion().getSaberActitudinal() != null) this._setCellText(sheet, 24, 3, plan.getSesion().getSaberActitudinal());
                    }

                    // Secuencia Didáctica (5 momentos en filas 37 a 41)
                    if (plan != null && plan.getMomentos() != null) {
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
        return exportProgramaDocx(programa, null, null);
    }

    public byte[] exportProgramaDocx(ProgramaAnalitico programa, Long carreraId) throws Exception {
        return exportProgramaDocx(programa, carreraId, null);
    }

    public byte[] exportProgramaDocx(ProgramaAnalitico programa, Long carreraId, Map<String, String> meta) throws Exception {
        try (InputStream is = this.loadTemplate("template_programa_analitico.docx");
             DocxTemplateCloner cloner = new DocxTemplateCloner(is)) {

            XWPFDocument doc = cloner.getDocument();
            AsignacionDocente asig = (programa != null) ? programa.getAsignacion() : null;

            String carreraNombre = meta != null && meta.get("carrera") != null ? meta.get("carrera") : "";
            if (carreraNombre.isEmpty()) {
                if (carreraId != null) {
                    carreraNombre = this.carreraRepository.findById(carreraId)
                            .map(Carrera::getNombre)
                            .orElse(asig != null && asig.getCarrera() != null ? asig.getCarrera().getNombre() : "");
                } else if (asig != null && asig.getCarrera() != null) {
                    carreraNombre = asig.getCarrera().getNombre();
                }
            }

            String asigNombre = meta != null && meta.get("asignatura") != null ? meta.get("asignatura") : "";
            if (asigNombre.isEmpty() && asig != null && asig.getAsignatura() != null) {
                asigNombre = asig.getAsignatura().getNombre();
            }

            String codigoAsig = meta != null && meta.get("codigo") != null ? meta.get("codigo") : "";
            if (codigoAsig.isEmpty() && asig != null && asig.getAsignatura() != null) {
                codigoAsig = asig.getAsignatura().getCodigo();
            }

            String docenteNombre = meta != null && meta.get("docente") != null ? meta.get("docente") : "";
            if (docenteNombre.isEmpty() && asig != null && asig.getDocente() != null) {
                docenteNombre = asig.getDocente().getNombreCompleto();
            }

            String semestre = meta != null && meta.get("semestre") != null ? meta.get("semestre") : "";
            if (semestre.isEmpty() && asig != null && asig.getAsignatura() != null && asig.getAsignatura().getSemestre() != null) {
                semestre = asig.getAsignatura().getSemestre() + "º";
            }
            if (semestre.isEmpty()) semestre = "1º";

            String creditos = meta != null && meta.get("creditos") != null ? meta.get("creditos") : "12";
            String ht = meta != null && meta.get("horasTeoricas") != null ? meta.get("horasTeoricas") : "2";
            String hp = meta != null && meta.get("horasPracticas") != null ? meta.get("horasPracticas") : "4";
            int nHt = 2;
            int nHp = 4;
            try { nHt = Integer.parseInt(ht.replaceAll("\\D", "")); } catch (Exception ignored) {}
            try { nHp = Integer.parseInt(hp.replaceAll("\\D", "")); } catch (Exception ignored) {}
            String hs = String.valueOf((nHt + nHp) * 20);

            // 0. Update section header (doc.getHeaderList())
            if (carreraNombre != null && !carreraNombre.isBlank()) {
                for (XWPFHeader header : doc.getHeaderList()) {
                    for (XWPFTable t : header.getTables()) {
                        for (XWPFTableRow r : t.getRows()) {
                            for (XWPFTableCell c : r.getTableCells()) {
                                for (XWPFParagraph p : c.getParagraphs()) {
                                    for (XWPFRun run : p.getRuns()) {
                                        String text = run.getText(0);
                                        if (text != null && text.contains("CARRERA:")) {
                                            run.setText("\nCARRERA: " + carreraNombre.toUpperCase(), 0);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 1. Update Header Table (Table 0, Row 2)
            List<XWPFTable> tables = doc.getTables();
            XWPFTable headerTable = !tables.isEmpty() ? tables.get(0) : null;
            if (headerTable != null && headerTable.getRows().size() > 2) {
                XWPFTableRow row2 = headerTable.getRow(2);
                List<XWPFTableCell> cells = row2.getTableCells();
                this._setDocxCellText(cells, 0, codigoAsig);
                this._setDocxCellText(cells, 1, semestre);
                this._setDocxCellText(cells, 2, asigNombre.toUpperCase());
                this._setDocxCellText(cells, 3, creditos);
                this._setDocxCellText(cells, 4, String.valueOf(nHt));
                this._setDocxCellText(cells, 5, String.valueOf(nHp));
                this._setDocxCellText(cells, 6, hs);
                this._setDocxCellText(cells, 7, "3");
            }

            // 2. Clear old hardcoded paragraphs after the header table
            if (headerTable != null) {
                int totalElements = doc.getBodyElements().size();
                int tablePos = -1;
                for (int i = 0; i < totalElements; i++) {
                    if (doc.getBodyElements().get(i) == headerTable) {
                        tablePos = i;
                        break;
                    }
                }
                if (tablePos != -1) {
                    while (doc.getBodyElements().size() > tablePos + 1) {
                        doc.removeBodyElement(tablePos + 1);
                    }
                }
            }

            // 3. Inject Actual Course Content (or blank structure if empty)
            String carac = (programa != null && programa.getCaracterizacion() != null)
                    ? programa.getCaracterizacion().trim()
                    : "";
            String macro = (programa != null && programa.getMacroCompetencia() != null)
                    ? programa.getMacroCompetencia().trim()
                    : "";
            String evalSis = (programa != null && programa.getSistemaEvaluacion() != null)
                    ? programa.getSistemaEvaluacion().trim()
                    : "";

            this._addDocxSectionHeading(doc, "1. CARACTERIZACIÓN DE LA ASIGNATURA");
            this._addDocxBodyParagraph(doc, carac);

            this._addDocxSectionHeading(doc, "2. MACRO COMPETENCIA / COMPETENCIA GLOBAL");
            this._addDocxBodyParagraph(doc, macro);

            this._addDocxSectionHeading(doc, "3. SISTEMA DE EVALUACIÓN");
            this._addDocxBodyParagraph(doc, evalSis);

            this._addDocxSectionHeading(doc, "4. UNIDADES DE APRENDIZAJE");
            boolean hasUnits = programa != null && programa.getUnidades() != null && !programa.getUnidades().isEmpty();
            if (hasUnits) {
                int uNum = 1;
                for (UnidadAprendizaje u : programa.getUnidades()) {
                    String title = u.getTitulo() != null && !u.getTitulo().isBlank()
                            ? u.getTitulo()
                            : "UNIDAD " + uNum + ": Contenido Temático";
                    this._addDocxSubHeading(doc, "UNIDAD " + uNum + ": " + title);
                    if (u.getSaberesConceptuales() != null && !u.getSaberesConceptuales().isBlank()) {
                        this._addDocxBullet(doc, "Saberes Conceptuales: " + u.getSaberesConceptuales());
                    }
                    if (u.getSaberesProcedimentales() != null && !u.getSaberesProcedimentales().isBlank()) {
                        this._addDocxBullet(doc, "Saberes Procedimentales: " + u.getSaberesProcedimentales());
                    }
                    if (u.getSaberesActitudinales() != null && !u.getSaberesActitudinales().isBlank()) {
                        this._addDocxBullet(doc, "Saberes Actitudinales: " + u.getSaberesActitudinales());
                    }
                    if (u.getCriteriosDesempeno() != null && !u.getCriteriosDesempeno().isBlank()) {
                        this._addDocxBullet(doc, "Criterios de Desempeño: " + u.getCriteriosDesempeno());
                    }
                    uNum++;
                }
            } else {
                for (int uNum = 1; uNum <= 4; uNum++) {
                    this._addDocxSubHeading(doc, "UNIDAD " + uNum + ": ");
                    this._addDocxBullet(doc, "Saberes Conceptuales: ");
                    this._addDocxBullet(doc, "Saberes Procedimentales: ");
                    this._addDocxBullet(doc, "Saberes Actitudinales: ");
                    this._addDocxBullet(doc, "Criterios de Desempeño: ");
                }
            }

            this._addDocxSectionHeading(doc, "5. BIBLIOGRAFÍA OFICIAL");
            boolean hasBib = programa != null && programa.getBibliografia() != null && !programa.getBibliografia().isEmpty();
            if (hasBib) {
                for (Bibliografia b : programa.getBibliografia()) {
                    String cita = b.getCitaApa() != null && !b.getCitaApa().isBlank()
                            ? b.getCitaApa()
                            : (b.getAutor() != null ? b.getAutor() + " (" + b.getAnio() + "). " + b.getTitulo() : b.getTitulo());
                    this._addDocxBullet(doc, cita != null ? cita : "Referencia bibliográfica institucional.");
                }
            } else {
                this._addDocxBodyParagraph(doc, "");
            }

            return cloner.toByteArray();
        }
    }

    private void _setDocxCellText(List<XWPFTableCell> cells, int index, String text) {
        if (cells == null || index < 0 || index >= cells.size()) {
            return;
        }
        XWPFTableCell cell = cells.get(index);
        while (cell.getParagraphs().size() > 1) {
            cell.removeParagraph(1);
        }
        XWPFParagraph p = cell.getParagraphs().isEmpty() ? cell.addParagraph() : cell.getParagraphs().get(0);
        while (!p.getRuns().isEmpty()) {
            p.removeRun(0);
        }
        XWPFRun r = p.createRun();
        r.setText(text != null ? text : "");
        r.setFontFamily("Calibri");
        r.setFontSize(10);
    }

    private void _addDocxSectionHeading(XWPFDocument doc, String title) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(200);
        p.setSpacingAfter(80);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontSize(11);
        r.setFontFamily("Calibri");
        r.setColor("1E3A8A");
        r.setText(title);
    }

    private void _addDocxSubHeading(XWPFDocument doc, String title) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(120);
        p.setSpacingAfter(60);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontSize(10);
        r.setFontFamily("Calibri");
        r.setText(title);
    }

    private void _addDocxBodyParagraph(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingAfter(80);
        XWPFRun r = p.createRun();
        r.setFontSize(10);
        r.setFontFamily("Calibri");
        r.setText(text != null ? text : "");
    }

    private void _addDocxBullet(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingAfter(40);
        p.setIndentationLeft(360);
        XWPFRun bullet = p.createRun();
        bullet.setText("• ");
        bullet.setBold(true);
        bullet.setFontFamily("Calibri");
        XWPFRun r = p.createRun();
        r.setFontSize(9);
        r.setFontFamily("Calibri");
        r.setText(text != null ? text : "");
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
