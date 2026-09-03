package bo.edu.unitepc.sisa.service.command;

import bo.edu.unitepc.sisa.api.dto.gateway.CareerDto;
import bo.edu.unitepc.sisa.api.dto.gateway.CommonCourseClusterDto;
import bo.edu.unitepc.sisa.domain.model.AsignacionDocente;
import bo.edu.unitepc.sisa.domain.model.Carrera;
import bo.edu.unitepc.sisa.domain.repository.AsignacionDocenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Command for clustering docente assignments into Common Course Clusters.
 * Groups identical subjects taught by the same teacher across different careers.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class ScuListDocenteAsignacionesCmd {

    private final AsignacionDocenteRepository asignacionRepository;

    public ScuListDocenteAsignacionesCmd(AsignacionDocenteRepository asignacionRepository) {
        this.asignacionRepository = asignacionRepository;
    }

    @Transactional(readOnly = true)
    public List<CommonCourseClusterDto> execute(Long docenteId) {
        List<AsignacionDocente> assignments;
        if (docenteId != null) {
            assignments = this.asignacionRepository.findByDocenteId(docenteId);
        } else {
            assignments = this.asignacionRepository.findAll();
        }

        if (assignments.isEmpty()) {
            return Collections.emptyList();
        }

        // Group by Asignatura ID (or course code/name if asignatura is shared)
        Map<Long, List<AsignacionDocente>> byAsignatura = assignments.stream()
                .filter(a -> a.getAsignatura() != null)
                .collect(Collectors.groupingBy(a -> a.getAsignatura().getId()));

        List<CommonCourseClusterDto> clusters = new ArrayList<>();

        for (Map.Entry<Long, List<AsignacionDocente>> entry : byAsignatura.entrySet()) {
            Long asigId = entry.getKey();
            List<AsignacionDocente> groupList = entry.getValue();
            AsignacionDocente sample = groupList.get(0);

            String courseCode = sample.getAsignatura().getCodigo();
            String courseName = sample.getAsignatura().getNombre();

            // Distinct associated careers
            Map<Long, CareerDto> careersMap = new LinkedHashMap<>();
            List<Long> asigIds = new ArrayList<>();

            for (AsignacionDocente a : groupList) {
                asigIds.add(a.getId());
                Carrera c = a.getCarrera();
                if (c != null && !careersMap.containsKey(c.getId())) {
                    careersMap.put(c.getId(), new CareerDto(
                            String.valueOf(c.getId()),
                            c.getCodigo(),
                            c.getNombre(),
                            "CBBA"
                    ));
                }
            }

            List<CareerDto> careersList = new ArrayList<>(careersMap.values());
            boolean isCommon = careersList.size() > 1;

            String teacherDoc = sample.getDocente() != null && sample.getDocente().getUsername() != null
                    ? sample.getDocente().getUsername()
                    : (sample.getDocente() != null ? String.valueOf(sample.getDocente().getId()) : "doc");
            String clusterKey = String.format("%s_%s", teacherDoc, courseCode.replace(" ", "_"));

            clusters.add(new CommonCourseClusterDto(
                    clusterKey,
                    asigId,
                    courseCode,
                    courseName,
                    isCommon,
                    careersList,
                    asigIds
            ));
        }

        return clusters;
    }
}
