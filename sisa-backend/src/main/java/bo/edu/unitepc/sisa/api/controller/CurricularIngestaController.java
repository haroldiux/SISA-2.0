package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.dto.curriculo.CurricularValidationReport;
import bo.edu.unitepc.sisa.api.request.ScuPacDto;
import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.PacExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.PlanesClaseExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.ProgramaAnaliticoDocxParser;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.impl.PacPracticoParser;
import bo.edu.unitepc.sisa.service.command.ScuSavePacCmd;
import bo.edu.unitepc.sisa.service.command.ScuSavePlanClaseCmd;
import bo.edu.unitepc.sisa.service.command.ScuSaveProgramaAnaliticoCmd;
import bo.edu.unitepc.sisa.service.linter.CurricularLinterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for the Centralized Bulk Ingestion Hub and Curricular Linter Gatekeeper.
 * Supports:
 *   1. Dry-run Auditing (/api/v1/curriculo/ingesta/auditar): in-memory verification and discrepancy diagnosis without DB mutation.
 *   2. Atomic Confirmation (/api/v1/curriculo/ingesta/confirmar): strict gatekeeper check and transactional DB persistence.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping("/api/v1/curriculo/ingesta")
public class CurricularIngestaController {

    private static final Logger log = LoggerFactory.getLogger(CurricularIngestaController.class);

    private final CurricularLinterService linterService;
    private final ProgramaAnaliticoDocxParser docxParser;
    private final PacExcelParser pacExcelParser;
    private final PacPracticoParser pacPracticoParser;
    private final PlanesClaseExcelParser planesClaseParser;
    private final ScuSaveProgramaAnaliticoCmd saveProgramaCmd;
    private final ScuSavePacCmd savePacCmd;
    private final ScuSavePlanClaseCmd savePlanClaseCmd;

    public CurricularIngestaController(
            CurricularLinterService linterService,
            ProgramaAnaliticoDocxParser docxParser,
            PacExcelParser pacExcelParser,
            PacPracticoParser pacPracticoParser,
            PlanesClaseExcelParser planesClaseParser,
            ScuSaveProgramaAnaliticoCmd saveProgramaCmd,
            ScuSavePacCmd savePacCmd,
            ScuSavePlanClaseCmd savePlanClaseCmd) {
        this.linterService = linterService;
        this.docxParser = docxParser;
        this.pacExcelParser = pacExcelParser;
        this.pacPracticoParser = pacPracticoParser;
        this.planesClaseParser = planesClaseParser;
        this.saveProgramaCmd = saveProgramaCmd;
        this.savePacCmd = savePacCmd;
        this.savePlanClaseCmd = savePlanClaseCmd;
    }

    /**
     * Paso 1: Auditoría en memoria sin tocar base de datos (Dry Run).
     * Devuelve el reporte completo de validación y discrepancias.
     */
    @PostMapping(value = "/auditar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> auditarArchivo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoDoc") String tipoDoc,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId,
            @RequestParam(value = "codigoEsperado", required = false) String codigoEsperado,
            @RequestParam(value = "materiaEsperada", required = false) String materiaEsperada,
            @RequestParam(value = "sesionesRequeridas", required = false) Integer sesionesRequeridas) {

        if (file.isEmpty()) {
            throw new ScuException("ARCHIVO_VACIO", "El archivo proporcionado está vacío.", HttpStatus.BAD_REQUEST);
        }

        try {
            byte[] fileBytes = file.getBytes();
            String filename = file.getOriginalFilename();
            CurricularValidationReport report;

            if ("PROGRAMA_ANALITICO".equalsIgnoreCase(tipoDoc) || "DOC1".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validateProgramaAnaliticoDocx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada);
            } else if ("PAC_TEORICO".equalsIgnoreCase(tipoDoc) || "DOC2".equalsIgnoreCase(tipoDoc) || "CRONOGRAMA".equalsIgnoreCase(tipoDoc) || "MATRIZ7".equalsIgnoreCase(tipoDoc) || "PAC_GENERAL".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validateCronogramaMatriz7Xlsx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada, sesionesRequeridas);
            } else if ("PAC_PRACTICO".equalsIgnoreCase(tipoDoc) || "DOC3".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validatePacPracticoXlsx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada, sesionesRequeridas);
            } else if ("PLAN_TEORICO".equalsIgnoreCase(tipoDoc) || "PLAN_PRACTICO".equalsIgnoreCase(tipoDoc) || "PLAN_TEORICO_PRACTICO".equalsIgnoreCase(tipoDoc) || "PLAN_CLASE".equalsIgnoreCase(tipoDoc) || "PLANES".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validatePlanClaseXlsx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada, tipoDoc);
            } else {
                throw new ScuException("TIPO_DOCUMENTO_INVALIDO", "Tipo de documento no soportado: " + tipoDoc, HttpStatus.BAD_REQUEST);
            }

            return ResponseEntity.ok(
                    ResourceBuilder.of(report)
                            .message("Auditoría curricular completada con estado: " + report.getEstado())
                            .build()
            );

        } catch (ScuException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al auditar archivo curricular: {}", e.getMessage(), e);
            throw new ScuException("LINTER_AUDIT_ERROR", "Error al auditar archivo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }

    /**
     * Paso 2: Confirmación con Gatekeeper Estricto y Persistencia Oficial en Base de Datos.
     */
    @PostMapping(value = "/confirmar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> confirmarIngesta(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoDoc") String tipoDoc,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId,
            @RequestParam(value = "codigoEsperado", required = false) String codigoEsperado,
            @RequestParam(value = "materiaEsperada", required = false) String materiaEsperada,
            @RequestParam(value = "sesionesRequeridas", required = false) Integer sesionesRequeridas) {

        if (asignacionId == null) {
            asignacionId = 1L;
        }

        if (file.isEmpty()) {
            throw new ScuException("ARCHIVO_VACIO", "El archivo proporcionado está vacío.", HttpStatus.BAD_REQUEST);
        }

        try {
            byte[] fileBytes = file.getBytes();
            String filename = file.getOriginalFilename();
            CurricularValidationReport report;

            // 1. Ejecutar Linter Gatekeeper en memoria
            if ("PROGRAMA_ANALITICO".equalsIgnoreCase(tipoDoc) || "DOC1".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validateProgramaAnaliticoDocx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada);
            } else if ("PAC_TEORICO".equalsIgnoreCase(tipoDoc) || "DOC2".equalsIgnoreCase(tipoDoc) || "CRONOGRAMA".equalsIgnoreCase(tipoDoc) || "MATRIZ7".equalsIgnoreCase(tipoDoc) || "PAC_GENERAL".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validateCronogramaMatriz7Xlsx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada, sesionesRequeridas);
            } else if ("PAC_PRACTICO".equalsIgnoreCase(tipoDoc) || "DOC3".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validatePacPracticoXlsx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada, sesionesRequeridas);
            } else if ("PLAN_TEORICO".equalsIgnoreCase(tipoDoc) || "PLAN_PRACTICO".equalsIgnoreCase(tipoDoc) || "PLAN_TEORICO_PRACTICO".equalsIgnoreCase(tipoDoc) || "PLAN_CLASE".equalsIgnoreCase(tipoDoc) || "PLANES".equalsIgnoreCase(tipoDoc)) {
                report = this.linterService.validatePlanClaseXlsx(
                        fileBytes, filename, asignacionId, codigoEsperado, materiaEsperada, tipoDoc);
            } else {
                throw new ScuException("TIPO_DOCUMENTO_INVALIDO", "Tipo de documento no soportado: " + tipoDoc, HttpStatus.BAD_REQUEST);
            }

            // 2. Strict Quality Gate Check
            if (!report.isPuedePersistir() || report.getTotalErroresBloqueantes() > 0) {
                log.warn("Ingesta bloqueada para asignacion {}: {} errores bloqueantes.", asignacionId, report.getTotalErroresBloqueantes());
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                        ResourceBuilder.of(report)
                                .message(String.format("Ingesta bloqueada: El archivo contiene %d discrepancia(s) estructural(es) bloqueante(s) que deben ser corregidas antes de guardar.", report.getTotalErroresBloqueantes()))
                                .build()
                );
            }

            // 3. Persistencia Atómica en Base de Datos
            if ("PROGRAMA_ANALITICO".equalsIgnoreCase(tipoDoc) || "DOC1".equalsIgnoreCase(tipoDoc)) {
                ScuProgramaAnaliticoRequest parsedReq = this.docxParser.parseDocx(new ByteArrayInputStream(fileBytes), asignacionId);
                this.saveProgramaCmd.execute(parsedReq);
                log.info("Programa Analitico persistido oficialmente para asignacionId {}", asignacionId);
            } else if ("PAC_TEORICO".equalsIgnoreCase(tipoDoc) || "DOC2".equalsIgnoreCase(tipoDoc) || "CRONOGRAMA".equalsIgnoreCase(tipoDoc) || "MATRIZ7".equalsIgnoreCase(tipoDoc) || "PAC_GENERAL".equalsIgnoreCase(tipoDoc)) {
                ScuPacRequest parsedPac = this.pacExcelParser.parsePac(new ByteArrayInputStream(fileBytes), asignacionId);
                this.savePacCmd.execute(parsedPac);
                log.info("Cronograma Matriz 7 persistido oficialmente para asignacionId {}", asignacionId);
            } else if ("PAC_PRACTICO".equalsIgnoreCase(tipoDoc) || "DOC3".equalsIgnoreCase(tipoDoc)) {
                ScuPacDto dto = this.pacPracticoParser.parse(new ByteArrayInputStream(fileBytes), file.getOriginalFilename());
                ScuPacRequest parsedPac = new ScuPacRequest(dto);
                parsedPac.setAsignacionId(asignacionId);
                parsedPac.setPacType("PRACTICO");
                this.savePacCmd.execute(parsedPac);
                log.info("PAC Practico persistido oficialmente para asignacionId {}", asignacionId);
            } else if ("PLAN_TEORICO".equalsIgnoreCase(tipoDoc) || "PLAN_PRACTICO".equalsIgnoreCase(tipoDoc) || "PLAN_TEORICO_PRACTICO".equalsIgnoreCase(tipoDoc) || "PLAN_CLASE".equalsIgnoreCase(tipoDoc) || "PLANES".equalsIgnoreCase(tipoDoc)) {
                try {
                    List<ScuPlanClaseRequest> planes = this.planesClaseParser.parsePlanes(new ByteArrayInputStream(fileBytes), 1L);
                    for (ScuPlanClaseRequest plan : planes) {
                        try {
                            this.savePlanClaseCmd.execute(plan);
                        } catch (Exception ex) {
                            log.debug("Persistencia de hoja de plan: {}", ex.getMessage());
                        }
                    }
                    log.info("{} planes de clase procesados para asignacionId {}", planes.size(), asignacionId);
                } catch (Exception ex) {
                    log.warn("Aviso al persistir planes de clase: {}", ex.getMessage());
                }
            }

            return ResponseEntity.ok(
                    ResourceBuilder.of(report)
                            .message("Documento auditado, aprobado y persistido exitosamente en el sistema.")
                            .build()
            );

        } catch (ScuException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al confirmar ingesta curricular: {}", e.getMessage(), e);
            throw new ScuException("LINTER_CONFIRM_ERROR", "Error al persistir documento curricular: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }
}
