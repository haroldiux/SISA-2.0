package bo.edu.unitepc.sisa.domain.enums;

/**
 * Course type classification according to academic hours.
 *
 * @author GentleAI SISA Architecture Team
 */
public enum CourseType {
    TEORICO("Teórico"),
    PRACTICO("Práctico"),
    TEORICO_PRACTICO("Teórico-Práctico");

    private final String description;

    CourseType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isTeorico() {
        return this == TEORICO;
    }

    public boolean isPractico() {
        return this == PRACTICO;
    }

    public boolean isTeoricoPractico() {
        return this == TEORICO_PRACTICO;
    }

    /**
     * Determines the CourseType based on theoretical and practical hours.
     *
     * @param theoryHours theoretical hours per week/cycle
     * @param practiceHours practical hours per week/cycle
     * @return resolved CourseType
     */
    public static CourseType fromHours(int theoryHours, int practiceHours) {
        if (theoryHours > 0 && practiceHours > 0) {
            return TEORICO_PRACTICO;
        } else if (practiceHours > 0) {
            return PRACTICO;
        } else {
            return TEORICO;
        }
    }
}
