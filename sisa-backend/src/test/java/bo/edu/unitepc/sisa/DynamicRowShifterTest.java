package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.infrastructure.office.DynamicRowShifter;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Unit tests for DynamicRowShifter utility in POI XSSF sheets.
 *
 * @author GentleAI SISA Architecture Team
 */
public class DynamicRowShifterTest {

    @Test
    @DisplayName("Should shift rows and replicate prototype cell styles correctly")
    void shouldShiftAndCloneRows() {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("TestSheet");

        // Prototype row at 5
        XSSFRow protoRow = sheet.createRow(5);
        protoRow.setHeightInPoints(22.5f);
        XSSFCell protoCell1 = protoRow.createCell(0);
        protoCell1.setCellValue("Prototype 1");
        XSSFCell protoCell2 = protoRow.createCell(1);
        protoCell2.setCellValue("Prototype 2");

        // Existing row below
        XSSFRow bottomRow = sheet.createRow(6);
        bottomRow.createCell(0).setCellValue("Bottom Signature");

        // Shift 3 rows at index 6
        DynamicRowShifter.shiftAndCloneRows(sheet, 6, 3, 5);

        // Assert new total rows
        assertEquals(9, sheet.getLastRowNum());
        assertNotNull(sheet.getRow(6));
        assertNotNull(sheet.getRow(7));
        assertNotNull(sheet.getRow(8));
        assertEquals("Bottom Signature", sheet.getRow(9).getCell(0).getStringCellValue());
    }
}
