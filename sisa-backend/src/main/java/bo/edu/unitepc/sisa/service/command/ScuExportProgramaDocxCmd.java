package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.ProgramaAnalitico;
import bo.edu.unitepc.sisa.domain.repository.ProgramaAnaliticoRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.OfficeTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Command for exporting official Programa Analitico to formatted Word DOCX document stream.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuExportProgramaDocxCmd {

    private final ProgramaAnaliticoRepository programaRepository;
    private final OfficeTemplateService officeTemplateService;

    public ScuExportProgramaDocxCmd(
            ProgramaAnaliticoRepository programaRepository,
            OfficeTemplateService officeTemplateService) {
        this.programaRepository = programaRepository;
        this.officeTemplateService = officeTemplateService;
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long asignacionId) {
        ProgramaAnalitico programa = this.programaRepository.findByAsignacionId(asignacionId)
                .orElseThrow(() -> new ScuException("PROGRAMA_NOT_FOUND", "Programa analítico no encontrado para asignación: " + asignacionId, HttpStatus.NOT_FOUND));

        try {
            return this.officeTemplateService.exportProgramaDocx(programa);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Word del Programa Analítico: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
