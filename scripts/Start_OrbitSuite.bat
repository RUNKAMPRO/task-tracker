@echo off
title OrbitSuite Launcher
echo ========================================================
echo   OrbitSuite - Integrated Productivity Workspace
echo ========================================================
echo.

cd /d "%~dp0.."

:: 1. Python-Befehl ermitteln (python oder py)
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

:: 2. Pruefen, ob OrbitSuite auf Port 8080 lauscht
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo [OK] OrbitSuite Webserver laeuft bereits auf Port 8080.
) else (
    echo [INFO] Starte lokalen OrbitSuite Webserver auf Port 8080...
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process %PY_CMD% -ArgumentList '-m http.server 8080 --bind 0.0.0.0' -WorkingDirectory '%~dp0..' -WindowStyle Hidden"
    ping 127.0.0.1 -n 2 >nul
)

:: 3. Pruefen und automatisches Starten von Folienwerk auf Port 8765
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo [OK] Folienwerk laeuft bereits auf Port 8765.
) else (
    echo [INFO] Starte Folienwerk im Hintergrund fuer direkte Fensternutzung...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
        $searchDirs = @(
            'C:\Users\RUKAMPRO\Downloads\Folienwerk-master\Folienwerk-master\Folienwerk',
            'C:\Users\RUKAMPRO\Folienwerk',
            'C:\Users\RUKAMPRO\OneDrive\Folienwerk',
            (Join-Path $env:USERPROFILE 'Downloads\Folienwerk-master\Folienwerk-master\Folienwerk'),
            (Join-Path $env:USERPROFILE 'Folienwerk')
        )
        $fw = $searchDirs | Where-Object { Test-Path (Join-Path $_ 'server.mjs') } | Select-Object -First 1
        if ($fw) {
            $node = Join-Path $fw 'bin\node.exe'
            if (-not (Test-Path $node)) { $node = 'node' }
            $server = Join-Path $fw 'server.mjs'
            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = $node
            $psi.Arguments = "`"$server`""
            $psi.WorkingDirectory = $fw
            $psi.EnvironmentVariables['FOLIENWERK_OPEN'] = '0'
            $psi.EnvironmentVariables['PORT'] = '8765'
            $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
            $psi.UseShellExecute = $false
            $psi.CreateNoWindow = $true
            [System.Diagnostics.Process]::Start($psi) | Out-Null
            Write-Host '[OK] Folienwerk Hintergrunddienst erfolgreich gestartet.'
        } else {
            Write-Host '[WARN] Folienwerk-Verzeichnis nicht automatisch gefunden.'
        }
    }"
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
echo [ERFOLG] OrbitSuite und Folienwerk sind einsatzbereit!
ping 127.0.0.1 -n 3 >nul
exit
