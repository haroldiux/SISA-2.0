package bo.edu.unitepc.sisa.domain.enums;

import lombok.Getter;

/**
 * Ambito jerarquico de aplicacion de parametros y politicas institucionales.
 * Jerarquia de evaluacion: CARRERA -> SEDE -> GLOBAL.
 *
 * @author GentleAI SISA Architecture Team
 */
@Getter
public enum NivelParametro {
    GLOBAL("Politica General Institucional"),
    SEDE("Sobreescritura por Sede"),
    CARRERA("Sobreescritura por Carrera");

    private final String descripcion;

    NivelParametro(String descripcion) {
        this.descripcion = descripcion;
    }
}
