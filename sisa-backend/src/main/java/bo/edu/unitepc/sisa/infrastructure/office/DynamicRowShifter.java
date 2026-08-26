package bo.edu.unitepc.sisa.infrastructure.office;

import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Dynamic row expansion engine for Excel templates, preserving styles, borders, merged regions, and formulas.
 *
 * @author GentleAI SISA Architecture Team
 */
public class DynamicRowShifter {

    private static final Pattern CELL_RANGE_PATTERN = Pattern.compile("([A-Za-z]+)(\\d+):([A-Za-z]+)(\\d+)");

    public static void shiftAndCloneRows(
            XSSFSheet sheet, int startRow, int numRowsToInsert, int prototypeRowIdx) {
        if (numRowsToInsert <= 0 || sheet == null) {
            return;
        }

        int lastRowNum = sheet.getLastRowNum();
        if (startRow <= lastRowNum) {
            sheet.shiftRows(startRow, lastRowNum, numRowsToInsert, true, false);
        }

        XSSFRow prototypeRow = sheet.getRow(prototypeRowIdx);
        if (prototypeRow == null) {
            return;
        }

        for (int i = 0; i < numRowsToInsert; i++) {
            int newRowIdx = startRow + i;
            XSSFRow newRow = sheet.createRow(newRowIdx);
            newRow.setHeight(prototypeRow.getHeight());

            short lastCellNum = prototypeRow.getLastCellNum();
            if (lastCellNum > 0) {
                for (int j = 0; j < lastCellNum; j++) {
                    XSSFCell protoCell = prototypeRow.getCell(j);
                    if (protoCell != null) {
                        XSSFCell newCell = newRow.createCell(j, protoCell.getCellType());
                        if (protoCell.getCellStyle() != null) {
                            newCell.setCellStyle(protoCell.getCellStyle());
                        }
                    }
                }
            }
        }

        // Merged regions translation for newly inserted rows
        List<CellRangeAddress> newMergedRegions = new ArrayList<>();
        for (CellRangeAddress region : sheet.getMergedRegions()) {
            if (region.getFirstRow() == prototypeRowIdx && region.getLastRow() == prototypeRowIdx) {
                for (int i = 0; i < numRowsToInsert; i++) {
                    int targetRow = startRow + i;
                    newMergedRegions.add(new CellRangeAddress(
                            targetRow, targetRow, region.getFirstColumn(), region.getLastColumn()
                    ));
                }
            }
        }
        for (CellRangeAddress newRegion : newMergedRegions) {
            sheet.addMergedRegion(newRegion);
        }

        // Recalculate formula coordinates
        recalculateFormulaCoordinates(sheet, startRow, numRowsToInsert);
    }

    public static void recalculateFormulaCoordinates(XSSFSheet sheet, int startRow, int shiftCount) {
        if (sheet == null || shiftCount <= 0) {
            return;
        }

        int lastRowNum = sheet.getLastRowNum();
        for (int r = 0; r <= lastRowNum; r++) {
            XSSFRow row = sheet.getRow(r);
            if (row == null) {
                continue;
            }
            short lastCell = row.getLastCellNum();
            for (int c = 0; c < lastCell; c++) {
                XSSFCell cell = row.getCell(c);
                if (cell != null && cell.getCellType() == CellType.FORMULA) {
                    String formula = cell.getCellFormula();
                    if (formula != null) {
                        String updated = _shiftFormulaRange(formula, startRow, shiftCount);
                        if (!updated.equals(formula)) {
                            cell.setCellFormula(updated);
                        }
                    }
                }
            }
        }
    }

    private static String _shiftFormulaRange(String formula, int startRow, int shiftCount) {
        Matcher matcher = CELL_RANGE_PATTERN.matcher(formula);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            String colStart = matcher.group(1);
            int rowStart = Integer.parseInt(matcher.group(2));
            String colEnd = matcher.group(3);
            int rowEnd = Integer.parseInt(matcher.group(4));

            int newRowStart = rowStart;
            int newRowEnd = rowEnd;

            // In Excel 1-indexed notation, if range ended at or after startRow
            if (rowStart > startRow + 1) {
                newRowStart = rowStart + shiftCount;
            }
            if (rowEnd >= startRow) {
                newRowEnd = rowEnd + shiftCount;
            }

            String replacement = colStart + newRowStart + ":" + colEnd + newRowEnd;
            matcher.appendReplacement(sb, replacement);
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
