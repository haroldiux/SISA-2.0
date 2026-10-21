package bo.edu.unitepc.sisa.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

/**
 * Career director batch review and certification response DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuPacBatchReviewResponse {

    private int totalReviewed;

    private List<Long> approvedIds;

    private String carreraId;

    private Integer semestre;

    private String revisadoPor;

    private Instant revisadoEn;
}
