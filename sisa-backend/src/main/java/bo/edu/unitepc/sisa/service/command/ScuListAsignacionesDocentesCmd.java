package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.response.ScuAsignacionDocenteResponse;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for listing teacher assignments scoped by tenant context and filters.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuListAsignacionesDocentesCmd {

    private final AsignacionDocenteRepository asignacionRepository;

    public ScuListAsignacionesDocentesCmd(AsignacionDocenteRepository asignacionRepository) {
        this.asignacionRepository = asignacionRepository;
    }

    @Transactional(readOnly = true)
    public List<ScuAsignacionDocenteResponse> execute(Long gestionId, Long carreraId, Long docenteId) {
        List<AsignacionDocente> list = this.asignacionRepository.findAll();

        TenantInfo tenant = TenantContext.getTenantInfo();
        Long tenantSedeId = (tenant != null && !tenant.isNationalScope()) ? tenant.getSedeId() : null;

        return list.stream()
                .filter(a -> gestionId == null || a.getGestion().getId().equals(gestionId))
                .filter(a -> carreraId == null || a.getCarrera().getId().equals(carreraId))
                .filter(a -> docenteId == null || a.getDocente().getId().equals(docenteId))
                .filter(a -> tenantSedeId == null || (a.getCampus() != null && a.getCampus().getSede() != null && a.getCampus().getSede().getId().equals(tenantSedeId)))
                .map(this::_mapToResponse)
                .collect(Collectors.toList());
    }

    private ScuAsignacionDocenteResponse _mapToResponse(AsignacionDocente a) {
        return ScuAsignacionDocenteResponse.builder()
                .id(a.getId())
                .gestionId(a.getGestion().getId())
                .gestionCodigo(a.getGestion().getCodigo())
                .docenteId(a.getDocente().getId())
                .docenteNombre(a.getDocente().getNombreCompleto())
                .carreraId(a.getCarrera().getId())
                .carreraNombre(a.getCarrera().getNombre())
                .asignaturaId(a.getAsignatura().getId())
                .asignaturaCodigo(a.getAsignatura().getCodigo())
                .asignaturaNombre(a.getAsignatura().getNombre())
                .semestre(a.getAsignatura().getSemestre())
                .campusId(a.getCampus().getId())
                .campusNombre(a.getCampus().getNombre())
                .sedeId(a.getCampus().getSede() != null ? a.getCampus().getSede().getId() : null)
                .sedeNombre(a.getCampus().getSede() != null ? a.getCampus().getSede().getNombre() : "")
                .grupoParalelo(a.getGrupoParalelo())
                .turno(a.getTurno())
                .aula(a.getAula())
                .diasSemana(a.getDiasSemana())
                .horarioInicio(a.getHorarioInicio())
                .horarioFin(a.getHorarioFin())
                .build();
    }
}
