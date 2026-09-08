package bo.edu.unitepc.sisa.api.request;

import lombok.NoArgsConstructor;

/**
 * PAC curriculum planning submission / update request DTO.
 * Backwards compatible subclass of {@link ScuPacDto}.
 *
 * @author GentleAI SISA Architecture Team
 */
@NoArgsConstructor
public class ScuPacRequest extends ScuPacDto {

    public ScuPacRequest(ScuPacDto dto) {
        if (dto != null) {
            this.setId(dto.getId());
            this.setAsignacionId(dto.getAsignacionId());
            this.setPacType(dto.getPacType());
            this.setComponentType(dto.getComponentType());
            this.setCarrera(dto.getCarrera());
            this.setNombreAsignatura(dto.getNombreAsignatura());
            this.setCodigoAsignatura(dto.getCodigoAsignatura());
            this.setTipoCurso(dto.getTipoCurso());
            this.setModalidad(dto.getModalidad());
            this.setSemestre(dto.getSemestre());
            this.setPreRequisito(dto.getPreRequisito());
            this.setCreditos(dto.getCreditos());
            this.setCargaHorariaTotal(dto.getCargaHorariaTotal());
            this.setSesionesSemanales(dto.getSesionesSemanales());
            this.setHorasTeoricasPracticas(dto.getHorasTeoricasPracticas());
            this.setNombreDocente(dto.getNombreDocente());
            this.setEmailDocente(dto.getEmailDocente());
            this.setFormacionDocente(dto.getFormacionDocente());
            this.setTelefonoDocente(dto.getTelefonoDocente());
            this.setJustificacion(dto.getJustificacion());
            this.setPropositoGeneral(dto.getPropositoGeneral());
            this.setCompetenciaGlobal(dto.getCompetenciaGlobal());
            this.setUnidadCompetencia(dto.getUnidadCompetencia());
            this.setElementoCompetencia1(dto.getElementoCompetencia1());
            this.setElementoCompetencia2(dto.getElementoCompetencia2());
            this.setElementosCompetencia(dto.getElementosCompetencia());
            this.setMetodologiaAula(dto.getMetodologiaAula());
            this.setMetodologiaLaboratorio(dto.getMetodologiaLaboratorio());
            this.setMetodologiaSalud(dto.getMetodologiaSalud());
            this.setSistemaEvaluacion(dto.getSistemaEvaluacion());
            this.setNormativaCurso(dto.getNormativaCurso());
            this.setP1NotaTeorica(dto.getP1NotaTeorica());
            this.setP1NotaPractica(dto.getP1NotaPractica());
            this.setP2NotaTeorica(dto.getP2NotaTeorica());
            this.setP2NotaPractica(dto.getP2NotaPractica());
            this.setEfNotaTeorica(dto.getEfNotaTeorica());
            this.setEfNotaPractica(dto.getEfNotaPractica());
            this.setBibliografiaOficial(dto.getBibliografiaOficial());
            this.setSeccionesIdentificacion(dto.getSeccionesIdentificacion());
            this.setEstrategiasMetodologicas(dto.getEstrategiasMetodologicas());
            this.setRecursosDidacticos(dto.getRecursosDidacticos());
            this.setNormasCurso(dto.getNormasCurso());
            this.setMatriz7(dto.getMatriz7());
        }
    }
}
