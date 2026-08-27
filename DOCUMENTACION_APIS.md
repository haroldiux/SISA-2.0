# 📚 Guía y Referencia Completa de APIs — SISA UNITEPC

Esta documentación detalla cada uno de los endpoints expuestos por el backend de SISA (`/api/v1`), indicando qué parámetros se envían y la estructura exacta del JSON que se recibe en la respuesta.

---

## 📑 Tabla de Contenidos
1. [Catálogo Académico & Gateway UNITEPC](#1-catálogo-académico--gateway-unitepc-apiv1catalogo-academico)
   - [API Grupos](#api-grupos)
   - [API Docentes](#api-docentes)
   - [API Materias por Docente](#api-materias-por-docente)
   - [API Estudiantes por Grupo](#api-estudiantes-por-grupo)
   - [API Carreras](#api-carreras)
   - [API Materias / Cursos](#api-materias--cursos)
   - [API Sedes](#api-sedes)
   - [API Campuses](#api-campuses)
   - [API Gestiones / Periodos](#api-gestiones--periodos)
   - [API Estado de Conexión](#api-estado-de-conexión-gateway)
2. [Autenticación y Sesión](#2-autenticación-y-sesión-apiv1auth)
   - [API Login](#api-login)
   - [API Refresh Token](#api-refresh-token)
   - [API Perfil Actual (Me)](#api-perfil-actual-me)
3. [Gestión Académica & Asignaciones](#3-gestión-académica--asignaciones-apiv1academic)
   - [API Listar Asignaciones Docentes](#api-listar-asignaciones-docentes)
   - [API Crear Asignación Docente](#api-crear-asignación-docente)
   - [API Carreras Locales](#api-carreras-locales)
   - [API Gestiones Locales](#api-gestiones-locales)
   - [API Sedes Locales](#api-sedes-locales)
4. [Trilogía de Planificación Curricular](#4-trilogía-de-planificación-curricular-apiv1planificaciones)
   - [API Guardar PAC (Matriz 7)](#api-guardar-pac-matriz-7)
   - [API Obtener PAC por Asignación](#api-obtener-pac-por-asignación)
   - [API Obtener PAC por ID](#api-obtener-pac-por-id)
   - [API Enviar PAC a Revisión](#api-enviar-pac-a-revisión)
   - [API Revisar / Aprobar PAC](#api-revisar--aprobar-pac)
   - [API Guardar Programa Analítico](#api-guardar-programa-analítico)
   - [API Obtener Programa Analítico por Asignación](#api-obtener-programa-analítico-por-asignación)
   - [API Guardar Plan de Clase](#api-guardar-plan-de-clase)
   - [API Obtener Plan de Clase por Sesión](#api-obtener-plan-de-clase-por-sesión)
5. [Auditoría Académica In Situ & Reincidencias](#5-auditoría-académica-in-situ--reincidencias-apiv1auditorias)
   - [API Radar de Clase Activa (Match)](#api-radar-de-clase-activa-match)
   - [API Finalizar Auditoría In Situ](#api-finalizar-auditoría-in-situ)
   - [API Firma Digital y Conformidad Docente](#api-firma-digital-y-conformidad-docente)
   - [API Listar Reincidencias Disciplinarias](#api-listar-reincidencias-disciplinarias)
6. [Motor Office / Importación y Exportación](#6-motor-office--importación-y-exportación-apiv1office)
   - [API Exportar PAC a Excel](#api-exportar-pac-a-excel)
   - [API Exportar Plan de Clase a Excel](#api-exportar-plan-de-clase-a-excel)
   - [API Exportar Programa Analítico a Word](#api-exportar-programa-analítico-a-word)
   - [API Importar PAC desde Excel](#api-importar-pac-desde-excel)
   - [API Importar Planes de Clase desde Excel](#api-importar-planes-de-clase-desde-excel)
   - [API Importar Programa Analítico desde Word](#api-importar-programa-analítico-desde-word)

---

## 1. Catálogo Académico & Gateway UNITEPC (`/api/v1/catalogo-academico`)

---

### API Grupos
Retorna los grupos/paralelos académicos de las materias con información de horarios, docentes y aulas.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/groups`
* **Parámetros de consulta (Query Params - Opcionales):**
  - `term`: Periodo/Gestión (ej. `"2-2026"`)
  - `branchOfficeId`: Identificador o código de sede (ej. `"cba"`)
  - `careerId`: Identificador de carrera (ej. `"car-sis"`)
  - `syllabusCourseId`: Identificador de materia/syllabus (ej. `"syl-sis-213"`)
  - `teacherCi`: Cédula de identidad del docente (ej. `"4589231"`)

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "grp-101",
    "name": "G1",
    "classType": "TEORICA",
    "teacherName": "Ing. Carlos Mendoza Rios",
    "teacherCi": "4589231",
    "classroom": "Aula 204 - Bloque A",
    "schedule": "Lun-Mie 08:00 - 10:15",
    "campus": "Campus Colonial",
    "courseName": "PROGRAMACIÓN III",
    "careerCode": "SIS",
    "syllabusCourseId": "syl-sis-213",
    "enrolledStudentsCount": 35
  },
  {
    "id": "grp-102",
    "name": "G2",
    "classType": "PRACTICA",
    "teacherName": "Ing. Carlos Mendoza Rios",
    "teacherCi": "4589231",
    "classroom": "Laboratorio 3",
    "schedule": "Vie 14:00 - 16:15",
    "campus": "Campus Colonial",
    "courseName": "BASE DE DATOS I",
    "careerCode": "SIS",
    "syllabusCourseId": "syl-sis-214",
    "enrolledStudentsCount": 28
  }
]
```

---

### API Docentes
Retorna el padrón unificado de docentes con sus materias y grupos asignados.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/docentes`
* **Parámetros:** Ninguno

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "ci": "4589231",
    "nombreCompleto": "Ing. Carlos Mendoza Rios",
    "email": "carlos.mendoza@unitepc.edu.bo",
    "sedeCodigo": "CBA",
    "carreraPrincipal": "Ingeniería de Sistemas",
    "materiasNombres": [
      "PROGRAMACIÓN III",
      "BASE DE DATOS I"
    ],
    "grupos": [
      {
        "id": "grp-101",
        "name": "G1",
        "classType": "TEORICA",
        "teacherName": "Ing. Carlos Mendoza Rios",
        "teacherCi": "4589231",
        "classroom": "Aula 204 - Bloque A",
        "schedule": "Lun-Mie 08:00 - 10:15",
        "campus": "Campus Colonial",
        "courseName": "PROGRAMACIÓN III",
        "careerCode": "SIS",
        "syllabusCourseId": "syl-sis-213",
        "enrolledStudentsCount": 35
      }
    ]
  }
]
```

---

### API Materias por Docente
Obtiene todas las asignaturas asignadas a un docente específico por su número de carnet/CI.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/docentes/{ci}/materias` (ej. `/api/v1/catalogo-academico/docentes/4589231/materias`)

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "mat-sis-213",
    "code": "SIS-213",
    "name": "PROGRAMACIÓN III",
    "semester": 3,
    "syllabusCourseId": "syl-sis-213",
    "careerCode": "SIS"
  },
  {
    "id": "mat-sis-214",
    "code": "SIS-214",
    "name": "BASE DE DATOS I",
    "semester": 3,
    "syllabusCourseId": "syl-sis-214",
    "careerCode": "SIS"
  }
]
```

---

### API Estudiantes por Grupo
Lista los estudiantes formalmente matriculados en un grupo o paralelo.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/students/byGroup`
* **Parámetros de consulta (Query Params):**
  - `groupId`: Identificador del grupo (ej. `"grp-101"`)

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "est-8841",
    "code": "20240182",
    "firstName": "Lucas",
    "firstLastName": "Fernández",
    "secondLastName": "Gutiérrez"
  },
  {
    "id": "est-8842",
    "code": "20240195",
    "firstName": "Mariana",
    "firstLastName": "Rojas",
    "secondLastName": "Vargas"
  }
]
```

---

### API Carreras
Lista de carreras académicas registradas en el catálogo central.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/careers`
* **Parámetros de consulta (Opcional):**
  - `branchOfficeCode`: Código de sede (ej. `"CBA"`)

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "car-sis",
    "code": "SIS",
    "name": "Ingeniería de Sistemas",
    "branchOfficeCode": "CBA"
  },
  {
    "id": "car-med",
    "code": "MED",
    "name": "Medicina",
    "branchOfficeCode": "CBA"
  },
  {
    "id": "car-odo",
    "code": "ODO",
    "name": "Odontología",
    "branchOfficeCode": "CBA"
  }
]
```

---

### API Materias / Cursos
Lista de materias por sede y carrera.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/courses`
* **Parámetros de consulta (Opcional):**
  - `branchOfficeCode`: Código de sede (ej. `"CBA"`)
  - `careerCode`: Código de carrera (ej. `"SIS"`)

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "mat-sis-101",
    "code": "SIS-101",
    "name": "INTRODUCCIÓN A LA PROGRAMACIÓN",
    "semester": 1,
    "syllabusCourseId": "syl-sis-101",
    "careerCode": "SIS"
  },
  {
    "id": "mat-sis-213",
    "code": "SIS-213",
    "name": "PROGRAMACIÓN III",
    "semester": 3,
    "syllabusCourseId": "syl-sis-213",
    "careerCode": "SIS"
  }
]
```

---

### API Sedes
Lista de todas las sedes institucionales de UNITEPC.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/branchOffices`

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "cba",
    "code": "CBA",
    "name": "Cochabamba"
  },
  {
    "id": "lpz",
    "code": "LPZ",
    "name": "La Paz"
  },
  {
    "id": "stc",
    "code": "STC",
    "name": "Santa Cruz"
  },
  {
    "id": "ea",
    "code": "EA",
    "name": "El Alto"
  },
  {
    "id": "chq",
    "code": "CHQ",
    "name": "Chuquisaca"
  }
]
```

---

### API Campuses
Lista de campus e infraestructura física.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/campuses`
* **Parámetros de consulta (Opcional):**
  - `branchOfficeId`: Identificador de sede (ej. `"cba"`)

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "cmp-col",
    "name": "Campus Colonial",
    "branchOfficeId": "cba"
  },
  {
    "id": "cmp-jp2",
    "name": "Campus Juan Pablo II",
    "branchOfficeId": "cba"
  },
  {
    "id": "cmp-flo",
    "name": "Campus Florida",
    "branchOfficeId": "cba"
  }
]
```

---

### API Gestiones / Periodos
Lista de gestiones académicas activas e históricas.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/timeFrames`

#### 📥 Lo que recibimos (Response):
```json
[
  {
    "id": "tf-2026-2",
    "name": "Gestión II-2026",
    "year": "2026",
    "term": "II",
    "active": true
  },
  {
    "id": "tf-2026-1",
    "name": "Gestión I-2026",
    "year": "2026",
    "term": "I",
    "active": false
  }
]
```

---

### API Estado de Conexión (Gateway)
Verifica el estado del gateway central.

* **Método:** `GET`
* **URL:** `/api/v1/catalogo-academico/status`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": "online",
  "gateway": "UNITEPC Central Gateway (gw-dev.unitepc.solutions)",
  "timestamp": "2026-08-27T17:30:00.000Z"
}
```

---

## 2. Autenticación y Sesión (`/api/v1/auth`)

---

### API Login
Inicia sesión con usuario y contraseña institucional.

* **Método:** `POST`
* **URL:** `/api/v1/auth/login`
* **📤 Lo que se envía (Request Body):**
```json
{
  "username": "d.gonzales",
  "password": "Password123!"
}
```

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Autenticación exitosa",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d8f9a2b1-5c3e-4d8e-9a1b-2c3d4e5f6a7b",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 12,
      "username": "d.gonzales",
      "email": "diego.gonzales@unitepc.edu.bo",
      "role": "ROLE_DOCENTE",
      "sedeId": 1,
      "sedeNombre": "Cochabamba - Colonial",
      "nombres": "Diego",
      "apellidos": "Gonzales Pérez",
      "nombreCompleto": "Diego Gonzales Pérez"
    }
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Refresh Token
Renueva el access token antes o después de que expire.

* **Método:** `POST`
* **URL:** `/api/v1/auth/refresh`
* **📤 Lo que se envía (Request Body):**
```json
{
  "refreshToken": "d8f9a2b1-5c3e-4d8e-9a1b-2c3d4e5f6a7b"
}
```

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Token renovado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW...",
    "refreshToken": "e9a1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 12,
      "username": "d.gonzales",
      "email": "diego.gonzales@unitepc.edu.bo",
      "role": "ROLE_DOCENTE",
      "sedeId": 1,
      "sedeNombre": "Cochabamba - Colonial",
      "nombres": "Diego",
      "apellidos": "Gonzales Pérez",
      "nombreCompleto": "Diego Gonzales Pérez"
    }
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Perfil Actual (Me)
Retorna la información del usuario en sesión a partir del JWT.

* **Método:** `GET`
* **URL:** `/api/v1/auth/me`
* **Headers:** `Authorization: Bearer <accessToken>`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Perfil obtenido",
  "data": {
    "id": 12,
    "username": "d.gonzales",
    "email": "diego.gonzales@unitepc.edu.bo",
    "role": "ROLE_DOCENTE",
    "sedeId": 1,
    "sedeNombre": "Cochabamba - Colonial",
    "nombres": "Diego",
    "apellidos": "Gonzales Pérez",
    "nombreCompleto": "Diego Gonzales Pérez"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

## 3. Gestión Académica & Asignaciones (`/api/v1/academic`)

---

### API Listar Asignaciones Docentes
Retorna el listado de vinculaciones oficiales entre docentes, materias, carreras, aulas y horarios.

* **Método:** `GET`
* **URL:** `/api/v1/academic/assignments`
* **Parámetros de consulta (Opcionales):**
  - `gestionId`: ID de la gestión (ej. `1`)
  - `carreraId`: ID de la carrera (ej. `2`)
  - `docenteId`: ID del docente (ej. `5`)

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Listado de asignaciones docentes",
  "total": 1,
  "data": [
    {
      "id": 1,
      "gestionId": 1,
      "gestionCodigo": "2-2026",
      "docenteId": 5,
      "docenteNombre": "Ing. Carlos Mendoza Rios",
      "carreraId": 2,
      "carreraNombre": "Ingeniería de Sistemas",
      "asignaturaId": 14,
      "asignaturaCodigo": "SIS-213",
      "asignaturaNombre": "PROGRAMACIÓN III",
      "semestre": 3,
      "campusId": 1,
      "campusNombre": "Campus Colonial",
      "sedeId": 1,
      "sedeNombre": "Cochabamba",
      "grupoParalelo": "G1",
      "turno": "MANANA",
      "aula": "Aula 204 - Bloque A",
      "diasSemana": "LUNES,MIERCOLES",
      "horarioInicio": "08:00:00",
      "horarioFin": "10:15:00"
    }
  ],
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Crear Asignación Docente
Crea una nueva vinculación docente a un curso.

* **Método:** `POST`
* **URL:** `/api/v1/academic/assignments`
* **Roles requeridos:** `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_VICERRECTOR_NACIONAL`
* **📤 Lo que se envía (Request Body):**
```json
{
  "gestionId": 1,
  "docenteId": 5,
  "carreraId": 2,
  "asignaturaId": 14,
  "campusId": 1,
  "grupoParalelo": "G1",
  "turno": "MANANA",
  "aula": "Aula 204 - Bloque A",
  "diasSemana": "LUNES,MIERCOLES",
  "horarioInicio": "08:00:00",
  "horarioFin": "10:15:00"
}
```

#### 📥 Lo que recibimos (Response `201 Created`):
```json
{
  "status": 201,
  "message": "Asignación docente creada exitosamente",
  "data": {
    "id": 1,
    "gestionId": 1,
    "gestionCodigo": "2-2026",
    "docenteId": 5,
    "docenteNombre": "Ing. Carlos Mendoza Rios",
    "carreraId": 2,
    "carreraNombre": "Ingeniería de Sistemas",
    "asignaturaId": 14,
    "asignaturaCodigo": "SIS-213",
    "asignaturaNombre": "PROGRAMACIÓN III",
    "semestre": 3,
    "campusId": 1,
    "campusNombre": "Campus Colonial",
    "sedeId": 1,
    "sedeNombre": "Cochabamba",
    "grupoParalelo": "G1",
    "turno": "MANANA",
    "aula": "Aula 204 - Bloque A",
    "diasSemana": "LUNES,MIERCOLES",
    "horarioInicio": "08:00:00",
    "horarioFin": "10:15:00"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Carreras Locales
Lista las carreras almacenadas en la base de datos local.

* **Método:** `GET`
* **URL:** `/api/v1/academic/carreras`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Listado de carreras",
  "total": 2,
  "data": [
    {
      "id": 1,
      "codigo": "MED",
      "nombre": "Medicina",
      "sedeId": 1
    },
    {
      "id": 2,
      "codigo": "SIS",
      "nombre": "Ingeniería de Sistemas",
      "sedeId": 1
    }
  ],
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Gestiones Locales
Lista las gestiones académicas locales.

* **Método:** `GET`
* **URL:** `/api/v1/academic/gestiones`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Listado de gestiones académicas",
  "total": 1,
  "data": [
    {
      "id": 1,
      "codigo": "2-2026",
      "anio": 2026,
      "periodo": "II",
      "activo": true,
      "fechaInicio": "2026-08-01",
      "fechaFin": "2026-12-20"
    }
  ],
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Sedes Locales
Lista las sedes locales de la base de datos.

* **Método:** `GET`
* **URL:** `/api/v1/academic/sedes`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Listado de sedes",
  "total": 1,
  "data": [
    {
      "id": 1,
      "codigo": "CBA",
      "nombre": "Cochabamba"
    }
  ],
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

## 4. Trilogía de Planificación Curricular (`/api/v1/planificaciones`)

---

### API Guardar PAC (Matriz 7)
Guarda o actualiza la Planificación Académica Curricular completa con su matriz de 20 semanas.

* **Método:** `POST`
* **URL:** `/api/v1/planificaciones/pac`
* **📤 Lo que se envía (Request Body):**
```json
{
  "asignacionId": 1,
  "carrera": "Ingeniería de Sistemas",
  "nombreAsignatura": "PROGRAMACIÓN III",
  "codigoAsignatura": "SIS-213",
  "tipoCurso": "OBLIGATORIA",
  "modalidad": "PRESENCIAL",
  "semestre": "3° Semestre",
  "preRequisito": "SIS-112 PROGRAMACIÓN II",
  "creditos": "4",
  "cargaHorariaTotal": "80 Horas",
  "sesionesSemanales": "2",
  "horasTeoricasPracticas": "HT: 40, HP: 40",
  "nombreDocente": "Ing. Carlos Mendoza Rios",
  "emailDocente": "carlos.mendoza@unitepc.edu.bo",
  "formacionDocente": "Lic. en Informática, Msc. en Ingeniería de Software",
  "telefonoDocente": "76981234",
  "justificacion": "La materia fundamenta la arquitectura de software moderna...",
  "propositoGeneral": "Desarrollar aplicaciones empresariales aplicando principios y patrones...",
  "competenciaGlobal": "Implementa software escalable mediante POO avanzada...",
  "unidadCompetencia": "Diseña modelos de dominio desacoplados...",
  "elementoCompetencia1": "Aplica principios SOLID en Java",
  "elementoCompetencia2": "Integra bases de datos con JPA/Hibernate",
  "metodologiaAula": "Aprendizaje Basado en Proyectos y Clases Invertidas",
  "sistemaEvaluacion": "Evaluación por competencias según reglamento",
  "p1NotaTeorica": 20,
  "p1NotaPractica": 10,
  "p2NotaTeorica": 20,
  "p2NotaPractica": 10,
  "efNotaTeorica": 30,
  "efNotaPractica": 10,
  "bibliografiaOficial": "Gamma, E. (1994). Design Patterns. Addison-Wesley.",
  "matriz7": [
    {
      "semana": 1,
      "nroSesion": 1,
      "fechaProgramada": "2026-08-10",
      "tipoSesion": "TEORICA",
      "unidadTematica": "Unidad 1: Principios de Arquitectura",
      "contenidoEspecifico": "Introducción a Clean Architecture y SOLID",
      "saberConceptual": "Conoce los 5 principios SOLID",
      "saberProcedimental": "Refactoriza código aplicando SRP",
      "saberActitudinal": "Valora la mantenibilidad del código",
      "criterioDesempeno": "Escribe clases con responsabilidad única",
      "evidenciaAprendizaje": "Informe de refactorización",
      "instrumentoEvaluacion": "RUBRICA",
      "hitoEvaluativo": "PROCESO_P1"
    }
  ]
}
```

#### 📥 Lo que recibimos (Response `201 Created`):
```json
{
  "status": 201,
  "message": "PAC guardado exitosamente",
  "data": {
    "id": 10,
    "asignacionId": 1,
    "estado": "BORRADOR",
    "seccionesIdentificacion": {},
    "estrategiasMetodologicas": [],
    "recursosDidacticos": [],
    "normasCurso": [],
    "observacionesRevision": null,
    "revisadoPorId": null,
    "revisadoPorNombre": null,
    "revisadoEn": null,
    "matriz7": [
      {
        "id": 101,
        "semana": 1,
        "nroSesion": 1,
        "fechaProgramada": "2026-08-10",
        "tipoSesion": "TEORICA",
        "unidadTematica": "Unidad 1: Principios de Arquitectura",
        "contenidoEspecifico": "Introducción a Clean Architecture y SOLID",
        "saberConceptual": "Conoce los 5 principios SOLID",
        "saberProcedimental": "Refactoriza código aplicando SRP",
        "saberActitudinal": "Valora la mantenibilidad del código",
        "criterioDesempeno": "Escribe clases con responsabilidad única",
        "evidenciaAprendizaje": "Informe de refactorización",
        "instrumentoEvaluacion": "RUBRICA",
        "hitoEvaluativo": "PROCESO_P1"
      }
    ],
    "creadoEn": "2026-08-27T17:30:00Z",
    "actualizadoEn": "2026-08-27T17:30:00Z"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Obtener PAC por Asignación
Obtiene el PAC asociado a una asignación docente.

* **Método:** `GET`
* **URL:** `/api/v1/planificaciones/pac/by-assignment/{asignacionId}` (ej. `/api/v1/planificaciones/pac/by-assignment/1`)

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "PAC obtenido exitosamente",
  "data": {
    "id": 10,
    "asignacionId": 1,
    "estado": "APROBADO",
    "matriz7": [
      {
        "id": 101,
        "semana": 1,
        "nroSesion": 1,
        "fechaProgramada": "2026-08-10",
        "tipoSesion": "TEORICA",
        "unidadTematica": "Unidad 1: Principios de Arquitectura",
        "contenidoEspecifico": "Introducción a Clean Architecture y SOLID",
        "saberConceptual": "Conoce los 5 principios SOLID",
        "saberProcedimental": "Refactoriza código aplicando SRP",
        "saberActitudinal": "Valora la mantenibilidad del código",
        "criterioDesempeno": "Escribe clases con responsabilidad única",
        "evidenciaAprendizaje": "Informe de refactorización",
        "instrumentoEvaluacion": "RUBRICA",
        "hitoEvaluativo": "PROCESO_P1"
      }
    ],
    "observacionesRevision": "Aprobado por Dirección de Carrera",
    "revisadoPorId": 2,
    "revisadoPorNombre": "Dr. Fernando Morales",
    "revisadoEn": "2026-08-27T17:35:00Z",
    "creadoEn": "2026-08-27T17:30:00Z",
    "actualizadoEn": "2026-08-27T17:35:00Z"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Obtener PAC por ID
Obtiene un PAC directamente por su clave primaria.

* **Método:** `GET`
* **URL:** `/api/v1/planificaciones/pac/{id}` (ej. `/api/v1/planificaciones/pac/10`)
* **Response:** Misma estructura que el endpoint anterior.

---

### API Enviar PAC a Revisión
El docente cambia el estado de `BORRADOR` a `EN_REVISION`.

* **Método:** `POST`
* **URL:** `/api/v1/planificaciones/pac/{id}/submit` (ej. `/api/v1/planificaciones/pac/10/submit`)

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Planificación enviada a revisión exitosamente",
  "data": {
    "id": 10,
    "asignacionId": 1,
    "estado": "EN_REVISION",
    "actualizadoEn": "2026-08-27T17:31:00Z"
  },
  "meta": {
    "timestamp": "2026-08-27T17:31:00.000Z"
  }
}
```

---

### API Revisar / Aprobar PAC
El Director de Carrera o Autoridad Académica aprueba u observa la planificación.

* **Método:** `POST`
* **URL:** `/api/v1/planificaciones/pac/{id}/review` (ej. `/api/v1/planificaciones/pac/10/review`)
* **Roles:** `ROLE_DIR_CARRERA`, `ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_VICERRECTOR_NACIONAL`
* **📤 Lo que se envía (Request Body):**
```json
{
  "nuevoEstado": "APROBADO",
  "observaciones": "Planificación revisada y aprobada para el semestre."
}
```

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Revisión de PAC registrada exitosamente",
  "data": {
    "id": 10,
    "asignacionId": 1,
    "estado": "APROBADO",
    "observacionesRevision": "Planificación revisada y aprobada para el semestre.",
    "revisadoPorId": 2,
    "revisadoPorNombre": "Dr. Fernando Morales",
    "revisadoEn": "2026-08-27T17:35:00Z"
  },
  "meta": {
    "timestamp": "2026-08-27T17:35:00.000Z"
  }
}
```

---

### API Guardar Programa Analítico
Crea o actualiza el Programa Analítico de la materia.

* **Método:** `POST`
* **URL:** `/api/v1/planificaciones/programa-analitico`
* **📤 Lo que se envía (Request Body):**
```json
{
  "asignacionId": 1,
  "codigoAsignatura": "SIS-213",
  "nombreAsignatura": "PROGRAMACIÓN III",
  "semestre": "3°",
  "creditos": 4,
  "horasTeoricas": 40,
  "horasPracticas": 40,
  "caracterizacion": "Materia de formación profesional orientada a la ingeniería de software...",
  "macroCompetencia": "Desarrolla soluciones de software modulares aplicando buenas prácticas...",
  "sistemaEvaluacion": "Evaluación continua formativa y sumativa",
  "unidades": [
    {
      "numeroUnidad": 1,
      "titulo": "Arquitectura y Patrones de Software",
      "saberesConceptuales": "SOLID, Patrones GoF, Clean Architecture",
      "saberesProcedimentales": "Implementación de patrones en Java",
      "saberesActitudinales": "Rigor técnico",
      "criteriosDesempeno": "Aplica separación de responsabilidades",
      "horasAcademicas": 16,
      "temas": [
        {
          "numeroTema": 1,
          "titulo": "Principios SOLID",
          "contenido": "SRP, OCP, LSP, ISP, DIP"
        }
      ]
    }
  ],
  "bibliografia": [
    {
      "tipo": "BASICA",
      "citaApa": "Martin, R. C. (2017). Clean Architecture. Prentice Hall.",
      "autor": "Robert C. Martin",
      "anio": 2017,
      "titulo": "Clean Architecture",
      "editorialUrl": "Prentice Hall"
    }
  ]
}
```

#### 📥 Lo que recibimos (Response `201 Created`):
```json
{
  "status": 201,
  "message": "Programa analítico guardado exitosamente",
  "data": {
    "id": 5,
    "asignacionId": 1,
    "estado": "APROBADO",
    "caracterizacion": "Materia de formación profesional...",
    "macroCompetencia": "Desarrolla soluciones de software modulares...",
    "sistemaEvaluacion": "Evaluación continua formativa y sumativa",
    "unidades": [
      {
        "id": 12,
        "numeroUnidad": 1,
        "titulo": "Arquitectura y Patrones de Software",
        "saberesConceptuales": "SOLID, Patrones GoF, Clean Architecture",
        "saberesProcedimentales": "Implementación de patrones en Java",
        "saberesActitudinales": "Rigor técnico",
        "criteriosDesempeno": "Aplica separación de responsabilidades",
        "horasAcademicas": 16,
        "temas": [
          {
            "numeroTema": 1,
            "titulo": "Principios SOLID",
            "contenido": "SRP, OCP, LSP, ISP, DIP"
          }
        ]
      }
    ],
    "bibliografia": [
      {
        "id": 21,
        "tipo": "BASICA",
        "citaApa": "Martin, R. C. (2017). Clean Architecture. Prentice Hall.",
        "autor": "Robert C. Martin",
        "anio": 2017,
        "titulo": "Clean Architecture",
        "editorialUrl": "Prentice Hall"
      }
    ],
    "creadoEn": "2026-08-27T17:30:00Z",
    "actualizadoEn": "2026-08-27T17:30:00Z"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Obtener Programa Analítico por Asignación
* **Método:** `GET`
* **URL:** `/api/v1/planificaciones/programa-analitico/by-assignment/{asignacionId}` (ej. `/api/v1/planificaciones/programa-analitico/by-assignment/1`)
* **Response:** Misma estructura que la respuesta del guardado anterior.

---

### API Guardar Plan de Clase
Guarda el Plan de Clase de una sesión pedagógica específica estructurado en sus 3 momentos: Inicio, Desarrollo y Cierre.

* **Método:** `POST`
* **URL:** `/api/v1/planificaciones/plan-clase`
* **📤 Lo que se envía (Request Body):**
```json
{
  "sesionId": 101,
  "duracionTotalMin": 90,
  "objetivoSesion": "Comprender e implementar el principio de Responsabilidad Única (SRP).",
  "contenidoTema": "Principios SOLID - Single Responsibility",
  "nombreAsignatura": "PROGRAMACIÓN III",
  "unidadTitulo": "Unidad 1: Principios de Arquitectura",
  "saberConceptual": "Definición y beneficios del SRP",
  "saberProcedimental": "Identificación de violaciones a SRP en código legado",
  "saberActitudinal": "Crítica constructiva en la revisión de código",
  "estrategiaEnsenanza": "Exposición dialogada y Live Coding",
  "estrategiaAprendizaje": "Resolución de casos en parejas",
  "momentos": [
    {
      "tipoMomento": "INICIO",
      "nombreMomento": "Activación y motivación",
      "duracionMin": 15,
      "actividadesDocente": "Presenta fragmento de código monolítico problemático",
      "actividadesEstudiante": "Analiza en parejas y lista posibles fallos",
      "indicadorEvaluacion": "Participación activa en el debate inicial"
    },
    {
      "tipoMomento": "DESARROLLO",
      "nombreMomento": "Construcción del conocimiento y práctica",
      "duracionMin": 60,
      "actividadesDocente": "Guía el refactor en vivo hacia clases cohesivas",
      "actividadesEstudiante": "Replica el refactor en su entorno local",
      "indicadorEvaluacion": "Ejecución exitosa de tests unitarios"
    },
    {
      "tipoMomento": "CIERRE",
      "nombreMomento": "Conclusiones y metacognición",
      "duracionMin": 15,
      "actividadesDocente": "Sintetiza las reglas de oro del SRP y asigna desafío",
      "actividadesEstudiante": "Responde cuestionario rápido de autoevaluación",
      "indicadorEvaluacion": "Ticket de salida conceptual"
    }
  ]
}
```

#### 📥 Lo que recibimos (Response `201 Created`):
```json
{
  "status": 201,
  "message": "Plan de clase guardado exitosamente",
  "data": {
    "id": 20,
    "sesionId": 101,
    "semana": 1,
    "nroSesion": 1,
    "unidadTematica": "Unidad 1: Principios de Arquitectura",
    "estado": "APROBADO",
    "duracionTotalMin": 90,
    "objetivoSesion": "Comprender e implementar el principio de Responsabilidad Única (SRP).",
    "recursosDidacticos": [],
    "momentos": [
      {
        "id": 41,
        "nombreMomento": "Activación y motivación",
        "tipoMomento": "INICIO",
        "duracionMin": 15,
        "actividadesDocente": "Presenta fragmento de código monolítico problemático",
        "actividadesEstudiante": "Analiza en parejas y lista posibles fallos",
        "indicadorEvaluacion": "Participación activa en el debate inicial"
      },
      {
        "id": 42,
        "nombreMomento": "Construcción del conocimiento y práctica",
        "tipoMomento": "DESARROLLO",
        "duracionMin": 60,
        "actividadesDocente": "Guía el refactor en vivo hacia clases cohesivas",
        "actividadesEstudiante": "Replica el refactor en su entorno local",
        "indicadorEvaluacion": "Ejecución exitosa de tests unitarios"
      },
      {
        "id": 43,
        "nombreMomento": "Conclusiones y metacognición",
        "tipoMomento": "CIERRE",
        "duracionMin": 15,
        "actividadesDocente": "Sintetiza las reglas de oro del SRP y asigna desafío",
        "actividadesEstudiante": "Responde cuestionario rápido de autoevaluación",
        "indicadorEvaluacion": "Ticket de salida conceptual"
      }
    ],
    "creadoEn": "2026-08-27T17:30:00Z",
    "actualizadoEn": "2026-08-27T17:30:00Z"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Obtener Plan de Clase por Sesión
Obtiene el plan de clase de una sesión de la Matriz 7.

* **Método:** `GET`
* **URL:** `/api/v1/planificaciones/plan-clase/by-session/{sesionId}` (ej. `/api/v1/planificaciones/plan-clase/by-session/101`)
* **Response:** Misma estructura que la respuesta del guardado anterior.

---

## 5. Auditoría Académica In Situ & Reincidencias (`/api/v1/auditorias`)

---

### API Radar de Clase Activa (Match)
Detecta automáticamente qué docente, materia y sesión planificada debe estar ejecutándose en un aula física en este momento.

* **Método:** `GET`
* **URL:** `/api/v1/auditorias/in-situ/match`
* **Parámetros de consulta:**
  - `campusId`: ID del campus (ej. `1`)
  - `aula`: Nombre del aula física (ej. `"Aula 204 - Bloque A"`)
  - `dia`: Día actual (ej. `"LUNES"`)
  - `hora`: Hora de consulta (Opcional, formato `HH:mm:ss`, ej. `"08:15:00"`)

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Resultado de radar de clase activa",
  "data": {
    "matched": true,
    "asignacionId": 1,
    "carreraNombre": "Ingeniería de Sistemas",
    "asignaturaNombre": "PROGRAMACIÓN III",
    "docenteNombre": "Ing. Carlos Mendoza Rios",
    "aula": "Aula 204 - Bloque A",
    "horarioInicio": "08:00:00",
    "horarioFin": "10:15:00",
    "sesionProgramadaId": 101,
    "semanaProgramada": 1,
    "nroSesionProgramada": 1,
    "temaProgramado": "Unidad 1: Principios de Arquitectura",
    "contenidoEspecifico": "Introducción a Clean Architecture y SOLID"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Finalizar Auditoría In Situ
Registra la evaluación presencial del auditor académico en el aula y genera el hash criptográfico.

* **Método:** `POST`
* **URL:** `/api/v1/auditorias/in-situ/finalize`
* **Roles:** `ROLE_DIR_ACADEMICA`, `ROLE_VICERRECTOR_SEDE`, `ROLE_VICERRECTOR_NACIONAL`
* **📤 Lo que se envía (Request Body):**
```json
{
  "asignacionId": 1,
  "sesionProgramadaId": 101,
  "puntualidadDocente": "A_TIEMPO",
  "concordanciaTema": "CONFORME",
  "momentoObservado": "DESARROLLO",
  "recursosVerificados": [
    "Data Display / Proyector",
    "Guía de Laboratorio",
    "Plataforma SEA Moodle"
  ],
  "estudiantesPresentes": 32,
  "estudiantesInscritos": 35,
  "observacionesAuditor": "Excelente dinámica de clase y resolución de dudas."
}
```

#### 📥 Lo que recibimos (Response `201 Created`):
```json
{
  "status": 201,
  "message": "Auditoría in situ finalizada y firmada digitalmente",
  "data": {
    "id": 8,
    "asignacionId": 1,
    "asignaturaNombre": "PROGRAMACIÓN III",
    "docenteNombre": "Ing. Carlos Mendoza Rios",
    "carreraNombre": "Ingeniería de Sistemas",
    "sedeNombre": "Cochabamba",
    "aula": "Aula 204 - Bloque A",
    "auditorId": 3,
    "auditorNombre": "Lic. Patricia Quiroga",
    "sesionProgramadaId": 101,
    "semanaProgramada": 1,
    "nroSesionProgramada": 1,
    "temaProgramado": "Unidad 1: Principios de Arquitectura",
    "fechaHoraAuditoria": "2026-08-27T08:20:00Z",
    "puntualidadDocente": "A_TIEMPO",
    "concordanciaTema": "CONFORME",
    "momentoObservado": "DESARROLLO",
    "recursosVerificados": [
      "Data Display / Proyector",
      "Guía de Laboratorio",
      "Plataforma SEA Moodle"
    ],
    "estudiantesPresentes": 32,
    "estudiantesInscritos": 35,
    "porcentajeAsistencia": 91.43,
    "observacionesAuditor": "Excelente dinámica de clase y resolución de dudas.",
    "estado": "PENDIENTE_FIRMA",
    "conformidadDocente": null,
    "observacionesDocente": null,
    "fechaFirmaDocente": null,
    "hashFirmaDigital": "SHA256:7e8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Firma Digital y Conformidad Docente
Permite al docente auditado registrar su firma digital y declarar su conformidad u observaciones sobre el reporte.

* **Método:** `POST`
* **URL:** `/api/v1/auditorias/in-situ/{id}/sign` (ej. `/api/v1/auditorias/in-situ/8/sign`)
* **📤 Lo que se envía (Request Body):**
```json
{
  "conformidadDocente": "CONFORME",
  "observacionesDocente": "Conforme con el reporte del auditor."
}
```

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Firma y conformidad docente registradas",
  "data": {
    "id": 8,
    "asignacionId": 1,
    "asignaturaNombre": "PROGRAMACIÓN III",
    "docenteNombre": "Ing. Carlos Mendoza Rios",
    "carreraNombre": "Ingeniería de Sistemas",
    "sedeNombre": "Cochabamba",
    "aula": "Aula 204 - Bloque A",
    "auditorId": 3,
    "auditorNombre": "Lic. Patricia Quiroga",
    "sesionProgramadaId": 101,
    "semanaProgramada": 1,
    "nroSesionProgramada": 1,
    "temaProgramado": "Unidad 1: Principios de Arquitectura",
    "fechaHoraAuditoria": "2026-08-27T08:20:00Z",
    "puntualidadDocente": "A_TIEMPO",
    "concordanciaTema": "CONFORME",
    "momentoObservado": "DESARROLLO",
    "recursosVerificados": [
      "Data Display / Proyector",
      "Guía de Laboratorio",
      "Plataforma SEA Moodle"
    ],
    "estudiantesPresentes": 32,
    "estudiantesInscritos": 35,
    "porcentajeAsistencia": 91.43,
    "observacionesAuditor": "Excelente dinámica de clase y resolución de dudas.",
    "estado": "FIRMADA",
    "conformidadDocente": "CONFORME",
    "observacionesDocente": "Conforme con el reporte del auditor.",
    "fechaFirmaDocente": "2026-08-27T10:20:00Z",
    "hashFirmaDigital": "SHA256:8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Listar Reincidencias Disciplinarias
Monitorea infracciones y planes de compromiso (política de 3 Strikes).

* **Método:** `GET`
* **URL:** `/api/v1/auditorias/recurrence`
* **Parámetros de consulta (Opcionales):**
  - `gestionId`: ID de gestión (ej. `1`)
  - `docenteId`: ID del docente (ej. `9`)

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Listado de reincidencias disciplinarias",
  "total": 1,
  "data": [
    {
      "id": 2,
      "docenteId": 9,
      "docenteNombre": "Lic. Mario Terán",
      "gestionId": 1,
      "gestionCodigo": "2-2026",
      "auditoriaId": 4,
      "nroInfraccion": 1,
      "nivel": "LEVE",
      "motivo": "Docente inició sesión con 25 minutos de retraso sin justificación previa",
      "estado": "PLAN_COMPROMISO",
      "planAccionId": 1,
      "planCompromisoMejora": "Compromiso de puntualidad y reprogramación de 30 min",
      "planFechaLimite": "2026-09-15",
      "planEstado": "PENDIENTE",
      "creadoEn": "2026-08-20T14:10:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

## 6. Motor Office / Importación y Exportación (`/api/v1/office`)

---

### API Exportar PAC a Excel
Genera y descarga el archivo oficial `.xlsx` con la carátula y la Matriz 7.

* **Método:** `GET`
* **URL:** `/api/v1/office/export/pac/{id}` (ej. `/api/v1/office/export/pac/10`)
* **📥 Lo que recibimos:** Archivo binario con cabecera `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y nombre `attachment; filename="PAC_Matriz7_10.xlsx"`.

---

### API Exportar Plan de Clase a Excel
Genera y descarga el formato oficial `.xlsx` del plan de sesión.

* **Método:** `GET`
* **URL:** `/api/v1/office/export/plan-clase/{sesionId}` (ej. `/api/v1/office/export/plan-clase/101`)
* **📥 Lo que recibimos:** Archivo binario Excel con nombre `attachment; filename="Plan_Clase_Sesion_101.xlsx"`.

---

### API Exportar Programa Analítico a Word
Genera y descarga el documento oficial `.docx` del Programa Analítico.

* **Método:** `GET`
* **URL:** `/api/v1/office/export/programa-analitico/{asignacionId}` (ej. `/api/v1/office/export/programa-analitico/1`)
* **📥 Lo que recibimos:** Archivo binario Word con cabecera `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document` y nombre `attachment; filename="Programa_Analitico_1.docx"`.

---

### API Importar PAC desde Excel
Lee y parsea una plantilla Excel de PAC Matriz 7 para cargarla automáticamente a la base de datos.

* **Método:** `POST`
* **URL:** `/api/v1/office/import/pac`
* **Cabecera:** `Content-Type: multipart/form-data`
* **📤 Lo que se envía:** 
  - `file`: Archivo `.xlsx`
  - `asignacionId`: `1` (Opcional)

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Documento PAC importado exitosamente",
  "data": {
    "id": null,
    "asignacionId": 1,
    "carrera": "Ingeniería de Sistemas",
    "nombreAsignatura": "PROGRAMACIÓN III",
    "codigoAsignatura": "SIS-213",
    "nombreDocente": "Ing. Carlos Mendoza Rios",
    "matriz7": [
      {
        "semana": 1,
        "nroSesion": 1,
        "fechaProgramada": "2026-08-10",
        "tipoSesion": "TEORICA",
        "unidadTematica": "Unidad 1: Principios de Arquitectura",
        "contenidoEspecifico": "Introducción a Clean Architecture y SOLID",
        "saberConceptual": "Conoce los 5 principios SOLID",
        "saberProcedimental": "Refactoriza código aplicando SRP",
        "saberActitudinal": "Valora la mantenibilidad del código",
        "criterioDesempeno": "Escribe clases con responsabilidad única",
        "evidenciaAprendizaje": "Informe de refactorización",
        "instrumentoEvaluacion": "RUBRICA",
        "hitoEvaluativo": "PROCESO_P1"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Importar Planes de Clase desde Excel
Lee y procesa las hojas de un archivo Excel de planes de clase.

* **Método:** `POST`
* **URL:** `/api/v1/office/import/plan-clase`
* **Cabecera:** `Content-Type: multipart/form-data`
* **📤 Lo que se envía:** 
  - `file`: Archivo `.xlsx`
  - `sesionId`: `101`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Planes de clase importados exitosamente",
  "total": 1,
  "data": [
    {
      "sesionId": 101,
      "duracionTotalMin": 90,
      "objetivoSesion": "Comprender e implementar el principio de Responsabilidad Única (SRP).",
      "contenidoTema": "Principios SOLID - Single Responsibility",
      "nombreAsignatura": "PROGRAMACIÓN III",
      "momentos": [
        {
          "tipoMomento": "INICIO",
          "nombreMomento": "Activación y motivación",
          "duracionMin": 15,
          "actividadesDocente": "Presenta fragmento de código monolítico problemático",
          "actividadesEstudiante": "Analiza en parejas y lista posibles fallos",
          "indicadorEvaluacion": "Participación activa en el debate inicial"
        },
        {
          "tipoMomento": "DESARROLLO",
          "nombreMomento": "Construcción del conocimiento y práctica",
          "duracionMin": 60,
          "actividadesDocente": "Guía el refactor en vivo hacia clases cohesivas",
          "actividadesEstudiante": "Replica el refactor en su entorno local",
          "indicadorEvaluacion": "Ejecución exitosa de tests unitarios"
        },
        {
          "tipoMomento": "CIERRE",
          "nombreMomento": "Conclusiones y metacognición",
          "duracionMin": 15,
          "actividadesDocente": "Sintetiza las reglas de oro del SRP y asigna desafío",
          "actividadesEstudiante": "Responde cuestionario rápido de autoevaluación",
          "indicadorEvaluacion": "Ticket de salida conceptual"
        }
      ]
    }
  ],
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```

---

### API Importar Programa Analítico desde Word
Parsea un archivo Word `.docx` con la estructura tabular del Programa Analítico.

* **Método:** `POST`
* **URL:** `/api/v1/office/import/programa-analitico`
* **Cabecera:** `Content-Type: multipart/form-data`
* **📤 Lo que se envía:** 
  - `file`: Archivo `.docx`
  - `asignacionId`: `1`

#### 📥 Lo que recibimos (Response):
```json
{
  "status": 200,
  "message": "Documento Programa Analítico importado exitosamente",
  "data": {
    "asignacionId": 1,
    "codigoAsignatura": "SIS-213",
    "nombreAsignatura": "PROGRAMACIÓN III",
    "semestre": "3°",
    "caracterizacion": "Materia de formación profesional...",
    "macroCompetencia": "Desarrolla soluciones de software modulares...",
    "sistemaEvaluacion": "Evaluación continua formativa y sumativa",
    "unidades": [
      {
        "numeroUnidad": 1,
        "titulo": "Arquitectura y Patrones de Software",
        "saberesConceptuales": "SOLID, Patrones GoF, Clean Architecture",
        "saberesProcedimentales": "Implementación de patrones en Java",
        "saberesActitudinales": "Rigor técnico",
        "criteriosDesempeno": "Aplica separación de responsabilidades",
        "horasAcademicas": 16,
        "temas": [
          {
            "numeroTema": 1,
            "titulo": "Principios SOLID",
            "contenido": "SRP, OCP, LSP, ISP, DIP"
          }
        ]
      }
    ],
    "bibliografia": [
      {
        "tipo": "BASICA",
        "citaApa": "Martin, R. C. (2017). Clean Architecture. Prentice Hall.",
        "autor": "Robert C. Martin",
        "anio": 2017,
        "titulo": "Clean Architecture",
        "editorialUrl": "Prentice Hall"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-27T17:30:00.000Z"
  }
}
```
