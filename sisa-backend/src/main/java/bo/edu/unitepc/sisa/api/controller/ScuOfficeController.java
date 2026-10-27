package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuBibliografiaDto;
import bo.edu.unitepc.sisa.api.request.ScuPacRequest;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseRequest;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.api.request.ScuUnidadAprendizajeDto;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.domain.model.*;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.infrastructure.office.PacExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.PlanesClaseExcelParser;
import bo.edu.unitepc.sisa.infrastructure.office.ProgramaAnaliticoDocxParser;
import bo.edu.unitepc.sisa.service.command.ScuExportAsistenciaXlsxCmd;
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

import java.util.HashMap;
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
    private final ScuExportAsistenciaXlsxCmd exportAsistenciaCmd;
    private final PacExcelParser pacExcelParser;
    private final PlanesClaseExcelParser planesClaseParser;
    private final ProgramaAnaliticoDocxParser programaParser;
    private final bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory parserFactory;

    public ScuOfficeController(
            ScuExportPacXlsxCmd exportPacCmd,
            ScuExportPlanClasesXlsxCmd exportPlanClasesCmd,
            ScuExportProgramaDocxCmd exportProgramaCmd,
            ScuExportAsistenciaXlsxCmd exportAsistenciaCmd,
            PacExcelParser pacExcelParser,
            PlanesClaseExcelParser planesClaseParser,
            ProgramaAnaliticoDocxParser programaParser,
            bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory parserFactory) {
        this.exportPacCmd = exportPacCmd;
        this.exportPlanClasesCmd = exportPlanClasesCmd;
        this.exportProgramaCmd = exportProgramaCmd;
        this.exportAsistenciaCmd = exportAsistenciaCmd;
        this.pacExcelParser = pacExcelParser;
        this.planesClaseParser = planesClaseParser;
        this.programaParser = programaParser;
        this.parserFactory = parserFactory;
    }

    @RequestMapping(value = {"/export/pac", "/export/pac/{id}", "/pac/{id}/export", "/export/cronograma", "/export/cronograma/{id}"}, method = {RequestMethod.GET, RequestMethod.POST})
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")
    public ResponseEntity<byte[]> exportPac(
            @PathVariable(required = false) Long id,
            @RequestParam(value = "carreraId", required = false) Long carreraId,
            @RequestParam(value = "pacType", required = false) String pacType,
            @RequestParam(value = "codigo", required = false) String codigo,
            @RequestParam(value = "asignatura", required = false) String asignatura,
            @RequestParam(value = "docente", required = false) String docente,
            @RequestParam(value = "carrera", required = false) String carrera,
            @RequestParam(value = "semestre", required = false) String semestre,
            @RequestBody(required = false) Map<String, Object> body) {

        Map<String, String> meta = new HashMap<>();
        if (codigo != null && !codigo.isBlank()) meta.put("codigo", codigo.trim());
        if (asignatura != null && !asignatura.isBlank()) meta.put("asignatura", asignatura.trim());
        if (docente != null && !docente.isBlank()) meta.put("docente", docente.trim());
        if (carrera != null && !carrera.isBlank()) meta.put("carrera", carrera.trim());
        if (semestre != null && !semestre.isBlank()) meta.put("semestre", semestre.trim());

        byte[] content;
        if (body != null && !body.isEmpty()) {
            if (body.get("codigo") != null && !meta.containsKey("codigo")) meta.put("codigo", body.get("codigo").toString().trim());
            if (body.get("asignatura") != null && !meta.containsKey("asignatura")) meta.put("asignatura", body.get("asignatura").toString().trim());
            if (body.get("docente") != null && !meta.containsKey("docente")) meta.put("docente", body.get("docente").toString().trim());
            if (body.get("carrera") != null && !meta.containsKey("carrera")) meta.put("carrera", body.get("carrera").toString().trim());
            if (body.get("semestre") != null && !meta.containsKey("semestre")) meta.put("semestre", body.get("semestre").toString().trim());
            if (body.get("pacType") != null && pacType == null) pacType = body.get("pacType").toString();

            Pac pacModel = new Pac();
            pacModel.setPacType(pacType != null ? pacType : "GRAL");
            if (body.get("seccionesIdentificacion") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> sec = (Map<String, Object>) body.get("seccionesIdentificacion");
                pacModel.setSeccionesIdentificacion(sec);
            }
            if (body.get("sesiones") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> sesList = (List<Map<String, Object>>) body.get("sesiones");
                for (Map<String, Object> sm : sesList) {
                    SesionMatriz7 ses = new SesionMatriz7();
                    if (sm.get("semana") != null) {
                        try { ses.setSemana(Integer.parseInt(sm.get("semana").toString())); } catch (Exception ignored) {}
                    }
                    if (sm.get("nroSesion") != null) {
                        try { ses.setNroSesion(Integer.parseInt(sm.get("nroSesion").toString().replace("°", "").trim())); } catch (Exception ignored) {}
                    }
                    if (sm.get("unidadTematica") != null) ses.setUnidadTematica(sm.get("unidadTematica").toString());
                    if (sm.get("contenidoEspecifico") != null) ses.setContenidoEspecifico(sm.get("contenidoEspecifico").toString());
                    if (sm.get("saberConceptual") != null) ses.setSaberConceptual(sm.get("saberConceptual").toString());
                    if (sm.get("saberProcedimental") != null) ses.setSaberProcedimental(sm.get("saberProcedimental").toString());
                    if (sm.get("saberActitudinal") != null) ses.setSaberActitudinal(sm.get("saberActitudinal").toString());
                    if (sm.get("criterioDesempeno") != null) ses.setCriterioDesempeno(sm.get("criterioDesempeno").toString());
                    if (sm.get("evidenciaAprendizaje") != null) ses.setEvidenciaAprendizaje(sm.get("evidenciaAprendizaje").toString());
                    pacModel.getSesiones().add(ses);
                }
            }
            content = this.exportPacCmd.executeFromModel(pacModel, carreraId, pacType, meta);
        } else {
            content = this.exportPacCmd.execute(id != null ? id : 0L, carreraId, pacType, meta);
        }

        String safeCode = meta.getOrDefault("codigo", (id != null ? String.valueOf(id) : "DOC")).replaceAll("[^a-zA-Z0-9_-]", "_");
        String filename = ("PRACTICO".equalsIgnoreCase(pacType)) ? "PAC_Practico_" + safeCode + ".xlsx" : "PAC_General_" + safeCode + ".xlsx";
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(content);
    }

    @RequestMapping(value = {"/export/plan-clase", "/export/plan-clase/{sesionId}", "/plan-clase/{sesionId}/export"}, method = {RequestMethod.GET, RequestMethod.POST})
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")
    public ResponseEntity<byte[]> exportPlanClases(
            @PathVariable(required = false) Long sesionId,
            @RequestParam(value = "carreraId", required = false) Long carreraId,
            @RequestParam(value = "planType", required = false) String planType,
            @RequestParam(value = "codigo", required = false) String codigo,
            @RequestParam(value = "asignatura", required = false) String asignatura,
            @RequestParam(value = "docente", required = false) String docente,
            @RequestParam(value = "carrera", required = false) String carrera,
            @RequestParam(value = "semestre", required = false) String semestre,
            @RequestBody(required = false) Map<String, Object> body) {

        Map<String, String> meta = new HashMap<>();
        if (codigo != null && !codigo.isBlank()) meta.put("codigo", codigo.trim());
        if (asignatura != null && !asignatura.isBlank()) meta.put("asignatura", asignatura.trim());
        if (docente != null && !docente.isBlank()) meta.put("docente", docente.trim());
        if (carrera != null && !carrera.isBlank()) meta.put("carrera", carrera.trim());
        if (semestre != null && !semestre.isBlank()) meta.put("semestre", semestre.trim());

        byte[] content;
        if (body != null && !body.isEmpty()) {
            if (body.get("codigo") != null && !meta.containsKey("codigo")) meta.put("codigo", body.get("codigo").toString().trim());
            if (body.get("asignatura") != null && !meta.containsKey("asignatura")) meta.put("asignatura", body.get("asignatura").toString().trim());
            if (body.get("docente") != null && !meta.containsKey("docente")) meta.put("docente", body.get("docente").toString().trim());
            if (body.get("carrera") != null && !meta.containsKey("carrera")) meta.put("carrera", body.get("carrera").toString().trim());
            if (body.get("semestre") != null && !meta.containsKey("semestre")) meta.put("semestre", body.get("semestre").toString().trim());
            if (body.get("planType") != null && planType == null) planType = body.get("planType").toString();

            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto planDto = mapper.convertValue(body, bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto.class);
                if (planDto.getNombreDocente() == null && meta.containsKey("docente")) planDto.setNombreDocente(meta.get("docente"));
                if (planDto.getNombreAsignatura() == null && meta.containsKey("asignatura")) planDto.setNombreAsignatura(meta.get("asignatura"));
                if (planDto.getCarrera() == null && meta.containsKey("carrera")) planDto.setCarrera(meta.get("carrera"));
                if (planDto.getSemestre() == null && meta.containsKey("semestre")) planDto.setSemestre(meta.get("semestre"));
                content = this.exportPlanClasesCmd.executeFromDto(planDto, carreraId, planType, meta);
            } catch (Exception ex) {
                PlanDeClase planModel = new PlanDeClase();
                if (body.get("objetivoSesion") != null) planModel.setObjetivoSesion(body.get("objetivoSesion").toString());
                if (body.get("duracionTotalMin") != null) {
                    try { planModel.setDuracionTotalMin(Integer.parseInt(body.get("duracionTotalMin").toString())); } catch (Exception ignored) {}
                }
                content = this.exportPlanClasesCmd.executeFromModel(planModel, carreraId, planType, meta);
            }
        } else {
            content = this.exportPlanClasesCmd.execute(sesionId != null ? sesionId : 0L, carreraId, planType, meta);
        }

        String safeCode = meta.getOrDefault("codigo", (sesionId != null ? String.valueOf(sesionId) : "DOC")).replaceAll("[^a-zA-Z0-9_-]", "_");
        String filename = ("PRACTICO".equalsIgnoreCase(planType))
                ? "Plan_Clase_Practico_" + safeCode + ".xlsx"
                : "Plan_Clase_Teorico_" + safeCode + ".xlsx";
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(content);
    }

    @RequestMapping(value = {"/export/programa-analitico", "/export/programa-analitico/{asignacionId}", "/programa-analitico/{asignacionId}/export"}, method = {RequestMethod.GET, RequestMethod.POST})
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL', 'ROLE_ADMIN')")
    public ResponseEntity<byte[]> exportProgramaDocx(
            @PathVariable(required = false) Long asignacionId,
            @RequestParam(value = "carreraId", required = false) Long carreraId,
            @RequestParam(value = "codigo", required = false) String codigo,
            @RequestParam(value = "asignatura", required = false) String asignatura,
            @RequestParam(value = "docente", required = false) String docente,
            @RequestParam(value = "carrera", required = false) String carrera,
            @RequestParam(value = "semestre", required = false) String semestre,
            @RequestParam(value = "creditos", required = false) String creditos,
            @RequestParam(value = "horasTeoricas", required = false) String horasTeoricas,
            @RequestParam(value = "horasPracticas", required = false) String horasPracticas,
            @RequestBody(required = false) ScuProgramaAnaliticoRequest request) {

        Map<String, String> meta = new HashMap<>();
        if (codigo != null && !codigo.isBlank()) meta.put("codigo", codigo.trim());
        if (asignatura != null && !asignatura.isBlank()) meta.put("asignatura", asignatura.trim());
        if (docente != null && !docente.isBlank()) meta.put("docente", docente.trim());
        if (carrera != null && !carrera.isBlank()) meta.put("carrera", carrera.trim());
        if (semestre != null && !semestre.isBlank()) meta.put("semestre", semestre.trim());
        if (creditos != null && !creditos.isBlank()) meta.put("creditos", creditos.trim());
        if (horasTeoricas != null && !horasTeoricas.isBlank()) meta.put("horasTeoricas", horasTeoricas.trim());
        if (horasPracticas != null && !horasPracticas.isBlank()) meta.put("horasPracticas", horasPracticas.trim());

        byte[] content;
        if (request != null) {
            if (request.getCodigoAsignatura() != null && !meta.containsKey("codigo")) meta.put("codigo", request.getCodigoAsignatura().trim());
            if (request.getNombreAsignatura() != null && !meta.containsKey("asignatura")) meta.put("asignatura", request.getNombreAsignatura().trim());
            if (request.getSemestre() != null && !meta.containsKey("semestre")) meta.put("semestre", request.getSemestre().trim());
            if (request.getCreditos() != null && !meta.containsKey("creditos")) meta.put("creditos", String.valueOf(request.getCreditos()));
            if (request.getHorasTeoricas() != null && !meta.containsKey("horasTeoricas")) meta.put("horasTeoricas", String.valueOf(request.getHorasTeoricas()));
            if (request.getHorasPracticas() != null && !meta.containsKey("horasPracticas")) meta.put("horasPracticas", String.valueOf(request.getHorasPracticas()));

            ProgramaAnalitico p = new ProgramaAnalitico();
            p.setCaracterizacion(request.getCaracterizacion());
            p.setMacroCompetencia(request.getMacroCompetencia());
            p.setSistemaEvaluacion(request.getSistemaEvaluacion());
            if (request.getUnidades() != null) {
                for (ScuUnidadAprendizajeDto uDto : request.getUnidades()) {
                    UnidadAprendizaje u = new UnidadAprendizaje();
                    u.setNumeroUnidad(uDto.getNumeroUnidad());
                    u.setTitulo(uDto.getTitulo());
                    u.setSaberesConceptuales(uDto.getSaberesConceptuales());
                    u.setSaberesProcedimentales(uDto.getSaberesProcedimentales());
                    u.setSaberesActitudinales(uDto.getSaberesActitudinales());
                    u.setCriteriosDesempeno(uDto.getCriteriosDesempeno());
                    p.getUnidades().add(u);
                }
            }
            if (request.getBibliografia() != null) {
                for (ScuBibliografiaDto bDto : request.getBibliografia()) {
                    Bibliografia b = new Bibliografia();
                    b.setTipo(bDto.getTipo());
                    b.setCitaApa(bDto.getCitaApa());
                    b.setAutor(bDto.getAutor());
                    b.setAnio(bDto.getAnio());
                    b.setTitulo(bDto.getTitulo());
                    p.getBibliografia().add(b);
                }
            }
            content = this.exportProgramaCmd.executeFromModel(p, carreraId, meta);
        } else {
            content = this.exportProgramaCmd.execute(asignacionId != null ? asignacionId : 0L, carreraId, meta);
        }

        String safeCode = meta.getOrDefault("codigo", (asignacionId != null ? String.valueOf(asignacionId) : "DOC")).replaceAll("[^a-zA-Z0-9_-]", "_");
        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"Programa_Analitico_" + safeCode + ".docx\"")
                .contentType(mediaType)
                .body(content);
    }

    @GetMapping({"/export/asistencia", "/asistencia/export"})
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")
    public ResponseEntity<byte[]> exportAsistencia(
            @RequestParam("materiaCodigo") String materiaCodigo,
            @RequestParam(value = "gestionCodigo", defaultValue = "2-2026") String gestionCodigo,
            @RequestParam(value = "docente", required = false) String docente) {

        byte[] content = this.exportAsistenciaCmd.execute(materiaCodigo, gestionCodigo, docente);
        String safeCode = materiaCodigo.replaceAll("[^a-zA-Z0-9_-]", "_");
        String safeGestion = gestionCodigo.replaceAll("[^a-zA-Z0-9_-]", "_");
        String filename = "Asistencia_" + safeCode + "_" + safeGestion + ".xlsx";

        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(content);
    }

    @PostMapping(value = {"/import/cronograma", "/cronograma/import"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")
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
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")
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
    @PreAuthorize("hasAnyRole('ROLE_DOCENTE', 'ROLE_DIR_CARRERA', 'ROLE_ADMIN')")
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
    @PreAuthorize("hasAnyRole('ROLE_DIR_CARRERA', 'ROLE_DIR_ACADEMICA', 'ROLE_ADMIN')")
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
