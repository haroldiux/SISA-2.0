package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Learning unit belonging to a Programa Analitico.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "unidades_aprendizaje")
@Getter
@Setter
@NoArgsConstructor
public class UnidadAprendizaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id", nullable = false)
    private ProgramaAnalitico programa;

    @Column(name = "numero_unidad", nullable = false)
    private Integer numeroUnidad;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(name = "saberes_conceptuales", columnDefinition = "TEXT")
    private String saberesConceptuales = "";

    @Column(name = "saberes_procedimentales", columnDefinition = "TEXT")
    private String saberesProcedimentales = "";

    @Column(name = "saberes_actitudinales", columnDefinition = "TEXT")
    private String saberesActitudinales = "";

    @Column(name = "criterios_desempeno", columnDefinition = "TEXT")
    private String criteriosDesempeno = "";

    @Column(name = "horas_academicas")
    private Integer horasAcademicas = 0;

}
