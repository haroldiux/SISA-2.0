package bo.edu.unitepc.sisa.api.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

/**
 * Career-level Student Attendance & Teacher Roll-Call Monitoring Report DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
public record AsistenciaCarreraReporteDto(
        String carreraCodigo,
        String carreraNombre,
        String gestionCodigo,
        ParametroConfiguracionDto parametrosAplicados,
        AsistenciaCarreraKpisDto kpis,
        List<AlertaAsistenciaDocenteDto> alertasDocentes,
        List<AlertaEstudianteRiesgoDto> alertasEstudiantes,
        List<AsistenciaMateriaSupervisionDto> materias
) {

    public record AsistenciaCarreraKpisDto(
            int totalMaterias,
            int totalSesionesRegistradas,
            double porcentajeAsistenciaPromedio,
            int docentesConRetrasoCount,
            int estudiantesEnRiesgoCount,
            int materiasAlDiaCount
    ) {}

    public record AlertaAsistenciaDocenteDto(
            String materiaCodigo,
            String materiaNombre,
            String docenteNombre,
            LocalDate ultimaFechaSesion,
            int horasRetraso,
            int sesionesSinRegistrar,
            String nivelAlerta, // 'CRITICO', 'ADVERTENCIA'
            String mensaje
    ) {}

    public record AlertaEstudianteRiesgoDto(
            String estudianteCodigo,
            String estudianteNombre,
            String materiaCodigo,
            String materiaNombre,
            double porcentajeAsistencia,
            int faltasConsecutivas,
            String tipoRiesgo, // 'PORCENTAJE_CRITICO', 'FALTAS_CONSECUTIVAS', 'AMBOS'
            String mensaje
    ) {}

    @Builder
    public record AsistenciaMateriaSupervisionDto(
            String materiaCodigo,
            String materiaNombre,
            Integer semestre,
            String docenteNombre,
            int totalSesionesRegistradas,
            LocalDate ultimaFechaRegistro,
            double porcentajeAsistencia,
            int estudiantesInscritos,
            int estudiantesEnRiesgoCount,
            String estadoNormativo, // 'AL_DIA', 'EN_OBSERVACION', 'CRITICO'
            String estadoPlazo // 'A_TIEMPO', 'PROXIMO_A_VENCER', 'VENCIDO', 'SIN_REGISTRO'
    ) {}
}
