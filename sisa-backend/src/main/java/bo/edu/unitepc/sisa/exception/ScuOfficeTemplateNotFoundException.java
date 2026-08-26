package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Office document template missing exception.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuOfficeTemplateNotFoundException extends ScuException {

    public ScuOfficeTemplateNotFoundException(String message) {
        super("OFFICE_TEMPLATE_NOT_FOUND", message, HttpStatus.NOT_FOUND);
    }
}
