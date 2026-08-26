package bo.edu.unitepc.sisa.infrastructure.persistence.specification;

import bo.edu.unitepc.sisa.infrastructure.security.TenantContext;
import bo.edu.unitepc.sisa.infrastructure.security.TenantInfo;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

/**
 * Dynamic JPA query specification scoping entity queries to the user's regional Sede.
 *
 * @param <T> Entity Type
 * @author GentleAI SISA Architecture Team
 */
public class SedeTenantSpecification<T> {

    public static <T> Specification<T> forCurrentTenant(String sedeIdPath) {
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            TenantInfo tenant = TenantContext.getTenantInfo();
            if (tenant == null || tenant.isNationalScope()) {
                return cb.conjunction();
            }

            Long sedeId = tenant.getSedeId();
            if (sedeId == null) {
                return cb.conjunction();
            }

            // Navigate path like "sede.id" or "campus.sede.id" or "asignacion.campus.sede.id"
            String[] parts = sedeIdPath.split("\\.");
            Path<?> path = root;
            for (String part : parts) {
                path = path.get(part);
            }
            return cb.equal(path, sedeId);
        };
    }
}
