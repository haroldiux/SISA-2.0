package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.ProgramaAnalitico;
import bo.edu.unitepc.sisa.domain.repository.ProgramaAnaliticoRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.OfficeTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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
        return execute(asignacionId, null, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long asignacionId, Long carreraId) {
        return execute(asignacionId, carreraId, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long asignacionId, Long carreraId, Map<String, String> meta) {
        ProgramaAnalitico programa = null;
        if (asignacionId != null && asignacionId > 0) {
            programa = this.programaRepository.findByAsignacionId(asignacionId)
                    .or(() -> this.programaRepository.findById(asignacionId))
                    .orElse(null);
        }

        if (programa == null) {
            programa = new ProgramaAnalitico();
            programa.setCaracterizacion("");
            programa.setMacroCompetencia("");
            programa.setSistemaEvaluacion("");
        }

        try {
            return this.officeTemplateService.exportProgramaDocx(programa, carreraId, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Word del Programa Analítico: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] executeFromModel(ProgramaAnalitico programa, Long carreraId, Map<String, String> meta) {
        try {
            return this.officeTemplateService.exportProgramaDocx(programa, carreraId, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Word del Programa Analítico: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
