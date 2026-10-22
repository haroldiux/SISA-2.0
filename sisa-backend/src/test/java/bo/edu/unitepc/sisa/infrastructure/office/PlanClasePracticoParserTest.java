package bo.edu.unitepc.sisa.infrastructure.office;

import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto.DesarrolloPasoDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto.FaseMetodologicaDto;
import bo.edu.unitepc.sisa.api.request.ScuPlanClaseDto.NotaDocenteSesionDto;
import bo.edu.unitepc.sisa.infrastructure.office.strategy.impl.PlanClasePracticoParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.io.ByteArrayInputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit and roundtrip tests verifying Apache POI export and re-import parity
 * for the 7-section practical lesson plan template (PLAN DE CLASES PRÁCTICO.xlsx).
 *
 * @author GentleAI SISA Architecture Team
 */
class PlanClasePracticoParserTest {

    private PlanClasePracticoParser parser;
    private OfficeTemplateService officeTemplateService;

    @BeforeEach
    void setUp() {
        DefaultResourceLoader resourceLoader = new DefaultResourceLoader();
        this.parser = new PlanClasePracticoParser(resourceLoader);
        this.officeTemplateService = new OfficeTemplateService(resourceLoader, null);
    }

    @Test
    @DisplayName("Should export and parse full 7-section practical plan with roundtrip parity")
    void shouldExportAndParseSevenSectionPracticalPlanRoundtrip() {
        // Arrange: Build 7-section practical plan DTO
        ScuPlanClaseDto plan = new ScuPlanClaseDto();
        plan.setTemplateType("PRACTICO");
        plan.setComponentType("PA");
        plan.setNombreHoja("UA-1 Práctica 1");

        // Section 1: Datos Generales
        plan.setNombreDocente("Ing. Carlos Alberto Morales Siles");
        plan.setNombreAsignatura("SIS-213 Programación III");
        plan.setFecha("2026-10-22");
        plan.setCarrera("Ingeniería de Sistemas");
        plan.setUnidadTitulo("UA-1 Arquitectura de Microservicios");
        plan.setElementoCompetencia("Diseña e implementa arquitecturas resilientes con servicios desacoplados");

        // Section 2: Datos de la Práctica
        plan.setTituloPractica("Práctica N° 1: Contenedores Docker y Orquestación");
        plan.setDuracionPractica("180 min");
        plan.setDuracionTotalMin(180);
        plan.setSemestre("5° Semestre");
        plan.setAmbiente("Laboratorio de Redes y Servidores");
        plan.setNroEstudiantes("25");

        // Section 3: Alineación y Recursos
        plan.setObjetivoAprendizaje("Configurar un cluster contenerizado con Docker Compose y redes virtuales");
        plan.setResultadosBloom("Aplica y analiza el aislamiento de red entre microservicios (Nivel Bloom: Aplicar/Analizar)");
        plan.setPreparacionMateriales("Descargar imágenes oficiales alpine y openjdk-21; repasar comandos Docker");
        plan.setEquipamiento("Laboratorio con red gigabit, tomas reguladas y 30 terminales con Docker Engine");
        plan.setEquipo("Servidores de desarrollo Ubuntu 24.04, Docker CLI y switches administrables");

        // Section 4: Modelo Metodológico (4 Fases)
        List<FaseMetodologicaDto> fases = List.of(
                FaseMetodologicaDto.builder()
                        .fase("Preparación")
                        .finalidad("Activar conocimientos previos y verificar entorno Docker")
                        .actividadDocente("Verificación de demonio docker activo y guía de laboratorio")
                        .actividadEstudiante("Prueba de ingreso, verificación de CLI y lectura de normas de seguridad")
                        .duracionMin(20)
                        .build(),
                FaseMetodologicaDto.builder()
                        .fase("Ejecución guiada")
                        .finalidad("Modelar composición multicontenedor con volumes y networks")
                        .actividadDocente("Demostración de sintaxis YAML, variables de entorno y compose up")
                        .actividadEstudiante("Reproducción del despliegue, inspección de puertos y logs")
                        .duracionMin(70)
                        .build(),
                FaseMetodologicaDto.builder()
                        .fase("Ejecución autónoma")
                        .finalidad("Despliegue independiente de stack web + postgres con persistencia")
                        .actividadDocente("Supervisión técnica, inyección de pruebas de fallo y asesoría")
                        .actividadEstudiante("Configuración de volumen persistente y verificación de datos")
                        .duracionMin(70)
                        .build(),
                FaseMetodologicaDto.builder()
                        .fase("Cierre")
                        .finalidad("Consolidación pedagógica, retroalimentación y entrega de bitácora")
                        .actividadDocente("Revisión de reportes, feedback sobre mejores prácticas y parada limpia")
                        .actividadEstudiante("Autoevaluación técnica, limpieza del entorno y entrega de informe")
                        .duracionMin(20)
                        .build()
        );
        plan.setFasesMetodologicas(fases);

        // Section 5: Evaluación de los Aprendizajes
        plan.setEvaluacionFormativaActividad("Observación directa de resolución de problemas en contenedor");
        plan.setEvaluacionFormativaInstrumento("Lista de cotejo procedimental de despliegue Docker");
        plan.setEvaluacionFormativaEvidencia("Bitácora de comandos ejecutados e historial de terminal");
        plan.setEvaluacionSumativaActividad("Prueba de integración de stack contenerizado funcional");
        plan.setEvaluacionSumativaInstrumento("Rúbrica analítica de arquitectura contenerizada");
        plan.setEvaluacionSumativaEvidencia("Informe técnico y repositorio de configuración compose");

        // Section 6: Desarrollo (5 pasos)
        List<DesarrolloPasoDto> pasos = List.of(
                DesarrolloPasoDto.builder()
                        .pasoNro(1)
                        .faseComun("Preparación")
                        .tiempoMin(15)
                        .actividad("Revisión de entorno Docker y credenciales de acceso")
                        .recursos("Terminal Linux, Docker Engine")
                        .otraInformacion("Verificar demonio docker activo")
                        .build(),
                DesarrolloPasoDto.builder()
                        .pasoNro(2)
                        .faseComun("Ejecución guiada")
                        .tiempoMin(25)
                        .actividad("Modelado de compose.yml con servicio backend y postgres")
                        .recursos("Proyector, guía de laboratorio")
                        .otraInformacion("Atender dudas de sintaxis YAML")
                        .build(),
                DesarrolloPasoDto.builder()
                        .pasoNro(3)
                        .faseComun("Ejecución autónoma")
                        .tiempoMin(60)
                        .actividad("Implementación de stack con base de datos PostgreSQL persistente")
                        .recursos("Workstations, red de laboratorio")
                        .otraInformacion("Configurar healthcheck y named volumes")
                        .build(),
                DesarrolloPasoDto.builder()
                        .pasoNro(4)
                        .faseComun("Ejecución autónoma")
                        .tiempoMin(60)
                        .actividad("Pruebas de tolerancia a fallos e inyección de caídas")
                        .recursos("Docker stats, logs interactivos")
                        .otraInformacion("Validar reconexión automática de servicios")
                        .build(),
                DesarrolloPasoDto.builder()
                        .pasoNro(5)
                        .faseComun("Cierre")
                        .tiempoMin(20)
                        .actividad("Conclusiones técnicas, reporte final y parada limpia de contenedores")
                        .recursos("Ficha de evaluación")
                        .otraInformacion("Asegurar eliminación de recursos temporales")
                        .build()
        );
        plan.setPasosDesarrollo(pasos);

        // Section 7: Notas del Docente (Sesiones 1.0, 2.0, 3.0)
        List<NotaDocenteSesionDto> notas = List.of(
                NotaDocenteSesionDto.builder().sesionNro(1.0).nota("Sesión 1 ejecutada con éxito. Excelente comprensión de la sintaxis Docker Compose.").build(),
                NotaDocenteSesionDto.builder().sesionNro(2.0).nota("Sesión 2: Se requirió reforzar conceptos de redes virtuales tipo bridge y overlay.").build(),
                NotaDocenteSesionDto.builder().sesionNro(3.0).nota("Sesión 3: Todos los equipos completaron el despliegue con persistencia de datos.").build()
        );
        plan.setNotasDocente(notas);
        plan.syncToNested();

        // Act 1: Generate Excel binary stream via PlanClasePracticoParser
        byte[] xlsxBytes = parser.generate(List.of(plan), Collections.emptyMap());
        assertNotNull(xlsxBytes, "Generated XLSX byte array should not be null");
        assertTrue(xlsxBytes.length > 1000, "Generated XLSX should contain valid spreadsheet bytes");

        // Act 2: Re-parse the generated byte array back into ScuPlanClaseDto
        List<ScuPlanClaseDto> reimportedPlanes = parser.parse(new ByteArrayInputStream(xlsxBytes), "Plan_Clase_Practico_SIS213.xlsx");
        assertNotNull(reimportedPlanes);
        assertEquals(1, reimportedPlanes.size(), "Should parse exactly one practical plan sheet");

        ScuPlanClaseDto parsed = reimportedPlanes.get(0);

        // Assert Section 1: Datos Generales
        assertEquals("Ing. Carlos Alberto Morales Siles", parsed.getNombreDocente());
        assertEquals("SIS-213 Programación III", parsed.getNombreAsignatura());
        assertEquals("2026-10-22", parsed.getFecha());
        assertEquals("Ingeniería de Sistemas", parsed.getCarrera());
        assertEquals("UA-1 Arquitectura de Microservicios", parsed.getUnidadTitulo());
        assertEquals("Diseña e implementa arquitecturas resilientes con servicios desacoplados", parsed.getElementoCompetencia());

        // Assert Section 2: Datos de la Práctica
        assertEquals("Práctica N° 1: Contenedores Docker y Orquestación", parsed.getTituloPractica());
        assertEquals("5° Semestre", parsed.getSemestre());
        assertEquals("Laboratorio de Redes y Servidores", parsed.getAmbiente());
        assertEquals("25", parsed.getNroEstudiantes());
        assertEquals(180, parsed.getDuracionTotalMin());

        // Assert Section 3: Alineación y Recursos
        assertEquals("Configurar un cluster contenerizado con Docker Compose y redes virtuales", parsed.getObjetivoAprendizaje());
        assertEquals("Aplica y analiza el aislamiento de red entre microservicios (Nivel Bloom: Aplicar/Analizar)", parsed.getResultadosBloom());
        assertEquals("Descargar imágenes oficiales alpine y openjdk-21; repasar comandos Docker", parsed.getPreparacionMateriales());
        assertEquals("Laboratorio con red gigabit, tomas reguladas y 30 terminales con Docker Engine", parsed.getEquipamiento());
        assertEquals("Servidores de desarrollo Ubuntu 24.04, Docker CLI y switches administrables", parsed.getEquipo());

        // Assert Section 4: Modelo Metodológico (4 Fases x 3 Cols)
        assertNotNull(parsed.getFasesMetodologicas(), "Fases metodológicas should not be null");
        assertEquals(4, parsed.getFasesMetodologicas().size(), "Must extract 4 methodological phases");
        assertEquals("Preparación", parsed.getFasesMetodologicas().get(0).getFase());
        assertEquals("Activar conocimientos previos y verificar entorno Docker", parsed.getFasesMetodologicas().get(0).getFinalidad());
        assertEquals("Verificación de demonio docker activo y guía de laboratorio", parsed.getFasesMetodologicas().get(0).getActividadDocente());
        assertEquals("Prueba de ingreso, verificación de CLI y lectura de normas de seguridad", parsed.getFasesMetodologicas().get(0).getActividadEstudiante());

        assertEquals("Ejecución guiada", parsed.getFasesMetodologicas().get(1).getFase());
        assertEquals("Ejecución autónoma", parsed.getFasesMetodologicas().get(2).getFase());
        assertEquals("Cierre", parsed.getFasesMetodologicas().get(3).getFase());

        // Assert Section 5: Evaluación de los Aprendizajes
        assertEquals("Observación directa de resolución de problemas en contenedor", parsed.getEvaluacionFormativaActividad());
        assertEquals("Lista de cotejo procedimental de despliegue Docker", parsed.getEvaluacionFormativaInstrumento());
        assertEquals("Bitácora de comandos ejecutados e historial de terminal", parsed.getEvaluacionFormativaEvidencia());
        assertEquals("Prueba de integración de stack contenerizado funcional", parsed.getEvaluacionSumativaActividad());
        assertEquals("Rúbrica analítica de arquitectura contenerizada", parsed.getEvaluacionSumativaInstrumento());
        assertEquals("Informe técnico y repositorio de configuración compose", parsed.getEvaluacionSumativaEvidencia());

        // Assert Section 6: Desarrollo (Dynamic Steps)
        assertNotNull(parsed.getPasosDesarrollo(), "Pasos desarrollo should not be null");
        assertEquals(5, parsed.getPasosDesarrollo().size(), "Must parse 5 steps");
        int totalStepTime = parsed.getPasosDesarrollo().stream().mapToInt(DesarrolloPasoDto::getTiempoMin).sum();
        assertEquals(180, totalStepTime, "Cumulative step duration must sum to 180 min");
        assertEquals("Preparación", parsed.getPasosDesarrollo().get(0).getFaseComun());
        assertEquals("Revisión de entorno Docker y credenciales de acceso", parsed.getPasosDesarrollo().get(0).getActividad());
        assertEquals("Terminal Linux, Docker Engine", parsed.getPasosDesarrollo().get(0).getRecursos());
        assertEquals("Verificar demonio docker activo", parsed.getPasosDesarrollo().get(0).getOtraInformacion());

        // Assert Section 7: Notas del Docente (Sesiones 1.0, 2.0, 3.0)
        assertNotNull(parsed.getNotasDocente(), "Notas docente should not be null");
        assertEquals(3, parsed.getNotasDocente().size(), "Must have notes for 3 sessions");
        NotaDocenteSesionDto n1 = parsed.getNotasDocente().stream().filter(n -> Math.round(n.getSesionNro()) == 1).findFirst().orElse(null);
        assertNotNull(n1);
        assertEquals("Sesión 1 ejecutada con éxito. Excelente comprensión de la sintaxis Docker Compose.", n1.getNota());

        NotaDocenteSesionDto n2 = parsed.getNotasDocente().stream().filter(n -> Math.round(n.getSesionNro()) == 2).findFirst().orElse(null);
        assertNotNull(n2);
        assertEquals("Sesión 2: Se requirió reforzar conceptos de redes virtuales tipo bridge y overlay.", n2.getNota());

        NotaDocenteSesionDto n3 = parsed.getNotasDocente().stream().filter(n -> Math.round(n.getSesionNro()) == 3).findFirst().orElse(null);
        assertNotNull(n3);
        assertEquals("Sesión 3: Todos los equipos completaron el despliegue con persistencia de datos.", n3.getNota());
    }

    @Test
    @DisplayName("Should export via OfficeTemplateService and maintain parity with 7 sections")
    void shouldExportViaOfficeTemplateServiceAndMaintainParity() throws Exception {
        ScuPlanClaseDto plan = new ScuPlanClaseDto();
        plan.setTemplateType("PRACTICO");
        plan.setNombreDocente("Ing. Carlos Morales");
        plan.setNombreAsignatura("SIS-213");
        plan.setCarrera("Ingeniería de Sistemas");
        plan.setTituloPractica("Práctica de Enrutamiento OSPF");
        plan.setAmbiente("Laboratorio Cisco");
        plan.setNroEstudiantes("20");
        plan.setDuracionTotalMin(120);

        plan.setFasesMetodologicas(List.of(
                FaseMetodologicaDto.builder().fase("Preparación").finalidad("Intro OSPF").actividadDocente("Docente explica").actividadEstudiante("Estudiante atiende").duracionMin(15).build(),
                FaseMetodologicaDto.builder().fase("Ejecución guiada").finalidad("Guía OSPF").actividadDocente("Docente guía").actividadEstudiante("Estudiante configura").duracionMin(45).build(),
                FaseMetodologicaDto.builder().fase("Ejecución autónoma").finalidad("Autónomo OSPF").actividadDocente("Docente evalúa").actividadEstudiante("Estudiante depura").duracionMin(45).build(),
                FaseMetodologicaDto.builder().fase("Cierre").finalidad("Cierre OSPF").actividadDocente("Docente cierra").actividadEstudiante("Estudiante documenta").duracionMin(15).build()
        ));

        plan.setEvaluacionFormativaActividad("Evaluación continua OSPF");
        plan.setEvaluacionFormativaInstrumento("Checklist");
        plan.setEvaluacionFormativaEvidencia("Running config");

        plan.setEvaluacionSumativaActividad("Topología completa");
        plan.setEvaluacionSumativaInstrumento("Rúbrica OSPF");
        plan.setEvaluacionSumativaEvidencia("Capturas Wireshark y ping");

        plan.setPasosDesarrollo(List.of(
                DesarrolloPasoDto.builder().pasoNro(1).faseComun("Preparación").tiempoMin(15).actividad("Encendido de routers").recursos("Routers 2901").otraInformacion("Cables serie").build(),
                DesarrolloPasoDto.builder().pasoNro(2).faseComun("Ejecución guiada").tiempoMin(45).actividad("Configuración de áreas").recursos("Cisco IOS").otraInformacion("Area 0").build(),
                DesarrolloPasoDto.builder().pasoNro(3).faseComun("Ejecución autónoma").tiempoMin(45).actividad("Pruebas de adyacencia").recursos("Show ip ospf neighbor").otraInformacion("Validar full state").build(),
                DesarrolloPasoDto.builder().pasoNro(4).faseComun("Cierre").tiempoMin(15).actividad("Entrega de topología").recursos("PC terminal").otraInformacion("Guardar startup").build()
        ));

        plan.setNotasDocente(List.of(
                NotaDocenteSesionDto.builder().sesionNro(1.0).nota("Práctica de OSPF completada en tiempo y forma.").build()
        ));

        Map<String, String> meta = new HashMap<>();
        meta.put("carrera", "Ingeniería de Sistemas");
        meta.put("asignatura", "Programación III");

        byte[] exported = officeTemplateService.exportPlanClasesXlsx(plan, "PRACTICO", meta);
        assertNotNull(exported);
        assertTrue(exported.length > 1000);

        List<ScuPlanClaseDto> reimported = parser.parse(new ByteArrayInputStream(exported), "test_ospf.xlsx");
        assertNotNull(reimported);
        assertEquals(1, reimported.size());

        ScuPlanClaseDto p = reimported.get(0);
        assertEquals("Práctica de Enrutamiento OSPF", p.getTituloPractica());
        assertEquals("Laboratorio Cisco", p.getAmbiente());
        assertEquals(4, p.getFasesMetodologicas().size());
        assertEquals(4, p.getPasosDesarrollo().size());
        assertEquals(1, p.getNotasDocente().size());
        assertEquals("Práctica de OSPF completada en tiempo y forma.", p.getNotasDocente().get(0).getNota());
    }
}
