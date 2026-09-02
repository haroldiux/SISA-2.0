package bo.edu.unitepc.sisa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main entry point for Sistema Integrado de Seguimiento Academico (SISA) backend service.
 *
 * @author GentleAI SISA Architecture Team
 */
@SpringBootApplication
@EnableCaching
public class SisaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SisaApplication.class, args);
    }
}
