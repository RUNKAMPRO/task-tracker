@echo off
title Stop OrbitSuite Server
echo ========================================================
echo   OrbitSuite - Server beenden
echo ========================================================
echo.
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if ($conns) { $conns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host '[OK] OrbitSuite Server auf Port 8080 wurde beendet.' } else { Write-Host '[INFO] Kein aktiver Server auf Port 8080 gefunden.' }"
echo.
ping 127.0.0.1 -n 2 >nul
exit
