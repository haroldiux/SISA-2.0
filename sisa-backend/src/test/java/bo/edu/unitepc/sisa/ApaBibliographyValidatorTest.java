package bo.edu.unitepc.sisa;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for APA 7th Edition citation format validation.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ApaBibliographyValidatorTest {

    private static final Pattern APA_PATTERN = Pattern.compile("^([A-Za-zÀ-ÿ\\s,\\.]+)\\s+\\((\\d{4})\\)\\.\\s+([^\\.]+)\\.\\s+(.+)$");

    @Test
    @DisplayName("Should accept valid APA 7th edition book citation")
    void shouldAcceptValidApaCitation() {
        String validCitation = "Pressman, R. S. (2020). Ingeniería del software: un enfoque práctico. McGraw-Hill.";
        assertTrue(APA_PATTERN.matcher(validCitation).matches());
    }

    @Test
    @DisplayName("Should reject malformed citation missing publication year")
    void shouldRejectMissingYearCitation() {
        String invalidCitation = "Pressman, R. S. Ingeniería del software: un enfoque práctico. McGraw-Hill.";
        assertFalse(APA_PATTERN.matcher(invalidCitation).matches());
    }
}
