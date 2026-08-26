package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Programa Analitico creation / update request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuProgramaAnaliticoRequest {

    private Long id;

    @NotNull(message = "La asignación docente es obligatoria")
    private Long asignacionId;

    /** Extracted from docx table row 2, col 0 (e.g. "SIS-213"). */
    private String codigoAsignatura;

    /** Extracted from docx table row 2, col 2 (e.g. "PROGRAMACIÓN III"). */
    private String nombreAsignatura;

    /** Extracted from docx table row 2, col 1 (e.g. "3°"). */
    private String semestre;

    private Integer creditos;
    private Integer horasTeoricas;
    private Integer horasPracticas;

    @NotBlank(message = "La caracterización es obligatoria")
    private String caracterizacion;

    @NotBlank(message = "La macro competencia es obligatoria")
    private String macroCompetencia;

    @NotBlank(message = "El sistema de evaluación es obligatorio")
    private String sistemaEvaluacion;

    private List<ScuUnidadAprendizajeDto> unidades = new ArrayList<>();
    private List<ScuBibliografiaDto> bibliografia = new ArrayList<>();
}

