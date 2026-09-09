package bo.edu.unitepc.sisa.service;

import bo.edu.unitepc.sisa.api.dto.gateway.DocenteItemDto;
import bo.edu.unitepc.sisa.api.dto.gateway.GroupItemDto;
import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import bo.edu.unitepc.sisa.domain.repository.SeaGrupoRepository;
import bo.edu.unitepc.sisa.domain.repository.UsuarioRepository;
import bo.edu.unitepc.sisa.infrastructure.gateway.UnitepcGatewayClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Service responsible for automatically provisioning teacher accounts (ROLE_DOCENTE)
 * in the 'usuarios' table from the UNITEPC SEA Academic Gateway catalog.
 * <p>
 * Business rules:
 * - username = CI
 * - ci = CI
 * - initial password = BCrypt(CI)
 * - must_change_password = true
 * - rol = ROLE_DOCENTE
 * - activo = true
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class SeaDocenteAutoProvisionService {

    private static final Logger log = LoggerFactory.getLogger(SeaDocenteAutoProvisionService.class);

    private final UsuarioRepository usuarioRepository;
    private final SeaGrupoRepository seaGrupoRepository;
    private final UnitepcGatewayClient gatewayClient;
    private final PasswordEncoder passwordEncoder;

    public SeaDocenteAutoProvisionService(
            UsuarioRepository usuarioRepository,
            SeaGrupoRepository seaGrupoRepository,
            UnitepcGatewayClient gatewayClient,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.seaGrupoRepository = seaGrupoRepository;
        this.gatewayClient = gatewayClient;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Runs automatically on application startup to ensure all SEA catalog teachers
     * exist as system users.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("SEA Auto-Provisioning: Initializing automatic teacher provisioning from SEA catalog...");
        try {
            int created = this.syncAllSeaDocentes();
            log.info("SEA Auto-Provisioning completed on startup. {} new teachers provisioned.", created);
        } catch (Exception e) {
            log.warn("SEA Auto-Provisioning startup check completed with warning: {}", e.getMessage());
        }
    }

    /**
     * Synchronizes all teachers from SEA Gateway (or local sea_grupos mirror fallback)
     * and provisions any missing ones as SISA users.
     *
     * @return Number of newly provisioned users
     */
    @Transactional
    public int syncAllSeaDocentes() {
        List<GroupItemDto> remoteGroups = null;
        try {
            remoteGroups = this.gatewayClient.getGroups("2-2026", null, null, null);
        } catch (Exception e) {
            log.warn("Unable to fetch groups from gateway for auto-provisioning: {}", e.getMessage());
        }

        if (remoteGroups != null && !remoteGroups.isEmpty()) {
            return provisionFromGroups(remoteGroups);
        }

        // Fallback: sync from local sea_grupos table
        var localGrupos = this.seaGrupoRepository.findAll();
        if (localGrupos.isEmpty()) {
            return 0;
        }

        int count = 0;
        Set<String> processedCis = new HashSet<>();

        for (var grupo : localGrupos) {
            String rawCi = grupo.getDocenteCi();
            if (!StringUtils.hasText(rawCi)) continue;
            String ci = rawCi.trim();
            if (processedCis.contains(ci)) continue;
            processedCis.add(ci);

            if (provisionSingleDocente(ci, grupo.getDocenteNombre())) {
                count++;
            }
        }

        return count;
    }

    /**
     * Provisions teachers from a list of DocenteItemDto objects.
     */
    @Transactional
    public int provisionDocentesFromList(List<DocenteItemDto> docentes) {
        if (docentes == null || docentes.isEmpty()) return 0;
        int count = 0;
        for (DocenteItemDto d : docentes) {
            if (!StringUtils.hasText(d.ci())) continue;
            String ci = d.ci().trim();
            if (provisionSingleDocente(ci, d.nombreCompleto())) {
                count++;
            }
        }
        if (count > 0) {
            log.info("Provisioned {} new teachers from catalog list", count);
        }
        return count;
    }

    private int provisionFromGroups(List<GroupItemDto> groups) {
        int count = 0;
        Set<String> processedCis = new HashSet<>();

        for (GroupItemDto g : groups) {
            String rawCi = g.teacherCi();
            if (!StringUtils.hasText(rawCi)) continue;
            String ci = rawCi.trim();
            if (processedCis.contains(ci)) continue;
            processedCis.add(ci);

            if (provisionSingleDocente(ci, g.teacherName())) {
                count++;
            }
        }

        return count;
    }

    private boolean provisionSingleDocente(String ci, String nombreCompleto) {
        // Check if user already exists by username or CI
        if (this.usuarioRepository.findByUsername(ci).isPresent() ||
                this.usuarioRepository.findByCi(ci).isPresent()) {
            return false;
        }

        Usuario user = new Usuario();
        user.setUsername(ci);
        user.setCi(ci);
        user.setRol(RolUsuario.ROLE_DOCENTE);
        user.setActivo(true);
        user.setMustChangePassword(true);
        user.setPasswordHash(this.passwordEncoder.encode(ci));
        user.setCreadoEn(OffsetDateTime.now());

        // Parse names
        parseAndSetNames(user, nombreCompleto);

        // Derive unique email
        String email = deriveTeacherEmail(nombreCompleto, ci);
        if (this.usuarioRepository.findByEmail(email).isPresent()) {
            email = ci.toLowerCase().replaceAll("[^a-z0-9]", "") + "@unitepc.edu.bo";
            if (this.usuarioRepository.findByEmail(email).isPresent()) {
                email = ci.toLowerCase().replaceAll("[^a-z0-9]", "") + "_" + System.currentTimeMillis() + "@unitepc.edu.bo";
            }
        }
        user.setEmail(email);

        this.usuarioRepository.save(user);
        log.debug("Auto-provisioned SEA Docente user: CI={}, Name={}", ci, user.getNombreCompleto());
        return true;
    }

    private void parseAndSetNames(Usuario user, String nombreCompleto) {
        if (!StringUtils.hasText(nombreCompleto)) {
            user.setNombres("DOCENTE");
            user.setApellidos("UNITEPC");
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

    private String deriveTeacherEmail(String nombreCompleto, String ci) {
        if (nombreCompleto == null) return ci + "@unitepc.edu.bo";
        String clean = nombreCompleto.toLowerCase()
                .replace("ing.", "")
                .replace("lic.", "")
                .replace("dr.", "")
                .replace("dra.", "")
                .replace("msc.", "")
                .trim();
        String[] parts = clean.split("\\s+");
        if (parts.length >= 2) {
            return parts[0] + "." + parts[1] + "@unitepc.edu.bo";
        }
        return "docente." + ci.replaceAll("[^0-9]", "") + "@unitepc.edu.bo";
    }
}
