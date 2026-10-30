package bo.edu.unitepc.sisa.domain.enums;

import lombok.Getter;

import java.math.BigDecimal;

/**
 * Estado pedagogico de cumplimiento del tema oficial programado para la sesion de aula.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
public enum EstadoCumplimientoTema {

    TOTALMENTE_CUMPLIDO(
            new BigDecimal("1.00"),
            "Totalmente Cumplido",
            "bg-emerald-100 text-emerald-800 border-emerald-300"
    ),
    PARCIALMENTE_CUMPLIDO(
            new BigDecimal("0.50"),
            "Parcialmente Cumplido",
            "bg-amber-100 text-amber-800 border-amber-300"
    ),
    NO_CUMPLIDO(
            new BigDecimal("0.00"),
            "No Cumplido",
            "bg-rose-100 text-rose-800 border-rose-300"
    );

    private final BigDecimal score;
    private final String etiqueta;
    private final String tailwindBadgeClass;

    EstadoCumplimientoTema(BigDecimal score, String etiqueta, String tailwindBadgeClass) {
        this.score = score;
        this.etiqueta = etiqueta;
        this.tailwindBadgeClass = tailwindBadgeClass;
    }

    public static EstadoCumplimientoTema fromScore(BigDecimal score) {
        if (score == null) {
            return TOTALMENTE_CUMPLIDO;
        }
        if (score.compareTo(new BigDecimal("0.75")) >= 0) {
            return TOTALMENTE_CUMPLIDO;
        } else if (score.compareTo(new BigDecimal("0.25")) >= 0) {
            return PARCIALMENTE_CUMPLIDO;
        } else {
            return NO_CUMPLIDO;
        }
    }
}
