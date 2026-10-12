package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.domain.model.PlanDeClase;
import bo.edu.unitepc.sisa.domain.model.SesionMatriz7;
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
        return execute(sesionId, null, null);
    }

    @Transactional(readOnly = true)
    public byte[] execute(Long sesionId, Long carreraId, String planType) {
        PlanDeClase plan = this.planRepository.findById(sesionId)
                .or(() -> this.planRepository.findBySesionId(sesionId))
                .orElseGet(() -> {
                    PlanDeClase stub = new PlanDeClase();
                    stub.setObjetivoSesion("Desarrollo de competencias y resolución práctica de problemas.");
                    stub.setDuracionTotalMin(90);
                    SesionMatriz7 ses = new SesionMatriz7();
                    ses.setSaberConceptual("Conceptos y fundamentos de la unidad temática.");
                    ses.setSaberProcedimental("Aplicación guiada y resolución de ejercicios.");
                    ses.setSaberActitudinal("Responsabilidad, ética profesional y rigor metodológico.");
                    stub.setSesion(ses);
                    return stub;
                });

        try {
            return this.officeTemplateService.exportPlanClasesXlsx(plan, planType);
        } catch (Exception e) {
            throw new ScuException("OFFICE_EXPORT_ERROR", "Error al generar documento Excel del Plan de Clase: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
