@echo off
title OrbitSuite Launcher
echo ========================================================
echo   OrbitSuite - Integrated Workspace
echo ========================================================
echo.

:: Wechseln in das Projekt-Hauptverzeichnis
cd /d "%~dp0.."

:: Python-Befehl ermitteln (python oder py)
set "PY_CMD=python"
where python >nul 2>&1
if %errorlevel% neq 0 (
    where py >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=py"
    ) else (
        echo [FEHLER] Python wurde nicht gefunden! Bitte installieren Sie Python.
        pause
        exit /b 1
    )
)

:: Pruefen, ob ein Server auf Port 8080 lauscht
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo [OK] OrbitSuite Server laeuft bereits auf Port 8080.
) else (
    echo [INFO] Starte lokalen Server fuer Netzwerk auf Port 8080...
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process %PY_CMD% -ArgumentList '-m http.server 8080 --bind 0.0.0.0' -WorkingDirectory '%~dp0..' -WindowStyle Hidden"
    ping 127.0.0.1 -n 2 >nul
)

echo.
echo --------------------------------------------------------
echo Zugriffs-Adressen:
echo [LOKAL]      http://localhost:8080/#hub
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*','WLAN*').IPAddress"') do (
    echo [WLAN/HANDY] http://%%a:8080/#hub
)
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet*').IPAddress"') do (
    echo [LAN/KABEL]  http://%%a:8080/#hub
)
echo --------------------------------------------------------
echo.

echo [INFO] Oeffne OrbitSuite im Browser...
start http://127.0.0.1:8080/#hub

echo.
echo [ERFOLG] OrbitSuite ist aktiv!
ping 127.0.0.1 -n 4 >nul
exit
