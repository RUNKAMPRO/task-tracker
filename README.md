# 🪐 OrbitSuite • Integriertes Multi-App Produktivitäts-Framework

Eine hochmoderne, modulare All-in-One Produktivitäts- und Workflow-Suite im eleganten **Dark Glassmorphism Design**. Entwickelt mit Fokus auf visuelle Ästhetik, blitzschnelle Performance und Zero-Dependency-Leichtbau.

Über die zentrale **Startseite (App-Hub & Selector)** und die universelle **Schnellwechsel-Leiste** kann nahtlos zwischen allen Anwendungen der Suite gewechselt werden.

---

## ☁️ 24/7 Cloud-Datenbank & Nutzersystem (Synchronisation über alle Geräte)

OrbitSuite besitzt ein vollwertiges **Cloud-Nutzersystem mit Datenbank-Synchronisation**. Deine Daten werden verschlüsselt in einer cloudbasierten PostgreSQL-Datenbank (Supabase) synchronisiert – **auch wenn dein PC ausgeschaltet ist**!

### ✨ Highlights des Nutzersystems:
- **24/7 Verfügbarkeit via GitHub Pages**: Perfekt kombiniert mit `https://runkampro.github.io/task-tracker/`. Rufe die Suite jederzeit auf deinem Smartphone, Tablet oder Arbeits-PC auf.
- **Echtzeit-Synchronisation (Realtime WebSocket)**: Änderungen auf dem Laptop (z. B. eine erledigte Aufgabe oder Notiz) erscheinen in Sekundenschnelle auch auf dem Smartphone.
- **Offline-First & Datensicherheit**: Funktioniert auch ohne Internet oder Konfiguration im **Gast-Modus** (alles wird lokal gesichert). Sobald wieder eine Verbindung besteht, wird automatisch synchronisiert.
- **Lokale Datenmigration mit 1 Klick**: Bestehende lokale Aufgaben, Notizen, Gewohnheiten und Rätselstände können bei der Registrierung direkt in das Cloud-Konto übernommen werden.
- **Row Level Security (RLS)**: Höchste Datensicherheit auf Datenbank-Ebene – Benutzer können ausschließlich auf ihre eigenen Daten zugreifen.
- **Was wird synchronisiert?**
  - 📋 **OrbitTask**: Alle Aufgaben, Spalten, Prioritäten, Tags, Subtasks und Statusstände
  - 📝 **OrbitNotes**: Alle Notizen, Formatierungen, Kategorien, Farben und Pins
  - 🔄 **OrbitHabits**: Alle Gewohnheiten, 7-Tage-Historie und aktuelle Serien (Streaks)
  - ⏱️ **OrbitFocus**: Abgeschlossene Pomodoro-Sessions und Gesamtfokus-Minuten
  - 🧩 **OrbitPlay**: Gelöste Denk- & Mini-Game-Level (Queens, Tango, Pinpoint, Crossclimb, Zip, Sudoku, tägliche Rätsel)

---

### 🛠️ In 2 Minuten eingerichtet (100% Kostenlos)

1. **Kostenloses Supabase-Konto erstellen**:
   Gehe auf [https://supabase.com](https://supabase.com) und erstelle mit 1 Klick ein kostenloses Konto.
2. **Neues Projekt anlegen**:
   Klicke auf *New Project* (z. B. Name: `orbitsuite`, Passwort festlegen, Region: z. B. Frankfurt).
3. **Datenbank-Tabelle mit 1 Klick erstellen**:
   - Öffne links den Menüpunkt **SQL Editor**.
   - Klicke in OrbitSuite im Dialog *Cloud-Sync & Nutzersystem* auf den Button **"SQL-Script in Zwischenablage kopieren"** (oder kopiere den Inhalt aus [`supabase_schema.sql`](supabase_schema.sql)).
   - Füge das Script im Supabase SQL Editor ein und klicke auf **Run**.
4. **Verbindung eintragen**:
   - Gehe in Supabase zu **Project Settings > Data API** (oder *API Keys*).
   - Kopiere deine **Project URL** (z. B. `https://xyzcompany.supabase.co`) und deinen **anon public key**.
   - Öffne in OrbitSuite das Nutzer-Menü (oben rechts), wechsle auf den Tab **Cloud-Datenbank** und füge beides ein.
   - Klicke auf **Verbindung testen & speichern**.
5. **Konto registrieren oder anmelden**:
   - Wechsle auf den Tab **Benutzerkonto**, gib deine E-Mail und dein Passwort ein und klicke auf **Konto erstellen**.
   - Fertig! Ab jetzt sind all deine Geräte 24/7 nahtlos synchronisiert.

---

## 🌐 Zugriff von außerhalb des Laptops (Handy, Tablet & Unterwegs)

OrbitSuite ist auf allen Geräten erreichbar:

### 1. Über GitHub Pages (Empfohlen – 24/7 Online)
- OrbitSuite ist live gehostet unter:
  ```text
  https://runkampro.github.io/task-tracker/
  ```
- Kombiniert mit der Cloud-Datenbank hast du von überall auf der Welt Zugriff auf deine Daten, ohne dass dein PC laufen muss.

### 2. Im selben WLAN / Heimnetzwerk (Smartphone, Tablet, Zweit-PC)
- Der lokale Server lauscht auf allen Schnittstellen (`0.0.0.0:8080`).
- **Aufruf am Smartphone / Tablet**: Einfach die im Launcher angezeigte WLAN-Adresse eingeben:
  ```text
  http://<DEINE-WLAN-IP>:8080/#hub
  (z. B. http://10.60.8.189:8080/#hub)
  ```
- **Firewall-Freigabe**: Falls Windows externe Verbindungen blockiert, einmalig die Datei **`Freigabe_Netzwerk_Firewall.bat`** als Administrator ausführen.

### 3. Weltweit von unterwegs über das Internet via Tunnel
- **1-Klick Online-Tunnel (`Start_Online_Tunnel.bat`)**:
  Startet einen verschlüsselten SSH-Tunnel zu deinem Laptop. Du erhältst sofort eine öffentliche HTTPS-URL für dein Smartphone.

---

## 🖥️ 1-Klick Desktop-Starter, Ghosted Background Hosting & App-Icon

- **Dauerhafter Ghosted-Server (Windows-Autostart)**: Ein Autostart-Eintrag (`OrbitSuite-BackgroundServer.lnk`) im Windows-Startup-Ordner startet den lokalen Server unsichtbar im Hintergrund (`Start_OrbitSuite_Silent.vbs`), sobald der PC hochgefahren wird.
- **Desktop-Shortcut (`OrbitSuite.lnk`)**: Befindet sich direkt auf deinem Desktop mit eigenem hochauflösenden Orbit-Icon (`orbitsuite.ico`). Prüft den Serverstatus und öffnet OrbitSuite sofort im Browser.
- **Web-Adresse**: Unter `http://localhost:8080/#hub` (oder `http://127.0.0.1:8080/#hub`) jederzeit im Browser erreichbar.
- **Server beenden (`Stop_OrbitSuite.bat`)**: Beendet den Hintergrunddienst auf Port 8080 mit einem Klick.
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

### 📝 2. OrbitNotes • Quick Notes & Docs
- **Kategorien & Farb-Markierungen**: Organisation nach Ideen, To-Dos, Arbeit und Persönlich.
- **Live-Markdown-Unterstützung**: Schnelles Formatieren und Durchsuchen aller Notizen.
- **Pin & Archiv**: Wichtige Notizen anheften, damit sie auch im Workspace-Hub präsent sind.

### ⏱️ 3. OrbitFocus • Pomodoro & Focus Timer
- **Konfigurierbare Intervalle**: Arbeitsphasen (25 Min.), kurze Pausen (5 Min.) und lange Pausen (15 Min.).
- **Visualisierter Fortschrittsring**: Flüssig animierter Ring-Indikator mit akustischem Signalton.
- **Session-Counter & Task-Verknüpfung**: Fokus-Sessions direkt bestimmten Aufgaben zuordnen.

### 🔄 4. OrbitHabits • Habit & Routine Tracker
- **7-Tage-Übersicht**: Direkte Visualisierung der aktuellen Woche mit 1-Klick-Checkboxen.
- **Streak-Counter & Statistiken**: Motivierende Serie-Zähler und wöchentliche Erfolgsquoten.

### 🛠️ 5. OrbitTools • Developer & Productivity Utilities
- **JSON Formatter & Validator**: Syntax-Highlighting, Fehleranzeige und Minify/Prettify.
- **Base64 Encoder/Decoder**: Text- und URL-sichere Enkodierung.
- **RegEx Tester & Quick Reference**: Regex-Muster in Echtzeit mit Flags und Match-Hervorhebung prüfen.
- **Hash & UUID Generator**: MD5, SHA-256 und v4 UUIDs auf Knopfdruck erzeugen.

### 🧩 6. OrbitPlay • Rätsel & Gehirnjogging
- **Tägliche Denksportaufgaben**: Logik- und Worträtsel für fokussierte Denkpausen.
- **6 Mini-Games**: Queens, Tango, Pinpoint, Crossclimb, Zip und Sudoku mit Level-Hubs und Streak-Verfolgung.
- **Highscore & Streak**: Tägliche Lösungsreihenfolge und Belohnungssystem.
