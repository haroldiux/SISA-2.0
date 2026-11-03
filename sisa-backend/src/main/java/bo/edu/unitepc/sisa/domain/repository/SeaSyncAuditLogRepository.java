package bo.edu.unitepc.sisa.domain.repository;

import bo.edu.unitepc.sisa.domain.model.SeaSyncAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for SeaSyncAuditLog entity.
 *
 * @author GentleAI SISA Architecture Team
 */
@Repository
public interface SeaSyncAuditLogRepository extends JpaRepository<SeaSyncAuditLog, Long> {
    List<SeaSyncAuditLog> findTop50ByOrderByCreadoEnDesc();
}
