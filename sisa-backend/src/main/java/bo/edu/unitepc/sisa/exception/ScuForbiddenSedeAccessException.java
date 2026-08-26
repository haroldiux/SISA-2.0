package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Multi-tenant cross-sede forbidden access exception.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuForbiddenSedeAccessException extends ScuException {

    public ScuForbiddenSedeAccessException(String message) {
        super("FORBIDDEN_SEDE_ACCESS", message, HttpStatus.FORBIDDEN);
    }
}
