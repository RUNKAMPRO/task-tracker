# 🚀 OrbitTask • Pro Task Tracking Suite

Eine moderne, blitzschnelle und hochgradig anpassbare Task-Tracking- und Produktivitätsanwendung im eleganten **Dark Glassmorphism Design**. Entwickelt mit Fokus auf visuelle Ästhetik, intuitive Bedienung und Zero-Dependency-Leichtbau.

---

## ✨ Features im Überblick

### 1. 🗂️ Drei flexible Arbeitsansichten
- **Kanban-Board**: 5 strukturierte Workflow-Spalten (*Backlog*, *Zu erledigen*, *In Bearbeitung*, *Prüfung*, *Erledigt*) mit intuitivem HTML5 Drag-and-Drop, Status-Glows und Schnell-Hinzufügen-Buttons.
- **Listenansicht**: Tabellarische Übersicht aller Tasks inklusive Status-Checkboxen, Prioritäts-Badges, Fälligkeitsstatus, Subtask-Fortschritt und Aktionen zum Bearbeiten/Löschen.
- **Analytics & Statistiken**:
  - Dynamischer SVG-Radialfortschrittsbalken für den Gesamterledigungsgrad.
  - Horizontale Statusverteilungs-Diagramme.
  - 4-Quadranten Prioritäts-Matrix.
  - Aufgabenaufschlüsselung nach Kategorien und Tags mit Erledigungsquote.

### 2. ⚡ Interaktivität & UX-Highlights
- **Dark Glassmorphism UI**: Mehrschichtige dunkle Hintergründe, animierte Ambient Light Orbs, feine Glas-Transparenzen (`backdrop-filter: blur`) und abgestimmte HSL-Glows.
- **Micro-Interactions**:
  - Partikel-Konfetti-Feuerwerk (HTML5 Canvas) beim Abschließen von Aufgaben.
  - Integrierter Sound-Synthesizer via Web Audio API (keine externen Audio-Dateien nötig, stummschaltbar mit Persistenz).
  - Toast-Benachrichtigungen mit **"Rückgängig" (Undo)**-Funktion für gelöschte Aufgaben.
- **Filter- & Suchsystem**:
  - Globale Sofort-Suche (`Strg + K` / `Ctrl + K`) durchsucht Titel, Beschreibungen, Subtasks und Tags in Echtzeit.
  - Schnellfilter für Prioritäten (*🚨 Dringend*, *⚡ Hoch*), Heute fällige Tasks und überfällige Fristen.
  - Dynamische `#Tag`-Filter-Chips.
  - Sortierung nach Erstellungsdatum, Frist, Priorität oder Alphabet.

### 3. 📝 Detailliertes Aufgaben-Management
- Titel & mehrzeilige Notizen/Beschreibungen.
- Prioritäten (*Dringend*, *Hoch*, *Mittel*, *Niedrig*) mit farbkodierten Glow-Indikatoren.
- Fälligkeitsdaten mit automatischer Ampel-Kennzeichnung (*Heute fällig*, *Morgen*, *Überfällig*).
- Beliebige Kategorien mit Auto-Vervollständigung.
- Dynamische Teilaufgaben (Subtasks) mit Fortschrittsanzeige (`2/3 erledigt`).

### 4. 💾 Datensicherheit & Export
- Automatische Speicherung im lokalen Speicher (`localStorage`) – keine Registrierung oder Server nötig.
- **JSON-Export**: Backup aller Aufgaben per Klick herunterladen.
- **JSON-Import**: Vorhandene Backups wiederherstellen.
- **Demo-Daten Generator**: Realistische Beispieldaten auf Knopfdruck laden.

---

## ⌨️ Tastaturkürzel (Shortcuts)

| Shortcut | Aktion |
|---|---|
| <kbd>Strg</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Globale Schnellsuche fokussieren |
| <kbd>Escape</kbd> | Modalfenster / Dialog schließen |
| <kbd>Enter</kbd> im Subtask-Feld | Subtask sofort zur Liste hinzufügen |

---

## 🛠️ Technologie-Stack
- **Struktur**: Semantisches HTML5
- **Styling**: Modernes Vanilla CSS (Custom Properties, Glassmorphism Tokens, CSS Grid, Flexbox, Keyframe-Animationen)
- **Logik**: Modernes ES6+ JavaScript (Web Audio API Synthesizer, Canvas Particle Engine, HTML5 Drag & Drop)
- **Keine externen Abhängigkeiten** (funktioniert direkt offline im Browser)

---

## 🚀 Lokale Ausführung

Der lokale Server läuft standardmäßig auf:
```
http://127.0.0.1:4173/
```

Oder einfach per Python / Node im Projektordner starten:
```bash
python -m http.server 4173
```
oder direkt die `index.html` per Doppelklick im Webbrowser öffnen.
