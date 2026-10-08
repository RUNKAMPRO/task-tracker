@echo off
setlocal enabledelayedexpansion
title OrbitSuite Launcher
cd /d "%~dp0.."

:: 1. Sofort Browser oeffnen (paralleler Sofort-Start in <100ms)
start http://127.0.0.1:8080/#hub

:: 2. Port 8080 (OrbitSuite) blitzschnell via nativem netstat pruefen (<50ms)
netstat -ano -p tcp | findstr :8080 | findstr /i "ABH LIST" >nul 2>&1
if %errorlevel% neq 0 (
    set "PY_CMD=python"
    where python >nul 2>&1
    if !errorlevel! neq 0 (
        where py >nul 2>&1
        if !errorlevel! equ 0 set "PY_CMD=py"
    )
    start /min "" !PY_CMD! -m http.server 8080 --bind 127.0.0.1
)

:: 3. Port 8765 (Folienwerk) blitzschnell via nativem netstat pruefen (<50ms)
netstat -ano -p tcp | findstr :8765 | findstr /i "ABH LIST" >nul 2>&1
if %errorlevel% neq 0 (
    set "FW_DIR=C:\Users\RUKAMPRO\Downloads\Folienwerk-master\Folienwerk-master\Folienwerk"
    if not exist "!FW_DIR!\server.mjs" set "FW_DIR=%USERPROFILE%\Downloads\Folienwerk-master\Folienwerk-master\Folienwerk"
    if not exist "!FW_DIR!\server.mjs" set "FW_DIR=C:\Users\RUKAMPRO\Folienwerk"

    if exist "!FW_DIR!\server.mjs" (
        set "NODE_CMD=!FW_DIR!\bin\node.exe"
        if not exist "!NODE_CMD!" set "NODE_CMD=node"
        set "FOLIENWERK_OPEN=0"
        set "PORT=8765"
        pushd "!FW_DIR!"
        start /min "" "!NODE_CMD!" server.mjs
        popd
    )
)

exit /b 0
