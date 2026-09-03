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

    public ScuOfficeController(
            ScuExportPacXlsxCmd exportPacCmd,
            ScuExportPlanClasesXlsxCmd exportPlanClasesCmd,
            ScuExportProgramaDocxCmd exportProgramaCmd,
            PacExcelParser pacExcelParser,
            PlanesClaseExcelParser planesClaseParser,
            ProgramaAnaliticoDocxParser programaParser) {
        this.exportPacCmd = exportPacCmd;
        this.exportPlanClasesCmd = exportPlanClasesCmd;
        this.exportProgramaCmd = exportProgramaCmd;
        this.pacExcelParser = pacExcelParser;
        this.planesClaseParser = planesClaseParser;
        this.programaParser = programaParser;
    }

    @GetMapping({"/export/pac/{id}", "/pac/{id}/export"})
    public ResponseEntity<byte[]> exportPac(
            @PathVariable Long id,
            @RequestParam(value = "carreraId", required = false) Long carreraId) {
        byte[] content = this.exportPacCmd.execute(id, carreraId);
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"PAC_Matriz7_" + id + ".xlsx\"")
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
    public ResponseEntity<Map<String, Object>> importCronograma(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId) {
        try {
            Long effectiveAsignacionId = (asignacionId != null) ? asignacionId : 1L;
            ScuPacRequest parsed = this.pacExcelParser.parsePac(file.getInputStream(), effectiveAsignacionId);
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
    public ResponseEntity<Map<String, Object>> importPac(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId) {
        try {
            Long effectiveAsignacionId = (asignacionId != null) ? asignacionId : 1L;
            ScuPacRequest parsed = this.pacExcelParser.parsePac(file.getInputStream(), effectiveAsignacionId);
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
    public ResponseEntity<Map<String, Object>> importPlanesClase(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "asignacionId", required = false) Long asignacionId,
            @RequestParam(value = "sesionId", required = false) Long sesionId) {
        try {
            Long effectiveSesionId = (sesionId != null) ? sesionId : (asignacionId != null ? asignacionId : 1L);
            List<ScuPlanClaseRequest> planes = this.planesClaseParser.parsePlanes(file.getInputStream(), effectiveSesionId);
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
