package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuMomentoPedagogicoDto;
import bo.edu.unitepc.sisa.api.response.ScuPlanClaseResponse;
import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for retrieving Plan de Clase by session ID.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetPlanClaseCmd {

    private final PlanDeClaseRepository planRepository;

    public ScuGetPlanClaseCmd(PlanDeClaseRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional(readOnly = true)
    public ScuPlanClaseResponse execute(Long sesionId) {
        PlanDeClase p = this.planRepository.findBySesionId(sesionId)
                .orElseThrow(() -> new ScuException("PLAN_NOT_FOUND", "Plan de clase no encontrado para la sesión: " + sesionId, HttpStatus.NOT_FOUND));

        List<ScuMomentoPedagogicoDto> mDtos = p.getMomentos().stream()
                .map(m -> ScuMomentoPedagogicoDto.builder()
                        .id(m.getId())
                        .tipoMomento(m.getTipoMomento())
                        .duracionMin(m.getDuracionMin())
                        .actividadesDocente(m.getActividadesDocente())
                        .actividadesEstudiante(m.getActividadesEstudiante())
                        .indicadorEvaluacion(m.getIndicadorEvaluacion())
                        .build())
                .collect(Collectors.toList());

        return ScuPlanClaseResponse.builder()
                .id(p.getId())
                .sesionId(p.getSesion().getId())
                .semana(p.getSesion().getSemana())
                .nroSesion(p.getSesion().getNroSesion())
                .unidadTematica(p.getSesion().getUnidadTematica())
                .estado(p.getEstado())
                .duracionTotalMin(p.getDuracionTotalMin())
                .objetivoSesion(p.getObjetivoSesion())
                .recursosDidacticos(p.getRecursosDidacticos())
                .momentos(mDtos)
                .creadoEn(p.getCreadoEn())
                .actualizadoEn(p.getActualizadoEn())
                .build();
    }
}
