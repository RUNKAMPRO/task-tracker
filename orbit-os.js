/**
 * OrbitOS • Modern Web Desktop Environment & Window Management Engine
 * Hybrid Workspace Extension for OrbitSuite
 * Includes Linux Superuser Terminal with `sudo`, In-Terminal Canvas Matrix Rain, and Clean View Anchor Isolation
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

    // Matrix Rain State inside Terminal
    this.matrixAnimId = null;

    // Spotify Integration
    this.spotify = window.SpotifyService ? new window.SpotifyService() : null;

    this.appDefinitions = {
      spotify: {
        name: 'Spotify Player',
        icon: '🎧',
        color: '#1db954',
        isSuiteApp: false,
        defaultWidth: 780,
        defaultHeight: 560
      },
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
      folienwerk: {
        name: 'Folienwerk',
        icon: '📑',
        color: '#e11d48',
        isSuiteApp: false,
        defaultWidth: 960,
        defaultHeight: 650
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
    this.createSuiteAnchors();
    this.createDesktopDOM();
    this.bindGlobalEvents();
    this.startClock();
    this.initSpotifyTaskbar();

    // Check if user previously was in OS mode
    if (this.activeMode === 'os') {
      this.enableOSMode();
    }
  }

  /* Create invisible DOM anchors inside #suite-container to preserve 100% exact order */
  createSuiteAnchors() {
    Object.values(this.appDefinitions).forEach((def) => {
      if (def.isSuiteApp && def.suiteViewId) {
        const viewEl = document.getElementById(def.suiteViewId);
        if (viewEl && viewEl.parentNode) {
          const anchorId = `os-anchor-${def.suiteViewId}`;
          if (!document.getElementById(anchorId)) {
            const anchor = document.createElement('div');
            anchor.id = anchorId;
            anchor.style.display = 'none';
            viewEl.parentNode.insertBefore(anchor, viewEl);
          }
        }
      }
    });
  }

  createDesktopDOM() {
    // Root Element
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

        <div class="os-taskbar-spotify-slot" id="os-taskbar-spotify-slot"></div>
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

    // Default open Tasks window if none open
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

    // Return ALL embedded suite views back to their exact original anchor positions
    Object.values(this.appDefinitions).forEach((def) => {
      if (def.isSuiteApp && def.suiteViewId) {
        const viewEl = document.getElementById(def.suiteViewId);
        const anchor = document.getElementById(`os-anchor-${def.suiteViewId}`);
        if (viewEl && anchor && anchor.parentNode) {
          viewEl.style.display = ''; // CLEAR ANY INLINE DISPLAY
          viewEl.classList.remove('os-embedded-view');
          anchor.parentNode.insertBefore(viewEl, anchor);
        }
      }
    });

    // Synchronize router state so ONLY the currently active app view in Workspace is shown
    if (this.suite && this.suite.switchApp) {
      this.suite.switchApp(this.suite.activeApp || 'hub', false);
    }

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
        suiteView.classList.add('os-embedded-view');
        suiteView.style.display = 'block';
        bodyEl.appendChild(suiteView);
      }
    } else if (appId === 'spotify') {
      this.mountSpotify(bodyEl);
    } else if (appId === 'terminal') {
      this.mountLinuxTerminal(bodyEl);
    } else if (appId === 'calculator') {
      this.mountCalculator(bodyEl);
    } else if (appId === 'folienwerk') {
      this.mountFolienwerk(bodyEl);
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

    const def = this.appDefinitions[appId];
    if (def && def.isSuiteApp && def.suiteViewId) {
      const viewEl = document.getElementById(def.suiteViewId);
      const anchor = document.getElementById(`os-anchor-${def.suiteViewId}`);
      if (viewEl && anchor && anchor.parentNode) {
        viewEl.style.display = ''; // CLEAR INLINE DISPLAY
        viewEl.classList.remove('os-embedded-view');
        anchor.parentNode.insertBefore(viewEl, anchor);
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
     Linux Superuser Terminal Engine with `sudo` & In-Terminal Canvas Matrix
     ========================================================================== */
  mountLinuxTerminal(container) {
    container.innerHTML = `
      <div class="os-terminal-wrap" style="position: relative;">
        <div class="os-terminal-output" id="os-term-out">
          <div><strong style="color: #38bdf8;">Linux orbit-os 6.8.0-orbit-generic x86_64</strong></div>
          <div style="color: #94a3b8; font-size: 11px;">OrbitOS GNU/Linux Shell • Type <span style="color: #facc15;">'help'</span> for list of commands.</div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">Type <span style="color: #ef4444; font-weight: bold;">'sudo su'</span> or <span style="color: #ef4444; font-weight: bold;">'sudo admin'</span> for system administrator console.</div>
        </div>
        <div class="os-terminal-input-row" id="os-term-row">
          <span class="os-terminal-prompt" id="os-term-prompt">rune@orbit:~$</span>
          <input type="text" class="os-terminal-input" id="os-term-in" autofocus autocomplete="off" spellcheck="false">
        </div>
      </div>
    `;

    const wrap = container.querySelector('.os-terminal-wrap');
    const out = container.querySelector('#os-term-out');
    const input = container.querySelector('#os-term-in');
    const prompt = container.querySelector('#os-term-prompt');
    const row = container.querySelector('#os-term-row');

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

    // In-Terminal Matrix Rain Engine (Robust, Does NOT kill itself)
    const launchInTerminalMatrix = () => {
      const matrixWrap = document.createElement('div');
      matrixWrap.id = 'os-term-matrix-wrap';
      matrixWrap.style.cssText = 'position: absolute; inset: 0; background: #000000; z-index: 50; display: flex; flex-direction: column; overflow: hidden;';
      matrixWrap.innerHTML = `
        <div style="position: absolute; top: 10px; left: 14px; background: rgba(0,0,0,0.85); border: 1px solid #22c55e; color: #22c55e; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; letter-spacing: 1px; pointer-events: none; z-index: 2;">
          MATRIX DIGITAL RAIN // Beenden mit [q] oder [ESC]
        </div>
        <button id="os-matrix-exit-btn" style="position: absolute; top: 10px; right: 14px; background: rgba(239, 68, 68, 0.25); border: 1px solid #ef4444; color: #ef4444; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; cursor: pointer; z-index: 2; transition: all 0.2s ease;">
          ✕ Beenden
        </button>
        <canvas id="os-term-matrix-cvs" style="width: 100%; height: 100%; display: block;"></canvas>
      `;
      wrap.appendChild(matrixWrap);

      const canvas = matrixWrap.querySelector('#os-term-matrix-cvs');
      const exitBtn = matrixWrap.querySelector('#os-matrix-exit-btn');
      const ctx = canvas.getContext('2d');

      const resizeCanvas = () => {
        canvas.width = wrap.clientWidth || 700;
        canvas.height = wrap.clientHeight || 400;
      };
      resizeCanvas();

      const chars = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF@#$%&*+-=<>'.split('');
      const fontSize = 14;
      let columns = Math.floor(canvas.width / fontSize);
      let drops = Array(columns).fill(1);

      let animRunning = true;
      const render = () => {
        if (!animRunning) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.055)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Glowing white head
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 8;
          ctx.fillText(char, x, y);

          // Green body trail
          ctx.fillStyle = '#00ff66';
          ctx.shadowBlur = 0;
          ctx.fillText(char, x, y - fontSize);

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        this.matrixAnimId = requestAnimationFrame(render);
      };

      this.matrixAnimId = requestAnimationFrame(render);

      // Grace period: ignore exits for first 350ms so initiating Enter key doesn't trigger exit
      let canExit = false;
      setTimeout(() => { canExit = true; }, 350);

      const exitMatrix = () => {
        if (!canExit) return;
        animRunning = false;
        if (this.matrixAnimId) cancelAnimationFrame(this.matrixAnimId);
        window.removeEventListener('keydown', keyHandler);
        matrixWrap.remove();
        print('[ <span class="os-term-tag-ok">OK</span> ] Matrix-Modus beendet. Willkommen zurück in der Shell.', '#22c55e');
        setTimeout(() => input.focus(), 50);
      };

      const keyHandler = (ke) => {
        if (!canExit) return;
        // Only exit on 'q', 'Q', 'Escape', or Ctrl+C
        if (ke.key === 'q' || ke.key === 'Q' || ke.key === 'Escape' || (ke.ctrlKey && ke.key === 'c')) {
          ke.preventDefault();
          ke.stopPropagation();
          exitMatrix();
        }
      };

      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exitMatrix();
      });

      window.addEventListener('keydown', keyHandler);
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
<div style="font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1.4; margin: 4px 0;">
  <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid rgba(56, 189, 248, 0.3); padding-bottom: 4px; margin-bottom: 8px;">
    ORBITOS COMMAND MANUAL (v2.8) &bull; Shell Environment &bull; Type &lt;cmd&gt; --help
  </div>

  <div style="color: #fbbf24; font-weight: 700; margin: 6px 0 2px;">[ 1. SYSTEM COMMANDS ]</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
    <tr><td style="color: #34d399; width: 140px; font-weight: 600;">neofetch</td><td style="color: #94a3b8;">System-Informationen, Kernel &amp; Hardware-Zusammenfassung</td></tr>
    <tr><td style="color: #34d399; font-weight: 600;">uname -a</td><td style="color: #94a3b8;">Linux Kernel-Version, Architektur &amp; Build-Information</td></tr>
    <tr><td style="color: #34d399; font-weight: 600;">whoami</td><td style="color: #94a3b8;">Aktuelle Benutzeridentität (rune / root) ausgeben</td></tr>
    <tr><td style="color: #34d399; font-weight: 600;">uptime</td><td style="color: #94a3b8;">Systemlaufzeit, aktive Benutzer &amp; Load Average</td></tr>
    <tr><td style="color: #34d399; font-weight: 600;">date</td><td style="color: #94a3b8;">Aktuelles Datum und UTC/Lokalzeit anzeigen</td></tr>
    <tr><td style="color: #34d399; font-weight: 600;">ls / ls -la</td><td style="color: #94a3b8;">Dateisystem und Verzeichnisse auflisten</td></tr>
    <tr><td style="color: #34d399; font-weight: 600;">clear</td><td style="color: #94a3b8;">Terminal-Bildschirmpuffer leeren</td></tr>
  </table>

  <div style="color: #ef4444; font-weight: 700; margin: 10px 0 2px;">[ 2. SUPERUSER ADMINISTRATION (sudo) ]</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
    <tr><td style="color: #f87171; width: 140px; font-weight: 600;">sudo su</td><td style="color: #94a3b8;">Zu Superuser (root) wechseln (authentifiziert mit Admin-PIN)</td></tr>
    <tr><td style="color: #f87171; font-weight: 600;">systemctl status</td><td style="color: #94a3b8;">Supabase Cloud-Sync Daemon Status, Latenz &amp; TLS prüfen</td></tr>
    <tr><td style="color: #f87171; font-weight: 600;">systemctl restart</td><td style="color: #94a3b8;">Cloud-Daemon neu starten &amp; Live-Datenbankabgleich erzwingen</td></tr>
    <tr><td style="color: #f87171; font-weight: 600;">passwd</td><td style="color: #94a3b8;">Admin-PIN sicher ändern (wird direkt im Keyring gespeichert)</td></tr>
    <tr><td style="color: #f87171; font-weight: 600;">cat &lt;file&gt;</td><td style="color: #94a3b8;">z.B. <span style="color:#e2e8f0;">cat /etc/orbit/config.json</span> oder <span style="color:#e2e8f0;">cat /var/log/syslog</span></td></tr>
  </table>

  <div style="color: #a855f7; font-weight: 700; margin: 10px 0 2px;">[ 3. APPS &amp; VISUALS ]</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
    <tr><td style="color: #f43f5e; width: 140px; font-weight: 600;">folienwerk</td><td style="color: #94a3b8;">OTTO Copilot Präsentationen: <span style="color:#e2e8f0;">open</span>, <span style="color:#e2e8f0;">status</span></td></tr>
    <tr><td style="color: #10b981; width: 140px; font-weight: 600;">spotify</td><td style="color: #94a3b8;">Spotify Player steuern: <span style="color:#e2e8f0;">status</span>, <span style="color:#e2e8f0;">play</span>, <span style="color:#e2e8f0;">pause</span>, <span style="color:#e2e8f0;">next</span></td></tr>
    <tr><td style="color: #c084fc; width: 140px; font-weight: 600;">matrix</td><td style="color: #94a3b8;">Echter Katakana Canvas Matrix Rain (Beenden mit <kbd style="color:#fff;background:rgba(255,255,255,0.15);padding:1px 4px;border-radius:3px;">q</kbd> oder <kbd style="color:#fff;background:rgba(255,255,255,0.15);padding:1px 4px;border-radius:3px;">ESC</kbd>)</td></tr>
    <tr><td style="color: #c084fc; font-weight: 600;">tasks</td><td style="color: #94a3b8;">Aufgabenliste aus der OrbitTask-Datenbank auslesen</td></tr>
    <tr><td style="color: #c084fc; font-weight: 600;">calc &lt;math&gt;</td><td style="color: #94a3b8;">Inline-Taschenrechner (z.B. <span style="color:#e2e8f0;">calc (15 * 8) / 2</span>)</td></tr>
    <tr><td style="color: #c084fc; font-weight: 600;">wallpaper &lt;name&gt;</td><td style="color: #94a3b8;">Theme wechseln: <span style="color:#e2e8f0;">nebula</span>, <span style="color:#e2e8f0;">cyberpunk</span>, <span style="color:#e2e8f0;">midnight</span>, <span style="color:#e2e8f0;">aurora</span></td></tr>
    <tr><td style="color: #c084fc; font-weight: 600;">exit</td><td style="color: #94a3b8;">Root-Sitzung verlassen bzw. Terminalfenster schließen</td></tr>
  </table>
</div>
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
          launchInTerminalMatrix();
        } else if (cmd === 'folienwerk') {
          if (arg1 === 'open' || !arg1) {
            this.openApp('folienwerk');
            print('Folienwerk-Fenster geöffnet (Ziel: http://localhost:8765).', '#10b981');
          } else if (arg1 === 'status') {
            print('Prüfe Status von Folienwerk (http://localhost:8765)...', '#f59e0b');
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1200);
            fetch('http://localhost:8765', { mode: 'no-cors', signal: controller.signal })
              .then(() => {
                clearTimeout(timeout);
                print('[ONLINE] Folienwerk läuft auf http://localhost:8765', '#10b981');
              })
              .catch(() => {
                print('[OFFLINE] Server auf Port 8765 nicht erreichbar. Starte "Folienwerk starten.bat"', '#ef4444');
              });
          } else {
            print('Verwendung: folienwerk [open | status]', '#94a3b8');
          }
        } else if (cmd === 'spotify') {
          if (!this.spotify) {
            print('SpotifyService not initialized.', '#ef4444');
            return;
          }
          if (arg1 === 'status' || !arg1) {
            const state = this.spotify.currentState;
            if (state && state.item) {
              const trk = state.item;
              const isPlay = state.is_playing ? 'PLAYING 🟢' : 'PAUSED ⏸';
              print(`
<div style="color: #1db954; font-weight: bold;">Spotify Web Playback [${isPlay}]</div>
  Track: <strong style="color: #ffffff;">${trk.name}</strong>
  Artist: ${trk.artists ? trk.artists.map(a => a.name).join(', ') : 'Unknown'}
  Album: ${trk.album ? trk.album.name : 'Unknown'}
  Device: ${state.device ? `${state.device.name} (${state.device.type})` : 'Active'}
              `);
            } else if (this.spotify.isAuthenticated()) {
              print('Spotify verbunden, aber keine aktive Wiedergabe. Starte Musik in der Spotify App.', '#facc15');
            } else {
              print('Spotify nicht autorisiert. Tippe \'spotify login\' oder öffne Spotify.app.', '#ef4444');
            }
          } else if (arg1 === 'play') {
            this.spotify.play();
            print('[ <span class="os-term-tag-ok">OK</span> ] Spotify play command sent.', '#22c55e');
          } else if (arg1 === 'pause') {
            this.spotify.pause();
            print('[ <span class="os-term-tag-ok">OK</span> ] Spotify pause command sent.', '#22c55e');
          } else if (arg1 === 'next') {
            this.spotify.next();
            print('[ <span class="os-term-tag-ok">OK</span> ] Skipped to next track.', '#22c55e');
          } else if (arg1 === 'prev') {
            this.spotify.previous();
            print('[ <span class="os-term-tag-ok">OK</span> ] Returned to previous track.', '#22c55e');
          } else if (arg1 === 'login') {
            this.openApp('spotify');
            print('Spotify-Anmeldedialog in Spotify.app geöffnet.', '#38bdf8');
          } else if (arg1 === 'logout') {
            this.spotify.logout();
            print('Spotify-Sitzung abgemeldet.', '#facc15');
          } else {
            print('Usage: spotify <status|play|pause|next|prev|login|logout>', '#ef4444');
          }
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

  
  /* ==========================================================================
     Spotify Web Player & Taskbar Mini-Player Engine
     ========================================================================== */
  initSpotifyTaskbar() {
    if (!this.spotify) return;
    const slot = document.getElementById('os-taskbar-spotify-slot');
    if (!slot) return;

    this.spotify.subscribe((state) => {
      if (!state || !state.item) {
        slot.innerHTML = '';
        return;
      }

      const track = state.item;
      const isPlaying = state.is_playing;
      const title = track.name || 'Unbekannter Titel';
      const artist = track.artists ? track.artists.map(a => a.name).join(', ') : 'Spotify';

      slot.innerHTML = `
        <div class="os-taskbar-spotify" id="os-tb-spotify" title="${title} &bull; ${artist}">
          <span style="font-size: 13px;">🎧</span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${title} &bull; <span style="opacity: 0.7;">${artist}</span>
          </span>
          <button class="os-taskbar-spotify-btn" id="os-tb-sp-play" title="${isPlaying ? 'Pause' : 'Play'}">
            ${isPlaying ? '⏸' : '▶'}
          </button>
          <button class="os-taskbar-spotify-btn" id="os-tb-sp-next" title="Nächster Titel">
            ⏭
          </button>
        </div>
      `;

      const pill = slot.querySelector('#os-tb-spotify');
      if (pill) {
        pill.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          this.openApp('spotify');
        });
      }

      const playBtn = slot.querySelector('#os-tb-sp-play');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.spotify.togglePlayPause();
        });
      }

      const nextBtn = slot.querySelector('#os-tb-sp-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.spotify.next();
        });
      }
    });
  }

  mountSpotify(container) {
    if (!this.spotify) return;
    const isAuth = this.spotify.isAuthenticated();
    const redirectUri = this.spotify.getRedirectUri();

    container.innerHTML = `
      <div class="os-spotify-wrap" id="os-sp-wrap">
        <div class="os-spotify-header">
          <div class="os-spotify-brand">
            <div class="os-spotify-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <strong style="font-size: 14px; letter-spacing: 0.5px;">Spotify Web Player</strong>
          </div>
          <div class="os-spotify-tabs">
            <button class="os-spotify-tab-btn active" id="os-sp-tab-api">Web API</button>
            <button class="os-spotify-tab-btn" id="os-sp-tab-embed">Embed Player</button>
            ${isAuth ? '<button class="os-spotify-tab-btn" id="os-sp-btn-logout" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">Abmelden</button>' : ''}
          </div>
        </div>

        <div id="os-sp-view-content" style="flex: 1; display: flex; flex-direction: column;"></div>
      </div>
    `;

    const viewContent = container.querySelector('#os-sp-view-content');
    const tabApi = container.querySelector('#os-sp-tab-api');
    const tabEmbed = container.querySelector('#os-sp-tab-embed');
    const logoutBtn = container.querySelector('#os-sp-btn-logout');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.spotify.logout();
        this.mountSpotify(container);
      });
    }

    const renderApiView = () => {
      tabApi.classList.add('active');
      tabEmbed.classList.remove('active');

      if (!this.spotify.isAuthenticated()) {
        viewContent.innerHTML = `
          <div class="os-spotify-auth-card">
            <div style="font-size: 40px; margin-bottom: 4px;">🎧</div>
            <h3 style="font-size: 18px; font-weight: 700;">Mit eigenem Spotify-Konto verbinden</h3>
            <p style="font-size: 12.5px; color: #a1a1aa; line-height: 1.5;">
              Nutze die offizielle Spotify Web API für echte Fernsteuerung deines Handys, PCs oder Lautsprechers direkt aus OrbitOS!
            </p>

            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; text-align: left; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div><strong>1. Redirect URI bei Spotify eintragen:</strong></div>
              <div class="os-spotify-copy-box">
                <span id="os-sp-redirect-val">${redirectUri}</span>
                <button class="btn-secondary" id="os-sp-copy-btn" style="padding: 2px 8px; font-size: 10px; margin-left: auto;">Kopieren</button>
              </div>
              <div style="color: #94a3b8; font-size: 11px;">
                Trage diese URL im <a href="https://developer.spotify.com/dashboard" target="_blank" style="color: #1db954; text-decoration: underline;">Spotify Developer Dashboard</a> unter deiner App in <em>Redirect URIs</em> ein.
              </div>

              <div style="margin-top: 6px;"><strong>2. Deine Spotify Client ID eingeben:</strong></div>
              <input type="text" id="os-sp-client-id" class="input-field" placeholder="Client ID aus dem Dashboard..." value="${this.spotify.clientId || ''}" style="background: #181818; color: #fff; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15); font-family: monospace; font-size: 12px;">
            </div>

            <button class="os-spotify-auth-btn" id="os-sp-login-btn">
              <span>🟢</span>
              <span>Mit Spotify autorisieren</span>
            </button>
          </div>
        `;

        const copyBtn = viewContent.querySelector('#os-sp-copy-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(redirectUri);
            copyBtn.textContent = 'Kopiert!';
            setTimeout(() => { copyBtn.textContent = 'Kopieren'; }, 2000);
          });
        }

        const loginBtn = viewContent.querySelector('#os-sp-login-btn');
        if (loginBtn) {
          loginBtn.addEventListener('click', async () => {
            const cid = viewContent.querySelector('#os-sp-client-id').value.trim();
            if (!cid) {
              alert('Bitte trage deine Spotify Client ID ein!');
              return;
            }
            try {
              await this.spotify.login(cid);
            } catch (err) {
              alert(err.message);
            }
          });
        }
      } else {
        // Authenticated Player UI
        viewContent.innerHTML = `
          <div class="os-spotify-player-main" id="os-sp-player-area">
            <div class="os-spotify-cover-wrap">
              <img id="os-sp-cover" class="os-spotify-cover" src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80" alt="Album Cover">
            </div>

            <div class="os-spotify-info">
              <div>
                <div class="os-spotify-track-title" id="os-sp-title">Warte auf Wiedergabe...</div>
                <div class="os-spotify-track-artist" id="os-sp-artist">Starte Musik auf deinem Gerät (z.B. Spotify App)</div>
              </div>

              <div class="os-spotify-progress-row">
                <span id="os-sp-time-cur">0:00</span>
                <div class="os-spotify-progress-bar" id="os-sp-bar">
                  <div class="os-spotify-progress-fill" id="os-sp-fill"></div>
                </div>
                <span id="os-sp-time-dur">0:00</span>
              </div>

              <div class="os-spotify-controls">
                <button class="os-spotify-ctrl-btn" id="os-sp-btn-prev" title="Vorheriger">⏮</button>
                <button class="os-spotify-ctrl-btn os-spotify-ctrl-play" id="os-sp-btn-toggle" title="Play / Pause">▶</button>
                <button class="os-spotify-ctrl-btn" id="os-sp-btn-next" title="Nächster">⏭</button>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
                <div class="os-spotify-device-badge" id="os-sp-device">
                  <span>📱</span>
                  <span id="os-sp-device-name">Bereit für Fernsteuerung</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 11px; opacity: 0.7;">🔈</span>
                  <input type="range" id="os-sp-vol" min="0" max="100" value="70" style="width: 70px; accent-color: #1db954;">
                </div>
              </div>
            </div>
          </div>
        `;

        const titleEl = viewContent.querySelector('#os-sp-title');
        const artistEl = viewContent.querySelector('#os-sp-artist');
        const coverEl = viewContent.querySelector('#os-sp-cover');
        const fillEl = viewContent.querySelector('#os-sp-fill');
        const curTimeEl = viewContent.querySelector('#os-sp-time-cur');
        const durTimeEl = viewContent.querySelector('#os-sp-time-dur');
        const toggleBtn = viewContent.querySelector('#os-sp-btn-toggle');
        const deviceNameEl = viewContent.querySelector('#os-sp-device-name');
        const volSlider = viewContent.querySelector('#os-sp-vol');

        const formatTime = (ms) => {
          const s = Math.floor(ms / 1000);
          const m = Math.floor(s / 60);
          const rem = s % 60;
          return `${m}:${rem < 10 ? '0' : ''}${rem}`;
        };

        const updatePlayerUI = (state) => {
          if (!state || !state.item) {
            titleEl.textContent = 'Keine aktive Wiedergabe';
            artistEl.textContent = 'Öffne Spotify auf Handy/PC und starte einen Song.';
            toggleBtn.textContent = '▶';
            fillEl.style.width = '0%';
            return;
          }

          const track = state.item;
          titleEl.textContent = track.name;
          artistEl.textContent = track.artists ? track.artists.map(a => a.name).join(', ') : '';
          if (track.album && track.album.images && track.album.images[0]) {
            coverEl.src = track.album.images[0].url;
          }

          const progress = state.progress_ms || 0;
          const duration = track.duration_ms || 1;
          const pct = Math.min(100, (progress / duration) * 100);

          fillEl.style.width = `${pct}%`;
          curTimeEl.textContent = formatTime(progress);
          durTimeEl.textContent = formatTime(duration);
          toggleBtn.textContent = state.is_playing ? '⏸' : '▶';

          if (state.device) {
            deviceNameEl.textContent = `${state.device.name} (${state.device.type})`;
            volSlider.value = state.device.volume_percent || 70;
          }
        };

        // Subscribe UI
        const unsub = this.spotify.subscribe(updatePlayerUI);
        this.spotify.fetchPlaybackState();

        // Control bindings
        viewContent.querySelector('#os-sp-btn-toggle').addEventListener('click', () => this.spotify.togglePlayPause());
        viewContent.querySelector('#os-sp-btn-prev').addEventListener('click', () => this.spotify.previous());
        viewContent.querySelector('#os-sp-btn-next').addEventListener('click', () => this.spotify.next());

        volSlider.addEventListener('change', (e) => {
          this.spotify.setVolume(e.target.value);
        });

        // Seek click
        viewContent.querySelector('#os-sp-bar').addEventListener('click', (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPct = (e.clientX - rect.left) / rect.width;
          if (this.spotify.currentState && this.spotify.currentState.item) {
            const targetMs = this.spotify.currentState.item.duration_ms * clickPct;
            this.spotify.seek(targetMs);
          }
        });
      }
    };

    const renderEmbedView = () => {
      tabApi.classList.remove('active');
      tabEmbed.classList.add('active');

      viewContent.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; padding: 14px; gap: 12px; height: 100%; box-sizing: border-box;">
          <!-- Quick Selection Chips -->
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 11px; color: #a1a1aa; font-weight: 600;">STATIONEN:</span>
            <button class="os-sp-chip active" data-uri="37i9dQZF1DXcBWIGoYBM5M">☕ Today's Top Hits</button>
            <button class="os-sp-chip" data-uri="37i9dQZF1DXdLEN7aqioXM">💻 Lo-Fi Beats / Coding</button>
            <button class="os-sp-chip" data-uri="37i9dQZF1DWZeKCadgRdKQ">⚡ Deep Focus</button>
            <button class="os-sp-chip" data-uri="37i9dQZF1DX4sWSpwq3LiO">🌊 Peaceful Piano</button>
            <button class="os-sp-chip" data-uri="37i9dQZF1DX1s9knjP51Oa">Synthwave / Cyberpunk</button>
          </div>

          <!-- Link input bar -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" id="os-sp-embed-input" class="input-field" placeholder="Eigenen Spotify-Link (Album, Playlist oder Track) einfügen..." style="flex: 1; background: #181818; color: #fff; padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); font-size: 12px;">
            <button class="btn-primary" id="os-sp-embed-btn" style="padding: 7px 16px; font-size: 12px; background: #1db954; color: #000; font-weight: 700; border-radius: 8px; flex-shrink: 0;">Laden</button>
          </div>

          <!-- Interactive Web Player Iframe -->
          <div style="flex: 1; min-height: 340px; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
            <iframe id="os-sp-iframe" style="width: 100%; height: 100%; border: 0; display: block;" src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          </div>
        </div>
      `;

      const embedInput = viewContent.querySelector('#os-sp-embed-input');
      const embedBtn = viewContent.querySelector('#os-sp-embed-btn');
      const iframe = viewContent.querySelector('#os-sp-iframe');
      const chips = viewContent.querySelectorAll('.os-sp-chip');

      const loadUri = (uri) => {
        let cleanUri = uri.trim();
        if (cleanUri.includes('open.spotify.com')) {
          if (!cleanUri.includes('/embed/')) {
            cleanUri = cleanUri.replace('open.spotify.com/', 'open.spotify.com/embed/');
          }
          iframe.src = cleanUri;
        } else {
          iframe.src = `https://open.spotify.com/embed/playlist/${cleanUri}?utm_source=generator&theme=0`;
        }
      };

      embedBtn.addEventListener('click', () => {
        if (embedInput.value.trim()) {
          chips.forEach(c => c.classList.remove('active'));
          loadUri(embedInput.value.trim());
        }
      });

      embedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && embedInput.value.trim()) {
          chips.forEach(c => c.classList.remove('active'));
          loadUri(embedInput.value.trim());
        }
      });

      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          loadUri(chip.dataset.uri);
        });
      });
    };

    tabApi.addEventListener('click', renderApiView);
    tabEmbed.addEventListener('click', renderEmbedView);

    // Initial render
    renderApiView();
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


  mountFolienwerk(container) {
    container.innerHTML = `
      <div class="os-folienwerk-wrap" style="display:flex; flex-direction:column; height:100%; background:#0f1117; color:#fff; overflow:hidden;">
        <!-- Folienwerk Top Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#181b24; border-bottom:1px solid rgba(255,255,255,0.08); flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg, #e11d48, #f43f5e); display:flex; align-items:center; justify-content:center; font-size:16px;">📑</div>
            <div>
              <div style="font-weight:700; font-size:13px; letter-spacing:-0.01em;">Folienwerk <span style="font-size:10px; color:#f43f5e; font-weight:700; background:rgba(225,29,72,0.15); border:1px solid rgba(225,29,72,0.3); padding:1px 6px; border-radius:10px; margin-left:4px;">OTTO GROUP</span></div>
              <div style="font-size:11px; color:#94a3b8;" id="os-fw-url-display">http://localhost:8765</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="status-badge" id="os-fw-status" style="font-size:11px; padding:3px 8px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#94a3b8; display:flex; align-items:center; gap:5px;">
              <span id="os-fw-status-dot" style="width:7px; height:7px; border-radius:50%; background:#f59e0b; display:inline-block;"></span>
              <span id="os-fw-status-text">Prüfe Server...</span>
            </span>
            <button id="os-fw-btn-reload" style="padding:5px 10px; font-size:11px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#fff; cursor:pointer;" title="Neu laden">🔄 Neu laden</button>
            <button id="os-fw-btn-browser" style="padding:5px 12px; font-size:11px; border-radius:6px; background:#e11d48; color:#fff; font-weight:600; border:none; cursor:pointer;" title="Im Browser öffnen">Im Browser öffnen ↗</button>
          </div>
        </div>

        <!-- Frame / Status View -->
        <div style="flex:1; position:relative; overflow:hidden; background:#0b0d13;">
          <iframe id="os-fw-iframe" src="http://localhost:8765" style="width:100%; height:100%; border:none; display:block;" allow="clipboard-read; clipboard-write"></iframe>
          
          <div id="os-fw-offline-card" style="display:none; position:absolute; inset:0; background:rgba(15,17,23,0.95); backdrop-filter:blur(10px); flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; z-index:10;">
            <div style="width:64px; height:64px; border-radius:18px; background:linear-gradient(135deg, #e11d48, #f43f5e); display:flex; align-items:center; justify-content:center; font-size:32px; margin-bottom:16px; box-shadow:0 8px 24px rgba(225,29,72,0.35);">📑</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:6px; color:#fff;">Folienwerk Server starten</h3>
            <p style="font-size:13px; color:#94a3b8; max-width:480px; line-height:1.5; margin-bottom:18px;">
              Folienwerk läuft lokal als Server auf deinem Computer unter <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; color:#f43f5e; font-size:12px;">http://localhost:8765</code>.
            </p>
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 20px; text-align:left; font-size:12px; max-width:440px; margin-bottom:20px;">
              <div style="font-weight:600; color:#e2e8f0; margin-bottom:6px;">So startest du Folienwerk:</div>
              <ol style="margin:0; padding-left:18px; color:#94a3b8; line-height:1.6;">
                <li>Öffne deinen Folienwerk-Ordner und doppelklicke auf <strong style="color:#fff;">Folienwerk starten.bat</strong></li>
                <li>Lass das Konsolenfenster während deiner Arbeit geöffnet</li>
                <li>Klicke danach hier auf <em>Verbindung prüfen</em></li>
              </ol>
            </div>
            <div style="display:flex; gap:10px;">
              <button id="os-fw-btn-retry" style="padding:8px 18px; background:#e11d48; color:#fff; border-radius:8px; font-size:12.5px; font-weight:600; border:none; cursor:pointer;">Verbindung prüfen 🔄</button>
              <button id="os-fw-btn-open-tab" style="padding:8px 16px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:8px; font-size:12.5px; cursor:pointer;">Im Browser öffnen ↗</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const iframe = container.querySelector('#os-fw-iframe');
    const offlineCard = container.querySelector('#os-fw-offline-card');
    const statusDot = container.querySelector('#os-fw-status-dot');
    const statusText = container.querySelector('#os-fw-status-text');
    const btnReload = container.querySelector('#os-fw-btn-reload');
    const btnBrowser = container.querySelector('#os-fw-btn-browser');
    const btnRetry = container.querySelector('#os-fw-btn-retry');
    const btnOpenTab = container.querySelector('#os-fw-btn-open-tab');

    const checkServer = async () => {
      statusDot.style.background = '#f59e0b';
      statusText.textContent = 'Prüfe...';
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        await fetch('http://localhost:8765', { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
        // Server online!
        statusDot.style.background = '#10b981';
        statusText.textContent = 'Online (Port 8765)';
        offlineCard.style.display = 'none';
        iframe.style.display = 'block';
      } catch (err) {
        // Server offline
        statusDot.style.background = '#ef4444';
        statusText.textContent = 'Offline';
        offlineCard.style.display = 'flex';
        iframe.style.display = 'none';
      }
    };

    const openInBrowser = () => {
      window.open('http://localhost:8765', '_blank');
    };

    btnReload.addEventListener('click', () => {
      checkServer();
      iframe.src = 'http://localhost:8765';
    });
    btnRetry.addEventListener('click', () => {
      checkServer();
      iframe.src = 'http://localhost:8765';
    });
    btnBrowser.addEventListener('click', openInBrowser);
    btnOpenTab.addEventListener('click', openInBrowser);

    // Initial check
    checkServer();
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
