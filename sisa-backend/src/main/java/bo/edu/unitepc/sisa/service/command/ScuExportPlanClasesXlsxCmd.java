package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.repository.PlanDeClaseRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.OfficeTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        PlanDeClase plan = this.planRepository.findBySesionId(sesionId)
                .orElseThrow(() -> new ScuException("PLAN_NOT_FOUND", "Plan de clase no encontrado para sesión: " + sesionId, HttpStatus.NOT_FOUND));

        try {
            return this.officeTemplateService.exportPlanClasesXlsx(plan);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del Plan de Clase: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
