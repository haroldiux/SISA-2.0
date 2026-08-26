package bo.edu.unitepc.sisa.infrastructure.security;

/**
 * ThreadLocal holder for multi-tenant regional execution context.
 *
 * @author GentleAI SISA Architecture Team
 */
public final class TenantContext {

    private static final ThreadLocal<TenantInfo> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
        // Prevent instantiation
    }

    public static void setTenantInfo(TenantInfo tenantInfo) {
        CURRENT_TENANT.set(tenantInfo);
    }

    public static TenantInfo getTenantInfo() {
        return CURRENT_TENANT.get();
    }

    public static Long getCurrentSedeId() {
        TenantInfo info = CURRENT_TENANT.get();
        return (info != null) ? info.getSedeId() : null;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
