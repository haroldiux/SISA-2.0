package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuRegisterUserRequest;
import bo.edu.unitepc.sisa.api.request.ScuUpdateUserRequest;
import bo.edu.unitepc.sisa.api.response.ScuUserDetailResponse;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.SeaSyncAuditLog;
import bo.edu.unitepc.sisa.domain.repository.SeaSyncAuditLogRepository;
import bo.edu.unitepc.sisa.service.ScuAdminUsuarioService;
import java.security.Principal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for administrative user management (CRUD, status toggling,
 * password resets, and multi-scope academic assignments).
 *
 * @author GentleAI SISA Architecture Team
 */
@RestController
@RequestMapping({"/api/v1/admin/usuarios", "/api/v1/system/admin/usuarios"})
@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class ScuAdminUsuarioController {

    private final ScuAdminUsuarioService adminUsuarioService;
    private final bo.edu.unitepc.sisa.service.SeaDocenteAutoProvisionService seaDocenteAutoProvisionService;
    private final SeaSyncAuditLogRepository seaSyncAuditLogRepository;

    public ScuAdminUsuarioController(
            ScuAdminUsuarioService adminUsuarioService,
            bo.edu.unitepc.sisa.service.SeaDocenteAutoProvisionService seaDocenteAutoProvisionService,
            SeaSyncAuditLogRepository seaSyncAuditLogRepository) {
        this.adminUsuarioService = adminUsuarioService;
        this.seaDocenteAutoProvisionService = seaDocenteAutoProvisionService;
        this.seaSyncAuditLogRepository = seaSyncAuditLogRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RolUsuario rol,
            @RequestParam(required = false) Long sedeId,
            @RequestParam(required = false) Long carreraId) {
        List<ScuUserDetailResponse> list = this.adminUsuarioService.listUsers(search, rol, sedeId, carreraId);
        return ResponseEntity.ok(
                ResourcesBuilder.of(list)
                        .message("Listado de usuarios obtenido exitosamente")
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        ScuUserDetailResponse user = this.adminUsuarioService.getUserById(id);
        return ResponseEntity.ok(
                ResourceBuilder.of(user)
                        .message("Detalle de usuario obtenido exitosamente")
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@Valid @RequestBody ScuRegisterUserRequest request) {
        ScuUserDetailResponse user = this.adminUsuarioService.createUser(request);
        return new ResponseEntity<>(
                ResourceBuilder.of(user)
                        .message("Usuario creado exitosamente")
                        .status(HttpStatus.CREATED.value())
                        .build(),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody ScuUpdateUserRequest request) {
        ScuUserDetailResponse user = this.adminUsuarioService.updateUser(id, request);
        return ResponseEntity.ok(
                ResourceBuilder.of(user)
                        .message("Usuario actualizado exitosamente")
                        .build()
        );
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleUserActive(@PathVariable Long id) {
        ScuUserDetailResponse user = this.adminUsuarioService.toggleUserActive(id);
        return ResponseEntity.ok(
                ResourceBuilder.of(user)
                        .message("Estado de activación de usuario modificado")
                        .build()
        );
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@PathVariable Long id) {
        ScuUserDetailResponse user = this.adminUsuarioService.resetPasswordToCi(id);
        return ResponseEntity.ok(
                ResourceBuilder.of(user)
                        .message("Contraseña reseteada al CI exitosamente")
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        this.adminUsuarioService.deleteUser(id);
        return ResponseEntity.ok(
                ResourceBuilder.of(null)
                        .message("Usuario deshabilitado exitosamente")
                        .build()
        );
    }

    @PostMapping("/sync-sea-docentes")
    public ResponseEntity<Map<String, Object>> syncSeaDocentes() {
        int synced = this.seaDocenteAutoProvisionService.syncAllSeaDocentes();
        return ResponseEntity.ok(
                ResourceBuilder.of(Map.of("syncedCount", synced))
                        .message("Sincronización de docentes completada: " + synced + " nuevos docentes aprovisionados")
                        .build()
        );
    }

    @GetMapping("/{ci}/sea-diff")
    public ResponseEntity<Map<String, Object>> getSeaDiffForDocente(@PathVariable String ci) {
        Map<String, Object> diff = this.seaDocenteAutoProvisionService.getSeaDiffForDocente(ci);
        return ResponseEntity.ok(
                ResourceBuilder.of(diff)
                        .message("Diferencias SEA vs SISA obtenidas exitosamente")
                        .build()
        );
    }

    @PostMapping("/{ci}/sync-sea")
    public ResponseEntity<Map<String, Object>> syncSingleUserFromSea(
            @PathVariable String ci,
            Principal principal) {
        String adminUser = (principal != null && principal.getName() != null) ? principal.getName() : "ADMIN";
        Map<String, Object> result = this.seaDocenteAutoProvisionService.syncSingleDocente(ci, adminUser);
        return ResponseEntity.ok(
                ResourceBuilder.of(result)
                        .message("Docente sincronizado exitosamente desde el SEA")
                        .build()
        );
    }

    @PostMapping("/sync-sea-batch")
    public ResponseEntity<Map<String, Object>> syncBatchUsersFromSea(
            @RequestBody Map<String, List<String>> body,
            Principal principal) {
        String adminUser = (principal != null && principal.getName() != null) ? principal.getName() : "ADMIN";
        List<String> cis = body != null ? body.get("cis") : List.of();
        Map<String, Object> result = this.seaDocenteAutoProvisionService.syncBatchDocentes(cis, adminUser);
        return ResponseEntity.ok(
                ResourceBuilder.of(result)
                        .message("Sincronización en lote de docentes completada")
                        .build()
        );
    }

    @GetMapping("/sea-analysis")
    public ResponseEntity<Map<String, Object>> analyzeSeaDocentes(@RequestParam(defaultValue = "2-2026") String term) {
        Map<String, Object> analysis = this.seaDocenteAutoProvisionService.analyzeSeaDocentes(term);
        return ResponseEntity.ok(
                ResourceBuilder.of(analysis)
                        .message("Análisis de nómina docente SEA completado exitosamente")
                        .build()
        );
    }

    @GetMapping("/sync-logs")
    public ResponseEntity<Map<String, Object>> getSyncLogs() {
        List<SeaSyncAuditLog> logs = this.seaSyncAuditLogRepository.findTop50ByOrderByCreadoEnDesc();
        return ResponseEntity.ok(
                ResourcesBuilder.of(logs)
                        .message("Historial de auditoría de sincronizaciones SEA")
                        .build()
        );
    }
}
