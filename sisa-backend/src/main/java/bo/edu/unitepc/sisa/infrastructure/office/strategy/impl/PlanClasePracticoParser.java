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
        int maxRow = sh.getLastRowNum();
        StringBuilder modeloBuilder = new StringBuilder();
        StringBuilder desarrolloBuilder = new StringBuilder();

        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String colB = cellStr(row, 1);
            String colC = cellStr(row, 2);
            String colD = cellStr(row, 3);
            String colE = cellStr(row, 4);
            String colF = cellStr(row, 5);
            String colG = cellStr(row, 6);
            String colH = cellStr(row, 7);
            String colI = cellStr(row, 8);

            // 1. DATOS GENERALES
            if (colB.contains("Nombre del docente:") && !colC.isEmpty()) plan.setNombreDocente(colC);
            if (colF.contains("Asignatura:") && !colG.isEmpty()) plan.setNombreAsignatura(colG);
            if (colB.contains("Fecha:") && !colC.isEmpty()) plan.setFecha(colC);
            if (colF.contains("Carrera:") && !colG.isEmpty()) plan.setCarrera(colG);

            if (colB.toUpperCase().startsWith("UNIDAD") && (colB.contains(":") || colB.contains(" "))) {
                plan.setUnidadTitulo(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.toUpperCase().contains("ELEMENTO DE COMPETENCIA")) {
                plan.setElementoCompetencia(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }

            // 2. DATOS DE LA PRÁCTICA
            // R20: B: Título: | D: Fecha: | F: Duración: | H: Semestre:
            if (colB.contains("Título:") || colB.equals("Título") || colB.equals("Titulo:")) {
                String tit = !colC.isEmpty() ? colC : cellStr(row, 2);
                if (!tit.isEmpty()) {
                    plan.setTituloPractica(tit);
                    plan.setContenidoTema(tit);
                }
                if (!colE.isEmpty()) plan.setFecha(colE);
                if (!colG.isEmpty()) {
                    plan.setDuracionPractica(colG);
                    int dur = parseDuracion(colG);
                    if (dur > 0) plan.setDuracionTotalMin(dur);
                }
                if (!colI.isEmpty()) plan.setSemestre(colI);
            }

            // R21: B: Ambiente: | D: N° de estuduantes | F: Docente
            if (colB.contains("Ambiente:")) {
                if (!colC.isEmpty()) plan.setAmbiente(colC);
                if (!colE.isEmpty()) plan.setNroEstudiantes(colE);
                if (!colG.isEmpty() && plan.getNombreDocente() == null) plan.setNombreDocente(colG);
            }

            // 3. ALINEACIÓN Y RECURSOS
            if (colB.contains("Objetivo de aprendizaje:")) {
                String obj = !colC.isEmpty() ? colC : extractAfterColon(colB);
                plan.setObjetivoAprendizaje(obj);
                plan.setObjetivoSesion(obj);
            }
            if (colB.contains("Resultados de aprendizaje") || colB.contains("taxonomía de Bloom") || colB.contains("taxonomia de Bloom")) {
                String bloom = !colC.isEmpty() ? colC : extractAfterColon(colB);
                plan.setResultadosBloom(bloom);
                plan.setLogrosEsperados(bloom);
            }
            if (colB.contains("Preparación de materiales de aprendizaje")) {
                plan.setPreparacionMateriales(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.contains("Equipamiento (entorno):")) {
                plan.setEquipamiento(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.contains("Equipo (para la):")) {
                plan.setEquipo(!colC.isEmpty() ? colC : extractAfterColon(colB));
                plan.setRecursosEnsenanza(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }

            // 4. MODELO METODOLÓGICO
            String lowerB = colB.toLowerCase();
            if (lowerB.startsWith("preparación:") || lowerB.startsWith("preparacion:")
                    || lowerB.startsWith("ejecución guiada:") || lowerB.startsWith("ejecucion guiada:")
                    || lowerB.startsWith("ejecución autónoma:") || lowerB.startsWith("ejecucion autonoma:")
                    || lowerB.startsWith("cierre:")) {
                modeloBuilder.append(colB).append(" Finalidad: ").append(colC)
                        .append(" | Docente: ").append(colF).append(" | Estudiante: ").append(colH).append("\n");
            }

            // 5. EVALUACIÓN DE LOS APRENDIZAJES
            if (lowerB.startsWith("formativa")) {
                plan.setEvaluacionFormativaActividad(colC);
                plan.setEvaluacionFormativaInstrumento(colF);
                plan.setEvaluacionFormativaEvidencia(colH);
            } else if (lowerB.startsWith("sumativa")) {
                plan.setEvaluacionSumativaActividad(colC);
                plan.setEvaluacionSumativaInstrumento(colF);
                plan.setEvaluacionSumativaEvidencia(colH);
            }

            // 6. DESARROLLO (rows 47+)
            if (r >= 47 && r <= 55) {
                if (!colB.isEmpty() && !colB.toUpperCase().contains("DESARROLLO") && !colB.toUpperCase().contains("FASE COMÚN") && !colB.toUpperCase().contains("FASE COMUN")) {
                    desarrolloBuilder.append(colB).append(" (").append(colC).append("): ").append(colD).append("\n");
                }
            }
        }

        if (modeloBuilder.length() > 0) {
            plan.setModeloMetodologico(modeloBuilder.toString().trim());
        }
        if (desarrolloBuilder.length() > 0) {
            plan.setDesarrollo(desarrolloBuilder.toString().trim());
        }

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
        int maxRow = sh.getLastRowNum();

        // Check if rows under 4. MODELO METODOLÓGICO contain explicit phase activities
        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String colB = cellStr(row, 1).toLowerCase().trim();
            String colC = cellStr(row, 2); // Finalidad
            String colF = cellStr(row, 5); // Actividad Docente
            String colH = cellStr(row, 7); // Actividad Estudiante

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

    private void populatePracticoSheet(XSSFSheet sheet, ScuPlanClaseDto dto) {
        if (dto == null) return;

        // 1. Datos Generales
        setCell(sheet, 11, 2, dto.getNombreDocente());
        setCell(sheet, 11, 6, dto.getNombreAsignatura());
        setCell(sheet, 12, 2, dto.getFecha());
        setCell(sheet, 12, 6, dto.getCarrera());
        setCell(sheet, 14, 2, dto.getUnidadTitulo());
        setCell(sheet, 15, 2, dto.getElementoCompetencia());

        // 2. Datos de la Práctica
        setCell(sheet, 19, 2, dto.getTituloPractica() != null ? dto.getTituloPractica() : dto.getContenidoTema());
        setCell(sheet, 19, 4, dto.getFecha());
        setCell(sheet, 19, 6, dto.getDuracionPractica() != null ? dto.getDuracionPractica() : (dto.getDuracionTotalMin() + " min"));
        setCell(sheet, 19, 8, dto.getSemestre());
        setCell(sheet, 20, 2, dto.getAmbiente());
        setCell(sheet, 20, 4, dto.getNroEstudiantes());
        setCell(sheet, 20, 6, dto.getNombreDocente());

        // 3. Alineación y Recursos
        setCell(sheet, 24, 2, dto.getObjetivoAprendizaje() != null ? dto.getObjetivoAprendizaje() : dto.getObjetivoSesion());
        setCell(sheet, 25, 2, dto.getResultadosBloom() != null ? dto.getResultadosBloom() : dto.getLogrosEsperados());
        setCell(sheet, 26, 2, dto.getPreparacionMateriales());
        setCell(sheet, 27, 2, dto.getEquipamiento());
        setCell(sheet, 28, 2, dto.getEquipo());

        // 5. Evaluación
        if (dto.getEvaluacionFormativaActividad() != null) {
            setCell(sheet, 41, 2, dto.getEvaluacionFormativaActividad());
            setCell(sheet, 41, 5, dto.getEvaluacionFormativaInstrumento());
            setCell(sheet, 41, 7, dto.getEvaluacionFormativaEvidencia());
        }
        if (dto.getEvaluacionSumativaActividad() != null) {
            setCell(sheet, 42, 2, dto.getEvaluacionSumativaActividad());
            setCell(sheet, 42, 5, dto.getEvaluacionSumativaInstrumento());
            setCell(sheet, 42, 7, dto.getEvaluacionSumativaEvidencia());
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
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES PRÁCTICO.xlsx",
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
