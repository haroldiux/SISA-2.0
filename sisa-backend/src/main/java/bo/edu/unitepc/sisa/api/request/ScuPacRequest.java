package bo.edu.unitepc.sisa.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PAC curriculum planning submission / update request DTO.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScuPacRequest {

    private Long id;

    @NotNull(message = "El ID de asignación es obligatorio")
    private Long asignacionId;

    /** 1.- Identificación de la Asignatura */
    private String carrera;
    private String nombreAsignatura;
    private String codigoAsignatura;
    private String tipoCurso;
    private String modalidad;
    private String semestre;
    private String preRequisito;
    private String creditos;
    private String cargaHorariaTotal;
    private String sesionesSemanales;
    private String horasTeoricasPracticas;

    /** 2.- Docente Responsable */
    private String nombreDocente;
    private String emailDocente;
    private String formacionDocente;
    private String telefonoDocente;

    /** 3 & 4.- Justificación & Propósito General */
    private String justificacion;
    private String propositoGeneral;

    /** 5 & 6.- Competencias & Elementos */
    private String competenciaGlobal;
    private String unidadCompetencia;
    private String elementoCompetencia1;
    private String elementoCompetencia2;
    private List<String> elementosCompetencia = new ArrayList<>();


    /** 8, 9, 12.- Metodología, Sistema de Evaluación, Normativas */
    private String metodologiaAula;
    private String metodologiaLaboratorio;
    private String metodologiaSalud;
    private String sistemaEvaluacion;
    private String normativaCurso;

    /** 9.- Ponderaciones de Evaluación */
    private Integer p1NotaTeorica = 20;
    private Integer p1NotaPractica = 10;
    private Integer p2NotaTeorica = 20;
    private Integer p2NotaPractica = 10;
    private Integer efNotaTeorica = 30;
    private Integer efNotaPractica = 10;



    /** 14.- Bibliografía Oficial (Específica y Complementaria) */
    private String bibliografiaOficial;


    private Map<String, Object> seccionesIdentificacion = new HashMap<>();
    private List<String> estrategiasMetodologicas = new ArrayList<>();
    private List<String> recursosDidacticos = new ArrayList<>();
    private List<String> normasCurso = new ArrayList<>();

    @NotEmpty(message = "La matriz 7 debe contener al menos una sesión planificada")
    @Valid
    private List<ScuSesionMatriz7Dto> matriz7 = new ArrayList<>();
}
