package bo.edu.unitepc.sisa.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * APA bibliographic reference associated with a Programa Analitico.
 *
 * @author GentleAI SISA Architecture Team
 */
@Entity
@Table(name = "bibliografia")
@Getter
@Setter
@NoArgsConstructor
public class Bibliografia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id", nullable = false)
    private ProgramaAnalitico programa;

    @Column(nullable = false, length = 20)
    private String tipo; // BASICA, COMPLEMENTARIA

    @Column(name = "cita_apa", nullable = false, columnDefinition = "TEXT")
    private String citaApa;

    @Column(length = 150)
    private String autor;

    private Integer anio;

    @Column(length = 255)
    private String titulo;

    @Column(name = "editorial_url", columnDefinition = "TEXT")
    private String editorialUrl;
}
