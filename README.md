# 🪐 OrbitSuite • Integriertes Multi-App Produktivitäts-Framework

Eine hochmoderne, modulare All-in-One Produktivitäts- und Workflow-Suite im eleganten **Dark Glassmorphism Design**. Entwickelt mit Fokus auf visuelle Ästhetik, blitzschnelle Performance und Zero-Dependency-Leichtbau.

Über die zentrale **Startseite (App-Hub & Selector)** und die universelle **Schnellwechsel-Leiste** kann nahtlos zwischen allen Anwendungen der Suite gewechselt werden.

---

## 🚀 Die Suite-Module im Überblick

### 🏠 0. Startseite & App-Selector Hub
- **Zentraler Workspace Hub**: Begrüßungs-Banner mit Live-Uhrzeit, System-Status und tagesaktuellen KPIs aller Apps.
- **Interaktiver App-Selector**: 3D-Karten mit individuellen Glow-Effekten, Status-Pills und Schnellstarter-Buttons für jedes Modul.
- **Blitz-Aktionen**: Sofort neue Aufgaben anlegen, Notizen verfassen, Pomodoro-Timer starten oder Habits prüfen – ohne Umwege.
- **Live-Aktivitäts-Widgets**: Vorschau fälliger Aufgaben, heutige Gewohnheiten (direkt auf der Startseite abhakbar!) und angeheftete Notizen.

### 📋 1. OrbitTask • Pro Task Tracking & Kanban
- **Kanban-Board**: 5 Spalten (*Backlog*, *Zu erledigen*, *In Bearbeitung*, *Prüfung*, *Erledigt*) mit HTML5 Drag-and-Drop.
- **Listenansicht**: Tabellarische Übersicht mit Status-Checkboxen, Prioritäten, Fälligkeitsampel und Subtask-Fortschritt.
- **Analytics Dashboard**: SVG-Radialdiagramm für Gesamterledigung, horizontale Statusverteilung, Prioritätsmatrix und Kategorie-Aufschlüsselung.
- **Subtasks & Details**: Teilaufgaben mit Zähler, Notizen, Tags und Fälligkeitsdaten.

### 📝 2. OrbitNotes • Markdown & Quick-Notes Studio
- **Markdown-Unterstützung**: Überschriften, Listen, fette/kursive Formatierung und Code-Blöcke.
- **Farbkategorien & Filter**: Filterung nach *Ideen*, *Arbeit*, *Code*, *Wichtig* und *Privat*.
- **Pinning & Suche**: Wichtige Notizen oben anheften (werden auch auf der Startseite gespiegelt) und Sofortsuche.
- **Zwischenablage**: 1-Klick-Kopieren von Notizen mit Bestätigungs-Toast.

### ⏱️ 3. OrbitFocus • Pomodoro & Ambient Soundscape
- **Pomodoro-Zyklen**: *Fokus* (25 Min.), *Kurze Pause* (5 Min.), *Lange Pause* (15 Min.).
- **Animierter Countdown-Ring**: SVG-Kreisanzeige mit Farbanpassung je nach Modus.
- **Web Audio Ambient-Synthesizer**:
  - 🌧️ *Sanfter Regen* (prozedurales Rauschen mit Tiefpass-Filter)
  - 🧘 *Zen Meditation* (432Hz Sinus/Dreieck-Klang)
  - 📻 *Weißes Rauschen* (reines statisches Signal)
  - Stufenloser Lautstärkeregler & Stummschaltung
- **Session-Tracking**: Anzeige abgeschlossener Pomodoro-Zyklen und fokussierter Gesamtminuten.

### 🎯 4. OrbitHabits • Daily Habit & Streak Tracker
- **Wöchentliche Matrix**: Montag bis Sonntag mit visueller Hervorhebung des heutigen Tages.
- **Streak-Counter**: Automatische Berechnung aufeinanderfolgender Tage (🔥 *X Tage*).
- **Fortschrittsbalken & Feuerwerk**: Erledigungsquote für heute und Konfetti-Belohnung beim Abschluss aller Tagesziele.

### 🛠️ 5. OrbitTools • Smart Utilities & Dev-Tools
- **{ } JSON Studio**: Formatieren (2 Leerzeichen), Minifizieren, Live-Validierung mit Syntaxfehlern und 1-Klick-Kopieren.
- **Aa Text Converter**: Konvertierung in *UPPERCASE*, *lowercase*, *Title Case*, *camelCase*, *kebab-case* und *snake_case*.
- **📊 Text Inspektor**: Live-Zählung von Wörtern, Zeichen, Sätzen, Absätzen und geschätzter Lesezeit (~200 WpM).
- **🔑 UUID & Timestamp**: Generierung von UUID v4, Unix-Zeitstempeln (Sekunden/Millisekunden) und ISO 8601 Strings.

---

## ⌨️ Tastaturkürzel (Shortcuts)

| Shortcut | Aktion |
|---|---|
| <kbd>Alt</kbd> + <kbd>0</kbd> | Startseite (Hub) aufrufen |
| <kbd>Alt</kbd> + <kbd>1</kbd> | OrbitTask öffnen |
| <kbd>Alt</kbd> + <kbd>2</kbd> | OrbitNotes öffnen |
| <kbd>Alt</kbd> + <kbd>3</kbd> | OrbitFocus öffnen |
| <kbd>Alt</kbd> + <kbd>4</kbd> | OrbitHabits öffnen |
| <kbd>Alt</kbd> + <kbd>5</kbd> | OrbitTools öffnen |
| <kbd>Alt</kbd> + <kbd>K</kbd> | App-Selector Dropdown öffnen |
| <kbd>Strg</kbd> + <kbd>K</kbd> | Globale Suche in OrbitTask fokussieren |
| <kbd>Leertaste</kbd> | Timer in OrbitFocus starten / pausieren |
| <kbd>Escape</kbd> | Geöffnetes Modalfenster / Menü schließen |

---

## 💾 Gesamtsicherung & Datenmanagement

- **Lokale Persistenz**: Alle Daten werden isoliert und sicher im Browser-`localStorage` gespeichert.
- **Suite-Gesamt-Backup**: Export aller Module (Aufgaben, Notizen, Gewohnheiten, Fokus-Historie) in einer einzigen `.json`-Datei.
- **Wiederherstellung**: Einfacher Import vorhandener JSON-Backups oder Wiederherstellung der Beispieldaten auf Knopfdruck.

---

## 🛠️ Technologie-Stack
- **Struktur**: Semantisches HTML5
- **Styling**: Modernes Vanilla CSS (Dark Glassmorphism, CSS Grid, Flexbox, Keyframe-Animationen)
- **Logik**: Modernes ES6+ JavaScript
- **Audio**: Web Audio API Sound-Synthesizer & Ambient-Noise-Generator
- **Visuals**: HTML5 Canvas Partikel-Engine
- **Keine externen Abhängigkeiten / Node-Module nötig** – 100% autark und offlinefähig.

---

## 🚀 Lokale Ausführung

Einfach per Python im Projektordner starten:
```bash
python -m http.server 8080
```
Und im Browser aufrufen:
```
http://127.0.0.1:8080/
```
Oder direkt die `index.html` per Doppelklick in einem modernen Webbrowser (Edge, Chrome, Firefox) öffnen.
