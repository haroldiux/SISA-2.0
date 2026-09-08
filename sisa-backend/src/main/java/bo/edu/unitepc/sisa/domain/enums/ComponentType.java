package bo.edu.unitepc.sisa.domain.enums;

/**
 * Academic curriculum component type based on UNITEPC group codes.
 *
 * @author GentleAI SISA Architecture Team
 */
public enum ComponentType {
    TA("Trabajo de Aula"),
    PA("Práctica de Aula"),
    PL("Práctica de Laboratorio"),
    PS("Práctica de Simulación");

    private final String description;

    ComponentType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isTheory() {
        return this == TA;
    }

    public boolean isPractice() {
        return this == PA || this == PL || this == PS;
    }

    /**
     * Resolves the ComponentType from a group code (e.g. "TA-01", "PA-02", "PL-1", "PS", etc.).
     *
     * @param code group code or component prefix
     * @return matching ComponentType, or null if unresolvable
     */
    public static ComponentType fromGroupCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        String clean = code.trim().toUpperCase();
        if (clean.startsWith("TA")) {
            return TA;
        }
        if (clean.startsWith("PA")) {
            return PA;
        }
        if (clean.startsWith("PL")) {
            return PL;
        }
        if (clean.startsWith("PS")) {
            return PS;
        }
        return null;
    }
}
