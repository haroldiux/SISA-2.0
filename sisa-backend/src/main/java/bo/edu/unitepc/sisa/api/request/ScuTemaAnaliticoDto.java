package bo.edu.unitepc.sisa.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScuTemaAnaliticoDto {
    private Integer numeroTema;
    private String titulo;
    private String contenido;
}
