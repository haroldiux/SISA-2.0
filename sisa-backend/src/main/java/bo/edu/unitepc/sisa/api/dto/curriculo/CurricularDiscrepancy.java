package bo.edu.unitepc.sisa.api.dto.curriculo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Detailed discrepancy or diagnostic finding emitted by the Curricular Linter.
 *
 * @author GentleAI SISA Architecture Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurricularDiscrepancy implements Serializable {

    private CurricularSeverity severidad;
    private String codigoRegla;
    private String seccion;
    private String ubicacion;
    private String descripcion;
    private String sugerencia;
}
