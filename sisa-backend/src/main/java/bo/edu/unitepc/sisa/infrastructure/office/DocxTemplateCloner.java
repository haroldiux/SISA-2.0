package bo.edu.unitepc.sisa.infrastructure.office;

import org.apache.poi.xwpf.usermodel.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

/**
 * Word DOCX template manipulator performing placeholder replacement and table expansion.
 *
 * @author GentleAI SISA Architecture Team
 */
public class DocxTemplateCloner implements AutoCloseable {

    private final XWPFDocument document;

    public DocxTemplateCloner(InputStream templateStream) throws IOException {
        this.document = new XWPFDocument(templateStream);
    }

    public XWPFDocument getDocument() {
        return this.document;
    }

    public void replacePlaceholders(Map<String, String> replacements) {
        if (replacements == null || replacements.isEmpty()) {
            return;
        }

        // Replace in standard paragraphs
        for (XWPFParagraph p : this.document.getParagraphs()) {
            this._replaceInParagraph(p, replacements);
        }

        // Replace inside tables
        for (XWPFTable tbl : this.document.getTables()) {
            for (XWPFTableRow row : tbl.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        this._replaceInParagraph(p, replacements);
                    }
                }
            }
        }

        // Replace in headers & footers
        for (XWPFHeader header : this.document.getHeaderList()) {
            for (XWPFParagraph p : header.getParagraphs()) {
                this._replaceInParagraph(p, replacements);
            }
        }
        for (XWPFFooter footer : this.document.getFooterList()) {
            for (XWPFParagraph p : footer.getParagraphs()) {
                this._replaceInParagraph(p, replacements);
            }
        }
    }

    public void injectTableRow(XWPFTable table, int insertIdx, List<String> cellValues) {
        if (table == null || cellValues == null) {
            return;
        }
        XWPFTableRow newRow = table.insertNewTableRow(insertIdx);
        for (String val : cellValues) {
            XWPFTableCell cell = newRow.addNewTableCell();
            cell.setText(val != null ? val : "");
        }
    }

    public byte[] toByteArray() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        this.document.write(baos);
        return baos.toByteArray();
    }

    public void writeToStream(OutputStream outputStream) throws IOException {
        this.document.write(outputStream);
    }

    @Override
    public void close() throws IOException {
        this.document.close();
    }

    private void _replaceInParagraph(XWPFParagraph paragraph, Map<String, String> replacements) {
        String fullText = paragraph.getText();
        if (fullText == null || fullText.isEmpty()) {
            return;
        }

        boolean found = false;
        for (Map.Entry<String, String> entry : replacements.entrySet()) {
            String key = "${" + entry.getKey() + "}";
            if (fullText.contains(key)) {
                fullText = fullText.replace(key, entry.getValue() != null ? entry.getValue() : "");
                found = true;
            }
        }

        if (found) {
            // Consolidate runs
            while (paragraph.getRuns().size() > 0) {
                paragraph.removeRun(0);
            }
            XWPFRun newRun = paragraph.createRun();
            newRun.setText(fullText);
        }
    }
}
