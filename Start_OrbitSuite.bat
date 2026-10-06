@echo off
title OrbitSuite Launcher
chcp 65001 >nul
echo ========================================================
echo   🪐 OrbitSuite • Integrated Workspace
echo ========================================================
echo.

cd /d "%~dp0"

:: Pruefen, ob der Server bereits auf Port 8080 aktiv ist
netstat -ano | findstr /R /C:":8080 .*LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] OrbitSuite Server läuft bereits auf Port 8080.
) else (
    echo [INFO] Starte lokalen Server auf Port 8080...
    start /b python -m http.server 8080 --bind 127.0.0.1 >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo [INFO] Öffne OrbitSuite im Browser...
start http://127.0.0.1:8080/#hub

echo.
echo [ERFOLG] OrbitSuite wurde gestartet!
timeout /t 3 /nobreak >nul
exit
