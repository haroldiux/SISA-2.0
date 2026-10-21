package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.enums.EstadoAsistencia;
import bo.edu.unitepc.sisa.domain.model.AsistenciaEstudiante;
import bo.edu.unitepc.sisa.domain.model.AsistenciaSesion;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaEstudianteRepository;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaSesionRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Command for exporting official UNITEPC Attendance Matrix to formatted XLSX workbook stream.
 * Includes institutional headers, career cohort partitioning, date matrix, totals, 80% compliance rule,
 * and academic endorsement signature lines.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuExportAsistenciaXlsxCmd {

    private static final Logger log = LoggerFactory.getLogger(ScuExportAsistenciaXlsxCmd.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter SHORT_DATE_FMT = DateTimeFormatter.ofPattern("dd/MM");

    private final AsistenciaSesionRepository sesionRepository;
    private final AsistenciaEstudianteRepository estudianteRepository;

    public ScuExportAsistenciaXlsxCmd(
            AsistenciaSesionRepository sesionRepository,
            AsistenciaEstudianteRepository estudianteRepository) {
        this.sesionRepository = sesionRepository;
        this.estudianteRepository = estudianteRepository;
    }

    @Transactional(readOnly = true)
    public byte[] execute(String materiaCodigo, String gestionCodigo) {
        return execute(materiaCodigo, gestionCodigo, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(String materiaCodigo, String gestionCodigo, String docenteNombre) {
        String cleanMateria = materiaCodigo != null ? materiaCodigo.trim() : "SIS-213";
        String cleanGestion = (gestionCodigo != null && !gestionCodigo.isBlank()) ? gestionCodigo.trim() : "2-2026";

        List<AsistenciaSesion> sesiones = this.sesionRepository
                .findByMateriaCodigoAndGestionCodigoOrderByFechaDesc(cleanMateria, cleanGestion);

        // Sort chronologically ascending for the matrix columns
        sesiones.sort(Comparator.comparing(AsistenciaSesion::getFecha).thenComparing(AsistenciaSesion::getId));

        String materiaNombre = cleanMateria;
        String resolvedDocente = (docenteNombre != null && !docenteNombre.isBlank()) ? docenteNombre.trim() : "Ing. Carlos Alberto Morales Siles";

        if (!sesiones.isEmpty()) {
            if (sesiones.get(0).getMateriaNombre() != null && !sesiones.get(0).getMateriaNombre().isBlank()) {
                materiaNombre = sesiones.get(0).getMateriaNombre();
            }
            if (sesiones.get(0).getRegistradoPor() != null && !sesiones.get(0).getRegistradoPor().isBlank()) {
                resolvedDocente = sesiones.get(0).getRegistradoPor();
            }
        }

        List<AsistenciaEstudiante> todasMarcas = this.estudianteRepository
                .findByMateriaAndGestion(cleanMateria, cleanGestion);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Asistencia Oficial");
            sheet.setDisplayGridlines(true);
            sheet.setPrintGridlines(true);

            // Palette definitions
            byte[] unitepcNavy = new byte[]{(byte) 30, (byte) 58, (byte) 138};       // #1E3A8A
            byte[] unitepcTeal = new byte[]{(byte) 15, (byte) 118, (byte) 110};      // #0F766E
            byte[] indigoHeader = new byte[]{(byte) 67, (byte) 56, (byte) 202};     // #4338CA
            byte[] violetHeader = new byte[]{(byte) 126, (byte) 34, (byte) 206};    // #7E22CE
            byte[] grayBg = new byte[]{(byte) 241, (byte) 245, (byte) 249};          // #F1F5F9
            byte[] lightGreen = new byte[]{(byte) 209, (byte) 250, (byte) 229};      // #D1FAE5
            byte[] lightRed = new byte[]{(byte) 254, (byte) 226, (byte) 226};        // #FEE2E2
            byte[] lightAmber = new byte[]{(byte) 254, (byte) 243, (byte) 199};      // #FEF3C7
            byte[] lightBlue = new byte[]{(byte) 224, (byte) 242, (byte) 254};       // #E0F2FE

            // Fonts
            XSSFFont titleFont = workbook.createFont();
            titleFont.setFontName("Calibri");
            titleFont.setFontHeightInPoints((short) 13);
            titleFont.setBold(true);
            titleFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFFont subTitleFont = workbook.createFont();
            subTitleFont.setFontName("Calibri");
            subTitleFont.setFontHeightInPoints((short) 10);
            subTitleFont.setBold(true);
            subTitleFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFFont boldFont = workbook.createFont();
            boldFont.setFontName("Calibri");
            boldFont.setFontHeightInPoints((short) 9);
            boldFont.setBold(true);

            XSSFFont boldWhiteFont = workbook.createFont();
            boldWhiteFont.setFontName("Calibri");
            boldWhiteFont.setFontHeightInPoints((short) 9);
            boldWhiteFont.setBold(true);
            boldWhiteFont.setColor(IndexedColors.WHITE.getIndex());

            XSSFFont regularFont = workbook.createFont();
            regularFont.setFontName("Calibri");
            regularFont.setFontHeightInPoints((short) 9);

            XSSFFont greenBoldFont = workbook.createFont();
            greenBoldFont.setFontName("Calibri");
            greenBoldFont.setFontHeightInPoints((short) 9);
            greenBoldFont.setBold(true);
            greenBoldFont.setColor(IndexedColors.DARK_GREEN.getIndex());

            XSSFFont redBoldFont = workbook.createFont();
            redBoldFont.setFontName("Calibri");
            redBoldFont.setFontHeightInPoints((short) 9);
            redBoldFont.setBold(true);
            redBoldFont.setColor(IndexedColors.RED.getIndex());

            // Styles
            XSSFCellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            titleStyle.setFillForegroundColor(new XSSFColor(unitepcNavy, null));
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            XSSFCellStyle subtitleStyle = workbook.createCellStyle();
            subtitleStyle.setFont(subTitleFont);
            subtitleStyle.setAlignment(HorizontalAlignment.CENTER);
            subtitleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            subtitleStyle.setFillForegroundColor(new XSSFColor(unitepcNavy, null));
            subtitleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            XSSFCellStyle metaLabelStyle = workbook.createCellStyle();
            metaLabelStyle.setFont(boldFont);
            metaLabelStyle.setFillForegroundColor(new XSSFColor(grayBg, null));
            metaLabelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(metaLabelStyle);

            XSSFCellStyle metaValStyle = workbook.createCellStyle();
            metaValStyle.setFont(regularFont);
            setThinBorders(metaValStyle);

            XSSFCellStyle tableHeaderStyle = workbook.createCellStyle();
            tableHeaderStyle.setFont(boldWhiteFont);
            tableHeaderStyle.setAlignment(HorizontalAlignment.CENTER);
            tableHeaderStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            tableHeaderStyle.setWrapText(true);
            tableHeaderStyle.setFillForegroundColor(new XSSFColor(unitepcTeal, null));
            tableHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(tableHeaderStyle);

            XSSFCellStyle dataLeftStyle = workbook.createCellStyle();
            dataLeftStyle.setFont(regularFont);
            dataLeftStyle.setAlignment(HorizontalAlignment.LEFT);
            dataLeftStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(dataLeftStyle);

            XSSFCellStyle dataCenterStyle = workbook.createCellStyle();
            dataCenterStyle.setFont(regularFont);
            dataCenterStyle.setAlignment(HorizontalAlignment.CENTER);
            dataCenterStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(dataCenterStyle);

            XSSFCellStyle markPStyle = workbook.createCellStyle();
            markPStyle.setFont(greenBoldFont);
            markPStyle.setAlignment(HorizontalAlignment.CENTER);
            markPStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            markPStyle.setFillForegroundColor(new XSSFColor(lightGreen, null));
            markPStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(markPStyle);

            XSSFCellStyle markFStyle = workbook.createCellStyle();
            markFStyle.setFont(redBoldFont);
            markFStyle.setAlignment(HorizontalAlignment.CENTER);
            markFStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            markFStyle.setFillForegroundColor(new XSSFColor(lightRed, null));
            markFStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(markFStyle);

            XSSFCellStyle markAStyle = workbook.createCellStyle();
            markAStyle.setFont(boldFont);
            markAStyle.setAlignment(HorizontalAlignment.CENTER);
            markAStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            markAStyle.setFillForegroundColor(new XSSFColor(lightAmber, null));
            markAStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(markAStyle);

            XSSFCellStyle markLStyle = workbook.createCellStyle();
            markLStyle.setFont(boldFont);
            markLStyle.setAlignment(HorizontalAlignment.CENTER);
            markLStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            markLStyle.setFillForegroundColor(new XSSFColor(lightBlue, null));
            markLStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(markLStyle);

            XSSFCellStyle habilitadoStyle = workbook.createCellStyle();
            habilitadoStyle.setFont(greenBoldFont);
            habilitadoStyle.setAlignment(HorizontalAlignment.CENTER);
            habilitadoStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            habilitadoStyle.setFillForegroundColor(new XSSFColor(lightGreen, null));
            habilitadoStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(habilitadoStyle);

            XSSFCellStyle inhabilitadoStyle = workbook.createCellStyle();
            inhabilitadoStyle.setFont(redBoldFont);
            inhabilitadoStyle.setAlignment(HorizontalAlignment.CENTER);
            inhabilitadoStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            inhabilitadoStyle.setFillForegroundColor(new XSSFColor(lightRed, null));
            inhabilitadoStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(inhabilitadoStyle);

            XSSFCellStyle summaryStyle = workbook.createCellStyle();
            summaryStyle.setFont(boldFont);
            summaryStyle.setAlignment(HorizontalAlignment.CENTER);
            summaryStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            summaryStyle.setFillForegroundColor(new XSSFColor(grayBg, null));
            summaryStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setThinBorders(summaryStyle);

            int totalCols = Math.max(10, 4 + sesiones.size() + 6); // Col 0..3 (fixed) + N dates + 6 totals (P, F, A, L, %, Estado)

            // Row 0: UNITEPC Main Header
            Row row0 = sheet.createRow(0);
            row0.setHeightInPoints(24);
            for (int c = 0; c < totalCols; c++) {
                Cell cell = row0.createCell(c);
                cell.setCellStyle(titleStyle);
            }
            row0.getCell(0).setCellValue("UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC");
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, totalCols - 1));

            // Row 1: Subtitle
            Row row1 = sheet.createRow(1);
            row1.setHeightInPoints(18);
            for (int c = 0; c < totalCols; c++) {
                Cell cell = row1.createCell(c);
                cell.setCellStyle(subtitleStyle);
            }
            row1.getCell(0).setCellValue("REGISTRO OFICIAL DE ASISTENCIA Y CONTROL DE CUMPLIMIENTO (REGLA 80%)");
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, totalCols - 1));

            // Rows 3-5: Metadata block
            Row row3 = sheet.createRow(3);
            Cell c3_0 = row3.createCell(0); c3_0.setCellValue("Asignatura / Cátedra:"); c3_0.setCellStyle(metaLabelStyle);
            Cell c3_1 = row3.createCell(1); c3_1.setCellValue(cleanMateria + " - " + materiaNombre); c3_1.setCellStyle(metaValStyle);
            Cell c3_3 = row3.createCell(3); c3_3.setCellValue("Gestión Académica:"); c3_3.setCellStyle(metaLabelStyle);
            Cell c3_4 = row3.createCell(4); c3_4.setCellValue(cleanGestion); c3_4.setCellStyle(metaValStyle);

            Row row4 = sheet.createRow(4);
            Cell c4_0 = row4.createCell(0); c4_0.setCellValue("Docente Titular:"); c4_0.setCellStyle(metaLabelStyle);
            Cell c4_1 = row4.createCell(1); c4_1.setCellValue(resolvedDocente); c4_1.setCellStyle(metaValStyle);
            Cell c4_3 = row4.createCell(3); c4_3.setCellValue("Fecha Emisión:"); c4_3.setCellStyle(metaLabelStyle);
            Cell c4_4 = row4.createCell(4); c4_4.setCellValue(LocalDate.now().format(DATE_FMT)); c4_4.setCellStyle(metaValStyle);

            Row row5 = sheet.createRow(5);
            Cell c5_0 = row5.createCell(0); c5_0.setCellValue("Total Sesiones:"); c5_0.setCellStyle(metaLabelStyle);
            Cell c5_1 = row5.createCell(1); c5_1.setCellValue(sesiones.size() + " clases registradas"); c5_1.setCellStyle(metaValStyle);
            Cell c5_3 = row5.createCell(3); c5_3.setCellValue("Normativa 80%:"); c5_3.setCellStyle(metaLabelStyle);
            Cell c5_4 = row5.createCell(4); c5_4.setCellValue(">= 80% Habilitado a Examen Final"); c5_4.setCellStyle(metaValStyle);

            // Table Headers at Row 7
            int tableHeaderRowIdx = 7;
            Row headerRow = sheet.createRow(tableHeaderRowIdx);
            headerRow.setHeightInPoints(28);

            String[] fixedHeaders = {"Nº", "Código Estudiantil", "Apellidos y Nombres", "Carrera"};
            for (int i = 0; i < fixedHeaders.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(fixedHeaders[i]);
                c.setCellStyle(tableHeaderStyle);
            }

            // Date Matrix Columns
            int colIdx = 4;
            for (AsistenciaSesion s : sesiones) {
                Cell c = headerRow.createCell(colIdx++);
                String dateLabel = s.getFecha().format(SHORT_DATE_FMT) + "\n" +
                        ("PRACTICA".equalsIgnoreCase(s.getTipoClase()) ? "(P)" : "(T)");
                c.setCellValue(dateLabel);
                c.setCellStyle(tableHeaderStyle);
            }

            // Trailing Metric Columns
            String[] metricHeaders = {"Total P", "Total F", "Total A", "Total L", "% Asist.", "Dictamen 80%"};
            for (String mh : metricHeaders) {
                Cell c = headerRow.createCell(colIdx++);
                c.setCellValue(mh);
                c.setCellStyle(tableHeaderStyle);
            }

            // Organize marks into lookup: sesionId -> (estudianteCodigo -> AsistenciaEstudiante)
            Map<Long, Map<String, AsistenciaEstudiante>> marksBySessionAndStudent = new HashMap<>();
            for (AsistenciaEstudiante m : todasMarcas) {
                if (m.getSesion() != null && m.getSesion().getId() != null) {
                    marksBySessionAndStudent
                            .computeIfAbsent(m.getSesion().getId(), k -> new HashMap<>())
                            .put(m.getEstudianteCodigo(), m);
                }
            }

            // Group students by career
            Map<String, List<AsistenciaEstudiante>> marksByStudent = todasMarcas.stream()
                    .collect(Collectors.groupingBy(AsistenciaEstudiante::getEstudianteCodigo, LinkedHashMap::new, Collectors.toList()));

            // Extract unique students with their metadata
            class StudentRowData {
                final String code;
                final String name;
                final String careerCode;
                final String careerName;

                StudentRowData(String code, String name, String careerCode, String careerName) {
                    this.code = code;
                    this.name = name;
                    this.careerCode = careerCode != null ? careerCode : "CARSIS";
                    this.careerName = careerName != null ? careerName : "Ingeniería de Sistemas";
                }
            }

            List<StudentRowData> students = new ArrayList<>();
            for (Map.Entry<String, List<AsistenciaEstudiante>> entry : marksByStudent.entrySet()) {
                AsistenciaEstudiante first = entry.getValue().get(0);
                students.add(new StudentRowData(first.getEstudianteCodigo(), first.getEstudianteNombre(), first.getCarreraCodigo(), first.getCarreraNombre()));
            }

            // Group by career
            Map<String, List<StudentRowData>> byCareer = students.stream()
                    .collect(Collectors.groupingBy(s -> s.careerCode + " - " + s.careerName, LinkedHashMap::new, Collectors.toList()));

            int currentRowIdx = tableHeaderRowIdx + 1;
            int studentSeq = 1;

            int grandTotalP = 0;
            int grandTotalF = 0;
            int grandTotalA = 0;
            int grandTotalL = 0;
            double grandTotalPctSum = 0;

            for (Map.Entry<String, List<StudentRowData>> careerEntry : byCareer.entrySet()) {
                String careerTitle = careerEntry.getKey();
                List<StudentRowData> careerStudents = careerEntry.getValue();
                careerStudents.sort(Comparator.comparing(s -> s.name, String.CASE_INSENSITIVE_ORDER));

                // Career Divider Row
                Row careerDivider = sheet.createRow(currentRowIdx++);
                careerDivider.setHeightInPoints(20);
                byte[] cohortColor = careerTitle.toUpperCase().contains("TELECOM") ? violetHeader : indigoHeader;

                XSSFCellStyle careerStyle = workbook.createCellStyle();
                careerStyle.setFont(boldWhiteFont);
                careerStyle.setAlignment(HorizontalAlignment.LEFT);
                careerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
                careerStyle.setFillForegroundColor(new XSSFColor(cohortColor, null));
                careerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                setThinBorders(careerStyle);

                for (int c = 0; c < totalCols; c++) {
                    Cell cell = careerDivider.createCell(c);
                    cell.setCellStyle(careerStyle);
                }
                careerDivider.getCell(0).setCellValue("CARRERA: " + careerTitle.toUpperCase() + " (" + careerStudents.size() + " ESTUDIANTES)");
                sheet.addMergedRegion(new CellRangeAddress(currentRowIdx - 1, currentRowIdx - 1, 0, totalCols - 1));

                // Student Rows in this Career
                for (StudentRowData sData : careerStudents) {
                    Row sRow = sheet.createRow(currentRowIdx++);
                    sRow.setHeightInPoints(18);

                    Cell seqCell = sRow.createCell(0); seqCell.setCellValue(studentSeq++); seqCell.setCellStyle(dataCenterStyle);
                    Cell codeCell = sRow.createCell(1); codeCell.setCellValue(sData.code); codeCell.setCellStyle(dataCenterStyle);
                    Cell nameCell = sRow.createCell(2); nameCell.setCellValue(sData.name); nameCell.setCellStyle(dataLeftStyle);
                    Cell carCell = sRow.createCell(3); carCell.setCellValue(sData.careerCode); carCell.setCellStyle(dataCenterStyle);

                    int pCount = 0;
                    int fCount = 0;
                    int aCount = 0;
                    int lCount = 0;

                    int dateCol = 4;
                    for (AsistenciaSesion s : sesiones) {
                        Cell markCell = sRow.createCell(dateCol++);
                        Map<String, AsistenciaEstudiante> sessionMarks = marksBySessionAndStudent.get(s.getId());
                        AsistenciaEstudiante mark = sessionMarks != null ? sessionMarks.get(sData.code) : null;

                        if (mark != null && mark.getEstado() != null) {
                            String code = mark.getEstado().getCodigo();
                            markCell.setCellValue(code);
                            if (mark.getEstado() == EstadoAsistencia.PRESENTE) {
                                markCell.setCellStyle(markPStyle);
                                pCount++;
                            } else if (mark.getEstado() == EstadoAsistencia.FALTA) {
                                markCell.setCellStyle(markFStyle);
                                fCount++;
                            } else if (mark.getEstado() == EstadoAsistencia.ATRASO) {
                                markCell.setCellStyle(markAStyle);
                                aCount++;
                            } else if (mark.getEstado() == EstadoAsistencia.LICENCIA) {
                                markCell.setCellStyle(markLStyle);
                                lCount++;
                            } else {
                                markCell.setCellStyle(dataCenterStyle);
                            }
                        } else {
                            markCell.setCellValue("-");
                            markCell.setCellStyle(dataCenterStyle);
                        }
                    }

                    int totalSesiones = Math.max(1, sesiones.size());
                    double weightedPoints = pCount + (0.5 * aCount) + lCount;
                    double pct = sesiones.isEmpty() ? 100.0 :
                            BigDecimal.valueOf((weightedPoints / totalSesiones) * 100.0).setScale(1, RoundingMode.HALF_UP).doubleValue();
                    boolean cumple = pct >= 80.0;

                    grandTotalP += pCount;
                    grandTotalF += fCount;
                    grandTotalA += aCount;
                    grandTotalL += lCount;
                    grandTotalPctSum += pct;

                    Cell cp = sRow.createCell(dateCol++); cp.setCellValue(pCount); cp.setCellStyle(dataCenterStyle);
                    Cell cf = sRow.createCell(dateCol++); cf.setCellValue(fCount); cf.setCellStyle(dataCenterStyle);
                    Cell ca = sRow.createCell(dateCol++); ca.setCellValue(aCount); ca.setCellStyle(dataCenterStyle);
                    Cell cl = sRow.createCell(dateCol++); cl.setCellValue(lCount); cl.setCellStyle(dataCenterStyle);
                    Cell cpct = sRow.createCell(dateCol++); cpct.setCellValue(pct + "%"); cpct.setCellStyle(dataCenterStyle);
                    Cell cEstado = sRow.createCell(dateCol);
                    cEstado.setCellValue(cumple ? "HABILITADO" : "INHABILITADO");
                    cEstado.setCellStyle(cumple ? habilitadoStyle : inhabilitadoStyle);
                }
            }

            // Summary Totals Row
            Row summaryRow = sheet.createRow(currentRowIdx++);
            summaryRow.setHeightInPoints(20);
            for (int c = 0; c < totalCols; c++) {
                Cell sc = summaryRow.createCell(c);
                sc.setCellStyle(summaryStyle);
            }
            summaryRow.getCell(0).setCellValue("TOTALES Y PROMEDIO GENERAL DE ASISTENCIA");
            sheet.addMergedRegion(new CellRangeAddress(currentRowIdx - 1, currentRowIdx - 1, 0, 3 + sesiones.size()));

            int sumCol = 4 + sesiones.size();
            summaryRow.getCell(sumCol++).setCellValue(grandTotalP);
            summaryRow.getCell(sumCol++).setCellValue(grandTotalF);
            summaryRow.getCell(sumCol++).setCellValue(grandTotalA);
            summaryRow.getCell(sumCol++).setCellValue(grandTotalL);

            double avgPct = students.isEmpty() ? 100.0 :
                    BigDecimal.valueOf(grandTotalPctSum / students.size()).setScale(1, RoundingMode.HALF_UP).doubleValue();
            summaryRow.getCell(sumCol++).setCellValue(avgPct + "%");
            summaryRow.getCell(sumCol).setCellValue(avgPct >= 80.0 ? "REGULAR (>=80%)" : "ALERTA (<80%)");

            // Signature Block
            currentRowIdx += 4;
            Row sigLineRow = sheet.createRow(currentRowIdx++);
            sigLineRow.setHeightInPoints(18);

            XSSFCellStyle topBorderStyle = workbook.createCellStyle();
            topBorderStyle.setBorderTop(BorderStyle.MEDIUM);
            topBorderStyle.setFont(boldFont);
            topBorderStyle.setAlignment(HorizontalAlignment.CENTER);

            int docSigStart = 1;
            int docSigEnd = Math.min(3, totalCols - 1);
            int dirSigStart = Math.max(docSigEnd + 2, totalCols - 4);
            int dirSigEnd = totalCols - 1;

            for (int c = docSigStart; c <= docSigEnd; c++) {
                Cell sc = sigLineRow.createCell(c);
                sc.setCellStyle(topBorderStyle);
            }
            sigLineRow.getCell(docSigStart).setCellValue("Docente Titular de Asignatura");
            if (docSigEnd > docSigStart) {
                sheet.addMergedRegion(new CellRangeAddress(currentRowIdx - 1, currentRowIdx - 1, docSigStart, docSigEnd));
            }

            if (dirSigStart < totalCols) {
                for (int c = dirSigStart; c <= dirSigEnd; c++) {
                    Cell sc = sigLineRow.createCell(c);
                    sc.setCellStyle(topBorderStyle);
                }
                sigLineRow.getCell(dirSigStart).setCellValue("Director / Jefe de Carrera");
                if (dirSigEnd > dirSigStart) {
                    sheet.addMergedRegion(new CellRangeAddress(currentRowIdx - 1, currentRowIdx - 1, dirSigStart, dirSigEnd));
                }
            }

            Row sigNameRow = sheet.createRow(currentRowIdx);
            sigNameRow.setHeightInPoints(16);
            Cell docNameCell = sigNameRow.createCell(docSigStart);
            docNameCell.setCellValue(resolvedDocente);
            docNameCell.setCellStyle(dataCenterStyle);
            if (docSigEnd > docSigStart) {
                sheet.addMergedRegion(new CellRangeAddress(currentRowIdx, currentRowIdx, docSigStart, docSigEnd));
            }

            if (dirSigStart < totalCols) {
                Cell dirNameCell = sigNameRow.createCell(dirSigStart);
                dirNameCell.setCellValue("Lic. Mariana Rios Vargas");
                dirNameCell.setCellStyle(dataCenterStyle);
                if (dirSigEnd > dirSigStart) {
                    sheet.addMergedRegion(new CellRangeAddress(currentRowIdx, currentRowIdx, dirSigStart, dirSigEnd));
                }
            }

            // Adjust column widths
            sheet.setColumnWidth(0, 1500);  // Nº
            sheet.setColumnWidth(1, 3800);  // Code
            sheet.setColumnWidth(2, 8500);  // Name
            sheet.setColumnWidth(3, 3000);  // Career
            for (int i = 0; i < sesiones.size(); i++) {
                sheet.setColumnWidth(4 + i, 2200); // Date cols
            }
            int trailStart = 4 + sesiones.size();
            sheet.setColumnWidth(trailStart++, 2200); // P
            sheet.setColumnWidth(trailStart++, 2200); // F
            sheet.setColumnWidth(trailStart++, 2200); // A
            sheet.setColumnWidth(trailStart++, 2200); // L
            sheet.setColumnWidth(trailStart++, 2600); // %
            sheet.setColumnWidth(trailStart, 3800);   // Estado

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating UNITEPC Attendance Excel: {}", e.getMessage(), e);
            throw new ScuException(
                    "OFFICE_EXPORT_ERROR",
                    "Error al generar documento Excel de Asistencia: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    e
            );
        }
    }

    private void setThinBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
