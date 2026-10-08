# OrbitSuite Hilfsskripte & Automatisierung

In diesem Ordner befinden sich alle Skripte zur Verwaltung, zum Starten und zur Netzwerkfreigabe von OrbitSuite.

| Skript | Beschreibung |
|---|---|
| `Start_OrbitSuite.bat` | Startet den lokalen Web-Server (`http://localhost:8080`) und öffnet OrbitSuite im Standardbrowser. |
| `Start_OrbitSuite_Silent.vbs` | Startet den Web-Server im Hintergrund ohne störendes Konsolenfenster. |
| `Stop_OrbitSuite.bat` | Beendet alle laufenden Node-/Python-Webserver-Prozesse von OrbitSuite sicher. |
| `Start_Online_Tunnel.bat` | Startet einen sicheren Cloudflare/ngrok-Tunnel für Zugriff von unterwegs (z. B. Smartphone). |
| `Freigabe_Netzwerk_Firewall.bat` | Richtet die Windows-Firewall-Regel ein, damit OrbitSuite im lokalen WLAN erreichbar ist. |
| `host_service.ps1` | PowerShell-Daemon für den dauerhaften Hintergrundbetrieb auf dem PC. |
| `create_shortcut.ps1` | Erstellt die Desktop- und Startmenü-Verknüpfungen für OrbitSuite. |
