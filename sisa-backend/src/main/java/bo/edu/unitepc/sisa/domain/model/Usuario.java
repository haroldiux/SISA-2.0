package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * System user entity supporting primary and multi-role institutional profiles.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id")
    private Sede sede;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RolUsuario rol;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_roles", joinColumns = @JoinColumn(name = "usuario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", length = 30)
    private Set<RolUsuario> roles = new LinkedHashSet<>();

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(length = 30)
    private String ci;

    @Column(name = "must_change_password", nullable = false)
    private Boolean mustChangePassword = false;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UsuarioAsignacionAcademica> asignacionesAcademicas = new ArrayList<>();

    public String getNombreCompleto() {
        return this.nombres + " " + this.apellidos;
    }

    /**
     * Returns all distinct roles assigned to this user, always placing primary role first.
     */
    public List<RolUsuario> getEffectiveRoles() {
        Set<RolUsuario> ordered = new LinkedHashSet<>();
        if (this.rol != null) {
            ordered.add(this.rol);
        }
        if (this.roles != null) {
            for (RolUsuario r : this.roles) {
                if (r != null) {
                    ordered.add(r);
                }
            }
        }
        return new ArrayList<>(ordered);
    }

    public boolean hasRole(RolUsuario target) {
        return target != null && this.getEffectiveRoles().contains(target);
    }

    /**
     * Synchronizes primary role and full role set without losing consistency.
     */
    public void syncRoles(RolUsuario primaryRole, Collection<RolUsuario> requestedRoles) {
        Set<RolUsuario> normalized = new LinkedHashSet<>();
        if (primaryRole != null) {
            normalized.add(primaryRole);
        }
        if (requestedRoles != null) {
            for (RolUsuario r : requestedRoles) {
                if (r != null) {
                    normalized.add(r);
                }
            }
        }
        if (normalized.isEmpty()) {
            normalized.add(RolUsuario.ROLE_DOCENTE);
        }
        this.rol = (primaryRole != null) ? primaryRole : normalized.iterator().next();
        if (this.roles == null) {
            this.roles = new LinkedHashSet<>();
        }
        this.roles.clear();
        this.roles.addAll(normalized);
    }

    public void addAsignacionAcademica(UsuarioAsignacionAcademica asignacion) {
        if (this.asignacionesAcademicas == null) {
            this.asignacionesAcademicas = new ArrayList<>();
        }
        this.asignacionesAcademicas.add(asignacion);
        asignacion.setUsuario(this);
    }

    public void removeAsignacionAcademica(UsuarioAsignacionAcademica asignacion) {
        if (this.asignacionesAcademicas != null) {
            this.asignacionesAcademicas.remove(asignacion);
            asignacion.setUsuario(null);
        }
    }
}

