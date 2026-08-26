package bo.edu.unitepc.sisa.infrastructure.security;

import bo.edu.unitepc.sisa.domain.enums.RolUsuario;
import bo.edu.unitepc.sisa.domain.model.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Token Provider for issuing and validating HMAC-SHA512 signed authentication tokens.
 *
 * @author GentleAI SISA Architecture Team
 */
@Component
public class JwtTokenProvider {

    @Value("${sisa.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    @Value("${sisa.jwt.expiration-ms:28800000}")
    private long jwtExpirationMs;

    @Value("${sisa.jwt.refresh-expiration-ms:604800000}")
    private long jwtRefreshExpirationMs;

    private SecretKey _getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(Usuario user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRol().name());
        claims.put("sedeId", user.getSede() != null ? user.getSede().getId() : null);
        claims.put("sedeNombre", user.getSede() != null ? user.getSede().getNombre() : "Nacional");
        claims.put("nombres", user.getNombres());
        claims.put("apellidos", user.getApellidos());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + this.jwtExpirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(this._getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Usuario user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + this.jwtRefreshExpirationMs);

        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(this._getSigningKey())
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(this._getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {
        return this.getClaimsFromToken(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Object userId = this.getClaimsFromToken(token).get("userId");
        return (userId instanceof Number) ? ((Number) userId).longValue() : null;
    }

    public RolUsuario getRoleFromToken(String token) {
        String roleStr = (String) this.getClaimsFromToken(token).get("role");
        return (roleStr != null) ? RolUsuario.valueOf(roleStr) : null;
    }

    public Long getSedeIdFromToken(String token) {
        Object sedeId = this.getClaimsFromToken(token).get("sedeId");
        return (sedeId instanceof Number) ? ((Number) sedeId).longValue() : null;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(this._getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
