package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.AsistenciaSesionDto;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaSesionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Command for querying a single attendance session by its composite business key with eager child marks.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetAsistenciaSesionCmd {

    private final AsistenciaSesionRepository sesionRepository;

    public ScuGetAsistenciaSesionCmd(AsistenciaSesionRepository sesionRepository) {
        this.sesionRepository = sesionRepository;
    }

    @Transactional(readOnly = true)
    public Optional<AsistenciaSesionDto> execute(String materiaCodigo, LocalDate fecha, String tipoClase, String comision) {
        if (materiaCodigo == null || fecha == null) {
            return Optional.empty();
        }
        String cleanMateria = materiaCodigo.trim();
        String cleanTipo = (tipoClase != null && !tipoClase.isBlank()) ? tipoClase.trim().toUpperCase() : "TEORICA";
        String cleanComision = (comision != null && !comision.isBlank()) ? comision.trim().toUpperCase() : "TA-01";

        return this.sesionRepository
                .findByMateriaCodigoAndFechaAndTipoClaseAndComisionWithEstudiantes(cleanMateria, fecha, cleanTipo, cleanComision)
                .map(ScuSaveAsistenciaCmd::mapToDto);
    }
}
