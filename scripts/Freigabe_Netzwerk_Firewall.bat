@echo off
title OrbitSuite - Firewall Freigabe
echo ========================================================
echo   OrbitSuite - Port 8080 fuer das Netzwerk freigeben
echo ========================================================
echo.
echo Fordere Administrator-Rechte an, um Port 8080 in der
echo Windows Defender Firewall fuer WLAN / LAN freizuschalten...
echo.
powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command `\"New-NetFirewallRule -DisplayName ''OrbitSuite Webserver (Port 8080)'' -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -Profile Any -ErrorAction SilentlyContinue; Write-Host ''[ERFOLG] Port 8080 ist nun im Netzwerk freigegeben!''; Start-Sleep -Seconds 3`\"'"
