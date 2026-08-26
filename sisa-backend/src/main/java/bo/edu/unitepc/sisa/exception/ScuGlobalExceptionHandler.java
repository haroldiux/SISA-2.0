package bo.edu.unitepc.sisa.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler providing RFC 7807 / standard error responses for SISA.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestControllerAdvice
public class ScuGlobalExceptionHandler {

    @ExceptionHandler(ScuException.class)
    public ResponseEntity<Map<String, Object>> handleScuException(
            ScuException ex, HttpServletRequest request) {
        Map<String, Object> body = this._buildErrorPayload(
                ex.getHttpStatus().value(),
                ex.getHttpStatus().getReasonPhrase(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(body, ex.getHttpStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = this._buildErrorPayload(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "Validation Error",
                "VALIDATION_FAILED",
                "Input arguments failed validation constraints",
                request.getRequestURI()
        );
        body.put("errors", fieldErrors);

        return new ResponseEntity<>(body, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        Map<String, Object> body = this._buildErrorPayload(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "ACCESS_DENIED",
                "You do not have permission to access this resource",
                request.getRequestURI()
        );
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthException(
            AuthenticationException ex, HttpServletRequest request) {
        Map<String, Object> body = this._buildErrorPayload(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "AUTH_FAILED",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        Map<String, Object> body = this._buildErrorPayload(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "INTERNAL_ERROR",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private Map<String, Object> _buildErrorPayload(
            int status, String error, String code, String message, String path) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("timestamp", Instant.now().toString());
        payload.put("status", status);
        payload.put("error", error);
        payload.put("code", code);
        payload.put("message", message);
        payload.put("path", path);
        return payload;
    }
}
