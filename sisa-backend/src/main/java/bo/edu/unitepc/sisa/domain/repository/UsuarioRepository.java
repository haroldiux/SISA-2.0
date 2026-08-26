package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Usuario entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findBySedeId(Long sedeId);
    List<Usuario> findByRol(RolUsuario rol);
    List<Usuario> findBySedeIdAndRol(Long sedeId, RolUsuario rol);
}
