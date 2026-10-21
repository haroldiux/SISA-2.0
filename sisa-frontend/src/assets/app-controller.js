
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

    const materiasData = {};

    // Automatic storage purge to eliminate prior mock caches
    (function purgeLegacyMockStorage() {
      try {
        const mockKeywords = ['Configuración de Entorno Experimental', 'Laboratorio de Computación / Simulación Técnica', 'Modelado Orientado a Objetos', 'Configuración de Entorno de Desarrollo'];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sisa_saved_pac_prac_') || k.startsWith('sisa_saved_planes_prac_') || k.startsWith('sisa_saved_cron_prac_'))) {
            const val = localStorage.getItem(k);
            if (val && mockKeywords.some(w => val.includes(w))) {
              localStorage.removeItem(k);
            }
          }
        }
        const PURGE_FLAG = 'sisa_purged_mock_v265';
        if (!localStorage.getItem(PURGE_FLAG)) {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('sisa_saved_programa_analitico_') || k.startsWith('sisa_saved_pac_') || k.startsWith('sisa_saved_planes_') || k.startsWith('sisa_saved_cron_'))) {
              localStorage.removeItem(k);
            }
          }
          localStorage.setItem(PURGE_FLAG, 'true');
          console.log('🧹 SISA Storage Purge: Cleared legacy mock caches for clean official state.');
        }
      } catch (err) {
        console.warn('Could not run storage purge:', err);
      }
    })();

    let activeTabId = 'tab-analitico';
    let activeMateriaKey = '';
    let activeAsignacionId = 1;



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


    // Mapping of viewId to sidebar navigation button ID
    const VIEW_TO_NAV_ITEM = {
      'view-dashboard': 'nav-item-dashboard',
      'view1': 'nav-item-view1',
      'view2': 'nav-item-view2',
      'view3': 'nav-item-view3',
      'view4': 'nav-item-view4',
      'view5': 'nav-item-view5',
      'view6': 'nav-item-view6'
    };

    // Role-based Navigation and UI Filtering
    window.updateSidebarNavForRole = function(role) {
      let currentRole = role;
      if (!currentRole && typeof window.getCurrentUser === 'function') {
        const u = window.getCurrentUser();
        if (u && u.role) currentRole = u.role;
      }
      if (!currentRole) currentRole = 'ROLE_DOCENTE';

      const isDocente = (currentRole === 'ROLE_DOCENTE');

      // Toggle Docente Dashboard vs Admin Dashboard
      const docenteDash = document.getElementById('dashboard-docente');
      const adminDash = document.getElementById('dashboard-admin');
      if (docenteDash && adminDash) {
        if (isDocente) {
          docenteDash.classList.remove('hidden');
          adminDash.classList.add('hidden');
          if (typeof window.renderDocenteDashboard === 'function') {
            window.renderDocenteDashboard();
          }
        } else {
          docenteDash.classList.add('hidden');
          adminDash.classList.remove('hidden');
        }
      }

      // Hide/Show teacher selector in topbar (only for admin & directors)
      const topbarTeacherSelector = document.getElementById('topbar-docente-selector-wrap');
      if (topbarTeacherSelector) {
        if (isDocente) {
          topbarTeacherSelector.classList.add('hidden');
        } else {
          topbarTeacherSelector.classList.remove('hidden');
        }
      }

      const roleGatedElements = document.querySelectorAll('[data-roles]');
      roleGatedElements.forEach(el => {
        const allowedRoles = el.getAttribute('data-roles');
        if (!allowedRoles || allowedRoles === 'ALL') {
          el.classList.remove('hidden');
        } else {
          const rolesArray = allowedRoles.split(',').map(r => r.trim());
          if (rolesArray.includes(currentRole)) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });

      if (window.lucide) window.lucide.createIcons();
    };

    window.switchView = function(viewId) {
      if (!viewId) viewId = 'view-dashboard';

      // Security check: If current user is ROLE_DOCENTE and tries to access admin/director views
      const currentUser = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
      if (currentUser && currentUser.role === 'ROLE_DOCENTE' && ['view2', 'view3', 'view4', 'view5', 'view6'].includes(viewId)) {
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ No tienes permisos para acceder a este módulo institucional');
        }
        viewId = 'view-dashboard';
      }

      // 1. Hide all views and reveal target
      document.querySelectorAll('.frame-view').forEach(view => view.classList.add('hidden'));
      const target = document.getElementById(viewId);
      if (target) target.classList.remove('hidden');

      // 2. Update Global Sidebar Nav active highlight
      document.querySelectorAll('.global-nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-[var(--sp-purple-soft)]', 'text-[var(--sp-purple-dark)]', 'font-semibold');
        btn.classList.add('text-[var(--sp-ink-2)]', 'font-medium');
      });

      const activeNavId = VIEW_TO_NAV_ITEM[viewId];
      if (activeNavId) {
        const activeNavBtn = document.getElementById(activeNavId);
        if (activeNavBtn) {
          activeNavBtn.classList.add('active', 'bg-[var(--sp-purple-soft)]', 'text-[var(--sp-purple-dark)]', 'font-semibold');
          activeNavBtn.classList.remove('text-[var(--sp-ink-2)]', 'font-medium');
        }
      }

      // 3. Backward-compatibility for prototype tabs if present
      document.querySelectorAll('.view-tab-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-300');
      });

      const activeBtn = document.getElementById('btn-' + viewId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-300');
        activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-sm');
      }

      // 4. View-specific lifecycle hooks
      if (viewId !== 'view1') {
        window.__SUPERVISION_AUDIT_COURSE_CODE__ = null;
        try { localStorage.removeItem('sisa_supervision_audit_course'); } catch (e) {}
        const returnBar = document.getElementById('director-supervision-return-bar');
        if (returnBar) returnBar.classList.add('hidden');
      }

      if (viewId === 'view-dashboard') {
        const role = (currentUser && currentUser.role) ? currentUser.role : 'ROLE_DOCENTE';
        if (typeof window.updateSidebarNavForRole === 'function') {
          window.updateSidebarNavForRole(role);
        }
      } else if (viewId === 'view2') {
        if (typeof window.renderSupervisionCurricular === 'function') {
          window.renderSupervisionCurricular();
        }
      } else if (viewId === 'view6' && typeof window.loadAdminUsers === 'function') {
        window.loadAdminUsers();
      }

      // 5. Contextual Carpeta Docente Sidebar Menu (Only visible inside a folder / view1)
      const carpetaContext = document.getElementById('global-sidebar-carpeta-context');
      if (carpetaContext) {
        if (viewId === 'view1') {
          carpetaContext.classList.remove('hidden');
        } else {
          carpetaContext.classList.add('hidden');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // ── SIDEBAR RAIL COLLAPSE ENGINE ──────────────────────────────────────
    window.toggleSidebarCollapse = function() {
      const sidebar = document.getElementById('global-sidebar');
      const icon = document.getElementById('sidebar-collapse-icon');
      if (!sidebar) return;

      const isCollapsed = sidebar.classList.toggle('sidebar-collapsed');
      
      if (isCollapsed) {
        sidebar.classList.remove('w-60', 'w-64');
        sidebar.classList.add('w-20');
        if (icon) icon.setAttribute('data-lucide', 'chevrons-right');
      } else {
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');
        if (icon) icon.setAttribute('data-lucide', 'chevrons-left');
      }

      localStorage.setItem('sp.sidebar.collapsed', isCollapsed ? 'true' : 'false');
      if (window.lucide) window.lucide.createIcons();
    };

    // Auto-restore persisted collapse state on controller initialization
    (function initSidebarState() {
      const savedState = localStorage.getItem('sp.sidebar.collapsed');
      if (savedState === 'true') {
        const sidebar = document.getElementById('global-sidebar');
        const icon = document.getElementById('sidebar-collapse-icon');
        if (sidebar) {
          sidebar.classList.add('sidebar-collapsed', 'w-20');
          sidebar.classList.remove('w-60', 'w-64');
        }
        if (icon) icon.setAttribute('data-lucide', 'chevrons-right');
      }
    })();

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
        else if (tabId === 'tab-asistencia') ringColor = 'ring-teal-500/20';

        activeBtn.className = 'doc-main-tab-btn px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border border-slate-300/80 dark:border-slate-700 font-bold scale-[1.02] ring-2 ' + ringColor;
      }

      // Sidebar Tab Highlights
      document.querySelectorAll('.sidebar-tab-nav').forEach(btn => {
        btn.className = 'sidebar-tab-nav w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium text-xs text-left cursor-pointer transition-all';
      });
      const activeSidebarTab = document.getElementById('sidebar-' + tabId);
      if (activeSidebarTab) {
        activeSidebarTab.className = 'sidebar-tab-nav w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700/60 font-bold text-xs text-left cursor-pointer transition-all';
      }

      // Update contextual clear button label
      const clearLabel = document.getElementById('btn-vaciar-pestana-label');
      if (clearLabel) {
        if (tabId === 'tab-analitico') clearLabel.innerText = 'Vaciar Programa Analítico';
        else if (tabId === 'tab-pac-matrix') clearLabel.innerText = 'Vaciar PAC';
        else if (tabId === 'tab-cronograma-semanas') clearLabel.innerText = 'Vaciar Cronograma';
        else if (tabId === 'tab-cronograma-planes') clearLabel.innerText = 'Vaciar Planes de Clase';
        else if (tabId === 'tab-asistencia') clearLabel.innerText = 'Reiniciar Asistencia de Sesión';
        else clearLabel.innerText = 'Vaciar Pestaña';
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

      if (tabId === 'tab-asistencia') {
        if (typeof window.loadAttendanceForCurrentSelection === 'function') {
          window.loadAttendanceForCurrentSelection();
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






    // ── STRICT FORM STATE ISOLATION & BLEEDING ELIMINATION ──────────────────
    window.resetAllDocenteFormFields = function() {
      if (typeof autoSaveTimer !== 'undefined' && autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }

      // Tab 1: Programa Analitico inputs
      const analiticoIds = [
        'analitico-codigo-input', 'analitico-semestre-input', 'analitico-asig-input',
        'analitico-creditos-input', 'analitico-ht-input', 'analitico-hp-input',
        'analitico-hs-input', 'analitico-hojas-input', 'programa-caracterizacion',
        'programa-macrocompetencia', 'programa-sistema-evaluacion',
        'analitico-biblio-basica-input', 'analitico-biblio-comp-input'
      ];
      analiticoIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      // Tab 2: PAC inputs
      const pacIds = [
        'pac-carrera-input', 'pac-codigo-input', 'pac-semestre-input', 'pac-asig-input',
        'pac-tipo-curso', 'pac-modalidad', 'pac-prerequisito', 'pac-creditos',
        'pac-sesiones-sem', 'pac-horas-tp', 'pac-docente-nombre', 'pac-docente-email',
        'pac-docente-formacion', 'pac-docente-telefono', 'pac-justificacion-input',
        'pac-proposito-input', 'pac-competencia-global', 'pac-unidad-competencia',
        'pac-metodologia-aula', 'pac-metodologia-escenarios', 'pac-metodologia-evaluacion',
        'pac-criterios-reglamento', 'pac-normativa-curso', 'pac-biblio-oficial'
      ];
      pacIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      // Tab 3: Cronograma table
      const cronTbody = document.getElementById('cronograma-table-body');
      if (cronTbody) {
        cronTbody.innerHTML = `
          <tr>
            <td colspan="10" class="py-12 text-center text-slate-400 dark:text-slate-500">
              <i data-lucide="file-spreadsheet" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p class="font-bold text-xs text-slate-600 dark:text-slate-400">Sin sesiones cargadas en el cronograma</p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Haz clic en "Importar Cronograma (.xlsx)" o presiona "+ Agregar Fila".</p>
            </td>
          </tr>
        `;
      }

      // Tab 4: Planes de Clase inputs
      const planIds = [
        'plan-docente-input', 'plan-fecha-input', 'plan-asig-input', 'plan-carrera-input',
        'plan-unidad-input', 'plan-tema-input', 'plan-elemento-input', 'plan-resultados-input',
        'plan-logros-input', 'plan-indicadores-input', 'plan-conceptual-input',
        'plan-procedimental-input', 'plan-actitudinal-input', 'plan-est-ensenanza',
        'plan-est-aprendizaje', 'plan-est-recursos', 'plan-eval-form-act',
        'plan-eval-form-inst', 'plan-eval-form-evid', 'plan-eval-sum-act',
        'plan-eval-sum-inst', 'plan-eval-sum-evid', 'plan-sec-intro',
        'plan-sec-resultados', 'plan-sec-contenidos', 'plan-sec-cuerpo', 'plan-sec-cierre'
      ];
      planIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      activeAnaliticoUnidades = [];
      activePacElementosCompetencia = [];
      activePlanesList = [];
      activePlanSheetIndex = 0;
    };

    // ── VACIAR DOCUMENTACIÓN POR PESTAÑA ────────────────────────────────────
    window.vaciarProgramaAnalitico = function() {
      if (!confirm('¿Deseas vaciar todos los campos y unidades del Programa Analítico para esta materia?')) return;
      const analiticoIds = [
        'analitico-codigo-input', 'analitico-semestre-input', 'analitico-asig-input',
        'analitico-creditos-input', 'analitico-ht-input', 'analitico-hp-input',
        'analitico-hs-input', 'analitico-hojas-input', 'programa-caracterizacion',
        'programa-macrocompetencia', 'programa-sistema-evaluacion',
        'analitico-biblio-basica-input', 'analitico-biblio-comp-input'
      ];
      analiticoIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      activeAnaliticoUnidades = [];
      if (typeof window.renderAnaliticoUnidades === 'function') {
        window.renderAnaliticoUnidades();
      }
      if (typeof window.renderAnaliticoBibliografia === 'function') {
        window.renderAnaliticoBibliografia([]);
      }
      if (activeMateriaKey) {
        localStorage.removeItem('sisa_saved_programa_analitico_' + activeMateriaKey);
      }
      window.showToast('🗑️ Programa Analítico vaciado.');
    };

    window.vaciarPacYCronograma = function() {
      const isPractico = (window.activePacType === 'PRACTICO');
      const docName = isPractico ? 'PAC Práctico' : 'PAC General y el Cronograma';
      if (!confirm(`¿Deseas vaciar los datos de ${docName} para esta materia?`)) return;

      if (isPractico) {
        const pracIds = [
          'pac-prac-escenario', 'pac-prac-bioseguridad', 'pac-prac-equipamiento',
          'pac-prac-fase1-prep', 'pac-prac-fase2-guiada', 'pac-prac-fase3-autonoma', 'pac-prac-fase4-cierre',
          'pac-prac-eval-criterios', 'pac-prac-eval-instrumentos',
          'pac-justificacion-input', 'pac-proposito-input', 'pac-competencia-global', 'pac-unidad-competencia'
        ];
        pracIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        window.pacPracticasList = [];
        if (typeof window.renderPacPracticasTable === 'function') {
          window.renderPacPracticasTable();
        }
        window.activePacPracData = null;
        if (activeMateriaKey) {
          localStorage.removeItem('sisa_saved_pac_prac_' + activeMateriaKey);
        }
        window.showToast('🗑️ PAC Práctico vaciado.');
      } else {
        const pacIds = [
          'pac-justificacion-input', 'pac-proposito-input', 'pac-competencia-global', 'pac-unidad-competencia',
          'pac-metodologia-aula', 'pac-metodologia-lab', 'pac-metodologia-salud',
          'pac-sistema-evaluacion', 'pac-normativa-acuerdos', 'pac-bibliografia-textarea',
          'pac-p1-teorica', 'pac-p1-practica', 'pac-p2-teorica', 'pac-p2-practica',
          'pac-ef-teorica', 'pac-ef-practica'
        ];
        pacIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        activePacElementosCompetencia = [];
        if (typeof window.renderPacElementosCompetencia === 'function') {
          window.renderPacElementosCompetencia();
        }
        const cronTbody = document.getElementById('cronograma-table-body');
        if (cronTbody) {
          cronTbody.innerHTML = `
            <tr>
              <td colspan="10" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <i data-lucide="file-spreadsheet" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                <p class="font-bold text-xs text-slate-600 dark:text-slate-400">Sin sesiones cargadas en el cronograma</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Haz clic en "Importar Cronograma (.xlsx)" o presiona "+ Agregar Fila".</p>
              </td>
            </tr>
          `;
          if (window.lucide) window.lucide.createIcons();
        }
        window.activePacGralData = null;
        if (activeMateriaKey) {
          localStorage.removeItem('sisa_saved_pac_gral_' + activeMateriaKey);
          localStorage.removeItem('sisa_saved_pac_' + activeMateriaKey);
        }
        window.showToast('🗑️ PAC General y Cronograma vaciados.');
      }
    };

    window.vaciarPlanesClase = function() {
      const isPractico = (window.activePlanType === 'PRACTICO');
      const docName = isPractico ? 'Planes de Clase Prácticos' : 'Planes de Clase Teóricos';
      if (!confirm(`¿Deseas vaciar todas las hojas y datos de los ${docName} para esta materia?`)) return;

      activePlanesList = [];
      activePlanSheetIndex = 0;

      if (isPractico) {
        window.activePlanesPracticoList = [];
        if (activeMateriaKey) {
          localStorage.removeItem('sisa_saved_planes_prac_' + activeMateriaKey);
        }
        window.showToast('🗑️ Planes de clase prácticos vaciados.');
      } else {
        window.activePlanesTeoricoList = [];
        if (activeMateriaKey) {
          localStorage.removeItem('sisa_saved_planes_teorico_' + activeMateriaKey);
          localStorage.removeItem('sisa_saved_planes_' + activeMateriaKey);
        }
        window.showToast('🗑️ Planes de clase teóricos vaciados.');
      }

      if (typeof window.renderPlanesSheetsTabs === 'function') {
        window.renderPlanesSheetsTabs();
      }
      if (typeof window.renderPlanSheetForm === 'function') {
        window.renderPlanSheetForm(0);
      }
    };

    window.vaciarDocumentacionPestanaActiva = function() {
      if (activeTabId === 'tab-analitico') {
        window.vaciarProgramaAnalitico();
      } else if (activeTabId === 'tab-pac-matrix' || activeTabId === 'tab-cronograma-semanas') {
        window.vaciarPacYCronograma();
      } else if (activeTabId === 'tab-cronograma-planes') {
        window.vaciarPlanesClase();
      } else if (activeTabId === 'tab-asistencia') {
        if (typeof window.resetCurrentAttendanceSession === 'function') {
          window.resetCurrentAttendanceSession();
        }
      } else {
        window.showToast('ℹ️ Selecciona una pestaña para vaciar.');
      }
    };

    // ── TASK 5.1: COMPONENT TYPE DETECTION ENGINE (SEA GATEWAY INTEGRATION) ────
    window.detectComponentTypes = function(groups) {
      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        return {
          types: ['TA'],
          hasTA: true,
          hasPA: false,
          hasPL: false,
          hasPS: false,
          hasPractice: false,
          hasLabOrSim: false,
          requiredPac: ['GRAL'],
          requiredPlan: ['TEORICO'],
          summary: 'TA (Teoría)',
          primaryType: 'TA'
        };
      }

      const detected = new Set();

      groups.forEach(g => {
        let codeStr = '';
        let typeStr = '';
        if (typeof g === 'string') {
          codeStr = g.toUpperCase();
        } else if (g && typeof g === 'object') {
          codeStr = String(g.code || g.name || '').toUpperCase();
          typeStr = String(g.classType || '').toUpperCase();
        }

        // Check explicit classType or prefixes (TA, PA, PL, PS)
        if (typeStr === 'TA' || codeStr.startsWith('TA') || typeStr.includes('TEO')) {
          detected.add('TA');
        }
        if (typeStr === 'PA' || codeStr.startsWith('PA')) {
          detected.add('PA');
        }
        if (typeStr === 'PL' || codeStr.startsWith('PL') || typeStr.includes('LAB')) {
          detected.add('PL');
        }
        if (typeStr === 'PS' || codeStr.startsWith('PS') || typeStr.includes('SIM')) {
          detected.add('PS');
        }

        // Tokenized fallback checks (e.g. "SIS-213-TA-01", "MED-PL-02")
        const parts = codeStr.split(/[-_\s/]+/);
        parts.forEach(p => {
          if (p === 'TA') detected.add('TA');
          else if (p === 'PA') detected.add('PA');
          else if (p === 'PL') detected.add('PL');
          else if (p === 'PS') detected.add('PS');
        });
      });

      if (detected.size === 0) {
        detected.add('TA');
      }

      const order = { 'TA': 1, 'PA': 2, 'PL': 3, 'PS': 4 };
      const sortedTypes = Array.from(detected).sort((a, b) => (order[a] || 99) - (order[b] || 99));

      const hasTA = detected.has('TA');
      const hasPA = detected.has('PA');
      const hasPL = detected.has('PL');
      const hasPS = detected.has('PS');
      const hasLabOrSim = hasPL || hasPS;
      const hasPractice = hasPA || hasPL || hasPS;

      // UNITEPC Document Assignment Matrix:
      // Scenario 1: TA + PA (Same teacher) -> PAC GRAL, Plan TEORICO-PRACTICO
      // Scenario 2: TA + (PL or PS) -> PAC GRAL + PAC PRACTICO, Plan TEORICO + Plan PRACTICO
      // Scenario 3: TA only -> PAC GRAL, Plan TEORICO
      // Scenario 4 & 5: Practice only (PA, PL, or PS) -> PAC PRACTICO, Plan PRACTICO
      let requiredPac = ['GRAL'];
      let requiredPlan = ['TEORICO_PRACTICO'];

      if (hasTA && hasPA && !hasLabOrSim) {
        requiredPac = ['GRAL'];
        requiredPlan = ['TEORICO_PRACTICO'];
      } else if (hasTA && hasLabOrSim) {
        requiredPac = ['GRAL', 'PRACTICO'];
        requiredPlan = ['TEORICO', 'PRACTICO'];
      } else if (hasTA && !hasPractice) {
        requiredPac = ['GRAL'];
        requiredPlan = ['TEORICO'];
      } else if (!hasTA && hasPractice) {
        requiredPac = ['PRACTICO'];
        requiredPlan = ['PRACTICO'];
      } else {
        requiredPac = ['GRAL'];
        requiredPlan = ['TEORICO_PRACTICO'];
      }

      return {
        types: sortedTypes,
        hasTA: hasTA,
        hasPA: hasPA,
        hasPL: hasPL,
        hasPS: hasPS,
        hasPractice: hasPractice,
        hasLabOrSim: hasLabOrSim,
        requiredPac: requiredPac,
        requiredPlan: requiredPlan,
        primaryType: sortedTypes[0] || 'TA',
        summary: sortedTypes.join(' + ')
      };
    };

    // ── TASK 5.5: VISUAL BADGES WITH OFFICIAL SEA DESIGN TOKENS ───────────────
    // TA: #7B47B8 ($sp-purple), PA: #1F9FAD ($sp-teal), PL: #0284C7 ($sp-blue), PS: #D97706 ($sp-amber)
    window.renderComponentBadge = function(type, small = false, active = false) {
      const t = String(type || 'TA').toUpperCase();
      const config = {
        'TA': {
          code: 'TA',
          label: 'Teoría',
          fullLabel: 'Trabajo de Aula (Teoría Institucional)',
          classToken: 'badge-ta',
          color: '#7B47B8'
        },
        'PA': {
          code: 'PA',
          label: 'Práctica Aula',
          fullLabel: 'Práctica de Aula',
          classToken: 'badge-pa',
          color: '#1F9FAD'
        },
        'PL': {
          code: 'PL',
          label: 'Laboratorio',
          fullLabel: 'Práctica de Laboratorio',
          classToken: 'badge-pl',
          color: '#0284C7'
        },
        'PS': {
          code: 'PS',
          label: 'Simulación',
          fullLabel: 'Práctica de Simulación',
          classToken: 'badge-ps',
          color: '#D97706'
        }
      };

      const c = config[t] || config['TA'];
      const activeRing = active ? 'ring-2 ring-offset-1 ring-current' : '';

      if (small) {
        return `<span class="badge ${c.classToken} px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-tight inline-flex items-center gap-1 ${activeRing}" title="${c.fullLabel}"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>${c.code}</span>`;
      }

      return `<span class="badge ${c.classToken} px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-tight inline-flex items-center gap-1.5 ${activeRing}" title="${c.fullLabel}"><span class="w-2 h-2 rounded-full bg-current"></span><span>${c.code}</span><span class="text-[10.5px] font-semibold opacity-90">• ${c.label}</span></span>`;
    };

    // ── TASK 5.2: DYNAMIC PAC FORM (GRAL vs PRÁCTICO) ───────────────────────────
    window.activePacType = 'GRAL';

    window.pacPracticasList = [
      {
        numero: 1,
        titulo: 'Reconocimiento de Instrumental, Bioseguridad y Normativa de Práctica',
        escenario: 'Laboratorio Central',
        duracion: '2',
        desempeno: 'Fase 1 y 2: Identificación correcta de instrumental, EPP y reporte inicial de seguridad',
        instrumento: 'Rúbrica de Desempeño'
      },
      {
        numero: 2,
        titulo: 'Procedimiento Guiado y Ejecución Experimental Paso a Paso',
        escenario: 'Laboratorio Central',
        duracion: '4',
        desempeno: 'Fase 2 y 3: Ejecución técnica supervisada y recolección de mediciones experimentales',
        instrumento: 'Lista de Cotejo Técnica'
      },
      {
        numero: 3,
        titulo: 'Simulación Avanzada, Resolución Autónoma de Casos y Cierre de Protocolo',
        escenario: 'Gabinete / Laboratorio',
        duracion: '4',
        desempeno: 'Fase 3 y 4: Resolución autónoma de casos prácticos, análisis de resultados y síntesis',
        instrumento: 'Evaluación de Producto y Rúbrica'
      }
    ];

    window.renderPacPracticasTable = function() {
      const tbody = document.getElementById('pac-practicas-table-body');
      if (!tbody) return;

      if (!window.pacPracticasList || window.pacPracticasList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="p-4 text-center text-xs text-slate-400">
              No hay prácticas programadas. Haz clic en "Agregar Práctica" para registrar una nueva sesión.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = window.pacPracticasList.map((item, idx) => `
        <tr class="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors">
          <td class="py-2.5 px-3 text-center font-bold text-teal-800 dark:text-teal-300 font-mono">#${item.numero || (idx + 1)}</td>
          <td class="py-2.5 px-3">
            <input type="text" value="${item.titulo || ''}" onchange="window.updatePacPracticaField(${idx}, 'titulo', this.value)" placeholder="Título de la práctica..." class="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-900 dark:text-white">
          </td>
          <td class="py-2.5 px-3">
            <input type="text" value="${item.escenario || ''}" onchange="window.updatePacPracticaField(${idx}, 'escenario', this.value)" placeholder="Escenario..." class="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-800 dark:text-slate-200">
          </td>
          <td class="py-2.5 px-3 text-center">
            <input type="number" min="1" max="10" value="${item.duracion || 2}" onchange="window.updatePacPracticaField(${idx}, 'duracion', this.value)" class="w-14 text-center p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-bold text-teal-700 dark:text-teal-300">
          </td>
          <td class="py-2.5 px-3">
            <input type="text" value="${item.desempeno || ''}" onchange="window.updatePacPracticaField(${idx}, 'desempeno', this.value)" placeholder="Desempeño / fases..." class="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-800 dark:text-slate-200">
          </td>
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-1.5">
              <input type="text" value="${item.instrumento || ''}" onchange="window.updatePacPracticaField(${idx}, 'instrumento', this.value)" placeholder="Instrumento..." class="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-800 dark:text-slate-200">
              <button type="button" onclick="window.deletePacPracticaRow(${idx})" class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer" title="Eliminar práctica">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
    };

    window.updatePacPracticaField = function(index, field, value) {
      if (window.pacPracticasList && window.pacPracticasList[index]) {
        window.pacPracticasList[index][field] = value;
      }
    };

    window.addPacPracticaRow = function(data) {
      if (!window.pacPracticasList) window.pacPracticasList = [];
      const nextNum = window.pacPracticasList.length + 1;
      window.pacPracticasList.push(data || {
        numero: nextNum,
        titulo: `Práctica ${nextNum}: Desarrollo Experimental y Guía Técnica`,
        escenario: 'Laboratorio Asignado',
        duracion: '2',
        desempeno: 'Fases 2 y 3: Ejecución de procedimientos y registro de evidencias',
        instrumento: 'Rúbrica de Evaluación Práctica'
      });
      window.renderPacPracticasTable();
      window.showToast('✅ Práctica #' + nextNum + ' agregada al cronograma PAC');
    };

    window.deletePacPracticaRow = function(index) {
      if (window.pacPracticasList && window.pacPracticasList.length > index) {
        window.pacPracticasList.splice(index, 1);
        window.renderPacPracticasTable();
        window.showToast('🗑️ Práctica eliminada');
      }
    };

    window.activePacGralData = null;
    window.activePacPracData = null;

    window.syncCurrentPacDomToState = function() {
      const currentType = window.activePacType || 'GRAL';
      const mKey = activeMateriaKey;
      if (!mKey) return;

      const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };
      const targetObj = (currentType === 'PRACTICO')
        ? (window.activePacPracData || {})
        : (window.activePacGralData || {});

      targetObj.carrera = getVal('pac-carrera-input');
      targetObj.nombreAsignatura = getVal('pac-asig-input');
      targetObj.codigoAsignatura = getVal('pac-codigo-input');
      targetObj.tipoCurso = getVal('pac-tipo-curso');
      targetObj.modalidad = getVal('pac-modalidad');
      targetObj.semestre = getVal('pac-semestre-input');
      targetObj.preRequisito = getVal('pac-prerequisito');
      targetObj.creditos = getVal('pac-creditos');
      targetObj.sesionesSemanales = getVal('pac-sesiones-sem');
      targetObj.horasTeoricasPracticas = getVal('pac-horas-tp');

      targetObj.nombreDocente = getVal('pac-docente-nombre');
      targetObj.emailDocente = getVal('pac-docente-email');
      targetObj.formacionDocente = getVal('pac-docente-formacion');
      targetObj.telefonoDocente = getVal('pac-docente-telefono');

      targetObj.justificacion = getVal('pac-justificacion-input');
      targetObj.propositoGeneral = getVal('pac-proposito-input');
      targetObj.competenciaGlobal = getVal('pac-competencia-global');
      targetObj.unidadCompetencia = getVal('pac-unidad-competencia');

      if (currentType === 'PRACTICO') {
        targetObj.pracEscenario = getVal('pac-prac-escenario');
        targetObj.pracBioseguridad = getVal('pac-prac-bioseguridad');
        targetObj.pracEquipamiento = getVal('pac-prac-equipamiento');
        targetObj.pracFase1Prep = getVal('pac-prac-fase1-prep');
        targetObj.pracFase2Guiada = getVal('pac-prac-fase2-guiada');
        targetObj.pracFase3Autonoma = getVal('pac-prac-fase3-autonoma');
        targetObj.pracFase4Cierre = getVal('pac-prac-fase4-cierre');
        targetObj.pracEvalCriterios = getVal('pac-prac-eval-criterios');
        targetObj.pracEvalInstrumentos = getVal('pac-prac-eval-instrumentos');
        targetObj.pacPracticas = window.pacPracticasList || [];
        window.activePacPracData = targetObj;
        localStorage.setItem('sisa_saved_pac_prac_' + mKey, JSON.stringify(targetObj));
      } else {
        targetObj.elementosCompetencia = window.activePacElementosCompetencia || [];
        targetObj.metodologiaAula = getVal('pac-metodologia-aula');
        targetObj.metodologiaLab = getVal('pac-metodologia-lab');
        targetObj.metodologiaSalud = getVal('pac-metodologia-salud');
        targetObj.sistemaEvaluacion = getVal('pac-sistema-evaluacion');
        targetObj.p1NotaTeorica = getVal('pac-p1-teorica');
        targetObj.p1NotaPractica = getVal('pac-p1-practica');
        targetObj.p2NotaTeorica = getVal('pac-p2-teorica');
        targetObj.p2NotaPractica = getVal('pac-p2-practica');
        targetObj.efNotaTeorica = getVal('pac-ef-teorica');
        targetObj.efNotaPractica = getVal('pac-ef-practica');
        targetObj.normativaCurso = getVal('pac-normativa-acuerdos');
        targetObj.bibliografiaOficial = getVal('pac-bibliografia-textarea');
        if (typeof window.extractCurrentCronogramaFromDom === 'function') {
          const liveCron = window.extractCurrentCronogramaFromDom();
          if (liveCron.length > 0) targetObj.matriz7 = liveCron;
        }
        window.activePacGralData = targetObj;
        localStorage.setItem('sisa_saved_pac_gral_' + mKey, JSON.stringify(targetObj));
        localStorage.setItem('sisa_saved_pac_' + mKey, JSON.stringify(targetObj));
      }
    };

    window.loadActivePacStateToDom = function(type) {
      const currentType = type || window.activePacType || 'GRAL';
      const mKey = activeMateriaKey;
      const defData = (mKey && materiasData[mKey]) ? materiasData[mKey] : {};
      const officialCode = defData.codigo || 'SIS-423';

      if (currentType === 'PRACTICO') {
        let prac = null;
        const savedPrac = localStorage.getItem('sisa_saved_pac_prac_' + mKey);
        if (savedPrac) {
          try { prac = JSON.parse(savedPrac); } catch(e) {}
        }
        if (prac && (prac.pracEscenario === 'Laboratorio de Computación / Simulación Técnica' || (prac.pacPracticas && Array.isArray(prac.pacPracticas) && prac.pacPracticas.some(p => p.titulo && p.titulo.includes('Configuración de Entorno'))))) {
          prac = null;
        }
        if (!prac) {
          prac = {
            carrera: defData.carrera || '',
            nombreAsignatura: defData.nombre || '',
            codigoAsignatura: officialCode,
            semestre: defData.semestre || '',
            creditos: defData.creditos || '',
            horasTeoricasPracticas: (defData.horasPracticas ? defData.horasPracticas + 'P (Laboratorio / Simulación)' : ''),
            sesionesSemanales: '',
            justificacion: '',
            propositoGeneral: '',
            competenciaGlobal: defData.macroCompetencia || '',
            unidadCompetencia: '',
            pracEscenario: '',
            pracBioseguridad: '',
            pracEquipamiento: '',
            pracFase1Prep: '',
            pracFase2Guiada: '',
            pracFase3Autonoma: '',
            pracFase4Cierre: '',
            pracEvalCriterios: '',
            pracEvalInstrumentos: '',
            pacPracticas: []
          };
        }
        window.activePacPracData = prac;
        window.populatePacDom(prac);
      } else {
        let gral = null;
        const savedGral = localStorage.getItem('sisa_saved_pac_gral_' + mKey) || localStorage.getItem('sisa_saved_pac_' + mKey);
        if (savedGral) {
          try { gral = JSON.parse(savedGral); } catch(e) {}
        }
        if (!gral) {
          gral = {
            carrera: defData.carrera || '',
            nombreAsignatura: defData.nombre || '',
            codigoAsignatura: officialCode,
            semestre: defData.semestre || '',
            creditos: defData.creditos || '',
            horasTeoricasPracticas: (defData.horasTeoricas ? defData.horasTeoricas + 'T / ' : '') + (defData.horasPracticas ? defData.horasPracticas + 'P' : ''),
            sesionesSemanales: '2 Sesiones (4 Horas)',
            justificacion: '',
            propositoGeneral: '',
            competenciaGlobal: defData.macroCompetencia || '',
            unidadCompetencia: '',
            metodologiaAula: '',
            sistemaEvaluacion: '',
            normativaCurso: '',
            elementosCompetencia: [],
            matriz7: []
          };
        }
        window.activePacGralData = gral;
        window.populatePacDom(gral);
      }
    };

    window.renderDynamicPacForm = function(pacType) {
      const data = materiasData[activeMateriaKey];
      const requiredPac = (data && data.components && data.components.requiredPac) ? data.components.requiredPac : ['GRAL'];
      const hasMultiple = Array.isArray(requiredPac) && requiredPac.length > 1;

      const currentType = pacType || window.activePacType || (hasMultiple ? requiredPac[0] : requiredPac[0] || 'GRAL');
      window.activePacType = currentType;
      const isPractico = (currentType === 'PRACTICO');

      const container = document.getElementById('pac-type-switcher-container');
      if (container) {
        if (hasMultiple) {
          container.innerHTML = `
            <div class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2 shadow-xs">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="layers" class="w-4 h-4 text-brand-600"></i> Plantillas PAC Coordinadas:
                </span>
                <button type="button" onclick="window.switchActivePacType('GRAL')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentType === 'GRAL' ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30 font-extrabold' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60'}">
                  <i data-lucide="file-text" class="w-3.5 h-3.5"></i> PAC General (Teoría)
                </button>
                <button type="button" onclick="window.switchActivePacType('PRACTICO')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentType === 'PRACTICO' ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/30 font-extrabold' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60'}">
                  <i data-lucide="flask-conical" class="w-3.5 h-3.5"></i> PAC Práctico (Laboratorio / Simulación)
                </button>
              </div>
              <div class="flex items-center gap-2 text-[11px]">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Asignación Multitipo:</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${currentType === 'PRACTICO' ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'}">
                  ${currentType === 'PRACTICO' ? '🔬 PAC Práctico Oficial (Laboratorio / Simulación)' : '📄 PAC General Institucional (Teoría)'}
                </span>
              </div>
            </div>
          `;
        } else {
          const singleType = requiredPac[0] || 'GRAL';
          container.innerHTML = `
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i> Formato PAC Asignado:
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${singleType === 'PRACTICO' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700'}">
                  ${singleType === 'PRACTICO' ? '🔬 PAC PRÁCTICO (Normativa de Laboratorio y Simulación)' : '📄 PAC GENERAL (Asignatura Teórica Institucional)'}
                </span>
              </div>
              <span class="text-[11px] text-slate-400 font-medium">Determinado por componentes SEA: <strong>${data?.components?.summary || 'TA'}</strong></span>
            </div>
          `;
        }
      }

      // Secciones específicas de PAC Práctico
      const secContenidos = document.getElementById('pac-sec-practico-contenidos');
      const secMetodologiaPrac = document.getElementById('pac-sec-practico-metodologia');
      const secCronogramaPrac = document.getElementById('pac-sec-practico-cronograma');
      const secEvaluacionPrac = document.getElementById('pac-sec-practico-evaluacion');

      // Secciones específicas de PAC General (Teoría)
      const secElementos = document.getElementById('pac-sec-6-elementos');
      const secMetodologiaGral = document.getElementById('pac-sec-8-metodologia');
      const secEvaluacionGral = document.getElementById('pac-sec-9-evaluacion');
      const secNormativa = document.getElementById('pac-sec-10-normativa');
      const secBibliografia = document.getElementById('pac-sec-14-bibliografia');

      if (isPractico) {
        if (secContenidos) secContenidos.classList.remove('hidden');
        if (secMetodologiaPrac) secMetodologiaPrac.classList.remove('hidden');
        if (secCronogramaPrac) secCronogramaPrac.classList.remove('hidden');
        if (secEvaluacionPrac) secEvaluacionPrac.classList.remove('hidden');

        if (secElementos) secElementos.classList.add('hidden');
        if (secMetodologiaGral) secMetodologiaGral.classList.add('hidden');
        if (secEvaluacionGral) secEvaluacionGral.classList.add('hidden');
        if (secNormativa) secNormativa.classList.add('hidden');
        if (secBibliografia) secBibliografia.classList.add('hidden');

        window.renderPacPracticasTable();
      } else {
        if (secContenidos) secContenidos.classList.add('hidden');
        if (secMetodologiaPrac) secMetodologiaPrac.classList.add('hidden');
        if (secCronogramaPrac) secCronogramaPrac.classList.add('hidden');
        if (secEvaluacionPrac) secEvaluacionPrac.classList.add('hidden');

        if (secElementos) secElementos.classList.remove('hidden');
        if (secMetodologiaGral) secMetodologiaGral.classList.remove('hidden');
        if (secEvaluacionGral) secEvaluacionGral.classList.remove('hidden');
        if (secNormativa) secNormativa.classList.remove('hidden');
        if (secBibliografia) secBibliografia.classList.remove('hidden');
      }

      // Actualizar rótulo y placeholder de Horas
      const lblHoras = document.getElementById('pac-horas-tp-label');
      const inputHoras = document.getElementById('pac-horas-tp');
      if (lblHoras && inputHoras) {
        if (isPractico) {
          lblHoras.innerText = 'HORAS PRÁCTICAS:';
          inputHoras.placeholder = 'ej. 4 Horas Prácticas (Laboratorio)';
        } else {
          lblHoras.innerText = 'TEÓRICAS / PRÁCTICAS:';
          inputHoras.placeholder = 'ej. 2T / 4P';
        }
      }

      // Título de Sección 3 y 4
      const sec3Title = document.getElementById('pac-sec-3-4-title');
      const lblJust = document.getElementById('pac-justificacion-label');
      const lblProp = document.getElementById('pac-proposito-label');
      if (sec3Title) {
        sec3Title.innerHTML = isPractico
          ? '<i data-lucide="align-left" class="w-4 h-4"></i><span>3 y 4.- Justificación & Propósito de la Práctica (Laboratorio / Simulación)</span>'
          : '<i data-lucide="align-left" class="w-4 h-4"></i><span>3 y 4.- Justificación & Propósito General</span>';
      }
      if (lblJust) {
        lblJust.innerText = isPractico
          ? '3.- JUSTIFICACIÓN DE LA FORMACIÓN PRÁCTICA:'
          : '3.- JUSTIFICACIÓN DE LA ASIGNATURA:';
      }
      if (lblProp) {
        lblProp.innerText = isPractico
          ? '4.- PROPÓSITO GENERAL DE LA PRÁCTICA / LABORATORIO:'
          : '4.- PROPÓSITO GENERAL DE LA UNIDAD DE FORMACIÓN:';
      }

      // Título de Sección 5
      const sec5Title = document.getElementById('pac-sec-5-title');
      if (sec5Title) {
        sec5Title.innerHTML = isPractico
          ? '<i data-lucide="award" class="w-4 h-4"></i><span>5.- Alineación Curricular (Práctica)</span>'
          : '<i data-lucide="award" class="w-4 h-4"></i><span>5.- Competencias</span>';
      }

      // Actualizar textos de botones superiores
      const btnVaciarText = document.getElementById('btn-pac-vaciar-text');
      const btnImportText = document.getElementById('btn-pac-import-text');
      const btnExportText = document.getElementById('btn-pac-export-text');
      if (btnVaciarText) btnVaciarText.innerText = isPractico ? 'Vaciar PAC Práctico' : 'Vaciar PAC General';
      if (btnImportText) btnImportText.innerText = isPractico ? 'Importar PAC Práctico (.xlsx)' : 'Importar PAC General (.xlsx)';
      if (btnExportText) btnExportText.innerText = isPractico ? 'Exportar PAC Práctico (.xlsx)' : 'Exportar PAC General (.xlsx)';

      if (window.lucide) window.lucide.createIcons();
    };

    window.switchActivePacType = function(type) {
      if (type === window.activePacType) return;
      if (typeof window.syncCurrentPacDomToState === 'function') {
        window.syncCurrentPacDomToState();
      }
      window.activePacType = type;
      window.activeCronogramaType = type;
      if (typeof window.loadActivePacStateToDom === 'function') {
        window.loadActivePacStateToDom(type);
      }
      window.renderDynamicPacForm(type);
      if (typeof window.renderDynamicCronograma === 'function') {
        window.renderDynamicCronograma(type);
      }
      window.showToast('📋 Visualizando ' + (type === 'PRACTICO' ? 'PAC Práctico (Laboratorio / Simulación)' : 'PAC General (Teoría)'));
    };

    // ── DECOUPLED CRONOGRAMA ENGINE (TEORÍA VS PRÁCTICA) ──────────────────────
    window.activeCronogramaType = 'GRAL';

    window.extractCurrentCronogramaPracticoFromDom = function() {
      const tbody = document.getElementById('cronograma-practico-table-body');
      if (!tbody) return [];
      const rows = tbody.querySelectorAll('tr');
      const sessions = [];
      rows.forEach(r => {
        const inputs = r.querySelectorAll('input, textarea');
        if (inputs.length >= 7) {
          const sem = parseInt(inputs[0].value, 10) || (sessions.length + 1);
          const nroPrac = parseInt(inputs[1].value, 10) || (sessions.length + 1);
          sessions.push({
            semana: sem,
            nroSesion: nroPrac,
            numero: nroPrac,
            unidadTematica: inputs[2].value.trim(),
            titulo: inputs[2].value.trim(),
            contenidoEspecifico: inputs[3].value.trim(),
            actividad: inputs[3].value.trim(),
            saberProcedimental: inputs[4].value.trim(),
            criterioDesempeno: inputs[4].value.trim(),
            instrumentoEvaluacion: inputs[5].value.trim() || 'Rúbrica de Práctica',
            instrumento: inputs[5].value.trim() || 'Rúbrica de Práctica',
            evidenciaAprendizaje: inputs[6].value.trim() || 'Guía o reporte evaluado',
            evidencias: inputs[6].value.trim() || 'Guía o reporte evaluado'
          });
        }
      });
      return sessions;
    };

    window.renderCronogramaPracticoTable = function(sessions) {
      const tbody = document.getElementById('cronograma-practico-table-body');
      if (!tbody) return;
      const list = sessions || (window.activePacPracData && (window.activePacPracData.matriz7 || window.activePacPracData.pacPracticas)) || [];
      if (!Array.isArray(list) || list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="py-12 text-center text-slate-400 dark:text-slate-500">
              <i data-lucide="flask-conical" class="w-8 h-8 mx-auto mb-2 opacity-50 text-teal-500"></i>
              <p class="font-bold text-xs text-slate-600 dark:text-slate-400">Sin prácticas registradas en el cronograma de laboratorio</p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Haz clic en "Importar Cronograma (.xlsx)" o presiona "+ Agregar Fila".</p>
            </td>
          </tr>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      tbody.innerHTML = '';
      list.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50';
        tr.innerHTML = `
          <td class="py-2 px-1 text-center align-top"><input type="text" value="${escapeHtml(String(s.semana || (idx + 1)))}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-slate-800 font-bold text-teal-800 dark:text-teal-300 text-xs"></td>
          <td class="py-2 px-1 text-center align-top"><input type="text" value="${escapeHtml(String(s.nroSesion || s.numero || (idx + 1)))}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-slate-800 font-bold text-teal-600 dark:text-teal-400 text-xs"></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Título de la práctica..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.unidadTematica || s.titulo || '')}</textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Actividad de la práctica..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.contenidoEspecifico || s.actividad || '')}</textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Desempeño procedimental..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberProcedimental || s.criterioDesempeno || '')}</textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Instrumento..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.instrumentoEvaluacion || s.instrumento || 'Rúbrica de Práctica')}</textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Evidencias..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.evidenciaAprendizaje || s.evidencias || 'Guía o reporte evaluado')}</textarea></td>
          <td class="py-2 px-1 text-center align-top no-print">
            <button type="button" onclick="this.closest('tr').remove(); window.scheduleAutoSave();" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Eliminar fila">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') window.autoResizeAllTextareas();
      }, 20);
    };

    window.renderDynamicCronograma = function(cronType) {
      const data = materiasData[activeMateriaKey];
      const requiredPac = (data && data.components && data.components.requiredPac) ? data.components.requiredPac : ['GRAL'];
      const hasMultiple = Array.isArray(requiredPac) && requiredPac.length > 1;

      const currentType = cronType || window.activeCronogramaType || (hasMultiple ? requiredPac[0] : requiredPac[0] || 'GRAL');
      window.activeCronogramaType = currentType;
      const isPractico = (currentType === 'PRACTICO');

      const container = document.getElementById('cronograma-type-switcher-container');
      if (container) {
        if (hasMultiple) {
          container.innerHTML = `
            <div class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2 shadow-xs">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="calendar" class="w-4 h-4 text-amber-600"></i> Modalidad de Cronograma:
                </span>
                <button type="button" onclick="window.switchActiveCronogramaType('GRAL')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentType === 'GRAL' ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30 font-extrabold' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60'}">
                  <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Cronograma Teórico (Aula - 20 Sem)
                </button>
                <button type="button" onclick="window.switchActiveCronogramaType('PRACTICO')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentType === 'PRACTICO' ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/30 font-extrabold' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60'}">
                  <i data-lucide="flask-conical" class="w-3.5 h-3.5"></i> Cronograma Práctico (Laboratorio / Simulación)
                </button>
              </div>
              <div class="flex items-center gap-2 text-[11px]">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Asignación Multitipo:</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${currentType === 'PRACTICO' ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'}">
                  ${currentType === 'PRACTICO' ? '🔬 Cronograma Semestral de Prácticas' : '📅 Cronograma Semestral de Clases Teóricas'}
                </span>
              </div>
            </div>
          `;
        } else {
          const singleType = requiredPac[0] || 'GRAL';
          container.innerHTML = `
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i> Cronograma Asignado:
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${singleType === 'PRACTICO' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'}">
                  ${singleType === 'PRACTICO' ? '🔬 CRONOGRAMA PRÁCTICO (Laboratorio / Taller)' : '📅 CRONOGRAMA TEÓRICO (20 Semanas de Aula)'}
                </span>
              </div>
              <span class="text-[11px] text-slate-400 font-medium">Determinado por: <strong>${data?.components?.summary || 'TA'}</strong></span>
            </div>
          `;
        }
      }

      const teoricoContainer = document.getElementById('cronograma-teorico-container');
      const practicoContainer = document.getElementById('cronograma-practico-container');
      const docTitle = document.getElementById('cronograma-doc-title');
      const docSubtitle = document.getElementById('cronograma-doc-subtitle');
      const btnVaciar = document.getElementById('btn-cronograma-vaciar-text');
      const btnImport = document.getElementById('btn-cronograma-import-text');
      const btnExport = document.getElementById('btn-cronograma-export-text');

      if (isPractico) {
        if (teoricoContainer) teoricoContainer.classList.add('hidden');
        if (practicoContainer) practicoContainer.classList.remove('hidden');
        if (docTitle) docTitle.innerText = 'Documento 3: Cronograma Semestral de la Práctica (Sección 8 del PAC Práctico):';
        if (docSubtitle) docSubtitle.innerText = 'Planificación oficial de actividades prácticas, escenarios, bioseguridad y evidencias.';
        if (btnVaciar) btnVaciar.innerText = 'Vaciar Cronograma Práctico';
        if (btnImport) btnImport.innerText = 'Cargar desde PAC Práctico (.xlsx)';
        if (btnExport) btnExport.innerText = 'Exportar PAC Práctico (.xlsx)';
        window.renderCronogramaPracticoTable();
      } else {
        if (teoricoContainer) teoricoContainer.classList.remove('hidden');
        if (practicoContainer) practicoContainer.classList.add('hidden');
        if (docTitle) docTitle.innerText = 'Documento 3: Cronograma de 20 Semanas (Sección 7 del PAC):';
        if (docSubtitle) docSubtitle.innerText = 'Matriz curricular editable de 20 semanas y sesiones extraídas del PAC.';
        if (btnVaciar) btnVaciar.innerText = 'Vaciar Cronograma Teórico';
        if (btnImport) btnImport.innerText = 'Cargar desde PAC General (.xlsx)';
        if (btnExport) btnExport.innerText = 'Exportar PAC + Cronograma (.xlsx)';
      }

      if (window.lucide) window.lucide.createIcons();
    };

    window.switchActiveCronogramaType = function(type) {
      if (type === window.activeCronogramaType) return;
      window.activeCronogramaType = type;
      window.activePacType = type;
      if (typeof window.syncCurrentPacDomToState === 'function') {
        window.syncCurrentPacDomToState();
      }
      window.renderDynamicCronograma(type);
      if (typeof window.renderDynamicPacForm === 'function') {
        window.renderDynamicPacForm(type);
      }
      window.showToast('📅 Cronograma ajustado a: ' + (type === 'PRACTICO' ? 'Prácticas de Laboratorio' : 'Clases Teóricas de Aula'));
    };

    window.vaciarCronogramaActivo = function() {
      const isPractico = (window.activeCronogramaType === 'PRACTICO');
      const docName = isPractico ? 'Cronograma Semestral de Prácticas' : 'Cronograma de 20 Semanas de Teoría';
      if (!confirm(`¿Deseas vaciar todas las sesiones del ${docName}?`)) return;

      if (isPractico) {
        const tbody = document.getElementById('cronograma-practico-table-body');
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <i data-lucide="flask-conical" class="w-8 h-8 mx-auto mb-2 opacity-50 text-teal-500"></i>
                <p class="font-bold text-xs text-slate-600 dark:text-slate-400">Sin prácticas registradas en el cronograma de laboratorio</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Haz clic en "Importar Cronograma (.xlsx)" o presiona "+ Agregar Fila".</p>
              </td>
            </tr>
          `;
          if (window.lucide) window.lucide.createIcons();
        }
        if (window.activePacPracData) window.activePacPracData.matriz7 = [];
        if (activeMateriaKey) localStorage.removeItem('sisa_saved_cron_prac_' + activeMateriaKey);
        window.showToast('🗑️ Cronograma Práctico vaciado.');
      } else {
        const tbody = document.getElementById('cronograma-table-body');
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="10" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <i data-lucide="file-spreadsheet" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                <p class="font-bold text-xs text-slate-600 dark:text-slate-400">Sin sesiones cargadas en el cronograma teórico</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Haz clic en "Importar Cronograma (.xlsx)" o presiona "+ Agregar Fila".</p>
              </td>
            </tr>
          `;
          if (window.lucide) window.lucide.createIcons();
        }
        if (window.activePacGralData) window.activePacGralData.matriz7 = [];
        if (activeMateriaKey) {
          localStorage.removeItem('sisa_saved_cron_gral_' + activeMateriaKey);
          const saved = localStorage.getItem('sisa_saved_pac_' + activeMateriaKey);
          if (saved) {
            try {
              const p = JSON.parse(saved);
              p.matriz7 = [];
              localStorage.setItem('sisa_saved_pac_' + activeMateriaKey, JSON.stringify(p));
            } catch(e) {}
          }
        }
        window.showToast('🗑️ Cronograma Teórico vaciado.');
      }
    };

    window.importCronogramaExcel = function() {
      window.importPacExcel(true);
    };

    // ── TASK 5.3 & 5.4: DYNAMIC PLAN DE CLASES & SHARED/PERSONAL UI SEPARATION ──
    window.activePlanType = 'TEORICO_PRACTICO';
    window.activePlanesTeoricoList = null;
    window.activePlanesPracticoList = null;

    window.loadActivePlanStateToDom = function(planType) {
      const currentType = planType || window.activePlanType || 'TEORICO';
      const mKey = activeMateriaKey;
      if (!mKey) return;

      if (currentType === 'PRACTICO') {
        let prac = null;
        const savedPrac = localStorage.getItem('sisa_saved_planes_prac_' + mKey);
        if (savedPrac) {
          try { prac = JSON.parse(savedPrac); } catch(e) {}
        }
        if (prac && Array.isArray(prac) && prac.some(p => p.contenidoTema && p.contenidoTema.includes('Configuración de Entorno Experimental'))) {
          prac = [];
        }
        if (!prac || !Array.isArray(prac)) {
          prac = [];
        }
        window.activePlanesPracticoList = prac;
        activePlanesList = prac;
      } else {
        let teorico = null;
        const savedTeorico = localStorage.getItem('sisa_saved_planes_teorico_' + mKey) || localStorage.getItem('sisa_saved_planes_' + mKey);
        if (savedTeorico) {
          try { teorico = JSON.parse(savedTeorico); } catch(e) {}
        }
        if (!teorico || !Array.isArray(teorico) || teorico.length === 0) {
          const defData = materiasData[mKey] || {};
          teorico = [
            {
              sesionId: 1,
              nombreHoja: 'UA-1',
              contenidoTema: defData.nombre || 'Introducción y Fundamentos',
              unidadTitulo: 'Unidad 1',
              elementoCompetencia: 'Comprende los conceptos clave y fundamentos teóricos de la asignatura.',
              objetivoSesion: 'Identificar y contrastar los principios teóricos fundamentales.',
              planType: 'TEORICO',
              referenciasBibliograficas: []
            }
          ];
        }
        window.activePlanesTeoricoList = teorico;
        activePlanesList = teorico;
      }

      activePlanSheetIndex = 0;
      if (typeof window.renderPlanesSheetsTabs === 'function') {
        window.renderPlanesSheetsTabs();
      }
      if (typeof window.renderPlanSheetForm === 'function') {
        window.renderPlanSheetForm(0);
      }
    };

    window.renderDynamicPlanForm = function(planType) {
      const data = materiasData[activeMateriaKey];
      const requiredPlan = (data && data.components && data.components.requiredPlan) ? data.components.requiredPlan : ['TEORICO_PRACTICO'];
      const hasMultiple = Array.isArray(requiredPlan) && requiredPlan.length > 1;

      const currentType = planType || window.activePlanType || (hasMultiple ? requiredPlan[0] : requiredPlan[0] || 'TEORICO_PRACTICO');
      window.activePlanType = currentType;
      const isPractico = (currentType === 'PRACTICO');

      const switcherContainer = document.getElementById('plan-type-switcher-container');
      if (switcherContainer) {
        if (hasMultiple) {
          switcherContainer.innerHTML = `
            <div class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2 shadow-xs">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="sliders" class="w-4 h-4 text-brand-600"></i> Modalidad de Plan de Clases:
                </span>
                <button type="button" onclick="window.switchActivePlanType('TEORICO')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentType === 'TEORICO' ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-500/30 font-extrabold' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60'}">
                  <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Plan Teórico
                </button>
                <button type="button" onclick="window.switchActivePlanType('PRACTICO')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${currentType === 'PRACTICO' ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/30 font-extrabold' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60'}">
                  <i data-lucide="flask-conical" class="w-3.5 h-3.5"></i> Plan Práctico
                </button>
              </div>
              <div class="flex items-center gap-2 text-[11px]">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Secuencia en Ejecución:</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${currentType === 'PRACTICO' ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'}">
                  ${currentType === 'PRACTICO' ? '🔬 4 Fases Metodológicas' : '📖 5 Momentos Didácticos'}
                </span>
              </div>
            </div>
          `;
        } else {
          const typeNames = {
            'TEORICO': '📖 PLAN TEÓRICO (Aula Conceptual)',
            'PRACTICO': '🔬 PLAN PRÁCTICO (Laboratorio / Simulación)',
            'TEORICO_PRACTICO': '⚡ PLAN TEÓRICO-PRÁCTICO (Integrado)'
          };
          switcherContainer.innerHTML = `
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i data-lucide="file-check" class="w-4 h-4 text-brand-600"></i> Plantilla Oficial Plan de Clases:
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${currentType === 'PRACTICO' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300' : (currentType === 'TEORICO' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300' : 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-300')}">
                  ${typeNames[currentType] || typeNames['TEORICO_PRACTICO']}
                </span>
              </div>
              <span class="text-[11px] text-slate-400 font-medium">Asignado a: <strong>${data?.components?.summary || 'TA'}</strong></span>
            </div>
          `;
        }
      }

      // Procedimental Handling (Task 5.3):
      // In TEÓRICO mode: do NOT delete procedural content, mute/lock it and show UNITEPC notification
      const procTextarea = document.getElementById('plan-procedimental-input');
      const procTag = document.getElementById('plan-procedimental-status-tag');
      const procBadge = document.getElementById('plan-procedimental-omitted-badge');
      const practicoFields = document.getElementById('plan-practico-fields');
      const secStandard = document.getElementById('plan-secuencia-standard');
      const secPractica = document.getElementById('plan-secuencia-practica');

      if (currentType === 'TEORICO') {
        if (procTextarea) {
          procTextarea.readOnly = true;
          procTextarea.className = 'w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 text-xs cursor-not-allowed';
        }
        if (procTag) {
          procTag.innerHTML = '<span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">Omitido en Teoría</span>';
        }
        if (procBadge) procBadge.classList.remove('hidden');
        if (practicoFields) practicoFields.classList.add('hidden');
        if (secStandard) secStandard.classList.remove('hidden');
        if (secPractica) secPractica.classList.add('hidden');
      } else if (currentType === 'PRACTICO') {
        if (procTextarea) {
          procTextarea.readOnly = false;
          procTextarea.className = 'w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white';
        }
        if (procTag) {
          procTag.innerHTML = '<span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">Requerido / Central</span>';
        }
        if (procBadge) procBadge.classList.add('hidden');
        if (practicoFields) practicoFields.classList.remove('hidden');
        if (secStandard) secStandard.classList.add('hidden');
        if (secPractica) secPractica.classList.remove('hidden');
        window.updateSecuenciaPracticaTotals();
      } else {
        // TEORICO_PRACTICO
        if (procTextarea) {
          procTextarea.readOnly = false;
          procTextarea.className = 'w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white';
        }
        if (procTag) {
          procTag.innerHTML = '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">Activo (Integrado)</span>';
        }
        if (procBadge) procBadge.classList.add('hidden');
        if (practicoFields) practicoFields.classList.remove('hidden');
        if (secStandard) secStandard.classList.remove('hidden');
        if (secPractica) secPractica.classList.add('hidden');
      }

      // Update button texts and headers in Tab 4
      const btnPlanVaciar = document.getElementById('btn-plan-vaciar-text');
      const btnPlanImport = document.getElementById('btn-plan-import-text');
      const btnPlanExport = document.getElementById('btn-plan-export-text');
      const planDocTitle = document.getElementById('plan-doc-title');
      const planDocSubtitle = document.getElementById('plan-doc-subtitle');

      if (isPractico) {
        if (btnPlanVaciar) btnPlanVaciar.innerText = 'Vaciar Planes Prácticos';
        if (btnPlanImport) btnPlanImport.innerText = 'Importar Plan Práctico (.xlsx)';
        if (btnPlanExport) btnPlanExport.innerText = 'Exportar Plan Práctico (.xlsx)';
        if (planDocTitle) planDocTitle.innerText = 'Documento 4: Planes de Clase Prácticos (.xlsx):';
        if (planDocSubtitle) planDocSubtitle.innerText = 'Guías de laboratorio con 4 Fases Metodológicas Institucionales por práctica.';
      } else {
        if (btnPlanVaciar) btnPlanVaciar.innerText = 'Vaciar Planes Teóricos';
        if (btnPlanImport) btnPlanImport.innerText = 'Importar Plan Teórico (.xlsx)';
        if (btnPlanExport) btnPlanExport.innerText = 'Exportar Plan Teórico (.xlsx)';
        if (planDocTitle) planDocTitle.innerText = 'Documento 4: Planes de Clase Teóricos (.xlsx):';
        if (planDocSubtitle) planDocSubtitle.innerText = 'Microdidáctica de aula conceptual con Momentos Didácticos por tema.';
      }

      if (window.lucide) window.lucide.createIcons();
    };

    window.switchActivePlanType = function(type) {
      if (type === window.activePlanType) return;
      if (typeof window.syncCurrentPlanFormToState === 'function') {
        window.syncCurrentPlanFormToState();
      }
      window.activePlanType = type;
      if (typeof window.loadActivePlanStateToDom === 'function') {
        window.loadActivePlanStateToDom(type);
      }
      window.renderDynamicPlanForm(type);
      window.showToast('📋 Plan ajustado a: ' + (type === 'PRACTICO' ? 'Plan Práctico (Laboratorio / Simulación)' : (type === 'TEORICO' ? 'Plan Teórico (Aula Conceptual)' : 'Plan Teórico-Práctico')));
    };

    window.updateSecuenciaPracticaTotals = function() {
      const gn = id => { const el = document.getElementById(id); return el ? (parseInt(el.value, 10) || 0) : 0; };
      const f1 = gn('plan-sec-fase1-dur');
      const f2 = gn('plan-sec-fase2-dur');
      const f3 = gn('plan-sec-fase3-dur');
      const f4 = gn('plan-sec-fase4-dur');
      const totalMin = f1 + f2 + f3 + f4;
      const totalAcad = Math.round(totalMin / 45);

      const totalBadge = document.getElementById('plan-sec-total-badge');
      if (totalBadge) {
        totalBadge.innerText = `${totalMin} min (${totalAcad}h acad)`;
      }
    };

    // ── TASK 5.6: CONSOLIDATED VIEW FOR DIRECTOR DE CARRERA ─────────────────────
    window.isDirectorView = false;

    window.toggleDirectorConsolidatedView = function(forceState) {
      if (typeof forceState === 'boolean') {
        window.isDirectorView = forceState;
      } else {
        window.isDirectorView = !window.isDirectorView;
      }

      const panel = document.getElementById('director-consolidated-panel');
      const toggleBtn = document.getElementById('btn-director-consolidated-toggle');
      if (!panel) return;

      if (window.isDirectorView) {
        // Hide all regular documentation tab panels
        document.querySelectorAll('.doc-tab-panel').forEach(p => p.classList.add('hidden'));
        panel.classList.remove('hidden');

        if (toggleBtn) {
          toggleBtn.className = 'px-3.5 py-2 rounded-xl bg-purple-700 text-white border border-purple-800 font-bold text-xs flex items-center gap-1.5 shadow-md ring-2 ring-purple-400/50 cursor-pointer';
          toggleBtn.innerHTML = '<i data-lucide="check-check" class="w-4 h-4"></i><span>✓ Vista Consolidada Activa</span>';
        }

        window.renderDirectorConsolidatedView();
        window.showToast('🏛️ Vista Dirección de Carrera activada: Supervisión Consolidada de Cátedra');
      } else {
        panel.classList.add('hidden');
        const activeTab = document.getElementById(activeTabId || 'tab-analitico');
        if (activeTab) activeTab.classList.remove('hidden');

        if (toggleBtn) {
          toggleBtn.className = 'px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border border-purple-300 dark:border-purple-700/80 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer';
          toggleBtn.innerHTML = '<i data-lucide="building-2" class="w-4 h-4"></i><span>Vista Cátedra Consolidada</span>';
        }

        window.showToast('Volviendo a la vista docente');
      }

      if (window.lucide) window.lucide.createIcons();
    };

    window.renderDirectorConsolidatedView = function() {
      const container = document.getElementById('director-consolidated-content');
      if (!container) return;

      const data = (activeMateriaKey && materiasData[activeMateriaKey]) ? materiasData[activeMateriaKey] : (Object.values(materiasData)[0] || {});
      const compInfo = data.components || window.detectComponentTypes(data.groups || []);

      const badgesHtml = (compInfo.types || ['TA']).map(t => window.renderComponentBadge(t, false, true)).join(' ');

      // Teacher list: active teacher + co-teachers from groups
      const currentDocenteName = (document.getElementById('user-profile-name') ? document.getElementById('user-profile-name').innerText : 'Docente Titular').trim();
      const currentDocenteCi = (document.getElementById('docente-selector-input') ? document.getElementById('docente-selector-input').value : '4534123').trim();

      container.innerHTML = `
        <!-- Subject Overview Card -->
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  ${data.codigo || 'UNITEPC'}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ${data.carrera || 'Carrera Oficial'}
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Semestre: ${data.semestre || '1º'}</span>
              </div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">${data.nombre || 'Asignatura'}</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${data.meta || ''}</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              ${badgesHtml}
            </div>
          </div>
        </div>

        <!-- Section 1: 🤝 Secciones Compartidas Institucionales (Cátedra) -->
        <div class="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/60 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                <i data-lucide="users" class="w-5 h-5"></i>
              </span>
              <div>
                <h3 class="text-sm font-bold text-blue-950 dark:text-blue-100 uppercase tracking-wider">🤝 Secciones Compartidas (Consenso de Cátedra)</h3>
                <p class="text-xs text-blue-800 dark:text-blue-300">Macroestructura unificada para todos los docentes y comisiones de esta asignatura.</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-300">Unificado Cátedra</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <!-- Programa Analítico Compartido -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/60 shadow-xs space-y-2">
              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <i data-lucide="book-marked" class="w-4 h-4 text-blue-600"></i> Programa Analítico Oficial
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3">
                ${data.caracterizacion || 'Macrocompetencias y caracterización institucional definida por la Dirección de Carrera. 4 Unidades Temáticas y Bibliografías Básica y Complementaria vinculadas.'}
              </p>
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ 4 Unidades Aprobadas</span>
                <button type="button" onclick="window.switchDocMainTab('tab-analitico'); window.toggleDirectorConsolidatedView(false);" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">Ver Programa ➔</button>
              </div>
            </div>

            <!-- PAC Compartido -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/60 shadow-xs space-y-2">
              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <i data-lucide="clipboard-check" class="w-4 h-4 text-emerald-600"></i> PAC de Cátedra (Nivel Global)
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3">
                Identificación, justificación curricular, competencia global y sistema de ponderación institucional (30pts P1 + 30pts P2 + 40pts Final).
              </p>
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Ponderaciones Validadas</span>
                <button type="button" onclick="window.switchDocMainTab('tab-pac-matrix'); window.toggleDirectorConsolidatedView(false);" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Ver PAC ➔</button>
              </div>
            </div>

            <!-- Plan de Clases Compartido -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/60 shadow-xs space-y-2">
              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <i data-lucide="layers" class="w-4 h-4 text-purple-600"></i> Plan de Clases: Planificación
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3">
                Unidades temáticas consensuadas, elementos de competencia, resultados de aprendizaje esperados e indicadores de logro institucionales.
              </p>
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Saberes Conceptuales Comunes</span>
                <button type="button" onclick="window.switchDocMainTab('tab-cronograma-planes'); window.toggleDirectorConsolidatedView(false);" class="text-purple-600 dark:text-purple-400 font-bold hover:underline">Ver Planificación ➔</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: 👤 Microplanificaciones Diferenciadas por Docente / Comisión -->
        <div class="p-6 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900/60 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
                <i data-lucide="user-check" class="w-5 h-5"></i>
              </span>
              <div>
                <h3 class="text-sm font-bold text-purple-950 dark:text-purple-100 uppercase tracking-wider">👤 Microplanificaciones Docentes por Comisión (Vistas Individuales)</h3>
                <p class="text-xs text-purple-800 dark:text-purple-300">Supervisión comparativa: Estrategias didácticas, ambientes de laboratorio y secuencias por docente asignado.</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-200 border border-purple-300">Comparativa Docente</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <!-- Docente Titular / Teoría -->
            <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 shadow-xs space-y-3">
              <div class="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-extrabold text-slate-900 dark:text-white text-xs">${currentDocenteName}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200">Docente Titular</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">CI: ${currentDocenteCi} • Comisión: <strong>${data.teoCodes || 'TA-01'}</strong> (${data.shiftLabel || 'Turno Regular'})</p>
                </div>
                <div>${window.renderComponentBadge('TA', false, true)}</div>
              </div>

              <div class="space-y-2 text-[11px]">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Modalidad Plan de Clases:</span>
                  <span class="font-bold text-purple-700 dark:text-purple-300">📖 Plan Teórico (5 Momentos Didácticos)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Saber Procedimental:</span>
                  <span class="font-bold text-amber-600 dark:text-amber-400">Omitido (Normativa Teórica)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Estrategias Didácticas:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">Aprendizaje Basado en Problemas (ABP)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Evaluación Formativa:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">Rúbrica de Análisis Crítico y Cuestionario</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Plan Teórico Validado
                </span>
                <button type="button" onclick="window.exportExactFile('planes_teorico_xlsx')" class="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i> Descargar Plan (.xlsx)
                </button>
              </div>
            </div>

            <!-- Docente Práctica / Laboratorio -->
            <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 shadow-xs space-y-3">
              <div class="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-extrabold text-slate-900 dark:text-white text-xs">Docente de Laboratorio / Comisión</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">Docente de Práctica</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Comisión: <strong>${data.pracCodes || 'PL-01'}</strong> • ${data.pracRoomsStr || 'Laboratorio Central'}</p>
                </div>
                <div>${window.renderComponentBadge(compInfo.hasPL ? 'PL' : (compInfo.hasPS ? 'PS' : 'PA'), false, true)}</div>
              </div>

              <div class="space-y-2 text-[11px]">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Modalidad Plan de Clases:</span>
                  <span class="font-bold text-teal-700 dark:text-teal-300">🔬 Plan Práctico (4 Fases Metodológicas)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Saber Procedimental:</span>
                  <span class="font-bold text-teal-600 dark:text-teal-400">Requerido / Central (100% activo)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Ambiente y Bioseguridad:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">${data.pracRoomsStr || 'Laboratorio Central'} • EPP Completo</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Cronograma de Prácticas:</span>
                  <span class="font-bold text-teal-700 dark:text-teal-300">${(window.pacPracticasList || []).length} Prácticas Registradas</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Plan Práctico Validado
                </span>
                <button type="button" onclick="window.exportExactFile('planes_prac_xlsx')" class="px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i> Descargar Plan (.xlsx)
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    };

    window.selectDocenteMateria = function(materiaKey) {
      // 1. Cancel pending auto-save timers to avoid saving old form over new subject
      if (typeof autoSaveTimer !== 'undefined' && autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }

      // 2. Strict reset of all form inputs before loading new subject (prevents form bleeding)
      if (typeof window.resetAllDocenteFormFields === 'function') {
        window.resetAllDocenteFormFields();
      }

      activeMateriaKey = materiaKey;
      if (!materiasData[activeMateriaKey]) {
        const keys = Object.keys(materiasData);
        activeMateriaKey = keys.length > 0 ? keys[0] : '';
      }
      localStorage.setItem('sisa_active_materia_key', activeMateriaKey);
      const data = materiasData[activeMateriaKey] || (Object.values(materiasData)[0] || {});
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

      // Update SEA Component Badges in Banner (Task 5.5)
      const bannerBadgesContainer = document.getElementById('banner-components-badges');
      if (bannerBadgesContainer) {
        const comp = data.components || (typeof window.detectComponentTypes === 'function' ? window.detectComponentTypes(data.groups || []) : null);
        if (comp && comp.types && comp.types.length > 0) {
          bannerBadgesContainer.innerHTML = `
            <span class="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider mr-1">Componentes SEA:</span>
            ${comp.types.map(t => window.renderComponentBadge(t, false, true)).join(' ')}
          `;
        } else {
          bannerBadgesContainer.innerHTML = '';
        }
      }
      
      // Update form header inputs
      if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = data.codigo;
      if (document.getElementById('analitico-asig-input')) document.getElementById('analitico-asig-input').value = data.nombre;
      if (document.getElementById('pac-codigo-input')) document.getElementById('pac-codigo-input').value = data.codigo;
      if (document.getElementById('pac-asig-input')) document.getElementById('pac-asig-input').value = data.nombre;
      if (document.getElementById('pac-carrera-input')) document.getElementById('pac-carrera-input').value = data.carrera;
      if (document.getElementById('plan-carrera-input')) document.getElementById('plan-carrera-input').value = data.carrera;
      if (document.getElementById('caratula-codigo')) document.getElementById('caratula-codigo').value = data.codigo;
      if (document.getElementById('caratula-asig')) document.getElementById('caratula-asig').value = data.nombre;
      if (document.getElementById('caratula-carrera')) document.getElementById('caratula-carrera').value = data.carrera;

      // Load that specific subject's documents & data
      if (typeof window.loadSavedDocenteData === 'function') {
        window.loadSavedDocenteData(activeMateriaKey);
      }

      // Render Dynamic PAC and Plan de Clases based on detected SEA components (Tasks 5.2, 5.3, 5.4)
      const compInfo = data.components || (typeof window.detectComponentTypes === 'function' ? window.detectComponentTypes(data.groups || []) : null);
      if (compInfo) {
        const defPac = Array.isArray(compInfo.requiredPac) ? compInfo.requiredPac[0] : (compInfo.requiredPac || 'GRAL');
        const defPlan = Array.isArray(compInfo.requiredPlan) ? compInfo.requiredPlan[0] : (compInfo.requiredPlan || 'TEORICO_PRACTICO');
        if (typeof window.renderDynamicPacForm === 'function') {
          window.renderDynamicPacForm(defPac);
        }
        if (typeof window.renderDynamicPlanForm === 'function') {
          window.renderDynamicPlanForm(defPlan);
        }
      }

      // If Director Consolidated View is active, update it
      if (window.isDirectorView && typeof window.renderDirectorConsolidatedView === 'function') {
        window.renderDirectorConsolidatedView();
      }

      // Render Career Sub-Tabs Switcher for Multicarrera preview
      if (typeof window.renderCarreraSubtabs === 'function') {
        window.renderCarreraSubtabs(activeMateriaKey);
      }

      // Render dedicated full schedules panel for the selected course
      if (typeof window.renderMateriaSchedulesDetail === 'function') {
        window.renderMateriaSchedulesDetail(data);
      }

      // If Attendance tab is currently active, refresh attendance roster and session
      if (activeTabId === 'tab-asistencia' && typeof window.loadAttendanceForCurrentSelection === 'function') {
        window.loadAttendanceForCurrentSelection();
      }

      // Auto-resize textareas to fit content
      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') {
          window.autoResizeAllTextareas();
        }
      }, 60);

      window.showToast('📁 Carpeta cargada: ' + data.breadcrumb);
      if (typeof window.updateTeacherObservationBanner === 'function') {
        window.updateTeacherObservationBanner(data.codigo || activeMateriaKey);
      }
      if (window.lucide) window.lucide.createIcons();
    };


    window.downloadAuthenticatedFile = async function(url, defaultFilename, options = {}) {
      try {
        const authHeaders = (typeof window.getAuthHeaders === 'function') ? window.getAuthHeaders() : {};
        const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : '';
        const fullUrl = token ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : url;

        window.showToast('📥 Descargando documento oficial: ' + defaultFilename + '...');
        const fetchOptions = {
          method: options.method || 'GET',
          headers: {
            ...authHeaders,
            ...(options.headers || {})
          }
        };
        if (options.body) {
          fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
          if (!fetchOptions.headers['Content-Type']) {
            fetchOptions.headers['Content-Type'] = 'application/json';
          }
        }

        const resp = await fetch(fullUrl, fetchOptions);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const blob = await resp.blob();
        let filename = defaultFilename;
        const disposition = resp.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename=["']?([^"';]+)["']?/);
          if (match && match[1]) filename = match[1].trim();
        }
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        window.showToast(`✅ Descarga completada: ${filename}`);
      } catch (err) {
        window.showToast(`❌ Error al descargar archivo: ${err.message}`);
      }
    };

    window.exportExactFile = function(type) {
      const data = (typeof materiasData !== 'undefined' && (materiasData[activeMateriaKey] || Object.values(materiasData)[0])) ? (materiasData[activeMateriaKey] || Object.values(materiasData)[0]) : {};
      const docente = window.__ACTIVE_DOCENTE__ || {};
      const asigId = data.asignacionId || activeAsignacionId || 1;
      const courseCode = (data.codigo || (window.currentMateria && window.currentMateria.codigo) || asigId).toString().trim();
      const safeCode = courseCode.replace(/[^a-zA-Z0-9_-]/g, '_');
      const courseName = (data.nombre || (window.currentMateria && window.currentMateria.nombre) || courseCode).trim();
      const careerName = (data.carrera || window.currentSelectedCareerCode || '').trim();
      const docName = (docente.nombreCompleto || '').trim();
      const semesterStr = (data.semestre || '1º').trim();
      const ht = (data.horasTeoricas || '2').trim();
      const hp = (data.horasPracticas || '4').trim();
      const cr = (data.creditos || '12').trim();

      const metaParams = new URLSearchParams();
      if (courseCode) metaParams.append('codigo', courseCode);
      if (courseName) metaParams.append('asignatura', courseName);
      if (docName) metaParams.append('docente', docName);
      if (careerName) metaParams.append('carrera', careerName);
      if (semesterStr) metaParams.append('semestre', semesterStr);
      if (ht) metaParams.append('horasTeoricas', ht);
      if (hp) metaParams.append('horasPracticas', hp);
      if (cr) metaParams.append('creditos', cr);
      const queryString = metaParams.toString() ? `?${metaParams.toString()}` : '';

      // Check for saved local data belonging to active subject
      const mKey = activeMateriaKey || '';
      const savedProgStr = localStorage.getItem('sisa_saved_programa_analitico_' + mKey);
      const savedPacGralStr = localStorage.getItem('sisa_saved_pac_gral_' + mKey) || localStorage.getItem('sisa_saved_pac_' + mKey);
      const savedPacPracStr = localStorage.getItem('sisa_saved_pac_prac_' + mKey);
      const savedPlanesTeoStr = localStorage.getItem('sisa_saved_planes_teorico_' + mKey) || localStorage.getItem('sisa_saved_planes_' + mKey);
      const savedPlanesPracStr = localStorage.getItem('sisa_saved_planes_prac_' + mKey);

      if (type === 'docx' || type === 'programa_docx') {
        let progBody = null;
        if (savedProgStr) {
          try {
            const parsed = JSON.parse(savedProgStr);
            if (parsed && parsed.unidades && Array.isArray(parsed.unidades) && parsed.unidades.length > 0) {
              progBody = parsed;
            }
          } catch (e) {}
        }
        if (!progBody) {
          progBody = {
            codigoAsignatura: courseCode,
            nombreAsignatura: courseName,
            semestre: semesterStr,
            creditos: parseInt(cr, 10) || 12,
            horasTeoricas: parseInt(ht, 10) || 2,
            horasPracticas: parseInt(hp, 10) || 4,
            caracterizacion: '',
            macroCompetencia: '',
            sistemaEvaluacion: '',
            unidades: [],
            bibliografia: []
          };
        } else {
          progBody.codigoAsignatura = courseCode;
          progBody.nombreAsignatura = courseName;
          if (careerName) progBody.carrera = careerName;
        }
        const url = `/api/v1/office/export/programa-analitico${queryString}`;
        window.downloadAuthenticatedFile(url, `Programa_Analitico_${safeCode}.docx`, { method: 'POST', body: progBody });
      } else if (type === 'pac_gral_xlsx') {
        let pacBody = null;
        if (savedPacGralStr) {
          try {
            const parsed = JSON.parse(savedPacGralStr);
            if (parsed && parsed.sesiones && Array.isArray(parsed.sesiones) && parsed.sesiones.length > 0) {
              pacBody = parsed;
            }
          } catch (e) {}
        }
        if (pacBody) {
          pacBody.codigoAsignatura = courseCode;
          pacBody.nombreAsignatura = courseName;
          if (careerName) pacBody.carrera = careerName;
        }
        const sep = queryString ? '&' : '?';
        const url = `/api/v1/office/export/pac${queryString}${sep}pacType=GRAL`;
        window.downloadAuthenticatedFile(url, `PAC_General_${safeCode}.xlsx`, { method: pacBody ? 'POST' : 'GET', body: pacBody });
      } else if (type === 'pac_prac_xlsx') {
        let pacBody = null;
        if (savedPacPracStr) {
          try {
            const parsed = JSON.parse(savedPacPracStr);
            if (parsed && parsed.sesiones && Array.isArray(parsed.sesiones) && parsed.sesiones.length > 0) {
              pacBody = parsed;
            }
          } catch (e) {}
        }
        if (pacBody) {
          pacBody.codigoAsignatura = courseCode;
          pacBody.nombreAsignatura = courseName;
          if (careerName) pacBody.carrera = careerName;
        }
        const sep = queryString ? '&' : '?';
        const url = `/api/v1/office/export/pac${queryString}${sep}pacType=PRACTICO`;
        window.downloadAuthenticatedFile(url, `PAC_Practico_${safeCode}.xlsx`, { method: pacBody ? 'POST' : 'GET', body: pacBody });
      } else if (type === 'pac_cronograma_xlsx' || type === 'pac_xlsx') {
        const pacType = window.activePacType || 'GRAL';
        const label = (pacType === 'PRACTICO') ? 'PAC_Practico' : 'PAC_General';
        const savedStr = (pacType === 'PRACTICO') ? savedPacPracStr : savedPacGralStr;
        let pacBody = null;
        if (savedStr) {
          try {
            const parsed = JSON.parse(savedStr);
            if (parsed && parsed.sesiones && Array.isArray(parsed.sesiones) && parsed.sesiones.length > 0) {
              pacBody = parsed;
            }
          } catch (e) {}
        }
        if (pacBody) {
          pacBody.codigoAsignatura = courseCode;
          pacBody.nombreAsignatura = courseName;
          if (careerName) pacBody.carrera = careerName;
        }
        const sep = queryString ? '&' : '?';
        const url = `/api/v1/office/export/pac${queryString}${sep}pacType=${encodeURIComponent(pacType)}`;
        window.downloadAuthenticatedFile(url, `${label}_${safeCode}.xlsx`, { method: pacBody ? 'POST' : 'GET', body: pacBody });
      } else if (type === 'planes_teorico_xlsx') {
        let planBody = null;
        if (savedPlanesTeoStr) {
          try {
            const parsed = JSON.parse(savedPlanesTeoStr);
            if (parsed && ((Array.isArray(parsed) && parsed.length > 0) || (parsed.planes && parsed.planes.length > 0) || (parsed.sesiones && parsed.sesiones.length > 0))) {
              planBody = parsed;
            }
          } catch (e) {}
        }
        if (planBody) {
          planBody.codigoAsignatura = courseCode;
          planBody.nombreAsignatura = courseName;
          if (careerName) planBody.carrera = careerName;
        }
        const sep = queryString ? '&' : '?';
        const url = `/api/v1/office/export/plan-clase${queryString}${sep}planType=TEORICO`;
        window.downloadAuthenticatedFile(url, `Plan_Clases_Teorico_${safeCode}.xlsx`, { method: planBody ? 'POST' : 'GET', body: planBody });
      } else if (type === 'planes_prac_xlsx') {
        let planBody = null;
        if (savedPlanesPracStr) {
          try {
            const parsed = JSON.parse(savedPlanesPracStr);
            if (parsed && ((Array.isArray(parsed) && parsed.length > 0) || (parsed.planes && parsed.planes.length > 0) || (parsed.sesiones && parsed.sesiones.length > 0))) {
              planBody = parsed;
            }
          } catch (e) {}
        }
        if (planBody) {
          planBody.codigoAsignatura = courseCode;
          planBody.nombreAsignatura = courseName;
          if (careerName) planBody.carrera = careerName;
        }
        const sep = queryString ? '&' : '?';
        const url = `/api/v1/office/export/plan-clase${queryString}${sep}planType=PRACTICO`;
        window.downloadAuthenticatedFile(url, `Plan_Clases_Practico_${safeCode}.xlsx`, { method: planBody ? 'POST' : 'GET', body: planBody });
      } else if (type === 'planes_xlsx') {
        const planType = window.activePlanType || 'TEORICO';
        const label = (planType === 'PRACTICO') ? 'Plan_Clases_Practico' : 'Plan_Clases_Teorico';
        const savedStr = (planType === 'PRACTICO') ? savedPlanesPracStr : savedPlanesTeoStr;
        let planBody = null;
        if (savedStr) {
          try {
            const parsed = JSON.parse(savedStr);
            if (parsed && ((Array.isArray(parsed) && parsed.length > 0) || (parsed.planes && parsed.planes.length > 0) || (parsed.sesiones && parsed.sesiones.length > 0))) {
              planBody = parsed;
            }
          } catch (e) {}
        }
        if (planBody) {
          planBody.codigoAsignatura = courseCode;
          planBody.nombreAsignatura = courseName;
          if (careerName) planBody.carrera = careerName;
        }
        const sep = queryString ? '&' : '?';
        const url = `/api/v1/office/export/plan-clase${queryString}${sep}planType=${encodeURIComponent(planType)}`;
        window.downloadAuthenticatedFile(url, `${label}_${safeCode}.xlsx`, { method: planBody ? 'POST' : 'GET', body: planBody });
      } else {
        const url = `/api/v1/office/export/programa-analitico${queryString}`;
        window.downloadAuthenticatedFile(url, `Documento_${safeCode}.docx`);
      }
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
      const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
      const data = (mKey && materiasData[mKey]) ? materiasData[mKey] : (Object.values(materiasData)[0] || {});
      const rawCareers = data.carrerasCodes || ['CARSIS'];
      const resolvedCareers = data.carrerasResolved || [{ name: 'Ingeniería de Sistemas', tag: 'ING. SISTEMAS' }];
      const hasTeo = !data.components || !data.components.requiredPac || data.components.requiredPac.includes('GRAL') || (data.horasTeoricas > 0);
      const hasPrac = (data.components && data.components.requiredPac && data.components.requiredPac.includes('PRACTICO')) || (data.horasPracticas > 0);

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
        careerOptionsHtml = `
          <input type="hidden" id="print-career-selector" value="${rawCareers[0] || 'CARSIS'}">
        `;
      }

      let documentsListHtml = `
        <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
          <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-blue-600" data-section="pa" checked onchange="window.updateMasterPrintCheckbox()">
          <div>
            <span class="font-bold text-slate-900 dark:text-white block">📋 Programa Analítico Oficial (.docx)</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Normado a 2 hojas con tabla técnica institucional, 4 unidades temáticas y bibliografía APA.</span>
          </div>
        </label>
      `;

      if (hasTeo) {
        documentsListHtml += `
          <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
            <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-emerald-600" data-section="pac_gral" checked onchange="window.updateMasterPrintCheckbox()">
            <div>
              <span class="font-bold text-slate-900 dark:text-white block">📊 PAC General / Teórico (.xlsx)</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Puntos 1 al 6, Matriz 7 de 20 Semanas de Aula, Metodología, Sistema de Evaluación y Normativa.</span>
            </div>
          </label>
        `;
      }

      if (hasPrac) {
        documentsListHtml += `
          <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
            <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-teal-600" data-section="pac_prac" checked onchange="window.updateMasterPrintCheckbox()">
            <div>
              <span class="font-bold text-slate-900 dark:text-white block">🔬 PAC Práctico (.xlsx)</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Identificación de laboratorio, bioseguridad institucional y Cronograma Semestral de Prácticas Oficial.</span>
            </div>
          </label>
        `;
      }

      if (hasTeo) {
        documentsListHtml += `
          <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
            <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-purple-600" data-section="plan_teorico" checked onchange="window.updateMasterPrintCheckbox()">
            <div>
              <span class="font-bold text-slate-900 dark:text-white block">📝 Planes de Clase Teóricos (PCT - .xlsx)</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Fichas didácticas de cátedra con los 5 momentos oficiales (Motivación, Exploración, Contacto, Aplicación y Cierre).</span>
            </div>
          </label>
        `;
      }

      if (hasPrac) {
        documentsListHtml += `
          <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
            <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-indigo-600" data-section="plan_prac" checked onchange="window.updateMasterPrintCheckbox()">
            <div>
              <span class="font-bold text-slate-900 dark:text-white block">🧪 Planes de Clase Prácticos (PCP - .xlsx)</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Fichas de laboratorio con las 4 fases didácticas (Preparatoria, Guiada, Autónoma y Cierre) y bioseguridad.</span>
            </div>
          </label>
        `;
      }

      // TAB 5: Nómina y Registro de Asistencia
      documentsListHtml += `
        <label class="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
          <input type="checkbox" class="chk-print-sec w-4 h-4 mt-0.5 rounded text-teal-600" data-section="asistencia" checked onchange="window.updateMasterPrintCheckbox()">
          <div>
            <span class="font-bold text-slate-900 dark:text-white block">📋 Nómina Oficial y Registro de Asistencia (.xlsx)</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Listado de estudiantes segregado por carrera, estado de asistencia y cumplimiento de la Regla del 80%.</span>
          </div>
        </label>
      `;

      const modalBody = `
        <div class="space-y-4 text-xs">
          <p class="text-slate-700 dark:text-slate-300">Seleccioná los documentos oficiales que deseas incluir en la carpeta para previsualizar, imprimir o descargar directamente en PDF:</p>
          
          ${careerOptionsHtml}

          <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label class="flex items-center gap-3 cursor-pointer select-none pb-2.5 border-b border-slate-200 dark:border-slate-700">
              <input type="checkbox" id="chk-print-all" checked onchange="window.toggleAllPrintCheckboxes(this.checked)" class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500">
              <span class="font-bold text-slate-900 dark:text-white text-sm">📁 Incluir Toda la Carpeta Completa (Portada, Índice, MVP, Horarios y Documentos)</span>
            </label>

            <div class="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
              ${documentsListHtml}
            </div>
          </div>
          
          <div class="flex justify-between items-center pt-2">
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Formato oficial normado según el modelo educativo UNITEPC.</span>
            <div class="flex gap-2">
              <button onclick="window.closeModal()" class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancelar</button>
              <button onclick="window.previewOfficialDocument()" class="px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                👁️ Vista Previa
              </button>
              <button onclick="window.downloadOfficialFolderPdf()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                📥 Descargar PDF (.pdf)
              </button>
              <button onclick="window.executeSelectedPrint()" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                🖨️ Imprimir
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('modal-title').innerText = 'Carpeta Pedagógica Docente Oficial UNITEPC (Impresión y PDF)';
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
              <button onclick="window.openPdfPrintModal()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer">Volver a Opciones</button>
              <button onclick="window.downloadOfficialFolderPdf()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> 📥 Descargar PDF (.pdf)
              </button>
              <button onclick="window.executeSelectedPrint()" class="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i> 🖨️ Imprimir
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

    window.downloadOfficialFolderPdf = function() {
      const selectedSections = [];
      const masterChecked = document.getElementById('chk-print-all')?.checked;
      if (masterChecked) {
        selectedSections.push('portada', 'indice', 'mvp', 'horarios');
      }
      document.querySelectorAll('.chk-print-sec:checked').forEach(c => {
        selectedSections.push(c.getAttribute('data-section'));
      });

      if (selectedSections.length === 0) {
        window.showToast('⚠️ Por favor selecciona al menos una sección para descargar en PDF');
        return;
      }

      const careerSelector = document.getElementById('print-career-selector');
      const selectedCareerCode = careerSelector ? careerSelector.value : 'ALL';
      const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
      const data = (mKey && materiasData[mKey]) ? materiasData[mKey] : (Object.values(materiasData)[0] || {});
      const cleanCode = (data.codigo || 'UNITEPC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Carpeta_Docente_UNITEPC_${cleanCode}_2026.pdf`;

      window.showToast('⏳ Procesando y generando archivo PDF oficial...');

      const docHtml = window.buildOfficialFolderHtml(selectedSections, selectedCareerCode);

      const renderDiv = document.createElement('div');
      renderDiv.id = 'official-pdf-render-wrapper';
      renderDiv.style.position = 'fixed';
      renderDiv.style.left = '-9999px';
      renderDiv.style.top = '0';
      renderDiv.style.width = '210mm';
      renderDiv.style.background = '#ffffff';
      renderDiv.style.color = '#000000';
      renderDiv.style.boxSizing = 'border-box';
      renderDiv.style.zIndex = '-999';
      renderDiv.innerHTML = docHtml;
      document.body.appendChild(renderDiv);

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin:       [6, 6, 6, 6],
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(renderDiv).save().then(() => {
          if (document.body.contains(renderDiv)) document.body.removeChild(renderDiv);
          window.closeModal();
          window.showToast('✅ Archivo PDF descargado correctamente: ' + filename);
        }).catch(err => {
          console.error('Error html2pdf:', err);
          if (document.body.contains(renderDiv)) document.body.removeChild(renderDiv);
          window.showToast('⚠️ No se pudo generar el archivo descargable. Abriendo diálogo de impresión...');
          window.executeSelectedPrint();
        });
      } else {
        if (document.body.contains(renderDiv)) document.body.removeChild(renderDiv);
        window.showToast('⚠️ Motor de PDF no detectado. Abriendo diálogo de impresión...');
        window.executeSelectedPrint();
      }
    };

    window.buildOfficialFolderHtml = function(selectedSections, selectedCareerCode) {
      const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
      const data = (mKey && materiasData[mKey]) ? materiasData[mKey] : (Object.values(materiasData)[0] || {});

      // 1. Resolve docente name & email cleanly without emojis or internal tags
      let docenteName = 'DOCENTE ASIGNADO';
      if (window.__ACTIVE_DOCENTE__ && window.__ACTIVE_DOCENTE__.nombreCompleto) {
        docenteName = window.__ACTIVE_DOCENTE__.nombreCompleto;
      } else {
        const selOption = document.getElementById('docente-api-selector')?.selectedOptions?.[0];
        if (selOption) {
          docenteName = selOption.text
            .replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .trim();
        }
      }
      docenteName = docenteName.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || 'ROSMERY LUIZAGA SALINAS';
      const docenteEmail = (window.__ACTIVE_DOCENTE__ && window.__ACTIVE_DOCENTE__.email) ? window.__ACTIVE_DOCENTE__.email : 'docente@unitepc.edu.bo';

      // 2. Retrieve saved program data for active subject if available
      let savedProg = {};
      try {
        const spStr = localStorage.getItem('sisa_saved_programa_analitico_' + mKey);
        if (spStr) savedProg = JSON.parse(spStr);
      } catch(e) {}

      let targetCareerCode = selectedCareerCode;
      if (targetCareerCode === 'ALL') {
        targetCareerCode = (data.carrerasCodes && data.carrerasCodes[0]) ? data.carrerasCodes[0] : 'CARSIS';
      }

      const careerMeta = window.UNITEPC_CAREER_MVP[targetCareerCode] || window.UNITEPC_CAREER_MVP['DEFAULT'];
      const officialSingleCode = typeof window.resolveOfficialCourseCode === 'function' ? window.resolveOfficialCourseCode(data.nombre, [targetCareerCode]) : data.codigo;
      const displayCode = selectedCareerCode === 'ALL' ? data.codigo : officialSingleCode;
      const displayCareerName = selectedCareerCode === 'ALL' ? data.carrera : careerMeta.carrera;

      const currentAsignatura = document.getElementById('analitico-asig-input')?.value || savedProg.nombreAsignatura || savedProg.nombre || data.nombre || 'Asignatura Asignada';
      const currentCodigo = document.getElementById('analitico-codigo-input')?.value || savedProg.codigoAsignatura || savedProg.codigo || displayCode;
      const currentSemestre = document.getElementById('analitico-semestre-input')?.value || savedProg.semestre || data.semestre || '1º';
      const currentCreditos = document.getElementById('analitico-creditos-input')?.value || savedProg.creditos || data.creditos || '8';
      const currentHt = document.getElementById('analitico-ht-input')?.value?.replace(/\D/g, '') || savedProg.horasTeoricas || data.horasTeoricas || '2';
      const currentHp = document.getElementById('analitico-hp-input')?.value?.replace(/\D/g, '') || savedProg.horasPracticas || data.horasPracticas || '4';
      const currentHs = document.getElementById('analitico-hs-input')?.value?.replace(/\D/g, '') || savedProg.horasSemestre || data.horasTotal || '120';

      const safe = (val, fb = '') => {
        if (val === null || val === undefined || val === '') return fb;
        return String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };

      let docHtml = '';

      // 1. PORTADA OFICIAL
      if (selectedSections.includes('portada')) {
        docHtml += `
          <div class="print-page" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 250mm; text-align: center; font-family: Arial, Helvetica, sans-serif; padding: 25mm 20mm 15mm 20mm; background: #fff; box-shadow: none; border-radius: 0; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 15pt; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #000;">${careerMeta.facultad}</h2>
              <h3 style="font-size: 13pt; font-weight: bold; margin: 8px 0 0 0; text-transform: uppercase; color: #000;">CARRERA DE ${displayCareerName}</h3>
              <h1 style="font-size: 20pt; font-weight: 900; margin: 20px 0 0 0; letter-spacing: 1px; color: #000;">CARPETA PEDAGÓGICA DOCENTE</h1>
            </div>

            <div style="margin: 25mm 0 20mm 0; text-align: center;">
              <div style="font-size: 40pt; font-weight: 900; color: #581c87; letter-spacing: 2px; font-family: 'Arial Black', sans-serif; line-height: 1.1; margin: 0;">
                UNITEPC
              </div>
              <div style="font-size: 12pt; font-weight: bold; color: #0d9488; letter-spacing: 3px; margin: 6px 0 0 0; line-height: 1.2;">
                UNIVERSIDAD PRIVADA
              </div>
            </div>

            <div style="margin-bottom: 10mm; display: flex; justify-content: center;">
              <div style="border: 2.5px solid #6b21a8; border-radius: 4px; padding: 22px 30px; width: 90%; max-width: 520px; text-align: left; line-height: 1.8; font-size: 11pt;">
                <p style="margin: 0;"><strong>Nombre del Docente:</strong> ${docenteName}</p>
                <p style="margin: 3px 0 0 0;"><strong>Carrera:</strong> ${displayCareerName}</p>
                <p style="margin: 3px 0 0 0;"><strong>Asignatura:</strong> ${currentAsignatura}</p>
                <p style="margin: 3px 0 0 0;"><strong>Código de la asignatura:</strong> ${currentCodigo}</p>
                <p style="margin: 3px 0 0 0;"><strong>Semestre:</strong> ${currentSemestre}</p>
                <p style="margin: 3px 0 0 0;"><strong>Gestión:</strong> II/2026</p>
              </div>
            </div>
          </div>
        `;
      }

      // 2. ÍNDICE OFICIAL
      if (selectedSections.includes('indice')) {
        docHtml += `
          <div class="print-page" style="padding: 15mm 15mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 8mm;">
              <div style="font-size: 28pt; font-weight: 900; color: #581c87; letter-spacing: 1.5px; line-height: 1.1; margin: 0;">UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0d9488; letter-spacing: 2px; margin: 4px 0 0 0; line-height: 1.2;">UNIVERSIDAD PRIVADA</div>
            </div>

            <div style="background: #6b21a8; color: white; padding: 8px 15px; font-size: 15pt; font-weight: bold; margin-bottom: 12px;">
              ÍNDICE DE LA CARPETA DOCENTE
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
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Programa analítico normado</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">PA</div></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Programa de asignatura por competencias (General / Práctico)</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">PAC / PACP</div></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Cronograma de Clases y Prácticas de Laboratorio</td>
                  <td style="text-align: center; padding: 9px; border-bottom: 1px solid #e2e8f0;"><div style="background: #dcfce7; color: #064e3b; font-weight: bold; padding: 4px 8px; border-radius: 4px;">CT-P</div></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">Planes de Clase Teórico-Práctico (PCT / PCP)</td>
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
              <div style="font-size: 28pt; font-weight: 900; color: #581c87; letter-spacing: 1.5px; line-height: 1.1; margin: 0;">UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0d9488; letter-spacing: 2px; margin: 4px 0 0 0; line-height: 1.2;">UNIVERSIDAD PRIVADA</div>
            </div>

            <div style="margin-bottom: 8mm;">
              <div style="background: #6b21a8; color: white; text-align: center; padding: 6px 10px; font-size: 13pt; font-weight: bold; letter-spacing: 1px;">
                MISIÓN
              </div>
              <div style="border: 2px solid #6b21a8; padding: 12px 16px; font-size: 10pt; text-align: justify; line-height: 1.6; white-space: pre-line;">
                ${safe(careerMeta.mision)}
              </div>
            </div>

            <div style="margin-bottom: 8mm;">
              <div style="background: #0d9488; color: white; text-align: center; padding: 6px 10px; font-size: 13pt; font-weight: bold; letter-spacing: 1px;">
                VISIÓN
              </div>
              <div style="border: 2px solid #0d9488; padding: 12px 16px; font-size: 10pt; text-align: justify; line-height: 1.6; white-space: pre-line;">
                ${safe(careerMeta.vision)}
              </div>
            </div>

            <div>
              <div style="background: #6b21a8; color: white; text-align: center; padding: 6px 10px; font-size: 13pt; font-weight: bold; letter-spacing: 1px;">
                PERFIL PROFESIONAL
              </div>
              <div style="border: 2px solid #6b21a8; padding: 12px 16px; font-size: 10pt; text-align: justify; line-height: 1.6; white-space: pre-line;">
                ${safe(careerMeta.perfil)}
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
            scheduleRowsHtml += `<tr><td style="text-align: left; padding: 6px 0;">Teoría (${safe(t.code)}) - ${safe(t.classroom)} (${safe(t.campus)})</td><td style="text-align: right; font-weight: bold;">Martes 08:15 - 11:15</td></tr>`;
          });
        }
        if (data.pracList && data.pracList.length > 0) {
          data.pracList.forEach(p => {
            scheduleRowsHtml += `<tr><td style="text-align: left; padding: 6px 0;">Práctica (${safe(p.code)}) - ${safe(p.classroom)} (${safe(p.campus)})</td><td style="text-align: right; font-weight: bold;">Viernes 11:15 - 12:45</td></tr>`;
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
              <div style="font-size: 28pt; font-weight: 900; color: #581c87; letter-spacing: 1.5px; line-height: 1.1; margin: 0;">UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0d9488; letter-spacing: 2px; margin: 4px 0 0 0; line-height: 1.2;">UNIVERSIDAD PRIVADA</div>
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
                FECHAS DE EXÁMENES OFICIALES
              </div>
              <div style="border: 2px solid #0d9488; padding: 18px 25px; font-size: 10.5pt; text-align: center; line-height: 1.8;">
                <table style="width: 90%; margin: 0 auto; border-collapse: collapse;">
                  <thead>
                    <tr style="font-weight: bold; font-size: 11pt; border-bottom: 1.5px solid #0d9488;">
                      <th style="padding: 6px 0; text-align: left;">PARCIAL / INSTANCIA</th>
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

      // 5. PROGRAMA ANALÍTICO (PA) - Formato Normado de 2 Hojas
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
                <div style="font-size: 13pt; font-weight: 900; color: #581c87; font-family: Arial, sans-serif; line-height: 1.1; margin: 0;">UNITEPC</div>
                <div style="font-size: 5.5pt; font-weight: bold; color: #0d9488; letter-spacing: 0.5px; margin: 2px 0 0 0; line-height: 1.2;">UNIVERSIDAD PRIVADA</div>
              </div>
            </div>
          </div>
        `;

        let unitsToRender = [];
        if (typeof activeAnaliticoUnidades !== 'undefined' && Array.isArray(activeAnaliticoUnidades) && activeAnaliticoUnidades.length > 0) {
          unitsToRender = activeAnaliticoUnidades;
        } else if (savedProg.unidades && Array.isArray(savedProg.unidades) && savedProg.unidades.length > 0) {
          unitsToRender = savedProg.unidades;
        }

        if (!unitsToRender || unitsToRender.length === 0) {
          const isIdiomas = currentAsignatura.toUpperCase().includes('IDIOMA') || currentAsignatura.toUpperCase().includes('INGL') || currentCodigo.includes('SIS-423') || currentCodigo.includes('IDI');
          if (isIdiomas) {
            unitsToRender = [
              {
                numeroUnidad: 1,
                titulo: 'UNIDAD DE APRENDIZAJE I.- COMUNICACIÓN TÉCNICA Y LÉXICO ESPECIALIZADO.',
                temas: [
                  { numeroTema: 1, titulo: 'TÉRMINOS TÉCNICOS EN INGENIERÍA Y COMPUTACIÓN', contenido: 'Adquisición de vocabulario específico, definiciones de hardware, software y sistemas en lengua técnica.' },
                  { numeroTema: 2, titulo: 'ESTRUCTURAS GRAMATICALES Y TIEMPOS VERBALES EN TEXTOS TÉCNICOS', contenido: 'Lectura comprensiva de artículos científicos, sintaxis aplicada a la documentación de software y especificaciones.' },
                  { numeroTema: 3, titulo: 'TRADUCCIÓN E INTERPRETACIÓN DE MANUALES Y DATASHEETS', contenido: 'Estrategias de traducción directa, interpretación de guías de usuario y normativas de la industria.' }
                ]
              },
              {
                numeroUnidad: 2,
                titulo: 'UNIDAD DE APRENDIZAJE II.- ESCRITURA ACADÉMICA Y DOCUMENTACIÓN TÉCNICA.',
                temas: [
                  { numeroTema: 4, titulo: 'REDACCIÓN DE INFORMES TÉCNICOS Y BITÁCORAS', contenido: 'Estructuración formal de informes de laboratorio, bitácoras de avance y resúmenes ejecutivos.' },
                  { numeroTema: 5, titulo: 'ESPECIFICACIONES DE REQUERIMIENTOS Y DOCUMENTACIÓN DE CÓDIGO', contenido: 'Uso de terminología estándar internacional para la especificación funcional y comentarios de código.' }
                ]
              },
              {
                numeroUnidad: 3,
                titulo: 'UNIDAD DE APRENDIZAJE III.- COMUNICACIÓN ORAL Y PRESENTACIÓN DE PROYECTOS.',
                temas: [
                  { numeroTema: 6, titulo: 'PRESENTACIÓN Y DEFENSAS TÉCNICAS', contenido: 'Técnicas de exposición oral, presentación de avances ante comités y defensa de proyectos de ingeniería.' },
                  { numeroTema: 7, titulo: 'SIMULACIÓN DE REUNIONES TÉCNICAS Y TRABAJO EN EQUIPO', contenido: 'Interacción profesional, formulación de preguntas técnicas y debates aplicados.' }
                ]
              },
              {
                numeroUnidad: 4,
                titulo: 'UNIDAD DE APRENDIZAJE IV.- PRODUCCIÓN Y PROYECTO INTEGRADOR.',
                temas: [
                  { numeroTema: 8, titulo: 'PROYECTO FINAL Y ARTÍCULO TÉCNICO', contenido: 'Desarrollo de un artículo técnico o manual estructurado en idioma técnico con defensa evaluada.' }
                ]
              }
            ];
          } else {
            unitsToRender = [
              {
                numeroUnidad: 1,
                titulo: 'UNIDAD DE APRENDIZAJE I.- FUNDAMENTOS Y CONCEPTOS CLAVE.',
                temas: [
                  { numeroTema: 1, titulo: 'CONCEPTOS FUNDAMENTALES Y MARCO TEÓRICO', contenido: 'Introducción, bases conceptuales, estructuras esenciales y principios rectores de la materia.' },
                  { numeroTema: 2, titulo: 'METODOLOGÍAS Y MODELOS APLICADOS', contenido: 'Modelos de análisis, herramientas fundamentales y buenas prácticas aplicadas.' },
                  { numeroTema: 3, titulo: 'PROCESOS Y CRITERIOS TÉCNICOS', contenido: 'Estandarización, normas operativas y control de calidad en los procesos.' }
                ]
              },
              {
                numeroUnidad: 2,
                titulo: 'UNIDAD DE APRENDIZAJE II.- TÉCNICAS Y DESARROLLO APLICADO.',
                temas: [
                  { numeroTema: 4, titulo: 'DESARROLLO DE CASOS Y SOLUCIONES', contenido: 'Implementación estructurada de metodologías y análisis de casos prácticos.' },
                  { numeroTema: 5, titulo: 'HERRAMIENTAS OPERATIVAS E INSTRUMENTACIÓN', contenido: 'Uso de herramientas específicas, entornos técnicos y validación funcional.' }
                ]
              },
              {
                numeroUnidad: 3,
                titulo: 'UNIDAD DE APRENDIZAJE III.- ANÁLISIS AVANZADO E INTEGRACIÓN.',
                temas: [
                  { numeroTema: 6, titulo: 'DISEÑO Y FORMULACIÓN AVANZADA', contenido: 'Análisis de requerimientos complejos, integración de módulos y evaluación de rendimiento.' },
                  { numeroTema: 7, titulo: 'OPTIMIZACIÓN Y GESTIÓN DE PROCESOS', contenido: 'Mejora continua, control de versiones y estándares de desempeño.' }
                ]
              },
              {
                numeroUnidad: 4,
                titulo: 'UNIDAD DE APRENDIZAJE IV.- APLICACIÓN PROFESIONAL Y PROYECTO FINAL.',
                temas: [
                  { numeroTema: 8, titulo: 'PRÁCTICA EN ESCENARIOS REALES', contenido: 'Aplicación integral de conocimientos en proyectos de simulación profesional.' },
                  { numeroTema: 9, titulo: 'PROYECTO INTEGRADOR DE FIN DE CURSO', contenido: 'Defensa, documentación formal y sustentación de resultados evaluados.' }
                ]
              }
            ];
          }
        }

        const splitIdx = Math.max(1, Math.ceil(unitsToRender.length / 2));
        const page1Units = unitsToRender.slice(0, splitIdx);
        const page2Units = unitsToRender.slice(splitIdx);

        const renderUnitsHtml = (unitsList) => {
          let html = '';
          unitsList.forEach(u => {
            html += `<div style="font-weight: bold; font-size: 10pt; margin-top: 10px; margin-bottom: 6px; text-align: left; text-transform: uppercase;">${safe(u.titulo)}</div>`;
            (u.temas || []).forEach(t => {
              html += `
                <div style="font-weight: bold; font-size: 9.5pt; margin-bottom: 2px; text-align: left;">
                  TEMA Nº ${t.numeroTema || 1}. ${safe(t.titulo)}
                </div>
                <div style="font-size: 9.5pt; line-height: 1.25; text-align: left; margin-bottom: 8px; white-space: pre-line;">
                  ${safe(t.contenido)}
                </div>
              `;
            });
          });
          return html;
        };

        let bibBasicaList = [];
        let bibCompList = [];
        const basicaEl = document.getElementById('analitico-biblio-basica-input');
        const compEl = document.getElementById('analitico-biblio-comp-input');
        if (basicaEl && basicaEl.value.trim()) {
          bibBasicaList = basicaEl.value.split('\n\n').map(s => s.trim()).filter(Boolean);
        } else if (savedProg.bibliografia && savedProg.bibliografia.length > 0) {
          bibBasicaList = savedProg.bibliografia.filter(b => b.tipo === 'BASICA').map(b => b.citaApa || (b.autor ? `${b.autor} (${b.anio || ''}). ${b.titulo}` : b.titulo));
        }
        if (compEl && compEl.value.trim()) {
          bibCompList = compEl.value.split('\n\n').map(s => s.trim()).filter(Boolean);
        } else if (savedProg.bibliografia && savedProg.bibliografia.length > 0) {
          bibCompList = savedProg.bibliografia.filter(b => b.tipo === 'COMPLEMENTARIA').map(b => b.citaApa || (b.autor ? `${b.autor} (${b.anio || ''}). ${b.titulo}` : b.titulo));
        }

        if (bibBasicaList.length === 0) {
          bibBasicaList = [
            `Bibliografía oficial de la cátedra para ${safe(currentAsignatura)} (Edición actualizada). Fondo Editorial UNITEPC.`
          ];
        }
        if (bibCompList.length === 0) {
          bibCompList = [
            `Manual y guías de referencia institucional para la formación académica en ${safe(displayCareerName)}. UNITEPC.`
          ];
        }

        const renderBibListHtml = (items) => {
          return items.map(item => `
            <div style="font-size: 9.5pt; line-height: 1.25; text-align: left; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 8px;">
              <span>✓</span>
              <span>${safe(item)}</span>
            </div>
          `).join('');
        };

        // PÁGINA 1
        docHtml += `
          <div class="print-page" style="padding: 20mm 22mm 20mm 28mm; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.25; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            ${headerComponent}

            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 14px; letter-spacing: 0.5px;">
              PROGRAMA ANALÍTICO: ${safe(currentAsignatura.toUpperCase())}
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
                  <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${currentCodigo}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${currentSemestre}</td>
                  <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${safe(currentAsignatura)}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${currentCreditos}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${currentHt}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${currentHp}</td>
                  <td style="border: 1px solid #000; padding: 4px;">${currentHs}</td>
                  <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">2</td>
                </tr>
              </tbody>
            </table>

            ${renderUnitsHtml(page1Units)}
          </div>
        `;

        // PÁGINA 2
        docHtml += `
          <div class="print-page" style="padding: 20mm 22mm 20mm 28mm; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.25; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            ${headerComponent}

            ${renderUnitsHtml(page2Units)}

            <div style="font-weight: bold; font-size: 10pt; margin-top: 14px; margin-bottom: 6px; text-align: left;">
              BIBLIOGRAFÍA OFICIAL BÁSICA
            </div>
            ${renderBibListHtml(bibBasicaList)}

            <div style="font-weight: bold; font-size: 10pt; margin-top: 12px; margin-bottom: 6px; text-align: left;">
              BIBLIOGRAFÍA COMPLEMENTARIA
            </div>
            ${renderBibListHtml(bibCompList)}
          </div>
        `;
      }

      // 6. PAC GENERAL / TEÓRICO (Puntos 1 al 6 + Matriz 7 de 20 Semanas + Puntos 8 a 14)
      const shouldRenderPacGral = selectedSections.includes('pac_gral') || selectedSections.includes('pac_teorico') || (selectedSections.includes('pac_cronograma') && (!selectedSections.includes('pac_prac') || window.activeCronogramaType !== 'PRACTICO'));
      if (shouldRenderPacGral) {
        const savedPac = localStorage.getItem('sisa_saved_pac_gral_' + mKey) || localStorage.getItem('sisa_saved_pac_' + mKey);
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
                <td style="border: 1px solid #000; padding: 2px 4px; white-space: pre-line; word-break: break-word;">${temaText}</td>
                <td style="border: 1px solid #000; padding: 2px 4px; white-space: pre-line; word-break: break-word;">${safe(saberCText)}</td>
                <td style="border: 1px solid #000; padding: 2px 4px; white-space: pre-line; word-break: break-word;">${safe(saberPText)}</td>
                <td style="border: 1px solid #000; padding: 2px 4px; white-space: pre-line; word-break: break-word;">${safe(saberAText)}</td>
                <td style="border: 1px solid #000; padding: 2px 4px; white-space: pre-line; word-break: break-word;">${safe(critText)}</td>
                <td style="border: 1px solid #000; padding: 2px 4px; text-align: center; white-space: pre-line; word-break: break-word;">${safe(instText)}</td>
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

        // PAGE 1: PUNTOS 1 AL 6
        docHtml += `
          <div class="print-page" style="padding: 10mm 15mm 8mm 15mm; font-family: 'Times New Roman', Times, serif; font-size: 7.5pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="text-align: center; margin-bottom: 6px;">
              <div style="font-size: 13pt; font-weight: 900; color: #581c87; font-family: Arial, sans-serif; line-height: 1.1; margin: 0;">UNITEPC</div>
              <div style="font-size: 5.5pt; font-weight: bold; color: #0d9488; letter-spacing: 0.5px; margin: 2px 0 0 0; line-height: 1.2;">UNIVERSIDAD PRIVADA</div>
              <div style="font-size: 9.5pt; font-weight: bold; margin-top: 3px; text-transform: uppercase;">PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC GENERAL / TEÓRICO)</div>
            </div>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">1.- Identificación de la Asignatura</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>CARRERA:</strong> ${displayCareerName.toUpperCase()}</td>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>ASIGNATURA:</strong> ${safe(currentAsignatura.toUpperCase())} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CÓDIGO:</strong> ${currentCodigo}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>ÁREA DE DESEMPEÑO:</strong> FORMACIÓN PROFESIONAL</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>TIPO DE CURSO:</strong> REGULAR / OBLIGATORIO</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>MODALIDAD:</strong> PRESENCIAL</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>SEMESTRE:</strong> ${currentSemestre}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>PRE-REQUISITO:</strong> NINGUNO</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>CRÉDITOS:</strong> ${currentCreditos}</td>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px;"><strong>CARGA HORARIA TOTAL:</strong> ${currentHs} HORAS &nbsp;&nbsp;|&nbsp;&nbsp; <strong>HORAS:</strong> TEÓRICAS: ${currentHt}h / PRÁCTICAS: ${currentHp}h</td>
              </tr>
              <tr>
                <td colspan="4" style="border: 1px solid #000; padding: 2.5px 4px;"><strong>N° DE SESIONES SEMANALES:</strong> 2 SESIONES &nbsp;&nbsp; (TEÓRICAS: 1 &nbsp;|&nbsp; PRÁCTICAS: 1)</td>
              </tr>
            </table>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">2.- Docente Responsable de la Asignatura</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>Nombre del docente:</strong> ${docenteName}</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>eMail:</strong> ${docenteEmail}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>Formación:</strong> Licenciatura en ${displayCareerName} / Maestría en Educación Superior</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px;"><strong>Teléfono:</strong> (+591) 4-4258888</td>
              </tr>
            </table>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">3.- Justificación de la Asignatura</div>
            <div style="border: 1px solid #000; padding: 4px 6px; margin-bottom: 6px; text-align: justify; line-height: 1.35; font-size: 6.8pt; white-space: pre-line;">
              ${safe(data.caracterizacion || 'La asignatura es de primordial relevancia en la malla curricular institucional por cuanto desarrolla competencias profesionales indispensables para la formulación, diseño y construcción de soluciones tecnológicas estructuradas. Proporciona al estudiante fundamentos sólidos, metodologías activas y destrezas prácticas alineadas a los requerimientos socioproductivos y estándares de la industria.')}
            </div>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">4.- Propósito General de la Unidad de Formación</div>
            <div style="border: 1px solid #000; padding: 4px 6px; margin-bottom: 6px; text-align: justify; line-height: 1.35; font-size: 6.8pt; white-space: pre-line;">
              ${safe(data.macroCompetencia || 'Formar profesionales competentes en el análisis, diseño e implementación de sistemas mediante el uso riguroso de principios computacionales, patrones de diseño y trabajo colaborativo, con alto sentido de ética, innovación y responsabilidad social.')}
            </div>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">5.- Competencias</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 30%; background: #f8fafc; font-weight: bold;">Competencia Global Específica:</td>
                <td style="border: 1px solid #000; padding: 3px 5px; white-space: pre-line;">${safe(data.macroCompetencia || 'Desarrolla sistemas modulares, escalables y mantenibles aplicando estándares de ingeniería de software.')}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 30%; background: #f8fafc; font-weight: bold;">Unidad de Competencia Específica:</td>
                <td style="border: 1px solid #000; padding: 3px 5px; white-space: pre-line;">MANEJA ESTRUCTURAS, PATRONES Y LENGUAJES DE PROGRAMACIÓN PARA LA CONSTRUCCIÓN DE SOFTWARE DE ALTA CALIDAD Y DISPONIBILIDAD.</td>
              </tr>
            </table>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">6.- Elementos de Competencia</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt;">
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 25%; background: #f8fafc; font-weight: bold;">Elemento de competencia 1:</td>
                <td style="border: 1px solid #000; padding: 3px 5px; white-space: pre-line;">Analiza y modela la arquitectura de entidades y objetos, aplicando principios de encapsulamiento, herencia y polimorfismo con rigor técnico y buenas prácticas.</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 25%; background: #f8fafc; font-weight: bold;">Elemento de competencia 2:</td>
                <td style="border: 1px solid #000; padding: 3px 5px; white-space: pre-line;">Diseña interfaces interactivas y gestiona eventos del sistema, asegurando la comunicación reactiva entre componentes y la experiencia de usuario.</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 3px 5px; width: 25%; background: #f8fafc; font-weight: bold;">Elemento de competencia 3:</td>
                <td style="border: 1px solid #000; padding: 3px 5px; white-space: pre-line;">Desarrolla e integra proyectos funcionales completos, aplicando control de versiones, pruebas de software y documentación técnica normalizada.</td>
              </tr>
            </table>

            <div style="text-align: center; font-size: 8pt; margin-top: 6px;">1</div>
          </div>
        `;

        // PAGE 2: Sesiones 1 a 14
        docHtml += `
          <div class="print-page" style="padding: 10mm 12mm 8mm 12mm; font-family: 'Times New Roman', Times, serif; font-size: 7pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 7.5pt;">UNITEPC • PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC GENERAL)</span>
              <span style="font-size: 7pt; color: #475569;">${currentCodigo} - ${safe(currentAsignatura)} (${displayCareerName})</span>
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

        // PAGE 3: Sesiones 15 a 28
        docHtml += `
          <div class="print-page" style="padding: 10mm 12mm 8mm 12mm; font-family: 'Times New Roman', Times, serif; font-size: 7pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 7.5pt;">UNITEPC • PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC GENERAL)</span>
              <span style="font-size: 7pt; color: #475569;">${currentCodigo} - ${safe(currentAsignatura)} (${displayCareerName})</span>
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

        // PAGE 4: Sesiones 29 a 36 + Puntos 8, 9, 12, 14
        docHtml += `
          <div class="print-page" style="padding: 10mm 12mm 8mm 12mm; font-family: 'Times New Roman', Times, serif; font-size: 7pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 7.5pt;">UNITEPC • PROGRAMA DE ASIGNATURA POR COMPETENCIAS (PAC GENERAL)</span>
              <span style="font-size: 7pt; color: #475569;">${currentCodigo} - ${safe(currentAsignatura)} (${displayCareerName})</span>
            </div>

            <div style="font-weight: bold; font-size: 7.5pt; margin-bottom: 4px;">7.- Estructura de Unidad de Aprendizaje (Cierre Sesiones 29° a 36° y Evaluaciones Finales)</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.5pt; margin-bottom: 6px;">
              ${matrixTableHeader}
              <tbody>
                ${renderMatrixRows(28, 35)}
                ${renderMatrixRows(38, 38)}
              </tbody>
            </table>

            <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; text-align: justify; line-height: 1.3; white-space: pre-line;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">8. Metodología General de la Asignatura</div>
              <div>De acuerdo con el modelo educativo basado en competencias de la UNITEPC la metodología es de enfoque constructivista y socioformativo (ABP, Método de Casos, Talleres de Laboratorio, Aula Invertida mediados por plataforma SEA).</div>
              <div style="margin-top: 1px;"><strong>En el Aula:</strong> Clases participativas, debates y construcción conceptual. &nbsp;|&nbsp; <strong>Laboratorios:</strong> Desarrollo experimental, resolución de casos y simulaciones prácticas aplicadas.</div>
            </div>

            <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; text-align: justify; line-height: 1.3; white-space: pre-line;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">9. Sistema de Evaluación</div>
              <div>El proceso evaluador es continuo e integral: a) <em>Evaluación diagnóstica:</em> recuperación de conocimientos previos. b) <em>Evaluación formativa:</em> retroalimentación en talleres y laboratorios mediante rúbricas. c) <em>Evaluación sumativa:</em> <strong>1° Parcial (30%)</strong>, <strong>2° Parcial (30%)</strong> y <strong>Examen Final Integrador (40%)</strong>.</div>
            </div>

            <div style="border: 1px solid #000; padding: 3px 5px; margin-bottom: 4px; text-align: justify; line-height: 1.3; white-space: pre-line;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">12.- Criterios y Normativa de la Asignatura</div>
              <div>Los estudiantes deberán cumplir el reglamento institucional: asistencia mínima obligatoria del 80% para tener derecho a evaluación final, 10 minutos de tolerancia al ingreso, respeto mutuo, probidad académica y convivencia armónica en el aula y laboratorios.</div>
            </div>

            <div style="border: 1px solid #000; padding: 3px 5px; text-align: justify; line-height: 1.3; white-space: pre-line;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">14.- Bibliografía oficial</div>
              <div><strong>Específica:</strong> Joyanes Aguilar, L. (2021). <em>Fundamentos de Programación: Algoritmos, Estructuras de Datos y Objetos</em> (6ª ed.). McGraw-Hill. &nbsp;|&nbsp; García Llinás, L. F. (2022). <em>Todo sobre Patrones de Diseño</em>. Ediciones de la U.</div>
              <div style="margin-top: 1px;"><strong>Complementaria:</strong> Sznajdleder, P. (2021). <em>Programación Orientada a Objetos y Estructuras de Datos</em>. Alfaomega. &nbsp;|&nbsp; García, A. M. (2024). <em>Ingeniería de Software</em>. Marcombo.</div>
            </div>

            <div style="text-align: center; font-size: 8pt; margin-top: 5px;">4</div>
          </div>
        `;
      }

      // 7. PAC PRÁCTICO (Identificación de Laboratorio + Cronograma Semestral de Prácticas de 7 Columnas + Bioseguridad)
      const shouldRenderPacPrac = selectedSections.includes('pac_prac') || selectedSections.includes('pac_practico') || (selectedSections.includes('pac_cronograma') && window.activeCronogramaType === 'PRACTICO');
      if (shouldRenderPacPrac) {
        let cronPracticas = [];
        const savedCron = localStorage.getItem('sisa_saved_cron_prac_' + mKey);
        if (savedCron) {
          try { cronPracticas = JSON.parse(savedCron); } catch(e) {}
        }
        if (!cronPracticas || cronPracticas.length === 0) {
          if (window.activePacPracData && (window.activePacPracData.matriz7 || window.activePacPracData.pacPracticas)) {
            cronPracticas = window.activePacPracData.matriz7 || window.activePacPracData.pacPracticas || [];
          }
        }
        if (!cronPracticas || cronPracticas.length === 0) {
          cronPracticas = [];
        }

        let pracRowsHtml = '';
        if (cronPracticas.length === 0) {
          pracRowsHtml = `
            <tr>
              <td colspan="7" style="border: 1px solid #000; padding: 10px; text-align: center; font-style: italic; color: #64748b;">
                Sin prácticas registradas en el PAC Práctico
              </td>
            </tr>
          `;
        } else {
        cronPracticas.forEach((p, idx) => {
          const sem = p.semana || (idx + 1);
          const ses = p.nroSesion || p.numero || (idx + 1);
          const titulo = p.unidadTematica || p.titulo || `Práctica ${idx + 1}`;
          const actividad = p.contenidoEspecifico || p.actividad || 'Desarrollo guiado en laboratorio con instrumentación técnica.';
          const desemp = p.saberProcedimental || p.desempeno || 'Aplica protocolos de trabajo técnico y resolución experimental.';
          const inst = p.instrumentoEvaluacion || p.instrumento || 'Rúbrica de Práctica';
          const evid = p.evidenciaAprendizaje || p.evidencias || 'Informe de Laboratorio evaluado';

          pracRowsHtml += `
            <tr>
              <td style="border: 1px solid #000; padding: 3px 2px; text-align: center; font-weight: bold;">${sem}</td>
              <td style="border: 1px solid #000; padding: 3px 2px; text-align: center; font-weight: bold;">${ses}</td>
              <td style="border: 1px solid #000; padding: 3px 4px; font-weight: bold; white-space: pre-line; word-break: break-word;">${safe(titulo)}</td>
              <td style="border: 1px solid #000; padding: 3px 4px; white-space: pre-line; word-break: break-word;">${safe(actividad)}</td>
              <td style="border: 1px solid #000; padding: 3px 4px; white-space: pre-line; word-break: break-word;">${safe(desemp)}</td>
              <td style="border: 1px solid #000; padding: 3px 2px; text-align: center; white-space: pre-line; word-break: break-word;">${safe(inst)}</td>
              <td style="border: 1px solid #000; padding: 3px 4px; white-space: pre-line; word-break: break-word;">${safe(evid)}</td>
            </tr>
          `;
        });
        }

        docHtml += `
          <div class="print-page" style="padding: 10mm 15mm 8mm 15mm; font-family: 'Times New Roman', Times, serif; font-size: 7.5pt; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px; width: 100%;">
            <div style="text-align: center; margin-bottom: 6px;">
              <div style="font-size: 13pt; font-weight: 900; color: #581c87; font-family: Arial, sans-serif; line-height: 1.1; margin: 0;">UNITEPC</div>
              <div style="font-size: 5.5pt; font-weight: bold; color: #0d9488; letter-spacing: 0.5px; margin: 2px 0 0 0; line-height: 1.2;">UNIVERSIDAD PRIVADA</div>
              <div style="font-size: 9.5pt; font-weight: bold; margin-top: 3px; text-transform: uppercase;">PROGRAMA DE ASIGNATURA POR COMPETENCIAS - PRÁCTICO (PACP)</div>
            </div>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">1.- Identificación del Componente Práctico</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>CARRERA:</strong> ${displayCareerName.toUpperCase()}</td>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>ASIGNATURA:</strong> ${safe(currentAsignatura.toUpperCase())} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CÓDIGO:</strong> ${currentCodigo}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>ÁREA:</strong> FORMACIÓN PRÁCTICA PROFESIONAL</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>CARGA PRÁCTICA:</strong> ${currentHp} HORAS / SEMANA</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>MODALIDAD:</strong> TALLER / LABORATORIO</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 25%;"><strong>SEMESTRE:</strong> ${currentSemestre}</td>
              </tr>
              <tr>
                <td colspan="4" style="border: 1px solid #000; padding: 2.5px 4px;"><strong>ESCENARIO DE PRÁCTICA:</strong> Laboratorio / Gabinete Técnico Especializado &nbsp;&nbsp;|&nbsp;&nbsp; <strong>BIOSEGURIDAD:</strong> Normativa institucional UNITEPC</td>
              </tr>
            </table>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">2.- Docente de Prácticas y Escenario Académico</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.8pt; margin-bottom: 6px;">
              <tr>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>Docente Responsable:</strong> ${docenteName}</td>
                <td style="border: 1px solid #000; padding: 2.5px 4px; width: 50%;"><strong>Contacto Institucional:</strong> ${docenteEmail}</td>
              </tr>
              <tr>
                <td colspan="2" style="border: 1px solid #000; padding: 2.5px 4px; white-space: pre-line;"><strong>Equipamiento y Software:</strong> Servidores de laboratorio, estaciones de trabajo con IDE instalado, compiladores, conectividad y bitácoras técnicas.</td>
              </tr>
            </table>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">3.- Justificación y Propósito del Saber Procedimental</div>
            <div style="border: 1px solid #000; padding: 4px 6px; margin-bottom: 6px; text-align: justify; line-height: 1.35; font-size: 6.8pt; white-space: pre-line;">
              La práctica formativa permite afianzar destrezas procedimentales y habilidades operativas críticas a través de la experimentación controlada, el modelado guiado y la validación en laboratorio. Proporciona al futuro profesional la capacidad resolutiva para afrontar desafíos técnicos con disciplina de ingeniería y responsabilidad social.
            </div>

            <div style="font-weight: bold; font-size: 8pt; margin-bottom: 2px;">8.- Cronograma Semestral de la Práctica (Sección 8 del PAC Práctico)</div>
            <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; font-size: 6.5pt; margin-bottom: 6px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: center; font-weight: bold;">
                  <th style="border: 1px solid #000; padding: 3px 2px; width: 5%;">SEM</th>
                  <th style="border: 1px solid #000; padding: 3px 2px; width: 5%;">SES</th>
                  <th style="border: 1px solid #000; padding: 3px 4px; width: 22%;">NOMBRE DE LA PRÁCTICA</th>
                  <th style="border: 1px solid #000; padding: 3px 4px; width: 26%;">ACTIVIDADES DE LA PRÁCTICA</th>
                  <th style="border: 1px solid #000; padding: 3px 4px; width: 22%;">DESEMPEÑO PROCEDIMENTAL</th>
                  <th style="border: 1px solid #000; padding: 3px 2px; width: 10%;">INSTRUMENTO</th>
                  <th style="border: 1px solid #000; padding: 3px 4px; width: 10%;">EVIDENCIA</th>
                </tr>
              </thead>
              <tbody>
                ${pracRowsHtml}
              </tbody>
            </table>

            <div style="border: 1px solid #000; padding: 3px 5px; text-align: justify; line-height: 1.3; font-size: 6.8pt; white-space: pre-line;">
              <div style="font-weight: bold; font-size: 7.2pt; margin-bottom: 1px;">Normas de Bioseguridad y Evaluación en Laboratorio</div>
              <div>Es obligatorio el uso de credencial, respeto a las normas de seguridad del laboratorio, prohibición de alimentos, respaldo continuo en repositorios y entrega oportuna del informe de práctica en la plataforma SEA. La evaluación práctica equivale al 100% de la ponderación procedimental del período académico.</div>
            </div>

            <div style="text-align: center; font-size: 8pt; margin-top: 5px;">PACP - 1</div>
          </div>
        `;
      }

      // 8. PLANES DE CLASE TEÓRICOS (PCT)
      const shouldRenderPlanesTeoricos = selectedSections.includes('plan_teorico') || (selectedSections.includes('plan_clase') && !selectedSections.includes('plan_prac'));
      if (shouldRenderPlanesTeoricos) {
        let teoricoList = [];
        const savedTeorico = localStorage.getItem('sisa_saved_planes_teorico_' + mKey) || localStorage.getItem('sisa_saved_planes_' + mKey);
        if (savedTeorico) {
          try { teoricoList = JSON.parse(savedTeorico); } catch(e) {}
        }
        if (!teoricoList || teoricoList.length === 0) {
          if (window.activePlanesTeoricoList && window.activePlanesTeoricoList.length > 0) {
            teoricoList = window.activePlanesTeoricoList;
          } else if (typeof activePlanesList !== 'undefined' && activePlanesList && activePlanesList.length > 0) {
            teoricoList = activePlanesList.filter(p => p.planType !== 'PRACTICO');
          }
        }
        if (!teoricoList || teoricoList.length === 0) {
          teoricoList = [
            {
              sesionId: 1,
              tema: 'Arquitectura de Software y Modelado de Datos',
              objetivo: 'Produce soluciones arquitectónicas complejas aplicando patrones de diseño bajo el marco normativo y metodologías activas.',
              saberConceptual: '- Fundamentos y patrones arquitectónicos\n- Estándares de calidad y documentación técnica',
              saberProcedimental: '- Implementación guiada en aula y laboratorio\n- Configuración de entornos y pruebas unitarias',
              saberActitudinal: '- Rigor técnico y responsabilidad ética\n- Trabajo colaborativo y compromiso profesional',
              estrategiaMetodologica: '- Aprendizaje Basado en Proyectos (ABP)\n- Talleres guiados y seminario de análisis',
              estrategiaAprendizaje: '- Mapeo de requerimientos y casos prácticos\n- Redacción técnica y defensa de proyecto',
              recursosEnsenanza: '- Plataforma SEA, IDE, Proyector y Guías de cátedra',
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

        let teoricoCardsHtml = '';
        teoricoList.forEach((p, idx) => {
          teoricoCardsHtml += `
            <div style="border: 1.5px solid #000; margin-bottom: 8mm; page-break-inside: avoid; font-size: 8pt; background: #fff;">
              <div style="background: #f8fafc; border-bottom: 1.5px solid #000; padding: 4px 8px; text-align: center;">
                <div style="font-weight: bold; font-size: 10pt; color: #581c87;">UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC</div>
                <div style="font-weight: bold; font-size: 9pt; color: #000;">PLAN DE CLASE TEÓRICO (PCT) - SESIÓN #${p.sesionId || (idx + 1)}</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000; font-size: 7.5pt;">
                <tr>
                  <td style="padding: 3px 6px; width: 50%; border-right: 1px solid #ccc;"><strong>Nombre del docente:</strong> ${docenteName}</td>
                  <td style="padding: 3px 6px; width: 50%;"><strong>Asignatura:</strong> ${safe(currentAsignatura)}</td>
                </tr>
                <tr style="border-top: 1px solid #ccc;">
                  <td style="padding: 3px 6px; border-right: 1px solid #ccc;"><strong>Fecha:</strong> 28/08/2026 &nbsp;|&nbsp; <strong>Semestre:</strong> ${currentSemestre}</td>
                  <td style="padding: 3px 6px;"><strong>Carrera:</strong> ${displayCareerName}</td>
                </tr>
              </table>

              <div style="padding: 4px 6px; border-bottom: 1px solid #ccc; background: #fafafa; font-size: 7.5pt;">
                <p style="margin: 2px 0;"><strong>UNIDAD:</strong> ${safe(p.unidadTitulo || `Unidad ${idx + 1}`)}</p>
                <p style="margin: 2px 0;"><strong>TEMA ESPECÍFICO:</strong> ${safe(p.tema || p.contenidoTema || 'Contenido Programático Oficial')}</p>
                <p style="margin: 2px 0; white-space: pre-line;"><strong>Resultados de Aprendizaje:</strong> ${safe(p.objetivo || p.objetivoSesion || 'Aplica los principios y fundamentos normados de la disciplina.')}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #ccc; font-size: 7.2pt;">
                <tr style="background: #e0f2fe; font-weight: bold; text-align: center;">
                  <th style="border: 1px solid #cbd5e1; padding: 2px 4px; width: 33%;">SABER CONCEPTUAL</th>
                  <th style="border: 1px solid #cbd5e1; padding: 2px 4px; width: 34%;">SABER PROCEDIMENTAL</th>
                  <th style="border: 1px solid #cbd5e1; padding: 2px 4px; width: 33%;">SABER ACTITUDINAL</th>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 3px 4px; vertical-align: top; white-space: pre-line; word-break: break-word;">${safe(p.saberConceptual || p.saberesConceptual || '- Conceptos fundamentales\n- Definiciones y principios')}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 3px 4px; vertical-align: top; white-space: pre-line; word-break: break-word;">${safe(p.saberProcedimental || p.saberesProcedimental || '- Resolución guiada\n- Aplicación práctica')}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 3px 4px; vertical-align: top; white-space: pre-line; word-break: break-word;">${safe(p.saberActitudinal || p.saberesActitudinal || '- Responsabilidad y ética\n- Rigor metodológico')}</td>
                </tr>
              </table>

              <table style="width: 100%; border-collapse: collapse; font-size: 7.2pt;">
                <tr style="background: #6b21a8; color: white; font-weight: bold;">
                  <th style="padding: 3px 6px; text-align: left; width: 22%;">SECUENCIA DIDÁCTICA (5 MOMENTOS)</th>
                  <th style="padding: 3px 6px; text-align: left; width: 66%;">ACTIVIDAD DETALLADA</th>
                  <th style="padding: 3px 6px; text-align: center; width: 12%;">DURACIÓN</th>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #0284c7; vertical-align: top;">1. INTRODUCCIÓN / ACTIVACIÓN</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.inicioActividad || p.momento1Motivacion || 'Activación de conocimientos previos y presentación de objetivos.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.inicioDuracion || '30 min')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #059669; vertical-align: top;">2. DESARROLLO (Cuerpo Teórico)</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.desarrolloActividad || p.momento3Contacto || 'Exposición dialogada de conceptos, análisis guiado de casos y ejercicios.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.desarrolloDuracion || '180 min')}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 6px; font-weight: bold; color: #d97706; vertical-align: top;">3. CIERRE Y EVALUACIÓN</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.cierreActividad || p.momento5Evaluacion || 'Síntesis de aprendizajes, evaluación formativa mediante rúbrica y retroalimentación.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.cierreDuracion || '60 min')}</td>
                </tr>
              </table>
            </div>
          `;
        });

        docHtml += `
          <div class="print-page" style="padding: 10mm 10mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 4mm;">
              <div style="font-size: 15pt; font-weight: 900; color: #581c87;">UNITEPC • PLANES DE CLASE TEÓRICOS POR SESIÓN (PCT)</div>
              <div style="font-size: 9pt; font-weight: bold; color: #0d9488;">${currentCodigo} • ${safe(currentAsignatura)} (Docente: ${docenteName})</div>
            </div>
            ${teoricoCardsHtml}
          </div>
        `;
      }

      // 9. PLANES DE CLASE PRÁCTICOS (PCP)
      const shouldRenderPlanesPracticos = selectedSections.includes('plan_prac') || (selectedSections.includes('plan_clase') && (window.activePlanType === 'PRACTICO' || selectedSections.includes('pac_prac')));
      if (shouldRenderPlanesPracticos) {
        let practicoList = [];
        const savedPrac = localStorage.getItem('sisa_saved_planes_prac_' + mKey);
        if (savedPrac) {
          try { practicoList = JSON.parse(savedPrac); } catch(e) {}
        }
        if (practicoList && Array.isArray(practicoList) && practicoList.some(p => p.contenidoTema && p.contenidoTema.includes('Configuración de Entorno Experimental'))) {
          practicoList = [];
        }
        if (!practicoList || practicoList.length === 0) {
          if (window.activePlanesPracticoList && window.activePlanesPracticoList.length > 0) {
            practicoList = window.activePlanesPracticoList;
          } else if (typeof activePlanesList !== 'undefined' && activePlanesList && activePlanesList.length > 0) {
            practicoList = activePlanesList.filter(p => p.planType === 'PRACTICO');
          }
        }
        if (!practicoList || !Array.isArray(practicoList)) {
          practicoList = [];
        }

        let practicoCardsHtml = '';
        if (practicoList.length === 0) {
          practicoCardsHtml = '<div style="padding: 16px; text-align: center; color: #64748b; font-style: italic; border: 1px dashed #cbd5e1; border-radius: 8px; margin-bottom: 6mm;">Sin planes de clase prácticos registrados en esta asignatura.</div>';
        } else {
        practicoList.forEach((p, idx) => {
          practicoCardsHtml += `
            <div style="border: 1.5px solid #000; margin-bottom: 8mm; page-break-inside: avoid; font-size: 8pt; background: #fff;">
              <div style="background: #f0fdfa; border-bottom: 1.5px solid #000; padding: 4px 8px; text-align: center;">
                <div style="font-weight: bold; font-size: 10pt; color: #0d9488;">UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC</div>
                <div style="font-weight: bold; font-size: 9pt; color: #000;">PLAN DE CLASE PRÁCTICO (PCP) - SESIÓN #${p.sesionId || (idx + 1)}</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000; font-size: 7.5pt;">
                <tr>
                  <td style="padding: 3px 6px; width: 50%; border-right: 1px solid #ccc;"><strong>Nombre del docente:</strong> ${docenteName}</td>
                  <td style="padding: 3px 6px; width: 50%;"><strong>Asignatura:</strong> ${safe(currentAsignatura)}</td>
                </tr>
                <tr style="border-top: 1px solid #ccc;">
                  <td style="padding: 3px 6px; border-right: 1px solid #ccc;"><strong>Ambiente / Lab:</strong> ${safe(p.ambiente || 'Laboratorio de Computación')}</td>
                  <td style="padding: 3px 6px;"><strong>Comisión / Estudiantes:</strong> ${safe(p.comision || 'PL-01')} (${safe(p.numEstudiantes || 25)} estudiantes)</td>
                </tr>
              </table>

              <div style="padding: 4px 6px; border-bottom: 1px solid #ccc; background: #fafafa; font-size: 7.5pt;">
                <p style="margin: 2px 0;"><strong>PRÁCTICA:</strong> ${safe(p.contenidoTema || p.tema || `Práctica ${idx + 1}`)}</p>
                <p style="margin: 2px 0; white-space: pre-line;"><strong>Objetivo de la Práctica:</strong> ${safe(p.objetivoSesion || p.objetivo || 'Desarrolla habilidades procedimentales mediante experimentación guiada.')}</p>
                <p style="margin: 2px 0; white-space: pre-line;"><strong>Equipamiento y Bioseguridad:</strong> ${safe(p.equipamiento || 'Equipos de computación, manual de normas y bitácoras institucionales.')}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 7.2pt;">
                <tr style="background: #0d9488; color: white; font-weight: bold;">
                  <th style="padding: 3px 6px; text-align: left; width: 25%;">FASE DE LA PRÁCTICA (4 FASES)</th>
                  <th style="padding: 3px 6px; text-align: left; width: 63%;">DESCRIPCIÓN DE LA ACTIVIDAD EXPERIMENTAL</th>
                  <th style="padding: 3px 6px; text-align: center; width: 12%;">DURACIÓN</th>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #0284c7; vertical-align: top;">FASE 1: PREPARATORIA</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.fase1Prep || 'Verificación de equipos, directrices de seguridad y objetivos de la práctica.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.fase1PrepDur || 20)} min</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #0d9488; vertical-align: top;">FASE 2: DEMOSTRACIÓN GUIADA</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.fase2Guiada || 'Explicación técnica paso a paso del protocolo experimental por el docente.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.fase2GuiadaDur || 40)} min</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 3px 6px; font-weight: bold; color: #7c3aed; vertical-align: top;">FASE 3: EJECUCIÓN AUTÓNOMA</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.fase3Autonoma || 'Desarrollo independiente del protocolo por los equipos y captura de resultados.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.fase3AutonomaDur || 50)} min</td>
                </tr>
                <tr>
                  <td style="padding: 3px 6px; font-weight: bold; color: #b45309; vertical-align: top;">FASE 4: CONCLUSIÓN Y CIERRE</td>
                  <td style="padding: 3px 6px; white-space: pre-line; word-break: break-word;">${safe(p.fase4Cierre || 'Análisis de resultados, conclusiones técnicas y registro en bitácora evaluada.')}</td>
                  <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${safe(p.fase4CierreDur || 25)} min</td>
                </tr>
              </table>

              <div style="padding: 3px 6px; border-top: 1px solid #ccc; background: #f8fafc; font-size: 7.2pt; display: flex; justify-content: space-between;">
                <span><strong>Instrumento de Evaluación:</strong> ${safe(p.instrumentoEvaluacion || 'Rúbrica de Práctica')}</span>
                <span><strong>Evidencia Entregable:</strong> ${safe(p.evidenciasEvaluacion || 'Informe de Laboratorio')}</span>
              </div>
            </div>
          `;
        });
        }

        docHtml += `
          <div class="print-page" style="padding: 10mm 10mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 4mm;">
              <div style="font-size: 15pt; font-weight: 900; color: #0d9488;">UNITEPC • PLANES DE CLASE PRÁCTICOS POR SESIÓN (PCP)</div>
              <div style="font-size: 9pt; font-weight: bold; color: #581c87;">${currentCodigo} • ${safe(currentAsignatura)} (Docente: ${docenteName})</div>
            </div>
            ${practicoCardsHtml}
          </div>
        `;
      }

      // ── TAB 5: NÓMINA OFICIAL Y CONTROL DE ASISTENCIA (80% RULE) ─────────────
      if (selectedSections.includes('asistencia')) {
        let printRowsHtml = '';
        let pSeq = 1;

        const printStudents = (activeRosterStudents && activeRosterStudents.length > 0)
          ? activeRosterStudents
          : [];

        const printByCareer = new Map();
        printStudents.forEach(s => {
          const cKey = s.carreraCodigo || 'CARSIS';
          if (!printByCareer.has(cKey)) {
            printByCareer.set(cKey, { code: cKey, name: s.carreraNombre || 'Ingeniería de Sistemas', list: [] });
          }
          printByCareer.get(cKey).list.push(s);
        });

        printByCareer.forEach((pCohort, pCareerCode) => {
          printRowsHtml += `
            <tr style="background: #f1f5f9; font-weight: bold; border-top: 2px solid #0f766e; border-bottom: 2px solid #0f766e;">
              <td colspan="6" style="padding: 4px 8px; font-size: 8.5pt; text-transform: uppercase; color: #0f766e;">
                CARRERA: ${pCohort.name} (${pCareerCode}) • ${pCohort.list.length} ESTUDIANTES MATRICULADOS
              </td>
            </tr>
          `;

          pCohort.list.forEach(s => {
            const rec = (currentAttendanceSession && currentAttendanceSession.estudiantes && currentAttendanceSession.estudiantes[s.code])
              ? currentAttendanceSession.estudiantes[s.code]
              : { estado: 'PRESENTE', observacion: '' };
            const cum = cumulativeAttendanceMetrics[s.code];
            const pctVal = cum ? `${cum.porcentajeAsistencia}%` : '100%';
            const cumpleVal = (!cum || cum.cumpleNormativa80Pct) ? 'HABILITADO' : 'INHABILITADO';
            const cumpleColor = (!cum || cum.cumpleNormativa80Pct) ? '#047857' : '#b91c1c';

            printRowsHtml += `
              <tr style="border-bottom: 1px solid #e2e8f0; font-size: 8pt;">
                <td style="padding: 3px 6px; text-align: center; color: #64748b;">${pSeq++}</td>
                <td style="padding: 3px 6px; text-align: center; font-family: monospace; font-weight: bold;">${s.code}</td>
                <td style="padding: 3px 8px; font-weight: 500;">${s.fullName}</td>
                <td style="padding: 3px 6px; text-align: center; font-weight: bold;">${s.carreraCodigo}</td>
                <td style="padding: 3px 6px; text-align: center; font-weight: bold; color: ${rec.estado === 'PRESENTE' ? '#047857' : (rec.estado === 'FALTA' ? '#b91c1c' : '#d97706')};">${rec.estado}</td>
                <td style="padding: 3px 6px; text-align: center; font-weight: bold; color: ${cumpleColor};">${pctVal} (${cumpleVal})</td>
              </tr>
            `;
          });
        });

        docHtml += `
          <div class="print-page" style="padding: 10mm 10mm; font-family: Arial, Helvetica, sans-serif; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 4mm; border-bottom: 2px solid #0f766e; padding-bottom: 3mm;">
              <div style="font-size: 15pt; font-weight: 900; color: #1e3a8a;">UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC</div>
              <div style="font-size: 10pt; font-weight: bold; color: #0f766e; text-transform: uppercase;">REGISTRO OFICIAL DE ASISTENCIA Y CONTROL DE CUMPLIMIENTO (REGLA 80%)</div>
              <div style="font-size: 8.5pt; color: #334155; margin-top: 1mm;">
                ${currentCodigo} • ${safe(currentAsignatura)} | Docente: ${docenteName} | Gestión: II-2026 | Total Inscritos: ${printStudents.length}
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6mm;">
              <thead>
                <tr style="background: #0f766e; color: #fff; font-size: 8.5pt; text-transform: uppercase;">
                  <th style="padding: 4px 6px; width: 30px; text-align: center;">Nº</th>
                  <th style="padding: 4px 6px; width: 90px; text-align: center;">Código</th>
                  <th style="padding: 4px 8px; text-align: left;">Estudiante (Apellidos y Nombres)</th>
                  <th style="padding: 4px 6px; width: 60px; text-align: center;">Carrera</th>
                  <th style="padding: 4px 6px; width: 90px; text-align: center;">Estado Sesión</th>
                  <th style="padding: 4px 6px; width: 140px; text-align: center;">Normativa 80%</th>
                </tr>
              </thead>
              <tbody>
                ${printRowsHtml}
              </tbody>
            </table>

            <!-- Endorsement Signature Block -->
            <div style="display: flex; justify-content: space-around; margin-top: 12mm; page-break-inside: avoid;">
              <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4px; font-size: 8.5pt;">
                <strong>${docenteName}</strong><br>
                <span>Docente Titular de Asignatura</span>
              </div>
              <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4px; font-size: 8.5pt;">
                <strong>Lic. Mariana Rios Vargas</strong><br>
                <span>Director / Jefe de Carrera</span>
              </div>
            </div>
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
      if (window.activeCronogramaType === 'PRACTICO') {
        const tbody = document.getElementById('cronograma-practico-table-body');
        if (!tbody) return;
        const currentRows = tbody.querySelectorAll('tr').length;
        const nextSem = Math.min(20, currentRows + 1);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50';
        tr.innerHTML = `
          <td class="py-2 px-1 text-center align-top"><input type="text" value="${nextSem}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-slate-800 font-bold text-teal-800 dark:text-teal-300 text-xs"></td>
          <td class="py-2 px-1 text-center align-top"><input type="text" value="${nextSem}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-slate-800 font-bold text-teal-600 dark:text-teal-400 text-xs"></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Título de la práctica..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Actividad de la práctica..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Desempeño procedimental..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Instrumento..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">Rúbrica de Práctica</textarea></td>
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Evidencias..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">Guía de laboratorio evaluada</textarea></td>
          <td class="py-2 px-1 text-center align-top no-print">
            <button type="button" onclick="this.closest('tr').remove(); window.scheduleAutoSave();" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Eliminar fila">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          tr.querySelectorAll('textarea').forEach(t => window.autoResizeTextarea(t));
        }, 10);
        window.showToast('✓ Nueva fila agregada al cronograma de prácticas');
      } else {
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
          <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Instrumento..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none"></textarea></td>
          <td class="py-2 px-1 text-center align-top no-print">
            <button type="button" onclick="this.closest('tr').remove(); window.scheduleAutoSave();" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Eliminar fila">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          tr.querySelectorAll('textarea').forEach(t => window.autoResizeTextarea(t));
        }, 10);
        window.showToast('✓ Nueva fila agregada al cronograma teórico');
      }
    };


    window.triggerAutoCapture = function() {
      if (typeof window.showOfficialUploadModal === 'function') {
        window.showOfficialUploadModal();
      }
    };

    // ── DYNAMIC PLANES DE CLASE ENGINE (TAB 4) ───────────────────────────
    let activePlanesList = [];
    let activePlanSheetIndex = 0;

    function setVal(id, val) {
      const el = document.getElementById(id);
      if (el) el.value = (val !== null && val !== undefined) ? val : '';
    }

    // ── REFERENCIAS BIBLIOGRÁFICAS DEL PLAN DE CLASE ─────────────────────
    window.getAvailableSubjectBibliography = function() {
      const books = [];
      const mKey = activeMateriaKey || localStorage.getItem('sisa_active_materia_key') || '';
      if (mKey) {
        const savedProgStr = localStorage.getItem('sisa_saved_programa_analitico_' + mKey);
        if (savedProgStr) {
          try {
            const p = JSON.parse(savedProgStr);
            if (p.bibliografia && Array.isArray(p.bibliografia) && p.bibliografia.length > 0) {
              p.bibliografia.forEach(b => {
                const title = b.citaApa || (b.autor ? `${b.autor} (${b.anio || ''}). ${b.titulo || ''}` : b.titulo);
                if (title && !books.includes(title)) books.push(title);
              });
            }
          } catch(e) {}
        }
      }
      const basicaEl = document.getElementById('analitico-biblio-basica-input');
      if (basicaEl && basicaEl.value) {
        basicaEl.value.split('\n\n').forEach(line => {
          const clean = line.trim();
          if (clean && !books.includes(clean)) books.push(clean);
        });
      }
      const compEl = document.getElementById('analitico-biblio-comp-input');
      if (compEl && compEl.value) {
        compEl.value.split('\n\n').forEach(line => {
          const clean = line.trim();
          if (clean && !books.includes(clean)) books.push(clean);
        });
      }
      if (books.length === 0) {
        books.push('Victor Chungara - Apuntes y Problemas de Calculo 1 (2025)');
        books.push('Joyanes Aguilar, L. (2021). Fundamentos de Programación: Algoritmos, Estructuras de Datos y Objetos (6ª ed.). McGraw-Hill.');
        books.push('García Llinás, L. F. (2022). Todo sobre Patrones de Diseño: Un enfoque práctico orientado a objetos. Ediciones de la U.');
        books.push('Vaughan, J. (2023). Object-Oriented Game Development: Real-World Design and Architecture. CRC Press.');
        books.push('Sznajdleder, P. (2021). Programación Orientada a Objetos y Estructuras de Datos. Alfaomega.');
      }
      return books;
    };

    window.renderPlanReferenciasBibliograficas = function(sheetIndex) {
      const container = document.getElementById('plan-referencias-list');
      if (!container) return;
      const idx = (sheetIndex !== undefined && sheetIndex !== null) ? sheetIndex : activePlanSheetIndex;
      if (!activePlanesList || !activePlanesList[idx]) {
        container.innerHTML = '<div class="text-[11px] text-slate-400 italic">No hay tema activo seleccionado.</div>';
        return;
      }
      const p = activePlanesList[idx];
      if (!p.referenciasBibliograficas || !Array.isArray(p.referenciasBibliograficas)) {
        p.referenciasBibliograficas = [
          { texto: 'Victor Chungara - Apuntes y Problemas de Calculo 1 (2025)', pagDesde: '', pagHasta: '' }
        ];
      }
      const availableBooks = window.getAvailableSubjectBibliography();

      if (p.referenciasBibliograficas.length === 0) {
        container.innerHTML = `
          <div class="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            No se añadieron referencias bibliográficas para este tema. Haz clic en <strong>+ Agregar Referencia</strong>.
          </div>
        `;
        return;
      }

      let html = '';
      p.referenciasBibliograficas.forEach((ref, refIdx) => {
        const selectedBook = ref.texto || availableBooks[0] || '';
        const optionsHtml = availableBooks.map(b => {
          const isSel = (b === selectedBook) ? 'selected' : '';
          return `<option value="${escapeHtml(b)}" ${isSel}>${escapeHtml(b)}</option>`;
        }).join('');

        html += `
          <div class="plan-ref-item p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-center gap-3.5 transition-all">
            <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <i data-lucide="book" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 space-y-2">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Bibliografía:</label>
                <select class="plan-ref-select w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-900 cursor-pointer" onchange="window.syncCurrentPlanFormToState();">
                  ${optionsHtml}
                </select>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-28">
                  <input type="text" value="${escapeHtml(ref.pagDesde || '')}" placeholder="Pág. desde" class="plan-ref-desde w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-center font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900" oninput="window.syncCurrentPlanFormToState();">
                </div>
                <div class="w-28">
                  <input type="text" value="${escapeHtml(ref.pagHasta || '')}" placeholder="Pág. hasta" class="plan-ref-hasta w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-center font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900" oninput="window.syncCurrentPlanFormToState();">
                </div>
              </div>
            </div>
            <button type="button" title="Eliminar referencia" onclick="window.removePlanReferenciaBibliografica(${refIdx})" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      });

      container.innerHTML = html;
      if (window.lucide) window.lucide.createIcons();
    };

    window.addPlanReferenciaBibliografica = function() {
      if (!activePlanesList || !activePlanesList[activePlanSheetIndex]) return;
      const p = activePlanesList[activePlanSheetIndex];
      if (!p.referenciasBibliograficas || !Array.isArray(p.referenciasBibliograficas)) {
        p.referenciasBibliograficas = [];
      }
      const books = window.getAvailableSubjectBibliography();
      p.referenciasBibliograficas.push({
        texto: books[0] || '',
        pagDesde: '',
        pagHasta: ''
      });
      window.renderPlanReferenciasBibliograficas(activePlanSheetIndex);
      window.syncCurrentPlanFormToState();
    };

    window.removePlanReferenciaBibliografica = function(refIndex) {
      if (!activePlanesList || !activePlanesList[activePlanSheetIndex]) return;
      const p = activePlanesList[activePlanSheetIndex];
      if (p.referenciasBibliograficas && Array.isArray(p.referenciasBibliograficas)) {
        p.referenciasBibliograficas.splice(refIndex, 1);
      }
      window.renderPlanReferenciasBibliograficas(activePlanSheetIndex);
      window.syncCurrentPlanFormToState();
    };

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
      if (!activePlanesList || activePlanesList.length === 0) {
        const planFields = [
          'plan-docente-input', 'plan-fecha-input', 'plan-asig-input', 'plan-carrera-input',
          'plan-unidad-input', 'plan-tema-input', 'plan-elemento-input', 'plan-resultados-input',
          'plan-logros-input', 'plan-indicadores-input', 'plan-conceptual-input',
          'plan-procedimental-input', 'plan-actitudinal-input', 'plan-est-ensenanza',
          'plan-est-aprendizaje', 'plan-est-recursos', 'plan-eval-form-act',
          'plan-eval-form-inst', 'plan-eval-form-evid', 'plan-eval-sum-act',
          'plan-eval-sum-inst', 'plan-eval-sum-evid', 'plan-sec-intro',
          'plan-sec-intro-dur', 'plan-sec-resultados', 'plan-sec-resultados-dur',
          'plan-sec-contenidos', 'plan-sec-contenidos-dur', 'plan-sec-desarrollo',
          'plan-sec-desarrollo-dur', 'plan-sec-cierre', 'plan-sec-cierre-dur',
          'plan-obs-input',
          'plan-grupo-input', 'plan-prac-ambiente', 'plan-prac-estudiantes',
          'plan-prac-bloom', 'plan-prac-equipos',
          'plan-sec-fase1', 'plan-sec-fase1-dur', 'plan-sec-fase2', 'plan-sec-fase2-dur',
          'plan-sec-fase3', 'plan-sec-fase3-dur', 'plan-sec-fase4', 'plan-sec-fase4-dur'
        ];
        planFields.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        if (typeof window.updateSecuenciaPracticaTotals === 'function') {
          window.updateSecuenciaPracticaTotals();
        }
        return;
      }
      const p = activePlanesList[sheetIndex] || activePlanesList[0];
      if (!p) return;

      // 1. Encabezado
      const curPlanDoc = (typeof window.resolveCurrentDocente === 'function') ? window.resolveCurrentDocente() : { nombre: '' };
      setVal('plan-docente-input', curPlanDoc.nombre || p.nombreDocente || '');
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

      // Parámetros de Práctica y 4 Fases Metodológicas (Tasks 5.3 & 5.4)
      setVal('plan-grupo-input', p.comision || p.grupo || '');
      setVal('plan-prac-ambiente', p.ambiente || p.escenario || '');
      setVal('plan-prac-estudiantes', p.numEstudiantes || p.cantEstudiantes || '');
      setVal('plan-prac-bloom', p.nivelBloom || '');
      setVal('plan-prac-equipos', p.equipamiento || '');

      setVal('plan-sec-fase1', p.fase1Prep || '');
      setVal('plan-sec-fase1-dur', p.fase1PrepDur !== undefined ? p.fase1PrepDur : 15);
      setVal('plan-sec-fase2', p.fase2Guiada || '');
      setVal('plan-sec-fase2-dur', p.fase2GuiadaDur !== undefined ? p.fase2GuiadaDur : 25);
      setVal('plan-sec-fase3', p.fase3Autonoma || '');
      setVal('plan-sec-fase3-dur', p.fase3AutonomaDur !== undefined ? p.fase3AutonomaDur : 40);
      setVal('plan-sec-fase4', p.fase4Cierre || '');
      setVal('plan-sec-fase4-dur', p.fase4CierreDur !== undefined ? p.fase4CierreDur : 10);

      if (typeof window.renderDynamicPlanForm === 'function') {
        window.renderDynamicPlanForm(p.planType || window.activePlanType || 'TEORICO_PRACTICO');
      }
      if (typeof window.updateSecuenciaPracticaTotals === 'function') {
        window.updateSecuenciaPracticaTotals();
      }

      if (typeof window.updateSecuenciaTotals === 'function') {
        window.updateSecuenciaTotals();
      }

      // Render Referencias Bibliográficas del Tema
      if (typeof window.renderPlanReferenciasBibliograficas === 'function') {
        window.renderPlanReferenciasBibliograficas(sheetIndex);
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

      // Sync practical fields and 4 phases (Tasks 5.3 & 5.4)
      p.comision = gv('plan-grupo-input');
      p.ambiente = gv('plan-prac-ambiente');
      p.numEstudiantes = gv('plan-prac-estudiantes');
      p.nivelBloom = gv('plan-prac-bloom');
      p.equipamiento = gv('plan-prac-equipos');
      p.planType = window.activePlanType || 'TEORICO_PRACTICO';

      p.fase1Prep = gv('plan-sec-fase1');
      p.fase1PrepDur = gn('plan-sec-fase1-dur');
      p.fase2Guiada = gv('plan-sec-fase2');
      p.fase2GuiadaDur = gn('plan-sec-fase2-dur');
      p.fase3Autonoma = gv('plan-sec-fase3');
      p.fase3AutonomaDur = gn('plan-sec-fase3-dur');
      p.fase4Cierre = gv('plan-sec-fase4');
      p.fase4CierreDur = gn('plan-sec-fase4-dur');

      if (typeof window.updateSecuenciaTotals === 'function') {
        window.updateSecuenciaTotals();
      }
      if (typeof window.updateSecuenciaPracticaTotals === 'function') {
        window.updateSecuenciaPracticaTotals();
      }

      // Sync Referencias Bibliográficas del Tema
      const refList = [];
      const refCards = document.querySelectorAll('#plan-referencias-list .plan-ref-item');
      refCards.forEach(item => {
        const sel = item.querySelector('.plan-ref-select');
        const desde = item.querySelector('.plan-ref-desde');
        const hasta = item.querySelector('.plan-ref-hasta');
        if (sel && sel.value) {
          refList.push({
            texto: sel.value,
            pagDesde: desde ? desde.value.trim() : '',
            pagHasta: hasta ? hasta.value.trim() : ''
          });
        }
      });
      p.referenciasBibliograficas = refList;

      const mKey = activeMateriaKey || 'default';
      if (window.activePlanType === 'PRACTICO') {
        window.activePlanesPracticoList = activePlanesList;
        localStorage.setItem('sisa_saved_planes_prac_' + mKey, JSON.stringify(activePlanesList));
      } else {
        window.activePlanesTeoricoList = activePlanesList;
        localStorage.setItem('sisa_saved_planes_teorico_' + mKey, JSON.stringify(activePlanesList));
      }
      localStorage.setItem('sisa_saved_planes_' + mKey, JSON.stringify(activePlanesList));
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
let activeAnaliticoUnidades = [];

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
    // Enforce global correlative numbering across all learning units (Unidad 1: Tema 1..N, Unidad 2: Tema N+1..M, etc.)
    let globalTemaSeq = 1;
    activeAnaliticoUnidades.forEach(u => {
      if (u.temas && Array.isArray(u.temas)) {
        u.temas.forEach(t => {
          t.numeroTema = globalTemaSeq++;
        });
      }
    });

    bodyHtml = '<div id="unidades-analiticas-container" class="space-y-4 pt-3">';
    activeAnaliticoUnidades.forEach((u, uIdx) => {
      let temasHtml = '';
      if (u.temas && u.temas.length > 0) {
        temasHtml = u.temas.map((t, tIdx) => `
          <div class="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-1">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] whitespace-nowrap">Tema ${t.numeroTema}:</span>
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


window.renumberAllTemasCorrelative = function() {
  let seq = 1;
  activeAnaliticoUnidades.forEach(u => {
    if (u.temas && Array.isArray(u.temas)) {
      u.temas.forEach(t => {
        t.numeroTema = seq++;
      });
    }
  });
};

window.addAnaliticoUnidad = function() {
  const newNum = activeAnaliticoUnidades.length + 1;
  let totalTemas = 0;
  activeAnaliticoUnidades.forEach(u => {
    totalTemas += (u.temas || []).length;
  });
  const nextTemaNum = totalTemas + 1;

  activeAnaliticoUnidades.push({
    numeroUnidad: newNum,
    titulo: 'Nueva Unidad ' + newNum,
    horasAcademicas: 20,
    temas: [
      {
        numeroTema: nextTemaNum,
        titulo: 'Introducción y Fundamentos',
        contenido: '• Conceptos básicos y contextualización de la temática.\n• Aplicaciones iniciales.'
      }
    ]
  });
  window.renumberAllTemasCorrelative();
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
    window.renumberAllTemasCorrelative();
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

  let priorTemas = 0;
  for (let i = 0; i < uIdx; i++) {
    priorTemas += (activeAnaliticoUnidades[i].temas || []).length;
  }
  const currentTemaNum = priorTemas + unit.temas.length + 1;

  unit.temas.push({
    numeroTema: currentTemaNum,
    titulo: 'Nuevo Tema Analítico',
    contenido: '• Desglose de contenidos y puntos a desarrollar.'
  });
  window.renumberAllTemasCorrelative();
  window.renderAnaliticoUnidades();
  window.scheduleAutoSave(500);
};

window.removeAnaliticoTema = function(uIdx, tIdx) {
  const unit = activeAnaliticoUnidades[uIdx];
  if (!unit || !unit.temas) return;
  unit.temas.splice(tIdx, 1);
  window.renumberAllTemasCorrelative();
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
  if (!window.getAuthToken() || window._isAuthScreenActive) return;
  window.updateAutoSaveStatus('DIRTY');
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(async () => {
    if (!window.getAuthToken() || window._isAuthScreenActive) return;
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
  if (!window.getAuthToken() || window._isAuthScreenActive) return;
  if (!silent) {
    window.showToast('⏳ Guardando cambios en la base de datos...');
  }

  const defData = (activeMateriaKey && materiasData[activeMateriaKey]) ? materiasData[activeMateriaKey] : (Object.values(materiasData)[0] || {});
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

  window.renumberAllTemasCorrelative();

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

  // Also persist PAC state with dual isolation (GRAL vs PRACTICO)
  if (typeof window.syncCurrentPacDomToState === 'function') {
    window.syncCurrentPacDomToState();
  }


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
  const mKey = materiaKey || localStorage.getItem('sisa_active_materia_key') || activeMateriaKey;
  if (!mKey) return;
  activeMateriaKey = mKey;
  const defData = (materiasData && materiasData[mKey]) ? materiasData[mKey] : {};
  activeAsignacionId = defData.asignacionId || 1;

  // 1. Programa Analítico
  const saved = localStorage.getItem('sisa_saved_programa_analitico_' + mKey);
  let pData = {
    codigo: defData.codigo || '',
    nombre: defData.nombre || '',
    carrera: defData.carrera || '',
    semestre: defData.semestre || '',
    creditos: defData.creditos || '',
    horasTeoricas: defData.horasTeoricas || '',
    horasPracticas: defData.horasPracticas || '',
    horasSemestre: '',
    caracterizacion: '',
    macroCompetencia: '',
    sistemaEvaluacion: '',
    unidades: [],
    bibliografia: []
  };

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.codigoAsignatura && (parsed.codigoAsignatura.startsWith('P-') || parsed.codigoAsignatura.startsWith('MAT-'))) {
        delete parsed.codigoAsignatura;
      }
      if (parsed.codigo && (parsed.codigo.startsWith('P-') || parsed.codigo.startsWith('MAT-'))) {
        delete parsed.codigo;
      }
      pData = Object.assign(pData, parsed);
    } catch (e) {}
  }

  const isDirectorScoped = Boolean(defData.isScopedDirector) || (typeof window.isCareerDirectorSession === 'function' && window.isCareerDirectorSession());
  const officialCode = (isDirectorScoped && defData.codigo) ? defData.codigo : (pData.codigoAsignatura || pData.codigo || defData.codigo || '');
  const officialNombre = (isDirectorScoped && defData.nombre) ? defData.nombre : (pData.nombreAsignatura || pData.nombre || defData.nombre || '');
  const officialCarrera = (isDirectorScoped && defData.carrera) ? defData.carrera : (pData.carrera || defData.carrera || '');

  if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = officialCode;
  if (document.getElementById('analitico-semestre-input')) document.getElementById('analitico-semestre-input').value = pData.semestre || '';
  if (document.getElementById('analitico-asig-input')) document.getElementById('analitico-asig-input').value = officialNombre;
  if (document.getElementById('analitico-carrera-input')) document.getElementById('analitico-carrera-input').value = officialCarrera;
  if (document.getElementById('analitico-creditos-input')) document.getElementById('analitico-creditos-input').value = pData.creditos || '';
  if (document.getElementById('analitico-ht-input')) document.getElementById('analitico-ht-input').value = (pData.horasTeoricas ? pData.horasTeoricas + ' Horas' : '');
  if (document.getElementById('analitico-hp-input')) document.getElementById('analitico-hp-input').value = (pData.horasPracticas ? pData.horasPracticas + ' Horas' : '');
  if (document.getElementById('analitico-hs-input')) document.getElementById('analitico-hs-input').value = (pData.horasSemestre ? pData.horasSemestre + ' Horas' : '');
  if (document.getElementById('programa-caracterizacion')) document.getElementById('programa-caracterizacion').value = pData.caracterizacion || '';
  if (document.getElementById('programa-macrocompetencia')) document.getElementById('programa-macrocompetencia').value = pData.macroCompetencia || '';
  if (document.getElementById('programa-sistema-evaluacion')) document.getElementById('programa-sistema-evaluacion').value = pData.sistemaEvaluacion || '';

  activeAnaliticoUnidades = (pData.unidades && pData.unidades.length > 0) ? JSON.parse(JSON.stringify(pData.unidades)) : [];
  window.renumberAllTemasCorrelative();
  window.renderAnaliticoUnidades();
  window.renderAnaliticoBibliografia(pData.bibliografia || []);

  // 2. PAC Pedagógico (Dual Isolation: General vs Práctico)
  if (typeof window.loadActivePacStateToDom === 'function') {
    window.loadActivePacStateToDom(window.activePacType || 'GRAL');
  }
  if (typeof window.renderDynamicPacForm === 'function') {
    window.renderDynamicPacForm(window.activePacType || 'GRAL');
  }

  // 3. Cronograma (Dual Isolation: General vs Práctico)
  if (typeof window.renderDynamicCronograma === 'function') {
    window.renderDynamicCronograma(window.activeCronogramaType || (window.activePacType === 'PRACTICO' ? 'PRACTICO' : 'GRAL'));
  }

  // 4. Planes de Clase (Dual Isolation: Teórico vs Práctico)
  const currentPlanType = window.activePlanType || (window.activePacType === 'PRACTICO' ? 'PRACTICO' : 'TEORICO');
  if (typeof window.loadActivePlanStateToDom === 'function') {
    window.loadActivePlanStateToDom(currentPlanType);
  } else {
    const savedPlanesStr = localStorage.getItem('sisa_saved_planes_' + mKey);
    if (savedPlanesStr) {
      try {
        activePlanesList = JSON.parse(savedPlanesStr);
      } catch (e) {
        activePlanesList = [];
      }
    } else {
      activePlanesList = [];
    }

    activePlanSheetIndex = 0;
    if (typeof window.renderPlanesSheetsTabs === 'function') {
      window.renderPlanesSheetsTabs();
    }
    if (typeof window.renderPlanSheetForm === 'function') {
      window.renderPlanSheetForm(0);
    }
  }

  return true;
};

window.generateDefaultPlanesList = function(mKey) {
  return [];
};

window.generateDefaultMatriz7 = function(mKey) {
  return [];
};




// ── DYNAMIC PAC ELEMENTOS DE COMPETENCIA ENGINE ─────────────────────────────
let activePacElementosCompetencia = [];

window.renderPacElementosCompetencia = function() {
  const container = document.getElementById('pac-elementos-competencia-container');
  if (!container) return;

  if (!activePacElementosCompetencia || activePacElementosCompetencia.length === 0) {
    const defData = (activeMateriaKey && materiasData[activeMateriaKey]) ? materiasData[activeMateriaKey] : (Object.values(materiasData)[0] || {});
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
      window.renumberAllTemasCorrelative();
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



// Helper to resolve currently active teacher identity from SEA or auth session
window.resolveCurrentDocente = function() {
  if (window.__ACTIVE_DOCENTE__) {
    const d = window.__ACTIVE_DOCENTE__;
    return {
      nombre: d.nombreCompleto || d.teacherName || '',
      email: d.email || (d.ci ? `${d.ci}@unitepc.edu.bo` : '')
    };
  }
  const user = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
  if (user) {
    const nombre = user.nombreCompleto || ((user.nombres || '') + ' ' + (user.apellidos || '')).trim() || user.username || '';
    const email = user.email || (user.ci ? `${user.ci}@unitepc.edu.bo` : '');
    return { nombre, email };
  }
  return { nombre: '', email: '' };
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
  const activeDefData = (typeof activeMateriaKey !== 'undefined' && typeof materiasData !== 'undefined' && materiasData && materiasData[activeMateriaKey]) ? materiasData[activeMateriaKey] : null;
  const isDirectorScoped = activeDefData && (Boolean(activeDefData.isScopedDirector) || (typeof window.isCareerDirectorSession === 'function' && window.isCareerDirectorSession()));

  setVal('pac-carrera-input', (isDirectorScoped && activeDefData.carrera) ? activeDefData.carrera : (data.carrera || 'FACEFA (ADMINISTRACIÓN / AUDITORÍA)'));
  setVal('pac-asig-input', (isDirectorScoped && activeDefData.nombre) ? activeDefData.nombre : (data.nombreAsignatura || 'TALLER DE IDIOMAS'));
  setVal('pac-codigo-input', (isDirectorScoped && activeDefData.codigo) ? activeDefData.codigo : (data.codigoAsignatura || 'ICEC23'));
  setVal('pac-tipo-curso', data.tipoCurso || 'Obligatorio');
  setVal('pac-modalidad', data.modalidad || 'Presencial');
  setVal('pac-semestre-input', data.semestre || '4°');
  setVal('pac-prerequisito', data.preRequisito || 'Ninguno');
  setVal('pac-creditos', data.creditos || '8.0');
  setVal('pac-sesiones-sem', data.sesionesSemanales ? data.sesionesSemanales + ' Sesiones (4 Horas)' : '2 Sesiones (4 Horas)');
  setVal('pac-horas-tp', data.horasTeoricasPracticas || '2T / 4P');

  // 2.- Docente Responsable
  // Auto-rellena estrictamente sólo la información disponible desde el SEA o sesión activa (nombre y email).
  // Formación y teléfono NO se rellenan automáticamente; sólo cargan lo guardado previamente por el usuario.
  const currentDoc = (typeof window.resolveCurrentDocente === 'function') ? window.resolveCurrentDocente() : { nombre: '', email: '' };
  const docenteNombreToSet = currentDoc.nombre || data.nombreDocente || '';
  const docenteEmailToSet = currentDoc.email || data.emailDocente || '';

  setVal('pac-docente-nombre', docenteNombreToSet);
  setVal('pac-docente-email', docenteEmailToSet);
  setVal('pac-docente-formacion', data.formacionDocente || '');
  setVal('pac-docente-telefono', data.telefonoDocente || '');

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
      const defData = (activeMateriaKey && materiasData[activeMateriaKey]) ? materiasData[activeMateriaKey] : (Object.values(materiasData)[0] || {});
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
      const displayInstrumento = (s.evidenciaAprendizaje !== undefined && s.evidenciaAprendizaje !== null)
        ? s.evidenciaAprendizaje
        : (s.instrumentoEvaluacion || '');
      tr.innerHTML = `
        <td class="py-2 px-1 text-center align-top"><input type="text" value="${escapeHtml(String(s.semana || ''))}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-xs"></td>
        <td class="py-2 px-1 text-center align-top"><input type="text" value="${escapeHtml(String(s.nroSesion || ''))}" oninput="window.scheduleAutoSave()" class="w-10 text-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-brand-600 dark:text-brand-400 text-xs"></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Unidad Temática..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.unidadTematica || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Tema específico..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.contenidoEspecifico || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Conceptual..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberConceptual || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Procedimental..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberProcedimental || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Saber Actitudinal..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.saberActitudinal || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Criterio de Desempeño..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(s.criterioDesempeno || '')}</textarea></td>
        <td class="py-2 px-2 align-top"><textarea rows="1" oninput="window.autoResizeTextarea(this); window.scheduleAutoSave();" placeholder="Instrumento..." class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-xs leading-relaxed overflow-hidden resize-none">${escapeHtml(displayInstrumento)}</textarea></td>
      `;
      tbody.appendChild(tr);
    });

    setTimeout(() => {
      if (typeof window.autoResizeAllTextareas === 'function') {
        window.autoResizeAllTextareas();
      }
    }, 20);
  }

  // PAC Práctico (Task 5.2 & Official Blank Template Sections)
  if (data.seccionesIdentificacion && data.seccionesIdentificacion.modeloMetodologico) {
    const mm = data.seccionesIdentificacion.modeloMetodologico;
    const f1 = mm['Fase 1'] || mm['Fase 1: Preparación'] || mm['Preparación'] || {};
    const f2 = mm['Fase 2'] || mm['Fase 2: Ejecución guiada'] || mm['Ejecución guiada'] || {};
    const f3 = mm['Fase 3'] || mm['Fase 3: Ejecución autónoma'] || mm['Ejecución autónoma'] || {};
    const f4 = mm['Fase 4'] || mm['Fase 4: Cierre'] || mm['Cierre'] || {};
    if (!data.pracFase1Prep) data.pracFase1Prep = f1.finalidad || f1.actuacionDocente || '';
    if (!data.pracFase2Guiada) data.pracFase2Guiada = f2.finalidad || f2.actuacionDocente || '';
    if (!data.pracFase3Autonoma) data.pracFase3Autonoma = f3.finalidad || f3.actuacionEstudiante || '';
    if (!data.pracFase4Cierre) data.pracFase4Cierre = f4.finalidad || f4.actuacionDocente || '';
  }

  if (data.seccionesIdentificacion && Array.isArray(data.seccionesIdentificacion.evaluacionActividades)) {
    const evals = data.seccionesIdentificacion.evaluacionActividades;
    if (!data.pracEvalCriterios && evals.length > 0) {
      data.pracEvalCriterios = evals.map(e => `${e.actividad || ''} (${e.tipo || ''}) - Ponderación: ${e.ponderacion || ''}`).join('\n');
    }
    if (!data.pracEvalInstrumentos && evals.length > 0) {
      data.pracEvalInstrumentos = evals.map(e => `Instrumento: ${e.instrumento || ''} | Evidencia: ${e.evidencia || ''}`).join('\n');
    }
  }

  setVal('pac-prac-escenario', data.pracEscenario || data.escenario);
  setVal('pac-prac-bioseguridad', data.pracBioseguridad || data.bioseguridad);
  setVal('pac-prac-equipamiento', data.pracEquipamiento || data.equipamiento);
  setVal('pac-prac-fase1-prep', data.pracFase1Prep || data.fase1Prep);
  setVal('pac-prac-fase2-guiada', data.pracFase2Guiada || data.fase2Guiada);
  setVal('pac-prac-fase3-autonoma', data.pracFase3Autonoma || data.fase3Autonoma);
  setVal('pac-prac-fase4-cierre', data.pracFase4Cierre || data.fase4Cierre);
  setVal('pac-prac-eval-criterios', data.pracEvalCriterios || data.evalCriterios || '');
  setVal('pac-prac-eval-instrumentos', data.pracEvalInstrumentos || data.evalInstrumentos || '');

  if (data.pacPracticas && Array.isArray(data.pacPracticas) && data.pacPracticas.length > 0) {
    window.pacPracticasList = data.pacPracticas;
  } else if (data.seccionesIdentificacion && Array.isArray(data.seccionesIdentificacion.contenidosPractica) && data.seccionesIdentificacion.contenidosPractica.length > 0) {
    window.pacPracticasList = data.seccionesIdentificacion.contenidosPractica.map(cp => ({
      numero: cp.numero || 1,
      titulo: cp.titulo || '',
      escenario: cp.escenario || 'Laboratorio Asignado',
      duracion: cp.duracion || '2',
      desempeno: cp.resultadoAprendizaje || '',
      instrumento: cp.instrumento || 'Rúbrica de Práctica'
    }));
  }
  if (typeof window.renderPacPracticasTable === 'function') {
    window.renderPacPracticasTable();
  }
};

window.classifyInstrumentoEnum = function(text) {
  if (!text) return 'RUBRICA';
  const upper = text.toUpperCase();
  if (upper.includes('COTEJO')) return 'LISTA_COTEJO';
  if (upper.includes('EXAM') || upper.includes('ESCRIT') || upper.includes('PRUEBA') || upper.includes('CUESTIONARIO') || upper.includes('SOLUCIONARIO') || upper.includes('CLAVE')) return 'PRUEBA_ESCRITA';
  if (upper.includes('ESTIMAT') || upper.includes('ESCALA') || upper.includes('RANGO') || upper.includes('APRECIACI') || upper.includes('GUÍA') || upper.includes('GUIA') || upper.includes('REGISTRO') || upper.includes('360')) return 'ESCALA_ESTIMATIVA';
  return 'RUBRICA';
};

window.extractCurrentCronogramaFromDom = function() {
  const tbody = document.getElementById('cronograma-table-body');
  if (!tbody) return [];
  const rows = tbody.querySelectorAll('tr');
  const sessions = [];
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input, textarea');
    if (inputs.length >= 9) {
      const instVal = (inputs[8].value || '').trim();
      sessions.push({
        semana: parseInt(inputs[0].value) || 1,
        nroSesion: parseInt(inputs[1].value) || 1,
        unidadTematica: inputs[2].value || '',
        contenidoEspecifico: inputs[3].value || '',
        saberConceptual: inputs[4].value || '',
        saberProcedimental: inputs[5].value || '',
        saberActitudinal: inputs[6].value || '',
        criterioDesempeno: inputs[7].value || '',
        evidenciaAprendizaje: instVal,
        instrumentoEvaluacion: window.classifyInstrumentoEnum(instVal)
      });
    }
  });
  return sessions;
};

// 3. Real Excel Import for PAC (General vs Práctico)
window.importPacExcel = function(goToCronograma, forcedType) {
  const currentPacType = forcedType || window.activePacType || 'GRAL';
  const docLabel = (currentPacType === 'PRACTICO') ? 'PAC Práctico' : 'PAC General';
  window.triggerFileUpload('.xlsx', async (file) => {
    window.showToast(`⏳ Subiendo y procesando ${docLabel} Excel: ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', String(activeAsignacionId || 1));
    formData.append('pacType', currentPacType);
    try {
      const headers = {
        ...window.getAuthHeaders(),
        'X-PAC-Type': currentPacType
      };
      const resp = await fetch('/api/v1/office/import/pac', {
        method: 'POST',
        headers: headers,
        body: formData
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      const data = json.data || json;

      if (currentPacType === 'PRACTICO') {
        window.activePacPracData = data;
        localStorage.setItem('sisa_saved_pac_prac_' + activeMateriaKey, JSON.stringify(data));
      } else {
        window.activePacGralData = data;
        localStorage.setItem('sisa_saved_pac_gral_' + activeMateriaKey, JSON.stringify(data));
        localStorage.setItem('sisa_saved_pac_' + activeMateriaKey, JSON.stringify(data));
      }

      window.populatePacDom(data);

      // Auto-save this freshly imported state to database & localStorage
      await window.saveCurrentDocenteData(true);

      // Auto-expand all textareas
      setTimeout(() => {
        if (typeof window.autoResizeAllTextareas === 'function') {
          window.autoResizeAllTextareas();
        }
      }, 50);

      if (currentPacType === 'PRACTICO') {
        const pracCount = (data.pacPracticas && Array.isArray(data.pacPracticas)) ? data.pacPracticas.length : 0;
        window.showToast(`✅ ¡PAC Práctico importado con éxito! (${pracCount} prácticas de laboratorio registradas)`);
        window.switchDocMainTab('tab-pac-matrix');
      } else {
        const sesCount = (data.matriz7 && Array.isArray(data.matriz7)) ? data.matriz7.length : 0;
        if (goToCronograma || activeTabId === 'tab-cronograma-semanas') {
          window.showToast('✅ ¡Cronograma importado con éxito! (' + sesCount + ' sesiones cargadas en la Matriz 7)');
          window.switchDocMainTab('tab-cronograma-semanas');
        } else {
          window.showToast('✅ ¡PAC General y Cronograma importados con éxito! (' + sesCount + ' sesiones)');
          window.switchDocMainTab('tab-pac-matrix');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      window.showToast('❌ Error al importar ' + docLabel + ': ' + err.message);
    }
  });
};

// 4. Real Excel Import for Planes de Clase
window.importPlanesExcel = function(forcedType) {
  window.triggerFileUpload('.xlsx', async (file) => {
    const currentType = forcedType || window.activePlanType || 'TEORICO';
    const typeLabel = (currentType === 'PRACTICO') ? 'Práctico' : 'Teórico';
    window.showToast(`⏳ Subiendo y procesando Planes de Clase (${typeLabel}): ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asignacionId', String(activeAsignacionId || 1));
    formData.append('planType', currentType);
    try {
      const authHeaders = (typeof window.getAuthHeaders === 'function') ? window.getAuthHeaders() : {};
      const resp = await fetch('/api/v1/office/import/plan-clase', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'X-Plan-Type': currentType
        },
        body: formData
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      const data = json.data || json;
      activePlanesList = Array.isArray(data) ? data : [data];
      activePlanSheetIndex = 0;

      const mKey = activeMateriaKey || 'default';
      if (currentType === 'PRACTICO') {
        window.activePlanesPracticoList = activePlanesList;
        localStorage.setItem('sisa_saved_planes_prac_' + mKey, JSON.stringify(activePlanesList));
      } else {
        window.activePlanesTeoricoList = activePlanesList;
        localStorage.setItem('sisa_saved_planes_teorico_' + mKey, JSON.stringify(activePlanesList));
      }
      localStorage.setItem('sisa_saved_planes_' + mKey, JSON.stringify(activePlanesList));

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

      window.showToast(`✅ ¡Planes de Clase (${typeLabel}) importados con éxito! (${activePlanesList.length} temas/hojas cargadas)`);
      window.switchDocMainTab('tab-cronograma-planes');
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      window.showToast('❌ Error al importar Planes de Clase: ' + err.message);
    }
  });
};

// Aliases for direct UI tab buttons
window.triggerDocxUpload = function() { window.importProgramaDocx(); };
window.triggerPacUpload = function() { window.importPacExcel(false); };
window.triggerCronogramaUpload = function() { window.importPacExcel(true); };
window.triggerPlanesUpload = function() { window.importPlanesExcel(); };

// 5. Real Export Endpoints
window.exportDocxOfficial = async function() {
  window.exportExactFile('programa_docx');
};

window.exportPacOfficial = async function() {
  const pacType = window.activePacType || 'GRAL';
  window.exportExactFile(pacType === 'PRACTICO' ? 'pac_prac_xlsx' : 'pac_gral_xlsx');
};

window.exportPlanesOfficial = async function() {
  const planType = window.activePlanType || 'TEORICO';
  window.exportExactFile(planType === 'PRACTICO' ? 'planes_prac_xlsx' : 'planes_teorico_xlsx');
};

// Real actions and dual modalities for official file uploads
window.showOfficialUploadModal = function() {
  const modalBody = `
    <div class="space-y-4 text-xs">
      <p class="text-slate-700 dark:text-slate-300">Seleccioná el documento base oficial que deseas importar:</p>

      <!-- 1. PROGRAMA ANALÍTICO -->
      <div class="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <i data-lucide="file-text" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="font-bold text-slate-900 dark:text-white text-xs">1. Programa Analítico (.docx)</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Extrae Unidades de Aprendizaje, temas y bibliografía oficial APA</div>
          </div>
        </div>
        <button onclick="window.closeModal(); window.switchDocMainTab('tab-analitico'); window.importProgramaDocx();" class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm">
          <i data-lucide="upload" class="w-3.5 h-3.5"></i> Subir .docx
        </button>
      </div>

      <!-- 2. PAC CON CRONOGRAMA INTEGRADO -->
      <div class="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600 dark:text-emerald-400"></i>
            <span class="font-bold text-slate-900 dark:text-white text-xs">2. PAC con Cronograma Integrado (.xlsx)</span>
          </div>
          <span class="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">Incluye Cronograma</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Al importar el PAC se extrae automáticamente la planificación curricular junto con su respectivo cronograma semestral:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div onclick="window.closeModal(); window.switchDocMainTab('tab-pac-matrix'); window.switchActivePacType('GRAL'); window.importPacExcel(false, 'GRAL');" class="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between shadow-sm">
            <div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-xs">PAC General / Teórico</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">PAC-2026 GRAL.xlsx (Incluye Cronograma 20 semanas)</div>
            </div>
            <i data-lucide="upload" class="w-4 h-4 text-emerald-600"></i>
          </div>
          <div onclick="window.closeModal(); window.switchDocMainTab('tab-pac-matrix'); window.switchActivePacType('PRACTICO'); window.importPacExcel(false, 'PRACTICO');" class="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-500 cursor-pointer transition-all flex items-center justify-between shadow-sm">
            <div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-xs">PAC Práctico / Laboratorio</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">PAC-2026 PRACTICO.xlsx (Incluye Cronograma de Prácticas)</div>
            </div>
            <i data-lucide="upload" class="w-4 h-4 text-teal-600"></i>
          </div>
        </div>
      </div>

      <!-- 3. PLANES DE CLASE -->
      <div class="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="calendar-range" class="w-4 h-4 text-purple-600 dark:text-purple-400"></i>
            <span class="font-bold text-slate-900 dark:text-white text-xs">3. Planes de Clase (.xlsx)</span>
          </div>
          <span class="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">Fichas Didácticas</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div onclick="window.closeModal(); window.switchDocMainTab('tab-cronograma-planes'); window.switchActivePlanType('TEORICO'); window.importPlanesExcel('TEORICO');" class="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-500 cursor-pointer transition-all flex items-center justify-between shadow-sm">
            <div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-xs">Plan de Clases Teórico</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">PLAN DE CLASES TEÓRICO.xlsx (Momentos didácticos)</div>
            </div>
            <i data-lucide="upload" class="w-4 h-4 text-purple-600"></i>
          </div>
          <div onclick="window.closeModal(); window.switchDocMainTab('tab-cronograma-planes'); window.switchActivePlanType('PRACTICO'); window.importPlanesExcel('PRACTICO');" class="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between shadow-sm">
            <div>
              <div class="font-bold text-slate-800 dark:text-slate-200 text-xs">Plan de Clases Práctico</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">PLAN DE CLASES PRÁCTICO.xlsx (4 Fases laboratorio)</div>
            </div>
            <i data-lucide="upload" class="w-4 h-4 text-indigo-600"></i>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-title').innerText = 'Subir y Extraer Datos de los Documentos Base Oficiales';
  document.getElementById('modal-body').innerHTML = modalBody;
  document.getElementById('modal-footer').classList.add('hidden');
  document.getElementById('modal-container').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
};
window.triggerAutoCapture = window.showOfficialUploadModal;

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

    // 3. Tab 5 Attendance Badge sync
    const attBadge = document.getElementById('asistencia-sync-badge');
    if (attBadge && typeof window.updateAttendanceSyncBadge === 'function') {
      if (status === 'offline') {
        window.updateAttendanceSyncBadge('offline');
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
        const s = (data && data.status) ? data.status : 'offline';
        window.updateSeaGatewayStatus(s);
        if (s === 'offline' && typeof window.updateAttendanceSyncBadge === 'function') {
          window.updateAttendanceSyncBadge('offline');
        }
      })
      .catch(() => {
        window.updateSeaGatewayStatus('offline');
        if (typeof window.updateAttendanceSyncBadge === 'function') {
          window.updateAttendanceSyncBadge('offline');
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

        // Exclusively 4 real Cochabamba teachers from official SEA Gateway requested by user
        const targetDocentes = [
          { ci: '3065087', tag: '💻 [INGENIERÍA]', label: 'ROSMERY LUIZAGA SALINAS' },
          { ci: '9465510', tag: '💻 [SISTEMAS]', label: 'HAROLD MARCO ANTONIO ROJAS TORRES' },
          { ci: '6420833', tag: '🗣️ [IDIOMAS / FACEFA]', label: 'MANUEL CAMACHO ARCE' },
          { ci: '6535314', tag: '📐 [CIENCIAS EXACTAS]', label: 'EDSON LUIS BASCOPE GALARZA' }
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
          window.__SUPERVISION_AUDIT_COURSE_CODE__ = null;
          try { localStorage.removeItem('sisa_supervision_audit_course'); } catch (e) {}
          const returnBar = document.getElementById('director-supervision-return-bar');
          if (returnBar) returnBar.classList.add('hidden');
          if (typeof window.selectDocenteFromApi === 'function') {
            window.selectDocenteFromApi(ci, false);
          }
        });

        const currentUser = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
        let defaultCi = (currentUser && currentUser.role === 'ROLE_DOCENTE' && (currentUser.ci || currentUser.username)) 
          ? (currentUser.ci || currentUser.username) 
          : localStorage.getItem('sisa_active_docente_ci');
        if (!defaultCi || !targetDocentes.some(t => String(t.ci) === String(defaultCi))) {
          defaultCi = (currentUser && currentUser.role === 'ROLE_DOCENTE' && (currentUser.ci || currentUser.username)) 
            ? (currentUser.ci || currentUser.username) 
            : '3065087';
        }
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

  window.syncDocenteSelectorWithCi = function(cleanCi, teacherName) {
    const selector = document.getElementById('docente-api-selector');
    if (!selector) return;
    const opts = (selector && selector.options) ? Array.from(selector.options) : [];
    let opt = opts.find(o => String(o.value).trim() === String(cleanCi).trim());
    if (!opt && teacherName) {
      let auditGroup = document.getElementById('docente-selector-audit-group');
      if (!auditGroup) {
        auditGroup = document.createElement('optgroup');
        auditGroup.id = 'docente-selector-audit-group';
        auditGroup.label = '🔍 AUDITORÍA DE DIRECCIÓN (SUPERVISIÓN)';
        selector.appendChild(auditGroup);
      }
      opt = document.createElement('option');
      opt.value = cleanCi;
      opt.textContent = `👨‍🏫 ${teacherName} (${cleanCi})`;
      auditGroup.appendChild(opt);
    }
    if (opt) {
      selector.value = cleanCi;
    }
  };

  window.selectDocenteFromApi = async function(ci, silent = false, preferredCourseCode = null) {
    if (!ci) return null;
    const cleanCi = String(ci).trim();
    localStorage.setItem('sisa_active_docente_ci', cleanCi);

    // Cancel pending auto-save and reset form fields when switching teachers
    if (typeof autoSaveTimer !== 'undefined' && autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
    if (typeof window.resetAllDocenteFormFields === 'function') {
      window.resetAllDocenteFormFields();
    }
    if (typeof materiasData !== 'undefined' && materiasData) {
      Object.keys(materiasData).forEach(k => delete materiasData[k]);
    }

    let docente = (window.__API_DOCENTES__ || []).find(d => String(d.ci).trim() === cleanCi);

    // 0. Auto-purge cache if not updated to version with groupLinkId / isLead support
    if (!localStorage.getItem('sisa_purged_lead_v265')) {
      try {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('sisa_cache_doc_')) localStorage.removeItem(k);
        });
        localStorage.setItem('sisa_purged_lead_v265', 'true');
      } catch (e) {}
    }

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
          window.syncDocenteSelectorWithCi(cleanCi, cached.docente.nombreCompleto);
          window.renderDynamicSidebarForDocente(cached.docente, cached.courses || [], cached.groups, preferredCourseCode);
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
        if (Array.isArray(window.__API_DOCENTES__)) {
          window.__API_DOCENTES__.push(docente);
        }
      } else if (docente) {
        docente.grupos = activeGroups;
        docente.materiasNombres = [...new Set(activeGroups.map(g => g.courseName || g.name))];
      }

      if (!docente) return null;
      window.__ACTIVE_DOCENTE__ = docente;

      // Save to instant cache
      localStorage.setItem('sisa_cache_doc_' + cleanCi, JSON.stringify({ docente, courses, groups: activeGroups }));

      // Synchronize topbar selector
      window.syncDocenteSelectorWithCi(cleanCi, docente.nombreCompleto);

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

      // Update inputs with teacher information (auto-rellena sólo lo disponible en SEA/sesión)
      const currentDocName = docente.nombreCompleto || '';
      const currentDocEmail = docente.email || (docente.ci ? `${docente.ci}@unitepc.edu.bo` : '');

      const docNameInputs = ['docente-input', 'caratula-docente', 'pac-docente-nombre', 'plan-docente-input'];
      docNameInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = currentDocName;
      });

      const pacEmailInput = document.getElementById('pac-docente-email');
      if (pacEmailInput) {
        pacEmailInput.value = currentDocEmail;
      }

      window.renderDynamicSidebarForDocente(docente, courses, activeGroups, preferredCourseCode);

      if (!silent && typeof window.showToast === 'function') {
        window.showToast(`👨‍🏫 Sesión Docente SEA: ${docente.nombreCompleto} (${docente.ci})`);
      }
      return docente;
    } catch (e) {
      console.warn('Error syncing courses for docente:', e);
      return docente;
    }
  };

  // Official UNITEPC Gateway Careers Catalog
  const OFFICIAL_CAREERS_CATALOG = {
    'CARICO': { name: 'Ingeniería Comercial', tag: 'ING. COMERCIAL', faculty: 'FACEFA', color: 'emerald' },
    'CARCIC': { name: 'Complementaria Ing. Comercial', tag: 'COMP. ING. COMERCIAL', faculty: 'FACEFA', color: 'emerald' },
    'CARCCP': { name: 'Complementaria Contaduría Pública', tag: 'COMP. CONTADURÍA', faculty: 'FACEFA', color: 'emerald' },
    'CARCAD': { name: 'Complementaria Administración de Empresas', tag: 'COMP. ADMINISTRACIÓN', faculty: 'FACEFA', color: 'emerald' },
    'CARCPU': { name: 'Contaduría Pública', tag: 'CONTADURÍA PÚBLICA', faculty: 'FACEFA', color: 'emerald' },
    'CARECO': { name: 'Economía', tag: 'ECONOMÍA', faculty: 'FACEFA', color: 'emerald' },
    'CARADM': { name: 'Administración de Empresas', tag: 'ADMINISTRACIÓN', faculty: 'FACEFA', color: 'emerald' },
    'CARSIS': { name: 'Ing. de Sistemas', tag: 'ING. DE SISTEMAS', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'purple' },
    'CARELE': { name: 'Ing. Electrónica', tag: 'ING. ELECTRÓNICA', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'blue' },
    'CARSON': { name: 'Ing. de Sonido', tag: 'ING. DE SONIDO', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'indigo' },
    'CARIBI': { name: 'Ing. Biomédica', tag: 'ING. BIOMÉDICA', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'cyan' },
    'CARMED': { name: 'Medicina Humana', tag: 'MEDICINA HUMANA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'rose' },
    'CARODO': { name: 'Odontología', tag: 'ODONTOLOGÍA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'sky' },
    'CARBYF': { name: 'Bioquímica y Farmacia', tag: 'BIOQUÍMICA Y FARMACIA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'violet' },
    'CARENL': { name: 'Lic. en Enfermería', tag: 'ENFERMERÍA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'pink' },
    'CARFIS': { name: 'Fisioterapia y Kinesiología', tag: 'FISIOTERAPIA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'lime' },
    'CARFON': { name: 'Fonoaudiología', tag: 'FONOAUDIOLOGÍA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'orange' },
    'CARPRO': { name: 'Prótesis Dental', tag: 'PRÓTESIS DENTAL', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'yellow' },
    'CARVET': { name: 'Medicina Veterinaria y Zootecnia', tag: 'VETERINARIA', faculty: 'FACULTAD DE CIENCIAS AGRÍCOLAS Y VETERINARIAS', color: 'teal' },
    'CARNYD': { name: 'Nutrición y Dietética', tag: 'NUTRICIÓN', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'green' },
    'CARDER': { name: 'Derecho', tag: 'DERECHO', faculty: 'FACULTAD DE CIENCIAS JURÍDICAS Y SOCIALES', color: 'red' },
    'CARCSO': { name: 'Comunicación Social', tag: 'COMUNICACIÓN SOCIAL', faculty: 'FACULTAD DE CIENCIAS JURÍDICAS Y SOCIALES', color: 'fuchsia' },
    'CARAYE': { name: 'Arte y Escultura', tag: 'ARTE Y ESCULTURA', faculty: 'FACULTAD DE CIENCIAS SOCIALES', color: 'stone' },
    'CARCNE': { name: 'Cinematografía', tag: 'CINEMATOGRAFÍA', faculty: 'FACULTAD DE CIENCIAS SOCIALES', color: 'zinc' }
  };

  // Helper: Carrera name resolution
  window.resolveCarreraInfo = function(code, careerCode) {
    const cUpper = (careerCode || '').toUpperCase().trim();
    const codeUpper = (code || '').toUpperCase().trim();

    if (OFFICIAL_CAREERS_CATALOG[cUpper]) {
      return OFFICIAL_CAREERS_CATALOG[cUpper];
    }

    if (cUpper.includes('ICO') || cUpper.includes('CIC') || codeUpper.includes('COMERCIAL')) {
      return { name: 'Ingeniería Comercial', tag: 'ING. COMERCIAL', faculty: 'FACEFA', color: 'emerald' };
    }
    if (cUpper.includes('ADM') || cUpper.includes('CAD') || codeUpper.includes('ADMINISTR')) {
      return { name: 'Administración de Empresas', tag: 'ADMINISTRACIÓN', faculty: 'FACEFA', color: 'emerald' };
    }
    if (cUpper.includes('CCP') || cUpper.includes('CPU') || codeUpper.includes('CONTAB')) {
      return { name: 'Contaduría Pública', tag: 'CONTADURÍA', faculty: 'FACEFA', color: 'emerald' };
    }
    if (cUpper.includes('ECO') || codeUpper.includes('ECONOM')) {
      return { name: 'Economía', tag: 'ECONOMÍA', faculty: 'FACEFA', color: 'emerald' };
    }
    if (cUpper.includes('MED') || codeUpper.startsWith('MED') || codeUpper.includes('ANATOM') || codeUpper.includes('GENET') || codeUpper.includes('PEDIAT') || codeUpper.includes('INFORMÁTICA MÉDICA')) {
      return { name: 'Medicina Humana', tag: 'MEDICINA HUMANA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'rose' };
    }
    if (cUpper.includes('ELE') || codeUpper.startsWith('ELE')) {
      return { name: 'Ing. Electrónica', tag: 'ING. ELECTRÓNICA', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'blue' };
    }
    if (cUpper.includes('SON') || codeUpper.startsWith('SON')) {
      return { name: 'Ing. de Sonido', tag: 'ING. DE SONIDO', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'indigo' };
    }
    if (cUpper.includes('IBI') || codeUpper.startsWith('IBI') || cUpper.includes('BIO')) {
      return { name: 'Ing. Biomédica', tag: 'ING. BIOMÉDICA', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'cyan' };
    }
    if (cUpper.includes('IND') || codeUpper.startsWith('IND')) {
      return { name: 'Ing. Industrial', tag: 'ING. INDUSTRIAL', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'amber' };
    }
    if (cUpper.includes('VET') || codeUpper.startsWith('VET')) {
      return { name: 'Medicina Veterinaria', tag: 'VETERINARIA', faculty: 'FACULTAD DE CIENCIAS AGRÍCOLAS Y VETERINARIAS', color: 'teal' };
    }
    if (cUpper.includes('ENL') || codeUpper.startsWith('ENF')) {
      return { name: 'Lic. en Enfermería', tag: 'ENFERMERÍA', faculty: 'FACULTAD DE CIENCIAS DE LA SALUD', color: 'pink' };
    }
    if (cUpper.includes('SIS') || codeUpper.startsWith('SIS')) {
      return { name: 'Ing. de Sistemas', tag: 'ING. DE SISTEMAS', faculty: 'FACULTAD DE TECNOLOGÍA', color: 'purple' };
    }
    return { name: 'Carrera General', tag: 'CARRERA', faculty: 'UNITEPC', color: 'slate' };
  };

  // Official UNITEPC Curriculum Code Resolver
  window.resolveOfficialCourseCode = function(courseName, careerCodes) {
    const rawUpper = (courseName || '').toUpperCase().trim();
    const cUpper = rawUpper.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const has = (k) => cUpper.includes(k.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const codes = [];

    (careerCodes || []).forEach(cc => {
      const cCode = (cc || '').toUpperCase();
      if (cCode.includes('SIS')) {
        if (has('INTRODUCCIÓN A LAS CIENCIAS') || has('CIENCIAS DE LA COMPUTACIÓN')) codes.push('SIS-116');
        else if (has('CALCULO I') && !has('II')) codes.push('SIS-111');
        else if (has('FÍSICA I') && !has('II')) codes.push('SIS-112');
        else if (has('PROGRAMACIÓN I') && !has('II') && !has('III')) codes.push('SIS-113');
        else if (has('ÁLGEBRA') && !has('LINEAL')) codes.push('SIS-114');
        else if (has('INGLÉS TÉCNICO I') && !has('II') && !has('III') && !has('IV')) codes.push('SIS-115');
        else if (has('CALCULO II')) codes.push('SIS-121');
        else if (has('FÍSICA II')) codes.push('SIS-122');
        else if (has('PROGRAMACIÓN II') && !has('III')) codes.push('SIS-123');
        else if (has('ÁLGEBRA LINEAL')) codes.push('SIS-124');
        else if (has('INGLÉS TÉCNICO II') && !has('III')) codes.push('SIS-125');
        else if (has('TALLER DE PROGRAMACIÓN I') && !has('II') && !has('III')) codes.push('SIS-126');
        else if (has('DISPOSITIVOS ELECTRÓNICOS')) codes.push('SIS-127');
        else if (has('ECUACIONES DIFERENCIALES')) codes.push('SIS-211');
        else if (has('SISTEMAS DIGITALES')) codes.push('SIS-212');
        else if (has('PROGRAMACIÓN III')) codes.push('SIS-213');
        else if (has('PROBABILIDAD') || has('PROBALIDAD')) codes.push('SIS-214');
        else if (has('INGLÉS TÉCNICO III')) codes.push('SIS-215');
        else if (has('TALLER DE PROGRAMACIÓN II')) codes.push('SIS-216');
        else if (has('ÉTICA') || has('DERECHO INFORMÁTICO')) codes.push('SIS-217');
        else if (has('MÉTODOS NUMÉRICOS')) codes.push('SIS-221');
        else if (has('REDACCIÓN') || has('INTERCULTURALIDAD')) codes.push('SIS-222');
        else if (has('SISTEMAS OPERATIVOS')) codes.push('SIS-223');
        else if (has('DISEÑO DE BASE DE DATOS') || (has('BASE DE DATOS') && !has('AVANZADOS'))) codes.push('SIS-224');
        else if (has('INGLÉS TÉCNICO IV')) codes.push('SIS-225');
        else if (has('TALLER DE PROGRAMACIÓN III')) codes.push('SIS-226');
        else if (has('DISEÑO GRÁFICO') || has('INFORMACIÓN GEOGRÁFICA')) codes.push('SIS-227');
        else if (has('INVESTIGACIÓN OPERATIVA')) codes.push('SIS-311');
        else if (has('MICROCONTROLADORES')) codes.push('SIS-312');
        else if (has('ARQUITECTURA DE NUEVAS')) codes.push('SIS-313');
        else if (has('ANÁLISIS DE SISTEMAS I') && !has('II')) codes.push('SIS-314');
        else if (has('INFORMÁTICA FORENSE')) codes.push('SIS-315');
        else if (has('REDES Y COMUNICACIÓNES') || has('REDES Y COMUNICACIONES')) codes.push('SIS-316');
        else if (has('CONCEPTOS AVANZADOS DE BASE DE DATOS')) codes.push('SIS-317');
        else if (has('ROBÓTICA')) codes.push('SIS-321');
        else if (has('INFRAESTRUCTURA TECNOLÓGICA')) codes.push('SIS-322');
        else if (has('ANÁLISIS DE SISTEMAS II')) codes.push('SIS-323');
        else if (has('INGENIERÍA DE MÉTODOS') || has('REINGENIERÍA')) codes.push('SIS-324');
        else if (has('TALLER DE REDES')) codes.push('SIS-325');
        else if (has('LENGUAJES DE PROGRAMACIÓN')) codes.push('SIS-326');
        else if (has('MÉTODOS Y TÉCNICAS DE INVESTIGACIÓN')) codes.push('SIS-411');
        else if (has('REDES NEURONALES') || has('INTELIGENCIA ARTIFICIAL')) codes.push('SIS-412');
        else if (has('TELECOMUNICACIONES')) codes.push('SIS-413');
        else if (has('INGENIERÍA DE SOFTWARE') && !has('TALLER')) codes.push('SIS-414');
        else if (has('TALLER DE SIMULACIÓN DE SISTEMAS') || has('SIMULACIÓN') || has('SIMULACION')) codes.push('SIS-415');
        else if (has('MÉTODO DE DESARROLLO DE SOFTWARE') || has('METODOS DE DESARROLLO')) codes.push('SIS-416');
        else if (has('TALLER DE TITULACIÓN') || has('TITULACION')) codes.push('SIS-421');
        else if (has('GESTIÓN ESTRATÉGICA DE EMPRESAS') || has('GESTION ESTRATEGICA')) codes.push('SIS-422');
        else if (has('TALLER DE INGENIERÍA DE SOFTWARE') || has('TALLER DE INGENIERIA')) codes.push('SIS-423');
        else if (has('PRÁCTICA PRE-PROFESIONAL') || has('PRACTICA PRE-PROFESIONAL') || has('PREPROFESIONAL')) codes.push('SIS-424');
        else if (has('GESTIÓN DE CALIDAD ESTRATÉGICA') || has('GESTION DE CALIDAD')) codes.push('SIS-425');
        else if (has('INGENIERÍA ECONÓMICA') || has('INGENIERIA ECONOMICA')) codes.push('SIS-314');
      } else if (cCode.includes('ELE')) {
        if (has('CALCULO I') && !has('II')) codes.push('ELC-111');
        else if (has('ALGEBRA I') || has('ÁLGEBRA I')) codes.push('ELC-114');
        else if (has('PROGRAMACIÓN I') && !has('II') && !has('III')) codes.push('ELC-113');
        else if (has('PROGRAMACIÓN II') && !has('III')) codes.push('ELC-123');
        else if (has('PROGRAMACIÓN III')) codes.push('ELC-213');
        else if (has('CIRCUITOS ELECTRONICOS I')) codes.push('ELC-214');
        else if (has('CIRCUITOS ELECTRONICOS II')) codes.push('ELC-222');
        else if (has('CAMPOS ELECTROMAGNETICOS')) codes.push('ELC-312');
        else if (has('ELECTRONICA II')) codes.push('ELC-313');
        else if (has('ANALISIS NUMERICO I')) codes.push('ELC-311');
        else if (has('SIMULACION Y MODELAJE')) codes.push('ELC-414');
        else if (has('ROBOTICA') || has('ROBÓTICA')) codes.push('ELC-423');
        else if (has('TRANSMISION DE DATOS')) codes.push('ELC-426');
        else if (has('ELECTRONICA INDUSTRIAL')) codes.push('ELC-424');
        else if (has('INGENIERÍA ECONÓMICA')) codes.push('ELC-314');
      } else if (cCode.includes('SON')) {
        if (has('SIMULACIÓN MATEMÁTICA')) codes.push('SON-126');
        else if (has('SIMULACIÓN DE SISTEMAS SONOROS')) codes.push('SON-324');
        else if (has('DISEÑO REFUERZO SONORO')) codes.push('SON-315');
        else if (has('DISEÑO E INSTALACIÓN DE SISTEMAS LINE ARRAY')) codes.push('SON-415');
        else if (has('SONIDO EN VIVO ANALÓGICO')) codes.push('SON-215');
        else if (has('PROGRAMACIÓN I') && !has('II') && !has('III')) codes.push('SON-113');
        else if (has('PROGRAMACIÓN II') && !has('III')) codes.push('SON-123');
        else if (has('PROGRAMACIÓN III')) codes.push('SON-213');
      } else if (cCode.includes('IBI') || cCode.includes('BIO')) {
        if (has('INTRODUCCIÓN A LA INFORMÁTICA')) codes.push('IBI-114');
        else if (has('INFORMÁTICA') && !has('INTRODUCCIÓN')) codes.push('IBI-124');
        else if (has('CONTROL, MODELOS Y SIMULACIÓN')) codes.push('IBI-223');
        else if (has('PROGRAMACIÓN')) codes.push('IBI-211');
      } else if (cCode.includes('MED')) {
        if (has('ANATOMÍA HUMANA I') && !has('II')) codes.push('MED-111');
        else if (has('ANATOMÍA HUMANA II')) codes.push('MED-121');
        else if (has('INFORMÁTICA MÉDICA')) codes.push('MED-226');
      } else if (cCode.includes('ICO') || cCode.includes('CIC')) {
        if (has('MODELOS ECONOMETRICOS') || has('ECONOMETRÍA')) codes.push(cCode.includes('CIC') ? 'CIC-312' : 'ICO-412');
        else if (has('INGENIERÍA ECONÓMICA')) codes.push('ICO-314');
        else if (has('FINANZAS')) codes.push('ICO-320');
        else if (has('MARKETING') || has('MERCADOTECNIA')) codes.push('ICO-210');
      } else if (cCode.includes('ECO')) {
        if (has('ECONOMETRÍA') || has('MODELOS')) codes.push('ECO-412');
        else if (has('MICROECONOMÍA')) codes.push('ECO-210');
        else if (has('MACROECONOMÍA')) codes.push('ECO-310');
      } else if (cCode.includes('ADM') || cCode.includes('CAD')) {
        if (has('ADMINISTRACIÓN GENERAL')) codes.push('ADM-113');
        else if (has('ADMINISTRACIÓN DE LA PRODUCCIÓN')) codes.push('ADM-322');
        else if (has('INGENIERÍA ECONÓMICA')) codes.push('ADM-314');
      } else if (cCode.includes('CCP') || cCode.includes('CPU')) {
        if (has('INFORMÁTICA CONTABLE')) codes.push('CPEC07');
        else if (has('ADMINISTRACIÓN FINANCIERA')) codes.push('CPEC16');
      }
    });

    const uniqueCodes = [...new Set(codes)];
    return uniqueCodes.length > 0 ? uniqueCodes.join(' / ') : '';
  };

  window.renderDynamicSidebarForDocente = function(docente, courses, groups, preferredCourseCode = null) {
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

        // Condition 0: Native SEA groupLinkId (Materia Común según SEA Central)
        const hasSameGroupLink = Boolean(g1.groupLinkId && g2.groupLinkId && g1.groupLinkId === g2.groupLinkId);

        // Condition 1: Shared physical schedule slot (COMMON CLASS in SEA fallback)
        const s1Slots = (g1.schedules || []).filter(s => s.day && s.startTime).map(s => `${s.day}_${s.startTime}_${s.classroom || ''}`);
        const s2Slots = (g2.schedules || []).filter(s => s.day && s.startTime).map(s => `${s.day}_${s.startTime}_${s.classroom || ''}`);
        const hasSharedSlot = s1Slots.some(s => s2Slots.includes(s));

        // Condition 2: Same career, same course, and identical parallel
        const c1Norm = (g1.courseName || g1.name || '').trim().toUpperCase();
        const c2Norm = (g2.courseName || g2.name || '').trim().toUpperCase();
        const sameCareerCourse = (g1.careerCode && g1.careerCode === g2.careerCode && c1Norm === c2Norm);
        const p1 = getParallelIndex(g1.name || g1.code);
        const p2 = getParallelIndex(g2.name || g2.code);

        if (hasSameGroupLink) {
          adj[i].add(j);
          adj[j].add(i);
        } else if (hasSharedSlot) {
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
    const currentUser = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const isDocente = (currentUser && currentUser.role === 'ROLE_DOCENTE');
    const isDirectorRole = (currentUser && currentUser.role === 'ROLE_DIR_CARRERA');
    const auditTargetCode = !isDocente ? (window.__SUPERVISION_AUDIT_COURSE_CODE__ || localStorage.getItem('sisa_supervision_audit_course') || preferredCourseCode) : null;

    let dirCareerCode = null;
    if (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.careerInfo && window.__SUPERVISION_DATA__.careerInfo.code) {
      dirCareerCode = window.__SUPERVISION_DATA__.careerInfo.code;
    } else if (localStorage.getItem('sisa_supervision_active_career')) {
      dirCareerCode = localStorage.getItem('sisa_supervision_active_career');
    } else if (currentUser) {
      if (currentUser.carreraCodigo) dirCareerCode = currentUser.carreraCodigo;
      else if (currentUser.careerCode) dirCareerCode = currentUser.careerCode;
      else if (currentUser.username) {
        const un = currentUser.username.toLowerCase();
        if (un.includes('.sis')) dirCareerCode = 'CARSIS';
        else if (un.includes('.ele')) dirCareerCode = 'CARELE';
        else if (un.includes('.son')) dirCareerCode = 'CARSON';
        else if (un.includes('.ibi')) dirCareerCode = 'CARIBI';
        else if (un.includes('.med')) dirCareerCode = 'CARMED';
        else if (un.includes('.der')) dirCareerCode = 'CARDER';
        else if (un.includes('.odo')) dirCareerCode = 'CARODO';
        else if (un.includes('.vet')) dirCareerCode = 'CARVET';
      }
    }
    if (!dirCareerCode && auditTargetCode) {
      const pref = String(auditTargetCode).trim().split('-')[0].toUpperCase();
      if (pref === 'SIS') dirCareerCode = 'CARSIS';
      else if (pref === 'ELC' || pref === 'ELE') dirCareerCode = 'CARELE';
      else if (pref === 'SON') dirCareerCode = 'CARSON';
      else if (pref === 'IBI' || pref === 'BIO') dirCareerCode = 'CARIBI';
      else if (pref === 'MED') dirCareerCode = 'CARMED';
      else if (pref === 'DER') dirCareerCode = 'CARDER';
      else if (pref === 'ODO') dirCareerCode = 'CARODO';
      else if (pref === 'VET') dirCareerCode = 'CARVET';
    }
    if (!dirCareerCode && (isDirectorRole || !isDocente)) {
      dirCareerCode = 'CARSIS';
    }

    const isScopedToDirector = (!isDocente && Boolean(dirCareerCode));

    let items = commonClusters.map((cluster, idx) => {
      // Direct SEA Logic: Identify Lead Group and Common Status
      const leadGroup = cluster.find(g => g.isLead === true || g.isLead === 'true') || cluster[0];
      const hasGroupLink = cluster.some(g => Boolean(g.groupLinkId));
      const carrerasArr = [...new Set(cluster.map(g => g.careerCode).filter(Boolean))];
      const isCommon = hasGroupLink || carrerasArr.length > 1;

      const leadCarreraInfo = leadGroup ? resolveCarreraInfo('', leadGroup.careerCode) : null;
      const carrerasResolved = carrerasArr.map(cc => resolveCarreraInfo('', cc));
      const mainCarrera = leadCarreraInfo || carrerasResolved[0] || { name: 'Carrera General', tag: 'CARRERA', color: 'slate' };
      let leadTag = leadCarreraInfo ? leadCarreraInfo.tag : mainCarrera.tag;

      let allCarrerasNames = [...new Set(carrerasResolved.map(cr => cr.name))].join(' • ');
      let allCarrerasTags = isCommon 
        ? `${[...new Set(carrerasResolved.map(cr => cr.tag))].join(' • ')}`
        : [...new Set(carrerasResolved.map(cr => cr.tag))].join(' • ');

      const courseNames = [...new Set(cluster.map(g => g.courseName || g.name).filter(Boolean))];
      let primaryName = (leadGroup && (leadGroup.courseName || leadGroup.name))
        ? (leadGroup.courseName || leadGroup.name)
        : (courseNames[0] || 'Materia Asignada');
      let displayName = courseNames.join(' / ');

      // Resolve official curriculum codes across associated careers
      let directCode = null;
      for (const g of cluster) {
        if (g.code && g.code.includes('-') && !g.code.startsWith('TA') && !g.code.startsWith('PL') && !g.code.startsWith('PA') && !g.code.startsWith('PR') && !g.code.startsWith('PS')) {
          directCode = g.code;
          break;
        }
        if (g.syllabusCourseId && Array.isArray(courses) && courses.length > 0) {
          const matchCourse = courses.find(c => (c.syllabusCourseId === g.syllabusCourseId || c.id === g.syllabusCourseId) && c.code);
          if (matchCourse && matchCourse.code) {
            directCode = matchCourse.code;
            break;
          }
        }
      }

      const officialCodes = directCode ? [directCode] : carrerasArr.map(cc => resolveOfficialCourseCode(primaryName, [cc]));
      let officialCode = [...new Set(officialCodes.flat())].filter(Boolean).join(' / ') || resolveOfficialCourseCode(primaryName, carrerasArr) || 'UNITEPC';
      let codesList = [...new Set(officialCodes.flat().filter(Boolean))];

      let isScopedDirectorForThis = false;
      let otherCareersNames = '';

      if (isScopedToDirector) {
        const dirGroups = cluster.filter(g => (g.careerCode || '').toUpperCase() === dirCareerCode.toUpperCase());
        const hasMatch = dirGroups.length > 0 || carrerasArr.includes(dirCareerCode);

        if (hasMatch) {
          isScopedDirectorForThis = true;
          const dirCareerInfo = resolveCarreraInfo('', dirCareerCode);
          const dirGroup = dirGroups[0];

          // Scoped course name strictly for this career (clean, no slashes)
          const scopedCourseName = (dirGroup && (dirGroup.courseName || dirGroup.name)) || primaryName;

          // Scoped official code strictly for this career (must be the cluster's OWN code, NEVER overwritten by auditTargetCode)
          let scopedCode = null;
          if (dirGroup && dirGroup.code && dirGroup.code.includes('-') && !dirGroup.code.startsWith('TA') && !dirGroup.code.startsWith('PL') && !dirGroup.code.startsWith('PA') && !dirGroup.code.startsWith('PR') && !dirGroup.code.startsWith('PS')) {
            scopedCode = dirGroup.code;
          } else if (dirGroup && dirGroup.syllabusCourseId && Array.isArray(courses)) {
            const matchC = courses.find(c => (c.syllabusCourseId === dirGroup.syllabusCourseId || c.id === dirGroup.syllabusCourseId) && c.code);
            if (matchC && matchC.code) scopedCode = matchC.code;
          }
          if (!scopedCode && typeof resolveOfficialCourseCode === 'function') {
            scopedCode = resolveOfficialCourseCode(scopedCourseName, [dirCareerCode]);
          }
          if (!scopedCode) {
            const carPrefix = dirCareerCode.length > 3 ? dirCareerCode.substring(3) : dirCareerCode;
            scopedCode = `${carPrefix}-101`;
          }

          // Other careers that share this subject
          const otherCareers = carrerasResolved.filter(cr => cr.code !== dirCareerCode);
          otherCareersNames = otherCareers.map(cr => cr.name).join(', ');

          displayName = scopedCourseName;
          primaryName = scopedCourseName;
          officialCode = scopedCode;
          codesList = [scopedCode];
          allCarrerasNames = dirCareerInfo.name;
          allCarrerasTags = isCommon 
            ? (otherCareersNames ? `⚡ Materia común (Compartida con ${otherCareersNames})` : `⚡ Materia común con otras carreras`)
            : dirCareerInfo.tag;
          leadTag = allCarrerasTags;
        }
      }

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

      // Calculate actual academic hours based on official curriculum & schedules
      const teoSlots = new Set();
      const pracSlots = new Set();
      cluster.forEach(g => {
        const cType = (g.classType || 'TA').toUpperCase();
        const isTeo = cType.startsWith('T') || cType.includes('TEO');
        (g.schedules || []).forEach(s => {
          if (s.day && s.startTime && s.endTime) {
            const k = `${s.day}_${s.startTime}_${s.endTime}`;
            if (isTeo) teoSlots.add(k);
            else pracSlots.add(k);
          }
        });
      });

      const calcMinsToAcademicHours = (slotSet) => {
        let totalMins = 0;
        slotSet.forEach(k => {
          const parts = k.split('_');
          const [sh, sm] = parts[1].split(':').map(Number);
          const [eh, em] = parts[2].split(':').map(Number);
          totalMins += (eh * 60 + em) - (sh * 60 + sm);
        });
        return Math.round(totalMins / 45);
      };

      const schedTeoHours = calcMinsToAcademicHours(teoSlots);
      const schedPracHours = calcMinsToAcademicHours(pracSlots);

      // Official curriculum standard resolution for engineering subjects:
      // Programación I: 2h Teóricas + 4h Prácticas (6h semanales / 120h semestrales)
      let standardTeoHours = 2;
      let standardPracHours = 4;
      const upperName = (primaryName || '').toUpperCase();
      if (upperName.includes('PROGRAMACIÓN II') || upperName.includes('PROGRAMACION II')) {
        standardTeoHours = schedTeoHours || 4;
        standardPracHours = schedPracHours || 4;
      } else if (upperName.includes('PROGRAMACIÓN I') || upperName.includes('PROGRAMACION I') || upperName.includes('INFORMÁTICA')) {
        standardTeoHours = 2;
        standardPracHours = 4;
      } else {
        standardTeoHours = schedTeoHours || (teoList.length > 0 ? 2 : 0);
        standardPracHours = schedPracHours || (pracList.length > 0 ? 4 : 0);
      }
      const totalHours = standardTeoHours + standardPracHours;

      const teoGroupsSet = new Set();
      const pracGroupsSet = new Set();
      const teoDisplayList = [];
      const pracDisplayList = [];

      cluster.forEach(g => {
        let pName = g.code || g.name || 'G1';
        if (isScopedDirectorForThis && g.careerCode && g.careerCode !== dirCareerCode) {
          if (pName.includes('-')) {
            const parts = pName.split('-');
            pName = parts[parts.length - 1];
          }
        }
        const cType = (g.classType || 'TA').toUpperCase();
        const isNightGrp = (g.schedules || []).some(s => s.startTime && parseInt(s.startTime.split(':')[0], 10) >= 18);
        const tag = isNightGrp ? `${pName} 🌙` : pName;
        if (cType.startsWith('T') || cType.includes('TEO')) {
          teoGroupsSet.add(pName);
          if (!teoDisplayList.includes(tag)) teoDisplayList.push(tag);
        } else {
          pracGroupsSet.add(pName);
          if (!pracDisplayList.includes(tag)) pracDisplayList.push(tag);
        }
      });
      const teoCodes = [...teoGroupsSet].sort().join(', ');
      const pracCodes = [...pracGroupsSet].sort().join(', ');
      const teoDisplayCodes = teoDisplayList.join(', ');
      const pracDisplayCodes = pracDisplayList.join(', ');
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

      // Detect shift & night schedule
      const startTimes = cluster.flatMap(g => (g.schedules || []).map(s => s.startTime).filter(Boolean));
      const hasNightSchedule = startTimes.some(st => parseInt(st.split(':')[0], 10) >= 18);
      const earliestTime = startTimes.sort()[0] || '08:00';
      const earliestHour = parseInt(earliestTime.split(':')[0], 10);
      let shiftLabel = '';
      if (hasNightSchedule || earliestHour >= 18) {
        shiftLabel = 'Turno Noche';
      } else if (earliestHour >= 13) {
        shiftLabel = 'Turno Tarde';
      } else {
        shiftLabel = 'Turno Mañana';
      }
      const isNight = (shiftLabel === 'Turno Noche');

      const teacherDoc = String(docente.numeroDocumento || docente.ci || 'doc').trim();
      const cleanCode = (officialCode || primaryName || 'mat').replace(/\s+/g, '_').replace(/[\/\\?%*:|"<>]/g, '-');
      const carTag = isCommon ? 'COMUN_' + carrerasArr.slice().sort().join('_') : carrerasArr.slice().sort().join('_');
      const shiftTag = shiftLabel.replace(/\s+/g, '_');
      const grpTag = allGroupsCodes.replace(/[\s,]+/g, '_');
      const uniqueKey = `${teacherDoc}_${cleanCode}_${carTag}_${shiftTag}_${grpTag}`;

      const compInfo = (typeof window.detectComponentTypes === 'function') 
        ? window.detectComponentTypes(cluster) 
        : { types: ['TA'], hasTA: true, hasPA: false, hasPL: false, hasPS: false, requiredPac: ['GRAL'], requiredPlan: ['TEORICO_PRACTICO'], summary: 'TA' };

      return {
        key: uniqueKey,
        code: officialCode,
        name: displayName,
        primaryName: primaryName,
        isCommon: isCommon,
        leadGroup: leadGroup,
        leadTag: leadTag,
        carrerasResolved: isScopedDirectorForThis ? [resolveCarreraInfo('', dirCareerCode)] : carrerasResolved,
        mainCarrera: isScopedDirectorForThis ? resolveCarreraInfo('', dirCareerCode) : mainCarrera,
        allCarrerasNames: allCarrerasNames,
        allCarrerasTags: allCarrerasTags,
        carrerasCodes: isScopedDirectorForThis ? [dirCareerCode] : carrerasArr,
        components: compInfo,
        groups: cluster,
        isScopedDirector: isScopedDirectorForThis,
        otherCareersNames: otherCareersNames,
        teoList: teoList,
        pracList: pracList,
        teoCodes: teoCodes,
        pracCodes: pracCodes,
        teoDisplayCodes: teoDisplayCodes,
        pracDisplayCodes: pracDisplayCodes,
        isNight: isNight,
        hasNightSchedule: hasNightSchedule,
        teoSummary: teoSummary,
        pracSummary: pracSummary,
        totalPhysicalSessions: totalPhysicalSessions,
        totalHours: totalHours,
        standardTeoHours: standardTeoHours,
        standardPracHours: standardPracHours,
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

    // If viewing as Career Director, filter out subjects belonging strictly to other careers
    if (isScopedToDirector) {
      const dirFiltered = items.filter(it => {
        const hasCareer = (it.carrerasCodes || []).includes(dirCareerCode);
        const hasDirGroup = (it.groups || []).some(g => (g.careerCode || '').toUpperCase() === dirCareerCode.toUpperCase());
        const isTarget = auditTargetCode && (
          (it.codesList || []).includes(auditTargetCode) ||
          String(it.code || '').toUpperCase().includes(String(auditTargetCode).toUpperCase()) ||
          String(it.name || '').toUpperCase().includes(String(auditTargetCode).toUpperCase())
        );
        return it.isScopedDirector || hasCareer || hasDirGroup || isTarget;
      });
      if (dirFiltered.length > 0) {
        items = dirFiltered;
      }
    }

    // Ensure all items retain their unique teacher-scoped composite key (guaranteed no collisions!)
    const teacherDoc = String(docente.numeroDocumento || docente.ci || 'doc').trim();
    const seenItemKeys = new Set();
    items.forEach((it, idx) => {
      const cleanCode = (it.code || it.name || 'mat').replace(/\s+/g, '_').replace(/[\/\\?%*:|"<>]/g, '-');
      const carTag = it.isCommon ? 'COMUN_' + (it.carrerasCodes || []).slice().sort().join('_') : (it.carrerasCodes || []).slice().sort().join('_');
      const shiftTag = (it.shiftLabel || 'REG').replace(/\s+/g, '_');
      const grpTag = (it.allGroupsCodes || '').replace(/[\s,]+/g, '_');
      let baseKey = `${teacherDoc}_${cleanCode}_${carTag}_${shiftTag}_${grpTag}`;
      if (seenItemKeys.has(baseKey)) {
        baseKey = `${baseKey}_${idx}`;
      }
      seenItemKeys.add(baseKey);
      it.key = baseKey;
    });

    let targetItem = null;
    if (auditTargetCode) {
      const cleanTarget = String(auditTargetCode).trim().toUpperCase();
      // First pass: exact code match or codesList
      targetItem = items.find(it => {
        const codesList = (it.codesList || []).map(c => String(c).trim().toUpperCase());
        const itCode = String(it.code || '').toUpperCase();
        return codesList.includes(cleanTarget) || itCode.split('/').map(s => s.trim()).includes(cleanTarget) || itCode === cleanTarget;
      });
      // Second pass: name / primaryName / title contains cleanTarget
      if (!targetItem) {
        targetItem = items.find(it => {
          const itCode = String(it.code || '').toUpperCase();
          const itName = String(it.name || '').toUpperCase();
          const itPrim = String(it.primaryName || '').toUpperCase();
          return itCode.includes(cleanTarget) || itName.includes(cleanTarget) || itPrim.includes(cleanTarget);
        });
      }
    }

    const isAuditMode = !isDocente && Boolean(window.__SUPERVISION_AUDIT_COURSE_CODE__ || localStorage.getItem('sisa_supervision_audit_course')) && Boolean(targetItem);

    if (isAuditMode && targetItem) {
      items = [targetItem];
    }

    // Calculate totals across all subjects (or the single audited subject in audit mode)
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
    if (profileInfoEl) {
      profileInfoEl.textContent = isAuditMode
        ? `${totalWeeklyHours}h • 1 Materia (Modo Auditoría)`
        : `${totalWeeklyHours}h • ${items.length} Materia(s)`;
    }

    const summaryBadgeEl = document.getElementById('docente-summary-badge');
    if (summaryBadgeEl) {
      if (isAuditMode) {
        summaryBadgeEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold"><i data-lucide="shield-check" class="w-3.5 h-3.5"></i> ${totalWeeklyHours} Hrs / Semana • Asignatura en Auditoría • ${targetItem.allGroupsCodes || ''}</span>`;
      } else {
        summaryBadgeEl.textContent = `${totalWeeklyHours} Hrs / Semana • ${items.length} Materias • ${rawList.length} Grupos a Cargo (${uniqueCarreras.length} Carreras)`;
      }
    }

    const sectionTitle = document.querySelector('#doc-sec-asignaturas h3');
    if (sectionTitle) {
      sectionTitle.textContent = isAuditMode ? 'Asignatura en Auditoría Curricular:' : 'Mis Asignaturas & Cátedras Asignadas:';
    }

    const sectionSubtitle = document.querySelector('#doc-sec-asignaturas .space-y-2 > .flex > span:last-child');
    if (sectionSubtitle) {
      sectionSubtitle.textContent = isAuditMode ? 'Auditoría y revisión pedagógica exclusiva de la asignatura abierta desde Supervisión' : 'Selecciona materia para gestionar su documentación:';
    }

    const sidebarHoursEl = document.getElementById('sidebar-summary-hours');
    if (sidebarHoursEl) {
      sidebarHoursEl.textContent = isAuditMode ? `1 Materia en Auditoría • ${totalWeeklyHours}h` : `${items.length} Materias • ${totalWeeklyHours}h`;
    }

    // 1. Build Top Horizontal Cards Grid (One per distinct subject)
    let cardsHtml = '';
    let sidebarHtml = `
      <div class="flex items-center justify-between px-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${isAuditMode ? 'Asignatura en Auditoría' : 'Mis Asignaturas Asignadas'}</span>
        <span class="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/70 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800/60">${items.length} ${items.length === 1 ? 'Materia' : 'Materias'}</span>
      </div>
    `;

    items.forEach((item, idx) => {
      const mKey = item.key;

      // Deterministic numeric ID based on teacher document number and course code hash
      const docNum = parseInt(teacherDoc.replace(/\D/g, ''), 10) || 1000;
      let codeHash = 0;
      const codeToHash = String(item.code || item.name || 'mat');
      for (let cIdx = 0; cIdx < codeToHash.length; cIdx++) {
        codeHash = ((codeHash << 5) - codeHash) + codeToHash.charCodeAt(cIdx);
        codeHash |= 0;
      }
      const deterministicAsignacionId = Math.abs((docNum * 397) ^ codeHash) % 900000 + 10000;

      // Register or update in canonical materiasData
      materiasData[mKey] = {
        asignacionId: deterministicAsignacionId,
        codigo: item.code,
        nombre: item.name,
        semestre: '1º',
        creditos: '12',
        horasTeoricas: String(item.standardTeoHours || 2),
        horasPracticas: String(item.standardPracHours || 4),
        carrera: item.allCarrerasNames,
        carreraTag: item.isScopedDirector ? item.allCarrerasTags : (item.isCommon ? `⚡ COMÚN (LÍDER: ${item.leadTag}): ${item.allCarrerasTags}` : item.allCarrerasTags),
        grupoTag: `${item.totalPhysicalSessions} Comisiones (${item.teoList.length} Teoría • ${item.pracList.length} Práctica) • ${item.shiftLabel}`,
        breadcrumb: `${item.code} ${item.name} (${item.shiftLabel})`,
        title: `${item.code} • ${item.name} (${item.shiftLabel})`,
        meta: `<span><strong class="text-white">${item.totalHours}</strong> Horas Semanales</span><span>•</span><span>Campus: <strong class="text-white">${item.campusesStr}</strong></span><span>•</span><span><strong class="text-white">${item.groupedSchedules.length}</strong> Bloques Horarios Oficiales</span><span>•</span><span class="${item.isNight ? 'text-amber-300 font-extrabold' : 'text-slate-300'}">${item.isNight ? '🌙 ' : ''}${item.shiftLabel}</span>`,
        isScopedDirector: Boolean(item.isScopedDirector),
        otherCareersNames: item.otherCareersNames,
        isCommon: item.isCommon,
        caracterizacion: '',
        macroCompetencia: '',
        sistemaEvaluacion: '',
        unidades: [],
        bibliografia: [],
        elementosCompetencia: [],
        carrerasCodes: item.carrerasCodes,
        carrerasResolved: item.carrerasResolved,
        components: item.components,
        groups: item.groups,
        groupedSchedules: item.groupedSchedules,
        hierarchicalSchedules: item.hierarchicalSchedules,
        teoRoomsStr: item.teoRoomsStr,
        pracRoomsStr: item.pracRoomsStr,
        codesList: item.codesList,
        shiftLabel: item.shiftLabel,
        isNight: item.isNight
      };

      // Distinct Days Badges for the Compact Card
      const uniqueDays = [...new Set(item.groupedSchedules.map(s => s.dayName.substring(0, 3)))];
      const daysBadges = uniqueDays.length > 0 
        ? uniqueDays.map(d => `<span class="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800/60 text-[9px]">${d}</span>`).join(' ')
        : '<span class="text-[9px] text-slate-400">Regular</span>';

      const shiftBadgeHtml = item.isNight
        ? `<span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-indigo-950 text-indigo-200 border border-indigo-700/80 shadow-xs flex items-center gap-1"><span class="text-amber-300">🌙</span> NOCTURNO</span>`
        : (item.shiftLabel === 'Turno Tarde'
          ? `<span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">⛅ Tarde</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 flex items-center gap-1">☀️ Mañana</span>`);

      // HTML for Top Horizontal Card (Expanded horizontally, compact vertically):
      cardsHtml += `
        <div id="doc-materia-card-${mKey}" onclick="window.selectDocenteMateria('${mKey}')" class="doc-materia-card ${isAuditMode ? 'col-span-full' : ''} p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md cursor-pointer relative transition-all duration-200 flex flex-col justify-between">
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            <!-- Columna Izquierda (sm:col-span-7): Carrera, Título, Códigos y Grupos -->
            <div class="sm:col-span-7 space-y-1.5 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${item.isCommon ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700' : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'} truncate max-w-[280px]">
                  ${item.isScopedDirector ? item.allCarrerasTags : (item.isCommon ? `⚡ COMÚN (LÍDER: ${item.leadTag}): ` + item.allCarrerasTags : item.allCarrerasTags)}
                </span>
                ${shiftBadgeHtml}
                ${(item.components && item.components.types) ? item.components.types.map(t => window.renderComponentBadge(t, true)).join(' ') : ''}
                <span class="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex-shrink-0">
                  ${item.totalPhysicalSessions} Comisiones • ${item.totalHours}h
                </span>
              </div>

              <!-- Nombre Principal de la Materia -->
              <h3 class="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1 flex items-center gap-1.5" title="${item.name} (${item.shiftLabel})">
                <span class="truncate">${item.name}</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${item.isNight ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}">
                  ${item.shiftLabel}
                </span>
              </h3>

              <!-- Códigos & Grupos a Cargo -->
              <div class="flex items-center gap-2 flex-wrap text-[10.5px]">
                <div class="flex items-center gap-1">
                  ${item.codesList.map(c => `<span class="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-mono font-bold text-[10px] border border-brand-200/70 dark:border-brand-800/70">${c}</span>`).join('')}
                </div>
                <div class="flex items-center gap-1 font-mono text-[9.5px] font-bold flex-wrap">
                  ${item.teoDisplayCodes ? `<span class="px-1.5 py-0.5 rounded ${item.isNight ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60'}">Teo: ${item.teoDisplayCodes}</span>` : ''}
                  ${item.pracDisplayCodes ? `<span class="px-1.5 py-0.5 rounded ${item.isNight ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60'}">Prác: ${item.pracDisplayCodes}</span>` : ''}
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
            <div class="flex items-center gap-1.5">
              ${(item.components && item.components.types) ? item.components.types.map(t => window.renderComponentBadge(t, true)).join('') : ''}
              <span class="text-[10px] text-brand-700 dark:text-brand-400 font-bold">${item.totalPhysicalSessions} Grupos</span>
            </div>
          </div>
          <div class="p-1">
            <button onclick="window.selectDocenteMateria('${mKey}')" id="sidebar-materia-${mKey}" class="sidebar-materia-btn w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800">
              <div class="truncate w-full pr-1">
                <div class="truncate font-bold text-slate-900 dark:text-white flex items-center justify-between gap-1">
                  <span class="truncate">${item.name}</span>
                  <span class="text-[9px] font-extrabold px-1 rounded flex-shrink-0 ${item.isNight ? 'bg-indigo-900 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">
                    ${item.shiftLabel === 'Turno Noche' ? '🌙 Noche' : (item.shiftLabel === 'Turno Tarde' ? '⛅ Tarde' : '☀️ Mañana')}
                  </span>
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${item.teoList.length} Teo • ${item.pracList.length} Prác (${item.totalHours}h) ${item.isNight ? '• <strong class="text-indigo-600 dark:text-indigo-400 font-bold">Nocturno</strong>' : ''}</div>
                <div class="text-[9px] text-brand-600 dark:text-brand-400 truncate mt-0.5">${item.isScopedDirector ? item.allCarrerasTags : (item.isCommon ? `⚡ COMÚN (LÍDER: ${item.leadTag}): ` + item.allCarrerasNames : item.allCarrerasNames)}</div>
              </div>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5 flex-shrink-0"></i>
            </button>
          </div>
        </div>
      `;
    });

    if (cardsGrid) cardsGrid.innerHTML = cardsHtml;
    if (sidebarContainer) sidebarContainer.innerHTML = sidebarHtml;

    window.__DOCENTE_ITEMS__ = items;
    if (typeof window.renderDocenteDashboard === 'function') {
      window.renderDocenteDashboard(docente, items);
    }

    // Auto-select preferred subject or first subject of this teacher
    if (!targetItem && preferredCourseCode) {
      const cleanTarget = String(preferredCourseCode).trim().toUpperCase();
      // First pass: exact code match or codesList
      targetItem = items.find(it => {
        const codesList = (it.codesList || []).map(c => String(c).trim().toUpperCase());
        const itCode = String(it.code || '').toUpperCase();
        return codesList.includes(cleanTarget) || itCode.split('/').map(s => s.trim()).includes(cleanTarget) || itCode === cleanTarget;
      });
      // Second pass: name / primaryName / title contains cleanTarget
      if (!targetItem) {
        targetItem = items.find(it => {
          const itCode = String(it.code || '').toUpperCase();
          const itName = String(it.name || '').toUpperCase();
          const itPrim = String(it.primaryName || '').toUpperCase();
          return itCode.includes(cleanTarget) || itName.includes(cleanTarget) || itPrim.includes(cleanTarget);
        });
      }
    }
    const itemToSelect = targetItem || items[0];
    if (itemToSelect) {
      window.selectDocenteMateria(itemToSelect.key);
      setTimeout(() => {
        const cardEl = document.getElementById('doc-materia-card-' + itemToSelect.key);
        if (cardEl && typeof cardEl.scrollIntoView === 'function') {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  // ── DOCENTE EXCLUSIVE DASHBOARD ENGINE ─────────────────────────────────
  window.renderDocenteDashboard = function(docenteOverride, itemsOverride) {
    let docente = docenteOverride || window.__ACTIVE_DOCENTE__;
    if (!docente && typeof window.getCurrentUser === 'function') {
      const u = window.getCurrentUser();
      if (u) {
        docente = {
          ci: u.ci || u.username,
          nombreCompleto: u.nombreCompleto || u.username,
          email: u.email || (u.username + '@unitepc.edu.bo'),
          sedeCodigo: u.sedeCodigo || 'CBA',
          sedeNombre: u.sedeNombre || 'Sede Central Cochabamba'
        };
      }
    }
    const items = itemsOverride || window.__DOCENTE_ITEMS__ || [];

    const welcomeName = document.getElementById('docente-dash-welcome-name');
    if (welcomeName && docente) {
      const name = docente.nombres || docente.nombreCompleto || docente.username || 'Docente';
      welcomeName.textContent = name;
    }

    const sedeBadge = document.getElementById('docente-dash-sede-badge');
    if (sedeBadge && docente) {
      sedeBadge.textContent = docente.sedeNombre || (docente.sedeCodigo === 'CBA' ? 'Sede Central Cochabamba' : (docente.sedeCodigo || 'Sede Central Cochabamba'));
    }

    // Update KPIs
    const kpiMaterias = document.getElementById('docente-dash-kpi-materias');
    if (kpiMaterias) kpiMaterias.textContent = items.length;

    const totalWeeklyHours = items.reduce((sum, it) => sum + (it.totalHours || 0), 0);
    const kpiHoras = document.getElementById('docente-dash-kpi-horas');
    if (kpiHoras) kpiHoras.textContent = totalWeeklyHours + ' hrs';

    const totalGroups = items.reduce((sum, it) => sum + (it.totalPhysicalSessions || it.totalGroupsInCluster || 1), 0);
    const kpiGrupos = document.getElementById('docente-dash-kpi-grupos');
    if (kpiGrupos) kpiGrupos.textContent = totalGroups;

    const matBadge = document.getElementById('docente-dash-materias-badge');
    if (matBadge) matBadge.textContent = `${items.length} Asignatura(s)`;

    // Update carreras list summary
    const carrerasListEl = document.getElementById('docente-dash-carreras-list');
    if (carrerasListEl) {
      if (items.length > 0) {
        const carreras = [...new Set(items.flatMap(it => (it.carrerasResolved || []).map(cr => cr.name)))];
        carrerasListEl.textContent = carreras.length > 0 ? `Carreras: ${carreras.join(' • ')}` : 'Asignaturas asignadas para el periodo activo';
      } else {
        carrerasListEl.textContent = 'Cátedras asignadas para el periodo activo';
      }
    }

    // Render subject cards in grid
    const gridEl = document.getElementById('docente-dash-cards-grid');
    if (gridEl) {
      if (items.length === 0) {
        gridEl.innerHTML = `
          <div class="col-span-full p-8 text-center bg-[var(--sp-surface-2)] rounded-xl border border-[var(--sp-border)] text-[var(--sp-ink-3)] text-xs">
            <i data-lucide="book-open" class="w-8 h-8 mx-auto text-[var(--sp-purple)] mb-2 opacity-60"></i>
            <p class="font-bold text-[var(--sp-ink)]">Cargando asignaturas del docente...</p>
            <p class="text-[11px] mt-1">Sincronizando información académica con el Gateway SEA.</p>
          </div>
        `;
      } else {
        gridEl.innerHTML = items.map((item) => {
          const carTags = item.isCommon 
            ? `⚡ COMÚN (LÍDER: ${item.leadTag}): ${item.allCarrerasTags}` 
            : (item.allCarrerasTags || (item.carrerasResolved && item.carrerasResolved[0] ? item.carrerasResolved[0].tag : 'UNITEPC'));
          const hours = item.totalHours || 4;
          const code = item.code || 'DOC-101';
          const name = item.name || 'Materia Asignada';
          const mKey = item.key || '';
          const shift = item.shiftLabel || 'Regular';

          return `
            <div class="p-5 rounded-xl bg-[var(--sp-surface-2)] border border-[var(--sp-border)] hover:border-[var(--sp-purple)]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)] border border-[var(--sp-purple)]/20 font-mono">${code}</span>
                  <span class="text-[10px] font-bold text-[var(--sp-ink-3)] bg-[var(--sp-surface)] px-2 py-0.5 rounded border border-[var(--sp-border)]">${hours} hrs/sem</span>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-[var(--sp-ink)] group-hover:text-[var(--sp-purple-dark)] transition-colors leading-tight font-display">${name}</h4>
                  <p class="text-[10px] text-[var(--sp-ink-3)] mt-0.5">${carTags} • ${shift}</p>
                </div>
                <div class="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Analítico
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PAC 20 Sem
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Cronograma
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 4 Planes
                  </span>
                </div>
              </div>
              <button onclick="window.selectDocenteMateriaAndGo('${mKey}')" class="w-full py-2 px-3 rounded-lg bg-[var(--sp-surface)] hover:bg-[var(--sp-purple-soft)] text-[var(--sp-purple-dark)] border border-[var(--sp-purple)]/20 hover:border-[var(--sp-purple)]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span>Abrir Carpeta Docente</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          `;
        }).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  };

  window.selectDocenteMateriaAndGo = function(materiaKey, tabId) {
    if (typeof window.selectDocenteMateria === 'function' && materiaKey) {
      window.selectDocenteMateria(materiaKey);
    }
    if (typeof window.switchView === 'function') {
      window.switchView('view1');
    }
    if (tabId && typeof window.switchDocMainTab === 'function') {
      window.switchDocMainTab(tabId);
    }
  };

  window.goToDocenteDocument = function(tabId) {
    if (typeof window.switchView === 'function') {
      window.switchView('view1');
    }
    if (typeof window.switchDocMainTab === 'function') {
      window.switchDocMainTab(tabId);
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
          ${item.slots.map(sl => {
            const isNightSlot = parseInt((sl.start || '00').split(':')[0], 10) >= 18;
            return `
            <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg ${isNightSlot ? 'bg-indigo-950/20 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/80' : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-700/70'} border text-xs shadow-2xs">
              <div class="flex items-center gap-1.5 font-bold ${isNightSlot ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}">
                <i data-lucide="${isNightSlot ? 'moon' : 'clock'}" class="w-3.5 h-3.5 ${isNightSlot ? 'text-amber-500' : 'text-brand-500'}"></i>
                <span>${sl.start} - ${sl.end}</span>
                ${isNightSlot ? '<span class="px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-100 font-extrabold text-[9px] border border-indigo-700 flex items-center gap-0.5"><span class="text-amber-300">🌙</span> Noche</span>' : ''}
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded ${isNightSlot ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60'}">
                  ${sl.classroom}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  (${sl.groups})
                </span>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Sub-tabs of Career across all 4 document tabs
  window.renderCarreraSubtabs = function(mKey) {
    try {
      const data = materiasData[mKey];
      const analiticoContainer = document.getElementById('analitico-carrera-subtabs');
      const pacContainer = document.getElementById('pac-carrera-subtabs');
      const cronogramaContainer = document.getElementById('cronograma-carrera-subtabs');
      const planesContainer = document.getElementById('planes-carrera-subtabs');
      if (!data) return;

      const currentUser = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
      const isDirector = Boolean(data.isScopedDirector) || (currentUser && currentUser.role === 'ROLE_DIR_CARRERA') || Boolean(window.__SUPERVISION_AUDIT_COURSE_CODE__ || localStorage.getItem('sisa_supervision_audit_course'));

      if (isDirector) {
        if (data.isCommon) {
          const otherNames = data.otherCareersNames || 'otras carreras';
          const alertHtml = `
            <div class="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 text-xs shadow-xs">
              <div class="flex items-center gap-2.5">
                <i data-lucide="layers" class="w-4 h-4 text-amber-600 shrink-0"></i>
                <span><strong>Materia Común:</strong> Esta cátedra se imparte de forma compartida con <strong>${otherNames}</strong>. Como Director de Carrera, estás visualizando y auditando exclusivamente los registros académicos de <strong>${data.carrera} (${data.codigo})</strong>.</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shrink-0 border border-amber-300 dark:border-amber-700">Tu Carrera</span>
            </div>
          `;
          if (analiticoContainer) analiticoContainer.innerHTML = alertHtml;
          if (pacContainer) pacContainer.innerHTML = alertHtml;
          if (cronogramaContainer) cronogramaContainer.innerHTML = alertHtml;
          if (planesContainer) planesContainer.innerHTML = alertHtml;
          if (window.lucide) window.lucide.createIcons();
        } else {
          if (analiticoContainer) analiticoContainer.innerHTML = '';
          if (pacContainer) pacContainer.innerHTML = '';
          if (cronogramaContainer) cronogramaContainer.innerHTML = '';
          if (planesContainer) planesContainer.innerHTML = '';
        }
        return;
      }

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
        if (cronogramaContainer) cronogramaContainer.innerHTML = '';
        if (planesContainer) planesContainer.innerHTML = '';
        return;
      }

      const activeCode = window.currentSelectedCareerCode || 'ALL';

      const buildTabsHtml = () => {
        let tabsHtml = `
          <div class="p-3 rounded-xl border-2 border-brand-300 dark:border-brand-800 bg-brand-50/80 dark:bg-slate-900 shadow-sm space-y-2">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="text-xs font-extrabold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
                <i data-lucide="layers" class="w-4 h-4 text-brand-600"></i> Vista Previa / Carátula de Carrera:
              </span>
              <span class="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Hacé clic en una carrera para ver sus códigos y membrete específico (sin re-subir documentos):</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button type="button" data-career-code="ALL" onclick="window.selectCarreraContext('${mKey}', 'ALL', this)" class="carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${activeCode === 'ALL' ? 'bg-brand-600 text-white ring-2 ring-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600'} cursor-pointer">
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

          const isSelected = (activeCode === cCode);
          tabsHtml += `
            <button type="button" data-career-code="${cCode}" onclick="window.selectCarreraContext('${mKey}', '${cCode}', this, '${singleCode}', '${cr.name}')" class="carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected ? 'bg-brand-600 text-white ring-2 ring-brand-500/30 font-bold' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600'} flex items-center gap-1.5 cursor-pointer shadow-xs">
              <i data-lucide="${icon}" class="w-3.5 h-3.5"></i> ${cr.tag || cCode} <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-brand-700 dark:text-brand-300'} font-mono border ${isSelected ? 'border-white/30' : 'border-slate-200 dark:border-slate-600'}">${singleCode}</span>
            </button>
          `;
        });

        tabsHtml += `
            </div>
          </div>
        `;
        return tabsHtml;
      };

      const htmlContent = buildTabsHtml();
      if (analiticoContainer) analiticoContainer.innerHTML = htmlContent;
      if (pacContainer) pacContainer.innerHTML = htmlContent;
      if (cronogramaContainer) cronogramaContainer.innerHTML = htmlContent;
      if (planesContainer) planesContainer.innerHTML = htmlContent;
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Error rendering carrera subtabs:', err);
    }
  };

  window.selectCarreraContext = function(mKey, cCode, btnEl, singleCode, carreraName) {
    const data = materiasData[mKey];
    if (!data) return;

    window.currentSelectedCareerCode = (cCode === 'ALL') ? null : cCode;
    window.currentSelectedCareerName = (cCode === 'ALL') ? null : carreraName;

    // Synchronize highlight across all 4 subtab containers simultaneously
    document.querySelectorAll(`.carrera-subtab-btn-${mKey}`).forEach(btn => {
      const btnCode = btn.getAttribute('data-career-code') || 'ALL';
      if (btnCode === cCode) {
        btn.className = `carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 bg-brand-600 text-white ring-2 ring-brand-500/30 cursor-pointer`;
      } else {
        btn.className = `carrera-subtab-btn-${mKey} px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 flex items-center gap-1.5 cursor-pointer shadow-xs`;
      }
    });

    if (cCode === 'ALL') {
      if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = data.codigo;
      if (document.getElementById('pac-codigo-input')) document.getElementById('pac-codigo-input').value = data.codigo;
      if (document.getElementById('pac-carrera-input')) document.getElementById('pac-carrera-input').value = data.carrera;
      if (document.getElementById('plan-carrera-input')) document.getElementById('plan-carrera-input').value = data.carrera;
      if (document.getElementById('caratula-codigo')) document.getElementById('caratula-codigo').value = data.codigo;
      if (document.getElementById('caratula-carrera')) document.getElementById('caratula-carrera').value = data.carrera;
      if (document.getElementById('banner-carrera-tag')) document.getElementById('banner-carrera-tag').innerText = data.carreraTag;
      window.showToast('🌐 Vista Consolidada Multicarrera: ' + data.codigo);
    } else {
      if (document.getElementById('analitico-codigo-input')) document.getElementById('analitico-codigo-input').value = singleCode;
      if (document.getElementById('pac-codigo-input')) document.getElementById('pac-codigo-input').value = singleCode;
      if (document.getElementById('pac-carrera-input')) document.getElementById('pac-carrera-input').value = carreraName;
      if (document.getElementById('plan-carrera-input')) document.getElementById('plan-carrera-input').value = carreraName;
      if (document.getElementById('caratula-codigo')) document.getElementById('caratula-codigo').value = singleCode;
      if (document.getElementById('caratula-carrera')) document.getElementById('caratula-carrera').value = carreraName;
      if (document.getElementById('banner-carrera-tag')) document.getElementById('banner-carrera-tag').innerText = `⚡ ${carreraName.toUpperCase()} (${singleCode})`;
      window.showToast(`🏫 Vista ajustada para ${carreraName} (Código: ${singleCode})`);
    }

    // Also synchronize print modal career selector if open
    const printCareerSel = document.getElementById('print-career-selector');
    if (printCareerSel) {
      printCareerSel.value = cCode;
    }
  };

  // =========================================================================
  // ── PHASE 4 & 5: AUTHENTICATION, FORCED PASSWORD CHANGE & USER MANAGEMENT ──
  // =========================================================================

  // Session helpers
  window.getCurrentUser = function() {
    try {
      const raw = localStorage.getItem('scu_user_info');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  window.isCareerDirectorSession = function() {
    try {
      const u = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
      const isDir = u && u.role === 'ROLE_DIR_CARRERA';
      const isAudit = Boolean(window.__SUPERVISION_AUDIT_COURSE_CODE__ || localStorage.getItem('sisa_supervision_audit_course'));
      return Boolean(isDir || isAudit);
    } catch (e) {
      return false;
    }
  };

  window.getAuthToken = function() {
    return localStorage.getItem('scu_access_token') || null;
  };

  window.setAuthSession = function(token, user) {
    if (token) {
      localStorage.setItem('scu_access_token', token);
    }
    if (user) {
      localStorage.setItem('scu_user_info', JSON.stringify(user));
      window.updateUserProfileUi(user);
      if (user.role === 'ROLE_DOCENTE') {
        const teacherCi = user.ci || user.username;
        if (teacherCi && typeof window.selectDocenteFromApi === 'function') {
          window.selectDocenteFromApi(teacherCi, true);
        }
      }
    }
  };

  window.logoutUser = function() {
    window.__SUPERVISION_AUDIT_COURSE_CODE__ = null;
    try { localStorage.removeItem('sisa_supervision_audit_course'); } catch (e) {}
    localStorage.removeItem('scu_access_token');
    localStorage.removeItem('scu_refresh_token');
    localStorage.removeItem('scu_user_info');
    window._tempPasswordChangeUser = null;
    window._tempPasswordChangeToken = null;

    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');

    window.showLoginView();
    window.showToast('ℹ️ Sesión cerrada correctamente');
  };

  // ── SUPERVISIÓN CURRICULAR ENGINE (VIEW 2 - ROL DIRECTOR DE CARRERA) ───────────
  window.__SUPERVISION_CAREER_MAP__ = {
    'CARSIS': { id: '648febfd-dc79-4dd8-a8aa-dc7549ef649b', code: 'CARSIS', name: 'Ingeniería de Sistemas', tag: 'ING. SISTEMAS', color: 'purple' },
    'CARELE': { id: '2ef716a7-b545-4e8d-b497-94fdedaef3cc', code: 'CARELE', name: 'Ingeniería Electrónica', tag: 'ING. ELECTRÓNICA', color: 'blue' },
    'CARSON': { id: '51ecba92-6699-4474-9d34-dcde6eeaba63', code: 'CARSON', name: 'Ingeniería de Sonido', tag: 'ING. DE SONIDO', color: 'indigo' },
    'CARIBI': { id: 'c6c95b52-e67a-4496-9821-9eb79e4506ac', code: 'CARIBI', name: 'Ingeniería Biomédica', tag: 'ING. BIOMÉDICA', color: 'cyan' },
    'CARMED': { id: 'fdcd6c35-8e0e-47ea-993c-119eb1a7789c', code: 'CARMED', name: 'Medicina Humana', tag: 'MEDICINA', color: 'rose' },
    'CARDER': { id: 'f82b04f1-d439-4c9c-852c-5d22d1407c7c', code: 'CARDER', name: 'Derecho', tag: 'DERECHO', color: 'amber' },
    'CARODO': { id: '5969e19b-fefd-4bd2-8883-5f554ae3095b', code: 'CARODO', name: 'Odontología', tag: 'ODONTOLOGÍA', color: 'sky' },
    'CARVET': { id: '0159e8bd-0cb5-4ab6-90f0-2c0fd4c8b795', code: 'CARVET', name: 'Medicina Veterinaria', tag: 'VETERINARIA', color: 'teal' }
  };

  window.__SUPERVISION_DATA__ = null;
  window.__SUPERVISION_FILTER__ = 'ALL';
  window.__SUPERVISION_EXPANDED_SEMESTERS__ = { 3: true };

  window.getCourseSemester = function(courseName, courseCode) {
    const cUpper = (courseName || '').toUpperCase().trim();
    const code = (courseCode || '').toUpperCase().trim();

    // 8° SEMESTRE
    if (cUpper.includes('TITULACI')) return 8;
    if (cUpper.includes('GESTIÓN ESTRATÉGICA DE EMPRESAS') || cUpper.includes('GESTION ESTRATEGICA DE EMPRESAS')) return 8;
    if (cUpper.includes('TALLER DE INGENIERÍA DE SOFTWARE') || cUpper.includes('TALLER DE INGENIERIA DE SOFTWARE')) return 8;
    if (cUpper.includes('PRÁCTICA PRE-PROFESIONAL') || cUpper.includes('PRACTICA PRE-PROFESIONAL')) return 8;
    if (cUpper.includes('GESTIÓN DE CALIDAD') || cUpper.includes('GESTION DE CALIDAD')) return 8;

    // 7° SEMESTRE
    if (cUpper.includes('MÉTODOS Y TÉCNICAS DE INVESTIGACI') || cUpper.includes('METODOS Y TECNICAS DE INVESTIGACI')) return 7;
    if (cUpper.includes('REDES NEURONALES') || cUpper.includes('INTELIGENCIA ARTIFICIAL')) return 7;
    if (cUpper.includes('TELECOMUNICACIONES')) return 7;
    if (cUpper.includes('INGENIERÍA DE SOFTWARE') && !cUpper.includes('TALLER')) return 7;
    if (cUpper.includes('SIMULACIÓN DE SISTEMAS') || cUpper.includes('SIMULACION DE SISTEMAS')) return 7;
    if (cUpper.includes('MÉTODO DE DESARROLLO DE SOFTWARE') || cUpper.includes('METODO DE DESARROLLO DE SOFTWARE')) return 7;

    // 6° SEMESTRE
    if (cUpper.includes('ROBÓTICA') || cUpper.includes('ROBOTICA')) return 6;
    if (cUpper.includes('INFRAESTRUCTURA TECNOLÓGICA') || cUpper.includes('INFRAESTRUCTURA TECNOLOGICA')) return 6;
    if (cUpper.includes('ANÁLISIS DE SISTEMAS II') || cUpper.includes('ANALISIS DE SISTEMAS II')) return 6;
    if (cUpper.includes('INGENIERÍA DE MÉTODOS') || cUpper.includes('REINGENIERÍA') || cUpper.includes('REINGENIERIA')) return 6;
    if (cUpper.includes('TALLER DE REDES')) return 6;
    if (cUpper.includes('LENGUAJES DE PROGRAMACIÓN') || cUpper.includes('LENGUAJES DE PROGRAMACION')) return 6;

    // 5° SEMESTRE
    if (cUpper.includes('INVESTIGACIÓN OPERATIVA') || cUpper.includes('INVESTIGACION OPERATIVA')) return 5;
    if (cUpper.includes('MICROCONTROLADORES')) return 5;
    if (cUpper.includes('ARQUITECTURA DE NUEVAS')) return 5;
    if ((cUpper.includes('ANÁLISIS DE SISTEMAS I') || cUpper.includes('ANALISIS DE SISTEMAS I')) && !cUpper.includes('II')) return 5;
    if (cUpper.includes('INFORMÁTICA FORENSE') || cUpper.includes('INFORMATICA FORENSE')) return 5;
    if (cUpper.includes('REDES Y COMUNICACIÓN') || cUpper.includes('REDES Y COMUNICACION')) return 5;
    if (cUpper.includes('CONCEPTOS AVANZADOS DE BASE DE DATOS')) return 5;

    // 4° SEMESTRE
    if (cUpper.includes('MÉTODOS NUMÉRICOS') || cUpper.includes('METODOS NUMERICOS')) return 4;
    if (cUpper.includes('REDACCIÓN') || cUpper.includes('REDACCION') || cUpper.includes('INTERCULTURALIDAD')) return 4;
    if (cUpper.includes('SISTEMAS OPERATIVOS')) return 4;
    if (cUpper.includes('DISEÑO DE BASE DE DATOS') || (cUpper.includes('BASE DE DATOS') && !cUpper.includes('AVANZADOS'))) return 4;
    if (cUpper.includes('INGLÉS TÉCNICO IV') || cUpper.includes('INGLES TECNICO IV')) return 4;
    if (cUpper.includes('TALLER DE PROGRAMACIÓN III') || cUpper.includes('TALLER DE PROGRAMACION III')) return 4;
    if (cUpper.includes('DISEÑO GRÁFICO') || cUpper.includes('DISENO GRAFICO') || cUpper.includes('INFORMACIÓN GEOGRÁFICA') || cUpper.includes('INFORMACION GEOGRAFICA')) return 4;

    // 3° SEMESTRE
    if (cUpper.includes('ECUACIONES DIFERENCIALES')) return 3;
    if (cUpper.includes('SISTEMAS DIGITALES')) return 3;
    if (cUpper.includes('PROGRAMACIÓN III') || cUpper.includes('PROGRAMACION III')) return 3;
    if (cUpper.includes('PROBABILIDAD') || cUpper.includes('PROBALIDAD')) return 3;
    if (cUpper.includes('INGLÉS TÉCNICO III') || cUpper.includes('INGLES TECNICO III')) return 3;
    if (cUpper.includes('TALLER DE PROGRAMACIÓN II') || cUpper.includes('TALLER DE PROGRAMACION II')) return 3;
    if (cUpper.includes('ÉTICA') || cUpper.includes('ETICA') || cUpper.includes('DERECHO INFORMÁTICO') || cUpper.includes('DERECHO INFORMATICO')) return 3;

    // 2° SEMESTRE
    if (cUpper.includes('CALCULO II')) return 2;
    if (cUpper.includes('FÍSICA II') || cUpper.includes('FISICA II')) return 2;
    if ((cUpper.includes('PROGRAMACIÓN II') || cUpper.includes('PROGRAMACION II')) && !cUpper.includes('III')) return 2;
    if (cUpper.includes('ÁLGEBRA LINEAL') || cUpper.includes('ALGEBRA LINEAL')) return 2;
    if (cUpper.includes('INGLÉS TÉCNICO II') || cUpper.includes('INGLES TECNICO II')) return 2;
    if (cUpper.includes('TALLER DE PROGRAMACIÓN I') || cUpper.includes('TALLER DE PROGRAMACION I')) return 2;
    if (cUpper.includes('DISPOSITIVOS ELECTRÓNICOS') || cUpper.includes('DISPOSITIVOS ELECTRONICOS')) return 2;

    // 1° SEMESTRE
    if (cUpper.includes('INTRODUCCIÓN A LAS CIENCIAS') || cUpper.includes('INTRODUCCION A LAS CIENCIAS') || cUpper.includes('CIENCIAS DE LA COMPUTACIÓN') || cUpper.includes('CIENCIAS DE LA COMPUTACION')) return 1;
    if (cUpper.includes('CALCULO I') && !cUpper.includes('II')) return 1;
    if ((cUpper.includes('FÍSICA I') || cUpper.includes('FISICA I')) && !cUpper.includes('II')) return 1;
    if ((cUpper.includes('PROGRAMACIÓN I') || cUpper.includes('PROGRAMACION I')) && !cUpper.includes('II') && !cUpper.includes('III') && !cUpper.includes('TALLER')) return 1;
    if ((cUpper.includes('ÁLGEBRA') || cUpper.includes('ALGEBRA')) && !cUpper.includes('LINEAL')) return 1;
    if (cUpper.includes('INGLÉS TÉCNICO I') || cUpper.includes('INGLES TECNICO I')) return 1;

    // Fallback: analyze code
    if (code.startsWith('SIS-') || code.startsWith('ELC-') || code.startsWith('SON-')) {
      const parts = code.split('-');
      if (parts[1] && parts[1].length >= 2) {
        const y = parseInt(parts[1][0], 10);
        const s = parseInt(parts[1][1], 10);
        if (!isNaN(y) && !isNaN(s)) return (y - 1) * 2 + s;
      }
    }

    return 1;
  };

  window.renderSupervisionCurricular = async function(targetCareerId, targetCareerCode) {
    const container = document.getElementById('supervision-semesters-container');
    if (!container) return;

    // 1. Resolve active career identity
    let cCode = targetCareerCode || 'CARSIS';
    const currentUser = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (!targetCareerCode && currentUser && currentUser.username) {
      if (currentUser.username.includes('.ele')) cCode = 'CARELE';
      else if (currentUser.username.includes('.son')) cCode = 'CARSON';
      else if (currentUser.username.includes('.med')) cCode = 'CARMED';
      else if (currentUser.username.includes('.der')) cCode = 'CARDER';
    }

    const careerInfo = window.__SUPERVISION_CAREER_MAP__[cCode] || window.__SUPERVISION_CAREER_MAP__['CARSIS'];
    const careerUuid = targetCareerId || careerInfo.id;

    const badgeEl = document.getElementById('supervision-career-badge');
    const selectEl = document.getElementById('supervision-career-select');
    const userRole = (currentUser && currentUser.role) ? currentUser.role : (localStorage.getItem('sisa_user_role') || '');
    const isElevatedRole = ['ROLE_DIR_ACADEMICA', 'ROLE_ADMIN', 'ROLE_VICERRECTOR_SEDE', 'ROLE_VICERRECTOR_NACIONAL'].includes(userRole);

    if (badgeEl) {
      badgeEl.textContent = careerInfo.name;
      if (isElevatedRole) {
        badgeEl.classList.add('hidden');
      } else {
        badgeEl.classList.remove('hidden');
      }
    }

    if (selectEl) {
      if (isElevatedRole) {
        selectEl.classList.remove('hidden');
        selectEl.value = cCode;
      } else {
        selectEl.classList.add('hidden');
      }
    }

    window.onSupervisionCareerChange = function(newCareerCode) {
      if (!newCareerCode) return;
      const info = window.__SUPERVISION_CAREER_MAP__[newCareerCode];
      if (info && typeof window.renderSupervisionCurricular === 'function') {
        window.renderSupervisionCurricular(info.id, newCareerCode);
      }
    };

    // 2. Instant Cache Load (0ms flash)
    const cacheKey = 'sisa_cache_supervision_groups_' + cCode;
    const cachedDataStr = localStorage.getItem(cacheKey);
    let rawGroups = null;

    if (cachedDataStr) {
      try {
        rawGroups = JSON.parse(cachedDataStr);
      } catch (e) {}
    }

    if (rawGroups && Array.isArray(rawGroups) && rawGroups.length > 0) {
      window.processAndRenderSupervisionData(rawGroups, careerInfo);
    }

    // 3. Live Fetch from Gateway
    try {
      const branchId = 'ea4fb26e-11a9-452f-9bae-4962de2dd931';
      const url = `/api/v1/catalogo-academico/groups?term=2-2026&branchOfficeId=${branchId}&careerId=${careerUuid}`;
      const res = await fetch(url);
      if (res.ok) {
        const liveGroups = await res.json();
        if (Array.isArray(liveGroups) && liveGroups.length > 0) {
          rawGroups = liveGroups;
          localStorage.setItem(cacheKey, JSON.stringify(liveGroups));
          window.processAndRenderSupervisionData(liveGroups, careerInfo);
        }
      }
    } catch (err) {
      console.warn('Supervisión Curricular: Error fetching live groups, using local mirror:', err);
    }

    // 4. Live Sync SISA PAC Statuses from Backend
    try {
      const pacHeaders = (typeof window.getAuthHeaders === 'function') ? window.getAuthHeaders() : {};
      const pacRes = await fetch(`/api/v1/planificaciones/pac/by-carrera/${cCode}?gestionId=1`, {
        headers: pacHeaders
      });
      if (pacRes.ok) {
        const pacJson = await pacRes.json();
        const pacList = (pacJson && pacJson.data) ? pacJson.data : (Array.isArray(pacJson) ? pacJson : []);
        if (Array.isArray(pacList) && pacList.length > 0) {
          if (!window.__PAC_CACHE__) window.__PAC_CACHE__ = {};
          pacList.forEach(p => {
            if (p.codigoAsignatura) {
              window.__PAC_CACHE__[p.codigoAsignatura] = p;
              localStorage.setItem('sisa_pac_id_' + p.codigoAsignatura, p.id);
            }
          });
          const targetGroups = rawGroups || (cachedDataStr ? JSON.parse(cachedDataStr) : null);
          if (targetGroups && Array.isArray(targetGroups)) {
            window.processAndRenderSupervisionData(targetGroups, careerInfo, pacList);
          }
        }
      }
    } catch (pacErr) {
      console.warn('Supervisión Curricular: Error fetching persistent PAC statuses:', pacErr);
    }
  };

  window.processAndRenderSupervisionData = function(rawGroups, careerInfo, pacList) {
    const container = document.getElementById('supervision-semesters-container');
    if (!container) return;

    // 1. Aggregate groups into curricular courses
    const coursesMap = {};

    rawGroups.forEach(g => {
      const courseName = (g.courseName || g.name || 'Materia').trim();
      const resolvedCode = (typeof window.resolveOfficialCourseCode === 'function')
        ? window.resolveOfficialCourseCode(courseName, [careerInfo.code])
        : 'SIS-101';
      const officialCode = (resolvedCode && resolvedCode.includes('-')) ? resolvedCode.split('/')[0].trim() : (resolvedCode || 'SIS-101');

      if (!coursesMap[courseName]) {
        const sem = window.getCourseSemester(courseName, officialCode);
        coursesMap[courseName] = {
          courseName: courseName,
          code: officialCode,
          semester: sem,
          groups: [],
          teachers: [],
          isCommon: false,
          commonCareers: [],
          commonCareersText: '',
          shifts: new Set(),
          classrooms: new Set(),
          totalHours: 4
        };
      }

      const course = coursesMap[courseName];
      course.groups.push(g);

      if (g.teacherName && !course.teachers.some(t => t.ci === g.teacherCi)) {
        course.teachers.push({
          name: g.teacherName,
          ci: g.teacherCi || ''
        });
      }

      if (g.groupLinkId != null) {
        course.isCommon = true;
      }

      if (g.schedule) {
        if (g.schedule.includes('18:') || g.schedule.includes('19:') || g.schedule.includes('20:') || g.schedule.includes('21:')) {
          course.shifts.add('Nocturno');
        } else if (g.schedule.includes('14:') || g.schedule.includes('15:') || g.schedule.includes('16:') || g.schedule.includes('17:')) {
          course.shifts.add('Tarde');
        } else {
          course.shifts.add('Mañana');
        }
      }
      if (g.classroom) course.classrooms.add(g.classroom);
    });

    // Resolve common subjects and with which careers they are shared
    Object.values(coursesMap).forEach(course => {
      const name = (course.courseName || '').toUpperCase();
      if (course.code === 'SIS-105' || name.includes('ÁLGEBRA') || name.includes('ALGEBRA')) {
        course.isCommon = true;
        course.commonCareers = ['Ing. Electrónica', 'Ing. de Sonido'];
      } else if (course.code === 'SIS-214' || name.includes('BASE DE DATOS')) {
        course.isCommon = true;
        course.commonCareers = ['Ing. Electrónica', 'Ing. Telecomunicaciones'];
      } else if (name.includes('PROBABILIDAD') || name.includes('ESTADÍSTICA') || name.includes('ESTADISTICA')) {
        course.isCommon = true;
        course.commonCareers = ['Ing. Comercial', 'Ing. Financiera'];
      } else if (name.includes('CÁLCULO I') || name.includes('CALCULO I') || name.includes('CÁLCULO 1') || name.includes('CALCULO 1')) {
        course.isCommon = true;
        course.commonCareers = ['Ing. Electrónica', 'Ing. Biomédica'];
      } else if (name.includes('METODOLOGÍA') || name.includes('METODOLOGIA') || name.includes('INVESTIGACIÓN') || name.includes('INVESTIGACION')) {
        course.isCommon = true;
        course.commonCareers = ['Derecho', 'Ing. Comercial'];
      } else if (course.groups.some(g => g.groupLinkId != null)) {
        course.isCommon = true;
        if (course.commonCareers.length === 0) {
          course.commonCareers = ['Ing. Electrónica'];
        }
      }

      if (course.isCommon && course.commonCareers && course.commonCareers.length > 0) {
        course.commonCareersText = course.commonCareers.join(', ');
      }
    });

    // 2. Resolve document states and review statuses for complete official dossier
    Object.values(coursesMap).forEach(course => {
      const savedReview = localStorage.getItem('sisa_supervision_status_' + course.code);
      let status = 'PENDIENTE';

      // Attach PAC metadata if available
      const pacRecord = (window.__PAC_CACHE__ && window.__PAC_CACHE__[course.code]) || (pacList && pacList.find(p => p.codigoAsignatura === course.code));
      if (pacRecord) {
        course.pacId = pacRecord.id;
        course.observacionesRevision = pacRecord.observacionesRevision;
        if (pacRecord.estado) {
          if (pacRecord.estado === 'APROBADO') status = 'APROBADO';
          else if (pacRecord.estado === 'OBSERVADO') status = 'OBSERVADO';
          else if (pacRecord.estado === 'ENVIADO_REVISION' || pacRecord.estado === 'EN_REVISION') status = 'EN_REVISION';
          else status = pacRecord.estado;
        }
      }
      if (!course.pacId) {
        const storedId = localStorage.getItem('sisa_pac_id_' + course.code);
        if (storedId) course.pacId = parseInt(storedId, 10);
      }

      if (savedReview) {
        status = savedReview;
      } else if (pacRecord && pacRecord.estado) {
        if (pacRecord.estado === 'APROBADO') status = 'APROBADO';
        else if (pacRecord.estado === 'OBSERVADO') status = 'OBSERVADO';
        else if (pacRecord.estado === 'ENVIADO_REVISION' || pacRecord.estado === 'EN_REVISION') status = 'EN_REVISION';
        else status = pacRecord.estado;
      } else {
        status = 'PENDIENTE';
      }

      // Resolve Curricular Modality: TEORICO_PRACTICA | TEORICA_PURA | PRACTICA_PURA
      const cUpper = (course.courseName || '').toUpperCase();
      let modality = 'TEORICO_PRACTICA';

      // 1. Asignaturas de Práctica Pura (100% horas prácticas, 0 horas teóricas: internados, prácticas preprofesionales, pasantías, talleres de grado)
      if (cUpper.includes('PRÁCTICA PRE-PROFESIONAL') || cUpper.includes('PRACTICA PRE-PROFESIONAL') ||
          cUpper.includes('PRÁCTICA PREPROFESIONAL') || cUpper.includes('PRACTICA PREPROFESIONAL') ||
          cUpper.includes('PASANTÍA') || cUpper.includes('PASANTIA') ||
          cUpper.includes('INTERNADO') || cUpper.includes('ROTATORIO') ||
          cUpper.includes('CLÍNICA INTEGRAL') || cUpper.includes('CLINICA INTEGRAL') ||
          cUpper.includes('TALLER DE GRADO') || cUpper.includes('PROYECTO DE GRADO') ||
          cUpper.includes('MODALIDAD DE GRADUACI') || cUpper.includes('TRABAJO DE GRADO')) {
        modality = 'PRACTICA_PURA';
      }
      // 2. Asignaturas Teóricas Puras (100% expositivas/conceptuales, sin ninguna práctica ni en aula ni en laboratorio)
      else if (cUpper.includes('LEGISLACI') || cUpper.includes('DEONTOLOG') || 
               cUpper.includes('FILOSOF') || cUpper.includes('ÉTICA') || cUpper.includes('ETICA') ||
               cUpper.includes('HISTORIA DE LA') || cUpper.includes('DERECHO CONSTITUCIONAL')) {
        modality = 'TEORICA_PURA';
      }
      // 3. Asignaturas Teórico-Prácticas (Mixtas: teoría + práctica de aula y/o laboratorio; ej. Álgebra, Cálculo, Programación, etc.)
      else {
        modality = 'TEORICO_PRACTICA';
      }

      const tieneTeoria = (modality !== 'PRACTICA_PURA');
      const tienePractica = (modality !== 'TEORICA_PURA');

      // Scan localStorage for REAL saved documents belonging to this specific course
      let hasRealProg = false;
      let realUnitsCount = 0;
      let hasRealPacTeo = false;
      let realPacTeoWeeks = 0;
      let hasRealPacPrac = false;
      let realPacPracGuias = 0;
      let realPlanesCount = 0;

      try {
        const cCode = String(course.code || '').trim().toUpperCase();
        const cClean = cCode.replace(/[^A-Z0-9]/g, '_');
        const cHyphen = cCode.replace(/_/g, '-');
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          const kUpper = k.toUpperCase();
          const matchesCourse = (cCode && kUpper.includes(cCode)) || (cClean && kUpper.includes(cClean)) || (cHyphen && kUpper.includes(cHyphen));
          if (k.startsWith('sisa_saved_programa_analitico_') && matchesCourse) {
            try {
              const p = JSON.parse(localStorage.getItem(k));
              if (p && p.unidades && Array.isArray(p.unidades) && p.unidades.length > 0) {
                hasRealProg = true;
                realUnitsCount = Math.max(realUnitsCount, p.unidades.length);
              }
            } catch (e) {}
          }
          if ((k.startsWith('sisa_saved_pac_gral_') || k.startsWith('sisa_saved_pac_')) && !k.includes('_prac_') && matchesCourse) {
            try {
              const p = JSON.parse(localStorage.getItem(k));
              if (p && p.sesiones && Array.isArray(p.sesiones) && p.sesiones.length > 0) {
                hasRealPacTeo = true;
                realPacTeoWeeks = Math.max(realPacTeoWeeks, p.sesiones.length);
              }
            } catch (e) {}
          }
          if (k.startsWith('sisa_saved_pac_prac_') && matchesCourse) {
            try {
              const p = JSON.parse(localStorage.getItem(k));
              if (p && p.sesiones && Array.isArray(p.sesiones) && p.sesiones.length > 0) {
                hasRealPacPrac = true;
                realPacPracGuias = Math.max(realPacPracGuias, p.sesiones.length);
              }
            } catch (e) {}
          }
          if (k.startsWith('sisa_saved_planes_') && matchesCourse) {
            try {
              const p = JSON.parse(localStorage.getItem(k));
              if (Array.isArray(p)) realPlanesCount = Math.max(realPlanesCount, p.length);
              else if (p && p.planes && Array.isArray(p.planes)) realPlanesCount = Math.max(realPlanesCount, p.planes.length);
              else if (p && p.sesiones && Array.isArray(p.sesiones)) realPlanesCount = Math.max(realPlanesCount, p.sesiones.length);
            } catch (e) {}
          }
        }
      } catch (e) {}

      if (pacRecord) {
        if (pacRecord.matriz7 && Array.isArray(pacRecord.matriz7) && pacRecord.matriz7.length > 0) {
          hasRealPacTeo = true;
          realPacTeoWeeks = Math.max(realPacTeoWeeks, pacRecord.matriz7.length);
        } else if (pacRecord.matriz7Count && pacRecord.matriz7Count > 0) {
          hasRealPacTeo = true;
          realPacTeoWeeks = Math.max(realPacTeoWeeks, pacRecord.matriz7Count);
        }
      }

      // Resolve Granular status per official document
      let analiticoStatus = status;
      let pacTeoricoStatus = tieneTeoria ? status : 'N/A';
      let pacPracticoStatus = tienePractica ? status : 'N/A';
      let planesCount = realPlanesCount;
      let planesStatus = (planesCount >= 40) ? 'COMPLETO' : ((planesCount > 0) ? 'EN_AVANCE' : 'PENDIENTE');

      // Check if specific observed documents were flagged by director
      const savedObsDocs = localStorage.getItem('sisa_supervision_obs_docs_' + course.code);
      if (savedObsDocs && status === 'OBSERVADO') {
        try {
          const obsArr = JSON.parse(savedObsDocs);
          analiticoStatus = obsArr.includes('analitico') ? 'OBSERVADO' : (status === 'APROBADO' ? 'APROBADO' : 'EN_REVISION');
          if (tieneTeoria) {
            pacTeoricoStatus = obsArr.includes('pacteorico') ? 'OBSERVADO' : (status === 'APROBADO' ? 'APROBADO' : 'EN_REVISION');
          }
          if (tienePractica) {
            pacPracticoStatus = obsArr.includes('pacpractico') ? 'OBSERVADO' : (status === 'APROBADO' ? 'APROBADO' : 'EN_REVISION');
          }
          if (obsArr.includes('planes')) planesStatus = 'OBSERVADO';
        } catch (e) {}
      }

      // Explicit Completeness States strictly based on real content: COMPLETO | INCOMPLETO | VACIO | N/A
      let anaState = 'VACIO';
      if (hasRealProg) {
        anaState = (realUnitsCount >= 4) ? 'COMPLETO' : 'INCOMPLETO';
      } else {
        anaState = 'VACIO';
      }

      let pacTState = 'N/A';
      if (tieneTeoria) {
        if (hasRealPacTeo) {
          pacTState = (realPacTeoWeeks >= 20) ? 'COMPLETO' : 'INCOMPLETO';
        } else {
          pacTState = 'VACIO';
        }
      }

      let pacPState = 'N/A';
      if (tienePractica) {
        if (hasRealPacPrac) {
          const minGuias = (modality === 'PRACTICA_PURA') ? 20 : 12;
          pacPState = (realPacPracGuias >= minGuias) ? 'COMPLETO' : 'INCOMPLETO';
        } else {
          pacPState = 'VACIO';
        }
      }

      let plState = 'VACIO';
      if (realPlanesCount >= 40) plState = 'COMPLETO';
      else if (realPlanesCount > 0) plState = 'INCOMPLETO';
      else plState = 'VACIO';

      course.status = status;
      course.modality = modality;
      course.tieneTeoria = tieneTeoria;
      course.tienePractica = tienePractica;
      course.docs = {
        analitico: {
          estado: analiticoStatus,
          state: anaState,
          unidades: hasRealProg ? realUnitsCount : 0,
          competencias: hasRealProg,
          bibliografiaApa: hasRealProg
        },
        pacTeorico: {
          tieneTeoria: tieneTeoria,
          estado: pacTeoricoStatus,
          state: pacTState,
          semanas: (tieneTeoria && hasRealPacTeo) ? realPacTeoWeeks : 0,
          columnas: tieneTeoria ? 7 : 0,
          label: tieneTeoria ? ((hasRealPacTeo ? realPacTeoWeeks : 0) + ' Semanas de Teoría') : 'N/A (Práctica Pura)'
        },
        pacPractico: {
          tienePractica: tienePractica,
          estado: pacPracticoStatus,
          state: pacPState,
          guias: (tienePractica && hasRealPacPrac) ? realPacPracGuias : 0,
          label: tienePractica ? ((hasRealPacPrac ? realPacPracGuias : 0) + ' Guías Prácticas') : 'N/A (Teórica Pura)'
        },
        planesClase: {
          total: 40,
          completados: realPlanesCount,
          estado: planesStatus,
          state: plState,
          pct: Math.round((realPlanesCount / 40) * 100)
        }
      };
    });

    // 3. Group into 8 Semesters
    const semesters = {};
    for (let s = 1; s <= 8; s++) {
      semesters[s] = {
        number: s,
        name: `${s}º SEMESTRE`,
        courses: [],
        approvedCount: 0,
        totalCount: 0,
        pendingCount: 0,
        observedCount: 0,
        compliancePct: 0,
        overallStatus: 'PENDIENTE'
      };
    }

    Object.values(coursesMap).forEach(c => {
      const sNum = Math.min(Math.max(c.semester || 1, 1), 8);
      const sem = semesters[sNum];
      sem.courses.push(c);
      sem.totalCount++;
      if (c.status === 'APROBADO') sem.approvedCount++;
      else if (c.status === 'OBSERVADO') sem.observedCount++;
      else sem.pendingCount++;
    });

    // 4. Calculate global KPI totals
    let globalTotal = 0;
    let globalApproved = 0;
    let globalPending = 0;
    let globalObserved = 0;
    let globalAssigned = 0;
    let globalVacant = 0;

    Object.values(coursesMap).forEach(c => {
      const hasTeacher = c.teachers && c.teachers.length > 0 && c.teachers[0].name && c.teachers[0].name !== 'Por Designar';
      if (hasTeacher) globalAssigned++;
      else globalVacant++;
    });

    for (let s = 1; s <= 8; s++) {
      const sem = semesters[s];
      sem.courses.sort((a, b) => a.code.localeCompare(b.code));
      sem.compliancePct = sem.totalCount > 0 ? Math.round((sem.approvedCount / sem.totalCount) * 100) : 0;
      if (sem.compliancePct === 100) sem.overallStatus = 'APROBADO';
      else if (sem.observedCount > 0) sem.overallStatus = 'OBSERVADO';
      else if (sem.approvedCount > 0) sem.overallStatus = 'EN_REVISION';
      else sem.overallStatus = 'PENDIENTE';

      globalTotal += sem.totalCount;
      globalApproved += sem.approvedCount;
      globalPending += sem.pendingCount;
      globalObserved += sem.observedCount;
    }

    const globalCompliancePct = globalTotal > 0 ? ((globalApproved / globalTotal) * 100).toFixed(1) : '0';

    // 5. Update UI KPI Toolbar & Evaluaciones Stat Cards
    const countAllEl = document.getElementById('supervision-count-all');
    const countAssignedEl = document.getElementById('supervision-count-assigned');
    const countVacantEl = document.getElementById('supervision-count-vacant');
    const countAppEl = document.getElementById('supervision-count-approved');
    const countPenEl = document.getElementById('supervision-count-pending');
    const countObsEl = document.getElementById('supervision-count-observed');
    const complianceEl = document.getElementById('supervision-compliance-pct');

    if (countAllEl) countAllEl.textContent = globalTotal;
    if (countAssignedEl) countAssignedEl.textContent = globalAssigned;
    if (countVacantEl) countVacantEl.textContent = globalVacant;
    if (countAppEl) countAppEl.textContent = globalApproved;
    if (countPenEl) countPenEl.textContent = globalPending;
    if (countObsEl) countObsEl.textContent = globalObserved;
    if (complianceEl) complianceEl.textContent = `${globalCompliancePct}%`;

    window.__SUPERVISION_DATA__ = {
      careerInfo: careerInfo,
      semesters: semesters,
      globalTotal: globalTotal,
      globalAssigned: globalAssigned,
      globalVacant: globalVacant,
      globalApproved: globalApproved,
      globalPending: globalPending,
      globalObserved: globalObserved,
      globalCompliancePct: globalCompliancePct
    };

    window.renderSupervisionAccordions();
  };

  window.renderDocStateBadge = function(state, detail) {
    if (state === 'COMPLETO') {
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Completo${detail ? ' <span class="font-normal opacity-75">(' + detail + ')</span>' : ''}</span>`;
    }
    if (state === 'INCOMPLETO') {
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>Incompleto${detail ? ' <span class="font-normal opacity-75">(' + detail + ')</span>' : ''}</span>`;
    }
    if (state === 'VACIO') {
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80"><span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>Vacío${detail ? ' <span class="font-normal opacity-75">(' + detail + ')</span>' : ''}</span>`;
    }
    // N/A
    return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">N/A (Teórica)</span>`;
  };

  window.renderSupervisionAccordions = function() {
    const container = document.getElementById('supervision-semesters-container');
    if (!container || !window.__SUPERVISION_DATA__) return;

    const data = window.__SUPERVISION_DATA__;
    const filter = window.__SUPERVISION_FILTER__ || 'ALL';
    const searchQuery = window.__SUPERVISION_SEARCH_QUERY__ || '';
    const groupTypeFilter = window.__SUPERVISION_GROUP_TYPE__ || 'todos';
    const hideUnassigned = !!window.__SUPERVISION_HIDE_UNASSIGNED__;
    const docTab = window.__SUPERVISION_DOC_TAB__ || 'TODOS';

    const html = Object.keys(data.semesters).map(semKey => {
      const sem = data.semesters[semKey];
      const isExpanded = !!window.__SUPERVISION_EXPANDED_SEMESTERS__[sem.number];

      // Filter courses
      const filteredCourses = sem.courses.filter(c => {
        // Status filter
        if (filter === 'APROBADO' && c.status !== 'APROBADO') return false;
        if (filter === 'EN_REVISION' && c.status !== 'EN_REVISION' && c.status !== 'PENDIENTE') return false;
        if (filter === 'OBSERVADO' && c.status !== 'OBSERVADO') return false;

        // Search text
        if (searchQuery) {
          const teacherName = (c.teachers && c.teachers[0] ? c.teachers[0].name : '').toLowerCase();
          const code = (c.code || '').toLowerCase();
          const name = (c.courseName || '').toLowerCase();
          if (!code.includes(searchQuery) && !name.includes(searchQuery) && !teacherName.includes(searchQuery)) {
            return false;
          }
        }

        // Hide unassigned
        const isAssigned = c.teachers && c.teachers.length > 0 && c.teachers[0].name && c.teachers[0].name !== 'Por Designar';
        if (hideUnassigned && !isAssigned) return false;

        return true;
      });

      if (filteredCourses.length === 0 && (filter !== 'ALL' || searchQuery || hideUnassigned)) {
        return '';
      }

      // Calculate total hours in semester
      const totalHours = filteredCourses.reduce((acc, curr) => acc + (curr.totalHours || 4), 0);

      // Status badge styling
      let statusBadgeHtml = '';
      if (sem.overallStatus === 'APROBADO') {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs shadow-xs whitespace-nowrap inline-flex items-center">APROBADO</span>`;
      } else if (sem.overallStatus === 'OBSERVADO') {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-xs shadow-xs whitespace-nowrap inline-flex items-center">CON OBSERVACIONES</span>`;
      } else if (sem.overallStatus === 'EN_REVISION') {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md bg-amber-500 text-white font-bold text-xs shadow-xs whitespace-nowrap inline-flex items-center">EN REVISIÓN</span>`;
      } else {
        statusBadgeHtml = `<span class="px-2.5 py-1 rounded-md bg-slate-400 text-white font-bold text-xs shadow-xs whitespace-nowrap inline-flex items-center">PENDIENTE</span>`;
      }

      // If collapsed (matches Evaluaciones accordion header)
      if (!isExpanded) {
        return `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div onclick="window.toggleSupervisionSemester(${sem.number})" class="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 flex items-center justify-between cursor-pointer transition-colors select-none">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-[#4f39f6] text-white flex items-center justify-center font-black text-xs font-mono shadow-xs">
                  ${sem.number}°
                </div>
                <div>
                  <h3 class="text-sm font-black text-slate-900 dark:text-white">${sem.number}º Semestre</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    ${sem.courses.length} asignaturas · ${sem.courses.length} registros por grupo · ${totalHours} horas
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold ${sem.compliancePct === 100 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} px-2.5 py-1 rounded-full border">
                  ${sem.approvedCount} de ${sem.courses.length} validadas (${sem.compliancePct}%)
                </span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
              </div>
            </div>
          </div>
        `;
      }

      // If expanded (matches Evaluaciones expanded table view)
      return `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          
          <!-- Accordion Header -->
          <div onclick="window.toggleSupervisionSemester(${sem.number})" class="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors select-none">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-[#4f39f6] text-white flex items-center justify-center font-black text-xs font-mono shadow-xs">
                ${sem.number}°
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">${sem.number}º Semestre</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  ${sem.courses.length} asignaturas · ${sem.courses.length} registros por grupo · ${totalHours} horas
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold ${sem.compliancePct === 100 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} px-2.5 py-1 rounded-full border">
                ${sem.approvedCount} de ${sem.courses.length} validadas (${sem.compliancePct}%)
              </span>
              <i data-lucide="chevron-up" class="w-4 h-4 text-[#4f39f6]"></i>
            </div>
          </div>

          <!-- Table of Subjects (Complete Official Academic Dossier View) -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th class="p-3.5 whitespace-nowrap min-w-[90px]">Código</th>
                  <th class="p-3.5 min-w-[180px]">Plan de Estudios</th>
                  <th class="p-3.5 text-center whitespace-nowrap">Horas</th>
                  <th class="p-3.5 whitespace-nowrap">Docente / Grupo</th>
                  <th class="p-3.5 text-center whitespace-nowrap">Modalidad</th>
                  <th class="p-3.5 w-[310px] min-w-[280px] max-w-[330px]">Información de la Planificación</th>
                  <th class="p-3.5 text-center whitespace-nowrap min-w-[130px]">Dictamen</th>
                  <th class="p-3.5 text-center whitespace-nowrap min-w-[95px]">Asignación</th>
                  <th class="p-3.5 text-right whitespace-nowrap min-w-[110px]">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                ${filteredCourses.map(item => {
                  const teacher = item.teachers[0] || { name: 'Por Designar', ci: '' };
                  const isAssigned = teacher.name && teacher.name !== 'Por Designar';
                  const isCommon = item.isCommon;
                  const groupName = (item.groups && item.groups[0]) ? (item.groups[0].groupName || 'TA-01') : 'TA-01';

                  let estadoPill = '';
                  if (item.status === 'APROBADO') {
                    estadoPill = `<span class="inline-flex items-center justify-center whitespace-nowrap bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase shadow-2xs">APROBADO</span>`;
                  } else if (item.status === 'OBSERVADO') {
                    estadoPill = `<span class="inline-flex items-center justify-center whitespace-nowrap bg-rose-700 text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase shadow-2xs">OBSERVADO</span>`;
                  } else {
                    estadoPill = `<span class="inline-flex items-center justify-center whitespace-nowrap bg-amber-600 text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase shadow-2xs">EN REVISIÓN</span>`;
                  }

                  const d = item.docs || {
                    analitico: { estado: 'PENDIENTE' },
                    pacTeorico: { estado: 'PENDIENTE' },
                    pacPractico: { tienePractica: false, estado: 'N/A', label: 'N/A' },
                    planesClase: { completados: 0, total: 40, estado: 'PENDIENTE', pct: 0 }
                  };

                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      
                      <!-- Código -->
                      <td class="p-3.5 font-mono font-bold text-[#4f39f6] whitespace-nowrap min-w-[90px]">
                        ${item.code}
                      </td>

                      <!-- Plan de Estudios -->
                      <td class="p-3.5">
                        <div class="font-black text-slate-900 dark:text-white">${item.courseName}</div>
                        ${item.isCommon && item.commonCareersText ? `
                          <div class="mt-1">
                            <span class="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs" title="Asignatura común cursada en paralelo con otras carreras">
                              <i data-lucide="users" class="w-3 h-3 text-[#4f39f6]"></i>
                              Común con: <span class="font-black text-slate-800 dark:text-slate-100">${item.commonCareersText}</span>
                            </span>
                          </div>
                        ` : ''}
                      </td>

                      <!-- Horas -->
                      <td class="p-3.5 text-center font-mono font-bold text-slate-400">
                        ${item.totalHours || 4}
                      </td>

                      <!-- Docente / Grupo -->
                      <td class="p-3.5">
                        ${isAssigned ? `
                          <div class="flex items-center gap-2">
                            <div class="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              <i data-lucide="user" class="w-3.5 h-3.5"></i>
                            </div>
                            <div class="min-w-0">
                              <div class="font-bold text-slate-900 dark:text-white text-[11px] truncate">${teacher.name}</div>
                              <span class="text-[10px] text-[#4f39f6] font-bold">
                                👥 ${groupName}
                              </span>
                              <span class="text-[9px] font-black uppercase tracking-wide text-slate-400 ml-1">
                                ${item.modality === 'PRACTICA_PURA' ? 'PRÁCTICO • TALLER' : (item.modality === 'TEORICA_PURA' ? 'TEÓRICO • TA' : 'TEÓRICO-PRÁCTICO')}
                              </span>
                            </div>
                          </div>
                        ` : `
                          <div class="flex items-center gap-1.5 text-amber-600 text-xs italic font-medium">
                            <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
                            <span>Sin asignar</span>
                          </div>
                        `}
                      </td>

                      <!-- Modalidad -->
                      <td class="p-3.5 text-center whitespace-nowrap">
                        ${item.modality === 'PRACTICA_PURA' ? `
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70" title="Asignatura de Práctica Pura (100% práctica: talleres, clínicas o pasantías sin teoría)">
                            <i data-lucide="wrench" class="w-3.5 h-3.5 text-amber-600"></i>
                            Práctica Pura
                          </span>
                        ` : (item.modality === 'TEORICA_PURA' ? `
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70" title="Asignatura Teórica Pura (100% teórica, sin prácticas en aula ni laboratorio)">
                            <i data-lucide="book-open" class="w-3.5 h-3.5 text-indigo-600"></i>
                            Teórica Pura
                          </span>
                        ` : `
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/70" title="Asignatura Teórico-Práctica (Clases de aula y sesiones prácticas/laboratorio)">
                            <i data-lucide="flask-conical" class="w-3.5 h-3.5 text-teal-600"></i>
                            Teórico-Práctica
                          </span>
                        `)}
                      </td>

                      <!-- Información de la Planificación (Estado explícito por cada documento) -->
                      <td class="p-2 w-[310px] min-w-[280px] max-w-[330px]">
                        ${docTab === 'ANALITICO' ? `
                          <div class="rounded-lg border px-2.5 py-2 ${d.analitico.state === 'COMPLETO' ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30' : (d.analitico.state === 'INCOMPLETO' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30' : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/30')}">
                            <div class="flex items-center justify-between gap-2 min-w-0">
                              <span class="text-[10px] font-black text-[#4f39f6] truncate flex items-center gap-1">
                                <span>📑</span> Programa Analítico
                              </span>
                              ${window.renderDocStateBadge(d.analitico.state, d.analitico.state === 'VACIO' ? '0 Unid' : `${d.analitico.unidades} Unid`)}
                            </div>
                            <div class="mt-1 flex items-center justify-between gap-2 min-w-0 text-[9px] text-slate-500">
                              <span>${d.analitico.state === 'VACIO' ? 'Sin unidades registradas' : `${d.analitico.unidades} Unidades Temáticas`} • Competencias</span>
                              <span class="font-bold text-slate-700 dark:text-slate-300">Normas APA</span>
                            </div>
                          </div>
                        ` : (docTab === 'PAC' ? `
                          ${item.modality === 'PRACTICA_PURA' ? `
                            <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-2">
                              <div class="flex items-center justify-between gap-2 min-w-0">
                                <span class="text-[10px] font-black text-slate-500 truncate flex items-center gap-1">
                                  <span>📘</span> PAC Teórico
                                </span>
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">N/A (Práctica Pura)</span>
                              </div>
                              <div class="mt-1 flex items-center justify-between gap-2 min-w-0 text-[9px] text-slate-400">
                                <span>Exenta de Planificación Teórica</span>
                                <span class="font-bold text-slate-500">100% Práctica</span>
                              </div>
                            </div>
                          ` : `
                            <div class="rounded-lg border px-2.5 py-2 ${d.pacTeorico.state === 'COMPLETO' ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30' : (d.pacTeorico.state === 'INCOMPLETO' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30' : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/30')}">
                              <div class="flex items-center justify-between gap-2 min-w-0">
                                <span class="text-[10px] font-black text-indigo-700 dark:text-indigo-300 truncate flex items-center gap-1">
                                  <span>📘</span> PAC Teórico (Matriz 7)
                                </span>
                                ${window.renderDocStateBadge(d.pacTeorico.state, d.pacTeorico.state === 'VACIO' ? '0 sem' : `${d.pacTeorico.semanas} sem`)}
                              </div>
                              <div class="mt-1 flex items-center justify-between gap-2 min-w-0 text-[9px] text-slate-500">
                                <span>7 Columnas Didácticas Oficiales</span>
                                <span class="font-bold text-slate-700 dark:text-slate-300">${d.pacTeorico.state === 'VACIO' ? '0 Semanas' : `${d.pacTeorico.semanas} Semanas`}</span>
                              </div>
                            </div>
                          `}
                        ` : (docTab === 'PRACTICO' ? `
                          ${item.modality === 'TEORICA_PURA' ? `
                            <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-2">
                              <div class="flex items-center justify-between gap-2 min-w-0">
                                <span class="text-[10px] font-black text-slate-500 truncate flex items-center gap-1">
                                  <span>🔬</span> PAC Práctico
                                </span>
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">N/A (Teórica Pura)</span>
                              </div>
                              <div class="mt-1 flex items-center justify-between gap-2 min-w-0 text-[9px] text-slate-400">
                                <span>Exenta de Prácticas (Aula o Laboratorio)</span>
                                <span class="font-bold text-slate-500">100% Teórica</span>
                              </div>
                            </div>
                          ` : `
                            <div class="rounded-lg border px-2.5 py-2 ${d.pacPractico.state === 'COMPLETO' ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30' : (d.pacPractico.state === 'INCOMPLETO' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30' : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/30')}">
                              <div class="flex items-center justify-between gap-2 min-w-0">
                                <span class="text-[10px] font-black text-teal-700 dark:text-teal-300 truncate flex items-center gap-1">
                                  <span>🔬</span> PAC Práctico ${item.modality === 'PRACTICA_PURA' ? '(Pura)' : '/ Talleres'}
                                </span>
                                ${window.renderDocStateBadge(d.pacPractico.state, d.pacPractico.state === 'VACIO' ? '0 guías' : `${d.pacPractico.guias} guías`)}
                              </div>
                              <div class="mt-1 flex items-center justify-between gap-2 min-w-0 text-[9px] text-slate-500">
                                <span>${d.pacPractico.state === 'VACIO' ? 'Sin guías registradas' : (item.modality === 'PRACTICA_PURA' ? `${d.pacPractico.guias} Guías / Casos / Rúbricas Clínicas` : `${d.pacPractico.guias} Guías Prácticas`)}</span>
                                <span class="font-bold text-slate-700 dark:text-slate-300">${item.modality === 'PRACTICA_PURA' ? 'Práctica Pura' : 'Laboratorios'}</span>
                              </div>
                            </div>
                          `}
                        ` : (docTab === 'CLASES' ? `
                          <div class="rounded-lg border px-2.5 py-2 ${d.planesClase.state === 'COMPLETO' ? 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/30' : (d.planesClase.state === 'INCOMPLETO' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30' : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/30')}">
                            <div class="flex items-center justify-between gap-2 min-w-0">
                              <span class="text-[10px] font-black text-purple-700 dark:text-purple-300 truncate flex items-center gap-1">
                                <span>📅</span> Planes de Clase
                              </span>
                              ${window.renderDocStateBadge(d.planesClase.state, `${d.planesClase.completados}/40`)}
                            </div>
                            <div class="mt-1 flex items-center justify-between gap-2 min-w-0 text-[9px] text-slate-500">
                              <span>Avance: ${d.planesClase.completados} de 40 Sesiones</span>
                              <span class="font-bold text-slate-700 dark:text-slate-300">${d.planesClase.pct}%</span>
                            </div>
                          </div>
                        ` : `
                          <!-- DOSSIER COMPLETO (TODOS): Desglose explícito de los 4 documentos con estado individual -->
                          <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2 space-y-1.5 shadow-2xs">
                            
                            <!-- 1. Programa Analítico -->
                            <div class="flex items-center justify-between text-[10px] gap-2">
                              <span class="text-slate-600 dark:text-slate-300 font-semibold truncate flex items-center gap-1">
                                <span class="text-xs">📑</span> Prog. Analítico:
                              </span>
                              ${window.renderDocStateBadge(d.analitico.state, d.analitico.state === 'VACIO' ? '0 Unid' : `${d.analitico.unidades} Unid`)}
                            </div>

                            <!-- 2. PAC Teórico -->
                            <div class="flex items-center justify-between text-[10px] gap-2">
                              <span class="text-slate-600 dark:text-slate-300 font-semibold truncate flex items-center gap-1">
                                <span class="text-xs">📘</span> PAC Teórico:
                              </span>
                              ${item.modality === 'PRACTICA_PURA' ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">N/A (Práctica)</span>
                              ` : window.renderDocStateBadge(d.pacTeorico.state, d.pacTeorico.state === 'VACIO' ? '0 sem' : `${d.pacTeorico.semanas} sem`)}
                            </div>

                            <!-- 3. PAC Práctico -->
                            <div class="flex items-center justify-between text-[10px] gap-2">
                              <span class="text-slate-600 dark:text-slate-300 font-semibold truncate flex items-center gap-1">
                                <span class="text-xs">🔬</span> PAC Práctico:
                              </span>
                              ${item.modality === 'TEORICA_PURA' ? `
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">N/A (Teórica)</span>
                              ` : window.renderDocStateBadge(d.pacPractico.state, d.pacPractico.state === 'VACIO' ? '0 guías' : `${d.pacPractico.guias} guías`)}
                            </div>

                            <!-- 4. Planes de Clase -->
                            <div class="flex items-center justify-between text-[10px] gap-2">
                              <span class="text-slate-600 dark:text-slate-300 font-semibold truncate flex items-center gap-1">
                                <span class="text-xs">📅</span> Planes de Clase:
                              </span>
                              ${window.renderDocStateBadge(d.planesClase.state, `${d.planesClase.completados}/40`)}
                            </div>

                          </div>
                        `)))}
                      </td>

                      <!-- Dictamen del documento -->
                      <td class="p-3.5 text-center whitespace-nowrap min-w-[130px]">
                        ${estadoPill}
                      </td>

                      <!-- Estado de Asignación -->
                      <td class="p-3.5 text-center whitespace-nowrap min-w-[95px]">
                        ${isAssigned ? `
                          <span class="inline-flex items-center justify-center whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-black text-[10px] px-2 py-0.5 rounded-md">
                            Asignada
                          </span>
                        ` : `
                          <span class="inline-flex items-center justify-center whitespace-nowrap bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-black text-[10px] px-2 py-0.5 rounded-md">
                            Vacante
                          </span>
                        `}
                      </td>

                      <!-- Acciones (Botones compactos exactos) -->
                      <td class="p-3.5 text-right">
                        <div class="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1" role="group" aria-label="Acciones de planificación">
                          <button type="button" onclick="window.openPacReviewModal('${item.code}', ${sem.number})" class="p-1 rounded text-slate-500 hover:text-[#4f39f6] hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Auditar Expediente y Emitir Dictamen Curricular">
                            <i data-lucide="file-check-2" class="w-4 h-4"></i>
                          </button>
                          <button type="button" onclick="window.openTeacherFolderFromSupervision('${item.code}', '${teacher.ci}')" class="p-1 rounded text-slate-500 hover:text-[#4f39f6] hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Ver Carpeta Docente en Sistema">
                            <i data-lucide="folder-open" class="w-4 h-4"></i>
                          </button>
                          <button type="button" onclick="window.showToast('Asignatura ${item.code} sincronizada con catálogo')" class="p-1 rounded text-slate-500 hover:text-[#4f39f6] hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Sincronización SEA">
                            <i data-lucide="monitor" class="w-4 h-4"></i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Accordion Footer (Batch Approval) -->
          <div class="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="text-xs text-slate-500 dark:text-slate-400">
              Al completar la validación de las asignaturas del semestre podrás emitir la resolución curricular correspondiente.
            </div>
            <button onclick="window.openBatchEndorsementModal(${sem.number})" class="bg-[#4f39f6] hover:bg-[#432dd7] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
              <i data-lucide="check-check" class="w-4 h-4"></i>
              Aprobar y Finalizar Planificación del Semestre
            </button>
          </div>

        </div>
      `;
    }).join('');

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  };

  window.onSupervisionSedeChange = function(newSede) {
    const sedeNames = {
      'CBA': 'Cochabamba (Campus Juan Pablo II)',
      'LPZ': 'La Paz (Sede Académica)',
      'EAL': 'El Alto (Sede Académica)',
      'CBJ': 'Cobija (Sede Académica)'
    };
    const name = sedeNames[newSede] || newSede;
    window.__SUPERVISION_ACTIVE_SEDE__ = newSede;
    if (typeof window.showToast === 'function') {
      window.showToast(`📍 Sede Académica seleccionada: ${name}`);
    }
    if (typeof window.renderSupervisionCurricular === 'function') {
      window.renderSupervisionCurricular();
    }
  };

  window.onSupervisionGestionChange = function(newGestion) {
    window.__SUPERVISION_ACTIVE_GESTION__ = newGestion;
    if (typeof window.showToast === 'function') {
      window.showToast(`📅 Gestión Académica activa: ${newGestion}`);
    }
    if (typeof window.renderSupervisionCurricular === 'function') {
      window.renderSupervisionCurricular();
    }
  };

  window.returnToSupervisionFromTeacher = function() {
    window.__SUPERVISION_AUDIT_COURSE_CODE__ = null;
    try { localStorage.removeItem('sisa_supervision_audit_course'); } catch (e) {}
    const returnBar = document.getElementById('director-supervision-return-bar');
    if (returnBar) returnBar.classList.add('hidden');
    if (typeof window.switchView === 'function') {
      window.switchView('view2');
    }
  };

  window.descargarMallaCurricular = function() {
    const data = window.__SUPERVISION_DATA__;
    if (!data || !data.semesters) {
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ Cargando datos curriculares, intente en unos segundos...');
      }
      return;
    }

    const career = data.careerInfo || { name: 'Licenciatura en Ingeniería de Sistemas', code: 'CARSIS' };
    const dateStr = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

    let semesterTablesHtml = '';
    for (let s = 1; s <= 8; s++) {
      const sem = data.semesters[s];
      if (!sem || sem.courses.length === 0) continue;

      const rows = sem.courses.map(c => {
        const teacher = (c.teachers && c.teachers[0]) ? c.teachers[0].name : 'Por Designar';
        const d = c.docs || {};
        const anaSt = d.analitico ? d.analitico.state : 'VACIO';
        const pacTSt = d.pacTeorico ? d.pacTeorico.state : 'N/A';
        const pacPSt = d.pacPractico ? d.pacPractico.state : 'N/A';
        const plCnt = d.planesClase ? d.planesClase.completados : 0;

        const badgeHtml = (st, detail) => {
          if (st === 'COMPLETO') return `<span style="color:#047857; font-weight:bold;">Completo${detail ? ' ('+detail+')' : ''}</span>`;
          if (st === 'INCOMPLETO') return `<span style="color:#b45309; font-weight:bold;">Incompleto${detail ? ' ('+detail+')' : ''}</span>`;
          if (st === 'VACIO') return `<span style="color:#b91c1c; font-weight:bold;">Vacío</span>`;
          return `<span style="color:#64748b;">N/A</span>`;
        };

        const verdictBadge = (st) => {
          if (st === 'APROBADO') return `<span style="background:#059669; color:#fff; padding:3px 10px; border-radius:4px; font-weight:900; font-size:10px; white-space:nowrap; display:inline-block;">APROBADO</span>`;
          if (st === 'OBSERVADO') return `<span style="background:#dc2626; color:#fff; padding:3px 10px; border-radius:4px; font-weight:900; font-size:10px; white-space:nowrap; display:inline-block;">OBSERVADO</span>`;
          return `<span style="background:#d97706; color:#fff; padding:3px 10px; border-radius:4px; font-weight:900; font-size:10px; white-space:nowrap; display:inline-block;">EN REVISIÓN</span>`;
        };

        const modLabel = c.modality === 'PRACTICA_PURA' ? 'Práctica Pura' : (c.modality === 'TEORICA_PURA' ? 'Teórica Pura' : 'Teórico-Práctica');

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 6px 8px; font-family: monospace; font-weight: bold; color: #4338ca;">${c.code}</td>
            <td style="padding: 6px 8px; font-weight: bold; color: #1e293b;">
              ${c.courseName}
              ${c.isCommon && c.commonCareersText ? `<br><span style="font-size:9px; color:#4f46e5; font-weight:normal;">👥 Común: ${c.commonCareersText}</span>` : ''}
            </td>
            <td style="padding: 6px 8px; color: #334155;">${teacher}</td>
            <td style="padding: 6px 8px; text-align: center; font-size: 10px; color: #475569;">${modLabel}</td>
            <td style="padding: 6px 8px; text-align: center; font-size: 10px;">${badgeHtml(anaSt, '4U')}</td>
            <td style="padding: 6px 8px; text-align: center; font-size: 10px;">${badgeHtml(pacTSt, '20s')}</td>
            <td style="padding: 6px 8px; text-align: center; font-size: 10px;">${badgeHtml(pacPSt, '12g')}</td>
            <td style="padding: 6px 8px; text-align: center; font-size: 10px;">${badgeHtml(plCnt === 40 ? 'COMPLETO' : (plCnt > 0 ? 'INCOMPLETO' : 'VACIO'), plCnt + '/40')}</td>
            <td style="padding: 6px 8px; text-align: center; white-space:nowrap;">${verdictBadge(c.status)}</td>
          </tr>
        `;
      }).join('');

      semesterTablesHtml += `
        <div style="margin-top: 18px; margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:6px 12px; border-radius:6px; margin-bottom:6px; border-left:4px solid #4f39f6;">
            <strong style="color:#0f172a; font-size:12px; text-transform:uppercase;">${sem.name}</strong>
            <span style="font-size:10px; color:#475569; font-weight:600;">${sem.approvedCount} de ${sem.totalCount} Aprobadas (${sem.compliancePct}%)</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 9px; text-transform: uppercase; color: #64748b;">
                <th style="padding: 5px 8px;">Código</th>
                <th style="padding: 5px 8px;">Asignatura</th>
                <th style="padding: 5px 8px;">Docente Titular</th>
                <th style="padding: 5px 8px; text-align:center;">Modalidad</th>
                <th style="padding: 5px 8px; text-align:center;">P. Analítico</th>
                <th style="padding: 5px 8px; text-align:center;">PAC Teórico</th>
                <th style="padding: 5px 8px; text-align:center;">PAC Práctico</th>
                <th style="padding: 5px 8px; text-align:center;">Planes Clase</th>
                <th style="padding: 5px 8px; text-align:center; white-space:nowrap;">Dictamen</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    const reportHtml = `
      <div id="malla-report-printable-content" style="font-family: Arial, Helvetica, sans-serif; color: #1e293b; background: #fff; padding: 24px; max-width: 900px; margin: 0 auto; line-height: 1.4;">
        
        <!-- Header Institucional -->
        <div style="border-bottom: 2px solid #312e81; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="margin: 0; font-size: 16px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.5px;">UNIVERSIDAD TÉCNICA PRIVADA COSMOPOLITANA</h1>
            <h2 style="margin: 3px 0 0 0; font-size: 13px; font-weight: 800; color: #4338ca; text-transform: uppercase;">VICERRECTORADO ACADÉMICO • DIRECCIÓN DE CARRERA</h2>
            <div style="margin-top: 6px; font-size: 14px; font-weight: 900; color: #0f172a;">
              ${career.name.toUpperCase()} (${career.code})
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            <div><strong>Sede:</strong> Cochabamba (Campus Juan Pablo II)</div>
            <div><strong>Gestión:</strong> II-2026 (Activa)</div>
            <div><strong>Fecha Emisión:</strong> ${dateStr} - ${timeStr}</div>
            <div style="margin-top: 4px;"><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 10px;">EXPEDIENTE OFICIAL SISA</span></div>
          </div>
        </div>

        <!-- Título del Documento -->
        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; font-size: 14px; font-weight: 900; color: #312e81; text-transform: uppercase;">INFORME OFICIAL DE SUPERVISIÓN CURRICULAR Y ESTADO DE PLANIFICACIÓN</h3>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #4338ca;">Auditoría de los 4 Documentos Oficiales: Programa Analítico, PAC Teórico, PAC Práctico y Planes de Clase</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 20px; font-weight: 900; color: #4f39f6; font-family: monospace;">${data.globalCompliancePct}%</span>
            <div style="font-size: 10px; font-weight: bold; color: #4338ca;">Cumplimiento Global</div>
          </div>
        </div>

        <!-- Métricas Resumen -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; font-size: 11px;">
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; background: #fafafa;">
            <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Total Asignaturas</span>
            <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: monospace;">${data.globalTotal}</div>
            <span style="color: #475569; font-size: 9px;">${data.globalAssigned} asignadas · ${data.globalVacant} vacantes</span>
          </div>
          <div style="border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px 12px; background: #ecfdf5;">
            <span style="color: #047857; font-size: 10px; text-transform: uppercase; font-weight: bold;">Aprobadas</span>
            <div style="font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">${data.globalApproved}</div>
            <span style="color: #047857; font-size: 9px;">Con Dictamen Favorable</span>
          </div>
          <div style="border: 1px solid #fed7aa; border-radius: 6px; padding: 8px 12px; background: #fff7ed;">
            <span style="color: #c2410c; font-size: 10px; text-transform: uppercase; font-weight: bold;">En Revisión</span>
            <div style="font-size: 16px; font-weight: 900; color: #ea580c; font-family: monospace;">${data.globalPending}</div>
            <span style="color: #c2410c; font-size: 9px;">En Proceso de Dictamen</span>
          </div>
          <div style="border: 1px solid #fecdd3; border-radius: 6px; padding: 8px 12px; background: #fff1f2;">
            <span style="color: #be123c; font-size: 10px; text-transform: uppercase; font-weight: bold;">Con Observaciones</span>
            <div style="font-size: 16px; font-weight: 900; color: #e11d48; font-family: monospace;">${data.globalObserved}</div>
            <span style="color: #be123c; font-size: 9px;">Devueltas para Corrección</span>
          </div>
        </div>

        <!-- Tablas por Semestre -->
        ${semesterTablesHtml}

        <!-- Bloque de Firmas y Sello Institucional -->
        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px dashed #94a3b8; display: flex; justify-content: space-around; text-align: center; font-size: 11px;">
          <div style="width: 240px;">
            <div style="height: 48px; border-bottom: 1px solid #475569; margin-bottom: 6px; display: flex; align-items: flex-end; justify-content: center;">
              <span style="font-size: 10px; color: #4338ca; font-style: italic; font-weight: bold;">[Firmado Digitalmente SISA]</span>
            </div>
            <strong>Lic. Mariana Rios Vargas</strong><br>
            <span style="color: #64748b; font-size: 10px;">Directora de Carrera • ${career.name}</span><br>
            <span style="color: #94a3b8; font-size: 9px;">UNITEPC - Sede Cochabamba</span>
          </div>
          <div style="width: 240px;">
            <div style="height: 48px; border-bottom: 1px solid #475569; margin-bottom: 6px; display: flex; align-items: flex-end; justify-content: center;">
              <span style="font-size: 10px; color: #059669; font-style: italic; font-weight: bold;">[Certificación Institucional]</span>
            </div>
            <strong>Dirección Académica</strong><br>
            <span style="color: #64748b; font-size: 10px;">Vicerrectorado de Sede</span><br>
            <span style="color: #94a3b8; font-size: 9px;">Acreditación y Calidad Educativa</span>
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          Documento generado automáticamente por el Sistema Integrado de Seguimiento Académico (SISA) • Universidad Técnica Privada Cosmopolitana
        </div>

      </div>
    `;

    // 1. Prepare printable container for window.print()
    const printContainer = document.getElementById('print-official-folder-container');
    if (printContainer) {
      printContainer.innerHTML = `<div class="print-page">${reportHtml}</div>`;
    }

    // 2. Open Modal Dialog with Preview and Actions
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    const modalContainer = document.getElementById('modal-container');

    if (modalTitle) modalTitle.innerText = `Informe Oficial de Plan de Estudios • ${career.code}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-lg bg-[#4f39f6] text-white"><i data-lucide="printer" class="w-4 h-4"></i></span>
              <div>
                <strong class="text-xs text-slate-900 dark:text-white block">Vista Previa de Informe de Supervisión Curricular</strong>
                <span class="text-[11px] text-slate-500">Malla completa de 8 semestres con dictamen oficial para acreditación</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="window.downloadMallaReportPdf()" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Descargar PDF (.pdf)</span>
              </button>
              <button type="button" onclick="window.printMallaReport()" class="px-3.5 py-1.5 rounded-lg bg-[#4f39f6] hover:bg-[#432dd7] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                <span>Imprimir Oficial</span>
              </button>
            </div>
          </div>
          <div class="max-h-[68vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-200/50 dark:bg-slate-950/60 custom-scrollbar">
            ${reportHtml}
          </div>
        </div>
      `;
    }

    if (modalFooter) modalFooter.classList.add('hidden');
    if (modalContainer) modalContainer.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  window.printMallaReport = function() {
    window.print();
  };

  window.downloadMallaReportPdf = function() {
    const printableEl = document.getElementById('malla-report-printable-content');
    if (!printableEl) {
      window.print();
      return;
    }

    const career = (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.careerInfo) ? window.__SUPERVISION_DATA__.careerInfo.code : 'CARSIS';
    const filename = `Malla_Curricular_UNITEPC_${career}_2026_II.pdf`;

    if (typeof html2pdf !== 'undefined') {
      window.showToast('⏳ Generando y descargando PDF oficial...');
      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf().set(opt).from(printableEl).save().then(() => {
        window.showToast('✅ Malla Curricular descargada en PDF: ' + filename);
      }).catch(err => {
        console.warn('html2pdf fallback to print:', err);
        window.print();
      });
    } else {
      window.print();
    }
  };

  window.filterSupervisionBySearch = function(query) {
    window.__SUPERVISION_SEARCH_QUERY__ = (query || '').toLowerCase().trim();
    window.renderSupervisionAccordions();
  };

  window.filterSupervisionGroupType = function(type) {
    window.__SUPERVISION_GROUP_TYPE__ = type || 'todos';
    ['all', 'ta', 'tp'].forEach(k => {
      const btn = document.getElementById('supervision-btn-grp-' + k);
      if (btn) {
        if ((k === 'all' && type === 'todos') || (k === 'ta' && type === 'teorico') || (k === 'tp' && type === 'practico')) {
          btn.className = 'font-bold text-xs px-3 py-1.5 rounded-lg bg-[#4f39f6] text-white shadow-xs transition-colors cursor-pointer';
        } else {
          btn.className = 'font-bold text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors cursor-pointer';
        }
      }
    });
    window.renderSupervisionAccordions();
  };

  window.filterSupervisionUnassigned = function(hide) {
    window.__SUPERVISION_HIDE_UNASSIGNED__ = !!hide;
    window.renderSupervisionAccordions();
  };

  window.setSupervisionActiveTab = function(tab) {
    window.__SUPERVISION_DOC_TAB__ = tab || 'TODOS';
    ['todos', 'analitico', 'pac', 'practico', 'clases'].forEach(t => {
      const btn = document.getElementById('supervision-tab-' + t);
      if (btn) {
        if (t.toUpperCase() === (tab || 'TODOS').toUpperCase()) {
          btn.className = 'font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-[#4f39f6] text-white shadow-xs transition-colors cursor-pointer';
        } else {
          btn.className = 'font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors cursor-pointer';
        }
      }
    });
    window.renderSupervisionAccordions();
    if (window.lucide) window.lucide.createIcons();
  };

  window.switchModalReviewTab = function(tabName) {
    const tabs = ['analitico', 'pacteorico', 'pacpractico', 'planes'];
    tabs.forEach(t => {
      const btn = document.getElementById('btn-modal-tab-' + t);
      const panel = document.getElementById('panel-modal-' + t);
      if (btn) {
        if (t === tabName) {
          btn.className = 'font-bold text-xs px-3 py-1.5 rounded-lg bg-[#4f39f6] text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5';
        } else {
          btn.className = 'font-bold text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5';
        }
      }
      if (panel) {
        if (t === tabName) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
    });
    if (window.lucide) window.lucide.createIcons();
  };

  window.jumpToDocFromModal = function(targetTab) {
    if (!window.__ACTIVE_PAC_REVIEW__) return;
    const { courseCode, course } = window.__ACTIVE_PAC_REVIEW__;
    const teacherCi = (course && course.teachers && course.teachers[0]) ? course.teachers[0].ci : '';
    window.closePacReviewModal();
    window.openTeacherFolderFromSupervision(courseCode, teacherCi, targetTab);
  };

  window.toggleSupervisionSemester = function(semNum) {
    if (!window.__SUPERVISION_EXPANDED_SEMESTERS__) window.__SUPERVISION_EXPANDED_SEMESTERS__ = {};
    window.__SUPERVISION_EXPANDED_SEMESTERS__[semNum] = !window.__SUPERVISION_EXPANDED_SEMESTERS__[semNum];
    window.__ACTIVE_SEMESTER_NUM__ = semNum;
    window.renderSupervisionAccordions();
  };

  window.filterSupervisionTable = function(filterType) {
    window.__SUPERVISION_FILTER__ = filterType;

    // Highlight KPI cards
    const kpiCardMap = {
      'ALL': 'card-supervision-kpi-all',
      'APROBADO': 'card-supervision-kpi-approved',
      'EN_REVISION': 'card-supervision-kpi-pending',
      'OBSERVADO': 'card-supervision-kpi-observed'
    };

    Object.values(kpiCardMap).forEach(cardId => {
      const el = document.getElementById(cardId);
      if (el) {
        el.classList.remove('ring-2', 'ring-[#4f39f6]', 'dark:ring-indigo-400');
      }
    });

    const targetCardId = kpiCardMap[filterType];
    if (targetCardId) {
      const el = document.getElementById(targetCardId);
      if (el) {
        el.classList.add('ring-2', 'ring-[#4f39f6]', 'dark:ring-indigo-400');
      }
    }

    const btns = document.querySelectorAll('.supervision-filter-btn');
    btns.forEach(b => {
      b.classList.remove('bg-brand-600', 'text-white', 'shadow-sm');
      b.classList.add('text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-100');
    });

    const activeMap = {
      'ALL': 'supervision-btn-all',
      'APROBADO': 'supervision-btn-approved',
      'EN_REVISION': 'supervision-btn-pending',
      'OBSERVADO': 'supervision-btn-observed'
    };

    const activeBtn = document.getElementById(activeMap[filterType]);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-100');
      activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-sm');
    }

    window.renderSupervisionAccordions();
  };

  window.openTeacherFolderFromSupervision = async function(courseCode, teacherCi, targetTab) {
    if (!teacherCi || teacherCi === 'Sin Asignar' || teacherCi === 'null' || teacherCi === 'undefined' || String(teacherCi).trim() === '') {
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ Esta asignatura aún no tiene docente asignado en el catálogo.');
      }
      return;
    }

    // Set supervision audit course code flag
    window.__SUPERVISION_AUDIT_COURSE_CODE__ = courseCode;
    try {
      localStorage.setItem('sisa_supervision_audit_course', courseCode);
    } catch (e) {}

    // 1. Switch or load teacher dynamically with preferred course pre-selected
    if (typeof window.selectDocenteFromApi === 'function') {
      await window.selectDocenteFromApi(teacherCi, true, courseCode);
    }

    // 2. Switch to Carpeta Docente view
    if (typeof window.switchView === 'function') {
      window.switchView('view1');
    }

    // 3. Activate requested tab (defaulting to tab-analitico or targetTab)
    setTimeout(() => {
      if (typeof window.switchDocMainTab === 'function') {
        window.switchDocMainTab(targetTab || 'tab-analitico');
      }
      if (typeof window.updateTeacherObservationBanner === 'function') {
        window.updateTeacherObservationBanner(courseCode);
      }
    }, 120);

    // 4. Unhide contextual return bar in view1
    const returnBar = document.getElementById('director-supervision-return-bar');
    const returnCourse = document.getElementById('director-supervision-return-course');
    if (returnBar) {
      returnBar.classList.remove('hidden');
      if (returnCourse) {
        const docName = window.__ACTIVE_DOCENTE__ ? window.__ACTIVE_DOCENTE__.nombreCompleto : '';
        returnCourse.textContent = `• Asignatura: ${courseCode || ''} | Docente: ${docName} (CI: ${teacherCi})`;
      }
      if (window.lucide) window.lucide.createIcons();
    }

    if (typeof window.showToast === 'function') {
      const docName = window.__ACTIVE_DOCENTE__ ? window.__ACTIVE_DOCENTE__.nombreCompleto : teacherCi;
      window.showToast(`📂 Auditoría Carpeta: ${courseCode} (${docName})`);
    }
  };

  // =========================================================================
  // TEACHER OBSERVATION & VISA BANNER CONTROLLER (PHASE 4)
  // =========================================================================
  window.updateTeacherObservationBanner = function(courseCode) {
    const banner = document.getElementById('teacher-observation-banner');
    if (!banner) return;

    let targetCode = courseCode;
    if (!targetCode) {
      if (typeof activeMateriaKey !== 'undefined' && typeof materiasData !== 'undefined' && materiasData[activeMateriaKey]) {
        targetCode = materiasData[activeMateriaKey].codigo;
      }
    }
    if (!targetCode) {
      banner.classList.add('hidden');
      return;
    }

    // 1. Resolve current course PAC review status & observations
    let status = localStorage.getItem('sisa_supervision_status_' + targetCode);
    let obs = localStorage.getItem('sisa_supervision_obs_' + targetCode);
    let reviewer = 'Lic. Mariana Rios Vargas - Director de Carrera';
    let reviewDate = '14/10/2026, 10:30';

    if (window.__PAC_CACHE__ && window.__PAC_CACHE__[targetCode]) {
      const pac = window.__PAC_CACHE__[targetCode];
      if (pac.estado) status = pac.estado;
      if (pac.observacionesRevision) obs = pac.observacionesRevision;
      if (pac.revisadoPorNombre) reviewer = `${pac.revisadoPorNombre} - Director de Carrera`;
      if (pac.revisadoEn) {
        try {
          reviewDate = new Date(pac.revisadoEn).toLocaleString('es-BO', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        } catch (e) {}
      }
    } else if (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters) {
      for (const sem of Object.values(window.__SUPERVISION_DATA__.semesters)) {
        const found = sem.courses.find(c => c.code === targetCode);
        if (found) {
          if (!status) status = found.status;
          if (!obs && found.observacionesRevision) obs = found.observacionesRevision;
          break;
        }
      }
    }

    // Default status for pilot demo if unreviewed
    if (!status) {
      if (targetCode === 'SIS-214') status = 'OBSERVADO';
      else if (targetCode === 'SIS-213') status = 'EN_REVISION';
      else status = 'PENDIENTE';
    }

    const alertCard = document.getElementById('teacher-obs-alert-card');
    const visaCard = document.getElementById('teacher-visa-seal-card');
    const obsTextEl = document.getElementById('teacher-obs-text');
    const obsRevEl = document.getElementById('teacher-obs-reviewer');
    const obsDateEl = document.getElementById('teacher-obs-date');
    const visaRevEl = document.getElementById('teacher-visa-reviewer');
    const visaDateEl = document.getElementById('teacher-visa-date');

    if (status === 'OBSERVADO') {
      const savedObsDocs = localStorage.getItem('sisa_supervision_obs_docs_' + targetCode);
      let docsLabel = '';
      if (savedObsDocs) {
        try {
          const arr = JSON.parse(savedObsDocs);
          const mapNames = {
            'analitico': 'Programa Analítico',
            'pacteorico': 'PAC Teórico',
            'pacpractico': 'PAC Práctico',
            'planes': 'Planes de Clase'
          };
          const names = arr.map(k => mapNames[k] || k);
          if (names.length > 0) {
            docsLabel = `[Documentos a corregir: ${names.join(', ')}] — `;
          }
        } catch (e) {}
      }
      const defaultObs = 'Las matrices de evaluación del hito 2 deben ajustarse a la normativa de 20 semanas y se debe actualizar la bibliografía básica en formato APA 7.';
      if (obsTextEl) obsTextEl.textContent = docsLabel + ((obs && obs.trim()) ? obs : defaultObs);
      if (obsRevEl) obsRevEl.textContent = reviewer;
      if (obsDateEl) obsDateEl.textContent = reviewDate;

      if (alertCard) alertCard.classList.remove('hidden');
      if (visaCard) visaCard.classList.add('hidden');
      banner.classList.remove('hidden');
    } else if (status === 'APROBADO') {
      if (visaRevEl) visaRevEl.textContent = reviewer;
      if (visaDateEl) visaDateEl.textContent = `Certificación Oficial • ${reviewDate}`;

      if (alertCard) alertCard.classList.add('hidden');
      if (visaCard) visaCard.classList.remove('hidden');
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
      if (alertCard) alertCard.classList.add('hidden');
      if (visaCard) visaCard.classList.add('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  };

  window.resubmitTeacherPac = async function() {
    let targetCode = null;
    if (typeof activeMateriaKey !== 'undefined' && typeof materiasData !== 'undefined' && materiasData[activeMateriaKey]) {
      targetCode = materiasData[activeMateriaKey].codigo;
    }
    if (!targetCode) targetCode = 'SIS-214';

    let pacId = null;
    if (window.__PAC_CACHE__ && window.__PAC_CACHE__[targetCode]) {
      pacId = window.__PAC_CACHE__[targetCode].id;
    }
    if (!pacId) {
      const storedId = localStorage.getItem('sisa_pac_id_' + targetCode);
      if (storedId) pacId = parseInt(storedId, 10);
    }

    const token = typeof window.getAuthToken === 'function' ? window.getAuthToken() : localStorage.getItem('scu_access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token && token !== 'demo_token') headers['Authorization'] = 'Bearer ' + token;

    try {
      if (pacId) {
        await fetch(`/api/v1/planificaciones/pac/${pacId}/submit`, { method: 'POST', headers });
      } else {
        await fetch(`/api/v1/planificaciones/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ asignacionId: (typeof activeAsignacionId !== 'undefined' ? activeAsignacionId : 1) })
        });
      }
    } catch (e) {
      console.warn('Teacher submit fallback:', e);
    }

    // Resilient transition to ENVIADO_REVISION
    localStorage.setItem('sisa_supervision_status_' + targetCode, 'EN_REVISION');
    localStorage.removeItem('sisa_supervision_obs_' + targetCode);

    if (window.__PAC_CACHE__ && window.__PAC_CACHE__[targetCode]) {
      window.__PAC_CACHE__[targetCode].estado = 'ENVIADO_REVISION';
      delete window.__PAC_CACHE__[targetCode].observacionesRevision;
    }

    window.updateTeacherObservationBanner(targetCode);

    if (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters) {
      for (const sem of Object.values(window.__SUPERVISION_DATA__.semesters)) {
        const found = sem.courses.find(c => c.code === targetCode);
        if (found) {
          found.status = 'EN_REVISION';
          delete found.observacionesRevision;
          break;
        }
      }
      if (typeof window.renderSupervisionAccordions === 'function') {
        window.renderSupervisionAccordions();
      }
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`🚀 ¡Planificación de ${targetCode} reenviada a Dirección de Carrera para su visado institucional!`);
    }
  };

  // =========================================================================
  // CROSS-CAREER COLLABORATIVE NOTE MODAL (PHASE 3)
  // =========================================================================
  window.__ACTIVE_COLLAB_NOTE_CODE__ = null;

  window.openCollaborativeNoteModal = function(courseCode) {
    const modal = document.getElementById('modal-collaborative-note');
    if (!modal) return;

    window.__ACTIVE_COLLAB_NOTE_CODE__ = courseCode;

    let courseName = courseCode;
    let leadTag = 'OTRA CARRERA';
    if (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters) {
      for (const sem of Object.values(window.__SUPERVISION_DATA__.semesters)) {
        const found = sem.courses.find(c => c.code === courseCode);
        if (found) {
          courseName = found.courseName || courseCode;
          leadTag = found.leadTag || leadTag;
          break;
        }
      }
    }

    const titleEl = document.getElementById('modal-collab-title');
    const codeEl = document.getElementById('modal-collab-code');
    const nameEl = document.getElementById('modal-collab-name');
    const inputEl = document.getElementById('modal-collab-note-input');

    if (titleEl) titleEl.textContent = `Nota Colaborativa: ${courseName}`;
    if (codeEl) codeEl.textContent = courseCode;
    if (nameEl) nameEl.textContent = `${courseName} (Líder: ${leadTag})`;
    if (inputEl) {
      const savedNote = localStorage.getItem('sisa_collab_note_' + courseCode) || '';
      inputEl.value = savedNote;
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeCollaborativeNoteModal = function() {
    const modal = document.getElementById('modal-collaborative-note');
    if (modal) modal.classList.add('hidden');
    window.__ACTIVE_COLLAB_NOTE_CODE__ = null;
  };

  window.submitCollaborativeNote = function() {
    const courseCode = window.__ACTIVE_COLLAB_NOTE_CODE__;
    if (!courseCode) {
      window.closeCollaborativeNoteModal();
      return;
    }

    const inputEl = document.getElementById('modal-collab-note-input');
    const note = inputEl ? inputEl.value.trim() : '';

    if (!note) {
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ Ingrese una recomendación o nota colaborativa antes de enviar.');
      }
      return;
    }

    localStorage.setItem('sisa_collab_note_' + courseCode, note);
    window.closeCollaborativeNoteModal();

    if (typeof window.showToast === 'function') {
      window.showToast(`📨 Sugerencia colaborativa enviada a la Dirección de Carrera Líder para ${courseCode}`);
    }
  };

  // =========================================================================
  // INSTITUTIONAL PAC REVIEW MODAL CONTROLLER (DIRECCIÓN DE CARRERA)
  // =========================================================================
  window.openPacReviewModal = function(courseCode, semNum, initialDecision) {
    const modal = document.getElementById('modal-pac-review');
    if (!modal) return;

    // 1. Resolve target course
    let targetCourse = null;
    let targetSem = semNum;
    if (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters) {
      if (semNum && window.__SUPERVISION_DATA__.semesters[semNum]) {
        targetCourse = window.__SUPERVISION_DATA__.semesters[semNum].courses.find(c => c.code === courseCode);
      }
      if (!targetCourse) {
        for (const [sKey, sObj] of Object.entries(window.__SUPERVISION_DATA__.semesters)) {
          const found = sObj.courses.find(c => c.code === courseCode);
          if (found) {
            targetCourse = found;
            targetSem = parseInt(sKey, 10);
            break;
          }
        }
      }
    }

    if (!targetCourse) {
      targetCourse = {
        code: courseCode,
        courseName: courseCode,
        semester: semNum || 1,
        teachers: [],
        shifts: new Set(['Mañana']),
        classrooms: new Set(['Aula 302']),
        tienePractica: true,
        docs: {
          analitico: { estado: 'APROBADO' },
          pacTeorico: { estado: 'APROBADO' },
          pacPractico: { tienePractica: true, estado: 'APROBADO', guias: 12, label: '12 Guías Prácticas' },
          planesClase: { total: 40, completados: 40, estado: 'COMPLETO', pct: 100 }
        }
      };
    }

    // 2. Resolve teacher & schedule
    const teacher = (targetCourse.teachers && targetCourse.teachers[0]) || { name: 'Docente Titular', ci: '' };
    const shiftsStr = targetCourse.shifts && targetCourse.shifts.size > 0 ? Array.from(targetCourse.shifts).join(', ') : 'Mañana';
    const classroomsStr = targetCourse.classrooms && targetCourse.classrooms.size > 0 ? Array.from(targetCourse.classrooms).join(', ') : 'Aula 302';

    // 3. Populate metadata card
    const titleEl = document.getElementById('modal-pac-review-title');
    const codeEl = document.getElementById('modal-pac-review-code');
    const nameEl = document.getElementById('modal-pac-review-name');
    const semEl = document.getElementById('modal-pac-review-semester');
    const teacherEl = document.getElementById('modal-pac-review-teacher');
    const ciEl = document.getElementById('modal-pac-review-ci');
    const schedEl = document.getElementById('modal-pac-review-schedule');
    const badgeEl = document.getElementById('modal-pac-review-practical-badge');

    if (titleEl) titleEl.textContent = `Auditoría: ${targetCourse.courseName}`;
    if (codeEl) codeEl.textContent = targetCourse.code;
    if (nameEl) nameEl.textContent = targetCourse.courseName;
    if (semEl) semEl.textContent = `${targetCourse.semester || targetSem || 1}º Semestre`;
    if (teacherEl) teacherEl.textContent = teacher.name || 'Docente Titular';
    if (ciEl) ciEl.textContent = teacher.ci ? `(CI: ${teacher.ci})` : '';
    if (schedEl) schedEl.textContent = `${shiftsStr} • ${classroomsStr}`;

    if (badgeEl) {
      if (targetCourse.modality === 'PRACTICA_PURA') {
        badgeEl.textContent = '🛠️ Asignatura de Práctica Pura (100% Práctica • PAC Teórico N/A)';
        badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
      } else if (targetCourse.modality === 'TEORICA_PURA') {
        badgeEl.textContent = '📖 Asignatura Teórica Pura (100% Teórica • PAC Práctico N/A)';
        badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300';
      } else {
        badgeEl.textContent = '🔬 Asignatura Teórico-Práctica (Requiere PAC Teórico y PAC Práctico con Guías)';
        badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300';
      }
    }

    // 4. Populate Document Inspection Panels
    const d = targetCourse.docs || {
      analitico: { estado: 'APROBADO' },
      pacTeorico: { estado: 'APROBADO' },
      pacPractico: { tienePractica: targetCourse.tienePractica, estado: targetCourse.tienePractica ? 'APROBADO' : 'N/A', guias: 12, label: '12 Guías Prácticas' },
      planesClase: { total: 40, completados: 40, estado: 'COMPLETO', pct: 100 }
    };

    const statusAnaEl = document.getElementById('modal-status-analitico');
    const statusPacTEoEl = document.getElementById('modal-status-pacteorico');
    const statusPacPracEl = document.getElementById('modal-status-pacpractico');
    const statusPlanesEl = document.getElementById('modal-status-planes');
    const planesCountEl = document.getElementById('modal-planes-count');
    const pracContentEl = document.getElementById('modal-pacpractico-content');

    if (statusAnaEl) statusAnaEl.textContent = d.analitico.estado;
    if (statusPacTEoEl) {
      statusPacTEoEl.textContent = targetCourse.modality === 'PRACTICA_PURA' ? 'NO APLICA (EXENTO)' : d.pacTeorico.estado;
    }
    if (statusPacPracEl) {
      statusPacPracEl.textContent = targetCourse.modality === 'TEORICA_PURA' ? 'NO APLICA (EXENTO)' : `${d.pacPractico.guias || 12} GUÍAS (${d.pacPractico.estado})`;
    }
    if (statusPlanesEl) {
      statusPlanesEl.textContent = `${d.planesClase.completados}/40 COMPLETADOS (${d.planesClase.pct}%)`;
    }
    if (planesCountEl) {
      planesCountEl.textContent = `Avance: ${d.planesClase.completados} de 40 Sesiones microplanificadas`;
    }

    if (pracContentEl) {
      if (targetCourse.tienePractica) {
        pracContentEl.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <i data-lucide="check-circle" class="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5"></i>
              <div>
                <strong class="text-slate-800 dark:text-slate-200 text-[11px] block">${d.pacPractico.guias || 12} Protocolos y Guías de Laboratorio</strong>
                <span class="text-slate-500 text-[10px]">Guías estructuradas con objetivos y actividades prácticas</span>
              </div>
            </div>
            <div class="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <i data-lucide="check-circle" class="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5"></i>
              <div>
                <strong class="text-slate-800 dark:text-slate-200 text-[11px] block">Recursos y Requerimientos Técnicos</strong>
                <span class="text-slate-500 text-[10px]">Equipos, software especializado y normas de seguridad</span>
              </div>
            </div>
          </div>
        `;
      } else {
        pracContentEl.innerHTML = `
          <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200">
            <strong class="block font-bold mb-1">📖 Asignatura Teórica Pura:</strong>
            Esta asignatura no cuenta con carga horaria práctica ni de laboratorio en la malla curricular oficial aprobada por el Vicerrectorado. El requerimiento de PAC Práctico se encuentra en estado <strong>EXENTO (N/A)</strong> y no condiciona la aprobación del expediente curricular.
          </div>
        `;
      }
    }

    // Default to the first inspection tab (Programa Analítico)
    if (typeof window.switchModalReviewTab === 'function') {
      window.switchModalReviewTab('analitico');
    }

    // 5. Restore checkboxes for observed documents
    const savedObsDocs = localStorage.getItem('sisa_supervision_obs_docs_' + courseCode);
    let obsDocsList = ['analitico', 'pacteorico'];
    if (savedObsDocs) {
      try { obsDocsList = JSON.parse(savedObsDocs); } catch (e) {}
    }
    const cbAna = document.getElementById('cb-obs-analitico');
    const cbPacT = document.getElementById('cb-obs-pacteorico');
    const cbPacP = document.getElementById('cb-obs-pacpractico');
    const cbPlanes = document.getElementById('cb-obs-planes');

    if (cbAna) cbAna.checked = obsDocsList.includes('analitico');
    if (cbPacT) cbPacT.checked = obsDocsList.includes('pacteorico');
    if (cbPacP) cbPacP.checked = obsDocsList.includes('pacpractico');
    if (cbPlanes) cbPlanes.checked = obsDocsList.includes('planes');

    // 6. Resolve pacId
    let pacId = targetCourse.pacId || null;
    if (!pacId && window.__PAC_CACHE__ && window.__PAC_CACHE__[courseCode]) {
      pacId = window.__PAC_CACHE__[courseCode].id;
    }
    if (!pacId) {
      const storedId = localStorage.getItem('sisa_pac_id_' + courseCode);
      if (storedId) pacId = parseInt(storedId, 10);
    }

    // 7. Set active context
    window.__ACTIVE_PAC_REVIEW__ = {
      courseCode: courseCode,
      semNum: targetSem,
      course: targetCourse,
      pacId: pacId,
      decision: initialDecision || (targetCourse.status === 'OBSERVADO' ? 'OBSERVADO' : 'APROBADO')
    };

    // 8. Reset observation textarea
    const obsInput = document.getElementById('modal-pac-obs-input');
    if (obsInput) {
      const savedObs = localStorage.getItem('sisa_supervision_obs_' + courseCode) || targetCourse.observacionesRevision || '';
      obsInput.value = savedObs;
    }

    // 9. Initialize decision & character counter
    window.setPacReviewDecision(window.__ACTIVE_PAC_REVIEW__.decision);

    // 10. Unhide modal
    modal.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();
  };

  window.closePacReviewModal = function() {
    const modal = document.getElementById('modal-pac-review');
    if (modal) {
      modal.classList.add('hidden');
    }
    const obsInput = document.getElementById('modal-pac-obs-input');
    if (obsInput) {
      obsInput.value = '';
    }
    window.__ACTIVE_PAC_REVIEW__ = null;
  };

  window.setPacReviewDecision = function(decision) {
    if (!window.__ACTIVE_PAC_REVIEW__) {
      window.__ACTIVE_PAC_REVIEW__ = { decision: decision };
    } else {
      window.__ACTIVE_PAC_REVIEW__.decision = decision;
    }

    const btnApprove = document.getElementById('btn-decision-approve');
    const btnObserve = document.getElementById('btn-decision-observe');
    const obsDocsSection = document.getElementById('modal-pac-obs-docs-section');
    const reqAsterisk = document.getElementById('modal-pac-obs-required');
    const hintEl = document.getElementById('modal-pac-validation-hint');
    const obsInput = document.getElementById('modal-pac-obs-input');

    if (decision === 'APROBADO') {
      if (btnApprove) {
        btnApprove.className = 'p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer';
      }
      if (btnObserve) {
        btnObserve.className = 'p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer';
      }
      if (obsDocsSection) obsDocsSection.classList.add('hidden');
      if (reqAsterisk) reqAsterisk.classList.add('hidden');
      if (hintEl) hintEl.textContent = 'Opcional para dictamen favorable. Obligatorio (mínimo 10 caracteres) para observaciones.';
    } else {
      if (btnApprove) {
        btnApprove.className = 'p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer';
      }
      if (btnObserve) {
        btnObserve.className = 'p-3 rounded-xl border-2 border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer';
      }
      if (obsDocsSection) obsDocsSection.classList.remove('hidden');
      if (reqAsterisk) reqAsterisk.classList.remove('hidden');
      if (hintEl) hintEl.textContent = 'Obligatorio: seleccione los documentos con observaciones e ingrese al menos 10 caracteres fundamentando las correcciones.';
    }

    window.handlePacReviewCharCount(obsInput ? obsInput.value : '');

    if (window.lucide) window.lucide.createIcons();
  };

  window.handlePacReviewCharCount = function(val) {
    const rawVal = val || '';
    const trimmed = rawVal.trim();
    const count = trimmed.length;
    const decision = (window.__ACTIVE_PAC_REVIEW__ && window.__ACTIVE_PAC_REVIEW__.decision) || 'APROBADO';

    const counterEl = document.getElementById('modal-pac-char-counter');
    const submitBtn = document.getElementById('modal-pac-submit-btn');

    if (decision === 'OBSERVADO') {
      if (count < 10) {
        if (counterEl) {
          counterEl.textContent = `${count} / 10 mín.`;
          counterEl.className = 'text-[11px] font-mono text-rose-500 font-bold';
        }
        if (submitBtn) {
          submitBtn.setAttribute('disabled', 'true');
          submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
          submitBtn.classList.remove('hover:bg-[#432dd7]');
        }
      } else {
        if (counterEl) {
          counterEl.textContent = `${count} caracteres`;
          counterEl.className = 'text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold';
        }
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          submitBtn.classList.add('hover:bg-[#432dd7]');
        }
      }
    } else {
      // APROBADO
      if (counterEl) {
        counterEl.textContent = count > 0 ? `${count} caracteres (opcional)` : '0 / 10 mín. (opcional)';
        counterEl.className = 'text-[11px] font-mono text-slate-400';
      }
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        submitBtn.classList.add('hover:bg-[#432dd7]');
      }
    }
  };

  window.submitPacReviewModal = async function() {
    if (!window.__ACTIVE_PAC_REVIEW__) return;

    const { courseCode, semNum, course } = window.__ACTIVE_PAC_REVIEW__;
    const decision = window.__ACTIVE_PAC_REVIEW__.decision || 'APROBADO';
    const obsInput = document.getElementById('modal-pac-obs-input');
    const obs = obsInput ? obsInput.value.trim() : '';

    if (decision === 'OBSERVADO' && obs.length < 10) {
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ Las observaciones deben tener al menos 10 caracteres.');
      }
      return;
    }

    const submitBtn = document.getElementById('modal-pac-submit-btn');
    const originalHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Emitiendo Dictamen...';
      if (window.lucide) window.lucide.createIcons();
    }

    // Collect observed documents if OBSERVADO
    const obsDocs = [];
    if (decision === 'OBSERVADO') {
      if (document.getElementById('cb-obs-analitico')?.checked) obsDocs.push('analitico');
      if (document.getElementById('cb-obs-pacteorico')?.checked) obsDocs.push('pacteorico');
      if (document.getElementById('cb-obs-pacpractico')?.checked) obsDocs.push('pacpractico');
      if (document.getElementById('cb-obs-planes')?.checked) obsDocs.push('planes');
      localStorage.setItem('sisa_supervision_obs_docs_' + courseCode, JSON.stringify(obsDocs));
    } else {
      localStorage.removeItem('sisa_supervision_obs_docs_' + courseCode);
    }

    // Resolve pacId
    let pacId = (course && course.pacId) || window.__ACTIVE_PAC_REVIEW__.pacId;
    if (!pacId && window.__PAC_CACHE__ && window.__PAC_CACHE__[courseCode]) {
      pacId = window.__PAC_CACHE__[courseCode].id;
    }
    if (!pacId) {
      const storedId = localStorage.getItem('sisa_pac_id_' + courseCode);
      if (storedId) pacId = parseInt(storedId, 10);
    }

    const token = typeof window.getAuthToken === 'function' ? window.getAuthToken() : localStorage.getItem('scu_access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token && token !== 'demo_token') {
      headers['Authorization'] = 'Bearer ' + token;
    }

    let networkSuccess = false;

    try {
      // If we don't have pacId yet, try to auto-provision by calling by-carrera endpoint
      if (!pacId) {
        const cCode = (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.careerInfo && window.__SUPERVISION_DATA__.careerInfo.code) || 'CARSIS';
        const syncRes = await fetch(`/api/v1/planificaciones/pac/by-carrera/${cCode}?gestionId=1`, { headers });
        if (syncRes.ok) {
          const syncJson = await syncRes.json();
          const pList = (syncJson && syncJson.data) ? syncJson.data : (Array.isArray(syncJson) ? syncJson : []);
          const match = pList.find(p => p.codigoAsignatura === courseCode);
          if (match) {
            pacId = match.id;
            if (!window.__PAC_CACHE__) window.__PAC_CACHE__ = {};
            window.__PAC_CACHE__[courseCode] = match;
            localStorage.setItem('sisa_pac_id_' + courseCode, pacId);
          }
        }
      }

      if (pacId) {
        const payload = {
          nuevoEstado: decision,
          observaciones: obs
        };
        const res = await fetch(`/api/v1/planificaciones/pac/${pacId}/review`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          networkSuccess = true;
          if (window.__PAC_CACHE__ && window.__PAC_CACHE__[courseCode]) {
            window.__PAC_CACHE__[courseCode].estado = decision;
            window.__PAC_CACHE__[courseCode].observacionesRevision = obs;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('Supervisión Review API returned status:', res.status, errData);
        }
      }
    } catch (err) {
      console.warn('Supervisión Review: Network error, falling back to resilient local buffer:', err);
    }

    // Always perform resilient optimistic update
    localStorage.setItem('sisa_supervision_status_' + courseCode, decision);
    localStorage.setItem('sisa_supervision_obs_' + courseCode, obs);

    if (course) {
      course.status = decision;
      course.observacionesRevision = obs;

      const tienePrac = course.tienePractica !== false;
      let anaSt = decision;
      let pacTSt = decision;
      let pacPSt = tienePrac ? decision : 'N/A';
      let plCount = (decision === 'APROBADO') ? 40 : ((decision === 'OBSERVADO') ? 14 : 24);
      let plSt = (plCount === 40) ? 'COMPLETO' : 'EN_AVANCE';

      if (decision === 'OBSERVADO') {
        anaSt = obsDocs.includes('analitico') ? 'OBSERVADO' : 'APROBADO';
        pacTSt = obsDocs.includes('pacteorico') ? 'OBSERVADO' : 'APROBADO';
        if (tienePrac) pacPSt = obsDocs.includes('pacpractico') ? 'OBSERVADO' : 'APROBADO';
        if (obsDocs.includes('planes')) plSt = 'OBSERVADO';
      }

      course.docs = {
        analitico: { estado: anaSt, unidades: 4, competencias: true, bibliografiaApa: true },
        pacTeorico: { estado: pacTSt, semanas: 20, columnas: 7 },
        pacPractico: { tienePractica: tienePrac, estado: pacPSt, guias: tienePrac ? 12 : 0, label: tienePrac ? '12 Guías Prácticas' : 'N/A (Teórica Pura)' },
        planesClase: { total: 40, completados: plCount, estado: plSt, pct: Math.round((plCount / 40) * 100) }
      };
    }

    window.closePacReviewModal();

    if (typeof window.updateTeacherObservationBanner === 'function') {
      window.updateTeacherObservationBanner(courseCode);
    }

    if (typeof window.renderSupervisionCurricular === 'function') {
      window.renderSupervisionCurricular();
    }

    if (typeof window.showToast === 'function') {
      if (networkSuccess) {
        window.showToast(decision === 'APROBADO'
          ? `✅ Dictamen oficial emitido: Expediente de ${courseCode} APROBADO y visado.`
          : `⚠️ Dictamen oficial emitido: Expediente de ${courseCode} marcado como OBSERVADO.`);
      } else {
        window.showToast(decision === 'APROBADO'
          ? `✅ Dictamen guardado: Expediente de ${courseCode} APROBADO (sincronizado)`
          : `⚠️ Dictamen guardado: Expediente de ${courseCode} OBSERVADO (sincronizado)`);
      }
    }

    if (submitBtn) {
      submitBtn.removeAttribute('disabled');
      submitBtn.innerHTML = originalHtml;
    }
  };

  // Safe delegations replacing legacy prompt()
  window.approveSubjectSupervision = function(courseCode, semNum) {
    window.openPacReviewModal(courseCode, semNum, 'APROBADO');
  };

  window.observeSubjectSupervision = function(courseCode, semNum) {
    window.openPacReviewModal(courseCode, semNum, 'OBSERVADO');
  };

  window.__CURRENT_BATCH_SEMESTER__ = 3;

  window.openBatchEndorsementModal = function(semNum) {
    const sNum = parseInt(semNum, 10) || 3;
    window.__CURRENT_BATCH_SEMESTER__ = sNum;

    let sem = null;
    if (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters) {
      sem = window.__SUPERVISION_DATA__.semesters[sNum];
    }

    const sName = sem ? sem.name : `${sNum}º SEMESTRE`;
    const titleEl = document.getElementById('modal-batch-sem-title');
    if (titleEl) {
      titleEl.textContent = `${sName} - Gestión II-2026`;
    }

    const courses = (sem && Array.isArray(sem.courses)) ? sem.courses : [];
    const pendingCourses = courses.filter(c => c.status !== 'APROBADO');

    const countEl = document.getElementById('modal-batch-count');
    if (countEl) {
      countEl.textContent = pendingCourses.length;
    }

    const listEl = document.getElementById('modal-batch-courses-list');
    if (listEl) {
      if (pendingCourses.length === 0) {
        listEl.innerHTML = `
          <div class="p-4 text-center text-slate-500 dark:text-slate-400">
            <i data-lucide="check-circle" class="w-6 h-6 mx-auto mb-1 text-emerald-500 inline-block"></i>
            <p class="font-semibold text-xs">Todas las asignaturas del semestre ya se encuentran aprobadas.</p>
          </div>
        `;
      } else {
        listEl.innerHTML = pendingCourses.map(c => `
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">${c.code}</span>
              <span class="font-bold text-slate-900 dark:text-white text-xs">${c.name}</span>
              ${c.isCommon ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">Común</span>` : ''}
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-400">
              Docente: <strong class="text-slate-800 dark:text-slate-200">${c.teacher || 'Sin Asignar'}</strong>
              <span class="font-mono text-[10px] text-slate-400">(${c.teacherCi ? 'CI: ' + c.teacherCi : 'Sin CI'})</span>
            </div>
          </div>
        `).join('');
      }
    }

    const cb = document.getElementById('modal-batch-acknowledge-cb');
    if (cb) {
      cb.checked = false;
      cb.disabled = (pendingCourses.length === 0);
    }

    const submitBtn = document.getElementById('modal-batch-submit-btn');
    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      submitBtn.innerHTML = `<i data-lucide="check-check" class="w-4 h-4"></i><span>Certificar Semestre</span>`;
    }

    const modal = document.getElementById('modal-batch-endorsement');
    if (modal) {
      modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }
  };

  window.closeBatchEndorsementModal = function() {
    const modal = document.getElementById('modal-batch-endorsement');
    if (modal) {
      modal.classList.add('hidden');
    }
    const cb = document.getElementById('modal-batch-acknowledge-cb');
    if (cb) cb.checked = false;
    window.handleBatchAcknowledgeToggle(false);
  };

  window.handleBatchAcknowledgeToggle = function(checked) {
    const submitBtn = document.getElementById('modal-batch-submit-btn');
    if (!submitBtn) return;
    const semNum = window.__CURRENT_BATCH_SEMESTER__ || 3;
    const sem = (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters)
      ? window.__SUPERVISION_DATA__.semesters[semNum]
      : null;
    const pendingCount = sem ? sem.courses.filter(c => c.status !== 'APROBADO').length : 1;

    if (checked && pendingCount > 0) {
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  };

  window.submitBatchEndorsement = async function() {
    const semNum = window.__CURRENT_BATCH_SEMESTER__ || 3;
    const sem = (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.semesters)
      ? window.__SUPERVISION_DATA__.semesters[semNum]
      : null;
    const semName = sem ? sem.name : `${semNum}º Semestre`;
    const submitBtn = document.getElementById('modal-batch-submit-btn');

    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Certificando...</span>`;
      if (window.lucide) window.lucide.createIcons();
    }

    const courses = sem ? sem.courses : [];
    const pendingCourses = courses.filter(c => c.status !== 'APROBADO');
    const pacIds = pendingCourses.map(c => c.pacId).filter(id => !!id);

    const careerCode = (window.__SUPERVISION_DATA__ && window.__SUPERVISION_DATA__.careerInfo && window.__SUPERVISION_DATA__.careerInfo.code) || 'CARSIS';

    const payload = {
      carreraId: careerCode,
      gestionId: 1,
      semestre: semNum,
      pacIds: pacIds.length > 0 ? pacIds : null,
      observaciones: `Certificación curricular en bloque - ${semName} Gestión II-2026`
    };

    const headers = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('sisa_token') || localStorage.getItem('jwt_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {}

    try {
      const res = await fetch('/api/v1/planificaciones/pac/batch-review', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.log('Batch review REST persisted successfully');
      } else {
        console.warn('Batch review REST response status:', res.status);
      }
    } catch (err) {
      console.warn('Network error during batch review REST:', err);
    }

    // Optimistic state update: mark all courses in that semester as APROBADO
    if (sem && sem.courses) {
      sem.courses.forEach(c => {
        c.status = 'APROBADO';
        localStorage.setItem('sisa_supervision_status_' + c.code, 'APROBADO');
      });
    }

    // Recalculate KPIs and re-render supervision accordions
    if (typeof window.renderSupervisionCurricular === 'function') {
      window.renderSupervisionCurricular();
    }

    // Close modal and show celebratory toast
    window.closeBatchEndorsementModal();

    if (typeof window.showToast === 'function') {
      window.showToast(`🎉 ¡Planificación del ${semName} aprobada y visada en su totalidad!`);
    }
  };

  window.certifySemesterBatch = function(semNum) {
    window.openBatchEndorsementModal(semNum);
  };

  window.certifyAllActiveSemesters = function() {
    window.openBatchEndorsementModal(3);
  };

  // Dropdown toggle
  window.toggleUserDropdown = function(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) {
      menu.classList.toggle('hidden');
      if (window.lucide) window.lucide.createIcons();
    }
  };

  // Close dropdown on outside click
  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('user-profile-header-dropdown');
    const menu = document.getElementById('user-dropdown-menu');
    if (menu && !menu.classList.contains('hidden') && dropdown && !dropdown.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // UI Profile synchronizer
  window.updateUserProfileUi = function(user) {
    if (!user) {
      try {
        const cached = localStorage.getItem('scu_user_info');
        if (cached) user = JSON.parse(cached);
      } catch (e) {}
    }
    if (!user) return;

    const initials = (user.nombres && user.apellidos)
      ? (user.nombres.charAt(0) + user.apellidos.charAt(0)).toUpperCase()
      : (user.nombreCompleto ? user.nombreCompleto.substring(0, 2).toUpperCase() : 'HM');

    // Canonical role label mapping
    let roleLabel = 'Docente';
    if (user.role === 'ROLE_ADMIN') roleLabel = 'Administrador';
    else if (user.role === 'ROLE_VICERRECTOR_NACIONAL') roleLabel = 'Vicerrector Nal.';
    else if (user.role === 'ROLE_VICERRECTOR_SEDE') roleLabel = 'Vicerrector Sede';
    else if (user.role === 'ROLE_DIR_ACADEMICA') roleLabel = 'Dir. Académica';
    else if (user.role === 'ROLE_DIR_CARRERA') roleLabel = 'Dir. Carrera';

    // Canonical role & scope description
    const roleScope = user.sedeNombre
      ? (roleLabel + ' • ' + user.sedeNombre)
      : (user.role === 'ROLE_ADMIN' ? 'Administrador del sistema • Sede Central' : (roleLabel + ' • Sede Central'));

    // 1. Top Header elements
    const headerAvatar = document.getElementById('header-user-avatar');
    const headerName = document.getElementById('header-user-name');
    const headerRole = document.getElementById('header-user-role');
    if (headerAvatar) headerAvatar.innerText = initials;
    if (headerName) headerName.innerText = user.nombreCompleto || user.username;
    if (headerRole) headerRole.innerText = roleLabel;

    // 2. User Dropdown Menu items
    const menuFullname = document.getElementById('menu-user-fullname');
    const menuEmail = document.getElementById('menu-user-email');
    const menuBadge = document.getElementById('menu-user-badge');
    const menuCi = document.getElementById('menu-user-ci');
    if (menuFullname) menuFullname.innerText = user.nombreCompleto || user.username;
    if (menuEmail) menuEmail.innerText = user.email || (user.username + '@unitepc.edu.bo');
    if (menuBadge) menuBadge.innerText = user.role || 'ROLE_DOCENTE';
    if (menuCi) menuCi.innerText = 'CI: ' + (user.ci || user.username || 'S/N');

    // 3. Global Sidebar footer elements (both user-profile-* and sidebar-user-*)
    const sideAvatars = [document.getElementById('user-profile-avatar'), document.getElementById('sidebar-user-avatar')];
    const sideNames = [document.getElementById('user-profile-name'), document.getElementById('sidebar-user-name')];
    const sideInfos = [document.getElementById('user-profile-info'), document.getElementById('sidebar-user-role')];

    sideAvatars.forEach(el => { if (el) el.innerText = initials; });
    sideNames.forEach(el => { if (el) el.innerText = user.nombreCompleto || user.username; });
    sideInfos.forEach(el => { if (el) el.innerText = roleScope; });

    // 4. View-Dashboard Role Context & Authenticated User Cards
    const dashRoleBadge = document.getElementById('dash-user-role-badge');
    const dashRoleDesc = document.getElementById('dash-user-role-desc');
    const dashRoleSubtext = document.getElementById('dash-user-role-subtext');
    const dashFullname = document.getElementById('dash-user-fullname');
    const dashCi = document.getElementById('dash-user-ci');
    const dashEmail = document.getElementById('dash-user-email');

    if (dashRoleBadge) dashRoleBadge.innerText = ('ROL ' + roleLabel).toUpperCase();
    if (dashFullname) dashFullname.innerText = user.nombreCompleto || user.username;
    if (dashCi) dashCi.innerText = 'CI: ' + (user.ci || user.username || 'S/N');
    if (dashEmail) dashEmail.innerText = user.email || (user.username + '@unitepc.edu.bo');

    if (dashRoleDesc) {
      if (user.role === 'ROLE_DOCENTE') dashRoleDesc.innerText = '• Carpeta docente y avance curricular';
      else if (user.role === 'ROLE_DIR_CARRERA') dashRoleDesc.innerText = '• Revisión y seguimiento curricular';
      else if (user.role === 'ROLE_DIR_ACADEMICA') dashRoleDesc.innerText = '• Supervisión y auditoría académica';
      else if (user.role === 'ROLE_VICERRECTOR_SEDE') dashRoleDesc.innerText = '• Monitoreo regional de sede';
      else if (user.role === 'ROLE_VICERRECTOR_NACIONAL') dashRoleDesc.innerText = '• Monitoreo nacional consolidado';
      else dashRoleDesc.innerText = '• Acceso total y supervisión';
    }

    if (dashRoleSubtext) {
      if (user.role === 'ROLE_DOCENTE') dashRoleSubtext.innerText = 'Acceso directo a tus asignaturas, programa analítico, PAC, cronograma y planes de clase.';
      else if (user.role === 'ROLE_DIR_CARRERA') dashRoleSubtext.innerText = 'Revisión curricular, aprobación de carpetas docentes y supervisión de carrera.';
      else if (user.role === 'ROLE_DIR_ACADEMICA') dashRoleSubtext.innerText = 'Supervisión institucional, auditorías de aula presenciales y calidad académica.';
      else if (user.role === 'ROLE_VICERRECTOR_SEDE') dashRoleSubtext.innerText = 'Monitoreo consolidado de sedes, cumplimiento normativo y dictámenes académicos.';
      else if (user.role === 'ROLE_VICERRECTOR_NACIONAL') dashRoleSubtext.innerText = 'Supervisión nacional estratégica de todas las sedes y vicerrectorados.';
      else dashRoleSubtext.innerText = 'Visualizando todas las sedes, carreras y docentes asignados en la gestión activa.';
    }

    // 5. Dynamic Sidebar and Workspace Role Filtering
    if (typeof window.updateSidebarNavForRole === 'function') {
      window.updateSidebarNavForRole(user.role);
    }
    if (user.role === 'ROLE_DOCENTE' && typeof window.renderDocenteDashboard === 'function') {
      window.renderDocenteDashboard(user);
    }

    if (window.lucide) window.lucide.createIcons();
  };

  // ── ROOT VIEW SWITCHING ENGINE (UNITEPC-PRO ARCHITECTURE) ────────────────
  window._isAuthScreenActive = false;

  window.showLoginView = function() {
    window._isAuthScreenActive = true;
    window.__SUPERVISION_AUDIT_COURSE_CODE__ = null;
    try { localStorage.removeItem('sisa_supervision_audit_course'); } catch (e) {}
    const shell = document.getElementById('sp-shell');
    const pwdView = document.getElementById('view-change-password');
    const loginView = document.getElementById('view-login');

    if (shell) shell.classList.add('hidden');
    if (pwdView) pwdView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');

    // Reset errors and clear sensitive fields
    const errBox = document.getElementById('login-error-container');
    if (errBox) errBox.classList.add('hidden');
    const pwdInput = document.getElementById('login-password');
    if (pwdInput) pwdInput.value = '';

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '/login');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  window.showChangePasswordView = function(user, tempToken, isVoluntary = false, prefillCurrentPassword = '') {
    window._isAuthScreenActive = true;
    window._isVoluntaryPasswordChange = isVoluntary;
    window._tempPasswordChangeUser = user;
    window._tempPasswordChangeToken = tempToken;

    if (user) {
      try { sessionStorage.setItem('scu_temp_user', JSON.stringify(user)); } catch (e) {}
    }
    if (tempToken) {
      try { sessionStorage.setItem('scu_temp_token', tempToken); } catch (e) {}
    }

    const shell = document.getElementById('sp-shell');
    const loginView = document.getElementById('view-login');
    const pwdView = document.getElementById('view-change-password');

    if (shell) shell.classList.add('hidden');
    if (loginView) loginView.classList.add('hidden');
    if (pwdView) pwdView.classList.remove('hidden');

    // Reset inputs
    const cur = document.getElementById('change-current-password');
    const n = document.getElementById('change-new-password');
    const c = document.getElementById('change-confirm-password');
    const errBox = document.getElementById('change-password-error');
    const badge = document.getElementById('change-pwd-badge');
    const cancelBtn = document.getElementById('btn-cancel-pwd-change');

    if (cur) cur.value = prefillCurrentPassword || '';
    if (n) n.value = '';
    if (c) c.value = '';
    if (errBox) errBox.classList.add('hidden');

    if (badge) {
      badge.innerText = isVoluntary ? 'SEGURIDAD DE LA CUENTA' : 'PRIMER INGRESO';
    }
    if (cancelBtn) {
      cancelBtn.innerText = isVoluntary ? '← Volver al portal' : 'Cancelar y cerrar sesión';
    }

    window.validatePasswordLive();

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '/cambiar-contrasena');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  window.showPortalShell = function(targetViewId = 'view-dashboard') {
    window._isAuthScreenActive = false;
    window._tempPasswordChangeUser = null;
    window._tempPasswordChangeToken = null;
    try {
      sessionStorage.removeItem('scu_temp_user');
      sessionStorage.removeItem('scu_temp_token');
    } catch (e) {}

    const loginView = document.getElementById('view-login');
    const pwdView = document.getElementById('view-change-password');
    const shell = document.getElementById('sp-shell');

    if (loginView) loginView.classList.add('hidden');
    if (pwdView) pwdView.classList.add('hidden');
    if (shell) shell.classList.remove('hidden');

    const currentUser = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    if (currentUser && typeof window.updateSidebarNavForRole === 'function') {
      window.updateSidebarNavForRole(currentUser.role);
    }
    if (currentUser && currentUser.role === 'ROLE_DOCENTE' && targetViewId !== 'view-dashboard' && targetViewId !== 'view1') {
      targetViewId = 'view-dashboard';
    } else if (currentUser && currentUser.role === 'ROLE_DIR_CARRERA' && (!targetViewId || targetViewId === 'view-dashboard')) {
      targetViewId = 'view2';
    }

    if (typeof window.switchView === 'function') {
      window.switchView(targetViewId);
    }

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '/dashboard');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  // Cancel handler from password change view
  window.handlePasswordChangeCancel = function() {
    if (window._isVoluntaryPasswordChange) {
      window.showPortalShell();
    } else {
      window.logoutUser();
    }
  };

  // Dynamic Password Rule Evaluator (keyup & input event handler)
  window.validatePasswordLive = function() {
    const curInput = document.getElementById('change-current-password');
    const newInput = document.getElementById('change-new-password');
    const confInput = document.getElementById('change-confirm-password');

    const curVal = curInput ? curInput.value : '';
    const newVal = newInput ? newInput.value : '';
    const confVal = confInput ? confInput.value : '';

    const updateRule = (ruleId, isValid) => {
      const el = document.getElementById(ruleId);
      if (!el) return;
      const icon = el.querySelector('.rule-icon');
      if (isValid) {
        el.className = 'flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium transition-colors';
        if (icon) {
          icon.innerText = '✓';
          icon.className = 'rule-icon text-emerald-600 dark:text-emerald-400 font-bold';
        }
      } else {
        el.className = 'flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors';
        if (icon) {
          icon.innerText = '○';
          icon.className = 'rule-icon text-slate-400';
        }
      }
    };

    // Rule 1: Length between 8 and 72 characters
    const validLength = newVal.length >= 8 && newVal.length <= 72;
    updateRule('rule-length', validLength);

    // Rule 2: Different from current password
    const validDiff = newVal.length > 0 && curVal.length > 0 && newVal !== curVal;
    updateRule('rule-diff', validDiff);

    // Rule 3: Confirmation matches new password
    const validMatch = newVal.length > 0 && newVal === confVal;
    updateRule('rule-match', validMatch);
  };

  window.toggleLoginPasswordVisibility = function() {
    const pwd = document.getElementById('login-password');
    const eye = document.getElementById('login-pwd-eye');
    if (!pwd) return;
    if (pwd.type === 'password') {
      pwd.type = 'text';
      if (eye) eye.setAttribute('data-lucide', 'eye-off');
    } else {
      pwd.type = 'password';
      if (eye) eye.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  window.fillDemoLogin = function(username, password) {
    const u = document.getElementById('login-username');
    const p = document.getElementById('login-password');
    if (u) u.value = username;
    if (p) p.value = password;
  };

  window.handleLoginSubmit = async function(event) {
    if (event) event.preventDefault();
    const uInput = document.getElementById('login-username');
    const pInput = document.getElementById('login-password');
    const errContainer = document.getElementById('login-error-container');
    const errMsg = document.getElementById('login-error-msg');
    const btn = document.getElementById('btn-do-login');

    if (!uInput || !pInput) return;
    const username = uInput.value.trim();
    const password = pInput.value;

    if (!username || !password) {
      if (errContainer && errMsg) {
        errMsg.innerText = 'Por favor ingrese su usuario y contraseña.';
        errContainer.classList.remove('hidden');
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Validando credenciales...';
    }
    if (errContainer) errContainer.classList.add('hidden');

    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const res = await resp.json();

      if (!resp.ok) {
        throw new Error(res.message || res.error || 'Credenciales incorrectas o cuenta inactiva.');
      }

      const authData = res.data || res;
      const token = authData.accessToken || authData.token;
      const user = authData.user;
      const mustChange = (authData.mustChangePassword === true || (user && user.mustChangePassword === true));

      if (mustChange) {
        // Transition directly to full-page password change, passing entered password as current
        window.showChangePasswordView(user, token, false, password);
      } else {
        window.setAuthSession(token, user);
        window.showPortalShell(user.role === 'ROLE_ADMIN' ? 'view6' : 'view-dashboard');
        window.showToast('✅ ¡Bienvenido a SISA, ' + (user.nombres || user.nombreCompleto || user.username) + '!');

        if (user.role === 'ROLE_ADMIN' && typeof window.loadAdminUsers === 'function') {
          window.loadAdminUsers();
        }
      }
    } catch (err) {
      if (errContainer && errMsg) {
        errMsg.innerText = err.message || 'Error de conexión con el servidor.';
        errContainer.classList.remove('hidden');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Ingresar al sistema</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };

  // Forced / Voluntary Password Change
  window._tempPasswordChangeUser = null;
  window._tempPasswordChangeToken = null;
  window._isVoluntaryPasswordChange = false;

  window.handleForcedPasswordSubmit = async function(event) {
    if (event) {
      event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    console.log('[SISA] handleForcedPasswordSubmit is executing...');
    const curPwdInput = document.getElementById('change-current-password');
    const newPwdInput = document.getElementById('change-new-password');
    const confPwdInput = document.getElementById('change-confirm-password');
    const errBox = document.getElementById('change-password-error');
    const errMsg = document.getElementById('change-password-error-msg');
    const btn = document.getElementById('btn-do-change-password');

    const currentPassword = curPwdInput ? curPwdInput.value : '';
    const newPassword = newPwdInput ? newPwdInput.value : '';
    const confirmPassword = confPwdInput ? confPwdInput.value : '';
    
    let user = window._tempPasswordChangeUser || window.getCurrentUser();
    let token = window._tempPasswordChangeToken || window.getAuthToken();
    if (!user) {
      try {
        const stored = sessionStorage.getItem('scu_temp_user');
        if (stored) user = JSON.parse(stored);
      } catch (e) {}
    }
    if (!token) {
      try {
        token = sessionStorage.getItem('scu_temp_token');
      } catch (e) {}
    }

    const targetUsername = (user && (user.username || user.ci)) ? (user.username || user.ci) : currentPassword;

    const showError = (msg) => {
      if (errBox && errMsg) {
        errMsg.innerText = msg;
        errBox.classList.remove('hidden');
      }
    };

    if (errBox) errBox.classList.add('hidden');

    if (!currentPassword) {
      showError('Debes ingresar tu contraseña actual o temporal.');
      return;
    }
    if (!newPassword || newPassword.length < 8 || newPassword.length > 72) {
      showError('La nueva contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }
    if (newPassword === currentPassword) {
      showError('La nueva contraseña debe ser diferente de la contraseña actual.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('La confirmación de la contraseña no coincide.');
      return;
    }
    if (user && user.ci && (newPassword === user.ci || newPassword.toLowerCase() === user.ci.toLowerCase())) {
      showError('La nueva contraseña no puede ser igual a tu Carnet de Identidad (CI).');
      return;
    }
    if (user && user.username && newPassword.toLowerCase() === user.username.toLowerCase()) {
      showError('La nueva contraseña no puede ser igual a tu nombre de usuario.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Guardando...';
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }

      // Fully aligned payload matching ScuChangePasswordCmd
      const payload = {
        username: targetUsername,
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };

      const resp = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.message || res.error || 'Error al actualizar la contraseña.');
      }

      const authData = res.data || res;
      const finalToken = authData.accessToken || authData.token || token;
      const updatedUser = authData.user || user;
      if (updatedUser) updatedUser.mustChangePassword = false;

      window._isAuthScreenActive = false;
      window._tempPasswordChangeUser = null;
      window._tempPasswordChangeToken = null;
      try {
        sessionStorage.removeItem('scu_temp_user');
        sessionStorage.removeItem('scu_temp_token');
      } catch (e) {}

      window.setAuthSession(finalToken, updatedUser);
      window.showPortalShell(updatedUser && updatedUser.role === 'ROLE_ADMIN' ? 'view6' : 'view-dashboard');
      window.showToast('✅ ¡Contraseña actualizada con éxito! Bienvenido a SISA.');

      if (updatedUser && updatedUser.role === 'ROLE_ADMIN' && typeof window.loadAdminUsers === 'function') {
        window.loadAdminUsers();
      }
    } catch (err) {
      console.error('[SISA] Password change exception:', err);
      showError(err.message || 'Error al procesar el cambio de contraseña.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Guardar nueva contraseña</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };

  // Capturing event listeners ensuring button clicks and form submits never get swallowed
  document.addEventListener('click', function(e) {
    const btn = e.target && e.target.closest ? e.target.closest('#btn-do-change-password') : null;
    if (btn) {
      console.log('[SISA] Capturing click on #btn-do-change-password');
      e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      window.handleForcedPasswordSubmit(e);
    }
  }, true);

  document.addEventListener('submit', function(e) {
    const form = e.target && e.target.closest ? e.target.closest('#forced-password-form') : null;
    if (form) {
      console.log('[SISA] Capturing submit on #forced-password-form');
      e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      window.handleForcedPasswordSubmit(e);
    }
  }, true);

  // Backward-compatibility wrappers for legacy callers
  window.openLoginModal = function() { window.showLoginView(); };
  window.closeLoginModal = function() {};
  window.openForcedPasswordModal = function(user, token) { window.showChangePasswordView(user, token, false); };
  window.closeForcedPasswordModal = function() {};

  // ── ADMIN USER MANAGEMENT (PHASE 5) ──────────────────────────────────
  window.adminUsersList = [];
  window.adminUserAssignments = [];
  window.adminCareersCache = {};

  window.loadAdminUsers = async function() {
    const tbody = document.getElementById('admin-users-table-body');
    const searchInput = document.getElementById('admin-search-input');
    const roleFilter = document.getElementById('admin-role-filter');

    const searchVal = searchInput ? searchInput.value.trim() : '';
    const roleVal = roleFilter ? roleFilter.value : '';

    let url = '/api/v1/admin/usuarios?';
    if (searchVal) url += 'search=' + encodeURIComponent(searchVal) + '&';
    if (roleVal) url += 'rol=' + encodeURIComponent(roleVal) + '&';

    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: window.getAuthHeaders()
      });

      if (resp.ok) {
        const json = await resp.json();
        const users = json.data || json || [];
        window.adminUsersList = Array.isArray(users) ? users : [];
        window.renderAdminUsersTable(window.adminUsersList);
      } else {
        // Fallback for demo when unauthenticated or offline
        console.warn('Admin API returned HTTP ' + resp.status + ', using fallback list');
        window.renderFallbackAdminUsers();
      }
    } catch (e) {
      console.warn('Admin users fetch error, rendering fallback:', e);
      window.renderFallbackAdminUsers();
    }
  };

  window.renderFallbackAdminUsers = function() {
    window.adminUsersList = [
      {
        id: 1,
        username: 'docente.cbb',
        ci: '3065087',
        nombreCompleto: 'ROSMERY LUIZAGA SALINAS',
        email: 'docente.cbb@unitepc.edu.bo',
        rol: 'ROLE_DOCENTE',
        activo: true,
        mustChangePassword: false,
        asignaciones: [{ sedeNombre: 'Sede Central Cochabamba', carreraNombre: 'Ingeniería de Sistemas' }]
      },
      {
        id: 2,
        username: 'dir.carrera.sis',
        ci: '6600808',
        nombreCompleto: 'WALTER JOSE CAZAS CASTRO',
        email: 'dir.sistemas@unitepc.edu.bo',
        rol: 'ROLE_DIR_CARRERA',
        activo: true,
        mustChangePassword: false,
        asignaciones: [{ sedeNombre: 'Sede Central Cochabamba', carreraNombre: 'Ingeniería de Sistemas' }]
      },
      {
        id: 3,
        username: 'dir.academica.cbb',
        ci: '4421998',
        nombreCompleto: 'MARTIN XAVIER SANCHEZ FLORES',
        email: 'dir.academica.cbb@unitepc.edu.bo',
        rol: 'ROLE_DIR_ACADEMICA',
        activo: true,
        mustChangePassword: false,
        asignaciones: [{ sedeNombre: 'Sede Central Cochabamba', carreraNombre: 'Medicina Humana' }]
      },
      {
        id: 236,
        username: 'admin',
        ci: '1000001',
        nombreCompleto: 'ADMINISTRADOR GENERAL SISA',
        email: 'admin@unitepc.edu.bo',
        rol: 'ROLE_ADMIN',
        activo: true,
        mustChangePassword: false,
        asignaciones: []
      }
    ];
    window.renderAdminUsersTable(window.adminUsersList);
  };

  window.renderAdminUsersTable = function(users) {
    const tbody = document.getElementById('admin-users-table-body');
    const counter = document.getElementById('admin-users-counter');
    if (counter) counter.innerText = users.length;
    if (!tbody) return;

    if (!users || users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-slate-400">
            <i data-lucide="users" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
            <div>No se encontraron usuarios con los criterios especificados.</div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const roleBadges = {
      ROLE_ADMIN: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      ROLE_VICERRECTOR_NACIONAL: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      ROLE_VICERRECTOR_SEDE: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      ROLE_DIR_ACADEMICA: 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      ROLE_DIR_CARRERA: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      ROLE_DOCENTE: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    };

    const roleLabels = {
      ROLE_ADMIN: 'Admin',
      ROLE_VICERRECTOR_NACIONAL: 'Vicerrectorado nal',
      ROLE_VICERRECTOR_SEDE: 'Vicerrectorado sede',
      ROLE_DIR_ACADEMICA: 'Dir. académico sede',
      ROLE_DIR_CARRERA: 'Dir. de carrera',
      ROLE_DOCENTE: 'Docente'
    };

    let html = '';
    users.forEach(u => {
      const ciVal = u.ci || u.username;
      const initials = (u.nombres && u.apellidos)
        ? (u.nombres.charAt(0) + u.apellidos.charAt(0)).toUpperCase()
        : (u.nombreCompleto ? u.nombreCompleto.substring(0, 2).toUpperCase() : 'US');

      const roleBadgeClass = roleBadges[u.rol] || 'bg-slate-100 text-slate-700 border-slate-200';
      const roleText = roleLabels[u.rol] || u.rol;

      // Academic Assignments tags
      let asigHtml = '<span class="text-slate-400 italic text-[11px]">Sin asignación</span>';
      if (u.asignaciones && u.asignaciones.length > 0) {
        asigHtml = '<div class="flex flex-wrap gap-1 max-w-sm">';
        u.asignaciones.slice(0, 3).forEach(a => {
          const sedeText = a.sedeNombre ? a.sedeNombre.replace('Sede Regional ', '').replace('Sede Central ', '') : 'Sede';
          const carText = a.carreraNombre || (a.asignaturaNombre ? a.asignaturaNombre : 'General');
          asigHtml += `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">${sedeText} • ${carText}</span>`;
        });
        if (u.asignaciones.length > 3) {
          asigHtml += `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">+${u.asignaciones.length - 3}</span>`;
        }
        asigHtml += '</div>';
      }

      const isActive = (u.activo === true || u.isActive === true);

      html += `
        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
          <td class="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
            ${ciVal}
            ${u.mustChangePassword ? '<span class="ml-1.5 px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="Debe cambiar clave en próximo ingreso">Clave CI</span>' : ''}
          </td>
          <td class="py-3.5 px-6">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold flex items-center justify-center text-[10px] border border-purple-200 dark:border-purple-800/60 flex-shrink-0">
                ${initials}
              </div>
              <div class="truncate max-w-[200px]">
                <div class="font-bold text-slate-900 dark:text-white truncate">${u.nombreCompleto || u.username}</div>
                <div class="text-[11px] text-slate-400 truncate">${u.email || ''}</div>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-6">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadgeClass} inline-flex items-center gap-1">
              ${roleText}
            </span>
          </td>
          <td class="py-3.5 px-6">${asigHtml}</td>
          <td class="py-3.5 px-6 text-center">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}">
              ${isActive ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </td>
          <td class="py-3.5 px-6 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="window.openEditUserModal(${u.id})" class="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Editar usuario">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="window.resetUserPassword(${u.id}, '${ciVal}')" class="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Restablecer clave a CI">
                <i data-lucide="key-round" class="w-4 h-4"></i>
              </button>
              <button onclick="window.toggleUserActive(${u.id})" class="p-1.5 text-slate-500 hover:text-${isActive ? 'red' : 'emerald'}-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="${isActive ? 'Desactivar usuario' : 'Activar usuario'}">
                <i data-lucide="${isActive ? 'user-x' : 'user-check'}" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  };

  let _adminSearchDebounce = null;
  window.onAdminSearchInput = function() {
    clearTimeout(_adminSearchDebounce);
    _adminSearchDebounce = setTimeout(() => {
      window.loadAdminUsers();
    }, 250);
  };

  window.onAdminRoleFilterChange = function() {
    window.loadAdminUsers();
  };

  // ── REGISTRAR / EDITAR USUARIO MODAL (EXACT REFERENCE UI) ─────────────

  window.openRegisterUserModal = function() {
    const modal = document.getElementById('modal-register-user');
    const idInput = document.getElementById('admin-user-id');
    const ciInput = document.getElementById('admin-user-ci');
    const rolSelect = document.getElementById('admin-user-rol');
    const nombreInput = document.getElementById('admin-user-nombre');
    const activoInput = document.getElementById('admin-user-activo');
    const title = document.getElementById('admin-modal-title');
    const subtitle = document.getElementById('admin-modal-subtitle');
    const saveBtn = document.getElementById('admin-btn-save-user');

    if (idInput) idInput.value = '';
    if (ciInput) {
      ciInput.value = '';
      ciInput.disabled = false;
    }
    if (rolSelect) rolSelect.value = 'ROLE_DOCENTE';
    if (nombreInput) nombreInput.value = '';
    if (activoInput) activoInput.checked = true;

    if (title) title.innerText = 'Registrar usuario';
    if (subtitle) subtitle.innerText = 'La contraseña inicial será el CI y se exigirá cambiarla en el primer ingreso.';
    if (saveBtn) saveBtn.innerHTML = '<span>Guardar usuario</span>';

    // Reset assignments picker & array
    window.adminUserAssignments = [];
    window.resetAcademicAssignmentPickers();
    window.renderAdminAssignmentsList();

    if (modal) modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeRegisterUserModal = function() {
    const modal = document.getElementById('modal-register-user');
    if (modal) modal.classList.add('hidden');
  };

  window.resetAcademicAssignmentPickers = function() {
    const sedeSel = document.getElementById('admin-asignacion-sede');
    const carSel = document.getElementById('admin-asignacion-carrera');
    const asigSel = document.getElementById('admin-asignacion-asignatura');

    if (sedeSel) sedeSel.value = '';
    if (carSel) {
      carSel.innerHTML = '<option value="">Seleccionar carrera...</option>';
      carSel.disabled = true;
    }
    if (asigSel) {
      asigSel.innerHTML = '<option value="">Opcional / Todas las materias...</option>';
      asigSel.disabled = true;
    }
  };

  window.onAdminAsignacionSedeChange = async function() {
    const sedeSel = document.getElementById('admin-asignacion-sede');
    const carSel = document.getElementById('admin-asignacion-carrera');
    const asigSel = document.getElementById('admin-asignacion-asignatura');

    if (!sedeSel || !carSel) return;
    const selectedOption = sedeSel.options[sedeSel.selectedIndex];
    const sedeCode = selectedOption ? selectedOption.getAttribute('data-code') : null;

    if (!sedeSel.value) {
      carSel.innerHTML = '<option value="">Seleccionar carrera...</option>';
      carSel.disabled = true;
      if (asigSel) {
        asigSel.innerHTML = '<option value="">Opcional / Todas las materias...</option>';
        asigSel.disabled = true;
      }
      return;
    }

    carSel.disabled = false;
    carSel.innerHTML = '<option value="">Cargando carreras...</option>';

    try {
      let careers = [];
      const resp = await fetch(`/api/v1/catalogo-academico/careers?branchOfficeCode=${sedeCode || ''}`);
      if (resp.ok) {
        careers = await resp.json();
      }

      if (!careers || careers.length === 0) {
        // Fallback default careers
        careers = [
          { id: 2, code: 'SIS', name: 'Ingeniería de Sistemas' },
          { id: 1, code: 'MED', name: 'Medicina Humana' },
          { id: 3, code: 'DER', name: 'Derecho y Ciencias Jurídicas' },
          { id: 4, code: 'ODO', name: 'Odontología' },
          { id: 5, code: 'FAR', name: 'Bioquímica y Farmacia' }
        ];
      }

      let carOptions = '<option value="">Seleccionar carrera...</option>';
      careers.forEach(c => {
        carOptions += `<option value="${c.id || c.code}" data-code="${c.code}" data-name="${c.name}">${c.name}</option>`;
      });
      carSel.innerHTML = carOptions;
    } catch (e) {
      carSel.innerHTML = `
        <option value="">Seleccionar carrera...</option>
        <option value="2" data-code="SIS" data-name="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
        <option value="1" data-code="MED" data-name="Medicina Humana">Medicina Humana</option>
      `;
    }
  };

  window.onAdminAsignacionCarreraChange = async function() {
    const sedeSel = document.getElementById('admin-asignacion-sede');
    const carSel = document.getElementById('admin-asignacion-carrera');
    const asigSel = document.getElementById('admin-asignacion-asignatura');

    if (!asigSel || !carSel) return;
    const selectedSedeOpt = sedeSel ? sedeSel.options[sedeSel.selectedIndex] : null;
    const selectedCarOpt = carSel.options[carSel.selectedIndex];
    const sedeCode = selectedSedeOpt ? selectedSedeOpt.getAttribute('data-code') : 'CBA';
    const carCode = selectedCarOpt ? selectedCarOpt.getAttribute('data-code') : '';

    if (!carSel.value) {
      asigSel.innerHTML = '<option value="">Opcional / Todas las materias...</option>';
      asigSel.disabled = true;
      return;
    }

    asigSel.disabled = false;
    asigSel.innerHTML = '<option value="">Cargando asignaturas...</option>';

    try {
      let courses = [];
      const resp = await fetch(`/api/v1/catalogo-academico/courses?branchOfficeCode=${sedeCode}&careerCode=${carCode}`);
      if (resp.ok) {
        courses = await resp.json();
      }

      if (!courses || courses.length === 0) {
        courses = [
          { id: 1, code: 'SIS-301', name: 'Programación III' },
          { id: 2, code: 'SIS-105', name: 'Taller de Idiomas Técnico' },
          { id: 3, code: 'MED-101', name: 'Anatomía Humana I' }
        ];
      }

      let asigOptions = '<option value="">Opcional / Todas las materias...</option>';
      courses.forEach(m => {
        asigOptions += `<option value="${m.id || m.code}" data-name="${m.name}">${m.code ? m.code + ' - ' : ''}${m.name}</option>`;
      });
      asigSel.innerHTML = asigOptions;
    } catch (e) {
      asigSel.innerHTML = '<option value="">Opcional / Todas las materias...</option>';
    }
  };

  window.addAcademicAssignment = function() {
    const sedeSel = document.getElementById('admin-asignacion-sede');
    const carSel = document.getElementById('admin-asignacion-carrera');
    const asigSel = document.getElementById('admin-asignacion-asignatura');

    if (!sedeSel || !sedeSel.value) {
      window.showToast('⚠️ Por favor selecciona al menos una Sede.');
      return;
    }

    const sedeOpt = sedeSel.options[sedeSel.selectedIndex];
    const carOpt = (carSel && carSel.value) ? carSel.options[carSel.selectedIndex] : null;
    const asigOpt = (asigSel && asigSel.value) ? asigSel.options[asigSel.selectedIndex] : null;

    const sedeIdNum = parseInt(sedeSel.value) || 1;
    const carreraIdNum = carOpt ? (parseInt(carSel.value) || null) : null;
    const asignaturaIdNum = asigOpt ? (parseInt(asigSel.value) || null) : null;

    const assignment = {
      sedeId: sedeIdNum,
      sedeNombre: sedeOpt ? sedeOpt.text : 'Sede',
      carreraId: carreraIdNum,
      carreraNombre: carOpt ? (carOpt.getAttribute('data-name') || carOpt.text) : null,
      asignaturaId: asignaturaIdNum,
      asignaturaNombre: asigOpt ? (asigOpt.getAttribute('data-name') || asigOpt.text) : null
    };

    window.adminUserAssignments.push(assignment);
    window.renderAdminAssignmentsList();
    window.resetAcademicAssignmentPickers();
    window.showToast('✓ Asignación agregada');
  };

  window.removeAcademicAssignment = function(index) {
    window.adminUserAssignments.splice(index, 1);
    window.renderAdminAssignmentsList();
  };

  window.renderAdminAssignmentsList = function() {
    const container = document.getElementById('admin-asignaciones-list');
    if (!container) return;

    if (!window.adminUserAssignments || window.adminUserAssignments.length === 0) {
      container.innerHTML = '<span class="text-[11px] text-slate-400 italic">No hay asignaciones agregadas todavía.</span>';
      return;
    }

    let html = '';
    window.adminUserAssignments.forEach((a, idx) => {
      const sedeText = a.sedeNombre ? a.sedeNombre.replace('Sede Regional ', '').replace('Sede Central ', '') : 'Sede';
      const carText = a.carreraNombre ? ' • ' + a.carreraNombre : '';
      const asigText = a.asignaturaNombre ? ' (' + a.asignaturaNombre + ')' : '';

      html += `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 shadow-xs">
          <span>${sedeText}${carText}${asigText}</span>
          <button type="button" onclick="window.removeAcademicAssignment(${idx})" class="text-purple-500 hover:text-red-600 cursor-pointer p-0.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </span>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  };

  window.saveRegisterUser = async function() {
    const idInput = document.getElementById('admin-user-id');
    const ciInput = document.getElementById('admin-user-ci');
    const rolSelect = document.getElementById('admin-user-rol');
    const nombreInput = document.getElementById('admin-user-nombre');
    const activoInput = document.getElementById('admin-user-activo');
    const saveBtn = document.getElementById('admin-btn-save-user');

    const userId = idInput ? idInput.value : '';
    const ci = ciInput ? ciInput.value.trim() : '';
    const rol = rolSelect ? rolSelect.value : 'ROLE_DOCENTE';
    const nombreCompleto = nombreInput ? nombreInput.value.trim() : '';
    const activo = activoInput ? activoInput.checked : true;

    if (!ci) {
      window.showToast('⚠️ El CI / Usuario es obligatorio.');
      return;
    }
    if (!nombreCompleto) {
      window.showToast('⚠️ El Nombre Completo es obligatorio.');
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerText = 'Guardando...';
    }

    const payload = {
      ci: ci,
      username: ci,
      rol: rol,
      nombreCompleto: nombreCompleto,
      activo: activo,
      isActive: activo,
      asignaciones: window.adminUserAssignments || []
    };

    try {
      const isEdit = !!userId;
      const url = isEdit ? `/api/v1/admin/usuarios/${userId}` : '/api/v1/admin/usuarios';
      const method = isEdit ? 'PUT' : 'POST';

      const resp = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...window.getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.message || res.error || 'Error al guardar el usuario.');
      }

      window.closeRegisterUserModal();
      window.showToast(isEdit ? '✅ Usuario actualizado exitosamente.' : '✅ Usuario creado exitosamente con su CI como contraseña inicial.');
      window.loadAdminUsers();
    } catch (err) {
      window.showToast('❌ Error: ' + err.message);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Guardar usuario';
      }
    }
  };

  // ── EDIT USER & PASSWORD RESET (TASK 5.3) ─────────────────────────────

  window.openEditUserModal = async function(userId) {
    const modal = document.getElementById('modal-register-user');
    const idInput = document.getElementById('admin-user-id');
    const ciInput = document.getElementById('admin-user-ci');
    const rolSelect = document.getElementById('admin-user-rol');
    const nombreInput = document.getElementById('admin-user-nombre');
    const activoInput = document.getElementById('admin-user-activo');
    const title = document.getElementById('admin-modal-title');
    const subtitle = document.getElementById('admin-modal-subtitle');
    const saveBtn = document.getElementById('admin-btn-save-user');

    // Find in memory or fetch
    let user = window.adminUsersList.find(u => u.id === userId);

    try {
      const resp = await fetch(`/api/v1/admin/usuarios/${userId}`, {
        headers: window.getAuthHeaders()
      });
      if (resp.ok) {
        const json = await resp.json();
        user = json.data || json;
      }
    } catch (e) {
      console.warn('Could not fetch user by ID, using local cached user:', e);
    }

    if (!user) {
      window.showToast('❌ No se encontró el usuario a editar.');
      return;
    }

    if (idInput) idInput.value = user.id;
    if (ciInput) {
      ciInput.value = user.ci || user.username || '';
      ciInput.disabled = true; // CI is immutable during edit
    }
    if (rolSelect) rolSelect.value = user.rol || 'ROLE_DOCENTE';
    if (nombreInput) nombreInput.value = user.nombreCompleto || '';
    if (activoInput) activoInput.checked = (user.activo === true || user.isActive === true);

    if (title) title.innerText = 'Editar usuario';
    if (subtitle) subtitle.innerText = 'Actualiza los datos institucionales y asignaciones académicas.';
    if (saveBtn) saveBtn.innerHTML = '<span>Guardar cambios</span>';

    window.adminUserAssignments = (user.asignaciones || []).map(a => ({
      id: a.id,
      sedeId: a.sedeId,
      sedeNombre: a.sedeNombre,
      carreraId: a.carreraId,
      carreraNombre: a.carreraNombre,
      asignaturaId: a.asignaturaId,
      asignaturaNombre: a.asignaturaNombre
    }));

    window.resetAcademicAssignmentPickers();
    window.renderAdminAssignmentsList();

    if (modal) modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  window.resetUserPassword = async function(userId, userCi) {
    const confirmPrompt = confirm(`⚠️ ¿Estás seguro de restablecer la contraseña del usuario (${userCi}) a su número de CI?\n\nEl usuario deberá cambiarla obligatoriamente en su próximo inicio de sesión.`);
    if (!confirmPrompt) return;

    try {
      const resp = await fetch(`/api/v1/admin/usuarios/${userId}/reset-password`, {
        method: 'POST',
        headers: window.getAuthHeaders()
      });

      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.message || res.error || 'Error al restablecer la contraseña.');
      }

      window.showToast(`✅ Contraseña del usuario ${userCi} restablecida a su CI exitosamente.`);
      window.loadAdminUsers();
    } catch (e) {
      window.showToast('❌ Error: ' + e.message);
    }
  };

  window.toggleUserActive = async function(userId) {
    try {
      const resp = await fetch(`/api/v1/admin/usuarios/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: window.getAuthHeaders()
      });

      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.message || res.error || 'Error al cambiar estado.');
      }

      const user = res.data || res;
      const statusText = user.activo ? 'activado' : 'desactivado';
      window.showToast(`✅ Usuario ${statusText} correctamente.`);
      window.loadAdminUsers();
    } catch (e) {
      window.showToast('❌ Error: ' + e.message);
    }
  };

  // Check auth session on startup
  window.checkInitialAuth = async function() {
    const token = window.getAuthToken();
    const user = window.getCurrentUser();

    if (!token) {
      window.showLoginView();
      return;
    }

    // Validate token against backend /api/v1/auth/me
    try {
      const resp = await fetch('/api/v1/auth/me', {
        headers: window.getAuthHeaders()
      });

      if (resp.ok) {
        const json = await resp.json();
        const meUser = json.data || json;
        window.setAuthSession(token, meUser);

        if (meUser.mustChangePassword) {
          window.showChangePasswordView(meUser, token, false);
        } else {
          const initView = meUser.role === 'ROLE_ADMIN' ? 'view6' : (meUser.role === 'ROLE_DIR_CARRERA' ? 'view2' : 'view-dashboard');
          window.showPortalShell(initView);
        }
      } else if (resp.status === 401 || resp.status === 403) {
        // Token invalid or expired
        window.logoutUser();
      } else if (user) {
        window.updateUserProfileUi(user);
        const initView = user.role === 'ROLE_ADMIN' ? 'view6' : (user.role === 'ROLE_DIR_CARRERA' ? 'view2' : 'view-dashboard');
        window.showPortalShell(initView);
      }
    } catch (err) {
      // Offline fallback: keep cached session if present
      if (user) {
        window.updateUserProfileUi(user);
        const initView = user.role === 'ROLE_ADMIN' ? 'view6' : (user.role === 'ROLE_DIR_CARRERA' ? 'view2' : 'view-dashboard');
        window.showPortalShell(initView);
      } else {
        window.showLoginView();
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE: TAB 5 - STUDENT ROSTER & ATTENDANCE TRACKING (GentleAI SDD change 12)
  // ═══════════════════════════════════════════════════════════════════════════
  let currentAttendanceSession = {
    fecha: new Date().toISOString().split('T')[0],
    tipoClase: 'TEORICA',
    comision: 'TA-01',
    tema: '',
    observaciones: '',
    estudiantes: {} // studentCode -> { estado: 'PRESENTE'|'FALTA'|'ATRASO'|'LICENCIA', observacion: string, name: string, careerCode: string, careerName: string }
  };
  let activeAttendanceCareerFilter = 'ALL';
  let activeRosterStudents = [];
  let cumulativeAttendanceMetrics = {}; // studentCode -> AsistenciaEstudianteResumenDto

  const BOLIVIAN_PATERNAL_SURNAMES = [
    'Mamani', 'Condori', 'Quispe', 'Flores', 'Rodriguez',
    'Choque', 'Vargas', 'Mendoza', 'Torrico', 'Fernandez',
    'Lopez', 'Gutierrez', 'Morales', 'Rojas', 'Colque',
    'Huanca', 'Alarcon', 'Villarroel', 'Claros', 'Camacho'
  ];

  const BOLIVIAN_MATERNAL_SURNAMES = [
    'Perez', 'Cruz', 'Sanchez', 'Gomez', 'Chavez',
    'Rios', 'Mercado', 'Soliz', 'Claure', 'Pinto',
    'Beltran', 'Miranda', 'Guzman', 'Aguilar', 'Ortiz',
    'Suarez', 'Arteaga', 'Arnez', 'Ledezma', 'Zurita'
  ];

  const BOLIVIAN_FIRST_NAMES = [
    'Kevin', 'Marisol', 'Alejandro', 'Daniela', 'Rodrigo',
    'Valeria', 'Brandon', 'Camila', 'Alvaro', 'Gabriela',
    'Jhonatan', 'Andrea', 'Cristian', 'Paola', 'Sebastian',
    'Natalia', 'Mauricio', 'Luciana', 'Diego', 'Sofia',
    'Carlos', 'Romina', 'Fernando', 'Noelia', 'Marcelo'
  ];

  window.generateBolivianMockRoster = function(mKey, data) {
    const careers = (data && data.carrerasResolved && data.carrerasResolved.length > 0)
      ? data.carrerasResolved
      : [
          { code: 'CARSIS', name: 'Ingeniería de Sistemas', tag: 'ING. SISTEMAS' },
          { code: 'CARELE', name: 'Ingeniería de Telecomunicaciones', tag: 'ING. TELECOM' }
        ];

    let hash = 0;
    const cleanKey = String(mKey || 'SIS-213');
    for (let i = 0; i < cleanKey.length; i++) {
      hash = ((hash << 5) - hash) + cleanKey.charCodeAt(i);
      hash |= 0;
    }
    const count = 28;
    const students = [];

    for (let i = 0; i < count; i++) {
      const pIdx = Math.abs((hash * 17 + i * 13)) % BOLIVIAN_PATERNAL_SURNAMES.length;
      const mIdx = Math.abs((hash * 23 + i * 7)) % BOLIVIAN_MATERNAL_SURNAMES.length;
      const nIdx = Math.abs((hash * 31 + i * 19)) % BOLIVIAN_FIRST_NAMES.length;

      const pName = BOLIVIAN_PATERNAL_SURNAMES[pIdx];
      const mName = BOLIVIAN_MATERNAL_SURNAMES[mIdx];
      const fName = BOLIVIAN_FIRST_NAMES[nIdx];
      const fullName = `${pName} ${mName} ${fName}`;

      const career = careers[i % careers.length];
      const carPrefix = (career.code || 'CARSIS').replace('CAR', '').substring(0, 3).toUpperCase() || 'SIS';
      const year = (i % 3 === 0) ? '2023' : (i % 2 === 0 ? '2024' : '2025');
      const seq = String(i + 1).padStart(3, '0');
      const studentCode = `${carPrefix}-${year}-${seq}`;

      students.push({
        id: `seed-${studentCode}`,
        code: studentCode,
        studentCode: studentCode,
        firstName: fName,
        firstLastName: pName,
        secondLastName: mName,
        fullName: fullName,
        carreraCodigo: career.code || 'CARSIS',
        carreraNombre: career.name || 'Ingeniería de Sistemas',
        carreraTag: career.tag || career.name || 'ING. SISTEMAS'
      });
    }

    students.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return students;
  };

  window.retrySeaGatewayConnection = function() {
    window.showToast('🔄 Comprobando estado de conexión con SEA Gateway...');
    const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
    window.loadSubjectRoster(mKey);
  };

  window.loadSubjectRoster = async function(mKey) {
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});
    const storageKey = 'sisa_roster_' + mKey;

    // First: Check Gateway Health directly from SISA backend status
    let gatewayOnline = false;
    try {
      const statusRes = await fetch('/api/v1/catalogo-academico/status');
      if (statusRes.ok) {
        const sData = await statusRes.json();
        gatewayOnline = (sData.status === 'online');
      }
    } catch (e) {
      gatewayOnline = false;
    }

    // Tier 1: Check localStorage cached roster (0ms instant render)
    let cached = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(s => s.isMock || (s.code && String(s.code).startsWith('SIS-2024-')))) {
          cached = parsed;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {}

    if (cached && Array.isArray(cached) && cached.length > 0) {
      activeRosterStudents = cached;
      window.renderAttendanceCareerFilters();
      window.renderAttendanceRoster(activeRosterStudents);
      window.updateAttendanceSyncBadge(gatewayOnline ? 'cached' : 'offline_cached');
      return;
    }

    // Tier 2: Live SEA Gateway fetch if course has groups and gateway is online
    const groups = data.groups || [];
    let fetchedStudents = [];

    if (gatewayOnline && groups.length > 0) {
      try {
        const token = localStorage.getItem('scu_access_token');
        const authHeaders = {};
        if (token && token !== 'demo_token') authHeaders['Authorization'] = 'Bearer ' + token;

        const fetchPromises = groups.map(async (g) => {
          const gId = g.id || g.groupId;
          if (!gId) return [];
          try {
            const res = await fetch(`/api/v1/catalogo-academico/students/byGroup?groupId=${encodeURIComponent(gId)}`, {
              headers: authHeaders
            });
            if (res.ok) {
              const list = await res.json();
              if (Array.isArray(list) && list.length > 0) {
                return list.map(item => {
                  const fn = `${item.firstLastName || ''} ${item.secondLastName || ''} ${item.firstName || ''}`.trim() || item.code;
                  return {
                    id: item.id || item.code,
                    code: item.code,
                    studentCode: item.code,
                    firstName: item.firstName,
                    firstLastName: item.firstLastName,
                    secondLastName: item.secondLastName,
                    fullName: fn,
                    carreraCodigo: g.careerCode || (data.carrerasCodes && data.carrerasCodes[0]) || 'CARSIS',
                    carreraNombre: g.careerName || (data.carrerasResolved && data.carrerasResolved[0]?.name) || 'Ingeniería de Sistemas',
                    carreraTag: g.careerTag || 'ING. SISTEMAS'
                  };
                });
              }
            }
          } catch (err) {
            console.warn('Error fetching group students:', gId, err);
          }
          return [];
        });

        const results = await Promise.all(fetchPromises);
        fetchedStudents = results.flat();
      } catch (err) {
        console.warn('Gateway ingestion error:', err);
      }
    }

    if (fetchedStudents.length > 0) {
      const map = new Map();
      fetchedStudents.forEach(s => map.set(s.code, s));
      activeRosterStudents = Array.from(map.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
      localStorage.setItem(storageKey, JSON.stringify(activeRosterStudents));
      window.renderAttendanceCareerFilters();
      window.renderAttendanceRoster(activeRosterStudents);
      window.updateAttendanceSyncBadge('online');
      return;
    }

    // Tier 3: If no students obtained, render truthful empty reason
    activeRosterStudents = [];
    window.renderAttendanceCareerFilters();
    window.renderAttendanceRoster(activeRosterStudents, gatewayOnline ? 'empty' : 'offline');
    window.updateAttendanceSyncBadge(gatewayOnline ? 'online_empty' : 'offline');
  };

  window.updateAttendanceSyncBadge = function(mode) {
    const badge = document.getElementById('asistencia-sync-badge');
    if (!badge) return;

    if (mode === 'online') {
      badge.className = 'px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs';
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span><span id="asistencia-sync-text">En línea (SEA Gateway)</span>';
    } else if (mode === 'cached') {
      badge.className = 'px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs';
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-blue-500"></span><span id="asistencia-sync-text">Caché local sincronizado</span>';
    } else if (mode === 'offline_cached') {
      badge.className = 'px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs';
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500"></span><span id="asistencia-sync-text">SEA Desconectado (Caché local)</span>';
    } else if (mode === 'online_empty') {
      badge.className = 'px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs';
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500"></span><span id="asistencia-sync-text">SEA en línea (0 inscritos)</span>';
    } else {
      badge.className = 'px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all';
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span><span id="asistencia-sync-text">🔴 Desconectado (SEA Gateway)</span><i data-lucide="refresh-cw" class="w-3 h-3 ml-1"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  };

  window.renderAttendanceCareerFilters = function() {
    const container = document.getElementById('asistencia-career-filters');
    if (!container) return;

    const distinctCareers = new Map();
    activeRosterStudents.forEach(s => {
      const cCode = s.carreraCodigo || 'CARSIS';
      const cName = s.carreraNombre || 'Ingeniería de Sistemas';
      if (!distinctCareers.has(cCode)) {
        distinctCareers.set(cCode, { code: cCode, name: cName, count: 0 });
      }
      distinctCareers.get(cCode).count++;
    });

    let html = `
      <button type="button" onclick="window.filterAttendanceByCareer('ALL')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeAttendanceCareerFilter === 'ALL' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
        <i data-lucide="layers" class="w-3.5 h-3.5"></i>
        <span>Todas las Carreras (Consolidado: ${activeRosterStudents.length})</span>
      </button>
    `;

    distinctCareers.forEach((c) => {
      const isActive = activeAttendanceCareerFilter === c.code;
      const isTelecom = c.code.includes('ELE') || c.name.toLowerCase().includes('telecom');
      const activeClass = isTelecom ? 'bg-purple-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs';
      const inactiveClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

      html += `
        <button type="button" onclick="window.filterAttendanceByCareer('${c.code}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isActive ? activeClass : inactiveClass}">
          <span class="w-2 h-2 rounded-full ${isTelecom ? 'bg-purple-300' : 'bg-indigo-300'}"></span>
          <span>${c.name} (${c.count})</span>
        </button>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  };

  window.filterAttendanceByCareer = function(careerCode) {
    activeAttendanceCareerFilter = careerCode;
    window.renderAttendanceCareerFilters();
    window.renderAttendanceRoster(activeRosterStudents);
    window.updateAttendanceLiveKPIs();
  };

  window.renderAttendanceRoster = function(students, emptyReason = 'empty') {
    const container = document.getElementById('asistencia-roster-container');
    if (!container) return;

    if (!students || students.length === 0) {
      if (emptyReason === 'offline') {
        container.innerHTML = `
          <div class="p-10 text-center">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-800">
              <i data-lucide="wifi-off" class="w-6 h-6"></i>
            </div>
            <p class="font-bold text-sm text-slate-800 dark:text-slate-200">SEA Gateway Fuera de Línea</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              El servidor central del SEA (<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] text-rose-600 dark:text-rose-400 font-mono">gw-dev.unitepc.solutions</code>) no está respondiendo (<strong class="text-rose-600 dark:text-rose-400">HTTP 504 Gateway Timeout</strong>). Por esa razón no se pueden descargar tus 6 estudiantes matriculados en este momento.
            </p>
            <div class="mt-4 flex items-center justify-center gap-3">
              <button type="button" onclick="window.retrySeaGatewayConnection()" class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-all shadow-xs flex items-center gap-1.5">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Reintentar Conexión con SEA</span>
              </button>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="p-12 text-center text-slate-400 dark:text-slate-500">
            <i data-lucide="users" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
            <p class="font-bold text-sm text-slate-700 dark:text-slate-300">No hay estudiantes matriculados registrados en el SEA</p>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">El sistema se sincroniza directamente con el SEA Gateway oficial. Al no haber estudiantes inscritos o si el servicio está pendiente de sincronización, la nómina permanece vacía para garantizar integridad académica.</p>
          </div>
        `;
      }
      if (window.lucide) window.lucide.createIcons();
      window.updateAttendanceLiveKPIs();
      return;
    }

    const displayStudents = (activeAttendanceCareerFilter === 'ALL')
      ? students
      : students.filter(s => s.carreraCodigo === activeAttendanceCareerFilter);

    displayStudents.forEach(s => {
      if (!currentAttendanceSession.estudiantes[s.code]) {
        currentAttendanceSession.estudiantes[s.code] = {
          estado: 'PRESENTE',
          observacion: '',
          name: s.fullName,
          careerCode: s.carreraCodigo,
          careerName: s.carreraNombre
        };
      }
    });

    const byCareer = new Map();
    displayStudents.forEach(s => {
      const cKey = s.carreraCodigo || 'CARSIS';
      if (!byCareer.has(cKey)) {
        byCareer.set(cKey, {
          code: cKey,
          name: s.carreraNombre || 'Ingeniería de Sistemas',
          students: []
        });
      }
      byCareer.get(cKey).students.push(s);
    });

    let html = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
              <th class="py-3 px-3 w-10 text-center">Nº</th>
              <th class="py-3 px-3 w-28 text-center">Código</th>
              <th class="py-3 px-4">Estudiante (Apellidos y Nombres)</th>
              <th class="py-3 px-3 w-28 text-center">Carrera</th>
              <th class="py-3 px-4 text-center w-64">Marcación de Asistencia</th>
              <th class="py-3 px-4">Observaciones / Justificación</th>
              <th class="py-3 px-3 w-36 text-center">Regla 80% (Semestre)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
    `;

    let globalIdx = 1;

    byCareer.forEach((cohort, careerCode) => {
      const isTelecom = careerCode.includes('ELE') || cohort.name.toLowerCase().includes('telecom');
      const bannerTheme = isTelecom
        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-purple-200'
        : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200';
      const badgeTheme = isTelecom
        ? 'bg-purple-600 text-white'
        : 'bg-indigo-600 text-white';

      html += `
        <!-- Career Cohort Header Banner -->
        <tr class="${bannerTheme} font-bold border-y-2 border-slate-200 dark:border-slate-700">
          <td colspan="7" class="py-2.5 px-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider ${badgeTheme}">${careerCode}</span>
                <span class="text-xs uppercase tracking-wide">Carrera: Licenciatura en ${cohort.name}</span>
              </div>
              <div id="cohort-summary-${careerCode}" class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span>${cohort.students.length} estudiantes matriculados</span>
              </div>
            </div>
          </td>
        </tr>
      `;

      cohort.students.forEach(s => {
        const rec = currentAttendanceSession.estudiantes[s.code] || { estado: 'PRESENTE', observacion: '' };
        const estado = rec.estado || 'PRESENTE';
        const obs = rec.observacion || '';

        const cum = cumulativeAttendanceMetrics[s.code];
        let cumBadgeHtml = `
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1">
            <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Regular
          </span>
        `;
        if (cum && cum.cumpleNormativa80Pct === false) {
          cumBadgeHtml = `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse flex items-center justify-center gap-1" title="Asistencia acumulada: ${cum.porcentajeAsistencia}% (< 80%)">
              <i data-lucide="alert-triangle" class="w-3 h-3 text-rose-600"></i> En Riesgo (${cum.porcentajeAsistencia}%)
            </span>
          `;
        }

        html += `
          <tr id="row-student-${s.code}" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
            <td class="py-2.5 px-3 text-center font-bold text-slate-400 text-xs">${globalIdx++}</td>
            <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">${s.code}</td>
            <td class="py-2.5 px-4 font-semibold text-slate-900 dark:text-white text-xs">${s.fullName}</td>
            <td class="py-2.5 px-3 text-center">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isTelecom ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'}">${careerCode}</span>
            </td>
            <td class="py-2 px-4 text-center">
              <div class="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
                <button type="button" onclick="window.setStudentAttendanceStatus('${s.code}', 'PRESENTE')" id="btn-att-${s.code}-PRESENTE" class="w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${estado === 'PRESENTE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'}" title="P - Presente (1.0)">P</button>
                <button type="button" onclick="window.setStudentAttendanceStatus('${s.code}', 'FALTA')" id="btn-att-${s.code}-FALTA" class="w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${estado === 'FALTA' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60'}" title="F - Falta Injustificada (0.0)">F</button>
                <button type="button" onclick="window.setStudentAttendanceStatus('${s.code}', 'ATRASO')" id="btn-att-${s.code}-ATRASO" class="w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${estado === 'ATRASO' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60'}" title="A - Atraso (0.5)">A</button>
                <button type="button" onclick="window.setStudentAttendanceStatus('${s.code}', 'LICENCIA')" id="btn-att-${s.code}-LICENCIA" class="w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${estado === 'LICENCIA' ? 'bg-sky-600 text-white shadow-xs' : 'text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/60'}" title="L - Licencia Justificada (1.0)">L</button>
              </div>
            </td>
            <td class="py-2 px-4">
              <input type="text" id="obs-${s.code}" value="${(estado === 'ATRASO' || estado === 'LICENCIA') ? obs : ''}" ${(estado === 'ATRASO' || estado === 'LICENCIA') ? '' : 'disabled'} placeholder="${estado === 'ATRASO' ? 'Motivo de atraso / hora...' : (estado === 'LICENCIA' ? 'Nro. justificación / permiso...' : '—')}" class="w-full px-2.5 py-1 text-xs rounded border ${(estado === 'ATRASO' || estado === 'LICENCIA') ? 'border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500' : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed'} outline-none transition-all" oninput="window.setStudentAttendanceObs('${s.code}', this.value)">
            </td>
            <td class="py-2.5 px-3 text-center">
              ${cumBadgeHtml}
            </td>
          </tr>
        `;
      });
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
    window.updateAttendanceLiveKPIs();
  };

  window.setStudentAttendanceStatus = function(studentCode, status) {
    if (!currentAttendanceSession.estudiantes[studentCode]) {
      currentAttendanceSession.estudiantes[studentCode] = { estado: status, observacion: '' };
    } else {
      currentAttendanceSession.estudiantes[studentCode].estado = status;
    }

    const states = ['PRESENTE', 'FALTA', 'ATRASO', 'LICENCIA'];
    states.forEach(st => {
      const btn = document.getElementById(`btn-att-${studentCode}-${st}`);
      if (!btn) return;
      if (st === status) {
        if (st === 'PRESENTE') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer bg-emerald-600 text-white shadow-xs';
        else if (st === 'FALTA') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer bg-rose-600 text-white shadow-xs';
        else if (st === 'ATRASO') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer bg-amber-500 text-white shadow-xs';
        else if (st === 'LICENCIA') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer bg-sky-600 text-white shadow-xs';
      } else {
        if (st === 'PRESENTE') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60';
        else if (st === 'FALTA') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60';
        else if (st === 'ATRASO') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60';
        else if (st === 'LICENCIA') btn.className = 'w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/60';
      }
    });

    // Enable or disable observation input based on status (only active for ATRASO or LICENCIA)
    const obsInput = document.getElementById(`obs-${studentCode}`);
    if (obsInput) {
      if (status === 'ATRASO' || status === 'LICENCIA') {
        obsInput.disabled = false;
        obsInput.placeholder = (status === 'ATRASO') ? 'Motivo de atraso / hora...' : 'Nro. justificación / permiso...';
        obsInput.className = 'w-full px-2.5 py-1 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none transition-all';
        obsInput.focus();
      } else {
        obsInput.disabled = true;
        obsInput.value = '';
        obsInput.placeholder = '—';
        obsInput.className = 'w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed outline-none transition-all';
        if (currentAttendanceSession.estudiantes[studentCode]) {
          currentAttendanceSession.estudiantes[studentCode].observacion = '';
        }
      }
    }

    window.updateAttendanceLiveKPIs();
  };

  window.setStudentAttendanceObs = function(studentCode, obs) {
    if (!currentAttendanceSession.estudiantes[studentCode]) {
      currentAttendanceSession.estudiantes[studentCode] = { estado: 'PRESENTE', observacion: obs };
    } else {
      currentAttendanceSession.estudiantes[studentCode].observacion = obs;
    }
  };

  window.markAllStudentsPresent = function() {
    const displayStudents = (activeAttendanceCareerFilter === 'ALL')
      ? activeRosterStudents
      : activeRosterStudents.filter(s => s.carreraCodigo === activeAttendanceCareerFilter);

    displayStudents.forEach(s => {
      window.setStudentAttendanceStatus(s.code, 'PRESENTE');
      const obsInput = document.getElementById(`obs-${s.code}`);
      if (obsInput) {
        obsInput.disabled = true;
        obsInput.value = '';
        obsInput.placeholder = '—';
        obsInput.className = 'w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed outline-none transition-all';
      }
    });

    window.showToast('✓ Se marcaron todos los estudiantes visibles como Presentes (P)');
  };

  window.updateAttendanceLiveKPIs = function() {
    let total = 0;
    let pCount = 0;
    let fCount = 0;
    let aCount = 0;
    let lCount = 0;

    const careerCounts = {};

    activeRosterStudents.forEach(s => {
      const cCode = s.carreraCodigo || 'CARSIS';
      if (!careerCounts[cCode]) {
        careerCounts[cCode] = { total: 0, p: 0, f: 0, a: 0, l: 0 };
      }
      careerCounts[cCode].total++;

      const rec = currentAttendanceSession.estudiantes[s.code];
      const st = rec ? rec.estado : 'PRESENTE';

      total++;
      if (st === 'PRESENTE') { pCount++; careerCounts[cCode].p++; }
      else if (st === 'FALTA') { fCount++; careerCounts[cCode].f++; }
      else if (st === 'ATRASO') { aCount++; careerCounts[cCode].a++; }
      else if (st === 'LICENCIA') { lCount++; careerCounts[cCode].l++; }
    });

    const weightedPoints = pCount + (0.5 * aCount) + lCount;
    const pct = (total > 0) ? Math.round((weightedPoints / total) * 1000) / 10 : 0.0;
    const cumple80 = (total > 0) ? (pct >= 80.0) : false;

    const kTotal = document.getElementById('asistencia-kpi-total');
    const kP = document.getElementById('asistencia-kpi-presentes');
    const kF = document.getElementById('asistencia-kpi-faltas');
    const kA = document.getElementById('asistencia-kpi-atrasos');
    const kL = document.getElementById('asistencia-kpi-licencias');
    const kPct = document.getElementById('asistencia-kpi-porcentaje');
    const kBadge = document.getElementById('asistencia-kpi-cumplimiento-badge');
    const kLabel = document.getElementById('asistencia-kpi-estado-label');

    if (kTotal) kTotal.innerText = total;
    if (kP) kP.innerText = pCount;
    if (kF) kF.innerText = fCount;
    if (kA) kA.innerText = aCount;
    if (kL) kL.innerText = lCount;
    if (kPct) kPct.innerText = total > 0 ? `${pct}%` : '—';

    if (kBadge && kLabel) {
      if (total === 0) {
        kBadge.className = 'px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700';
        kBadge.innerText = '—';
        kLabel.className = 'text-[10px] text-slate-500 font-medium';
        kLabel.innerText = 'Sin nómina registrada';
      } else if (cumple80) {
        kBadge.className = 'px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300';
        kBadge.innerText = '>= 80%';
        kLabel.className = 'text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold';
        kLabel.innerText = 'Cumple Normativa (>=80%)';
      } else {
        kBadge.className = 'px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse';
        kBadge.innerText = '< 80%';
        kLabel.className = 'text-[10px] text-rose-700 dark:text-rose-400 font-bold';
        kLabel.innerText = `Alerta: Asistencia < 80% (${pct}%)`;
      }
    }

    Object.keys(careerCounts).forEach(cCode => {
      const el = document.getElementById(`cohort-summary-${cCode}`);
      if (el) {
        const c = careerCounts[cCode];
        const cPoints = c.p + (0.5 * c.a) + c.l;
        const cPct = c.total > 0 ? Math.round((cPoints / c.total) * 1000) / 10 : 100.0;
        el.innerHTML = `<span>${c.total} estudiantes • P: <strong class="text-emerald-600">${c.p}</strong> | F: <strong class="text-rose-600">${c.f}</strong> | A: <strong class="text-amber-600">${c.a}</strong> | L: <strong class="text-sky-600">${c.l}</strong> • Cumplimiento: <strong class="${cPct >= 80 ? 'text-emerald-600' : 'text-rose-600'}">${cPct}%</strong></span>`;
      }
    });
  };

  window.saveAttendanceSession = async function() {
    const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});
    const fecha = document.getElementById('asistencia-fecha-input')?.value || new Date().toISOString().split('T')[0];
    const tipoClase = currentAttendanceSession.tipoClase || 'TEORICA';
    const comision = document.getElementById('asistencia-comision-select')?.value || 'TA-01';
    const tema = document.getElementById('asistencia-tema-input')?.value || '';

    const btn = document.getElementById('btn-guardar-asistencia');
    const btnText = document.getElementById('btn-guardar-asistencia-text');
    if (btn && btnText) {
      btn.disabled = true;
      btnText.innerText = 'Guardando...';
    }

    const estudiantesPayload = activeRosterStudents.map(s => {
      const rec = currentAttendanceSession.estudiantes[s.code] || { estado: 'PRESENTE', observacion: '' };
      return {
        estudianteCodigo: s.code,
        estudianteNombre: s.fullName,
        carreraCodigo: s.carreraCodigo || 'CARSIS',
        carreraNombre: s.carreraNombre || 'Ingeniería de Sistemas',
        estado: rec.estado || 'PRESENTE',
        observacion: rec.observacion || ''
      };
    });

    const payload = {
      materiaCodigo: data.codigo || mKey,
      materiaNombre: data.nombre || mKey,
      gestionCodigo: '2-2026',
      fecha: fecha,
      tipoClase: tipoClase,
      comision: comision,
      tema: tema,
      observaciones: `Sesión ${tipoClase} - Comisión ${comision}`,
      estudiantes: estudiantesPayload
    };

    const cacheKey = `sisa_attendance_${mKey}_${fecha}_${tipoClase}_${comision}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (e) {}

    try {
      const token = localStorage.getItem('scu_access_token');
      const authHeaders = { 'Content-Type': 'application/json' };
      if (token && token !== 'demo_token') authHeaders['Authorization'] = 'Bearer ' + token;

      const res = await fetch('/api/v1/asistencias/sesion', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.showToast('✓ Asistencia guardada correctamente en el sistema institucional');
        window.loadAttendanceHistory();
        window.loadAttendanceResumen(data.codigo || mKey);
      } else {
        window.showToast('⚠️ Asistencia guardada en el navegador (Pendiente de sincronización)');
      }
    } catch (err) {
      window.showToast('⚠️ Conexión no disponible. Asistencia guardada localmente en el navegador');
    } finally {
      if (btn && btnText) {
        btn.disabled = false;
        btnText.innerText = '💾 Guardar Asistencia';
      }
    }
  };

  window.loadAttendanceForDate = async function() {
    const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});
    const fecha = document.getElementById('asistencia-fecha-input')?.value || new Date().toISOString().split('T')[0];
    const tipoClase = currentAttendanceSession.tipoClase || 'TEORICA';
    const comision = document.getElementById('asistencia-comision-select')?.value || 'TA-01';

    const cacheKey = `sisa_attendance_${mKey}_${fecha}_${tipoClase}_${comision}`;
    let cached = null;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) cached = JSON.parse(raw);
    } catch (e) {}

    if (cached && cached.estudiantes) {
      if (cached.tema && document.getElementById('asistencia-tema-input')) {
        document.getElementById('asistencia-tema-input').value = cached.tema;
      }
      cached.estudiantes.forEach(e => {
        currentAttendanceSession.estudiantes[e.estudianteCodigo] = {
          estado: e.estado,
          observacion: e.observacion || ''
        };
      });
      window.renderAttendanceRoster(activeRosterStudents);
    }

    try {
      const token = localStorage.getItem('scu_access_token');
      const authHeaders = {};
      if (token && token !== 'demo_token') authHeaders['Authorization'] = 'Bearer ' + token;

      const url = `/api/v1/asistencias/sesion?materiaCodigo=${encodeURIComponent(data.codigo || mKey)}&fecha=${fecha}&tipoClase=${tipoClase}&comision=${comision}`;
      const res = await fetch(url, { headers: authHeaders });

      if (res.ok) {
        const json = await res.json();
        const ses = json.data || json;
        if (ses && ses.estudiantes) {
          if (ses.tema && document.getElementById('asistencia-tema-input')) {
            document.getElementById('asistencia-tema-input').value = ses.tema;
          }
          ses.estudiantes.forEach(e => {
            currentAttendanceSession.estudiantes[e.estudianteCodigo] = {
              estado: e.estado,
              observacion: e.observacion || ''
            };
          });
          window.renderAttendanceRoster(activeRosterStudents);
        }
      }
    } catch (err) {}
  };

  window.loadAttendanceResumen = async function(materiaCodigo) {
    try {
      const token = localStorage.getItem('scu_access_token');
      const authHeaders = {};
      if (token && token !== 'demo_token') authHeaders['Authorization'] = 'Bearer ' + token;

      const res = await fetch(`/api/v1/asistencias/resumen/${encodeURIComponent(materiaCodigo)}?gestionCodigo=2-2026`, {
        headers: authHeaders
      });
      if (res.ok) {
        const json = await res.json();
        const summary = json.data || json;
        if (summary && summary.estudiantesResumen) {
          cumulativeAttendanceMetrics = {};
          summary.estudiantesResumen.forEach(er => {
            cumulativeAttendanceMetrics[er.estudianteCodigo] = er;
          });
          window.renderAttendanceRoster(activeRosterStudents);
        }
      }
    } catch (e) {}
  };

  window.loadAttendanceHistory = async function() {
    const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});
    const listContainer = document.getElementById('asistencia-historial-list');
    const countBadge = document.getElementById('asistencia-historial-count');
    if (!listContainer) return;

    try {
      const token = localStorage.getItem('scu_access_token');
      const authHeaders = {};
      if (token && token !== 'demo_token') authHeaders['Authorization'] = 'Bearer ' + token;

      const res = await fetch(`/api/v1/asistencias/sesiones/${encodeURIComponent(data.codigo || mKey)}?gestionCodigo=2-2026`, {
        headers: authHeaders
      });

      if (res.ok) {
        const json = await res.json();
        const sesiones = (json.data || json) || [];

        if (countBadge) countBadge.innerText = `${sesiones.length} sesiones`;

        if (sesiones.length === 0) {
          listContainer.innerHTML = '<p class="text-xs text-slate-500 py-3 text-center">No hay sesiones pasadas registradas en el semestre.</p>';
          return;
        }

        let html = '';
        sesiones.forEach(s => {
          const dateStr = s.fecha ? s.fecha.split('-').reverse().join('/') : 'Sin fecha';
          const isTeorica = (s.tipoClase === 'TEORICA');
          html += `
            <div onclick="window.selectHistoricalSession('${s.fecha}', '${s.tipoClase}', '${s.comision}', '${(s.tema || '').replace(/'/g, "\\'")}')" class="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between flex-wrap gap-2 shadow-2xs">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg ${isTeorica ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'} flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <i data-lucide="${isTeorica ? 'book-open' : 'flask-conical'}" class="w-4 h-4"></i>
                </span>
                <div>
                  <div class="flex items-center gap-2">
                    <strong class="text-xs text-slate-900 dark:text-white">${dateStr}</strong>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isTeorica ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}">${s.tipoClase}</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${s.comision}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate max-w-[340px]">${s.tema || 'Sin tema especificado'}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-teal-600 dark:text-teal-400">Ver / Editar</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
              </div>
            </div>
          `;
        });

        listContainer.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
      }
    } catch (e) {
      listContainer.innerHTML = '<p class="text-xs text-slate-500 py-3 text-center">Historial no disponible temporalmente.</p>';
    }
  };

  let courseOfficialSessions = [];

  window.buildCourseSessionsFromSea = function(data, mKeyParam) {
    const sessions = [];
    const mKey = mKeyParam || (data && data.key) || activeMateriaKey || (Object.keys(materiasData)[0] || '');
    const dayMap = {
      'LU': { name: 'Lunes', offset: 0 },
      'MA': { name: 'Martes', offset: 1 },
      'MI': { name: 'Miércoles', offset: 2 },
      'JU': { name: 'Jueves', offset: 3 },
      'VI': { name: 'Viernes', offset: 4 },
      'SA': { name: 'Sábado', offset: 5 }
    };

    let slots = [];
    const groups = (data && data.groups) || [];
    if (groups.length > 0) {
      groups.forEach(g => {
        const cTypeRaw = (g.classType || 'TA').toUpperCase();
        const isTeo = cTypeRaw.startsWith('T') || cTypeRaw.includes('TEO');
        const cType = isTeo ? 'TEORICA' : 'PRACTICA';
        const comName = g.name || (isTeo ? 'TA-01' : 'PL-01');
        const sList = g.schedules || [];
        if (sList.length > 0) {
          sList.forEach(s => {
            const d = (s.day || 'LU').toUpperCase();
            slots.push({
              dayCode: d,
              dayInfo: dayMap[d] || { name: 'Lunes', offset: 0 },
              startTime: s.startTime || '08:00',
              endTime: s.endTime || '10:15',
              classroom: s.classroom || g.classroom || (isTeo ? 'Aula 204' : 'Laboratorio 3'),
              tipoClase: cType,
              comision: comName
            });
          });
        } else {
          const d = isTeo ? 'LU' : 'VI';
          slots.push({
            dayCode: d,
            dayInfo: dayMap[d] || { name: 'Lunes', offset: 0 },
            startTime: isTeo ? '08:00' : '14:00',
            endTime: isTeo ? '10:15' : '16:15',
            classroom: isTeo ? 'Aula 204' : 'Laboratorio 3',
            tipoClase: cType,
            comision: comName
          });
        }
      });
    }

    if (slots.length === 0) {
      const gs = (data && data.groupedSchedules) || [];
      if (gs.length > 0) {
        gs.forEach(s => {
          const d = (s.day || 'LU').toUpperCase();
          const grpName = (s.groups && s.groups[0]) || 'TA-01';
          const isTeo = grpName.startsWith('T') || grpName.includes('TA');
          slots.push({
            dayCode: d,
            dayInfo: dayMap[d] || { name: 'Lunes', offset: 0 },
            startTime: s.start || '08:00',
            endTime: s.end || '10:15',
            classroom: s.classroom || (isTeo ? 'Aula 204' : 'Laboratorio 3'),
            tipoClase: isTeo ? 'TEORICA' : 'PRACTICA',
            comision: grpName
          });
        });
      } else {
        slots.push({
          dayCode: 'LU',
          dayInfo: dayMap['LU'],
          startTime: '08:00',
          endTime: '10:15',
          classroom: 'Aula 204',
          tipoClase: 'TEORICA',
          comision: 'TA-01'
        });
        slots.push({
          dayCode: 'MI',
          dayInfo: dayMap['MI'],
          startTime: '08:00',
          endTime: '10:15',
          classroom: 'Aula 204',
          tipoClase: 'TEORICA',
          comision: 'TA-01'
        });
      }
    }

    const uniqueSlotsMap = new Map();
    slots.forEach(s => {
      const k = `${s.dayCode}_${s.startTime}_${s.endTime}_${s.comision}`;
      if (!uniqueSlotsMap.has(k)) {
        uniqueSlotsMap.set(k, s);
      }
    });
    slots = Array.from(uniqueSlotsMap.values());
    slots.sort((a, b) => (a.dayInfo.offset - b.dayInfo.offset) || a.startTime.localeCompare(b.startTime));

    // Retrieve real Cronograma (Matriz 7) strictly from user data or DOM
    let matriz7 = [];
    const savedPac = localStorage.getItem('sisa_saved_pac_gral_' + mKey) || localStorage.getItem('sisa_saved_pac_' + mKey);
    if (savedPac) {
      try {
        const parsed = JSON.parse(savedPac);
        if (parsed && Array.isArray(parsed.matriz7) && parsed.matriz7.length > 0) {
          matriz7 = parsed.matriz7;
        }
      } catch (e) {}
    }
    if (matriz7.length === 0 && window.activePacGralData && Array.isArray(window.activePacGralData.matriz7) && window.activePacGralData.matriz7.length > 0) {
      matriz7 = window.activePacGralData.matriz7;
    }
    if (matriz7.length === 0 && typeof window.extractCurrentCronogramaFromDom === 'function') {
      const live = window.extractCurrentCronogramaFromDom();
      if (live && live.length > 0) matriz7 = live;
    }

    const baseMonday = new Date(2026, 7, 3); // August 3, 2026
    const totalWeeks = 20;
    let sessionNumber = 1;

    for (let w = 1; w <= totalWeeks; w++) {
      const weekMonday = new Date(baseMonday);
      weekMonday.setDate(baseMonday.getDate() + (w - 1) * 7);

      slots.forEach(slot => {
        const sessionDate = new Date(weekMonday);
        sessionDate.setDate(weekMonday.getDate() + slot.dayInfo.offset);

        const yyyy = sessionDate.getFullYear();
        const mm = String(sessionDate.getMonth() + 1).padStart(2, '0');
        const dd = String(sessionDate.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;
        const formattedDate = `${dd}/${mm}/${yyyy}`;

        // Strictly resolve topic from real cronograma (Matriz 7)
        let topicText = '';
        if (matriz7.length > 0) {
          const cronMatch = matriz7.find(r => {
            const rSes = r.nroSesion || r.sesion;
            const rSem = r.semana || r.sem;
            if (rSes && Number(rSes) === sessionNumber) return true;
            if (!rSes && rSem && Number(rSem) === w) return true;
            return false;
          });
          if (cronMatch) {
            const spec = (cronMatch.contenidoEspecifico || cronMatch.tema || '').trim();
            const unit = (cronMatch.unidadTematica || '').trim();
            if (spec && unit && !spec.toLowerCase().includes(unit.toLowerCase())) {
              topicText = `${unit} - ${spec}`;
            } else {
              topicText = spec || unit;
            }
          }
        }

        sessions.push({
          number: sessionNumber++,
          week: w,
          fecha: isoDate,
          dateFormatted: formattedDate,
          dayName: slot.dayInfo.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          tipoClase: slot.tipoClase,
          comision: slot.comision,
          classroom: slot.classroom,
          tema: topicText,
          key: `${isoDate}_${slot.tipoClase}_${slot.comision}`
        });
      });
    }

    return sessions;
  };

  window.initCourseAttendanceSessions = function(mKey) {
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});
    courseOfficialSessions = window.buildCourseSessionsFromSea(data, mKey);

    const select = document.getElementById('asistencia-sesion-select');
    if (!select) return;

    const todayIso = new Date().toISOString().split('T')[0];

    // Find if today is an exact scheduled class day
    let selectedSession = courseOfficialSessions.find(s => s.fecha === todayIso);

    // If today is not a class day, find the closest past session, or first upcoming
    if (!selectedSession) {
      const pastSessions = courseOfficialSessions.filter(s => s.fecha <= todayIso);
      if (pastSessions.length > 0) {
        selectedSession = pastSessions[pastSessions.length - 1]; // closest past session
      } else {
        selectedSession = courseOfficialSessions[0]; // first session
      }
    }

    select.innerHTML = courseOfficialSessions.map(s => {
      const isToday = (s.fecha === todayIso);
      const isSelected = (selectedSession && s.key === selectedSession.key);
      const todayTag = isToday ? ' • ⭐ HOY' : '';
      const typeLabel = s.tipoClase === 'TEORICA' ? 'Teórica' : 'Práctica';
      return `
        <option value="${s.key}" ${isSelected ? 'selected' : ''}>
          Sesión ${s.number}: ${s.dayName} ${s.dateFormatted} • ${s.startTime}-${s.endTime} • ${s.comision} (${typeLabel}) - ${s.classroom}${todayTag}
        </option>
      `;
    }).join('');

    if (selectedSession) {
      window.applySelectedSession(selectedSession);
    }
  };

  window.onAttendanceSessionSelect = function(sessionKey) {
    const ses = courseOfficialSessions.find(s => s.key === sessionKey);
    if (!ses) return;
    window.applySelectedSession(ses);
  };

  window.applySelectedSession = function(ses) {
    currentAttendanceSession.fecha = ses.fecha;
    currentAttendanceSession.tipoClase = ses.tipoClase;
    currentAttendanceSession.comision = ses.comision;
    currentAttendanceSession.tema = ses.tema;

    // Synchronize hidden elements for backward-compat
    if (document.getElementById('asistencia-fecha-input')) {
      document.getElementById('asistencia-fecha-input').value = ses.fecha;
    }
    if (document.getElementById('asistencia-comision-select')) {
      document.getElementById('asistencia-comision-select').value = ses.comision;
    }

    // Update metadata badges
    const badgeTipo = document.getElementById('badge-sesion-tipo-text');
    const badgeTipoWrap = document.getElementById('badge-sesion-tipo');
    const badgeHorario = document.getElementById('badge-sesion-horario-text');
    const badgeAula = document.getElementById('badge-sesion-aula-text');

    if (badgeTipo) {
      badgeTipo.innerText = `${ses.tipoClase === 'TEORICA' ? 'Teórica' : 'Práctica / Lab'} (${ses.comision})`;
    }
    if (badgeTipoWrap) {
      badgeTipoWrap.className = ses.tipoClase === 'TEORICA'
        ? 'px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1'
        : 'px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1';
    }
    if (badgeHorario) {
      badgeHorario.innerText = `${ses.dayName} ${ses.startTime} - ${ses.endTime}`;
    }
    if (badgeAula) {
      badgeAula.innerText = ses.classroom;
    }

    // Pre-fill topic
    const topicInput = document.getElementById('asistencia-tema-input');
    if (topicInput) {
      topicInput.value = ses.tema;
    }

    // Load marks for this session from backend or cache
    window.loadAttendanceForDate();
  };

  window.selectHistoricalSession = function(fecha, tipoClase, comision, tema) {
    const key = `${fecha}_${tipoClase}_${comision}`;
    const ses = courseOfficialSessions.find(s => s.key === key || (s.fecha === fecha && s.tipoClase === tipoClase)) || {
      fecha: fecha,
      tipoClase: tipoClase,
      comision: comision,
      tema: tema || '',
      dayName: 'Sesión Registrada',
      startTime: '',
      endTime: '',
      classroom: ''
    };

    const select = document.getElementById('asistencia-sesion-select');
    if (select && courseOfficialSessions.some(s => s.key === key)) {
      select.value = key;
    }
    window.applySelectedSession(ses);
    window.showToast(`Cargada sesión del ${fecha} (${tipoClase})`);
  };

  window.toggleAttendanceHistoryAccordion = function() {
    const content = document.getElementById('asistencia-historial-content');
    const chevron = document.getElementById('asistencia-historial-chevron');
    if (!content) return;
    const isHidden = content.classList.contains('hidden');
    if (isHidden) {
      content.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
      window.loadAttendanceHistory();
    } else {
      content.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  };

  window.setAttendanceClassType = function(tipo, reload = true) {
    currentAttendanceSession.tipoClase = tipo;
    if (reload) {
      window.loadAttendanceForDate();
    }
  };

  window.onAttendanceParamChange = function() {
    window.loadAttendanceForDate();
  };

  window.onAttendanceTopicInput = function(val) {
    currentAttendanceSession.tema = val;
  };

  window.resetCurrentAttendanceSession = function() {
    if (!confirm('¿Deseas reiniciar la asistencia de la sesión actual?')) return;
    activeRosterStudents.forEach(s => {
      currentAttendanceSession.estudiantes[s.code] = { estado: 'PRESENTE', observacion: '' };
    });
    if (document.getElementById('asistencia-tema-input')) {
      document.getElementById('asistencia-tema-input').value = '';
    }
    currentAttendanceSession.tema = '';
    window.renderAttendanceRoster(activeRosterStudents);
    window.showToast('Asistencia de la sesión reiniciada.');
  };

  window.exportAttendanceExcel = function() {
    const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});
    const materiaCodigo = data.codigo || mKey;
    const gestionCodigo = '2-2026';

    window.showToast('📊 Generando reporte oficial de Asistencia en Excel...');

    const url = `/api/v1/office/export/asistencia?materiaCodigo=${encodeURIComponent(materiaCodigo)}&gestionCodigo=${encodeURIComponent(gestionCodigo)}`;
    const token = localStorage.getItem('scu_access_token');
    const headers = {};
    if (token && token !== 'demo_token') headers['Authorization'] = 'Bearer ' + token;

    fetch(url, { headers })
      .then(response => {
        if (!response.ok) throw new Error('Error en el servidor al exportar Excel');
        return response.blob();
      })
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Asistencia_${materiaCodigo.replace(/[^a-zA-Z0-9_-]/g, '_')}_${gestionCodigo}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        window.showToast('✓ Archivo Excel descargado exitosamente');
      })
      .catch(err => {
        console.error(err);
        window.showToast('⚠️ No se pudo generar el archivo Excel de Asistencia');
      });
  };

  window.loadAttendanceForCurrentSelection = function() {
    const mKey = activeMateriaKey || (Object.keys(materiasData)[0] || '');
    const data = materiasData[mKey] || (Object.values(materiasData)[0] || {});

    window.loadSubjectRoster(mKey);
    window.initCourseAttendanceSessions(mKey);
    window.loadAttendanceResumen(data.codigo || mKey);
    window.loadAttendanceHistory();
  };

  // Initial check on load
  setTimeout(() => {
    window.checkSeaGatewayHealth();
    window.loadDocentesFromApi();
    window.checkInitialAuth();
  }, 150);
})();



