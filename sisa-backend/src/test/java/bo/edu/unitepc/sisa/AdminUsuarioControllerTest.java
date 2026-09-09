package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.controller.ScuAdminUsuarioController;
import bo.edu.unitepc.sisa.api.request.AcademicaAsignacionDto;
import bo.edu.unitepc.sisa.api.request.ScuRegisterUserRequest;
import bo.edu.unitepc.sisa.api.request.ScuUpdateUserRequest;
import bo.edu.unitepc.sisa.api.response.ScuUserDetailResponse;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Asignatura;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.model.Sede;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.model.UsuarioAsignacionAcademica;
import bo.edu.unitepc.sisa.domain.repository.AsignaturaRepository;
import bo.edu.unitepc.sisa.domain.repository.CarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.SedeRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioAsignacionAcademicaRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import bo.edu.unitepc.sisa.service.ScuAdminUsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit and integration tests for Admin User Management CRUD, academic assignments,
 * active status toggling, and forced password reset to CI.
 *
 * @author GentleAI SISA Architecture Team
 */
public class AdminUsuarioControllerTest {

    private UsuarioRepository usuarioRepository;
    private UsuarioAsignacionAcademicaRepository asignacionAcademicaRepository;
    private SedeRepository sedeRepository;
    private CarreraRepository carreraRepository;
    private AsignaturaRepository asignaturaRepository;
    private PasswordEncoder passwordEncoder;

    private ScuAdminUsuarioService adminUsuarioService;
    private ScuAdminUsuarioController controller;

    private Sede sedeCbb;
    private Carrera carreraSistemas;
    private Asignatura asignaturaProg;

    @BeforeEach
    void setUp() {
        this.usuarioRepository = mock(UsuarioRepository.class);
        this.asignacionAcademicaRepository = mock(UsuarioAsignacionAcademicaRepository.class);
        this.sedeRepository = mock(SedeRepository.class);
        this.carreraRepository = mock(CarreraRepository.class);
        this.asignaturaRepository = mock(AsignaturaRepository.class);
        this.passwordEncoder = new BCryptPasswordEncoder();

        this.adminUsuarioService = new ScuAdminUsuarioService(
                this.usuarioRepository,
                this.asignacionAcademicaRepository,
                this.sedeRepository,
                this.carreraRepository,
                this.asignaturaRepository,
                this.passwordEncoder
        );

        this.controller = new ScuAdminUsuarioController(
                this.adminUsuarioService,
                mock(bo.edu.unitepc.sisa.service.SeaDocenteAutoProvisionService.class)
        );

        this.sedeCbb = new Sede("CBB", "Sede Central Cochabamba", "Cochabamba");
        this.sedeCbb.setId(1L);

        this.carreraSistemas = new Carrera("SIS", "Ingeniería de Sistemas", "Facultad de Ingeniería");
        this.carreraSistemas.setId(10L);

        this.asignaturaProg = new Asignatura();
        this.asignaturaProg.setId(100L);
        this.asignaturaProg.setCodigo("SIS-101");
        this.asignaturaProg.setNombre("Programación I");
        this.asignaturaProg.setCarrera(this.carreraSistemas);

        when(this.sedeRepository.findById(1L)).thenReturn(Optional.of(this.sedeCbb));
        when(this.carreraRepository.findById(10L)).thenReturn(Optional.of(this.carreraSistemas));
        when(this.asignaturaRepository.findById(100L)).thenReturn(Optional.of(this.asignaturaProg));
    }

    @Test
    @DisplayName("1. Admin creates user with CI as username and initial password, and mustChangePassword=true")
    void shouldCreateUserWithCiAsPasswordAndMustChangePasswordTrue() {
        ScuRegisterUserRequest request = ScuRegisterUserRequest.builder()
                .ci("5241890-CB")
                .rol(RolUsuario.ROLE_DOCENTE)
                .nombreCompleto("Harold Iriarte Rojas")
                .email("harold.docente@unitepc.edu.bo")
                .activo(true)
                .asignaciones(List.of(
                        AcademicaAsignacionDto.builder()
                                .sedeId(1L)
                                .carreraId(10L)
                                .asignaturaId(100L)
                                .build()
                ))
                .build();

        when(this.usuarioRepository.findByUsername("5241890-CB")).thenReturn(Optional.empty());
        when(this.usuarioRepository.findByCi("5241890-CB")).thenReturn(Optional.empty());
        when(this.usuarioRepository.findByEmail("harold.docente@unitepc.edu.bo")).thenReturn(Optional.empty());
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setId(50L);
            return u;
        });

        ResponseEntity<Map<String, Object>> response = this.controller.createUser(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(this.usuarioRepository).save(captor.capture());
        Usuario savedUser = captor.getValue();

        assertEquals("5241890-CB", savedUser.getUsername());
        assertEquals("5241890-CB", savedUser.getCi());
        assertEquals(RolUsuario.ROLE_DOCENTE, savedUser.getRol());
        assertEquals("Harold", savedUser.getNombres());
        assertEquals("Iriarte Rojas", savedUser.getApellidos());
        assertEquals("harold.docente@unitepc.edu.bo", savedUser.getEmail());
        assertTrue(savedUser.getActivo());
        assertTrue(savedUser.getMustChangePassword());
        assertTrue(this.passwordEncoder.matches("5241890-CB", savedUser.getPasswordHash()));

        assertEquals(1, savedUser.getAsignacionesAcademicas().size());
        UsuarioAsignacionAcademica asig = savedUser.getAsignacionesAcademicas().get(0);
        assertEquals(this.sedeCbb, asig.getSede());
        assertEquals(this.carreraSistemas, asig.getCarrera());
        assertEquals(this.asignaturaProg, asig.getAsignatura());

        ScuUserDetailResponse detail = (ScuUserDetailResponse) response.getBody().get("data");
        assertEquals("5241890-CB", detail.getCi());
        assertEquals("Harold Iriarte Rojas", detail.getNombreCompleto());
        assertEquals(1, detail.getAsignaciones().size());
        assertEquals("Sede Central Cochabamba", detail.getAsignaciones().get(0).getSedeNombre());
    }

    @Test
    @DisplayName("2. User creation auto-derives institutional email when omitted")
    void shouldDeriveEmailWhenOmittedInRegisterRequest() {
        ScuRegisterUserRequest request = ScuRegisterUserRequest.builder()
                .ci("7894561-LP")
                .rol(RolUsuario.ROLE_DIR_CARRERA)
                .nombreCompleto("Carlos Rodriguez Mendez")
                .email(null)
                .build();

        when(this.usuarioRepository.findByUsername("7894561-LP")).thenReturn(Optional.empty());
        when(this.usuarioRepository.findByCi("7894561-LP")).thenReturn(Optional.empty());
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        this.controller.createUser(request);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(this.usuarioRepository).save(captor.capture());
        Usuario saved = captor.getValue();

        assertEquals("7894561lp@unitepc.edu.bo", saved.getEmail());
    }

    @Test
    @DisplayName("3. Creation rejects duplicate CI or username with 409 Conflict")
    void shouldRejectCreationWhenCiAlreadyExists() {
        ScuRegisterUserRequest request = ScuRegisterUserRequest.builder()
                .ci("5241890-CB")
                .rol(RolUsuario.ROLE_DOCENTE)
                .nombreCompleto("Harold Iriarte")
                .build();

        when(this.usuarioRepository.findByUsername("5241890-CB")).thenReturn(Optional.of(new Usuario()));

        ScuException exception = assertThrows(ScuException.class, () -> this.controller.createUser(request));
        assertEquals(HttpStatus.CONFLICT, exception.getHttpStatus());
        assertEquals("USER_ALREADY_EXISTS", exception.getErrorCode());
    }

    @Test
    @DisplayName("4. Admin updates user details and academic assignments")
    void shouldUpdateUserDetailsAndAssignments() {
        Usuario existingUser = new Usuario();
        existingUser.setId(20L);
        existingUser.setUsername("202020");
        existingUser.setCi("202020");
        existingUser.setNombres("Juan");
        existingUser.setApellidos("Perez");
        existingUser.setEmail("juan.perez@unitepc.edu.bo");
        existingUser.setRol(RolUsuario.ROLE_DOCENTE);
        existingUser.setActivo(true);
        existingUser.setMustChangePassword(false);
        existingUser.setAsignacionesAcademicas(new ArrayList<>());

        when(this.usuarioRepository.findById(20L)).thenReturn(Optional.of(existingUser));
        when(this.usuarioRepository.findByEmail("juan.actualizado@unitepc.edu.bo")).thenReturn(Optional.empty());
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScuUpdateUserRequest updateRequest = ScuUpdateUserRequest.builder()
                .nombreCompleto("Juan Carlos Perez Gomez")
                .email("juan.actualizado@unitepc.edu.bo")
                .rol(RolUsuario.ROLE_DIR_CARRERA)
                .activo(true)
                .asignaciones(List.of(
                        AcademicaAsignacionDto.builder()
                                .sedeId(1L)
                                .carreraId(10L)
                                .build()
                ))
                .build();

        ResponseEntity<Map<String, Object>> response = this.controller.updateUser(20L, updateRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Juan Carlos", existingUser.getNombres());
        assertEquals("Perez Gomez", existingUser.getApellidos());
        assertEquals("juan.actualizado@unitepc.edu.bo", existingUser.getEmail());
        assertEquals(RolUsuario.ROLE_DIR_CARRERA, existingUser.getRol());
        assertEquals(1, existingUser.getAsignacionesAcademicas().size());
        assertEquals(this.sedeCbb, existingUser.getAsignacionesAcademicas().get(0).getSede());
        assertEquals(this.carreraSistemas, existingUser.getAsignacionesAcademicas().get(0).getCarrera());
    }

    @Test
    @DisplayName("5. Admin toggles user active status")
    void shouldToggleUserActiveStatus() {
        Usuario user = new Usuario();
        user.setId(30L);
        user.setUsername("active.user");
        user.setActivo(true);
        user.setNombres("Pedro");
        user.setApellidos("Gomez");

        when(this.usuarioRepository.findById(30L)).thenReturn(Optional.of(user));
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // First toggle: true -> false
        ResponseEntity<Map<String, Object>> res1 = this.controller.toggleUserActive(30L);
        assertEquals(HttpStatus.OK, res1.getStatusCode());
        assertFalse(user.getActivo());

        // Second toggle: false -> true
        ResponseEntity<Map<String, Object>> res2 = this.controller.toggleUserActive(30L);
        assertEquals(HttpStatus.OK, res2.getStatusCode());
        assertTrue(user.getActivo());
    }

    @Test
    @DisplayName("6. Admin resets user password to CI and re-enables mustChangePassword=true")
    void shouldResetPasswordToCiAndSetMustChangePasswordTrue() {
        Usuario user = new Usuario();
        user.setId(40L);
        user.setUsername("998877-SC");
        user.setCi("998877-SC");
        user.setNombres("Maria");
        user.setApellidos("Lopez");
        user.setPasswordHash(this.passwordEncoder.encode("CustomOldPass2026!"));
        user.setMustChangePassword(false);

        when(this.usuarioRepository.findById(40L)).thenReturn(Optional.of(user));
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Map<String, Object>> response = this.controller.resetPassword(40L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(user.getMustChangePassword());
        assertTrue(this.passwordEncoder.matches("998877-SC", user.getPasswordHash()));
        assertFalse(this.passwordEncoder.matches("CustomOldPass2026!", user.getPasswordHash()));
    }

    @Test
    @DisplayName("7. Admin lists users with search, role, and sede filters")
    void shouldListUsersWithFilters() {
        Usuario user1 = new Usuario();
        user1.setId(1L);
        user1.setUsername("u1");
        user1.setNombres("Usuario");
        user1.setApellidos("Uno");
        user1.setRol(RolUsuario.ROLE_DOCENTE);
        user1.setCreadoEn(OffsetDateTime.now());

        Usuario user2 = new Usuario();
        user2.setId(2L);
        user2.setUsername("u2");
        user2.setNombres("Usuario");
        user2.setApellidos("Dos");
        user2.setRol(RolUsuario.ROLE_DOCENTE);
        user2.setCreadoEn(OffsetDateTime.now());

        when(this.usuarioRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(user2, user1));

        ResponseEntity<Map<String, Object>> response = this.controller.listUsers("Usuario", RolUsuario.ROLE_DOCENTE, 1L, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().get("total"));
        List<?> data = (List<?>) response.getBody().get("data");
        assertEquals(2, data.size());
    }

    @Test
    @DisplayName("8. Admin gets user details by ID")
    void shouldGetUserById() {
        Usuario user = new Usuario();
        user.setId(77L);
        user.setUsername("777");
        user.setCi("777");
        user.setNombres("Ana");
        user.setApellidos("Suarez");
        user.setEmail("ana@unitepc.edu.bo");
        user.setRol(RolUsuario.ROLE_VICERRECTOR_SEDE);
        user.setActivo(true);
        user.setMustChangePassword(false);
        user.setCreadoEn(OffsetDateTime.now());

        when(this.usuarioRepository.findById(77L)).thenReturn(Optional.of(user));

        ResponseEntity<Map<String, Object>> response = this.controller.getUserById(77L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ScuUserDetailResponse detail = (ScuUserDetailResponse) response.getBody().get("data");
        assertEquals(77L, detail.getId());
        assertEquals("777", detail.getUsername());
        assertEquals("Ana Suarez", detail.getNombreCompleto());
        assertEquals(RolUsuario.ROLE_VICERRECTOR_SEDE, detail.getRol());
    }

    @Test
    @DisplayName("9. Admin disables user via soft delete")
    void shouldDisableUserViaDelete() {
        Usuario user = new Usuario();
        user.setId(88L);
        user.setUsername("to.delete");
        user.setActivo(true);

        when(this.usuarioRepository.findById(88L)).thenReturn(Optional.of(user));
        when(this.usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Map<String, Object>> response = this.controller.deleteUser(88L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(user.getActivo());
    }
}
