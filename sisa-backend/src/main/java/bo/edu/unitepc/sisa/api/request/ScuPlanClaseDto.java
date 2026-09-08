package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Plan de Clase DTO supporting multi-type templates (TEORICO, PRACTICO, TEORICO_PRACTICO)
 * and segregated Shared / Personal data ownership.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuPlanClaseDto {

    private Long id;

    @NotNull(message = "El ID de la sesión Matriz 7 es obligatorio")
    private Long sesionId;

    /** Template type: TEORICO, PRACTICO, TEORICO_PRACTICO */
    private String templateType = "TEORICO";

    /** Component type: TA, PA, PL, PS */
    private String componentType;

    @NotNull(message = "La duración total en minutos es obligatoria")
    private Integer duracionTotalMin;

    @NotBlank(message = "El objetivo de la sesión es obligatorio")
    private String objetivoSesion;

    /** Tema title extracted from row 13, col C of the Plan de Clase Excel sheet. */
    private String contenidoTema;

    /** Subject name extracted from row 8, col G of the Excel sheet. */
    private String nombreAsignatura;

    /** Unidad title extracted from row 11, col C of the Excel sheet. */
    private String unidadTitulo;

    /** Sheet tab name (e.g. 'UA-1 Tema 1') */
    private String nombreHoja;

    private String nombreDocente;
    private String fecha;
    private String carrera;
    private String elementoCompetencia;
    private String logrosEsperados;
    private String indicadoresLogro;

    /** Contenidos: Los 3 Saberes */
    private String saberConceptual;
    private String saberProcedimental;
    private String saberActitudinal;

    /** Estrategias Didácticas */
    private String estrategiaEnsenanza;
    private String estrategiaAprendizaje;
    private String recursosEnsenanza;

    /** Evaluación Formativa */
    private String evaluacionFormativaActividad;
    private String evaluacionFormativaInstrumento;
    private String evaluacionFormativaEvidencia;

    /** Evaluación Sumativa */
    private String evaluacionSumativaActividad;
    private String evaluacionSumativaInstrumento;
    private String evaluacionSumativaEvidencia;

    private List<String> recursosDidacticos = new ArrayList<>();

    @NotEmpty(message = "Debe incluir los momentos pedagógicos planificados")
    @Valid
    private List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();

    /** Section 1 & 2: Shared Plan Data (Subject, Unit, Saberes) */
    @Valid
    private SharedPlanData sharedData = new SharedPlanData();

    /** Section 3+: Personal Plan Data (Strategies, Evaluation, Moments) */
    @Valid
    private PersonalPlanData personalData = new PersonalPlanData();

    public void setDuracionTotalMin(Integer duracionTotalMin) {
        this.duracionTotalMin = duracionTotalMin;
        if (this.sharedData != null) {
            this.sharedData.setDuracionTotalMin(duracionTotalMin);
        }
    }

    public Integer getDuracionTotalMin() {
        if (this.sharedData != null && this.sharedData.getDuracionTotalMin() != null) {
            return this.sharedData.getDuracionTotalMin();
        }
        return this.duracionTotalMin;
    }

    public void setObjetivoSesion(String objetivoSesion) {
        this.objetivoSesion = objetivoSesion;
        if (this.sharedData != null) {
            this.sharedData.setObjetivoSesion(objetivoSesion);
        }
    }

    public String getObjetivoSesion() {
        if (this.sharedData != null && this.sharedData.getObjetivoSesion() != null) {
            return this.sharedData.getObjetivoSesion();
        }
        return this.objetivoSesion;
    }

    public void setContenidoTema(String contenidoTema) {
        this.contenidoTema = contenidoTema;
        if (this.sharedData != null) {
            this.sharedData.setContenidoTema(contenidoTema);
        }
    }

    public String getContenidoTema() {
        if (this.sharedData != null && this.sharedData.getContenidoTema() != null) {
            return this.sharedData.getContenidoTema();
        }
        return this.contenidoTema;
    }

    public void setNombreAsignatura(String nombreAsignatura) {
        this.nombreAsignatura = nombreAsignatura;
        if (this.sharedData != null) {
            this.sharedData.setNombreAsignatura(nombreAsignatura);
        }
    }

    public String getNombreAsignatura() {
        if (this.sharedData != null && this.sharedData.getNombreAsignatura() != null) {
            return this.sharedData.getNombreAsignatura();
        }
        return this.nombreAsignatura;
    }

    public void setUnidadTitulo(String unidadTitulo) {
        this.unidadTitulo = unidadTitulo;
        if (this.sharedData != null) {
            this.sharedData.setUnidadTitulo(unidadTitulo);
        }
    }

    public String getUnidadTitulo() {
        if (this.sharedData != null && this.sharedData.getUnidadTitulo() != null) {
            return this.sharedData.getUnidadTitulo();
        }
        return this.unidadTitulo;
    }

    public void setNombreHoja(String nombreHoja) {
        this.nombreHoja = nombreHoja;
        if (this.sharedData != null) {
            this.sharedData.setNombreHoja(nombreHoja);
        }
    }

    public String getNombreHoja() {
        if (this.sharedData != null && this.sharedData.getNombreHoja() != null) {
            return this.sharedData.getNombreHoja();
        }
        return this.nombreHoja;
    }

    public void setCarrera(String carrera) {
        this.carrera = carrera;
        if (this.sharedData != null) {
            this.sharedData.setCarrera(carrera);
        }
    }

    public String getCarrera() {
        if (this.sharedData != null && this.sharedData.getCarrera() != null) {
            return this.sharedData.getCarrera();
        }
        return this.carrera;
    }

    public void setElementoCompetencia(String elementoCompetencia) {
        this.elementoCompetencia = elementoCompetencia;
        if (this.sharedData != null) {
            this.sharedData.setElementoCompetencia(elementoCompetencia);
        }
    }

    public String getElementoCompetencia() {
        if (this.sharedData != null && this.sharedData.getElementoCompetencia() != null) {
            return this.sharedData.getElementoCompetencia();
        }
        return this.elementoCompetencia;
    }

    public void setLogrosEsperados(String logrosEsperados) {
        this.logrosEsperados = logrosEsperados;
        if (this.sharedData != null) {
            this.sharedData.setLogrosEsperados(logrosEsperados);
        }
    }

    public String getLogrosEsperados() {
        if (this.sharedData != null && this.sharedData.getLogrosEsperados() != null) {
            return this.sharedData.getLogrosEsperados();
        }
        return this.logrosEsperados;
    }

    public void setIndicadoresLogro(String indicadoresLogro) {
        this.indicadoresLogro = indicadoresLogro;
        if (this.sharedData != null) {
            this.sharedData.setIndicadoresLogro(indicadoresLogro);
        }
    }

    public String getIndicadoresLogro() {
        if (this.sharedData != null && this.sharedData.getIndicadoresLogro() != null) {
            return this.sharedData.getIndicadoresLogro();
        }
        return this.indicadoresLogro;
    }

    public void setSaberConceptual(String saberConceptual) {
        this.saberConceptual = saberConceptual;
        if (this.sharedData != null) {
            this.sharedData.setSaberConceptual(saberConceptual);
        }
    }

    public String getSaberConceptual() {
        if (this.sharedData != null && this.sharedData.getSaberConceptual() != null) {
            return this.sharedData.getSaberConceptual();
        }
        return this.saberConceptual;
    }

    public void setSaberProcedimental(String saberProcedimental) {
        this.saberProcedimental = saberProcedimental;
        if (this.sharedData != null) {
            this.sharedData.setSaberProcedimental(saberProcedimental);
        }
    }

    public String getSaberProcedimental() {
        if (this.sharedData != null && this.sharedData.getSaberProcedimental() != null) {
            return this.sharedData.getSaberProcedimental();
        }
        return this.saberProcedimental;
    }

    public void setSaberActitudinal(String saberActitudinal) {
        this.saberActitudinal = saberActitudinal;
        if (this.sharedData != null) {
            this.sharedData.setSaberActitudinal(saberActitudinal);
        }
    }

    public String getSaberActitudinal() {
        if (this.sharedData != null && this.sharedData.getSaberActitudinal() != null) {
            return this.sharedData.getSaberActitudinal();
        }
        return this.saberActitudinal;
    }

    public void setRecursosDidacticos(List<String> recursosDidacticos) {
        this.recursosDidacticos = recursosDidacticos;
        if (this.sharedData != null) {
            this.sharedData.setRecursosDidacticos(recursosDidacticos);
        }
    }

    public List<String> getRecursosDidacticos() {
        if (this.sharedData != null && this.sharedData.getRecursosDidacticos() != null && !this.sharedData.getRecursosDidacticos().isEmpty()) {
            return this.sharedData.getRecursosDidacticos();
        }
        return this.recursosDidacticos;
    }

    public void setRecursosEnsenanza(String recursosEnsenanza) {
        this.recursosEnsenanza = recursosEnsenanza;
        if (this.sharedData != null) {
            this.sharedData.setRecursosEnsenanza(recursosEnsenanza);
        }
    }

    public String getRecursosEnsenanza() {
        if (this.sharedData != null && this.sharedData.getRecursosEnsenanza() != null) {
            return this.sharedData.getRecursosEnsenanza();
        }
        return this.recursosEnsenanza;
    }

    public void setNombreDocente(String nombreDocente) {
        this.nombreDocente = nombreDocente;
        if (this.personalData != null) {
            this.personalData.setNombreDocente(nombreDocente);
        }
    }

    public String getNombreDocente() {
        if (this.personalData != null && this.personalData.getNombreDocente() != null) {
            return this.personalData.getNombreDocente();
        }
        return this.nombreDocente;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
        if (this.personalData != null) {
            this.personalData.setFecha(fecha);
        }
    }

    public String getFecha() {
        if (this.personalData != null && this.personalData.getFecha() != null) {
            return this.personalData.getFecha();
        }
        return this.fecha;
    }

    public void setEstrategiaEnsenanza(String estrategiaEnsenanza) {
        this.estrategiaEnsenanza = estrategiaEnsenanza;
        if (this.personalData != null) {
            this.personalData.setEstrategiaEnsenanza(estrategiaEnsenanza);
        }
    }

    public String getEstrategiaEnsenanza() {
        if (this.personalData != null && this.personalData.getEstrategiaEnsenanza() != null) {
            return this.personalData.getEstrategiaEnsenanza();
        }
        return this.estrategiaEnsenanza;
    }

    public void setEstrategiaAprendizaje(String estrategiaAprendizaje) {
        this.estrategiaAprendizaje = estrategiaAprendizaje;
        if (this.personalData != null) {
            this.personalData.setEstrategiaAprendizaje(estrategiaAprendizaje);
        }
    }

    public String getEstrategiaAprendizaje() {
        if (this.personalData != null && this.personalData.getEstrategiaAprendizaje() != null) {
            return this.personalData.getEstrategiaAprendizaje();
        }
        return this.estrategiaAprendizaje;
    }

    public void setEvaluacionFormativaActividad(String evaluacionFormativaActividad) {
        this.evaluacionFormativaActividad = evaluacionFormativaActividad;
        if (this.personalData != null) {
            this.personalData.setEvaluacionFormativaActividad(evaluacionFormativaActividad);
        }
    }

    public String getEvaluacionFormativaActividad() {
        if (this.personalData != null && this.personalData.getEvaluacionFormativaActividad() != null) {
            return this.personalData.getEvaluacionFormativaActividad();
        }
        return this.evaluacionFormativaActividad;
    }

    public void setEvaluacionFormativaInstrumento(String evaluacionFormativaInstrumento) {
        this.evaluacionFormativaInstrumento = evaluacionFormativaInstrumento;
        if (this.personalData != null) {
            this.personalData.setEvaluacionFormativaInstrumento(evaluacionFormativaInstrumento);
        }
    }

    public String getEvaluacionFormativaInstrumento() {
        if (this.personalData != null && this.personalData.getEvaluacionFormativaInstrumento() != null) {
            return this.personalData.getEvaluacionFormativaInstrumento();
        }
        return this.evaluacionFormativaInstrumento;
    }

    public void setEvaluacionFormativaEvidencia(String evaluacionFormativaEvidencia) {
        this.evaluacionFormativaEvidencia = evaluacionFormativaEvidencia;
        if (this.personalData != null) {
            this.personalData.setEvaluacionFormativaEvidencia(evaluacionFormativaEvidencia);
        }
    }

    public String getEvaluacionFormativaEvidencia() {
        if (this.personalData != null && this.personalData.getEvaluacionFormativaEvidencia() != null) {
            return this.personalData.getEvaluacionFormativaEvidencia();
        }
        return this.evaluacionFormativaEvidencia;
    }

    public void setEvaluacionSumativaActividad(String evaluacionSumativaActividad) {
        this.evaluacionSumativaActividad = evaluacionSumativaActividad;
        if (this.personalData != null) {
            this.personalData.setEvaluacionSumativaActividad(evaluacionSumativaActividad);
        }
    }

    public String getEvaluacionSumativaActividad() {
        if (this.personalData != null && this.personalData.getEvaluacionSumativaActividad() != null) {
            return this.personalData.getEvaluacionSumativaActividad();
        }
        return this.evaluacionSumativaActividad;
    }

    public void setEvaluacionSumativaInstrumento(String evaluacionSumativaInstrumento) {
        this.evaluacionSumativaInstrumento = evaluacionSumativaInstrumento;
        if (this.personalData != null) {
            this.personalData.setEvaluacionSumativaInstrumento(evaluacionSumativaInstrumento);
        }
    }

    public String getEvaluacionSumativaInstrumento() {
        if (this.personalData != null && this.personalData.getEvaluacionSumativaInstrumento() != null) {
            return this.personalData.getEvaluacionSumativaInstrumento();
        }
        return this.evaluacionSumativaInstrumento;
    }

    public void setEvaluacionSumativaEvidencia(String evaluacionSumativaEvidencia) {
        this.evaluacionSumativaEvidencia = evaluacionSumativaEvidencia;
        if (this.personalData != null) {
            this.personalData.setEvaluacionSumativaEvidencia(evaluacionSumativaEvidencia);
        }
    }

    public String getEvaluacionSumativaEvidencia() {
        if (this.personalData != null && this.personalData.getEvaluacionSumativaEvidencia() != null) {
            return this.personalData.getEvaluacionSumativaEvidencia();
        }
        return this.evaluacionSumativaEvidencia;
    }

    public void setMomentos(List<ScuMomentoPedagogicoDto> momentos) {
        this.momentos = momentos;
        if (this.personalData != null) {
            this.personalData.setMomentos(momentos);
        }
    }

    public List<ScuMomentoPedagogicoDto> getMomentos() {
        if (this.personalData != null && this.personalData.getMomentos() != null && !this.personalData.getMomentos().isEmpty()) {
            return this.personalData.getMomentos();
        }
        return this.momentos;
    }

    public void setSharedData(SharedPlanData sharedData) {
        this.sharedData = sharedData;
        if (sharedData != null) {
            if (sharedData.getContenidoTema() != null) this.contenidoTema = sharedData.getContenidoTema();
            if (sharedData.getNombreAsignatura() != null) this.nombreAsignatura = sharedData.getNombreAsignatura();
            if (sharedData.getUnidadTitulo() != null) this.unidadTitulo = sharedData.getUnidadTitulo();
            if (sharedData.getNombreHoja() != null) this.nombreHoja = sharedData.getNombreHoja();
            if (sharedData.getCarrera() != null) this.carrera = sharedData.getCarrera();
            if (sharedData.getElementoCompetencia() != null) this.elementoCompetencia = sharedData.getElementoCompetencia();
            if (sharedData.getLogrosEsperados() != null) this.logrosEsperados = sharedData.getLogrosEsperados();
            if (sharedData.getIndicadoresLogro() != null) this.indicadoresLogro = sharedData.getIndicadoresLogro();
            if (sharedData.getDuracionTotalMin() != null) this.duracionTotalMin = sharedData.getDuracionTotalMin();
            if (sharedData.getObjetivoSesion() != null) this.objetivoSesion = sharedData.getObjetivoSesion();
            if (sharedData.getSaberConceptual() != null) this.saberConceptual = sharedData.getSaberConceptual();
            if (sharedData.getSaberProcedimental() != null) this.saberProcedimental = sharedData.getSaberProcedimental();
            if (sharedData.getSaberActitudinal() != null) this.saberActitudinal = sharedData.getSaberActitudinal();
            if (sharedData.getRecursosEnsenanza() != null) this.recursosEnsenanza = sharedData.getRecursosEnsenanza();
            if (sharedData.getRecursosDidacticos() != null && !sharedData.getRecursosDidacticos().isEmpty()) {
                this.recursosDidacticos = sharedData.getRecursosDidacticos();
            }
        }
    }

    public void setPersonalData(PersonalPlanData personalData) {
        this.personalData = personalData;
        if (personalData != null) {
            if (personalData.getNombreDocente() != null) this.nombreDocente = personalData.getNombreDocente();
            if (personalData.getFecha() != null) this.fecha = personalData.getFecha();
            if (personalData.getEstrategiaEnsenanza() != null) this.estrategiaEnsenanza = personalData.getEstrategiaEnsenanza();
            if (personalData.getEstrategiaAprendizaje() != null) this.estrategiaAprendizaje = personalData.getEstrategiaAprendizaje();
            if (personalData.getEvaluacionFormativaActividad() != null) this.evaluacionFormativaActividad = personalData.getEvaluacionFormativaActividad();
            if (personalData.getEvaluacionFormativaInstrumento() != null) this.evaluacionFormativaInstrumento = personalData.getEvaluacionFormativaInstrumento();
            if (personalData.getEvaluacionFormativaEvidencia() != null) this.evaluacionFormativaEvidencia = personalData.getEvaluacionFormativaEvidencia();
            if (personalData.getEvaluacionSumativaActividad() != null) this.evaluacionSumativaActividad = personalData.getEvaluacionSumativaActividad();
            if (personalData.getEvaluacionSumativaInstrumento() != null) this.evaluacionSumativaInstrumento = personalData.getEvaluacionSumativaInstrumento();
            if (personalData.getEvaluacionSumativaEvidencia() != null) this.evaluacionSumativaEvidencia = personalData.getEvaluacionSumativaEvidencia();
            if (personalData.getMomentos() != null && !personalData.getMomentos().isEmpty()) {
                this.momentos = personalData.getMomentos();
            }
        }
    }

    public void syncToNested() {
        if (this.sharedData == null) {
            this.sharedData = new SharedPlanData();
        }
        this.sharedData.setContenidoTema(this.contenidoTema);
        this.sharedData.setNombreAsignatura(this.nombreAsignatura);
        this.sharedData.setUnidadTitulo(this.unidadTitulo);
        this.sharedData.setNombreHoja(this.nombreHoja);
        this.sharedData.setCarrera(this.carrera);
        this.sharedData.setElementoCompetencia(this.elementoCompetencia);
        this.sharedData.setLogrosEsperados(this.logrosEsperados);
        this.sharedData.setIndicadoresLogro(this.indicadoresLogro);
        this.sharedData.setDuracionTotalMin(this.duracionTotalMin);
        this.sharedData.setObjetivoSesion(this.objetivoSesion);
        this.sharedData.setSaberConceptual(this.saberConceptual);
        this.sharedData.setSaberProcedimental(this.saberProcedimental);
        this.sharedData.setSaberActitudinal(this.saberActitudinal);
        this.sharedData.setRecursosDidacticos(this.recursosDidacticos);
        this.sharedData.setRecursosEnsenanza(this.recursosEnsenanza);

        if (this.personalData == null) {
            this.personalData = new PersonalPlanData();
        }
        this.personalData.setNombreDocente(this.nombreDocente);
        this.personalData.setFecha(this.fecha);
        this.personalData.setEstrategiaEnsenanza(this.estrategiaEnsenanza);
        this.personalData.setEstrategiaAprendizaje(this.estrategiaAprendizaje);
        this.personalData.setEvaluacionFormativaActividad(this.evaluacionFormativaActividad);
        this.personalData.setEvaluacionFormativaInstrumento(this.evaluacionFormativaInstrumento);
        this.personalData.setEvaluacionFormativaEvidencia(this.evaluacionFormativaEvidencia);
        this.personalData.setEvaluacionSumativaActividad(this.evaluacionSumativaActividad);
        this.personalData.setEvaluacionSumativaInstrumento(this.evaluacionSumativaInstrumento);
        this.personalData.setEvaluacionSumativaEvidencia(this.evaluacionSumativaEvidencia);
        this.personalData.setMomentos(this.momentos);
        this.personalData.setAmbiente(this.ambiente);
        this.personalData.setNroEstudiantes(this.nroEstudiantes);
        this.personalData.setDuracionPractica(this.duracionPractica);
        this.personalData.setModeloMetodologico(this.modeloMetodologico);
        this.personalData.setDesarrollo(this.desarrollo);
        this.personalData.setObservaciones(this.observaciones);

        this.sharedData.setTituloPractica(this.tituloPractica);
        this.sharedData.setObjetivoAprendizaje(this.objetivoAprendizaje);
        this.sharedData.setResultadosBloom(this.resultadosBloom);
        this.sharedData.setPreparacionMateriales(this.preparacionMateriales);
        this.sharedData.setEquipamiento(this.equipamiento);
        this.sharedData.setEquipo(this.equipo);
        this.sharedData.setSemestre(this.semestre);
    }

    private String ambiente;
    private String nroEstudiantes;
    private String duracionPractica;
    private String tituloPractica;
    private String objetivoAprendizaje;
    private String resultadosBloom;
    private String preparacionMateriales;
    private String equipamiento;
    private String equipo;
    private String modeloMetodologico;
    private String desarrollo;
    private String observaciones;
    private String semestre;

    public void setAmbiente(String ambiente) {
        this.ambiente = ambiente;
        if (this.personalData != null) {
            this.personalData.setAmbiente(ambiente);
        }
    }

    public String getAmbiente() {
        if (this.personalData != null && this.personalData.getAmbiente() != null) {
            return this.personalData.getAmbiente();
        }
        return this.ambiente;
    }

    public void setNroEstudiantes(String nroEstudiantes) {
        this.nroEstudiantes = nroEstudiantes;
        if (this.personalData != null) {
            this.personalData.setNroEstudiantes(nroEstudiantes);
        }
    }

    public String getNroEstudiantes() {
        if (this.personalData != null && this.personalData.getNroEstudiantes() != null) {
            return this.personalData.getNroEstudiantes();
        }
        return this.nroEstudiantes;
    }

    public void setDuracionPractica(String duracionPractica) {
        this.duracionPractica = duracionPractica;
        if (this.personalData != null) {
            this.personalData.setDuracionPractica(duracionPractica);
        }
    }

    public String getDuracionPractica() {
        if (this.personalData != null && this.personalData.getDuracionPractica() != null) {
            return this.personalData.getDuracionPractica();
        }
        return this.duracionPractica;
    }

    public void setTituloPractica(String tituloPractica) {
        this.tituloPractica = tituloPractica;
        if (this.sharedData != null) {
            this.sharedData.setTituloPractica(tituloPractica);
        }
    }

    public String getTituloPractica() {
        if (this.sharedData != null && this.sharedData.getTituloPractica() != null) {
            return this.sharedData.getTituloPractica();
        }
        return this.tituloPractica;
    }

    public void setObjetivoAprendizaje(String objetivoAprendizaje) {
        this.objetivoAprendizaje = objetivoAprendizaje;
        if (this.sharedData != null) {
            this.sharedData.setObjetivoAprendizaje(objetivoAprendizaje);
        }
    }

    public String getObjetivoAprendizaje() {
        if (this.sharedData != null && this.sharedData.getObjetivoAprendizaje() != null) {
            return this.sharedData.getObjetivoAprendizaje();
        }
        return this.objetivoAprendizaje;
    }

    public void setResultadosBloom(String resultadosBloom) {
        this.resultadosBloom = resultadosBloom;
        if (this.sharedData != null) {
            this.sharedData.setResultadosBloom(resultadosBloom);
        }
    }

    public String getResultadosBloom() {
        if (this.sharedData != null && this.sharedData.getResultadosBloom() != null) {
            return this.sharedData.getResultadosBloom();
        }
        return this.resultadosBloom;
    }

    public void setPreparacionMateriales(String preparacionMateriales) {
        this.preparacionMateriales = preparacionMateriales;
        if (this.sharedData != null) {
            this.sharedData.setPreparacionMateriales(preparacionMateriales);
        }
    }

    public String getPreparacionMateriales() {
        if (this.sharedData != null && this.sharedData.getPreparacionMateriales() != null) {
            return this.sharedData.getPreparacionMateriales();
        }
        return this.preparacionMateriales;
    }

    public void setEquipamiento(String equipamiento) {
        this.equipamiento = equipamiento;
        if (this.sharedData != null) {
            this.sharedData.setEquipamiento(equipamiento);
        }
    }

    public String getEquipamiento() {
        if (this.sharedData != null && this.sharedData.getEquipamiento() != null) {
            return this.sharedData.getEquipamiento();
        }
        return this.equipamiento;
    }

    public void setEquipo(String equipo) {
        this.equipo = equipo;
        if (this.sharedData != null) {
            this.sharedData.setEquipo(equipo);
        }
    }

    public String getEquipo() {
        if (this.sharedData != null && this.sharedData.getEquipo() != null) {
            return this.sharedData.getEquipo();
        }
        return this.equipo;
    }

    public void setModeloMetodologico(String modeloMetodologico) {
        this.modeloMetodologico = modeloMetodologico;
        if (this.personalData != null) {
            this.personalData.setModeloMetodologico(modeloMetodologico);
        }
    }

    public String getModeloMetodologico() {
        if (this.personalData != null && this.personalData.getModeloMetodologico() != null) {
            return this.personalData.getModeloMetodologico();
        }
        return this.modeloMetodologico;
    }

    public void setDesarrollo(String desarrollo) {
        this.desarrollo = desarrollo;
        if (this.personalData != null) {
            this.personalData.setDesarrollo(desarrollo);
        }
    }

    public String getDesarrollo() {
        if (this.personalData != null && this.personalData.getDesarrollo() != null) {
            return this.personalData.getDesarrollo();
        }
        return this.desarrollo;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
        if (this.personalData != null) {
            this.personalData.setObservaciones(observaciones);
        }
    }

    public String getObservaciones() {
        if (this.personalData != null && this.personalData.getObservaciones() != null) {
            return this.personalData.getObservaciones();
        }
        return this.observaciones;
    }

    public void setSemestre(String semestre) {
        this.semestre = semestre;
        if (this.sharedData != null) {
            this.sharedData.setSemestre(semestre);
        }
    }

    public String getSemestre() {
        if (this.sharedData != null && this.sharedData.getSemestre() != null) {
            return this.sharedData.getSemestre();
        }
        return this.semestre;
    }

    /**
     * Shared Plan Data: Sections 1-2 (Datos Generales & Planificación del Aprendizaje).
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharedPlanData {
        private String carrera;
        private String nombreAsignatura;
        private String unidadTitulo;
        private String contenidoTema;
        private String nombreHoja;
        private String elementoCompetencia;
        private String logrosEsperados;
        private String indicadoresLogro;
        private Integer duracionTotalMin;
        private String objetivoSesion;
        private String saberConceptual;
        private String saberProcedimental;
        private String saberActitudinal;
        private String tituloPractica;
        private String objetivoAprendizaje;
        private String resultadosBloom;
        private String preparacionMateriales;
        private String equipamiento;
        private String equipo;
        private String semestre;
        private String recursosEnsenanza;
        private List<String> recursosDidacticos = new ArrayList<>();
    }

    /**
     * Personal Plan Data: Section 3+ (Estrategias, Evaluación y Secuencia Didáctica / Modelo Metodológico).
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalPlanData {
        private String nombreDocente;
        private String fecha;
        private String ambiente;
        private String nroEstudiantes;
        private String duracionPractica;
        private String estrategiaEnsenanza;
        private String estrategiaAprendizaje;
        private String evaluacionFormativaActividad;
        private String evaluacionFormativaInstrumento;
        private String evaluacionFormativaEvidencia;
        private String evaluacionSumativaActividad;
        private String evaluacionSumativaInstrumento;
        private String evaluacionSumativaEvidencia;
        private String modeloMetodologico;
        private String desarrollo;
        private String observaciones;
        private List<ScuMomentoPedagogicoDto> momentos = new ArrayList<>();
    }
}
