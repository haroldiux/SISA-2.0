package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.SeguimientoClaseDto;
import bo.edu.unitepc.sisa.api.request.GuardarSeguimientoClaseRequest;
import bo.edu.unitepc.sisa.domain.enums.EstadoCumplimientoTema;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.model.SeguimientoClase;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SeguimientoClaseRepository;
import bo.edu.unitepc.sisa.domain.repository.SesionMatriz7Repository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Command for saving or updating class tracking with idempotent upsert semantics
 * and automatic transition of PlanDeClase to EJECUTADO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSaveSeguimientoClaseCmd {

    private final SeguimientoClaseRepository seguimientoRepository;
    private final SesionMatriz7Repository sesionMatriz7Repository;
    private final PlanDeClaseRepository planDeClaseRepository;

    public ScuSaveSeguimientoClaseCmd(
            SeguimientoClaseRepository seguimientoRepository,
            SesionMatriz7Repository sesionMatriz7Repository,
            PlanDeClaseRepository planDeClaseRepository) {
        this.seguimientoRepository = seguimientoRepository;
        this.sesionMatriz7Repository = sesionMatriz7Repository;
        this.planDeClaseRepository = planDeClaseRepository;
    }

    @Transactional
    public SeguimientoClaseDto execute(GuardarSeguimientoClaseRequest request) {
        // 1. Validar reglas de negocio temporales
        LocalDate hoy = LocalDate.now();
        if (request.fechaEjecucion().isAfter(hoy.plusDays(1))) {
            throw new ScuException(
                    "ERR_FECHA_FUTURA",
                    "No se permite registrar seguimiento para fechas futuras superiores a 24 horas",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 2. Sanitizar listas
        List<String> recPlan = request.recursosPlanificados() != null
                ? new ArrayList<>(request.recursosPlanificados())
                : new ArrayList<>();
        List<String> recUtil = request.recursosUtilizados() != null
                ? new ArrayList<>(request.recursosUtilizados())
                : new ArrayList<>();

        // 3. Buscar existencia previa (Upsert idempotente)
        Optional<SeguimientoClase> existenteOpt = Optional.empty();
        if (request.sesionMatriz7Id() != null) {
            existenteOpt = this.seguimientoRepository.findBySesionMatriz7Id(request.sesionMatriz7Id());
        }
        if (existenteOpt.isEmpty()) {
            existenteOpt = this.seguimientoRepository.findByMateriaCodigoAndFechaEjecucionAndTipoClaseAndComision(
                    request.materiaCodigo().trim(),
                    request.fechaEjecucion(),
                    request.tipoClase(),
                    request.comision().trim()
            );
        }

        SeguimientoClase seguimiento = existenteOpt.orElseGet(SeguimientoClase::new);

        // Asociar SesionMatriz7 si corresponde
        if (request.sesionMatriz7Id() != null) {
            SesionMatriz7 sesion = this.sesionMatriz7Repository.findById(request.sesionMatriz7Id())
                    .orElse(null);
            seguimiento.setSesionMatriz7(sesion);
        }

        seguimiento.setMateriaCodigo(request.materiaCodigo().trim());
        seguimiento.setCarreraCodigo(
                (request.carreraCodigo() != null && !request.carreraCodigo().isBlank())
                        ? request.carreraCodigo().trim()
                        : "CARSIS"
        );
        seguimiento.setDocenteCi(request.docenteCi().trim());
        seguimiento.setFechaEjecucion(request.fechaEjecucion());
        seguimiento.setTipoClase(request.tipoClase());
        seguimiento.setComision(request.comision().trim());
        seguimiento.setTemaOficial(request.temaOficial());
        seguimiento.setTemaEjecutado(request.temaEjecutado());
        seguimiento.setRecursosPlanificados(recPlan);
        seguimiento.setRecursosUtilizados(recUtil);

        boolean secIntro = request.secuenciaIntroduccion() != null ? request.secuenciaIntroduccion() : Boolean.TRUE;
        boolean secRes = request.secuenciaResultados() != null ? request.secuenciaResultados() : Boolean.TRUE;
        boolean secCont = request.secuenciaContenidos() != null ? request.secuenciaContenidos() : Boolean.TRUE;
        boolean secCuer = request.secuenciaCuerpo() != null ? request.secuenciaCuerpo() : Boolean.TRUE;
        boolean secCier = request.secuenciaCierre() != null ? request.secuenciaCierre() : Boolean.TRUE;

        seguimiento.setSecuenciaIntroduccion(secIntro);
        seguimiento.setSecuenciaResultados(secRes);
        seguimiento.setSecuenciaContenidos(secCont);
        seguimiento.setSecuenciaCuerpo(secCuer);
        seguimiento.setSecuenciaCierre(secCier);

        seguimiento.setMomentoInicioCumplido(
                request.momentoInicioCumplido() != null ? request.momentoInicioCumplido() : (secIntro && secRes)
        );
        seguimiento.setMomentoDesarrolloCumplido(
                request.momentoDesarrolloCumplido() != null ? request.momentoDesarrolloCumplido() : (secCont && secCuer)
        );
        seguimiento.setMomentoCierreCumplido(
                request.momentoCierreCumplido() != null ? request.momentoCierreCumplido() : secCier
        );

        seguimiento.setEstadoCumplimiento(request.estadoCumplimiento());
        seguimiento.setCumplimientoScore(request.estadoCumplimiento().getScore());
        seguimiento.setObservacionesDocente(request.observacionesDocente());

        if (seguimiento.getId() != null) {
            seguimiento.setActualizadoEn(OffsetDateTime.now());
        }

        SeguimientoClase guardado = this.seguimientoRepository.save(seguimiento);

        // 4. Transicion de estado en PlanDeClase a EJECUTADO si aplica
        String planClaseActualizado = null;
        if (request.sesionMatriz7Id() != null && request.estadoCumplimiento() != EstadoCumplimientoTema.NO_CUMPLIDO) {
            Optional<PlanDeClase> planOpt = this.planDeClaseRepository.findBySesionId(request.sesionMatriz7Id());
            if (planOpt.isPresent()) {
                PlanDeClase plan = planOpt.get();
                plan.setEstado(EstadoPlanificacion.EJECUTADO);
                plan.setActualizadoEn(OffsetDateTime.now());
                this.planDeClaseRepository.save(plan);
                planClaseActualizado = EstadoPlanificacion.EJECUTADO.name();
            }
        }

        return mapToDto(guardado, planClaseActualizado);
    }

    public static SeguimientoClaseDto mapToDto(SeguimientoClase s, String planClaseEstado) {
        return new SeguimientoClaseDto(
                s.getId(),
                s.getSesionMatriz7() != null ? s.getSesionMatriz7().getId() : null,
                s.getMateriaCodigo(),
                s.getCarreraCodigo(),
                s.getDocenteCi(),
                s.getFechaEjecucion(),
                s.getTipoClase(),
                s.getComision(),
                s.getTemaOficial(),
                s.getTemaEjecutado(),
                s.getRecursosPlanificados(),
                s.getRecursosUtilizados(),
                s.getMomentoInicioCumplido(),
                s.getMomentoDesarrolloCumplido(),
                s.getMomentoCierreCumplido(),
                s.getSecuenciaIntroduccion(),
                s.getSecuenciaResultados(),
                s.getSecuenciaContenidos(),
                s.getSecuenciaCuerpo(),
                s.getSecuenciaCierre(),
                s.getEstadoCumplimiento(),
                s.getCumplimientoScore(),
                s.getObservacionesDocente(),
                planClaseEstado,
                s.getCreadoEn(),
                s.getActualizadoEn()
        );
    }
}
