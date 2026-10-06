/**
 * OrbitTask - Pro Task Tracking Suite
 * High-performance, zero-dependency client-side task tracking engine
 */

(() => {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEY = 'orbittask_tasks_v2';
  const SOUND_KEY = 'orbittask_sound_enabled';

  // --- Audio Feedback (Web Audio API Synthesizer) ---
  class SoundManager {
    constructor() {
      this.enabled = localStorage.getItem(SOUND_KEY) !== 'false';
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem(SOUND_KEY, this.enabled);
      return this.enabled;
    }

    playPop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }

    playSuccess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
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
    }

    playTrash() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
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
    }
  }

  // --- Confetti Particle System ---
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

  // --- Initial Realistic Demo Data ---
  function getTodayString(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

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
      title: 'Performance Audit & Bundle Optimierung',
      description: 'Lighthouse Score 100/100 bei Ladezeit und Accessibility sicherstellen.',
      status: 'todo',
      priority: 'medium',
      category: 'Entwicklung',
      dueDate: getTodayString(3),
      subtasks: [
        { id: 'sub-3-1', title: 'Lighthouse Report generieren', completed: false },
        { id: 'sub-3-2', title: 'Font Loading via display=swap prüfen', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'task-4',
      title: 'Release-Notes & Changelog verfassen',
      description: 'Highlights der neuen Version mit Screenshots und GIF-Demos für Nutzer zusammenfassen.',
      status: 'done',
      priority: 'medium',
      category: 'Marketing',
      dueDate: getTodayString(-1),
      subtasks: [
        { id: 'sub-4-1', title: 'Feature-Liste zusammentragen', completed: true },
        { id: 'sub-4-2', title: 'Banner-Grafiken exportieren', completed: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'task-5',
      title: 'Cloud-Sync & Realtime Backup Konzept',
      description: 'Architektur für Ende-zu-Ende verschlüsselte Synchronisation evaluieren.',
      status: 'backlog',
      priority: 'low',
      category: 'Management',
      dueDate: getTodayString(7),
      subtasks: [
        { id: 'sub-5-1', title: 'WebCrypto API Möglichkeiten prüfen', completed: false }
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
      dueDate: getTodayString(-2), // Overdue demo
      subtasks: [
        { id: 'sub-6-1', title: 'Kontoauszüge herunterladen', completed: true },
        { id: 'sub-6-2', title: 'PDFs in Ordner einsortieren', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];

  // --- Main Application State ---
  class OrbitTaskApp {
    constructor() {
      this.sound = new SoundManager();
      this.confetti = new ConfettiManager('confetti-canvas');
      this.tasks = this.loadTasks();
      this.activeView = 'kanban';
      this.searchQuery = '';
      this.filterType = 'all';
      this.filterVal = 'all';
      this.selectedTag = null;
      this.sortBy = 'createdAt-desc';
      this.currentEditingSubtasks = [];
      this.lastDeletedTask = null;
      this.undoTimeout = null;

      // DOM References
      this.dom = {
        // Nav tabs
        tabKanban: document.getElementById('tab-kanban'),
        tabList: document.getElementById('tab-list'),
        tabAnalytics: document.getElementById('tab-analytics'),
        viewKanbanPanel: document.getElementById('view-kanban-panel'),
        viewListPanel: document.getElementById('view-list-panel'),
        viewAnalyticsPanel: document.getElementById('view-analytics-panel'),

        // Search & Controls
        globalSearch: document.getElementById('global-search-input'),
        clearSearchBtn: document.getElementById('clear-search-btn'),
        filterChips: document.querySelectorAll('.filter-chip'),
        tagFiltersContainer: document.getElementById('tag-filters'),
        sortSelect: document.getElementById('sort-select'),

        // Metrics
        valTotalTasks: document.getElementById('val-total-tasks'),
        valInProgress: document.getElementById('val-in-progress'),
        valCompleted: document.getElementById('val-completed'),
        valCompletionRate: document.getElementById('val-completion-rate'),
        valOverdue: document.getElementById('val-overdue'),

        // Kanban Containers
        colBacklog: document.getElementById('container-backlog'),
        colTodo: document.getElementById('container-todo'),
        colInprogress: document.getElementById('container-inprogress'),
        colReview: document.getElementById('container-review'),
        colDone: document.getElementById('container-done'),

        // Counts
        countBacklog: document.getElementById('count-backlog'),
        countTodo: document.getElementById('count-todo'),
        countInprogress: document.getElementById('count-inprogress'),
        countReview: document.getElementById('count-review'),
        countDone: document.getElementById('count-done'),

        // List View Body
        listItemsBody: document.getElementById('list-items-body'),

        // Analytics
        radialCircle: document.getElementById('analytics-radial-circle'),
        radialPercent: document.getElementById('analytics-radial-percent'),
        progDetails: document.getElementById('analytics-progress-details'),
        statusBars: document.getElementById('analytics-status-bars'),
        priorityGrid: document.getElementById('analytics-priority-grid'),
        catList: document.getElementById('analytics-categories-list'),

        // Modal
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

        // Header Actions
        btnCreateTask: document.getElementById('btn-create-task'),
        btnSoundToggle: document.getElementById('btn-sound-toggle'),
        btnMoreOptions: document.getElementById('btn-more-options'),
        moreOptionsMenu: document.getElementById('more-options-menu'),
        optLoadDemo: document.getElementById('opt-load-demo'),
        optExportJson: document.getElementById('opt-export-json'),
        inputImportJson: document.getElementById('input-import-json'),
        optClearAll: document.getElementById('opt-clear-all'),

        // Toast Container
        toastContainer: document.getElementById('toast-container')
      };

      this.init();
    }

    init() {
      this.bindEvents();
      this.updateSoundIcon();
      this.render();
    }

    // --- Data Persistence ---
    loadTasks() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.error('Error loading tasks from localStorage:', err);
      }
      this.saveTasks(DEFAULT_DEMO_TASKS);
      return [...DEFAULT_DEMO_TASKS];
    }

    saveTasks(tasks = this.tasks) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        console.error('Error saving tasks to localStorage:', err);
      }
    }

    // --- Events Binding ---
    bindEvents() {
      // Nav Tabs
      const tabs = [this.dom.tabKanban, this.dom.tabList, this.dom.tabAnalytics];
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeView = tab.dataset.view;
          this.switchView(this.activeView);
          this.sound.playPop();
        });
      });

      // Quick Add from Kanban Headers
      document.querySelectorAll('.btn-quick-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetStatus = btn.dataset.status;
          this.openCreateModal(targetStatus);
        });
      });

      // Header CTA
      this.dom.btnCreateTask.addEventListener('click', () => {
        this.openCreateModal();
      });

      // Modal Close & Cancel
      this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
      this.dom.modalCancelBtn.addEventListener('click', () => this.closeModal());
      this.dom.modal.addEventListener('click', (e) => {
        if (e.target === this.dom.modal) this.closeModal();
      });

      // Subtask in Modal
      this.dom.btnAddSubtask.addEventListener('click', () => this.addModalSubtask());
      this.dom.subtaskInputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addModalSubtask();
        }
      });

      // Modal Form Submit
      this.dom.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveModalTask();
      });

      // Global Search
      this.dom.globalSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.dom.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.render();
      });

      this.dom.clearSearchBtn.addEventListener('click', () => {
        this.dom.globalSearch.value = '';
        this.searchQuery = '';
        this.dom.clearSearchBtn.style.display = 'none';
        this.render();
      });

      // Keyboard Shortcut (Ctrl + K or Cmd + K)
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.dom.globalSearch.focus();
        } else if (e.key === 'Escape' && !this.dom.modal.classList.contains('hidden')) {
          this.closeModal();
        }
      });

      // Filter Chips
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

      // Sort Select
      this.dom.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render();
      });

      // Sound Toggle Button
      this.dom.btnSoundToggle.addEventListener('click', () => {
        this.sound.toggle();
        this.updateSoundIcon();
        if (this.sound.enabled) this.sound.playSuccess();
      });

      // More Options Dropdown
      this.dom.btnMoreOptions.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dom.moreOptionsMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        this.dom.moreOptionsMenu.classList.add('hidden');
      });

      // Demo Data
      this.dom.optLoadDemo.addEventListener('click', () => {
        if (confirm('Möchtest du die Demo-Aufgaben zurücksetzen? Aktuelle Aufgaben werden überschrieben.')) {
          this.tasks = JSON.parse(JSON.stringify(DEFAULT_DEMO_TASKS));
          this.saveTasks();
          this.showToast('Demo-Daten erfolgreich geladen!');
          this.render();
          this.sound.playSuccess();
        }
      });

      // Export JSON
      this.dom.optExportJson.addEventListener('click', () => {
        this.exportTasksJson();
      });

      // Import JSON
      this.dom.inputImportJson.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.importTasksJson(file);
        }
      });

      // Clear All
      this.dom.optClearAll.addEventListener('click', () => {
        if (confirm('Möchtest du wirklich ALLE Aufgaben löschen? Dies kann nicht rückgängig gemacht werden.')) {
          this.tasks = [];
          this.saveTasks();
          this.showToast('Alle Aufgaben wurden gelöscht.', 'warning');
          this.render();
          this.sound.playTrash();
        }
      });

      // Drag and Drop Listeners for Kanban Columns
      this.initKanbanDragDrop();
    }

    updateSoundIcon() {
      if (this.sound.enabled) {
        this.dom.btnSoundToggle.classList.remove('muted');
        this.dom.btnSoundToggle.title = 'Sound-Effekte: Aktiviert';
      } else {
        this.dom.btnSoundToggle.classList.add('muted');
        this.dom.btnSoundToggle.title = 'Sound-Effekte: Stumm';
      }
    }

    switchView(view) {
      this.dom.viewKanbanPanel.classList.toggle('active', view === 'kanban');
      this.dom.viewListPanel.classList.toggle('active', view === 'list');
      this.dom.viewAnalyticsPanel.classList.toggle('active', view === 'analytics');
      this.render();
    }

    // --- Drag and Drop Logic ---
    initKanbanDragDrop() {
      const columns = [
        this.dom.colBacklog,
        this.dom.colTodo,
        this.dom.colInprogress,
        this.dom.colReview,
        this.dom.colDone
      ];

      columns.forEach(col => {
        const colParent = col.closest('.kanban-column');

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

      const previousStatus = task.status;
      task.status = newStatus;
      task.updatedAt = new Date().toISOString();

      if (newStatus === 'done') {
        // Mark all subtasks done
        if (task.subtasks) {
          task.subtasks.forEach(s => s.completed = true);
        }
        this.confetti.fire();
        this.sound.playSuccess();
        this.showToast(`Aufgabe "${task.title}" abgeschlossen! 🎉`);
      } else {
        this.sound.playPop();
      }

      this.saveTasks();
      this.render();
    }

    // --- Filtering & Sorting ---
    getFilteredTasks() {
      const todayStr = getTodayString(0);

      return this.tasks.filter(task => {
        // Search Filter
        if (this.searchQuery) {
          const inTitle = task.title.toLowerCase().includes(this.searchQuery);
          const inDesc = (task.description || '').toLowerCase().includes(this.searchQuery);
          const inCat = (task.category || '').toLowerCase().includes(this.searchQuery);
          const inSub = (task.subtasks || []).some(s => s.title.toLowerCase().includes(this.searchQuery));
          if (!inTitle && !inDesc && !inCat && !inSub) return false;
        }

        // Quick Filter
        if (this.filterType === 'priority') {
          if (task.priority !== this.filterVal) return false;
        } else if (this.filterType === 'time') {
          if (this.filterVal === 'today') {
            if (task.dueDate !== todayStr) return false;
          } else if (this.filterVal === 'overdue') {
            if (!task.dueDate || task.dueDate >= todayStr || task.status === 'done') return false;
          }
        }

        // Tag Filter
        if (this.selectedTag && task.category !== this.selectedTag) {
          return false;
        }

        return true;
      }).sort((a, b) => {
        // Sorting logic
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

    // --- Render Orchestration ---
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

    // --- Metrics Bar Calculation ---
    updateMetrics() {
      const total = this.tasks.length;
      const inProgress = this.tasks.filter(t => t.status === 'inprogress').length;
      const completed = this.tasks.filter(t => t.status === 'done').length;
      const todayStr = getTodayString(0);
      const overdue = this.tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      this.dom.valTotalTasks.textContent = total;
      this.dom.valInProgress.textContent = inProgress;
      this.dom.valCompleted.textContent = completed;
      this.dom.valCompletionRate.textContent = `${rate}% Quote`;
      this.dom.valOverdue.textContent = overdue;
    }

    // --- Render Tag Filter Chips ---
    renderTagFilters() {
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

      let html = '';
      catKeys.forEach(cat => {
        const isActive = this.selectedTag === cat;
        html += `
          <button class="tag-chip ${isActive ? 'active' : ''}" data-tag="${escapeHtml(cat)}">
            #${escapeHtml(cat)} (${categories[cat]})
          </button>
        `;
      });

      this.dom.tagFiltersContainer.innerHTML = html;

      // Tag Click Handlers
      this.dom.tagFiltersContainer.querySelectorAll('.tag-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const tag = btn.dataset.tag;
          this.selectedTag = (this.selectedTag === tag) ? null : tag;
          this.sound.playPop();
          this.render();
        });
      });
    }

    // --- 1. Render Kanban Board ---
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

      // Due Date Formatting
      const dueInfo = this.formatDueDate(task.dueDate, isDone);

      // Subtasks Summary
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

        // Drag Start & End
        card.addEventListener('dragstart', (e) => {
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', taskId);
          e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        // Click on Card Body to Edit
        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          this.openEditModal(taskId);
        });

        // Action Buttons inside Card
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

    // --- 2. Render List View ---
    renderList() {
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

      // List Row Event Listeners
      this.dom.listItemsBody.querySelectorAll('.list-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          this.toggleTaskCompletion(cb.dataset.id);
        });
      });

      this.dom.listItemsBody.querySelectorAll('.list-title').forEach(title => {
        title.addEventListener('click', () => {
          this.openEditModal(title.dataset.id);
        });
      });

      this.dom.listItemsBody.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.openEditModal(btn.dataset.id);
        });
      });

      this.dom.listItemsBody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.deleteTask(btn.dataset.id);
        });
      });
    }

    // --- 3. Render Analytics Dashboard ---
    renderAnalytics() {
      const total = this.tasks.length;
      const completed = this.tasks.filter(t => t.status === 'done').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Radial Progress Calculation (Circumference of r=65 is 2 * PI * 65 ≈ 408.4)
      const maxCircumference = 408.4;
      const strokeOffset = maxCircumference - (rate / 100) * maxCircumference;
      this.dom.radialCircle.style.strokeDashoffset = strokeOffset;
      this.dom.radialPercent.textContent = `${rate}%`;

      // In Progress & Open
      const inProg = this.tasks.filter(t => t.status === 'inprogress').length;
      const open = total - completed;
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

      // Status Bar Chart
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

      // Priority Grid
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

      // Category Breakdown
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

    // --- Modal Handling ---
    openCreateModal(defaultStatus = 'todo') {
      this.dom.modalTitle.textContent = 'Neue Aufgabe erstellen';
      this.dom.inputFormId.value = '';
      this.dom.taskForm.reset();
      this.dom.inputStatus.value = defaultStatus;
      this.dom.inputPriority.value = 'medium';
      this.currentEditingSubtasks = [];
      this.renderModalSubtasks();
      this.dom.modal.classList.remove('hidden');
      setTimeout(() => this.dom.inputTitle.focus(), 50);
      this.sound.playPop();
    }

    openEditModal(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

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
      setTimeout(() => this.dom.inputTitle.focus(), 50);
      this.sound.playPop();
    }

    closeModal() {
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
      this.dom.modalSubtasksCount.textContent = `${count} ${count === 1 ? 'Aufgabe' : 'Aufgaben'}`;

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

      // Subtask events
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
        // Update existing task
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
          this.showToast(`Aufgabe "${title}" aktualisiert!`);
        }
      } else {
        // Create new task
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
        this.showToast(`Neue Aufgabe "${title}" erstellt! 🚀`);
      }

      this.saveTasks();
      this.closeModal();
      this.render();
      this.sound.playSuccess();
    }

    // --- Task Actions ---
    toggleTaskCompletion(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.status === 'done') {
        task.status = 'todo';
        if (task.subtasks) {
          task.subtasks.forEach(s => s.completed = false);
        }
        this.sound.playPop();
        this.showToast(`Aufgabe wieder auf "Zu erledigen" gesetzt.`);
      } else {
        task.status = 'done';
        if (task.subtasks) {
          task.subtasks.forEach(s => s.completed = true);
        }
        this.confetti.fire();
        this.sound.playSuccess();
        this.showToast(`Aufgabe "${task.title}" abgeschlossen! 🎉`);
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

      this.showToast(`Aufgabe "${deleted.title}" gelöscht.`, 'undo');
    }

    undoDelete() {
      if (!this.lastDeletedTask) return;
      this.tasks.splice(this.lastDeletedTask.index, 0, this.lastDeletedTask.task);
      this.saveTasks();
      this.sound.playSuccess();
      this.render();
      this.showToast(`Aufgabe "${this.lastDeletedTask.task.title}" wiederhergestellt!`);
      this.lastDeletedTask = null;
    }

    // --- Toast Notifications ---
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = 'toast';

      if (type === 'undo') {
        toast.classList.add('toast-undo');
        toast.innerHTML = `
          <span>${escapeHtml(message)}</span>
          <button class="toast-undo-btn" id="btn-toast-undo">Rückgängig</button>
        `;
        const undoBtn = toast.querySelector('#btn-toast-undo');
        undoBtn.addEventListener('click', () => {
          this.undoDelete();
          toast.remove();
        });
      } else {
        toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
      }

      this.dom.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
      }, 4500);
    }

    // --- JSON Export & Import ---
    exportTasksJson() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `orbittask-backup-${getTodayString(0)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showToast('Daten erfolgreich als JSON exportiert!');
    }

    importTasksJson(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            this.tasks = imported;
            this.saveTasks();
            this.showToast(`${imported.length} Aufgaben erfolgreich importiert!`);
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

    // --- Helpers ---
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

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Launch when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.orbitTask = new OrbitTaskApp();
  });
})();
