package bo.edu.unitepc.sisa.infrastructure.office;

import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Excel XLSX template manipulator preserving typography, cell styles, borders, and formulas.
 *
 * @author GentleAI SISA Architecture Team
 */
public class XlsxTemplateCloner implements AutoCloseable {

    private final XSSFWorkbook workbook;

    public XlsxTemplateCloner(InputStream templateStream) throws IOException {
        this.workbook = new XSSFWorkbook(templateStream);
    }

    public XSSFWorkbook getWorkbook() {
        return this.workbook;
    }

    public XSSFSheet getSheet(String sheetName) {
        return this.workbook.getSheet(sheetName);
    }

    public XSSFSheet getSheetAt(int index) {
        return this.workbook.getSheetAt(index);
    }

    public byte[] toByteArray() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        this.workbook.write(baos);
        return baos.toByteArray();
    }

    public void writeToStream(OutputStream outputStream) throws IOException {
        this.workbook.write(outputStream);
    }

    @Override
    public void close() throws IOException {
        this.workbook.close();
    }
}
