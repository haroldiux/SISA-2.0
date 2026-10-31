# SISA 2.0 — Guía Operativa Institucional
**Sistema Integral de Seguimiento Académico y Supervisión Curricular**  
**Universidad Técnica Privada Cosmos (UNITEPC)**  
*Manual de Usuario y Operación para Docentes y Directores de Carrera*

---

## 1. Introducción y Acceso al Sistema

**SISA 2.0** unifica el trabajo docente de aula y la supervisión directiva en una sola plataforma web, conectada en tiempo real con las cátedras y horarios oficiales del **Sistema de Educación Académica (SEA)** de UNITEPC.

- **URL de Acceso Local**: [http://localhost:4200](http://localhost:4200)
- **API Backend**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

### Perfiles de Acceso:
| Perfil | Rol en SISA | Flujo Principal | Credenciales Demo |
|:---|:---|:---|:---|
| **Docente** | `ROLE_DOCENTE` | Carpeta Docente (5 Documentos) | CI: `3065087` / `3065087` (Ing. Rosmery Luizaga) |
| **Director de Carrera** | `ROLE_DIR_CARRERA` | Supervisión Curricular y Semáforo | `dir.carrera.sis` / `Unitepc2026!` |
| **Administrador / Vicerrector** | `ROLE_ADMIN` | Control Nacional (9 Sedes, 24 Carreras) | `admin` / `Unitepc2026!` |

---

## 2. Guía Paso a Paso para el Docente (Carpeta Docente)

Al iniciar sesión como docente, accedes directamente a la **Carpeta Docente (Vista 1)**. En el panel lateral izquierdo verás tus asignaturas asignadas oficialmente por el SEA con su distintivo de sede, campus y comisiones asignadas (ej. `SIS-113 PROGRAMACIÓN I • 2 Comisiones: TA-01 Teoría • PL-01 Práctica`).

La carpeta docente se compone de **5 pestañas secuenciales**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [1. Prog. Analítico] [2. PAC Pedagógico] [3. Cronograma] [4. Planes Clase] [5. Lista]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Paso 1: Documento 1 — Programa Analítico (.docx)
1. Haz clic en la pestaña **1. Programa Analítico .docx**.
2. **Estructura Oficial de 14 Puntos**:
   - Visualiza la Caracterización de la Asignatura, Competencias, Unidades de Aprendizaje, Metodología y Bibliografía bajo normas APA 7ma Edición.
3. **Importación Inteligente desde Word**:
   - Si tu carrera ya cuenta con el Programa Analítico oficial en formato Word, haz clic en **"Importar Prog. Analítico (.docx)"**.
   - Selecciona el archivo Word (`.docx`). El sistema extraerá automáticamente las Unidades Temáticas, Temas Específicos y Elementos de Competencia, guardándolos en base de datos.
4. **Exportar Carátula Oficial**:
   - Presiona el botón verde **"Exportar Word (.docx)"** para descargar el documento institucional listo para impresión o firma.

---

### Paso 2: Documento 2 — PAC Pedagógico (Puntos 1 a 14)
1. Haz clic en la pestaña **2. PAC - Pedagógico Ptos 1-14**.
2. Revisa la articulación pedagógica de la asignatura:
   - Objetivos holísticos, metodologías activas y criterios de evaluación.
3. Si la materia tiene componente práctico, el selector superior te permite alternar entre el **PAC General (Teórico)** y el **PAC Práctico**.
4. Haz clic en **"Guardar PAC"** para preservar cualquier observación o enriquecimiento didáctico.

---

### Paso 3: Documento 3 — Cronograma Semestral de 20 Semanas (Matriz 7)
1. Haz clic en la pestaña **3. Cronograma (20 Semanas) Matriz 7**.
2. **Modalidad Teórica (Matriz 7 de Aula)**:
   - Muestra el cronograma oficial de 20 semanas lectivas con sus columnas reglamentarias:
     `Semana | N° Sesión | Unidad Temática | Contenido Específico | Saberes (Conceptual, Procedimental, Actitudinal) | Criterio de Desempeño | Instrumento de Evaluación`
   - Para cargar el cronograma oficial desde la planilla Excel de la cátedra, presiona **"Cargar desde PAC General (.xlsx)"**.
3. **Modalidad Práctica (Sección 8 del PAC Práctico)**:
   - Haz clic en el botón verde **"Cronograma Práctico (Laboratorio / Simulación)"**.
   - Visualiza la programación de guías de laboratorio:
     `Semana | N° Práctica | Título de la Práctica | Actividad de Laboratorio | Desempeño Procedimental | Instrumento | Evidencias`
   - Carga la programación práctica con el botón **"Cargar desde PAC Práctico (.xlsx)"**.

---

### Paso 4: Documento 4 — Planes de Clase Teóricos y Prácticos
1. Haz clic en la pestaña **4. Planes de Clase .xlsx**.
2. **Navegación por Unidades de Aprendizaje**:
   - Utiliza los botones superiores de Unidad (ej. `UA-1: CONCEPTOS FUNDAMENTALES`, `UA-2: ESTRUCTURAS SELECTIVAS`, `UA-3: MATRICES`) para alternar rápidamente entre los bloques temáticos.
3. **Conmutación Teórico / Práctico**:
   - Alterna entre **"Plan Teórico (TA)"** y **"Guía Práctica (PL/PA)"**.
4. **Sincronización con el Programa Analítico**:
   - Presiona el botón **"Sincronizar con Programa"** para que los planes de clase se deriven automáticamente a partir de los temas y saberes del Programa Analítico.
5. **Exportación Oficial Multi-Hoja**:
   - Haz clic en **"Exportar Plan Teórico (.xlsx)"** o **"Exportar Plan Práctico (.xlsx)"** para descargar el libro Excel institucional con una pestaña dedicada por sesión didáctica.

---

### Paso 5: Documento 5 — Lista Oficial y Control de Asistencia en Aula
Esta es la herramienta operativa diaria del docente en clase. Diseñada para un **registro ultra-rápido en menos de 5 segundos**:

1. **Selección Inteligente de la Sesión Oficial**:
   - En el menú desplegable **"Sesión Oficial SEA"**, selecciona la clase que estás impartiendo (ej. `Sesión 1: Lunes 03/08/2026 • 11:15-12:45 • TA-01`).
   - Las insignias contiguas se sincronizan de inmediato:
     - **Modalidad**: Insignia azul para *Teórica (TA-01)* o púrpura para *Práctica / Lab (PL-01)*.
     - **Horario**: Día y franja horaria oficial asignada por el SEA.
     - **Aula**: Aula o Laboratorio físico (ej. *C 103* o *INFORMATICA*).
   - El campo **Tema / Contenido** se auto-completa con el tema planificado en la Matriz 7 o Sección 8.

2. **Panel de Macroplanificación Oficial (Sincronización Automática)**:
   - **En Sesión Teórica**: Despliega la Matriz 7 con los Saberes Conceptual, Procedimental y Actitudinal, Criterio de Desempeño e Instrumento reglamentario.
   - **En Sesión Práctica**: Conmuta automáticamente al PAC Práctico, mostrando la Actividad de Laboratorio, Desempeño Procedimental, Evidencias requeridas y Rúbrica de Laboratorio.

3. **Panel de Seguimiento Pedagógico (5 Momentos Oficiales UNITEPC)**:
   - Confirma el desarrollo de la **Secuencia Didáctica Oficial**:
     - `[✓] Introducción (15')` — Motivación y encuadre inicial.
     - `[✓] Resultados / Logros (10')` — Logros esperados de clase.
     - `[✓] Contenidos de la Clase (15')` — Mapa temático y saberes.
     - `[✓] Cuerpo de Contenidos (40')` — Construcción y desarrollo activo.
     - `[✓] Conclusión o Cierre (10')` — Síntesis plenaria y evaluación formativa.
   - Selecciona el nivel de cumplimiento: **Totalmente Cumplido**, **Parcialmente Cumplido** o **No Cumplido**.
   - Marca los recursos didácticos empleados (Pizarra, Proyector, Guía Lab, IDE / Código, Moodle).
   - Presiona **"Guardar Seguimiento de Clase"**.

4. **Llamada de Lista y Regla del 80% (UNITEPC)**:
   - Justo encima de la lista de estudiantes cuentas con los botones de acción rápida:
     - **"⚡ Marcar Todos Presentes"**: Marca la asistencia de toda la nómina en un solo clic.
     - **Botones individuales**: Para cada estudiante puedes alternar entre `P` (Presente), `F` (Falta), `A` (Atraso) o `L` (Licencia). Si marcas Falta o Licencia, puedes escribir una breve justificación en el campo contiguo.
   - **Segregación por Carrera en Cátedras Comunes**:
     - Los estudiantes aparecen agrupados automáticamente por su carrera de origen (ej. *Licenciatura en Ing. de Sistemas* y *Licenciatura en Ing. Electrónica*). Puedes filtrar por carrera mediante los botones de cohorte superiores.
   - **Semáforo de Cumplimiento (Regla del 80%)**:
     - La última columna evalúa en tiempo real si el estudiante mantiene el >= 80% de asistencia obligatoria para habilitación a exámenes finales (`✓ Habilitado (100%)` o `⚠️ Inhabilitado (< 80%)`).
   - Presiona **"Guardar Asistencia"** para persistir la nómina en PostgreSQL y el almacenamiento local seguro.
   - Puedes descargar la planilla oficial en cualquier momento con **"Exportar Excel"**.

---

## 3. Guía Paso a Paso para el Director de Carrera (Supervisión Curricular)

Al iniciar sesión como Director de Carrera (`dir.carrera.sis`), el sistema te sitúa en la **Supervisión Curricular (Vista 2)**.

### Paso 1: Selección de Sede y Carrera en Auditoría
1. En la barra superior, si administras varias carreras (ej. *Ingeniería de Sistemas* e *Ingeniería Electrónica*), utiliza el selector para alternar entre tus programas académicos.
2. Si tienes sedes asignadas, el selector de sede te permite fiscalizar cada campus universitario.

### Paso 2: Semáforo Curricular de Avance
1. En el encabezado verás el **Semáforo Curricular de la Carrera**:
   - **Verde (>= 80%)**: Cátedras con avance pedagógico y registro de aula óptimo.
   - **Amarillo (60% - 79%)**: Cátedras con desfase preventivo o pendientes de registro.
   - **Rojo (< 60%)**: Cátedras en alerta crítica por retraso en la Matriz 7 o falta de registro de clases.
2. El tablero muestra la trazabilidad del cumplimiento de los **5 momentos pedagógicos** por docente y los recursos didácticos más utilizados.

### Paso 3: Auditoría del Dossier por Asignatura
1. En la **Malla Curricular por Semestres**, haz clic sobre cualquier asignatura para auditar su estado:
   - Detección automática de componentes:
     - **Teórica Pura**: Exige Programa Analítico, PAC Teórico y Planes de Clase Teóricos (PAC Práctico queda en `N/A`).
     - **Teórico-Práctica**: Exige el dossier completo (Programa, PAC Teórico, PAC Práctico, Planes Teóricos y Guías Prácticas de Laboratorio).
2. Haz clic en **"Auditar Cátedra"** para ingresar en modo auditor y revisar los contenidos específicos elaborados por el docente.

### Paso 4: Aprobación en Lote y Dictamen Semestral
1. Puedes aprobar individualmente un documento con el botón **"Visar Documento"**.
2. Para visar la planificación de todo el semestre de una vez, presiona **"Aprobar Semestre Completo en Lote"**.
3. Presiona **"Imprimir / Descargar Reporte Curricular PDF"** para generar el acta oficial con firmas y estado de cumplimiento de todas las asignaturas de la carrera.

---

## 4. Despliegue, Operación Técnica y Troubleshooting

### Comandos de Ejecución con Docker:

```bash
# 1. Iniciar base de datos y backend
docker compose up -d postgres backend

# 2. Reconstruir frontend con los últimos cambios y levantarlo
docker compose build frontend
docker compose up -d --no-deps frontend

# 3. Comprobar estado de los servicios
docker compose ps
```

### Comprobaciones Rápidas:
- **Verificar Frontend**:
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing
  ```
- **Verificar API Backend**:
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:8080/api/v1/catalogo-academico/status" -UseBasicParsing
  ```

### Solución de Problemas Frecuentes:
1. **La página no refleja los últimos cambios de diseño**:
   - Presiona `Ctrl + F5` (o `Cmd + Shift + R`) en el navegador para forzar la recarga del caché de Nginx.
2. **El SEA Gateway central está caído o fuera de línea**:
   - SISA 2.0 cuenta con **Modo Local Seguro**. Si el servidor central responde con HTTP 504 o está desconectado, el sistema conmuta automáticamente al almacenamiento local y te permite seguir pasando lista y guardando el seguimiento sin perder ningún dato.
3. **Persistencia tras recargar la página**:
   - Al presionar `F5`, SISA 2.0 conserva exactamente la vista (Carpeta Docente vs Supervisión), la materia que estabas auditando y la pestaña activa (Documento 1 al 5).
