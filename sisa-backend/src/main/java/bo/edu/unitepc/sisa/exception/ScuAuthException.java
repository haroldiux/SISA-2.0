package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Authentication and credential validation failure exception.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuAuthException extends ScuException {

    public ScuAuthException(String message) {
        super("AUTH_INVALID_CREDENTIALS", message, HttpStatus.UNAUTHORIZED);
    }

    public ScuAuthException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.UNAUTHORIZED);
    }
}
