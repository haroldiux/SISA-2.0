package bo.edu.unitepc.sisa.api.controller;

import bo.edu.unitepc.sisa.api.dto.gateway.BranchOfficeDto;
import bo.edu.unitepc.sisa.api.dto.gateway.CareerDto;
import bo.edu.unitepc.sisa.api.dto.gateway.CourseDto;
import bo.edu.unitepc.sisa.domain.model.SeaCarrera;
import bo.edu.unitepc.sisa.domain.model.SeaMateria;
import bo.edu.unitepc.sisa.domain.model.SeaSede;
import bo.edu.unitepc.sisa.domain.repository.SeaCarreraRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaGrupoRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaMateriaRepository;
import bo.edu.unitepc.sisa.domain.repository.SeaSedeRepository;
import bo.edu.unitepc.sisa.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit and integration tests for CatalogoAcademicoController proxy and fallback behavior.
 *
 * @author GentleAI SISA Architecture Team
 */
public class CatalogoAcademicoControllerTest {

    private UnitepcGatewayClient gatewayClient;
    private SeaSedeRepository seaSedeRepository;
    private SeaCarreraRepository seaCarreraRepository;
    private SeaMateriaRepository seaMateriaRepository;
    private SeaGrupoRepository seaGrupoRepository;
    private CatalogoAcademicoController controller;

    @BeforeEach
    void setUp() {
        this.gatewayClient = mock(UnitepcGatewayClient.class);
        this.seaSedeRepository = mock(SeaSedeRepository.class);
        this.seaCarreraRepository = mock(SeaCarreraRepository.class);
        this.seaMateriaRepository = mock(SeaMateriaRepository.class);
        this.seaGrupoRepository = mock(SeaGrupoRepository.class);

        this.controller = new CatalogoAcademicoController(
                this.gatewayClient,
                this.seaSedeRepository,
                this.seaCarreraRepository,
                this.seaMateriaRepository,
                this.seaGrupoRepository
        );
    }

    @Test
    @DisplayName("Should return status online when gateway is online")
    void shouldReturnStatusOnline() {
        when(this.gatewayClient.isOnline()).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = this.controller.getStatus();

        assertNotNull(response.getBody());
        assertEquals("online", response.getBody().get("status"));
    }

    @Test
    @DisplayName("Should return remote branch offices and update local cache when gateway is accessible")
    void shouldReturnRemoteBranchOffices() {
        List<BranchOfficeDto> remoteList = List.of(
                new BranchOfficeDto("sede-1", "CBBA", "Cochabamba"),
                new BranchOfficeDto("sede-2", "LPZ", "La Paz")
        );
        when(this.gatewayClient.getBranchOffices()).thenReturn(remoteList);

        ResponseEntity<List<BranchOfficeDto>> response = this.controller.getBranchOffices();

        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("CBBA", response.getBody().get(0).code());
        verify(this.seaSedeRepository, atLeastOnce()).save(any(SeaSede.class));
    }

    @Test
    @DisplayName("Should fallback to local sea_sedes when gateway fails")
    void shouldFallbackToLocalSedesOnGatewayFailure() {
        when(this.gatewayClient.getBranchOffices()).thenThrow(new RuntimeException("Connection timed out"));
        when(this.seaSedeRepository.findAll()).thenReturn(List.of(
                new SeaSede("sede-cbba", "CBBA", "Cochabamba Fallback"),
                new SeaSede("sede-scz", "SCZ", "Santa Cruz Fallback")
        ));

        ResponseEntity<List<BranchOfficeDto>> response = this.controller.getBranchOffices();

        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Cochabamba Fallback", response.getBody().get(0).name());
        verify(this.seaSedeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should fallback to local sea_carreras when gateway fails")
    void shouldFallbackToLocalCareersOnGatewayFailure() {
        when(this.gatewayClient.getCareers("CBBA")).thenThrow(new RuntimeException("Connection error"));
        when(this.seaCarreraRepository.findBySedeCodigo("CBBA")).thenReturn(List.of(
                new SeaCarrera("car-sis", "SIS", "Ingeniería de Sistemas", "CBBA")
        ));

        ResponseEntity<List<CareerDto>> response = this.controller.getCareers("CBBA");

        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("SIS", response.getBody().get(0).code());
    }

    @Test
    @DisplayName("Should fallback to local sea_materias when gateway fails")
    void shouldFallbackToLocalCoursesOnGatewayFailure() {
        when(this.gatewayClient.getCourses("CBBA", "SIS")).thenThrow(new RuntimeException("Connection error"));
        when(this.seaCarreraRepository.findByCodigo("SIS")).thenReturn(Optional.of(
                new SeaCarrera("car-sis", "SIS", "Ingeniería de Sistemas", "CBBA")
        ));
        when(this.seaMateriaRepository.findByCarreraId("car-sis")).thenReturn(List.of(
                new SeaMateria("mat-sis213", "SIS-213", "PROGRAMACIÓN III", (short) 3, "syl-1", "car-sis")
        ));

        ResponseEntity<List<CourseDto>> response = this.controller.getCourses("CBBA", "SIS");

        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("SIS-213", response.getBody().get(0).code());
        assertEquals("PROGRAMACIÓN III", response.getBody().get(0).name());
    }
}
