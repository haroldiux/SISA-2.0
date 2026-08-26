package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.infrastructure.office.DynamicRowShifter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Stress test for DynamicRowShifter handling 60+ rows expansion, merged cells, and formula re-binding.
 *
 * @author GentleAI SISA Architecture Team
 */
public class DynamicRowShifterStressTest {

    @Test
    @DisplayName("Should expand 10-row template to 60+ rows preserving merged regions and shifting formulas")
    void shouldExpandTo60RowsWithoutFormulaCorruption() {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("PAC_Matriz7");

        // Header rows (0 to 13)
        for (int r = 0; r < 14; r++) {
            sheet.createRow(r).createCell(0).setCellValue("Header " + r);
        }

        // Prototype row at 14 (Row 15 in Excel 1-indexed)
        XSSFRow protoRow = sheet.createRow(14);
        protoRow.setHeightInPoints(24.0f);

        CellStyle protoStyle = workbook.createCellStyle();
        protoStyle.setBorderTop(BorderStyle.THIN);
        protoStyle.setBorderBottom(BorderStyle.THIN);
        protoStyle.setBorderLeft(BorderStyle.THIN);
        protoStyle.setBorderRight(BorderStyle.THIN);

        for (int c = 0; c < 14; c++) {
            XSSFCell cell = protoRow.createCell(c);
            cell.setCellValue("Cell " + c);
            cell.setCellStyle(protoStyle);
        }

        // Add 9 more placeholder rows (indices 15 to 23)
        for (int r = 15; r <= 23; r++) {
            XSSFRow row = sheet.createRow(r);
            for (int c = 0; c < 14; c++) {
                XSSFCell cell = row.createCell(c);
                cell.setCellValue("Data " + r + "," + c);
                cell.setCellStyle(protoStyle);
            }
        }

        // Register merged region on prototype row: columns 5 to 6
        sheet.addMergedRegion(new CellRangeAddress(14, 14, 5, 6));

        // Downstream summary row with formula at row 24 (Row 25 in Excel)
        XSSFRow summaryRow = sheet.createRow(24);
        XSSFCell formulaCell = summaryRow.createCell(1);
        formulaCell.setCellFormula("SUM(B15:B24)");

        XSSFRow footerRow = sheet.createRow(25);
        footerRow.createCell(0).setCellValue("FIRMA DOCENTE TITULAR");

        // Expand by 50 additional rows to reach 60 rows total (from 10 to 60)
        // startRow = 24 (the summary row index before shift), shiftCount = 50, protoRow = 14
        DynamicRowShifter.shiftAndCloneRows(sheet, 24, 50, 14);

        // Verify total rows shifted
        // 26 original rows + 50 new = 76 rows (indices 0 to 75)
        assertEquals(75, sheet.getLastRowNum());

        // Verify newly cloned rows exist and have styles
        for (int r = 24; r < 74; r++) {
            XSSFRow newRow = sheet.getRow(r);
            assertNotNull(newRow, "Row " + r + " must not be null");
            assertEquals(24.0f, newRow.getHeightInPoints());
            assertNotNull(newRow.getCell(0));
            assertEquals(BorderStyle.THIN, newRow.getCell(0).getCellStyle().getBorderTop());
        }

        // Verify merged regions replicated across the 50 new rows
        // 1 original merged region + 50 new = 51 merged regions
        assertEquals(51, sheet.getNumMergedRegions());

        // Verify formula shifted from SUM(B15:B24) to SUM(B15:B74)
        XSSFRow shiftedSummaryRow = sheet.getRow(74);
        assertNotNull(shiftedSummaryRow);
        XSSFCell shiftedFormulaCell = shiftedSummaryRow.getCell(1);
        assertNotNull(shiftedFormulaCell);
        assertEquals(CellType.FORMULA, shiftedFormulaCell.getCellType());
        assertEquals("SUM(B15:B74)", shiftedFormulaCell.getCellFormula());

        // Verify footer row preserved
        XSSFRow shiftedFooter = sheet.getRow(75);
        assertNotNull(shiftedFooter);
        assertEquals("FIRMA DOCENTE TITULAR", shiftedFooter.getCell(0).getStringCellValue());
    }
}
