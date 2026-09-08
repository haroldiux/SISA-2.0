package bo.edu.unitepc.sisa;

import bo.edu.unitepc.sisa.api.request.ScuPacDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.PacParserStrategy;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.ParserFactory;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.PlanClaseParserStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link ParserFactory}.
 *
 * @author GentleAI SISA Architecture Team
 */
public class ParserFactoryTest {

    @Test
    @DisplayName("ParserFactory routes to matching PacParserStrategy")
    void testGetPacParser() {
        PacParserStrategy gralStrategy = mock(PacParserStrategy.class);
        when(gralStrategy.supports("GRAL")).thenReturn(true);

        PacParserStrategy practicoStrategy = mock(PacParserStrategy.class);
        when(practicoStrategy.supports("PRACTICO")).thenReturn(true);

        ParserFactory factory = new ParserFactory(List.of(gralStrategy, practicoStrategy), List.of());

        assertEquals(gralStrategy, factory.getPacParser("GRAL"));
        assertEquals(practicoStrategy, factory.getPacParser("PRACTICO"));
        assertThrows(IllegalArgumentException.class, () -> factory.getPacParser("UNKNOWN"));
    }

    @Test
    @DisplayName("ParserFactory routes to matching PlanClaseParserStrategy")
    void testGetPlanClaseParser() {
        PlanClaseParserStrategy teoricoStrategy = mock(PlanClaseParserStrategy.class);
        when(teoricoStrategy.supports("TEORICO")).thenReturn(true);

        PlanClaseParserStrategy practicoStrategy = mock(PlanClaseParserStrategy.class);
        when(practicoStrategy.supports("PRACTICO")).thenReturn(true);

        ParserFactory factory = new ParserFactory(List.of(), List.of(teoricoStrategy, practicoStrategy));

        assertEquals(teoricoStrategy, factory.getPlanClaseParser("TEORICO"));
        assertEquals(practicoStrategy, factory.getPlanClaseParser("PRACTICO"));
        assertThrows(IllegalArgumentException.class, () -> factory.getPlanClaseParser("UNKNOWN"));
    }

    @Test
    @DisplayName("ParserFactory gracefully handles null strategy lists")
    void testNullStrategyLists() {
        ParserFactory factory = new ParserFactory(null, null);
        assertTrue(factory.getPacStrategies().isEmpty());
        assertTrue(factory.getPlanClaseStrategies().isEmpty());
        assertTrue(factory.findPacParser("GRAL").isEmpty());
        assertTrue(factory.findPlanClaseParser("TEORICO").isEmpty());
    }
}
