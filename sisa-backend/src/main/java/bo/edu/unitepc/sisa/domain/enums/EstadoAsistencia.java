package bo.edu.unitepc.sisa.domain.enums;

/**
 * Domain enumeration for student attendance statuses and regulatory compliance weights.
 *
 * @author GentleAI SISA Architecture Team
 */
public enum EstadoAsistencia {
    PRESENTE("P", "Presente", 1.0),
    FALTA("F", "Falta", 0.0),
    ATRASO("A", "Atraso", 0.5),
    LICENCIA("L", "Licencia", 1.0);

    private final String codigo;
    private final String descripcion;
    private final double peso;

    EstadoAsistencia(String codigo, String descripcion, double peso) {
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.peso = peso;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public double getPeso() {
        return peso;
    }
}
