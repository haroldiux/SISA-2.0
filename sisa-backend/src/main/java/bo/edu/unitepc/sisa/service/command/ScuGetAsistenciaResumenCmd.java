package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.AsistenciaEstudianteResumenDto;
import bo.edu.unitepc.sisa.api.dto.AsistenciaResumenDto;
import bo.edu.unitepc.sisa.domain.enums.EstadoAsistencia;
import bo.edu.unitepc.sisa.domain.model.AsistenciaEstudiante;
import bo.edu.unitepc.sisa.domain.model.AsistenciaSesion;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaEstudianteRepository;
import bo.edu.unitepc.sisa.domain.repository.AsistenciaSesionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Command for calculating cumulative semester attendance statistics and the UNITEPC 80% rule compliance.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuGetAsistenciaResumenCmd {

    private final AsistenciaSesionRepository sesionRepository;
    private final AsistenciaEstudianteRepository estudianteRepository;

    public ScuGetAsistenciaResumenCmd(
            AsistenciaSesionRepository sesionRepository,
            AsistenciaEstudianteRepository estudianteRepository) {
        this.sesionRepository = sesionRepository;
        this.estudianteRepository = estudianteRepository;
    }

    @Transactional(readOnly = true)
    public AsistenciaResumenDto execute(String materiaCodigo, String gestionCodigo) {
        String cleanMateria = materiaCodigo != null ? materiaCodigo.trim() : "";
        String cleanGestion = (gestionCodigo != null && !gestionCodigo.isBlank()) ? gestionCodigo.trim() : "2-2026";

        List<AsistenciaSesion> sesiones = this.sesionRepository
                .findByMateriaCodigoAndGestionCodigoOrderByFechaDesc(cleanMateria, cleanGestion);

        int totalSesionesRegistradas = sesiones.size();
        String materiaNombre = sesiones.isEmpty() ? cleanMateria : sesiones.get(0).getMateriaNombre();

        List<AsistenciaEstudiante> todasMarcas = this.estudianteRepository
                .findByMateriaAndGestion(cleanMateria, cleanGestion);

        // Group marks by estudianteCodigo
        Map<String, List<AsistenciaEstudiante>> marcasPorEstudiante = todasMarcas.stream()
                .collect(Collectors.groupingBy(AsistenciaEstudiante::getEstudianteCodigo, LinkedHashMap::new, Collectors.toList()));

        List<AsistenciaEstudianteResumenDto> estudiantesResumen = new ArrayList<>();

        for (Map.Entry<String, List<AsistenciaEstudiante>> entry : marcasPorEstudiante.entrySet()) {
            String codEst = entry.getKey();
            List<AsistenciaEstudiante> marks = entry.getValue();

            String nombre = marks.get(0).getEstudianteNombre();
            String carreraCod = marks.get(0).getCarreraCodigo();
            String carreraNom = marks.get(0).getCarreraNombre();

            int presentes = 0;
            int faltas = 0;
            int atrasos = 0;
            int licencias = 0;

            for (AsistenciaEstudiante m : marks) {
                if (m.getEstado() == EstadoAsistencia.PRESENTE) {
                    presentes++;
                } else if (m.getEstado() == EstadoAsistencia.FALTA) {
                    faltas++;
                } else if (m.getEstado() == EstadoAsistencia.ATRASO) {
                    atrasos++;
                } else if (m.getEstado() == EstadoAsistencia.LICENCIA) {
                    licencias++;
                }
            }

            int totalSesionesEval = Math.max(totalSesionesRegistradas, marks.size());
            double weightedPoints = presentes + (0.5 * atrasos) + licencias;
            double porcentaje = totalSesionesEval > 0
                    ? BigDecimal.valueOf((weightedPoints / totalSesionesEval) * 100.0)
                    .setScale(2, RoundingMode.HALF_UP).doubleValue()
                    : 100.0;

            boolean cumple80 = porcentaje >= 80.0;

            estudiantesResumen.add(new AsistenciaEstudianteResumenDto(
                    codEst,
                    nombre,
                    carreraCod,
                    carreraNom,
                    totalSesionesEval,
                    presentes,
                    faltas,
                    atrasos,
                    licencias,
                    porcentaje,
                    cumple80
            ));
        }

        estudiantesResumen.sort(Comparator.comparing(AsistenciaEstudianteResumenDto::estudianteNombre, String.CASE_INSENSITIVE_ORDER));

        int totalEstudiantesInscritos = estudiantesResumen.size();
        long enRiesgo = estudiantesResumen.stream().filter(e -> !e.cumpleNormativa80Pct()).count();

        double porcentajeGlobal = estudiantesResumen.isEmpty() ? 100.0 :
                BigDecimal.valueOf(estudiantesResumen.stream().mapToDouble(AsistenciaEstudianteResumenDto::porcentajeAsistencia).average().orElse(100.0))
                        .setScale(2, RoundingMode.HALF_UP).doubleValue();

        return new AsistenciaResumenDto(
                cleanMateria,
                materiaNombre,
                cleanGestion,
                totalSesionesRegistradas,
                totalEstudiantesInscritos,
                porcentajeGlobal,
                (int) enRiesgo,
                estudiantesResumen
        );
    }
}
