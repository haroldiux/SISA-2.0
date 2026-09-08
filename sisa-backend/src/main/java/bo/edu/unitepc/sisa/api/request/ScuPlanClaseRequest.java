package bo.edu.unitepc.sisa.api.request;

import lombok.NoArgsConstructor;

/**
 * Plan de Clase submission request DTO.
 * Backwards compatible subclass of {@link ScuPlanClaseDto}.
 *
 * @author GentleAI SISA Architecture Team
 */
@NoArgsConstructor
public class ScuPlanClaseRequest extends ScuPlanClaseDto {

    public ScuPlanClaseRequest(ScuPlanClaseDto dto) {
        if (dto != null) {
            this.setId(dto.getId());
            this.setSesionId(dto.getSesionId());
            this.setTemplateType(dto.getTemplateType());
            this.setComponentType(dto.getComponentType());
            this.setDuracionTotalMin(dto.getDuracionTotalMin());
            this.setObjetivoSesion(dto.getObjetivoSesion());
            this.setContenidoTema(dto.getContenidoTema());
            this.setNombreAsignatura(dto.getNombreAsignatura());
            this.setUnidadTitulo(dto.getUnidadTitulo());
            this.setNombreHoja(dto.getNombreHoja());
            this.setNombreDocente(dto.getNombreDocente());
            this.setFecha(dto.getFecha());
            this.setCarrera(dto.getCarrera());
            this.setElementoCompetencia(dto.getElementoCompetencia());
            this.setLogrosEsperados(dto.getLogrosEsperados());
            this.setIndicadoresLogro(dto.getIndicadoresLogro());
            this.setSaberConceptual(dto.getSaberConceptual());
            this.setSaberProcedimental(dto.getSaberProcedimental());
            this.setSaberActitudinal(dto.getSaberActitudinal());
            this.setEstrategiaEnsenanza(dto.getEstrategiaEnsenanza());
            this.setEstrategiaAprendizaje(dto.getEstrategiaAprendizaje());
            this.setRecursosEnsenanza(dto.getRecursosEnsenanza());
            this.setEvaluacionFormativaActividad(dto.getEvaluacionFormativaActividad());
            this.setEvaluacionFormativaInstrumento(dto.getEvaluacionFormativaInstrumento());
            this.setEvaluacionFormativaEvidencia(dto.getEvaluacionFormativaEvidencia());
            this.setEvaluacionSumativaActividad(dto.getEvaluacionSumativaActividad());
            this.setEvaluacionSumativaInstrumento(dto.getEvaluacionSumativaInstrumento());
            this.setEvaluacionSumativaEvidencia(dto.getEvaluacionSumativaEvidencia());
            this.setRecursosDidacticos(dto.getRecursosDidacticos());
            this.setMomentos(dto.getMomentos());
            this.setSharedData(dto.getSharedData());
            this.setPersonalData(dto.getPersonalData());
        }
    }
}
