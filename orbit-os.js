/**
 * OrbitOS • Modern Web Desktop Environment & Window Management Engine
 * Hybrid Workspace Extension for OrbitSuite
 * Includes Linux Superuser Terminal with `sudo`, Canvas Matrix Digital Rain, and Window Management
 */

class OrbitOS {
  constructor(suite) {
    this.suite = suite;
    this.activeMode = localStorage.getItem('orbit_active_mode') || 'suite'; // 'suite' | 'os'
    this.activeWallpaper = localStorage.getItem('orbit_os_wallpaper') || 'nebula';
    this.windows = new Map();
    this.windowZIndex = 100;
    this.activeWindowId = null;

    // Terminal Linux State
    this.terminalState = {
      isRoot: false,
      isPromptingPassword: false,
      sudoCallback: null,
      failedAttempts: 0
    };

    this.appDefinitions = {
      tasks: {
        name: 'Aufgaben & Kanban',
        icon: '🎯',
        color: '#6366f1',
        isSuiteApp: true,
        suiteViewId: 'app-view-tasks',
        defaultWidth: 900,
        defaultHeight: 620
      },
      notes: {
        name: 'Notizen & Markdown',
        icon: '📝',
        color: '#ec4899',
        isSuiteApp: true,
        suiteViewId: 'app-view-notes',
        defaultWidth: 840,
        defaultHeight: 580
      },
      focus: {
        name: 'Fokus & Pomodoro',
        icon: '⏱️',
        color: '#06b6d4',
        isSuiteApp: true,
        suiteViewId: 'app-view-focus',
        defaultWidth: 680,
        defaultHeight: 560
      },
      habits: {
        name: 'Gewohnheiten & Streaks',
        icon: '🔥',
        color: '#f97316',
        isSuiteApp: true,
        suiteViewId: 'app-view-habits',
        defaultWidth: 780,
        defaultHeight: 560
      },
      riddles: {
        name: 'Denkspiele & Rätsel',
        icon: '🧠',
        color: '#10b981',
        isSuiteApp: true,
        suiteViewId: 'app-view-riddle',
        defaultWidth: 800,
        defaultHeight: 600
      },
      terminal: {
        name: 'Linux Terminal (sudo)',
        icon: '💻',
        color: '#14b8a6',
        isSuiteApp: false,
        defaultWidth: 720,
        defaultHeight: 460
      },
      calculator: {
        name: 'Rechner',
        icon: '🧮',
        color: '#8b5cf6',
        isSuiteApp: false,
        defaultWidth: 320,
        defaultHeight: 440
      },
      matrix: {
        name: 'Matrix Digital Rain',
        icon: '🟢',
        color: '#22c55e',
        isSuiteApp: false,
        defaultWidth: 800,
        defaultHeight: 500
      },
      settings: {
        name: 'OS Einstellungen',
        icon: '⚙️',
        color: '#64748b',
        isSuiteApp: false,
        defaultWidth: 500,
        defaultHeight: 420
      }
    };

    this.init();
  }

  init() {
    this.createDesktopDOM();
    this.bindGlobalEvents();
    this.startClock();

    // Check if user previously was in OS mode
    if (this.activeMode === 'os') {
      this.enableOSMode();
    }
  }

  createDesktopDOM() {
    // 1. Root Element
    this.root = document.createElement('div');
    this.root.id = 'orbit-os-root';
    this.root.className = `os-wallpaper-${this.activeWallpaper}`;

    this.root.innerHTML = `
      <!-- Desktop Area -->
      <div id="orbit-os-desktop">
        <!-- Desktop Icons (Left Side Grid) -->
        <div class="os-desktop-icons" id="os-desktop-icons"></div>

        <!-- Floating Windows Container (Center Layer) -->
        <div id="os-windows-container" style="position: absolute; inset: 0; pointer-events: none; z-index: 50;"></div>

        <!-- Right Side Widgets Column (Non-Overlapping) -->
        <div class="os-desktop-widgets-column" id="os-widgets-col">
          <!-- Clock Widget -->
          <div class="os-widget-clock" id="os-clock-widget">
            <div class="os-widget-clock-time" id="os-clock-time">12:00</div>
            <div class="os-widget-clock-date" id="os-clock-date">Mittwoch, 8. Oktober</div>
          </div>

          <!-- Sticky Note Widget -->
          <div class="os-widget-sticky" id="os-sticky-widget">
            <div class="os-sticky-header">
              <span>📌 Notizzettel</span>
              <span style="font-size: 9px; opacity: 0.8;">Autosave</span>
            </div>
            <textarea class="os-sticky-textarea" id="os-sticky-text" placeholder="Schnelle Notiz direkt auf dem Desktop..."></textarea>
          </div>
        </div>
      </div>

      <!-- Start Menu Flyout -->
      <div id="orbit-os-start-menu">
        <div class="os-start-search">
          <input type="text" class="os-start-search-input" id="os-start-search-input" placeholder="🔍 Apps oder Befehle suchen...">
        </div>
        <div class="os-start-apps-grid" id="os-start-apps-grid"></div>
        <div class="os-start-footer">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div id="os-user-avatar" style="width: 28px; height: 28px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff;">RU</div>
            <span id="os-user-name" style="font-size: 12px; font-weight: 600; color: #e2e8f0;">Rune</span>
          </div>
          <button class="btn-secondary" id="os-btn-start-switch-suite" style="padding: 4px 10px; font-size: 11px;">
            🗖 Zurück zur Suite
          </button>
        </div>
      </div>

      <!-- Taskbar -->
      <footer id="orbit-os-taskbar">
        <div class="os-taskbar-left">
          <button class="os-start-btn" id="os-start-btn">
            <span style="font-size: 16px;">🪐</span>
            <span>OrbitOS</span>
          </button>
          <div class="os-taskbar-apps" id="os-taskbar-apps"></div>
        </div>

        <div class="os-taskbar-right">
          <div class="os-tray-item" id="os-tray-sync" title="Supabase Sync-Status">
            <span class="sync-dot" id="os-tray-sync-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span id="os-tray-sync-text">Cloud</span>
          </div>

          <div class="os-tray-item" id="os-tray-clock">
            <span id="os-taskbar-clock">12:00</span>
          </div>

          <button class="os-tray-item os-btn-switch-workspace" id="os-btn-tray-switch" title="Zum klassischen Workspace wechseln">
            <span>🗖</span>
            <span>Workspace</span>
          </button>
        </div>
      </footer>
    `;

    document.body.appendChild(this.root);

    this.renderDesktopIcons();
    this.renderStartMenuApps();
    this.initStickyWidget();
  }

  renderDesktopIcons() {
    const container = document.getElementById('os-desktop-icons');
    if (!container) return;
    container.innerHTML = '';

    Object.entries(this.appDefinitions).forEach(([appId, def]) => {
      const iconEl = document.createElement('div');
      iconEl.className = 'os-desktop-icon';
      iconEl.dataset.appId = appId;
      iconEl.innerHTML = `
        <div class="os-desktop-icon-badge" style="background: ${def.color}25; border: 1px solid ${def.color}60;">
          ${def.icon}
        </div>
        <div class="os-desktop-icon-label">${def.name}</div>
      `;

      iconEl.addEventListener('dblclick', () => this.openApp(appId));
      iconEl.addEventListener('click', () => {
        if (window.innerWidth < 768) this.openApp(appId);
      });

      container.appendChild(iconEl);
    });
  }

  renderStartMenuApps() {
    const grid = document.getElementById('os-start-apps-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.entries(this.appDefinitions).forEach(([appId, def]) => {
      const item = document.createElement('div');
      item.className = 'os-start-app-item';
      item.innerHTML = `
        <div class="os-start-app-icon" style="background: ${def.color}25; border: 1px solid ${def.color}50;">
          ${def.icon}
        </div>
        <div class="os-start-app-name">${def.name}</div>
      `;
      item.addEventListener('click', () => {
        this.openApp(appId);
        this.toggleStartMenu(false);
      });
      grid.appendChild(item);
    });
  }

  initStickyWidget() {
    const textarea = document.getElementById('os-sticky-text');
    if (!textarea) return;
    textarea.value = localStorage.getItem('orbit_os_sticky') || '';
    textarea.addEventListener('input', () => {
      localStorage.setItem('orbit_os_sticky', textarea.value);
    });
  }

  startClock() {
    const update = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

      const elTime = document.getElementById('os-clock-time');
      const elDate = document.getElementById('os-clock-date');
      const elTaskbarClock = document.getElementById('os-taskbar-clock');

      if (elTime) elTime.textContent = timeStr;
      if (elDate) elDate.textContent = dateStr;
      if (elTaskbarClock) elTaskbarClock.textContent = timeStr;
    };
    update();
    setInterval(update, 1000);
  }

  bindGlobalEvents() {
    // Mode Switch Button in Suite Header
    const suiteHeaderRight = document.querySelector('.suite-header-right');
    if (suiteHeaderRight && !document.getElementById('btn-toggle-orbit-os')) {
      const btnToggle = document.createElement('button');
      btnToggle.className = 'suite-os-mode-btn';
      btnToggle.id = 'btn-toggle-orbit-os';
      btnToggle.title = 'Zu OrbitOS Desktop wechseln (Alt + D)';
      btnToggle.innerHTML = `
        <span>🖥️</span>
        <span>OrbitOS</span>
      `;
      btnToggle.addEventListener('click', () => this.enableOSMode());
      suiteHeaderRight.insertBefore(btnToggle, suiteHeaderRight.firstChild);
    }

    // Switch back to Workspace
    const btnSwitchBack = document.getElementById('os-btn-tray-switch');
    if (btnSwitchBack) {
      btnSwitchBack.addEventListener('click', () => this.disableOSMode());
    }

    const btnStartSwitchBack = document.getElementById('os-btn-start-switch-suite');
    if (btnStartSwitchBack) {
      btnStartSwitchBack.addEventListener('click', () => {
        this.toggleStartMenu(false);
        this.disableOSMode();
      });
    }

    // Start Menu Toggle
    const startBtn = document.getElementById('os-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleStartMenu();
      });
    }

    document.addEventListener('click', (e) => {
      const startMenu = document.getElementById('orbit-os-start-menu');
      if (startMenu && startMenu.classList.contains('open')) {
        if (!startMenu.contains(e.target) && e.target !== startBtn && !startBtn.contains(e.target)) {
          this.toggleStartMenu(false);
        }
      }
    });

    // Keyboard Shortcut Alt + D
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (this.activeMode === 'os') {
          this.disableOSMode();
        } else {
          this.enableOSMode();
        }
      }
    });
  }

  toggleStartMenu(force) {
    const menu = document.getElementById('orbit-os-start-menu');
    if (!menu) return;
    const shouldOpen = typeof force === 'boolean' ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', shouldOpen);
    if (shouldOpen) {
      const search = document.getElementById('os-start-search-input');
      if (search) {
        search.value = '';
        search.focus();
      }
    }
  }

  enableOSMode() {
    this.activeMode = 'os';
    localStorage.setItem('orbit_active_mode', 'os');
    document.body.classList.add('orbit-os-active');

    // Default open window
    if (this.windows.size === 0) {
      this.openApp('tasks');
    }

    if (this.suite && this.suite.showToast) {
      this.suite.showToast('OrbitOS Desktop aktiv 🖥️ (Alt + D zum Wechseln)', 'info');
    }
  }

  disableOSMode() {
    this.activeMode = 'suite';
    localStorage.setItem('orbit_active_mode', 'suite');
    document.body.classList.remove('orbit-os-active');

    // Return suite views back to suite container
    this.windows.forEach((win, appId) => {
      const def = this.appDefinitions[appId];
      if (def && def.isSuiteApp && def.suiteViewId) {
        const viewEl = document.getElementById(def.suiteViewId);
        const suiteContainer = document.getElementById('suite-container');
        if (viewEl && suiteContainer) {
          suiteContainer.appendChild(viewEl);
        }
      }
    });

    if (this.suite && this.suite.showToast) {
      this.suite.showToast('Zurück im klassischen Workspace 🗖', 'info');
    }
  }

  openApp(appId) {
    const def = this.appDefinitions[appId];
    if (!def) return;

    if (this.windows.has(appId)) {
      const win = this.windows.get(appId);
      win.element.classList.remove('minimized');
      this.bringToFront(appId);
      return;
    }

    const winContainer = document.getElementById('os-windows-container');
    if (!winContainer) return;

    const winEl = document.createElement('div');
    winEl.className = 'os-window active';
    winEl.id = `os-window-${appId}`;
    winEl.style.pointerEvents = 'auto';

    // Position window nicely between left desktop icons (100px) and right widgets (270px)
    const availableWidth = window.innerWidth - 380;
    const winWidth = Math.min(Math.max(340, availableWidth), def.defaultWidth);
    const winHeight = Math.min(window.innerHeight - 90, def.defaultHeight);

    const offset = (this.windows.size * 26) % 120;
    const initialLeft = 110 + offset;
    const initialTop = 24 + offset;

    winEl.style.left = `${initialLeft}px`;
    winEl.style.top = `${initialTop}px`;
    winEl.style.width = `${winWidth}px`;
    winEl.style.height = `${winHeight}px`;
    winEl.style.zIndex = ++this.windowZIndex;

    winEl.innerHTML = `
      <div class="os-window-header" data-app-id="${appId}">
        <div class="os-window-controls">
          <button class="os-ctrl-dot os-dot-close" title="Schließen" data-action="close">✕</button>
          <button class="os-ctrl-dot os-dot-minimize" title="Minimieren" data-action="minimize">−</button>
          <button class="os-ctrl-dot os-dot-maximize" title="Maximieren" data-action="maximize">□</button>
        </div>
        <div class="os-window-title">
          <span class="os-window-title-icon">${def.icon}</span>
          <span>${def.name}</span>
        </div>
        <div class="os-window-actions"></div>
      </div>
      <div class="os-window-body" id="os-window-body-${appId}"></div>
      <div class="os-resize-handle os-resize-e" data-dir="e"></div>
      <div class="os-resize-handle os-resize-s" data-dir="s"></div>
      <div class="os-resize-handle os-resize-se" data-dir="se"></div>
      <div class="os-resize-handle os-resize-w" data-dir="w"></div>
      <div class="os-resize-handle os-resize-n" data-dir="n"></div>
      <div class="os-resize-handle os-resize-sw" data-dir="sw"></div>
      <div class="os-resize-handle os-resize-ne" data-dir="ne"></div>
      <div class="os-resize-handle os-resize-nw" data-dir="nw"></div>
    `;

    winContainer.appendChild(winEl);
    const bodyEl = winEl.querySelector(`#os-window-body-${appId}`);

    // Mount Content
    if (def.isSuiteApp && def.suiteViewId) {
      const suiteView = document.getElementById(def.suiteViewId);
      if (suiteView) {
        suiteView.style.display = 'block';
        bodyEl.appendChild(suiteView);
      }
    } else if (appId === 'terminal') {
      this.mountLinuxTerminal(bodyEl);
    } else if (appId === 'calculator') {
      this.mountCalculator(bodyEl);
    } else if (appId === 'matrix') {
      this.mountMatrixRain(bodyEl);
    } else if (appId === 'settings') {
      this.mountSettings(bodyEl);
    }

    const winRecord = {
      appId,
      element: winEl,
      isMaximized: false
    };
    this.windows.set(appId, winRecord);
    this.activeWindowId = appId;

    this.setupWindowInteractions(winRecord);
    this.addTaskbarTab(appId);

    if (this.suite && this.suite.sound) {
      this.suite.sound.playPop();
    }
  }

  bringToFront(appId) {
    const win = this.windows.get(appId);
    if (!win) return;

    this.windowZIndex += 2;
    win.element.style.zIndex = this.windowZIndex;
    this.activeWindowId = appId;

    this.windows.forEach((w) => w.element.classList.remove('active'));
    win.element.classList.add('active');

    document.querySelectorAll('.os-taskbar-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.appId === appId);
    });
  }

  addTaskbarTab(appId) {
    const bar = document.getElementById('os-taskbar-apps');
    if (!bar) return;

    const def = this.appDefinitions[appId];
    const tab = document.createElement('button');
    tab.className = 'os-taskbar-tab active';
    tab.id = `os-taskbar-tab-${appId}`;
    tab.dataset.appId = appId;
    tab.innerHTML = `
      <span>${def.icon}</span>
      <span>${def.name}</span>
    `;

    tab.addEventListener('click', () => {
      const win = this.windows.get(appId);
      if (!win) return;

      if (win.element.classList.contains('minimized')) {
        win.element.classList.remove('minimized');
        this.bringToFront(appId);
      } else if (this.activeWindowId === appId) {
        win.element.classList.add('minimized');
        tab.classList.remove('active');
      } else {
        this.bringToFront(appId);
      }
    });

    bar.appendChild(tab);
  }

  closeApp(appId) {
    const win = this.windows.get(appId);
    if (!win) return;

    // Cleanup matrix if closing matrix window
    if (appId === 'matrix' && win.matrixAnimId) {
      cancelAnimationFrame(win.matrixAnimId);
    }

    const def = this.appDefinitions[appId];
    if (def && def.isSuiteApp && def.suiteViewId) {
      const viewEl = document.getElementById(def.suiteViewId);
      const suiteContainer = document.getElementById('suite-container');
      if (viewEl && suiteContainer) {
        suiteContainer.appendChild(viewEl);
      }
    }

    win.element.remove();
    this.windows.delete(appId);

    const tab = document.getElementById(`os-taskbar-tab-${appId}`);
    if (tab) tab.remove();

    if (this.suite && this.suite.sound) {
      this.suite.sound.playPop();
    }
  }

  setupWindowInteractions(win) {
    const el = win.element;
    const header = el.querySelector('.os-window-header');

    el.addEventListener('mousedown', () => this.bringToFront(win.appId));

    header.addEventListener('click', (e) => {
      const btn = e.target.closest('.os-ctrl-dot');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'close') {
        this.closeApp(win.appId);
      } else if (action === 'minimize') {
        el.classList.add('minimized');
        const tab = document.getElementById(`os-taskbar-tab-${win.appId}`);
        if (tab) tab.classList.remove('active');
      } else if (action === 'maximize') {
        el.classList.toggle('maximized');
      }
    });

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialX = 0;
    let initialY = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.os-ctrl-dot') || el.classList.contains('maximized')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialX = el.offsetLeft;
      initialY = el.offsetTop;
      this.bringToFront(win.appId);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      const newLeft = Math.max(0, Math.min(window.innerWidth - 100, initialX + deltaX));
      const newTop = Math.max(0, Math.min(window.innerHeight - 80, initialY + deltaY));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    const handles = el.querySelectorAll('.os-resize-handle');
    handles.forEach((handle) => {
      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startW = 0;
      let startH = 0;
      let startLeft = 0;
      let startTop = 0;
      const dir = handle.dataset.dir;

      handle.addEventListener('mousedown', (e) => {
        if (el.classList.contains('maximized')) return;
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = el.offsetWidth;
        startH = el.offsetHeight;
        startLeft = el.offsetLeft;
        startTop = el.offsetTop;
        this.bringToFront(win.appId);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (dir.includes('e')) el.style.width = `${Math.max(280, startW + dx)}px`;
        if (dir.includes('s')) el.style.height = `${Math.max(180, startH + dy)}px`;
        if (dir.includes('w')) {
          const newW = Math.max(280, startW - dx);
          el.style.width = `${newW}px`;
          el.style.left = `${startLeft + (startW - newW)}px`;
        }
        if (dir.includes('n')) {
          const newH = Math.max(180, startH - dy);
          el.style.height = `${newH}px`;
          el.style.top = `${startTop + (startH - newH)}px`;
        }
      });

      window.addEventListener('mouseup', () => {
        isResizing = false;
      });
    });
  }

  /* ==========================================================================
     Authentic HTML5 Canvas Matrix Digital Rain
     ========================================================================== */
  mountMatrixRain(container) {
    container.innerHTML = `
      <div class="os-matrix-container">
        <canvas class="os-matrix-canvas" id="os-matrix-cvs"></canvas>
        <div class="os-matrix-banner">MATRIX DIGITAL RAIN // ESC to Exit</div>
      </div>
    `;

    const canvas = container.querySelector('#os-matrix-cvs');
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = container.clientWidth || 800;
      canvas.height = container.clientHeight || 500;
    };
    resize();

    // Half-width Katakana + Latin characters
    const chars = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF@#$%&*+-=<>'.split('');
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    const render = () => {
      // Black background with slight opacity for fading trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Glowing white tip character
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 8;
        ctx.fillText(char, x, y);

        // Green trail character directly above
        ctx.fillStyle = '#00ff66';
        ctx.shadowBlur = 0;
        ctx.fillText(char, x, y - fontSize);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      const winRecord = this.windows.get('matrix');
      if (winRecord) {
        winRecord.matrixAnimId = requestAnimationFrame(render);
      }
    };

    const winRecord = this.windows.get('matrix');
    if (winRecord) {
      winRecord.matrixAnimId = requestAnimationFrame(render);
    }

    window.addEventListener('resize', () => {
      resize();
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    });
  }

  /* ==========================================================================
     Linux Superuser Terminal Engine with `sudo` & Admin Commands
     ========================================================================== */
  mountLinuxTerminal(container) {
    container.innerHTML = `
      <div class="os-terminal-wrap">
        <div class="os-terminal-output" id="os-term-out">
          <div><strong style="color: #38bdf8;">Linux orbit-os 6.8.0-orbit-generic x86_64</strong></div>
          <div style="color: #94a3b8; font-size: 11px;">OrbitOS GNU/Linux Shell • Type <span style="color: #facc15;">'help'</span> for list of commands.</div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">Type <span style="color: #ef4444; font-weight: bold;">'sudo su'</span> or <span style="color: #ef4444; font-weight: bold;">'sudo admin'</span> for system administrator console.</div>
        </div>
        <div class="os-terminal-input-row">
          <span class="os-terminal-prompt" id="os-term-prompt">rune@orbit:~$</span>
          <input type="text" class="os-terminal-input" id="os-term-in" autofocus autocomplete="off" spellcheck="false">
        </div>
      </div>
    `;

    const out = container.querySelector('#os-term-out');
    const input = container.querySelector('#os-term-in');
    const prompt = container.querySelector('#os-term-prompt');

    const print = (text, color = '#cbd5e1') => {
      const line = document.createElement('div');
      line.style.color = color;
      line.innerHTML = text;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    };

    const setPrompt = () => {
      if (this.terminalState.isPromptingPassword) {
        prompt.textContent = '[sudo] password for rune:';
        prompt.className = 'os-terminal-prompt';
        prompt.style.color = '#facc15';
        input.type = 'password';
      } else if (this.terminalState.isRoot) {
        prompt.textContent = 'root@orbit:~#';
        prompt.className = 'os-terminal-prompt root';
        input.type = 'text';
      } else {
        prompt.textContent = 'rune@orbit:~$';
        prompt.className = 'os-terminal-prompt';
        prompt.style.color = '#34d399';
        input.type = 'text';
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        input.value = '';

        // Handle Password Prompt for SUDO
        if (this.terminalState.isPromptingPassword) {
          const expectedPin = localStorage.getItem('orbitsuite_admin_pin') || 
            (window.ORBIT_CONFIG && window.ORBIT_CONFIG.defaultAdminPin) || '1234';

          if (val === expectedPin) {
            this.terminalState.isRoot = true;
            this.terminalState.isPromptingPassword = false;
            this.terminalState.failedAttempts = 0;
            setPrompt();

            print(`
<pre style="color: #ef4444; margin: 4px 0; font-family: monospace; font-size: 11px; line-height: 1.15;">
 ___       _     _ _   ___  ____  
/ _ \\ _ __| |__ (_) |_/ _ \\/ ___| 
| | | | '__| '_ \\| | __| | | \\___ \\ 
| |_| | |  | |_) | | |_| |_| |___) |
 \\___/|_|  |_.__/|_|\\__|\\___/|____/ 
</pre>
<div style="color: #22c55e; font-weight: bold;">[ OK ] Authentication successful. Granted superuser access.</div>
<div style="color: #94a3b8; font-size: 11.5px;">Type <span style="color: #facc15;">'systemctl status cloud-sync'</span> or <span style="color: #facc15;">'passwd'</span> to manage system.</div>
            `);

            if (this.terminalState.sudoCallback) {
              const cb = this.terminalState.sudoCallback;
              this.terminalState.sudoCallback = null;
              cb();
            }
          } else {
            this.terminalState.failedAttempts++;
            print(`sudo: ${this.terminalState.failedAttempts} incorrect password attempt(s)`, '#ef4444');
            if (this.terminalState.failedAttempts >= 3) {
              print('sudo: 3 incorrect password attempts; incident will be reported to /var/log/auth.log', '#ef4444');
              this.terminalState.isPromptingPassword = false;
              this.terminalState.sudoCallback = null;
              setPrompt();
            }
          }
          return;
        }

        if (!val) return;

        // Print entered command
        const currentPrompt = prompt.textContent;
        print(`<span style="${this.terminalState.isRoot ? 'color: #ef4444; font-weight: 700;' : 'color: #34d399;'}">${currentPrompt}</span> ${val}`);

        const parts = val.split(' ');
        const cmd = parts[0].toLowerCase();
        const arg1 = parts[1] ? parts[1].toLowerCase() : '';
        const arg2 = parts[2] ? parts[2].toLowerCase() : '';

        // Execute Command
        if (cmd === 'sudo' || cmd === 'su') {
          if (this.terminalState.isRoot) {
            print('You are already root.', '#38bdf8');
            return;
          }
          this.terminalState.isPromptingPassword = true;
          this.terminalState.sudoCallback = () => {
            if (arg1 === 'admin' || arg1 === 'panel') {
              if (window.orbitSuite && window.orbitSuite.admin) {
                window.orbitSuite.admin.openModal();
              }
            }
          };
          setPrompt();
        } else if (cmd === 'help') {
          print(`
<strong style="color: #facc15;">OrbitOS Linux Command Reference:</strong>
  <strong style="color: #38bdf8;">System:</strong>
    <span style="color: #34d399;">neofetch</span> / <span style="color: #34d399;">orbitfetch</span>  - System Info & ASCII Logo
    <span style="color: #34d399;">uname -a</span>            - Kernel & Architektur
    <span style="color: #34d399;">uptime</span>              - System-Laufzeit
    <span style="color: #34d399;">whoami</span>              - Aktueller Benutzer
    <span style="color: #34d399;">date</span>                - Datum & Zeit
    <span style="color: #34d399;">clear</span>               - Terminal leeren
  <strong style="color: #38bdf8;">Superuser (Root):</strong>
    <span style="color: #ef4444;">sudo su</span>             - Zu Root wechseln (fragt Admin-PIN)
    <span style="color: #ef4444;">systemctl &lt;status|restart&gt; cloud-sync</span> - Supabase Cloud Service steuern
    <span style="color: #ef4444;">passwd</span>              - Admin-PIN ändern
    <span style="color: #ef4444;">cat /etc/orbit/config.json</span> - Cloud-Konfiguration prüfen
  <strong style="color: #38bdf8;">Apps & Fun:</strong>
    <span style="color: #a855f7;">matrix</span>              - Echtes HTML5 Canvas Matrix Digital Rain starten
    <span style="color: #a855f7;">tasks</span>               - Aufgabenliste anzeigen
    <span style="color: #a855f7;">calc &lt;math&gt;</span>         - Taschenrechner (z.B. calc 42*7)
    <span style="color: #a855f7;">wallpaper &lt;theme&gt;</span>   - Wallpaper wechseln (nebula, cyberpunk, midnight, aurora)
    <span style="color: #a855f7;">exit</span>                - Superuser verlassen oder Fenster schließen
          `);
        } else if (cmd === 'neofetch' || cmd === 'orbitfetch') {
          const tasksCount = (this.suite && this.suite.tasks && this.suite.tasks.tasks) ? this.suite.tasks.tasks.length : 0;
          print(`
<div style="display: flex; gap: 16px; margin: 6px 0;">
  <pre style="color: #6366f1; font-weight: bold; line-height: 1.15; margin: 0;">
       .---.      
      /     \\     
     | () () |    
      \\  _  /     
       \`---\`      
   /\\       /\\    
  /  \`-----\`  \\   
 /             \\  
  </pre>
  <div style="font-size: 11.5px; line-height: 1.45;">
    <div><strong style="color: #38bdf8;">rune@orbit-os</strong></div>
    <div>-----------------------</div>
    <div><span style="color: #94a3b8;">OS:</span> OrbitOS 2.6 Linux-Compat (x86_64)</div>
    <div><span style="color: #94a3b8;">Host:</span> OrbitSuite Productivity Core</div>
    <div><span style="color: #94a3b8;">Kernel:</span> 6.8.0-orbit-generic</div>
    <div><span style="color: #94a3b8;">Uptime:</span> 4h 12m</div>
    <div><span style="color: #94a3b8;">Packages:</span> 8 (suite-apps)</div>
    <div><span style="color: #94a3b8;">Shell:</span> orbitsh 2.4.0</div>
    <div><span style="color: #94a3b8;">DE / WM:</span> OrbitDesktop / OrbitWindowManager</div>
    <div><span style="color: #94a3b8;">Cloud Sync:</span> Supabase Active 🟢</div>
    <div><span style="color: #94a3b8;">Tasks DB:</span> ${tasksCount} registered tasks</div>
  </div>
</div>
          `);
        } else if (cmd === 'systemctl') {
          if (!this.terminalState.isRoot) {
            print('systemctl: Access denied. Root privileges required. Try \'sudo systemctl\'.', '#ef4444');
            return;
          }
          if (arg1 === 'status') {
            const hasClient = Boolean(this.suite.sync && this.suite.sync.client);
            print(`
<span class="os-term-tag-ok">●</span> cloud-sync.service - Supabase Cloud Database Daemon
     Loaded: loaded (/etc/systemd/system/cloud-sync.service; enabled)
     Active: <span class="os-term-tag-ok">active (running)</span> since Tue 2026-10-08 10:00:00 UTC
     Client Status: ${hasClient ? '<span style="color:#22c55e;">CONNECTED</span>' : '<span style="color:#f59e0b;">STANDBY</span>'}
     Endpoint: ${window.ORBIT_CONFIG.supabaseUrl}
     Target Table: public.orbit_sync
     Encrypted Handshake: TLS 1.3 / AES-256-GCM
     Main PID: 1042 (supabase-worker)
            `);
          } else if (arg1 === 'restart') {
            print('[  ...  ] Stopping cloud-sync.service...', '#facc15');
            setTimeout(() => {
              if (this.suite.sync) {
                this.suite.sync.pullFromCloud();
              }
              print('[  <span class="os-term-tag-ok">OK</span>  ] Stopped cloud-sync.service.');
              print('[  <span class="os-term-tag-ok">OK</span>  ] Started cloud-sync.service.');
              print('[  <span class="os-term-tag-ok">OK</span>  ] Synced live with Supabase cloud successfully!', '#22c55e');
            }, 600);
          } else {
            print('Usage: systemctl <status|restart> cloud-sync', '#ef4444');
          }
        } else if (cmd === 'uname') {
          print('Linux orbit-os 6.8.0-orbit-generic #42-SMP Tue Oct 8 10:45:00 UTC 2026 x86_64 GNU/Linux');
        } else if (cmd === 'whoami') {
          print(this.terminalState.isRoot ? '<strong style="color: #ef4444;">root</strong>' : 'rune');
        } else if (cmd === 'uptime') {
          print(' 10:45:12 up 4:12,  1 user,  load average: 0.08, 0.04, 0.01');
        } else if (cmd === 'date') {
          print(new Date().toString());
        } else if (cmd === 'ls') {
          print(`
<span style="color: #38bdf8; font-weight: bold;">bin/</span>   <span style="color: #38bdf8; font-weight: bold;">etc/</span>   <span style="color: #38bdf8; font-weight: bold;">home/</span>   <span style="color: #38bdf8; font-weight: bold;">var/</span>   <span style="color: #a855f7;">orbit_sync.db</span>   <span style="color: #facc15;">notes.md</span>
          `);
        } else if (cmd === 'cat') {
          if (arg1.includes('config.json') || arg1.includes('orbit')) {
            if (!this.terminalState.isRoot) {
              print('cat: /etc/orbit/config.json: Permission denied (root required)', '#ef4444');
              return;
            }
            const cfg = window.ORBIT_CONFIG || {};
            print(`
{
  "supabaseUrl": "${cfg.supabaseUrl || 'https://hsbtkwiuoxehexbcykvn.supabase.co'}",
  "supabaseKey": "sb_publishable_************************",
  "adminSalt": "${cfg.adminSalt || 'orbit_suite_salt_***'}",
  "authStatus": "Salted & Peppered SHA-256 Protected"
}
            `, '#38bdf8');
          } else if (arg1.includes('syslog') || arg1.includes('log')) {
            print(`
Oct  8 10:00:01 orbit-os systemd[1]: Started Supabase Cloud Synchronization.
Oct  8 10:12:30 orbit-os kernel: [4210.021] User rune logged into OrbitOS Desktop.
Oct  8 10:24:15 orbit-os sudo[142]: rune : TTY=pts/0 ; PWD=/home/rune ; USER=root ; COMMAND=/bin/bash
            `, '#94a3b8');
          } else {
            print(`cat: ${arg1 || 'file'}: No such file or directory`, '#ef4444');
          }
        } else if (cmd === 'passwd') {
          if (!this.terminalState.isRoot) {
            print('passwd: You may not view or modify password for root. Try \'sudo passwd\'.', '#ef4444');
            return;
          }
          const newPin = prompt('Neuen 4-stelligen Admin-PIN eingeben:');
          if (newPin && newPin.trim().length >= 4) {
            localStorage.setItem('orbitsuite_admin_pin', newPin.trim());
            print(`[ <span class="os-term-tag-ok">OK</span> ] passwd: password updated successfully.`, '#22c55e');
          } else {
            print('passwd: Authentication token manipulation error (PIN must be at least 4 chars).', '#ef4444');
          }
        } else if (cmd === 'matrix') {
          this.openApp('matrix');
          print('[ <span class="os-term-tag-ok">OK</span> ] Matrix Digital Rain engine launched in window.', '#22c55e');
        } else if (cmd === 'tasks') {
          const tasks = (this.suite && this.suite.tasks && this.suite.tasks.tasks) ? this.suite.tasks.tasks : [];
          print(`OrbitTask Database: <strong>${tasks.length}</strong> active task(s):`);
          tasks.slice(0, 7).forEach((t, i) => {
            print(` [${i+1}] ${t.title || 'Aufgabe'} <span style="color: #6366f1;">(${t.status || 'backlog'})</span>`);
          });
        } else if (cmd === 'calc') {
          try {
            const res = eval(parts.slice(1).join(' '));
            print(`= ${res}`, '#10b981');
          } catch (err) {
            print(`Syntax Error: ${err.message}`, '#ef4444');
          }
        } else if (cmd === 'wallpaper') {
          if (['nebula', 'cyberpunk', 'midnight', 'aurora'].includes(arg1)) {
            this.setWallpaper(arg1);
            print(`[ <span class="os-term-tag-ok">OK</span> ] Wallpaper switched to: ${arg1}`, '#38bdf8');
          } else {
            print('Invalid theme. Options: nebula, cyberpunk, midnight, aurora', '#ef4444');
          }
        } else if (cmd === 'clear') {
          out.innerHTML = '';
        } else if (cmd === 'exit') {
          if (this.terminalState.isRoot) {
            this.terminalState.isRoot = false;
            setPrompt();
            print('exit (dropped superuser privileges back to rune)', '#38bdf8');
          } else {
            this.closeApp('terminal');
          }
        } else {
          print(`bash: ${cmd}: command not found. Type 'help'.`, '#ef4444');
        }
      }
    });
  }

  mountCalculator(container) {
    container.innerHTML = `
      <div class="os-calc-wrap">
        <div class="os-calc-display" id="os-calc-val">0</div>
        <div class="os-calc-grid">
          <button class="os-calc-btn op" data-calc="C">C</button>
          <button class="os-calc-btn op" data-calc="DEL">⌫</button>
          <button class="os-calc-btn op" data-calc="%">%</button>
          <button class="os-calc-btn op" data-calc="/">÷</button>

          <button class="os-calc-btn" data-calc="7">7</button>
          <button class="os-calc-btn" data-calc="8">8</button>
          <button class="os-calc-btn" data-calc="9">9</button>
          <button class="os-calc-btn op" data-calc="*">×</button>

          <button class="os-calc-btn" data-calc="4">4</button>
          <button class="os-calc-btn" data-calc="5">5</button>
          <button class="os-calc-btn" data-calc="6">6</button>
          <button class="os-calc-btn op" data-calc="-">−</button>

          <button class="os-calc-btn" data-calc="1">1</button>
          <button class="os-calc-btn" data-calc="2">2</button>
          <button class="os-calc-btn" data-calc="3">3</button>
          <button class="os-calc-btn op" data-calc="+">+</button>

          <button class="os-calc-btn" data-calc="0" style="grid-column: span 2;">0</button>
          <button class="os-calc-btn" data-calc=".">.</button>
          <button class="os-calc-btn equals" data-calc="=">=</button>
        </div>
      </div>
    `;

    const display = container.querySelector('#os-calc-val');
    let expr = '0';

    container.querySelectorAll('.os-calc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.calc;
        if (val === 'C') {
          expr = '0';
        } else if (val === 'DEL') {
          expr = expr.length > 1 ? expr.slice(0, -1) : '0';
        } else if (val === '=') {
          try {
            expr = String(eval(expr.replace(/×/g, '*').replace(/÷/g, '/')));
          } catch (e) {
            expr = 'Error';
          }
        } else {
          if (expr === '0' && val !== '.') expr = val;
          else expr += val;
        }
        display.textContent = expr;
      });
    });
  }

  mountSettings(container) {
    container.innerHTML = `
      <div style="padding: 20px; display: flex; flex-direction: column; gap: 18px; color: #f1f5f9;">
        <div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">OrbitOS Personalisierung</h3>
          <p style="font-size: 13px; color: #94a3b8;">Passe das Aussehen deiner Web-Desktop-Oberfläche an.</p>
        </div>

        <div>
          <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px;">Desktop-Wallpaper:</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <button class="btn-secondary os-wp-btn ${this.activeWallpaper === 'nebula' ? 'active' : ''}" data-wp="nebula">🌌 Nebula Cosmic</button>
            <button class="btn-secondary os-wp-btn ${this.activeWallpaper === 'cyberpunk' ? 'active' : ''}" data-wp="cyberpunk">🌆 Cyberpunk Glow</button>
            <button class="btn-secondary os-wp-btn ${this.activeWallpaper === 'midnight' ? 'active' : ''}" data-wp="midnight">🌑 Deep Midnight</button>
            <button class="btn-secondary os-wp-btn ${this.activeWallpaper === 'aurora' ? 'active' : ''}" data-wp="aurora">🌲 Aurora Green</button>
          </div>
        </div>

        <div style="margin-top: 12px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Modus-Tastaturkürzel:</label>
          <p style="font-size: 12px; color: #94a3b8;">Drücke jederzeit <kbd style="background: rgba(255, 255, 255, 0.15); padding: 2px 6px; border-radius: 4px; color: #fff;">Alt + D</kbd>, um zwischen dem klassischen Dashboard und OrbitOS Desktop zu wechseln.</p>
        </div>
      </div>
    `;

    container.querySelectorAll('.os-wp-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.os-wp-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.setWallpaper(btn.dataset.wp);
      });
    });
  }

  setWallpaper(wp) {
    this.activeWallpaper = wp;
    localStorage.setItem('orbit_os_wallpaper', wp);
    if (this.root) {
      this.root.className = `os-wallpaper-${wp}`;
    }
  }
}

window.OrbitOS = OrbitOS;
