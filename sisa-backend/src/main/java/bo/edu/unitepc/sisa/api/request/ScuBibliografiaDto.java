package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * APA bibliography reference DTO for Programa Analitico.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuBibliografiaDto {
    private Long id;

    @NotBlank(message = "El tipo de bibliografía es obligatorio (BASICA/COMPLEMENTARIA)")
    private String tipo;

    @NotBlank(message = "La cita en formato APA 7ma edición es obligatoria")
    private String citaApa;

    private String autor;
    private Integer anio;
    private String titulo;
    private String editorialUrl;
}
