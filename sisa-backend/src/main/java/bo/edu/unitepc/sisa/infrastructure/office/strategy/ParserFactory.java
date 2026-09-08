package bo.edu.unitepc.sisa.infrastructure.office.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Strategy factory responsible for routing PAC and Plan de Clases parsing/generation
 * requests to the appropriate template strategy based on document or component types.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class ParserFactory {

    private static final Logger log = LoggerFactory.getLogger(ParserFactory.class);

    private final List<PacParserStrategy> pacStrategies;
    private final List<PlanClaseParserStrategy> planClaseStrategies;

    public ParserFactory(
            @Autowired(required = false) List<PacParserStrategy> pacStrategies,
            @Autowired(required = false) List<PlanClaseParserStrategy> planClaseStrategies) {
        this.pacStrategies = pacStrategies != null ? pacStrategies : Collections.emptyList();
        this.planClaseStrategies = planClaseStrategies != null ? planClaseStrategies : Collections.emptyList();
        log.info("Initialized ParserFactory with {} PAC strategies and {} PlanClase strategies",
                this.pacStrategies.size(), this.planClaseStrategies.size());
    }

    /**
     * Resolves the matching PacParserStrategy for the given pacType.
     *
     * @param pacType PAC type (e.g., "GRAL", "PRACTICO")
     * @return matching PacParserStrategy
     * @throws IllegalArgumentException if no strategy is registered for the specified type
     */
    public PacParserStrategy getPacParser(String pacType) {
        return findPacParser(pacType)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No PacParserStrategy found for pacType: " + pacType));
    }

    /**
     * Resolves PAC parser with optional pacType, falling back to auto-detection from filename/stream content.
     */
    public PacParserStrategy getPacParser(String pacType, byte[] content, String filename) {
        if (pacType != null && !pacType.isBlank()) {
            Optional<PacParserStrategy> s = findPacParser(pacType);
            if (s.isPresent()) return s.get();
        }
        return detectPacParser(content, filename);
    }

    /**
     * Auto-detects the appropriate PAC parser based on filename and workbook title inspection.
     */
    public PacParserStrategy detectPacParser(byte[] content, String filename) {
        if (filename != null) {
            String f = filename.toUpperCase();
            if (f.contains("PRACTIC")) {
                Optional<PacParserStrategy> s = findPacParser("PRACTICO");
                if (s.isPresent()) return s.get();
            } else if (f.contains("GRAL") || f.contains("GENERAL") || f.contains("TEORIC")) {
                Optional<PacParserStrategy> s = findPacParser("GRAL");
                if (s.isPresent()) return s.get();
            }
        }

        if (content != null && content.length > 0) {
            try (org.apache.poi.xssf.usermodel.XSSFWorkbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook(new java.io.ByteArrayInputStream(content))) {
                org.apache.poi.xssf.usermodel.XSSFSheet sh = wb.getSheet("PAC");
                if (sh == null && wb.getNumberOfSheets() > 0) sh = wb.getSheetAt(0);
                if (sh != null) {
                    for (int r = 0; r <= Math.min(15, sh.getLastRowNum()); r++) {
                        org.apache.poi.ss.usermodel.Row row = sh.getRow(r);
                        if (row == null) continue;
                        for (int c = 0; c < row.getLastCellNum(); c++) {
                            org.apache.poi.ss.usermodel.Cell cell = row.getCell(c);
                            if (cell != null && cell.getCellType() == org.apache.poi.ss.usermodel.CellType.STRING) {
                                String text = cell.getStringCellValue().toUpperCase();
                                if (text.contains("PROGRAMA DE ASIGNATURA PRÁCTICA") || text.contains("PROGRAMA DE ASIGNATURA PRACTICA")) {
                                    return getPacParser("PRACTICO");
                                } else if (text.contains("PROGRAMA DE ASIGNATURA")) {
                                    return getPacParser("GRAL");
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Auto-detection failed inspecting workbook: {}", e.getMessage());
            }
        }

        return getPacParser("GRAL");
    }

    /**
     * Finds the matching PacParserStrategy if one exists.
     *
     * @param pacType PAC type (e.g., "GRAL", "PRACTICO")
     * @return Optional containing matching strategy, or empty
     */
    public Optional<PacParserStrategy> findPacParser(String pacType) {
        if (pacType == null) {
            return Optional.empty();
        }
        return this.pacStrategies.stream()
                .filter(s -> s.supports(pacType))
                .findFirst();
    }

    /**
     * Resolves the matching PlanClaseParserStrategy for the given planType.
     *
     * @param planType Plan de clase type (e.g., "TEORICO", "PRACTICO", "TEORICO_PRACTICO")
     * @return matching PlanClaseParserStrategy
     * @throws IllegalArgumentException if no strategy is registered for the specified type
     */
    public PlanClaseParserStrategy getPlanClaseParser(String planType) {
        return findPlanClaseParser(planType)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No PlanClaseParserStrategy found for planType: " + planType));
    }

    /**
     * Resolves Plan de Clases parser with optional planType, falling back to auto-detection from filename/stream content.
     */
    public PlanClaseParserStrategy getPlanClaseParser(String planType, byte[] content, String filename) {
        if (planType != null && !planType.isBlank()) {
            Optional<PlanClaseParserStrategy> s = findPlanClaseParser(planType);
            if (s.isPresent()) return s.get();
        }
        return detectPlanClaseParser(content, filename);
    }

    /**
     * Auto-detects the appropriate Plan de Clases parser based on filename and sheet title inspection.
     */
    public PlanClaseParserStrategy detectPlanClaseParser(byte[] content, String filename) {
        if (filename != null) {
            String f = filename.toUpperCase();
            if (f.contains("TEORICO-PRACTICO") || f.contains("TEÓRICO-PRÁCTICO") || f.contains("TEORICO_PRACTICO") || (f.contains("TEORIC") && f.contains("PRACTIC"))) {
                Optional<PlanClaseParserStrategy> s = findPlanClaseParser("TEORICO_PRACTICO");
                if (s.isPresent()) return s.get();
            } else if (f.contains("PRACTIC")) {
                Optional<PlanClaseParserStrategy> s = findPlanClaseParser("PRACTICO");
                if (s.isPresent()) return s.get();
            } else if (f.contains("TEORIC")) {
                Optional<PlanClaseParserStrategy> s = findPlanClaseParser("TEORICO");
                if (s.isPresent()) return s.get();
            }
        }

        if (content != null && content.length > 0) {
            try (org.apache.poi.xssf.usermodel.XSSFWorkbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook(new java.io.ByteArrayInputStream(content))) {
                org.apache.poi.xssf.usermodel.XSSFSheet sh = wb.getSheetAt(0);
                if (sh != null) {
                    for (int r = 0; r <= Math.min(15, sh.getLastRowNum()); r++) {
                        org.apache.poi.ss.usermodel.Row row = sh.getRow(r);
                        if (row == null) continue;
                        for (int c = 0; c < row.getLastCellNum(); c++) {
                            org.apache.poi.ss.usermodel.Cell cell = row.getCell(c);
                            if (cell != null && cell.getCellType() == org.apache.poi.ss.usermodel.CellType.STRING) {
                                String text = cell.getStringCellValue().toUpperCase();
                                if (text.contains("PLAN DE CLASE TEÓRICO - PRÁCTICO") || text.contains("PLAN DE CLASE TEORICO - PRACTICO")
                                        || text.contains("TEÓRICO-PRÁCTICO") || text.contains("TEORICO-PRACTICO")) {
                                    return getPlanClaseParser("TEORICO_PRACTICO");
                                } else if (text.contains("PLAN DE CLASE PRÁCTICO") || text.contains("PLAN DE CLASE PRACTICO")) {
                                    return getPlanClaseParser("PRACTICO");
                                } else if (text.contains("PLAN DE CLASE TEÓRICO") || text.contains("PLAN DE CLASE TEORICO")) {
                                    return getPlanClaseParser("TEORICO");
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Auto-detection failed inspecting workbook: {}", e.getMessage());
            }
        }

        return getPlanClaseParser("TEORICO_PRACTICO");
    }

    /**
     * Finds the matching PlanClaseParserStrategy if one exists.
     *
     * @param planType Plan de clase type (e.g., "TEORICO", "PRACTICO", "TEORICO_PRACTICO")
     * @return Optional containing matching strategy, or empty
     */
    public Optional<PlanClaseParserStrategy> findPlanClaseParser(String planType) {
        if (planType == null) {
            return Optional.empty();
        }
        return this.planClaseStrategies.stream()
                .filter(s -> s.supports(planType))
                .findFirst();
    }

    public List<PacParserStrategy> getPacStrategies() {
        return Collections.unmodifiableList(pacStrategies);
    }

    public List<PlanClaseParserStrategy> getPlanClaseStrategies() {
        return Collections.unmodifiableList(planClaseStrategies);
    }
}
