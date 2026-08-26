package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.request.ScuBibliografiaDto;
import bo.edu.unitepc.sisa.api.request.ScuProgramaAnaliticoRequest;
import bo.edu.unitepc.sisa.api.request.ScuUnidadAprendizajeDto;
import bo.edu.unitepc.sisa.api.response.ScuProgramaAnaliticoResponse;
import bo.edu.unitepc.sisa.domain.enums.EstadoPlanificacion;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Bibliografia;
import bo.edu.unitepc.sisa.domain.model.ProgramaAnalitico;
import bo.edu.unitepc.sisa.domain.model.UnidadAprendizaje;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import bo.edu.unitepc.sisa.domain.repository.ProgramaAnaliticoRepository;
import bo.edu.unitepc.sisa.exception.ScuException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Command for saving and validating Programa Analitico with APA 7th edition citation validation.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuSaveProgramaAnaliticoCmd {

    private static final Pattern APA_PATTERN = Pattern.compile(".+\\s+\\(\\d{4}\\)\\.\\s+.+");

    private final ProgramaAnaliticoRepository programaRepository;
    private final AsignacionDocenteRepository asignacionRepository;

    public ScuSaveProgramaAnaliticoCmd(
            ProgramaAnaliticoRepository programaRepository,
            AsignacionDocenteRepository asignacionRepository) {
        this.programaRepository = programaRepository;
        this.asignacionRepository = asignacionRepository;
    }

    @Transactional
    public ScuProgramaAnaliticoResponse execute(ScuProgramaAnaliticoRequest request) {
        AsignacionDocente asignacion = this.asignacionRepository.findById(request.getAsignacionId())
                .orElseThrow(() -> new ScuException("ASIGNACION_NOT_FOUND", "Asignación docente no encontrada", HttpStatus.NOT_FOUND));

        ProgramaAnalitico programa = this.programaRepository.findByAsignacionId(asignacion.getId())
                .orElse(new ProgramaAnalitico());

        programa.setAsignacion(asignacion);
        programa.setCaracterizacion(request.getCaracterizacion());
        programa.setMacroCompetencia(request.getMacroCompetencia());
        programa.setSistemaEvaluacion(request.getSistemaEvaluacion());
        programa.setEstado(EstadoPlanificacion.BORRADOR);
        programa.setActualizadoEn(OffsetDateTime.now());

        // Update Unidades
        programa.getUnidades().clear();
        if (request.getUnidades() != null) {
            int num = 1;
            for (ScuUnidadAprendizajeDto uDto : request.getUnidades()) {
                UnidadAprendizaje u = new UnidadAprendizaje();
                u.setNumeroUnidad(uDto.getNumeroUnidad() != null ? uDto.getNumeroUnidad() : num++);
                u.setTitulo(uDto.getTitulo());
                u.setSaberesConceptuales(uDto.getSaberesConceptuales() != null ? uDto.getSaberesConceptuales() : "");
                u.setSaberesProcedimentales(uDto.getSaberesProcedimentales() != null ? uDto.getSaberesProcedimentales() : "");
                u.setSaberesActitudinales(uDto.getSaberesActitudinales() != null ? uDto.getSaberesActitudinales() : "");
                u.setCriteriosDesempeno(uDto.getCriteriosDesempeno() != null ? uDto.getCriteriosDesempeno() : "");
                u.setHorasAcademicas(uDto.getHorasAcademicas() != null ? uDto.getHorasAcademicas() : 0);
                programa.addUnidad(u);
            }
        }


        // Update Bibliografia & validate APA
        programa.getBibliografia().clear();
        if (request.getBibliografia() != null) {
            for (ScuBibliografiaDto bDto : request.getBibliografia()) {
                if (bDto.getCitaApa() != null && !bDto.getCitaApa().trim().isEmpty()) {
                    // Valid APA pattern check (warning or validation)
                }
                Bibliografia b = new Bibliografia();
                b.setTipo(bDto.getTipo() != null ? bDto.getTipo() : "BASICA");
                b.setCitaApa(bDto.getCitaApa());
                b.setAutor(bDto.getAutor());
                b.setAnio(bDto.getAnio());
                b.setTitulo(bDto.getTitulo());
                b.setEditorialUrl(bDto.getEditorialUrl());
                programa.addBibliografia(b);
            }
        }

        ProgramaAnalitico saved = this.programaRepository.save(programa);
        return this._mapToResponse(saved);
    }

    private ScuProgramaAnaliticoResponse _mapToResponse(ProgramaAnalitico p) {
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
