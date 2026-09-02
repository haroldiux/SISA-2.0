
    // ── GLOBAL SELECTOR HOOKS ───────────────────────────────────────────
    window.onDocenteSelectorChange = function(ci) {
      if (typeof window.selectDocenteFromApi === 'function') {
        window.selectDocenteFromApi(ci, false);
      }
    };

    // ── AUTO-GROWING TEXTAREAS ENGINE (ZERO SCROLLBARS) ─────────────────────────
    window.autoResizeTextarea = function(el) {
      if (!el || el.tagName !== 'TEXTAREA') return;
      el.style.height = 'auto';
      el.style.overflowY = 'hidden';
      el.style.resize = 'none';
      const newHeight = Math.max(el.scrollHeight, 32);
      el.style.height = newHeight + 'px';
    };

    window.autoResizeAllTextareas = function() {
      document.querySelectorAll('textarea').forEach(el => {
        window.autoResizeTextarea(el);
      });
    };

    let activeTabId = 'tab-analitico';
    let activeMateriaKey = 'sis213g1';
    let activeAsignacionId = 1;


    const materiasData = {
      'sis213g1': {
        asignacionId: 1,
        codigo: 'SIS-213',
        nombre: 'PROGRAMACIÓN III',
        semestre: '3º',
        creditos: '12',
        horasTeoricas: '2',
        horasPracticas: '4',
        carrera: 'Ing. de Sistemas',
        carreraTag: 'CARRERA: ING. DE SISTEMAS',
        grupoTag: 'Grupo 1 (G1) • Cátedra de Teoría',
        breadcrumb: 'SIS-213 Programación III (G1)',
        title: 'SIS-213 • PROGRAMACIÓN III',
        meta: '<span><strong class="text-white">3º</strong> Semestre</span><span>•</span><span><strong class="text-white">4</strong> Horas Semanales (Teoría)</span><span>•</span><span><strong class="text-white">120</strong> Horas Totales</span><span>•</span><span>Campus: Juan Pablo II (Aula 302)</span>',
        caracterizacion: 'La asignatura de Programación III profundiza en el paradigma orientado a objetos, arquitecturas multicapa, diseño desacoplado y construcción de software escalable.',
        macroCompetencia: 'Desarrolla sistemas de software modulares y mantenibles aplicando patrones de diseño, principios SOLID y estructuras de datos eficientes.',
        sistemaEvaluacion: 'Evaluación continua diagnóstica, formativa y sumativa por competencias con proyectos de desarrollo de software.',
        unidades: [
          {
            numeroUnidad: 1,
            titulo: 'Arquitectura de Entidades y Modelado de Sistemas',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 1, titulo: 'Anatomía de la Entidad y el Objeto', contenido: '• El objeto como unidad fundamental de lógica y estado.\n• Atributos de identidad y comportamientos de acción.\n• Ciclo de vida: de la instanciación a la recolección de memoria.' },
              { numeroTema: 2, titulo: 'Jerarquías de Especialización y Contratos', contenido: '• Herencia: creación de linajes de entidades para reutilización.\n• Interfaces y Clases Abstractas: definición de contratos.\n• Polimorfismo y composición sobre herencia.' }
            ]
          },
          {
            numeroUnidad: 2,
            titulo: 'Robustez y Blindaje de la Lógica de Negocio',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 3, titulo: 'Encapsulamiento y Gestión de Estados Críticos', contenido: '• Visibilidad y protección: niveles de acceso.\n• Validación de estados internos y prevención de corrupción de datos.\n• Manejo de excepciones en tiempo de ejecución.' }
            ]
          },
          {
            numeroUnidad: 3,
            titulo: 'Sistemas de Interacción y Despacho de Eventos',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 4, titulo: 'Representación Visual de Objetos y Entornos', contenido: '• Mapeo de objetos lógicos a componentes visuales.\n• Jerarquía de contenedores y orquestación en pantalla.' },
              { numeroTema: 5, titulo: 'Dinámicas de Interacción y Flujo de Señales', contenido: '• Despacho de eventos y oyentes (listeners).\n• Vinculación bidireccional y reactividad.' }
            ]
          },
          {
            numeroUnidad: 4,
            titulo: 'Gestión y Despliegue de Soluciones Integrales',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 6, titulo: 'Ingeniería de Software y Construcción del Mundo', contenido: '• Integración modular y empaquetado de ejecutables.\n• Pruebas unitarias automatizadas y verificación de integración.' }
            ]
          }
        ],
        bibliografia: [
          { tipo: 'BASICA', citaApa: 'Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (2020). Patrones de Diseño: Elementos de Software Orientado a Objetos Reutilizable. Pearson.', autor: 'Gamma et al.', anio: 2020, titulo: 'Patrones de Diseño' },
          { tipo: 'BASICA', citaApa: 'Martin, R. C. (2018). Clean Architecture: A Craftsman\'s Guide to Software Structure and Design. Prentice Hall.', autor: 'Martin, R. C.', anio: 2018, titulo: 'Clean Architecture' },
          { tipo: 'COMPLEMENTARIA', citaApa: 'Bloch, J. (2018). Effective Java (3rd ed.). Addison-Wesley Professional.', autor: 'Bloch, J.', anio: 2018, titulo: 'Effective Java' }
        ],
        elementosCompetencia: [
          'Modela entidades con estados y ciclos de vida definidos.',
          'Implementa mecanismos de protección y manejo de errores en la lógica de negocio.',
          'Diseña interfaces interactivas basadas en el modelo de suscripción y notificación de eventos.',
          'Aplica patrones de diseño para resolver problemas recurrentes de arquitectura.'
        ]
      },
      'sis213g2': {
        asignacionId: 2,
        codigo: 'SIS-213',
        nombre: 'PROGRAMACIÓN III',
        semestre: '3º',
        creditos: '12',
        horasTeoricas: '2',
        horasPracticas: '4',
        carrera: 'Ing. de Sistemas',
        carreraTag: 'CARRERA: ING. DE SISTEMAS',
        grupoTag: 'Grupo 2 (G2) • Cátedra Integral (Teoría + Práctica)',
        breadcrumb: 'SIS-213 Programación III (G2)',
        title: 'SIS-213 • PROGRAMACIÓN III',
        meta: '<span><strong class="text-white">3º</strong> Semestre</span><span>•</span><span><strong class="text-white">4</strong> Horas Semanales (Integral)</span><span>•</span><span><strong class="text-white">120</strong> Horas Totales</span><span>•</span><span>Campus: Juan Pablo II (Lab 104)</span>',
        caracterizacion: 'La asignatura de Programación III en su modalidad integral combina fundamentos teóricos con sesiones intensivas de codificación y laboratorio práctico.',
        macroCompetencia: 'Desarrolla sistemas de software modulares y mantenibles aplicando patrones de diseño, principios SOLID y estructuras de datos eficientes.',
        sistemaEvaluacion: 'Evaluación continua diagnóstica, formativa y sumativa por competencias con proyectos de desarrollo en laboratorio.',
        unidades: [
          {
            numeroUnidad: 1,
            titulo: 'Arquitectura de Entidades y Modelado de Sistemas',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 1, titulo: 'Anatomía de la Entidad y el Objeto', contenido: '• El objeto como unidad fundamental de lógica y estado.\n• Atributos de identidad y comportamientos de acción.' },
              { numeroTema: 2, titulo: 'Jerarquías de Especialización y Contratos', contenido: '• Herencia e interfaces en proyectos de software.' }
            ]
          },
          {
            numeroUnidad: 2,
            titulo: 'Laboratorio de Construcción de Software',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 3, titulo: 'Taller Práctico de Patrones y Buenas Prácticas', contenido: '• Implementación guiada en Java 21 y frameworks modernos.' }
            ]
          }
        ],
        bibliografia: [
          { tipo: 'BASICA', citaApa: 'Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (2020). Patrones de Diseño: Elementos de Software Orientado a Objetos Reutilizable. Pearson.', autor: 'Gamma et al.', anio: 2020, titulo: 'Patrones de Diseño' }
        ],
        elementosCompetencia: [
          'Modela entidades con estados y ciclos de vida definidos.',
          'Implementa mecanismos de protección y manejo de errores en la lógica de negocio.',
          'Diseña interfaces interactivas basadas en el modelo de suscripción y notificación de eventos.',
          'Aplica patrones de diseño para resolver problemas recurrentes de arquitectura.'
        ]
      },
      'ind211': {
        asignacionId: 3,
        codigo: 'IND-211',
        nombre: 'COMPUTACIÓN APLICADA',
        semestre: '2º',
        creditos: '10',
        horasTeoricas: '2',
        horasPracticas: '4',
        carrera: 'Ing. Industrial',
        carreraTag: 'CARRERA: ING. INDUSTRIAL',
        grupoTag: 'Grupo 1 (G1) • Cátedra de Teoría',
        breadcrumb: 'IND-211 Computación Aplicada (G1)',
        title: 'IND-211 • COMPUTACIÓN APLICADA',
        meta: '<span><strong class="text-white">2º</strong> Semestre</span><span>•</span><span><strong class="text-white">4</strong> Horas Semanales (Teoría)</span><span>•</span><span><strong class="text-white">100</strong> Horas Totales</span><span>•</span><span>Campus: Central (Aula 204)</span>',
        caracterizacion: 'Asignatura orientada a la modelación cuantitativa, automatización de procesos industriales, análisis de datos en hojas de cálculo avanzadas y optimización operativa.',
        macroCompetencia: 'Aplica herramientas computacionales para la modelación, simulación y optimización de procesos de manufactura y servicios en ingeniería industrial.',
        sistemaEvaluacion: 'Evaluación formativa mediante talleres computacionales, resolución de casos industriales y desarrollo de modelos de optimización.',
        unidades: [
          {
            numeroUnidad: 1,
            titulo: 'Modelación Cuantitativa y Funciones Avanzadas en Hojas de Cálculo',
            horasAcademicas: 25,
            temas: [
              { numeroTema: 1, titulo: 'Fórmulas Matriciales y Tablas Dinámicas Complejas', contenido: '• Estructuración y limpieza de grandes volúmenes de datos industriales.\n• Fórmulas de búsqueda matricial y funciones lógicas anidadas.' },
              { numeroTema: 2, titulo: 'Optimización Lineal con Solver', contenido: '• Formulación matemática de funciones objetivo y restricciones de planta.\n• Análisis de sensibilidad y parámetros de holgura operativa.' }
            ]
          },
          {
            numeroUnidad: 2,
            titulo: 'Automatización de Tareas con Macros y Scripts',
            horasAcademicas: 25,
            temas: [
              { numeroTema: 3, titulo: 'Automatización de Reportes de Producción', contenido: '• Grabación y depuración de macros de control.\n• Estructuras de control y bucles en Visual Basic / Python scripts.' }
            ]
          },
          {
            numeroUnidad: 3,
            titulo: 'Simulación de Procesos Industriales y Análisis Estadístico',
            horasAcademicas: 25,
            temas: [
              { numeroTema: 4, titulo: 'Simulación Monte Carlo y Modelos Estocásticos', contenido: '• Generación de variables aleatorias y simulación de tiempos de ciclo.\n• Evaluación de riesgos operacionales y cuellos de botella.' }
            ]
          }
        ],
        bibliografia: [
          { tipo: 'BASICA', citaApa: 'Walkenbach, J. (2019). Excel 2019 Power Programming with VBA. Wiley.', autor: 'Walkenbach, J.', anio: 2019, titulo: 'Excel Power Programming' },
          { tipo: 'BASICA', citaApa: 'Hillier, F. S., & Lieberman, G. J. (2021). Introducción a la Investigación de Operaciones (11ª ed.). McGraw-Hill.', autor: 'Hillier & Lieberman', anio: 2021, titulo: 'Investigación de Operaciones' },
          { tipo: 'COMPLEMENTARIA', citaApa: 'Chase, R. B., & Jacobs, F. R. (2018). Administración de Operaciones: Producción y Cadena de Suministros. McGraw-Hill.', autor: 'Chase & Jacobs', anio: 2018, titulo: 'Administración de Operaciones' }
        ],
        elementosCompetencia: [
          'Formula modelos de programación lineal para la asignación óptima de recursos en planta.',
          'Automatiza reportes de producción e indicadores de productividad mediante macros y scripts.',
          'Evalúa riesgos operacionales y cuellos de botella empleando simulaciones Monte Carlo.'
        ]
      },
      'idi101': {
        asignacionId: 4,
        codigo: 'IDI-101',
        nombre: 'TALLER DE IDIOMAS',
        semestre: '1º',
        creditos: '8',
        horasTeoricas: '2',
        horasPracticas: '4',
        carrera: 'FACEFA',
        carreraTag: 'CARRERA: FACEFA (ADMINISTRACIÓN / AUDITORÍA)',
        grupoTag: 'Grupo 1 (G1) • Cátedra Práctica',
        breadcrumb: 'IDI-101 Taller de Idiomas (G1)',
        title: 'IDI-101 • TALLER DE IDIOMAS (QUECHUA / AYMARA)',
        meta: '<span><strong class="text-white">1º</strong> Semestre</span><span>•</span><span><strong class="text-white">4</strong> Horas Semanales (Práctica)</span><span>•</span><span><strong class="text-white">80</strong> Horas Totales</span><span>•</span><span>Campus: Central (Aula 101)</span>',
        caracterizacion: 'Formación lingüística y comunicativa orientada a la interacción intercultural, el plurilingüismo y la inclusión en el ejercicio profesional administrativo y financiero.',
        macroCompetencia: 'Comunica ideas, términos técnicos y acuerdos en idioma nativo (Quechua / Aymara) de forma oral y escrita en contextos laborales, comunitarios e interculturales.',
        sistemaEvaluacion: 'Evaluación formativa y sumativa con diálogos orales, redacción de documentos bilingües y pruebas de comprensión auditiva.',
        unidades: [
          {
            numeroUnidad: 1,
            titulo: 'Fonética, Fonología y Estructuras Gramaticales Básicas',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 1, titulo: 'Sistema Fonológico y Alfabeto Oficial', contenido: '• Grafías consonánticas y vocálicas del idioma nativo.\n• Reglas de acentuación y pronunciación.' },
              { numeroTema: 2, titulo: 'Saludos, Presentaciones y Cortesía Intercultural', contenido: '• Fórmulas de saludo en contextos formales y comunitarios.\n• Pronombres personales y sufijos posesivos.' }
            ]
          },
          {
            numeroUnidad: 2,
            titulo: 'Morfosintaxis y Comunicación Funcional en el Ámbito Laboral',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 3, titulo: 'Conjugación Verbal y Sufijación Aglutinante', contenido: '• Tiempos verbales: presente, pasado testimonial y futuro.\n• Diálogos situacionales en atención al usuario.' }
            ]
          },
          {
            numeroUnidad: 3,
            titulo: 'Terminología Comercial, Administrativa y Normativa Plurilingüe',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 4, titulo: 'Léxico Financiero, Administrativo y Acuerdos de Negociación', contenido: '• Números, transacciones comerciales y redacción de actas breves.\n• Aplicación de la Ley Nº 269 de Políticas Lingüísticas.' }
            ]
          }
        ],
        bibliografia: [
          { tipo: 'BASICA', citaApa: 'Cerrón-Palomino, R. (2017). Lingüística Quechua (3ª ed.). Editorial Biblioteca de Tradición Oral Andina.', autor: 'Cerrón-Palomino, R.', anio: 2017, titulo: 'Lingüística Quechua' },
          { tipo: 'BASICA', citaApa: 'Cochabamba, Q. P. (2020). Runasimi: Gramática quechua para todos. Editorial Itinerarios / UMSS.', autor: 'Cochabamba, Q. P.', anio: 2020, titulo: 'Runasimi' },
          { tipo: 'COMPLEMENTARIA', citaApa: 'Plaza Martínez, P. (2018). Diccionario quechua-castellano: Dialecto de Bolivia. Editorial Kipus.', autor: 'Plaza Martínez, P.', anio: 2018, titulo: 'Diccionario Quechua' }
        ],
        elementosCompetencia: [
          'Analiza los fundamentos lingüísticos, históricos y fonológicos de la lengua quechua.',
          'Produce mensajes y estructuras oracionales complejas en lengua quechua.',
          'Aplica léxico comercial, administrativo y acuerdos de negociación en lengua nativa.'
        ]
      }
    };



    window.applyThemePreference = function() {
      const html = document.documentElement;
      const savedTheme = localStorage.getItem('sisa_theme_preference') || (html.classList.contains('dark') ? 'dark' : 'light');
      const isDark = (savedTheme === 'dark');

      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      const icon = document.getElementById('theme-icon');
      const label = document.getElementById('theme-label');
      if (label) {
        label.innerText = isDark ? 'Tema Claro' : 'Tema Oscuro';
      }
      if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        icon.className = isDark ? 'w-4 h-4 text-amber-400' : 'w-4 h-4 text-purple-300';
      }
      if (window.lucide) window.lucide.createIcons();
    };

    window.toggleTheme = function() {
      const html = document.documentElement;
      const willBeDark = !html.classList.contains('dark');
      localStorage.setItem('sisa_theme_preference', willBeDark ? 'dark' : 'light');
      window.applyThemePreference();
      window.showToast(willBeDark ? 'Modo Oscuro activado' : 'Modo Claro activado');
    };

    // Apply immediately on controller load
    window.applyThemePreference();


    window.switchView = function(viewId) {
      document.querySelectorAll('.frame-view').forEach(view => view.classList.add('hidden'));
      const target = document.getElementById(viewId);
      if (target) target.classList.remove('hidden');

      document.querySelectorAll('.view-tab-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-300');
      });

      const activeBtn = document.getElementById('btn-' + viewId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-300');
        activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-sm');
      }
      if (window.lucide) window.lucide.createIcons();
    };

    window.switchDocMainTab = function(tabId) {
      if (!tabId.startsWith('tab-')) {
        tabId = 'tab-' + tabId;
      }
      activeTabId = tabId;
      document.querySelectorAll('.doc-tab-panel').forEach(panel => panel.classList.add('hidden'));
      const target = document.getElementById(tabId);
      if (target) target.classList.remove('hidden');

      // Top Tab Navigation Bar (Segmented High Visibility Control)
      document.querySelectorAll('.doc-main-tab-btn').forEach(btn => {
        btn.className = 'doc-main-tab-btn px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-200 bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border border-transparent';
      });
      const activeBtn = document.getElementById('btn-' + tabId);
      if (activeBtn) {
        let ringColor = 'ring-blue-500/20';
        if (tabId === 'tab-pac-matrix') ringColor = 'ring-emerald-500/20';
        else if (tabId === 'tab-cronograma-semanas') ringColor = 'ring-amber-500/20';
        else if (tabId === 'tab-cronograma-planes') ringColor = 'ring-purple-500/20';

        activeBtn.className = 'doc-main-tab-btn px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border border-slate-300/80 dark:border-slate-700 font-bold scale-[1.02] ring-2 ' + ringColor;
      }

      // Sidebar Tab Highlights
      document.querySelectorAll('.sidebar-tab-nav').forEach(btn => {
        btn.className = 'sidebar-tab-nav w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium text-xs text-left cursor-pointer transition-all';
      });
      const activeSidebarTab = document.getElementById('sidebar-' + tabId);
      if (activeSidebarTab) {
        activeSidebarTab.className = 'sidebar-tab-nav w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700/60 font-bold text-xs text-left cursor-pointer transition-all';
      }

      if (tabId === 'tab-analitico') {
        const card = document.getElementById('analitico-unidades-card');
        if (!card || !card.innerHTML.trim()) {
          if (typeof window.renderAnaliticoUnidades === 'function') {
            window.renderAnaliticoUnidades();
          }
          if (typeof window.renderAnaliticoBibliografia === 'function') {
            window.renderAnaliticoBibliografia();
          }
        }
      }

      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') {
          window.autoResizeAllTextareas();
        }
      }, 50);

      if (window.lucide) window.lucide.createIcons();
    };


    // Global Delegated Click Listener for Tabs
    document.addEventListener('click', function(e) {
      const tabBtn = e.target.closest('[data-doc-main-tab], .doc-main-tab-btn, .sidebar-tab-nav');
      if (tabBtn) {
        let tabId = tabBtn.getAttribute('data-doc-main-tab');
        if (!tabId && tabBtn.id) {
          tabId = tabBtn.id.replace('btn-', '').replace('sidebar-', '');
        }
        if (tabId) {
          window.switchDocMainTab(tabId);
        }
      }
    });






    window.selectDocenteMateria = function(materiaKey) {
      // 1. Silently persist previous subject state before switching
      if (typeof window.saveCurrentDocenteData === 'function') {
        window.saveCurrentDocenteData(true);
      }

      activeMateriaKey = materiaKey;
      if (!materiasData[activeMateriaKey]) {
        const keys = Object.keys(materiasData);
        activeMateriaKey = keys.length > 0 ? keys[0] : 'sis213g1';
      }
      localStorage.setItem('sisa_active_materia_key', activeMateriaKey);
      const data = materiasData[activeMateriaKey] || materiasData['sis213g1'];
      activeAsignacionId = data.asignacionId || 1;
      
      // Update Main Subject Cards Highlight
      const activeCardClasses = ['border-2', 'border-brand-600', 'bg-brand-50/60', 'dark:bg-brand-950/40', 'ring-4', 'ring-brand-500/20', 'shadow-lg', 'scale-[1.02]'];
      const inactiveCardClasses = ['border', 'border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900', 'shadow-sm', 'hover:border-brand-400', 'dark:hover:border-brand-500', 'hover:shadow-md'];

      document.querySelectorAll('.doc-materia-card').forEach(card => {
        card.classList.remove(...activeCardClasses);
        card.classList.add(...inactiveCardClasses);
        const badge = card.querySelector('.doc-card-action-badge');
        if (badge) {
          badge.outerHTML = '<span class="doc-card-action-badge text-slate-400 text-[10px] font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">Ver Carga ➔</span>';
        }
      });
      const selectedCard = document.getElementById('doc-materia-card-' + activeMateriaKey);
      if (selectedCard) {
        selectedCard.classList.remove(...inactiveCardClasses);
        selectedCard.classList.add(...activeCardClasses);
        const badge = selectedCard.querySelector('.doc-card-action-badge');
        if (badge) {
          badge.outerHTML = '<span class="doc-card-action-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white shadow-sm flex items-center gap-1.5 ring-2 ring-brand-500/30"><span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Activa</span>';
        }
      }

      // Update Sidebar Subject Buttons Highlight
      document.querySelectorAll('.sidebar-materia-btn').forEach(btn => {
        btn.className = 'sidebar-materia-btn w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-all cursor-pointer';
      });
      const selectedSidebarBtn = document.getElementById('sidebar-materia-' + activeMateriaKey);
      if (selectedSidebarBtn) {
        selectedSidebarBtn.className = 'sidebar-materia-btn w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between bg-brand-600 text-white shadow-sm transition-all cursor-pointer';
      }

      // Update Breadcrumbs & Banner
      if (document.getElementById('docente-carrera-crumb')) document.getElementById('docente-carrera-crumb').innerText = data.carrera;
      if (document.getElementById('docente-breadcrumb')) document.getElementById('docente-breadcrumb').innerText = data.breadcrumb;
      if (document.getElementById('banner-carrera-tag')) document.getElementById('banner-carrera-tag').innerText = data.carreraTag;
      if (document.getElementById('banner-grupo-tag')) document.getElementById('banner-grupo-tag').innerText = data.grupoTag;
      if (document.getElementById('banner-materia-title')) document.getElementById('banner-materia-title').innerText = data.title;
      if (document.getElementById('banner-materia-meta')) document.getElementById('banner-materia-meta').innerHTML = data.meta;
      
      // Update form header inputs
      if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = data.codigo;
      if (document.getElementById('analitico-asig-input')) document.getElementById('analitico-asig-input').value = data.nombre;

      // Load that specific subject's documents & data
      if (typeof window.loadSavedDocenteData === 'function') {
        window.loadSavedDocenteData(activeMateriaKey);
      }

      // Render Career Sub-Tabs Switcher for Multicarrera preview
      if (typeof window.renderCarreraSubtabs === 'function') {
        window.renderCarreraSubtabs(activeMateriaKey);
      }

      // Render dedicated full schedules panel for the selected course
      if (typeof window.renderMateriaSchedulesDetail === 'function') {
        window.renderMateriaSchedulesDetail(data);
      }

      // Auto-resize textareas to fit content
      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') {
          window.autoResizeAllTextareas();
        }
      }, 60);

      window.showToast('📁 Carpeta cargada: ' + data.breadcrumb);
      if (window.lucide) window.lucide.createIcons();
    };


    window.exportExactFile = function(type) {
      const files = {
        'docx': '1. Programa Analitico (.docx)',
        'pac_cronograma_xlsx': '2 y 3. PAC + Cronograma (.xlsx)',
        'planes_xlsx': '4. PLAN DE CLASES (.xlsx)'
      };
      const fname = files[type] || 'documento';
      window.showToast('📥 Exportando en formato oficial: ' + fname);
    };

    /* ========================================================================= */
    /* UNITEPC OFFICIAL PRINT & PDF EXPORT FOLDER GENERATOR                      */
    /* (PORTADA, INDICE, MVP, HORARIOS, PA, PAC, CRONOGRAMA, PLAN DE CLASE)       */
    /* ========================================================================= */

    window.UNITEPC_CAREER_MVP = {
      'CARSIS': {
        facultad: 'FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA',
        carrera: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS',
        mision: 'Nuestra misión es formar ingenieros de sistemas altamente capacitados y comprometidos con la excelencia académica, la innovación tecnológica y el servicio a la sociedad. Nos esforzamos por proporcionar una educación integral que combine sólidos conocimientos técnicos con habilidades interpersonales y éticas, preparando a nuestros estudiantes para enfrentar los desafíos del mundo digital y contribuir de manera significativa al desarrollo sostenible de la sociedad.',
        vision: 'Ser reconocidos a nivel nacional e internacional como líderes en la formación de ingenieros de sistemas, destacando por nuestra excelencia académica, investigación de vanguardia y contribuciones significativas a la innovación tecnológica y el progreso social. Buscamos ser un referente en la aplicación ética y responsable de la tecnología, promoviendo un entorno inclusivo y diverso que fomente el crecimiento personal y profesional de nuestros estudiantes y colaboradores.',
        perfil: 'El Ingeniero de Sistemas formado en nuestra institución posee una sólida base de conocimientos en áreas clave como la programación, la ingeniería de software, la gestión de bases de datos, la seguridad informática, las redes de computadoras, la inteligencia artificial y la gestión de proyectos tecnológicos. Además, cuenta con habilidades analíticas y de resolución de problemas, capacidad para trabajar en equipo y comunicarse efectivamente con personas de diferentes disciplinas y contextos.'
      },
      'CARELE': {
        facultad: 'FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA',
        carrera: 'LICENCIATURA EN INGENIERÍA ELECTRÓNICA',
        mision: 'Formar ingenieros electrónicos con sólidos principios éticos, científicos y tecnológicos, capaces de diseñar, implementar y optimizar sistemas electrónicos, de automatización industrial, control y telecomunicaciones que impulsen el desarrollo productivo.',
        vision: 'Ser la carrera líder en ingeniería electrónica, referente por su calidad formativa, laboratorios de última generación e investigación aplicada orientada a la industria 4.0 y la transformación digital.',
        perfil: 'El Ingeniero Electrónico egresado de UNITEPC está capacitado para diseñar, operar y mantener sistemas de telecomunicaciones, robótica, instrumentación biomédica, redes industriales y sistemas embebidos con alto rigor técnico.'
      },
      'CARSON': {
        facultad: 'FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA',
        carrera: 'LICENCIATURA EN INGENIERÍA DE SONIDO',
        mision: 'Formar profesionales en acústica, sonido en vivo y producción musical con excelencia técnica, sensibilidad estética y dominio de tecnologías de audio digital.',
        vision: 'Consolidarse como el referente nacional e internacional en ingeniería acústica, diseño electroacústico y producción de medios inmersivos.',
        perfil: 'Domina el diseño acústico, refuerzo sonoro en vivo, grabación y postproducción multicanal, sistemas de audio digital y psicoacústica aplicada.'
      },
      'CARIBI': {
        facultad: 'FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA',
        carrera: 'LICENCIATURA EN INGENIERÍA BIOMÉDICA',
        mision: 'Formar ingenieros biomédicos éticos e innovadores en el diseño, mantenimiento y gestión de tecnología médica y hospitalaria para mejorar la salud y calidad de vida.',
        vision: 'Ser líderes en el desarrollo de bioingeniería, procesamiento de bioseñales e ingeniería clínica a nivel nacional.',
        perfil: 'Aplica principios de ingeniería y ciencias médicas en instrumentación electromédica, prótesis, biomecánica y gestión de tecnología hospitalaria.'
      },
      'CARMED': {
        facultad: 'FACULTAD DE MEDICINA',
        carrera: 'LICENCIATURA EN MEDICINA HUMANA',
        mision: 'Formar médicos cirujanos con excelencia académica, profunda vocación humanística, habilidades clínico-quirúrgicas y compromiso con la salud comunitaria.',
        vision: 'Ser una facultad de medicina de prestigio internacional, reconocida por su rigor científico, campos clínicos y aportes a la salud pública.',
        perfil: 'Realiza diagnósticos certeros, tratamientos basados en evidencia, promoción de la salud y prevención con estricta observancia de la bioética médica.'
      },
      'CARADM': {
        facultad: 'FACULTAD DE CIENCIAS ECONÓMICAS Y FINANCIERAS (FACEFA)',
        carrera: 'LICENCIATURA EN ADMINISTRACIÓN DE EMPRESAS',
        mision: 'Formar profesionales líderes en gestión empresarial, emprendimiento e innovación estratégica con responsabilidad social y visión global.',
        vision: 'Ser la carrera referente en formación gerencial y desarrollo de negocios sostenibles en la región.',
        perfil: 'Lidera procesos de planificación estratégica, finanzas, talento humano, marketing y operaciones en empresas públicas y privadas.'
      },
      'DEFAULT': {
        facultad: 'FACULTAD DE CIENCIAS EXACTAS Y TECNOLOGÍA',
        carrera: 'LICENCIATURA UNIVERSITARIA',
        mision: 'Formar profesionales integrales, competentes, con sólidos valores éticos, vocación de servicio y excelencia técnica y científica.',
        vision: 'Ser una universidad privada de excelencia, referente en educación superior y transformación social.',
        perfil: 'Profesional capacitado para resolver problemas complejos de su disciplina con pensamiento crítico, innovación y ética.'
      }
    };

    window.openPdfPrintModal = function() {
      const mKey = activeMateriaKey || 'sis213g1';
      const data = materiasData[mKey] || materiasData['sis213g1'];
      const rawCareers = data.carrerasCodes || ['CARSIS'];
      const resolvedCareers = data.carrerasResolved || [{ name: 'Ingeniería de Sistemas', tag: 'ING. SISTEMAS' }];

      let careerOptionsHtml = '';
      if (rawCareers.length > 1) {
        careerOptionsHtml += `
          <div class="mb-3 p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
            <label class="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <i data-lucide="layers" class="w-4 h-4 text-purple-600"></i> Membrete y Carrera para la Impresión Oficial:
            </label>
            <select id="print-career-selector" class="w-full p-2.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs">
              <option value="ALL">🌐 Vista Colegiada / Multicarrera (${data.codigo})</option>
        `;

        rawCareers.forEach((cCode, idx) => {
          const cr = resolvedCareers[idx] || { name: cCode };
          const singleCode = typeof window.resolveOfficialCourseCode === 'function' ? window.resolveOfficialCourseCode(data.nombre, [cCode]) : cCode;
          careerOptionsHtml += `
            <option value="${cCode}">🎓 ${cr.name} (${singleCode})</option>
          `;
        });

        careerOptionsHtml += `
            </select>
          </div>
        `;
      } else {
        const singleCode = typeof window.resolveOfficialCourseCode === 'function' ? window.resolveOfficialCourseCode(data.nombre, rawCareers) : data.codigo;
        careerOptionsHtml = `
          <input type="hidden" id="print-career-selector" value="${rawCareers[0] || 'CARSIS'}">
        `;
      }

      const modalBody = `
        <div class="space-y-4 text-xs">
          <p class="text-slate-700 dark:text-slate-300">Seleccioná los documentos que deseas imprimir o exportar a PDF:</p>
          
          ${careerOptionsHtml}

          <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label class="flex items-center gap-3 cursor-pointer select-none pb-2.5 border-b border-slate-200 dark:border-slate-700">
              <input type="checkbox" id="chk-print-all" checked onchange="window.toggleAllPrintCheckboxes(this.checked)" class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500">
              <span class="font-bold text-slate-900 dark:text-white text-sm">📁 Imprimir Toda la Carpeta Completa</span>
            </label>

            <div class="space-y-2 pt-1 text-slate-700 dark:text-slate-300">
              <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
                <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-brand-600" data-section="pa" checked onchange="window.updateMasterPrintCheckbox()">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white block">📋 Programa Analítico</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Formato oficial normado a 2 columnas con tabla técnica, 4 unidades y bibliografía APA.</span>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
                <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-brand-600" data-section="pac_cronograma" checked onchange="window.updateMasterPrintCheckbox()">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white block">📊 PAC con el Cronograma</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Mismo formato que el Excel / PDF base para el PAC (Identificación, Matriz 20 Semanas, Metodología, Evaluación, Normativa y Bibliografía).</span>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
                <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-brand-600" data-section="plan_clase" checked onchange="window.updateMasterPrintCheckbox()">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white block">📝 Plan de Clase</span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Formato oficial con las fichas de sesión didáctica (Inicio, Desarrollo y Cierre).</span>
                </div>
              </label>
            </div>
          </div>
          
          <div class="flex justify-between items-center pt-2">
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Formato oficial normado según el modelo educativo UNITEPC.</span>
            <div class="flex gap-2">
              <button onclick="window.closeModal()" class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
              <button onclick="window.previewOfficialDocument()" class="px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                👁️ Vista Previa en Pantalla
              </button>
              <button onclick="window.executeSelectedPrint()" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                🖨️ Generar PDF / Imprimir
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('modal-title').innerText = 'Carpeta Pedagógica Docente Oficial UNITEPC (Formato de Impresión)';
      document.getElementById('modal-body').innerHTML = modalBody;
      document.getElementById('modal-footer').classList.add('hidden');
      document.getElementById('modal-container').classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    };

    window.previewOfficialDocument = function() {
      const selectedSections = [];
      const masterChecked = document.getElementById('chk-print-all')?.checked;
      if (masterChecked) {
        selectedSections.push('portada', 'indice', 'mvp', 'horarios');
      }
      document.querySelectorAll('.chk-print-sec:checked').forEach(c => {
        selectedSections.push(c.getAttribute('data-section'));
      });
      if (selectedSections.length === 0) {
        window.showToast('⚠️ Por favor selecciona al menos una sección para previsualizar');
        return;
      }
      const careerSelector = document.getElementById('print-career-selector');
      const selectedCareerCode = careerSelector ? careerSelector.value : 'ALL';
      const docHtml = window.buildOfficialFolderHtml(selectedSections, selectedCareerCode);

      const previewContainer = `
        <div class="space-y-4">
          <div class="flex items-center justify-between p-2.5 bg-slate-800 text-white rounded-xl text-xs">
            <span class="font-bold flex items-center gap-2"><i data-lucide="file-check" class="w-4 h-4 text-emerald-400"></i> Vista Previa Digital - Carpeta Oficial UNITEPC (Hojas Tamaño Carta)</span>
            <div class="flex gap-2">
              <button onclick="window.openPdfPrintModal()" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors">Volver a Opciones</button>
              <button onclick="window.executeSelectedPrint()" class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i> Imprimir / Guardar en PDF
              </button>
            </div>
          </div>
          <div class="max-h-[75vh] overflow-y-auto bg-slate-900/90 p-4 rounded-xl space-y-6 flex flex-col items-center custom-scrollbar">
            <div class="w-full max-w-[800px] space-y-6">
              ${docHtml}
            </div>
          </div>
        </div>
      `;

      document.getElementById('modal-title').innerText = 'Vista Previa Oficial de Impresión y PDF';
      document.getElementById('modal-body').innerHTML = previewContainer;
      document.getElementById('modal-footer').classList.add('hidden');
      if (window.lucide) window.lucide.createIcons();
    };

    window.toggleAllPrintCheckboxes = function(isChecked) {
      document.querySelectorAll('.chk-print-sec').forEach(chk => chk.checked = isChecked);
    };

    window.updateMasterPrintCheckbox = function() {
      const all = Array.from(document.querySelectorAll('.chk-print-sec'));
      const master = document.getElementById('chk-print-all');
      if (master) master.checked = all.every(c => c.checked);
    };

    window.buildOfficialFolderHtml = function(selectedSections, selectedCareerCode) {
      const mKey = activeMateriaKey || 'sis213g1';
      const data = materiasData[mKey] || materiasData['sis213g1'];
      const docenteName = (document.getElementById('docente-api-selector')?.selectedOptions?.[0]?.text?.replace(/\[.*?\]\s*/, '')?.replace(/\(.*?\)/, '')) || 'ROSMERY LUIZAGA SALINAS';

      let targetCareerCode = selectedCareerCode;
      if (targetCareerCode === 'ALL') {
        targetCareerCode = (data.carrerasCodes && data.carrerasCodes[0]) ? data.carrerasCodes[0] : 'CARSIS';
      }

      const careerMeta = window.UNITEPC_CAREER_MVP[targetCareerCode] || window.UNITEPC_CAREER_MVP['DEFAULT'];
      const officialSingleCode = typeof window.resolveOfficialCourseCode === 'function' ? window.resolveOfficialCourseCode(data.nombre, [targetCareerCode]) : data.codigo;
      const displayCode = selectedCareerCode === 'ALL' ? data.codigo : officialSingleCode;
      const displayCareerName = selectedCareerCode === 'ALL' ? data.carrera : careerMeta.carrera;

      let docHtml = '';

      // 1. PORTADA
      if (selectedSections.includes('portada')) {
        docHtml += `
          <div class="print-page" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 250mm; text-align: center; font-family: Arial, Helvetica, sans-serif; padding: 25mm 20mm 15mm 20mm; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 15pt; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #000;">${careerMeta.facultad}</h2>
              <h3 style="font-size: 13pt; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase; color: #000;">CARRERA DE ${displayCareerName}</h3>
              <h1 style="font-size: 20pt; font-weight: 900; margin: 20px 0 0 0; letter-spacing: 1px; color: #000;">CARPETA PEDAGÓGICA DOCENTE</h1>
            </div>

            <div style="margin: 35mm 0 25mm 0;">
              <div style="font-size: 42pt; font-weight: 900; color: #581c87; letter-spacing: 2px; font-family: 'Arial Black', sans-serif;">
                UNITEPC
              </div>
              <div style="font-size: 13pt; font-weight: bold; color: #0d9488; letter-spacing: 3px; margin-top: -6px;">
                UNIVERSIDAD PRIVADA
              </div>
            </div>

            <div style="margin-bottom: 10mm; display: flex; justify-content: center;">
              <div style="border: 2.5px solid #6b21a8; border-radius: 4px; padding: 22px 30px; width: 90%; max-width: 520px; text-align: left; line-height: 1.8; font-size: 11pt;">
                <p style="margin: 0;"><strong>Nombre del Docente:</strong> ${docenteName}</p>
                <p style="margin: 3px 0 0 0;"><strong>Carrera:</strong> ${displayCareerName}</p>
                <p style="margin: 3px 0 0 0;"><strong>Asignatura:</strong> ${data.nombre}</p>
                <p style="margin: 3px 0 0 0;"><strong>Código de la asignatura:</strong> ${displayCode}</p>
                <p style="margin: 3px 0 0 0;"><strong>Semestre:</strong> ${data.semestre || '1º Semestre'}</p>
                <p style="margin: 3px 0 0 0;"><strong>Gestión:</strong> II/2026</p>
              </div>
            </div>
          </div>
        `;
      }

      // 2. ÍNDICE
      if (selectedSections.includes('indice')) {
        docHtml += `
          <div class="print-page" style="padding: 15mm 15mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 8mm;">
              <div style="font-size: 28pt; font-weight: 900; color: #581c87; letter-spacing: 1.5px;">UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0d9488; letter-spacing: 2px; margin-top: -4px;">UNIVERSIDAD PRIVADA</div>
            </div>

            <div style="background: #6b21a8; color: white; padding: 8px 15px; font-size: 15pt; font-weight: bold; margin-bottom: 12px;">
              ÍNDICE
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt;">
              <thead>
                <tr style="background: #0d9488; color: white;">
                  <th style="text-align: left; padding: 7px 12px; font-weight: bold; width: 78%;">VALORES INSTITUCIONALES</th>
                  <th style="text-align: center; padding: 7px 12px; font-weight: bold; width: 22%;">CÓDIGO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; line-height: 1.7; vertical-align: middle; border-bottom: 1px solid #e2e8f0;">
                    Misión de la carrera<br>
                    Visión de la carrera<br>
                    Perfil profesional
                  </td>
                  <td style="text-align: center; vertical-align: middle; padding: 12px; border-bottom: 1px solid #e2e8f0;">
                    <div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 16px 10px; border-radius: 4px; font-size: 11pt;">MVP</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt;">
              <thead>
                <tr style="background: #6b21a8; color: white;">
                  <th style="text-align: left; padding: 7px 12px; font-weight: bold; width: 78%;">ASPECTOS ORGANIZACIONALES</th>
                  <th style="text-align: center; padding: 7px 12px; font-weight: bold; width: 22%;">CÓDIGO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; line-height: 1.7; vertical-align: middle; border-bottom: 1px solid #e2e8f0;">
                    Horario de clases de la asignatura<br>
                    Rol de exámenes de la asignatura
                  </td>
                  <td style="text-align: center; vertical-align: middle; padding: 12px; border-bottom: 1px solid #e2e8f0;">
                    <div style="background: #e2e8f0; color: #1e293b; font-weight: bold; padding: 16px 10px; border-radius: 4px; font-size: 11pt;">HR</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
              <thead>
                <tr style="background: #0d9488; color: white;">
                  <th style="text-align: left; padding: 7px 12px; font-weight: bold; width: 78%;">PLANIFICACIÓN ACADÉMICA</th>
                  <th style="text-align: center; padding: 7px 12px; font-weight: bold; width: 22%;">CÓDIGO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Programa analítico</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">PA</div></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Programa de asignatura por competencias</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">PAC</div></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Cronograma teórico-práctico</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">CT-P</div></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Plan de clase Teórico-Práctico (según corresponda)</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">PCT-PCP</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }

      // 3. MVP (Misión, Visión, Perfil Profesional)
      if (selectedSections.includes('mvp')) {
        docHtml += `
          <div class="print-page" style="padding: 15mm 15mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 8mm;">
              <div style="font-size: 28pt; font-weight: 900; color: #581c87; letter-spacing: 1.5px;">UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0d9488; letter-spacing: 2px; margin-top: -4px;">UNIVERSIDAD PRIVADA</div>
            </div>

            <div style="margin-bottom: 8mm;">
              <div style="background: #6b21a8; color: white; text-align: center; padding: 6px 10px; font-size: 13pt; font-weight: bold; letter-spacing: 1px;">
                MISIÓN
              </div>
              <div style="border: 2px solid #6b21a8; padding: 12px 16px; font-size: 10pt; text-align: justify; line-height: 1.6;">
                ${careerMeta.mision}
              </div>
            </div>

            <div style="margin-bottom: 8mm;">
              <div style="background: #0d9488; color: white; text-align: center; padding: 6px 10px; font-size: 13pt; font-weight: bold; letter-spacing: 1px;">
                VISIÓN
              </div>
              <div style="border: 2px solid #0d9488; padding: 12px 16px; font-size: 10pt; text-align: justify; line-height: 1.6;">
                ${careerMeta.vision}
              </div>
            </div>

            <div>
              <div style="background: #6b21a8; color: white; text-align: center; padding: 6px 10px; font-size: 13pt; font-weight: bold; letter-spacing: 1px;">
                PERFIL PROFESIONAL
              </div>
              <div style="border: 2px solid #6b21a8; padding: 12px 16px; font-size: 10pt; text-align: justify; line-height: 1.6;">
                ${careerMeta.perfil}
              </div>
            </div>
          </div>
        `;
      }

      // 4. HORARIOS Y ROL DE EXÁMENES
      if (selectedSections.includes('horarios')) {
        let scheduleRowsHtml = '';
        if (data.teoList && data.teoList.length > 0) {
          data.teoList.forEach(t => {
            scheduleRowsHtml += `<tr><td style="text-align: left; padding: 6px 0;">Teoría (${t.code}) - ${t.classroom} (${t.campus})</td><td style="text-align: right; font-weight: bold;">Martes 08:15 - 11:15</td></tr>`;
          });
        }
        if (data.pracList && data.pracList.length > 0) {
          data.pracList.forEach(p => {
            scheduleRowsHtml += `<tr><td style="text-align: left; padding: 6px 0;">Práctica (${p.code}) - ${p.classroom} (${p.campus})</td><td style="text-align: right; font-weight: bold;">Viernes 11:15 - 12:45</td></tr>`;
          });
        }
        if (!scheduleRowsHtml) {
          scheduleRowsHtml = `
            <tr><td style="text-align: left; padding: 6px 0;">Martes</td><td style="text-align: right; font-weight: bold;">12:45 - 15:45</td></tr>
            <tr><td style="text-align: left; padding: 6px 0;">Viernes</td><td style="text-align: right; font-weight: bold;">11:15 - 12:45</td></tr>
          `;
        }

        docHtml += `
          <div class="print-page" style="padding: 15mm 15mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 10mm;">
              <div style="font-size: 28pt; font-weight: 900; color: #581c87; letter-spacing: 1.5px;">UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0d9488; letter-spacing: 2px; margin-top: -4px;">UNIVERSIDAD PRIVADA</div>
            </div>

            <div style="margin-bottom: 12mm;">
              <div style="background: #6b21a8; color: white; text-align: center; padding: 7px 10px; font-size: 13.5pt; font-weight: bold; letter-spacing: 1px;">
                HORARIO DE CLASES
              </div>
              <div style="border: 2px solid #6b21a8; padding: 18px 25px; font-size: 10.5pt; text-align: center; line-height: 1.8;">
                <table style="width: 90%; margin: 0 auto; border-collapse: collapse;">
                  <thead>
                    <tr style="font-weight: bold; font-size: 11pt; border-bottom: 1.5px solid #6b21a8;">
                      <th style="padding: 6px 0; text-align: left;">DÍAS / COMISIÓN</th>
                      <th style="padding: 6px 0; text-align: right;">HORA</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${scheduleRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div style="background: #0d9488; color: white; text-align: center; padding: 7px 10px; font-size: 13.5pt; font-weight: bold; letter-spacing: 1px;">
                FECHAS DE EXAMENES
              </div>
              <div style="border: 2px solid #0d9488; padding: 18px 25px; font-size: 10.5pt; text-align: center; line-height: 1.8;">
                <table style="width: 90%; margin: 0 auto; border-collapse: collapse;">
                  <thead>
                    <tr style="font-weight: bold; font-size: 11pt; border-bottom: 1.5px solid #0d9488;">
                      <th style="padding: 6px 0; text-align: left;">PARCIAL</th>
                      <th style="padding: 6px 0; text-align: right;">FECHA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="text-align: left; font-weight: bold; padding: 6px 0;">Primer Parcial:</td>
                      <td style="text-align: right; padding: 6px 0;">26 de marzo</td>
                    </tr>
                    <tr>
                      <td style="text-align: left; font-weight: bold; padding: 6px 0;">Segundo Parcial:</td>
                      <td style="text-align: right; padding: 6px 0;">20 de mayo</td>
                    </tr>
                    <tr>
                      <td style="text-align: left; font-weight: bold; padding: 6px 0;">Examen Final:</td>
                      <td style="text-align: right; padding: 6px 0;">10 de junio</td>
                    </tr>
                    <tr>
                      <td style="text-align: left; font-weight: bold; padding: 6px 0;">Segunda Instancia:</td>
                      <td style="text-align: right; padding: 6px 0;">17 de junio</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }

      // 5. PROGRAMA ANALÍTICO (PA) - Exact format from PROGRAMACIÓN III.docx (Matching media_1787956275188.png)
      if (selectedSections.includes('pa')) {
        const headerComponent = `
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #00b4d8; padding-bottom: 5px; margin-bottom: 18px; font-family: 'Times New Roman', Times, serif; width: 100%;">
            <div style="font-size: 9.5pt; font-weight: bold; line-height: 1.35; color: #475569;">
              <div>UNIVERSIDAD TÉCNICA PRIVADA COSMOS “UNITEPC”</div>
              <div style="margin-top: 2px;">CARRERA: ${displayCareerName.toUpperCase()}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="border-left: 1.5px solid #cbd5e1; height: 28px; margin-right: 2px;"></div>
              <div style="text-align: center;">
                <div style="font-size: 13pt; font-weight: 900; color: #581c87; font-family: Arial, sans-serif; line-height: 1;">UNITEPC</div>
                <div style="font-size: 5.5pt; font-weight: bold; color: #0d9488; letter-spacing: 0.5px; margin-top: 1px;">UNIVERSIDAD PRIVADA</div>
              </div>
            </div>
          </div>
        `;

        // PÁGINA 1: Header, Tabla Oficial (N° HOJAS: 2), Unidad I (Temas 1 al 4) y Unidad II (Temas 5 y 6)
        docHtml += `
          <div class="print-page" style="padding: 20mm 22mm 20mm 28mm; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.25; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            ${headerComponent}

            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 14px; letter-spacing: 0.5px;">
              PROGRAMA ANALÍTICO: ${data.nombre.toUpperCase()}
            </div>

            <table style="width: 100%; border: 1.5px solid #000; border-collapse: collapse; text-align: center; font-size: 8.5pt; margin-bottom: 18px;">
              <thead>
                <tr style="font-weight: bold;">
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px 2px; width: 12%;">CÓDIGO</th>
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px 2px; width: 10%;">SEMESTRE</th>
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px 4px; width: 26%;">ASIGNATURA</th>
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px 2px; width: 10%;">CRÉDITOS</th>
                  <th colspan="2" style="border: 1px solid #000; padding: 2px; width: 16%;">HORAS</th>
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px 2px; width: 14%;">HRS. SEMESTRE</th>
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px 2px; width: 12%;">N° HOJAS</th>
                </tr>
                <tr style="font-weight: bold;">
                  <th style="border: 1px solid #000; padding: 2px; font-size: 7.5pt;">TEÓRICAS</th>
                  <th style="border: 1px solid #000; padding: 2px; font-size: 7.5pt;">PRÁCTICAS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${displayCode}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${data.semestre || '3º'}</td>
                  <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${data.nombre}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${data.creditos || '8'}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${data.horasTeoricas || '2'}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${data.horasPracticas || '4'}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${data.horasTotal || '120'}</td>
                  <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">2</td>
                </tr>
              </tbody>
            </table>

            <!-- UNIDAD DE APRENDIZAJE I -->
            <div style="font-weight: bold; font-size: 11pt; margin-top: 12px; margin-bottom: 8px; text-align: left;">
              UNIDAD DE APRENDIZAJE I.- PROGRAMACIÓN ORIENTADA A OBJETOS.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 1. CONCEPTOS FUNDAMENTALES DE LA PROGRAMACIÓN ORIENTADA A OBJETOS
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Introducción a la programación orientada a objetos. Clases y objetos. Estructuras de la POO.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 2. HERENCIA Y POLIMORFISMO
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Creación de clases basadas en otras clases existentes. Reutilización de código. Respuestas de objetos de distintas clases a una misma interfaz de manera única
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 3. ABSTRACCIÓN Y ENCAPSULAMIENTO
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Agrupar datos y funciones relacionadas en un solo objeto. Control de acceso, seguridad y factibilidad en el mantenimiento del software
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 4. MANEJO DE EXCEPCIONES
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 14px;">
              Manejo de errores y excepciones. Try-catch y lanzamiento de excepciones. Buenas prácticas de manejo de errores.
            </div>

            <!-- UNIDAD DE APRENDIZAJE II -->
            <div style="font-weight: bold; font-size: 11pt; margin-top: 12px; margin-bottom: 8px; text-align: left;">
              UNIDAD DE APRENDIZAJE II.- INTERFAZ DE USUARIO CON WINDOWS FORM.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 5. INTRODUCCIÓN A WINDOWS FORMS
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Introducción a la creación de interfaces de usuario con Windows Forms. Diseño de ventanas y formularios. Uso de controles y elementos gráficos básicos.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 6. MANEJO DE EVENTOS
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left;">
              Eventos en Windows Forms. Asociación de eventos con métodos. Implementación de respuestas a eventos de usuario.
            </div>
          </div>
        `;

        // PÁGINA 2: Header, Tema 7, Unidad III (Temas 8 al 10), Unidad V (Temas 11 y 12), Bibliografía Oficial y Complementaria
        docHtml += `
          <div class="print-page" style="padding: 20mm 22mm 20mm 28mm; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.25; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            ${headerComponent}

            <div style="font-weight: bold; font-size: 11pt; margin-top: 4px; margin-bottom: 2px; text-align: left;">
              TEMA Nº 7. DISEÑO DE INTERFACES GRÁFICAS
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 14px;">
              Diseño avanzado de interfaces de usuario. Personalización de controles y formularios, Diseño de menús y barras de herramientas.
            </div>

            <!-- UNIDAD DE APRENDIZAJE III -->
            <div style="font-weight: bold; font-size: 11pt; margin-top: 12px; margin-bottom: 8px; text-align: left;">
              UNIDAD DE APRENDIZAJE III.- DESARROLLO DE APLICACIONES SIMPLES
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 8. DISEÑO DE PROGRAMAS
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Análisis de requerimientos. Diseño de algoritmos. Estructuras de datos e interfaces de usuario. Diagramas de flujo y pseudocódigo.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 9. DESARROLLO DE APLICACIONES
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Creación de aplicaciones simples. Interfaz de usuario básica. Pruebas y depuración.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 10. GESTIÓN DE PROYECTOS Y CONTROL DE VERSIONES
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 14px;">
              Colaboración en equipos de desarrollo. Manejo de metodologías de desarrollo.
            </div>

            <!-- UNIDAD DE APRENDIZAJE V -->
            <div style="font-weight: bold; font-size: 11pt; margin-top: 12px; margin-bottom: 8px; text-align: left;">
              UNIDAD DE APRENDIZAJE V.- PRÁCTICA Y PROYECTO FINAL
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 11. PRÁCTICA EN PROYECTOS REALES
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px;">
              Desarrollo de proyecto. Aplicación de los conocimientos adquiridos.
            </div>

            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 2px; text-align: left;">
              TEMA Nº 12. PROYECTO FINAL
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 16px;">
              Definición y desarrollo de un proyecto completo. Documentación y presentación del proyecto.
            </div>

            <!-- BIBLIOGRAFÍA OFICIAL -->
            <div style="font-weight: bold; font-size: 11pt; margin-top: 14px; margin-bottom: 6px; text-align: left;">
              BIBLIOGRAFÍA OFICIAL
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
              <span>✓</span>
              <span>Deitel, P. J., & Deitel, H. M. (2019). <em>Visual C# How to Program</em> (6th ed.). Pearson.</span>
            </div>

            <!-- BIBLIOGRAFÍA COMPLEMENTARIA -->
            <div style="font-weight: bold; font-size: 11pt; margin-top: 12px; margin-bottom: 6px; text-align: left;">
              BIBLIOGRAFÍA COMPLEMENTARIA
            </div>
            <div style="font-size: 11pt; line-height: 1.25; text-align: left; display: flex; align-items: flex-start; gap: 8px;">
              <span>✓</span>
              <span>Schildt, H. (2017). <em>C#. The Complete Reference</em> (5th ed.). McGraw-Hill Education.</span>
            </div>
          </div>
        `;
      }

      // 6. PAC CON CRONOGRAMA - Exact format of PAC TALLER DE IDIOMAS.xlsx (Puntos 1 al 6 + Matriz 7 + Puntos 8 a 14)
      if (selectedSections.includes('pac_cronograma') || selectedSections.includes('pac') || selectedSections.includes('cronograma')) {
        const savedPac = localStorage.getItem('sisa_saved_pac_' + mKey);
        let matriz7 = [];
        if (savedPac) {
          try { matriz7 = JSON.parse(savedPac).matriz7 || []; } catch(e) {}
        }
        if (!matriz7 || matriz7.length === 0) {
          matriz7 = typeof window.generateDefaultMatriz7 === 'function' ? window.generateDefaultMatriz7(mKey) : [];
        }

        const renderMatrixRows = (startIdx, endIdx) => {
          let rowsHtml = '';
          for (let i = startIdx; i <= endIdx; i++) {
            const row = matriz7[i] || {};
            const sesNum = (i + 1);
            const semNum = row.sem || Math.ceil(sesNum / 2);
            const isParcial1 = sesNum === 17 || sesNum === 18;
            const isParcial2 = sesNum === 31 || sesNum === 32;
            const isFinal = sesNum === 35 || sesNum === 36;
            const is2da = sesNum === 39 || sesNum === 40;

            let rowBg = '#fff';
            let temaText = row.tema || `Tema ${Math.ceil(sesNum/6)}: Contenido de Cátedra`;
            let saberCText = row.saberC || 'Conceptos clave y fundamentos de la unidad.';
            let saberPText = row.saberP || 'Resolución guiada, talleres aplicados y laboratorios.';
            let saberAText = row.saberA || 'Rigor técnico, ética y compromiso.';
            let critText = row.crit || 'Aplica los estándares normativos de la disciplina.';
            let instText = row.inst || 'Rúbrica de evaluación';

            if (isParcial1) {
              rowBg = '#fef3c7';
              temaText = `<strong>1° PARCIAL ${sesNum === 17 ? 'PRÁCTICO' : 'TEÓRICO'}</strong>`;
              saberCText = 'Evaluación sumativa de unidades 1 y 2.';
              saberPText = 'Resolución de caso práctico en laboratorio.';
              saberAText = 'Probidad académica.';
              critText = 'Demuestra dominio de competencias iniciales.';
              instText = 'Prueba escrita y rúbrica';
            } else if (isParcial2) {
              rowBg = '#fef3c7';
              temaText = `<strong>2° PARCIAL ${sesNum === 31 ? 'PRÁCTICO' : 'TEÓRICO'}</strong>`;
              saberCText = 'Evaluación sumativa de unidades 3 y 4.';
              saberPText = 'Defensa de proyecto y prototipo.';
              saberAText = 'Trabajo colaborativo y ética.';
              critText = 'Demuestra integración de habilidades avanzadas.';
              instText = 'Prueba escrita y rúbrica';
            } else if (isFinal) {
              rowBg = '#fee2e2';
              temaText = `<strong>EXAMEN ${sesNum === 35 ? 'PRÁCTICO' : 'TEÓRICO'} FINAL</strong>`;
              saberCText = 'Evaluación integradora de toda la asignatura.';
              saberPText = 'Defensa integral de solución profesional.';
              saberAText = 'Responsabilidad profesional.';
              critText = 'Alcanza la competencia global del curso.';
              instText = 'Matriz de competencias';
            } else if (is2da) {
              rowBg = '#f1f5f9';
              temaText = '<strong>SEGUNDA INSTANCIA</strong>';
              saberCText = 'Recuperación de contenidos no superados.';
              saberPText = 'Resolución de examen extraordinario.';
              saberAText = 'Superación académica.';
              critText = 'Demuestra suficiencia mínima (51 pts).';
              instText = 'Examen extraordinario';
            }

            rowsHtml += `
              <tr style="background: ${rowBg};">
                <td style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold;">${semNum}°</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold;">${sesNum}°</td>
                <td style="border: 1px solid #000; padding: 2px 4px;">${temaText}</td>
                <td style="border: 1px solid #000; padding: 2px 4px;">${saberCText}</td>
                <td style="border: 1px solid #000; padding: 2px 4px;">${saberPText}</td>
                <td style="border: 1px solid #000; padding: 2px 4px;">${saberAText}</td>
                <td style="border: 1px solid #000; padding: 2px 4px;">${critText}</td>
                <td style="border: 1px solid #000; padding: 2px 4px; text-align: center;">${instText}</td>
              </tr>
            `;
          }
          return rowsHtml;
        };

        const matrixTableHeader = `
          <thead>
            <tr style="background: #f1f5f9; text-align: center; font-weight: bold; font-size: 6.5pt;">
              <th style="border: 1px solid #000; padding: 3px 2px; width: 4%;">SEM</th>
              <th style="border: 1px solid #000; padding: 3px 2px; width: 4%;">SES</th>
              <th style="border: 1px solid #000; padding: 3px 4px; width: 20%;">TEMA / CONTENIDO ESPECÍFICO</th>
              <th style="border: 1px solid #000; padding: 3px 4px; width: 18%;">SABER CONCEPTUAL</th>
              <th style="border: 1px solid #000; padding: 3px 4px; width: 18%;">SABER PROCEDIMENTAL</th>
              <th style="border: 1px solid #000; padding: 3px 4px; width: 14%;">SABER ACTITUDINAL</th>
              <th style="border: 1px solid #000; padding: 3px 4px; width: 12%;">CRITERIO DE DESEMPEÑO</th>
              <th style="border: 1px solid #000; padding: 3px 2px; width: 10%;">INSTRUMENTO EVAL.</th>
            </tr>
          </thead>
        `;

        // PAGE 1: PUNTOS 1 AL 6 DEL EXCEL BASE (Identificación, Docente, Justificación, Propósito, Competencias, Elementos)
        docHtml += `
          <div class="print-page" style="padding: 10mm 15mm 8mm 15mm; font-family: 'Times New Roman', Times, serif; font-size: 7.5pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="text-align: center; margin-bottom: 6px;">
              <div style="font-size: 13pt; font-weight: 900; color: #581c87; font-family: Arial, sans-serif; line-height: 1;">UNITEPC</div>
              <div style="font-size: 5.5pt; font-weight: bold; color: #0d9488; letter-spacing: 0.5px; margin-top: 1px;">UNIVERSIDAD PRIVADA</div>
              <div style="font-size: 9.5pt; font-weight: bold; margin-top: 3px; text-transform: uppercase;">PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC)</div>
            </div>

            <!-- 1. IDENTIFICACIÓN -->
            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">1.- Identificación de la Asignatura</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>CARRERA:</strong> ${displayCareerName.toUpperCase()}</td>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>ASIGNATURA:</strong> ${data.nombre.toUpperCase()} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CÓDIGO:</strong> ${displayCode}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>ÁREA DE DESEMPEÑO:</strong> FORMACIÓN PROFESIONAL</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>TIPO DE CURSO:</strong> REGULAR / OBLIGATORIO</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>MODALIDAD:</strong> PRESENCIAL</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>SEMESTRE:</strong> ${data.semestre || '3º Semestre'}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>PRE-REQUISITO:</strong> NINGUNO</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>CRÉDITOS:</strong> ${data.creditos || '8'}</td>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px;"><strong>CARGA HORARIA TOTAL:</strong> ${data.horasTotal || '120'} HORAS &nbsp;&nbsp;|&nbsp;&nbsp; <strong>HORAS:</strong> TEÓRICAS: ${data.horasTeoricas || '2'}h / PRÁCTICAS: ${data.horasPracticas || '4'}h</td>
              </tr>
              <tr>
                <td colspan="4" style="border: 1px solid #000; padding: 2.5px 4px;"><strong>N° DE SESIONES SEMANALES:</strong> 2 SESIONES &nbsp;&nbsp; (TEÓRICAS: 1 &nbsp;|&nbsp; PRÁCTICAS: 1)</td>
              </tr>
            </table>

            <!-- 2. DOCENTE -->
            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">2.- Docente Responsable de la Asignatura</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>Nombre del docente:</strong> ${docenteName}</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>eMail:</strong> docente@unitepc.edu.bo</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>Formación:</strong> Licenciatura en Ingeniería / Maestría en Educación Superior</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>Teléfono:</strong> (+591) 4-4258888</td>
              </tr>
            </table>

            <!-- 3. JUSTIFICACIÓN -->
            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">3.- Justificación de la Asignatura</div>
            <div style="border: 1px solid #000; padding: 4px 6px; margin-bottom: 6px; text-align: justify; line-height: 1.35; font-size: 6.8pt;">
              ${data.caracterizacion || 'La asignatura es de primordial relevancia en la malla curricular institucional por cuanto desarrolla competencias profesionales indispensables para la formulación, diseño y construcción de soluciones tecnológicas estructuradas. Proporciona al estudiante fundamentos sólidos, metodologías activas y destrezas prácticas alineadas a los requerimientos socioproductivos y estándares de la industria.'}
            </div>

            <!-- 4. PROPÓSITO GENERAL -->
            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">4.- Propósito General de la Unidad de Formación</div>
            <div style="border: 1px solid #000; padding: 4px 6px; margin-bottom: 6px; text-align: justify; line-height: 1.35; font-size: 6.8pt;">
              ${data.macroCompetencia || 'Formar profesionales competentes en el análisis, diseño e implementación de sistemas mediante el uso riguroso de principios computacionales, patrones de diseño y trabajo colaborativo, con alto sentido de ética, innovación y responsabilidad social.'}
            </div>

            <!-- 5. COMPETENCIAS -->
            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">5.- Competencias</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 30%; background: #f8fafc; font-weight: bold;">Competencia Global Específica:</td>
                <td style="border: 1px solid #000; padding: 3px 5px;">${data.macroCompetencia || 'Desarrolla sistemas modulares, escalables y mantenibles aplicando estándares de ingeniería de software.'}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 30%; background: #f8fafc; font-weight: bold;">Unidad de Competencia Específica:</td>
                <td style="border: 1px solid #000; padding: 3px 5px;">MANEJA ESTRUCTURAS, PATRONES Y LENGUAJES DE PROGRAMACIÓN PARA LA CONSTRUCCIÓN DE SOFTWARE DE ALTA CALIDAD Y DISPONIBILIDAD.</td>
              </tr>
            </table>

            <!-- 6. ELEMENTOS DE COMPETENCIA -->
            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">6.- Elementos de Competencia</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt;">
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 25%; background: #f8fafc; font-weight: bold;">Elemento de competencia 1:</td>
                <td style="border: 1px solid #000; padding: 3px 5px;">Analiza y modela la arquitectura de entidades y objetos, aplicando principios de encapsulamiento, herencia y polimorfismo con rigor técnico y buenas prácticas.</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 25%; background: #f8fafc; font-weight: bold;">Elemento de competencia 2:</td>
                <td style="border: 1px solid #000; padding: 3px 5px;">Diseña interfaces interactivas y gestiona eventos del sistema, asegurando la comunicación reactiva entre componentes y la experiencia de usuario.</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 25%; background: #f8fafc; font-weight: bold;">Elemento de competencia 3:</td>
                <td style="border: 1px solid #000; padding: 3px 5px;">Desarrolla e integra proyectos funcionales completos, aplicando control de versiones, pruebas de software y documentación técnica normalizada.</td>
              </tr>
            </table>

            <div style="text-align: center; font-size: 8pt; margin-top: 6px;">1</div>
          </div>
        `;

        // PAGE 2: PUNTO 7 - Cronograma Sesiones 1 a 14
        docHtml += `
          <div class="print-page" style="padding: 10mm 12mm 8mm 12mm; font-family: 'Times New Roman', Times, serif; font-size: 7pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 7.5pt;">UNITEPC • PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC)</span>
              <span style="font-size: 7pt; color: #475569;">${displayCode} - ${data.nombre} (${displayCareerName})</span>
            </div>

            <div style="font-weight: bold; font-size: 7.5pt; margin-bottom: 4px;">7.- Estructura de Unidad de Aprendizaje (Cronograma de Sesiones 1° a 14°)</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.5pt;">
              ${matrixTableHeader}
              <tbody>
                ${renderMatrixRows(0, 13)}
              </tbody>
            </table>

            <div style="text-align: center; font-size: 8pt; margin-top: 6px;">2</div>
          </div>
        `;

        // PAGE 3: PUNTO 7 - Cronograma Sesiones 15 a 28
        docHtml += `
          <div class="print-page" style="padding: 10mm 12mm 8mm 12mm; font-family: 'Times New Roman', Times, serif; font-size: 7pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 7.5pt;">UNITEPC • PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC)</span>
              <span style="font-size: 7pt; color: #475569;">${displayCode} - ${data.nombre} (${displayCareerName})</span>
            </div>

            <div style="font-weight: bold; font-size: 7.5pt; margin-bottom: 4px;">7.- Estructura de Unidad de Aprendizaje (Continuación Sesiones 15° a 28°)</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.5pt;">
              ${matrixTableHeader}
              <tbody>
                ${renderMatrixRows(14, 27)}
              </tbody>
            </table>

            <div style="text-align: center; font-size: 8pt; margin-top: 6px;">3</div>
          </div>
        `;

        // PAGE 4: PUNTO 7 (Sesiones 29 a 36) + PUNTOS 8, 9, 12, 14
        docHtml += `
          <div class="print-page" style="padding: 10mm 12mm 8mm 12mm; font-family: 'Times New Roman', Times, serif; font-size: 7pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 7.5pt;">UNITEPC • PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC)</span>
              <span style="font-size: 7pt; color: #475569;">${displayCode} - ${data.nombre} (${displayCareerName})</span>
            </div>

            <div style="font-weight: bold; font-size: 7.5pt; margin-bottom: 4px;">7.- Estructura de Unidad de Aprendizaje (Cierre Sesiones 29° a 36° y Evaluaciones Finales)</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.5pt; margin-bottom: 6px;">
              ${matrixTableHeader}
              <tbody>
                ${renderMatrixRows(28, 35)}
                ${renderMatrixRows(38, 38)}
              </tbody>
            </table>

            <!-- 8. METODOLOGÍA -->
            <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; text-align: justify; line-height: 1.3;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">8. Metodología General de la Asignatura</div>
              <div>De acuerdo con el modelo educativo basado en competencias de la UNITEPC la metodología es de enfoque constructivista y socioformativo (ABP, Método de Casos, Talleres de Laboratorio, Aula Invertida mediados por plataforma SEA).</div>
              <div style="margin-top: 1px;"><strong>En el Aula:</strong> Clases participativas, debates y construcción conceptual. &nbsp;|&nbsp; <strong>Laboratorios:</strong> Desarrollo experimental, resolución de casos y simulaciones prácticas aplicadas.</div>
            </div>

            <!-- 9. SISTEMA DE EVALUACIÓN -->
            <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; text-align: justify; line-height: 1.3;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">9. Sistema de Evaluación</div>
              <div>El proceso evaluador es continuo e integral: a) <em>Evaluación diagnóstica:</em> recuperación de conocimientos previos. b) <em>Evaluación formativa:</em> retroalimentación en talleres y laboratorios mediante rúbricas. c) <em>Evaluación sumativa:</em> <strong>1° Parcial (30%)</strong>, <strong>2° Parcial (30%)</strong> y <strong>Examen Final Integrador (40%)</strong>.</div>
            </div>

            <!-- 12. CRITERIOS Y NORMATIVA -->
            <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; text-align: justify; line-height: 1.3;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">12.- Criterios y Normativa de la Asignatura</div>
              <div>Los estudiantes deberán cumplir el reglamento institucional: asistencia mínima obligatoria del 80% para tener derecho a evaluación final, 10 minutos de tolerancia al ingreso, respeto mutuo, probidad académica y convivencia armónica en el aula y laboratorios.</div>
            </div>

            <!-- 14. BIBLIOGRAFÍA OFICIAL -->
            <div style="border: 1px solid #000; padding: 3px 5px; text-align: justify; line-height: 1.3;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">14.- Bibliografía oficial</div>
              <div><strong>Específica:</strong> Joyanes Aguilar, L. (2021). <em>Fundamentos de Programación: Algoritmos, Estructuras de Datos y Objetos</em> (6ª ed.). McGraw-Hill. &nbsp;|&nbsp; García Llinás, L. F. (2022). <em>Todo sobre Patrones de Diseño</em>. Ediciones de la U.</div>
              <div style="margin-top: 1px;"><strong>Complementaria:</strong> Sznajdleder, P. (2021). <em>Programación Orientada a Objetos y Estructuras de Datos</em>. Alfaomega. &nbsp;|&nbsp; García, A. M. (2024). <em>Ingeniería de Software</em>. Marcombo.</div>
            </div>

            <div style="text-align: center; font-size: 8pt; margin-top: 5px;">4</div>
          </div>
        `;
      }

      // 8. PLANES DE CLASE (PCT-PCP) - Exact format of PLAN DE CLASES TALLER DE IDIOMAS.xlsx
      if (selectedSections.includes('plan_clase')) {
        const savedPlanes = localStorage.getItem('sisa_saved_planes_' + mKey);
        let planesList = [];
        if (savedPlanes) {
          try { planesList = JSON.parse(savedPlanes); } catch(e) {}
        }
        if (!planesList || planesList.length === 0) {
          planesList = [
            {
              tema: 'Arquitectura de Software y Modelado de Datos',
              objetivo: 'Produce soluciones oracionales y arquitectónicas complejas aplicando patrones de diseño bajo el marco normativo y metodologías activas.',
              logrosEsperados: '1. Reconoce la importancia del modelado formal.\n2. Adapta componentes según contextos y requerimientos.\n3. Integra saberes en propuestas de desarrollo profesional.',
              indicadoresLogro: '1. Analiza el impacto de la arquitectura en sistemas distribuidos.\n2. Identifica variaciones de diseño en simulaciones reales.\n3. Sustenta la pertinencia técnica del proyecto.',
              saberConceptual: '- Fundamentos y patrones arquitectónicos\n- Estándares de calidad y documentación técnica',
              saberProcedimental: '- Implementación guiada en laboratorio\n- Configuración de entornos y pruebas unitarias',
              saberActitudinal: '- Rigor técnico y responsabilidad ética\n- Trabajo colaborativo y compromiso profesional',
              estrategiaMetodologica: '- Aprendizaje Basado en Proyectos (ABP)\n- Talleres guiados y seminario de análisis',
              estrategiaAprendizaje: '- Mapeo de requerimientos y casos prácticos\n- Redacción técnica y defensa de proyecto',
              recursosEnsenanza: '- Plataforma SEA, IDE, Proyector y Guías de laboratorio',
              evalFormativaActividad: 'Defensa de avance y discusión guiada',
              evalFormativaInstrumento: 'Rúbrica socioformativa',
              evalFormativaEvidencia: 'Repositorio de código y reporte técnico',
              evalSumativaActividad: 'Examen escrito / Proyecto práctico',
              evalSumativaInstrumento: 'Prueba objetiva y rúbrica',
              evalSumativaEvidencia: 'Examen resuelto y entregable final',
              inicioActividad: 'Activación: Análisis de un caso de estudio real. Preguntas disparadoras y encuadre metodológico.',
              inicioDuracion: '30 min',
              desarrolloActividad: 'Cuerpo de contenidos: Implementación paso a paso de los patrones arquitectónicos, desarrollo práctico guiado en equipos y validación en taller.',
              desarrolloDuracion: '180 min',
              cierreActividad: 'Conclusión: Presentación breve de resultados ante el auditorio, evaluación formativa mediante rúbrica y retroalimentación.',
              cierreDuracion: '60 min'
            }
          ];
        }

        let planesCardsHtml = '';
        planesList.slice(0, 3).forEach((p, idx) => {
          planesCardsHtml += `
            <div style="border: 1.5px solid #000; margin-bottom: 8mm; page-break-inside: avoid; font-size: 8pt;">
              <div style="background: #f1f5f9; border-bottom: 1.5px solid #000; padding: 4px 8px; text-align: center;">
                <div style="font-weight: bold; font-size: 10pt; color: #581c87;">UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC</div>
                <div style="font-weight: bold; font-size: 9pt;">PLAN DE CLASE (PCT / PCP) - SESIÓN #${idx + 1}</div>
              </div>

              <!-- Identificación -->
              <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000;">
                <tr>
                  <td style="padding: 3px 6px; width: 50%; border-right: 1px solid #ccc;"><strong>Nombre del docente:</strong> ${docenteName}</td>
                  <td style="padding: 3px 6px; width: 50%;"><strong>Asignatura:</strong> ${data.nombre}</td>
                </tr>
                <tr style="border-top: 1px solid #ccc;">
                  <td style="padding: 3px 6px; border-right: 1px solid #ccc;"><strong>Fecha:</strong> 28/08/2026</td>
                  <td style="padding: 3px 6px;"><strong>Carrera:</strong> ${displayCareerName}</td>
                </tr>
              </table>

              <!-- Unidad y Competencias -->
              <div style="padding: 4px 6px; border-bottom: 1px solid #ccc; background: #fafafa;">
                <p style="margin: 2px 0;"><strong>Unidad ${idx + 1}:</strong> LENGUAJE Y ESTRUCTURAS CURRICULARES</p>
                <p style="margin: 2px 0;"><strong>TEMA ${idx + 1}:</strong> ${p.tema || 'Desarrollo Curricular y Habilidades Aplicadas'}</p>
                <p style="margin: 2px 0;"><strong>Resultados de Aprendizaje:</strong> ${p.objetivo || 'Aplica el marco normativo y formativo vigente.'}</p>
              </div>

              <!-- Saberes -->
              <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #ccc; font-size: 7.5pt;">
                <tr style="background: #e0f2fe; font-weight: bold;">
                  <th style="border: 1px solid #cbd5e1; padding: 2px 4px; width: 33%;">SABER CONCEPTUAL</th>
                  <th style="border: 1px solid #cbd5e1; padding: 2px 4px; width: 34%;">SABER PROCEDIMENTAL</th>
                  <th style="border: 1px solid #cbd5e1; padding: 2px 4px; width: 33%;">SABER ACTITUDINAL</th>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 3px 4px; vertical-align: top; white-space: pre-line;">${p.saberConceptual || '- Conceptos fundamentales\n- Estructuras'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 3px 4px; vertical-align: top; white-space: pre-line;">${p.saberProcedimental || '- Resolución guiada\n- Aplicación'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 3px 4px; vertical-align: top; white-space: pre-line;">${p.saberActitudinal || '- Responsabilidad y ética\n- Rigor'}</td>
                </tr>
              </table>

              <!-- Secuencia Didáctica -->
              <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt;">
                <tr style="background: #6b21a8; color: white; font-weight: bold;">
                  <th style="padding: 3px 6px; text-align: left; width: 22%;">SECUENCIA DIDÁCTICA</th>
                  <th style="padding: 3px 6px; text-align: left; width: 66%;">ACTIVIDAD DETALLADA</th>
                  <th style="padding: 3px 6px; text-align: center; width: 12%;">DURACIÓN</th>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #0284c7; vertical-align: top;">INTRODUCCIÓN</td>
                  <td style="padding: 3px 6px;">${p.inicioActividad || p.inicioEstrategia || 'Activación: Análisis de casos reales y preguntas disparadoras.'}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${p.inicioDuracion || '30 min'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #059669; vertical-align: top;">DESARROLLO (Cuerpo)</td>
                  <td style="padding: 3px 6px;">${p.desarrolloActividad || p.desarrolloEstrategia || 'Desarrollo guiado en aula/laboratorio, resolución de casos y trabajo en equipo.'}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${p.desarrolloDuracion || '180 min'}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 6px; font-weight: bold; color: #d97706; vertical-align: top;">CONCLUSIÓN O CIERRE</td>
                  <td style="padding: 3px 6px;">${p.cierreActividad || p.cierreEstrategia || 'Presentación de resultados ante el auditorio, evaluación formativa mediante rúbrica y retroalimentación.'}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${p.cierreDuracion || '60 min'}</td>
                </tr>
              </table>
            </div>
          `;
        });

        docHtml += `
          <div class="print-page" style="padding: 10mm 10mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 4mm;">
              <div style="font-size: 16pt; font-weight: 900; color: #581c87;">UNITEPC • PLANES DE CLASE POR SESIÓN (PCT / PCP)</div>
              <div style="font-size: 9pt; font-weight: bold; color: #0d9488;">${displayCode} • ${data.nombre} (Docente: ${docenteName})</div>
            </div>
            ${planesCardsHtml}
          </div>
        `;
      }

      return docHtml;
    };

    window.executeSelectedPrint = function() {
      const selectedSections = [];
      const masterChecked = document.getElementById('chk-print-all')?.checked;
      if (masterChecked) {
        selectedSections.push('portada', 'indice', 'mvp', 'horarios');
      }
      document.querySelectorAll('.chk-print-sec:checked').forEach(c => {
        selectedSections.push(c.getAttribute('data-section'));
      });

      if (selectedSections.length === 0) {
        window.showToast('⚠️ Por favor selecciona al menos una sección para imprimir');
        return;
      }

      const careerSelector = document.getElementById('print-career-selector');
      const selectedCareerCode = careerSelector ? careerSelector.value : 'ALL';

      window.closeModal();
      window.showToast('📄 Preparando documento oficial para impresión...');

      const docHtml = window.buildOfficialFolderHtml(selectedSections, selectedCareerCode);
      const printContainer = document.getElementById('print-official-folder-container');
      if (printContainer) {
        printContainer.innerHTML = docHtml;
        printContainer.classList.remove('hidden');
      }

      window.onafterprint = function() {
        if (printContainer) {
          printContainer.classList.add('hidden');
        }
      };

      setTimeout(() => {
        window.print();
      }, 300);
    };

    window.addCronogramaRow = function() {
      const tbody = document.getElementById('cronograma-table-body');
      if (!tbody) return;
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50';
      tr.innerHTML = `
        <td class="py-2 px-1 text-center align-top"><input type="text" value="+" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-xs"></td>
        <td class="py-2 px-1 text-center align-top"><input type="text" value="+" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-brand-600 dark:text-brand-400 text-xs"></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Unidad Temática..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Tema específico..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Conceptual..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Procedimental..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Actitudinal..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Criterio de Desempeño..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Instrumento..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed overflow-hidden resize-none">RUBRICA</textarea></td>
      `;
      tbody.appendChild(tr);
      setTimeout(() => {
        tr.querySelectorAll('textarea').forEach(t => window.autoResizeTextarea(t));
      }, 10);
      window.showToast('✓ Nueva fila agregada al cronograma');
    };


    window.triggerAutoCapture = function() {
      const modalBody = `
        <div class="space-y-4 text-xs">
          <p class="text-slate-700 dark:text-slate-300">Selecciona qué archivo deseas procesar para poblar automáticamente todas sus secciones:</p>
          <div class="grid grid-cols-3 gap-3">
            <div onclick="window.switchDocMainTab('tab-analitico'); window.closeModal(); window.showToast('✓ Programa Analítico .docx capturado');" class="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 hover:border-blue-500 cursor-pointer text-center space-y-2 transition-all">
              <i data-lucide="file-text" class="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400"></i>
              <div class="font-bold text-slate-900 dark:text-white">Programa Analítico (.docx)</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">Unidades 1-4, Bibliografía APA y Complementaria</div>
            </div>
            <div onclick="window.switchDocMainTab('tab-pac-matrix'); window.closeModal(); window.showToast('✓ PAC .xlsx y Cronograma capturados');" class="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 hover:border-emerald-500 cursor-pointer text-center space-y-2 transition-all">
              <i data-lucide="file-spreadsheet" class="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400"></i>
              <div class="font-bold text-slate-900 dark:text-white">PAC + Cronograma (.xlsx)</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">Estructura Oficial y Matriz de 20 Semanas</div>
            </div>

            <div onclick="window.switchDocMainTab('tab-cronograma-planes'); window.closeModal(); window.showToast('✓ Planes de Clase .xlsx capturados');" class="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 hover:border-purple-500 cursor-pointer text-center space-y-2 transition-all">
              <i data-lucide="calendar-range" class="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400"></i>
              <div class="font-bold text-slate-900 dark:text-white">Planes de Clase (.xlsx)</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">Saberes, Estrategias, Rúbricas y Minutaje</div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('modal-title').innerText = 'Subir y Extraer Datos de los Documentos Base';
      document.getElementById('modal-body').innerHTML = modalBody;
      document.getElementById('modal-footer').classList.remove('hidden');
      document.getElementById('modal-container').classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    };

    // ── DYNAMIC PLANES DE CLASE ENGINE (TAB 4) ───────────────────────────
    let activePlanesList = [];
    let activePlanSheetIndex = 0;

    function setVal(id, val) {
      const el = document.getElementById(id);
      if (el) el.value = (val !== null && val !== undefined) ? val : '';
    }

    window.renderPlanesSheetsTabs = function() {
      const container = document.getElementById('plan-sheets-tabs-container');
      if (!container) return;

      container.innerHTML = '';
      if (!activePlanesList || activePlanesList.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-400 py-1">Sin hojas de clase cargadas. Importa el archivo Plan de Clases (.xlsx) para ver todos los temas.</div>';
        return;
      }

      activePlanesList.forEach((plan, idx) => {
        const btn = document.createElement('button');
        btn.id = 'btn-plan-sheet-' + idx;
        const isActive = (idx === activePlanSheetIndex);
        btn.className = 'plan-sheet-tab px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-150 ' +
          (isActive
            ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/40 font-bold scale-[1.02]'
            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300/40 dark:border-slate-700 font-semibold');
        
        let label = plan.nombreHoja || ('Tema ' + (idx + 1));
        if (plan.contenidoTema && !label.toLowerCase().includes(plan.contenidoTema.toLowerCase())) {
          label = label + ': ' + plan.contenidoTema;
        }
        btn.innerText = label;
        btn.onclick = () => window.selectPlanSheet(idx);
        container.appendChild(btn);
      });
    };

    window.renderPlanSheetForm = function(sheetIndex) {
      if (!activePlanesList || activePlanesList.length === 0) return;
      const p = activePlanesList[sheetIndex] || activePlanesList[0];
      if (!p) return;

      // 1. Encabezado
      setVal('plan-docente-input', p.nombreDocente || '');
      setVal('plan-fecha-input', p.fecha || '');
      setVal('plan-asig-input', p.nombreAsignatura || '');
      setVal('plan-carrera-input', p.carrera || '');

      // 2. Unidad & Tema
      setVal('plan-unidad-input', p.unidadTitulo || '');
      setVal('plan-tema-input', p.contenidoTema || '');
      setVal('plan-elemento-input', p.elementoCompetencia || '');

      // 3. Resultados, Logros & Indicadores
      setVal('plan-resultados-input', p.objetivoSesion || '');
      setVal('plan-logros-input', p.logrosEsperados || '');
      setVal('plan-indicadores-input', p.indicadoresLogro || '');

      // 4. Los 3 Saberes
      setVal('plan-conceptual-input', p.saberConceptual || '');
      setVal('plan-procedimental-input', p.saberProcedimental || '');
      setVal('plan-actitudinal-input', p.saberActitudinal || '');

      // 5. Estrategias Didácticas
      setVal('plan-est-ensenanza', p.estrategiaEnsenanza || '');
      setVal('plan-est-aprendizaje', p.estrategiaAprendizaje || '');
      setVal('plan-est-recursos', p.recursosEnsenanza || '');

      // 6. Evaluación Formativa y Sumativa
      setVal('plan-eval-form-act', p.evaluacionFormativaActividad || '');
      setVal('plan-eval-form-inst', p.evaluacionFormativaInstrumento || '');
      setVal('plan-eval-form-evid', p.evaluacionFormativaEvidencia || '');
      setVal('plan-eval-sum-act', p.evaluacionSumativaActividad || '');
      setVal('plan-eval-sum-inst', p.evaluacionSumativaInstrumento || '');
      setVal('plan-eval-sum-evid', p.evaluacionSumativaEvidencia || '');

      // 7. Secuencia Didáctica (5 Momentos Configurable)
      if (p.momentos && p.momentos.length > 0) {
        const mIntro = p.momentos.find(m => m.tipoMomento === 'INICIO' || m.tipoMomento === 'INTRODUCCION');
        const mRes = p.momentos.find(m => m.tipoMomento === 'RESULTADOS_LOGROS' || m.tipoMomento === 'RESULTADOS');
        const mCont = p.momentos.find(m => m.tipoMomento === 'CONTENIDOS' || m.tipoMomento === 'CONTENIDOS_CLASE');
        const mDes = p.momentos.find(m => m.tipoMomento === 'DESARROLLO' || m.tipoMomento === 'CUERPO');
        const mCie = p.momentos.find(m => m.tipoMomento === 'CIERRE' || m.tipoMomento === 'CONCLUSION');

        setVal('plan-sec-intro', mIntro ? (mIntro.actividadesDocente || '') : '');
        setVal('plan-sec-intro-dur', mIntro && mIntro.duracionMin !== undefined ? mIntro.duracionMin : 25);

        setVal('plan-sec-resultados', mRes ? (mRes.actividadesDocente || '') : (p.objetivoSesion ? p.objetivoSesion + (p.logrosEsperados ? '\nLogros:\n' + p.logrosEsperados : '') : ''));
        setVal('plan-sec-resultados-dur', mRes && mRes.duracionMin !== undefined ? mRes.duracionMin : 0);

        setVal('plan-sec-contenidos', mCont ? (mCont.actividadesDocente || '') : (p.saberConceptual || ''));
        setVal('plan-sec-contenidos-dur', mCont && mCont.duracionMin !== undefined ? mCont.duracionMin : 0);

        setVal('plan-sec-cuerpo', mDes ? (mDes.actividadesDocente || '') : '');
        setVal('plan-sec-cuerpo-dur', mDes && mDes.duracionMin !== undefined ? mDes.duracionMin : 100);

        setVal('plan-sec-cierre', mCie ? (mCie.actividadesDocente || '') : '');
        setVal('plan-sec-cierre-dur', mCie && mCie.duracionMin !== undefined ? mCie.duracionMin : 55);
      } else {
        setVal('plan-sec-intro', '');
        setVal('plan-sec-intro-dur', 25);
        setVal('plan-sec-resultados', '');
        setVal('plan-sec-resultados-dur', 0);
        setVal('plan-sec-contenidos', '');
        setVal('plan-sec-contenidos-dur', 0);
        setVal('plan-sec-cuerpo', '');
        setVal('plan-sec-cuerpo-dur', 100);
        setVal('plan-sec-cierre', '');
        setVal('plan-sec-cierre-dur', 55);
      }

      if (typeof window.updateSecuenciaTotals === 'function') {
        window.updateSecuenciaTotals();
      }

      // Auto-resize all textareas to show 100% text without scrollbars
      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') {
          window.autoResizeAllTextareas();
        }
      }, 30);
    };

    window.selectPlanSheet = function(index) {
      activePlanSheetIndex = index;
      window.renderPlanesSheetsTabs();
      window.renderPlanSheetForm(index);
    };

    window.updateSecuenciaTotals = function() {
      const getNum = id => {
        const el = document.getElementById(id);
        return el ? (parseInt(el.value, 10) || 0) : 0;
      };
      const intro = getNum('plan-sec-intro-dur');
      const res = getNum('plan-sec-resultados-dur');
      const cont = getNum('plan-sec-contenidos-dur');
      const cuerpo = getNum('plan-sec-cuerpo-dur');
      const cierre = getNum('plan-sec-cierre-dur');
      const total = intro + res + cont + cuerpo + cierre;

      const badge = document.getElementById('plan-sec-total-badge');
      if (badge) {
        badge.innerText = total + ' min';
      }
    };

    window.syncCurrentPlanFormToState = function() {
      if (!activePlanesList || activePlanesList.length === 0 || !activePlanesList[activePlanSheetIndex]) return;
      const p = activePlanesList[activePlanSheetIndex];
      const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
      const gn = id => { const el = document.getElementById(id); return el ? (parseInt(el.value, 10) || 0) : 0; };

      p.nombreDocente = gv('plan-docente-input');
      p.fecha = gv('plan-fecha-input');
      p.nombreAsignatura = gv('plan-asig-input');
      p.carrera = gv('plan-carrera-input');
      p.unidadTitulo = gv('plan-unidad-input');
      p.contenidoTema = gv('plan-tema-input');
      p.elementoCompetencia = gv('plan-elemento-input');
      p.objetivoSesion = gv('plan-resultados-input');
      p.logrosEsperados = gv('plan-logros-input');
      p.indicadoresLogro = gv('plan-indicadores-input');
      p.saberConceptual = gv('plan-conceptual-input');
      p.saberProcedimental = gv('plan-procedimental-input');
      p.saberActitudinal = gv('plan-actitudinal-input');
      p.estrategiaEnsenanza = gv('plan-est-ensenanza');
      p.estrategiaAprendizaje = gv('plan-est-aprendizaje');
      p.recursosEnsenanza = gv('plan-est-recursos');
      p.evaluacionFormativaActividad = gv('plan-eval-form-act');
      p.evaluacionFormativaInstrumento = gv('plan-eval-form-inst');
      p.evaluacionFormativaEvidencia = gv('plan-eval-form-evid');
      p.evaluacionSumativaActividad = gv('plan-eval-sum-act');
      p.evaluacionSumativaInstrumento = gv('plan-eval-sum-inst');
      p.evaluacionSumativaEvidencia = gv('plan-eval-sum-evid');

      if (!p.momentos) p.momentos = [];

      let mIntro = p.momentos.find(m => m.tipoMomento === 'INICIO' || m.tipoMomento === 'INTRODUCCION');
      if (!mIntro) { mIntro = { tipoMomento: 'INTRODUCCION' }; p.momentos.push(mIntro); }
      mIntro.actividadesDocente = gv('plan-sec-intro');
      mIntro.duracionMin = gn('plan-sec-intro-dur');

      let mRes = p.momentos.find(m => m.tipoMomento === 'RESULTADOS_LOGROS' || m.tipoMomento === 'RESULTADOS');
      if (!mRes) { mRes = { tipoMomento: 'RESULTADOS_LOGROS' }; p.momentos.push(mRes); }
      mRes.actividadesDocente = gv('plan-sec-resultados');
      mRes.duracionMin = gn('plan-sec-resultados-dur');

      let mCont = p.momentos.find(m => m.tipoMomento === 'CONTENIDOS' || m.tipoMomento === 'CONTENIDOS_CLASE');
      if (!mCont) { mCont = { tipoMomento: 'CONTENIDOS' }; p.momentos.push(mCont); }
      mCont.actividadesDocente = gv('plan-sec-contenidos');
      mCont.duracionMin = gn('plan-sec-contenidos-dur');

      let mDes = p.momentos.find(m => m.tipoMomento === 'DESARROLLO' || m.tipoMomento === 'CUERPO');
      if (!mDes) { mDes = { tipoMomento: 'CUERPO' }; p.momentos.push(mDes); }
      mDes.actividadesDocente = gv('plan-sec-cuerpo');
      mDes.duracionMin = gn('plan-sec-cuerpo-dur');

      let mCie = p.momentos.find(m => m.tipoMomento === 'CIERRE' || m.tipoMomento === 'CONCLUSION');
      if (!mCie) { mCie = { tipoMomento: 'CONCLUSION' }; p.momentos.push(mCie); }
      mCie.actividadesDocente = gv('plan-sec-cierre');
      mCie.duracionMin = gn('plan-sec-cierre-dur');

      if (typeof window.updateSecuenciaTotals === 'function') {
        window.updateSecuenciaTotals();
      }

      localStorage.setItem('sisa_saved_planes_' + activeMateriaKey, JSON.stringify(activePlanesList));
    };

    document.addEventListener('input', function(e) {
      if (e.target && e.target.id && e.target.id.startsWith('plan-')) {
        window.syncCurrentPlanFormToState();
      }
    });


    window.openModal = function(title, content) {
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-body').innerHTML = content;
      document.getElementById('modal-footer').classList.remove('hidden');
      document.getElementById('modal-container').classList.remove('hidden');
    };
    window.closeModal = function() {
      document.getElementById('modal-container').classList.add('hidden');
    };

    window.showToast = function(msg) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl border border-slate-700 dark:border-slate-600 shadow-xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0';
      toast.innerHTML = '<i data-lucide="info" class="w-4 h-4 text-brand-400"></i><span>' + msg + '</span>';
      container.appendChild(toast);
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };

    document.addEventListener('click', function(e) {
      const viewBtn = e.target.closest('[data-view]');
      if (viewBtn) {
        const viewId = viewBtn.getAttribute('data-view');
        window.switchView(viewId);
        return;
      }

      const docMainTab = e.target.closest('[data-doc-main-tab]');
      if (docMainTab) {
        const tabId = docMainTab.getAttribute('data-doc-main-tab');
        window.switchDocMainTab(tabId);
        return;
      }
    });

    if (window.lucide) window.lucide.createIcons();
  

// --- REAL LIVE SISA BACKEND API & OFFICE INGESTION/EXPORT BRIDGE ---
let activePacData = null;
let activeProgramaData = null;
let activePlanesData = [];

// 1. File Upload Helper & Auth
window.getAuthHeaders = function() {
  const token = localStorage.getItem('scu_access_token');
  const headers = {};
  if (token && token !== 'demo_token') {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
};

window.triggerFileUpload = function(accept, callback) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = accept;
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    callback(file);
  };
  fileInput.click();
};

// ── DYNAMIC PROGRAMA ANALÍTICO UNIDADES & BIBLIOGRAFÍA ENGINE ──────────────────
let activeAnaliticoUnidades = [
  {
    numeroUnidad: 1,
    titulo: 'Arquitectura de Entidades y Modelado de Sistemas',
    horasAcademicas: 20,
    temas: [
      {
        numeroTema: 1,
        titulo: 'Anatomía de la Entidad y el Objeto',
        contenido: '• El objeto como unidad fundamental de lógica y estado.\n• Atributos de identidad y comportamientos de acción.\n• Ciclo de vida: de la instanciación a la recolección de memoria.\n• El "Game Loop" conceptual: métodos de actualización y renderizado de estado.'
      },
      {
        numeroTema: 2,
        titulo: 'Jerarquías de Especialización y Contratos',
        contenido: '• Herencia: creación de linajes de entidades para la reutilización de lógica.\n• Interfaces y Clases Abstractas: definición de contratos de comportamiento.\n• Polimorfismo: capacidad de respuesta única ante señales compartidas.\n• Composición sobre herencia: ensamblaje de habilidades dinámicas en un objeto.'
      }
    ]
  },
  {
    numeroUnidad: 2,
    titulo: 'Robustez y Blindaje de la Lógica de Negocio',
    horasAcademicas: 20,
    temas: [
      {
        numeroTema: 3,
        titulo: 'Encapsulamiento y Gestión de Estados Críticos',
        contenido: '• Visibilidad y protección: niveles de acceso para la integridad del sistema.\n• Validación de estados internos y prevención de corrupción de datos.\n• Manejo de excepciones: control de flujos inesperados en sistemas en tiempo real.\n• Estrategias de recuperación y estabilidad ante fallos de lógica.'
      }
    ]
  },
  {
    numeroUnidad: 3,
    titulo: 'Sistemas de Interacción y Despacho de Eventos',
    horasAcademicas: 20,
    temas: [
      {
        numeroTema: 4,
        titulo: 'Representación Visual de Objetos y Entornos',
        contenido: '• Mapeo de objetos lógicos a componentes visuales.\n• Jerarquía de contenedores y orquestación de elementos en pantalla.\n• Estética y retroalimentación: el objeto como receptor de estilos y temas.\n• Layouts dinámicos: el comportamiento espacial de las colecciones de objetos.'
      },
      {
        numeroTema: 5,
        titulo: 'Dinámicas de Interacción y Flujo de Señales',
        contenido: '• El modelo de eventos: suscripción y notificación entre objetos.\n• Delegados y manejadores: la respuesta del objeto a estímulos externos.\n• Gestión de periféricos: traducción de entradas físicas a acciones de objeto.\n• Sincronización de hilos y actualización de la vista desde el modelo.'
      }
    ]
  },
  {
    numeroUnidad: 4,
    titulo: 'Gestión y Despliegue de Soluciones Integrales',
    horasAcademicas: 20,
    temas: [
      {
        numeroTema: 6,
        titulo: 'Ingeniería de Software y Construcción del Mundo',
        contenido: '• Análisis de requerimientos y diseño de diagramas de interacción.\n• Patrones de diseño fundamentales (Singleton, Factory, Observer).\n• Control de versiones y flujos de trabajo en equipos técnicos.\n• Pruebas de integración, depuración y optimización de rendimiento final.'
      }
    ]
  }
];

window.getAnaliticoContainer = function() {
  let c = document.getElementById('unidades-analiticas-container');
  if (!c) {
    const tab = document.getElementById('tab-analitico');
    if (tab) {
      const cards = tab.querySelectorAll('.bg-white, .dark\\:bg-slate-900');
      for (const card of cards) {
        if (card.textContent.includes('Desglose de Unidades')) {
          let inner = card.querySelector('.space-y-4');
          if (inner) {
            inner.id = 'unidades-analiticas-container';
            c = inner;
            break;
          }
        }
      }
    }
  }
  return c;
};

window.autoResizeTextarea = function(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.max(el.scrollHeight + 4, 60) + 'px';
};

window.autoResizeAllTextareas = function() {
  document.querySelectorAll('textarea').forEach(el => {
    window.autoResizeTextarea(el);
  });
};

window.renderAnaliticoUnidades = function() {
  const tab = document.getElementById('tab-analitico');
  if (!tab) return;

  // Find the desglose card
  let card = null;
  const cards = tab.querySelectorAll('.p-6.rounded-xl, .rounded-xl, div');
  for (const c of cards) {
    if (c.textContent.includes('Desglose de Unidades') && c.classList.contains('p-6')) {
      card = c;
      break;
    }
  }
  if (!card) return;
  card.id = 'analitico-unidades-card';

  let countText = activeAnaliticoUnidades.length + (activeAnaliticoUnidades.length === 1 ? ' Unidad' : ' Unidades');
  
  let headerHtml = `
    <div class="flex items-center justify-between w-full pb-3 border-b border-slate-200 dark:border-slate-800">
      <div class="form-section-title text-blue-700 dark:text-blue-400 flex items-center gap-2 font-bold text-sm">
        <i data-lucide="layers" class="w-4 h-4"></i>
        <span>Desglose de Unidades y Temas Analíticos (${countText})</span>
      </div>
      <button onclick="window.addAnaliticoUnidad()" type="button" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i> Agregar Unidad
      </button>
    </div>
  `;

  let bodyHtml = '';
  if (activeAnaliticoUnidades.length === 0) {
    bodyHtml = `
      <div class="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl my-4">
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">No hay unidades cargadas en este Programa Analítico.</p>
        <button onclick="window.addAnaliticoUnidad()" type="button" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer">
          + Agregar Primera Unidad
        </button>
      </div>
    `;
  } else {
    bodyHtml = '<div id="unidades-analiticas-container" class="space-y-4 pt-3">';
    activeAnaliticoUnidades.forEach((u, uIdx) => {
      let temasHtml = '';
      if (u.temas && u.temas.length > 0) {
        temasHtml = u.temas.map((t, tIdx) => `
          <div class="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-1">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] whitespace-nowrap">Tema ${t.numeroTema || (tIdx + 1)}:</span>
                <input type="text" value="${escapeHtml(t.titulo || '')}" oninput="window.updateTemaTitle(${uIdx}, ${tIdx}, this.value)" placeholder="Título o nombre del tema analítico..." class="flex-1 p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:bg-white focus:border-blue-500">
              </div>
              <button onclick="window.removeAnaliticoTema(${uIdx}, ${tIdx})" type="button" class="px-2 py-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Eliminar este tema">
                <i data-lucide="trash-2" class="w-3 h-3"></i> Quitar
              </button>
            </div>
            <textarea oninput="window.updateTemaContenido(${uIdx}, ${tIdx}, this.value); window.autoResizeTextarea(this);" placeholder="Desglose detallado de contenidos, subtemas o viñetas..." style="overflow:hidden; resize:none; min-height:75px;" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs leading-relaxed focus:bg-white focus:border-blue-500 transition-all">${escapeHtml(t.contenido || '')}</textarea>
          </div>
        `).join('');
      } else {
        temasHtml = `
          <div class="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            Esta unidad no tiene temas registrados aún. Haz clic en <strong>+ Agregar Tema</strong>.
          </div>
        `;
      }

      bodyHtml += `
        <div class="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-4 shadow-sm">
          <div class="flex items-center justify-between gap-3 pb-2 border-b border-blue-200/60 dark:border-blue-900/40">
            <div class="flex items-center gap-2 flex-1">
              <span class="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap">UNIDAD ${u.numeroUnidad || (uIdx + 1)}</span>
              <input type="text" value="${escapeHtml(u.titulo || '')}" oninput="window.updateUnitTitle(${uIdx}, this.value)" placeholder="Título de la unidad temática..." class="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:border-blue-500">
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.addAnaliticoTema(${uIdx})" type="button" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Agregar Tema
              </button>
              <button onclick="window.removeAnaliticoUnidad(${uIdx})" type="button" class="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm" title="Eliminar toda la unidad">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Eliminar
              </button>
            </div>
          </div>
          <div class="space-y-2.5">
            ${temasHtml}
          </div>
        </div>
      `;
    });
    bodyHtml += '</div>';
  }

  card.innerHTML = headerHtml + bodyHtml;
  setTimeout(() => window.autoResizeAllTextareas(), 10);
  if (window.lucide) window.lucide.createIcons();
};

window.renderAnaliticoBibliografia = function(biblioList) {
  const tab = document.getElementById('tab-analitico');
  if (!tab) return;

  let bibCard = null;
  const cards = tab.querySelectorAll('.p-6.rounded-xl, .rounded-xl, div');
  for (const c of cards) {
    if (c.textContent.includes('Bibliografía Oficial') && c.classList.contains('p-6')) {
      bibCard = c;
      break;
    }
  }
  if (!bibCard) return;

  let basicasHtml = '';
  let compHtml = '';
  let countBasicas = 0;
  let countComp = 0;

  if (biblioList !== undefined && biblioList !== null) {
    const basicas = biblioList.filter(b => b.tipo === 'BASICA');
    const complementarias = biblioList.filter(b => b.tipo !== 'BASICA');
    countBasicas = basicas.length;
    countComp = complementarias.length;
    basicasHtml = basicas.map(b => b.citaApa || (b.autor + ' (' + b.anio + '). ' + b.titulo)).join('\n\n');
    compHtml = complementarias.map(b => b.citaApa || (b.autor + ' (' + b.anio + '). ' + b.titulo)).join('\n\n');
  } else {
    // Initial pristine default only on first ever load
    basicasHtml = 'Joyanes Aguilar, L. (2021). Fundamentos de Programación: Algoritmos, Estructuras de Datos y Objetos (6ª ed.). McGraw-Hill.\n\nGarcía Llinás, L. F. (2022). Todo sobre Patrones de Diseño: Un enfoque práctico orientado a objetos. Ediciones de la U.\n\nVaughan, J. (2023). Object-Oriented Game Development: Real-World Design and Architecture. CRC Press.';
    compHtml = 'Sznajdleder, P. (2021). Programación Orientada a Objetos y Estructuras de Datos. Alfaomega.\n\nKurniawan, B. (2022). User Interface Design for Developers. Packt Publishing.\n\nGarcía, A. M. (2024). Ingeniería de Software: Metodologías Ágiles y Control de Versiones en la Práctica. Marcombo.';
    countBasicas = 3;
    countComp = 3;
  }

  bibCard.innerHTML = `
    <div class="form-section-title text-blue-700 dark:text-blue-400 font-bold text-sm flex items-center gap-2 mb-4">
      <i data-lucide="book-marked" class="w-4 h-4"></i>
      <span>Bibliografía Oficial del Programa Analítico (Norma APA)</span>
    </div>
    <div id="biblio-container" class="grid grid-cols-2 gap-6 text-xs">
      <div class="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-2">
        <div class="flex items-center justify-between">
          <strong class="text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">BIBLIOGRAFÍA BÁSICA / OFICIAL:</strong>
          <span id="biblio-basica-count" class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold text-[10px]">${countBasicas} Textos Guía</span>
        </div>
        <textarea id="analitico-biblio-basica-input" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Escribe aquí la bibliografía básica (formato APA) o deja vacío..." style="overflow:hidden; resize:none; min-height:120px;" class="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] leading-relaxed focus:border-blue-500 transition-all">${escapeHtml(basicasHtml)}</textarea>
      </div>
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
        <div class="flex items-center justify-between">
          <strong class="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">BIBLIOGRAFÍA COMPLEMENTARIA:</strong>
          <span id="biblio-comp-count" class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">${countComp} Textos de Consulta</span>
        </div>
        <textarea id="analitico-biblio-comp-input" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Escribe aquí la bibliografía complementaria (formato APA) o deja vacío..." style="overflow:hidden; resize:none; min-height:120px;" class="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] leading-relaxed focus:border-blue-500 transition-all">${escapeHtml(compHtml)}</textarea>
      </div>
    </div>
  `;
  setTimeout(() => window.autoResizeAllTextareas(), 10);
  if (window.lucide) window.lucide.createIcons();
};


window.addAnaliticoUnidad = function() {
  const newNum = activeAnaliticoUnidades.length + 1;
  activeAnaliticoUnidades.push({
    numeroUnidad: newNum,
    titulo: 'Nueva Unidad ' + newNum,
    horasAcademicas: 20,
    temas: [
      {
        numeroTema: 1,
        titulo: 'Tema 1: Introducción y Fundamentos',
        contenido: '• Conceptos básicos y contextualización de la temática.\n• Aplicaciones iniciales.'
      }
    ]
  });
  window.renderAnaliticoUnidades();
  
  // Synchronize with PAC Elementos de Competencia
  if (!activePacElementosCompetencia) activePacElementosCompetencia = [];
  activePacElementosCompetencia.push('Aplica saberes y metodologías correspondientes a la Unidad ' + newNum + '.');
  if (typeof window.renderPacElementosCompetencia === 'function') {
    window.renderPacElementosCompetencia();
  }

  window.scheduleAutoSave(500);
  window.showToast('➕ Unidad ' + newNum + ' agregada y articulada con Elemento de Competencia ' + newNum);
};

window.removeAnaliticoUnidad = function(uIdx) {
  if (confirm('¿Estás seguro de eliminar la Unidad ' + (uIdx + 1) + '?')) {
    activeAnaliticoUnidades.splice(uIdx, 1);
    activeAnaliticoUnidades.forEach((u, i) => u.numeroUnidad = i + 1);
    window.renderAnaliticoUnidades();

    // Synchronize with PAC Elementos de Competencia
    if (activePacElementosCompetencia && activePacElementosCompetencia[uIdx] !== undefined) {
      activePacElementosCompetencia.splice(uIdx, 1);
      if (typeof window.renderPacElementosCompetencia === 'function') {
        window.renderPacElementosCompetencia();
      }
    }

    window.scheduleAutoSave(500);
    window.showToast('🗑 Unidad eliminada');
  }
};

window.addAnaliticoTema = function(uIdx) {
  const unit = activeAnaliticoUnidades[uIdx];
  if (!unit) return;
  if (!unit.temas) unit.temas = [];
  const nextTemaNum = unit.temas.length + 1;
  unit.temas.push({
    numeroTema: nextTemaNum,
    titulo: 'Tema ' + nextTemaNum + ': Nuevo Tema Analítico',
    contenido: '• Desglose de contenidos y puntos a desarrollar.'
  });
  window.renderAnaliticoUnidades();
  window.scheduleAutoSave(500);
};

window.removeAnaliticoTema = function(uIdx, tIdx) {
  const unit = activeAnaliticoUnidades[uIdx];
  if (!unit || !unit.temas) return;
  unit.temas.splice(tIdx, 1);
  unit.temas.forEach((t, i) => t.numeroTema = i + 1);
  window.renderAnaliticoUnidades();
  window.scheduleAutoSave(500);
};


window.updateUnitTitle = function(uIdx, val) {
  if (activeAnaliticoUnidades[uIdx]) {
    activeAnaliticoUnidades[uIdx].titulo = val;
    if (typeof window.renderPacElementosCompetencia === 'function') {
      window.renderPacElementosCompetencia();
    }
    window.scheduleAutoSave();
  }
};


window.updateTemaTitle = function(uIdx, tIdx, val) {
  if (activeAnaliticoUnidades[uIdx] && activeAnaliticoUnidades[uIdx].temas[tIdx]) {
    activeAnaliticoUnidades[uIdx].temas[tIdx].titulo = val;
    window.scheduleAutoSave();
  }
};

window.updateTemaContenido = function(uIdx, tIdx, val) {
  if (activeAnaliticoUnidades[uIdx] && activeAnaliticoUnidades[uIdx].temas[tIdx]) {
    activeAnaliticoUnidades[uIdx].temas[tIdx].contenido = val;
    window.scheduleAutoSave();
  }
};

// ── PERSISTENCE ENGINE: GOOGLE-DOCS STYLE AUTO-SAVE & LOAD ───────────────────
let autoSaveTimer = null;

window.updateAutoSaveStatus = function(status) {
  // 1. Update Top Bar Badge (if exists)
  let badge = document.getElementById('autosave-status-badge');
  if (badge) {
    if (status === 'SAVING') {
      badge.className = 'px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 font-medium text-[11px] flex items-center gap-1.5 transition-all shadow-xs';
      badge.innerHTML = '<i data-lucide="refresh-cw" class="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400"></i><span>Guardando...</span>';
    } else if (status === 'SAVED') {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      badge.className = 'px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-medium text-[11px] flex items-center gap-1.5 transition-all shadow-xs';
      badge.innerHTML = '<i data-lucide="cloud-check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i><span>Guardado (' + timeStr + ')</span>';
    } else if (status === 'DIRTY') {
      badge.className = 'px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 font-medium text-[11px] flex items-center gap-1.5 transition-all shadow-xs';
      badge.innerHTML = '<i data-lucide="edit-3" class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"></i><span>Editando...</span>';
    }
  }

  // 2. Update Bottom-Right Floating Toast Notification
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  let toast = document.getElementById('autosave-live-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'autosave-live-toast';
    container.appendChild(toast);
  }

  if (status === 'DIRTY') {
    toast.className = 'bg-slate-900/95 dark:bg-slate-800/95 text-blue-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-blue-500/40 shadow-2xl flex items-center gap-2.5 transition-all duration-300 pointer-events-auto';
    toast.innerHTML = '<i data-lucide="edit-3" class="w-4 h-4 text-blue-400 animate-pulse"></i><span>✏️ Editando contenido...</span>';
    toast.style.opacity = '1';
    toast.style.display = 'flex';
  } else if (status === 'SAVING') {
    toast.className = 'bg-slate-900/95 dark:bg-slate-800/95 text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-amber-500/40 shadow-2xl flex items-center gap-2.5 transition-all duration-300 pointer-events-auto';
    toast.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 text-amber-400 animate-spin"></i><span>⏳ Guardando automáticamente en la nube...</span>';
    toast.style.opacity = '1';
    toast.style.display = 'flex';
  } else if (status === 'SAVED') {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    toast.className = 'bg-slate-900/95 dark:bg-slate-800/95 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-2.5 transition-all duration-300 pointer-events-auto';
    toast.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i><span>✓ Cambios guardados automáticamente (' + timeStr + ')</span>';
    toast.style.opacity = '1';
    toast.style.display = 'flex';

    if (window._autosaveToastHideTimeout) clearTimeout(window._autosaveToastHideTimeout);
    window._autosaveToastHideTimeout = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast && toast.style.opacity === '0') {
            toast.style.display = 'none';
          }
        }, 300);
      }
    }, 3500);
  }

  if (window.lucide) window.lucide.createIcons();
};

window.updateAutoSaveBadge = window.updateAutoSaveStatus;

window.scheduleAutoSave = function(delayMs = 1200) {
  window.updateAutoSaveStatus('DIRTY');
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(async () => {
    window.updateAutoSaveStatus('SAVING');
    try {
      await window.saveCurrentDocenteData(true);
      window.updateAutoSaveStatus('SAVED');
    } catch (e) {
      window.updateAutoSaveStatus('SAVED');
    }
  }, delayMs);
};


window.saveCurrentDocenteData = async function(silent = false) {
  if (!silent) {
    window.showToast('⏳ Guardando cambios en la base de datos...');
  }

  const defData = materiasData[activeMateriaKey] || materiasData['sis213g1'];
  const codigo = document.getElementById('analitico-codigo-input')?.value || defData.codigo;
  const semestre = document.getElementById('analitico-semestre-input')?.value || defData.semestre;
  const nombre = document.getElementById('analitico-asig-input')?.value || defData.nombre;
  const creditos = parseInt(document.getElementById('analitico-creditos-input')?.value || defData.creditos) || 12;
  const ht = parseInt(document.getElementById('analitico-ht-input')?.value?.replace(/\D/g, '') || defData.horasTeoricas) || 2;
  const hp = parseInt(document.getElementById('analitico-hp-input')?.value?.replace(/\D/g, '') || defData.horasPracticas) || 4;
  const carac = document.getElementById('programa-caracterizacion')?.value || defData.caracterizacion;
  const macro = document.getElementById('programa-macrocompetencia')?.value || defData.macroCompetencia;
  const evalSis = document.getElementById('programa-sistema-evaluacion')?.value || defData.sistemaEvaluacion;

  // Read bibliographies directly from textareas
  const bibBasicaEl = document.getElementById('analitico-biblio-basica-input');
  const bibCompEl = document.getElementById('analitico-biblio-comp-input');
  const bibBasicaText = bibBasicaEl ? bibBasicaEl.value : '';
  const bibCompText = bibCompEl ? bibCompEl.value : '';

  const bibliografia = [];
  bibBasicaText.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
    bibliografia.push({
      tipo: 'BASICA',
      citaApa: line,
      autor: 'UNITEPC',
      anio: 2026,
      titulo: line
    });
  });

  bibCompText.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
    bibliografia.push({
      tipo: 'COMPLEMENTARIA',
      citaApa: line,
      autor: 'UNITEPC',
      anio: 2026,
      titulo: line
    });
  });

  const programaPayload = {
    asignacionId: activeAsignacionId || defData.asignacionId || 1,
    codigoAsignatura: codigo,
    nombreAsignatura: nombre,
    semestre: semestre,
    creditos: creditos,
    horasTeoricas: ht,
    horasPracticas: hp,
    caracterizacion: carac,
    macroCompetencia: macro,
    sistemaEvaluacion: evalSis,
    unidades: activeAnaliticoUnidades,
    bibliografia: bibliografia
  };

  // Immediate local cache per subject
  localStorage.setItem('sisa_saved_programa_analitico_' + activeMateriaKey, JSON.stringify(programaPayload));
  localStorage.setItem('sisa_active_materia_key', activeMateriaKey);
  localStorage.setItem('sisa_saved_user_configured', 'true');

  // Also persist PAC state including dynamic elementos de competencia
  const savedPacStr = localStorage.getItem('sisa_saved_pac_' + activeMateriaKey);
  let curPac = {};
  if (savedPacStr) {
    try { curPac = JSON.parse(savedPacStr); } catch(e) {}
  }
  curPac.elementosCompetencia = activePacElementosCompetencia;
  if (document.getElementById('pac-justificacion-input')) curPac.justificacion = document.getElementById('pac-justificacion-input').value;
  if (document.getElementById('pac-proposito-input')) curPac.propositoGeneral = document.getElementById('pac-proposito-input').value;
  if (document.getElementById('pac-competencia-global')) curPac.competenciaGlobal = document.getElementById('pac-competencia-global').value;
  if (document.getElementById('pac-unidad-competencia')) curPac.unidadCompetencia = document.getElementById('pac-unidad-competencia').value;
  
  if (typeof window.extractCurrentCronogramaFromDom === 'function') {
    const liveCron = window.extractCurrentCronogramaFromDom();
    if (liveCron.length > 0) {
      curPac.matriz7 = liveCron;
    }
  }
  
  localStorage.setItem('sisa_saved_pac_' + activeMateriaKey, JSON.stringify(curPac));


  try {
    const resp = await fetch('/api/v1/planificaciones/programa-analitico', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...window.getAuthHeaders()
      },
      body: JSON.stringify(programaPayload)
    });
    
    if (resp.ok) {
      if (!silent) window.showToast('✅ ¡Planificación de ' + codigo + ' guardada exitosamente!');
      window.updateAutoSaveBadge('SAVED');
    } else {
      if (!silent) window.showToast('✅ Cambios guardados (Borrador activo: ' + codigo + ')');
      window.updateAutoSaveBadge('SAVED');
    }
  } catch (e) {
    if (!silent) window.showToast('✅ Cambios guardados localmente (' + codigo + ')');
    window.updateAutoSaveBadge('SAVED');
  }
};


window.loadSavedDocenteData = function(materiaKey) {
  const mKey = materiaKey || localStorage.getItem('sisa_active_materia_key') || activeMateriaKey || 'sis213g1';
  activeMateriaKey = mKey;
  const defData = materiasData[mKey] || materiasData['sis213g1'];
  activeAsignacionId = defData.asignacionId || 1;

  // 1. Programa Analítico
  const saved = localStorage.getItem('sisa_saved_programa_analitico_' + mKey);
  let pData = defData;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Clean obsolete P- codes from previous temporary seeds
      if (parsed.codigoAsignatura && (parsed.codigoAsignatura.startsWith('P-') || parsed.codigoAsignatura.startsWith('MAT-'))) {
        delete parsed.codigoAsignatura;
      }
      if (parsed.codigo && (parsed.codigo.startsWith('P-') || parsed.codigo.startsWith('MAT-'))) {
        delete parsed.codigo;
      }
      pData = Object.assign({}, defData, parsed);
    } catch (e) {}
  }

  const officialCode = pData.codigoAsignatura || pData.codigo || defData.codigo || 'SIS-113';
  if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = officialCode;
  if (document.getElementById('analitico-semestre-input')) document.getElementById('analitico-semestre-input').value = pData.semestre || '1º Semestre';
  if (document.getElementById('analitico-asig-input')) document.getElementById('analitico-asig-input').value = pData.nombreAsignatura || pData.nombre || defData.nombre || '';
  if (document.getElementById('analitico-creditos-input')) document.getElementById('analitico-creditos-input').value = pData.creditos || '8';
  if (document.getElementById('analitico-ht-input')) document.getElementById('analitico-ht-input').value = (pData.horasTeoricas ? pData.horasTeoricas + ' Horas' : '2 Horas');
  if (document.getElementById('analitico-hp-input')) document.getElementById('analitico-hp-input').value = (pData.horasPracticas ? pData.horasPracticas + ' Horas' : '4 Horas');
  if (document.getElementById('analitico-hs-input')) document.getElementById('analitico-hs-input').value = (pData.horasSemestre ? pData.horasSemestre + ' Horas' : '120 Horas');
  if (document.getElementById('programa-caracterizacion')) document.getElementById('programa-caracterizacion').value = pData.caracterizacion || '';
  if (document.getElementById('programa-macrocompetencia')) document.getElementById('programa-macrocompetencia').value = pData.macroCompetencia || '';
  if (document.getElementById('programa-sistema-evaluacion')) document.getElementById('programa-sistema-evaluacion').value = pData.sistemaEvaluacion || '';

  activeAnaliticoUnidades = pData.unidades ? JSON.parse(JSON.stringify(pData.unidades)) : [];
  window.renderAnaliticoUnidades();
  window.renderAnaliticoBibliografia(pData.bibliografia || []);

  // 2. PAC Pedagógico
  const savedPac = localStorage.getItem('sisa_saved_pac_' + mKey);
  if (savedPac) {
    try {
      const pacData = JSON.parse(savedPac);
      if (pacData.codigoAsignatura && (pacData.codigoAsignatura.startsWith('P-') || pacData.codigoAsignatura.startsWith('MAT-'))) {
        pacData.codigoAsignatura = officialCode;
      }
      if (!pacData.matriz7 || !Array.isArray(pacData.matriz7) || pacData.matriz7.length === 0) {
        pacData.matriz7 = window.generateDefaultMatriz7(mKey);
      }
      if (typeof window.populatePacDom === 'function') {
        window.populatePacDom(pacData);
      }
    } catch (pe) {}
  } else {
    const defPac = {
      carrera: defData.carrera,
      nombreAsignatura: defData.nombre,
      codigoAsignatura: officialCode,
      semestre: defData.semestre,
      creditos: defData.creditos,
      horasTeoricasPracticas: (defData.horasTeoricas || '2') + 'T / ' + (defData.horasPracticas || '4') + 'P',
      justificacion: defData.caracterizacion,
      propositoGeneral: defData.macroCompetencia,
      competenciaGlobal: defData.macroCompetencia,
      unidadCompetencia: 'Maneja conceptos y aplicaciones para el desempeño profesional.',
      elementoCompetencia1: 'Aplica herramientas teórico-prácticas para la resolución de problemas de la asignatura.',
      elementoCompetencia2: 'Desarrolla proyectos y actividades integradoras.',
      metodologiaAula: 'Metodología constructivista socioformativa con talleres prácticos y resolución de problemas.',
      sistemaEvaluacion: defData.sistemaEvaluacion,
      normativaCurso: '10 minutos de tolerancia al ingreso a clases.\nLlegar puntual a clase.\nMantener limpio el ambiente de trabajo.\nEntregar trabajos en el tiempo establecido.',
      p1NotaTeorica: 20, p1NotaPractica: 10,
      p2NotaTeorica: 20, p2NotaPractica: 10,
      efNotaTeorica: 30, efNotaPractica: 10,
      bibliografia: defData.bibliografia,
      elementosCompetencia: defData.elementosCompetencia || [],
      matriz7: window.generateDefaultMatriz7(mKey)
    };
    if (typeof window.populatePacDom === 'function') {
      window.populatePacDom(defPac);
    }
  }

  // Load Planes de Clase (Tab 4)
  const savedPlanesStr = localStorage.getItem('sisa_saved_planes_' + mKey);
  if (savedPlanesStr) {
    try {
      activePlanesList = JSON.parse(savedPlanesStr);
      // Auto-migrate if old 3-moment format
      const t3 = (activePlanesList && activePlanesList.length > 2) ? activePlanesList[2] : null;
      const needsSeedRefresh = !activePlanesList || activePlanesList.length < 6 || (!activePlanesList[0].momentos || activePlanesList[0].momentos.length < 5) || (t3 && t3.contenidoTema === 'UA-2 Tema 3');
      if (needsSeedRefresh) {
        activePlanesList = window.generateDefaultPlanesList(mKey);
        localStorage.setItem('sisa_saved_planes_' + mKey, JSON.stringify(activePlanesList));
      }
    } catch (e) {
      activePlanesList = [];
    }
  } else {
    activePlanesList = [];
  }

  if (!activePlanesList || activePlanesList.length === 0) {
    activePlanesList = window.generateDefaultPlanesList(mKey);
    localStorage.setItem('sisa_saved_planes_' + mKey, JSON.stringify(activePlanesList));
  }
  activePlanSheetIndex = 0;
  if (typeof window.renderPlanesSheetsTabs === 'function') {
    window.renderPlanesSheetsTabs();
  }
  if (typeof window.renderPlanSheetForm === 'function') {
    window.renderPlanSheetForm(0);
  }

  return true;
};

window.generateDefaultPlanesList = function(mKey) {
  const def = (materiasData && materiasData[mKey]) ? materiasData[mKey] : (materiasData ? Object.values(materiasData)[0] : null);
  const teacherName = (window.__ACTIVE_DOCENTE__ && window.__ACTIVE_DOCENTE__.nombreCompleto) ? window.__ACTIVE_DOCENTE__.nombreCompleto : 'Docente Asignado';
  const courseName = def ? (def.nombre || 'Asignatura Asignada') : 'Asignatura Asignada';
  const careerName = def ? (def.carrera || 'UNITEPC') : 'UNITEPC';

  const CANONICAL_PLANES = [
  {
    "nombreHoja": "UA-1 Tema 1",
    "nombreDocente": teacherName,
    "fecha": "09/02/2026",
    "nombreAsignatura": courseName,
    "carrera": careerName,
    "unidadTitulo": "INTRODUCCION A " + courseName.toUpperCase(),
    "elementoCompetencia": `Aplica los fundamentos conceptuales y metodológicos de ${courseName} con rigor profesional en el ámbito de ${careerName}.`,
    "contenidoTema": "CONCEPTOS FUNDAMENTALES Y PRINCIPIOS",
    "objetivoSesion": `Reconoce los fundamentos teórico-prácticos de ${courseName} para resolver problemas de la disciplina.`,
    "logrosEsperados": "1. Identifica los conceptos y principios básicos.\n2. Aplica metodologías estándar con rigor académico.",
    "indicadoresLogro": "1. Clasifica correctamente los elementos clave.\n2. Resuelve ejercicios introductorios pertinentes.",
    "saberConceptual": `- Fundamentos de ${courseName}\n- Marco teórico y metodológico\n- Normas y estándares aplicables`,
    "saberProcedimental": `- Identificación de elementos clave de ${courseName}\n- Resolución guiada de problemas\n- Aplicación práctica en laboratorio`,
    "saberActitudinal": "- Rigor y ética profesional\n- Trabajo colaborativo\n- Pensamiento crítico",
    "estrategiaEnsenanza": "- Clase interactiva guiada\n- Demostración de casos de estudio",
    "estrategiaAprendizaje": "- Taller práctico guiado\n- Análisis y resolución de problemas",
    "recursosEnsenanza": "- Diapositivas y bibliografía técnica\n- Software y laboratorios especializados",
    "evaluacionFormativaActividad": "Taller práctico en clase",
    "evaluacionFormativaInstrumento": "Lista de cotejo",
    "evaluacionFormativaEvidencia": "Práctica desarrollada",
    "evaluacionSumativaActividad": "Prueba escrita objetiva",
    "evaluacionSumativaInstrumento": "Cuestionario y rúbrica",
    "evaluacionSumativaEvidencia": "Evaluación calificada",
    "momentos": [
      {
        "tipoMomento": "INTRODUCCION",
        "nombreMomento": "1. INTRODUCCIÓN",
        "actividadesDocente": `Presentación de los objetivos de la sesión, contextualización de ${courseName} y activación cognitiva.`,
        "duracionMin": 20
      },
      {
        "tipoMomento": "RESULTADOS_LOGROS",
        "nombreMomento": "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS",
        "actividadesDocente": `Reconoce los principios fundamentales de ${courseName} y aplica la metodología correspondiente.`,
        "duracionMin": 10
      },
      {
        "tipoMomento": "CONTENIDOS",
        "nombreMomento": "3. CONTENIDOS DE LA CLASE",
        "actividadesDocente": `1. Introducción general.\n2. Principios y marco conceptual de ${courseName}.\n3. Ejercicios y modelos aplicados.`,
        "duracionMin": 10
      },
      {
        "tipoMomento": "CUERPO",
        "nombreMomento": "4. CUERPO DE CONTENIDOS",
        "actividadesDocente": `Desarrollo temático detallado, modelado de problemas y trabajo guiado con los estudiantes en ${courseName}.`,
        "duracionMin": 90
      },
      {
        "tipoMomento": "CONCLUSION",
        "nombreMomento": "5. CONCLUSIÓN O CIERRE",
        "actividadesDocente": "Síntesis de los conceptos clave, retroalimentación y orientaciones para la siguiente sesión.",
        "duracionMin": 20
      }
    ]
  },
  {
    "nombreHoja": "UA-1 Tema 2",
    "nombreDocente": teacherName,
    "fecha": "16/02/2026",
    "nombreAsignatura": courseName,
    "carrera": careerName,
    "unidadTitulo": "INTRODUCCION A LINGÜÍSTICA ORIGINARIA",
    "elementoCompetencia": "Analiza los fundamentos lingüísticos, históricos y fonológicos de la lengua quechua, para comprender la identidad sociocultural y la dinámica de interacción de las comunidades andinas, mediante el estudio del origen, expansión y estructura fonética de la lengua, bajo un enfoque de respeto a la diversidad lingüística, rigor académico y pertinencia en el contexto de la realidad económica y social boliviana.",
    "contenidoTema": "FONOLOGÍA DEL QUECHUA",
    "objetivoSesion": "Emplea los fundamentos fonológicos y las estructuras morfológicas básicas del quechua para garantizar una comunicación técnica clara y precisa en contextos profesionales iniciales.",
    "logrosEsperados": "1. Diferencia la estructura de raíces y sufijos en categorías gramaticales básicas.\n2. Articula correctamente los sonidos (simples, aspirados y glotalizados).",
    "indicadoresLogro": "1. Descompone correctamente palabras aglutinantes en raíz y sufijo.\n2. Descompone correctamente palabras aglutinantes en raíz y sufijo.",
    "saberConceptual": "- Morfología de las palabras \n- Sustantivos \n- Verbos \n- Pronombres \n- Fonética y fonología del quechua \n- Sonidos simples \n- Sonidos llanos \n- Sonidos glotalizados",
    "saberProcedimental": "- Diferenciación entre raíces y sufijos\n- Clasificación de palabras según su categoría (sustantivo, verbo, pronombre)\n- Ejecución de sonidos vocálicos y consonánticos\n- Aplicación del acento grave en la lectura de palabras\n- Discriminación auditiva de las oclusivas\n- Articulación de fonemas con y sin salida de aire (aspiradas/glotales)",
    "saberActitudinal": "- Interés por la estructura lógica del idioma\n- Atención al detalle en la formación de palabras\n- Esmero en la dicción clara\n- Paciencia en el proceso de imitación de sonidos nuevos \n- Perseverancia en la práctica de sonidos complejos \n- Autocrítica frente a la propia pronunciación",
    "estrategiaEnsenanza": "- Método Audiolingual: Énfasis en la imitación y repetición de patrones sonoros. \n- Análisis Estructural: Uso de colores para diferenciar raíces de sufijos en la pizarra. \n- Modelado Fonético: Explicación visual de los puntos de articulación.",
    "estrategiaAprendizaje": "- Laboratorio de Sonidos: Práctica con grabaciones para mejorar la discriminación auditiva. \n- Mapas de Palabras: Creación de esquemas donde una raíz genera múltiples significados al añadir sufijos. \n- Auto grabación: Uso del celular para escuchar y corregir su propia dicción.",
    "recursosEnsenanza": "- Audios de hablantes nativos\n- Formularios de registro en quechua.\n- Tarjetas léxicas.",
    "evaluacionFormativaActividad": "Dictado fonético de cifras y nombres de productos.",
    "evaluacionFormativaInstrumento": "Guía de audición y repetición.",
    "evaluacionFormativaEvidencia": "Lista de palabras clasificadas por su sonido (simple/aspirado/glotal).",
    "evaluacionSumativaActividad": "Examen escrito",
    "evaluacionSumativaInstrumento": "Prueba objetiva",
    "evaluacionSumativaEvidencia": "Examen resuelto",
    "momentos": [
      {
        "tipoMomento": "INTRODUCCION",
        "nombreMomento": "1. INTRODUCCIÓN",
        "actividadesDocente": "Activación: Diagnóstico de discriminación auditiva.",
        "duracionMin": 45
      },
      {
        "tipoMomento": "RESULTADOS_LOGROS",
        "nombreMomento": "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS",
        "actividadesDocente": "Emplea los fundamentos fonológicos y estructuras morfológicas básicas del quechua para garantizar una comunicación técnica, precisa y éticamente responsable en contextos profesionales bilingües.\nLogros: \n1. Diferencia la estructura de raíces y sufijos en categorías gramaticales básicas.\n2. Articula correctamente los sonidos (simples, aspirados y glotalizados).\n1. Articula correctamente los fonemas (simples, aspirados, glotalizados) para evitar ambigüedades en la información técnica.\n2. Aplica la flexión morfológica (persona, número, tiempo) para estructurar reportes y diálogos comerciales claros.",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CONTENIDOS",
        "nombreMomento": "3. CONTENIDOS DE LA CLASE",
        "actividadesDocente": "1. Morfología (sustantivos, verbos, pronombres)\n2. Fonética y fonología; Sonidos (simples, aspirados, glotalizados).\n3. Pronunciación\n- Pronombres\n- Fonética y fonología del quechua\n- Sonidos simples\n- Sonidos llanos\n- Sonidos glotalizados",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CUERPO",
        "nombreMomento": "4. CUERPO DE CONTENIDOS",
        "actividadesDocente": "1. Morfología de las palabras (Raíces y Sufijos): Se explica el principio de aglutinación. El estudiante aprende a separar la raíz (dato base) de los sufijos (modificadores gramaticales).\nSustantivos: Identificación de nombres de bienes y servicios.\nVerbos: Identificación de raíces verbales para acciones económicas.\nPronombres: Uso de marcadores personales para establecer el sujeto en un reporte.\n2. Fonética y Fonología del Quechua: Se introduce la diferencia entre el fonema (unidad abstracta) y el alófono (realización sonora). Se enfatiza la importancia de la exactitud articulatoria para evitar sesgos en la información.\n3. Sonidos Simples, Aspirados y Glotalizados:\nSonidos Simples: Articulación neutra.\nSonidos Aspirados (Llanos): Marcados con 'h', requieren un flujo de aire constante.\nSonidos Glotalizados: Marcados con apóstrofe ('), requieren una interrupción brusca de la glotis.\n4. Pronunciación y Acentuación: El quechua es un sistema de acentuación grave. Se entrena al estudiante para mantener este ritmo constante, evitando la entonación variable del español que puede confundir el sentido de los términos técnicos.",
        "duracionMin": 360
      },
      {
        "tipoMomento": "CONCLUSION",
        "nombreMomento": "5. CONCLUSIÓN O CIERRE",
        "actividadesDocente": "Actividad: Taller de Dictado Fonológico. El docente dicta palabras y los estudiantes clasifican si el sonido es simple, aspirado o glotalizado.\nInstrumento: Guía de audición y repetición con lista de cotejo.\nEvidencia: Matriz de clasificación de fonemas completada en clase.",
        "duracionMin": 135
      }
    ]
  },
  {
    "nombreHoja": "UA-2 Tema 3",
    "nombreDocente": "Harold Iriarte Rojas",
    "fecha": "09/02/2026",
    "nombreAsignatura": "Taller de idiomas",
    "carrera": "FACEFA - Complementarias",
    "unidadTitulo": "LENGUA ORIGINARIA",
    "elementoCompetencia": "Produce mensajes y estructuras oracionales complejas en lengua quechua mediante el uso correcto de la morfología nominal, verbal y la sintaxis, para establecer una comunicación efectiva en contexto, aplicando metodologías de trabajo de campo y análisis sociolingüístico bajo normas gramaticales del quechua boliviano y principios de responsabilidad social en el sistema económico actual.",
    "contenidoTema": "",
    "objetivoSesion": "Emplea la morfología nominal básica del quechua (pronombres, números, verbos existenciales) para gestionar información personal, transaccional y de propiedad en contextos de interacción socioeconómica.",
    "logrosEsperados": "1. Aplica protocolos de cortesía y numeración en contextos de intercambio real.\n2. Estructura enunciados de identidad y pertenencia utilizando pronombres y el verbo Kay.",
    "indicadoresLogro": "1. Construye cantidades (unidades, decenas, centenas) sin errores en la rotulación de inventarios o precios.\n2. Diferencia correctamente entre nosotros inclusivo (-nchik) y exclusivo (-yku) en reportes financieros.",
    "saberConceptual": "- Saludos\n- Despedidas\n- Los números: Composición de Unidades, Composición de decenas, Composición de centenas\n- Uso de los números en diferentes contextos\n- Pronombres personales: Pronombres Singulares, Pronombres Plurales\n- Pronombres posesivos: Pronombres Singulares, Pronombres Plurales\n- Verbo Kay",
    "saberProcedimental": "- Uso de fórmulas de cortesía en situaciones cotidianas.\n- Simulación de encuentros sociales básicos.\n- Construcción de cifras de unidades a centenas.\n- Conteo de objetos reales del entorno inmediato.\n- Sustitución de nombres propios por pronombres.\n- Uso correcto del plural inclusivo (-nchik) y exclusivo (-yku).\n- Indicación de pertenencia de objetos personales.\n- Construcción de frases de posesión singulares y plurales.\n- Conjugación del verbo ser/estar en presente.\n- Descripción de estados y características de personas u objetos.",
    "saberActitudinal": "- Cordialidad en la interacción.\n- Respeto por los protocolos de saludo andinos.\n- Precisión en el manejo de cantidades.\n- Confianza al expresar valores numéricos.\n- Sensibilidad ante la inclusión/exclusión social.\n- Coherencia en la designación de sujetos.\n- Responsabilidad al identificar la propiedad.\n- Claridad en la expresión de pertenencia.\n- Seguridad al expresar la identidad.\n- Veracidad en las descripciones realizadas.",
    "estrategiaEnsenanza": "- Aprendizaje Basado en Tareas (TBL): Simulación de mercado y atención al cliente.\n- Instrucción Directa: Modelado de la conjugación del verbo Kay.\n- Aprendizaje Cooperativo: Trabajo en parejas para la construcción de inventarios.",
    "estrategiaAprendizaje": "Práctica de Campo: Conteo de objetos reales del aula. \nRole-playing: Diálogos de presentación y venta. \nTécnica de Sustitución: Ejercicios de reemplazo pronominal en párrafos técnicos.",
    "recursosEnsenanza": "- Fichas de trabajo con objetos del entorno\n- Grabaciones de saludos andinos\n- Calculadora para ejercicios de numeración en quechua",
    "evaluacionFormativaActividad": "\"Mercado de trueque\" simulado.",
    "evaluacionFormativaInstrumento": "Lista de cotejo de desempeño comunicativo.",
    "evaluacionFormativaEvidencia": "Registro de precios y cantidades anotados en quechua.",
    "evaluacionSumativaActividad": "Examen escrito",
    "evaluacionSumativaInstrumento": "Prueba objetiva",
    "evaluacionSumativaEvidencia": "Examen resuelto",
    "momentos": [
      {
        "tipoMomento": "INTRODUCCION",
        "nombreMomento": "1. INTRODUCCIÓN",
        "actividadesDocente": "Contextualización: Diagnóstico de la importancia de la lengua en el entorno socioeconómico regional. Presentación del mapa de competencias y la meta de alcanzar un nivel de usuario básico funcional.",
        "duracionMin": 60
      },
      {
        "tipoMomento": "RESULTADOS_LOGROS",
        "nombreMomento": "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS",
        "actividadesDocente": "Emplea la estructura morfológica nominal y los sistemas de cuantificación, posesión e identidad del quechua para establecer relaciones comunicativas precisas y cordiales en entornos económicos andinos.\nLogros:\n1. Aplica protocolos de cortesía y cuantificación exacta en contextos de intercambio.\n2. Diferencia roles, sujetos y relaciones de propiedad mediante el uso correcto de pronombres y el verbo Kay.",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CONTENIDOS",
        "nombreMomento": "3. CONTENIDOS DE LA CLASE",
        "actividadesDocente": "- Saludos y Despedidas\n- Sistema Numérico\n- Identidad y Pertenencia\n- Pronombres Posesivos\n- El Verbo Kay",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CUERPO",
        "nombreMomento": "4. CUERPO DE CONTENIDOS",
        "actividadesDocente": "1. Saludos y Despedidas: Más allá del Allillanchu, se estudian las variantes según el interlocutor (autoridad comunal vs. socio comercial). Se analiza la dimensión temporal de las despedidas (ej. Paqarinkama - hasta mañana).\n2. Sistema Numérico: Unidades, Decenas, Centenas: Se aprende la lógica aditiva. Es crucial para la precisión contable. Uso en contexto: Diferenciación entre cantidad de bienes, precios y plazos de pago.\n3. Identidad y Pertenencia: Pronombres Personales: Dominio del sistema singular y plural, enfatizando la distinción inclusiva (ñuqanchik) y exclusiva (ñuqayku), fundamental para la transparencia en la gestión de presupuestos grupales. \n4. Pronombres Posesivos: Uso de los sufijos -y (mi), -yki (tu), -n (su) para la identificación de activos y recursos en inventarios.\n5. El Verbo Kay: Dominio del verbo copulativo para la construcción de frases de identidad.",
        "duracionMin": 720
      },
      {
        "tipoMomento": "CONCLUSION",
        "nombreMomento": "5. CONCLUSIÓN O CIERRE",
        "actividadesDocente": "Actividad Técnica: \"El Informe del Administrador\". El estudiante debe completar una ficha de descripción personal, realizar una operación aritmética de inventario que incluya unidades, decenas y centenas, y redactar oraciones simples sobre la posesión de activos, todo en quechua.\nInstrumento: Rúbrica de evaluación integral (gramática, léxico, fluidez).\nCriterios: Exactitud en numeración (30%), Uso correcto de sufijos posesivos (30%), Concordancia del verbo Kay (20%), Actitud y cortesía (20%).\nEvidencia: Ficha de registro técnico completa y video-presentación breve de un activo bajo su responsabilidad.",
        "duracionMin": 20
      }
    ]
  },
  {
    "nombreHoja": "UA-2 Tema 4",
    "nombreDocente": "Harold Iriarte Rojas",
    "fecha": "09/02/2026",
    "nombreAsignatura": "Taller de idiomas",
    "carrera": "FACEFA - Complementarias",
    "unidadTitulo": "LENGUA ORIGINARIA",
    "elementoCompetencia": "Produce mensajes y estructuras oracionales complejas en lengua quechua mediante el uso correcto de la morfología nominal, verbal y la sintaxis, para establecer una comunicación efectiva en contexto, aplicando metodologías de trabajo de campo y análisis sociolingüístico bajo normas gramaticales del quechua boliviano y principios de responsabilidad social en el sistema económico actual.",
    "contenidoTema": "SINTAXIS",
    "objetivoSesion": "Construye enunciados complejos y coherentes respetando la estructura sintáctica SOV y la morfología verbal para comunicar procesos administrativos y económicos con precisión y pertinencia cultural.",
    "logrosEsperados": "1. Estructura oraciones básicas bajo el modelo SOV.\n2. Aplica sufijos nominales para precisar roles, instrumentos y límites.",
    "indicadoresLogro": "1. Ordena sintácticamente oraciones aplicando el modelo SOV sin errores.\n2. Identifica y usa los sufijos -ta, -pi, -paq, -wan, -manta según el contexto de gestión.",
    "saberConceptual": "- Estructura de la oración en quechua: El sujeto, El complemento, El Verbo\n- Sufijos nominales: -ta, Objeto directo y Objeto Indirecto; -na; -kama; -pi; -paq; -man; -manta; -lla; -wan instrumental; -wan de compañía\n- Verbos en quechua\n- Morfologia del verbo: Verbos primitivos y Verbos derivados\n- Conjugación verbal: Raiz verbal\n- Tiempo presente: Sujeto singular, Sujeto plural\n- Tiempo pasado: Sujeto singular, Sujeto plural\n- Tiempo futuro: Sujeto singular, Sujeto plural\n- TIempo continuo: Sujeto singular, Sujeto plural\n- Oraciones simples en presente, pasado, futuro\n- Oraciones complejas en presente, pasado, futuro",
    "saberProcedimental": "- Ordenamiento de elementos según el modelo Sujeto-Objeto-Verbo (SOV).\n- Creación de oraciones con sentido completo.\n- Marcación del objeto directo en la oración.\n- Expresión de la utilidad de herramientas o acciones futuras.\n- Determinación de límites de tiempo/lugar.\n- Localización espacial y asignación de beneficios.\n- Indicación de dirección y origen.\n- Uso del limitativo para enfatizar exclusividad.\n- Descripción de instrumentos de trabajo.\n- Identificación de acompañantes en una acción.\n- Categorización de acciones según su raíz.\n- Formación de nuevos significados mediante derivación verbal.\n- Identificación de la raíz invariable del verbo.\n- Anexión de desinencias de persona y número.\n- Relato de acciones que ocurren en el momento.\n- Descripción de rutinas diarias.\n- Narración de hechos históricos o personales concluidos.\n- Uso del sufijo -rqa para el pasado.\n- Proyección de metas y planes próximos.\n- Descripción de acciones en proceso de ejecución (-chka).\n- Desarrollo de párrafos coherentes.",
    "saberActitudinal": "- Disciplina sintáctica.\n- Atención a la función de los complementos.\n- Valoración de la utilidad instrumental.\n- Exactitud en la fijación de límites.\n- Empatía al asignar beneficios a terceros.\n- Precisión en la descripción de trayectos.\n- Solidaridad al reconocer el trabajo con otros.\n- Curiosidad léxica.\n- Respeto por la norma gramatical.\n- Claridad al describir la actualidad.\n- Puntualidad en la expresión del tiempo.\n- Honestidad en el relato de hechos.\n- Compromiso con los planes trazados.",
    "estrategiaEnsenanza": "- Método de Aprendizaje Basado en Problemas (ABP): Resolución de casos donde falta un sufijo de caso y cambia el sentido del mensaje.\n- Instrucción Directa y Modelado: Uso de diagramas de bloques para visualizar la posición de los sufijos en la oración.\n- Taller de Escritura Creativa: Producción de reportes de gestión simulados.",
    "estrategiaAprendizaje": "- Diagramación de Oraciones: Uso de esquemas de árbol sintáctico para organizar elementos SOV.\n- Fichas de Autogestión: Creación de un catálogo de verbos derivados y sus raíces.\n- Diario de Campo: Redacción de rutinas y planes en tiempos presente, pasado y futuro.",
    "recursosEnsenanza": "- Pizarra\n- Guías de ejercicios con sufijos\n- Audios de procesos productivos en quechua",
    "evaluacionFormativaActividad": "Dictado de oraciones complejas, ejercicios de \"completar el sufijo\", debate sobre procesos de gestión.",
    "evaluacionFormativaInstrumento": "Escala de valoraciòn, guías de autoevaluación.",
    "evaluacionFormativaEvidencia": "Ejercicios resueltos en clase, esquemas de derivación verbal.",
    "evaluacionSumativaActividad": "Examen escrito",
    "evaluacionSumativaInstrumento": "Prueba objetiva",
    "evaluacionSumativaEvidencia": "Examen resuelto",
    "momentos": [
      {
        "tipoMomento": "INTRODUCCION",
        "nombreMomento": "1. INTRODUCCIÓN",
        "actividadesDocente": "Diagnóstico y encuadre: Análisis del orden SOV frente al SVO del español. Reflexión sobre la importancia de la precisión sintáctica.",
        "duracionMin": 90
      },
      {
        "tipoMomento": "RESULTADOS_LOGROS",
        "nombreMomento": "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS",
        "actividadesDocente": "Construye enunciados complejos y coherentes aplicando la estructura SOV, el sistema de sufijos nominales y la conjugación verbal, para comunicar procesos socioeconómicos con precisión técnica.\nLogros:\n1. Domina la estructura SOV y el uso de sufijos de caso. \n2. Aplica sufijos de lugar, tiempo y beneficio para contextualizar acciones. \n3. Diferencia y utiliza la morfología de verbos primitivos y derivados. \n4. Conjuga verbos en tiempos presente, pasado, futuro y continuo con concordancia. \n5. Redacta oraciones complejas que integran ideas causa-efecto o secuencia lógica.",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CONTENIDOS",
        "nombreMomento": "3. CONTENIDOS DE LA CLASE",
        "actividadesDocente": "- Estructura de la oración en quechua: El sujeto, El complemento, El Verbo.\n- Sufijos nominales: -ta, Objeto directo y Objeto Indirecto; -na; -kama; -pi; -paq; -man; -manta; -lla; -wan instrumental; -wan de compañía.\n- Verbos en quechua; Morfologia del verbo: Verbos primitivos y Verbos derivados.\n- Conjugación verbal: Raiz verbal.\n- Tiempo presente: Sujeto singular, Sujeto plural.\n- Tiempo pasado: Sujeto singular, Sujeto plural.\n- Tiempo futuro: Sujeto singular, Sujeto plural.\n- TIempo continuo: Sujeto singular, Sujeto plural.\n- Oraciones simples en presente, pasado, futuro.\n- Oraciones complejas en presente, pasado, futuro",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CUERPO",
        "nombreMomento": "4. CUERPO DE CONTENIDOS",
        "actividadesDocente": "1. Estructura de la Oración y Sufijos Nominales: Sujeto, Complemento, Verbo: El estudiante aprende a identificar los bloques estructurales. En quechua, el verbo siempre es el elemento final de la cadena de información.\n2. Sufijos de Caso: -ta (OD/OI): Marca la afectación directa o el destinatario de una transacción; -na: Sufijo instrumental/obligativo para procesos productivos; -kama: Delimitación de tiempos y alcances financieros; pi (Localizador): Ubicación espacial o física del hecho económico; -paq (Beneficiario): Asignación de recursos; -man / -manta: Dirección y origen (trazabilidad); -lla (Limitativo): Énfasis en la exclusividad o escasez (importante en presupuestos); -wan (Instrumental/Compañía): Uso de maquinaria o alianzas estratégicas.\n3. Verbos: Morfología y Conjugación: Verbos Primitivos y Derivados: Se enseña a diferenciar la raíz base de las formas derivadas que añaden matices de acción (ej: k'utuy - cortar; k'utukuy - cortarse a sí mismo); Raíz Verbal: Identificación del elemento invariable que contiene el significado semántico principal.\n4. Tiempos Verbales y Conjugación: Presente, Pasado, Futuro, Continuo (-chka): Se aplica el paradigma de conjugación a los sujetos singulares y plurales; Sujeto Plural: Énfasis en la distinción inclusiva (-nchik) y exclusiva (-yku); Tiempos: Uso de marcas como -rqa (pasado lejano) y -sa (o -sha - futuro).\n5. Sintaxis de Oraciones Simples y Complejas: Oraciones Simples: Estructuración de enunciados de gestión directa; Oraciones Complejas: Uso de conectores y oraciones subordinadas para expresar causalidad, condición y finalidad. Es aquí donde el estudiante desarrolla pensamiento crítico al justificar decisiones económicas.",
        "duracionMin": 1485
      },
      {
        "tipoMomento": "CONCLUSION",
        "nombreMomento": "5. CONCLUSIÓN O CIERRE",
        "actividadesDocente": "Actividad Técnica: \"Informe de Gestión Técnica Intercultural\". El estudiante debe redactar un informe de 3 a 5 párrafos detallando: 1. Antecedentes (Pasado), 2. Estado actual de activos (Presente/Continuo), 3. Proyecciones presupuestarias (Futuro). Debe incluir al menos 8 sufijos diferentes y oraciones complejas.\nInstrumento: Rúbrica de Redacción Técnica (Criterios: Sintaxis SOV 30%, Uso de Sufijos 30%, Conjugación/Tiempos 20%, Coherencia y Estilo 20%).\nEvidencias: Informe impreso y/o digital y defensa oral del documento ante el docente.",
        "duracionMin": 180
      }
    ]
  },
  {
    "nombreHoja": "UA-2 Tema 5",
    "nombreDocente": "Harold Iriarte Rojas",
    "fecha": "09/02/2026",
    "nombreAsignatura": "Taller de idiomas",
    "carrera": "FACEFA - Complementarias",
    "unidadTitulo": "LENGUA ORIGINARIA",
    "elementoCompetencia": "Produce mensajes y estructuras oracionales complejas en lengua quechua mediante el uso correcto de la morfología nominal, verbal y la sintaxis, para establecer una comunicación efectiva en contexto, aplicando metodologías de trabajo de campo y análisis sociolingüístico bajo normas gramaticales del quechua boliviano y principios de responsabilidad social en el sistema económico actual.",
    "contenidoTema": "SOCIOLINGÜÍSTICA",
    "objetivoSesion": "Demuestra competencias comunicativas básicas y conciencia sociolingüística para presentarse profesionalmente e interactuar en contextos interculturales, utilizando derivaciones verbales y sufijos reflexivos.",
    "logrosEsperados": "1. Deriva sustantivos a partir de raíces verbales para definir roles e instrumentos.\n2. Expresa acciones reflexivas y recíprocas correctamente.\n3. Realiza presentaciones personales y gestión de datos con fluidez cultural.",
    "indicadoresLogro": "1. Transforma verbos en sustantivos usando -q, -na, -sqa con precisión.\n2. Aplica el sufijo reflexivo -ku para describir procesos de autogestión.\n3. Intercambia información personal siguiendo los protocolos andinos de cortesía.",
    "saberConceptual": "- Sufijos verbales nominales\n- Sufijos verbales reflexivos\n- Información personal\n- Presentación personal",
    "saberProcedimental": "- Transformación de verbos en sustantivos (agente, instrumento, resultado).\n- Uso de -q, -na, -sqa.\n- Indicación de acciones realizadas sobre uno mismo (-ku).\n- Expresión de reciprocidad.\n- Intercambio de datos básicos (nombre, edad, origen).\n- Llenado de formularios simples.\n- Exposición coherente de quién es y qué hace el estudiante.\n- Uso de entonación y gestualidad adecuada.",
    "saberActitudinal": "- Creatividad lingüística.\n- Abstracción de acciones en conceptos.\n- Introspección en el lenguaje.\n- Valoración de la acción recíproca.\n- Cordialidad al conocer a otros.\n- Confidencialidad en el manejo de datos.",
    "estrategiaEnsenanza": "- Aprendizaje Basado en Proyectos (ABP): \"Mi identidad profesional en quechua\". \n- Técnica de Demostración: Modelado de presentaciones personales. \n- Role-playing situacional: Simulaciones de intercambio de datos.",
    "estrategiaAprendizaje": "- Diario Reflexivo: Registro de sus roles profesionales usando sufijos nominales. \n- Entrevista Cruzada: Práctica de intercambio de información personal. \n- Análisis de caso: Estructuración de su perfil profesional.",
    "recursosEnsenanza": "- Formularios bilingües\n- Tarjetas de presentación profesional\n- Grabadora para análisis de presentación personal",
    "evaluacionFormativaActividad": "\"El mercado de roles\" (identificarse por su función usando -q).",
    "evaluacionFormativaInstrumento": "Guía de observación cualitativa.",
    "evaluacionFormativaEvidencia": "Esquemas de transformación de verbos a sustantivos.",
    "evaluacionSumativaActividad": "Examen escrito",
    "evaluacionSumativaInstrumento": "Prueba objetiva",
    "evaluacionSumativaEvidencia": "Examen resuelto",
    "momentos": [
      {
        "tipoMomento": "INTRODUCCION",
        "nombreMomento": "1. INTRODUCCIÓN",
        "actividadesDocente": "Activación: ¿Por qué la identidad profesional es un \"activo\"? Reflexión sobre la importancia de la presentación personal y la autogestión en el mercado laboral andino.",
        "duracionMin": 45
      },
      {
        "tipoMomento": "RESULTADOS_LOGROS",
        "nombreMomento": "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS",
        "actividadesDocente": "Demuestra competencias comunicativas básicas y conciencia sociolingüística para presentarse profesionalmente e interactuar en contextos interculturales.\nLogros: \n1. Deriva sustantivos a partir de raíces verbales para definir roles e instrumentos. \n2. Expresa acciones reflexivas y recíprocas correctamente. \n3. Realiza presentaciones personales y gestión de datos con fluidez cultural.",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CONTENIDOS",
        "nombreMomento": "3. CONTENIDOS DE LA CLASE",
        "actividadesDocente": "Sufijos verbales nominales\nSufijos verbales reflexivos\nInformación personal\nPresentación personal",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CUERPO",
        "nombreMomento": "4. CUERPO DE CONTENIDOS",
        "actividadesDocente": "1. Sufijos Verbales Nominales: Se enseña la transformación de una acción en un sustantivo o adjetivo, técnica clave para definir roles y herramientas: -q (Agente): Designa al ejecutor (ej. tusuq - bailarín, qillqaq - escritor/secretario). -na (Instrumento): Designa el medio para realizar la acción (ej. takana - martillo/instrumento para golpear). -sqa (Resultado/Pasado): Designa lo obtenido (ej. ruraskasqa - lo hecho/producto final).\n2. Sufijos Verbales Reflexivos: El sufijo -ku: Se analiza como el marcador de \"acción sobre uno mismo\" y \"autogestión\". Reciprocidad: Se enseña cómo el sufijo verbal reflexivo implica también una acción compartida, reforzando el concepto de Ayni (reciprocidad) en la organización económica.\n3. Información y Presentación Personal: Información Personal: Intercambio técnico de datos: origen (maymanta kani), edad y funciones. Presentación Profesional: Estructura de un pitch profesional. Se integra el uso de los sufijos derivados para explicar: \"Soy estudiante (agente -q), mi herramienta de trabajo es (instrumento -na), y este es el resultado de mi gestión (resultado -sqa)\".",
        "duracionMin": 360
      },
      {
        "tipoMomento": "CONCLUSION",
        "nombreMomento": "5. CONCLUSIÓN O CIERRE",
        "actividadesDocente": "Actividad Técnica: \"Presentación del Perfil Profesional ante un Auditorio\". Cada estudiante realiza una presentación breve (3-5 min) describiéndose a sí mismo, su origen, su rol profesional y sus objetivos.\nInstrumento: Rúbrica de desempeño comunicativo intercultural.\nCriterios: Precisión en sufijos nominales (30%), Uso de reflexivos (20%), Claridad en datos personales (25%), Lenguaje no verbal y respeto a la audiencia (25%).\nEvidencia: Video-presentación profesional y formulario de perfil socioeconómico redactado íntegramente en quechua.",
        "duracionMin": 135
      }
    ]
  },
  {
    "nombreHoja": "UA-2 Tema 6",
    "nombreDocente": "Harold Iriarte Rojas",
    "fecha": "09/02/2026",
    "nombreAsignatura": "Taller de idiomas",
    "carrera": "FACEFA - Complementarias",
    "unidadTitulo": "LENGUA ORIGINARIA",
    "elementoCompetencia": "Produce mensajes y estructuras oracionales complejas en lengua quechua mediante el uso correcto de la morfología nominal, verbal y la sintaxis, para establecer una comunicación efectiva en contexto, aplicando metodologías de trabajo de campo y análisis sociolingüístico bajo normas gramaticales del quechua boliviano y principios de responsabilidad social en el sistema económico actual.",
    "contenidoTema": "ANÁLISIS DE LOS ASPECTOS JURÍDICOS Y EDUCATIVOS",
    "objetivoSesion": "Aplica el marco normativo y educativo vigente para integrar el quechua como herramienta de inclusión y derecho cultural en el ejercicio de su profesión.",
    "logrosEsperados": "1. Reconoce la importancia del estatus legal de la lengua quechua.\n2. Adapta registros lingüísticos según contextos socioeconómicos.\n3. Integra saberes ancestrales en propuestas de desarrollo profesional ético.",
    "indicadoresLogro": "1. Analiza el impacto de la Ley de Derechos y Políticas Lingüísticas en el sistema financiero y educativo.\n2. Identifica variaciones dialectales y de registro (formal/informal) en simulaciones de mercado y oficina.\n3, Sustenta la pertinencia de la interculturalidad en un proyecto de emprendimiento regional.",
    "saberConceptual": "- Lengua en contexto\n- Lengua y cultura",
    "saberProcedimental": "- Adaptación del habla según el lugar (mercado, oficina, hogar).\n- Identificación de registros lingüísticos.\n- Integración de todos los conocimientos en un proyecto final.\n- Reflexión sobre el papel de la lengua en la profesión.",
    "saberActitudinal": "- Flexibilidad comunicativa.\n- Respeto por las variantes situacionales.\n- Identidad cultural fortalecida.\n- Compromiso profesional bilingüe.",
    "estrategiaEnsenanza": "- Aprendizaje Basado en el Análisis Normativo: Estudio de la Constitución y la Ley de Lenguas. \n- Seminario de Reflexión: Debate sobre la brecha entre la ley y la práctica. \n- Taller de integración: Tutoría para el proyecto final.",
    "estrategiaAprendizaje": "- Mapeo de Contextos: Análisis de cuándo y cómo usar la lengua en escenarios reales. \n- Redacción Técnica: Elaboración de un informe sobre el derecho al acceso a la información bilingüe.",
    "recursosEnsenanza": "- Constitución Política del Estado\n- Leyes de educación y lingüística vigentes\n- Glosarios técnicos especializados\n- Videos de prácticas interculturales",
    "evaluacionFormativaActividad": "Debate: \"¿El bilingüismo es un gasto o una inversión?\"",
    "evaluacionFormativaInstrumento": "Escala de actitud.",
    "evaluacionFormativaEvidencia": "Ensayo reflexivo sobre el rol del economista frente a los derechos lingüísticos.",
    "evaluacionSumativaActividad": "Examen escrito",
    "evaluacionSumativaInstrumento": "Prueba objetiva",
    "evaluacionSumativaEvidencia": "Examen resuelto",
    "momentos": [
      {
        "tipoMomento": "INTRODUCCION",
        "nombreMomento": "1. INTRODUCCIÓN",
        "actividadesDocente": "Activación: Análisis de un caso real: \"La barrera lingüística en el acceso a servicios financieros\". Debate sobre la brecha entre el derecho constitucional y la realidad del cliente quechua hablante.",
        "duracionMin": 30
      },
      {
        "tipoMomento": "RESULTADOS_LOGROS",
        "nombreMomento": "2. RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS",
        "actividadesDocente": "Aplica el marco normativo y educativo vigente para integrar el quechua como herramienta de inclusión y derecho cultural en el ejercicio de su profesión.\nLogros:\n1. Reconoce la base legal del uso de lenguas originarias. \n2. Adapta su registro lingüístico según el contexto (público vs. privado). \n3. Integra saberes ancestrales en propuestas de desarrollo profesional.",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CONTENIDOS",
        "nombreMomento": "3. CONTENIDOS DE LA CLASE",
        "actividadesDocente": "Lengua en contexto (Registros, situaciones y espacios) \nLengua y cultura (identidad, derechos y marco legal).",
        "duracionMin": 0
      },
      {
        "tipoMomento": "CUERPO",
        "nombreMomento": "4. CUERPO DE CONTENIDOS",
        "actividadesDocente": "1. Lengua en Contexto (La adecuación profesional): Se enseña la pragmática lingüística aplicada. El estudiante aprende a identificar que el registro (formal, informal, técnico) es un indicador de respeto y profesionalismo. Enfoque económico: En el mercado, se utiliza un registro basado en el Ayni (reciprocidad); en la oficina, se requiere un registro formal basado en la normativa legal. La capacidad de alternar (diglosia funcional) es una habilidad blanda vital.\n2. Lengua y Cultura (El marco jurídico-educativo): Dimensión Jurídica: Análisis de la Constitución Política del Estado Plurinacional de Bolivia y la Ley N° 269. Se discute la obligatoriedad de los servicios bilingües en entidades financieras y públicas para garantizar la equidad. \nDimensión Educativa: El quechua no como una reliquia, sino como un vehículo pedagógico. Se analiza cómo el uso de la lengua materna en la educación financiera aumenta la tasa de comprensión y reduce el riesgo de estafa o sobreendeudamiento en sectores vulnerables.",
        "duracionMin": 180
      },
      {
        "tipoMomento": "CONCLUSION",
        "nombreMomento": "5. CONCLUSIÓN O CIERRE",
        "actividadesDocente": "Actividad: \"Propuesta de Plan de Atención al Cliente Bilingüe\". Los estudiantes entregan un documento técnico (resumen ejecutivo de 3 páginas) que contenga: Fundamentación legal (¿Por qué es obligatorio?); Análisis de contexto (¿En qué registros lingüísticos se comunicará?); Estrategia de implementación (¿Qué materiales o personal bilingüe se requiere?).\nInstrumento: Rúbrica de evaluación integral.\nCriterios: Dominio del marco normativo (40%), Pertinencia del registro lingüístico propuesto (30%), Viabilidad técnica del plan (30%).\nEvidencia: Documento final entregado digitalmente y breve defensa oral ante el \"directorio\" (docente y pares).",
        "duracionMin": 60
      }
    ]
  }
];
  return JSON.parse(JSON.stringify(CANONICAL_PLANES));
};

window.generateDefaultMatriz7 = function(mKey) {
  const def = (materiasData && materiasData[mKey]) ? materiasData[mKey] : (materiasData ? materiasData['sis213g1'] : null);
  const units = (def && def.unidades) ? def.unidades : [];
  const sessions = [];
  let sNum = 1;
  for (let w = 1; w <= 20; w++) {
    for (let ses = 1; ses <= 2; ses++) {
      if (w === 7 && ses === 2) {
        sessions.push({
          semana: w,
          nroSesion: sNum++,
          unidadTematica: 'EVALUACIÓN PARCIAL',
          contenidoEspecifico: 'Primer Examen Parcial Teórico y Práctico',
          saberConceptual: 'Evaluación de saberes conceptuales',
          saberProcedimental: 'Resolución de problemas técnicos y desarrollo de soluciones',
          saberActitudinal: 'Rigor ético y probidad académica',
          criterioDesempeno: 'Demuestra dominio de los contenidos y competencias evaluadas.',
          instrumentoEvaluacion: 'PRUEBA_ESCRITA'
        });
      } else if (w === 14 && ses === 2) {
        sessions.push({
          semana: w,
          nroSesion: sNum++,
          unidadTematica: 'EVALUACIÓN PARCIAL',
          contenidoEspecifico: 'Segundo Examen Parcial Teórico y Práctico',
          saberConceptual: 'Evaluación de saberes avanzados',
          saberProcedimental: 'Resolución de problemas de alta complejidad',
          saberActitudinal: 'Rigor ético y probidad académica',
          criterioDesempeno: 'Demuestra solvencia en el desarrollo y aplicación de saberes.',
          instrumentoEvaluacion: 'PRUEBA_ESCRITA'
        });
      } else if (w === 20 && ses === 2) {
        sessions.push({
          semana: w,
          nroSesion: sNum++,
          unidadTematica: 'EVALUACIÓN FINAL',
          contenidoEspecifico: 'Examen Final y Sustentación de Proyecto Integrador',
          saberConceptual: 'Integración global de saberes del semestre',
          saberProcedimental: 'Defensa técnica y validación práctica de resultados',
          saberActitudinal: 'Solvencia profesional y responsabilidad',
          criterioDesempeno: 'Alcanza la competencia global establecida en el Programa Analítico.',
          instrumentoEvaluacion: 'RUBRICA'
        });
      } else {
        const uIdx = units.length > 0 ? Math.min(Math.floor((w - 1) / Math.max(1, Math.ceil(20 / units.length))), units.length - 1) : 0;
        const u = units[uIdx] || { titulo: 'Unidad ' + (uIdx + 1) };
        sessions.push({
          semana: w,
          nroSesion: sNum++,
          unidadTematica: 'Unidad ' + (uIdx + 1) + ': ' + (u.titulo || 'Contenidos de la Asignatura'),
          contenidoEspecifico: 'Desarrollo de saberes teórico-prácticos de la Unidad ' + (uIdx + 1),
          saberConceptual: 'Fundamentos teóricos de ' + (u.titulo || 'la temática'),
          saberProcedimental: 'Aplicación guiada en entornos prácticos y resolución de problemas',
          saberActitudinal: 'Participación activa, pensamiento crítico y trabajo en equipo',
          criterioDesempeno: 'Aplica los procedimientos técnicos en el entorno de aprendizaje.',
          instrumentoEvaluacion: 'RUBRICA'
        });
      }
    }
  }
  return sessions;
};




// ── DYNAMIC PAC ELEMENTOS DE COMPETENCIA ENGINE ─────────────────────────────
let activePacElementosCompetencia = [];

window.renderPacElementosCompetencia = function() {
  const container = document.getElementById('pac-elementos-competencia-container');
  if (!container) return;

  if (!activePacElementosCompetencia || activePacElementosCompetencia.length === 0) {
    const defData = materiasData[activeMateriaKey] || materiasData['sis213g1'];
    if (defData && defData.elementosCompetencia && defData.elementosCompetencia.length > 0) {
      activePacElementosCompetencia = [...defData.elementosCompetencia];
    } else {
      const defCount = (activeAnaliticoUnidades && activeAnaliticoUnidades.length > 0) ? activeAnaliticoUnidades.length : 2;
      activePacElementosCompetencia = [];
      for (let i = 0; i < defCount; i++) {
        activePacElementosCompetencia.push('');
      }
    }
  }

  container.innerHTML = '';
  activePacElementosCompetencia.forEach((elemText, idx) => {
    const num = idx + 1;
    const unitTitle = (activeAnaliticoUnidades && activeAnaliticoUnidades[idx]) ? ': ' + activeAnaliticoUnidades[idx].titulo : '';
    const item = document.createElement('div');
    item.className = 'p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 transition-all';
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <strong class="text-slate-900 dark:text-white flex items-center gap-1.5">
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">Elemento de Competencia ${num} (Unidad ${num}${unitTitle})</span>
        </strong>
        <button type="button" onclick="window.removePacElementoCompetencia(${idx})" class="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer" title="Eliminar este elemento">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
      <textarea id="pac-elem-comp-${num}" rows="1" placeholder="Elemento de Competencia ${num}..." 
        oninput="window.autoResizeTextarea(this); window.updatePacElementoCompetencia(${idx}, this.value)" 
        class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-brand-500 text-xs leading-relaxed overflow-hidden resize-none">${elemText || ''}</textarea>
    `;
    container.appendChild(item);
  });

  setTimeout(() => {
    if (typeof window.autoResizeAllTextareas === 'function') {
      window.autoResizeAllTextareas();
    }
  }, 10);

  if (window.lucide) window.lucide.createIcons();
};


window.addPacElementoCompetencia = function() {
  if (!activePacElementosCompetencia) activePacElementosCompetencia = [];
  activePacElementosCompetencia.push('');
  window.renderPacElementosCompetencia();
  if (typeof window.scheduleAutoSave === 'function') window.scheduleAutoSave(500);
};

window.removePacElementoCompetencia = function(idx) {
  if (!activePacElementosCompetencia || activePacElementosCompetencia.length <= 1) {
    activePacElementosCompetencia = [''];
  } else {
    activePacElementosCompetencia.splice(idx, 1);
  }
  window.renderPacElementosCompetencia();
  if (typeof window.scheduleAutoSave === 'function') window.scheduleAutoSave(500);
};

window.updatePacElementoCompetencia = function(idx, val) {
  if (activePacElementosCompetencia && activePacElementosCompetencia[idx] !== undefined) {
    activePacElementosCompetencia[idx] = val;
    if (typeof window.scheduleAutoSave === 'function') window.scheduleAutoSave();
  }
};




function cleanText(str) {
  if (!str) return '';
  return String(str)
    .replace(/_x0093_/g, '"')
    .replace(/_x0094_/g, '"')
    .replace(/_x0092_/g, "'")
    .replace(/_x0091_/g, "'")
    .replace(/_x0096_/g, '-')
    .replace(/_x0097_/g, '-')
    .replace(/[\u0093]/g, '"')
    .replace(/[\u0094]/g, '"')
    .replace(/[\u0092]/g, "'")
    .replace(/[\u0091]/g, "'")
    .replace(/[\u0096]/g, '-')
    .replace(/[\u0097]/g, '-')
    .replace(/[\u007F-\u009F]/g, '')
    .trim();
}

function escapeHtml(str) {
  if (!str) return '';
  const cleaned = cleanText(str);
  return String(cleaned).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}



// 2. Real Word (.docx) Import for Programa Analitico
window.importProgramaDocx = function() {
  window.triggerFileUpload('.docx', async (file) => {
    window.showToast('⏳ Subiendo y procesando Word: ' + file.name + '...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', String(activeAsignacionId || 1));
    try {
      const resp = await fetch('/api/v1/office/import/programa-analitico', {
        method: 'POST',
        headers: window.getAuthHeaders(),
        body: formData
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      const data = json.data || json;
      activeProgramaData = data;
      localStorage.setItem('sisa_saved_programa_analitico_' + activeMateriaKey, JSON.stringify(data));

      
      // Switch tab first so target DOM elements are active
      window.switchDocMainTab('tab-analitico');

      if (data.codigoAsignatura !== undefined && data.codigoAsignatura !== null) {
        const el = document.getElementById('analitico-codigo-input');
        if (el) el.value = data.codigoAsignatura;
      }
      if (data.semestre !== undefined && data.semestre !== null) {
        const el = document.getElementById('analitico-semestre-input');
        if (el) el.value = data.semestre;
      }
      if (data.nombreAsignatura !== undefined && data.nombreAsignatura !== null) {
        const el = document.getElementById('analitico-asig-input');
        if (el) el.value = data.nombreAsignatura;
      }
      if (data.creditos !== undefined && data.creditos !== null) {
        const el = document.getElementById('analitico-creditos-input');
        if (el) el.value = data.creditos;
      }
      if (data.horasTeoricas !== undefined && data.horasTeoricas !== null) {
        const el = document.getElementById('analitico-ht-input');
        if (el) el.value = data.horasTeoricas + ' Horas';
      }
      if (data.horasPracticas !== undefined && data.horasPracticas !== null) {
        const el = document.getElementById('analitico-hp-input');
        if (el) el.value = data.horasPracticas + ' Horas';
      }
      if (data.horasSemestre !== undefined && data.horasSemestre !== null) {
        const el = document.getElementById('analitico-hs-input');
        if (el) el.value = data.horasSemestre + ' Horas';
      }
      if (data.macroCompetencia !== undefined && data.macroCompetencia !== null) {
        const el = document.getElementById('programa-macrocompetencia');
        if (el) el.value = data.macroCompetencia;
      }
      if (data.caracterizacion !== undefined && data.caracterizacion !== null) {
        const el = document.getElementById('programa-caracterizacion');
        if (el) el.value = data.caracterizacion;
      }
      if (data.sistemaEvaluacion !== undefined && data.sistemaEvaluacion !== null) {
        const el = document.getElementById('programa-sistema-evaluacion');
        if (el) el.value = data.sistemaEvaluacion;
      }

      if (data.unidades && data.unidades.length > 0) {
        activeAnaliticoUnidades = data.unidades.map((u, i) => {
          let temas = u.temas;
          if (!temas || temas.length === 0) {
            temas = [
              {
                numeroTema: 1,
                titulo: 'Tema 1: ' + (u.titulo || 'Contenidos'),
                contenido: u.saberesConceptuales || ''
              }
            ];
          }
          return {
            numeroUnidad: u.numeroUnidad || (i + 1),
            titulo: u.titulo || ('Unidad ' + (i + 1)),
            horasAcademicas: u.horasAcademicas || 20,
            temas: temas
          };
        });
      } else {
        activeAnaliticoUnidades = [];
      }
      window.renderAnaliticoUnidades();

      // Cleanly replace bibliografía with imported data
      window.renderAnaliticoBibliografia(data.bibliografia || []);

      // Auto-generate PAC Elementos de Competencia matching the imported learning units
      if (activeAnaliticoUnidades && activeAnaliticoUnidades.length > 0) {
        activePacElementosCompetencia = activeAnaliticoUnidades.map((u, i) => {
          if (activePacElementosCompetencia && activePacElementosCompetencia[i] && activePacElementosCompetencia[i].trim().length > 0) {
            return activePacElementosCompetencia[i];
          }
          return 'Aplica los conceptos, procedimientos y metodologías de ' + (u.titulo || ('la Unidad ' + (i + 1))) + ' en la resolución de problemas de la disciplina.';
        });
        if (typeof window.renderPacElementosCompetencia === 'function') {
          window.renderPacElementosCompetencia();
        }
      }

      // Update banner & breadcrumb immediately with imported course identity
      if (data.codigoAsignatura && data.nombreAsignatura) {
        const bTitle = document.getElementById('banner-materia-title');
        if (bTitle) bTitle.textContent = `${data.codigoAsignatura} • ${data.nombreAsignatura}`;
        const crumb = document.getElementById('docente-breadcrumb');
        if (crumb) crumb.textContent = `${data.codigoAsignatura} ${data.nombreAsignatura}`;
      }

      // Auto-save freshly imported data to database & localStorage
      await window.saveCurrentDocenteData(true);

      const totalTemas = activeAnaliticoUnidades.reduce((acc, u) => acc + (u.temas ? u.temas.length : 0), 0);
      window.showToast('✅ ¡Programa Analítico importado! (' + activeAnaliticoUnidades.length + ' unidades y ' + totalTemas + ' temas articulados con el PAC)');

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      window.showToast('❌ Error al importar Programa Analítico: ' + err.message);
    }
  });
};



// Helper to populate PAC Pedagógico Oficial in the DOM
window.populatePacDom = function(data) {


  if (!data) return;
  const setVal = (id, val, placeholderFallback) => {
    let el = document.getElementById(id);
    if (!el && placeholderFallback) {
      el = document.querySelector(placeholderFallback);
    }
    if (el) {
      el.value = (val !== undefined && val !== null) ? cleanText(val) : '';
    }
  };

  // 1.- Identificación
  setVal('pac-carrera-input', data.carrera || 'FACEFA (ADMINISTRACIÓN / AUDITORÍA)');
  setVal('pac-asig-input', data.nombreAsignatura || 'TALLER DE IDIOMAS');
  setVal('pac-codigo-input', data.codigoAsignatura || 'ICEC23');
  setVal('pac-tipo-curso', data.tipoCurso || 'Obligatorio');
  setVal('pac-modalidad', data.modalidad || 'Presencial');
  setVal('pac-semestre-input', data.semestre || '4°');
  setVal('pac-prerequisito', data.preRequisito || 'Ninguno');
  setVal('pac-creditos', data.creditos || '8.0');
  setVal('pac-sesiones-sem', data.sesionesSemanales ? data.sesionesSemanales + ' Sesiones (4 Horas)' : '2 Sesiones (4 Horas)');
  setVal('pac-horas-tp', data.horasTeoricasPracticas || '2T / 4P');

  // 2.- Docente Responsable
  setVal('pac-docente-nombre', data.nombreDocente);
  setVal('pac-docente-email', data.emailDocente);
  setVal('pac-docente-formacion', data.formacionDocente);
  setVal('pac-docente-telefono', data.telefonoDocente);

  // 3 & 4.- Justificación & Propósito General
  setVal('pac-justificacion-input', data.justificacion);
  setVal('pac-proposito-input', data.propositoGeneral);

  // 5 & 6.- Competencias & Elementos
  setVal('pac-competencia-global', data.competenciaGlobal);
  setVal('pac-unidad-competencia', data.unidadCompetencia);

  if (data.elementosCompetencia && Array.isArray(data.elementosCompetencia) && data.elementosCompetencia.length > 0) {
    activePacElementosCompetencia = data.elementosCompetencia.map(e => cleanText(e));
  } else {
    const list = [];
    if (data.elementoCompetencia1) list.push(cleanText(data.elementoCompetencia1));
    if (data.elementoCompetencia2) list.push(cleanText(data.elementoCompetencia2));
    if (list.length > 0) {
      activePacElementosCompetencia = list;
    } else {
      const defData = materiasData[activeMateriaKey] || materiasData['sis213g1'];
      if (defData && defData.elementosCompetencia && defData.elementosCompetencia.length > 0) {
        activePacElementosCompetencia = [...defData.elementosCompetencia];
      } else {
        const count = (activeAnaliticoUnidades && activeAnaliticoUnidades.length > 0) ? activeAnaliticoUnidades.length : 2;
        activePacElementosCompetencia = [];
        for (let i = 0; i < count; i++) activePacElementosCompetencia.push('');
      }
    }
  }
  if (typeof window.renderPacElementosCompetencia === 'function') {
    window.renderPacElementosCompetencia();
  }

  // 8, 9, 12, 14.- Metodología, Evaluación, Normativas

  setVal('pac-metodologia-aula', data.metodologiaAula, 'textarea[placeholder*="Enfoque metodológico"]');
  setVal('pac-sistema-evaluacion', data.sistemaEvaluacion, 'textarea[placeholder*="proceso evaluador"]');
  setVal('pac-normativa-acuerdos', data.normativaCurso, 'textarea[placeholder*="Normativa y acuerdos"]');
  
  // 9.- Ponderaciones Parciales y Final (Selector directo a inputs pts)
  const ptsInputs = document.querySelectorAll('#tab-pac-matrix input[placeholder*="pts"], #tab-pac-matrix .grid-cols-3 input');
  if (ptsInputs.length >= 6) {
    ptsInputs[0].value = data.p1NotaTeorica || '20';
    ptsInputs[1].value = data.p1NotaPractica || '10';
    ptsInputs[2].value = data.p2NotaTeorica || '20';
    ptsInputs[3].value = data.p2NotaPractica || '10';
    ptsInputs[4].value = data.efNotaTeorica || '30';
    ptsInputs[5].value = data.efNotaPractica || '10';
  } else {
    setVal('pac-p1-teorica', data.p1NotaTeorica || '20');
    setVal('pac-p1-practica', data.p1NotaPractica || '10');
    setVal('pac-p2-teorica', data.p2NotaTeorica || '20');
    setVal('pac-p2-practica', data.p2NotaPractica || '10');
    setVal('pac-ef-teorica', data.efNotaTeorica || '30');
    setVal('pac-ef-practica', data.efNotaPractica || '10');
  }

  // 12.- Criterios y Normativa de la Asignatura
  const normArea = document.querySelector('#pac-normativa-acuerdos, #tab-pac-matrix textarea[placeholder*="Normativa y acuerdos"], #tab-pac-matrix textarea[placeholder*="Son acuerdos"]');
  if (normArea) {
    normArea.value = cleanText(data.normativaCurso || '');
  }

  // 14.- Bibliografía Oficial (Específica y Complementaria)
  const bibArea = document.querySelector('#pac-bibliografia-textarea, #tab-pac-matrix textarea[placeholder*="Bibliografía oficial"]');
  if (bibArea) {
    if (data.bibliografiaOficial && data.bibliografiaOficial.trim().length > 0) {
      bibArea.value = cleanText(data.bibliografiaOficial);
    } else if (data.bibliografia && Array.isArray(data.bibliografia) && data.bibliografia.length > 0) {
      bibArea.value = data.bibliografia.map(b => b.citaApa || (b.autor + ' (' + b.anio + '). ' + b.titulo)).join('\n\n');
    }
  }


  // Matriz 7 (Cronograma de 20 Semanas)
  const tbody = document.getElementById('cronograma-table-body');
  if (tbody && data.matriz7 && Array.isArray(data.matriz7) && data.matriz7.length > 0) {
    tbody.innerHTML = '';
    data.matriz7.forEach(s => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50';
      tr.innerHTML = `
        <td class="py-2 px-1 text-center align-top"><input type="text" value="${escapeHtml(String(s.semana || ''))}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-xs"></td>
        <td class="py-2 px-1 text-center align-top"><input type="text" value="${escapeHtml(String(s.nroSesion || ''))}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-brand-600 dark:text-brand-400 text-xs"></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Unidad Temática..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.unidadTematica || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Tema específico..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.contenidoEspecifico || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Conceptual..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberConceptual || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Procedimental..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberProcedimental || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Actitudinal..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberActitudinal || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Criterio de Desempeño..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.criterioDesempeno || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Instrumento..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.instrumentoEvaluacion || 'RUBRICA')}</textarea></td>
      `;
      tbody.appendChild(tr);
    });

    setTimeout(() => {
      if (typeof window.autoResizeAllTextareas === 'function') {
        window.autoResizeAllTextareas();
      }
    }, 20);
  }
};


window.extractCurrentCronogramaFromDom = function() {
  const tbody = document.getElementById('cronograma-table-body');
  if (!tbody) return [];
  const rows = tbody.querySelectorAll('tr');
  const sessions = [];
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input, textarea');
    if (inputs.length >= 9) {
      sessions.push({
        semana: parseInt(inputs[0].value) || 1,
        nroSesion: parseInt(inputs[1].value) || 1,
        unidadTematica: inputs[2].value || '',
        contenidoEspecifico: inputs[3].value || '',
        saberConceptual: inputs[4].value || '',
        saberProcedimental: inputs[5].value || '',
        saberActitudinal: inputs[6].value || '',
        criterioDesempeno: inputs[7].value || '',
        instrumentoEvaluacion: inputs[8].value || 'RUBRICA'
      });
    }
  });
  return sessions;
};

// 3. Real Excel Import for PAC Matriz 7
window.importPacExcel = function(goToCronograma) {
  window.triggerFileUpload('.xlsx', async (file) => {
    window.showToast('⏳ Subiendo y procesando PAC Excel: ' + file.name + '...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', String(activeAsignacionId || 1));
    try {
      const resp = await fetch('/api/v1/office/import/pac', {
        method: 'POST',
        headers: window.getAuthHeaders(),
        body: formData
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      const data = json.data || json;
      activePacData = data;
      localStorage.setItem('sisa_saved_pac_' + activeMateriaKey, JSON.stringify(data));

      window.populatePacDom(data);

      // Auto-save this freshly imported state to database & localStorage
      await window.saveCurrentDocenteData(true);

      // Auto-expand all textareas
      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') {
          window.autoResizeAllTextareas();
        }
      }, 50);

      const sesCount = (data.matriz7 && Array.isArray(data.matriz7)) ? data.matriz7.length : 0;
      if (goToCronograma || activeTabId === 'tab-cronograma-semanas') {
        window.showToast('✅ ¡Cronograma importado con éxito! (' + sesCount + ' sesiones cargadas en la Matriz 7)');
        window.switchDocMainTab('tab-cronograma-semanas');
      } else {
        window.showToast('✅ ¡PAC Pedagógico y Cronograma importados con éxito! (' + sesCount + ' sesiones)');
        window.switchDocMainTab('tab-pac-matrix');
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      window.showToast('❌ Error al importar PAC: ' + err.message);
    }
  });
};




// 4. Real Excel Import for Planes de Clase
window.importPlanesExcel = function() {
  window.triggerFileUpload('.xlsx', async (file) => {
    window.showToast('⏳ Subiendo y procesando Planes de Clase: ' + file.name + '...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', String(activeAsignacionId || 1));
    try {
      const resp = await fetch('/api/v1/office/import/plan-clase', {
        method: 'POST',
        headers: window.getAuthHeaders(),
        body: formData
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      const data = json.data || json;
      activePlanesList = Array.isArray(data) ? data : [data];
      activePlanSheetIndex = 0;
      localStorage.setItem('sisa_saved_planes_' + activeMateriaKey, JSON.stringify(activePlanesList));

      if (typeof window.renderPlanesSheetsTabs === 'function') {
        window.renderPlanesSheetsTabs();
      }
      if (typeof window.renderPlanSheetForm === 'function') {
        window.renderPlanSheetForm(0);
      }

      // Auto-save this freshly imported state to database & localStorage
      if (typeof window.saveCurrentDocenteData === 'function') {
        await window.saveCurrentDocenteData(true);
      }

      window.showToast('✅ ¡Planes de Clase importados con éxito! (' + activePlanesList.length + ' temas/hojas cargadas)');
      window.switchDocMainTab('tab-cronograma-planes');
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      window.showToast('❌ Error al importar Planes de Clase: ' + err.message);
    }
  });
};



// 5. Real Export Endpoints
window.exportDocxOfficial = async function() {
  window.showToast('📥 Generando y descargando Programa Analítico (.docx)...');
  window.location.href = '/api/v1/office/export/programa-analitico/1';
};

window.exportPacOfficial = async function() {
  window.showToast('📥 Generando y descargando PAC + Cronograma (.xlsx)...');
  window.location.href = '/api/v1/office/export/pac/1';
};

window.exportPlanesOfficial = async function() {
  window.showToast('📥 Generando y descargando Plan de Clases (.xlsx)...');
  window.location.href = '/api/v1/office/export/plan-clase/1';
};

// Override triggerAutoCapture modal with real actions
window.triggerAutoCapture = function() {
  const modalBody = `
    <div class="space-y-4 text-xs">
      <p class="text-slate-700 dark:text-slate-300">Selecciona el documento base que deseas importar para extraer su información:</p>
      <div class="grid grid-cols-3 gap-3">
        <div onclick="window.closeModal(); window.switchDocMainTab('tab-analitico'); window.importProgramaDocx();" class="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 hover:border-blue-500 cursor-pointer text-center space-y-2 transition-all">
          <i data-lucide="file-text" class="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400"></i>
          <div class="font-bold text-slate-900 dark:text-white">Programa Analítico (.docx)</div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400">Extrae Unidades y Bibliografía APA</div>
        </div>
        <div onclick="window.closeModal(); window.switchDocMainTab('tab-pac-matrix'); window.importPacExcel();" class="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 hover:border-emerald-500 cursor-pointer text-center space-y-2 transition-all">
          <i data-lucide="file-spreadsheet" class="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400"></i>
          <div class="font-bold text-slate-900 dark:text-white">PAC + Cronograma (.xlsx)</div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400">Extrae las 42+ sesiones a la matriz</div>
        </div>
        <div onclick="window.closeModal(); window.switchDocMainTab('tab-cronograma-planes'); window.importPlanesExcel();" class="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 hover:border-purple-500 cursor-pointer text-center space-y-2 transition-all">
          <i data-lucide="calendar-range" class="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400"></i>
          <div class="font-bold text-slate-900 dark:text-white">Planes de Clase (.xlsx)</div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400">Extrae momentos didácticos y tiempos</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-title').innerText = 'Subir y Extraer Datos de los Documentos Base';
  document.getElementById('modal-body').innerHTML = modalBody;
  document.getElementById('modal-footer').classList.add('hidden');
  document.getElementById('modal-container').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
};

// Global interceptor for all "Guardar" buttons


// Global interceptor for all "Guardar" buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn && (btn.textContent.trim().includes('Guardar') || btn.querySelector('[data-lucide="save"]'))) {
    if (typeof window.saveCurrentDocenteData === 'function') {
      e.preventDefault();
      e.stopPropagation();
      window.saveCurrentDocenteData();
    }
  }
}, true);
// Global reactive auto-save trigger on any typing or value changes
document.addEventListener('input', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
    if (e.target.tagName === 'TEXTAREA' && typeof window.autoResizeTextarea === 'function') {
      window.autoResizeTextarea(e.target);
    }
    if (typeof window.scheduleAutoSave === 'function') {
      window.scheduleAutoSave(1200);
    }
  }
}, true);

document.addEventListener('change', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
    if (e.target.tagName === 'TEXTAREA' && typeof window.autoResizeTextarea === 'function') {
      window.autoResizeTextarea(e.target);
    }
    if (typeof window.scheduleAutoSave === 'function') {
      window.scheduleAutoSave(500);
    }
  }
}, true);

// ── UNITEPC SEA GATEWAY INTEGRATION & REACTIVE BADGE CONTROLLER ──────────────
(function() {
  let currentSeaStatus = 'online';

  window.getSeaGatewayStatus = function() {
    return currentSeaStatus;
  };

  window.updateSeaGatewayStatus = function(status) {
    if (status !== 'online' && status !== 'offline' && status !== 'sync') {
      status = 'online';
    }
    currentSeaStatus = status;

    // 1. Top prototype header badge
    const headerBadge = document.getElementById('sea-status-badge');
    const headerDot = document.getElementById('sea-status-dot');
    const headerText = document.getElementById('sea-status-text');

    if (headerBadge && headerDot && headerText) {
      headerBadge.className = 'text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium transition-all duration-300 ';
      headerDot.className = 'w-1.5 h-1.5 rounded-full ';

      if (status === 'online') {
        headerBadge.className += 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        headerDot.className += 'bg-emerald-400 animate-pulse';
        headerText.innerText = 'SEA Live';
      } else if (status === 'offline') {
        headerBadge.className += 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse ring-2 ring-rose-500/20';
        headerDot.className += 'bg-rose-400 animate-ping';
        headerText.innerText = 'SEA Offline';
      } else if (status === 'sync') {
        headerBadge.className += 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        headerDot.className += 'bg-amber-400 animate-pulse';
        headerText.innerText = 'SEA Sync...';
      }
    }

    // 2. Sidebar header badge
    const sidebarBadge = document.getElementById('sidebar-sea-badge');
    const sidebarDot = document.getElementById('sidebar-sea-dot');
    const sidebarText = document.getElementById('sidebar-sea-text');

    if (sidebarBadge && sidebarDot && sidebarText) {
      sidebarBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ';
      sidebarDot.className = 'w-1.5 h-1.5 rounded-full ';

      if (status === 'online') {
        sidebarBadge.className += 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
        sidebarDot.className += 'bg-emerald-500 animate-pulse';
        sidebarText.innerText = 'Live';
      } else if (status === 'offline') {
        sidebarBadge.className += 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 animate-pulse';
        sidebarDot.className += 'bg-rose-500 animate-ping';
        sidebarText.innerText = 'Offline';
      } else if (status === 'sync') {
        sidebarBadge.className += 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
        sidebarDot.className += 'bg-amber-500 animate-pulse';
        sidebarText.innerText = 'Sync';
      }
    }
  };

  window.toggleSeaGatewaySimulation = function() {
    const next = (currentSeaStatus === 'online') ? 'offline' : 'online';
    window.updateSeaGatewayStatus(next);
    if (typeof window.showToast === 'function') {
      window.showToast(next === 'online'
        ? '🟢 SEA Gateway: Conectado (UNITEPC Live)'
        : '🔴 SEA Gateway: Desconectado (Modo Fallback Offline Activo)');
    }
  };

  window.checkSeaGatewayHealth = function() {
    fetch('/api/v1/catalogo-academico/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.status) {
          window.updateSeaGatewayStatus(data.status);
        }
      })
      .catch(() => {
        if (!navigator.onLine) {
          window.updateSeaGatewayStatus('offline');
        }
      });
  };

  // Listen to browser network online/offline events
  window.addEventListener('online', () => {
    window.updateSeaGatewayStatus('online');
    if (typeof window.showToast === 'function') {
      window.showToast('🟢 Red reestablecida: SEA Gateway Live');
    }
  });

  window.addEventListener('offline', () => {
    window.updateSeaGatewayStatus('offline');
    if (typeof window.showToast === 'function') {
      window.showToast('🔴 Sin conexión de red: Activando modo Local Mirroring');
    }
  });

  // ── 100% API DOCENTE ENGINE & DYNAMIC WORKSPACE SYNC ────────────────────────
  window.__API_DOCENTES__ = [];
  window.__ACTIVE_DOCENTE__ = null;

  window.loadDocentesFromApi = async function() {
    try {
      const res = await fetch('/api/v1/catalogo-academico/docentes?branchOfficeId=ea4fb26e-11a9-452f-9bae-4962de2dd931');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const docentes = await res.json();
      window.__API_DOCENTES__ = Array.isArray(docentes) ? docentes : [];

      const selector = document.getElementById('docente-api-selector');
      if (selector) {
        selector.innerHTML = '';

        // Exclusively 4 real Cochabamba teachers from official SEA Gateway
        const targetDocentes = [
          { ci: '3065087', tag: '💻 [INGENIERÍA]', label: 'ROSMERY LUIZAGA SALINAS' },
          { ci: '6600808', tag: '💻 [SISTEMAS]', label: 'WALTER JOSE CAZAS CASTRO' },
          { ci: '4421998', tag: '🩺 [MEDICINA]', label: 'MARTIN XAVIER SANCHEZ FLORES' },
          { ci: '7906983', tag: '📊 [FACEFA]', label: 'RUBEN SERGIO VELASQUEZ ADRIAZOLA' }
        ];

        const featuredGroup = document.createElement('optgroup');
        featuredGroup.label = '🏛️ DOCENTES OFICIALES SEA - SEDE COCHABAMBA';

        targetDocentes.forEach(target => {
          const d = window.__API_DOCENTES__.find(doc => doc.ci === target.ci);
          const opt = document.createElement('option');
          opt.value = target.ci;
          const name = d ? d.nombreCompleto : target.label;
          opt.textContent = `${target.tag} ${name} (${target.ci})`;
          featuredGroup.appendChild(opt);
        });

        selector.appendChild(featuredGroup);

        // Clean any existing onchange property to avoid Zone.js collision
        selector.onchange = null;

        // Attach single clean change listener calling selectDocenteFromApi directly
        selector.addEventListener('change', function() {
          const ci = this.value;
          if (typeof window.selectDocenteFromApi === 'function') {
            window.selectDocenteFromApi(ci, false);
          }
        });

        const savedCi = localStorage.getItem('sisa_active_docente_ci');
        const defaultCi = (savedCi && targetDocentes.some(t => String(t.ci) === String(savedCi))) ? savedCi : '3065087';
        selector.value = defaultCi;
        window.selectDocenteFromApi(defaultCi, true);
      }
    } catch (err) {
      console.warn('Could not load docentes from API:', err);
    }
  };

  window.onDocenteSelectorChange = function(ci) {
    if (typeof window.selectDocenteFromApi === 'function') {
      window.selectDocenteFromApi(ci, false);
    }
  };

  window.selectDocenteFromApi = async function(ci, silent = false) {
    if (!ci) return;
    const cleanCi = String(ci).trim();
    localStorage.setItem('sisa_active_docente_ci', cleanCi);
    let docente = (window.__API_DOCENTES__ || []).find(d => String(d.ci).trim() === cleanCi);

    // 1. Instant Cache Check (0ms render on reload or switch, eliminates mock flash)
    const cachedDataStr = localStorage.getItem('sisa_cache_doc_' + cleanCi);
    if (cachedDataStr) {
      try {
        const cached = JSON.parse(cachedDataStr);
        if (cached && cached.docente && cached.groups && cached.groups.length > 0) {
          window.__ACTIVE_DOCENTE__ = cached.docente;
          document.querySelectorAll('.docente-nombre-label').forEach(el => { el.textContent = cached.docente.nombreCompleto; });
          document.querySelectorAll('.docente-email-label').forEach(el => { el.textContent = cached.docente.email; });
          document.querySelectorAll('.docente-ci-label').forEach(el => { el.textContent = cached.docente.ci; });
          window.renderDynamicSidebarForDocente(cached.docente, cached.courses || [], cached.groups);
        }
      } catch (e) {}
    }

    // 2. Background fresh fetch from SEA Gateway
    try {
      const [coursesRes, groupsRes] = await Promise.all([
        fetch(`/api/v1/catalogo-academico/docentes/${cleanCi}/materias`),
        fetch(`/api/v1/catalogo-academico/groups?term=2-2026&branchOfficeId=ea4fb26e-11a9-452f-9bae-4962de2dd931&teacherCi=${cleanCi}`)
      ]);

      const courses = coursesRes.ok ? await coursesRes.json() : [];
      const groups = groupsRes.ok ? await groupsRes.json() : [];
      const activeGroups = (groups && groups.length > 0) ? groups : (docente ? docente.grupos : []);

      if (!docente && activeGroups && activeGroups.length > 0) {
        docente = {
          ci: cleanCi,
          nombreCompleto: activeGroups[0].teacherName,
          email: `${cleanCi}@unitepc.edu.bo`,
          sedeCodigo: 'CBA',
          carreraPrincipal: activeGroups[0].careerCode,
          materiasNombres: [...new Set(activeGroups.map(g => g.courseName))],
          grupos: activeGroups
        };
      } else if (docente) {
        docente.grupos = activeGroups;
        docente.materiasNombres = [...new Set(activeGroups.map(g => g.courseName || g.name))];
      }

      if (!docente) return;
      window.__ACTIVE_DOCENTE__ = docente;

      // Save to instant cache
      localStorage.setItem('sisa_cache_doc_' + cleanCi, JSON.stringify({ docente, courses, groups: activeGroups }));

      // Update teacher headers & labels across DOM
      document.querySelectorAll('.docente-nombre-label').forEach(el => {
        el.textContent = docente.nombreCompleto;
      });
      document.querySelectorAll('.docente-email-label').forEach(el => {
        el.textContent = docente.email;
      });
      document.querySelectorAll('.docente-ci-label').forEach(el => {
        el.textContent = docente.ci;
      });

      // Update inputs with teacher information
      const docenteInputs = ['docente-input', 'caratula-docente', 'pac-docente-input', 'planes-docente-input'];
      docenteInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = docente.nombreCompleto;
      });

      window.renderDynamicSidebarForDocente(docente, courses, activeGroups);

      if (!silent && typeof window.showToast === 'function') {
        window.showToast(`👨‍🏫 Sesión Docente SEA: ${docente.nombreCompleto} (${docente.ci})`);
      }
    } catch (e) {
      console.warn('Error syncing courses for docente:', e);
    }
  };

  // Helper: Carrera name resolution
  window.resolveCarreraInfo = function(code, careerCode) {
    const cUpper = (careerCode || '').toUpperCase();
    const codeUpper = (code || '').toUpperCase();
    if (cUpper.includes('MED') || codeUpper.startsWith('MED') || codeUpper.includes('ANATOM') || codeUpper.includes('GENET') || codeUpper.includes('PEDIAT') || codeUpper.includes('INFORMÁTICA MÉDICA')) {
      return { name: 'Medicina Humana', tag: 'MEDICINA HUMANA', color: 'rose' };
    }
    if (cUpper.includes('ADM') || cUpper.includes('CCP') || cUpper.includes('COM') || cUpper.includes('FAC') || codeUpper.includes('ADMIN') || codeUpper.includes('FINANC') || codeUpper.includes('CONTAB')) {
      return { name: 'FACEFA', tag: 'FACEFA', color: 'emerald' };
    }
    if (cUpper.includes('ELE') || codeUpper.startsWith('ELE')) {
      return { name: 'Ing. Electrónica', tag: 'ING. ELECTRÓNICA', color: 'blue' };
    }
    if (cUpper.includes('SON') || codeUpper.startsWith('SON')) {
      return { name: 'Ing. de Sonido', tag: 'ING. DE SONIDO', color: 'indigo' };
    }
    if (cUpper.includes('IBI') || codeUpper.startsWith('IBI') || cUpper.includes('BIO')) {
      return { name: 'Ing. Biomédica', tag: 'ING. BIOMÉDICA', color: 'cyan' };
    }
    if (cUpper.includes('IND') || codeUpper.startsWith('IND')) {
      return { name: 'Ing. Industrial', tag: 'ING. INDUSTRIAL', color: 'amber' };
    }
    if (cUpper.includes('VET') || codeUpper.startsWith('VET')) {
      return { name: 'Medicina Veterinaria', tag: 'VETERINARIA', color: 'teal' };
    }
    if (cUpper.includes('ENL') || codeUpper.startsWith('ENF')) {
      return { name: 'Lic. en Enfermería', tag: 'ENFERMERÍA', color: 'pink' };
    }
    return { name: 'Ing. de Sistemas', tag: 'ING. DE SISTEMAS', color: 'purple' };
  };

  // Official UNITEPC Curriculum Code Resolver
  window.resolveOfficialCourseCode = function(courseName, careerCodes) {
    const cUpper = (courseName || '').toUpperCase();
    const codes = [];

    (careerCodes || []).forEach(cc => {
      const cCode = (cc || '').toUpperCase();
      if (cCode.includes('SIS')) {
        if (cUpper.includes('PROGRAMACIÓN I') && !cUpper.includes('II') && !cUpper.includes('III')) codes.push('SIS-113');
        else if (cUpper.includes('PROGRAMACIÓN II') && !cUpper.includes('III')) codes.push('SIS-123');
        else if (cUpper.includes('PROGRAMACIÓN III')) codes.push('SIS-213');
        else if (cUpper.includes('INFORMÁTICA FORENSE')) codes.push('SIS-315');
        else if (cUpper.includes('LENGUAJES DE PROGRAMACIÓN')) codes.push('SIS-326');
        else codes.push('SIS-100');
      } else if (cCode.includes('ELE')) {
        if (cUpper.includes('PROGRAMACIÓN I') && !cUpper.includes('II') && !cUpper.includes('III')) codes.push('ELC-113');
        else if (cUpper.includes('PROGRAMACIÓN II') && !cUpper.includes('III')) codes.push('ELC-123');
        else if (cUpper.includes('PROGRAMACIÓN III')) codes.push('ELC-213');
        else codes.push('ELC-100');
      } else if (cCode.includes('SON')) {
        if (cUpper.includes('PROGRAMACIÓN I') && !cUpper.includes('II') && !cUpper.includes('III')) codes.push('SON-113');
        else if (cUpper.includes('PROGRAMACIÓN II') && !cUpper.includes('III')) codes.push('SON-123');
        else if (cUpper.includes('PROGRAMACIÓN III')) codes.push('SON-213');
        else codes.push('SON-100');
      } else if (cCode.includes('IBI') || cCode.includes('BIO')) {
        if (cUpper.includes('INTRODUCCIÓN A LA INFORMÁTICA')) codes.push('IBI-114');
        else if (cUpper.includes('INFORMÁTICA')) codes.push('IBI-124');
        else if (cUpper.includes('PROGRAMACIÓN')) codes.push('IBI-211');
        else codes.push('IBI-100');
      } else if (cCode.includes('MED')) {
        if (cUpper.includes('ANATOMÍA HUMANA I') && !cUpper.includes('II')) codes.push('MED-111');
        else if (cUpper.includes('ANATOMÍA HUMANA II')) codes.push('MED-121');
        else if (cUpper.includes('INFORMÁTICA MÉDICA')) codes.push('MED-226');
        else codes.push('MED-100');
      } else if (cCode.includes('ADM')) {
        if (cUpper.includes('ADMINISTRACIÓN GENERAL')) codes.push('ADM-113');
        else if (cUpper.includes('ADMINISTRACIÓN DE LA PRODUCCIÓN')) codes.push('ADM-322');
        else codes.push('ADM-100');
      } else if (cCode.includes('CCP') || cCode.includes('CPU')) {
        if (cUpper.includes('INFORMÁTICA CONTABLE')) codes.push('CPEC07');
        else if (cUpper.includes('ADMINISTRACIÓN FINANCIERA')) codes.push('CPEC16');
        else codes.push('CPEC10');
      }
    });

    const uniqueCodes = [...new Set(codes)];
    return uniqueCodes.length > 0 ? uniqueCodes.join(' / ') : 'MAT-100';
  };

  window.renderDynamicSidebarForDocente = function(docente, courses, groups) {
    const sidebarContainer = document.getElementById('sidebar-materias-container');
    const cardsGrid = document.getElementById('doc-materia-cards-grid');
    if (!docente) return;

    // Synthesize & GROUP BY MATERIA / ASIGNATURA (Course-Centric)
    let rawList = (groups && groups.length > 0) ? groups : (courses || []);
    if (rawList.length === 0) return;

    // 1. Helper to extract parallel index (e.g. TA-01 -> "01", TA-02 -> "02")
    const getParallelIndex = (grpName) => {
      const m = (grpName || '').match(/\d+/);
      return m ? m[0] : '01';
    };

    // 2. Cluster groups strictly into Common Subject Offerings according to the SEA
    // Two groups belong to the same Subject Card ONLY IF they are a common offering in the SEA:
    // a) They share physical schedule slots across careers (e.g. Sistemas + Electrónica pasan juntos en la mañana)
    // b) Or they are the theory & practice of the same career offering
    // Groups with different schedules (like Sonido in afternoon or Electrónica G2 at night) remain independent cards!
    const nGroups = rawList.length;
    const adj = Array.from({ length: nGroups }, () => new Set());

    for (let i = 0; i < nGroups; i++) {
      for (let j = i + 1; j < nGroups; j++) {
        const g1 = rawList[i];
        const g2 = rawList[j];

        // Condition 1: Shared physical schedule slot (COMMON CLASS in SEA)
        const s1Slots = (g1.schedules || []).filter(s => s.day && s.startTime).map(s => `${s.day}_${s.startTime}_${s.classroom || ''}`);
        const s2Slots = (g2.schedules || []).filter(s => s.day && s.startTime).map(s => `${s.day}_${s.startTime}_${s.classroom || ''}`);
        const hasSharedSlot = s1Slots.some(s => s2Slots.includes(s));

        // Condition 2: Same career, same course, and identical parallel
        const c1Norm = (g1.courseName || g1.name || '').trim().toUpperCase();
        const c2Norm = (g2.courseName || g2.name || '').trim().toUpperCase();
        const sameCareerCourse = (g1.careerCode && g1.careerCode === g2.careerCode && c1Norm === c2Norm);
        const p1 = getParallelIndex(g1.name || g1.code);
        const p2 = getParallelIndex(g2.name || g2.code);

        if (hasSharedSlot) {
          adj[i].add(j);
          adj[j].add(i);
        } else if (sameCareerCourse && p1 === p2) {
          adj[i].add(j);
          adj[j].add(i);
        }
      }
    }

    // Link practice groups to corresponding theory
    for (let i = 0; i < nGroups; i++) {
      const g = rawList[i];
      const cType = (g.classType || '').toUpperCase();
      if (cType.includes('P') || cType.includes('PR') || cType.includes('PL')) {
        const cNorm = (g.courseName || g.name || '').trim().toUpperCase();
        const cCar = g.careerCode;
        const pIdx = getParallelIndex(g.name || g.code);

        let matchingTa = -1;
        for (let j = 0; j < nGroups; j++) {
          const gj = rawList[j];
          const gjType = (gj.classType || '').toUpperCase();
          if ((gjType.startsWith('T') || gjType.includes('TEO')) && gj.careerCode === cCar && (gj.courseName || gj.name || '').trim().toUpperCase() === cNorm) {
            if (getParallelIndex(gj.name || gj.code) === pIdx) {
              matchingTa = j;
              break;
            }
          }
        }
        if (matchingTa !== -1) {
          adj[i].add(matchingTa);
          adj[matchingTa].add(i);
        } else {
          for (let j = 0; j < nGroups; j++) {
            const gj = rawList[j];
            const gjType = (gj.classType || '').toUpperCase();
            if ((gjType.startsWith('T') || gjType.includes('TEO')) && gj.careerCode === cCar && (gj.courseName || gj.name || '').trim().toUpperCase() === cNorm) {
              adj[i].add(j);
              adj[j].add(i);
            }
          }
        }
      }
    }

    // Find Connected Components (The true Academic Subjects / Cards)
    const visited = new Set();
    const commonClusters = [];
    for (let i = 0; i < nGroups; i++) {
      if (!visited.has(i)) {
        const comp = [];
        const queue = [i];
        visited.add(i);
        while (queue.length > 0) {
          const curr = queue.shift();
          comp.push(curr);
          adj[curr].forEach(neighbor => {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          });
        }
        commonClusters.push(comp.map(idx => rawList[idx]));
      }
    }

    const dayMap = {
      'LU': 'Lunes',
      'MA': 'Martes',
      'MI': 'Miércoles',
      'JU': 'Jueves',
      'VI': 'Viernes',
      'SA': 'Sábado',
      'DO': 'Domingo'
    };
    const dayOrder = { 'LU': 1, 'MA': 2, 'MI': 3, 'JU': 4, 'VI': 5, 'SA': 6, 'DO': 7 };

    // 3. Build synthesized items for each true academic offering (Common Subject or Individual)
    let items = commonClusters.map((cluster, idx) => {
      const carrerasArr = [...new Set(cluster.map(g => g.careerCode).filter(Boolean))];
      const isCommon = carrerasArr.length > 1;
      const carrerasResolved = carrerasArr.map(cc => resolveCarreraInfo('', cc));
      const mainCarrera = carrerasResolved[0] || { name: 'Ing. de Sistemas', tag: 'ING. SISTEMAS', color: 'purple' };
      const allCarrerasNames = [...new Set(carrerasResolved.map(cr => cr.name))].join(' • ');
      const allCarrerasTags = isCommon 
        ? `${[...new Set(carrerasResolved.map(cr => cr.tag))].join(' • ')}`
        : [...new Set(carrerasResolved.map(cr => cr.tag))].join(' • ');

      const courseNames = [...new Set(cluster.map(g => g.courseName || g.name).filter(Boolean))];
      const primaryName = courseNames[0] || 'Materia Asignada';
      const displayName = courseNames.join(' / ');

      // Resolve official curriculum codes across associated careers
      const officialCodes = carrerasArr.map(cc => resolveOfficialCourseCode(primaryName, [cc]));
      const officialCode = [...new Set(officialCodes)].join(' / ');

      // Calculate unique physical commissions
      const physCommissionsMap = new Map();
      cluster.forEach(g => {
        const pType = (g.classType || 'TA').toUpperCase();
        const sRepr = (g.schedules || []).map(s => `${s.day}_${s.startTime}_${s.classroom || ''}`).sort().join(';');
        const cKey = `${pType}_${sRepr}`;
        if (!physCommissionsMap.has(cKey)) {
          physCommissionsMap.set(cKey, {
            code: g.code || g.name || 'G1',
            classType: pType,
            schedules: g.schedules || []
          });
        }
      });

      const teoList = Array.from(physCommissionsMap.values()).filter(c => c.classType.startsWith('T') || c.classType.includes('TEO'));
      const pracList = Array.from(physCommissionsMap.values()).filter(c => !c.classType.startsWith('T') && !c.classType.includes('TEO'));
      const totalPhysicalSessions = physCommissionsMap.size;
      const totalHours = totalPhysicalSessions * 4;

      const teoGroupsSet = new Set();
      const pracGroupsSet = new Set();
      cluster.forEach(g => {
        const pName = g.code || g.name || 'G1';
        const cType = (g.classType || 'TA').toUpperCase();
        if (cType.startsWith('T') || cType.includes('TEO')) {
          teoGroupsSet.add(pName);
        } else {
          pracGroupsSet.add(pName);
        }
      });
      const teoCodes = [...teoGroupsSet].sort().join(', ');
      const pracCodes = [...pracGroupsSet].sort().join(', ');
      const allGroupsCodes = [...new Set([...teoGroupsSet, ...pracGroupsSet])].sort().join(', ');
      const totalGroupsInCluster = cluster.length;

      const teoSummary = teoList.length > 0 ? `${teoList.length} Comisió(n): ${teoCodes}` : 'Sin comisiones teóricas';
      const pracSummary = pracList.length > 0 ? `${pracList.length} Comisió(n): ${pracCodes}` : 'Sin comisiones prácticas';

      const campusesSet = new Set();
      const classroomsSet = new Set();
      cluster.forEach(g => {
        if (g.campus) campusesSet.add(g.campus);
        if (g.classroom) classroomsSet.add(g.classroom);
        (g.schedules || []).forEach(s => {
          if (s.campus) campusesSet.add(s.campus);
          if (s.classroom) classroomsSet.add(s.classroom);
        });
      });
      const campusesStr = [...campusesSet].join(', ') || 'Campus Central';
      const classroomsStr = [...classroomsSet].join(', ') || 'Aula / Lab';

      // 1. Group by exact physical time slot (day, start, end, classroom, campus)
      const sharedSlotsMap = new Map();
      cluster.forEach(g => {
        const sList = g.schedules || [];
        const grpName = g.code || g.name || 'G1';
        const grpType = (g.classType || 'TA').toUpperCase();
        const cResolved = g.careerCode ? resolveCarreraInfo('', g.careerCode).name : 'General';

        sList.forEach(s => {
          if (!s.day || !s.startTime) return;
          const k = `${s.day}_${s.startTime}_${s.endTime}_${s.classroom || ''}_${s.campus || ''}`;
          if (!sharedSlotsMap.has(k)) {
            sharedSlotsMap.set(k, {
              day: s.day,
              dayName: dayMap[s.day] || s.day,
              start: s.startTime,
              end: s.endTime,
              classroom: s.classroom || 'Aula',
              campus: s.campus || 'Campus Central',
              careersSet: new Set(),
              groups: []
            });
          }
          sharedSlotsMap.get(k).careersSet.add(cResolved);
          const entry = `${grpName} (${grpType})`;
          if (!sharedSlotsMap.get(k).groups.includes(entry)) {
            sharedSlotsMap.get(k).groups.push(entry);
          }
        });
      });

      // 2. Hierarchical Grouping by (careersTitle, day, campus)
      const hierarchyMap = new Map();
      sharedSlotsMap.forEach(val => {
        const careersTitle = Array.from(val.careersSet).sort().join(' / ');
        const hk = `${careersTitle}___${val.day}___${val.campus}`;
        if (!hierarchyMap.has(hk)) {
          hierarchyMap.set(hk, {
            careersTitle: careersTitle,
            day: val.day,
            dayName: val.dayName,
            campus: val.campus,
            slots: []
          });
        }
        hierarchyMap.get(hk).slots.push({
          start: val.start,
          end: val.end,
          classroom: val.classroom,
          groups: val.groups.join(', ')
        });
      });

      const hierarchicalSchedules = Array.from(hierarchyMap.values()).map(h => {
        h.slots.sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        return h;
      }).sort((a, b) => {
        const da = dayOrder[a.day] || 99;
        const db = dayOrder[b.day] || 99;
        if (da !== db) return da - db;
        return a.careersTitle.localeCompare(b.careersTitle);
      });

      const groupedSchedules = Array.from(sharedSlotsMap.values()).sort((a, b) => {
        const da = dayOrder[a.day] || 99;
        const db = dayOrder[b.day] || 99;
        if (da !== db) return da - db;
        return (a.start || '').localeCompare(b.start || '');
      });

      // Separate theory and practice classrooms
      const teoRoomsSet = new Set();
      const pracRoomsSet = new Set();
      cluster.forEach(g => {
        const cType = (g.classType || 'TA').toUpperCase();
        const isTeo = cType.startsWith('T') || cType.includes('TEO');
        (g.schedules || []).forEach(s => {
          if (s.classroom) {
            if (isTeo) teoRoomsSet.add(s.classroom);
            else pracRoomsSet.add(s.classroom);
          }
        });
        if (g.classroom) {
          if (isTeo) teoRoomsSet.add(g.classroom);
          else pracRoomsSet.add(g.classroom);
        }
      });

      const teoRoomsStr = [...teoRoomsSet].join(', ') || (teoList.length > 0 ? 'Aula Asignada' : 'N/A');
      const pracRoomsStr = [...pracRoomsSet].join(', ') || (pracList.length > 0 ? 'Laboratorio' : 'N/A');
      const codesList = [...new Set(officialCodes.filter(Boolean))];

      // Detect shift
      const startTimes = cluster.flatMap(g => (g.schedules || []).map(s => s.startTime).filter(Boolean));
      const earliestTime = startTimes.sort()[0] || '08:00';
      const earliestHour = parseInt(earliestTime.split(':')[0], 10);
      let shiftLabel = '';
      if (earliestHour >= 18) {
        shiftLabel = 'Turno Noche';
      } else if (earliestHour >= 13) {
        shiftLabel = 'Turno Tarde';
      } else {
        shiftLabel = 'Turno Mañana';
      }

      return {
        key: 'materia_cat_' + idx,
        code: officialCode,
        name: displayName,
        isCommon: isCommon,
        carrerasResolved: carrerasResolved,
        mainCarrera: mainCarrera,
        allCarrerasNames: allCarrerasNames,
        allCarrerasTags: allCarrerasTags,
        carrerasCodes: carrerasArr,
        teoList: teoList,
        pracList: pracList,
        teoCodes: teoCodes,
        pracCodes: pracCodes,
        teoSummary: teoSummary,
        pracSummary: pracSummary,
        totalPhysicalSessions: totalPhysicalSessions,
        totalHours: totalHours,
        campusesStr: campusesStr,
        classroomsStr: classroomsStr,
        groupedSchedules: groupedSchedules,
        hierarchicalSchedules: hierarchicalSchedules,
        teoRoomsStr: teoRoomsStr,
        pracRoomsStr: pracRoomsStr,
        codesList: codesList,
        shiftLabel: shiftLabel,
        allGroupsCodes: allGroupsCodes,
        totalGroupsInCluster: totalGroupsInCluster
      };
    });

    // Sort: Common subjects first, then by name
    items.sort((a, b) => {
      if (a.isCommon && !b.isCommon) return -1;
      if (!a.isCommon && b.isCommon) return 1;
      return a.name.localeCompare(b.name);
    });
    // Re-index keys after sort with unique docente CI prefix
    items.forEach((it, i) => { it.key = `${docente.ci}_cat_${i}`; });

    // Calculate totals across all subjects
    const uniqueCarreras = [...new Set(items.flatMap(it => it.carrerasResolved.map(cr => cr.name)))];
    const totalWeeklyHours = items.reduce((sum, it) => sum + it.totalHours, 0);

    // Update Profile Footer & Top Summary Badges
    const initials = docente.nombreCompleto
      .replace(/(Ing\.|Lic\.|Dr\.|Dra\.|Msc\.)/gi, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('') || 'UN';

    const avatarEl = document.getElementById('user-profile-avatar');
    if (avatarEl) avatarEl.textContent = initials;

    const profileNameEl = document.getElementById('user-profile-name');
    if (profileNameEl) profileNameEl.textContent = docente.nombreCompleto;

    const profileInfoEl = document.getElementById('user-profile-info');
    if (profileInfoEl) profileInfoEl.textContent = `${totalWeeklyHours}h • ${items.length} Materia(s)`;

    const summaryBadgeEl = document.getElementById('docente-summary-badge');
    if (summaryBadgeEl) summaryBadgeEl.textContent = `${totalWeeklyHours} Hrs / Semana • ${items.length} Materias • ${rawList.length} Grupos a Cargo (${uniqueCarreras.length} Carreras)`;

    const sidebarHoursEl = document.getElementById('sidebar-summary-hours');
    if (sidebarHoursEl) sidebarHoursEl.textContent = `${items.length} Materias • ${totalWeeklyHours}h`;

    // 1. Build Top Horizontal Cards Grid (One per distinct subject)
    let cardsHtml = '';
    let sidebarHtml = `
      <div class="flex items-center justify-between px-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mis Asignaturas Asignadas</span>
        <span class="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/70 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800/60">${items.length} Materias</span>
      </div>
    `;

    items.forEach((item, idx) => {
      const mKey = item.key;

      // Register or update in canonical materiasData
      materiasData[mKey] = {
        asignacionId: idx + 1,
        codigo: item.code,
        nombre: item.name,
        semestre: '1º',
        creditos: '12',
        horasTeoricas: item.teoList.length * 4 + '',
        horasPracticas: item.pracList.length * 4 + '',
        carrera: item.allCarrerasNames,
        carreraTag: item.isCommon ? `⚡ COMÚN: ${item.allCarrerasTags}` : item.allCarrerasTags,
        grupoTag: `${item.totalPhysicalSessions} Comisiones (${item.teoList.length} Teoría • ${item.pracList.length} Práctica)`,
        breadcrumb: `${item.code} ${item.name}`,
        title: `${item.code} • ${item.name}`,
        meta: `<span><strong class="text-white">${item.totalHours}</strong> Horas Semanales</span><span>•</span><span>Campus: <strong class="text-white">${item.campusesStr}</strong></span><span>•</span><span><strong class="text-white">${item.groupedSchedules.length}</strong> Bloques Horarios Oficiales</span>`,
        caracterizacion: `Asignatura oficial ${item.name} del plan curricular de ${item.allCarrerasNames} (UNITEPC) impartida por el docente ${docente.nombreCompleto}.`,
        macroCompetencia: `Desarrolla capacidades profesionales y resolución de problemas prácticos en ${item.name}.`,
        sistemaEvaluacion: 'Evaluación continua diagnóstica, formativa y sumativa por competencias.',
        unidades: [
          {
            numeroUnidad: 1,
            titulo: 'Fundamentos y Bases Conceptuales de ' + item.name,
            horasAcademicas: 20,
            temas: [
              { numeroTema: 1, titulo: 'Introducción y Principios Básicos', contenido: '• Fundamentos de ' + item.name + '.\n• Marco teórico y metodológico.' },
              { numeroTema: 2, titulo: 'Modelado y Aplicaciones Prácticas', contenido: '• Aplicación de competencias en casos reales.\n• Desarrollo guiado y resolución de problemas.' }
            ]
          },
          {
            numeroUnidad: 2,
            titulo: 'Desarrollo Avanzado y Ejercitación Práctica',
            horasAcademicas: 20,
            temas: [
              { numeroTema: 3, titulo: 'Técnicas y Métodos Especializados', contenido: '• Técnicas avanzadas de la disciplina.\n• Prácticas de laboratorio y talleres aplicados.' }
            ]
          }
        ],
        bibliografia: [
          { tipo: 'BASICA', citaApa: 'UNITEPC. (2026). Guía Curricular Oficial de ' + item.allCarrerasNames + '. Fondo Editorial UNITEPC.', autor: 'UNITEPC', anio: 2026, titulo: 'Guía Curricular' },
          { tipo: 'COMPLEMENTARIA', citaApa: 'Ministerio de Educación. (2025). Normas Académicas de Educación Superior.', autor: 'Min. Educación', anio: 2025, titulo: 'Normas Académicas' }
        ],
        elementosCompetencia: [
          `Modela problemas y soluciones en el ámbito de ${item.name}.`,
          `Ejecuta procedimientos técnicos y metodologías estándar con rigor profesional.`
        ],
        carrerasCodes: item.carrerasCodes,
        carrerasResolved: item.carrerasResolved,
        groupedSchedules: item.groupedSchedules,
        hierarchicalSchedules: item.hierarchicalSchedules,
        teoRoomsStr: item.teoRoomsStr,
        pracRoomsStr: item.pracRoomsStr,
        codesList: item.codesList,
        shiftLabel: item.shiftLabel
      };

      // Distinct Days Badges for the Compact Card
      const uniqueDays = [...new Set(item.groupedSchedules.map(s => s.dayName.substring(0, 3)))];
      const daysBadges = uniqueDays.length > 0 
        ? uniqueDays.map(d => `<span class="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800/60 text-[9px]">${d}</span>`).join(' ')
        : '<span class="text-[9px] text-slate-400">Regular</span>';

      // HTML for Top Horizontal Card (Expanded horizontally, compact vertically):
      cardsHtml += `
        <div id="doc-materia-card-${mKey}" onclick="window.selectDocenteMateria('${mKey}')" class="doc-materia-card p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md cursor-pointer relative transition-all duration-200 flex flex-col justify-between">
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            <!-- Columna Izquierda (sm:col-span-7): Carrera, Título, Códigos y Grupos -->
            <div class="sm:col-span-7 space-y-1.5 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${item.isCommon ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700' : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'} truncate max-w-[260px]">
                  ${item.isCommon ? '⚡ COMÚN: ' + item.allCarrerasTags : item.allCarrerasTags}
                </span>
                <span class="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex-shrink-0">
                  ${item.totalPhysicalSessions} Comisiones • ${item.totalHours}h
                </span>
              </div>

              <!-- Nombre Principal de la Materia -->
              <h3 class="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1" title="${item.name}">
                ${item.name}
              </h3>

              <!-- Códigos & Grupos a Cargo -->
              <div class="flex items-center gap-2 flex-wrap text-[10.5px]">
                <div class="flex items-center gap-1">
                  ${item.codesList.map(c => `<span class="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-mono font-bold text-[10px] border border-brand-200/70 dark:border-brand-800/70">${c}</span>`).join('')}
                </div>
                <div class="flex items-center gap-1 font-mono text-[9.5px] font-bold">
                  ${item.teoCodes ? `<span class="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60">Teo: ${item.teoCodes}</span>` : ''}
                  ${item.pracCodes ? `<span class="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">Prác: ${item.pracCodes}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Columna Derecha (sm:col-span-5): Campus, Aulas y Días -->
            <div class="sm:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[10px] space-y-1">
              <div class="flex items-center justify-between text-[9.5px]">
                <span class="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <i data-lucide="map-pin" class="w-3 h-3 text-brand-600"></i> CAMPUS:
                </span>
                <span class="font-black text-slate-800 dark:text-slate-200 truncate max-w-[120px]">${item.campusesStr}</span>
              </div>
              <div class="flex items-center justify-between text-[9.5px]">
                <span class="text-slate-500 font-medium flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>TEORÍA:</span>
                <span class="font-bold font-mono text-slate-900 dark:text-white truncate max-w-[130px]">${item.teoRoomsStr}</span>
              </div>
              <div class="flex items-center justify-between text-[9.5px]">
                <span class="text-slate-500 font-medium flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>PRÁCTICA:</span>
                <span class="font-bold font-mono text-slate-900 dark:text-white truncate max-w-[130px]">${item.pracRoomsStr}</span>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[9px]">
                <div class="flex items-center gap-1">${daysBadges}</div>
                <span class="font-bold text-brand-700 dark:text-brand-400">${item.groupedSchedules.length} Bloques</span>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"><i data-lucide="folder-check" class="w-3.5 h-3.5"></i> Carpeta Docente</span>
            <span class="doc-card-action-badge text-slate-400 font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">Ver Carga ➔</span>
          </div>
        </div>
      `;

      // HTML for Sidebar Button
      sidebarHtml += `
        <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden mb-2.5">
          <div class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60">
            <span class="flex items-center gap-1.5"><i data-lucide="book-open" class="w-3.5 h-3.5 text-brand-600"></i> ${item.code}</span>
            <span class="text-[10px] text-brand-700 dark:text-brand-400 font-bold">${item.totalPhysicalSessions} Grupos</span>
          </div>
          <div class="p-1">
            <button onclick="window.selectDocenteMateria('${mKey}')" id="sidebar-materia-${mKey}" class="sidebar-materia-btn w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800">
              <div class="truncate">
                <div class="truncate font-bold text-slate-900 dark:text-white">${item.name} ${!item.isCommon && item.shiftLabel ? `<span class="text-[10px] font-normal text-slate-400">(${item.shiftLabel})</span>` : ''}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${item.teoList.length} Teo • ${item.pracList.length} Prác (${item.totalHours}h)</div>
                <div class="text-[9px] text-brand-600 dark:text-brand-400 truncate mt-0.5">${item.isCommon ? '⚡ COMÚN: ' + item.allCarrerasNames : item.allCarrerasNames}</div>
              </div>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
            </button>
          </div>
        </div>
      `;
    });

    if (cardsGrid) cardsGrid.innerHTML = cardsHtml;
    if (sidebarContainer) sidebarContainer.innerHTML = sidebarHtml;
    if (window.lucide) window.lucide.createIcons();

    // Auto-select first subject of this teacher
    const firstItem = items[0];
    if (firstItem) {
      window.selectDocenteMateria(firstItem.key);
    }
  };

  // Toggle collapsible schedules breakdown accordion
  window.toggleSchedulesBreakdown = function() {
    const grid = document.getElementById('schedules-breakdown-grid');
    const chevron = document.getElementById('schedules-breakdown-chevron');
    if (!grid) return;
    const isHidden = grid.classList.contains('hidden');
    if (isHidden) {
      grid.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180');
    } else {
      grid.classList.add('hidden');
      if (chevron) chevron.classList.remove('rotate-180');
    }
  };

  // Render dedicated full schedules panel for the selected subject (Grouped by Shared Careers and Day)
  window.renderMateriaSchedulesDetail = function(data) {
    const panel = document.getElementById('materia-schedules-breakdown');
    const grid = document.getElementById('schedules-breakdown-grid');
    const subtitle = document.getElementById('schedules-breakdown-subtitle');
    const countBadge = document.getElementById('schedules-breakdown-count');
    if (!panel || !grid || !data) return;

    const list = data.hierarchicalSchedules || [];
    const totalSlots = (data.groupedSchedules || []).length;
    if (countBadge) {
      countBadge.textContent = `${totalSlots} Bloque(s) en ${list.length} Grupo(s) de Horarios`;
    }
    if (subtitle) {
      subtitle.textContent = `Horarios oficiales y aulas asignadas para ${data.nombre} • ${data.carrera || 'UNITEPC'}`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          No hay horarios específicos registrados en el Gateway para esta materia.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md transition-all space-y-3">
        <!-- Header: Carrera(s) y Día -->
        <div class="border-b border-slate-200 dark:border-slate-700/80 pb-2.5 flex items-start justify-between gap-2">
          <div>
            <div class="text-xs font-black text-brand-700 dark:text-brand-300 tracking-tight flex items-center gap-1.5 uppercase">
              <i data-lucide="graduation-cap" class="w-4 h-4 text-brand-600"></i>
              <span>${item.careersTitle}</span>
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i>
              <span>${item.dayName}</span>
            </div>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0">
            ${item.campus}
          </span>
        </div>

        <!-- List of Time Slots and Classrooms -->
        <div class="space-y-2">
          ${item.slots.map(sl => `
            <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 text-xs shadow-2xs">
              <div class="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-brand-500"></i>
                <span>${sl.start} - ${sl.end}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
                  ${sl.classroom}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  (${sl.groups})
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Sub-tabs of Career
  window.renderCarreraSubtabs = function(mKey) {
    try {
      const data = materiasData[mKey];
      const analiticoContainer = document.getElementById('analitico-carrera-subtabs');
      const pacContainer = document.getElementById('pac-carrera-subtabs');
      if (!data) return;

      const rawCareers = data.carrerasCodes || [];
      const resolvedCareers = data.carrerasResolved || [];

      // Dedup careers by careerCode
      const seenCareers = new Set();
      const uniqueCareers = [];
      rawCareers.forEach((cCode, idx) => {
        const cCodeClean = (cCode || '').toUpperCase();
        if (!seenCareers.has(cCodeClean) && cCodeClean) {
          seenCareers.add(cCodeClean);
          uniqueCareers.push({
            cCode: cCodeClean,
            info: resolvedCareers[idx] || (typeof window.resolveCarreraInfo === 'function' ? window.resolveCarreraInfo('', cCodeClean) : { name: cCodeClean, tag: cCodeClean })
          });
        }
      });

      if (uniqueCareers.length <= 1) {
        if (analiticoContainer) analiticoContainer.innerHTML = '';
        if (pacContainer) pacContainer.innerHTML = '';
        return;
      }

      const buildTabsHtml = () => {
        let tabsHtml = `
          <div class="p-3 rounded-xl border-2 border-brand-300 dark:border-brand-800 bg-brand-50/80 dark:bg-slate-900 shadow-sm space-y-2">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="text-xs font-extrabold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
                <i data-lucide="layers" class="w-4 h-4 text-brand-600"></i> Vista Previa / Carátula de Carrera:
              </span>
              <span class="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Hacé clic en una carrera para ver sus códigos y membrete específico:</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button type="button" onclick="window.selectCarreraContext('${mKey}', 'ALL', this)" class="carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 bg-brand-600 text-white ring-2 ring-brand-500/30 cursor-pointer">
                <i data-lucide="globe" class="w-3.5 h-3.5"></i> Vista Consolidada (${data.codigo})
              </button>
        `;

        uniqueCareers.forEach((crObj) => {
          const cCode = crObj.cCode;
          const cr = crObj.info;
          const singleCode = typeof window.resolveOfficialCourseCode === 'function' 
            ? window.resolveOfficialCourseCode(data.nombre, [cCode]) 
            : cCode;
          let icon = 'book';
          if (cCode.includes('SIS')) icon = 'code-2';
          else if (cCode.includes('ELE')) icon = 'cpu';
          else if (cCode.includes('SON')) icon = 'music';
          else if (cCode.includes('IBI') || cCode.includes('BIO')) icon = 'dna';
          else if (cCode.includes('MED')) icon = 'stethoscope';
          else if (cCode.includes('ADM') || cCode.includes('CCP')) icon = 'bar-chart-3';

          tabsHtml += `
            <button type="button" onclick="window.selectCarreraContext('${mKey}', '${cCode}', this, '${singleCode}', '${cr.name}')" class="carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 flex items-center gap-1.5 cursor-pointer shadow-xs">
              <i data-lucide="${icon}" class="w-3.5 h-3.5"></i> ${cr.tag || cCode} <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-brand-700 dark:text-brand-300 font-mono border border-slate-200 dark:border-slate-600">${singleCode}</span>
            </button>
          `;
        });

        tabsHtml += `
            </div>
          </div>
        `;
        return tabsHtml;
      };

      if (analiticoContainer) analiticoContainer.innerHTML = buildTabsHtml();
      if (pacContainer) pacContainer.innerHTML = buildTabsHtml();
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Error rendering carrera subtabs:', err);
    }
  };

  window.selectCarreraContext = function(mKey, cCode, btnEl, singleCode, carreraName) {
    const data = materiasData[mKey];
    if (!data) return;

    document.querySelectorAll(`.carrera-subtab-btn-${mKey}`).forEach(btn => {
      btn.className = `carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 flex items-center gap-1.5 cursor-pointer shadow-xs`;
    });

    if (btnEl) {
      btnEl.className = `carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 bg-brand-600 text-white ring-2 ring-brand-500/30 cursor-pointer`;
    }

    if (cCode === 'ALL') {
      if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = data.codigo;
      if (document.getElementById('pac-codigo-input')) document.getElementById('pac-codigo-input').value = data.codigo;
      if (document.getElementById('pac-carrera-input')) document.getElementById('pac-carrera-input').value = data.carrera;
      if (document.getElementById('caratula-codigo')) document.getElementById('caratula-codigo').value = data.codigo;
      if (document.getElementById('caratula-carrera')) document.getElementById('caratula-carrera').value = data.carrera;
      window.showToast('🌐 Vista Consolidada Multicarrera: ' + data.codigo);
    } else {
      if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = singleCode;
      if (document.getElementById('pac-codigo-input')) document.getElementById('pac-codigo-input').value = singleCode;
      if (document.getElementById('pac-carrera-input')) document.getElementById('pac-carrera-input').value = carreraName;
      if (document.getElementById('caratula-codigo')) document.getElementById('caratula-codigo').value = singleCode;
      if (document.getElementById('caratula-carrera')) document.getElementById('caratula-carrera').value = carreraName;
      window.showToast(`🏫 Vista ajustada para ${carreraName} (Código: ${singleCode})`);
    }
  };

  // Initial check on load
  setTimeout(() => {
    window.updateSeaGatewayStatus('online');
    window.loadDocentesFromApi();
  }, 150);
})();



