package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Base domain exception for all SISA application errors.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public ScuException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public ScuException(String errorCode, String message, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return this.errorCode;
    }

    public HttpStatus getHttpStatus() {
        return this.httpStatus;
    }
}
