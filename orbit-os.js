/**
 * OrbitOS • Modern Web Desktop Environment & Window Management Engine
 * Hybrid Workspace Extension for OrbitSuite
 */

class OrbitOS {
  constructor(suite) {
    this.suite = suite;
    this.activeMode = localStorage.getItem('orbit_active_mode') || 'suite'; // 'suite' | 'os'
    this.activeWallpaper = localStorage.getItem('orbit_os_wallpaper') || 'nebula';
    this.windows = new Map();
    this.windowZIndex = 100;
    this.activeWindowId = null;

    this.appDefinitions = {
      tasks: {
        name: 'Aufgaben & Kanban',
        icon: '🎯',
        color: '#6366f1',
        isSuiteApp: true,
        suiteViewId: 'app-view-tasks',
        defaultWidth: 920,
        defaultHeight: 640
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
      calculator: {
        name: 'Rechner',
        icon: '🧮',
        color: '#8b5cf6',
        isSuiteApp: false,
        defaultWidth: 320,
        defaultHeight: 440
      },
      terminal: {
        name: 'Terminal CLI',
        icon: '💻',
        color: '#14b8a6',
        isSuiteApp: false,
        defaultWidth: 640,
        defaultHeight: 400
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
        <!-- Desktop Icons -->
        <div class="os-desktop-icons" id="os-desktop-icons"></div>

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

        <!-- Floating Windows Container -->
        <div id="os-windows-container" style="position: absolute; inset: 0; pointer-events: none;"></div>
      </div>

      <!-- Start Menu Flyout -->
      <div id="orbit-os-start-menu">
        <div class="os-start-search">
          <input type="text" class="os-start-search-input" id="os-start-search-input" placeholder="🔍 Apps und Befehle durchsuchen...">
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

    // Render Desktop Icons & Start Menu Apps
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
      // For mobile / single-click:
      iconEl.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
          this.openApp(appId);
        }
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
    const suiteHeader = document.querySelector('.suite-header-right');
    if (suiteHeader) {
      const btnToggle = document.createElement('button');
      btnToggle.className = 'suite-os-mode-btn';
      btnToggle.id = 'btn-toggle-orbit-os';
      btnToggle.title = 'Zu OrbitOS Desktop wechseln (Alt + D)';
      btnToggle.innerHTML = `
        <span>🖥️</span>
        <span>OrbitOS Desktop</span>
      `;
      btnToggle.addEventListener('click', () => this.enableOSMode());
      suiteHeader.insertBefore(btnToggle, suiteHeader.firstChild);
    }

    // Switch back to Workspace from Taskbar and Start Menu
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

    // Click outside Start Menu to close
    document.addEventListener('click', (e) => {
      const startMenu = document.getElementById('orbit-os-start-menu');
      if (startMenu && startMenu.classList.contains('open')) {
        if (!startMenu.contains(e.target) && e.target !== startBtn && !startBtn.contains(e.target)) {
          this.toggleStartMenu(false);
        }
      }
    });

    // Keyboard Shortcuts: Alt+D toggles OS Mode
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

    // If no windows are open, open Tasks by default
    if (this.windows.size === 0) {
      this.openApp('tasks');
    }

    if (this.suite && this.suite.showToast) {
      this.suite.showToast('OrbitOS Desktop aktiviert 🖥️ (Alt + D zum Umschalten)', 'info');
    }
  }

  disableOSMode() {
    this.activeMode = 'suite';
    localStorage.setItem('orbit_active_mode', 'suite');
    document.body.classList.remove('orbit-os-active');

    // Return all suite views back to suite container
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

    // If window already open, un-minimize and focus
    if (this.windows.has(appId)) {
      const win = this.windows.get(appId);
      win.element.classList.remove('minimized');
      this.bringToFront(appId);
      return;
    }

    // Create New Window
    const winContainer = document.getElementById('os-windows-container');
    if (!winContainer) return;

    const winEl = document.createElement('div');
    winEl.className = 'os-window active';
    winEl.id = `os-window-${appId}`;
    winEl.style.pointerEvents = 'auto';

    // Position staggered based on window count
    const offset = (this.windows.size * 28) % 180;
    const initialLeft = Math.min(window.innerWidth - def.defaultWidth - 20, 60 + offset);
    const initialTop = Math.min(window.innerHeight - def.defaultHeight - 80, 50 + offset);

    winEl.style.left = `${Math.max(20, initialLeft)}px`;
    winEl.style.top = `${Math.max(20, initialTop)}px`;
    winEl.style.width = `${Math.min(window.innerWidth - 40, def.defaultWidth)}px`;
    winEl.style.height = `${Math.min(window.innerHeight - 100, def.defaultHeight)}px`;
    winEl.style.zIndex = ++this.windowZIndex;

    winEl.innerHTML = `
      <!-- Window Titlebar -->
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

      <!-- Window Body -->
      <div class="os-window-body" id="os-window-body-${appId}"></div>

      <!-- Resizers -->
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

    // Mount App Content
    if (def.isSuiteApp && def.suiteViewId) {
      const suiteView = document.getElementById(def.suiteViewId);
      if (suiteView) {
        suiteView.style.display = 'block';
        bodyEl.appendChild(suiteView);
      }
    } else if (appId === 'calculator') {
      this.mountCalculator(bodyEl);
    } else if (appId === 'terminal') {
      this.mountTerminal(bodyEl);
    } else if (appId === 'settings') {
      this.mountSettings(bodyEl);
    }

    // Save Window Record
    const winRecord = {
      appId,
      element: winEl,
      isMaximized: false,
      prevBounds: null
    };
    this.windows.set(appId, winRecord);
    this.activeWindowId = appId;

    // Setup Window Dragging & Resizing
    this.setupWindowInteractions(winRecord);

    // Add Tab to Taskbar
    this.addTaskbarTab(appId);

    // Sound effect
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

    // Update active classes
    this.windows.forEach((w) => w.element.classList.remove('active'));
    win.element.classList.add('active');

    // Update taskbar tabs
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

    // Focus on click
    el.addEventListener('mousedown', () => this.bringToFront(win.appId));

    // Header Controls
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

    // Window Dragging
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

    // Window Resizing
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

        if (dir.includes('e')) {
          el.style.width = `${Math.max(280, startW + dx)}px`;
        }
        if (dir.includes('s')) {
          el.style.height = `${Math.max(180, startH + dy)}px`;
        }
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

  mountTerminal(container) {
    container.innerHTML = `
      <div class="os-terminal-wrap">
        <div class="os-terminal-output" id="os-term-out">
          <div><strong style="color: #38bdf8;">OrbitOS Shell v1.0</strong> [Type <span style="color: #facc15;">'help'</span> for available commands]</div>
        </div>
        <div class="os-terminal-input-row">
          <span class="os-terminal-prompt">rune@orbit:~$</span>
          <input type="text" class="os-terminal-input" id="os-term-in" autofocus>
        </div>
      </div>
    `;

    const out = container.querySelector('#os-term-out');
    const input = container.querySelector('#os-term-in');

    const print = (text, color = '#cbd5e1') => {
      const line = document.createElement('div');
      line.style.color = color;
      line.innerHTML = text;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        if (!cmd) return;

        print(`<span style="color: #34d399;">rune@orbit:~$</span> ${cmd}`);
        const parts = cmd.split(' ');
        const main = parts[0].toLowerCase();

        if (main === 'help') {
          print('Verfügbare Befehle:');
          print('  <span style="color: #facc15;">tasks</span>        - Zeigt Anzahl und Status offener Aufgaben');
          print('  <span style="color: #facc15;">calc &lt;expr&gt;</span>   - Berechnet einen mathematischen Ausdruck');
          print('  <span style="color: #facc15;">matrix</span>       - Startet Matrix Digital Rain Animation');
          print('  <span style="color: #facc15;">wallpaper</span>    - Ändert Wallpaper: nebula, cyberpunk, midnight, aurora');
          print('  <span style="color: #facc15;">clear</span>        - Löscht den Bildschirm');
          print('  <span style="color: #facc15;">exit</span>         - Schließt das Terminal');
        } else if (main === 'tasks') {
          const tasks = (this.suite && this.suite.tasks && this.suite.tasks.tasks) ? this.suite.tasks.tasks : [];
          print(`Aktuelle Aufgabenanzahl: <strong>${tasks.length}</strong>`);
          tasks.slice(0, 5).forEach((t, i) => {
            print(` [${i+1}] ${t.title || 'Aufgabe'} (${t.status || 'backlog'})`);
          });
        } else if (main === 'calc') {
          try {
            const res = eval(parts.slice(1).join(' '));
            print(`= ${res}`, '#10b981');
          } catch (err) {
            print(`Syntax Error: ${err.message}`, '#ef4444');
          }
        } else if (main === 'matrix') {
          print('Entering the Matrix... Wake up, Neo.', '#22c55e');
          for (let i = 0; i < 8; i++) {
            setTimeout(() => {
              const str = Array.from({length: 40}, () => String.fromCharCode(33 + Math.floor(Math.random() * 90))).join('');
              print(str, '#22c55e');
            }, i * 150);
          }
        } else if (main === 'wallpaper') {
          const wp = parts[1];
          if (['nebula', 'cyberpunk', 'midnight', 'aurora'].includes(wp)) {
            this.setWallpaper(wp);
            print(`Wallpaper geändert auf: ${wp}`, '#38bdf8');
          } else {
            print('Ungültiges Wallpaper. Verfügbar: nebula, cyberpunk, midnight, aurora', '#ef4444');
          }
        } else if (main === 'clear') {
          out.innerHTML = '';
        } else if (main === 'exit') {
          this.closeApp('terminal');
        } else {
          print(`Befehl '${main}' nicht gefunden. Tippe 'help'.`, '#ef4444');
        }
      }
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

// Attach OrbitOS to global window object
window.OrbitOS = OrbitOS;
