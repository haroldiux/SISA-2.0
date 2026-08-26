package bo.edu.unitepc.sisa.infrastructure.security;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter populating Spring Security context and TenantContext ThreadLocal.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class ScuJwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public ScuJwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = this._getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && this.tokenProvider.validateToken(jwt)) {
                String username = this.tokenProvider.getUsernameFromToken(jwt);
                Long userId = this.tokenProvider.getUserIdFromToken(jwt);
                RolUsuario role = this.tokenProvider.getRoleFromToken(jwt);
                Long sedeId = this.tokenProvider.getSedeIdFromToken(jwt);

                if (username != null && role != null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority(role.name()))
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    TenantInfo tenantInfo = TenantInfo.builder()
                            .userId(userId)
                            .username(username)
                            .rol(role)
                            .sedeId(sedeId)
                            .build();
                    TenantContext.setTenantInfo(tenantInfo);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String _getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
