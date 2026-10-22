package bo.edu.unitepc.sisa.infrastructure.office.strategy.impl;

import bo.edu.unitepc.sisa.api.request.ScuMomentoPedagogicoDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import bo.edu.unitepc.sisa.infrastructure.office.XlsxTemplateCloner;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.PlanClaseParserStrategy;
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
import java.util.*;

/**
 * Concrete strategy for parsing and generating UNITEPC Plan de Clases Práctico Excel workbooks.
 * Handles Datos de la Práctica (Ambiente, N° estudiantes, Duración),
 * Alineación y Recursos (Taxonomía de Bloom), Modelo Metodológico (4 fases),
 * Evaluación, and Desarrollo.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class PlanClasePracticoParser implements PlanClaseParserStrategy {

    private static final Logger log = LoggerFactory.getLogger(PlanClasePracticoParser.class);

    private final ResourceLoader resourceLoader;

    public PlanClasePracticoParser(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public boolean supports(String planType) {
        if (planType == null) return false;
        String t = planType.trim().toUpperCase();
        return t.equals("PRACTICO") || t.equals("PRÁCTICO") || t.equals("PA") || t.equals("PL") || t.equals("PS")
                || (t.contains("PLAN DE CLASE PRÁCTICO") && !t.contains("TEÓRIC") && !t.contains("TEORIC"))
                || (t.contains("PLAN DE CLASE PRACTICO") && !t.contains("TEORIC"));
    }

    @Override
    public List<ScuPlanClaseDto> parse(InputStream inputStream, String filename) {
        List<ScuPlanClaseDto> planes = new ArrayList<>();
        try {
            byte[] bytes = inputStream.readAllBytes();
            try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
                int numSheets = wb.getNumberOfSheets();
                for (int s = 0; s < numSheets; s++) {
                    XSSFSheet sh = wb.getSheetAt(s);
                    String sheetName = sh.getSheetName();
                    if (sheetName.toUpperCase().contains("EJEMPLO")) continue;

                    ScuPlanClaseDto plan = new ScuPlanClaseDto();
                    plan.setSesionId((long) (s + 1));
                    plan.setNombreHoja(sheetName);
                    plan.setTemplateType("PRACTICO");
                    plan.setComponentType("PA");

                    parsePracticoSheet(sh, plan);

                    List<ScuMomentoPedagogicoDto> momentos = extractPracticoMomentos(sh, plan);
                    if (momentos.isEmpty()) {
                        momentos = defaultPracticoMomentos(plan.getDuracionTotalMin() != null ? plan.getDuracionTotalMin() : 180);
                    }

                    int totalMin = momentos.stream()
                            .mapToInt(m -> m.getDuracionMin() != null ? m.getDuracionMin() : 0).sum();
                    plan.setDuracionTotalMin(totalMin > 0 ? totalMin : 180);
                    plan.setMomentos(momentos);

                    plan.syncToNested();
                    planes.add(plan);
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Plan de Clases Práctico: {}", e.getMessage(), e);
            throw new RuntimeException("Error al parsear Plan de Clases Práctico: " + e.getMessage(), e);
        }

        if (planes.isEmpty()) {
            planes.add(createDefaultPracticoPlan(1L, "UA-1"));
        }

        return planes;
    }

    @Override
    public byte[] generate(List<ScuPlanClaseDto> planList, Map<String, Object> context) {
        try (InputStream templateIs = openTemplateStream()) {
            if (templateIs != null) {
                try (XlsxTemplateCloner cloner = new XlsxTemplateCloner(templateIs)) {
                    XSSFWorkbook wb = cloner.getWorkbook();
                    for (int i = 0; i < planList.size(); i++) {
                        ScuPlanClaseDto dto = planList.get(i);
                        XSSFSheet sheet = (i < wb.getNumberOfSheets()) ? wb.getSheetAt(i) : wb.createSheet("UA-" + (i + 1));
                        populatePracticoSheet(sheet, dto);
                    }
                    return cloner.toByteArray();
                }
            }
        } catch (Exception e) {
            log.warn("Could not load Plan de Clases Práctico template, building programmatically: {}", e.getMessage());
        }

        return buildProgrammaticWorkbook(planList);
    }

    private void parsePracticoSheet(XSSFSheet sh, ScuPlanClaseDto plan) {
        // 1. DATOS GENERALES (Rows 12, 13, 15, 16 -> 0-indexed 11, 12, 14, 15)
        String c12 = cellStr(sh.getRow(11), 2);
        String g12 = cellStr(sh.getRow(11), 6);
        String c13 = cellStr(sh.getRow(12), 2);
        String g13 = cellStr(sh.getRow(12), 6);
        String c15 = cellStr(sh.getRow(14), 2);
        String c16 = cellStr(sh.getRow(15), 2);

        if (!c12.isEmpty()) plan.setNombreDocente(c12);
        if (!g12.isEmpty()) plan.setNombreAsignatura(g12);
        if (!c13.isEmpty()) plan.setFecha(c13);
        if (!g13.isEmpty()) plan.setCarrera(g13);
        if (!c15.isEmpty()) plan.setUnidadTitulo(c15);
        if (!c16.isEmpty()) plan.setElementoCompetencia(c16);

        // 2. DATOS DE LA PRÁCTICA (Rows 20, 21 -> 0-indexed 19, 20)
        String c20 = cellStr(sh.getRow(19), 2); // Título
        String e20 = cellStr(sh.getRow(19), 4); // Fecha
        String g20 = cellStr(sh.getRow(19), 6); // Duración
        String i20 = cellStr(sh.getRow(19), 8); // Semestre
        String c21 = cellStr(sh.getRow(20), 2); // Ambiente
        String e21 = cellStr(sh.getRow(20), 4); // N° estudiantes
        String g21 = cellStr(sh.getRow(20), 6); // Docente

        if (!c20.isEmpty()) {
            plan.setTituloPractica(c20);
            plan.setContenidoTema(c20);
        }
        if (!e20.isEmpty() && (plan.getFecha() == null || plan.getFecha().isBlank())) {
            plan.setFecha(e20);
        }
        if (!g20.isEmpty()) {
            plan.setDuracionPractica(g20);
            int dur = parseDuracion(g20);
            if (dur > 0) plan.setDuracionTotalMin(dur);
        }
        if (!i20.isEmpty()) plan.setSemestre(i20);
        if (!c21.isEmpty()) plan.setAmbiente(c21);
        if (!e21.isEmpty()) plan.setNroEstudiantes(e21);
        if (!g21.isEmpty() && (plan.getNombreDocente() == null || plan.getNombreDocente().isBlank())) {
            plan.setNombreDocente(g21);
        }

        // 3. ALINEACIÓN Y RECURSOS (Rows 25-29 -> 0-indexed 24-28, col 3 / D)
        String d25 = cellStr(sh.getRow(24), 3);
        String d26 = cellStr(sh.getRow(25), 3);
        String d27 = cellStr(sh.getRow(26), 3);
        String d28 = cellStr(sh.getRow(27), 3);
        String d29 = cellStr(sh.getRow(28), 3);

        // Fallback to col 2 if col 3 empty
        if (d25.isEmpty()) d25 = cellStr(sh.getRow(24), 2);
        if (d26.isEmpty()) d26 = cellStr(sh.getRow(25), 2);
        if (d27.isEmpty()) d27 = cellStr(sh.getRow(26), 2);
        if (d28.isEmpty()) d28 = cellStr(sh.getRow(27), 2);
        if (d29.isEmpty()) d29 = cellStr(sh.getRow(28), 2);

        if (!d25.isEmpty()) {
            plan.setObjetivoAprendizaje(d25);
            plan.setObjetivoSesion(d25);
        }
        if (!d26.isEmpty()) {
            plan.setResultadosBloom(d26);
            plan.setLogrosEsperados(d26);
        }
        if (!d27.isEmpty()) plan.setPreparacionMateriales(d27);
        if (!d28.isEmpty()) plan.setEquipamiento(d28);
        if (!d29.isEmpty()) {
            plan.setEquipo(d29);
            plan.setRecursosEnsenanza(d29);
        }

        // 4. MODELO METODOLÓGICO (Rows 34-37 -> 0-indexed 33-36)
        List<ScuPlanClaseDto.FaseMetodologicaDto> fasesList = new ArrayList<>();
        String[] phaseNames = {"Preparación", "Ejecución guiada", "Ejecución autónoma", "Cierre"};
        int[] phaseDurs = {20, 70, 70, 20};
        StringBuilder modeloBuilder = new StringBuilder();

        for (int i = 0; i < 4; i++) {
            Row r = sh.getRow(33 + i);
            String fin = cellStr(r, 2);
            String doc = cellStr(r, 5);
            String est = cellStr(r, 7);
            fasesList.add(ScuPlanClaseDto.FaseMetodologicaDto.builder()
                    .fase(phaseNames[i])
                    .finalidad(fin)
                    .actividadDocente(doc)
                    .actividadEstudiante(est)
                    .duracionMin(phaseDurs[i])
                    .build());
            if (!fin.isEmpty() || !doc.isEmpty() || !est.isEmpty()) {
                modeloBuilder.append(phaseNames[i]).append(" - Finalidad: ").append(fin)
                        .append(" | Docente: ").append(doc).append(" | Estudiante: ").append(est).append("\n");
            }
        }
        plan.setFasesMetodologicas(fasesList);
        if (fasesList.size() >= 4) {
            plan.setModeloPrepFin(fasesList.get(0).getFinalidad());
            plan.setModeloPrepDoc(fasesList.get(0).getActividadDocente());
            plan.setModeloPrepEst(fasesList.get(0).getActividadEstudiante());

            plan.setModeloGuiFin(fasesList.get(1).getFinalidad());
            plan.setModeloGuiDoc(fasesList.get(1).getActividadDocente());
            plan.setModeloGuiEst(fasesList.get(1).getActividadEstudiante());

            plan.setModeloAutFin(fasesList.get(2).getFinalidad());
            plan.setModeloAutDoc(fasesList.get(2).getActividadDocente());
            plan.setModeloAutEst(fasesList.get(2).getActividadEstudiante());

            plan.setModeloCieFin(fasesList.get(3).getFinalidad());
            plan.setModeloCieDoc(fasesList.get(3).getActividadDocente());
            plan.setModeloCieEst(fasesList.get(3).getActividadEstudiante());
        }
        if (modeloBuilder.length() > 0) {
            plan.setModeloMetodologico(modeloBuilder.toString().trim());
        }

        // 5. EVALUACIÓN DE LOS APRENDIZAJES (Rows 42, 43 -> 0-indexed 41, 42)
        Row r42 = sh.getRow(41);
        if (r42 != null) {
            plan.setEvaluacionFormativaActividad(cellStr(r42, 2));
            plan.setEvaluacionFormativaInstrumento(cellStr(r42, 5));
            plan.setEvaluacionFormativaEvidencia(cellStr(r42, 7));
        }
        Row r43 = sh.getRow(42);
        if (r43 != null) {
            plan.setEvaluacionSumativaActividad(cellStr(r43, 2));
            plan.setEvaluacionSumativaInstrumento(cellStr(r43, 5));
            plan.setEvaluacionSumativaEvidencia(cellStr(r43, 7));
        }

        // 6. DESARROLLO (Rows 48-54 -> 0-indexed 47-53)
        List<ScuPlanClaseDto.DesarrolloPasoDto> pasosList = new ArrayList<>();
        StringBuilder desarrolloBuilder = new StringBuilder();
        for (int r = 47; r <= 53; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;
            String faseComun = cellStr(row, 1);
            String tiempoStr = cellStr(row, 2);
            int tiempoMin = parseDuracion(tiempoStr);
            String act = cellStr(row, 3);
            String rec = cellStr(row, 5);
            String otra = cellStr(row, 7);

            if (!faseComun.isEmpty() || !act.isEmpty() || !rec.isEmpty() || !otra.isEmpty() || tiempoMin > 0) {
                int pasoNro = r - 47 + 1;
                pasosList.add(ScuPlanClaseDto.DesarrolloPasoDto.builder()
                        .pasoNro(pasoNro)
                        .faseComun(faseComun)
                        .tiempoMin(tiempoMin)
                        .actividad(act)
                        .recursos(rec)
                        .otraInformacion(otra)
                        .build());
                if (!act.isEmpty()) {
                    desarrolloBuilder.append("Paso ").append(pasoNro).append(" (").append(tiempoMin).append(" min): ").append(act).append("\n");
                }
            }
        }
        plan.setPasosDesarrollo(pasosList);
        if (desarrolloBuilder.length() > 0) {
            plan.setDesarrollo(desarrolloBuilder.toString().trim());
        }
        for (int i = 0; i < Math.min(pasosList.size(), 4); i++) {
            ScuPlanClaseDto.DesarrolloPasoDto p = pasosList.get(i);
            String t = p.getTiempoMin() != null ? (p.getTiempoMin() + " min") : "";
            if (i == 0) { plan.setDesarrolloTiempo1(t); plan.setDesarrolloAct1(p.getActividad()); plan.setDesarrolloRec1(p.getRecursos()); plan.setDesarrolloInfo1(p.getOtraInformacion()); }
            else if (i == 1) { plan.setDesarrolloTiempo2(t); plan.setDesarrolloAct2(p.getActividad()); plan.setDesarrolloRec2(p.getRecursos()); plan.setDesarrolloInfo2(p.getOtraInformacion()); }
            else if (i == 2) { plan.setDesarrolloTiempo3(t); plan.setDesarrolloAct3(p.getActividad()); plan.setDesarrolloRec3(p.getRecursos()); plan.setDesarrolloInfo3(p.getOtraInformacion()); }
            else if (i == 3) { plan.setDesarrolloTiempo4(t); plan.setDesarrolloAct4(p.getActividad()); plan.setDesarrolloRec4(p.getRecursos()); plan.setDesarrolloInfo4(p.getOtraInformacion()); }
        }

        // 7. NOTAS DEL DOCENTE (Rows 59-77 -> 0-indexed 58-76)
        List<ScuPlanClaseDto.NotaDocenteSesionDto> notasList = new ArrayList<>();
        for (int r = 58; r <= 76; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;
            String sesCol = cellStr(row, 1);
            String nota = cellStr(row, 2);
            double sesNum = r - 58 + 1.0;
            if (!sesCol.isEmpty()) {
                try {
                    sesNum = Double.parseDouble(sesCol);
                } catch (Exception ignored) {}
            }
            if (!nota.isEmpty()) {
                notasList.add(ScuPlanClaseDto.NotaDocenteSesionDto.builder()
                        .sesionNro(sesNum)
                        .nota(nota)
                        .build());
            }
        }
        plan.setNotasDocente(notasList);

        // Fallbacks for empty header values
        if (plan.getObjetivoSesion() == null || plan.getObjetivoSesion().isBlank()) {
            plan.setObjetivoSesion("Desarrollo de competencias procedimentales en práctica de laboratorio/aula");
        }
        if (plan.getTituloPractica() == null || plan.getTituloPractica().isBlank()) {
            plan.setTituloPractica("Práctica de formación profesional");
        }
        if (plan.getContenidoTema() == null || plan.getContenidoTema().isBlank()) {
            plan.setContenidoTema(plan.getTituloPractica());
        }
        if (plan.getSaberProcedimental() == null || plan.getSaberProcedimental().isBlank()) {
            plan.setSaberProcedimental("Ejecución y destreza procedimental en entorno de práctica");
        }
    }

    private List<ScuMomentoPedagogicoDto> extractPracticoMomentos(XSSFSheet sh, ScuPlanClaseDto plan) {
        List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
        if (plan.getFasesMetodologicas() != null && plan.getFasesMetodologicas().size() >= 4) {
            ScuPlanClaseDto.FaseMetodologicaDto f0 = plan.getFasesMetodologicas().get(0);
            ScuPlanClaseDto.FaseMetodologicaDto f1 = plan.getFasesMetodologicas().get(1);
            ScuPlanClaseDto.FaseMetodologicaDto f2 = plan.getFasesMetodologicas().get(2);
            ScuPlanClaseDto.FaseMetodologicaDto f3 = plan.getFasesMetodologicas().get(3);

            momentos.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(TipoMomentoPedagogico.INICIO)
                    .nombreMomento("1. PREPARACIÓN")
                    .duracionMin(f0.getDuracionMin() != null ? f0.getDuracionMin() : 20)
                    .actividadesDocente(f0.getActividadDocente() != null && !f0.getActividadDocente().isBlank() ? f0.getActividadDocente() : (f0.getFinalidad() != null && !f0.getFinalidad().isBlank() ? f0.getFinalidad() : "Verificación de condiciones de ingreso y activación"))
                    .actividadesEstudiante(f0.getActividadEstudiante() != null && !f0.getActividadEstudiante().isBlank() ? f0.getActividadEstudiante() : "Estudio previo y preparación del material")
                    .indicadorEvaluacion("Condición de ingreso verificada")
                    .build());

            momentos.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                    .nombreMomento("2. EJECUCIÓN GUIADA")
                    .duracionMin(f1.getDuracionMin() != null ? f1.getDuracionMin() : 70)
                    .actividadesDocente(f1.getActividadDocente() != null && !f1.getActividadDocente().isBlank() ? f1.getActividadDocente() : (f1.getFinalidad() != null && !f1.getFinalidad().isBlank() ? f1.getFinalidad() : "Modelado y práctica con acompañamiento docente"))
                    .actividadesEstudiante(f1.getActividadEstudiante() != null && !f1.getActividadEstudiante().isBlank() ? f1.getActividadEstudiante() : "Imitación, ensayo y registro procedimental")
                    .indicadorEvaluacion("Desempeño procedimental guiado")
                    .build());

            momentos.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                    .nombreMomento("3. EJECUCIÓN AUTÓNOMA")
                    .duracionMin(f2.getDuracionMin() != null ? f2.getDuracionMin() : 70)
                    .actividadesDocente(f2.getActividadDocente() != null && !f2.getActividadDocente().isBlank() ? f2.getActividadDocente() : (f2.getFinalidad() != null && !f2.getFinalidad().isBlank() ? f2.getFinalidad() : "Supervisión y evaluación del desempeño autónomo"))
                    .actividadesEstudiante(f2.getActividadEstudiante() != null && !f2.getActividadEstudiante().isBlank() ? f2.getActividadEstudiante() : "Ejecución autónoma y justificación técnica")
                    .indicadorEvaluacion("Resolución técnica autónoma")
                    .build());

            momentos.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(TipoMomentoPedagogico.CIERRE)
                    .nombreMomento("4. CIERRE")
                    .duracionMin(f3.getDuracionMin() != null ? f3.getDuracionMin() : 20)
                    .actividadesDocente(f3.getActividadDocente() != null && !f3.getActividadDocente().isBlank() ? f3.getActividadDocente() : (f3.getFinalidad() != null && !f3.getFinalidad().isBlank() ? f3.getFinalidad() : "Devolución, retroalimentación y consolidación"))
                    .actividadesEstudiante(f3.getActividadEstudiante() != null && !f3.getActividadEstudiante().isBlank() ? f3.getActividadEstudiante() : "Autoevaluación y entrega de producto/evidencia")
                    .indicadorEvaluacion("Evidencia de aprendizaje y guía de práctica evaluada")
                    .build());
            return momentos;
        }

        int maxRow = sh.getLastRowNum();
        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String colB = cellStr(row, 1).toLowerCase().trim();
            String colC = cellStr(row, 2);
            String colF = cellStr(row, 5);
            String colH = cellStr(row, 7);

            if (colB.equals("preparación:") || colB.equals("preparación")
                    || colB.equals("preparacion:") || colB.equals("preparacion")
                    || (r >= 33 && r <= 38 && (colB.startsWith("preparación") || colB.startsWith("preparacion")))) {
                momentos.add(ScuMomentoPedagogicoDto.builder()
                        .tipoMomento(TipoMomentoPedagogico.INICIO)
                        .nombreMomento("1. PREPARACIÓN")
                        .duracionMin(20)
                        .actividadesDocente(!colF.isBlank() ? colF : (!colC.isBlank() ? colC : "Verificación de condiciones de ingreso y activación"))
                        .actividadesEstudiante(!colH.isBlank() ? colH : "Estudio previo y preparación del material")
                        .indicadorEvaluacion("Condición de ingreso verificada")
                        .build());
            } else if (colB.startsWith("ejecución guiada") || colB.startsWith("ejecucion guiada")) {
                momentos.add(ScuMomentoPedagogicoDto.builder()
                        .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                        .nombreMomento("2. EJECUCIÓN GUIADA")
                        .duracionMin(70)
                        .actividadesDocente(!colF.isBlank() ? colF : (!colC.isBlank() ? colC : "Modelado y práctica con acompañamiento docente"))
                        .actividadesEstudiante(!colH.isBlank() ? colH : "Imitación, ensayo y registro procedimental")
                        .indicadorEvaluacion("Desempeño procedimental guiado")
                        .build());
            } else if (colB.startsWith("ejecución autónoma") || colB.startsWith("ejecucion autonoma")) {
                momentos.add(ScuMomentoPedagogicoDto.builder()
                        .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                        .nombreMomento("3. EJECUCIÓN AUTÓNOMA")
                        .duracionMin(70)
                        .actividadesDocente(!colF.isBlank() ? colF : (!colC.isBlank() ? colC : "Supervisión y evaluación del desempeño autónomo"))
                        .actividadesEstudiante(!colH.isBlank() ? colH : "Ejecución autónoma y justificación técnica")
                        .indicadorEvaluacion("Resolución técnica autónoma")
                        .build());
            } else if (colB.startsWith("cierre:") || colB.equals("cierre")
                    || (r >= 33 && r <= 38 && colB.startsWith("cierre"))) {
                momentos.add(ScuMomentoPedagogicoDto.builder()
                        .tipoMomento(TipoMomentoPedagogico.CIERRE)
                        .nombreMomento("4. CIERRE")
                        .duracionMin(20)
                        .actividadesDocente(!colF.isBlank() ? colF : (!colC.isBlank() ? colC : "Devolución, retroalimentación y consolidación"))
                        .actividadesEstudiante(!colH.isBlank() ? colH : "Autoevaluación y entrega de producto/evidencia")
                        .indicadorEvaluacion("Evidencia de aprendizaje y guía de práctica evaluada")
                        .build());
            }
        }

        return momentos;
    }

    public void populatePracticoSheet(XSSFSheet sheet, ScuPlanClaseDto dto) {
        if (dto == null) return;

        // 1. Datos Generales (C12, G12, C13, G13, C15, C16)
        setCell(sheet, 11, 2, dto.getNombreDocente());
        setCell(sheet, 11, 6, dto.getNombreAsignatura());
        setCell(sheet, 12, 2, dto.getFecha());
        setCell(sheet, 12, 6, dto.getCarrera());
        setCell(sheet, 14, 2, dto.getUnidadTitulo());
        setCell(sheet, 15, 2, dto.getElementoCompetencia());

        // 2. Datos de la Práctica (C20, E20, G20, I20, C21, E21, G21)
        setCell(sheet, 19, 2, dto.getTituloPractica() != null ? dto.getTituloPractica() : dto.getContenidoTema());
        setCell(sheet, 19, 4, dto.getFecha());
        setCell(sheet, 19, 6, dto.getDuracionPractica() != null ? dto.getDuracionPractica() : ((dto.getDuracionTotalMin() != null ? dto.getDuracionTotalMin() : 180) + " min"));
        setCell(sheet, 19, 8, dto.getSemestre());
        setCell(sheet, 20, 2, dto.getAmbiente());
        setCell(sheet, 20, 4, dto.getNroEstudiantes());
        setCell(sheet, 20, 6, dto.getNombreDocente());

        // 3. Alineación y Recursos (D25, D26, D27, D28, D29)
        setCell(sheet, 24, 3, dto.getObjetivoAprendizaje() != null ? dto.getObjetivoAprendizaje() : dto.getObjetivoSesion());
        setCell(sheet, 25, 3, dto.getResultadosBloom() != null ? dto.getResultadosBloom() : dto.getLogrosEsperados());
        setCell(sheet, 26, 3, dto.getPreparacionMateriales());
        setCell(sheet, 27, 3, dto.getEquipamiento());
        setCell(sheet, 28, 3, dto.getEquipo() != null ? dto.getEquipo() : dto.getRecursosEnsenanza());

        // 4. Modelo Metodológico (Rows 34-37 -> 0-indexed 33-36 across cols C, F, H)
        if (dto.getFasesMetodologicas() != null && !dto.getFasesMetodologicas().isEmpty()) {
            for (int i = 0; i < Math.min(dto.getFasesMetodologicas().size(), 4); i++) {
                ScuPlanClaseDto.FaseMetodologicaDto f = dto.getFasesMetodologicas().get(i);
                setCell(sheet, 33 + i, 2, f.getFinalidad());
                setCell(sheet, 33 + i, 5, f.getActividadDocente());
                setCell(sheet, 33 + i, 7, f.getActividadEstudiante());
            }
        } else {
            setCell(sheet, 33, 2, dto.getModeloPrepFin() != null ? dto.getModeloPrepFin() : "Activar conocimientos y verificar condiciones de ingreso, bioseguridad y materiales");
            setCell(sheet, 33, 5, dto.getModeloPrepDoc() != null ? dto.getModeloPrepDoc() : "Verificación de condiciones de ingreso y activación");
            setCell(sheet, 33, 7, dto.getModeloPrepEst() != null ? dto.getModeloPrepEst() : "Estudio previo, prueba de ingreso y alistamiento de materiales");

            setCell(sheet, 34, 2, dto.getModeloGuiFin() != null ? dto.getModeloGuiFin() : "Modelar y practicar con acompañamiento, demostración de técnica y corrección inmediata");
            setCell(sheet, 34, 5, dto.getModeloGuiDoc() != null ? dto.getModeloGuiDoc() : "Modelado y práctica con acompañamiento docente");
            setCell(sheet, 34, 7, dto.getModeloGuiEst() != null ? dto.getModeloGuiEst() : "Imita, ensaya, pregunta y registra datos del procedimiento");

            setCell(sheet, 35, 2, dto.getModeloAutFin() != null ? dto.getModeloAutFin() : "Supervisar y evaluar el desempeño procedimental con responsabilidad creciente");
            setCell(sheet, 35, 5, dto.getModeloAutDoc() != null ? dto.getModeloAutDoc() : "Supervisión y evaluación del desempeño autónomo");
            setCell(sheet, 35, 7, dto.getModeloAutEst() != null ? dto.getModeloAutEst() : "Ejecuta de manera autónoma, decide, justifica y controla variables del procedimiento");

            setCell(sheet, 36, 2, dto.getModeloCieFin() != null ? dto.getModeloCieFin() : "Consolidar, retroalimentar y proyectar mejora técnica");
            setCell(sheet, 36, 5, dto.getModeloCieDoc() != null ? dto.getModeloCieDoc() : "Devolución, retroalimentación y consolidación");
            setCell(sheet, 36, 7, dto.getModeloCieEst() != null ? dto.getModeloCieEst() : "Autoevalúa, entrega evidencia de práctica y propone ajustes de mejora");
        }

        // 5. Evaluación de los Aprendizajes (Rows 42, 43 -> 0-indexed 41, 42)
        setCell(sheet, 41, 2, dto.getEvaluacionFormativaActividad() != null ? dto.getEvaluacionFormativaActividad() : "Observación directa y retroalimentación continua");
        setCell(sheet, 41, 5, dto.getEvaluacionFormativaInstrumento() != null ? dto.getEvaluacionFormativaInstrumento() : "Lista de cotejo / Ficha de observación");
        setCell(sheet, 41, 7, dto.getEvaluacionFormativaEvidencia() != null ? dto.getEvaluacionFormativaEvidencia() : "Guía de práctica y bitácora de laboratorio");

        setCell(sheet, 42, 2, dto.getEvaluacionSumativaActividad() != null ? dto.getEvaluacionSumativaActividad() : "Evaluación de producto y reporte de resultados");
        setCell(sheet, 42, 5, dto.getEvaluacionSumativaInstrumento() != null ? dto.getEvaluacionSumativaInstrumento() : "Rúbrica analítica de laboratorio");
        setCell(sheet, 42, 7, dto.getEvaluacionSumativaEvidencia() != null ? dto.getEvaluacionSumativaEvidencia() : "Informe final de práctica con análisis técnico");

        // 6. Desarrollo (Rows 48-54 -> 0-indexed 47-53 across cols B, C, D, F, H)
        if (dto.getPasosDesarrollo() != null && !dto.getPasosDesarrollo().isEmpty()) {
            for (int i = 0; i < Math.min(dto.getPasosDesarrollo().size(), 7); i++) {
                ScuPlanClaseDto.DesarrolloPasoDto p = dto.getPasosDesarrollo().get(i);
                int r = 47 + i;
                setCell(sheet, r, 1, p.getFaseComun());
                setCell(sheet, r, 2, p.getTiempoMin() != null ? (p.getTiempoMin() + " min") : "");
                setCell(sheet, r, 3, p.getActividad());
                setCell(sheet, r, 5, p.getRecursos());
                setCell(sheet, r, 7, p.getOtraInformacion());
            }
        } else {
            setCell(sheet, 47, 1, "Preparación");
            setCell(sheet, 47, 2, dto.getDesarrolloTiempo1() != null ? dto.getDesarrolloTiempo1() : "15 min");
            setCell(sheet, 47, 3, dto.getDesarrolloAct1() != null ? dto.getDesarrolloAct1() : "Revisión de bioseguridad, EPP e inducción a la guía");
            setCell(sheet, 47, 5, dto.getDesarrolloRec1() != null ? dto.getDesarrolloRec1() : "Guía de laboratorio, EPP");
            setCell(sheet, 47, 7, dto.getDesarrolloInfo1() != null ? dto.getDesarrolloInfo1() : "Control de asistencia y verificación de insumos");

            setCell(sheet, 48, 1, "Ejecución guiada");
            setCell(sheet, 48, 2, dto.getDesarrolloTiempo2() != null ? dto.getDesarrolloTiempo2() : "25 min");
            setCell(sheet, 48, 3, dto.getDesarrolloAct2() != null ? dto.getDesarrolloAct2() : "Demostración procedimental por el docente");
            setCell(sheet, 48, 5, dto.getDesarrolloRec2() != null ? dto.getDesarrolloRec2() : "Equipos e instrumental de laboratorio");
            setCell(sheet, 48, 7, dto.getDesarrolloInfo2() != null ? dto.getDesarrolloInfo2() : "Resolución de dudas y modelado de técnica");

            setCell(sheet, 49, 1, "Ejecución autónoma");
            setCell(sheet, 49, 2, dto.getDesarrolloTiempo3() != null ? dto.getDesarrolloTiempo3() : "40 min");
            setCell(sheet, 49, 3, dto.getDesarrolloAct3() != null ? dto.getDesarrolloAct3() : "Desarrollo experimental por equipos de trabajo");
            setCell(sheet, 49, 5, dto.getDesarrolloRec3() != null ? dto.getDesarrolloRec3() : "Materiales, software e instrumental de prueba");
            setCell(sheet, 49, 7, dto.getDesarrolloInfo3() != null ? dto.getDesarrolloInfo3() : "Acompañamiento y retroalimentación activa");

            setCell(sheet, 50, 1, "Cierre");
            setCell(sheet, 50, 2, dto.getDesarrolloTiempo4() != null ? dto.getDesarrolloTiempo4() : "10 min");
            setCell(sheet, 50, 3, dto.getDesarrolloAct4() != null ? dto.getDesarrolloAct4() : "Conclusiones técnicas, entrega de bitácora y orden");
            setCell(sheet, 50, 5, dto.getDesarrolloRec4() != null ? dto.getDesarrolloRec4() : "Ficha de evaluación y protocolo de limpieza");
            setCell(sheet, 50, 7, dto.getDesarrolloInfo4() != null ? dto.getDesarrolloInfo4() : "Calificación formativa de la sesión");
        }

        // 7. NOTAS DEL DOCENTE (Rows 59-77 -> 0-indexed 58-76 across col B and col C)
        if (dto.getNotasDocente() != null && !dto.getNotasDocente().isEmpty()) {
            for (ScuPlanClaseDto.NotaDocenteSesionDto nota : dto.getNotasDocente()) {
                if (nota != null && nota.getSesionNro() != null && nota.getNota() != null && !nota.getNota().isBlank()) {
                    int s = (int) Math.round(nota.getSesionNro());
                    if (s >= 1 && s <= 19) {
                        int r = 58 + (s - 1);
                        setCell(sheet, r, 1, s + ".0");
                        setCell(sheet, r, 2, nota.getNota());
                    }
                }
            }
        }
    }

    private byte[] buildProgrammaticWorkbook(List<ScuPlanClaseDto> planes) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            for (int i = 0; i < planes.size(); i++) {
                ScuPlanClaseDto p = planes.get(i);
                Sheet sheet = wb.createSheet("UA-" + (i + 1));
                Row r0 = sheet.createRow(2);
                r0.createCell(1).setCellValue("UNIVERSIDAD TÉCNICA PRIVADA COSMOS");
                Row r1 = sheet.createRow(6);
                r1.createCell(1).setCellValue("PLAN DE CLASE PRÁCTICO");

                Row r2 = sheet.createRow(9);
                r2.createCell(1).setCellValue("1. DATOS GENERALES");
                Row r3 = sheet.createRow(11);
                r3.createCell(1).setCellValue("Nombre del docente:");
                r3.createCell(2).setCellValue(p.getNombreDocente() != null ? p.getNombreDocente() : "");
                r3.createCell(5).setCellValue("Asignatura:");
                r3.createCell(6).setCellValue(p.getNombreAsignatura() != null ? p.getNombreAsignatura() : "");

                Row r4 = sheet.createRow(17);
                r4.createCell(1).setCellValue("2. DATOS DE LA PRÁCTICA");
                Row r5 = sheet.createRow(19);
                r5.createCell(1).setCellValue("Título:");
                r5.createCell(2).setCellValue(p.getTituloPractica() != null ? p.getTituloPractica() : "");
                r5.createCell(5).setCellValue("Duración:");
                r5.createCell(6).setCellValue(p.getDuracionPractica() != null ? p.getDuracionPractica() : "180 min");

                Row r6 = sheet.createRow(20);
                r6.createCell(1).setCellValue("Ambiente:");
                r6.createCell(2).setCellValue(p.getAmbiente() != null ? p.getAmbiente() : "Laboratorio");
                r6.createCell(3).setCellValue("N° de estudiantes");
                r6.createCell(4).setCellValue(p.getNroEstudiantes() != null ? p.getNroEstudiantes() : "25");

                Row r7 = sheet.createRow(22);
                r7.createCell(1).setCellValue("3. ALINEACIÓN Y RECURSOS");
                Row r8 = sheet.createRow(24);
                r8.createCell(1).setCellValue("Objetivo de aprendizaje:");
                r8.createCell(2).setCellValue(p.getObjetivoAprendizaje() != null ? p.getObjetivoAprendizaje() : p.getObjetivoSesion());

                Row r9 = sheet.createRow(30);
                r9.createCell(1).setCellValue("4. MODELO METODOLÓGICO");
            }
            wb.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error building Plan Práctico workbook: " + e.getMessage(), e);
        }
    }

    private InputStream openTemplateStream() {
        try {
            Resource res = resourceLoader.getResource("classpath:templates/template_plan_practico.xlsx");
            if (res.exists()) return res.getInputStream();
        } catch (Exception ignored) {}

        String[] paths = {
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/PLAN DE CLASES PRÁCTICO.xlsx",
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/PLAN DE CLASES PRÁCTICO.xlsx",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/PLAN DE CLASES PRÁCTICO.xlsx",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx",
                "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/PLAN DE CLASES PRÁCTICO.xlsx",
                "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx"
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

    private List<ScuMomentoPedagogicoDto> defaultPracticoMomentos(int totalDuration) {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        int p1 = 20;
        int p4 = 20;
        int rem = Math.max(totalDuration - p1 - p4, 40);
        int p2 = rem / 2;
        int p3 = rem - p2;

        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.INICIO)
                .nombreMomento("1. PREPARACIÓN")
                .duracionMin(p1)
                .actividadesDocente("Activar conocimientos y verificar condiciones de ingreso, bioseguridad y materiales")
                .actividadesEstudiante("Estudio previo, prueba de ingreso y alistamiento de materiales")
                .indicadorEvaluacion("Verificación de condiciones de ingreso").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                .nombreMomento("2. EJECUCIÓN GUIADA")
                .duracionMin(p2)
                .actividadesDocente("Modelar y practicar con acompañamiento, demostración de técnica y corrección inmediata")
                .actividadesEstudiante("Imita, ensaya, pregunta y registra datos del procedimiento")
                .indicadorEvaluacion("Ejecución procedimental con supervisión").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                .nombreMomento("3. EJECUCIÓN AUTÓNOMA")
                .duracionMin(p3)
                .actividadesDocente("Supervisar y evaluar el desempeño procedimental con responsabilidad creciente")
                .actividadesEstudiante("Ejecuta de manera autónoma, decide, justifica y controla variables del procedimiento")
                .indicadorEvaluacion("Resolución técnica autónoma del procedimiento").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.CIERRE)
                .nombreMomento("4. CIERRE")
                .duracionMin(p4)
                .actividadesDocente("Consolidar, retroalimentar y proyectar mejora técnica")
                .actividadesEstudiante("Autoevalúa, entrega evidencia de práctica y propone ajustes de mejora")
                .indicadorEvaluacion("Entrega de guía de práctica y reporte evaluado").build());
        return list;
    }

    private ScuPlanClaseDto createDefaultPracticoPlan(Long sesionId, String sheetName) {
        ScuPlanClaseDto p = new ScuPlanClaseDto();
        p.setSesionId(sesionId);
        p.setNombreHoja(sheetName);
        p.setTemplateType("PRACTICO");
        p.setComponentType("PA");
        p.setDuracionTotalMin(180);
        p.setTituloPractica("Práctica N° " + sesionId);
        p.setContenidoTema(p.getTituloPractica());
        p.setAmbiente("Laboratorio");
        p.setNroEstudiantes("25");
        p.setObjetivoAprendizaje("Ejecución de protocolos de práctica");
        p.setObjetivoSesion(p.getObjetivoAprendizaje());
        p.setMomentos(defaultPracticoMomentos(180));
        p.syncToNested();
        return p;
    }

    private void setCell(XSSFSheet sheet, int r, int c, String val) {
        if (val == null) return;
        Row row = sheet.getRow(r);
        if (row == null) row = sheet.createRow(r);
        Cell cell = row.getCell(c);
        if (cell == null) cell = row.createCell(c);
        cell.setCellValue(val);
    }

    private String extractAfterColon(String s) {
        if (s == null) return "";
        int idx = s.indexOf(":");
        return (idx >= 0 && idx < s.length() - 1) ? s.substring(idx + 1).trim() : s.trim();
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
