package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.PacExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.PlanesClaseExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.ProgramaAnaliticoDocxParser;
import bo.edu.unitepc.sisa.service.command.ScuExportPacXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportPlanClasesXlsxCmd;
import bo.edu.unitepc.sisa.service.command.ScuExportProgramaDocxCmd;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for streaming official Office document exports and parsing template uploads.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/office", "/api/v1/system/office"})
public class ScuOfficeController {

    private static final Logger log = LoggerFactory.getLogger(ScuOfficeController.class);

    private final ScuExportPacXlsxCmd exportPacCmd;
    private final ScuExportPlanClasesXlsxCmd exportPlanClasesCmd;
    private final ScuExportProgramaDocxCmd exportProgramaCmd;
    private final PacExcelParser pacExcelParser;
    private final PlanesClaseExcelParser planesClaseParser;
    private final ProgramaAnaliticoDocxParser programaParser;
    private final bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory parserFactory;

    public ScuOfficeController(
            ScuExportPacXlsxCmd exportPacCmd,
            ScuExportPlanClasesXlsxCmd exportPlanClasesCmd,
            ScuExportProgramaDocxCmd exportProgramaCmd,
            PacExcelParser pacExcelParser,
            PlanesClaseExcelParser planesClaseParser,
            ProgramaAnaliticoDocxParser programaParser,
            bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory parserFactory) {
        this.exportPacCmd = exportPacCmd;
        this.exportPlanClasesCmd = exportPlanClasesCmd;
        this.exportProgramaCmd = exportProgramaCmd;
        this.pacExcelParser = pacExcelParser;
        this.planesClaseParser = planesClaseParser;
        this.programaParser = programaParser;
        this.parserFactory = parserFactory;
    }

    @GetMapping({"/export/pac/{id}", "/pac/{id}/export"})
    public ResponseEntity<byte[]> exportPac(
            @PathVariable Long id,
            @RequestParam(value = "carreraId", required = false) Long carreraId,
            @RequestParam(value = "pacType", required = false) String pacType) {
        byte[] content = this.exportPacCmd.execute(id, carreraId, pacType);
        String filename = ("PRACTICO".equalsIgnoreCase(pacType)) ? "PAC_Practico_" + id + ".xlsx" : "PAC_General_" + id + ".xlsx";
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(content);
    }

    @GetMapping({"/export/plan-clase/{sesionId}", "/plan-clase/{sesionId}/export"})
    public ResponseEntity<byte[]> exportPlanClases(@PathVariable Long sesionId) {
        byte[] content = this.exportPlanClasesCmd.execute(sesionId);
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"Plan_Clase_Sesion_" + sesionId + ".xlsx\"")
                .contentType(mediaType)
                .body(content);
    }

    @GetMapping({"/export/programa-analitico/{asignacionId}", "/programa-analitico/{asignacionId}/export"})
    public ResponseEntity<byte[]> exportProgramaDocx(
            @PathVariable Long asignacionId,
            @RequestParam(value = "carreraId", required = false) Long carreraId) {
        byte[] content = this.exportProgramaCmd.execute(asignacionId, carreraId);
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"Programa_Analitico_" + asignacionId + ".docx\"")
                .contentType(mediaType)
                .body(content);
    }

    @PostMapping(value = {"/import/cronograma", "/cronograma/import"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> importCronograma(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "pacType", required = false) String pacTypeQuery,
            @RequestHeader(value = "X-PAC-Type", required = false) String pacTypeHeader,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId) {
        try {
            Long effectiveAsignacionId = (asignacionId != null) ? asignacionId : 1L;
            String effectivePacType = (pacTypeQuery != null && !pacTypeQuery.isBlank()) ? pacTypeQuery : pacTypeHeader;
            byte[] fileBytes = file.getBytes();
            bo.edu.unitepc.sisa.infrastructure.office.strategy.PacParserStrategy strategy =
                    this.parserFactory.getPacParser(effectivePacType, fileBytes, file.getOriginalFilename());
            bo.edu.unitepc.sisa.api.request.ScuPacDto parsed =
                    strategy.parse(new java.io.ByteArrayInputStream(fileBytes), file.getOriginalFilename());
            parsed.setAsignacionId(effectiveAsignacionId);
            return ResponseEntity.ok(
                    ResourcesBuilder.of(parsed.getMatriz7() != null ? parsed.getMatriz7() : List.of())
                            .message("Cronograma Matriz 7 importado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            throw new ScuException(
                    "OFFICE_IMPORT_ERROR",
                    "Error al procesar archivo Cronograma: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    e
            );
        }
    }

    @PostMapping(value = {"/import/pac", "/pac/import"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> importPac(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "pacType", required = false) String pacTypeQuery,
            @RequestHeader(value = "X-PAC-Type", required = false) String pacTypeHeader,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId) {
        try {
            Long effectiveAsignacionId = (asignacionId != null) ? asignacionId : 1L;
            String effectivePacType = (pacTypeQuery != null && !pacTypeQuery.isBlank()) ? pacTypeQuery : pacTypeHeader;
            byte[] fileBytes = file.getBytes();
            bo.edu.unitepc.sisa.infrastructure.office.strategy.PacParserStrategy strategy =
                    this.parserFactory.getPacParser(effectivePacType, fileBytes, file.getOriginalFilename());
            bo.edu.unitepc.sisa.api.request.ScuPacDto parsed =
                    strategy.parse(new java.io.ByteArrayInputStream(fileBytes), file.getOriginalFilename());
            parsed.setAsignacionId(effectiveAsignacionId);
            return ResponseEntity.ok(
                    ResourceBuilder.of(parsed)
                            .message("Documento PAC importado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            throw new ScuException(
                    "OFFICE_IMPORT_ERROR",
                    "Error al procesar archivo PAC: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    e
            );
        }
    }

    @PostMapping(value = {"/import/plan-clase", "/plan-clase/import"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> importPlanesClase(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "planType", required = false) String planTypeQuery,
            @RequestHeader(value = "X-Plan-Type", required = false) String planTypeHeader,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId,
            @RequestParam(value = "sesionId", required = false) Long sesionId) {
        try {
            Long effectiveSesionId = (sesionId != null) ? sesionId : (asignacionId != null ? asignacionId : 1L);
            String effectivePlanType = (planTypeQuery != null && !planTypeQuery.isBlank()) ? planTypeQuery : planTypeHeader;
            byte[] fileBytes = file.getBytes();
            bo.edu.unitepc.sisa.infrastructure.office.strategy.PlanClaseParserStrategy strategy =
                    this.parserFactory.getPlanClaseParser(effectivePlanType, fileBytes, file.getOriginalFilename());
            List<bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto> planes =
                    strategy.parse(new java.io.ByteArrayInputStream(fileBytes), file.getOriginalFilename());
            for (int i = 0; i < planes.size(); i++) {
                if (planes.get(i).getSesionId() == null) {
                    planes.get(i).setSesionId(effectiveSesionId + i);
                }
            }
            return ResponseEntity.ok(
                    ResourcesBuilder.of(planes)
                            .message("Planes de clase importados exitosamente")
                            .build()
            );
        } catch (Exception e) {
            throw new ScuException(
                    "OFFICE_IMPORT_ERROR",
                    "Error al procesar archivo de Planes de Clase: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    e
            );
        }
    }

    @PostMapping(value = {"/import/programa-analitico", "/programa-analitico/import"},
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> importPrograma(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId) {
        try {
            Long effectiveAsignacionId = (asignacionId != null) ? asignacionId : 1L;
            ScuProgramaAnaliticoRequest parsed = this.programaParser.parseDocx(file.getInputStream(), effectiveAsignacionId);
            if (parsed.getUnidades() != null) {
                for (var u : parsed.getUnidades()) {
                    if (u.getTemas() == null || u.getTemas().isEmpty()) {
                        log.warn("Advertencia de importación: La unidad {} ('{}') no contiene temas extraídos.",
                                u.getNumeroUnidad(), u.getTitulo());
                    }
                }
            }
            return ResponseEntity.ok(
                    ResourceBuilder.of(parsed)
                            .message("Documento Programa Analítico importado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            throw new ScuException(
                    "OFFICE_IMPORT_ERROR",
                    "Error al procesar archivo de Programa Analítico: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST,
                    e
            );
        }
    }
}
