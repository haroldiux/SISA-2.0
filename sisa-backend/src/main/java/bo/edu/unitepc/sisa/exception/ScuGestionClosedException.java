package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Academic gestion closed exception when modifications are attempted on closed terms.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuGestionClosedException extends ScuException {

    public ScuGestionClosedException(String message) {
        super("GESTION_ALREADY_CLOSED", message, HttpStatus.BAD_REQUEST);
    }
}
