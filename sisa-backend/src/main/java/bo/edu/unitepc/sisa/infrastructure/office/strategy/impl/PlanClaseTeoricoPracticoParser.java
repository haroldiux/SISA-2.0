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
 * Concrete strategy for parsing and generating UNITEPC Plan de Clases Teórico-Práctico Excel workbooks.
 * Extracts Saber Conceptual + Saber Procedimental + Saber Actitudinal.
 * Uses 3-moment didactic sequence (Introducción, Desarrollo/Cuerpo, Conclusión/Cierre).
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class PlanClaseTeoricoPracticoParser implements PlanClaseParserStrategy {

    private static final Logger log = LoggerFactory.getLogger(PlanClaseTeoricoPracticoParser.class);

    private final ResourceLoader resourceLoader;

    public PlanClaseTeoricoPracticoParser(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public boolean supports(String planType) {
        if (planType == null) return false;
        String t = planType.trim().toUpperCase();
        return t.equals("TEORICO_PRACTICO") || t.equals("TEÓRICO_PRÁCTICO")
                || t.equals("TEORICO-PRACTICO") || t.equals("TEÓRICO-PRÁCTICO") || t.equals("TA_PA")
                || (t.contains("PLAN DE CLASE") && (t.contains("TEÓRICO - PRÁCTICO") || t.contains("TEORICO - PRACTICO")
                || t.contains("TEÓRICO-PRÁCTICO") || t.contains("TEORICO-PRACTICO") || (t.contains("TEORIC") && t.contains("PRACTIC"))));
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
                    plan.setTemplateType("TEORICO_PRACTICO");
                    plan.setComponentType("TA_PA");

                    parseTeoricoPracticoSheet(sh, plan);

                    List<ScuMomentoPedagogicoDto> momentos = extract3MomentSequence(sh);
                    if (momentos.isEmpty()) {
                        momentos = defaultTeoricoPracticoMomentos();
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
            log.error("Error parsing Plan de Clases Teórico-Práctico: {}", e.getMessage(), e);
            throw new RuntimeException("Error al parsear Plan de Clases Teórico-Práctico: " + e.getMessage(), e);
        }

        if (planes.isEmpty()) {
            planes.add(createDefaultTeoricoPracticoPlan(1L, "UA-1"));
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
                        populateTeoricoPracticoSheet(sheet, dto);
                    }
                    return cloner.toByteArray();
                }
            }
        } catch (Exception e) {
            log.warn("Could not load Plan de Clases Teórico-Práctico template, building programmatically: {}", e.getMessage());
        }

        return buildProgrammaticWorkbook(planList);
    }

    private void parseTeoricoPracticoSheet(XSSFSheet sh, ScuPlanClaseDto plan) {
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

            // 1. Datos Generales
            if (colB.contains("Nombre del docente:") && !colC.isEmpty()) plan.setNombreDocente(colC);
            if (colF.contains("Asignatura:") && !colG.isEmpty()) plan.setNombreAsignatura(colG);
            if (colB.contains("Fecha:") && !colC.isEmpty()) plan.setFecha(colC);
            if (colF.contains("Carrera:") && !colG.isEmpty()) plan.setCarrera(colG);

            if (colB.toUpperCase().startsWith("UNIDAD") && (colB.contains(":") || colB.contains(" "))) {
                if (plan.getUnidadTitulo() == null) {
                    plan.setUnidadTitulo(!colC.isEmpty() ? colC : extractAfterColon(colB));
                }
            }
            if (colB.toUpperCase().contains("ELEMENTO DE COMPETENCIA")) {
                if (plan.getElementoCompetencia() == null) {
                    plan.setElementoCompetencia(!colC.isEmpty() ? colC : extractAfterColon(colB));
                }
            }
            if (colB.toUpperCase().startsWith("TEMA") && (colB.contains(":") || colB.contains(" "))) {
                if (plan.getContenidoTema() == null || plan.getContenidoTema().isBlank()) {
                    plan.setContenidoTema(!colC.isEmpty() ? colC : extractAfterColon(colB));
                }
            }

            // 2. Planificación del Aprendizaje
            if (colB.contains("Resultados de Aprendizaje:")) {
                if (plan.getObjetivoSesion() == null) plan.setObjetivoSesion(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.contains("Logros Esperados:")) {
                if (plan.getLogrosEsperados() == null) plan.setLogrosEsperados(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }
            if (colB.contains("Indicadores de Logro:")) {
                if (plan.getIndicadoresLogro() == null) plan.setIndicadoresLogro(!colC.isEmpty() ? colC : extractAfterColon(colB));
            }

            // Saberes: Conceptual, Procedimental y Actitudinal
            String labelSaberes = (colB + " " + colC).toLowerCase();
            String valSaberes = !colD.isEmpty() ? colD : (!colC.isEmpty() && !colC.toLowerCase().contains("saber") ? colC : colE);

            if (labelSaberes.contains("conceptual")) {
                if (!valSaberes.isEmpty() && plan.getSaberConceptual() == null) plan.setSaberConceptual(valSaberes);
            } else if (labelSaberes.contains("procedim")) {
                if (!valSaberes.isEmpty() && plan.getSaberProcedimental() == null) plan.setSaberProcedimental(valSaberes);
            } else if (labelSaberes.contains("actitudinal")) {
                if (!valSaberes.isEmpty() && plan.getSaberActitudinal() == null) plan.setSaberActitudinal(valSaberes);
            }

            // Estrategias Didácticas
            if (r >= 29 && r <= 33) {
                if (!colB.isEmpty() && !colB.toUpperCase().contains("ESTRATEGIAS") && !colB.toUpperCase().contains("DE ENSEÑANZA") && plan.getEstrategiaEnsenanza() == null) {
                    plan.setEstrategiaEnsenanza(colB);
                }
                if (!colD.isEmpty() && !colD.toUpperCase().contains("APRENDIZAJE") && plan.getEstrategiaAprendizaje() == null) {
                    plan.setEstrategiaAprendizaje(colD);
                }
                if (!colG.isEmpty() && !colG.toUpperCase().contains("RECURSOS") && plan.getRecursosEnsenanza() == null) {
                    plan.setRecursosEnsenanza(colG);
                }
            }

            // Evaluación Formativa & Sumativa
            if (colB.equalsIgnoreCase("FORMATIVA")) {
                plan.setEvaluacionFormativaActividad(colC);
                plan.setEvaluacionFormativaInstrumento(cellStr(row, 4));
                plan.setEvaluacionFormativaEvidencia(cellStr(row, 7));
            } else if (colB.equalsIgnoreCase("SUMATIVA")) {
                plan.setEvaluacionSumativaActividad(colC);
                plan.setEvaluacionSumativaInstrumento(cellStr(row, 4));
                plan.setEvaluacionSumativaEvidencia(cellStr(row, 7));
            }
        }

        if (plan.getObjetivoSesion() == null || plan.getObjetivoSesion().isBlank()) {
            plan.setObjetivoSesion("Desarrollo integral de competencias teóricas y procedimentales según planificación");
        }
    }

    private List<ScuMomentoPedagogicoDto> extract3MomentSequence(XSSFSheet sh) {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        int maxRow = sh.getLastRowNum();

        for (int r = 0; r <= maxRow; r++) {
            Row row = sh.getRow(r);
            if (row == null) continue;

            String label = cellStr(row, 1);
            if (label.isEmpty()) label = cellStr(row, 0);

            String upper = label.toUpperCase().trim();
            if (upper.equals("SECUENCIA DIDACTICA") || upper.equals("MOMENTOS") || upper.equals("ACTIVIDAD") || upper.equals("DURACIÓN")) {
                continue;
            }

            TipoMomentoPedagogico tipo = null;
            String nombre = null;

            if (upper.contains("RESULTADOS") || upper.contains("LOGROS")) {
                tipo = TipoMomentoPedagogico.RESULTADOS_LOGROS;
                nombre = "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS";
            } else if (upper.contains("CONTENIDOS DE LA CLASE") || (upper.contains("CONTENIDOS") && !upper.contains("CUERPO"))) {
                tipo = TipoMomentoPedagogico.CONTENIDOS;
                nombre = "3. CONTENIDOS DE LA CLASE";
            } else if (upper.contains("CUERPO") || upper.contains("DESARROLLO") || upper.contains("PROCESO")) {
                tipo = TipoMomentoPedagogico.CUERPO;
                nombre = "4. CUERPO DE CONTENIDOS";
            } else if (upper.contains("CONCLUSION") || upper.contains("CIERRE") || upper.contains("SINTESIS")) {
                tipo = TipoMomentoPedagogico.CONCLUSION;
                nombre = "5. CONCLUSIÓN O CIERRE";
            } else if (upper.contains("INTRODUCCION") || upper.contains("INICIO") || upper.contains("APERTURA")) {
                tipo = TipoMomentoPedagogico.INTRODUCCION;
                nombre = "1. INTRODUCCIÓN";
            }

            if (tipo == null) continue;

            TipoMomentoPedagogico fTipo = tipo;
            if (list.stream().anyMatch(m -> m.getTipoMomento() == fTipo)) {
                continue;
            }

            String actividad = cellStr(row, 2);
            String durStr = cellStr(row, 7);
            if (durStr.isEmpty()) durStr = cellStr(row, 6);
            if (durStr.isEmpty()) durStr = cellStr(row, 8);

            int duracion = parseDuracion(durStr);
            if (duracion == 0) {
                if (tipo == TipoMomentoPedagogico.INTRODUCCION || tipo == TipoMomentoPedagogico.INICIO) duracion = 15;
                else if (tipo == TipoMomentoPedagogico.RESULTADOS_LOGROS) duracion = 10;
                else if (tipo == TipoMomentoPedagogico.CONTENIDOS) duracion = 15;
                else if (tipo == TipoMomentoPedagogico.CUERPO || tipo == TipoMomentoPedagogico.DESARROLLO) duracion = 40;
                else if (tipo == TipoMomentoPedagogico.CONCLUSION || tipo == TipoMomentoPedagogico.CIERRE) duracion = 10;
                else duracion = 15;
            }

            list.add(ScuMomentoPedagogicoDto.builder()
                    .tipoMomento(tipo)
                    .nombreMomento(nombre)
                    .duracionMin(duracion)
                    .actividadesDocente(!actividad.isBlank() ? actividad : "Exposición conceptual y práctica guiada")
                    .actividadesEstudiante("Participación activa, ejecución procedimental y resolución colaborativa")
                    .indicadorEvaluacion("Evidencia integrada de aprendizaje")
                    .build());
        }

        return list;
    }

    private void populateTeoricoPracticoSheet(XSSFSheet sheet, ScuPlanClaseDto dto) {
        if (dto == null) return;

        setCell(sheet, 11, 2, dto.getNombreDocente());
        setCell(sheet, 11, 6, dto.getNombreAsignatura());
        setCell(sheet, 12, 2, dto.getFecha());
        setCell(sheet, 12, 6, dto.getCarrera());

        setCell(sheet, 14, 2, dto.getUnidadTitulo());
        setCell(sheet, 15, 2, dto.getElementoCompetencia());

        setCell(sheet, 19, 2, dto.getContenidoTema());
        setCell(sheet, 20, 2, dto.getObjetivoSesion());
        setCell(sheet, 21, 2, dto.getLogrosEsperados());
        setCell(sheet, 22, 2, dto.getIndicadoresLogro());
        setCell(sheet, 23, 2, dto.getSaberConceptual());
        setCell(sheet, 24, 2, dto.getSaberProcedimental());
        setCell(sheet, 25, 2, dto.getSaberActitudinal());

        setCell(sheet, 30, 1, dto.getEstrategiaEnsenanza());
        setCell(sheet, 30, 3, dto.getEstrategiaAprendizaje());
        setCell(sheet, 30, 6, dto.getRecursosEnsenanza());

        if (dto.getEvaluacionFormativaActividad() != null) {
            setCell(sheet, 34, 2, dto.getEvaluacionFormativaActividad());
            setCell(sheet, 34, 4, dto.getEvaluacionFormativaInstrumento());
            setCell(sheet, 34, 7, dto.getEvaluacionFormativaEvidencia());
        }
        if (dto.getEvaluacionSumativaActividad() != null) {
            setCell(sheet, 35, 2, dto.getEvaluacionSumativaActividad());
            setCell(sheet, 35, 4, dto.getEvaluacionSumativaInstrumento());
            setCell(sheet, 35, 7, dto.getEvaluacionSumativaEvidencia());
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
                r1.createCell(1).setCellValue("PLAN DE CLASE TEÓRICO - PRÁCTICO");

                Row r2 = sheet.createRow(9);
                r2.createCell(1).setCellValue("1. DATOS GENERALES");
                Row r3 = sheet.createRow(11);
                r3.createCell(1).setCellValue("Nombre del docente:");
                r3.createCell(2).setCellValue(p.getNombreDocente() != null ? p.getNombreDocente() : "");
                r3.createCell(5).setCellValue("Asignatura:");
                r3.createCell(6).setCellValue(p.getNombreAsignatura() != null ? p.getNombreAsignatura() : "");

                Row r4 = sheet.createRow(17);
                r4.createCell(1).setCellValue("2. PLANIFICIÓN DEL APRENDIZAJE");
                Row r5 = sheet.createRow(19);
                r5.createCell(1).setCellValue("TEMA 1:");
                r5.createCell(2).setCellValue(p.getContenidoTema() != null ? p.getContenidoTema() : "");
                Row r6 = sheet.createRow(23);
                r6.createCell(1).setCellValue("Saber Conceptual:");
                r6.createCell(2).setCellValue(p.getSaberConceptual() != null ? p.getSaberConceptual() : "");
                Row r7 = sheet.createRow(24);
                r7.createCell(1).setCellValue("Saber procedimental:");
                r7.createCell(2).setCellValue(p.getSaberProcedimental() != null ? p.getSaberProcedimental() : "");
                Row r8 = sheet.createRow(25);
                r8.createCell(1).setCellValue("Saber Actitudinal:");
                r8.createCell(2).setCellValue(p.getSaberActitudinal() != null ? p.getSaberActitudinal() : "");
            }
            wb.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error building Plan Teórico-Práctico workbook: " + e.getMessage(), e);
        }
    }

    private InputStream openTemplateStream() {
        try {
            Resource res = resourceLoader.getResource("classpath:templates/template_plan_teorico_practico.xlsx");
            if (res.exists()) return res.getInputStream();
        } catch (Exception ignored) {}

        String[] paths = {
                "DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx",
                "../DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx",
                "C:/PROYECTOS/SISA/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx",
                "/workspace/DOCUMENTOS BASE/DOCUMENTOS PARA CARPETA DOCENTE BASE/BLANCOS/Copia de PLAN DE CLASES TEÓRICO-PRÁCTICO.xlsx"
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

    private List<ScuMomentoPedagogicoDto> defaultTeoricoPracticoMomentos() {
        List<ScuMomentoPedagogicoDto> list = new ArrayList<>();
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.INICIO)
                .nombreMomento("1. INICIO")
                .duracionMin(25)
                .actividadesDocente("Activación cognitiva, motivación situacional y encuadre metodológico")
                .actividadesEstudiante("Participación activa en preguntas orientadoras y reflexión inicial")
                .indicadorEvaluacion("Identificación de saberes previos y disposición al aprendizaje").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.DESARROLLO)
                .nombreMomento("2. DESARROLLO")
                .duracionMin(100)
                .actividadesDocente("Exposición dialogada, modelado técnico y acompañamiento en taller")
                .actividadesEstudiante("Resolución de casos, práctica guiada y trabajo colaborativo")
                .indicadorEvaluacion("Aplicación correcta de conceptos y destreza procedimental").build());
        list.add(ScuMomentoPedagogicoDto.builder()
                .tipoMomento(TipoMomentoPedagogico.CIERRE)
                .nombreMomento("3. CIERRE")
                .duracionMin(55)
                .actividadesDocente("Retroalimentación formativa, síntesis y evaluación sumativa/formativa")
                .actividadesEstudiante("Conclusiones individuales, autoevaluación y entrega de producto")
                .indicadorEvaluacion("Síntesis del aprendizaje alcanzado y producto evaluado").build());
        return list;
    }

    private ScuPlanClaseDto createDefaultTeoricoPracticoPlan(Long sesionId, String sheetName) {
        ScuPlanClaseDto p = new ScuPlanClaseDto();
        p.setSesionId(sesionId);
        p.setNombreHoja(sheetName);
        p.setTemplateType("TEORICO_PRACTICO");
        p.setComponentType("TA_PA");
        p.setDuracionTotalMin(180);
        p.setObjetivoSesion("Desarrollo integrado de saberes conceptuales, procedimentales y actitudinales");
        p.setSaberConceptual("Conceptos y fundamentos técnicos");
        p.setSaberProcedimental("Aplicación práctica y procedimental de los contenidos");
        p.setSaberActitudinal("Rigor, ética y trabajo colaborativo");
        p.setMomentos(defaultTeoricoPracticoMomentos());
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
