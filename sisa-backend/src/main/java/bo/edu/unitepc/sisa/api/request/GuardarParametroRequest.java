package bo.edu.unitepc.sisa.api.request;

import bo.edu.unitepc.sisa.domain.enums.NivelParametro;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Request payload for creating or updating a hierarchical parameter policy.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
public class GuardarParametroRequest {

    @NotNull(message = "El nivel jerarquico es obligatorio (GLOBAL, SEDE, CARRERA)")
    private NivelParametro nivel;

    @NotBlank(message = "El codigo de ambito es obligatorio (ej. GLOBAL, CBA, CARSIS)")
    private String codigoAmbito;

    @NotBlank(message = "El nombre descriptivo del ambito es obligatorio")
    private String nombreAmbito;

    @NotNull(message = "El porcentaje minimo de asistencia es obligatorio")
    @DecimalMin(value = "50.00", message = "La asistencia minima no puede ser inferior al 50%")
    @DecimalMax(value = "100.00", message = "La asistencia minima no puede exceder el 100%")
    private BigDecimal asistenciaMinimaPct;

    @NotNull(message = "El porcentaje de alerta de asistencia es obligatorio")
    @DecimalMin(value = "50.00", message = "La alerta de asistencia no puede ser inferior al 50%")
    @DecimalMax(value = "100.00", message = "La alerta de asistencia no puede exceder el 100%")
    private BigDecimal asistenciaAlertaPct;

    @NotNull(message = "El limite de faltas consecutivas es obligatorio")
    @Min(value = 1, message = "Debe ser al menos 1 falta consecutiva")
    private Integer faltasConsecutivasAlerta;

    @NotNull(message = "El umbral de semaforo verde es obligatorio")
    private BigDecimal semaforoVerdePct;

    @NotNull(message = "El umbral de semaforo amarillo es obligatorio")
    private BigDecimal semaforoAmarilloPct;

    @NotNull(message = "Las horas de gracia para registro docente son obligatorias")
    @Min(value = 0, message = "Las horas de gracia no pueden ser negativas")
    private Integer horasGraciaRegistroDocente;

    @NotNull(message = "El limite de sesiones sin asentar es obligatorio")
    @Min(value = 1, message = "Debe ser al menos 1 sesion")
    private Integer sesionesSinAsentarAlerta;

    private String observaciones;
}
