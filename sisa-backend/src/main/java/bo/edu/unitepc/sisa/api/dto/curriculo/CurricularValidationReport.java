package bo.edu.unitepc.sisa.api.dto.curriculo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive Validation & Quality Diagnostics Report for Curricular Ingestion.
 *
 * @author GentleAI SISA Architecture Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurricularValidationReport implements Serializable {

    private String estado; // APROBADO, CON_ADVERTENCIAS, BLOQUEADO
    private boolean puedePersistir;
    private String tipoDocumento; // PROGRAMA_ANALITICO, PAC_TEORICO, PAC_PRACTICO, PLAN_CLASE
    private String archivoNombre;
    private Long archivoTamanoBytes;

    private Long asignacionId;
    private String codigoEsperado;
    private String materiaEsperada;
    private String codigoDetectado;
    private String materiaDetectada;

    private int totalErroresBloqueantes;
    private int totalAdvertencias;

    private Integer totalUnidades;
    private Integer totalTemas;
    private Integer totalSemanas;
    private Integer totalSesiones;

    @Builder.Default
    private List<CurricularDiscrepancy> discrepancias = new ArrayList<>();

    @Builder.Default
    private Map<String, Object> resumenContenido = new HashMap<>();

    public void addDiscrepancia(CurricularDiscrepancy d) {
        if (this.discrepancias == null) {
            this.discrepancias = new ArrayList<>();
        }
        this.discrepancias.add(d);
        if (d.getSeveridad() == CurricularSeverity.BLOQUEANTE) {
            this.totalErroresBloqueantes++;
        } else if (d.getSeveridad() == CurricularSeverity.ADVERTENCIA) {
            this.totalAdvertencias++;
        }
        recalcularEstado();
    }

    public void recalcularEstado() {
        if (this.totalErroresBloqueantes > 0) {
            this.estado = "BLOQUEADO";
            this.puedePersistir = false;
        } else if (this.totalAdvertencias > 0) {
            this.estado = "CON_ADVERTENCIAS";
            this.puedePersistir = true;
        } else {
            this.estado = "APROBADO";
            this.puedePersistir = true;
        }
    }
}
