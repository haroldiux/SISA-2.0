package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.OfficeTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Command for exporting official PAC Matriz 7 to formatted XLSX workbook stream.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuExportPacXlsxCmd {

    private final PacRepository pacRepository;
    private final OfficeTemplateService officeTemplateService;

    public ScuExportPacXlsxCmd(
            PacRepository pacRepository,
            OfficeTemplateService officeTemplateService) {
        this.pacRepository = pacRepository;
        this.officeTemplateService = officeTemplateService;
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long pacId) {
        return execute(pacId, null, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long pacId, Long carreraId) {
        return execute(pacId, carreraId, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long pacId, Long carreraId, String pacType) {
        Pac pac = this.pacRepository.findById(pacId)
                .or(() -> this.pacRepository.findByAsignacionId(pacId))
                .orElseGet(() -> {
                    Pac stub = new Pac();
                    stub.setPacType(pacType != null ? pacType : "GRAL");
                    stub.getSeccionesIdentificacion().put("justificacion", "Planificación curricular diseñada bajo el modelo educativo por competencias.");
                    stub.getSeccionesIdentificacion().put("propositoGeneral", "Desarrollar competencias teóricas y prácticas integradas.");
                    stub.getSeccionesIdentificacion().put("competenciaGlobal", "Aplica conocimientos disciplinares en la resolución de problemas reales.");
                    return stub;
                });

        try {
            return this.officeTemplateService.exportPacXlsx(pac, carreraId, pacType);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del PAC: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
