package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.Pac;
import bo.edu.unitepc.sisa.domain.repository.PacRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.OfficeTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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
        return execute(pacId, null, null, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long pacId, Long carreraId) {
        return execute(pacId, carreraId, null, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long pacId, Long carreraId, String pacType) {
        return execute(pacId, carreraId, pacType, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long pacId, Long carreraId, String pacType, Map<String, String> meta) {
        Pac pac = null;
        if (pacId != null && pacId > 0) {
            pac = this.pacRepository.findById(pacId)
                    .or(() -> this.pacRepository.findByAsignacionId(pacId))
                    .orElse(null);
        }

        if (pac == null) {
            pac = new Pac();
            pac.setPacType(pacType != null ? pacType : "GRAL");
        }

        try {
            return this.officeTemplateService.exportPacXlsx(pac, carreraId, pacType, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del PAC: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] executeFromModel(Pac pac, Long carreraId, String pacType, Map<String, String> meta) {
        try {
            return this.officeTemplateService.exportPacXlsx(pac, carreraId, pacType, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del PAC: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
