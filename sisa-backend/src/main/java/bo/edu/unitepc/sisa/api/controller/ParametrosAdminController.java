package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.dto.ParametroConfiguracionDto;
import bo.edu.unitepc.sisa.api.request.GuardarParametroRequest;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.domain.enums.NivelParametro;
import bo.edu.unitepc.sisa.service.ParametroConfiguracionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing hierarchical institutional parameters, attendance rules,
 * and curricular traffic light thresholds.
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/admin/parametros", "/api/v1/system/parametros"})
public class ParametrosAdminController {

    private final ParametroConfiguracionService service;

    public ParametrosAdminController(ParametroConfiguracionService service) {
        this.service = service;
    }

    /**
     * Resolves effective parameters applying cascading inheritance:
     * Carrera -> Sede -> Global.
     */
    @GetMapping("/efectivo")
    public ResponseEntity<Map<String, Object>> getEffectiveConfig(
            @RequestParam(required = false) String carreraCodigo,
            @RequestParam(required = false) String sedeCodigo) {

        ParametroConfiguracionDto dto = this.service.resolveEffectiveConfig(carreraCodigo, sedeCodigo);
        return ResponseEntity.ok(
                ResourceBuilder.of(dto)
                        .message("Parametros efectivos calculados exitosamente con resolucion jerarquica")
                        .build()
        );
    }

    /**
     * Retrieves the specific configuration for an explicit scope.
     */
    @GetMapping("/scope/{nivel}/{codigoAmbito}")
    public ResponseEntity<Map<String, Object>> getConfigByScope(
            @PathVariable NivelParametro nivel,
            @PathVariable String codigoAmbito) {

        return this.service.getConfigByScope(nivel, codigoAmbito)
                .map(dto -> ResponseEntity.ok(
                        ResourceBuilder.of(dto)
                                .message("Configuracion obtenida para el ambito " + codigoAmbito)
                                .build()
                ))
                .orElseGet(() -> ResponseEntity.ok(
                        ResourceBuilder.<ParametroConfiguracionDto>of(null)
                                .message("No existe sobreescritura especifica para el ambito solicitado; aplica herencia")
                                .build()
                ));
    }

    /**
     * Lists all custom overrides registered for a given hierarchy level.
     */
    @GetMapping("/list/{nivel}")
    public ResponseEntity<Map<String, Object>> listByNivel(
            @PathVariable NivelParametro nivel) {

        List<ParametroConfiguracionDto> list = this.service.listByNivel(nivel);
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de configuraciones obtenido exitosamente para nivel " + nivel)
                        .build()
        );
    }

    /**
     * Creates or updates a parameter configuration for a scope (Restricted to ROLE_ADMIN).
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> saveConfig(
            @Valid @RequestBody GuardarParametroRequest request,
            Authentication authentication) {

        String username = (authentication != null) ? authentication.getName() : "ADMIN";
        ParametroConfiguracionDto saved = this.service.saveConfig(request, username);

        return ResponseEntity.ok(
                ResourceBuilder.of(saved)
                        .message("Parametros institucionales guardados exitosamente para el ambito " + request.getCodigoAmbito())
                        .build()
        );
    }

    /**
     * Deletes a custom override reverting the scope to inherited defaults (Restricted to ROLE_ADMIN).
     */
    @DeleteMapping("/{nivel}/{codigoAmbito}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteConfig(
            @PathVariable NivelParametro nivel,
            @PathVariable String codigoAmbito) {

        boolean deleted = this.service.deleteConfig(nivel, codigoAmbito);
        return ResponseEntity.ok(
                ResourceBuilder.of(Map.of("deleted", deleted, "codigoAmbito", codigoAmbito))
                        .message(deleted ? "Sobreescritura eliminada. El ambito ahora hereda la politica superior."
                                         : "No se encontro sobreescritura previa para eliminar.")
                        .build()
        );
    }
}
