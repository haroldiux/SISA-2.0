package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuMomentoPedagogicoDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.response.ScuPlanClaseResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.enums.TipoMomentoPedagogico;
import bo.edu.unitepc.sisa.domain.model.MomentoPedagogico;
import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SesionMatriz7Repository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.exception.ScuPlanDurationMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Command for saving Plan de Clases with mandatory 3-moment duration arithmetic validation.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSavePlanClaseCmd {

    private final PlanDeClaseRepository planRepository;
    private final SesionMatriz7Repository sesionRepository;

    public ScuSavePlanClaseCmd(
            PlanDeClaseRepository planRepository,
            SesionMatriz7Repository sesionRepository) {
        this.planRepository = planRepository;
        this.sesionRepository = sesionRepository;
    }

    @Transactional
    public ScuPlanClaseResponse execute(ScuPlanClaseRequest request) {
        SesionMatriz7 sesion = this.sesionRepository.findById(request.getSesionId())
                .orElseThrow(() -> new ScuException("SESION_NOT_FOUND", "Sesión Matriz 7 no encontrada: " + request.getSesionId(), HttpStatus.NOT_FOUND));

        // Arithmetic validation of 3 moments duration
        if (request.getMomentos() == null || request.getMomentos().isEmpty()) {
            throw new ScuPlanDurationMismatchException("El plan de clase debe contener los 3 momentos pedagógicos.");
        }

        int totalMomentsDuration = request.getMomentos().stream()
                .mapToInt(m -> (m.getDuracionMin() != null ? m.getDuracionMin() : 0))
                .sum();

        if (totalMomentsDuration != request.getDuracionTotalMin()) {
            throw new ScuPlanDurationMismatchException(
                    "La sumatoria de los momentos pedagógicos (" + totalMomentsDuration +
                    " min) no coincide con la duración total de la clase (" + request.getDuracionTotalMin() + " min)."
            );
        }

        // Verify all 3 moments are represented: INICIO, DESARROLLO, CIERRE
        Set<TipoMomentoPedagogico> presentMoments = EnumSet.noneOf(TipoMomentoPedagogico.class);
        for (ScuMomentoPedagogicoDto m : request.getMomentos()) {
            if (m.getTipoMomento() != null) {
                presentMoments.add(m.getTipoMomento());
            }
        }
        if (!presentMoments.contains(TipoMomentoPedagogico.INICIO) ||
            !presentMoments.contains(TipoMomentoPedagogico.DESARROLLO) ||
            !presentMoments.contains(TipoMomentoPedagogico.CIERRE)) {
            throw new ScuPlanDurationMismatchException("El plan debe incluir obligatoriamente los momentos: INICIO, DESARROLLO y CIERRE.");
        }

        PlanDeClase plan = this.planRepository.findBySesionId(sesion.getId())
                .orElse(new PlanDeClase());

        plan.setSesion(sesion);
        plan.setEstado(EstadoPlanificacion.BORRADOR);
        plan.setDuracionTotalMin(request.getDuracionTotalMin());
        plan.setObjetivoSesion(request.getObjetivoSesion());
        plan.setRecursosDidacticos(request.getRecursosDidacticos());
        plan.setActualizadoEn(OffsetDateTime.now());

        // Update momentos
        plan.getMomentos().clear();
        for (ScuMomentoPedagogicoDto mDto : request.getMomentos()) {
            MomentoPedagogico m = new MomentoPedagogico();
            m.setTipoMomento(mDto.getTipoMomento());
            m.setDuracionMin(mDto.getDuracionMin());
            m.setActividadesDocente(mDto.getActividadesDocente());
            m.setActividadesEstudiante(mDto.getActividadesEstudiante());
            m.setIndicadorEvaluacion(mDto.getIndicadorEvaluacion());
            plan.addMomento(m);
        }

        PlanDeClase saved = this.planRepository.save(plan);
        return this._mapToResponse(saved);
    }

    private ScuPlanClaseResponse _mapToResponse(PlanDeClase p) {
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
