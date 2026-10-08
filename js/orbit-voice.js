/**
 * ============================================================================
 * ORBITVOICE • AI Voice Assistant & Universal Voice Controller
 * ============================================================================
 * 
 * Provides end-to-end voice control across OrbitSuite & OrbitOS:
 *  - App Switching & Navigation (Hub, Tasks, Notes, Focus, Habits, Tools, Riddle, Folienwerk, OS)
 *  - OrbitTask: Instant task creation ("Neue Aufgabe X"), search, views, filters
 *  - OrbitNotes: Note creation ("Notiere X"), search, universal dictation into active fields
 *  - OrbitFocus: Pomodoro timer start, pause, reset, modes (short/long break), ambient soundscapes
 *  - OrbitOS: Window management ("Öffne Rechner", "Öffne Terminal", "Schließe alle Fenster"), wallpapers
 *  - Spotify: Playback control (play, pause, next, previous)
 *  - System Actions: Confetti celebration, sound toggles, voice synthesis (TTS), backup & help center
 * 
 * Uses Web Speech API (SpeechRecognition + SpeechSynthesis) with graceful fallbacks.
 * ============================================================================
 */

class OrbitVoice {
  constructor(suite) {
    this.suite = suite;
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.ttsEnabled = localStorage.getItem('orbit_voice_tts') !== 'false';
    this.lang = 'de-DE';
    this.activeVoice = null;
    this.lastTranscript = '';
    this.hideTranscriptTimeout = null;

    // Command registry for help center & parser
    this.commandCategories = [
      {
        id: 'nav',
        title: '🧭 Navigation & Apps',
        commands: [
          { phrases: ['Öffne Aufgaben', 'Gehe zu Tasks', 'Kanban anzeigen'], desc: 'Öffnet das Kanban-Board & Aufgaben', action: () => this.suite.switchApp('tasks') },
          { phrases: ['Öffne Notizen', 'Notizen anzeigen'], desc: 'Öffnet OrbitNotes mit Markdown Editor', action: () => this.suite.switchApp('notes') },
          { phrases: ['Öffne Fokus', 'Pomodoro anzeigen'], desc: 'Öffnet den Pomodoro Deep-Work Timer', action: () => this.suite.switchApp('focus') },
          { phrases: ['Öffne Gewohnheiten', 'Habits anzeigen'], desc: 'Öffnet den Habit-Tracker & Streaks', action: () => this.suite.switchApp('habits') },
          { phrases: ['Öffne Tools', 'Entwickler Werkzeuge'], desc: 'Öffnet Entwickler-Tools (JSON, UUID, Base64)', action: () => this.suite.switchApp('tools') },
          { phrases: ['Öffne Spiele', 'Rätsel anzeigen'], desc: 'Öffnet Denkspiele (Sudoku, CrossClimb etc.)', action: () => this.suite.switchApp('riddle') },
          { phrases: ['Öffne Folienwerk', 'Folienwerk starten'], desc: 'Öffnet den Folienwerk Copilot Launcher', action: () => this.suite.switchApp('folienwerk') },
          { phrases: ['Startseite', 'Gehe zum Hub', 'Dashboard'], desc: 'Wechselt zur OrbitSuite Startseite', action: () => this.suite.switchApp('hub') },
          { phrases: ['Desktop Modus', 'OrbitOS öffnen'], desc: 'Wechselt in den Web-Desktop mit Fenstern', action: () => this.suite.os ? this.suite.os.enableOSMode() : this.suite.switchApp('os') },
          { phrases: ['Zurück zur Suite', 'Workspace Modus'], desc: 'Kehrt zum klassischen Suite-Modus zurück', action: () => this.suite.os ? this.suite.os.disableOSMode() : this.suite.switchApp('hub') }
        ]
      },
      {
        id: 'tasks',
        title: '📋 Aufgaben (OrbitTask)',
        commands: [
          { phrases: ['Neue Aufgabe [Titel]', 'Aufgabe anlegen [Titel]'], desc: 'Erstellt blitzschnell eine neue Aufgabe', action: (title) => this.handleCreateTask(title || 'Wichtige Aufgabe erledigen') },
          { phrases: ['Suche Aufgabe [Begriff]', 'Finde Aufgabe [Begriff]'], desc: 'Durchsucht die Aufgabenliste live', action: (term) => this.handleSearchTasks(term || 'Projekt') },
          { phrases: ['Alle Aufgaben anzeigen', 'Filter zurücksetzen'], desc: 'Setzt Such- und Statusfilter zurück', action: () => this.handleResetTaskFilters() },
          { phrases: ['Zeige erledigte Aufgaben'], desc: 'Filtert auf bereits erledigte Aufgaben', action: () => this.handleFilterTasks('completed') },
          { phrases: ['Zeige offene Aufgaben', 'Zeige ToDo'], desc: 'Filtert auf offene ToDo-Aufgaben', action: () => this.handleFilterTasks('todo') },
          { phrases: ['Ansicht Liste', 'Listenansicht'], desc: 'Schaltet OrbitTask in die Listenansicht', action: () => this.handleSwitchTaskView('list') },
          { phrases: ['Ansicht Kanban', 'Kanban Board'], desc: 'Schaltet OrbitTask in das 5-Phasen Kanban-Board', action: () => this.handleSwitchTaskView('kanban') },
          { phrases: ['Ansicht Statistik', 'Analytics'], desc: 'Zeigt die KPI & Produktivitäts-Statistiken', action: () => this.handleSwitchTaskView('analytics') }
        ]
      },
      {
        id: 'notes',
        title: '📝 Notizen & Diktat (OrbitNotes)',
        commands: [
          { phrases: ['Neue Notiz [Inhalt]', 'Notiere [Inhalt]'], desc: 'Legt sofort eine neue Notiz an', action: (text) => this.handleCreateNote(text || 'Wichtige Notiz aus Sprachaufnahme') },
          { phrases: ['Suche Notiz [Begriff]'], desc: 'Filtert die gespeicherten Notizen', action: (term) => this.handleSearchNotes(term || 'Idee') },
          { phrases: ['Diktat [Text]', 'Schreibe [Text]'], desc: 'Schreibt Text direkt in das aktuell aktive Textfeld', action: (text) => this.handleDictation(text || 'Sprachdiktat erfolgreich ausgeführt.') }
        ]
      },
      {
        id: 'focus',
        title: '⏱️ Fokus & Pomodoro (OrbitFocus)',
        commands: [
          { phrases: ['Fokus starten', 'Timer starten', 'Start'], desc: 'Startet den aktuellen Pomodoro-Timer', action: () => this.handleFocusStart() },
          { phrases: ['Timer pausieren', 'Pause', 'Stopp'], desc: 'Pausiert den laufenden Timer', action: () => this.handleFocusPause() },
          { phrases: ['Timer zurücksetzen', 'Timer Reset'], desc: 'Setzt den Timer auf Ausgangszeit zurück', action: () => this.handleFocusReset() },
          { phrases: ['Kurze Pause'], desc: 'Schaltet auf 5-Minuten Pause um', action: () => this.handleFocusMode('short-break') },
          { phrases: ['Lange Pause'], desc: 'Schaltet auf 15-Minuten Pause um', action: () => this.handleFocusMode('long-break') },
          { phrases: ['Pomodoro Modus', 'Arbeitsphase'], desc: 'Schaltet auf 25-Minuten Fokus um', action: () => this.handleFocusMode('pomodoro') },
          { phrases: ['Ambient Sound Regen', 'Wald', 'Café', 'Aus'], desc: 'Spielt entspannende Klanglandschaften ab', action: (type) => this.handleAmbientSound(type || 'rain') }
        ]
      },
      {
        id: 'os',
        title: '🪟 OrbitOS Fenster & Desktop',
        commands: [
          { phrases: ['Öffne Rechner', 'Taschenrechner'], desc: 'Öffnet das Taschenrechner-Fenster im Desktop', action: () => this.handleOSApp('calculator') },
          { phrases: ['Öffne Terminal', 'Konsole', 'Linux Shell'], desc: 'Öffnet das Unix-Terminal mit Superuser `sudo`', action: () => this.handleOSApp('terminal') },
          { phrases: ['Öffne Spotify', 'Spotify Player'], desc: 'Öffnet den vollwertigen Spotify-Player', action: () => this.handleOSApp('spotify') },
          { phrases: ['Öffne OS Einstellungen'], desc: 'Öffnet die Desktop-Systemeinstellungen', action: () => this.handleOSApp('settings') },
          { phrases: ['Schließe Rechner', 'Schließe Terminal'], desc: 'Schließt ein bestimmtes Fenster', action: (app) => this.handleOSCloseApp(app || 'calculator') },
          { phrases: ['Schließe alle Fenster', 'Desktop aufräumen'], desc: 'Schließt alle geöffneten Desktop-Fenster', action: () => this.handleOSCloseAll() },
          { phrases: ['Hintergrund Cyberpunk', 'Nebula', 'Midnight', 'Aurora', 'Shadow Knight'], desc: 'Wechselt dynamisch das Desktop-Wallpaper', action: (wp) => this.handleOSWallpaper(wp || 'cyberpunk') }
        ]
      },
      {
        id: 'spotify',
        title: '🎵 Spotify Musiksteuerung',
        commands: [
          { phrases: ['Musik abspielen', 'Play'], desc: 'Startet die Spotify-Wiedergabe', action: () => this.handleSpotify('play') },
          { phrases: ['Musik anhalten', 'Musik pausieren', 'Pause'], desc: 'Pausiert die Wiedergabe', action: () => this.handleSpotify('pause') },
          { phrases: ['Nächster Titel', 'Nächster Song', 'Skip'], desc: 'Springt zum nächsten Titel', action: () => this.handleSpotify('next') },
          { phrases: ['Vorheriger Titel', 'Zurück'], desc: 'Geht zum vorherigen Titel zurück', action: () => this.handleSpotify('prev') }
        ]
      },
      {
        id: 'system',
        title: '✨ System & Effekte',
        commands: [
          { phrases: ['Konfetti', 'Party', 'Feier'], desc: 'Feuert die Canvas-Partikel-Physik ab', action: () => this.handleConfetti() },
          { phrases: ['Ton an', 'Sound an', 'Ton aus', 'Sound aus'], desc: 'Schaltet Audio-Synthesizer Feedback um', action: () => this.handleToggleSound() },
          { phrases: ['Sprachausgabe an', 'Sprachausgabe aus'], desc: 'Aktiviert/deaktiviert die Sprachantwort', action: () => this.handleToggleTTS() },
          { phrases: ['Backup öffnen', 'Backup exportieren'], desc: 'Öffnet den Datensicherungs-Dialog', action: () => this.handleBackup() },
          { phrases: ['Cloud synchronisieren', 'Sync'], desc: 'Synchronisiert Daten mit Supabase', action: () => this.handleCloudSync() },
          { phrases: ['Admin öffnen', 'Admin Panel'], desc: 'Öffnet den geschützten PIN-Adminbereich', action: () => this.handleAdmin() },
          { phrases: ['Hilfe', 'Was kann ich sagen?', 'Befehle'], desc: 'Öffnet diese Sprachbefehl-Übersicht', action: () => this.showHelpModal() }
        ]
      }
    ];

    this.init();
  }

  /* --------------------------------------------------------------------------
     Initialization & Browser Compatibility
     -------------------------------------------------------------------------- */
  init() {
    this.checkSpeechRecognition();
    this.initTTS();
    this.injectUI();
    this.bindEvents();

    // Expose globally for direct terminal & script access
    window.orbitVoice = this;
  }

  checkSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.lang;
        this.recognition.continuous = false; // single phrase turns
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.updateUIState();
          this.showBubble('Ich höre zu...', 'Sprich jetzt deinen Befehl...');
          if (this.suite && this.suite.sound) this.suite.sound.playPop();
        };

        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (interimTranscript) {
            this.showBubble('Erkenne...', interimTranscript, 'info', true);
          }

          if (finalTranscript) {
            this.lastTranscript = finalTranscript.trim();
            this.parseAndExecute(this.lastTranscript);
          }
        };

        this.recognition.onerror = (event) => {
          console.warn('SpeechRecognition Error:', event.error);
          this.isListening = false;
          this.updateUIState();

          let msg = 'Fehler bei der Spracherkennung.';
          if (event.error === 'not-allowed') {
            msg = 'Mikrofonzugriff verweigert. Bitte erlaube das Mikrofon in der Browser-Adressleiste.';
          } else if (event.error === 'no-speech') {
            msg = 'Keine Sprache erkannt. Bitte versuche es erneut.';
          } else if (event.error === 'network') {
            msg = 'Netzwerkfehler bei der Spracherkennung.';
          }

          this.showBubble('Hinweis', msg, 'error');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.updateUIState();
        };
      } catch (err) {
        console.error('SpeechRecognition init failed:', err);
        this.isSupported = false;
      }
    } else {
      this.isSupported = false;
    }
  }

  initTTS() {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural German voice
        this.activeVoice = voices.find(v => v.lang.startsWith('de') && (v.name.includes('Katja') || v.name.includes('Google') || v.name.includes('Stefan') || v.name.includes('German'))) 
          || voices.find(v => v.lang.startsWith('de')) 
          || null;
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  speak(text) {
    if (!this.ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // clear previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.lang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      if (this.activeVoice) utterance.voice = this.activeVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /* --------------------------------------------------------------------------
     UI Injection (Floating Capsule, Header Trigger, Help Modal)
     -------------------------------------------------------------------------- */
  injectUI() {
    // 1. Header Voice Assistant Button
    const headerRight = document.querySelector('.suite-header-right');
    if (headerRight && !document.getElementById('btn-voice-assistant')) {
      const btn = document.createElement('button');
      btn.className = `btn-icon suite-control-btn btn-voice-assistant ${this.isSupported ? 'is-ready' : ''}`;
      btn.id = 'btn-voice-assistant';
      btn.title = 'OrbitVoice Sprachsteuerung (Alt + V)';
      btn.setAttribute('aria-label', 'Sprachsteuerung');
      btn.innerHTML = `
        <svg class="voice-mic-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
        <span class="voice-status-dot" id="voice-status-dot"></span>
      `;
      // Insert next to sound toggle or clock
      const soundBtn = document.getElementById('btn-sound-toggle');
      if (soundBtn && soundBtn.parentNode) {
        soundBtn.parentNode.insertBefore(btn, soundBtn);
      } else {
        headerRight.appendChild(btn);
      }
    }

    // 2. Floating OrbitVoice Capsule Widget (Bottom Right)
    if (!document.getElementById('orbit-voice-widget')) {
      const widget = document.createElement('div');
      widget.id = 'orbit-voice-widget';
      widget.innerHTML = `
        <!-- Live Transcript Bubble -->
        <div class="voice-transcript-bubble" id="voice-transcript-bubble">
          <div class="voice-bubble-header">
            <span id="voice-bubble-title">OrbitVoice</span>
            <span style="font-size: 11px; opacity: 0.7;">Alt + V</span>
          </div>
          <div class="voice-bubble-text" id="voice-bubble-text">Klicke auf das Mikrofon oder drücke Alt + V zum Sprechen.</div>
          <div class="voice-bubble-feedback hidden" id="voice-bubble-feedback"></div>
        </div>

        <!-- Quick Text Command Drawer (for typing/testing without mic) -->
        <form class="voice-text-input-drawer hidden" id="voice-text-drawer" onsubmit="return false;">
          <input type="text" id="voice-text-input" placeholder="Befehl tippen (z. B. 'Neue Aufgabe Meeting', 'Öffne Notizen')...">
          <button type="submit" id="btn-voice-text-submit" title="Ausführen">➔</button>
        </form>

        <!-- Floating Capsule Main Bar -->
        <div class="voice-floating-capsule" id="voice-floating-capsule">
          <button class="voice-orb-btn" id="voice-orb-btn" title="OrbitVoice aktivieren (Alt + V)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <div class="voice-orb-ring"></div>
          </button>

          <div class="voice-waveform" id="voice-waveform">
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
          </div>

          <div class="voice-capsule-info">
            <span class="voice-capsule-title">OrbitVoice <span style="font-size: 10px; color: #818cf8;">AI</span></span>
            <span class="voice-capsule-sub" id="voice-capsule-status">Bereit • Alt+V</span>
          </div>

          <div class="voice-capsule-actions">
            <button class="voice-sub-btn" id="btn-toggle-voice-text" title="Befehl manuell tippen">
              ⌨️
            </button>
            <button class="voice-sub-btn" id="btn-toggle-voice-tts" title="Sprachantwort an/aus">
              ${this.ttsEnabled ? '🔊' : '🔇'}
            </button>
            <button class="voice-sub-btn" id="btn-open-voice-help" title="Alle Sprachbefehle ansehen">
              ❓
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(widget);
    }

    // 3. OrbitOS Taskbar Tray Integration
    const osTray = document.getElementById('orbit-os-taskbar');
    if (osTray && !document.getElementById('os-tray-voice')) {
      const trayRight = osTray.querySelector('.os-taskbar-right');
      if (trayRight) {
        const item = document.createElement('div');
        item.className = 'os-tray-item os-tray-voice';
        item.id = 'os-tray-voice';
        item.title = 'OrbitVoice Sprachsteuerung (Alt + V)';
        item.innerHTML = `
          <span class="os-tray-voice-icon">🎙️</span>
          <span id="os-tray-voice-text">Voice</span>
        `;
        trayRight.insertBefore(item, trayRight.firstChild);
      }
    }

    // 4. Help & Command Center Modal
    if (!document.getElementById('voice-modal')) {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop hidden';
      modal.id = 'voice-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'voice-modal-title');
      modal.innerHTML = `
        <div class="modal-window voice-help-modal-window">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <div class="modal-title-icon-box" style="background: rgba(99, 102, 241, 0.2); color: #818cf8;">
                🎙️
              </div>
              <div>
                <h2 class="modal-title" id="voice-modal-title">OrbitVoice • Sprachsteuerung</h2>
                <p class="modal-subtitle">Steuere die gesamte Suite, OrbitOS und deine Aufgaben per Stimme</p>
              </div>
            </div>
            <button class="modal-close-btn" id="voice-modal-close" aria-label="Schließen">&times;</button>
          </div>

          <div class="voice-help-tabs" id="voice-help-tabs">
            <button class="voice-help-tab-btn active" data-tab="all">🌟 Alle (${this.commandCategories.reduce((acc, c) => acc + c.commands.length, 0)})</button>
            ${this.commandCategories.map(c => `<button class="voice-help-tab-btn" data-tab="${c.id}">${c.title}</button>`).join('')}
          </div>

          <div class="voice-help-body">
            <div class="voice-status-banner ${this.isSupported ? '' : 'unsupported'}" id="voice-support-banner">
              <div>
                <strong>${this.isSupported ? '🎙️ Web Speech API aktiv' : '⚠️ Mikrofon-Erkennung im Browser nicht nativ aktiv'}</strong>
                <p style="margin: 3px 0 0 0; font-size: 0.8rem; opacity: 0.9;">
                  ${this.isSupported 
                    ? 'Funktioniert direkt über dein Mikrofon in Deutsch (de-DE). Drücke jederzeit <strong>Alt + V</strong>.' 
                    : 'Dein aktueller Browser unterstützt die native Web Speech API nicht direkt. Du kannst Befehle alternativ über das ⌨️ Textfeld tippen oder Chrome / Edge nutzen.'}
                </p>
              </div>
              <button class="btn-primary" id="btn-modal-test-mic" style="flex-shrink: 0; padding: 6px 14px; font-size: 0.8rem;">
                ${this.isListening ? '🛑 Aufnahme stoppen' : '🎙️ Jetzt sprechen'}
              </button>
            </div>

            <div class="voice-commands-grid" id="voice-commands-grid">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      this.renderCommandCards('all');
    }
  }

  /* --------------------------------------------------------------------------
     Event Bindings
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Header Mic Trigger
    const btnHeader = document.getElementById('btn-voice-assistant');
    if (btnHeader) {
      btnHeader.addEventListener('click', () => this.toggleListening());
    }

    // Floating Orb Trigger
    const btnOrb = document.getElementById('voice-orb-btn');
    if (btnOrb) {
      btnOrb.addEventListener('click', () => this.toggleListening());
    }

    // OrbitOS Tray Voice
    const osTrayVoice = document.getElementById('os-tray-voice');
    if (osTrayVoice) {
      osTrayVoice.addEventListener('click', () => this.toggleListening());
    }

    // Modal Test Mic button
    const btnModalTest = document.getElementById('btn-modal-test-mic');
    if (btnModalTest) {
      btnModalTest.addEventListener('click', () => {
        this.toggleListening();
        btnModalTest.textContent = this.isListening ? '🛑 Aufnahme stoppen' : '🎙️ Jetzt sprechen';
      });
    }

    // Toggle Text Command Input Drawer
    const btnToggleText = document.getElementById('btn-toggle-voice-text');
    const textDrawer = document.getElementById('voice-text-drawer');
    const textInput = document.getElementById('voice-text-input');
    if (btnToggleText && textDrawer) {
      btnToggleText.addEventListener('click', () => {
        const isHidden = textDrawer.classList.toggle('hidden');
        if (!isHidden && textInput) {
          textInput.focus();
        }
      });
    }

    // Submit Text Command
    if (textDrawer && textInput) {
      textDrawer.addEventListener('submit', (e) => {
        e.preventDefault();
        const cmd = textInput.value.trim();
        if (cmd) {
          textInput.value = '';
          textDrawer.classList.add('hidden');
          this.parseAndExecute(cmd);
        }
      });
    }

    // Toggle TTS
    const btnToggleTTS = document.getElementById('btn-toggle-voice-tts');
    if (btnToggleTTS) {
      btnToggleTTS.addEventListener('click', () => {
        this.handleToggleTTS();
        btnToggleTTS.textContent = this.ttsEnabled ? '🔊' : '🔇';
      });
    }

    // Help Center Modal Open
    const btnOpenHelp = document.getElementById('btn-open-voice-help');
    if (btnOpenHelp) {
      btnOpenHelp.addEventListener('click', () => this.showHelpModal());
    }

    // Close Help Modal
    const modalClose = document.getElementById('voice-modal-close');
    const voiceModal = document.getElementById('voice-modal');
    if (modalClose && voiceModal) {
      modalClose.addEventListener('click', () => this.closeHelpModal());
      voiceModal.addEventListener('click', (e) => {
        if (e.target === voiceModal) this.closeHelpModal();
      });
    }

    // Help Category Tabs
    const tabsContainer = document.getElementById('voice-help-tabs');
    if (tabsContainer) {
      tabsContainer.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.voice-help-tab-btn');
        if (!tabBtn) return;
        tabsContainer.querySelectorAll('.voice-help-tab-btn').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.renderCommandCards(tabBtn.dataset.tab);
      });
    }

    // Global Keyboard Shortcut: Alt + V
    window.addEventListener('keydown', (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        this.toggleListening();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Voice Recognition State Machine
     -------------------------------------------------------------------------- */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.isSupported || !this.recognition) {
      // Fallback: Open text command drawer
      const textDrawer = document.getElementById('voice-text-drawer');
      const textInput = document.getElementById('voice-text-input');
      if (textDrawer) {
        textDrawer.classList.remove('hidden');
        if (textInput) textInput.focus();
      }
      this.showBubble('Spracheingabe nicht verfügbar', 'Nutze bitte Chrome/Edge oder tippe deinen Befehl ins Eingabefeld.', 'error');
      return;
    }

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start caught:', e);
      // Already running or permission issue
      this.recognition.stop();
      setTimeout(() => {
        try { this.recognition.start(); } catch (err) {}
      }, 200);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.updateUIState();
  }

  updateUIState() {
    const headerBtn = document.getElementById('btn-voice-assistant');
    const floatingCapsule = document.getElementById('voice-floating-capsule');
    const osTrayVoice = document.getElementById('os-tray-voice');
    const statusText = document.getElementById('voice-capsule-status');

    if (this.isListening) {
      if (headerBtn) headerBtn.classList.add('is-listening');
      if (floatingCapsule) floatingCapsule.classList.add('is-listening');
      if (osTrayVoice) osTrayVoice.classList.add('is-listening');
      if (statusText) statusText.textContent = 'Ich höre zu...';
    } else {
      if (headerBtn) headerBtn.classList.remove('is-listening');
      if (floatingCapsule) floatingCapsule.classList.remove('is-listening');
      if (osTrayVoice) osTrayVoice.classList.remove('is-listening');
      if (statusText) statusText.textContent = 'Bereit • Alt+V';
    }
  }

  showBubble(title, text, type = 'info', isInterim = false) {
    const bubble = document.getElementById('voice-transcript-bubble');
    const elTitle = document.getElementById('voice-bubble-title');
    const elText = document.getElementById('voice-bubble-text');
    const elFeedback = document.getElementById('voice-bubble-feedback');
    if (!bubble || !elTitle || !elText) return;

    if (this.hideTranscriptTimeout) {
      clearTimeout(this.hideTranscriptTimeout);
      this.hideTranscriptTimeout = null;
    }

    elTitle.textContent = title;
    if (isInterim) {
      elText.innerHTML = `<span class="interim">"${this.escapeHtml(text)}"</span>`;
    } else {
      elText.innerHTML = `"${this.escapeHtml(text)}"`;
    }

    if (elFeedback) {
      elFeedback.className = `voice-bubble-feedback hidden`;
    }

    bubble.classList.add('show');

    if (!isInterim) {
      this.hideTranscriptTimeout = setTimeout(() => {
        bubble.classList.remove('show');
      }, 5000);
    }
  }

  setBubbleFeedback(message, type = 'success') {
    const elFeedback = document.getElementById('voice-bubble-feedback');
    if (!elFeedback) return;
    elFeedback.className = `voice-bubble-feedback ${type}`;
    elFeedback.innerHTML = `${type === 'success' ? '✓' : '⚠️'} ${this.escapeHtml(message)}`;
    elFeedback.classList.remove('hidden');
  }

  /* --------------------------------------------------------------------------
     Core Command Parser & Natural Language Understanding
     -------------------------------------------------------------------------- */
  parseAndExecute(rawText) {
    if (!rawText || typeof rawText !== 'string') return;
    const text = rawText.trim();
    const lower = text.toLowerCase();

    this.showBubble('Erkannter Befehl', text, 'info');

    // 1. Navigation / App Switch
    if (/^(öffne|zeige|gehe zu|wechsel zu|switch to)?\s*(die\s+)?(aufgaben|tasks|kanban|todo|to-do|board)$/i.test(lower) || lower === 'aufgaben' || lower === 'tasks') {
      this.suite.switchApp('tasks');
      this.reply('OrbitTask geöffnet.', 'Aufgaben & Kanban geöffnet');
      return;
    }

    if (/^(öffne|zeige|gehe zu|wechsel zu)?\s*(die\s+)?(notizen|notes|markdown)$/i.test(lower) || lower === 'notizen' || lower === 'notes') {
      this.suite.switchApp('notes');
      this.reply('OrbitNotes geöffnet.', 'Notizen geöffnet');
      return;
    }

    if (/^(öffne|zeige|gehe zu|wechsel zu)?\s*(den\s+)?(fokus|pomodoro|timer|deep work)$/i.test(lower) || lower === 'fokus' || lower === 'pomodoro') {
      this.suite.switchApp('focus');
      this.reply('OrbitFocus geöffnet.', 'Fokus-Timer geöffnet');
      return;
    }

    if (/^(öffne|zeige|gehe zu|wechsel zu)?\s*(die\s+)?(gewohnheiten|habits|streaks|routinen)$/i.test(lower) || lower === 'gewohnheiten' || lower === 'habits') {
      this.suite.switchApp('habits');
      this.reply('OrbitHabits geöffnet.', 'Gewohnheiten geöffnet');
      return;
    }

    if (/^(öffne|zeige|gehe zu|wechsel zu)?\s*(die\s+)?(tools|werkzeuge|utilities)$/i.test(lower) || lower === 'tools') {
      this.suite.switchApp('tools');
      this.reply('OrbitTools geöffnet.', 'Entwickler-Tools geöffnet');
      return;
    }

    if (/^(öffne|zeige|gehe zu|wechsel zu)?\s*(die\s+)?(spiele|rätsel|denksport|games)$/i.test(lower) || lower === 'spiele' || lower === 'rätsel') {
      this.suite.switchApp('riddle');
      this.reply('OrbitRätsel geöffnet.', 'Spiele & Rätsel geöffnet');
      return;
    }

    if (/^(öffne|starte)?\s*folienwerk$/i.test(lower)) {
      this.suite.switchApp('folienwerk');
      this.reply('Folienwerk geöffnet.', 'Folienwerk Copilot geöffnet');
      return;
    }

    if (/^(startseite|dashboard|hub|gehe zur startseite|home)$/i.test(lower)) {
      this.suite.switchApp('hub');
      this.reply('Startseite geöffnet.', 'Startseite Hub geöffnet');
      return;
    }

    if (/^(desktop|desktop modus|orbit os|öffne desktop|starte desktop|os modus)$/i.test(lower)) {
      if (this.suite.os) {
        this.suite.os.enableOSMode();
      } else {
        this.suite.switchApp('os');
      }
      this.reply('OrbitOS Desktop-Umgebung aktiviert.', 'OrbitOS Desktop aktiviert');
      return;
    }

    if (/^(suite|workspace|suite modus|workspace modus|zurück zur suite|desktop beenden|desktop schließen)$/i.test(lower)) {
      if (this.suite.os) {
        this.suite.os.disableOSMode();
      } else {
        this.suite.switchApp('hub');
      }
      this.reply('Zurück im Suite Workspace.', 'Workspace-Modus aktiv');
      return;
    }

    // 2. Direct Task Creation & Management
    // "Neue Aufgabe [Titel]", "Aufgabe erstellen [Titel]", "Aufgabe anlegen [Titel]", "Erinnere mich an [Titel]"
    const taskCreateMatch = lower.match(/^(?:neue aufgabe|aufgabe erstellen|aufgabe anlegen|erstelle aufgabe|erinner(?:e)? mich an)\s*(.*)$/i);
    if (taskCreateMatch) {
      const taskTitle = taskCreateMatch[1].trim();
      this.handleCreateTask(taskTitle);
      return;
    }

    // "Suche Aufgabe [Suchbegriff]" or "Suche nach [Begriff]"
    const taskSearchMatch = lower.match(/^(?:suche aufgabe|filtere aufgabe|suche nach aufgabe|suche)\s+(.+)$/i);
    if (taskSearchMatch && !lower.includes('notiz')) {
      const term = taskSearchMatch[1].trim();
      this.handleSearchTasks(term);
      return;
    }

    // Task View switches
    if (/^(ansicht liste|listenansicht|zeige liste)$/i.test(lower)) {
      this.handleSwitchTaskView('list');
      return;
    }
    if (/^(ansicht kanban|kanban board|zeige kanban)$/i.test(lower)) {
      this.handleSwitchTaskView('kanban');
      return;
    }
    if (/^(ansicht statistik|analytics|zeige statistik)$/i.test(lower)) {
      this.handleSwitchTaskView('analytics');
      return;
    }

    // Task Filter switches
    if (/^(zeige erledigte aufgaben|erledigte aufgaben|nur erledigte)$/i.test(lower)) {
      this.handleFilterTasks('completed');
      return;
    }
    if (/^(zeige offene aufgaben|offene aufgaben|nur to do|nur todo)$/i.test(lower)) {
      this.handleFilterTasks('todo');
      return;
    }
    if (/^(alle aufgaben|alle aufgaben anzeigen|filter zurücksetzen|filter löschen)$/i.test(lower)) {
      this.handleResetTaskFilters();
      return;
    }

    // 3. Notes Creation & Search & Dictation
    // "Neue Notiz [Inhalt]", "Notiere [Inhalt]"
    const noteCreateMatch = lower.match(/^(?:neue notiz|notiz erstellen|notiz anlegen|notiere|notieren)\s*(.*)$/i);
    if (noteCreateMatch) {
      const noteContent = noteCreateMatch[1].trim();
      this.handleCreateNote(noteContent);
      return;
    }

    const noteSearchMatch = lower.match(/^(?:suche notiz|finde notiz)\s+(.+)$/i);
    if (noteSearchMatch) {
      this.handleSearchNotes(noteSearchMatch[1].trim());
      return;
    }

    // Dictation command: "Diktat: ..." or "Schreibe: ..."
    const dictationMatch = lower.match(/^(?:diktat|schreibe|tippe)\s*[:,\s]\s*(.*)$/i);
    if (dictationMatch) {
      this.handleDictation(dictationMatch[1].trim() || text);
      return;
    }

    // 4. Focus / Pomodoro Controls
    if (/^(fokus starten|timer starten|starte timer|pomodoro starten|timer weiter|weiter|start)$/i.test(lower)) {
      this.handleFocusStart();
      return;
    }
    if (/^(fokus pausieren|timer pausieren|timer anhalten|timer stoppen|stopp|pause|anhalten)$/i.test(lower)) {
      this.handleFocusPause();
      return;
    }
    if (/^(timer zurücksetzen|timer reset|reset|zurücksetzen)$/i.test(lower)) {
      this.handleFocusReset();
      return;
    }
    if (/^(kurze pause|short break)$/i.test(lower)) {
      this.handleFocusMode('short-break');
      return;
    }
    if (/^(lange pause|long break)$/i.test(lower)) {
      this.handleFocusMode('long-break');
      return;
    }
    if (/^(pomodoro|arbeitsphase|fokus zeit)$/i.test(lower)) {
      this.handleFocusMode('pomodoro');
      return;
    }

    // Ambient Sound
    if (/ambient sound|umgebungsgeräusch/i.test(lower) || /^(regen|wald|café|cafe|rauschen)\s*(abspielen|starten)?$/i.test(lower)) {
      let soundType = 'rain';
      if (lower.includes('wald')) soundType = 'forest';
      else if (lower.includes('café') || lower.includes('cafe')) soundType = 'cafe';
      else if (lower.includes('rausch')) soundType = 'noise';
      else if (lower.includes('aus') || lower.includes('stopp')) soundType = 'off';
      this.handleAmbientSound(soundType);
      return;
    }

    // 5. OrbitOS Window & Desktop Controls
    if (/^(öffne\s+)?(den\s+)?(rechner|taschenrechner|calculator)$/i.test(lower)) {
      this.handleOSApp('calculator');
      return;
    }
    if (/^(öffne\s+)?(das\s+)?(terminal|konsole|bash|shell)$/i.test(lower)) {
      this.handleOSApp('terminal');
      return;
    }
    if (/^(öffne\s+)?spotify$/i.test(lower)) {
      this.handleOSApp('spotify');
      return;
    }
    if (/^(öffne\s+)?(die\s+)?(os einstellungen|desktop einstellungen|systemeinstellungen)$/i.test(lower)) {
      this.handleOSApp('settings');
      return;
    }
    if (/^(schließe\s+)?(den\s+)?rechner$/i.test(lower)) {
      this.handleOSCloseApp('calculator');
      return;
    }
    if (/^(schließe\s+)?(das\s+)?terminal$/i.test(lower)) {
      this.handleOSCloseApp('terminal');
      return;
    }
    if (/^(schließe\s+)?spotify$/i.test(lower)) {
      this.handleOSCloseApp('spotify');
      return;
    }
    if (/^(schließe alle fenster|alle fenster schließen|desktop aufräumen)$/i.test(lower)) {
      this.handleOSCloseAll();
      return;
    }

    // Wallpapers
    const wpMatch = lower.match(/(?:hintergrund|wallpaper)\s*(?:ändern auf|zu)?\s*(cyberpunk|nebula|midnight|aurora|shadow knight)/i);
    if (wpMatch) {
      const wp = wpMatch[1].toLowerCase().replace(/\s+/g, '-');
      this.handleOSWallpaper(wp);
      return;
    }

    // 6. Spotify Playback Controls
    if (/^(musik abspielen|song abspielen|play|musik starten)$/i.test(lower)) {
      this.handleSpotify('play');
      return;
    }
    if (/^(musik anhalten|musik pausieren|musik pause|pause musik)$/i.test(lower)) {
      this.handleSpotify('pause');
      return;
    }
    if (/^(nächster titel|nächster song|nächstes lied|skip|weiter)$/i.test(lower)) {
      this.handleSpotify('next');
      return;
    }
    if (/^(vorheriger titel|vorheriger song|zurück)$/i.test(lower)) {
      this.handleSpotify('prev');
      return;
    }

    // 7. System Features
    if (/^(konfetti|party|feier|glückwunsch)$/i.test(lower)) {
      this.handleConfetti();
      return;
    }

    if (/^(ton an|sound an|ton einschalten|sound einschalten)$/i.test(lower)) {
      if (this.suite && this.suite.sound && !this.suite.sound.enabled) {
        this.suite.sound.toggle();
        this.suite.updateSoundIcon();
      }
      this.reply('Sound aktiviert.', 'Synthesizer-Sound an');
      return;
    }
    if (/^(ton aus|sound aus|stumm|ton ausschalten|sound ausschalten)$/i.test(lower)) {
      if (this.suite && this.suite.sound && this.suite.sound.enabled) {
        this.suite.sound.toggle();
        this.suite.updateSoundIcon();
      }
      this.reply('Sound stummgeschaltet.', 'Synthesizer-Sound aus');
      return;
    }

    if (/^(sprachausgabe an|sprache an)$/i.test(lower)) {
      this.ttsEnabled = true;
      localStorage.setItem('orbit_voice_tts', 'true');
      this.reply('Sprachausgabe aktiviert.', 'Sprachausgabe an');
      return;
    }
    if (/^(sprachausgabe aus|sprache aus)$/i.test(lower)) {
      this.reply('Sprachausgabe wird deaktiviert.', 'Sprachausgabe aus');
      this.ttsEnabled = false;
      localStorage.setItem('orbit_voice_tts', 'false');
      return;
    }

    if (/^(backup|backup öffnen|datensicherung|backup exportieren)$/i.test(lower)) {
      this.handleBackup();
      return;
    }

    if (/^(cloud|sync|synchronisieren|cloud sync)$/i.test(lower)) {
      this.handleCloudSync();
      return;
    }

    if (/^(admin|admin öffnen|admin bereich|admin panel)$/i.test(lower)) {
      this.handleAdmin();
      return;
    }

    if (/^(hilfe|was kann ich sagen|befehle|hilfe anzeigen|voice help)$/i.test(lower)) {
      this.showHelpModal();
      this.reply('Hier sind alle verfügbaren Sprachbefehle.', 'Hilfe geöffnet');
      return;
    }

    // 8. Universal Fallback: If an input or textarea is currently focused, write dictation into it!
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && !activeEl.disabled && !activeEl.readOnly) {
      this.insertAtCursor(activeEl, text);
      this.reply(`Diktat eingefügt: "${text}"`, `Text eingefügt: "${text}"`);
      return;
    }

    // 9. If unrecognized, offer to create task or note
    this.showBubble('Befehl nicht genau erkannt', `Habe verstanden: "${text}". Sag z. B. "Neue Aufgabe ${text}" oder "Öffne Aufgaben".`, 'info');
    if (this.suite && this.suite.sound) this.suite.sound.playTrash();
  }

  /* --------------------------------------------------------------------------
     Action Handlers
     -------------------------------------------------------------------------- */
  handleCreateTask(title) {
    if (!this.suite.taskApp) return;

    if (!title) {
      this.suite.switchApp('tasks');
      this.suite.taskApp.openCreateModal();
      this.reply('Aufgaben-Erstellung geöffnet.', 'Aufgabe erstellen geöffnet');
      return;
    }

    // Capitalize first letter
    const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1);

    const newTask = {
      id: 'task-' + Date.now(),
      title: cleanTitle,
      description: 'Per Sprachbefehl erstellt via OrbitVoice.',
      status: 'todo',
      priority: 'medium',
      category: 'Privat',
      dueDate: '',
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.suite.taskApp.tasks.unshift(newTask);
    this.suite.taskApp.saveTasks();
    this.suite.taskApp.render();
    if (this.suite.sound) this.suite.sound.playSuccess();

    this.reply(`Aufgabe "${cleanTitle}" wurde erstellt.`, `Aufgabe "${cleanTitle}" erstellt!`);
  }

  handleSearchTasks(term) {
    if (!this.suite.taskApp) return;
    this.suite.switchApp('tasks');
    this.suite.taskApp.searchQuery = term.toLowerCase();
    if (this.suite.taskApp.dom.globalSearch) {
      this.suite.taskApp.dom.globalSearch.value = term;
    }
    this.suite.taskApp.render();
    this.reply(`Aufgaben nach "${term}" gefiltert.`, `Suche nach "${term}"`);
  }

  handleSwitchTaskView(view) {
    if (!this.suite.taskApp) return;
    this.suite.switchApp('tasks');
    this.suite.taskApp.switchView(view);
    this.reply(`Ansicht ${view} aktiviert.`, `Aufgaben-Ansicht: ${view}`);
  }

  handleFilterTasks(status) {
    if (!this.suite.taskApp) return;
    this.suite.switchApp('tasks');
    this.suite.taskApp.filterType = 'status';
    this.suite.taskApp.filterVal = status;
    this.suite.taskApp.render();
    this.reply(`Filter auf ${status} gesetzt.`, `Filter: ${status}`);
  }

  handleResetTaskFilters() {
    if (!this.suite.taskApp) return;
    this.suite.switchApp('tasks');
    this.suite.taskApp.filterType = 'all';
    this.suite.taskApp.filterVal = 'all';
    this.suite.taskApp.searchQuery = '';
    if (this.suite.taskApp.dom.globalSearch) {
      this.suite.taskApp.dom.globalSearch.value = '';
    }
    this.suite.taskApp.render();
    this.reply('Alle Filter zurückgesetzt.', 'Alle Aufgaben angezeigt');
  }

  handleCreateNote(text) {
    if (!this.suite.notesApp) return;

    if (!text) {
      this.suite.switchApp('notes');
      this.suite.notesApp.openCreateModal();
      this.reply('Notiz-Erstellung geöffnet.', 'Neue Notiz geöffnet');
      return;
    }

    const title = text.length > 28 ? text.slice(0, 28) + '...' : text;
    const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1);

    const newNote = {
      id: 'note-' + Date.now(),
      title: cleanTitle,
      content: text,
      category: 'Idee',
      pinned: false,
      createdAt: new Date().toISOString()
    };

    this.suite.notesApp.notes.unshift(newNote);
    this.suite.notesApp.saveNotes();
    this.suite.notesApp.render();
    if (this.suite.sound) this.suite.sound.playSuccess();

    this.reply(`Notiz "${cleanTitle}" wurde gespeichert.`, `Notiz "${cleanTitle}" angelegt!`);
  }

  handleSearchNotes(term) {
    if (!this.suite.notesApp) return;
    this.suite.switchApp('notes');
    this.suite.notesApp.searchQuery = term.toLowerCase();
    if (this.suite.notesApp.dom.searchInput) {
      this.suite.notesApp.dom.searchInput.value = term;
    }
    this.suite.notesApp.render();
    this.reply(`Notizen nach "${term}" gefiltert.`, `Notizen-Suche: "${term}"`);
  }

  handleDictation(text) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && !activeEl.disabled && !activeEl.readOnly) {
      this.insertAtCursor(activeEl, text);
      this.reply('Text eingefügt.', `Diktat eingefügt: "${text}"`);
    } else {
      // Fallback: create as quick note
      this.handleCreateNote(text);
    }
  }

  handleFocusStart() {
    if (!this.suite.focusApp) return;
    this.suite.switchApp('focus');
    if (!this.suite.focusApp.isRunning) {
      this.suite.focusApp.start();
    }
    this.reply('Fokus-Timer gestartet.', 'Pomodoro-Timer läuft ⏱️');
  }

  handleFocusPause() {
    if (!this.suite.focusApp) return;
    this.suite.switchApp('focus');
    if (this.suite.focusApp.isRunning) {
      this.suite.focusApp.pause();
    }
    this.reply('Fokus-Timer pausiert.', 'Timer pausiert ⏸️');
  }

  handleFocusReset() {
    if (!this.suite.focusApp) return;
    this.suite.switchApp('focus');
    this.suite.focusApp.reset();
    this.reply('Timer zurückgesetzt.', 'Timer zurückgesetzt 🔄');
  }

  handleFocusMode(mode) {
    if (!this.suite.focusApp) return;
    this.suite.switchApp('focus');
    this.suite.focusApp.setMode(mode);
    const label = mode === 'pomodoro' ? 'Pomodoro (25m)' : mode === 'short-break' ? 'Kurze Pause (5m)' : 'Lange Pause (15m)';
    this.reply(`Modus gewechselt zu ${label}.`, `Modus: ${label}`);
  }

  handleAmbientSound(type) {
    if (!this.suite.sound) return;
    if (type === 'off') {
      this.suite.sound.stopAmbient();
      this.reply('Ambient Sound gestoppt.', 'Soundscape aus');
    } else {
      this.suite.sound.playAmbient(type);
      const names = { rain: 'Regen', forest: 'Wald', cafe: 'Café', noise: 'Rauschen' };
      this.reply(`Klanglandschaft ${names[type] || type} aktiviert.`, `Soundscape: ${names[type] || type} 🎧`);
    }
  }

  handleOSApp(appId) {
    if (!this.suite.os) {
      this.suite.switchApp(appId);
      return;
    }
    if (this.suite.os.activeMode !== 'os') {
      this.suite.os.enableOSMode();
    }
    this.suite.os.openApp(appId);
    this.reply(`App ${appId} geöffnet.`, `OrbitOS: ${appId} geöffnet`);
  }

  handleOSCloseApp(appId) {
    if (this.suite.os) {
      this.suite.os.closeApp(appId);
      this.reply(`Fenster ${appId} geschlossen.`, `Fenster ${appId} geschlossen`);
    }
  }

  handleOSCloseAll() {
    if (this.suite.os) {
      this.suite.os.closeAll();
      this.reply('Alle Fenster geschlossen.', 'Desktop aufgeräumt');
    }
  }

  handleOSWallpaper(wallpaper) {
    if (this.suite.os) {
      this.suite.os.setWallpaper(wallpaper);
      this.reply(`Hintergrund geändert zu ${wallpaper}.`, `Wallpaper: ${wallpaper}`);
    }
  }

  handleSpotify(action) {
    const sp = this.suite.os && this.suite.os.spotify ? this.suite.os.spotify : (window.SpotifyService ? new window.SpotifyService() : null);
    if (!sp) {
      this.reply('Spotify Service nicht initialisiert.', 'Spotify nicht bereit');
      return;
    }

    if (action === 'play') {
      sp.play();
      this.reply('Spotify Wiedergabe gestartet.', 'Spotify Play ▶️');
    } else if (action === 'pause') {
      sp.pause();
      this.reply('Spotify pausiert.', 'Spotify Pause ⏸️');
    } else if (action === 'next') {
      sp.next();
      this.reply('Nächster Track.', 'Spotify Skip ⏭️');
    } else if (action === 'prev') {
      sp.previous();
      this.reply('Vorheriger Track.', 'Spotify Zurück ⏮️');
    }
  }

  handleConfetti() {
    if (this.suite.confetti) {
      this.suite.confetti.fire({ particleCount: 80, spread: 70 });
    }
    if (this.suite.sound) this.suite.sound.playSuccess();
    this.reply('Konfetti!', '🎉 Konfetti abgefeuert!');
  }

  handleToggleSound() {
    if (this.suite.sound) {
      const state = this.suite.sound.toggle();
      this.suite.updateSoundIcon();
      this.reply(state ? 'Sound an.' : 'Sound aus.', state ? 'Sound an 🔊' : 'Sound aus 🔇');
    }
  }

  handleToggleTTS() {
    this.ttsEnabled = !this.ttsEnabled;
    localStorage.setItem('orbit_voice_tts', this.ttsEnabled ? 'true' : 'false');
    this.reply(this.ttsEnabled ? 'Sprachausgabe eingeschaltet.' : 'Sprachausgabe stummgeschaltet.', this.ttsEnabled ? 'Sprachausgabe 🔊' : 'Sprachausgabe 🔇');
  }

  handleBackup() {
    if (this.suite.dom && this.suite.dom.backupModal) {
      this.suite.dom.backupModal.classList.remove('hidden');
    }
    this.reply('Backup Dialog geöffnet.', 'Backup geöffnet 💾');
  }

  handleCloudSync() {
    if (this.suite.sync) {
      this.suite.sync.openModal('sync');
      this.reply('Cloud Synchronisation geöffnet.', 'Cloud Sync ☁️');
    }
  }

  handleAdmin() {
    if (this.suite.admin) {
      this.suite.admin.openModal();
      this.reply('Admin Bereich geöffnet.', 'Admin PIN-Eingabe 🔒');
    }
  }

  /* --------------------------------------------------------------------------
     Help Center Modal & Rendering
     -------------------------------------------------------------------------- */
  showHelpModal() {
    const modal = document.getElementById('voice-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (this.suite.sound) this.suite.sound.playPop();
    }
  }

  closeHelpModal() {
    const modal = document.getElementById('voice-modal');
    if (modal) modal.classList.add('hidden');
  }

  renderCommandCards(catId) {
    const grid = document.getElementById('voice-commands-grid');
    if (!grid) return;

    let items = [];
    if (catId === 'all') {
      this.commandCategories.forEach(c => {
        c.commands.forEach(cmd => items.push({ ...cmd, catTitle: c.title }));
      });
    } else {
      const cat = this.commandCategories.find(c => c.id === catId);
      if (cat) {
        cat.commands.forEach(cmd => items.push({ ...cmd, catTitle: cat.title }));
      }
    }

    grid.innerHTML = items.map((cmd, idx) => `
      <div class="voice-command-card">
        <div class="voice-cmd-phrases">
          ${cmd.phrases.map(p => `<span class="voice-phrase-tag">"${this.escapeHtml(p)}"</span>`).join('')}
        </div>
        <div class="voice-cmd-action">
          <span>${this.escapeHtml(cmd.desc)}</span>
          <button class="btn-test-cmd" data-idx="${idx}">Testen ▶</button>
        </div>
      </div>
    `).join('');

    // Bind test buttons
    grid.querySelectorAll('.btn-test-cmd').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = items[parseInt(btn.dataset.idx, 10)];
        if (item && item.action) {
          this.closeHelpModal();
          item.action();
          this.showBubble('Test-Befehl', item.phrases[0], 'info');
          this.setBubbleFeedback(item.desc, 'success');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     Helper Utilities
     -------------------------------------------------------------------------- */
  reply(spokenFeedback, visualFeedback) {
    this.setBubbleFeedback(visualFeedback, 'success');
    if (this.suite && this.suite.sound) this.suite.sound.playSuccess();
    this.speak(spokenFeedback);
  }

  insertAtCursor(inputEl, text) {
    if (!inputEl) return;
    const start = inputEl.selectionStart || inputEl.value.length;
    const end = inputEl.selectionEnd || inputEl.value.length;
    const val = inputEl.value;
    inputEl.value = val.substring(0, start) + (start > 0 && !val.charAt(start - 1).match(/\s/) ? ' ' : '') + text + val.substring(end);
    inputEl.selectionStart = inputEl.selectionEnd = start + text.length + 1;
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.OrbitVoice = OrbitVoice;
