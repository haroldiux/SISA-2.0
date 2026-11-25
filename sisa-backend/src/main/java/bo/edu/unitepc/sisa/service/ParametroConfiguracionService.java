package bo.edu.unitepc.sisa.service;

import bo.edu.unitepc.sisa.api.dto.ParametroConfiguracionDto;
import bo.edu.unitepc.sisa.api.request.GuardarParametroRequest;
import bo.edu.unitepc.sisa.domain.enums.NivelParametro;
import bo.edu.unitepc.sisa.domain.model.ParametroConfiguracion;
import bo.edu.unitepc.sisa.domain.repository.ParametroConfiguracionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing hierarchical parameter configurations (CARRERA -> SEDE -> GLOBAL).
 * Implements the Cascading Policy Resolution Pattern.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ParametroConfiguracionService {

    private final ParametroConfiguracionRepository repository;

    public ParametroConfiguracionService(ParametroConfiguracionRepository repository) {
        this.repository = repository;
    }

    /**
     * Resolves the effective parameters applying strict cascading inheritance:
     * 1. Check if Carrera has a specific override.
     * 2. If not, check if Sede has a specific override.
     * 3. If not, fallback to Global Institutional configuration.
     */
    @Transactional(readOnly = true)
    public ParametroConfiguracionDto resolveEffectiveConfig(String carreraCodigo, String sedeCodigo) {
        // 1. Try Carrera level override
        if (carreraCodigo != null && !carreraCodigo.isBlank()) {
            String cleanCarrera = carreraCodigo.trim().toUpperCase();
            Optional<ParametroConfiguracion> carreraConfig =
                    this.repository.findByNivelAndCodigoAmbito(NivelParametro.CARRERA, cleanCarrera);
            if (carreraConfig.isPresent()) {
                return mapToDto(carreraConfig.get(), "CARRERA", true);
            }
        }

        // 2. Try Sede level override
        if (sedeCodigo != null && !sedeCodigo.isBlank()) {
            String cleanSede = sedeCodigo.trim().toUpperCase();
            Optional<ParametroConfiguracion> sedeConfig =
                    this.repository.findByNivelAndCodigoAmbito(NivelParametro.SEDE, cleanSede);
            if (sedeConfig.isPresent()) {
                return mapToDto(sedeConfig.get(), "SEDE", true);
            }
        }

        // 3. Fallback to Global Institutional level
        Optional<ParametroConfiguracion> globalConfig =
                this.repository.findByNivelAndCodigoAmbito(NivelParametro.GLOBAL, "GLOBAL");
        if (globalConfig.isPresent()) {
            return mapToDto(globalConfig.get(), "GLOBAL", false);
        }

        // 4. Default in-memory fallback if database has not been seeded yet
        return defaultInstitutionalFallback();
    }

    @Transactional(readOnly = true)
    public Optional<ParametroConfiguracionDto> getConfigByScope(NivelParametro nivel, String codigoAmbito) {
        String cleanCode = (codigoAmbito != null && !codigoAmbito.isBlank())
                ? codigoAmbito.trim().toUpperCase()
                : (nivel == NivelParametro.GLOBAL ? "GLOBAL" : "");

        return this.repository.findByNivelAndCodigoAmbito(nivel, cleanCode)
                .map(entity -> mapToDto(entity, nivel.name(), nivel != NivelParametro.GLOBAL));
    }

    @Transactional(readOnly = true)
    public List<ParametroConfiguracionDto> listByNivel(NivelParametro nivel) {
        return this.repository.findByNivelOrderByCodigoAmbitoAsc(nivel)
                .stream()
                .map(entity -> mapToDto(entity, nivel.name(), nivel != NivelParametro.GLOBAL))
                .collect(Collectors.toList());
    }

    @Transactional
    public ParametroConfiguracionDto saveConfig(GuardarParametroRequest request, String username) {
        String cleanCode = (request.getCodigoAmbito() != null && !request.getCodigoAmbito().isBlank())
                ? request.getCodigoAmbito().trim().toUpperCase()
                : "GLOBAL";

        ParametroConfiguracion entity = this.repository
                .findByNivelAndCodigoAmbito(request.getNivel(), cleanCode)
                .orElseGet(() -> {
                    ParametroConfiguracion neu = new ParametroConfiguracion();
                    neu.setNivel(request.getNivel());
                    neu.setCodigoAmbito(cleanCode);
                    return neu;
                });

        entity.setNombreAmbito(request.getNombreAmbito());
        entity.setAsistenciaMinimaPct(request.getAsistenciaMinimaPct());
        entity.setAsistenciaAlertaPct(request.getAsistenciaAlertaPct());
        entity.setFaltasConsecutivasAlerta(request.getFaltasConsecutivasAlerta());
        entity.setSemaforoVerdePct(request.getSemaforoVerdePct());
        entity.setSemaforoAmarilloPct(request.getSemaforoAmarilloPct());
        entity.setHorasGraciaRegistroDocente(request.getHorasGraciaRegistroDocente());
        entity.setSesionesSinAsentarAlerta(request.getSesionesSinAsentarAlerta());
        entity.setObservaciones(request.getObservaciones());
        entity.setUpdatedBy((username != null && !username.isBlank()) ? username : "ADMIN");
        entity.setUpdatedAt(LocalDateTime.now());

        ParametroConfiguracion saved = this.repository.save(entity);
        return mapToDto(saved, request.getNivel().name(), request.getNivel() != NivelParametro.GLOBAL);
    }

    @Transactional
    public boolean deleteConfig(NivelParametro nivel, String codigoAmbito) {
        if (nivel == NivelParametro.GLOBAL) {
            throw new IllegalArgumentException("No se puede eliminar la configuracion institucional base GLOBAL");
        }
        String cleanCode = codigoAmbito.trim().toUpperCase();
        Optional<ParametroConfiguracion> existing = this.repository.findByNivelAndCodigoAmbito(nivel, cleanCode);
        if (existing.isPresent()) {
            this.repository.delete(existing.get());
            return true;
        }
        return false;
    }

    private ParametroConfiguracionDto mapToDto(
            ParametroConfiguracion entity,
            String fuenteHerencia,
            boolean esSobreescritura) {
        return ParametroConfiguracionDto.builder()
                .id(entity.getId())
                .nivel(entity.getNivel())
                .codigoAmbito(entity.getCodigoAmbito())
                .nombreAmbito(entity.getNombreAmbito())
                .asistenciaMinimaPct(entity.getAsistenciaMinimaPct())
                .asistenciaAlertaPct(entity.getAsistenciaAlertaPct())
                .faltasConsecutivasAlerta(entity.getFaltasConsecutivasAlerta())
                .semaforoVerdePct(entity.getSemaforoVerdePct())
                .semaforoAmarilloPct(entity.getSemaforoAmarilloPct())
                .horasGraciaRegistroDocente(entity.getHorasGraciaRegistroDocente())
                .sesionesSinAsentarAlerta(entity.getSesionesSinAsentarAlerta())
                .observaciones(entity.getObservaciones())
                .fuenteHerencia(fuenteHerencia)
                .esSobreescritura(esSobreescritura)
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }

    private ParametroConfiguracionDto defaultInstitutionalFallback() {
        return ParametroConfiguracionDto.builder()
                .id(0L)
                .nivel(NivelParametro.GLOBAL)
                .codigoAmbito("GLOBAL")
                .nombreAmbito("Configuración Base Institucional UNITEPC (Fallback)")
                .asistenciaMinimaPct(new BigDecimal("80.00"))
                .asistenciaAlertaPct(new BigDecimal("85.00"))
                .faltasConsecutivasAlerta(2)
                .semaforoVerdePct(new BigDecimal("-10.00"))
                .semaforoAmarilloPct(new BigDecimal("-25.00"))
                .horasGraciaRegistroDocente(2)
                .sesionesSinAsentarAlerta(2)
                .observaciones("Valores predeterminados del reglamento UNITEPC")
                .fuenteHerencia("GLOBAL")
                .esSobreescritura(false)
                .updatedAt(LocalDateTime.now())
                .updatedBy("SYSTEM")
                .build();
    }
}
