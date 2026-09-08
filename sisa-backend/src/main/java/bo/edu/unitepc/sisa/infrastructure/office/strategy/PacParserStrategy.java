package bo.edu.unitepc.sisa.infrastructure.office.strategy;

import bo.edu.unitepc.sisa.api.request.ScuPacDto;

import java.io.InputStream;
import java.util.Map;

/**
 * Strategy interface for parsing and generating official UNITEPC PAC Excel documents.
 *
 * @author GentleAI SISA Architecture Team
 */
public interface PacParserStrategy {

    /**
     * Parses an uploaded PAC Excel spreadsheet into a {@link ScuPacDto}.
     *
     * @param inputStream Excel binary stream
     * @param filename name of the uploaded file
     * @return parsed PAC DTO
     */
    ScuPacDto parse(InputStream inputStream, String filename);

    /**
     * Generates an official PAC Excel workbook bytes from the given {@link ScuPacDto}.
     *
     * @param pacDto PAC data model
     * @param context optional generation parameters/context
     * @return binary XLSX byte array
     */
    byte[] generate(ScuPacDto pacDto, Map<String, Object> context);

    /**
     * Indicates whether this strategy supports the given PAC type (e.g. GRAL, PRACTICO).
     *
     * @param pacType PAC classification (e.g. "GRAL", "PRACTICO")
     * @return true if supported, false otherwise
     */
    boolean supports(String pacType);
}
