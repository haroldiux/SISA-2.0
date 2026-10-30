package bo.edu.unitepc.sisa.domain.enums;

import lombok.Getter;

/**
 * Clasificacion tri-color institucional del semaforo curricular de carrera.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
public enum ColorSemaforo {

    VERDE(
            "Al Dia / En Calendario",
            "bg-emerald-500",
            "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200"
    ),
    AMARILLO(
            "Atencion / Riesgo Moderado",
            "bg-amber-500",
            "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200"
    ),
    ROJO(
            "Critico / Desfase Grave o Sin Plan",
            "bg-rose-500",
            "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200"
    );

    private final String descripcion;
    private final String colorDotClass;
    private final String badgeClass;

    ColorSemaforo(String descripcion, String colorDotClass, String badgeClass) {
        this.descripcion = descripcion;
        this.colorDotClass = colorDotClass;
        this.badgeClass = badgeClass;
    }
}
