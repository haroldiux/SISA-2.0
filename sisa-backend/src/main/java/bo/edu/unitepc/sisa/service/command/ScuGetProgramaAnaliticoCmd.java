package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuBibliografiaDto;
import bo.edu.unitepc.sisa.api.request.ScuUnidadAprendizajeDto;
import bo.edu.unitepc.sisa.api.response.ScuProgramaAnaliticoResponse;
import bo.edu.unitepc.sisa.domain.model.ProgramaAnalitico;
import bo.edu.unitepc.sisa.domain.repository.ProgramaAnaliticoRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Command for retrieving Programa Analitico by assignment ID.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetProgramaAnaliticoCmd {

    private final ProgramaAnaliticoRepository programaRepository;

    public ScuGetProgramaAnaliticoCmd(ProgramaAnaliticoRepository programaRepository) {
        this.programaRepository = programaRepository;
    }

    @Transactional(readOnly = true)
    public ScuProgramaAnaliticoResponse execute(Long asignacionId) {
        ProgramaAnalitico p = this.programaRepository.findByAsignacionId(asignacionId)
                .orElseThrow(() -> new ScuException("PROGRAMA_NOT_FOUND", "Programa analítico no encontrado", HttpStatus.NOT_FOUND));

        List<ScuUnidadAprendizajeDto> uDtos = p.getUnidades().stream()
                .map(u -> new ScuUnidadAprendizajeDto(
                        u.getId(), u.getNumeroUnidad(), u.getTitulo(),
                        u.getSaberesConceptuales(), u.getSaberesProcedimentales(),
                        u.getSaberesActitudinales(), u.getCriteriosDesempeno(), u.getHorasAcademicas()))
                .collect(Collectors.toList());

        List<ScuBibliografiaDto> bDtos = p.getBibliografia().stream()
                .map(b -> new ScuBibliografiaDto(
                        b.getId(), b.getTipo(), b.getCitaApa(),
                        b.getAutor(), b.getAnio(), b.getTitulo(), b.getEditorialUrl()))
                .collect(Collectors.toList());

        return ScuProgramaAnaliticoResponse.builder()
                .id(p.getId())
                .asignacionId(p.getAsignacion().getId())
                .estado(p.getEstado())
                .caracterizacion(p.getCaracterizacion())
                .macroCompetencia(p.getMacroCompetencia())
                .sistemaEvaluacion(p.getSistemaEvaluacion())
                .unidades(uDtos)
                .bibliografia(bDtos)
                .creadoEn(p.getCreadoEn())
                .actualizadoEn(p.getActualizadoEn())
                .build();
    }
}
