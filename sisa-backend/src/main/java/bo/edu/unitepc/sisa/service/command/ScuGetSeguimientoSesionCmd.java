package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.SeguimientoClaseDto;
import bo.edu.unitepc.sisa.domain.repository.SeguimientoClaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Command for querying class didactic tracking associated with a specific Matriz 7 session.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetSeguimientoSesionCmd {

    private final SeguimientoClaseRepository seguimientoRepository;

    public ScuGetSeguimientoSesionCmd(SeguimientoClaseRepository seguimientoRepository) {
        this.seguimientoRepository = seguimientoRepository;
    }

    @Transactional(readOnly = true)
    public Optional<SeguimientoClaseDto> execute(Long sesionMatriz7Id) {
        if (sesionMatriz7Id == null) {
            return Optional.empty();
        }
        return this.seguimientoRepository.findBySesionMatriz7Id(sesionMatriz7Id)
                .map(s -> ScuSaveSeguimientoClaseCmd.mapToDto(s, null));
    }
}
