package bo.edu.unitepc.sisa.domain.model;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * System user entity with 5-tier role and optional regional sede association.
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

