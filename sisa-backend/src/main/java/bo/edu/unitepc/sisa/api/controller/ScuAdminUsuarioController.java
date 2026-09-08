package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.request.ScuRegisterUserRequest;
import bo.edu.unitepc.sisa.api.request.ScuUpdateUserRequest;
import bo.edu.unitepc.sisa.api.response.ScuUserDetailResponse;
import bo.edu.unitepc.sisa.builder.ResourceBuilder;
import bo.edu.unitepc.sisa.builder.ResourcesBuilder;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.service.ScuAdminUsuarioService;
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

    public ScuAdminUsuarioController(ScuAdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
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
}
