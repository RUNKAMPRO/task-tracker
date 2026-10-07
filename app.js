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



    playClick() {
      this.playPop();
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



    playError() {

      if (!this.enabled) return;

      this.init();

      if (!this.ctx) return;

      try {

        const osc = this.ctx.createOscillator();

        const gain = this.ctx.createGain();

        const now = this.ctx.currentTime;

        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(180, now);

        osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);

        gain.gain.setValueAtTime(0.08, now);

        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);

        gain.connect(this.ctx.destination);

        osc.start(now);

        osc.stop(now + 0.16);

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

  const DEFAULT_DEMO_TASKS = [];



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

          if (Array.isArray(parsed)) {

            const cleaned = parsed.filter(t => !['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6'].includes(t.id));

            if (cleaned.length !== parsed.length) {

              this.saveTasks(cleaned);

            }

            return cleaned;

          }

        }

      } catch (err) {

        console.error('Error loading tasks:', err);

      }

      return [];

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

  const DEFAULT_DEMO_NOTES = [];



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

          if (Array.isArray(parsed)) {

            const cleaned = parsed.filter(n => !['note-1', 'note-2', 'note-3', 'note-4'].includes(n.id));

            if (cleaned.length !== parsed.length) {

              this.saveNotes(cleaned);

            }

            return cleaned;

          }

        }

      } catch (e) { console.warn(e); }

      return [];

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

  const DEFAULT_DEMO_HABITS = [];



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

          if (Array.isArray(parsed)) {

            const cleaned = parsed.filter(h => !['hab-1', 'hab-2', 'hab-3', 'hab-4'].includes(h.id));

            if (cleaned.length !== parsed.length) {

              this.saveHabits(cleaned);

            }

            return cleaned;

          }

        }

      } catch (e) { console.warn(e); }

      return [];

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



      if (this.habits.length === 0) {

        this.dom.listBody.innerHTML = `

          <div style="padding: 40px; text-align: center; color: var(--text-dim);">

            Noch keine Gewohnheiten angelegt. Klicke auf "+ Neue Gewohnheit", um deine erste Routine zu starten!

          </div>

        `;

        return;

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

  // 5. ORBITRÄTSEL MODULE (DENKSPORT & PUZZLE STUDIO)

  // ==========================================================================

  
// =====================================================================
// PROCEDURAL & ALGORITHMIC PUZZLE GENERATION ENGINE (ORBIT RÄTSEL)
// =====================================================================
class OrbitRiddleGenerator {
  static createPrng(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  // 1. QUEENS GENERATOR: 6x6 grid, 6 queens, 6 contiguous color regions
  static generateQueens(level, customSeed = null) {
    const seed = customSeed || `queens_level_${level}`;
    const rng = this.createPrng(seed);
    const size = 6;

    let queens = null;
    for (let attempt = 0; attempt < 1000; attempt++) {
      const cols = [0, 1, 2, 3, 4, 5];
      for (let i = size - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [cols[i], cols[j]] = [cols[j], cols[i]];
      }
      let ok = true;
      for (let r = 0; r < size - 1; r++) {
        if (Math.abs(cols[r] - cols[r + 1]) <= 1) {
          ok = false;
          break;
        }
      }
      if (ok) {
        queens = cols.map((c, r) => [r, c]);
        break;
      }
    }
    if (!queens) queens = [[0, 3], [1, 0], [2, 2], [3, 4], [4, 1], [5, 5]];

    const grid = Array(size).fill(null).map(() => Array(size).fill(-1));
    const regionCells = {};
    queens.forEach(([r, c], i) => {
      grid[r][c] = i;
      regionCells[i] = [{ r, c }];
    });

    let unassigned = size * size - size;
    while (unassigned > 0) {
      const candidates = [];
      for (let i = 0; i < size; i++) {
        const nbrs = [];
        regionCells[i].forEach(({ r, c }) => {
          [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === -1) {
              if (!nbrs.some(n => n.r === nr && n.c === nc)) {
                nbrs.push({ r: nr, c: nc });
              }
            }
          });
        });
        if (nbrs.length > 0) {
          candidates.push({ size: regionCells[i].length, region: i, nbrs });
        }
      }
      if (candidates.length === 0) break;
      candidates.sort((a, b) => a.size - b.size);
      const chosen = candidates[0];
      const targetCell = chosen.nbrs[Math.floor(rng() * chosen.nbrs.length)];
      grid[targetCell.r][targetCell.c] = chosen.region;
      regionCells[chosen.region].push(targetCell);
      unassigned--;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === -1) {
          for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] !== -1) {
              grid[r][c] = grid[nr][nc];
              break;
            }
          }
        }
      }
    }

    return {
      id: `queens-gen-${level}`,
      title: `👑 Queens: Board #${level} (6×6)`,
      size: 6,
      regions: grid,
      solution: queens
    };
  }

  // 2. TANGO GENERATOR: 6x6 grid, 3 Suns and 3 Moons, edge hints and givens
  static generateTango(level, customSeed = null) {
    const seed = customSeed || `tango_level_${level}`;
    const rng = this.createPrng(seed);
    const size = 6;

    const baseRows = [
      ['S','S','M','S','M','M'], ['S','S','M','M','S','M'], ['S','M','S','S','M','M'],
      ['S','M','S','M','S','M'], ['S','M','S','M','M','S'], ['S','M','M','S','S','M'],
      ['S','M','M','S','M','S'], ['M','S','S','M','S','M'], ['M','S','S','M','M','S'],
      ['M','S','M','S','S','M'], ['M','S','M','S','M','S'], ['M','S','M','M','S','S'],
      ['M','M','S','S','M','S'], ['M','M','S','M','S','S']
    ];

    const shuffledRows = [...baseRows];
    for (let i = shuffledRows.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledRows[i], shuffledRows[j]] = [shuffledRows[j], shuffledRows[i]];
    }

    const grid = [];
    function solve(rowIdx) {
      if (rowIdx === size) return true;
      for (let r = 0; r < shuffledRows.length; r++) {
        grid.push(shuffledRows[r]);
        let colOk = true;
        for (let c = 0; c < size; c++) {
          let sCnt = 0, mCnt = 0;
          for (let ri = 0; ri < grid.length; ri++) {
            if (grid[ri][c] === 'S') sCnt++;
            if (grid[ri][c] === 'M') mCnt++;
          }
          if (sCnt > 3 || mCnt > 3) { colOk = false; break; }
          const len = grid.length;
          if (len >= 3 && grid[len-1][c] === grid[len-2][c] && grid[len-2][c] === grid[len-3][c]) {
            colOk = false; break;
          }
        }
        if (colOk && solve(rowIdx + 1)) return true;
        grid.pop();
      }
      return false;
    }
    solve(0);

    const givens = Array(size).fill(null).map(() => Array(size).fill(null));
    const allCoords = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) allCoords.push({ r, c });
    }
    for (let i = allCoords.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
    }
    const diffTier = level <= 5 ? 'easy' : (level <= 10 ? 'medium' : 'hard');
    const givenCount = diffTier === 'easy' ? 8 : (diffTier === 'medium' ? 5 : 3);
    const edgeClueCount = diffTier === 'easy' ? 6 : (diffTier === 'medium' ? 4 : 3);
    for (let i = 0; i < givenCount; i++) {
      const { r, c } = allCoords[i];
      givens[r][c] = grid[r][c];
    }

    const hEdges = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 1; c++) {
        hEdges.push({ r, c, op: grid[r][c] === grid[r][c+1] ? '=' : 'x' });
      }
    }
    const vEdges = [];
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size; c++) {
        vEdges.push({ r, c, op: grid[r][c] === grid[r+1][c] ? '=' : 'x' });
      }
    }
    for (let i = hEdges.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [hEdges[i], hEdges[j]] = [hEdges[j], hEdges[i]];
    }
    for (let i = vEdges.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [vEdges[i], vEdges[j]] = [vEdges[j], vEdges[i]];
    }

    return {
      id: `tango-gen-${level}`,
      title: `☀️🌙 Tango: Board #${level} (6×6)`,
      size: 6,
      givens,
      hEdges: hEdges.slice(0, 4),
      vEdges: vEdges.slice(0, 4),
      solution: grid
    };
  }

  // 3. SUDOKU GENERATOR: 6x6 grid, Latin square with 2x3 blocks
  static generateSudoku(level, customSeed = null) {
    const seed = customSeed || `sudoku_level_${level}`;
    const rng = this.createPrng(seed);
    const base = [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2]
    ];

    const digits = [1, 2, 3, 4, 5, 6];
    for (let i = 5; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    const map = {};
    for (let i = 1; i <= 6; i++) map[i] = digits[i - 1];

    let grid = base.map(row => row.map(val => map[val]));

    if (rng() > 0.5) [grid[0], grid[1]] = [grid[1], grid[0]];
    if (rng() > 0.5) [grid[2], grid[3]] = [grid[3], grid[2]];
    if (rng() > 0.5) [grid[4], grid[5]] = [grid[5], grid[4]];

    function permuteCols(g, c1, c2, c3) {
      const cols = [c1, c2, c3];
      for (let i = 2; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [cols[i], cols[j]] = [cols[j], cols[i]];
      }
      return g.map(row => {
        const copy = [...row];
        row[c1] = copy[cols[0]];
        row[c2] = copy[cols[1]];
        row[c3] = copy[cols[2]];
        return row;
      });
    }
    grid = permuteCols(grid, 0, 1, 2);
    grid = permuteCols(grid, 3, 4, 5);

    const givens = grid.map(row => [...row]);
    const coords = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) coords.push({ r, c });
    }
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }
    const diffTier = level <= 5 ? 'easy' : (level <= 10 ? 'medium' : 'hard');
    const removeCount = diffTier === 'easy' ? (14 + Math.floor(rng() * 2)) : (diffTier === 'medium' ? (18 + Math.floor(rng() * 2)) : (22 + Math.floor(rng() * 2)));
    for (let i = 0; i < removeCount; i++) {
      givens[coords[i].r][coords[i].c] = 0;
    }

    return {
      id: `sudoku-gen-${level}`,
      title: `🔢 Mini Sudoku: Board #${level} (6×6)`,
      size: 6,
      givens,
      solution: grid
    };
  }

  // 4. ZIP GENERATOR: 5x5 grid, Hamiltonian path, 7 ordered checkpoints
  static generateZip(level, customSeed = null) {
    const seed = customSeed || `zip_level_${level}`;
    const rng = this.createPrng(seed);
    const size = 5;
    const total = 25;

    let path = null;
    for (let attempt = 0; attempt < 500; attempt++) {
      const sr = Math.floor(rng() * size);
      const sc = Math.floor(rng() * size);
      const curPath = [{ r: sr, c: sc }];
      const visited = new Set([`${sr},${sc}`]);

      while (curPath.length < total) {
        const last = curPath[curPath.length - 1];
        const nbrs = [];
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
          const nr = last.r + dr, nc = last.c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited.has(`${nr},${nc}`)) {
            let deg = 0;
            [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([ddr, ddc]) => {
              const nnr = nr + ddr, nnc = nc + ddc;
              if (nnr >= 0 && nnr < size && nnc >= 0 && nnc < size && !visited.has(`${nnr},${nnc}`)) {
                deg++;
              }
            });
            nbrs.push({ deg, r: nr, c: nc });
          }
        });

        if (nbrs.length === 0) break;
        for (let i = nbrs.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [nbrs[i], nbrs[j]] = [nbrs[j], nbrs[i]];
        }
        nbrs.sort((a, b) => a.deg - b.deg);
        const next = nbrs[0];
        curPath.push({ r: next.r, c: next.c });
        visited.add(`${next.r},${next.c}`);
      }

      if (curPath.length === total) {
        path = curPath;
        break;
      }
    }

    if (!path) {
      path = [];
      for (let r = 0; r < 5; r++) {
        if (r % 2 === 0) {
          for (let c = 0; c < 5; c++) path.push({ r, c });
        } else {
          for (let c = 4; c >= 0; c--) path.push({ r, c });
        }
      }
    }

    const checkpoints = {};
    const diffTier = level <= 5 ? 'easy' : (level <= 10 ? 'medium' : 'hard');
    const steps = diffTier === 'easy'
      ? [0, 3, 6, 9, 12, 15, 18, 21, 24]
      : (diffTier === 'medium' ? [0, 4, 8, 12, 16, 20, 24] : [0, 6, 12, 18, 24]);
    steps.forEach((stepIdx, numIdx) => {
      const cell = path[stepIdx];
      checkpoints[`${cell.r},${cell.c}`] = {
        num: numIdx + 1,
        requiredStep: stepIdx + 1
      };
    });

    return {
      id: `zip-gen-${level}`,
      title: `⚡ Zip: Pfad #${level} (5×5)`,
      size: 5,
      checkpoints,
      solution: path
    };
  }

  // 5. CROSSCLIMB GENERATOR: Procedural selection & permutation
  static generateCrossclimb(level, staticPool = [], customSeed = null) {
    const seed = customSeed || `crossclimb_level_${level}`;
    const rng = this.createPrng(seed);

    const extraPool = [
      {
        title: "Crossclimb: Korn bis Bord",
        words: ["KORN", "BORN", "BORT", "BORD", "MORD"],
        clues: [
          "Getreidesame auf dem Feld",
          "Altes Wort für Quelle oder Brunnen",
          "Kante eines Bootes oder Schiffes",
          "An Bord eines Flugzeugs oder Schiffs",
          "Vorsätzliche Tötung im Strafrecht"
        ]
      },
      {
        title: "Crossclimb: Wand bis Band",
        words: ["WAND", "WIND", "WILD", "BILD", "BAND"],
        clues: [
          "Begrenzung eines Zimmers",
          "Spürbare Luftbewegung im Freien",
          "Freilebende Tiere des Waldes",
          "Foto oder Gemälde an der Wand",
          "Musikgruppe oder Stoffstreifen"
        ]
      },
      {
        title: "Crossclimb: Geld bis Held",
        words: ["GELD", "GOLD", "HOLD", "HELD", "HERD"],
        clues: [
          "Zahlungsmittel in Münzen und Scheinen",
          "Glänzendes gelbes Edelmetall",
          "Altertümlich für anmutig oder geneigt",
          "Mutige Hauptfigur in einer Geschichte",
          "Kochstelle in der modernen Küche"
        ]
      },
      {
        title: "Crossclimb: Bach bis Dach",
        words: ["BACH", "BUCH", "TUCH", "TEICH", "DACH"],
        clues: [
          "Kleiner natürlicher Wasserlauf",
          "Gebundenes Werk aus bedrucktem Papier",
          "Stück Stoff zum Abtrocknen oder Putzen",
          "Kleines stehendes Gewässer im Garten",
          "Oberste Abdeckung eines Hauses"
        ]
      },
      {
        title: "Crossclimb: Stern bis Stein",
        words: ["STERN", "STEIR", "STEIN", "BEIN", "WEIN"],
        clues: [
          "Leuchtender Himmelskörper bei Nacht",
          "Kurzform für Bewohner der Steiermark",
          "Harter mineralischer Brocken",
          "Körperteil zum Gehen und Laufen",
          "Vergorener Saft aus Weintrauben"
        ]
      }
    ];

    const all = [...staticPool, ...extraPool];
    const idx = (level - 1) % all.length;
    const item = all[idx];

    return {
      id: `crossclimb-gen-${level}`,
      title: `🪜 Crossclimb: Leiter #${level}`,
      words: [...item.words],
      clues: [...item.clues]
    };
  }

  // 6. PINPOINT GENERATOR: Rich procedural category bank
  static generatePinpoint(level, staticPool = [], customSeed = null) {
    const seed = customSeed || `pinpoint_level_${level}`;
    const rng = this.createPrng(seed);

    const extraPool = [
      {
        category: "Programmiersprachen",
        clues: ["Python", "JavaScript", "Rust", "TypeScript", "C++"],
        keywords: ["programmiersprachen", "code", "coding", "software", "sprachen"]
      },
      {
        category: "Planeten unseres Sonnensystems",
        clues: ["Merkur", "Venus", "Mars", "Jupiter", "Saturn"],
        keywords: ["planeten", "sonnensystem", "weltall", "astronomie", "himmelskörper"]
      },
      {
        category: "Edelsteine & Mineralien",
        clues: ["Rubin", "Saphir", "Smaragd", "Diamant", "Amethyst"],
        keywords: ["edelsteine", "steine", "schmuck", "mineralien", "kristalle"]
      },
      {
        category: "Streichinstrumente",
        clues: ["Geige", "Bratsche", "Cello", "Kontrabass", "Viola"],
        keywords: ["streichinstrumente", "instrumente", "orchester", "streicher", "musik"]
      },
      {
        category: "Deutsche Großstädte",
        clues: ["Hamburg", "München", "Köln", "Frankfurt", "Berlin"],
        keywords: ["städte", "deutschland", "deutsche städte", "großstädte", "metropolen"]
      },
      {
        category: "Dinge mit Flügeln",
        clues: ["Schmetterling", "Flugzeug", "Fledermaus", "Engel", "Windmühle"],
        keywords: ["flügel", "dinge mit flügeln", "hat flügel", "kann fliegen"]
      },
      {
        category: "Sitzmöbel",
        clues: ["Hocker", "Sessel", "Sofa", "Schaukelstuhl", "Bürostuhl"],
        keywords: ["sitzmöbel", "stühle", "sitzen", "möbel"]
      }
    ];

    const all = [...staticPool, ...extraPool];
    const idx = (level - 1) % all.length;
    const item = all[idx];

    return {
      id: `pinpoint-gen-${level}`,
      title: `🎯 Pinpoint: Rätsel #${level}`,
      category: item.category,
      clues: [...item.clues],
      keywords: [...item.keywords]
    };
  }
}

class OrbitRiddleApp {

    constructor(suite) {

      this.suite = suite;

                  this.levelCache = {
        queens: {},
        tango: {},
        crossclimb: {},
        pinpoint: {},
        zip: {},
        sudoku: {}
      };
      this.queensData = [{"id": "queens-1", "title": "Queens Tages-Board #1", "size": 6, "regions": [[1, 2, 0, 0, 0, 0], [1, 2, 2, 2, 0, 0], [1, 2, 2, 2, 2, 3], [4, 2, 4, 4, 3, 3], [4, 4, 4, 4, 3, 5], [4, 4, 4, 4, 3, 5]], "solution": [[0, 3], [1, 0], [2, 2], [3, 4], [4, 1], [5, 5]]}, {"id": "queens-2", "title": "Queens Tages-Board #2", "size": 6, "regions": [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1], [2, 3, 0, 0, 1, 1], [2, 3, 3, 4, 4, 4], [5, 5, 4, 4, 4, 4], [5, 5, 5, 4, 4, 4]], "solution": [[0, 3], [1, 5], [2, 0], [3, 2], [4, 4], [5, 1]]}, {"id": "queens-3", "title": "Queens Tages-Board #3", "size": 6, "regions": [[1, 1, 1, 0, 0, 2], [1, 1, 1, 1, 1, 2], [3, 3, 1, 1, 4, 2], [3, 3, 1, 4, 4, 4], [3, 3, 4, 4, 4, 4], [3, 4, 4, 4, 5, 5]], "solution": [[0, 3], [1, 1], [2, 5], [3, 0], [4, 2], [5, 4]]}, {"id": "queens-4", "title": "Queens Tages-Board #4", "size": 6, "regions": [[1, 1, 1, 0, 0, 0], [1, 1, 1, 1, 2, 0], [1, 1, 1, 1, 2, 0], [3, 1, 1, 1, 2, 2], [3, 1, 1, 4, 2, 2], [3, 5, 5, 4, 2, 2]], "solution": [[0, 5], [1, 2], [2, 4], [3, 0], [4, 3], [5, 1]]}, {"id": "queens-5", "title": "Queens Tages-Board #5", "size": 6, "regions": [[2, 2, 0, 0, 1, 1], [2, 2, 2, 2, 1, 3], [2, 2, 2, 2, 2, 3], [2, 2, 2, 2, 2, 3], [4, 2, 5, 3, 3, 3], [4, 5, 5, 5, 5, 3]], "solution": [[0, 2], [1, 4], [2, 1], [3, 5], [4, 0], [5, 3]]}, {"id": "queens-6", "title": "Queens Tages-Board #6", "size": 6, "regions": [[0, 0, 1, 1, 1, 1], [2, 0, 3, 1, 1, 1], [2, 2, 3, 3, 1, 1], [3, 3, 3, 1, 1, 1], [5, 5, 5, 1, 1, 4], [5, 5, 5, 5, 4, 4]], "solution": [[0, 1], [1, 4], [2, 0], [3, 2], [4, 5], [5, 3]]}, {"id": "queens-7", "title": "Queens Tages-Board #7", "size": 6, "regions": [[0, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1], [0, 2, 1, 1, 1, 1], [2, 2, 3, 3, 4, 1], [2, 2, 5, 5, 4, 4], [5, 5, 5, 5, 5, 4]], "solution": [[0, 0], [1, 4], [2, 1], [3, 3], [4, 5], [5, 2]]}, {"id": "queens-8", "title": "Queens Tages-Board #8", "size": 6, "regions": [[0, 0, 1, 1, 3, 2], [1, 1, 1, 3, 3, 2], [3, 3, 3, 3, 3, 2], [3, 3, 3, 3, 3, 3], [4, 4, 4, 4, 5, 3], [4, 4, 4, 4, 5, 5]], "solution": [[0, 0], [1, 2], [2, 5], [3, 3], [4, 1], [5, 4]]}, {"id": "queens-9", "title": "Queens Tages-Board #9", "size": 6, "regions": [[0, 0, 2, 2, 3, 1], [0, 0, 2, 2, 3, 1], [0, 2, 2, 2, 3, 3], [4, 2, 5, 2, 3, 3], [4, 5, 5, 5, 5, 5], [5, 5, 5, 5, 5, 5]], "solution": [[0, 1], [1, 5], [2, 2], [3, 4], [4, 0], [5, 3]]}, {"id": "queens-10", "title": "Queens Tages-Board #10", "size": 6, "regions": [[1, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 2], [1, 1, 0, 2, 2, 2], [1, 3, 3, 2, 2, 4], [5, 5, 3, 2, 2, 4], [5, 5, 3, 2, 2, 4]], "solution": [[0, 3], [1, 0], [2, 4], [3, 2], [4, 5], [5, 1]]}, {"id": "queens-11", "title": "Queens Tages-Board #11", "size": 6, "regions": [[1, 1, 3, 3, 3, 0], [3, 1, 3, 3, 2, 0], [3, 1, 3, 2, 2, 0], [3, 3, 3, 3, 3, 3], [4, 4, 3, 3, 3, 3], [4, 5, 5, 5, 5, 5]], "solution": [[0, 5], [1, 1], [2, 4], [3, 2], [4, 0], [5, 3]]}, {"id": "queens-12", "title": "Queens Tages-Board #12", "size": 6, "regions": [[0, 0, 0, 1, 1, 1], [0, 0, 2, 1, 1, 1], [3, 4, 2, 1, 1, 1], [3, 4, 4, 4, 1, 1], [3, 4, 4, 4, 4, 4], [4, 4, 4, 4, 5, 5]], "solution": [[0, 1], [1, 4], [2, 2], [3, 0], [4, 3], [5, 5]]}, {"id": "queens-13", "title": "Queens Tages-Board #13", "size": 6, "regions": [[1, 1, 2, 2, 0, 0], [1, 2, 2, 2, 2, 3], [2, 2, 2, 2, 3, 3], [2, 2, 2, 4, 3, 3], [2, 2, 2, 4, 3, 3], [5, 5, 4, 4, 4, 4]], "solution": [[0, 4], [1, 0], [2, 2], [3, 5], [4, 3], [5, 1]]}, {"id": "queens-14", "title": "Queens Tages-Board #14", "size": 6, "regions": [[1, 0, 0, 3, 3, 3], [1, 0, 0, 3, 3, 3], [1, 4, 2, 2, 3, 3], [4, 4, 4, 5, 3, 3], [4, 4, 4, 5, 5, 5], [4, 4, 4, 5, 5, 5]], "solution": [[0, 2], [1, 0], [2, 3], [3, 5], [4, 1], [5, 4]]}];

      this.tangoData = [{"id": "tango-1", "title": "Tango Tages-Board #1", "size": 6, "givens": [["S", null, null, "S", null, "M"], [null, null, null, null, null, null], [null, null, null, null, null, null], [null, null, "M", null, null, null], ["S", null, "S", null, null, null], [null, null, null, "S", null, null]], "hEdges": [{"r": 5, "c": 0, "op": "x"}, {"r": 2, "c": 3, "op": "x"}, {"r": 3, "c": 4, "op": "="}, {"r": 2, "c": 2, "op": "x"}], "vEdges": [{"r": 0, "c": 5, "op": "="}, {"r": 0, "c": 0, "op": "="}, {"r": 2, "c": 3, "op": "x"}], "solution": [["S", "M", "S", "S", "M", "M"], ["S", "M", "S", "M", "S", "M"], ["M", "S", "M", "S", "M", "S"], ["M", "S", "M", "M", "S", "S"], ["S", "M", "S", "M", "S", "M"], ["M", "S", "M", "S", "M", "S"]]}, {"id": "tango-2", "title": "Tango Tages-Board #2", "size": 6, "givens": [[null, null, null, null, null, null], [null, null, null, "M", null, null], [null, null, null, "S", null, null], [null, "M", null, "S", null, null], [null, null, null, null, null, null], ["S", null, "M", null, null, null]], "hEdges": [{"r": 5, "c": 4, "op": "x"}, {"r": 1, "c": 4, "op": "="}, {"r": 3, "c": 4, "op": "="}, {"r": 2, "c": 2, "op": "="}], "vEdges": [{"r": 3, "c": 4, "op": "x"}, {"r": 0, "c": 5, "op": "="}, {"r": 0, "c": 1, "op": "x"}], "solution": [["M", "M", "S", "S", "M", "S"], ["M", "S", "M", "M", "S", "S"], ["S", "M", "S", "S", "M", "M"], ["S", "M", "S", "S", "M", "M"], ["M", "S", "M", "M", "S", "S"], ["S", "S", "M", "M", "S", "M"]]}, {"id": "tango-3", "title": "Tango Tages-Board #3", "size": 6, "givens": [[null, null, "S", null, null, null], ["S", null, null, null, null, null], [null, null, null, null, null, "M"], [null, null, null, null, null, null], ["S", null, null, null, "S", null], [null, null, null, null, "S", "S"]], "hEdges": [{"r": 1, "c": 1, "op": "="}, {"r": 4, "c": 1, "op": "="}, {"r": 5, "c": 1, "op": "x"}], "vEdges": [{"r": 3, "c": 4, "op": "x"}, {"r": 0, "c": 3, "op": "="}], "solution": [["S", "M", "S", "S", "M", "M"], ["S", "M", "M", "S", "M", "S"], ["M", "S", "S", "M", "S", "M"], ["M", "S", "S", "M", "M", "S"], ["S", "M", "M", "S", "S", "M"], ["M", "S", "M", "M", "S", "S"]]}, {"id": "tango-4", "title": "Tango Tages-Board #4", "size": 6, "givens": [[null, null, null, null, null, "M"], [null, null, null, null, null, "S"], ["S", null, null, null, null, "S"], [null, null, null, null, null, "M"], ["S", null, null, null, null, null], [null, null, null, null, "M", null]], "hEdges": [{"r": 3, "c": 1, "op": "x"}, {"r": 2, "c": 3, "op": "x"}, {"r": 5, "c": 1, "op": "="}, {"r": 2, "c": 2, "op": "x"}], "vEdges": [{"r": 0, "c": 0, "op": "="}, {"r": 4, "c": 4, "op": "x"}], "solution": [["M", "S", "S", "M", "S", "M"], ["M", "S", "S", "M", "M", "S"], ["S", "M", "M", "S", "M", "S"], ["M", "S", "M", "S", "S", "M"], ["S", "M", "S", "M", "S", "M"], ["S", "M", "M", "S", "M", "S"]]}, {"id": "tango-5", "title": "Tango Tages-Board #5", "size": 6, "givens": [[null, null, null, null, "S", null], [null, "S", null, "M", null, null], [null, null, "S", null, null, null], [null, null, null, null, null, "S"], [null, null, null, "S", null, null], [null, null, "S", null, null, null]], "hEdges": [{"r": 3, "c": 2, "op": "x"}, {"r": 0, "c": 0, "op": "="}, {"r": 2, "c": 0, "op": "="}, {"r": 4, "c": 3, "op": "="}], "vEdges": [{"r": 3, "c": 2, "op": "x"}, {"r": 4, "c": 0, "op": "x"}, {"r": 3, "c": 3, "op": "x"}], "solution": [["S", "S", "M", "M", "S", "M"], ["S", "S", "M", "M", "S", "M"], ["M", "M", "S", "S", "M", "S"], ["M", "S", "S", "M", "M", "S"], ["S", "M", "M", "S", "S", "M"], ["M", "M", "S", "S", "M", "S"]]}, {"id": "tango-6", "title": "Tango Tages-Board #6", "size": 6, "givens": [[null, null, null, null, null, "M"], [null, "S", null, null, null, null], ["M", null, null, null, null, null], [null, null, null, null, null, null], ["M", null, "S", "M", null, null], [null, null, null, null, null, "S"]], "hEdges": [{"r": 3, "c": 3, "op": "="}, {"r": 2, "c": 2, "op": "="}, {"r": 5, "c": 2, "op": "="}], "vEdges": [{"r": 0, "c": 1, "op": "="}, {"r": 3, "c": 0, "op": "x"}], "solution": [["S", "S", "M", "M", "S", "M"], ["S", "S", "M", "M", "S", "M"], ["M", "M", "S", "S", "M", "S"], ["S", "M", "M", "S", "S", "M"], ["M", "S", "S", "M", "M", "S"], ["M", "M", "S", "S", "M", "S"]]}, {"id": "tango-7", "title": "Tango Tages-Board #7", "size": 6, "givens": [[null, null, null, null, null, null], ["S", null, null, "S", null, null], [null, null, null, null, null, null], [null, null, null, null, "M", null], [null, null, null, null, null, "M"], ["M", null, null, null, "M", null]], "hEdges": [{"r": 4, "c": 1, "op": "="}, {"r": 5, "c": 2, "op": "x"}, {"r": 4, "c": 0, "op": "x"}, {"r": 1, "c": 4, "op": "="}], "vEdges": [{"r": 0, "c": 1, "op": "="}, {"r": 0, "c": 0, "op": "x"}], "solution": [["M", "M", "S", "M", "S", "S"], ["S", "M", "S", "S", "M", "M"], ["S", "S", "M", "M", "S", "M"], ["M", "S", "S", "M", "M", "S"], ["S", "M", "M", "S", "S", "M"], ["M", "S", "M", "S", "M", "S"]]}, {"id": "tango-8", "title": "Tango Tages-Board #8", "size": 6, "givens": [[null, null, "S", null, null, "S"], [null, null, "S", null, null, null], [null, null, "M", null, null, null], [null, "M", null, null, null, null], [null, null, null, null, null, null], [null, null, null, "S", null, "M"]], "hEdges": [{"r": 1, "c": 3, "op": "="}, {"r": 2, "c": 4, "op": "x"}, {"r": 2, "c": 2, "op": "="}], "vEdges": [{"r": 0, "c": 2, "op": "="}, {"r": 1, "c": 2, "op": "x"}, {"r": 4, "c": 0, "op": "="}], "solution": [["M", "M", "S", "S", "M", "S"], ["M", "S", "S", "M", "M", "S"], ["S", "S", "M", "M", "S", "M"], ["M", "M", "S", "S", "M", "S"], ["S", "S", "M", "M", "S", "M"], ["S", "M", "M", "S", "S", "M"]]}, {"id": "tango-9", "title": "Tango Tages-Board #9", "size": 6, "givens": [[null, null, null, null, null, "S"], [null, "S", null, null, null, null], [null, null, "M", null, null, null], [null, null, null, "S", null, null], ["S", null, null, null, null, null], ["M", null, null, null, null, null]], "hEdges": [{"r": 1, "c": 1, "op": "x"}, {"r": 0, "c": 1, "op": "="}, {"r": 4, "c": 3, "op": "x"}, {"r": 3, "c": 0, "op": "="}], "vEdges": [{"r": 1, "c": 4, "op": "="}, {"r": 4, "c": 2, "op": "x"}, {"r": 0, "c": 5, "op": "x"}], "solution": [["M", "S", "S", "M", "M", "S"], ["S", "S", "M", "M", "S", "M"], ["S", "M", "M", "S", "S", "M"], ["M", "M", "S", "S", "M", "S"], ["S", "S", "M", "M", "S", "M"], ["M", "M", "S", "S", "M", "S"]]}, {"id": "tango-11", "title": "Tango Tages-Board #11", "size": 6, "givens": [[null, null, null, null, null, "M"], [null, null, null, null, null, null], [null, null, null, null, null, null], ["S", null, null, null, "S", "M"], [null, null, null, null, null, null], [null, "S", null, null, null, null]], "hEdges": [{"r": 5, "c": 0, "op": "x"}, {"r": 2, "c": 2, "op": "="}, {"r": 1, "c": 2, "op": "x"}], "vEdges": [{"r": 3, "c": 5, "op": "="}, {"r": 2, "c": 2, "op": "="}, {"r": 0, "c": 4, "op": "="}], "solution": [["S", "M", "S", "S", "M", "M"], ["M", "S", "S", "M", "M", "S"], ["M", "S", "M", "M", "S", "S"], ["S", "M", "M", "S", "S", "M"], ["S", "M", "S", "S", "M", "M"], ["M", "S", "M", "M", "S", "S"]]}, {"id": "tango-12", "title": "Tango Tages-Board #12", "size": 6, "givens": [[null, null, null, null, null, null], [null, "M", null, null, null, null], [null, null, null, null, "M", null], [null, null, "M", null, null, null], [null, null, null, null, null, "S"], [null, null, "M", null, null, null]], "hEdges": [{"r": 1, "c": 1, "op": "="}, {"r": 1, "c": 0, "op": "x"}, {"r": 0, "c": 4, "op": "="}, {"r": 3, "c": 4, "op": "="}], "vEdges": [{"r": 4, "c": 0, "op": "="}, {"r": 4, "c": 2, "op": "x"}, {"r": 4, "c": 4, "op": "="}], "solution": [["S", "M", "S", "S", "M", "M"], ["S", "M", "M", "S", "S", "M"], ["M", "S", "S", "M", "M", "S"], ["S", "S", "M", "S", "M", "M"], ["M", "M", "S", "M", "S", "S"], ["M", "S", "M", "M", "S", "S"]]}, {"id": "tango-13", "title": "Tango Tages-Board #13", "size": 6, "givens": [[null, null, null, "M", null, "S"], [null, null, null, null, null, null], [null, null, null, null, null, null], ["M", null, null, null, null, null], ["S", "M", "M", null, null, null], [null, null, null, null, null, "M"]], "hEdges": [{"r": 3, "c": 4, "op": "="}, {"r": 1, "c": 2, "op": "="}, {"r": 5, "c": 4, "op": "x"}], "vEdges": [{"r": 1, "c": 4, "op": "="}, {"r": 3, "c": 1, "op": "="}, {"r": 3, "c": 5, "op": "="}], "solution": [["M", "S", "M", "M", "S", "S"], ["S", "M", "S", "S", "M", "M"], ["S", "S", "M", "S", "M", "M"], ["M", "M", "S", "M", "S", "S"], ["S", "M", "M", "S", "M", "S"], ["M", "S", "S", "M", "S", "M"]]}, {"id": "tango-13", "title": "Tango Tages-Board #13", "size": 6, "givens": [[null, null, null, null, "M", null], [null, null, null, null, null, "S"], ["S", null, "M", null, null, null], [null, null, null, null, null, "M"], [null, null, "S", "S", null, null], [null, null, "M", null, null, null]], "hEdges": [{"r": 3, "c": 2, "op": "="}, {"r": 4, "c": 2, "op": "="}, {"r": 5, "c": 1, "op": "x"}, {"r": 3, "c": 3, "op": "x"}, {"r": 5, "c": 0, "op": "="}], "vEdges": [{"r": 1, "c": 5, "op": "x"}, {"r": 2, "c": 2, "op": "="}, {"r": 0, "c": 3, "op": "x"}, {"r": 1, "c": 3, "op": "="}], "solution": [["M", "S", "S", "M", "M", "S"], ["M", "M", "S", "S", "M", "S"], ["S", "M", "M", "S", "S", "M"], ["S", "S", "M", "M", "S", "M"], ["M", "M", "S", "S", "M", "S"], ["S", "S", "M", "M", "S", "M"]]}, {"id": "tango-14", "title": "Tango Tages-Board #14", "size": 6, "givens": [[null, null, null, null, null, null], [null, null, null, null, null, null], [null, "S", null, "M", null, null], [null, null, null, null, null, null], [null, "M", "S", null, null, null], [null, "S", "S", null, null, null]], "hEdges": [{"r": 5, "c": 1, "op": "="}, {"r": 5, "c": 3, "op": "="}, {"r": 3, "c": 2, "op": "="}, {"r": 0, "c": 4, "op": "x"}, {"r": 4, "c": 4, "op": "="}], "vEdges": [{"r": 2, "c": 2, "op": "x"}, {"r": 3, "c": 4, "op": "x"}, {"r": 1, "c": 2, "op": "x"}, {"r": 0, "c": 4, "op": "="}], "solution": [["S", "M", "M", "S", "S", "M"], ["S", "M", "M", "S", "S", "M"], ["M", "S", "S", "M", "M", "S"], ["M", "S", "M", "M", "S", "S"], ["S", "M", "S", "S", "M", "M"], ["M", "S", "S", "M", "M", "S"]]}];

      this.pinpointData = [{"id": "pinpoint-1", "title": "Pinpoint #1", "category": "Schachfiguren", "clues": ["Turm", "Springer", "Läufer", "Dame", "König"], "keywords": ["schachfiguren", "schach", "figuren beim schach", "schach figuren", "schachspiel"]}, {"id": "pinpoint-2", "title": "Pinpoint #2", "category": "Kaffeespezialitäten", "clues": ["Espresso", "Cappuccino", "Flat White", "Latte Macchiato", "Americano"], "keywords": ["kaffee", "kaffeespezialitäten", "kaffeearten", "kaffeegetränke", "kaffeesorten"]}, {"id": "pinpoint-3", "title": "Pinpoint #3", "category": "Dinge mit Tasten", "clues": ["Taschenrechner", "Klavier", "Fernbedienung", "Tastatur", "Geldautomat"], "keywords": ["tasten", "dinge mit tasten", "geräte mit tasten", "hat tasten", "tasteninstrumente und geräte"]}, {"id": "pinpoint-4", "title": "Pinpoint #4", "category": "Web-Browser", "clues": ["Safari", "Firefox", "Opera", "Edge", "Chrome"], "keywords": ["browser", "webbrowser", "web browser", "internet browser"]}, {"id": "pinpoint-5", "title": "Pinpoint #5", "category": "Hauptstädte in Europa", "clues": ["Lissabon", "Madrid", "Rom", "Wien", "Berlin"], "keywords": ["hauptstädte", "hauptstädte europas", "europäische hauptstädte", "europäische städte", "hauptstadt"]}, {"id": "pinpoint-6", "title": "Pinpoint #6", "category": "Programmiersprachen", "clues": ["Rust", "Go", "Ruby", "Python", "JavaScript"], "keywords": ["programmiersprachen", "coding", "programmiersprache", "code sprachen", "sprachen"]}, {"id": "pinpoint-7", "title": "Pinpoint #7", "category": "Planeten unseres Sonnensystems", "clues": ["Merkur", "Venus", "Mars", "Jupiter", "Saturn"], "keywords": ["planeten", "sonnensystem", "unser sonnensystem", "planeten unseres sonnensystems"]}, {"id": "pinpoint-8", "title": "Pinpoint #8", "category": "Musikinstrumente im Orchester", "clues": ["Fagott", "Oboe", "Bratsche", "Cello", "Querflöte"], "keywords": ["orchester", "musikinstrumente", "instrumente", "orchesterinstrumente"]}, {"id": "pinpoint-9", "title": "Pinpoint #9", "category": "Zutaten für Pizzateig", "clues": ["Hefe", "Olivenöl", "Salz", "Wasser", "Mehl"], "keywords": ["pizza", "pizzateig", "zutaten pizzateig", "teig zutaten", "pizzateig zutaten"]}, {"id": "pinpoint-10", "title": "Pinpoint #10", "category": "Edelmetalle", "clues": ["Platin", "Palladium", "Rhodium", "Silber", "Gold"], "keywords": ["edelmetalle", "edelmetall", "wertvolle metalle", "metalle"]}, {"id": "pinpoint-11", "title": "Pinpoint #11", "category": "Deutsche Bundesländer", "clues": ["Saarland", "Hessen", "Sachsen", "Bayern", "Nordrhein-Westfalen"], "keywords": ["bundesländer", "deutsche bundesländer", "länder deutschlands", "bundesland"]}, {"id": "pinpoint-12", "title": "Pinpoint #12", "category": "Video- und Daten-Schnittstellen", "clues": ["VGA", "DVI", "DisplayPort", "HDMI", "USB-C"], "keywords": ["anschlüsse", "schnittstellen", "kabel", "videoanschlüsse", "stecker"]}, {"id": "pinpoint-13", "title": "Pinpoint #13", "category": "Welt-Währungen", "clues": ["Yen", "Pfund", "Franken", "Dollar", "Euro"], "keywords": ["währungen", "währung", "geld", "währungseinheiten", "devisen"]}, {"id": "pinpoint-14", "title": "Pinpoint #14", "category": "Bekannte Social-Media-Netzwerke", "clues": ["Reddit", "Pinterest", "X", "Instagram", "LinkedIn"], "keywords": ["social media", "soziale netzwerke", "soziale medien", "netzwerke", "social network"]}];

      this.activeGameMode = 'queens';



      // Queens State

      this.queensCurrentLevel = localStorage.getItem('orbitsuite_queens_current_level') || '1';

      this.queensUserGrid = Array(6).fill(null).map(() => Array(6).fill(null));

      this.queensHistory = [];

      this.queensMoves = 0;

      this.queensTime = 0;

      this.queensTimerInterval = null;
      this.queensTimerStarted = false;
      this.queensAutoXEnabled = true;
      this.queensManualX = new Set();



      // Tango State

      this.tangoCurrentLevel = localStorage.getItem('orbitsuite_tango_current_level') || '1';

      this.tangoUserGrid = Array(6).fill(null).map(() => Array(6).fill(null));

      this.tangoTime = 0;

      this.tangoTimerInterval = null;
      this.tangoTimerStarted = false;



      // Pinpoint State

      this.pinpointCurrentLevel = localStorage.getItem('orbitsuite_pinpoint_current_level') || '1';

      this.pinpointRevealedClues = 1;

      this.pinpointAttemptsLeft = 5;

      this.pinpointIsSolved = false;
      this.crossclimbData = [{"id": "crossclimb-1", "title": "Crossclimb #1: Kalt bis Bild", "words": ["KALT", "WALT", "WALD", "WILD", "BILD"], "clues": ["Niedrige Temperatur, Gegenteil von warm", "Vorname des berühmten Micky-Maus-Erfinders Disney", "Ort voller Bäume, Moos und Waldtieren", "In freier Natur lebend, nicht zahm", "Gemälde, Foto oder grafische Abbildung"]}, {"id": "crossclimb-2", "title": "Crossclimb #2: Sand bis Rind", "words": ["SAND", "HAND", "HUND", "RUND", "RIND"], "clues": ["Feinkörniges Gestein an Meeresstränden und in Wüsten", "Körperteil am Ende des Arms mit fünf Fingern", "Der treueste vierbeinige Freund des Menschen", "Geometrische Kreis- oder Kugelform ohne Ecken", "Großes Nutztier auf der Weide, das Milch gibt"]}, {"id": "crossclimb-3", "title": "Crossclimb #3: Boot bis Pest", "words": ["BOOT", "ROOT", "ROST", "POST", "PEST"], "clues": ["Kleines Wasserfahrzeug zum Rudern oder Segeln", "Höchste Administrator-Rechte in Unix/Linux-Systemen", "Rötlich-braunes Oxidationsprodukt auf feuchtem Eisen", "Briefe, Pakete oder die zuständige Zustellorganisation", "Historische europäische Seuche im finsteren Mittelalter"]}, {"id": "crossclimb-4", "title": "Crossclimb #4: Gold bis Helm", "words": ["GOLD", "GELD", "FELD", "HELD", "HELM"], "clues": ["Glänzendes gelbes Edelmetall mit hoher Dichte", "Gesetzliches Zahlungsmittel in Form von Münzen und Scheinen", "Große landwirtschaftliche Ackerfläche für Weizen oder Mais", "Mutige Hauptfigur in Geschichten, die andere rettet", "Fester Schutz für den Kopf beim Fahrrad- oder Skifahren"]}, {"id": "crossclimb-5", "title": "Crossclimb #5: Wind bis Dank", "words": ["WIND", "WAND", "BAND", "BANK", "DANK"], "clues": ["Spürbare Luftbewegung in der Atmosphäre", "Vertikale gemauerte Begrenzung eines Zimmers", "Gruppe von Musikern oder ein flexibles Stoffband", "Sitzgelegenheit im Park oder Institut für Finanzen", "Ausdruck der Anerkennung und Verbundenheit"]}, {"id": "crossclimb-6", "title": "Crossclimb #6: Ball bis Helm", "words": ["BALL", "FALL", "FELL", "HELL", "HELM"], "clues": ["Rundes Sportgerät zum Kicken, Werfen oder Schlagen", "Das Herabgleiten nach unten oder ein kniffliger Kriminalfall", "Dichtes Haarkleid von Säugetieren wie Füchsen oder Bären", "Voller Licht, das Gegenteil von finster", "Kopfbedeckung zum Schutz auf Baustellen"]}, {"id": "crossclimb-7", "title": "Crossclimb #7: Kind bis Bunt", "words": ["KIND", "RIND", "RUND", "BUND", "BUNT"], "clues": ["Junger Mensch in den ersten Lebensjahren", "Wiederkäuer mit Hörnern auf der Alm", "Kreisförmig geschwungen ohne Kanten", "Zusammenschluss, Föderation oder Hosenbund", "Farbenfroh mit vielen leuchtenden Tönen"]}, {"id": "crossclimb-8", "title": "Crossclimb #8: Haus bis Fahl", "words": ["HAUS", "MAUS", "MAUL", "FAUL", "FAHL"], "clues": ["Festes Gebäude mit Dach zum Wohnen", "Kleines Nagetier mit langem Schwanz oder PC-Zeiger", "Mundöffnung von Raubtieren oder Hunden", "Träge ohne Antrieb, das Gegenteil von fleißig", "Blass, kraftlos oder von fahlem Mondlicht erhellt"]}, {"id": "crossclimb-9", "title": "Crossclimb #9: Zeit bis Wort", "words": ["ZEIT", "ZELT", "WELT", "WERT", "WORT"], "clues": ["Fortlaufende Dimension aus Vergangenheit, Gegenwart und Zukunft", "Tragbare Stoffunterkunft zum Campen in der Natur", "Unser Planet Erde mit allen Kontinenten und Meeren", "Kostbarkeit, Bedeutung oder bezifferter Preis", "Sinnhafte sprachliche Einheit aus mehreren Buchstaben"]}, {"id": "crossclimb-10", "title": "Crossclimb #10: Buch bis Nach", "words": ["BUCH", "BACH", "DACH", "FACH", "NACH"], "clues": ["Gebundenes Werk mit beschriebenen oder bedruckten Seiten", "Natürlicher kleiner Wasserlauf im Gebirge oder Wald", "Oberste schützende Abdeckung eines Gebäudes gegen Regen", "Unterrichtsgebiet in der Schule oder Ablagefach im Schrank", "Zeitlich oder räumlich folgend, Gegenteil von vor"]}, {"id": "crossclimb-11", "title": "Crossclimb #11: Meer bis Hier", "words": ["MEER", "HEER", "TEER", "TIER", "HIER"], "clues": ["Riesige Salzwassermasse der Weltmeere", "Große militärische Truppe von Soldaten zu Lande", "Zähflüssiger schwarzer Stoff für den Straßenbau", "Lebewesen mit eigenem Bewusstsein und Instinkten", "Genau an diesem gegenwärtigen Standort"]}, {"id": "crossclimb-12", "title": "Crossclimb #12: Torf bis Born", "words": ["TORF", "DORF", "DORN", "KORN", "BORN"], "clues": ["Brennbares getrocknetes Moormaterial", "Ländliche Siedlungsgemeinschaft, kleiner als eine Stadt", "Spitzer stechender Auswuchs am Stängel einer Rose", "Reife Samenkörner von Getreide auf dem Halm", "Poetisches altes Wort für eine sprudelnde Quelle"]}, {"id": "crossclimb-13", "title": "Crossclimb #13: Wein bis Fern", "words": ["WEIN", "BEIN", "DEIN", "FEIN", "FERN"], "clues": ["Fermentiertes alkoholisches Getränk aus Weintrauben", "Gliedmaße zum Stehen, Gehen und Laufen", "Possessivpronomen der zweiten Person Singular", "Zart, elegant, hochwertig oder von feiner Struktur", "In weiter Distanz am fernen Horizont"]}, {"id": "crossclimb-14", "title": "Crossclimb #14: Luft bis Rest", "words": ["LUFT", "LUST", "LAST", "RAST", "REST"], "clues": ["Unsichtbares Gasgemisch aus Stickstoff und Sauerstoff zum Atmen", "Innere Freude, Verlangen und Begeisterung", "Schweres Gewicht, das getragen werden muss", "Erholsame Pause während einer anstrengenden Wanderung", "Der verbleibende Teil, der am Schluss noch übrig ist"]}];
      this.zipData = [{"id": "zip-1", "title": "Zip Tages-Pfad #1", "size": 5, "maxCheckpoint": 7, "checkpoints": {"3,1": {"num": 1, "requiredStep": 1}, "4,2": {"num": 2, "requiredStep": 5}, "2,4": {"num": 3, "requiredStep": 9}, "0,2": {"num": 4, "requiredStep": 13}, "2,0": {"num": 5, "requiredStep": 17}, "1,3": {"num": 6, "requiredStep": 21}, "2,2": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 3, "c": 1, "step": 1}, {"r": 3, "c": 0, "step": 2}, {"r": 4, "c": 0, "step": 3}, {"r": 4, "c": 1, "step": 4}, {"r": 4, "c": 2, "step": 5}, {"r": 4, "c": 3, "step": 6}, {"r": 4, "c": 4, "step": 7}, {"r": 3, "c": 4, "step": 8}, {"r": 2, "c": 4, "step": 9}, {"r": 1, "c": 4, "step": 10}, {"r": 0, "c": 4, "step": 11}, {"r": 0, "c": 3, "step": 12}, {"r": 0, "c": 2, "step": 13}, {"r": 0, "c": 1, "step": 14}, {"r": 0, "c": 0, "step": 15}, {"r": 1, "c": 0, "step": 16}, {"r": 2, "c": 0, "step": 17}, {"r": 2, "c": 1, "step": 18}, {"r": 1, "c": 1, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 1, "c": 3, "step": 21}, {"r": 2, "c": 3, "step": 22}, {"r": 3, "c": 3, "step": 23}, {"r": 3, "c": 2, "step": 24}, {"r": 2, "c": 2, "step": 25}]}, {"id": "zip-2", "title": "Zip Tages-Pfad #2", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,0": {"num": 1, "requiredStep": 1}, "1,1": {"num": 2, "requiredStep": 5}, "0,2": {"num": 3, "requiredStep": 9}, "1,3": {"num": 4, "requiredStep": 13}, "4,4": {"num": 5, "requiredStep": 17}, "4,2": {"num": 6, "requiredStep": 21}, "4,0": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 0, "step": 1}, {"r": 1, "c": 0, "step": 2}, {"r": 0, "c": 0, "step": 3}, {"r": 0, "c": 1, "step": 4}, {"r": 1, "c": 1, "step": 5}, {"r": 2, "c": 1, "step": 6}, {"r": 2, "c": 2, "step": 7}, {"r": 1, "c": 2, "step": 8}, {"r": 0, "c": 2, "step": 9}, {"r": 0, "c": 3, "step": 10}, {"r": 0, "c": 4, "step": 11}, {"r": 1, "c": 4, "step": 12}, {"r": 1, "c": 3, "step": 13}, {"r": 2, "c": 3, "step": 14}, {"r": 2, "c": 4, "step": 15}, {"r": 3, "c": 4, "step": 16}, {"r": 4, "c": 4, "step": 17}, {"r": 4, "c": 3, "step": 18}, {"r": 3, "c": 3, "step": 19}, {"r": 3, "c": 2, "step": 20}, {"r": 4, "c": 2, "step": 21}, {"r": 4, "c": 1, "step": 22}, {"r": 3, "c": 1, "step": 23}, {"r": 3, "c": 0, "step": 24}, {"r": 4, "c": 0, "step": 25}]}, {"id": "zip-3", "title": "Zip Tages-Pfad #3", "size": 5, "maxCheckpoint": 7, "checkpoints": {"0,0": {"num": 1, "requiredStep": 1}, "4,0": {"num": 2, "requiredStep": 5}, "1,1": {"num": 3, "requiredStep": 9}, "2,2": {"num": 4, "requiredStep": 13}, "4,4": {"num": 5, "requiredStep": 17}, "2,4": {"num": 6, "requiredStep": 21}, "0,4": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 0, "c": 0, "step": 1}, {"r": 1, "c": 0, "step": 2}, {"r": 2, "c": 0, "step": 3}, {"r": 3, "c": 0, "step": 4}, {"r": 4, "c": 0, "step": 5}, {"r": 4, "c": 1, "step": 6}, {"r": 3, "c": 1, "step": 7}, {"r": 2, "c": 1, "step": 8}, {"r": 1, "c": 1, "step": 9}, {"r": 0, "c": 1, "step": 10}, {"r": 0, "c": 2, "step": 11}, {"r": 1, "c": 2, "step": 12}, {"r": 2, "c": 2, "step": 13}, {"r": 3, "c": 2, "step": 14}, {"r": 4, "c": 2, "step": 15}, {"r": 4, "c": 3, "step": 16}, {"r": 4, "c": 4, "step": 17}, {"r": 3, "c": 4, "step": 18}, {"r": 3, "c": 3, "step": 19}, {"r": 2, "c": 3, "step": 20}, {"r": 2, "c": 4, "step": 21}, {"r": 1, "c": 4, "step": 22}, {"r": 1, "c": 3, "step": 23}, {"r": 0, "c": 3, "step": 24}, {"r": 0, "c": 4, "step": 25}]}, {"id": "zip-4", "title": "Zip Tages-Pfad #4", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,0": {"num": 1, "requiredStep": 1}, "1,1": {"num": 2, "requiredStep": 5}, "4,0": {"num": 3, "requiredStep": 9}, "4,4": {"num": 4, "requiredStep": 13}, "2,2": {"num": 5, "requiredStep": 17}, "0,4": {"num": 6, "requiredStep": 21}, "1,3": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 0, "step": 1}, {"r": 1, "c": 0, "step": 2}, {"r": 0, "c": 0, "step": 3}, {"r": 0, "c": 1, "step": 4}, {"r": 1, "c": 1, "step": 5}, {"r": 2, "c": 1, "step": 6}, {"r": 3, "c": 1, "step": 7}, {"r": 3, "c": 0, "step": 8}, {"r": 4, "c": 0, "step": 9}, {"r": 4, "c": 1, "step": 10}, {"r": 4, "c": 2, "step": 11}, {"r": 4, "c": 3, "step": 12}, {"r": 4, "c": 4, "step": 13}, {"r": 3, "c": 4, "step": 14}, {"r": 3, "c": 3, "step": 15}, {"r": 3, "c": 2, "step": 16}, {"r": 2, "c": 2, "step": 17}, {"r": 1, "c": 2, "step": 18}, {"r": 0, "c": 2, "step": 19}, {"r": 0, "c": 3, "step": 20}, {"r": 0, "c": 4, "step": 21}, {"r": 1, "c": 4, "step": 22}, {"r": 2, "c": 4, "step": 23}, {"r": 2, "c": 3, "step": 24}, {"r": 1, "c": 3, "step": 25}]}, {"id": "zip-5", "title": "Zip Tages-Pfad #5", "size": 5, "maxCheckpoint": 7, "checkpoints": {"3,3": {"num": 1, "requiredStep": 1}, "4,2": {"num": 2, "requiredStep": 5}, "2,4": {"num": 3, "requiredStep": 9}, "1,3": {"num": 4, "requiredStep": 13}, "0,0": {"num": 5, "requiredStep": 17}, "2,0": {"num": 6, "requiredStep": 21}, "3,1": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 3, "c": 3, "step": 1}, {"r": 3, "c": 4, "step": 2}, {"r": 4, "c": 4, "step": 3}, {"r": 4, "c": 3, "step": 4}, {"r": 4, "c": 2, "step": 5}, {"r": 3, "c": 2, "step": 6}, {"r": 2, "c": 2, "step": 7}, {"r": 2, "c": 3, "step": 8}, {"r": 2, "c": 4, "step": 9}, {"r": 1, "c": 4, "step": 10}, {"r": 0, "c": 4, "step": 11}, {"r": 0, "c": 3, "step": 12}, {"r": 1, "c": 3, "step": 13}, {"r": 1, "c": 2, "step": 14}, {"r": 0, "c": 2, "step": 15}, {"r": 0, "c": 1, "step": 16}, {"r": 0, "c": 0, "step": 17}, {"r": 1, "c": 0, "step": 18}, {"r": 1, "c": 1, "step": 19}, {"r": 2, "c": 1, "step": 20}, {"r": 2, "c": 0, "step": 21}, {"r": 3, "c": 0, "step": 22}, {"r": 4, "c": 0, "step": 23}, {"r": 4, "c": 1, "step": 24}, {"r": 3, "c": 1, "step": 25}]}, {"id": "zip-6", "title": "Zip Tages-Pfad #6", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,2": {"num": 1, "requiredStep": 1}, "0,0": {"num": 2, "requiredStep": 5}, "0,2": {"num": 3, "requiredStep": 9}, "1,3": {"num": 4, "requiredStep": 13}, "4,4": {"num": 5, "requiredStep": 17}, "4,2": {"num": 6, "requiredStep": 21}, "3,1": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 2, "step": 1}, {"r": 2, "c": 1, "step": 2}, {"r": 2, "c": 0, "step": 3}, {"r": 1, "c": 0, "step": 4}, {"r": 0, "c": 0, "step": 5}, {"r": 0, "c": 1, "step": 6}, {"r": 1, "c": 1, "step": 7}, {"r": 1, "c": 2, "step": 8}, {"r": 0, "c": 2, "step": 9}, {"r": 0, "c": 3, "step": 10}, {"r": 0, "c": 4, "step": 11}, {"r": 1, "c": 4, "step": 12}, {"r": 1, "c": 3, "step": 13}, {"r": 2, "c": 3, "step": 14}, {"r": 2, "c": 4, "step": 15}, {"r": 3, "c": 4, "step": 16}, {"r": 4, "c": 4, "step": 17}, {"r": 4, "c": 3, "step": 18}, {"r": 3, "c": 3, "step": 19}, {"r": 3, "c": 2, "step": 20}, {"r": 4, "c": 2, "step": 21}, {"r": 4, "c": 1, "step": 22}, {"r": 4, "c": 0, "step": 23}, {"r": 3, "c": 0, "step": 24}, {"r": 3, "c": 1, "step": 25}]}, {"id": "zip-7", "title": "Zip Tages-Pfad #7", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,2": {"num": 1, "requiredStep": 1}, "4,0": {"num": 2, "requiredStep": 5}, "4,2": {"num": 3, "requiredStep": 9}, "3,3": {"num": 4, "requiredStep": 13}, "0,4": {"num": 5, "requiredStep": 17}, "0,2": {"num": 6, "requiredStep": 21}, "1,1": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 2, "step": 1}, {"r": 2, "c": 1, "step": 2}, {"r": 2, "c": 0, "step": 3}, {"r": 3, "c": 0, "step": 4}, {"r": 4, "c": 0, "step": 5}, {"r": 4, "c": 1, "step": 6}, {"r": 3, "c": 1, "step": 7}, {"r": 3, "c": 2, "step": 8}, {"r": 4, "c": 2, "step": 9}, {"r": 4, "c": 3, "step": 10}, {"r": 4, "c": 4, "step": 11}, {"r": 3, "c": 4, "step": 12}, {"r": 3, "c": 3, "step": 13}, {"r": 2, "c": 3, "step": 14}, {"r": 2, "c": 4, "step": 15}, {"r": 1, "c": 4, "step": 16}, {"r": 0, "c": 4, "step": 17}, {"r": 0, "c": 3, "step": 18}, {"r": 1, "c": 3, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 0, "c": 2, "step": 21}, {"r": 0, "c": 1, "step": 22}, {"r": 0, "c": 0, "step": 23}, {"r": 1, "c": 0, "step": 24}, {"r": 1, "c": 1, "step": 25}]}, {"id": "zip-8", "title": "Zip Tages-Pfad #8", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,0": {"num": 1, "requiredStep": 1}, "3,1": {"num": 2, "requiredStep": 5}, "4,2": {"num": 3, "requiredStep": 9}, "3,3": {"num": 4, "requiredStep": 13}, "0,4": {"num": 5, "requiredStep": 17}, "0,2": {"num": 6, "requiredStep": 21}, "1,1": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 0, "step": 1}, {"r": 3, "c": 0, "step": 2}, {"r": 4, "c": 0, "step": 3}, {"r": 4, "c": 1, "step": 4}, {"r": 3, "c": 1, "step": 5}, {"r": 2, "c": 1, "step": 6}, {"r": 2, "c": 2, "step": 7}, {"r": 3, "c": 2, "step": 8}, {"r": 4, "c": 2, "step": 9}, {"r": 4, "c": 3, "step": 10}, {"r": 4, "c": 4, "step": 11}, {"r": 3, "c": 4, "step": 12}, {"r": 3, "c": 3, "step": 13}, {"r": 2, "c": 3, "step": 14}, {"r": 2, "c": 4, "step": 15}, {"r": 1, "c": 4, "step": 16}, {"r": 0, "c": 4, "step": 17}, {"r": 0, "c": 3, "step": 18}, {"r": 1, "c": 3, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 0, "c": 2, "step": 21}, {"r": 0, "c": 1, "step": 22}, {"r": 0, "c": 0, "step": 23}, {"r": 1, "c": 0, "step": 24}, {"r": 1, "c": 1, "step": 25}]}, {"id": "zip-9", "title": "Zip Tages-Pfad #9", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,2": {"num": 1, "requiredStep": 1}, "4,4": {"num": 2, "requiredStep": 5}, "4,2": {"num": 3, "requiredStep": 9}, "3,1": {"num": 4, "requiredStep": 13}, "0,0": {"num": 5, "requiredStep": 17}, "0,2": {"num": 6, "requiredStep": 21}, "0,4": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 2, "step": 1}, {"r": 2, "c": 3, "step": 2}, {"r": 2, "c": 4, "step": 3}, {"r": 3, "c": 4, "step": 4}, {"r": 4, "c": 4, "step": 5}, {"r": 4, "c": 3, "step": 6}, {"r": 3, "c": 3, "step": 7}, {"r": 3, "c": 2, "step": 8}, {"r": 4, "c": 2, "step": 9}, {"r": 4, "c": 1, "step": 10}, {"r": 4, "c": 0, "step": 11}, {"r": 3, "c": 0, "step": 12}, {"r": 3, "c": 1, "step": 13}, {"r": 2, "c": 1, "step": 14}, {"r": 2, "c": 0, "step": 15}, {"r": 1, "c": 0, "step": 16}, {"r": 0, "c": 0, "step": 17}, {"r": 0, "c": 1, "step": 18}, {"r": 1, "c": 1, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 0, "c": 2, "step": 21}, {"r": 0, "c": 3, "step": 22}, {"r": 1, "c": 3, "step": 23}, {"r": 1, "c": 4, "step": 24}, {"r": 0, "c": 4, "step": 25}]}, {"id": "zip-10", "title": "Zip Tages-Pfad #10", "size": 5, "maxCheckpoint": 7, "checkpoints": {"3,3": {"num": 1, "requiredStep": 1}, "4,2": {"num": 2, "requiredStep": 5}, "3,1": {"num": 3, "requiredStep": 9}, "2,0": {"num": 4, "requiredStep": 13}, "1,1": {"num": 5, "requiredStep": 17}, "0,4": {"num": 6, "requiredStep": 21}, "2,4": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 3, "c": 3, "step": 1}, {"r": 3, "c": 4, "step": 2}, {"r": 4, "c": 4, "step": 3}, {"r": 4, "c": 3, "step": 4}, {"r": 4, "c": 2, "step": 5}, {"r": 4, "c": 1, "step": 6}, {"r": 4, "c": 0, "step": 7}, {"r": 3, "c": 0, "step": 8}, {"r": 3, "c": 1, "step": 9}, {"r": 3, "c": 2, "step": 10}, {"r": 2, "c": 2, "step": 11}, {"r": 2, "c": 1, "step": 12}, {"r": 2, "c": 0, "step": 13}, {"r": 1, "c": 0, "step": 14}, {"r": 0, "c": 0, "step": 15}, {"r": 0, "c": 1, "step": 16}, {"r": 1, "c": 1, "step": 17}, {"r": 1, "c": 2, "step": 18}, {"r": 0, "c": 2, "step": 19}, {"r": 0, "c": 3, "step": 20}, {"r": 0, "c": 4, "step": 21}, {"r": 1, "c": 4, "step": 22}, {"r": 1, "c": 3, "step": 23}, {"r": 2, "c": 3, "step": 24}, {"r": 2, "c": 4, "step": 25}]}, {"id": "zip-11", "title": "Zip Tages-Pfad #11", "size": 5, "maxCheckpoint": 7, "checkpoints": {"4,4": {"num": 1, "requiredStep": 1}, "0,4": {"num": 2, "requiredStep": 5}, "0,0": {"num": 3, "requiredStep": 9}, "4,0": {"num": 4, "requiredStep": 13}, "3,3": {"num": 5, "requiredStep": 17}, "1,1": {"num": 6, "requiredStep": 21}, "3,1": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 4, "c": 4, "step": 1}, {"r": 3, "c": 4, "step": 2}, {"r": 2, "c": 4, "step": 3}, {"r": 1, "c": 4, "step": 4}, {"r": 0, "c": 4, "step": 5}, {"r": 0, "c": 3, "step": 6}, {"r": 0, "c": 2, "step": 7}, {"r": 0, "c": 1, "step": 8}, {"r": 0, "c": 0, "step": 9}, {"r": 1, "c": 0, "step": 10}, {"r": 2, "c": 0, "step": 11}, {"r": 3, "c": 0, "step": 12}, {"r": 4, "c": 0, "step": 13}, {"r": 4, "c": 1, "step": 14}, {"r": 4, "c": 2, "step": 15}, {"r": 4, "c": 3, "step": 16}, {"r": 3, "c": 3, "step": 17}, {"r": 2, "c": 3, "step": 18}, {"r": 1, "c": 3, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 1, "c": 1, "step": 21}, {"r": 2, "c": 1, "step": 22}, {"r": 2, "c": 2, "step": 23}, {"r": 3, "c": 2, "step": 24}, {"r": 3, "c": 1, "step": 25}]}, {"id": "zip-12", "title": "Zip Tages-Pfad #12", "size": 5, "maxCheckpoint": 7, "checkpoints": {"3,3": {"num": 1, "requiredStep": 1}, "4,2": {"num": 2, "requiredStep": 5}, "4,0": {"num": 3, "requiredStep": 9}, "2,2": {"num": 4, "requiredStep": 13}, "0,4": {"num": 5, "requiredStep": 17}, "0,2": {"num": 6, "requiredStep": 21}, "1,1": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 3, "c": 3, "step": 1}, {"r": 3, "c": 4, "step": 2}, {"r": 4, "c": 4, "step": 3}, {"r": 4, "c": 3, "step": 4}, {"r": 4, "c": 2, "step": 5}, {"r": 3, "c": 2, "step": 6}, {"r": 3, "c": 1, "step": 7}, {"r": 4, "c": 1, "step": 8}, {"r": 4, "c": 0, "step": 9}, {"r": 3, "c": 0, "step": 10}, {"r": 2, "c": 0, "step": 11}, {"r": 2, "c": 1, "step": 12}, {"r": 2, "c": 2, "step": 13}, {"r": 2, "c": 3, "step": 14}, {"r": 2, "c": 4, "step": 15}, {"r": 1, "c": 4, "step": 16}, {"r": 0, "c": 4, "step": 17}, {"r": 0, "c": 3, "step": 18}, {"r": 1, "c": 3, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 0, "c": 2, "step": 21}, {"r": 0, "c": 1, "step": 22}, {"r": 0, "c": 0, "step": 23}, {"r": 1, "c": 0, "step": 24}, {"r": 1, "c": 1, "step": 25}]}, {"id": "zip-13", "title": "Zip Tages-Pfad #13", "size": 5, "maxCheckpoint": 7, "checkpoints": {"1,1": {"num": 1, "requiredStep": 1}, "2,0": {"num": 2, "requiredStep": 5}, "3,1": {"num": 3, "requiredStep": 9}, "0,2": {"num": 4, "requiredStep": 13}, "1,3": {"num": 5, "requiredStep": 17}, "4,4": {"num": 6, "requiredStep": 21}, "3,3": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 1, "c": 1, "step": 1}, {"r": 0, "c": 1, "step": 2}, {"r": 0, "c": 0, "step": 3}, {"r": 1, "c": 0, "step": 4}, {"r": 2, "c": 0, "step": 5}, {"r": 3, "c": 0, "step": 6}, {"r": 4, "c": 0, "step": 7}, {"r": 4, "c": 1, "step": 8}, {"r": 3, "c": 1, "step": 9}, {"r": 2, "c": 1, "step": 10}, {"r": 2, "c": 2, "step": 11}, {"r": 1, "c": 2, "step": 12}, {"r": 0, "c": 2, "step": 13}, {"r": 0, "c": 3, "step": 14}, {"r": 0, "c": 4, "step": 15}, {"r": 1, "c": 4, "step": 16}, {"r": 1, "c": 3, "step": 17}, {"r": 2, "c": 3, "step": 18}, {"r": 2, "c": 4, "step": 19}, {"r": 3, "c": 4, "step": 20}, {"r": 4, "c": 4, "step": 21}, {"r": 4, "c": 3, "step": 22}, {"r": 4, "c": 2, "step": 23}, {"r": 3, "c": 2, "step": 24}, {"r": 3, "c": 3, "step": 25}]}, {"id": "zip-14", "title": "Zip Tages-Pfad #14", "size": 5, "maxCheckpoint": 7, "checkpoints": {"2,4": {"num": 1, "requiredStep": 1}, "3,3": {"num": 2, "requiredStep": 5}, "4,2": {"num": 3, "requiredStep": 9}, "3,1": {"num": 4, "requiredStep": 13}, "0,0": {"num": 5, "requiredStep": 17}, "0,2": {"num": 6, "requiredStep": 21}, "1,3": {"num": 7, "requiredStep": 25}}, "pathSolution": [{"r": 2, "c": 4, "step": 1}, {"r": 3, "c": 4, "step": 2}, {"r": 4, "c": 4, "step": 3}, {"r": 4, "c": 3, "step": 4}, {"r": 3, "c": 3, "step": 5}, {"r": 2, "c": 3, "step": 6}, {"r": 2, "c": 2, "step": 7}, {"r": 3, "c": 2, "step": 8}, {"r": 4, "c": 2, "step": 9}, {"r": 4, "c": 1, "step": 10}, {"r": 4, "c": 0, "step": 11}, {"r": 3, "c": 0, "step": 12}, {"r": 3, "c": 1, "step": 13}, {"r": 2, "c": 1, "step": 14}, {"r": 2, "c": 0, "step": 15}, {"r": 1, "c": 0, "step": 16}, {"r": 0, "c": 0, "step": 17}, {"r": 0, "c": 1, "step": 18}, {"r": 1, "c": 1, "step": 19}, {"r": 1, "c": 2, "step": 20}, {"r": 0, "c": 2, "step": 21}, {"r": 0, "c": 3, "step": 22}, {"r": 0, "c": 4, "step": 23}, {"r": 1, "c": 4, "step": 24}, {"r": 1, "c": 3, "step": 25}]}];
      this.sudokuData = [{"id": "sudoku-1", "title": "Mini Sudoku #1", "givens": [[0, 2, 0, 5, 6, 0], [0, 5, 1, 3, 0, 2], [0, 6, 0, 1, 3, 4], [0, 0, 3, 0, 0, 5], [5, 0, 0, 0, 0, 0], [0, 1, 6, 0, 0, 0]], "solution": [[3, 2, 4, 5, 6, 1], [6, 5, 1, 3, 4, 2], [2, 6, 5, 1, 3, 4], [1, 4, 3, 6, 2, 5], [5, 3, 2, 4, 1, 6], [4, 1, 6, 2, 5, 3]]}, {"id": "sudoku-2", "title": "Mini Sudoku #2", "givens": [[3, 0, 0, 1, 0, 2], [0, 5, 0, 0, 4, 0], [0, 0, 0, 2, 0, 0], [0, 3, 0, 5, 0, 6], [4, 2, 0, 3, 6, 1], [0, 0, 3, 4, 0, 0]], "solution": [[3, 4, 6, 1, 5, 2], [1, 5, 2, 6, 4, 3], [5, 6, 1, 2, 3, 4], [2, 3, 4, 5, 1, 6], [4, 2, 5, 3, 6, 1], [6, 1, 3, 4, 2, 5]]}, {"id": "sudoku-3", "title": "Mini Sudoku #3", "givens": [[0, 4, 0, 0, 0, 5], [0, 5, 0, 0, 0, 0], [0, 0, 3, 0, 5, 6], [0, 6, 0, 4, 0, 1], [1, 0, 4, 0, 6, 0], [6, 3, 5, 0, 0, 4]], "solution": [[2, 4, 6, 3, 1, 5], [3, 5, 1, 6, 4, 2], [4, 1, 3, 2, 5, 6], [5, 6, 2, 4, 3, 1], [1, 2, 4, 5, 6, 3], [6, 3, 5, 1, 2, 4]]}, {"id": "sudoku-4", "title": "Mini Sudoku #4", "givens": [[0, 0, 0, 1, 3, 0], [3, 2, 1, 0, 6, 4], [6, 0, 2, 0, 1, 5], [0, 0, 0, 0, 0, 0], [0, 0, 0, 3, 5, 0], [5, 6, 0, 0, 4, 0]], "solution": [[4, 5, 6, 1, 3, 2], [3, 2, 1, 5, 6, 4], [6, 3, 2, 4, 1, 5], [1, 4, 5, 6, 2, 3], [2, 1, 4, 3, 5, 6], [5, 6, 3, 2, 4, 1]]}, {"id": "sudoku-5", "title": "Mini Sudoku #5", "givens": [[3, 4, 6, 0, 0, 0], [0, 5, 1, 0, 3, 6], [0, 0, 0, 0, 0, 0], [0, 0, 2, 5, 6, 0], [0, 0, 0, 3, 0, 1], [1, 0, 5, 6, 0, 4]], "solution": [[3, 4, 6, 2, 1, 5], [2, 5, 1, 4, 3, 6], [5, 6, 3, 1, 4, 2], [4, 1, 2, 5, 6, 3], [6, 2, 4, 3, 5, 1], [1, 3, 5, 6, 2, 4]]}, {"id": "sudoku-6", "title": "Mini Sudoku #6", "givens": [[0, 1, 0, 2, 0, 0], [2, 5, 0, 0, 0, 0], [4, 0, 1, 0, 2, 5], [5, 0, 2, 0, 0, 6], [3, 0, 0, 0, 6, 2], [0, 0, 6, 0, 3, 0]], "solution": [[6, 1, 4, 2, 5, 3], [2, 5, 3, 6, 4, 1], [4, 6, 1, 3, 2, 5], [5, 3, 2, 4, 1, 6], [3, 4, 5, 1, 6, 2], [1, 2, 6, 5, 3, 4]]}, {"id": "sudoku-7", "title": "Mini Sudoku #7", "givens": [[0, 0, 6, 4, 0, 2], [4, 1, 0, 0, 3, 6], [5, 0, 0, 0, 0, 3], [1, 6, 0, 0, 0, 5], [0, 4, 0, 3, 0, 1], [0, 0, 0, 0, 0, 4]], "solution": [[3, 5, 6, 4, 1, 2], [4, 1, 2, 5, 3, 6], [5, 2, 4, 1, 6, 3], [1, 6, 3, 2, 4, 5], [6, 4, 5, 3, 2, 1], [2, 3, 1, 6, 5, 4]]}, {"id": "sudoku-8", "title": "Mini Sudoku #8", "givens": [[1, 0, 0, 0, 0, 6], [2, 5, 6, 0, 0, 0], [0, 1, 0, 2, 5, 3], [3, 0, 5, 6, 1, 0], [0, 0, 2, 0, 0, 5], [0, 0, 0, 3, 0, 0]], "solution": [[1, 4, 3, 5, 2, 6], [2, 5, 6, 4, 3, 1], [6, 1, 4, 2, 5, 3], [3, 2, 5, 6, 1, 4], [4, 3, 2, 1, 6, 5], [5, 6, 1, 3, 4, 2]]}, {"id": "sudoku-9", "title": "Mini Sudoku #9", "givens": [[0, 6, 5, 1, 0, 0], [0, 0, 3, 6, 5, 2], [0, 2, 4, 0, 6, 0], [6, 0, 1, 0, 4, 0], [0, 3, 2, 0, 0, 0], [0, 4, 0, 0, 0, 0]], "solution": [[2, 6, 5, 1, 3, 4], [4, 1, 3, 6, 5, 2], [3, 2, 4, 5, 6, 1], [6, 5, 1, 2, 4, 3], [5, 3, 2, 4, 1, 6], [1, 4, 6, 3, 2, 5]]}, {"id": "sudoku-10", "title": "Mini Sudoku #10", "givens": [[0, 0, 0, 3, 1, 0], [3, 0, 0, 0, 2, 0], [0, 3, 2, 0, 0, 4], [4, 5, 0, 1, 0, 0], [0, 1, 5, 0, 0, 3], [2, 0, 3, 5, 0, 0]], "solution": [[5, 2, 4, 3, 1, 6], [3, 6, 1, 4, 2, 5], [1, 3, 2, 6, 5, 4], [4, 5, 6, 1, 3, 2], [6, 1, 5, 2, 4, 3], [2, 4, 3, 5, 6, 1]]}, {"id": "sudoku-11", "title": "Mini Sudoku #11", "givens": [[1, 0, 0, 0, 0, 5], [5, 4, 0, 3, 2, 1], [0, 0, 0, 0, 1, 0], [3, 5, 0, 0, 6, 0], [4, 0, 2, 1, 0, 0], [0, 0, 0, 0, 3, 2]], "solution": [[1, 2, 3, 6, 4, 5], [5, 4, 6, 3, 2, 1], [2, 6, 4, 5, 1, 3], [3, 5, 1, 2, 6, 4], [4, 3, 2, 1, 5, 6], [6, 1, 5, 4, 3, 2]]}, {"id": "sudoku-12", "title": "Mini Sudoku #12", "givens": [[0, 2, 0, 0, 0, 0], [1, 0, 4, 0, 6, 0], [2, 0, 0, 6, 0, 5], [6, 0, 0, 3, 0, 2], [0, 0, 0, 1, 2, 0], [4, 1, 0, 5, 3, 0]], "solution": [[3, 2, 6, 4, 5, 1], [1, 5, 4, 2, 6, 3], [2, 3, 1, 6, 4, 5], [6, 4, 5, 3, 1, 2], [5, 6, 3, 1, 2, 4], [4, 1, 2, 5, 3, 6]]}, {"id": "sudoku-13", "title": "Mini Sudoku #13", "givens": [[1, 0, 2, 5, 0, 0], [6, 5, 4, 1, 0, 0], [0, 6, 0, 2, 0, 0], [2, 0, 3, 0, 5, 0], [0, 0, 0, 0, 0, 1], [0, 0, 1, 0, 4, 5]], "solution": [[1, 3, 2, 5, 6, 4], [6, 5, 4, 1, 3, 2], [4, 6, 5, 2, 1, 3], [2, 1, 3, 4, 5, 6], [5, 4, 6, 3, 2, 1], [3, 2, 1, 6, 4, 5]]}, {"id": "sudoku-14", "title": "Mini Sudoku #14", "givens": [[0, 2, 0, 0, 0, 0], [0, 0, 0, 6, 1, 0], [0, 5, 0, 2, 0, 0], [4, 6, 2, 0, 0, 1], [6, 4, 0, 0, 0, 3], [2, 0, 0, 5, 4, 6]], "solution": [[1, 2, 6, 4, 3, 5], [5, 3, 4, 6, 1, 2], [3, 5, 1, 2, 6, 4], [4, 6, 2, 3, 5, 1], [6, 4, 5, 1, 2, 3], [2, 1, 3, 5, 4, 6]]}];

      // Crossclimb State
      this.crossclimbCurrentLevel = localStorage.getItem('orbitsuite_crossclimb_current_level') || '1';
      this.crossclimbRungs = [];

      // Zip State
      this.zipCurrentLevel = localStorage.getItem('orbitsuite_zip_current_level') || '1';
      this.zipPath = [];

      // Sudoku State
      this.sudokuCurrentLevel = localStorage.getItem('orbitsuite_sudoku_current_level') || '1';
      this.sudokuUserGrid = Array(6).fill(0).map(() => Array(6).fill(0));
      this.sudokuSelectedCell = null;
      this.sudokuTime = 0;
      this.sudokuTimerInterval = null;
      this.sudokuTimerStarted = false;


this.zipNextExpectedCp = 2;

      // German Daily Cycle (07:00 Berlin Release)
      this.lastActiveDailyCycle = '';
      this.dailyTimerInterval = null;

      this.dom = {

        badgeScore: document.getElementById('riddle-badge-score'),

        badgeStreak: document.getElementById('riddle-badge-streak'),

        badgeDailyStreak: document.getElementById('riddle-badge-daily-streak'),

        badgeCountdown: document.getElementById('riddle-badge-countdown'),
        badgeInfo: document.getElementById('riddle-badge-info'),

        dailyBanner: document.getElementById('riddle-daily-banner'),

        dailyDateTitle: document.getElementById('riddle-daily-date-title'),

        dailyStatusPill: document.getElementById('daily-status-pill'),

        dailyCountdown: document.getElementById('riddle-daily-countdown'),

        btnSwitchDaily: document.getElementById('btn-switch-daily-riddle'),

        chipDaily: document.getElementById('chip-filter-daily'),

                // LinkedIn Games Navigation

        gamesNavBtns: document.querySelectorAll('.game-nav-btn'),

        gamePanels: {
          queens: document.getElementById('panel-game-queens'),
          tango: document.getElementById('panel-game-tango'),
          crossclimb: document.getElementById('panel-game-crossclimb'),
          pinpoint: document.getElementById('panel-game-pinpoint'),
          zip: document.getElementById('panel-game-zip'),
          sudoku: document.getElementById('panel-game-sudoku'),
          
        },



        // Queens DOM

        queensLevelSelect: document.getElementById('queens-level-select'),
        btnQueensPrev: document.getElementById('btn-queens-prev'),
        btnQueensNext: document.getElementById('btn-queens-next'),
        btnQueensRandom: document.getElementById('btn-queens-random'),
        btnQueensBannerNext: document.getElementById('btn-queens-banner-next'),

        queensMovesBadge: document.getElementById('queens-moves-badge'),

        queensTimerBadge: document.getElementById('queens-timer-badge'),

        queensGrid: document.getElementById('queens-grid'),

        queensFeedback: document.getElementById('queens-feedback'),

        queensStatusPill: document.getElementById('queens-status-pill'),

        queensCountdown: document.getElementById('queens-daily-countdown'),

        queensDateTitle: document.getElementById('queens-daily-date-title'),

        btnQueensAutoX: document.getElementById('btn-queens-autox'),

        btnQueensUndo: document.getElementById('btn-queens-undo'),

        btnQueensReset: document.getElementById('btn-queens-reset'),



        // Tango DOM

        tangoLevelSelect: document.getElementById('tango-level-select'),
        btnTangoPrev: document.getElementById('btn-tango-prev'),
        btnTangoNext: document.getElementById('btn-tango-next'),
        btnTangoRandom: document.getElementById('btn-tango-random'),
        btnTangoBannerNext: document.getElementById('btn-tango-banner-next'),

        tangoTimerBadge: document.getElementById('tango-timer-badge'),

        tangoGrid: document.getElementById('tango-grid'),

        tangoFeedback: document.getElementById('tango-feedback'),

        tangoStatusPill: document.getElementById('tango-status-pill'),

        tangoCountdown: document.getElementById('tango-daily-countdown'),

        tangoDateTitle: document.getElementById('tango-daily-date-title'),

        btnTangoReset: document.getElementById('btn-tango-reset'),



        // Pinpoint DOM

        pinpointLevelSelect: document.getElementById('pinpoint-level-select'),
        btnPinpointPrev: document.getElementById('btn-pinpoint-prev'),
        btnPinpointNext: document.getElementById('btn-pinpoint-next'),
        btnPinpointRandom: document.getElementById('btn-pinpoint-random'),
        btnPinpointBannerNext: document.getElementById('btn-pinpoint-banner-next'),

        pinpointAttemptsBadge: document.getElementById('pinpoint-attempts-badge'),

        pinpointCluesList: document.getElementById('pinpoint-clues-list'),

        pinpointGuessInput: document.getElementById('pinpoint-guess-input'),

        pinpointFeedback: document.getElementById('pinpoint-feedback'),

        pinpointStatusPill: document.getElementById('pinpoint-status-pill'),

        pinpointCountdown: document.getElementById('pinpoint-daily-countdown'),

        pinpointDateTitle: document.getElementById('pinpoint-daily-date-title'),

        btnPinpointSubmit: document.getElementById('btn-pinpoint-submit'),

        btnPinpointRevealClue: document.getElementById('btn-pinpoint-reveal-clue'),

        btnPinpointReset: document.getElementById('btn-pinpoint-reset'),
        // Crossclimb DOM
        crossclimbLevelSelect: document.getElementById('crossclimb-level-select'),
        btnCrossclimbPrev: document.getElementById('btn-crossclimb-prev'),
        btnCrossclimbNext: document.getElementById('btn-crossclimb-next'),
        btnCrossclimbRandom: document.getElementById('btn-crossclimb-random'),
        btnCrossclimbBannerNext: document.getElementById('btn-crossclimb-banner-next'),
        crossclimbStatusBadge: document.getElementById('crossclimb-status-badge'),
        crossclimbLadderList: document.getElementById('crossclimb-ladder-list'),
        crossclimbFeedback: document.getElementById('crossclimb-feedback'),
        crossclimbStatusPill: document.getElementById('crossclimb-status-pill'),
        crossclimbCountdown: document.getElementById('crossclimb-daily-countdown'),
        crossclimbDateTitle: document.getElementById('crossclimb-daily-date-title'),
        btnCrossclimbCheck: document.getElementById('btn-crossclimb-check'),
        btnCrossclimbReset: document.getElementById('btn-crossclimb-reset'),

        // Zip DOM
        zipLevelSelect: document.getElementById('zip-level-select'),
        btnZipPrev: document.getElementById('btn-zip-prev'),
        btnZipNext: document.getElementById('btn-zip-next'),
        btnZipRandom: document.getElementById('btn-zip-random'),
        btnZipBannerNext: document.getElementById('btn-zip-banner-next'),
        zipProgressBadge: document.getElementById('zip-progress-badge'),
        zipGrid: document.getElementById('zip-grid'),
        zipFeedback: document.getElementById('zip-feedback'),
        zipStatusPill: document.getElementById('zip-status-pill'),
        zipCountdown: document.getElementById('zip-daily-countdown'),
        zipDateTitle: document.getElementById('zip-daily-date-title'),
        btnZipUndo: document.getElementById('btn-zip-undo'),
        btnZipReset: document.getElementById('btn-zip-reset'),

        // Sudoku DOM
        sudokuLevelSelect: document.getElementById('sudoku-level-select'),
        btnSudokuPrev: document.getElementById('btn-sudoku-prev'),
        btnSudokuNext: document.getElementById('btn-sudoku-next'),
        btnSudokuRandom: document.getElementById('btn-sudoku-random'),
        btnSudokuBannerNext: document.getElementById('btn-sudoku-banner-next'),
        sudokuTimerBadge: document.getElementById('sudoku-timer-badge'),
        sudokuGrid: document.getElementById('sudoku-grid'),
        sudokuNumpad: document.getElementById('sudoku-numpad'),
        sudokuFeedback: document.getElementById('sudoku-feedback'),
        sudokuStatusPill: document.getElementById('sudoku-status-pill'),
        sudokuCountdown: document.getElementById('sudoku-daily-countdown'),
        sudokuDateTitle: document.getElementById('sudoku-daily-date-title'),
        btnSudokuReset: document.getElementById('btn-sudoku-reset'),


btnRandom: document.getElementById('btn-riddle-random'),

        btnCreate: document.getElementById('btn-riddle-create'),

        filterChips: document.querySelectorAll('.riddle-filter-chip'),

        diffSelect: document.getElementById('riddle-difficulty-select'),

        catPill: document.getElementById('riddle-active-cat'),

        diffPill: document.getElementById('riddle-active-diff'),

        countLabel: document.getElementById('riddle-active-counter'),

        statusIndicator: document.getElementById('riddle-status-indicator'),

        statusText: document.getElementById('riddle-status-text'),

        visualBox: document.getElementById('riddle-visual-box'),

        questionText: document.getElementById('riddle-question-text'),

        answerInput: document.getElementById('riddle-answer-input'),

        btnSubmit: document.getElementById('btn-riddle-submit'),

        feedbackBox: document.getElementById('riddle-feedback-box'),

        btnHint: document.getElementById('btn-riddle-hint'),

        hintBox: document.getElementById('riddle-hint-box'),

        hintText: document.getElementById('riddle-hint-text'),

        btnReveal: document.getElementById('btn-riddle-reveal'),

        solutionBox: document.getElementById('riddle-solution-box'),

        solutionContent: document.getElementById('riddle-solution-content'),

        solutionTitle: document.getElementById('riddle-solution-title'),

        solutionExplanation: document.getElementById('riddle-solution-explanation'),

        btnPrev: document.getElementById('btn-riddle-prev'),

        btnShuffle: document.getElementById('btn-riddle-shuffle'),

        btnNext: document.getElementById('btn-riddle-next'),

        cardsGrid: document.getElementById('riddle-cards-grid'),

        // Modal

        modal: document.getElementById('riddle-create-modal'),

        modalClose: document.getElementById('riddle-modal-close'),

        form: document.getElementById('riddle-form'),

        newQuestion: document.getElementById('riddle-new-question'),

        newCat: document.getElementById('riddle-new-cat'),

        newDiff: document.getElementById('riddle-new-diff'),

        newAnswer: document.getElementById('riddle-new-answer'),

        newHint: document.getElementById('riddle-new-hint'),

        newExplanation: document.getElementById('riddle-new-explanation'),

        btnModalCancel: document.getElementById('btn-riddle-modal-cancel')

      };



      this.init();

    }



    get allRiddles() {

      return [...this.customRiddles, ...this.defaultRiddles];

    }



    get filteredRiddles() {

      if (this.filterCategory === 'daily') {

        const cycle = this.getGermanDailyCycle();

        const dailyRiddle = this.getDailyRiddleForCycle(cycle.cycleKey);

        return dailyRiddle ? [dailyRiddle] : [];

      }

      return this.allRiddles.filter(r => {

        const catMatch = this.filterCategory === 'all' || r.category === this.filterCategory;

        const diffMatch = this.filterDifficulty === 'all' || r.difficulty === this.filterDifficulty;

        return catMatch && diffMatch;

      });

    }



    get currentRiddle() {

      const list = this.filteredRiddles;

      if (!list.length) return null;

      if (this.currentIndex >= list.length) this.currentIndex = 0;

      if (this.currentIndex < 0) this.currentIndex = list.length - 1;

      return list[this.currentIndex];

    }



    loadCustomRiddles() {

      try {

        const raw = localStorage.getItem('orbitsuite_custom_riddles');

        return raw ? JSON.parse(raw) : [];

      } catch (e) {

        return [];

      }

    }



    saveCustomRiddles() {

      localStorage.setItem('orbitsuite_custom_riddles', JSON.stringify(this.customRiddles));

    }



    loadSolved() {

      try {

        const datasetVer = localStorage.getItem('orbitsuite_riddle_dataset_version');

        const raw = localStorage.getItem('orbitsuite_riddles_solved');

        let solved = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(solved)) solved = [];



        // Dataset Migration: purge legacy text riddle IDs (riddle-1 through riddle-18)

        if (datasetVer !== 'v2_optical') {

          const legacyIds = new Set(Array.from({ length: 18 }, (_, i) => `riddle-${i + 1}`));

          solved = solved.filter(id => !legacyIds.has(id));

          localStorage.setItem('orbitsuite_riddle_dataset_version', 'v2_optical');

          localStorage.setItem('orbitsuite_riddles_solved', JSON.stringify(solved));

        }



        // Only retain solved IDs that actually exist in the current active riddle collection

        const validIds = new Set(this.allRiddles.map(r => r.id));

        return solved.filter(id => validIds.has(id));

      } catch (e) {

        return [];

      }

    }



    saveSolved() {

      localStorage.setItem('orbitsuite_riddles_solved', JSON.stringify(Array.from(this.solvedRiddles)));

      localStorage.setItem('orbitsuite_riddle_streak', String(this.streak));

    }



    loadDailySolved() {

      try {

        const raw = localStorage.getItem('orbitsuite_riddle_daily_solved');

        return raw ? JSON.parse(raw) : [];

      } catch (e) {

        return [];

      }

    }



    saveDailySolved() {

      localStorage.setItem('orbitsuite_riddle_daily_solved', JSON.stringify(Array.from(this.dailySolvedDates)));

      localStorage.setItem('orbitsuite_riddle_daily_streak', String(this.dailyStreak));

    }



    // Accurate calculation of 07:00:00 Europe/Berlin cycle

    getGermanDailyCycle(targetDate = new Date()) {

      const formatter = new Intl.DateTimeFormat('en-US', {

        timeZone: 'Europe/Berlin',

        year: 'numeric',

        month: 'numeric',

        day: 'numeric',

        hour: 'numeric',

        minute: 'numeric',

        second: 'numeric',

        hour12: false

      });



      const parts = {};

      formatter.formatToParts(targetDate).forEach(p => {

        if (p.type !== 'literal') parts[p.type] = parseInt(p.value, 10);

      });



      const bYear = parts.year;

      const bMonth = parts.month;

      const bDay = parts.day;

      const bHour = parts.hour;

      const bMinute = parts.minute;

      const bSecond = parts.second;



      // Riddle cycle starts at 07:00:00 Berlin time.

      // If hour < 7, the cycle started yesterday at 07:00.

      let cycleYear = bYear;

      let cycleMonth = bMonth;

      let cycleDay = bDay;



      if (bHour < 7) {

        const prev = new Date(Date.UTC(bYear, bMonth - 1, bDay - 1, 12, 0, 0));

        const prevParts = {};

        formatter.formatToParts(prev).forEach(p => {

          if (p.type !== 'literal') prevParts[p.type] = parseInt(p.value, 10);

        });

        cycleYear = prevParts.year;

        cycleMonth = prevParts.month;

        cycleDay = prevParts.day;

      }



      const cycleKey = `${cycleYear}-${String(cycleMonth).padStart(2, '0')}-${String(cycleDay).padStart(2, '0')}`;



      // Target for next drop: 07:00:00 Europe/Berlin

      let targetYear = bYear;

      let targetMonth = bMonth;

      let targetDay = bDay;



      if (bHour >= 7) {

        const nextD = new Date(Date.UTC(bYear, bMonth - 1, bDay + 1, 12, 0, 0));

        const nextParts = {};

        formatter.formatToParts(nextD).forEach(p => {

          if (p.type !== 'literal') nextParts[p.type] = parseInt(p.value, 10);

        });

        targetYear = nextParts.year;

        targetMonth = nextParts.month;

        targetDay = nextParts.day;

      }



      // Resolve exact UTC timestamp for 07:00 Berlin time (handles CET UTC+1 / CEST UTC+2)

      let next7Timestamp = 0;

      for (const utcHour of [5, 6]) {

        const cand = new Date(Date.UTC(targetYear, targetMonth - 1, targetDay, utcHour, 0, 0));

        const cParts = {};

        formatter.formatToParts(cand).forEach(p => {

          if (p.type !== 'literal') cParts[p.type] = parseInt(p.value, 10);

        });

        if (cParts.hour === 7 && cParts.day === targetDay && cParts.minute === 0) {

          next7Timestamp = cand.getTime();

          break;

        }

      }

      if (!next7Timestamp) {

        next7Timestamp = targetDate.getTime() + 86400000;

      }



      const msRemaining = Math.max(0, next7Timestamp - targetDate.getTime());

      const totalSec = Math.floor(msRemaining / 1000);

      const hours = Math.floor(totalSec / 3600);

      const minutes = Math.floor((totalSec % 3600) / 60);

      const seconds = totalSec % 60;



      const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;



      const deDateFormatter = new Intl.DateTimeFormat('de-DE', {

        timeZone: 'Europe/Berlin',

        weekday: 'long',

        day: 'numeric',

        month: 'long',

        year: 'numeric'

      });

      const cycleDateObj = new Date(Date.UTC(cycleYear, cycleMonth - 1, cycleDay, 12, 0, 0));

      const displayDate = deDateFormatter.format(cycleDateObj);



      return {

        cycleKey,

        displayDate,

        bHour,

        bMinute,

        bSecond,

        next7Timestamp,

        msRemaining,

        hours,

        minutes,

        seconds,

        formattedCountdown

      };

    }



    // Deterministic selection of the Riddle of the Day for any cycle date

    getDailyRiddleForCycle(cycleKey) {

      if (!this.defaultRiddles || !this.defaultRiddles.length) return null;

      const parts = cycleKey.split('-').map(Number);

      const epoch = Date.UTC(2026, 0, 1);

      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);

      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));

      // Disperse categories using prime stride

      const pool = this.defaultRiddles;

      const index = (dayDiff * 7 + 3) % pool.length;

      return pool[index];

    }



    isTodayDailySolved() {

      const cycle = this.getGermanDailyCycle();

      return this.dailySolvedDates.has(cycle.cycleKey);

    }



    startDailyTimer() {
      // Daily timer disabled - Unlimited procedural play
    }

    renderDailyBanner() {
      // Banner rendering handled dynamically per game mode
    }

    // ==========================================
    // PROCEDURAL PUZZLE ACCESS & LEVEL CACHE
    // ==========================================
    getPuzzle(game, lvl) {
      const level = Math.max(1, parseInt(lvl, 10) || 1);
      if (this.levelCache[game] && this.levelCache[game][level]) {
        return this.levelCache[game][level];
      }

      let puzzle = null;
      if (game === 'queens') {
        if (level <= this.queensData.length) puzzle = this.queensData[level - 1];
        else puzzle = OrbitRiddleGenerator.generateQueens(level);
      } else if (game === 'tango') {
        if (level <= this.tangoData.length) puzzle = this.tangoData[level - 1];
        else puzzle = OrbitRiddleGenerator.generateTango(level);
      } else if (game === 'sudoku') {
        if (level <= this.sudokuData.length) puzzle = this.sudokuData[level - 1];
        else puzzle = OrbitRiddleGenerator.generateSudoku(level);
      } else if (game === 'zip') {
        if (level <= this.zipData.length) puzzle = this.zipData[level - 1];
        else puzzle = OrbitRiddleGenerator.generateZip(level);
      } else if (game === 'crossclimb') {
        puzzle = OrbitRiddleGenerator.generateCrossclimb(level, this.crossclimbData);
      } else if (game === 'pinpoint') {
        puzzle = OrbitRiddleGenerator.generatePinpoint(level, this.pinpointData);
      }

      if (!puzzle) puzzle = this.queensData[0];
      if (!this.levelCache[game]) this.levelCache[game] = {};
      this.levelCache[game][level] = puzzle;
      return puzzle;
    }

    generateNewLevel(game) {
      const cur = this.getCurrentLevel(game);
      const customSeed = `${game}_seed_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      let puzzle = null;
      if (game === 'queens') puzzle = OrbitRiddleGenerator.generateQueens(cur, customSeed);
      else if (game === 'tango') puzzle = OrbitRiddleGenerator.generateTango(cur, customSeed);
      else if (game === 'sudoku') puzzle = OrbitRiddleGenerator.generateSudoku(cur, customSeed);
      else if (game === 'zip') puzzle = OrbitRiddleGenerator.generateZip(cur, customSeed);
      else if (game === 'crossclimb') puzzle = OrbitRiddleGenerator.generateCrossclimb(cur, this.crossclimbData, customSeed);
      else if (game === 'pinpoint') puzzle = OrbitRiddleGenerator.generatePinpoint(cur, this.pinpointData, customSeed);

      if (puzzle) {
        if (!this.levelCache[game]) this.levelCache[game] = {};
        this.levelCache[game][cur] = puzzle;
      }
      this.setGameLevel(game, cur);
      this.suite.showToast(`🎲 Level #${cur} neu generiert!`);
    }

    // ==========================================
    // UNIFIED LEVEL & SOLVED SYSTEM (UNLIMITED PLAY)
    // ==========================================
    getLevelDifficulty(lvl) {
      const l = Math.max(1, parseInt(lvl, 10) || 1);
      if (l <= 5) {
        return {
          tier: 'easy',
          label: 'Leicht',
          icon: '🟢',
          range: 'Level 1 – 5',
          desc: 'Sanfter Einstieg & Grundlagen. Ideal zum Aufwärmen und Verstehen der Regeln.'
        };
      }
      if (l <= 10) {
        return {
          tier: 'medium',
          label: 'Mittel',
          icon: '🟡',
          range: 'Level 6 – 10',
          desc: 'Taktische Züge, tiefere Ausschlusslogik und kniffligere Verzweigungen.'
        };
      }
      return {
        tier: 'hard',
        label: 'Schwer',
        icon: '🔴',
        range: 'Level 11+',
        desc: 'Meister-Herausforderung: Höchste Knobeldichte für echte Rätsel-Profis.'
      };
    }

    getHighestUnlockedLevel(game) {
      const solvedSet = this.getSolvedSet(game);
      if (solvedSet.size === 0) return 1;
      const maxSolved = Math.max(...Array.from(solvedSet));
      return Math.max(1, maxSolved + 1);
    }

    isLevelUnlocked(game, lvl) {
      const l = Math.max(1, parseInt(lvl, 10) || 1);
      if (l === 1) return true;
      if (this.isLevelSolved(game, l)) return true;
      if (this.isLevelSolved(game, l - 1)) return true;
      return l <= this.getHighestUnlockedLevel(game);
    }

    getScreenFitLevelCount(game) {
      // 1. Genaue Messung der tatsächlichen Container-Breite im DOM
      let containerWidth = 0;
      if (game) {
        const c = document.querySelector(`#${game}-level-hub .linear-trail-container`);
        if (c && c.clientWidth > 80) {
          containerWidth = c.clientWidth;
        }
      }
      if (!containerWidth) {
        const anyC = document.querySelector('.linear-trail-container');
        if (anyC && anyC.clientWidth > 80) {
          containerWidth = anyC.clientWidth;
        }
      }

      const w = window.innerWidth || document.documentElement.clientWidth || 1024;
      if (!containerWidth) {
        // Fallback: Volle Bildschirmbreite abzüglich Seitenränder und Buttons (~100px)
        const wrapperPadding = w < 640 ? 40 : 100;
        containerWidth = Math.max(280, w - wrapperPadding);
      }

      // Node-Abstand: Node-Breite + Connector
      // Mobile: 38px + 14px = 52px
      // Tablet: 42px + 18px = 60px
      // Desktop: 44px + 14px = 58px
      const pitch = w < 640 ? 52 : (w <= 1024 ? 60 : 58);

      // Berechne exakt, wie viele Nodes benötigt werden, um das GANZE Feld lückenlos zu füllen
      const count = Math.ceil((containerWidth - 28) / pitch);
      return Math.max(8, count);
    }

    getPathLength(game) {
      const cur = this.getCurrentLevel(game);
      const highest = this.getHighestUnlockedLevel(game);
      const playerPos = Math.max(cur, highest);
      const screenFit = this.getScreenFitLevelCount(game);

      let storedLength = parseInt(localStorage.getItem(`orbitsuite_${game}_path_length`), 10);
      if (isNaN(storedLength) || storedLength < screenFit) {
        storedLength = screenFit;
        localStorage.setItem(`orbitsuite_${game}_path_length`, String(storedLength));
      }

      // Dynamische Weitergenerierung: Immer mindestens 5 Level vor dem Spieler
      const minAhead = 5;
      if (playerPos >= storedLength - minAhead) {
        storedLength = playerPos + minAhead;
        localStorage.setItem(`orbitsuite_${game}_path_length`, String(storedLength));
      }

      return storedLength;
    }

    renderLevelHub(game) {
      const container = document.getElementById(`${game}-level-hub`);
      if (!container) return;

      const cur = this.getCurrentLevel(game);
      const solvedSet = this.getSolvedSet(game);
      const viewMode = localStorage.getItem('orbitsuite_level_selector_mode') || 'path';
      const diffInfo = this.getLevelDifficulty(cur);
      const highestUnlocked = this.getHighestUnlockedLevel(game);
      const totalLevels = this.getPathLength(game);

      // Update toolbar level badge (no difficulty in campaign view)
      const tbBadge = document.getElementById(`${game}-toolbar-level-badge`);
      if (tbBadge) {
        if (viewMode === 'path') {
          tbBadge.textContent = `Level #${cur}`;
        } else {
          tbBadge.textContent = `Level #${cur} • ${diffInfo.icon} ${diffInfo.label}`;
        }
      }

      // Linear levels array: 1 .. totalLevels
      const allLevels = Array.from({ length: totalLevels }, (_, i) => i + 1);

      // Find next unlocked unsolved level for 'Weiter auf dem Pfad'
      let nextPlayLevel = null;
      for (let i = 1; i <= totalLevels; i++) {
        if (this.isLevelUnlocked(game, i) && !solvedSet.has(i)) {
          nextPlayLevel = i;
          break;
        }
      }
      if (!nextPlayLevel) nextPlayLevel = highestUnlocked;

      const totalSolved = solvedSet.size;

      // Header HTML
      let html = `
        <div class="level-hub-header">
          <div class="level-hub-title-group">
            <span class="level-hub-title">🎯 Level-Wahl</span>
            <span class="level-hub-pill">Level #${cur} aktiv</span>
          </div>
          <div class="level-mode-switcher">
            <button class="level-mode-tab ${viewMode === 'path' ? 'active' : ''}" data-hub-mode="path" title="Linearer Pfad ohne Stufen-Unterteilung">
              <span>🗺️ Linearer Pfad</span>
              <small>Kampagne</small>
            </button>
            <button class="level-mode-tab ${viewMode === 'difficulty' ? 'active' : ''}" data-hub-mode="difficulty" title="Freie Auswahl nach Schwierigkeitsgrad">
              <span>🎚️ Nach Schwierigkeit</span>
              <small>Freies Spiel</small>
            </button>
          </div>
        </div>
      `;

      if (viewMode === 'path') {
        // VIEW 1: EINFACH LINEARER LEVEL-PFAD (KEINE SCHWIERIGKEITS-UNTERTEILUNG)
        const renderLinearNodes = () => {
          return allLevels.map((lvl, idx) => {
            const isSolved = solvedSet.has(lvl);
            const isUnlocked = this.isLevelUnlocked(game, lvl);
            const isActive = lvl === cur;
            const nextLvl = allLevels[idx + 1];
            const nextUnlocked = nextLvl ? this.isLevelUnlocked(game, nextLvl) : false;
            const connector = idx < allLevels.length - 1
              ? `<div class="trail-connector ${isSolved ? 'solved' : (nextUnlocked ? 'unlocked' : 'locked')}"></div>`
              : '';

            const diff = this.getLevelDifficulty(lvl);

            if (isUnlocked) {
              return `
                <button class="trail-node ${isSolved ? 'solved' : ''} ${isActive ? 'active' : 'unlocked'}"
                        data-select-level="${lvl}"
                        title="Level #${lvl} ${isSolved ? '• Gelöst ✓' : '• Freigeschaltet'}">
                  <span class="node-number">${lvl}</span>
                  ${isSolved ? '<span class="node-status-badge">✓</span>' : (isActive ? '<span class="node-status-badge active-dot">👑</span>' : '')}
                </button>
                ${connector}
              `;
            } else {
              // Nicht freigeschaltet: Zahl durch Schloss ersetzen!
              return `
                <button class="trail-node locked"
                        data-locked-level="${lvl}"
                        title="Level #${lvl} • 🔒 Gesperrt (Schließe Level #${lvl - 1} ab)">
                  <span class="node-lock" aria-label="Gesperrt">🔒</span>
                </button>
                ${connector}
              `;
            }
          }).join('');
        };

        html += `
          <div class="level-path-view">
            <div class="path-header-row">
              <span class="path-subtitle">🗺️ <strong>Linearer Level-Pfad:</strong> Gehe den Pfad Level für Level durch. Es sind immer mindestens 5 Level vor dir aufgedeckt!</span>
              <span class="path-progress-pill">Fortschritt: ${totalSolved}/${totalLevels} Gelöst</span>
            </div>

            <div class="linear-trail-wrapper">
              <button class="trail-scroll-btn left" data-scroll-dir="left" title="Nach links scrollen">‹</button>
              <div class="linear-trail-container" id="${game}-linear-trail">
                <div class="linear-trail-track">
                  ${renderLinearNodes()}
                </div>
              </div>
              <button class="trail-scroll-btn right" data-scroll-dir="right" title="Nach rechts scrollen">›</button>
            </div>

            <div class="trail-action-bar">
              <button class="btn-path-next" data-select-level="${nextPlayLevel}" title="Gehe zum nächsten spielbaren Level">
                <span>▶ Weiter auf dem Pfad (Level #${nextPlayLevel})</span>
              </button>
              <button class="btn-secondary" data-action="random-level" title="Zufälliges freigeschaltetes Level spielen">
                <span>🎲 Zufall (Freigeschaltet)</span>
              </button>
            </div>
          </div>
        `;
      } else {
        // VIEW 2: SCHWIERIGKEITS-MODUS
        const easyLevels = allLevels.filter(l => l <= 5);
        const medLevels = allLevels.filter(l => l > 5 && l <= 10);
        const hardLevels = allLevels.filter(l => l > 10);

        const countSolved = arr => arr.filter(lvl => solvedSet.has(lvl)).length;
        const easySolved = countSolved(easyLevels);
        const medSolved = countSolved(medLevels);
        const hardSolved = countSolved(hardLevels);

        const renderChips = (levels) => {
          return levels.map(lvl => {
            const isSolved = solvedSet.has(lvl);
            const isUnlocked = this.isLevelUnlocked(game, lvl);
            const isActive = lvl === cur;

            if (isUnlocked) {
              return `
                <button class="diff-chip ${isSolved ? 'solved' : ''} ${isActive ? 'active' : ''}"
                        data-select-level="${lvl}"
                        title="Level #${lvl} (${this.getLevelDifficulty(lvl).label})">
                  Lvl ${lvl} ${isSolved ? '✓' : ''}
                </button>
              `;
            } else {
              return `
                <button class="diff-chip locked"
                        data-locked-level="${lvl}"
                        title="Level #${lvl} • 🔒 Gesperrt (Schließe Level #${lvl - 1} ab)">
                  <span class="chip-lock-icon">🔒</span>
                </button>
              `;
            }
          }).join('');
        };

        const getFirstPlayableInTier = (levels) => {
          const unlockedUnsolved = levels.find(l => this.isLevelUnlocked(game, l) && !solvedSet.has(l));
          if (unlockedUnsolved) return unlockedUnsolved;
          const anyUnlocked = levels.find(l => this.isLevelUnlocked(game, l));
          return anyUnlocked || null;
        };

        const easyTarget = getFirstPlayableInTier(easyLevels);
        const medTarget = getFirstPlayableInTier(medLevels);
        const hardTarget = getFirstPlayableInTier(hardLevels);

        html += `
          <div class="level-difficulty-view">
            <div class="difficulty-cards-grid">
              <!-- Leicht Card -->
              <div class="difficulty-card tier-easy">
                <div class="diff-card-header">
                  <span class="diff-card-title">🟢 Leicht</span>
                  <span class="tier-badge easy">${easySolved}/${easyLevels.length} Gelöst</span>
                </div>
                <p class="diff-desc">Sanfter Einstieg & Grundlagen. Ideal zum Aufwärmen und Verstehen der Spielregeln.</p>
                <div class="diff-chips-row">
                  ${renderChips(easyLevels)}
                </div>
                <button class="btn-diff-play" data-select-level="${easyTarget}" title="Spiele ein leichtes Board">
                  <span>▶ Leichtes Level spielen (Lvl #${easyTarget})</span>
                </button>
              </div>

              <!-- Mittel Card -->
              <div class="difficulty-card tier-medium ${medTarget ? '' : 'card-locked'}">
                <div class="diff-card-header">
                  <span class="diff-card-title">🟡 Mittel${medTarget ? '' : ' • 🔒'}</span>
                  <span class="tier-badge medium">${medSolved}/${medLevels.length} Gelöst</span>
                </div>
                <p class="diff-desc">Taktische Züge, tiefere Ausschlusslogik und kniffligere Verzweigungen.</p>
                <div class="diff-chips-row">
                  ${renderChips(medLevels)}
                </div>
                ${medTarget ? `
                  <button class="btn-diff-play" data-select-level="${medTarget}" title="Spiele ein mittleres Board">
                    <span>▶ Mittleres Level spielen (Lvl #${medTarget})</span>
                  </button>
                ` : `
                  <button class="btn-diff-play locked" data-locked-level="${medLevels[0]}" title="Stufe Mittel gesperrt">
                    <span>🔒 Freischalten ab Level #${medLevels[0]}</span>
                  </button>
                `}
              </div>

              <!-- Schwer Card -->
              <div class="difficulty-card tier-hard ${hardTarget ? '' : 'card-locked'}">
                <div class="diff-card-header">
                  <span class="diff-card-title">🔴 Schwer${hardTarget ? '' : ' • 🔒'}</span>
                  <span class="tier-badge hard">${hardSolved}/${hardLevels.length} Gelöst</span>
                </div>
                <p class="diff-desc">Meister-Herausforderung: Höchste Komplexität für echte Knobel-Profis.</p>
                <div class="diff-chips-row">
                  ${renderChips(hardLevels)}
                </div>
                ${hardTarget ? `
                  <button class="btn-diff-play" data-select-level="${hardTarget}" title="Spiele ein schweres Board">
                    <span>▶ Schweres Level spielen (Lvl #${hardTarget})</span>
                  </button>
                ` : `
                  <button class="btn-diff-play locked" data-locked-level="${hardLevels[0]}" title="Stufe Schwer gesperrt">
                    <span>🔒 Freischalten ab Level #${hardLevels[0]}</span>
                  </button>
                `}
              </div>
            </div>
          </div>
        `;
      }

      container.innerHTML = html;

      // Auto-fill check: ensure level trail completely fills the container field
      setTimeout(() => {
        const trailContainer = container.querySelector('.linear-trail-container');
        const trailTrack = container.querySelector('.linear-trail-track');
        if (trailContainer && trailTrack && trailContainer.clientWidth > 80) {
          const innerWidth = trailContainer.clientWidth - 28;
          if (trailTrack.scrollWidth < innerWidth) {
            const pitch = window.innerWidth < 640 ? 52 : (window.innerWidth <= 1024 ? 60 : 58);
            const missing = Math.ceil((innerWidth - trailTrack.scrollWidth) / pitch);
            if (missing > 0) {
              const currentLen = this.getPathLength(game);
              localStorage.setItem(`orbitsuite_${game}_path_length`, String(currentLen + missing));
              this.renderLevelHub(game);
            }
          }
        }
      }, 20);

      // Auto-scroll linear trail to active node
      setTimeout(() => {
        const trailContainer = container.querySelector('.linear-trail-container');
        const activeNode = container.querySelector('.trail-node.active');
        if (trailContainer && activeNode) {
          const offset = activeNode.offsetLeft - (trailContainer.clientWidth / 2) + (activeNode.clientWidth / 2);
          trailContainer.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
        }
      }, 50);

      // Trail scroll buttons
      container.querySelectorAll('.trail-scroll-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const trailContainer = container.querySelector('.linear-trail-container');
          if (!trailContainer) return;
          const dir = btn.dataset.scrollDir;
          const scrollAmount = 260;
          trailContainer.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        });
      });

      // Event handlers
      container.querySelectorAll('[data-hub-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.hubMode;
          localStorage.setItem('orbitsuite_level_selector_mode', mode);
          this.renderLevelHub(game);
        });
      });

      container.querySelectorAll('[data-select-level]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lvl = parseInt(btn.dataset.selectLevel, 10);
          if (lvl) {
            this.setGameLevel(game, lvl);
          }
        });
      });

      container.querySelectorAll('[data-locked-level]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lvl = parseInt(btn.dataset.lockedLevel, 10);
          btn.classList.add('lock-shake');
          setTimeout(() => btn.classList.remove('lock-shake'), 400);
          this.suite.sound.playPop();
          this.suite.showToast(`🔒 Level #${lvl} ist noch nicht freigeschaltet! Schließe zuerst Level #${lvl - 1} ab.`, 'warning');
        });
      });

      const btnRandom = container.querySelector('[data-action="random-level"]');
      if (btnRandom) {
        btnRandom.addEventListener('click', () => this.randomGameLevel(game));
      }
    }
    getSolvedSet(game) {
      try {
        return new Set(JSON.parse(localStorage.getItem(`orbitsuite_${game}_solved_levels`) || '[]'));
      } catch (e) {
        return new Set();
      }
    }

    isLevelSolved(game, lvl) {
      return this.getSolvedSet(game).has(Number(lvl));
    }

    markLevelSolved(game, lvl) {
      const set = this.getSolvedSet(game);
      set.add(Number(lvl));
      localStorage.setItem(`orbitsuite_${game}_solved_levels`, JSON.stringify(Array.from(set)));
      this.populateLevelSelect(game);
      this.updateGameBanner(game);
      this.updateTotalStats();
      if (this.suite && this.suite.hubApp) {
        this.suite.hubApp.render();
      }
    }

    getSolvedCount(game) {
      return this.getSolvedSet(game).size;
    }

    getDataLength(game) {
      if (game === 'queens') return this.queensData ? this.queensData.length : 14;
      if (game === 'tango') return this.tangoData ? this.tangoData.length : 14;
      if (game === 'pinpoint') return this.pinpointData ? this.pinpointData.length : 14;
      if (game === 'crossclimb') return this.crossclimbData ? this.crossclimbData.length : 14;
      if (game === 'zip') return this.zipData ? this.zipData.length : 14;
      if (game === 'sudoku') return this.sudokuData ? this.sudokuData.length : 14;
      return 14;
    }

    getCurrentLevel(game) {
      const val = parseInt(this[`${game}CurrentLevel`], 10);
      if (isNaN(val) || val < 1) return 1;
      return val;
    }

    setGameLevel(game, lvl) {
      const target = Math.max(1, parseInt(lvl, 10) || 1);
      if (!this.isLevelUnlocked(game, target)) {
        this.suite.showToast(`🔒 Level #${target} ist noch nicht freigeschaltet! Schließe zuerst Level #${target - 1} ab.`, 'warning');
        return;
      }
      this[`${game}CurrentLevel`] = String(target);
      localStorage.setItem(`orbitsuite_${game}_current_level`, String(target));

      this.populateLevelSelect(game);

      if (game === 'queens') {
        this.resetQueensBoard(true);
        this.renderQueens();
      } else if (game === 'tango') {
        this.resetTangoBoard();
        this.renderTango();
      } else if (game === 'pinpoint') {
        this.resetPinpoint();
        this.renderPinpoint();
      } else if (game === 'crossclimb') {
        this.resetCrossclimb();
        this.renderCrossclimb();
      } else if (game === 'zip') {
        this.resetZip();
        this.renderZip();
      } else if (game === 'sudoku') {
        this.resetSudoku();
        this.renderSudoku();
      }
      this.updateGameBanner(game);
      this.renderLevelHub(game);
    }

    nextGameLevel(game) {
      const cur = this.getCurrentLevel(game);
      const next = cur + 1;
      if (!this.isLevelUnlocked(game, next)) {
        this.suite.showToast(`🔒 Level #${next} ist noch nicht freigeschaltet! Schließe zuerst Level #${cur} ab.`, 'warning');
        return;
      }
      const prevDiff = this.getLevelDifficulty(cur);
      const nextDiff = this.getLevelDifficulty(next);
      this.setGameLevel(game, next);
      this.suite.showToast(`Level #${next} geladen! 🚀`);
    }

    prevGameLevel(game) {
      const cur = this.getCurrentLevel(game);
      if (cur <= 1) {
        this.suite.showToast('Du bist bereits auf Level 1!');
        return;
      }
      this.setGameLevel(game, cur - 1);
      this.suite.showToast(`Level #${cur - 1} geladen! ◀`);
    }

    randomGameLevel(game) {
      const cur = this.getCurrentLevel(game);
      const highest = this.getHighestUnlockedLevel(game);
      const pool = [];
      for (let i = 1; i <= highest; i++) {
        if (i !== cur) pool.push(i);
      }
      const target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 1;
      this.setGameLevel(game, target);
      this.suite.showToast(`Zufalls-Level #${target} aktiviert! 🎲`);
    }

    populateLevelSelect(game) {
      const selectEl = this.dom[`${game}LevelSelect`];
      if (!selectEl) return;
      const cur = this.getCurrentLevel(game);
      const totalOptions = this.getPathLength(game);
      selectEl.innerHTML = '';
      for (let i = 1; i <= totalOptions; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        const isSolved = this.isLevelSolved(game, i);
        const isUnlocked = this.isLevelUnlocked(game, i);
        const diff = this.getLevelDifficulty(i);
        let label = `Board #${i}`;
        if (game === 'pinpoint') label = `Rätsel #${i}`;
        if (game === 'crossclimb') label = `Leiter #${i}`;
        if (game === 'zip') label = `Pfad #${i}`;
        if (game === 'sudoku') label = `Sudoku #${i}`;
        if (isUnlocked) {
          opt.textContent = `${label}${isSolved ? ' ✓ (Gelöst)' : ''}`;
        } else {
          opt.textContent = `🔒 ${label} (Gesperrt)`;
          opt.disabled = true;
        }
        selectEl.appendChild(opt);
      }
      selectEl.value = String(cur);
      this.renderLevelHub(game);
    }
    updateGameBanner(game) {
      const cur = this.getCurrentLevel(game);
      const isSolved = this.isLevelSolved(game, cur);
      const solvedCount = this.getSolvedCount(game);
      const diff = this.getLevelDifficulty(cur);

      const statusEl = this.dom[`${game}StatusPill`];
      if (statusEl) {
        statusEl.textContent = isSolved ? 'Gelöst ✓' : 'Offen ⏳';
        statusEl.classList.toggle('solved', isSolved);
      }

      const countEl = this.dom[`${game}Countdown`];
      if (countEl) {
        countEl.textContent = `Level ${cur}`;
      }

      const titleEl = this.dom[`${game}DateTitle`];
      if (titleEl) {
        if (game === 'queens') titleEl.textContent = `👑 Queens: Board #${cur} (6×6)`;
        else if (game === 'tango') titleEl.textContent = `☀️🌙 Tango: Board #${cur} (6×6)`;
        else if (game === 'pinpoint') titleEl.textContent = `🎯 Pinpoint: Rätsel #${cur}`;
        else if (game === 'crossclimb') titleEl.textContent = `🪜 Crossclimb: Leiter #${cur}`;
        else if (game === 'zip') titleEl.textContent = `⚡ Zip: Pfad #${cur} (5×5)`;
        else if (game === 'sudoku') titleEl.textContent = `🔢 Mini Sudoku: Board #${cur} (6×6)`;
      }

      const lvlNumEl = document.getElementById(`${game}-banner-level-num`);
      if (lvlNumEl) lvlNumEl.textContent = String(cur);

      const tbBadge = document.getElementById(`${game}-toolbar-level-badge`);
      if (tbBadge) {
        tbBadge.textContent = `Level #${cur}`;
      }

      const navBadgeEl = document.getElementById(`${game}-nav-badge`);
      if (navBadgeEl) {
        navBadgeEl.textContent = `${solvedCount} Gelöst`;
      }
    }

    updateTotalStats() {
      const games = ['queens', 'tango', 'crossclimb', 'pinpoint', 'zip', 'sudoku'];
      let totalSolved = 0;
      games.forEach(g => {
        const solved = this.getSolvedCount(g);
        totalSolved += solved;
        const navBadge = document.getElementById(`${g}-nav-badge`);
        if (navBadge) {
          navBadge.textContent = `${solved} Gelöst`;
        }
      });

      if (this.dom.badgeScore) {
        this.dom.badgeScore.textContent = `🏆 ${totalSolved} Gelöst`;
      }
      if (this.dom.badgeStreak) {
        this.dom.badgeStreak.textContent = `⚡ Freies Spiel`;
      }
      if (this.dom.badgeInfo) {
        this.dom.badgeInfo.textContent = `🧩 Unbegrenzt & Generiert`;
      }
    }


    switchGameMode(mode) {

      if (!this.dom.gamePanels[mode]) return;

      this.activeGameMode = mode;



      // Update Nav Tabs

      if (this.dom.gamesNavBtns) {

        this.dom.gamesNavBtns.forEach(btn => {

          btn.classList.toggle('active', btn.dataset.gameMode === mode);

        });

      }



      // Update Panels

      Object.keys(this.dom.gamePanels).forEach(key => {

        const panel = this.dom.gamePanels[key];

        if (panel) {

          panel.classList.toggle('hidden', key !== mode);

        }

      });



      this.suite.sound.playPop();



      // Render mode specific content

      if (mode === 'queens') {
        this.initQueens();
      } else if (mode === 'tango') {
        this.initTango();
      } else if (mode === 'crossclimb') {
        this.initCrossclimb();
      } else if (mode === 'pinpoint') {
        this.initPinpoint();
      } else if (mode === 'zip') {
        this.initZip();
      } else if (mode === 'sudoku') {
        this.initSudoku();
      } else if (mode === 'optical') {
        this.render();
      }

      this.renderLevelHub(mode);
    }



    // ==========================================

    // 1. QUEENS LOGIC ENGINE

    // ==========================================

    getQueensDailyBoard() {

      const cycle = this.getGermanDailyCycle();

      const parts = cycle.cycleKey.split('-').map(Number);

      const epoch = Date.UTC(2026, 0, 1);

      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);

      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));

      const idx = (dayDiff * 5 + 1) % this.queensData.length;

      return this.queensData[idx];

    }



    getActiveQueensBoard() {
      return this.getPuzzle('queens', this.getCurrentLevel('queens'));
    }



    initQueens() {
      this.populateLevelSelect('queens');
      this.resetQueensBoard(false);
      this.renderQueens();
    }

    resetQueensTimer() {
      if (this.queensTimerInterval) clearInterval(this.queensTimerInterval);
      this.queensTimerInterval = null;
      this.queensTime = 0;
      this.queensTimerStarted = false;
      if (this.dom.queensTimerBadge) {
        this.dom.queensTimerBadge.textContent = '⏱️ 00:00';
      }
    }

    startQueensTimer() {
      if (this.queensTimerInterval) clearInterval(this.queensTimerInterval);
      this.queensTime = 0;
      this.queensTimerInterval = setInterval(() => {
        this.queensTime += 1;
        if (this.dom.queensTimerBadge) {
          const m = String(Math.floor(this.queensTime / 60)).padStart(2, '0');
          const s = String(this.queensTime % 60).padStart(2, '0');
          this.dom.queensTimerBadge.textContent = `⏱️ ${m}:${s}`;
        }
      }, 1000);
    }

    resetQueensBoard(clearHistory = true) {
      this.queensUserGrid = Array(6).fill(null).map(() => Array(6).fill(null));
      this.queensManualX = new Set();
      if (clearHistory) {
        this.queensHistory = [];
        this.queensMoves = 0;
      }
      this.resetQueensTimer();
      if (this.dom.queensMovesBadge) {
        this.dom.queensMovesBadge.textContent = `Züge: ${this.queensMoves}`;
      }
      if (this.dom.queensFeedback) {
        this.dom.queensFeedback.className = 'game-inline-feedback';
        this.dom.queensFeedback.textContent = '';
      }
      this.renderQueens();
    }

    undoQueensMove() {
      if (!this.queensHistory.length) return;
      const last = this.queensHistory.pop();
      this.queensUserGrid[last.r][last.c] = last.prevVal;
      const key = `${last.r},${last.c}`;
      if (last.prevVal === 'X') {
        this.queensManualX.add(key);
      } else {
        this.queensManualX.delete(key);
      }
      if (this.queensAutoXEnabled) {
        this.autoXQueens();
      }
      this.queensMoves = Math.max(0, this.queensMoves - 1);
      if (this.dom.queensMovesBadge) {
        this.dom.queensMovesBadge.textContent = `Züge: ${this.queensMoves}`;
      }
      this.renderQueens();
    }

    toggleQueensAutoX() {
      this.queensAutoXEnabled = !this.queensAutoXEnabled;
      if (this.dom.btnQueensAutoX) {
        this.dom.btnQueensAutoX.classList.toggle('active', this.queensAutoXEnabled);
        this.dom.btnQueensAutoX.innerHTML = `<span>⚡ Auto-X (${this.queensAutoXEnabled ? 'Aktiv' : 'Aus'})</span>`;
      }
      if (this.queensAutoXEnabled) {
        this.autoXQueens();
        this.renderQueens();
        this.suite.showToast('⚡ Auto-X aktiv: Ungültige Felder werden automatisch gekreuzt!');
      } else {
        this.suite.showToast('Auto-X deaktiviert.');
      }
    }

    autoXQueens() {
      // Auto-X wirklich automatisch: Markiert alle ungültigen Felder um gesetzte Kronen mit 'X'
      const board = this.getActiveQueensBoard();
      if (!board) return false;
      const size = board.size;
      let changed = false;

      const placedQueens = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (this.queensUserGrid[r][c] === 'Q') {
            placedQueens.push({ r, c, reg: board.regions[r][c] });
          }
        }
      }

      const blockedByQueens = new Set();
      for (const q of placedQueens) {
        for (let tr = 0; tr < size; tr++) {
          for (let tc = 0; tc < size; tc++) {
            if (tr === q.r && tc === q.c) continue;
            const isNeighbor = Math.abs(tr - q.r) <= 1 && Math.abs(tc - q.c) <= 1;
            const isRow = tr === q.r;
            const isCol = tc === q.c;
            const isRegion = board.regions[tr][tc] === q.reg;
            if (isNeighbor || isRow || isCol || isRegion) {
              blockedByQueens.add(`${tr},${tc}`);
            }
          }
        }
      }

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const key = `${r},${c}`;
          if (this.queensUserGrid[r][c] === 'Q') continue;

          if (blockedByQueens.has(key)) {
            if (this.queensUserGrid[r][c] !== 'X') {
              this.queensUserGrid[r][c] = 'X';
              changed = true;
            }
          } else {
            // Wenn nicht mehr durch eine Krone blockiert:
            // Falls es ein Auto-X war (nicht manuell gesetzt), wieder aufheben!
            if (this.queensUserGrid[r][c] === 'X' && !this.queensManualX.has(key)) {
              this.queensUserGrid[r][c] = null;
              changed = true;
            }
          }
        }
      }

      return changed;
    }

    handleQueensCellClick(r, c, forceQueen = false) {
      // Timer startet erst bei der allerersten Benutzer-Interaktion!
      if (!this.queensTimerStarted) {
        this.startQueensTimer();
        this.queensTimerStarted = true;
      }

      const cur = this.queensUserGrid[r][c];
      let nextVal = null;

      if (forceQueen) {
        nextVal = cur === 'Q' ? null : 'Q';
      } else {
        // Cycle: null -> 'X' -> 'Q' -> null
        if (cur === null) nextVal = 'X';
        else if (cur === 'X') nextVal = 'Q';
        else nextVal = null;
      }

      const key = `${r},${c}`;
      if (nextVal === 'X') {
        this.queensManualX.add(key);
      } else {
        this.queensManualX.delete(key);
      }

      this.queensHistory.push({ r, c, prevVal: cur, newVal: nextVal });
      this.queensUserGrid[r][c] = nextVal;
      this.queensMoves += 1;

      if (this.dom.queensMovesBadge) {
        this.dom.queensMovesBadge.textContent = `Züge: ${this.queensMoves}`;
      }

      // Auto-X wird wirklich automatisch ausgeführt!
      if (this.queensAutoXEnabled) {
        this.autoXQueens();
      }

      this.suite.sound.playClick();
      this.renderQueens();
      this.checkQueensStatus();
    }


        getQueensClashes() {

      const board = this.getActiveQueensBoard();

      const size = board.size;

      const clashes = new Set();

      const placedQueens = [];



      for (let r = 0; r < size; r++) {

        for (let c = 0; c < size; c++) {

          if (this.queensUserGrid[r][c] === 'Q') {

            placedQueens.push({ r, c, reg: board.regions[r][c] });

          }

        }

      }



      for (let i = 0; i < placedQueens.length; i++) {

        for (let j = i + 1; j < placedQueens.length; j++) {

          const q1 = placedQueens[i];

          const q2 = placedQueens[j];



          const sameRow = q1.r === q2.r;

          const sameCol = q1.c === q2.c;

          const sameReg = q1.reg === q2.reg;

          const touch = Math.abs(q1.r - q2.r) <= 1 && Math.abs(q1.c - q2.c) <= 1;



          if (sameRow || sameCol || sameReg || touch) {

            clashes.add(`${q1.r},${q1.c}`);

            clashes.add(`${q2.r},${q2.c}`);

          }

        }

      }



      return { clashes, count: placedQueens.length };

    }



    checkQueensStatus() {

      const board = this.getActiveQueensBoard();

      const size = board.size;

      const { clashes, count } = this.getQueensClashes();



      if (clashes.size > 0) {

        if (this.dom.queensFeedback) {

          this.dom.queensFeedback.className = 'game-inline-feedback error show';

          this.dom.queensFeedback.textContent = '⚠️ Konflikt! Kronen dürfen sich nicht berühren und nur 1 pro Zeile/Spalte/Farbzone.';

        }

        return;

      }



      if (count === size && clashes.size === 0) {

        // Solved!

        if (this.queensTimerInterval) clearInterval(this.queensTimerInterval);

        this.suite.sound.playSuccess();

        this.suite.confetti.fire();



        const lvl = this.getCurrentLevel('queens');
        this.markLevelSolved('queens', lvl);

        if (this.dom.queensFeedback) {
          const m = Math.floor(this.queensTime / 60);
          const s = this.queensTime % 60;
          this.dom.queensFeedback.className = 'game-inline-feedback success show';
          this.dom.queensFeedback.innerHTML = `
            <span>👑 Board #${lvl} fehlerfrei gelöst in ${this.queensMoves} Zügen (${m}m ${s}s)!</span>
            <button class="btn-inline-next" id="btn-queens-next-win">Nächstes Board ▶</button>
          `;
          const nextBtn = document.getElementById('btn-queens-next-win');
          if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextGameLevel('queens'));
          }
        }

        this.suite.showToast(`👑 Queens Board #${lvl} fehlerfrei gemeistert!`);
        this.updateGameBanner('queens');

      } else {

        if (this.dom.queensFeedback) {

          this.dom.queensFeedback.className = 'game-inline-feedback';

          this.dom.queensFeedback.textContent = '';

        }

      }

    }



    renderQueensBanner() {
      this.updateGameBanner('queens');
    }



    renderQueens() {
      this.renderQueensBanner();
      if (!this.dom.queensGrid) return;

      const board = this.getActiveQueensBoard();
      const size = board.size;
      const { clashes } = this.getQueensClashes();
      const gridEl = this.dom.queensGrid;
      gridEl.innerHTML = '';
      gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      gridEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

      // Setup Click & Drag for X
      gridEl.onpointerdown = (e) => {
        if (e.button !== 0) return;
        const cell = e.target.closest('.queens-cell');
        if (!cell) return;
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        if (isNaN(r) || isNaN(c)) return;

        if (!this.queensTimerStarted) {
          this.startQueensTimer();
          this.queensTimerStarted = true;
        }

        this.queensIsDraggingX = true;
        this.queensDragChanged = false;
        gridEl.classList.add('dragging-x');

        // If clicking on an empty cell, immediately paint X and allow dragging
        if (this.queensUserGrid[r][c] === null) {
          this.queensUserGrid[r][c] = 'X';
          this.queensManualX.add(`${r},${c}`);
          this.queensHistory.push({ r, c, prevVal: null, newVal: 'X' });
          this.queensMoves += 1;
          this.queensDragChanged = true;
          cell.classList.add('cell-cross');
          if (this.dom.queensMovesBadge) {
            this.dom.queensMovesBadge.textContent = `Züge: ${this.queensMoves}`;
          }
        }
      };

      gridEl.onpointermove = (e) => {
        if (!this.queensIsDraggingX) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const cell = target?.closest('.queens-cell');
        if (!cell) return;
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        if (isNaN(r) || isNaN(c)) return;

        if (this.queensUserGrid[r][c] === null) {
          this.queensUserGrid[r][c] = 'X';
          this.queensManualX.add(`${r},${c}`);
          this.queensHistory.push({ r, c, prevVal: null, newVal: 'X' });
          this.queensMoves += 1;
          this.queensDragChanged = true;
          cell.classList.add('cell-cross');
          if (this.dom.queensMovesBadge) {
            this.dom.queensMovesBadge.textContent = `Züge: ${this.queensMoves}`;
          }
        }
      };

      const stopQueensDrag = () => {
        if (!this.queensIsDraggingX) return;
        this.queensIsDraggingX = false;
        gridEl.classList.remove('dragging-x');
        if (this.queensDragChanged) {
          this.queensSuppressClick = true;
          setTimeout(() => { this.queensSuppressClick = false; }, 100);
          this.suite.sound.playClick();
          if (this.queensAutoXEnabled) {
            this.autoXQueens();
          }
          this.renderQueens();
          this.checkQueensStatus();
        }
      };

      if (!this.queensWindowPointerUpBound) {
        window.addEventListener('pointerup', stopQueensDrag);
        window.addEventListener('pointercancel', stopQueensDrag);
        this.queensWindowPointerUpBound = true;
      }

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = document.createElement('div');
          const reg = board.regions[r][c];
          cell.className = `queens-cell reg-${reg}`;
          cell.dataset.r = r;
          cell.dataset.c = c;

          // Heavy region borders between different colored regions
          if (r === 0 || board.regions[r - 1][c] !== reg) cell.classList.add('border-top');
          if (c === size - 1 || board.regions[r][c + 1] !== reg) cell.classList.add('border-right');
          if (r === size - 1 || board.regions[r + 1][c] !== reg) cell.classList.add('border-bottom');
          if (c === 0 || board.regions[r][c - 1] !== reg) cell.classList.add('border-left');

          const val = this.queensUserGrid[r][c];
          if (val === 'Q') cell.classList.add('cell-queen');
          else if (val === 'X') cell.classList.add('cell-cross');

          if (clashes.has(`${r},${c}`)) {
            cell.classList.add('cell-clash');
          }

          cell.addEventListener('click', () => {
            if (this.queensSuppressClick) return;
            this.handleQueensCellClick(r, c, false);
          });
          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleQueensCellClick(r, c, true);
          });

          gridEl.appendChild(cell);
        }
      }
    }



    // ==========================================

    // 2. TANGO LOGIC ENGINE

    // ==========================================

    getTangoDailyPuzzle() {

      const cycle = this.getGermanDailyCycle();

      const parts = cycle.cycleKey.split('-').map(Number);

      const epoch = Date.UTC(2026, 0, 1);

      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);

      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));

      const idx = (dayDiff * 3 + 2) % this.tangoData.length;

      return this.tangoData[idx];

    }



    getActiveTangoPuzzle() {
      return this.getPuzzle('tango', this.getCurrentLevel('tango'));
    }



    initTango() {
      this.populateLevelSelect('tango');
      this.resetTangoBoard();
      this.renderTango();
    }

    resetTangoTimer() {
      if (this.tangoTimerInterval) clearInterval(this.tangoTimerInterval);
      this.tangoTimerInterval = null;
      this.tangoTime = 0;
      this.tangoTimerStarted = false;
      if (this.dom.tangoTimerBadge) {
        this.dom.tangoTimerBadge.textContent = '⏱️ 00:00';
      }
    }

    startTangoTimer() {
      if (this.tangoTimerInterval) clearInterval(this.tangoTimerInterval);
      this.tangoTime = 0;
      this.tangoTimerInterval = setInterval(() => {
        this.tangoTime += 1;
        if (this.dom.tangoTimerBadge) {
          const m = String(Math.floor(this.tangoTime / 60)).padStart(2, '0');
          const s = String(this.tangoTime % 60).padStart(2, '0');
          this.dom.tangoTimerBadge.textContent = `⏱️ ${m}:${s}`;
        }
      }, 1000);
    }

    resetTangoBoard() {
      const puzzle = this.getActiveTangoPuzzle();
      const size = puzzle.size;
      this.tangoUserGrid = Array(size).fill(null).map((_, r) =>
        Array(size).fill(null).map((_, c) => puzzle.givens[r][c])
      );
      this.resetTangoTimer();
      if (this.dom.tangoFeedback) {
        this.dom.tangoFeedback.className = 'game-inline-feedback';
        this.dom.tangoFeedback.textContent = '';
      }
      this.renderTango();
    }

    handleTangoCellClick(r, c) {
      const puzzle = this.getActiveTangoPuzzle();
      if (puzzle.givens[r][c] !== null) return; // Locked given cell

      // Timer erst bei erster Interaktion starten!
      if (!this.tangoTimerStarted) {
        this.startTangoTimer();
        this.tangoTimerStarted = true;
      }

      const cur = this.tangoUserGrid[r][c];
      let next = null;
      if (cur === null) next = 'S';
      else if (cur === 'S') next = 'M';
      else next = null;

      this.tangoUserGrid[r][c] = next;
      this.suite.sound.playClick();
      this.renderTango();
      this.checkTangoStatus();
    }



    checkTangoStatus() {

      const puzzle = this.getActiveTangoPuzzle();

      const size = puzzle.size;

      const grid = this.tangoUserGrid;

      let hasError = false;

      let filledCount = 0;



      // Check rows: count <= 3 and no 3 in a row

      for (let r = 0; r < size; r++) {

        let sCnt = 0, mCnt = 0;

        for (let c = 0; c < size; c++) {

          if (grid[r][c] === 'S') sCnt++;

          if (grid[r][c] === 'M') mCnt++;

          if (grid[r][c] !== null) filledCount++;

        }

        if (sCnt > 3 || mCnt > 3) hasError = true;

        for (let c = 0; c < size - 2; c++) {

          if (grid[r][c] && grid[r][c] === grid[r][c+1] && grid[r][c+1] === grid[r][c+2]) {

            hasError = true;

          }

        }

      }



      // Check cols: count <= 3 and no 3 in a col

      for (let c = 0; c < size; c++) {

        let sCnt = 0, mCnt = 0;

        for (let r = 0; r < size; r++) {

          if (grid[r][c] === 'S') sCnt++;

          if (grid[r][c] === 'M') mCnt++;

        }

        if (sCnt > 3 || mCnt > 3) hasError = true;

        for (let r = 0; r < size - 2; r++) {

          if (grid[r][c] && grid[r][c] === grid[r+1][c] && grid[r+1][c] === grid[r+2][c]) {

            hasError = true;

          }

        }

      }



      // Check constraints

      puzzle.hEdges.forEach(e => {

        const v1 = grid[e.r][e.c];

        const v2 = grid[e.r][e.c+1];

        if (v1 && v2) {

          if (e.op === '=' && v1 !== v2) hasError = true;

          if (e.op === 'x' && v1 === v2) hasError = true;

        }

      });



      puzzle.vEdges.forEach(e => {

        const v1 = grid[e.r][e.c];

        const v2 = grid[e.r+1][e.c];

        if (v1 && v2) {

          if (e.op === '=' && v1 !== v2) hasError = true;

          if (e.op === 'x' && v1 === v2) hasError = true;

        }

      });



      if (hasError) {

        if (this.dom.tangoFeedback) {

          this.dom.tangoFeedback.className = 'game-inline-feedback error show';

          this.dom.tangoFeedback.textContent = '⚠️ Bedingung verletzt! Beachte max. 2 gleiche Symbole und = / ✕.';

        }

        return;

      }



      if (filledCount === size * size && !hasError) {

        if (this.tangoTimerInterval) clearInterval(this.tangoTimerInterval);

        this.suite.sound.playSuccess();

        this.suite.confetti.fire();



        const lvl = this.getCurrentLevel('tango');
        this.markLevelSolved('tango', lvl);

        if (this.dom.tangoFeedback) {
          const m = Math.floor(this.tangoTime / 60);
          const s = this.tangoTime % 60;
          this.dom.tangoFeedback.className = 'game-inline-feedback success show';
          this.dom.tangoFeedback.innerHTML = `
            <span>☀️🌙 Board #${lvl} meisterhaft gelöst (${m}m ${s}s)!</span>
            <button class="btn-inline-next" id="btn-tango-next-win">Nächstes Board ▶</button>
          `;
          const nextBtn = document.getElementById('btn-tango-next-win');
          if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextGameLevel('tango'));
          }
        }

        this.suite.showToast(`☀️🌙 Tango Board #${lvl} erfolgreich gelöst!`);
        this.updateGameBanner('tango');

      } else {

        if (this.dom.tangoFeedback) {

          this.dom.tangoFeedback.className = 'game-inline-feedback';

          this.dom.tangoFeedback.textContent = '';

        }

      }

    }



    renderTangoBanner() {
      this.updateGameBanner('tango');
    }



    renderTango() {

      this.renderTangoBanner();

      if (!this.dom.tangoGrid) return;



      const puzzle = this.getActiveTangoPuzzle();

      const size = puzzle.size;

      const gridEl = this.dom.tangoGrid;

      gridEl.innerHTML = '';



      const container = document.createElement('div');

      container.className = 'tango-board-card-inner';

      container.style.gridTemplateColumns = `repeat(${size}, 58px)`;

      container.style.gridTemplateRows = `repeat(${size}, 58px)`;



      // Render cells

      for (let r = 0; r < size; r++) {

        for (let c = 0; c < size; c++) {

          const cell = document.createElement('div');

          const isGiven = puzzle.givens[r][c] !== null;

          cell.className = `tango-cell ${isGiven ? 'given' : ''}`;



          const val = this.tangoUserGrid[r][c];

          if (val === 'S') cell.classList.add('val-sun');

          else if (val === 'M') cell.classList.add('val-moon');



          cell.addEventListener('click', () => this.handleTangoCellClick(r, c));

          container.appendChild(cell);

        }

      }



      // Overlay horizontal constraint badges

      puzzle.hEdges.forEach(e => {

        const badge = document.createElement('div');

        badge.className = 'tango-constraint-h';

        badge.textContent = e.op === '=' ? '=' : '✕';

        // Position between (e.r, e.c) and (e.r, e.c + 1)

        const cellW = 58 + 12; // cell + gap

        badge.style.left = `${(e.c + 1) * cellW - 6}px`;

        badge.style.top = `${e.r * cellW + 29}px`;

        container.appendChild(badge);

      });



      // Overlay vertical constraint badges

      puzzle.vEdges.forEach(e => {

        const badge = document.createElement('div');

        badge.className = 'tango-constraint-v';

        badge.textContent = e.op === '=' ? '=' : '✕';

        const cellW = 58 + 12;

        badge.style.left = `${e.c * cellW + 29}px`;

        badge.style.top = `${(e.r + 1) * cellW - 6}px`;

        container.appendChild(badge);

      });



      gridEl.appendChild(container);

    }



    // ==========================================

    // 3. PINPOINT LOGIC ENGINE

    // ==========================================

    getPinpointDailyChallenge() {

      const cycle = this.getGermanDailyCycle();

      const parts = cycle.cycleKey.split('-').map(Number);

      const epoch = Date.UTC(2026, 0, 1);

      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);

      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));

      const idx = (dayDiff * 7 + 4) % this.pinpointData.length;

      return this.pinpointData[idx];

    }



    getActivePinpointChallenge() {
      return this.getPuzzle('pinpoint', this.getCurrentLevel('pinpoint'));
    }



    initPinpoint() {
      this.populateLevelSelect('pinpoint');



      this.resetPinpoint();

    }



    resetPinpoint() {

      this.pinpointRevealedClues = 1;

      this.pinpointAttemptsLeft = 5;

      this.pinpointIsSolved = false;



      if (this.dom.pinpointGuessInput) {

        this.dom.pinpointGuessInput.value = '';

        this.dom.pinpointGuessInput.disabled = false;

      }

      if (this.dom.pinpointFeedback) {

        this.dom.pinpointFeedback.className = 'game-inline-feedback';

        this.dom.pinpointFeedback.textContent = '';

      }

      if (this.dom.btnPinpointSubmit) {

        this.dom.btnPinpointSubmit.disabled = false;

      }



      this.renderPinpoint();

    }



    revealNextPinpointClue() {

      if (this.pinpointIsSolved || this.pinpointRevealedClues >= 5) return;

      this.pinpointRevealedClues += 1;

      this.pinpointAttemptsLeft = Math.max(1, this.pinpointAttemptsLeft - 1);

      this.suite.sound.playClick();

      this.renderPinpoint();

    }



    submitPinpointGuess() {
      if (this.pinpointIsSolved || !this.dom.pinpointGuessInput) return;
      const guess = this.dom.pinpointGuessInput.value.trim().toLowerCase();
      if (!guess) return;

      // Sofortiges Leeren des Eingabefeldes nach dem Guess!
      this.dom.pinpointGuessInput.value = '';
      this.dom.pinpointGuessInput.focus();



      const challenge = this.getActivePinpointChallenge();

      const normalize = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, '');

      const normGuess = normalize(guess);



      const isMatch = challenge.keywords.some(k => {

        const normK = normalize(k);

        return normGuess.includes(normK) || normK.includes(normGuess);

      });



      if (isMatch) {

        // Success!

        this.pinpointIsSolved = true;

        this.pinpointRevealedClues = 5;

        this.dom.pinpointGuessInput.disabled = true;

        if (this.dom.btnPinpointSubmit) this.dom.btnPinpointSubmit.disabled = true;



        this.suite.sound.playSuccess();

        this.suite.confetti.fire();



        const lvl = this.getCurrentLevel('pinpoint');
        this.markLevelSolved('pinpoint', lvl);

        if (this.dom.pinpointFeedback) {
          this.dom.pinpointFeedback.className = 'game-inline-feedback success show';
          this.dom.pinpointFeedback.innerHTML = `
            <span>🎯 Volltreffer! Die Kategorie lautet "${challenge.category}"!</span>
            <button class="btn-inline-next" id="btn-pinpoint-next-win">Nächstes Rätsel ▶</button>
          `;
          const nextBtn = document.getElementById('btn-pinpoint-next-win');
          if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextGameLevel('pinpoint'));
          }
        }

        this.suite.showToast(`🎯 Pinpoint #${lvl} gelöst: ${challenge.category}!`);
        this.renderPinpoint();
        this.updateGameBanner('pinpoint');

      } else {

        // Wrong guess

        this.pinpointAttemptsLeft -= 1;

        this.suite.sound.playError();



        if (this.pinpointAttemptsLeft <= 0) {

          // Out of attempts, reveal category

          this.pinpointRevealedClues = 5;

          this.dom.pinpointGuessInput.disabled = true;

          if (this.dom.btnPinpointSubmit) this.dom.btnPinpointSubmit.disabled = true;



          if (this.dom.pinpointFeedback) {

            this.dom.pinpointFeedback.className = 'game-inline-feedback error show';

            this.dom.pinpointFeedback.textContent = `Leider vorbei! Die gesuchte Kategorie war: "${challenge.category}".`;

          }

        } else {

          // Reveal next clue

          if (this.pinpointRevealedClues < 5) {

            this.pinpointRevealedClues += 1;

          }

          if (this.dom.pinpointFeedback) {

            this.dom.pinpointFeedback.className = 'game-inline-feedback error show';

            this.dom.pinpointFeedback.textContent = `Nicht ganz! Noch ${this.pinpointAttemptsLeft} Versuche übrig.`;

          }

        }



        this.renderPinpoint();

      }

    }



    renderPinpointBanner() {
      this.updateGameBanner('pinpoint');
    }



    renderPinpoint() {

      this.renderPinpointBanner();

      const challenge = this.getActivePinpointChallenge();



      if (this.dom.pinpointAttemptsBadge) {

        this.dom.pinpointAttemptsBadge.textContent = `Versuche: ${this.pinpointAttemptsLeft} übrig`;

      }



      if (this.dom.pinpointCluesList) {

        this.dom.pinpointCluesList.innerHTML = '';

        challenge.clues.forEach((clueText, idx) => {

          const isRevealed = idx < this.pinpointRevealedClues;

          const card = document.createElement('div');

          card.className = `pinpoint-clue-card ${isRevealed ? 'revealed' : 'locked'}`;

          card.innerHTML = `

            <div class="clue-number-pill ${isRevealed ? '' : 'locked-pill'}">${isRevealed ? (idx + 1) : '🔒'}</div>

            <div class="clue-text-body">${isRevealed ? clueText : '••••••••••••'}</div>

          `;

          this.dom.pinpointCluesList.appendChild(card);

        });

      }

    }


    // ==========================================
    // 4. CROSSCLIMB LOGIC ENGINE (Word Ladder)
    // ==========================================
    getCrossclimbDaily() {
      const cycle = this.getGermanDailyCycle();
      const parts = cycle.cycleKey.split('-').map(Number);
      const epoch = Date.UTC(2026, 0, 1);
      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));
      const idx = (dayDiff * 4 + 3) % this.crossclimbData.length;
      return this.crossclimbData[idx];
    }

    getActiveCrossclimb() {
      return this.getPuzzle('crossclimb', this.getCurrentLevel('crossclimb'));
    }

    initCrossclimb() {
      this.populateLevelSelect('crossclimb');
      this.resetCrossclimb();
    }

    crossclimbWordDiff(w1, w2) {
      if (!w1 || !w2 || w1.length !== w2.length) return 99;
      let diff = 0;
      for (let i = 0; i < w1.length; i++) {
        if (w1[i] !== w2[i]) diff++;
      }
      return diff;
    }

    getCrossclimbCompoundClue(challenge) {
      if (challenge.compoundClue) return challenge.compoundClue;
      const top = challenge.words[0];
      const bot = challenge.words[challenge.words.length - 1];
      const map = {
        'KALT+BILD': 'Frostige Momentaufnahme / Winterliches Kunstwerk (KALT + BILD)',
        'SAND+RIND': 'Feiner Strand trifft Weidetier (SAND + RIND)',
        'BOOT+PEST': 'Seefahrt und historische Seuche (BOOT + PEST)',
        'GOLD+HELM': 'Glänzender Kopfschutz für echte Helden (GOLD + HELM)',
        'WIND+DANK': 'Anerkennung und Dankbarkeit im Sturm (WIND + DANK)',
        'BALL+HELM': 'Sicherheitsausrüstung beim Ballsport (BALL + HELM)',
        'KIND+BUNT': 'Farbenfrohe Welt der Kleinsten (KIND + BUNT)',
        'HAUS+FAHL': 'Düstere Behausung im fahlen Mondlicht (HAUS + FAHL)',
        'ZEIT+WORT': 'Grammatischer Fachbegriff für ein Verb (ZEIT + WORT)',
        'BUCH+NACH': 'Nachschlagen im Wissenswerk (BUCH + NACH)',
        'MEER+HIER': 'Das offene Meer direkt an diesem Ort (MEER + HIER)',
        'TORF+BORN': 'Moorland und sprudelnde Naturquelle (TORF + BORN)',
        'WEIN+FERN': 'Edler Tropfen aus fernen Ländern (WEIN + FERN)',
        'LUFT+REST': 'Die verbleibende Atemreserve in der Flasche (LUFT + REST)'
      };
      const key = `${top}+${bot}`;
      return map[key] || `Decke und Boden bilden zusammen das Begriffspaar "${top} + ${bot}"`;
    }

    resetCrossclimb() {
      const challenge = this.getActiveCrossclimb();
      const words = challenge.words;
      const clues = challenge.clues;
      const lastIdx = words.length - 1;

      this.crossclimbDecke = {
        targetWord: words[0].toUpperCase(),
        clue: clues[0],
        currentWord: '',
        isSolved: false
      };
      this.crossclimbBoden = {
        targetWord: words[lastIdx].toUpperCase(),
        clue: clues[lastIdx],
        currentWord: '',
        isSolved: false
      };

      const middle = [];
      for (let i = 1; i < lastIdx; i++) {
        middle.push({
          targetWord: words[i].toUpperCase(),
          clue: clues[i],
          currentWord: '',
          isSolved: false,
          origIndex: i
        });
      }

      // Shuffle rungs deterministically
      if (middle.length === 3) {
        this.crossclimbRungs = [middle[1], middle[2], middle[0]];
      } else if (middle.length === 4) {
        this.crossclimbRungs = [middle[2], middle[0], middle[3], middle[1]];
      } else {
        this.crossclimbRungs = middle.slice().reverse();
      }

      this.crossclimbStep = 1; // 1: Erraten, 2: Sortieren, 3: Decke & Boden
      this.crossclimbLadderDirection = 'forward';
      this.crossclimbCompoundClue = this.getCrossclimbCompoundClue(challenge);

      if (this.dom.crossclimbFeedback) {
        this.dom.crossclimbFeedback.className = 'game-inline-feedback';
        this.dom.crossclimbFeedback.textContent = '';
      }
      this.renderCrossclimb();
    }

    moveCrossclimbRung(fromIdx, toIdx) {
      if (toIdx < 0 || toIdx >= this.crossclimbRungs.length) return;
      const item = this.crossclimbRungs.splice(fromIdx, 1)[0];
      this.crossclimbRungs.splice(toIdx, 0, item);
      this.suite.sound.playClick();
      this.checkCrossclimbLadderOrder();
      this.renderCrossclimb();
    }

    reverseCrossclimbRungs() {
      this.crossclimbRungs.reverse();
      this.crossclimbLadderDirection = this.crossclimbLadderDirection === 'forward' ? 'reverse' : 'forward';
      this.suite.sound.playClick();
      this.renderCrossclimb();
      this.checkCrossclimbWin();
    }

    checkCrossclimbLadderOrder() {
      if (this.crossclimbStep < 2) return;
      const rungs = this.crossclimbRungs;
      let isChain = true;
      for (let i = 0; i < rungs.length - 1; i++) {
        if (this.crossclimbWordDiff(rungs[i].targetWord, rungs[i + 1].targetWord) !== 1) {
          isChain = false;
          break;
        }
      }

      if (isChain) {
        const topRung = rungs[0].targetWord;
        const botRung = rungs[rungs.length - 1].targetWord;
        const deckeWord = this.crossclimbDecke.targetWord;
        const bodenWord = this.crossclimbBoden.targetWord;

        const forwardMatch = (this.crossclimbWordDiff(deckeWord, topRung) === 1) && (this.crossclimbWordDiff(botRung, bodenWord) === 1);
        const reverseMatch = (this.crossclimbWordDiff(bodenWord, topRung) === 1) && (this.crossclimbWordDiff(botRung, deckeWord) === 1);

        if (reverseMatch && !forwardMatch) {
          this.crossclimbLadderDirection = 'reverse';
        } else {
          this.crossclimbLadderDirection = 'forward';
        }

        if (this.crossclimbStep < 3) {
          this.crossclimbStep = 3;
          this.suite.sound.playSuccess();
          this.suite.showToast('🪜 Leiter perfekt geordnet! Schritt 3: Decke & Boden lüften!');
        }
      }
    }

    checkCrossclimbWin() {
      if (this.crossclimbStep === 3 &&
          this.crossclimbDecke.currentWord === this.crossclimbDecke.targetWord &&
          this.crossclimbBoden.currentWord === this.crossclimbBoden.targetWord) {

        this.suite.sound.playSuccess();
        this.suite.confetti.fire();

        const lvl = this.getCurrentLevel('crossclimb');
        this.markLevelSolved('crossclimb', lvl);

        if (this.dom.crossclimbFeedback) {
          this.dom.crossclimbFeedback.className = 'game-inline-feedback success show';
          this.dom.crossclimbFeedback.innerHTML = `
            <span>🎉 Genial! Decke ("${this.crossclimbDecke.targetWord}") und Boden ("${this.crossclimbBoden.targetWord}") lückenlos verbunden!</span>
            <button class="btn-inline-next" id="btn-crossclimb-next-win">Nächste Leiter ▶</button>
          `;
          const nextBtn = document.getElementById('btn-crossclimb-next-win');
          if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextGameLevel('crossclimb'));
          }
        }

        this.suite.showToast(`🪜 Crossclimb Leiter #${lvl} fehlerfrei erklommen!`);
        this.updateGameBanner('crossclimb');
      }
    }

    checkCrossclimb() {
      if (this.crossclimbStep === 1) {
        const solved = this.crossclimbRungs.filter(r => r.isSolved || r.currentWord === r.targetWord).length;
        if (solved < this.crossclimbRungs.length) {
          this.suite.sound.playError();
          if (this.dom.crossclimbFeedback) {
            this.dom.crossclimbFeedback.className = 'game-inline-feedback error show';
            this.dom.crossclimbFeedback.textContent = `Schritt 1: Errate zuerst alle ${this.crossclimbRungs.length} Leiterwörter (${solved}/${this.crossclimbRungs.length} erraten)!`;
          }
        }
      } else if (this.crossclimbStep === 2) {
        this.checkCrossclimbLadderOrder();
        if (this.crossclimbStep < 3) {
          this.suite.sound.playError();
          if (this.dom.crossclimbFeedback) {
            this.dom.crossclimbFeedback.className = 'game-inline-feedback error show';
            this.dom.crossclimbFeedback.textContent = 'Schritt 2: Die Sprossen bilden noch keine lückenlose 1-Buchstaben-Kette. Nutze Drag & Drop oder ▲ / ▼!';
          }
        }
      } else {
        this.checkCrossclimbWin();
        if (this.crossclimbDecke.currentWord !== this.crossclimbDecke.targetWord ||
            this.crossclimbBoden.currentWord !== this.crossclimbBoden.targetWord) {
          this.suite.sound.playError();
          if (this.dom.crossclimbFeedback) {
            this.dom.crossclimbFeedback.className = 'game-inline-feedback error show';
            this.dom.crossclimbFeedback.textContent = 'Schritt 3: Trage noch das passende Wort für Decke und Boden ein!';
          }
        }
      }
    }

    renderCrossclimbBanner() {
      this.updateGameBanner('crossclimb');
    }

    renderCrossclimb() {
      this.renderCrossclimbBanner();
      if (!this.dom.crossclimbLadderList) return;

      const listEl = this.dom.crossclimbLadderList;
      listEl.innerHTML = '';

      // 1. Step Progress Tracker
      const tracker = document.createElement('div');
      tracker.className = 'crossclimb-step-tracker';
      tracker.innerHTML = `
        <div class="step-indicator-pill ${this.crossclimbStep === 1 ? 'active' : 'completed'}">
          ${this.crossclimbStep > 1 ? '✓' : '1.'} 🔍 Sprossen erraten
        </div>
        <div class="step-indicator-pill ${this.crossclimbStep === 2 ? 'active' : (this.crossclimbStep > 2 ? 'completed' : '')}">
          ${this.crossclimbStep > 2 ? '✓' : '2.'} ↕️ Sortieren (Drag & Drop)
        </div>
        <div class="step-indicator-pill ${this.crossclimbStep === 3 ? 'active' : ''}">
          3. 🔓 Decke & Boden lüften
        </div>
      `;
      listEl.appendChild(tracker);

      // 2. DECKE (Top Rung)
      const deckeCard = document.createElement('div');
      const isDeckeUnlocked = this.crossclimbStep === 3;
      const isDeckeCorrect = this.crossclimbDecke.currentWord === this.crossclimbDecke.targetWord;
      deckeCard.className = `crossclimb-end-card decke ${isDeckeUnlocked ? 'unlocked' : 'locked'} ${isDeckeCorrect ? 'valid-rung' : ''}`;
      deckeCard.innerHTML = `
        <div class="rung-left">
          <div class="rung-number-pill">${isDeckeUnlocked ? '🏠' : '🔒'}</div>
          <div class="rung-clue-container">
            <span class="end-card-tag">DECKE (Oben)</span>
            <div class="rung-clue-text">${isDeckeUnlocked ? this.crossclimbDecke.clue : 'Wird nach Sortierung der Leiter freigeschaltet'}</div>
          </div>
        </div>
        ${isDeckeUnlocked ? `
          <input type="text" class="rung-word-input decke-input" maxlength="4" value="${this.crossclimbDecke.currentWord}" placeholder="____" />
        ` : `
          <span class="rung-locked-badge">🔒 Gesperrt</span>
        `}
      `;
      if (isDeckeUnlocked) {
        const input = deckeCard.querySelector('.decke-input');
        input.addEventListener('input', (e) => {
          this.crossclimbDecke.currentWord = e.target.value.toUpperCase();
          if (this.crossclimbDecke.currentWord === this.crossclimbDecke.targetWord) {
            this.suite.sound.playPop();
          }
          this.checkCrossclimbWin();
          this.renderCrossclimb();
        });
      }
      listEl.appendChild(deckeCard);

      // 3. MIDDLE LADDER RUNGS (Drag and Drop Sortable)
      this.crossclimbRungs.forEach((rung, idx) => {
        const card = document.createElement('div');
        const isMatch = (rung.currentWord || '').trim().toUpperCase() === rung.targetWord;
        if (isMatch) rung.isSolved = true;

        const isDraggable = this.crossclimbStep >= 2;
        card.className = `crossclimb-rung-card ${rung.isSolved ? 'valid-rung' : ''} ${isDraggable ? 'draggable' : ''}`;
        card.dataset.rungIndex = idx;
        if (isDraggable) card.setAttribute('draggable', 'true');

        card.innerHTML = `
          ${isDraggable ? '<div class="rung-drag-handle" title="Ziehen zum Verschieben">⠿</div>' : ''}
          <div class="rung-left">
            <div class="rung-number-pill">${idx + 1}</div>
            <div class="rung-clue-text">${rung.clue}</div>
          </div>
          <input type="text" class="rung-word-input" maxlength="4" value="${rung.currentWord || ''}" placeholder="____" ${rung.isSolved && this.crossclimbStep >= 2 ? 'readonly' : ''} />
          <div class="rung-reorder-btns">
            <button class="btn-rung-move" ${idx === 0 || this.crossclimbStep < 2 ? 'disabled' : ''} data-dir="-1" title="Nach oben">▲</button>
            <button class="btn-rung-move" ${idx === this.crossclimbRungs.length - 1 || this.crossclimbStep < 2 ? 'disabled' : ''} data-dir="1" title="Nach unten">▼</button>
          </div>
        `;

        const input = card.querySelector('.rung-word-input');
        input.addEventListener('input', (e) => {
          rung.currentWord = e.target.value.toUpperCase();
          if (rung.currentWord === rung.targetWord) {
            rung.isSolved = true;
            this.suite.sound.playPop();
          }
          if (this.crossclimbRungs.every(r => r.isSolved || r.currentWord === r.targetWord)) {
            if (this.crossclimbStep === 1) {
              this.crossclimbStep = 2;
              this.suite.sound.playSuccess();
              this.suite.showToast('🎉 Alle Leiterwörter erraten! Schritt 2 freigeschaltet: Sortiere die Sprossen per Drag & Drop!');
              this.checkCrossclimbLadderOrder();
            }
          }
          this.renderCrossclimb();
        });

        // Up / Down Buttons
        const btnUp = card.querySelector('[data-dir="-1"]');
        const btnDown = card.querySelector('[data-dir="1"]');
        if (btnUp) btnUp.addEventListener('click', () => this.moveCrossclimbRung(idx, idx - 1));
        if (btnDown) btnDown.addEventListener('click', () => this.moveCrossclimbRung(idx, idx + 1));

        // Drag and Drop Events
        if (isDraggable) {
          card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', String(idx));
            card.classList.add('dragging');
          });
          card.addEventListener('dragover', (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
          });
          card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
          });
          card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            const srcIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(srcIdx) && srcIdx !== idx) {
              this.moveCrossclimbRung(srcIdx, idx);
            }
          });
          card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            listEl.querySelectorAll('.crossclimb-rung-card').forEach(c => c.classList.remove('drag-over'));
          });
        }

        listEl.appendChild(card);
      });

      // 4. BODEN (Bottom Rung)
      const bodenCard = document.createElement('div');
      const isBodenUnlocked = this.crossclimbStep === 3;
      const isBodenCorrect = this.crossclimbBoden.currentWord === this.crossclimbBoden.targetWord;
      bodenCard.className = `crossclimb-end-card boden ${isBodenUnlocked ? 'unlocked' : 'locked'} ${isBodenCorrect ? 'valid-rung' : ''}`;
      bodenCard.innerHTML = `
        <div class="rung-left">
          <div class="rung-number-pill">${isBodenUnlocked ? '⚓' : '🔒'}</div>
          <div class="rung-clue-container">
            <span class="end-card-tag">BODEN (Unten)</span>
            <div class="rung-clue-text">${isBodenUnlocked ? this.crossclimbBoden.clue : 'Wird nach Sortierung der Leiter freigeschaltet'}</div>
          </div>
        </div>
        ${isBodenUnlocked ? `
          <input type="text" class="rung-word-input boden-input" maxlength="4" value="${this.crossclimbBoden.currentWord}" placeholder="____" />
        ` : `
          <span class="rung-locked-badge">🔒 Gesperrt</span>
        `}
      `;
      if (isBodenUnlocked) {
        const input = bodenCard.querySelector('.boden-input');
        input.addEventListener('input', (e) => {
          this.crossclimbBoden.currentWord = e.target.value.toUpperCase();
          if (this.crossclimbBoden.currentWord === this.crossclimbBoden.targetWord) {
            this.suite.sound.playPop();
          }
          this.checkCrossclimbWin();
          this.renderCrossclimb();
        });
      }
      listEl.appendChild(bodenCard);

      // 5. STEP 3 DIRECTION NOTICE & COMPOUND CLUE
      if (this.crossclimbStep === 3) {
        if (this.crossclimbLadderDirection === 'reverse') {
          const revNotice = document.createElement('div');
          revNotice.className = 'crossclimb-direction-notice alert-warning';
          revNotice.innerHTML = `
            <div>
              🔄 <strong>Hinweis zur Reihenfolge:</strong> Deine Leiter ist aktuell rückwärts (z.B. 4, 3, 2, 1) sortiert.
              Da Decke und Boden zusammen ein Begriffspaar ergeben, beachte die vertauschte Leserichtung!
            </div>
            <button class="btn-reverse-ladder" id="btn-crossclimb-reverse-dir">Leiter umdrehen ↕️</button>
          `;
          listEl.appendChild(revNotice);
          const revBtn = revNotice.querySelector('#btn-crossclimb-reverse-dir');
          if (revBtn) revBtn.addEventListener('click', () => this.reverseCrossclimbRungs());
        }

        const tipCard = document.createElement('div');
        tipCard.className = 'crossclimb-compound-card';
        tipCard.innerHTML = `💡 <strong>Tipp für Decke & Boden:</strong> ${this.crossclimbCompoundClue}`;
        listEl.appendChild(tipCard);
      }

      if (this.dom.crossclimbStatusBadge) {
        const solved = this.crossclimbRungs.filter(r => r.isSolved).length;
        if (this.crossclimbStep === 1) {
          this.dom.crossclimbStatusBadge.textContent = `Schritt 1: ${solved}/${this.crossclimbRungs.length} erraten`;
        } else if (this.crossclimbStep === 2) {
          this.dom.crossclimbStatusBadge.textContent = 'Schritt 2: Leiter anordnen';
        } else {
          this.dom.crossclimbStatusBadge.textContent = 'Schritt 3: Decke & Boden';
        }
      }
    }

    // ==========================================
    // 5. ZIP LOGIC ENGINE (Path Connecting)
    // ==========================================
    getZipDaily() {
      const cycle = this.getGermanDailyCycle();
      const parts = cycle.cycleKey.split('-').map(Number);
      const epoch = Date.UTC(2026, 0, 1);
      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));
      const idx = (dayDiff * 6 + 1) % this.zipData.length;
      return this.zipData[idx];
    }

    getActiveZip() {
      return this.getPuzzle('zip', this.getCurrentLevel('zip'));
    }

    initZip() {
      this.populateLevelSelect('zip');
      this.resetZip();
    }

    resetZip() {
      const puzzle = this.getActiveZip();
      let startR = 0, startC = 0;
      for (const [coord, cp] of Object.entries(puzzle.checkpoints)) {
        if (cp.num === 1) {
          const [r, c] = coord.split(',').map(Number);
          startR = r;
          startC = c;
          break;
        }
      }
      this.zipPath = [{ r: startR, c: startC }];
      this.zipNextExpectedCp = 2;
      if (this.dom.zipFeedback) {
        this.dom.zipFeedback.className = 'game-inline-feedback';
        this.dom.zipFeedback.textContent = '';
      }
      this.renderZip();
    }

    undoZipStep() {
      if (this.zipPath.length > 1) {
        const puzzle = this.getActiveZip();
        const popped = this.zipPath.pop();
        const cp = puzzle.checkpoints[`${popped.r},${popped.c}`];
        if (cp) {
          this.zipNextExpectedCp = cp.num;
        }
        this.suite.sound.playClick();
        if (this.dom.zipFeedback) {
          this.dom.zipFeedback.className = 'game-inline-feedback';
          this.dom.zipFeedback.textContent = '';
        }
        this.renderZip();
      }
    }

    handleZipCellClick(r, c) {
      const path = this.zipPath;
      const last = path[path.length - 1];

      // If clicked on previous cell, undo to it
      if (path.length > 1 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
        this.undoZipStep();
        return;
      }

      // Check if already in path
      const alreadyVisited = path.some(p => p.r === r && p.c === c);
      if (alreadyVisited) return;

      // Must be adjacent (orthogonal) to last tip
      const isAdj = (Math.abs(last.r - r) + Math.abs(last.c - c)) === 1;
      if (!isAdj) return;

      const puzzle = this.getActiveZip();
      const cp = puzzle.checkpoints[`${r},${c}`];
      const nextStepIdx = path.length + 1;

      if (cp) {
        if (cp.num !== this.zipNextExpectedCp) {
          this.suite.sound.playError();
          if (this.dom.zipFeedback) {
            this.dom.zipFeedback.className = 'game-inline-feedback error show';
            this.dom.zipFeedback.textContent = `Besuche die Wegpunkte der Reihe nach! Nächster ist Wegpunkt ${this.zipNextExpectedCp}.`;
          }
          return;
        }
        if (nextStepIdx < cp.requiredStep) {
          this.suite.sound.playError();
          if (this.dom.zipFeedback) {
            this.dom.zipFeedback.className = 'game-inline-feedback error show';
            this.dom.zipFeedback.textContent = `Fülle zuerst die Zwischenfelder aus, bevor du Checkpoint ${cp.num} betrittst!`;
          }
          return;
        }
        this.zipNextExpectedCp += 1;
      }

      // Valid step!
      this.zipPath.push({ r, c });
      this.suite.sound.playClick();

      if (this.dom.zipFeedback) {
        this.dom.zipFeedback.className = 'game-inline-feedback';
        this.dom.zipFeedback.textContent = '';
      }

      this.renderZip();
      this.checkZipStatus();
    }

    checkZipStatus() {
      const puzzle = this.getActiveZip();
      const totalCells = puzzle.size * puzzle.size;

      if (this.zipPath.length === totalCells) {
        this.suite.sound.playSuccess();
        this.suite.confetti.fire();

        const lvl = this.getCurrentLevel('zip');
        this.markLevelSolved('zip', lvl);

        if (this.dom.zipFeedback) {
          this.dom.zipFeedback.className = 'game-inline-feedback success show';
          this.dom.zipFeedback.innerHTML = `
            <span>⚡ Genial gelöst! Pfad #${lvl} lückenlos verbunden!</span>
            <button class="btn-inline-next" id="btn-zip-next-win">Nächster Pfad ▶</button>
          `;
          const nextBtn = document.getElementById('btn-zip-next-win');
          if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextGameLevel('zip'));
          }
        }

        this.suite.showToast(`⚡ Zip Pfad #${lvl} erfolgreich vervollständigt!`);
        this.updateGameBanner('zip');
      }
    }

    renderZipBanner() {
      this.updateGameBanner('zip');
    }

    renderZip() {
      this.renderZipBanner();
      if (!this.dom.zipGrid) return;

      const puzzle = this.getActiveZip();
      const size = puzzle.size;
      const gridEl = this.dom.zipGrid;
      gridEl.innerHTML = '';
      const cellSize = 62;
      const gap = 8;
      gridEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
      gridEl.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;

      const pathMap = new Map();
      this.zipPath.forEach((p, idx) => {
        pathMap.set(`${p.r},${p.c}`, idx + 1);
      });
      const tip = this.zipPath[this.zipPath.length - 1];

      // 1. Render cells
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = document.createElement('div');
          const isTip = tip.r === r && tip.c === c;
          const isVisited = pathMap.has(`${r},${c}`);
          const cp = puzzle.checkpoints[`${r},${c}`];

          cell.className = `zip-cell ${isVisited ? 'visited' : ''} ${isTip ? 'current-tip' : ''} ${cp ? 'checkpoint' : ''}`;
          cell.dataset.r = r;
          cell.dataset.c = c;

          if (cp) {
            cell.textContent = cp.num;
          } else if (isVisited) {
            cell.innerHTML = '<div class="zip-cell-dot"></div>';
          } else {
            cell.textContent = '';
          }

          cell.addEventListener('click', () => this.handleZipCellClick(r, c));
          gridEl.appendChild(cell);
        }
      }

      // 2. Render SVG connecting line over the visited path
      if (this.zipPath.length > 0) {
        const totalSize = size * cellSize + (size - 1) * gap;
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('class', 'zip-path-svg');
        svgEl.setAttribute('viewBox', `0 0 ${totalSize} ${totalSize}`);

        const points = this.zipPath.map(p => {
          const cx = p.c * (cellSize + gap) + cellSize / 2;
          const cy = p.r * (cellSize + gap) + cellSize / 2;
          return `${cx},${cy}`;
        }).join(' ');

        const tipCx = tip.c * (cellSize + gap) + cellSize / 2;
        const tipCy = tip.r * (cellSize + gap) + cellSize / 2;

        svgEl.innerHTML = `
          <polyline class="zip-svg-line" points="${points}" />
          <circle class="zip-svg-tip-head" cx="${tipCx}" cy="${tipCy}" r="8" />
        `;
        gridEl.appendChild(svgEl);
      }

      // 3. Pointer drag navigation (drawing line with mouse/touch drag!)
      gridEl.onpointerdown = (e) => {
        const cell = e.target.closest('.zip-cell');
        if (!cell) return;
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        if (isNaN(r) || isNaN(c)) return;

        this.zipIsDragging = true;
        const path = this.zipPath;
        if (path.length > 1 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
          this.undoZipStep();
        } else if (!path.some(p => p.r === r && p.c === c)) {
          const last = path[path.length - 1];
          if (Math.abs(last.r - r) + Math.abs(last.c - c) === 1) {
            this.handleZipCellClick(r, c);
          }
        }
      };

      gridEl.onpointermove = (e) => {
        if (!this.zipIsDragging) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const cell = target?.closest('.zip-cell');
        if (!cell) return;
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        if (isNaN(r) || isNaN(c)) return;

        const path = this.zipPath;
        const last = path[path.length - 1];
        if (r === last.r && c === last.c) return;

        // Backtrack when dragging over previous step
        if (path.length > 1 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
          this.undoZipStep();
          return;
        }

        // Advance step if orthogonally adjacent and unvisited
        if (!path.some(p => p.r === r && p.c === c)) {
          if (Math.abs(last.r - r) + Math.abs(last.c - c) === 1) {
            this.handleZipCellClick(r, c);
          }
        }
      };

      const stopZipDrag = () => {
        this.zipIsDragging = false;
      };
      if (!this.zipWindowPointerUpBound) {
        window.addEventListener('pointerup', stopZipDrag);
        window.addEventListener('pointercancel', stopZipDrag);
        this.zipWindowPointerUpBound = true;
      }

      if (this.dom.zipProgressBadge) {
        const currentCp = Math.min(puzzle.maxCheckpoint, this.zipNextExpectedCp - 1);
        this.dom.zipProgressBadge.textContent = `Pfad: ${this.zipPath.length}/25 Felder • Checkpoint ${currentCp}/${puzzle.maxCheckpoint}`;
      }
    }

    // ==========================================
    // 6. MINI SUDOKU LOGIC ENGINE (6x6)
    // ==========================================
    getSudokuDaily() {
      const cycle = this.getGermanDailyCycle();
      const parts = cycle.cycleKey.split('-').map(Number);
      const epoch = Date.UTC(2026, 0, 1);
      const cycleUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
      const dayDiff = Math.max(0, Math.floor((cycleUtc - epoch) / 86400000));
      const idx = (dayDiff * 5 + 2) % this.sudokuData.length;
      return this.sudokuData[idx];
    }

    getActiveSudoku() {
      return this.getPuzzle('sudoku', this.getCurrentLevel('sudoku'));
    }

    initSudoku() {
      this.populateLevelSelect('sudoku');
      this.resetSudoku();
      this.renderSudoku();
    }

    resetSudokuTimer() {
      if (this.sudokuTimerInterval) clearInterval(this.sudokuTimerInterval);
      this.sudokuTimerInterval = null;
      this.sudokuTime = 0;
      this.sudokuTimerStarted = false;
      if (this.dom.sudokuTimerBadge) {
        this.dom.sudokuTimerBadge.textContent = '⏱️ 00:00';
      }
    }

    startSudokuTimer() {
      if (this.sudokuTimerInterval) clearInterval(this.sudokuTimerInterval);
      this.sudokuTime = 0;
      this.sudokuTimerInterval = setInterval(() => {
        this.sudokuTime += 1;
        if (this.dom.sudokuTimerBadge) {
          const m = String(Math.floor(this.sudokuTime / 60)).padStart(2, '0');
          const s = String(this.sudokuTime % 60).padStart(2, '0');
          this.dom.sudokuTimerBadge.textContent = `⏱️ ${m}:${s}`;
        }
      }, 1000);
    }

    resetSudoku() {
      const puzzle = this.getActiveSudoku();
      this.sudokuUserGrid = Array(6).fill(0).map((_, r) =>
        Array(6).fill(0).map((_, c) => puzzle.givens[r][c])
      );
      this.sudokuSelectedCell = null;
      this.resetSudokuTimer();
      if (this.dom.sudokuFeedback) {
        this.dom.sudokuFeedback.className = 'game-inline-feedback';
        this.dom.sudokuFeedback.textContent = '';
      }
      this.renderSudoku();
    }

    selectSudokuCell(r, c) {
      if (!this.sudokuTimerStarted) {
        this.startSudokuTimer();
        this.sudokuTimerStarted = true;
      }
      this.sudokuSelectedCell = { r, c };
      this.suite.sound.playClick();
      this.renderSudoku();
    }

    inputSudokuNumber(num) {
      if (!this.sudokuTimerStarted) {
        this.startSudokuTimer();
        this.sudokuTimerStarted = true;
      }
      if (!this.sudokuSelectedCell) return;
      const { r, c } = this.sudokuSelectedCell;
      const puzzle = this.getActiveSudoku();
      if (puzzle.givens[r][c] !== 0) return; // Given cell is locked

      this.sudokuUserGrid[r][c] = num;
      this.suite.sound.playPop();
      this.renderSudoku();
      this.checkSudokuStatus();
    }

    getSudokuErrors() {
      const grid = this.sudokuUserGrid;
      const errors = new Set();

      // Check rows
      for (let r = 0; r < 6; r++) {
        const seen = new Map();
        for (let c = 0; c < 6; c++) {
          const val = grid[r][c];
          if (val !== 0) {
            if (seen.has(val)) {
              errors.add(`${r},${c}`);
              errors.add(`${r},${seen.get(val)}`);
            } else {
              seen.set(val, c);
            }
          }
        }
      }

      // Check cols
      for (let c = 0; c < 6; c++) {
        const seen = new Map();
        for (let r = 0; r < 6; r++) {
          const val = grid[r][c];
          if (val !== 0) {
            if (seen.has(val)) {
              errors.add(`${r},${c}`);
              errors.add(`${seen.get(val)},${c}`);
            } else {
              seen.set(val, r);
            }
          }
        }
      }

      // Check 2x3 blocks
      for (let br = 0; br < 6; br += 2) {
        for (let bc = 0; bc < 6; bc += 3) {
          const seen = new Map();
          for (let dr = 0; dr < 2; dr++) {
            for (let dc = 0; dc < 3; dc++) {
              const r = br + dr;
              const c = bc + dc;
              const val = grid[r][c];
              if (val !== 0) {
                if (seen.has(val)) {
                  errors.add(`${r},${c}`);
                  errors.add(seen.get(val));
                } else {
                  seen.set(val, `${r},${c}`);
                }
              }
            }
          }
        }
      }

      return errors;
    }

    checkSudokuStatus() {
      const grid = this.sudokuUserGrid;
      const errors = this.getSudokuErrors();

      let filledCount = 0;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (grid[r][c] !== 0) filledCount++;
        }
      }

      if (errors.size > 0) {
        if (this.dom.sudokuFeedback) {
          this.dom.sudokuFeedback.className = 'game-inline-feedback error show';
          this.dom.sudokuFeedback.textContent = '⚠️ Duplikat gefunden in Zeile, Spalte oder 2×3-Block!';
        }
        return;
      }

      if (filledCount === 36 && errors.size === 0) {
        if (this.sudokuTimerInterval) clearInterval(this.sudokuTimerInterval);
        this.suite.sound.playSuccess();
        this.suite.confetti.fire();

        const lvl = this.getCurrentLevel('sudoku');
        this.markLevelSolved('sudoku', lvl);

        if (this.dom.sudokuFeedback) {
          const m = Math.floor(this.sudokuTime / 60);
          const s = this.sudokuTime % 60;
          this.dom.sudokuFeedback.className = 'game-inline-feedback success show';
          this.dom.sudokuFeedback.innerHTML = `
            <span>🔢 Mini Sudoku #${lvl} bravourös gelöst (${m}m ${s}s)!</span>
            <button class="btn-inline-next" id="btn-sudoku-next-win">Nächstes Sudoku ▶</button>
          `;
          const nextBtn = document.getElementById('btn-sudoku-next-win');
          if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextGameLevel('sudoku'));
          }
        }

        this.suite.showToast(`🎉 Mini Sudoku #${lvl} fehlerfrei gelöst!`);
        this.updateGameBanner('sudoku');
      } else {
        if (this.dom.sudokuFeedback) {
          this.dom.sudokuFeedback.className = 'game-inline-feedback';
          this.dom.sudokuFeedback.textContent = '';
        }
      }
    }

    renderSudokuBanner() {
      this.updateGameBanner('sudoku');
    }

    renderSudoku() {
      this.renderSudokuBanner();
      if (!this.dom.sudokuGrid) return;

      const puzzle = this.getActiveSudoku();
      const gridEl = this.dom.sudokuGrid;
      const errors = this.getSudokuErrors();
      gridEl.innerHTML = '';

      const selVal = this.sudokuSelectedCell
        ? this.sudokuUserGrid[this.sudokuSelectedCell.r][this.sudokuSelectedCell.c]
        : null;

      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const cell = document.createElement('div');
          const isGiven = puzzle.givens[r][c] !== 0;
          const val = this.sudokuUserGrid[r][c];
          const isSel = this.sudokuSelectedCell && this.sudokuSelectedCell.r === r && this.sudokuSelectedCell.c === c;
          const isSameNum = selVal && selVal !== 0 && val === selVal;
          const isErr = errors.has(`${r},${c}`);

          cell.className = `sudoku-cell ${isGiven ? 'given' : ''} ${isSel ? 'selected' : ''} ${isSameNum ? 'same-num' : ''} ${isErr ? 'error' : ''}`;

          // Block borders (2 rows x 3 cols)
          if (r === 1 || r === 3) cell.classList.add('block-border-bottom');
          if (c === 2) cell.classList.add('block-border-right');

          cell.textContent = val !== 0 ? val : '';
          cell.addEventListener('click', () => this.selectSudokuCell(r, c));
          gridEl.appendChild(cell);
        }
      }
    }
init() {
      this.bindEvents();
      this.updateTotalStats();
      this.switchGameMode('queens');
      this.renderLevelHub('queens');
    }

    render() {
      this.updateTotalStats();
      if (this.activeGameMode === 'queens') this.renderQueens();
      else if (this.activeGameMode === 'tango') this.renderTango();
      else if (this.activeGameMode === 'crossclimb') this.renderCrossclimb();
      else if (this.activeGameMode === 'pinpoint') this.renderPinpoint();
      else if (this.activeGameMode === 'zip') this.renderZip();
      else if (this.activeGameMode === 'sudoku') this.renderSudoku();
    }


    bindEvents() {

            // LinkedIn Games Tab Switcher

      // Bildschirmgrößen-Anpassung für Levelpfad
      window.addEventListener('resize', () => {
        if (this.trailResizeTimer) clearTimeout(this.trailResizeTimer);
        this.trailResizeTimer = setTimeout(() => {
          if (this.activeGameMode) {
            this.populateLevelSelect(this.activeGameMode);
          }
        }, 150);
      });

      if (this.dom.gamesNavBtns) {

        this.dom.gamesNavBtns.forEach(btn => {

          btn.addEventListener('click', () => {

            this.switchGameMode(btn.dataset.gameMode);

          });

        });

      }

      // Interactive Level Navigation Bindings for all games
      ['queens', 'tango', 'pinpoint', 'crossclimb', 'zip', 'sudoku'].forEach(g => {
        const cap = g.charAt(0).toUpperCase() + g.slice(1);
        if (this.dom[`btn${cap}Prev`]) {
          this.dom[`btn${cap}Prev`].addEventListener('click', () => this.prevGameLevel(g));
        }
        if (this.dom[`btn${cap}Next`]) {
          this.dom[`btn${cap}Next`].addEventListener('click', () => this.nextGameLevel(g));
        }
        if (this.dom[`btn${cap}Random`]) {
          this.dom[`btn${cap}Random`].addEventListener('click', () => this.randomGameLevel(g));
        }
        const genBtn = document.getElementById(`btn-${g}-generate`);
        if (genBtn) {
          genBtn.addEventListener('click', () => this.generateNewLevel(g));
        }
        if (this.dom[`btn${cap}BannerNext`]) {
          this.dom[`btn${cap}BannerNext`].addEventListener('click', () => this.nextGameLevel(g));
        }
      });




      // Queens Bindings

      if (this.dom.queensLevelSelect) {

        this.dom.queensLevelSelect.addEventListener('change', (e) => {
        this.setGameLevel('queens', e.target.value);
      });

      }

      if (this.dom.btnQueensAutoX) {
        this.dom.btnQueensAutoX.classList.toggle('active', this.queensAutoXEnabled);
        this.dom.btnQueensAutoX.innerHTML = `<span>⚡ Auto-X (Aktiv)</span>`;
        this.dom.btnQueensAutoX.addEventListener('click', () => this.toggleQueensAutoX());
      }

      if (this.dom.btnQueensUndo) {

        this.dom.btnQueensUndo.addEventListener('click', () => this.undoQueensMove());

      }

      if (this.dom.btnQueensReset) {

        this.dom.btnQueensReset.addEventListener('click', () => {

          this.resetQueensBoard(true);

        });

      }



      // Tango Bindings

      if (this.dom.tangoLevelSelect) {

        this.dom.tangoLevelSelect.addEventListener('change', (e) => {
        this.setGameLevel('tango', e.target.value);
      });

      }

      if (this.dom.btnTangoReset) {

        this.dom.btnTangoReset.addEventListener('click', () => {

          this.resetTangoBoard();

        });

      }



      // Pinpoint Bindings

      if (this.dom.pinpointLevelSelect) {

        this.dom.pinpointLevelSelect.addEventListener('change', (e) => {
        this.setGameLevel('pinpoint', e.target.value);
      });

      }

      if (this.dom.btnPinpointSubmit) {

        this.dom.btnPinpointSubmit.addEventListener('click', () => this.submitPinpointGuess());

      }

      if (this.dom.pinpointGuessInput) {

        this.dom.pinpointGuessInput.addEventListener('keydown', (e) => {

          if (e.key === 'Enter') this.submitPinpointGuess();

        });

      }

      if (this.dom.btnPinpointRevealClue) {

        this.dom.btnPinpointRevealClue.addEventListener('click', () => this.revealNextPinpointClue());

      }

      if (this.dom.btnPinpointReset) {

        this.dom.btnPinpointReset.addEventListener('click', () => this.resetPinpoint());

      }

      // Crossclimb Bindings
      if (this.dom.crossclimbLevelSelect) {
        this.dom.crossclimbLevelSelect.addEventListener('change', (e) => {
        this.setGameLevel('crossclimb', e.target.value);
      });
      }
      if (this.dom.btnCrossclimbCheck) {
        this.dom.btnCrossclimbCheck.addEventListener('click', () => this.checkCrossclimb());
      }
      if (this.dom.btnCrossclimbReset) {
        this.dom.btnCrossclimbReset.addEventListener('click', () => this.resetCrossclimb());
      }

      // Zip Bindings
      if (this.dom.zipLevelSelect) {
        this.dom.zipLevelSelect.addEventListener('change', (e) => {
        this.setGameLevel('zip', e.target.value);
      });
      }
      if (this.dom.btnZipUndo) {
        this.dom.btnZipUndo.addEventListener('click', () => this.undoZipStep());
      }
      if (this.dom.btnZipReset) {
        this.dom.btnZipReset.addEventListener('click', () => this.resetZip());
      }

      // Sudoku Bindings
      if (this.dom.sudokuLevelSelect) {
        this.dom.sudokuLevelSelect.addEventListener('change', (e) => {
        this.setGameLevel('sudoku', e.target.value);
      });
      }
      if (this.dom.btnSudokuReset) {
        this.dom.btnSudokuReset.addEventListener('click', () => {
          this.resetSudoku();
        });
      }
      if (this.dom.sudokuNumpad) {
        this.dom.sudokuNumpad.querySelectorAll('.numpad-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const num = parseInt(btn.dataset.num, 10);
            this.inputSudokuNumber(num);
          });
        });
      }
      window.addEventListener('keydown', (e) => {
        if (this.activeGameMode === 'sudoku' && this.sudokuSelectedCell) {
          if (e.key >= '1' && e.key <= '6') {
            this.inputSudokuNumber(parseInt(e.key, 10));
          } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            this.inputSudokuNumber(0);
          }
        }
      });
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

        statRiddles: document.getElementById('hub-stat-riddles'),

        cardTaskSummary: document.getElementById('hub-card-task-summary'),

        cardNotesSummary: document.getElementById('hub-card-notes-summary'),

        cardFocusSummary: document.getElementById('hub-card-focus-summary'),

        cardHabitsSummary: document.getElementById('hub-card-habits-summary'),

        cardRiddleSummary: document.getElementById('hub-card-riddle-summary'),

        taskPreviewList: document.getElementById('hub-task-preview-list'),

        habitPreviewList: document.getElementById('hub-habit-preview-list'),

        notesPreviewList: document.getElementById('hub-notes-preview-list'),

        // Quick Action triggers

        btnAddTask: document.getElementById('hub-action-add-task'),

        btnAddNote: document.getElementById('hub-action-add-note'),

        btnStartFocus: document.getElementById('hub-action-start-focus'),

        btnCheckHabits: document.getElementById('hub-action-check-habits'),

        btnSolveRiddle: document.getElementById('hub-action-solve-riddle')

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



      if (this.dom.btnSolveRiddle) {

        this.dom.btnSolveRiddle.addEventListener('click', () => {

          this.suite.switchApp('riddle');

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

      const riddle = this.suite.riddleApp;



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

      if (this.dom.statRiddles) {
        let totalSolved = 0;
        ['queens', 'tango', 'crossclimb', 'pinpoint', 'zip', 'sudoku'].forEach(g => {
          const solvedSet = new Set(JSON.parse(localStorage.getItem(`orbitsuite_${g}_solved_levels`) || '[]'));
          totalSolved += solvedSet.size;
        });
        this.dom.statRiddles.textContent = `${totalSolved} Rätsel`;
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

      if (this.dom.cardRiddleSummary) {
        let totalSolved = 0;
        ['queens', 'tango', 'crossclimb', 'pinpoint', 'zip', 'sudoku'].forEach(g => {
          const solvedSet = new Set(JSON.parse(localStorage.getItem(`orbitsuite_${g}_solved_levels`) || '[]'));
          totalSolved += solvedSet.size;
        });
        this.dom.cardRiddleSummary.textContent = `${totalSolved} Rätsel gemeistert • Freies Spielen`;
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



  // ==========================================================================

  // PWA (PROGRESSIVE WEB APP) MANAGER

  // ==========================================================================

  class OrbitPwaManager {

    constructor(suite) {

      this.suite = suite;

      this.deferredPrompt = null;

      this.btnInstallHeader = document.getElementById('btn-pwa-install');

      this.btnInstallHub = document.getElementById('btn-pwa-hub-install');

      this.hubBanner = document.getElementById('hub-pwa-banner');

      

      this.initServiceWorker();

      this.initInstallPrompt();

      this.initNetworkListeners();

    }



    initServiceWorker() {

      if ('serviceWorker' in navigator) {

        window.addEventListener('load', () => {

          navigator.serviceWorker.register('./sw.js')

            .then(reg => {

              console.log('[OrbitSuite PWA] Service Worker registered with scope:', reg.scope);

              // Handle updatefound

              reg.addEventListener('updatefound', () => {

                const newWorker = reg.installing;

                if (newWorker) {

                  newWorker.addEventListener('statechange', () => {

                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {

                      this.suite.showToast('OrbitSuite Update verfügbar! Aktualisiere beim nächsten Start 🚀');

                    }

                  });

                }

              });

            })

            .catch(err => {

              console.warn('[OrbitSuite PWA] Service Worker registration failed:', err);

            });

        });

      }

    }



    initInstallPrompt() {

      // Check if already in standalone / installed mode

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

      if (isStandalone) {

        console.log('[OrbitSuite PWA] Running in standalone native window mode.');

        return;

      }



      window.addEventListener('beforeinstallprompt', (e) => {

        // Prevent default mini-infobar on mobile Chrome

        e.preventDefault();

        this.deferredPrompt = e;

        console.log('[OrbitSuite PWA] beforeinstallprompt captured.');



        // Show install button and Hub banner

        if (this.btnInstallHeader) this.btnInstallHeader.classList.remove('hidden');

        if (this.hubBanner) this.hubBanner.classList.remove('hidden');

      });



      // Handle install click

      const handleInstall = async () => {

        if (!this.deferredPrompt) {

          this.suite.showToast('Installationsaufforderung steht noch nicht bereit.');

          return;

        }

        this.deferredPrompt.prompt();

        const { outcome } = await this.deferredPrompt.userChoice;

        console.log('[OrbitSuite PWA] User install choice:', outcome);

        if (outcome === 'accepted') {

          this.suite.showToast('OrbitSuite wird als App installiert! 📲');

          this.hideInstallPrompts();

        }

        this.deferredPrompt = null;

      };



      if (this.btnInstallHeader) this.btnInstallHeader.addEventListener('click', handleInstall);

      if (this.btnInstallHub) this.btnInstallHub.addEventListener('click', handleInstall);



      window.addEventListener('appinstalled', () => {

        console.log('[OrbitSuite PWA] OrbitSuite successfully installed.');

        this.suite.showToast('OrbitSuite erfolgreich installiert! 🎉');

        if (this.suite.sound) this.suite.sound.playSuccess();

        this.hideInstallPrompts();

      });

    }



    hideInstallPrompts() {

      if (this.btnInstallHeader) this.btnInstallHeader.classList.add('hidden');

      if (this.hubBanner) this.hubBanner.classList.add('hidden');

    }



    initNetworkListeners() {

      window.addEventListener('offline', () => {

        this.suite.showToast('📴 Offline-Modus: OrbitSuite läuft lokal nahtlos weiter.');

      });

      window.addEventListener('online', () => {

        this.suite.showToast('🌐 Wieder online: Verbindung hergestellt.');

      });

    }

  }



  class OrbitSuiteRouter {

    constructor() {

      this.sound = new SoundManager();

      this.pwa = new OrbitPwaManager(this);

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

          tools: document.getElementById('app-view-tools'),

          riddle: document.getElementById('app-view-riddle')

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

        tools: { name: 'OrbitTools', color: '#0284c7' },

        riddle: { name: 'OrbitRätsel', color: '#a855f7' }

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

      this.riddleApp = new OrbitRiddleApp(this);

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

          } else if (e.key === '6') {

            e.preventDefault();

            this.switchApp('riddle');

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

      } else if (appId === 'riddle' && this.riddleApp) {

        this.riddleApp.render();

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

        },

        riddles: {

          solved: Array.from(this.riddleApp ? this.riddleApp.solvedRiddles : []),

          streak: this.riddleApp ? this.riddleApp.streak : 0,

          custom: this.riddleApp ? this.riddleApp.customRiddles : []

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



            if (data.riddles && this.riddleApp) {

              if (Array.isArray(data.riddles.solved)) {

                this.riddleApp.solvedRiddles = new Set(data.riddles.solved);

                this.riddleApp.saveSolved();

              }

              if (typeof data.riddles.streak === 'number') {

                this.riddleApp.streak = data.riddles.streak;

                localStorage.setItem('orbitsuite_riddle_streak', String(this.riddleApp.streak));

              }

              if (Array.isArray(data.riddles.custom)) {

                this.riddleApp.customRiddles = data.riddles.custom;

                this.riddleApp.saveCustomRiddles();

              }

              this.riddleApp.render();

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

  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', () => {

      window.orbitSuite = new OrbitSuiteRouter();

    });

  } else {

    window.orbitSuite = new OrbitSuiteRouter();

  }

})();

