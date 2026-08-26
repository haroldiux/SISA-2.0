package bo.edu.unitepc.sisa.exception;

import org.springframework.http.HttpStatus;

/**
 * Schedule collision exception when a teacher has overlapping assignments.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ScuScheduleOverlapException extends ScuException {

    public ScuScheduleOverlapException(String message) {
        super("SCHEDULE_COLLISION_DETECTED", message, HttpStatus.CONFLICT);
    }
}
