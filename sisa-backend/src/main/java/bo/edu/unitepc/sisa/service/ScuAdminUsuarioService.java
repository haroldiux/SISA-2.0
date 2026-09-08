package bo.edu.unitepc.sisa.service;

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
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Administrative user management service handling CRUD, password reset to CI,
 * activation status toggling, and multi-scope academic assignments.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuAdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAsignacionAcademicaRepository asignacionAcademicaRepository;
    private final SedeRepository sedeRepository;
    private final CarreraRepository carreraRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final PasswordEncoder passwordEncoder;

    public ScuAdminUsuarioService(
            UsuarioRepository usuarioRepository,
            UsuarioAsignacionAcademicaRepository asignacionAcademicaRepository,
            SedeRepository sedeRepository,
            CarreraRepository carreraRepository,
            AsignaturaRepository asignaturaRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.asignacionAcademicaRepository = asignacionAcademicaRepository;
        this.sedeRepository = sedeRepository;
        this.carreraRepository = carreraRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<ScuUserDetailResponse> listUsers(
            String search,
            RolUsuario rol,
            Long sedeId,
            Long carreraId,
            Pageable pageable) {
        Specification<Usuario> spec = this.buildSpecification(search, rol, sedeId, carreraId);
        Pageable effectivePageable = (pageable != null && pageable.isPaged())
                ? pageable
                : PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "id"));
        return this.usuarioRepository.findAll(spec, effectivePageable).map(this::mapToDetailResponse);
    }

    @Transactional(readOnly = true)
    public List<ScuUserDetailResponse> listUsers(
            String search,
            RolUsuario rol,
            Long sedeId,
            Long carreraId) {
        Specification<Usuario> spec = this.buildSpecification(search, rol, sedeId, carreraId);
        return this.usuarioRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::mapToDetailResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScuUserDetailResponse getUserById(Long id) {
        Usuario user = this.usuarioRepository.findById(id)
                .orElseThrow(() -> new ScuException("USER_NOT_FOUND", "Usuario no encontrado con ID: " + id, HttpStatus.NOT_FOUND));
        return this.mapToDetailResponse(user);
    }

    @Transactional
    public ScuUserDetailResponse createUser(ScuRegisterUserRequest request) {
        if (!StringUtils.hasText(request.getCi())) {
            throw new ScuException("INVALID_CI", "El CI / Usuario es obligatorio", HttpStatus.BAD_REQUEST);
        }
        String ci = request.getCi().trim();

        if (this.usuarioRepository.findByUsername(ci).isPresent() ||
                this.usuarioRepository.findByCi(ci).isPresent()) {
            throw new ScuException("USER_ALREADY_EXISTS", "Ya existe un usuario registrado con el CI / Usuario: " + ci, HttpStatus.CONFLICT);
        }

        Usuario user = new Usuario();
        user.setUsername(ci);
        user.setCi(ci);
        user.setRol(request.getRol());
        user.setActivo(request.getActivo() != null ? request.getActivo() : true);
        user.setMustChangePassword(true);
        user.setPasswordHash(this.passwordEncoder.encode(ci));
        user.setCreadoEn(OffsetDateTime.now());

        this.parseAndSetNames(user, request.getNombreCompleto());

        // Resolve or derive email
        String email = request.getEmail();
        if (!StringUtils.hasText(email)) {
            String normalizedCi = ci.toLowerCase().replaceAll("[^a-z0-9]", "");
            email = normalizedCi + "@unitepc.edu.bo";
        } else {
            email = email.trim().toLowerCase();
        }

        if (this.usuarioRepository.findByEmail(email).isPresent()) {
            if (StringUtils.hasText(request.getEmail())) {
                throw new ScuException("EMAIL_ALREADY_IN_USE", "El correo ya se encuentra registrado: " + email, HttpStatus.CONFLICT);
            } else {
                email = ci.toLowerCase().replaceAll("[^a-z0-9]", "") + "_" + System.currentTimeMillis() + "@unitepc.edu.bo";
            }
        }
        user.setEmail(email);

        // Populate academic assignments
        if (request.getAsignaciones() != null && !request.getAsignaciones().isEmpty()) {
            for (AcademicaAsignacionDto dto : request.getAsignaciones()) {
                UsuarioAsignacionAcademica asig = this.buildAsignacion(user, dto);
                user.addAsignacionAcademica(asig);
                if (user.getSede() == null && asig.getSede() != null) {
                    user.setSede(asig.getSede());
                }
            }
        }

        Usuario saved = this.usuarioRepository.save(user);
        return this.mapToDetailResponse(saved);
    }

    @Transactional
    public ScuUserDetailResponse updateUser(Long id, ScuUpdateUserRequest request) {
        Usuario user = this.usuarioRepository.findById(id)
                .orElseThrow(() -> new ScuException("USER_NOT_FOUND", "Usuario no encontrado con ID: " + id, HttpStatus.NOT_FOUND));

        if (StringUtils.hasText(request.getNombreCompleto())) {
            this.parseAndSetNames(user, request.getNombreCompleto());
        }

        if (StringUtils.hasText(request.getEmail())) {
            String newEmail = request.getEmail().trim().toLowerCase();
            Optional<Usuario> existingWithEmail = this.usuarioRepository.findByEmail(newEmail);
            if (existingWithEmail.isPresent() && !existingWithEmail.get().getId().equals(user.getId())) {
                throw new ScuException("EMAIL_ALREADY_IN_USE", "El correo ya se encuentra registrado: " + newEmail, HttpStatus.CONFLICT);
            }
            user.setEmail(newEmail);
        }

        if (request.getRol() != null) {
            user.setRol(request.getRol());
        }

        if (request.getActivo() != null) {
            user.setActivo(request.getActivo());
        }

        if (request.getAsignaciones() != null) {
            user.getAsignacionesAcademicas().clear();
            for (AcademicaAsignacionDto dto : request.getAsignaciones()) {
                UsuarioAsignacionAcademica asig = this.buildAsignacion(user, dto);
                user.addAsignacionAcademica(asig);
                if (user.getSede() == null && asig.getSede() != null) {
                    user.setSede(asig.getSede());
                }
            }
        }

        Usuario saved = this.usuarioRepository.save(user);
        return this.mapToDetailResponse(saved);
    }

    @Transactional
    public ScuUserDetailResponse toggleUserActive(Long id) {
        Usuario user = this.usuarioRepository.findById(id)
                .orElseThrow(() -> new ScuException("USER_NOT_FOUND", "Usuario no encontrado con ID: " + id, HttpStatus.NOT_FOUND));

        boolean newActive = !Boolean.TRUE.equals(user.getActivo());
        user.setActivo(newActive);
        Usuario saved = this.usuarioRepository.save(user);
        return this.mapToDetailResponse(saved);
    }

    @Transactional
    public ScuUserDetailResponse resetPasswordToCi(Long id) {
        Usuario user = this.usuarioRepository.findById(id)
                .orElseThrow(() -> new ScuException("USER_NOT_FOUND", "Usuario no encontrado con ID: " + id, HttpStatus.NOT_FOUND));

        String rawPassword = StringUtils.hasText(user.getCi())
                ? user.getCi().trim()
                : user.getUsername().trim();

        user.setPasswordHash(this.passwordEncoder.encode(rawPassword));
        user.setMustChangePassword(true);
        Usuario saved = this.usuarioRepository.save(user);
        return this.mapToDetailResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        Usuario user = this.usuarioRepository.findById(id)
                .orElseThrow(() -> new ScuException("USER_NOT_FOUND", "Usuario no encontrado con ID: " + id, HttpStatus.NOT_FOUND));
        user.setActivo(false);
        this.usuarioRepository.save(user);
    }

    private void parseAndSetNames(Usuario user, String nombreCompleto) {
        if (!StringUtils.hasText(nombreCompleto)) {
            return;
        }
        String clean = nombreCompleto.trim();
        String[] parts = clean.split("\\s+");
        if (parts.length == 1) {
            user.setNombres(parts[0]);
            user.setApellidos(parts[0]);
        } else if (parts.length == 2) {
            user.setNombres(parts[0]);
            user.setApellidos(parts[1]);
        } else if (parts.length == 3) {
            user.setNombres(parts[0]);
            user.setApellidos(parts[1] + " " + parts[2]);
        } else {
            user.setNombres(parts[0] + " " + parts[1]);
            user.setApellidos(String.join(" ", Arrays.copyOfRange(parts, 2, parts.length)));
        }
    }

    private UsuarioAsignacionAcademica buildAsignacion(Usuario user, AcademicaAsignacionDto dto) {
        UsuarioAsignacionAcademica asig = new UsuarioAsignacionAcademica();
        asig.setUsuario(user);
        if (dto.getSedeId() != null) {
            this.sedeRepository.findById(dto.getSedeId()).ifPresent(asig::setSede);
        }
        if (dto.getCarreraId() != null) {
            this.carreraRepository.findById(dto.getCarreraId()).ifPresent(asig::setCarrera);
        }
        if (dto.getAsignaturaId() != null) {
            this.asignaturaRepository.findById(dto.getAsignaturaId()).ifPresent(asig::setAsignatura);
        }
        asig.setCreadoEn(OffsetDateTime.now());
        return asig;
    }

    public ScuUserDetailResponse mapToDetailResponse(Usuario user) {
        List<AcademicaAsignacionDto> asignaciones = new ArrayList<>();
        if (user.getAsignacionesAcademicas() != null) {
            for (UsuarioAsignacionAcademica asig : user.getAsignacionesAcademicas()) {
                asignaciones.add(AcademicaAsignacionDto.builder()
                        .id(asig.getId())
                        .sedeId(asig.getSede() != null ? asig.getSede().getId() : null)
                        .sedeNombre(asig.getSede() != null ? asig.getSede().getNombre() : null)
                        .carreraId(asig.getCarrera() != null ? asig.getCarrera().getId() : null)
                        .carreraNombre(asig.getCarrera() != null ? asig.getCarrera().getNombre() : null)
                        .asignaturaId(asig.getAsignatura() != null ? asig.getAsignatura().getId() : null)
                        .asignaturaNombre(asig.getAsignatura() != null ? asig.getAsignatura().getNombre() : null)
                        .build());
            }
        }

        return ScuUserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .ci(user.getCi())
                .nombreCompleto(user.getNombreCompleto())
                .nombres(user.getNombres())
                .apellidos(user.getApellidos())
                .email(user.getEmail())
                .rol(user.getRol())
                .activo(user.getActivo())
                .mustChangePassword(user.getMustChangePassword())
                .creadoEn(user.getCreadoEn())
                .sedeId(user.getSede() != null ? user.getSede().getId() : null)
                .sedeNombre(user.getSede() != null ? user.getSede().getNombre() : null)
                .asignaciones(asignaciones)
                .build();
    }

    private Specification<Usuario> buildSpecification(String search, RolUsuario rol, Long sedeId, Long carreraId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("ci")), pattern),
                        cb.like(cb.lower(root.get("nombres")), pattern),
                        cb.like(cb.lower(root.get("apellidos")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (rol != null) {
                predicates.add(cb.equal(root.get("rol"), rol));
            }

            if (sedeId != null) {
                Join<Usuario, Sede> sedeJoin = root.join("sede", JoinType.LEFT);
                Predicate sedeDirecta = cb.equal(sedeJoin.get("id"), sedeId);

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<UsuarioAsignacionAcademica> asigRoot = subquery.from(UsuarioAsignacionAcademica.class);
                subquery.select(asigRoot.get("id"))
                        .where(
                                cb.equal(asigRoot.get("usuario"), root),
                                cb.equal(asigRoot.get("sede").get("id"), sedeId)
                        );
                predicates.add(cb.or(sedeDirecta, cb.exists(subquery)));
            }

            if (carreraId != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<UsuarioAsignacionAcademica> asigRoot = subquery.from(UsuarioAsignacionAcademica.class);
                subquery.select(asigRoot.get("id"))
                        .where(
                                cb.equal(asigRoot.get("usuario"), root),
                                cb.equal(asigRoot.get("carrera").get("id"), carreraId)
                        );
                predicates.add(cb.exists(subquery));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
