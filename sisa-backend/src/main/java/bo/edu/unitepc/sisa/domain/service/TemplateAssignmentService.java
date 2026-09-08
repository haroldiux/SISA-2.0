package bo.edu.unitepc.sisa.domain.service;

import bo.edu.unitepc.sisa.domain.enums.ComponentType;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service implementing official UNITEPC Document Assignment Matrix logic.
 * Determines the required PAC (GRAL, PRACTICO) and Plan de Clases
 * (TEORICO, PRACTICO, TEORICO_PRACTICO) templates per teacher based on group components.
 *
 * @author GentleAI SISA Architecture Team
 */
@Service
public class TemplateAssignmentService {

    public static final String PAC_GRAL = "GRAL";
    public static final String PAC_PRACTICO = "PRACTICO";

    public static final String PLAN_TEORICO = "TEORICO";
    public static final String PLAN_PRACTICO = "PRACTICO";
    public static final String PLAN_TEORICO_PRACTICO = "TEORICO_PRACTICO";

    /**
     * Evaluates group codes or component prefixes for a teacher in a course and determines
     * the required PAC and Plan de Clases document types.
     *
     * @param groupCodesOrComponents list of group codes (e.g. "TA-01", "PA-02") or component names ("TA", "PL")
     * @return assignment result containing required document template types
     */
    public AssignmentResult determineAssignments(Collection<String> groupCodesOrComponents) {
        if (groupCodesOrComponents == null || groupCodesOrComponents.isEmpty()) {
            return new AssignmentResult(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    false, false, false, false,
                    false, false
            );
        }

        boolean hasTA = false;
        boolean hasPA = false;
        boolean hasPL = false;
        boolean hasPS = false;

        for (String item : groupCodesOrComponents) {
            if (item == null || item.isBlank()) {
                continue;
            }
            String upper = item.trim().toUpperCase();
            if (upper.startsWith(ComponentType.TA.name())) {
                hasTA = true;
            }
            if (upper.startsWith(ComponentType.PA.name())) {
                hasPA = true;
            }
            if (upper.startsWith(ComponentType.PL.name())) {
                hasPL = true;
            }
            if (upper.startsWith(ComponentType.PS.name())) {
                hasPS = true;
            }
        }

        boolean hasTheory = hasTA;
        boolean hasPractice = hasPA || hasPL || hasPS;

        List<String> requiredPacTypes = new ArrayList<>();
        List<String> requiredPlanTypes = new ArrayList<>();

        if (hasTA && hasPA && !hasPL && !hasPS) {
            // Same teacher does TA + PA -> Teórico-Práctico
            requiredPacTypes.add(PAC_GRAL);
            requiredPlanTypes.add(PLAN_TEORICO_PRACTICO);
        } else if (hasTA && (hasPL || hasPS)) {
            // Same teacher does TA + Lab/Simulation -> requires both templates
            requiredPacTypes.add(PAC_GRAL);
            requiredPacTypes.add(PAC_PRACTICO);
            requiredPlanTypes.add(PLAN_TEORICO);
            requiredPlanTypes.add(PLAN_PRACTICO);
        } else if (hasTA && !hasPractice) {
            // Theory only
            requiredPacTypes.add(PAC_GRAL);
            requiredPlanTypes.add(PLAN_TEORICO);
        } else if (hasPractice && !hasTA) {
            // Practice only (PA, PL, or PS)
            requiredPacTypes.add(PAC_PRACTICO);
            requiredPlanTypes.add(PLAN_PRACTICO);
        }

        return new AssignmentResult(
                Collections.unmodifiableList(requiredPacTypes),
                Collections.unmodifiableList(requiredPlanTypes),
                hasTA, hasPA, hasPL, hasPS,
                hasTheory, hasPractice
        );
    }

    /**
     * Determines assignments for a collection of {@link ComponentType}.
     *
     * @param components collection of ComponentType enums
     * @return assignment result
     */
    public AssignmentResult determineAssignmentsForComponents(Collection<ComponentType> components) {
        if (components == null || components.isEmpty()) {
            return determineAssignments(Collections.emptyList());
        }
        List<String> names = components.stream()
                .filter(Objects::nonNull)
                .map(ComponentType::name)
                .toList();
        return determineAssignments(names);
    }

    /**
     * Evaluates multi-teacher assignments for a course and returns individual assignment results.
     *
     * @param teacherGroupsMap map of teacher CI or ID -> list of group codes assigned
     * @return map of teacher CI or ID -> AssignmentResult
     */
    public Map<String, AssignmentResult> determineAssignmentsForCourse(Map<String, List<String>> teacherGroupsMap) {
        if (teacherGroupsMap == null) {
            return Collections.emptyMap();
        }
        Map<String, AssignmentResult> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> entry : teacherGroupsMap.entrySet()) {
            result.put(entry.getKey(), determineAssignments(entry.getValue()));
        }
        return Collections.unmodifiableMap(result);
    }

    /**
     * Output of the template assignment rules engine.
     */
    public record AssignmentResult(
            List<String> requiredPacTypes,
            List<String> requiredPlanTypes,
            boolean hasTA,
            boolean hasPA,
            boolean hasPL,
            boolean hasPS,
            boolean hasTheory,
            boolean hasPractice
    ) {
        public List<String> getRequiredPacTypes() {
            return requiredPacTypes;
        }

        public List<String> getRequiredPlanTypes() {
            return requiredPlanTypes;
        }

        public boolean isHasTA() {
            return hasTA;
        }

        public boolean isHasPA() {
            return hasPA;
        }

        public boolean isHasPL() {
            return hasPL;
        }

        public boolean isHasPS() {
            return hasPS;
        }

        public boolean isHasTheory() {
            return hasTheory;
        }

        public boolean isHasPractice() {
            return hasPractice;
        }

        public boolean requiresMultiplePacs() {
            return requiredPacTypes != null && requiredPacTypes.size() > 1;
        }

        public boolean requiresMultiplePlans() {
            return requiredPlanTypes != null && requiredPlanTypes.size() > 1;
        }
    }
}
