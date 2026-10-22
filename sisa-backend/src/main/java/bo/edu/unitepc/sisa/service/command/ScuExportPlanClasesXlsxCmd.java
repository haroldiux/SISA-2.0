package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.OfficeTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Command for exporting official Plan de Clases to formatted XLSX workbook stream.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuExportPlanClasesXlsxCmd {

    private final PlanDeClaseRepository planRepository;
    private final OfficeTemplateService officeTemplateService;

    public ScuExportPlanClasesXlsxCmd(
            PlanDeClaseRepository planRepository,
            OfficeTemplateService officeTemplateService) {
        this.planRepository = planRepository;
        this.officeTemplateService = officeTemplateService;
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long sesionId) {
        return execute(sesionId, null, null, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long sesionId, Long carreraId, String planType) {
        return execute(sesionId, carreraId, planType, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long sesionId, Long carreraId, String planType, Map<String, String> meta) {
        PlanDeClase plan = null;
        if (sesionId != null && sesionId > 0) {
            plan = this.planRepository.findById(sesionId)
                    .or(() -> this.planRepository.findBySesionId(sesionId))
                    .orElse(null);
        }

        if (plan == null) {
            plan = new PlanDeClase();
            plan.setDuracionTotalMin(90);
        }

        try {
            return this.officeTemplateService.exportPlanClasesXlsx(plan, planType, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del Plan de Clase: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] executeFromModel(PlanDeClase plan, Long carreraId, String planType, Map<String, String> meta) {
        try {
            return this.officeTemplateService.exportPlanClasesXlsx(plan, planType, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del Plan de Clase: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] executeFromDto(bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto planDto, Long carreraId, String planType, Map<String, String> meta) {
        try {
            return this.officeTemplateService.exportPlanClasesXlsx(planDto, planType, meta);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del Plan de Clase: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
