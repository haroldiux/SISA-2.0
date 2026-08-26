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
        Pac pac = this.pacRepository.findById(pacId)
                .orElseThrow(() -> new ScuException("PAC_NOT_FOUND", "PAC no encontrado con ID: " + pacId, HttpStatus.NOT_FOUND));

        try {
            return this.officeTemplateService.exportPacXlsx(pac);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del PAC: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
