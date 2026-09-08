package bo.edu.unitepc.sisa.infrastructure.office.strategy;

import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Strategy interface for parsing and generating official UNITEPC Plan de Clases Excel documents.
 *
 * @author GentleAI SISA Architecture Team
 */
public interface PlanClaseParserStrategy {

    /**
     * Parses an uploaded Plan de Clases Excel spreadsheet into a list of {@link ScuPlanClaseDto}.
     *
     * @param inputStream Excel binary stream
     * @param filename name of the uploaded file
     * @return list of parsed plan de clases DTOs
     */
    List<ScuPlanClaseDto> parse(InputStream inputStream, String filename);

    /**
     * Generates official Plan de Clases Excel workbook bytes from the given list of plans.
     *
     * @param planList list of plan de clases DTOs
     * @param context optional generation parameters/context
     * @return binary XLSX byte array
     */
    byte[] generate(List<ScuPlanClaseDto> planList, Map<String, Object> context);

    /**
     * Indicates whether this strategy supports the given Plan de Clases type.
     *
     * @param planType Plan type (e.g. "TEORICO", "PRACTICO", "TEORICO_PRACTICO")
     * @return true if supported, false otherwise
     */
    boolean supports(String planType);
}
