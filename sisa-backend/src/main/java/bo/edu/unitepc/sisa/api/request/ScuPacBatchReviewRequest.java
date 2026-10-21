package bo.edu.unitepc.sisa.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Career director batch review and certification request DTO for semester PACs.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuPacBatchReviewRequest {

    private String carreraId;

    private Long gestionId;

    private Integer semestre;

    private List<Long> pacIds;

    private String observaciones;
}
