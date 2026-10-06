# 🪐 OrbitSuite • Integriertes Multi-App Produktivitäts-Framework

Eine hochmoderne, modulare All-in-One Produktivitäts- und Workflow-Suite im eleganten **Dark Glassmorphism Design**. Entwickelt mit Fokus auf visuelle Ästhetik, blitzschnelle Performance und Zero-Dependency-Leichtbau.

Über die zentrale **Startseite (App-Hub & Selector)** und die universelle **Schnellwechsel-Leiste** kann nahtlos zwischen allen Anwendungen der Suite gewechselt werden.

---

## 🖥️ 1-Klick Desktop-Starter & App-Icon

OrbitSuite kann direkt und komfortabel vom Desktop aus gestartet werden:

- **Desktop-Shortcut (`OrbitSuite.lnk`)**: Befindet sich direkt auf deinem Desktop mit eigenem hochauflösenden Orbit-Icon (`orbitsuite.ico` / 256×256 Multi-Layer).
- **Batch-Launcher (`Start_OrbitSuite.bat` / `OrbitSuite.bat`)**: Startet im Hintergrund den lokalen HTTP-Server (Port 8080) und öffnet die Suite sofort im Standardbrowser.
- **Web-Favicon & Touch-Icon**: `favicon.ico` und `orbitsuite_icon.png` (512×512) für Browser-Tabs und Lesezeichen.

---

## 📱 Multi-Resolution & Responsive Design

Das responsive Layout wurde optimiert, um visuelle Bugs bei jeglichen Fenstergrößen und Bildschirmauflösungen vollständig zu beheben:

1. **Große Bildschirme & Laptops (1024px – 1380px)**: 
   - Automatische Reduzierung der Navigations-Pills auf Icon-Only mit Tooltips – verhindert Überlappen und Zeilenumbrüche im Header.
2. **Tablets (768px – 1024px)**:
   - Der App-Selector übernimmt die primäre Navigation.
   - **Kanban-Board**: Feste Mindestbreite von 290px je Spalte mit weichem horizontalem Scrollen, damit Karten niemals gestaucht werden.
   - **OrbitHabits**: Tabellenbreite mit Mindestmaß von 760px verhindert das Deformieren der 7 Tages-Checkkreise.
   - **OrbitTools**: Responsive 1-Spalten-Anordnung für Eingabe- und Ausgabe-Editoren.
3. **Mobile & kompakte Fenster (≤ 640px / 480px)**:
   - **OrbitFocus**: Der animierte Timer-Kreis skaliert dynamisch (`min(270px, 72vw)`), ohne den Bildschirmrand zu übertreffen.
   - Header, Modale und Filter-Chips passen sich platzsparend an.
   - Rätsel-Eingabefeld und Aktionsbuttons stapeln sich sauber untereinander.

---

## 🚀 Die Suite-Module im Überblick

### 🏠 0. Startseite & App-Selector Hub
- **Zentraler Workspace Hub**: Begrüßungs-Banner mit Live-Uhrzeit, System-Status und tagesaktuellen KPIs aller Apps.
- **Interaktiver App-Selector**: 3D-Karten mit individuellen Glow-Effekten, Status-Pills und Schnellstarter-Buttons für jedes Modul.
- **Blitz-Aktionen**: Sofort neue Aufgaben anlegen, Notizen verfassen, Pomodoro-Timer starten, Habits prüfen oder Rätsel lösen.
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

### 🧩 6. OrbitRätsel • Brain Teaser & Puzzle Studio
- **18 Vorinstallierte Denksport-Aufgaben**:
  - 💡 **Logik**: Die zwei Wächter, Die 3 Lichtschalter im Keller, Das 45-Minuten-Seil, Wolf/Ziege/Kohlkopf.
  - 🔢 **Zahlen & Mathe**: Der Schläger und der Ball (5 Cent!), Der Seerosenteich, 8 Achten = 1000.
  - 💻 **Coder & Tech**: Warum Coder Halloween an Weihnachten feiern (OCT 31 = DEC 25), Zaunpfahlfehler (Off-by-One), Deadlock-Problem, Rekursion & Stack Overflow.
  - 🕵️ **Detektiv**: Romeo & Julia im Scherbenmeer, Der Zeuge im Fahrstuhl, Der geschmolzene Schneemann.
  - 🧠 **Querdenker**: Das nasse Handtuch, Die Flasche mit Hals ohne Kopf, Erkältung fangen, Das wachsende Loch.
- **Interaktive Antwortprüfung**: Intelligente Keyword-Validierung mit Umlaut- und Sonderzeichen-Normalisierung.
- **Belohnungssystem**: Konfetti-Explosion, Sound-Feedback und dynamischer Streak-Zähler (🔥 *X-er Streak*).
- **Denkanstöße & Weichzeichner-Auflösung**: Zuklappbare Hinweise und per CSS-Blur verdeckte Lösungstexte (1-Klick-Enthüllung).
- **Sammlungs-Übersicht**: Interaktive Kachelübersicht mit Filter nach Kategorie und Schwierigkeitsgrad (*Einfach*, *Mittel*, *Schwer*).
- **Eigenes Rätsel erstellen**: Integriertes Dialogfenster zur Erstellung und lokalen Speicherung individueller Denksport-Aufgaben.

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
| <kbd>Alt</kbd> + <kbd>6</kbd> | OrbitRätsel öffnen |
| <kbd>Alt</kbd> + <kbd>K</kbd> | App-Selector Dropdown öffnen |
| <kbd>Strg</kbd> + <kbd>K</kbd> | Globale Suche in OrbitTask fokussieren |
| <kbd>Leertaste</kbd> | Timer in OrbitFocus starten / pausieren |
| <kbd>Escape</kbd> | Geöffnetes Modalfenster / Menü schließen |

---

## 💾 Gesamtsicherung & Datenmanagement

- **Lokale Persistenz**: Alle Daten werden isoliert und sicher im Browser-`localStorage` gespeichert.
- **Suite-Gesamt-Backup**: Export aller Module (Aufgaben, Notizen, Gewohnheiten, Fokus-Historie und gelöste/eigene Rätsel) in einer einzigen `.json`-Datei.
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

## 🚀 Ausführung

### Option A: Vom Desktop (Empfohlen)
Doppelklick auf das **OrbitSuite**-Icon auf deinem Desktop (`OrbitSuite.lnk` bzw. `OrbitSuite.bat`).

### Option B: Per Terminal
```bash
python -m http.server 8080
```
Und im Browser aufrufen:
```
http://127.0.0.1:8080/
```

