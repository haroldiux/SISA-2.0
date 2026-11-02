# SISA 2.0 — Guía Operativa y Manual de Evaluación Directiva
**Sistema Integral de Seguimiento Académico y Supervisión Curricular**  
**Universidad Técnica Privada Cosmos (UNITEPC)**  
*Manual Oficial de Instalación, Siembra de Datos (Seeder) y Guía de Pruebas para Directores de Carrera*

---

## 1. Requisitos Previos del Sistema

Antes de iniciar, la computadora (Windows, Linux o macOS) debe contar con:
1. **Docker Desktop** (con soporte WSL2 en Windows) o **Docker Engine + Docker Compose** en Linux.
   - Asegúrate de que Docker Desktop esté abierto y en ejecución.
2. **Git** para clonar el repositorio.
3. **Puertos Libres Requeridos**:
   - `4200`: Frontend Web Angular / Nginx.
   - `8080`: Backend API Spring Boot.
   - `5432`: Base de Datos PostgreSQL.
   *(Si tienes un PostgreSQL local instalado en tu máquina ocupando el puerto 5432, detén el servicio local temporalmente o cámbialo en `docker-compose.yml`)*.

---

## 2. Instalación y Puesta en Marcha (Paso a Paso)

### Paso 1: Clonar el Repositorio
Abre tu terminal (PowerShell, CMD, Git Bash o Terminal de Linux/Mac) y ejecuta:

```bash
git clone https://github.com/haroldiux/SISA-2.0.git
cd "SISA 2.0"
# (o el nombre de la carpeta clonada: cd SISA-2.0)
```

---

### Paso 2: Levantar el Stack Completo con Docker Compose
Ejecuta el siguiente comando para construir y desplegar los 3 contenedores:

```bash
docker compose up -d --build
```

> **¿Qué hace este comando?**
> 1. Descarga y levanta **PostgreSQL 16** (`sisa-postgres`) creando la base de datos `sisa_db`.
> 2. Compila el backend en **Spring Boot 3.3.3** (`sisa-backend`), conectándose automáticamente a Postgres y ejecutando **Flyway**, que aplica las migraciones de esquema `V1` a `V10` y el **Seeder Universal V9** con todos los datos institucionales de prueba.
> 3. Compila el frontend en **Angular 15** en modo producción (`sisa-frontend`) y lo sirve con **Nginx** de alto rendimiento en el puerto `4200`.

---

### Paso 3: Verificar el Estado de los Contenedores
Verifica que los tres servicios estén arriba y saludables:

```bash
docker compose ps
```

Deberías ver una salida similar a:
```text
NAME            IMAGE                  COMMAND                  SERVICE      STATUS                    PORTS
sisa-backend    sisa2-backend:latest   "java -jar /app/app.…"   backend      Up (healthy)              0.0.0.0:8080->8080/tcp
sisa-frontend   sisa2-frontend:latest  "/docker-entrypoint.…"   frontend     Up                        0.0.0.0:4200->80/tcp
sisa-postgres   postgres:16-alpine     "docker-entrypoint.s…"   postgres     Up (healthy)              0.0.0.0:5432->5432/tcp
```

---

## 3. Arquitectura de Datos: Sincronización Oficial con el SEA (SSOT) vs Espejo Local

### Principio Arquitectónico Fundamental (UNITEPC):
> **El SEA (Sistema de Educación / Académico de UNITEPC) es la Fuente Única de la Verdad (Single Source of Truth - SSOT).**  
> SISA 2.0 **NO** es un ERP administrativo ni crea docentes, materias, grupos ni estudiantes por su cuenta. SISA es el **Sistema de Seguimiento Académico y Supervisión Curricular**: consume y sincroniza en tiempo real todo el catálogo institucional desde el Gateway Central del SEA (`https://gw-dev.unitepc.solutions`), autoprovisiona los accesos de los docentes según su CI y gestiona lo que el SEA no contiene: la Secuencia Didáctica de 5 Momentos, las auditorías de aula, los planes de clase (PAC / Programa Analítico) y el Semáforo Curricular.

---

### Flujo Oficial 1: Sincronización en Vivo desde el Servidor Central SEA

Al iniciar el backend, SISA se conecta automáticamente mediante **OAuth 2.0 M2M** con el Gateway central de UNITEPC. Si deseas forzar o actualizar la sincronización de sedes, carreras, asignaturas del pensum, grupos, horarios, nóminas de alumnos y docentes en cualquier momento, dispones de tres vías inmediatas:

#### Opción A (Desde la Interfaz Web - 1 Clic):
En el encabezado superior de la aplicación web ([http://localhost:4200](http://localhost:4200)), presiona el botón:  
**`🟢 Sincronizar SEA`**  
El sistema contactará al Gateway, actualizará los registros locales y mostrará la notificación con el total de carreras, materias, grupos y docentes sincronizados.

#### Opción B (Script de Sincronización Oficial por Terminal):
- **En Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\sync-sea.ps1
  ```
- **En Linux / macOS / Git Bash**:
  ```bash
  chmod +x sync-sea.sh && ./sync-sea.sh
  ```

#### Opción C (Endpoint REST API):
```bash
curl -X POST "http://localhost:8080/api/v1/catalogo-academico/sync?branchOfficeCode=CBA&term=2-2026"
```

---

### Flujo Oficial 2: Espejo Local de Respaldo y Simulación Offline (Fallback Sandbox)

¿Cuándo se utiliza el script `seed-db.ps1` / `seed-db.sh`?  
Únicamente en dos escenarios muy específicos:
1. **Evaluación Offline / Sin Conexión a Internet**: Si la computadora donde se prueba el sistema no tiene salida a internet hacia `https://gw-dev.unitepc.solutions`, o el Gateway central está en ventana de mantenimiento. SISA activa su patrón de resiliencia **Cache-Aside / Local Mirroring** para permitir que el evaluador siga navegando sin interrupciones.
2. **Calibración del Semáforo Curricular**: El SEA administra matrículas y docentes, pero **no** almacena el seguimiento minuto a minuto de los 5 momentos ni el histórico de clases impartidas. Este script inyecta sesiones históricas simuladas para que el Semáforo de la Carrera muestre inmediatamente los estados Verde, Amarillo y Rojo.

- **Para ejecutar el espejo local de respaldo**:
  - En Windows: `powershell -ExecutionPolicy Bypass -File .\seed-db.ps1`
  - En Linux/Mac: `./seed-db.sh`
- **Reinicio total limpio (Borra volúmenes)**:
  ```bash
  docker compose down -v && docker compose up -d --build
  ```

---

## 4. Credenciales Oficiales de Evaluación

Abre tu navegador web en: **[http://localhost:4200](http://localhost:4200)**

| Perfil de Evaluación | Usuario | Contraseña | Nombre y Rol Institucional |
|:---|:---:|:---:|:---|
| **Director de Carrera (EVALUADOR PRINCIPAL)** | `dir.carrera.sis` | `Unitepc2026!` | **Lic. Mariana Ríos Vargas**<br>Directora Multicarrera (Sistemas y Medicina, Sede Cochabamba, Campus Juan Pablo II) |
| **Docente de Aula** | `3065087` | `3065087` | **Ing. Rosmery Luizaga**<br>Docente de Programación I, Programación III y Base de Datos I |
| **Administrador Nacional** | `admin` | `Unitepc2026!` | **Administrador Nacional UNITEPC**<br>Acceso irrestricto a las 9 Sedes y 24 Carreras |

---

## 5. Ruta de Evaluación Paso a Paso para el Director de Carrera

Sigue esta secuencia para auditar todas las funcionalidades pedagógicas y de gobernanza de **SISA 2.0**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DEL DIRECTOR DE CARRERA                   │
│                                                                        │
│  1. Iniciar Sesión como Director (`dir.carrera.sis`)                   │
│  2. Supervisión Curricular (Vista 2) → Semáforo por Colores            │
│  3. Auditoría de los 5 Momentos Pedagógicos y Recursos en Aula         │
│  4. Malla Semestral → Detección Teórica vs Práctica y Aprobación Lote │
│  5. Auditoría de Cátedra → Microplanificación y 20 Semanas             │
│  6. Control de Asistencia → Regla del 80% y Aislamiento por Sesión     │
│  7. Prueba de Contraste → Iniciar sesión como Docente (`3065087`)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Prueba 1: Ingreso a la Supervisión Curricular (Vista 2)
1. Ingresa a [http://localhost:4200](http://localhost:4200) con:
   - **Usuario**: `dir.carrera.sis`
   - **Contraseña**: `Unitepc2026!`
2. Observa la pantalla principal: el sistema reconoce automáticamente a la **Directora de Carrera** y la sitúa en la **Supervisión Curricular (Vista 2)**.
3. En la barra superior, comprueba la gobernanza multicarrera:
   - Despliega el selector de **Carrera**: verás que solo puedes alternar entre **Licenciatura en Ingeniería de Sistemas** y **Licenciatura en Medicina** (aislamiento estricto por gobernanza RBAC).
   - El selector de **Sede** se encuentra bloqueado con candado en `CBA • Sede Cochabamba (Campus Juan Pablo II)`.

---

### Prueba 2: Auditoría del Semáforo Curricular en Tiempo Real
En la parte superior de la Vista 2 encontrarás el **Semáforo Curricular de la Carrera**:

1. **Indicadores de Cumplimiento por Cátedra**:
   - `SIS-213 PROGRAMACIÓN III` (Docente: Rosmery Luizaga): **Color VERDE** (Avance pedagógico óptimo >= 80% conforme a lo planificado).
   - `SIS-311 BASE DE DATOS I` (Docente: Rosmery Luizaga): **Color AMARILLO** (Alerta preventiva, avance entre 60% y 79%).
   - `MAT-101 CÁLCULO I`: **Color ROJO** (Retraso crítico < 60%, alerta de intervención directiva).
2. **Métricas de la Secuencia Didáctica (5 Momentos Oficiales)**:
   - Comprueba las barras estadísticas que auditan el cumplimiento en aula de los 5 momentos normativos de UNITEPC:
     1. *Inicio / Motivación* (15 min)
     2. *Resultados de Aprendizaje / Logros* (10 min)
     3. *Contenidos de la Clase* (15 min)
     4. *Cuerpo de Contenidos* (40 min)
     5. *Conclusión o Cierre* (10 min)
3. **Métricas de Recursos Didácticos**:
   - Observa la frecuencia de uso de recursos: Pizarra Acrílica, Diapositivas, Proyector Multimedia, Guías de Laboratorio, IDE/Código Fuente y Moodle.

---

### Prueba 3: Malla Curricular Semestral y Dictamen en Lote
1. En la tabla central, navega por los semestres de la carrera (1º al 8º Semestre en Sistemas; 1º al 10º Semestre en Medicina).
2. **Detección Automática de Modalidad**:
   - Comprueba cómo el motor curricular analiza los grupos del SEA:
     - Asignaturas teóricas puras marcan el PAC Práctico en `N/A`.
     - Asignaturas de especialidad con carga de laboratorio exigen el dossier completo (Programa Analítico, PAC Teórico, PAC Práctico, Planes Teóricos y Guías Prácticas).
3. **Aprobación Semestral en Lote**:
   - Haz clic en **"Aprobar Semestre Completo en Lote"**.
   - Se abrirá el modal directivo para emitir la resolución curricular del semestre.
4. **Descargar Reporte PDF**:
   - Presiona **"Imprimir / Descargar Reporte Curricular PDF"** para obtener el acta curricular de la carrera con fechas de corte y firmas institucionales.

---

### Prueba 4: Auditoría en Modo Cátedra (Carpeta Docente)
Como Director de Carrera, puedes auditar cualquier materia haciendo clic en **"Auditar Cátedra"** o seleccionándola en el menú lateral:

1. Selecciona la materia `SIS-113 PROGRAMACIÓN I`.
2. **Pestaña 1 (Programa Analítico)**:
   - Observa el formato oficial de 14 puntos, las 6 Unidades de Aprendizaje y los 9 temas específicos.
   - Verifica que como Director tienes la insignia dorada `Consenso Cátedra`.
3. **Pestaña 2 (PAC Pedagógico)**:
   - Revisa la articulación pedagógica de los puntos 1 al 14.
4. **Pestaña 3 (Cronograma 20 Semanas)**:
   - Alterna entre **"Cronograma Teórico (Matriz 7)"** y **"Cronograma Práctico (Laboratorio / Simulación)"**.
   - Comprueba que la Matriz 7 desglosa los saberes (conceptual, procedimental, actitudinal) y la sección práctica desglosa las actividades de laboratorio y evidencias.
5. **Pestaña 4 (Planes de Clase)**:
   - Alterna por las Unidades de Aprendizaje (`UA-1`, `UA-2`, `UA-3: MATRICES`).
   - Alterna entre el **Plan Teórico (TA)** y la **Guía Práctica (PL/PA)**.
   - Prueba el botón **"Exportar Plan Teórico (.xlsx)"** para descargar el Excel multi-hoja.

---

### Prueba 5: Control de Asistencia y Seguimiento en Aula (Pestaña 5)
Entra en la pestaña **5. Lista y Asistencia**:

1. **Prueba de Conmutación Dinámica de Sesiones**:
   - En el desplegable **"Sesión Oficial SEA"**:
     - Selecciona una **Sesión Teórica** (ej. `Sesión 1: Lunes 03/08/2026 • 11:15-12:45 • TA-01` o `Sesión 7`):
       - Observa cómo la insignia cambia instantáneamente a azul `Teórica (TA-01)`.
       - Observa cómo el aula cambia a `C 103` y el horario a `Lunes 11:15 - 12:45`.
       - En la tarjeta **Macroplanificación Oficial**, observa cómo se despliega la **Matriz 7** con sus saberes conceptual, procedimental y actitudinal.
     - Selecciona una **Sesión Práctica** (ej. `Sesión 3: Viernes 07/08/2026 • 08:15-09:45 • PL-01` o `Sesión 26`):
       - Observa cómo la insignia cambia instantáneamente a púrpura `Práctica / Lab (PL-01)`.
       - Observa cómo el aula cambia a `INFORMATICA`.
       - En la tarjeta **Macroplanificación Oficial**, observa cómo conmuta automáticamente a la **Sección 8 del PAC Práctico**, mostrando la Actividad de Laboratorio, Desempeño Procedimental, Evidencias y Rúbrica de Laboratorio.
2. **Prueba de Aislamiento Estricto de Asistencias (Cero Arrastre)**:
   - En la Sesión 1, marca a un estudiante con `F` (Falta) o `A` (Atraso).
   - Presiona **"Guardar Asistencia"**.
   - Ahora cambia el desplegable a la **Sesión 3** (o Sesión 7):
     - **Verifica que la nómina inicia limpia (todos en PRESENTE)** y **NO hereda las marcas de la Sesión 1**.
   - Vuelve a la Sesión 1:
     - **Verifica que recupera fielmente la falta guardada**.
3. **Prueba de la Regla del 80% (UNITEPC)**:
   - En la columna de la derecha (`ESTADO REGLA 80%`), observa la insignia en tiempo real:
     - `✓ Habilitado (100%)` para estudiantes regulares.
     - Cambia a `⚠️ Inhabilitado` cuando el estudiante acumula faltas por debajo del umbral del 80%.
4. **Segregación Automática por Carrera en Materias Comunes**:
   - Observa cómo la nómina segrega a los estudiantes de **Ing. de Sistemas** (`CARSIS`) y de **Ing. Electrónica** (`CARELE`). Puedes usar los botones superiores de filtro de carrera.
5. **Seguimiento Pedagógico de Aula en < 5 segundos**:
   - Marca los 5 momentos didácticos desarrollados, selecciona *Totalmente Cumplido* y presiona **"Guardar Seguimiento de Clase"**.
6. **Exportación a Excel**:
   - Haz clic en **"Exportar Excel"** para descargar la planilla oficial de asistencia semestral.

---

### Prueba 6: Prueba de Contraste con Perfil Docente
Para comprobar que el sistema bloquea el acceso no autorizado a los docentes:
1. Haz clic en el botón de salida / cerrar sesión (o abre una pestaña en modo incógnito).
2. Ingresa con credenciales de docente:
   - **Usuario**: `3065087`
   - **Contraseña**: `3065087`
3. Comprueba que el docente:
   - Solo ve sus asignaturas en la **Carpeta Docente (Vista 1)**.
   - **No tiene acceso a la Supervisión Curricular (Vista 2)** ni a la aprobación en lote ni a los semáforos directivos.

---

## 6. Solución de Problemas Frecuentes (Troubleshooting)

### 1. "Docker no se puede conectar o daemon no está corriendo"
- Abre la aplicación **Docker Desktop** en tu computadora y espera a que el icono en la barra de tareas se ponga en color verde (*Engine running*).
- En Windows con WSL2, abre PowerShell como Administrador y ejecuta: `wsl --status`.

### 2. "Error de puerto ocupado (5432, 8080 o 4200)"
- Si tienes PostgreSQL instalado localmente en tu sistema operativo:
  - En Windows: Abre `services.msc`, busca `postgresql-x64-XX` y ponlo en *Detenido*.
  - En Linux: `sudo systemctl stop postgresql`.
- Luego vuelve a ejecutar: `docker compose up -d`.

### 3. "La página muestra datos antiguos o estilos desalineados"
- El navegador puede haber guardado en caché versiones anteriores de scripts o estilos.
- Presiona `Ctrl + Shift + R` (o `Ctrl + F5`) en Windows/Linux, o `Cmd + Shift + R` en Mac para forzar una recarga limpia.

### 4. "¿Qué significa el indicador SEA en la barra de asistencia?"
- **SEA en Línea (Verde)**: Comunicación fluida con el Gateway central.
- **SEA Fuera de Línea / Modo Local Seguro (Ámbar)**: El servidor central del SEA está inaccesible o en mantenimiento; SISA 2.0 activa el almacenamiento local seguro y permite seguir pasando lista y guardando planificaciones sin interrupciones.

---

## 7. Resumen de Comandos Rápidos

| Acción | Comando |
|:---|:---|
| **Iniciar todo el sistema** | `docker compose up -d --build` |
| **Sincronizar en vivo con SEA (Windows)** | `powershell -ExecutionPolicy Bypass -File .\sync-sea.ps1` |
| **Sincronizar en vivo con SEA (Linux/Mac)** | `./sync-sea.sh` |
| **Ver estado de servicios** | `docker compose ps` |
| **Ver logs del backend** | `docker compose logs -f backend` |
| **Espejo local / Fallback offline (Windows)** | `powershell -ExecutionPolicy Bypass -File .\seed-db.ps1` |
| **Espejo local / Fallback offline (Linux/Mac)** | `./seed-db.sh` |
| **Reinicio total limpio (Borra volúmenes)** | `docker compose down -v && docker compose up -d --build` |
| **Detener el sistema** | `docker compose down` |
