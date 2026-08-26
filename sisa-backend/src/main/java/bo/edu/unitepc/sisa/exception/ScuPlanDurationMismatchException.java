package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Plan de clase pedagogical moments duration mismatch exception.
 * Thrown when Inicio + Desarrollo + Cierre != Duracion Total.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuPlanDurationMismatchException extends ScuException {

    public ScuPlanDurationMismatchException(String message) {
        super("PLAN_DURATION_SUM_MISMATCH", message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
