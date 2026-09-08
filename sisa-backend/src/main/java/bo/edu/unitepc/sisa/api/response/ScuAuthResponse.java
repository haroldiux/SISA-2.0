package bo.edu.unitepc.sisa.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Authentication response containing access and refresh JWT tokens.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScuAuthResponse {
    private String accessToken;
    private String token;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Boolean mustChangePassword;
    private ScuUserResponse user;

    public String getToken() {
        return this.token != null ? this.token : this.accessToken;
    }

    public boolean isMustChangePassword() {
        return Boolean.TRUE.equals(this.mustChangePassword);
    }
}

