package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.response.ScuReincidenciaResponse;
import bo.edu.unitepc.sisa.domain.model.ReincidenciaDocente;
import bo.edu.unitepc.sisa.domain.repository.ReincidenciaDocenteRepository;
import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for listing disciplinary recurrences scoped by regional Sede or national view.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuListReincidenciasCmd {

    private final ReincidenciaDocenteRepository reincidenciaRepository;

    public ScuListReincidenciasCmd(ReincidenciaDocenteRepository reincidenciaRepository) {
        this.reincidenciaRepository = reincidenciaRepository;
    }

    @Transactional(readOnly = true)
    public List<ScuReincidenciaResponse> execute(Long gestionId, Long docenteId) {
        TenantInfo tenant = TenantContext.getTenantInfo();
        Long tenantSedeId = (tenant != null && !tenant.isNationalScope()) ? tenant.getSedeId() : null;

        List<ReincidenciaDocente> list = this.reincidenciaRepository.findAll();

        return list.stream()
                .filter(r -> gestionId == null || r.getGestion().getId().equals(gestionId))
                .filter(r -> docenteId == null || r.getDocente().getId().equals(docenteId))
                .filter(r -> tenantSedeId == null || (r.getDocente().getSede() != null && r.getDocente().getSede().getId().equals(tenantSedeId)))
                .map(this::_mapToResponse)
                .collect(Collectors.toList());
    }

    private ScuReincidenciaResponse _mapToResponse(ReincidenciaDocente r) {
        return ScuReincidenciaResponse.builder()
                .id(r.getId())
                .docenteId(r.getDocente().getId())
                .docenteNombre(r.getDocente().getNombreCompleto())
                .gestionId(r.getGestion().getId())
                .gestionCodigo(r.getGestion().getCodigo())
                .auditoriaId(r.getAuditoria() != null ? r.getAuditoria().getId() : null)
                .nroInfraccion(r.getNroInfraccion())
                .nivel(r.getNivel())
                .motivo(r.getMotivo())
                .estado(r.getEstado())
                .planAccionId(r.getPlanAccion() != null ? r.getPlanAccion().getId() : null)
                .planCompromisoMejora(r.getPlanAccion() != null ? r.getPlanAccion().getCompromisoMejora() : null)
                .planFechaLimite(r.getPlanAccion() != null ? r.getPlanAccion().getFechaLimiteCumplimiento() : null)
                .planEstado(r.getPlanAccion() != null ? r.getPlanAccion().getEstado() : null)
                .creadoEn(r.getCreadoEn())
                .build();
    }
}
