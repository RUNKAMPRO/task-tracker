/**
 * OrbitSuite • Integrated Productivity OS & Multi-App Framework
 * Modules: OrbitHub, OrbitTask, OrbitNotes, OrbitFocus, OrbitHabits, OrbitTools
 * Zero-dependency, offline-first client architecture with Web Audio synthesizer & Canvas Confetti.
 */

(() => {
  'use strict';

  // ==========================================================================
  // SHARED AUDIO SYNTHESIZER & AMBIENT ENGINE (Web Audio API)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.enabled = localStorage.getItem('orbitsuite_sound_enabled') !== 'false';
      this.ctx = null;
      this.ambientSource = null;
      this.ambientGain = null;
      this.currentAmbientType = 'off';
      this.ambientVolume = 0.5;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('orbitsuite_sound_enabled', this.enabled);
      if (!this.enabled && this.currentAmbientType !== 'off') {
        this.stopAmbient();
      }
      return this.enabled;
    }

    playPop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.07);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) { console.warn(e); }
    }

    playSuccess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = now + idx * 0.06;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.3);
        });
      } catch (e) { console.warn(e); }
    }

    playTrash() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) { console.warn(e); }
    }

    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const chords = [587.33, 880.00, 1174.66, 1760.00]; // D5, A5, D6, A6
        chords.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + i * 0.1;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 1.25);
        });
      } catch (e) { console.warn(e); }
    }

    // --- Procedural Ambient Synthesizer ---
    startAmbient(type, volume = 0.5) {
      this.stopAmbient();
      if (type === 'off' || !this.enabled) {
        this.currentAmbientType = 'off';
        return;
      }
      this.init();
      if (!this.ctx) return;

      this.currentAmbientType = type;
      this.ambientVolume = volume;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      if (type === 'rain') {
        // Procedural pink noise with low-pass filtering
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(this.ambientGain);
        noiseSource.start();
        this.ambientSource = noiseSource;
      } else if (type === 'zen') {
        // Warm 432Hz meditative chord
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(216, this.ctx.currentTime); // A3
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(432, this.ctx.currentTime); // A4

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(this.ambientGain);
        osc1.start();
        osc2.start();
        this.ambientSource = {
          stop: () => {
            try { osc1.stop(); osc2.stop(); } catch (e) {}
          }
        };
      } else if (type === 'white') {
        // Pure White Noise
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(this.ambientGain);
        noise.start();
        this.ambientSource = noise;
      }
    }

    setAmbientVolume(volume) {
      this.ambientVolume = volume;
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(volume * 0.15, this.ctx.currentTime, 0.05);
      }
    }

    stopAmbient() {
      if (this.ambientSource) {
        try { this.ambientSource.stop(); } catch (e) {}
        this.ambientSource = null;
      }
      this.currentAmbientType = 'off';
    }
  }

  // ==========================================================================
  // SHARED CONFETTI PARTICLE SYSTEM (Canvas)
  // ==========================================================================
  class ConfettiManager {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animating = false;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire() {
      if (!this.canvas || !this.ctx) return;
      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e'];
      const count = 90;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: window.innerWidth * (0.35 + Math.random() * 0.3),
          y: window.innerHeight * 0.45,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.9) * 15 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          opacity: 1,
          gravity: 0.35,
          drag: 0.96
        });
      }
      if (!this.animating) {
        this.animating = true;
        this.loop();
      }
    }

    loop() {
      if (!this.particles.length) {
        this.animating = false;
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return;
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      }
      requestAnimationFrame(() => this.loop());
    }
  }

  // Helper date function
  function getTodayString(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 1. ORBITTASK MODULE (PRO TASK & KANBAN TRACKER)
  // ==========================================================================
  const DEFAULT_DEMO_TASKS = [
    {
      id: 'task-1',
      title: 'Design-System für OrbitTask 2.0 finalisieren',
      description: 'Farbpalette, Glassmorphism-Tokens, Typografie und Glow-Effekte im CSS dokumentieren.',
      status: 'inprogress',
      priority: 'urgent',
      category: 'Design',
      dueDate: getTodayString(0),
      subtasks: [
        { id: 'sub-1-1', title: 'Farb-Tokens festlegen', completed: true },
        { id: 'sub-1-2', title: 'Glow-Effekte kalibrieren', completed: true },
        { id: 'sub-1-3', title: 'Responsive Breakpoints testen', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'task-2',
      title: 'Kanban Drag & Drop Interaktionen optimieren',
      description: 'Sanfte Drop-Animationen und visuelle Indikatoren für Kartenzielspalten einbauen.',
      status: 'review',
      priority: 'high',
      category: 'Entwicklung',
      dueDate: getTodayString(1),
      subtasks: [
        { id: 'sub-2-1', title: 'HTML5 Drag & Drop Events binden', completed: true },
        { id: 'sub-2-2', title: 'Ghosting-Styling definieren', completed: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'task-3',
      title: 'Web Audio Sound-Effekte Synthesizer integrieren',
      description: 'Native Sound-Generierung ohne externe MP3-Assets für Klicks und Erfolgsfanfaren.',
      status: 'done',
      priority: 'medium',
      category: 'Entwicklung',
      dueDate: getTodayString(-1),
      subtasks: [
        { id: 'sub-3-1', title: 'AudioContext Singleton aufsetzen', completed: true },
        { id: 'sub-3-2', title: 'Mute-Option in LocalStorage speichern', completed: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'task-4',
      title: 'Analytics Dashboard Diagramme verdrahten',
      description: 'Dynamisches SVG-Radialdiagramm und Prioritäts-Aufschlüsselung mit Live-Daten koppeln.',
      status: 'todo',
      priority: 'high',
      category: 'Management',
      dueDate: getTodayString(2),
      subtasks: [
        { id: 'sub-4-1', title: 'SVG-Radialfortschrittsbalken implementieren', completed: false },
        { id: 'sub-4-2', title: 'Kategorie-Erledigungsquoten berechnen', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'task-5',
      title: 'End-to-End Datenexport als JSON testen',
      description: 'Prüfen ob alle Aufgabenfelder fehlerfrei im JSON-Format exportiert und importiert werden.',
      status: 'backlog',
      priority: 'low',
      category: 'QA',
      dueDate: getTodayString(5),
      subtasks: [
        { id: 'sub-5-1', title: 'JSON Schema validieren', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 'task-6',
      title: 'Steuererklärung & Quartalsbelege abheften',
      description: 'Alle Rechnungen für Q3 zusammenstellen und an den Steuerberater senden.',
      status: 'todo',
      priority: 'urgent',
      category: 'Privat',
      dueDate: getTodayString(-2),
      subtasks: [
        { id: 'sub-6-1', title: 'Kontoauszüge herunterladen', completed: true },
        { id: 'sub-6-2', title: 'PDFs in Ordner einsortieren', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];

  class OrbitTaskApp {
    constructor(suite) {
      this.suite = suite;
      this.sound = suite.sound;
      this.confetti = suite.confetti;
      this.STORAGE_KEY = 'orbittask_tasks_v2';
      this.tasks = this.loadTasks();
      this.activeView = 'kanban';
      this.searchQuery = '';
      this.filterType = 'all';
      this.filterVal = 'all';
      this.selectedTag = null;
      this.sortBy = 'createdAt-desc';
      this.currentEditingSubtasks = [];
      this.lastDeletedTask = null;

      // DOM References
      this.dom = {
        tabKanban: document.getElementById('tab-kanban'),
        tabList: document.getElementById('tab-list'),
        tabAnalytics: document.getElementById('tab-analytics'),
        viewKanbanPanel: document.getElementById('view-kanban-panel'),
        viewListPanel: document.getElementById('view-list-panel'),
        viewAnalyticsPanel: document.getElementById('view-analytics-panel'),
        globalSearch: document.getElementById('global-search-input'),
        clearSearchBtn: document.getElementById('clear-search-btn'),
        filterChips: document.querySelectorAll('#controls-strip .filter-chip'),
        tagFiltersContainer: document.getElementById('tag-filters'),
        sortSelect: document.getElementById('sort-select'),
        valTotalTasks: document.getElementById('val-total-tasks'),
        valInProgress: document.getElementById('val-in-progress'),
        valCompleted: document.getElementById('val-completed'),
        valCompletionRate: document.getElementById('val-completion-rate'),
        valOverdue: document.getElementById('val-overdue'),
        colBacklog: document.getElementById('container-backlog'),
        colTodo: document.getElementById('container-todo'),
        colInprogress: document.getElementById('container-inprogress'),
        colReview: document.getElementById('container-review'),
        colDone: document.getElementById('container-done'),
        countBacklog: document.getElementById('count-backlog'),
        countTodo: document.getElementById('count-todo'),
        countInprogress: document.getElementById('count-inprogress'),
        countReview: document.getElementById('count-review'),
        countDone: document.getElementById('count-done'),
        listItemsBody: document.getElementById('list-items-body'),
        radialCircle: document.getElementById('analytics-radial-circle'),
        radialPercent: document.getElementById('analytics-radial-percent'),
        progDetails: document.getElementById('analytics-progress-details'),
        statusBars: document.getElementById('analytics-status-bars'),
        priorityGrid: document.getElementById('analytics-priority-grid'),
        catList: document.getElementById('analytics-categories-list'),
        modal: document.getElementById('task-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalCancelBtn: document.getElementById('btn-modal-cancel'),
        taskForm: document.getElementById('task-form'),
        inputFormId: document.getElementById('task-form-id'),
        inputTitle: document.getElementById('task-input-title'),
        inputDesc: document.getElementById('task-input-desc'),
        inputStatus: document.getElementById('task-input-status'),
        inputPriority: document.getElementById('task-input-priority'),
        inputCategory: document.getElementById('task-input-category'),
        inputDueDate: document.getElementById('task-input-duedate'),
        subtaskInputText: document.getElementById('subtask-input-text'),
        btnAddSubtask: document.getElementById('btn-add-subtask'),
        modalSubtasksList: document.getElementById('modal-subtasks-list'),
        modalSubtasksCount: document.getElementById('modal-subtasks-count'),
        btnCreateTask: document.getElementById('btn-create-task'),
        btnMoreOptions: document.getElementById('btn-more-options'),
        moreOptionsMenu: document.getElementById('more-options-menu'),
        optLoadDemo: document.getElementById('opt-load-demo'),
        optExportJson: document.getElementById('opt-export-json'),
        inputImportJson: document.getElementById('input-import-json'),
        optClearAll: document.getElementById('opt-clear-all')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.render();
    }

    loadTasks() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
      this.saveTasks(DEFAULT_DEMO_TASKS);
      return [...DEFAULT_DEMO_TASKS];
    }

    saveTasks(tasks = this.tasks) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
        if (this.suite && this.suite.hubApp) {
          this.suite.hubApp.render();
        }
      } catch (err) {
        console.error('Error saving tasks:', err);
      }
    }

    bindEvents() {
      const tabs = [this.dom.tabKanban, this.dom.tabList, this.dom.tabAnalytics];
      tabs.forEach(tab => {
        if (!tab) return;
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeView = tab.dataset.view;
          this.switchView(this.activeView);
          this.sound.playPop();
        });
      });

      document.querySelectorAll('.btn-quick-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetStatus = btn.dataset.status;
          this.openCreateModal(targetStatus);
        });
      });

      if (this.dom.btnCreateTask) {
        this.dom.btnCreateTask.addEventListener('click', () => this.openCreateModal());
      }
      if (this.dom.modalCloseBtn) {
        this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.modalCancelBtn) {
        this.dom.modalCancelBtn.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.modal) {
        this.dom.modal.addEventListener('click', (e) => {
          if (e.target === this.dom.modal) this.closeModal();
        });
      }

      if (this.dom.btnAddSubtask) {
        this.dom.btnAddSubtask.addEventListener('click', () => this.addModalSubtask());
      }
      if (this.dom.subtaskInputText) {
        this.dom.subtaskInputText.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.addModalSubtask();
          }
        });
      }

      if (this.dom.taskForm) {
        this.dom.taskForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveModalTask();
        });
      }

      if (this.dom.globalSearch) {
        this.dom.globalSearch.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          if (this.dom.clearSearchBtn) {
            this.dom.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
          }
          this.render();
        });
      }

      if (this.dom.clearSearchBtn) {
        this.dom.clearSearchBtn.addEventListener('click', () => {
          this.dom.globalSearch.value = '';
          this.searchQuery = '';
          this.dom.clearSearchBtn.style.display = 'none';
          this.render();
        });
      }

      this.dom.filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          this.dom.filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.filterType = chip.dataset.filterType;
          this.filterVal = chip.dataset.filterVal;
          this.sound.playPop();
          this.render();
        });
      });

      if (this.dom.sortSelect) {
        this.dom.sortSelect.addEventListener('change', (e) => {
          this.sortBy = e.target.value;
          this.render();
        });
      }

      if (this.dom.btnMoreOptions) {
        this.dom.btnMoreOptions.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dom.moreOptionsMenu.classList.toggle('hidden');
        });
      }

      document.addEventListener('click', () => {
        if (this.dom.moreOptionsMenu) this.dom.moreOptionsMenu.classList.add('hidden');
      });

      if (this.dom.optLoadDemo) {
        this.dom.optLoadDemo.addEventListener('click', () => {
          if (confirm('Möchtest du die Demo-Aufgaben zurücksetzen? Aktuelle Aufgaben werden überschrieben.')) {
            this.tasks = [...DEFAULT_DEMO_TASKS];
            this.saveTasks();
            this.suite.showToast('Demo-Aufgaben erfolgreich geladen!');
            this.render();
            this.sound.playSuccess();
          }
        });
      }

      if (this.dom.optExportJson) {
        this.dom.optExportJson.addEventListener('click', () => this.exportTasksJson());
      }

      if (this.dom.inputImportJson) {
        this.dom.inputImportJson.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) this.importTasksJson(file);
          e.target.value = '';
        });
      }

      if (this.dom.optClearAll) {
        this.dom.optClearAll.addEventListener('click', () => {
          if (confirm('Bist du sicher? Alle Aufgaben werden unwiderruflich gelöscht!')) {
            this.tasks = [];
            this.saveTasks();
            this.suite.showToast('Alle Aufgaben wurden gelöscht.', 'warning');
            this.render();
            this.sound.playTrash();
          }
        });
      }

      this.initKanbanDragDrop();
    }

    switchView(view) {
      if (this.dom.viewKanbanPanel) this.dom.viewKanbanPanel.classList.toggle('active', view === 'kanban');
      if (this.dom.viewListPanel) this.dom.viewListPanel.classList.toggle('active', view === 'list');
      if (this.dom.viewAnalyticsPanel) this.dom.viewAnalyticsPanel.classList.toggle('active', view === 'analytics');
      this.render();
    }

    initKanbanDragDrop() {
      const columns = [
        this.dom.colBacklog,
        this.dom.colTodo,
        this.dom.colInprogress,
        this.dom.colReview,
        this.dom.colDone
      ];

      columns.forEach(col => {
        if (!col) return;
        const colParent = col.closest('.kanban-column');
        if (!colParent) return;

        colParent.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          colParent.classList.add('drag-over');
        });

        colParent.addEventListener('dragleave', (e) => {
          if (!colParent.contains(e.relatedTarget)) {
            colParent.classList.remove('drag-over');
          }
        });

        colParent.addEventListener('drop', (e) => {
          e.preventDefault();
          colParent.classList.remove('drag-over');
          const taskId = e.dataTransfer.getData('text/plain');
          const newStatus = col.dataset.status;
          if (taskId && newStatus) {
            this.updateTaskStatus(taskId, newStatus);
          }
        });
      });
    }

    updateTaskStatus(taskId, newStatus) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task || task.status === newStatus) return;

      task.status = newStatus;
      task.updatedAt = new Date().toISOString();

      if (newStatus === 'done') {
        if (task.subtasks) task.subtasks.forEach(s => s.completed = true);
        this.confetti.fire();
        this.sound.playSuccess();
        this.suite.showToast(`Aufgabe "${task.title}" abgeschlossen! 🎉`);
      } else {
        this.sound.playPop();
      }

      this.saveTasks();
      this.render();
    }

    getFilteredTasks() {
      const todayStr = getTodayString(0);

      return this.tasks.filter(task => {
        if (this.searchQuery) {
          const inTitle = task.title.toLowerCase().includes(this.searchQuery);
          const inDesc = (task.description || '').toLowerCase().includes(this.searchQuery);
          const inCat = (task.category || '').toLowerCase().includes(this.searchQuery);
          const inSub = (task.subtasks || []).some(s => s.title.toLowerCase().includes(this.searchQuery));
          if (!inTitle && !inDesc && !inCat && !inSub) return false;
        }

        if (this.filterType === 'priority') {
          if (task.priority !== this.filterVal) return false;
        } else if (this.filterType === 'time') {
          if (this.filterVal === 'today') {
            if (task.dueDate !== todayStr) return false;
          } else if (this.filterVal === 'overdue') {
            if (!task.dueDate || task.dueDate >= todayStr || task.status === 'done') return false;
          }
        }

        if (this.selectedTag && task.category !== this.selectedTag) {
          return false;
        }

        return true;
      }).sort((a, b) => {
        if (this.sortBy === 'createdAt-desc') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (this.sortBy === 'dueDate-asc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        } else if (this.sortBy === 'priority-desc') {
          const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        } else if (this.sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }

    render() {
      this.updateMetrics();
      this.renderTagFilters();

      if (this.activeView === 'kanban') {
        this.renderKanban();
      } else if (this.activeView === 'list') {
        this.renderList();
      } else if (this.activeView === 'analytics') {
        this.renderAnalytics();
      }
    }

    updateMetrics() {
      const total = this.tasks.length;
      const inProgress = this.tasks.filter(t => t.status === 'inprogress').length;
      const completed = this.tasks.filter(t => t.status === 'done').length;
      const todayStr = getTodayString(0);
      const overdue = this.tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (this.dom.valTotalTasks) this.dom.valTotalTasks.textContent = total;
      if (this.dom.valInProgress) this.dom.valInProgress.textContent = inProgress;
      if (this.dom.valCompleted) this.dom.valCompleted.textContent = completed;
      if (this.dom.valCompletionRate) this.dom.valCompletionRate.textContent = `${rate}% Quote`;
      if (this.dom.valOverdue) this.dom.valOverdue.textContent = overdue;
    }

    renderTagFilters() {
      if (!this.dom.tagFiltersContainer) return;
      const categories = {};
      this.tasks.forEach(t => {
        if (t.category) {
          categories[t.category] = (categories[t.category] || 0) + 1;
        }
      });

      const catKeys = Object.keys(categories);
      if (!catKeys.length) {
        this.dom.tagFiltersContainer.innerHTML = '';
        return;
      }

      this.dom.tagFiltersContainer.innerHTML = catKeys.map(cat => {
        const isActive = this.selectedTag === cat;
        return `
          <button class="tag-chip ${isActive ? 'active' : ''}" data-tag="${escapeHtml(cat)}">
            #${escapeHtml(cat)} (${categories[cat]})
          </button>
        `;
      }).join('');

      this.dom.tagFiltersContainer.querySelectorAll('.tag-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const tag = btn.dataset.tag;
          this.selectedTag = (this.selectedTag === tag) ? null : tag;
          this.sound.playPop();
          this.render();
        });
      });
    }

    renderKanban() {
      const filtered = this.getFilteredTasks();
      const columns = {
        backlog: { el: this.dom.colBacklog, countEl: this.dom.countBacklog, items: [] },
        todo: { el: this.dom.colTodo, countEl: this.dom.countTodo, items: [] },
        inprogress: { el: this.dom.colInprogress, countEl: this.dom.countInprogress, items: [] },
        review: { el: this.dom.colReview, countEl: this.dom.countReview, items: [] },
        done: { el: this.dom.colDone, countEl: this.dom.countDone, items: [] }
      };

      filtered.forEach(task => {
        if (columns[task.status]) {
          columns[task.status].items.push(task);
        } else {
          columns.todo.items.push(task);
        }
      });

      Object.keys(columns).forEach(statusKey => {
        const col = columns[statusKey];
        if (!col.el || !col.countEl) return;
        col.countEl.textContent = col.items.length;

        if (col.items.length === 0) {
          col.el.innerHTML = `<div class="column-empty">Keine Aufgaben vorhanden</div>`;
          return;
        }

        col.el.innerHTML = col.items.map(task => this.createKanbanCardHtml(task)).join('');
      });

      this.bindKanbanCardEvents();
    }

    createKanbanCardHtml(task) {
      const isDone = task.status === 'done';
      const pClass = `priority-badge ${task.priority}`;
      const pLabel = {
        urgent: 'Dringend',
        high: 'Hoch',
        medium: 'Mittel',
        low: 'Niedrig'
      }[task.priority] || 'Normal';

      const dueInfo = this.formatDueDate(task.dueDate, isDone);

      let subtasksHtml = '';
      if (task.subtasks && task.subtasks.length > 0) {
        const totalSubs = task.subtasks.length;
        const doneSubs = task.subtasks.filter(s => s.completed).length;
        const pct = Math.round((doneSubs / totalSubs) * 100);
        subtasksHtml = `
          <div class="task-subtasks-preview">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            <span>${doneSubs}/${totalSubs}</span>
            <div class="subtasks-mini-bar">
              <div class="subtasks-mini-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }

      return `
        <div class="task-card ${isDone ? 'is-done' : ''}" draggable="true" data-id="${task.id}" id="card-${task.id}">
          <div class="task-card-header">
            <div class="card-badges">
              <span class="${pClass}">
                <span class="priority-badge-dot"></span>
                ${pLabel}
              </span>
              ${task.category ? `<span class="category-badge">${escapeHtml(task.category)}</span>` : ''}
            </div>
            <button class="card-actions-btn" data-action="edit" title="Aufgabe bearbeiten" aria-label="Bearbeiten">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
          </div>

          <h4 class="task-card-title">${escapeHtml(task.title)}</h4>
          ${task.description ? `<p class="task-card-desc">${escapeHtml(task.description)}</p>` : ''}

          ${subtasksHtml}

          <div class="task-card-footer">
            <div class="due-date-pill ${dueInfo.className}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${dueInfo.text}</span>
            </div>

            <button class="quick-check-btn" data-action="toggle-done" title="${isDone ? 'Als unerledigt markieren' : 'Als erledigt markieren'}" aria-label="Status umschalten">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    }

    bindKanbanCardEvents() {
      document.querySelectorAll('.task-card').forEach(card => {
        const taskId = card.dataset.id;

        card.addEventListener('dragstart', (e) => {
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', taskId);
          e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          this.openEditModal(taskId);
        });

        const editBtn = card.querySelector('[data-action="edit"]');
        if (editBtn) {
          editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(taskId);
          });
        }

        const checkBtn = card.querySelector('[data-action="toggle-done"]');
        if (checkBtn) {
          checkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTaskCompletion(taskId);
          });
        }
      });
    }

    renderList() {
      if (!this.dom.listItemsBody) return;
      const filtered = this.getFilteredTasks();

      if (!filtered.length) {
        this.dom.listItemsBody.innerHTML = `
          <div style="padding: 40px; text-align: center; color: var(--text-dim);">
            Keine Aufgaben entsprechen den aktuellen Kriterien.
          </div>
        `;
        return;
      }

      this.dom.listItemsBody.innerHTML = filtered.map(task => {
        const isDone = task.status === 'done';
        const dueInfo = this.formatDueDate(task.dueDate, isDone);
        const pLabel = {
          urgent: '🚨 Dringend',
          high: '🔥 Hoch',
          medium: '⚡ Mittel',
          low: '🌱 Niedrig'
        }[task.priority] || 'Normal';

        const totalSubs = task.subtasks ? task.subtasks.length : 0;
        const doneSubs = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
        const subLabel = totalSubs > 0 ? `${doneSubs}/${totalSubs} fertig` : '—';

        return `
          <div class="list-row ${isDone ? 'is-done' : ''}" data-id="${task.id}">
            <div class="list-check-col">
              <input type="checkbox" class="list-checkbox" ${isDone ? 'checked' : ''} data-id="${task.id}" title="Erledigt umschalten">
            </div>

            <div class="list-title-col">
              <span class="list-title" data-id="${task.id}">${escapeHtml(task.title)}</span>
              ${task.description ? `<span class="list-desc">${escapeHtml(task.description)}</span>` : ''}
            </div>

            <div class="list-category-col">
              ${task.category ? `<span class="category-badge">${escapeHtml(task.category)}</span>` : '<span style="color:var(--text-dim)">—</span>'}
            </div>

            <div class="list-priority-col">
              <span class="priority-badge ${task.priority}">${pLabel}</span>
            </div>

            <div class="list-due-col">
              <span class="due-date-pill ${dueInfo.className}">${dueInfo.text}</span>
            </div>

            <div class="list-subtasks-col" style="font-size:0.8rem; color:var(--text-muted);">
              ${subLabel}
            </div>

            <div class="list-actions">
              <button class="list-action-btn" data-action="edit" data-id="${task.id}" title="Bearbeiten">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="list-action-btn delete" data-action="delete" data-id="${task.id}" title="Löschen">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.dom.listItemsBody.querySelectorAll('.list-checkbox').forEach(cb => {
        cb.addEventListener('change', () => this.toggleTaskCompletion(cb.dataset.id));
      });

      this.dom.listItemsBody.querySelectorAll('.list-title').forEach(title => {
        title.addEventListener('click', () => this.openEditModal(title.dataset.id));
      });

      this.dom.listItemsBody.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => this.openEditModal(btn.dataset.id));
      });

      this.dom.listItemsBody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => this.deleteTask(btn.dataset.id));
      });
    }

    renderAnalytics() {
      if (!this.dom.radialCircle) return;
      const total = this.tasks.length;
      const completed = this.tasks.filter(t => t.status === 'done').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const maxCircumference = 408.4;
      const strokeOffset = maxCircumference - (rate / 100) * maxCircumference;
      this.dom.radialCircle.style.strokeDashoffset = strokeOffset;
      this.dom.radialPercent.textContent = `${rate}%`;

      const inProg = this.tasks.filter(t => t.status === 'inprogress').length;
      this.dom.progDetails.innerHTML = `
        <div class="prog-stat-item">
          <span class="prog-stat-val" style="color:#818cf8;">${total}</span>
          <span class="prog-stat-label">Gesamt</span>
        </div>
        <div class="prog-stat-item">
          <span class="prog-stat-val" style="color:#f59e0b;">${inProg}</span>
          <span class="prog-stat-label">Aktiv</span>
        </div>
        <div class="prog-stat-item">
          <span class="prog-stat-val" style="color:#10b981;">${completed}</span>
          <span class="prog-stat-label">Fertig</span>
        </div>
      `;

      const statuses = [
        { key: 'backlog', label: 'Backlog', color: '#94a3b8' },
        { key: 'todo', label: 'Zu erledigen', color: '#38bdf8' },
        { key: 'inprogress', label: 'In Bearbeitung', color: '#f59e0b' },
        { key: 'review', label: 'Prüfung', color: '#a855f7' },
        { key: 'done', label: 'Erledigt', color: '#10b981' }
      ];

      this.dom.statusBars.innerHTML = statuses.map(st => {
        const count = this.tasks.filter(t => t.status === st.key).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="status-bar-row">
            <div class="bar-meta">
              <span style="color:${st.color};">${st.label}</span>
              <span style="color:var(--text-muted);">${count} (${pct}%)</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%; background:${st.color};"></div>
            </div>
          </div>
        `;
      }).join('');

      const priorities = [
        { key: 'urgent', name: 'Dringend', color: '#f43f5e' },
        { key: 'high', name: 'Hoch', color: '#f97316' },
        { key: 'medium', name: 'Mittel', color: '#eab308' },
        { key: 'low', name: 'Niedrig', color: '#10b981' }
      ];

      this.dom.priorityGrid.innerHTML = priorities.map(pr => {
        const count = this.tasks.filter(t => t.priority === pr.key).length;
        return `
          <div class="priority-box">
            <div class="priority-box-info">
              <span class="priority-box-name">${pr.name}</span>
              <span class="priority-box-count">${count}</span>
            </div>
            <span class="priority-box-indicator" style="background:${pr.color}; box-shadow: 0 0 10px ${pr.color};"></span>
          </div>
        `;
      }).join('');

      const catCounts = {};
      this.tasks.forEach(t => {
        const cat = t.category || 'Ohne Kategorie';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });

      const catListHtml = Object.keys(catCounts).map(cat => {
        const count = catCounts[cat];
        const doneCount = this.tasks.filter(t => (t.category || 'Ohne Kategorie') === cat && t.status === 'done').length;
        return `
          <div class="category-row">
            <div class="cat-row-name">
              <span style="color:#818cf8;">📁</span>
              <span>${escapeHtml(cat)}</span>
            </div>
            <div class="cat-row-stats">
              <span>${doneCount}/${count} erledigt</span>
              <span class="cat-count-badge">${count}</span>
            </div>
          </div>
        `;
      }).join('');

      this.dom.catList.innerHTML = catListHtml || '<div style="color:var(--text-dim); text-align:center;">Keine Kategorien vorhanden.</div>';
    }

    openCreateModal(defaultStatus = 'todo') {
      if (!this.dom.modal) return;
      this.dom.modalTitle.textContent = 'Neue Aufgabe erstellen';
      this.dom.inputFormId.value = '';
      this.dom.taskForm.reset();
      this.dom.inputStatus.value = defaultStatus;
      this.dom.inputPriority.value = 'medium';
      this.currentEditingSubtasks = [];
      this.renderModalSubtasks();
      this.dom.modal.classList.remove('hidden');
      setTimeout(() => this.dom.inputTitle && this.dom.inputTitle.focus(), 50);
      this.sound.playPop();
    }

    openEditModal(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task || !this.dom.modal) return;

      this.dom.modalTitle.textContent = 'Aufgabe bearbeiten';
      this.dom.inputFormId.value = task.id;
      this.dom.inputTitle.value = task.title;
      this.dom.inputDesc.value = task.description || '';
      this.dom.inputStatus.value = task.status;
      this.dom.inputPriority.value = task.priority;
      this.dom.inputCategory.value = task.category || '';
      this.dom.inputDueDate.value = task.dueDate || '';

      this.currentEditingSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
      this.renderModalSubtasks();

      this.dom.modal.classList.remove('hidden');
      setTimeout(() => this.dom.inputTitle && this.dom.inputTitle.focus(), 50);
      this.sound.playPop();
    }

    closeModal() {
      if (!this.dom.modal) return;
      this.dom.modal.classList.add('hidden');
      this.dom.taskForm.reset();
      this.currentEditingSubtasks = [];
    }

    addModalSubtask() {
      const title = this.dom.subtaskInputText.value.trim();
      if (!title) return;

      this.currentEditingSubtasks.push({
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: title,
        completed: false
      });

      this.dom.subtaskInputText.value = '';
      this.renderModalSubtasks();
      this.sound.playPop();
    }

    renderModalSubtasks() {
      const count = this.currentEditingSubtasks.length;
      if (this.dom.modalSubtasksCount) {
        this.dom.modalSubtasksCount.textContent = `${count} ${count === 1 ? 'Aufgabe' : 'Aufgaben'}`;
      }

      if (!count) {
        this.dom.modalSubtasksList.innerHTML = '<div style="font-size:0.78rem; color:var(--text-dim); padding:6px 0;">Keine Teilaufgaben definiert.</div>';
        return;
      }

      this.dom.modalSubtasksList.innerHTML = this.currentEditingSubtasks.map((sub, idx) => `
        <div class="subtask-item">
          <div class="subtask-item-left">
            <input type="checkbox" class="subtask-cb" data-idx="${idx}" ${sub.completed ? 'checked' : ''}>
            <span class="subtask-item-title ${sub.completed ? 'done' : ''}">${escapeHtml(sub.title)}</span>
          </div>
          <button type="button" class="subtask-item-remove" data-idx="${idx}" title="Entfernen">✕</button>
        </div>
      `).join('');

      this.dom.modalSubtasksList.querySelectorAll('.subtask-cb').forEach(cb => {
        cb.addEventListener('change', () => {
          const idx = parseInt(cb.dataset.idx, 10);
          this.currentEditingSubtasks[idx].completed = cb.checked;
          this.renderModalSubtasks();
        });
      });

      this.dom.modalSubtasksList.querySelectorAll('.subtask-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.currentEditingSubtasks.splice(idx, 1);
          this.renderModalSubtasks();
        });
      });
    }

    saveModalTask() {
      const formId = this.dom.inputFormId.value;
      const title = this.dom.inputTitle.value.trim();
      if (!title) return;

      const desc = this.dom.inputDesc.value.trim();
      const status = this.dom.inputStatus.value;
      const priority = this.dom.inputPriority.value;
      const category = this.dom.inputCategory.value.trim();
      const dueDate = this.dom.inputDueDate.value || null;

      if (formId) {
        const task = this.tasks.find(t => t.id === formId);
        if (task) {
          task.title = title;
          task.description = desc;
          task.status = status;
          task.priority = priority;
          task.category = category;
          task.dueDate = dueDate;
          task.subtasks = [...this.currentEditingSubtasks];
          task.updatedAt = new Date().toISOString();
          this.suite.showToast(`Aufgabe "${title}" aktualisiert!`);
        }
      } else {
        const newTask = {
          id: 'task-' + Date.now(),
          title: title,
          description: desc,
          status: status,
          priority: priority,
          category: category,
          dueDate: dueDate,
          subtasks: [...this.currentEditingSubtasks],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.tasks.unshift(newTask);
        this.suite.showToast(`Neue Aufgabe "${title}" erstellt! 🚀`);
      }

      this.saveTasks();
      this.closeModal();
      this.render();
      this.sound.playSuccess();
    }

    toggleTaskCompletion(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.status === 'done') {
        task.status = 'todo';
        if (task.subtasks) task.subtasks.forEach(s => s.completed = false);
        this.sound.playPop();
        this.suite.showToast(`Aufgabe wieder auf "Zu erledigen" gesetzt.`);
      } else {
        task.status = 'done';
        if (task.subtasks) task.subtasks.forEach(s => s.completed = true);
        this.confetti.fire();
        this.sound.playSuccess();
        this.suite.showToast(`Aufgabe "${task.title}" abgeschlossen! 🎉`);
      }

      task.updatedAt = new Date().toISOString();
      this.saveTasks();
      this.render();
    }

    deleteTask(taskId) {
      const idx = this.tasks.findIndex(t => t.id === taskId);
      if (idx === -1) return;

      const deleted = this.tasks.splice(idx, 1)[0];
      this.lastDeletedTask = { task: deleted, index: idx };
      this.saveTasks();
      this.sound.playTrash();
      this.render();
      this.suite.showToast(`Aufgabe "${deleted.title}" gelöscht.`);
    }

    exportTasksJson() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `orbittask-backup-${getTodayString(0)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.suite.showToast('Daten erfolgreich als JSON exportiert!');
    }

    importTasksJson(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            this.tasks = imported;
            this.saveTasks();
            this.suite.showToast(`${imported.length} Aufgaben erfolgreich importiert!`);
            this.render();
            this.sound.playSuccess();
          } else {
            alert('Ungültiges Format: Die JSON-Datei muss ein Array von Aufgaben enthalten.');
          }
        } catch (err) {
          alert('Fehler beim Lesen der JSON-Datei: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    formatDueDate(dueDateStr, isDone) {
      if (!dueDateStr) return { text: 'Keine Fälligkeit', className: 'upcoming' };
      const todayStr = getTodayString(0);
      const tomorrowStr = getTodayString(1);

      if (isDone) {
        return { text: dueDateStr, className: 'upcoming' };
      }

      if (dueDateStr < todayStr) {
        return { text: `Überfällig (${dueDateStr})`, className: 'overdue' };
      } else if (dueDateStr === todayStr) {
        return { text: 'Heute fällig', className: 'today' };
      } else if (dueDateStr === tomorrowStr) {
        return { text: 'Morgen fällig', className: 'upcoming' };
      }
      return { text: dueDateStr, className: 'upcoming' };
    }
  }

  // ==========================================================================
  // 2. ORBITNOTES MODULE (RICH QUICK-NOTES & MARKDOWN)
  // ==========================================================================
  const DEFAULT_DEMO_NOTES = [
    {
      id: 'note-1',
      title: 'Architektur-Prinzipien für OrbitSuite',
      category: 'Arbeit',
      pinned: true,
      content: '# 🪐 OrbitSuite Architektur\n- **Zero External Dependencies**: Läuft 100% offline im Browser.\n- **Dark Glassmorphism**: Transparenz, Ambient Orbs & Backdrop Blur.\n- **Web Audio API**: Native Sound-Synthese ohne externe MP3s.\n\n```js\nconst app = new OrbitSuiteRouter();\napp.switchApp("tasks");\n```',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'note-2',
      title: 'Ideen für nächste Version v3.5',
      category: 'Ideen',
      pinned: true,
      content: 'Brainstorming für kommende Features:\n- [ ] Kalenderansicht für Aufgaben & Deadlines\n- [ ] Soundeffekt-Presets (Retro 8-Bit & Zen Chill)\n- [ ] Export als Markdown-Archiv (.zip)\n- [x] Multi-App Switcher & Hub',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'note-3',
      title: 'Regex Cheatsheet für Form Validierung',
      category: 'Code',
      pinned: false,
      content: 'Nützliche Ausdrücke:\n- E-Mail: `/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/`\n- UUID v4: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`\n- ISO Datum: `/^\\d{4}-\\d{2}-\\d{2}$/`',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'note-4',
      title: 'Bücherliste & Empfehlungen',
      category: 'Privat',
      pinned: false,
      content: '1. *Atomic Habits* von James Clear\n2. *Deep Work* von Cal Newport\n3. *The Design of Everyday Things* von Don Norman\n\n> "You do not rise to the level of your goals. You fall to the level of your systems."',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];

  class OrbitNotesApp {
    constructor(suite) {
      this.suite = suite;
      this.STORAGE_KEY = 'orbitsuite_notes_v1';
      this.notes = this.loadNotes();
      this.activeFilter = 'all';
      this.searchQuery = '';

      this.dom = {
        searchInput: document.getElementById('notes-search-input'),
        btnCreateNote: document.getElementById('btn-create-note'),
        cardsContainer: document.getElementById('notes-cards-container'),
        countSummary: document.getElementById('notes-count-summary'),
        filterChips: document.querySelectorAll('.notes-filter-chip'),
        modal: document.getElementById('note-modal'),
        modalTitle: document.getElementById('note-modal-title'),
        modalClose: document.getElementById('note-modal-close'),
        form: document.getElementById('note-form'),
        formId: document.getElementById('note-form-id'),
        inputTitle: document.getElementById('note-input-title'),
        inputContent: document.getElementById('note-input-content'),
        inputCategory: document.getElementById('note-input-category'),
        inputPinned: document.getElementById('note-input-pinned'),
        btnCancel: document.getElementById('btn-note-cancel')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.render();
    }

    loadNotes() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { console.warn(e); }
      this.saveNotes(DEFAULT_DEMO_NOTES);
      return [...DEFAULT_DEMO_NOTES];
    }

    saveNotes(notes = this.notes) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
        if (this.suite && this.suite.hubApp) {
          this.suite.hubApp.render();
        }
      } catch (e) { console.warn(e); }
    }

    bindEvents() {
      if (this.dom.btnCreateNote) {
        this.dom.btnCreateNote.addEventListener('click', () => this.openCreateModal());
      }
      if (this.dom.modalClose) {
        this.dom.modalClose.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.btnCancel) {
        this.dom.btnCancel.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.modal) {
        this.dom.modal.addEventListener('click', (e) => {
          if (e.target === this.dom.modal) this.closeModal();
        });
      }
      if (this.dom.form) {
        this.dom.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveModalNote();
        });
      }

      if (this.dom.searchInput) {
        this.dom.searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.render();
        });
      }

      this.dom.filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          this.dom.filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.activeFilter = chip.dataset.category;
          this.suite.sound.playPop();
          this.render();
        });
      });
    }

    openCreateModal() {
      if (!this.dom.modal) return;
      this.dom.modalTitle.textContent = 'Neue Notiz erstellen';
      this.dom.formId.value = '';
      this.dom.form.reset();
      this.dom.modal.classList.remove('hidden');
      setTimeout(() => this.dom.inputTitle && this.dom.inputTitle.focus(), 50);
      this.suite.sound.playPop();
    }

    openEditModal(noteId) {
      const note = this.notes.find(n => n.id === noteId);
      if (!note || !this.dom.modal) return;

      this.dom.modalTitle.textContent = 'Notiz bearbeiten';
      this.dom.formId.value = note.id;
      this.dom.inputTitle.value = note.title;
      this.dom.inputContent.value = note.content;
      this.dom.inputCategory.value = note.category;
      this.dom.inputPinned.checked = !!note.pinned;

      this.dom.modal.classList.remove('hidden');
      setTimeout(() => this.dom.inputTitle && this.dom.inputTitle.focus(), 50);
      this.suite.sound.playPop();
    }

    closeModal() {
      if (!this.dom.modal) return;
      this.dom.modal.classList.add('hidden');
      this.dom.form.reset();
    }

    saveModalNote() {
      const id = this.dom.formId.value;
      const title = this.dom.inputTitle.value.trim();
      const content = this.dom.inputContent.value.trim();
      const category = this.dom.inputCategory.value;
      const pinned = this.dom.inputPinned.checked;

      if (!title) return;

      if (id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
          note.title = title;
          note.content = content;
          note.category = category;
          note.pinned = pinned;
          note.updatedAt = new Date().toISOString();
          this.suite.showToast(`Notiz "${title}" aktualisiert!`);
        }
      } else {
        const newNote = {
          id: 'note-' + Date.now(),
          title: title,
          content: content,
          category: category,
          pinned: pinned,
          createdAt: new Date().toISOString()
        };
        this.notes.unshift(newNote);
        this.suite.showToast(`Notiz "${title}" gespeichert! 📝`);
      }

      this.saveNotes();
      this.closeModal();
      this.render();
      this.suite.sound.playSuccess();
    }

    togglePin(noteId) {
      const note = this.notes.find(n => n.id === noteId);
      if (!note) return;
      note.pinned = !note.pinned;
      this.saveNotes();
      this.suite.sound.playPop();
      this.render();
    }

    deleteNote(noteId) {
      const idx = this.notes.findIndex(n => n.id === noteId);
      if (idx === -1) return;
      const deleted = this.notes.splice(idx, 1)[0];
      this.saveNotes();
      this.suite.sound.playTrash();
      this.suite.showToast(`Notiz "${deleted.title}" gelöscht.`);
      this.render();
    }

    copyNote(noteId) {
      const note = this.notes.find(n => n.id === noteId);
      if (!note) return;
      navigator.clipboard.writeText(`${note.title}\n\n${note.content}`).then(() => {
        this.suite.showToast('In Zwischenablage kopiert! 📋');
        this.suite.sound.playPop();
      });
    }

    renderMarkdown(text) {
      if (!text) return '';
      let escaped = escapeHtml(text);
      // Code blocks
      escaped = escaped.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
      // Inline code
      escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Bold
      escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic
      escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Headings
      escaped = escaped.replace(/^### (.*$)/gim, '<h4 style="color:#fff; margin:6px 0;">$1</h4>');
      escaped = escaped.replace(/^## (.*$)/gim, '<h3 style="color:#fff; margin:8px 0;">$1</h3>');
      escaped = escaped.replace(/^# (.*$)/gim, '<h2 style="color:#fff; margin:10px 0;">$1</h2>');
      // Lists
      escaped = escaped.replace(/^- (.*$)/gim, '• $1');
      return escaped;
    }

    render() {
      if (!this.dom.cardsContainer) return;

      const filtered = this.notes.filter(n => {
        if (this.activeFilter !== 'all' && n.category !== this.activeFilter) return false;
        if (this.searchQuery) {
          const inTitle = n.title.toLowerCase().includes(this.searchQuery);
          const inContent = n.content.toLowerCase().includes(this.searchQuery);
          if (!inTitle && !inContent) return false;
        }
        return true;
      }).sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      if (this.dom.countSummary) {
        this.dom.countSummary.textContent = `${filtered.length} Notizen angezeigt (${this.notes.filter(n=>n.pinned).length} angeheftet)`;
      }

      if (!filtered.length) {
        this.dom.cardsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 50px; text-align: center; color: var(--text-dim);">
            Keine Notizen gefunden. Klicke auf "+ Neue Notiz", um deine Gedanken festzuhalten!
          </div>
        `;
        return;
      }

      this.dom.cardsContainer.innerHTML = filtered.map(note => {
        const dateStr = note.createdAt ? note.createdAt.split('T')[0] : '';
        return `
          <div class="note-card ${note.pinned ? 'pinned' : ''}" data-id="${note.id}">
            <div class="note-card-top">
              <span class="note-tag-badge tag-${note.category}">${note.category}</span>
              <button class="note-pin-btn ${note.pinned ? 'pinned' : ''}" data-action="pin" title="${note.pinned ? 'Lösen' : 'Anheften'}">
                📌
              </button>
            </div>

            <h3 class="note-title">${escapeHtml(note.title)}</h3>
            <div class="note-content-preview">${this.renderMarkdown(note.content)}</div>

            <div class="note-card-footer">
              <span>${dateStr}</span>
              <div class="note-card-actions">
                <button class="note-action-btn" data-action="copy" title="Kopieren">Kopieren</button>
                <button class="note-action-btn" data-action="edit" title="Bearbeiten">Edit</button>
                <button class="note-action-btn" data-action="delete" title="Löschen">✕</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Event listeners on cards
      this.dom.cardsContainer.querySelectorAll('.note-card').forEach(card => {
        const id = card.dataset.id;
        const pinBtn = card.querySelector('[data-action="pin"]');
        const copyBtn = card.querySelector('[data-action="copy"]');
        const editBtn = card.querySelector('[data-action="edit"]');
        const delBtn = card.querySelector('[data-action="delete"]');

        if (pinBtn) pinBtn.addEventListener('click', () => this.togglePin(id));
        if (copyBtn) copyBtn.addEventListener('click', () => this.copyNote(id));
        if (editBtn) editBtn.addEventListener('click', () => this.openEditModal(id));
        if (delBtn) delBtn.addEventListener('click', () => this.deleteNote(id));
      });
    }
  }

  // ==========================================================================
  // 3. ORBITFOCUS MODULE (POMODORO & FLOW STATE TIMER + AMBIENT SOUND)
  // ==========================================================================
  class OrbitFocusApp {
    constructor(suite) {
      this.suite = suite;
      this.mode = 'pomodoro'; // pomodoro, short-break, long-break
      this.durations = {
        'pomodoro': 25 * 60,
        'short-break': 5 * 60,
        'long-break': 15 * 60
      };
      this.timeLeft = this.durations['pomodoro'];
      this.isRunning = false;
      this.timerId = null;
      this.completedSessions = parseInt(localStorage.getItem('orbitsuite_focus_sessions') || '0', 10);
      this.totalMinutes = parseInt(localStorage.getItem('orbitsuite_focus_minutes') || '0', 10);

      this.dom = {
        modeTabs: document.querySelectorAll('#focus-mode-tabs .focus-tab'),
        sessionsBadge: document.getElementById('focus-sessions-count'),
        countdownDisplay: document.getElementById('focus-countdown-display'),
        statusLabel: document.getElementById('focus-status-label'),
        subLabel: document.getElementById('focus-sub-label'),
        ringProgress: document.getElementById('focus-ring-progress'),
        btnToggle: document.getElementById('focus-btn-toggle'),
        btnReset: document.getElementById('focus-btn-reset'),
        btnSkip: document.getElementById('focus-btn-skip'),
        playIcon: document.getElementById('focus-play-icon'),
        pauseIcon: document.getElementById('focus-pause-icon'),
        ambientButtons: document.querySelectorAll('.ambient-sound-btn'),
        ambientVolume: document.getElementById('ambient-volume')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.updateDisplay();
    }

    bindEvents() {
      this.dom.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.setMode(tab.dataset.mode);
        });
      });

      if (this.dom.btnToggle) {
        this.dom.btnToggle.addEventListener('click', () => this.toggle());
      }
      if (this.dom.btnReset) {
        this.dom.btnReset.addEventListener('click', () => this.reset());
      }
      if (this.dom.btnSkip) {
        this.dom.btnSkip.addEventListener('click', () => this.skip());
      }

      // Spacebar shortcut in Focus View
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && this.suite.activeApp === 'focus' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.toggle();
        }
      });

      // Ambient Soundscape buttons
      this.dom.ambientButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.ambientButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sound = btn.dataset.sound;
          const vol = this.dom.ambientVolume ? parseFloat(this.dom.ambientVolume.value) : 0.5;
          this.suite.sound.startAmbient(sound, vol);
        });
      });

      if (this.dom.ambientVolume) {
        this.dom.ambientVolume.addEventListener('input', (e) => {
          this.suite.sound.setAmbientVolume(parseFloat(e.target.value));
        });
      }
    }

    setMode(newMode) {
      this.pause();
      this.mode = newMode;
      this.timeLeft = this.durations[newMode] || 25 * 60;

      this.dom.modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === newMode));

      const labels = {
        'pomodoro': { title: 'FOKUS-ZEIT', sub: 'Bereit für maximale Konzentration' },
        'short-break': { title: 'KURZE PAUSE', sub: 'Durchatmen, Augen entspannen, Wasser trinken' },
        'long-break': { title: 'LANGE PAUSE', sub: 'Erfrischen, Bewegung & Dehnen' }
      };

      if (this.dom.statusLabel) this.dom.statusLabel.textContent = labels[newMode].title;
      if (this.dom.subLabel) this.dom.subLabel.textContent = labels[newMode].sub;

      this.suite.sound.playPop();
      this.updateDisplay();
    }

    toggle() {
      if (this.isRunning) {
        this.pause();
      } else {
        this.start();
      }
    }

    start() {
      this.isRunning = true;
      if (this.dom.playIcon) this.dom.playIcon.classList.add('hidden');
      if (this.dom.pauseIcon) this.dom.pauseIcon.classList.remove('hidden');

      this.suite.sound.init();
      this.suite.sound.playPop();

      clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.updateDisplay();
        } else {
          this.complete();
        }
      }, 1000);
    }

    pause() {
      this.isRunning = false;
      clearInterval(this.timerId);
      if (this.dom.playIcon) this.dom.playIcon.classList.remove('hidden');
      if (this.dom.pauseIcon) this.dom.pauseIcon.classList.add('hidden');
    }

    reset() {
      this.pause();
      this.timeLeft = this.durations[this.mode];
      this.updateDisplay();
      this.suite.sound.playPop();
    }

    skip() {
      this.pause();
      if (this.mode === 'pomodoro') {
        this.setMode('short-break');
      } else {
        this.setMode('pomodoro');
      }
    }

    complete() {
      this.pause();
      this.suite.sound.playChime();
      this.suite.confetti.fire();

      if (this.mode === 'pomodoro') {
        this.completedSessions++;
        this.totalMinutes += Math.round(this.durations['pomodoro'] / 60);
        localStorage.setItem('orbitsuite_focus_sessions', this.completedSessions);
        localStorage.setItem('orbitsuite_focus_minutes', this.totalMinutes);

        this.suite.showToast(`Pomodoro Session erfolgreich abgeschlossen! 🎉 Zeit für eine Pause.`, 'info');
        this.setMode('short-break');
      } else {
        this.suite.showToast(`Pause beendet! Bereit für den nächsten Fokus-Block? ⚡`, 'info');
        this.setMode('pomodoro');
      }

      if (this.suite && this.suite.hubApp) {
        this.suite.hubApp.render();
      }
    }

    updateDisplay() {
      const mins = Math.floor(this.timeLeft / 60);
      const secs = this.timeLeft % 60;
      const displayStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (this.dom.countdownDisplay) {
        this.dom.countdownDisplay.textContent = displayStr;
      }

      // Ring progress calculation (Circumference 2 * PI * 140 ≈ 879.6)
      if (this.dom.ringProgress) {
        const total = this.durations[this.mode];
        const fraction = (total - this.timeLeft) / total;
        const maxOffset = 879.6;
        this.dom.ringProgress.style.strokeDashoffset = maxOffset * (1 - fraction);
      }

      if (this.dom.sessionsBadge) {
        this.dom.sessionsBadge.textContent = `🍅 ${this.completedSessions % 4} / 4 Sessions heute`;
      }
    }
  }

  // ==========================================================================
  // 4. ORBITHABITS MODULE (DAILY HABIT & STREAK TRACKER)
  // ==========================================================================
  const DEFAULT_DEMO_HABITS = [
    { id: 'hab-1', name: '2 Liter Wasser trinken', category: 'Gesundheit', checks: [true, true, true, true, false, false, false], streak: 4 },
    { id: 'hab-2', name: '30 Min. Sport oder Workout', category: 'Fitness', checks: [true, false, true, true, false, false, false], streak: 2 },
    { id: 'hab-3', name: 'Fokussiertes Lesen (20 Min.)', category: 'Geist', checks: [true, true, true, false, false, false, false], streak: 3 },
    { id: 'hab-4', name: 'Tagesreflexion & Journal', category: 'Produktivität', checks: [true, true, false, false, false, false, false], streak: 2 }
  ];

  class OrbitHabitsApp {
    constructor(suite) {
      this.suite = suite;
      this.STORAGE_KEY = 'orbitsuite_habits_v1';
      this.habits = this.loadHabits();
      this.todayIndex = (new Date().getDay() + 6) % 7; // 0 = Monday, 6 = Sunday

      this.dom = {
        btnCreateHabit: document.getElementById('btn-create-habit'),
        listBody: document.getElementById('habits-list-body'),
        weekLabel: document.getElementById('habits-week-label'),
        todayPercent: document.getElementById('habits-today-percent'),
        todayProgressFill: document.getElementById('habits-today-progress-fill'),
        completionText: document.getElementById('habits-completion-text'),
        modal: document.getElementById('habit-modal'),
        modalClose: document.getElementById('habit-modal-close'),
        btnCancel: document.getElementById('btn-habit-cancel'),
        form: document.getElementById('habit-form'),
        inputTitle: document.getElementById('habit-input-title'),
        inputCategory: document.getElementById('habit-input-category')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.render();
    }

    loadHabits() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { console.warn(e); }
      this.saveHabits(DEFAULT_DEMO_HABITS);
      return [...DEFAULT_DEMO_HABITS];
    }

    saveHabits(habits = this.habits) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
        if (this.suite && this.suite.hubApp) {
          this.suite.hubApp.render();
        }
      } catch (e) { console.warn(e); }
    }

    bindEvents() {
      if (this.dom.btnCreateHabit) {
        this.dom.btnCreateHabit.addEventListener('click', () => this.openModal());
      }
      if (this.dom.modalClose) {
        this.dom.modalClose.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.btnCancel) {
        this.dom.btnCancel.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.modal) {
        this.dom.modal.addEventListener('click', (e) => {
          if (e.target === this.dom.modal) this.closeModal();
        });
      }
      if (this.dom.form) {
        this.dom.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveModalHabit();
        });
      }
    }

    openModal() {
      if (!this.dom.modal) return;
      this.dom.form.reset();
      this.dom.modal.classList.remove('hidden');
      setTimeout(() => this.dom.inputTitle && this.dom.inputTitle.focus(), 50);
      this.suite.sound.playPop();
    }

    closeModal() {
      if (!this.dom.modal) return;
      this.dom.modal.classList.add('hidden');
    }

    saveModalHabit() {
      const title = this.dom.inputTitle.value.trim();
      const category = this.dom.inputCategory.value;
      if (!title) return;

      const newHabit = {
        id: 'hab-' + Date.now(),
        name: title,
        category: category,
        checks: [false, false, false, false, false, false, false],
        streak: 0
      };

      this.habits.push(newHabit);
      this.saveHabits();
      this.closeModal();
      this.render();
      this.suite.sound.playSuccess();
      this.suite.showToast(`Gewohnheit "${title}" angelegt! 🎯`);
    }

    toggleDayCheck(habitId, dayIndex) {
      const habit = this.habits.find(h => h.id === habitId);
      if (!habit) return;

      habit.checks[dayIndex] = !habit.checks[dayIndex];

      // Calculate streak
      let streak = 0;
      for (let i = dayIndex; i >= 0; i--) {
        if (habit.checks[i]) streak++;
        else break;
      }
      habit.streak = streak;

      this.saveHabits();
      this.suite.sound.playPop();
      this.render();

      // Check if all today habits done
      const todayTotal = this.habits.length;
      const todayDone = this.habits.filter(h => h.checks[this.todayIndex]).length;
      if (todayTotal > 0 && todayDone === todayTotal && habit.checks[this.todayIndex]) {
        this.suite.confetti.fire();
        this.suite.sound.playSuccess();
        this.suite.showToast('Fantastisch! Alle heutigen Gewohnheiten erledigt! 🏆');
      }
    }

    deleteHabit(habitId) {
      const idx = this.habits.findIndex(h => h.id === habitId);
      if (idx === -1) return;
      const deleted = this.habits.splice(idx, 1)[0];
      this.saveHabits();
      this.suite.sound.playTrash();
      this.suite.showToast(`Gewohnheit "${deleted.name}" entfernt.`);
      this.render();
    }

    render() {
      if (!this.dom.listBody) return;

      const totalToday = this.habits.length;
      const doneToday = this.habits.filter(h => h.checks[this.todayIndex]).length;
      const pct = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0;

      if (this.dom.todayPercent) this.dom.todayPercent.textContent = `${pct}%`;
      if (this.dom.todayProgressFill) this.dom.todayProgressFill.style.width = `${pct}%`;
      if (this.dom.completionText) {
        this.dom.completionText.textContent = `${doneToday} von ${totalToday} Gewohnheiten heute erledigt`;
      }

      this.dom.listBody.innerHTML = this.habits.map(habit => {
        const doneInWeek = habit.checks.filter(Boolean).length;
        const weekScore = `${doneInWeek}/7 (${Math.round((doneInWeek / 7) * 100)}%)`;

        const dayButtons = habit.checks.map((isChecked, dayIdx) => {
          const isToday = dayIdx === this.todayIndex;
          return `
            <button class="day-check-btn ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''}" 
                    data-habit="${habit.id}" data-day="${dayIdx}" 
                    title="${['Mo','Di','Mi','Do','Fr','Sa','So'][dayIdx]}: ${isChecked ? 'Erledigt' : 'Offen'}">
              ${isChecked ? '✓' : ''}
            </button>
          `;
        }).join('');

        return `
          <div class="habit-row" data-id="${habit.id}">
            <div class="habit-title-box">
              <span class="habit-name">${escapeHtml(habit.name)}</span>
              <span class="habit-cat">${habit.category}</span>
            </div>
            <div>
              <span class="streak-pill">🔥 ${habit.streak}d</span>
            </div>
            ${dayButtons}
            <div class="habit-week-score">${weekScore}</div>
            <div>
              <button class="btn-habit-del" data-action="delete" data-id="${habit.id}" title="Löschen">✕</button>
            </div>
          </div>
        `;
      }).join('');

      this.dom.listBody.querySelectorAll('.day-check-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const hId = btn.dataset.habit;
          const dIdx = parseInt(btn.dataset.day, 10);
          this.toggleDayCheck(hId, dIdx);
        });
      });

      this.dom.listBody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => this.deleteHabit(btn.dataset.id));
      });
    }
  }

  // ==========================================================================
  // 5. ORBITTOOLS MODULE (DEVELOPER & PRODUCTIVITY TOOLS)
  // ==========================================================================
  class OrbitToolsApp {
    constructor(suite) {
      this.suite = suite;
      this.activeTool = 'json';

      this.dom = {
        subnavTabs: document.querySelectorAll('#tools-subnav .tool-tab'),
        panels: {
          json: document.getElementById('tool-panel-json'),
          text: document.getElementById('tool-panel-text'),
          inspector: document.getElementById('tool-panel-inspector'),
          uuid: document.getElementById('tool-panel-uuid')
        },
        // JSON Studio
        jsonInput: document.getElementById('json-input'),
        jsonOutput: document.getElementById('json-output'),
        btnJsonBeautify: document.getElementById('btn-json-beautify'),
        btnJsonMinify: document.getElementById('btn-json-minify'),
        btnJsonSample: document.getElementById('btn-json-sample'),
        btnJsonCopy: document.getElementById('btn-json-copy'),
        jsonValStatus: document.getElementById('json-val-status'),
        // Text Converter
        textConvInput: document.getElementById('text-conv-input'),
        convUpper: document.getElementById('conv-upper'),
        convLower: document.getElementById('conv-lower'),
        convTitle: document.getElementById('conv-title'),
        convCamel: document.getElementById('conv-camel'),
        convKebab: document.getElementById('conv-kebab'),
        convSnake: document.getElementById('conv-snake'),
        // Text Inspector
        textInspectInput: document.getElementById('text-inspect-input'),
        statWords: document.getElementById('stat-words'),
        statCharsAll: document.getElementById('stat-chars-all'),
        statCharsNoSpace: document.getElementById('stat-chars-nospace'),
        statSentences: document.getElementById('stat-sentences'),
        statParagraphs: document.getElementById('stat-paragraphs'),
        statReadingTime: document.getElementById('stat-reading-time'),
        // UUID & Timestamp
        btnGenUuid: document.getElementById('btn-gen-uuid'),
        valUuid: document.getElementById('val-uuid'),
        btnRefreshTime: document.getElementById('btn-refresh-time'),
        valUnixSec: document.getElementById('val-unix-sec'),
        valUnixMs: document.getElementById('val-unix-ms'),
        valIso: document.getElementById('val-iso')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.generateNewUuid();
      this.updateTimestamps();
    }

    bindEvents() {
      this.dom.subnavTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.dom.subnavTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.switchTool(tab.dataset.tool);
          this.suite.sound.playPop();
        });
      });

      // JSON Actions
      if (this.dom.btnJsonBeautify) {
        this.dom.btnJsonBeautify.addEventListener('click', () => this.beautifyJson());
      }
      if (this.dom.btnJsonMinify) {
        this.dom.btnJsonMinify.addEventListener('click', () => this.minifyJson());
      }
      if (this.dom.btnJsonSample) {
        this.dom.btnJsonSample.addEventListener('click', () => this.loadJsonSample());
      }
      if (this.dom.btnJsonCopy) {
        this.dom.btnJsonCopy.addEventListener('click', () => {
          if (this.dom.jsonOutput && this.dom.jsonOutput.value) {
            navigator.clipboard.writeText(this.dom.jsonOutput.value);
            this.suite.showToast('JSON in Zwischenablage kopiert! 📋');
          }
        });
      }
      if (this.dom.jsonInput) {
        this.dom.jsonInput.addEventListener('input', () => this.validateJsonInput());
      }

      // Text Converter
      if (this.dom.textConvInput) {
        this.dom.textConvInput.addEventListener('input', (e) => this.convertText(e.target.value));
      }

      // Text Inspector
      if (this.dom.textInspectInput) {
        this.dom.textInspectInput.addEventListener('input', (e) => this.inspectText(e.target.value));
      }

      // UUID & Timestamp
      if (this.dom.btnGenUuid) {
        this.dom.btnGenUuid.addEventListener('click', () => {
          this.generateNewUuid();
          this.suite.sound.playPop();
        });
      }
      if (this.dom.btnRefreshTime) {
        this.dom.btnRefreshTime.addEventListener('click', () => {
          this.updateTimestamps();
          this.suite.sound.playPop();
        });
      }

      // Universal Copy Chips
      document.querySelectorAll('.btn-copy-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.copyTarget;
          const input = document.getElementById(targetId);
          if (input && input.value) {
            navigator.clipboard.writeText(input.value);
            this.suite.showToast('In Zwischenablage kopiert! 📋');
            this.suite.sound.playPop();
          }
        });
      });
    }

    switchTool(toolKey) {
      this.activeTool = toolKey;
      Object.keys(this.dom.panels).forEach(key => {
        if (this.dom.panels[key]) {
          this.dom.panels[key].classList.toggle('active', key === toolKey);
        }
      });
    }

    beautifyJson() {
      const raw = this.dom.jsonInput.value.trim();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        this.dom.jsonOutput.value = JSON.stringify(parsed, null, 2);
        this.dom.jsonValStatus.className = 'json-validation-badge valid';
        this.dom.jsonValStatus.textContent = 'Gültiges JSON (2 Spaces)';
        this.suite.sound.playSuccess();
      } catch (e) {
        this.dom.jsonValStatus.className = 'json-validation-badge invalid';
        this.dom.jsonValStatus.textContent = 'Syntaxfehler: ' + e.message;
        this.suite.sound.playTrash();
      }
    }

    minifyJson() {
      const raw = this.dom.jsonInput.value.trim();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        this.dom.jsonOutput.value = JSON.stringify(parsed);
        this.dom.jsonValStatus.className = 'json-validation-badge valid';
        this.dom.jsonValStatus.textContent = 'Minifiziertes JSON';
        this.suite.sound.playSuccess();
      } catch (e) {
        this.dom.jsonValStatus.className = 'json-validation-badge invalid';
        this.dom.jsonValStatus.textContent = 'Syntaxfehler: ' + e.message;
        this.suite.sound.playTrash();
      }
    }

    loadJsonSample() {
      const sample = {
        app: "OrbitSuite",
        version: "3.0",
        author: "Orbit Systems",
        settings: {
          darkMode: true,
          soundEnabled: true,
          theme: "Glassmorphism"
        },
        modules: ["OrbitTask", "OrbitNotes", "OrbitFocus", "OrbitHabits", "OrbitTools"],
        metrics: {
          tasksCompleted: 42,
          focusScore: 98.5
        }
      };
      this.dom.jsonInput.value = JSON.stringify(sample, null, 2);
      this.beautifyJson();
    }

    validateJsonInput() {
      const raw = this.dom.jsonInput.value.trim();
      if (!raw) {
        this.dom.jsonValStatus.className = 'json-validation-badge';
        this.dom.jsonValStatus.textContent = 'Bereit';
        return;
      }
      try {
        JSON.parse(raw);
        this.dom.jsonValStatus.className = 'json-validation-badge valid';
        this.dom.jsonValStatus.textContent = 'Gültiges JSON';
      } catch (e) {
        this.dom.jsonValStatus.className = 'json-validation-badge invalid';
        this.dom.jsonValStatus.textContent = 'Ungültig';
      }
    }

    convertText(text) {
      if (!text) {
        ['Upper', 'Lower', 'Title', 'Camel', 'Kebab', 'Snake'].forEach(t => {
          if (this.dom['conv' + t]) this.dom['conv' + t].value = '';
        });
        return;
      }

      this.dom.convUpper.value = text.toUpperCase();
      this.dom.convLower.value = text.toLowerCase();

      // Title Case
      this.dom.convTitle.value = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

      // Words array for programming cases
      const words = text.match(/[A-Za-z0-9]+/g) || [];

      // camelCase
      this.dom.convCamel.value = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');

      // kebab-case
      this.dom.convKebab.value = words.map(w => w.toLowerCase()).join('-');

      // snake_case
      this.dom.convSnake.value = words.map(w => w.toLowerCase()).join('_');
    }

    inspectText(text) {
      const charsAll = text.length;
      const charsNoSpace = text.replace(/\s/g, '').length;
      const words = (text.trim().match(/\S+/g) || []).length;
      const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length || (text.trim() ? 1 : 0);
      const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;

      // Reading time (~200 words per minute)
      const totalSeconds = Math.ceil((words / 200) * 60);
      const rMins = Math.floor(totalSeconds / 60);
      const rSecs = totalSeconds % 60;

      this.dom.statWords.textContent = words;
      this.dom.statCharsAll.textContent = charsAll;
      this.dom.statCharsNoSpace.textContent = charsNoSpace;
      this.dom.statSentences.textContent = sentences;
      this.dom.statParagraphs.textContent = paragraphs;
      this.dom.statReadingTime.textContent = `${rMins}m ${rSecs}s`;
    }

    generateNewUuid() {
      let uuid = '';
      if (window.crypto && window.crypto.randomUUID) {
        uuid = window.crypto.randomUUID();
      } else {
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      if (this.dom.valUuid) this.dom.valUuid.value = uuid;
    }

    updateTimestamps() {
      const now = new Date();
      if (this.dom.valUnixSec) this.dom.valUnixSec.value = Math.floor(now.getTime() / 1000);
      if (this.dom.valUnixMs) this.dom.valUnixMs.value = now.getTime();
      if (this.dom.valIso) this.dom.valIso.value = now.toISOString();
    }
  }

  // ==========================================================================
  // 0. ORBITHUB MODULE (STARTSEITE / APP SELECTOR & DASHBOARD)
  // ==========================================================================
  class OrbitHubApp {
    constructor(suite) {
      this.suite = suite;

      this.dom = {
        greeting: document.getElementById('hub-greeting'),
        statTasks: document.getElementById('hub-stat-tasks'),
        statNotes: document.getElementById('hub-stat-notes'),
        statFocus: document.getElementById('hub-stat-focus'),
        statHabits: document.getElementById('hub-stat-habits'),
        cardTaskSummary: document.getElementById('hub-card-task-summary'),
        cardNotesSummary: document.getElementById('hub-card-notes-summary'),
        cardFocusSummary: document.getElementById('hub-card-focus-summary'),
        cardHabitsSummary: document.getElementById('hub-card-habits-summary'),
        taskPreviewList: document.getElementById('hub-task-preview-list'),
        habitPreviewList: document.getElementById('hub-habit-preview-list'),
        notesPreviewList: document.getElementById('hub-notes-preview-list'),
        // Quick Action triggers
        btnAddTask: document.getElementById('hub-action-add-task'),
        btnAddNote: document.getElementById('hub-action-add-note'),
        btnStartFocus: document.getElementById('hub-action-start-focus'),
        btnCheckHabits: document.getElementById('hub-action-check-habits')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.render();
    }

    bindEvents() {
      // Launch app from App Cards
      document.querySelectorAll('[data-launch]').forEach(elem => {
        elem.addEventListener('click', (e) => {
          const appId = elem.dataset.launch;
          this.suite.switchApp(appId);
        });
      });

      // Quick Launch Bar
      if (this.dom.btnAddTask) {
        this.dom.btnAddTask.addEventListener('click', () => {
          this.suite.switchApp('tasks');
          setTimeout(() => this.suite.taskApp.openCreateModal(), 150);
        });
      }

      if (this.dom.btnAddNote) {
        this.dom.btnAddNote.addEventListener('click', () => {
          this.suite.switchApp('notes');
          setTimeout(() => this.suite.notesApp.openCreateModal(), 150);
        });
      }

      if (this.dom.btnStartFocus) {
        this.dom.btnStartFocus.addEventListener('click', () => {
          this.suite.switchApp('focus');
          setTimeout(() => this.suite.focusApp.start(), 150);
        });
      }

      if (this.dom.btnCheckHabits) {
        this.dom.btnCheckHabits.addEventListener('click', () => {
          this.suite.switchApp('habits');
        });
      }
    }

    updateGreeting() {
      if (!this.dom.greeting) return;
      const hour = new Date().getHours();
      let greeting = 'Willkommen im ';
      if (hour < 11) greeting = 'Guten Morgen! Willkommen im ';
      else if (hour < 18) greeting = 'Guten Tag! Willkommen im ';
      else greeting = 'Guten Abend! Willkommen im ';

      this.dom.greeting.innerHTML = `${greeting}<span class="gradient-text">Orbit Workspace</span>`;
    }

    render() {
      this.updateGreeting();

      // Aggregate Stats from apps
      const tasks = this.suite.taskApp ? this.suite.taskApp.tasks : [];
      const notes = this.suite.notesApp ? this.suite.notesApp.notes : [];
      const habits = this.suite.habitsApp ? this.suite.habitsApp.habits : [];
      const focus = this.suite.focusApp;

      const openTasks = tasks.filter(t => t.status !== 'done').length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const todayStr = getTodayString(0);
      const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;

      // KPI Strip
      if (this.dom.statTasks) this.dom.statTasks.textContent = `${openTasks} offene Tasks`;
      if (this.dom.statNotes) this.dom.statNotes.textContent = `${notes.length} Notizen`;
      if (this.dom.statFocus) {
        this.dom.statFocus.textContent = focus ? `${focus.completedSessions} Sessions (${focus.totalMinutes}m)` : '25:00 min';
      }
      if (this.dom.statHabits) {
        const todayDone = habits.filter(h => h.checks[(new Date().getDay() + 6) % 7]).length;
        this.dom.statHabits.textContent = `${todayDone}/${habits.length} heute erledigt`;
      }

      // App Card summaries
      if (this.dom.cardTaskSummary) {
        this.dom.cardTaskSummary.textContent = `${openTasks} Tasks offen • ${completedTasks} erledigt`;
      }
      if (this.dom.cardNotesSummary) {
        this.dom.cardNotesSummary.textContent = `${notes.length} Notizen (${notes.filter(n=>n.pinned).length} gepinnt)`;
      }
      if (this.dom.cardFocusSummary) {
        this.dom.cardFocusSummary.textContent = `${focus ? focus.completedSessions : 0} Pomodoros heute`;
      }
      if (this.dom.cardHabitsSummary) {
        this.dom.cardHabitsSummary.textContent = `${habits.length} Gewohnheiten aktiv`;
      }

      // Live Activity Lists
      this.renderTasksPreview(tasks);
      this.renderHabitsPreview(habits);
      this.renderNotesPreview(notes);
    }

    renderTasksPreview(tasks) {
      if (!this.dom.taskPreviewList) return;
      const todayStr = getTodayString(0);

      // Prioritize overdue and today's tasks
      const focusTasks = tasks.filter(t => t.status !== 'done')
        .sort((a, b) => {
          if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
          if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
          return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        })
        .slice(0, 4);

      if (!focusTasks.length) {
        this.dom.taskPreviewList.innerHTML = `
          <div style="font-size:0.82rem; color:var(--text-dim); padding:10px 0;">
            Alle dringenden Aufgaben erledigt! 🎉
          </div>
        `;
        return;
      }

      this.dom.taskPreviewList.innerHTML = focusTasks.map(t => {
        const isOverdue = t.dueDate && t.dueDate < todayStr;
        const badgeColor = isOverdue ? '#f43f5e' : (t.priority === 'urgent' ? '#f43f5e' : '#f59e0b');
        return `
          <div class="hub-preview-item" data-task-id="${t.id}">
            <div class="hub-preview-left">
              <span style="color:${badgeColor};">●</span>
              <span class="hub-preview-title">${escapeHtml(t.title)}</span>
            </div>
            <span class="hub-preview-badge">${t.dueDate || t.priority}</span>
          </div>
        `;
      }).join('');

      this.dom.taskPreviewList.querySelectorAll('.hub-preview-item').forEach(item => {
        item.addEventListener('click', () => {
          this.suite.switchApp('tasks');
          setTimeout(() => this.suite.taskApp.openEditModal(item.dataset.taskId), 150);
        });
      });
    }

    renderHabitsPreview(habits) {
      if (!this.dom.habitPreviewList) return;
      const todayIdx = (new Date().getDay() + 6) % 7;

      if (!habits.length) {
        this.dom.habitPreviewList.innerHTML = `<div style="font-size:0.82rem; color:var(--text-dim);">Keine Habits eingerichtet.</div>`;
        return;
      }

      this.dom.habitPreviewList.innerHTML = habits.slice(0, 4).map(h => {
        const isDone = h.checks[todayIdx];
        return `
          <div class="hub-preview-item">
            <div class="hub-preview-left">
              <button class="day-check-btn ${isDone ? 'checked' : ''}" style="width:22px; height:22px; font-size:0.7rem; margin-right:6px;" data-hub-habit="${h.id}">
                ${isDone ? '✓' : ''}
              </button>
              <span class="hub-preview-title ${isDone ? 'done' : ''}">${escapeHtml(h.name)}</span>
            </div>
            <span class="hub-preview-badge">🔥 ${h.streak}d</span>
          </div>
        `;
      }).join('');

      this.dom.habitPreviewList.querySelectorAll('[data-hub-habit]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const habitId = btn.dataset.hubHabit;
          this.suite.habitsApp.toggleDayCheck(habitId, todayIdx);
          this.render();
        });
      });
    }

    renderNotesPreview(notes) {
      if (!this.dom.notesPreviewList) return;
      const pinned = notes.filter(n => n.pinned).slice(0, 3);
      const displayNotes = pinned.length > 0 ? pinned : notes.slice(0, 3);

      if (!displayNotes.length) {
        this.dom.notesPreviewList.innerHTML = `<div style="font-size:0.82rem; color:var(--text-dim);">Keine Notizen angelegt.</div>`;
        return;
      }

      this.dom.notesPreviewList.innerHTML = displayNotes.map(n => `
        <div class="hub-preview-item" data-note-id="${n.id}">
          <div class="hub-preview-left">
            <span>📌</span>
            <span class="hub-preview-title">${escapeHtml(n.title)}</span>
          </div>
          <span class="hub-preview-badge">${n.category}</span>
        </div>
      `).join('');

      this.dom.notesPreviewList.querySelectorAll('.hub-preview-item').forEach(item => {
        item.addEventListener('click', () => {
          this.suite.switchApp('notes');
          setTimeout(() => this.suite.notesApp.openEditModal(item.dataset.noteId), 150);
        });
      });
    }
  }

  // ==========================================================================
  // ORBITSUITE ROUTER & UNIFIED FRAMEWORK CONTROLLER
  // ==========================================================================
  class OrbitSuiteRouter {
    constructor() {
      this.sound = new SoundManager();
      this.confetti = new ConfettiManager('confetti-canvas');
      this.activeApp = 'hub'; // 'hub', 'tasks', 'notes', 'focus', 'habits', 'tools'

      // DOM references for Framework
      this.dom = {
        suiteBrand: document.getElementById('suite-brand'),
        appSelectorToggle: document.getElementById('app-selector-toggle'),
        appSelectorMenu: document.getElementById('app-selector-menu'),
        currentAppIndicator: document.getElementById('current-app-indicator'),
        currentAppDot: document.getElementById('current-app-dot'),
        currentAppName: document.getElementById('current-app-name'),
        suiteNavPills: document.querySelectorAll('#suite-nav-pills .suite-pill'),
        appMenuItems: document.querySelectorAll('.app-menu-item'),
        appViews: {
          hub: document.getElementById('app-view-hub'),
          tasks: document.getElementById('app-view-tasks'),
          notes: document.getElementById('app-view-notes'),
          focus: document.getElementById('app-view-focus'),
          habits: document.getElementById('app-view-habits'),
          tools: document.getElementById('app-view-tools')
        },
        clockDisplay: document.getElementById('suite-clock-display'),
        soundToggleBtn: document.getElementById('btn-sound-toggle'),
        btnBackup: document.getElementById('btn-suite-backup'),
        backupModal: document.getElementById('backup-modal'),
        backupModalClose: document.getElementById('backup-modal-close'),
        btnExportBackup: document.getElementById('btn-export-suite-backup'),
        inputImportBackup: document.getElementById('input-suite-import'),
        btnResetAllDemo: document.getElementById('btn-reset-all-demo'),
        btnShortcuts: document.getElementById('btn-suite-shortcuts'),
        shortcutsModal: document.getElementById('shortcuts-modal'),
        shortcutsModalClose: document.getElementById('shortcuts-modal-close'),
        toastContainer: document.getElementById('toast-container')
      };

      // App Colors for Selector Indicator
      this.appThemes = {
        hub: { name: 'Startseite Hub', color: '#6366f1' },
        tasks: { name: 'OrbitTask', color: '#8b5cf6' },
        notes: { name: 'OrbitNotes', color: '#10b981' },
        focus: { name: 'OrbitFocus', color: '#f59e0b' },
        habits: { name: 'OrbitHabits', color: '#f43f5e' },
        tools: { name: 'OrbitTools', color: '#0284c7' }
      };

      this.init();
    }

    init() {
      // 1. Initialize Sub-Applications
      this.taskApp = new OrbitTaskApp(this);
      this.notesApp = new OrbitNotesApp(this);
      this.focusApp = new OrbitFocusApp(this);
      this.habitsApp = new OrbitHabitsApp(this);
      this.toolsApp = new OrbitToolsApp(this);
      this.hubApp = new OrbitHubApp(this);

      // 2. Bind Framework Navigation & Controls
      this.bindFrameworkEvents();

      // 3. Setup Clock & Sound
      this.startClock();
      this.updateSoundIcon();

      // 4. Initial Route from URL Hash or default to 'hub'
      const initialHash = window.location.hash.replace('#', '');
      if (this.dom.appViews[initialHash]) {
        this.switchApp(initialHash, false);
      } else {
        this.switchApp('hub', false);
      }
    }

    bindFrameworkEvents() {
      // Brand click -> Startseite
      if (this.dom.suiteBrand) {
        this.dom.suiteBrand.addEventListener('click', () => this.switchApp('hub'));
      }

      // App Selector Toggle Dropdown
      if (this.dom.appSelectorToggle) {
        this.dom.appSelectorToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = this.dom.appSelectorToggle.getAttribute('aria-expanded') === 'true';
          this.toggleAppSelector(!isExpanded);
        });
      }

      // App Menu Items
      this.dom.appMenuItems.forEach(item => {
        item.addEventListener('click', () => {
          const target = item.dataset.appTarget;
          this.switchApp(target);
          this.toggleAppSelector(false);
        });
      });

      // Quick Nav Pills
      this.dom.suiteNavPills.forEach(pill => {
        pill.addEventListener('click', () => {
          this.switchApp(pill.dataset.app);
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.app-selector-dropdown-wrapper')) {
          this.toggleAppSelector(false);
        }
      });

      // Global Sound Toggle
      if (this.dom.soundToggleBtn) {
        this.dom.soundToggleBtn.addEventListener('click', () => {
          this.sound.toggle();
          this.updateSoundIcon();
          if (this.sound.enabled) this.sound.playSuccess();
        });
      }

      // Global Backup Modal
      if (this.dom.btnBackup) {
        this.dom.btnBackup.addEventListener('click', () => {
          this.dom.backupModal.classList.remove('hidden');
          this.sound.playPop();
        });
      }
      if (this.dom.backupModalClose) {
        this.dom.backupModalClose.addEventListener('click', () => {
          this.dom.backupModal.classList.add('hidden');
        });
      }
      if (this.dom.btnExportBackup) {
        this.dom.btnExportBackup.addEventListener('click', () => this.exportAllSuiteData());
      }
      if (this.dom.inputImportBackup) {
        this.dom.inputImportBackup.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) this.importSuiteData(file);
          e.target.value = '';
        });
      }
      if (this.dom.btnResetAllDemo) {
        this.dom.btnResetAllDemo.addEventListener('click', () => {
          if (confirm('Möchtest du alle Suite-Daten auf Werkseinstellungen zurücksetzen?')) {
            localStorage.clear();
            location.reload();
          }
        });
      }

      // Shortcuts Modal
      if (this.dom.btnShortcuts) {
        this.dom.btnShortcuts.addEventListener('click', () => {
          this.dom.shortcutsModal.classList.remove('hidden');
          this.sound.playPop();
        });
      }
      if (this.dom.shortcutsModalClose) {
        this.dom.shortcutsModalClose.addEventListener('click', () => {
          this.dom.shortcutsModal.classList.add('hidden');
        });
      }

      // Universal Keyboard Shortcuts (Alt + 0..5, Alt + K, Escape)
      window.addEventListener('keydown', (e) => {
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
          if (e.key === '0' || e.key.toLowerCase() === 'h') {
            e.preventDefault();
            this.switchApp('hub');
          } else if (e.key === '1') {
            e.preventDefault();
            this.switchApp('tasks');
          } else if (e.key === '2') {
            e.preventDefault();
            this.switchApp('notes');
          } else if (e.key === '3') {
            e.preventDefault();
            this.switchApp('focus');
          } else if (e.key === '4') {
            e.preventDefault();
            this.switchApp('habits');
          } else if (e.key === '5') {
            e.preventDefault();
            this.switchApp('tools');
          } else if (e.key.toLowerCase() === 'k') {
            e.preventDefault();
            this.toggleAppSelector();
          }
        } else if (e.key === 'Escape') {
          this.toggleAppSelector(false);
          if (this.dom.backupModal) this.dom.backupModal.classList.add('hidden');
          if (this.dom.shortcutsModal) this.dom.shortcutsModal.classList.add('hidden');
        }
      });

      // Browser Navigation (Hash change back/forward)
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (this.dom.appViews[hash] && hash !== this.activeApp) {
          this.switchApp(hash, false);
        }
      });

      // Data Navigation triggers with [data-app-nav]
      document.querySelectorAll('[data-app-nav]').forEach(el => {
        el.addEventListener('click', () => {
          this.switchApp(el.dataset.appNav);
        });
      });
    }

    toggleAppSelector(forceState) {
      if (!this.dom.appSelectorMenu || !this.dom.appSelectorToggle) return;
      const isOpen = forceState !== undefined ? forceState : this.dom.appSelectorMenu.classList.contains('hidden');
      this.dom.appSelectorMenu.classList.toggle('hidden', !isOpen);
      this.dom.appSelectorToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) this.sound.playPop();
    }

    switchApp(appId, updateHash = true) {
      if (!this.dom.appViews[appId]) return;

      this.activeApp = appId;

      // 1. Switch visible view
      Object.keys(this.dom.appViews).forEach(key => {
        const viewEl = this.dom.appViews[key];
        if (viewEl) {
          viewEl.classList.toggle('active', key === appId);
        }
      });

      // 2. Update Indicator in Header
      const theme = this.appThemes[appId] || { name: appId, color: '#6366f1' };
      if (this.dom.currentAppName) this.dom.currentAppName.textContent = theme.name;
      if (this.dom.currentAppDot) {
        this.dom.currentAppDot.style.background = theme.color;
        this.dom.currentAppDot.style.boxShadow = `0 0 10px ${theme.color}`;
      }

      // 3. Update Suite Nav Pills
      this.dom.suiteNavPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.app === appId);
      });

      // 4. Update Dropdown Menu Active Item
      this.dom.appMenuItems.forEach(item => {
        item.classList.toggle('active', item.dataset.appTarget === appId);
      });

      // 5. Update URL Hash
      if (updateHash) {
        window.location.hash = appId;
      }

      // 6. Sound & Refresh
      this.sound.playPop();

      // Trigger app-specific refresh
      if (appId === 'hub' && this.hubApp) {
        this.hubApp.render();
      } else if (appId === 'tasks' && this.taskApp) {
        this.taskApp.render();
      } else if (appId === 'notes' && this.notesApp) {
        this.notesApp.render();
      } else if (appId === 'habits' && this.habitsApp) {
        this.habitsApp.render();
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    startClock() {
      const update = () => {
        if (!this.dom.clockDisplay) return;
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        this.dom.clockDisplay.innerHTML = `<span class="clock-time">${hrs}:${mins}</span>`;
      };
      update();
      setInterval(update, 1000);
    }

    updateSoundIcon() {
      if (!this.dom.soundToggleBtn) return;
      if (this.sound.enabled) {
        this.dom.soundToggleBtn.classList.remove('muted');
        this.dom.soundToggleBtn.title = 'Sound-Synthesizer: Aktiviert';
        this.dom.soundToggleBtn.style.opacity = '1';
      } else {
        this.dom.soundToggleBtn.classList.add('muted');
        this.dom.soundToggleBtn.title = 'Sound-Synthesizer: Stumm';
        this.dom.soundToggleBtn.style.opacity = '0.5';
      }
    }

    showToast(message, type = 'info') {
      if (!this.dom.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
      this.dom.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
      }, 4000);
    }

    // --- Global Suite Backup ---
    exportAllSuiteData() {
      const suiteBackup = {
        version: '3.0',
        exportedAt: new Date().toISOString(),
        tasks: this.taskApp ? this.taskApp.tasks : [],
        notes: this.notesApp ? this.notesApp.notes : [],
        habits: this.habitsApp ? this.habitsApp.habits : [],
        focus: {
          sessions: parseInt(localStorage.getItem('orbitsuite_focus_sessions') || '0', 10),
          minutes: parseInt(localStorage.getItem('orbitsuite_focus_minutes') || '0', 10)
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(suiteBackup, null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute('href', dataStr);
      anchor.setAttribute('download', `orbitsuite-backup-${getTodayString(0)}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      this.showToast('Vollständiges OrbitSuite-Backup exportiert! 📦');
      this.sound.playSuccess();
    }

    importSuiteData(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data && (data.tasks || Array.isArray(data))) {
            if (Array.isArray(data.tasks)) {
              this.taskApp.tasks = data.tasks;
              this.taskApp.saveTasks();
            } else if (Array.isArray(data)) {
              this.taskApp.tasks = data;
              this.taskApp.saveTasks();
            }

            if (Array.isArray(data.notes)) {
              this.notesApp.notes = data.notes;
              this.notesApp.saveNotes();
            }

            if (Array.isArray(data.habits)) {
              this.habitsApp.habits = data.habits;
              this.habitsApp.saveHabits();
            }

            if (data.focus) {
              localStorage.setItem('orbitsuite_focus_sessions', data.focus.sessions || 0);
              localStorage.setItem('orbitsuite_focus_minutes', data.focus.minutes || 0);
            }

            this.showToast('OrbitSuite Backup erfolgreich eingespielt! 🎉');
            this.sound.playSuccess();
            this.dom.backupModal.classList.add('hidden');
            this.switchApp('hub');
          } else {
            alert('Ungültiges Backup-Format.');
          }
        } catch (err) {
          alert('Fehler beim Importieren: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  }

  // Launch when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.orbitSuite = new OrbitSuiteRouter();
  });
})();
