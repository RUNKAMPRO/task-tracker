@echo off
title OrbitSuite - Weltweiter Online Tunnel
echo ========================================================
echo   OrbitSuite - Weltweiter Online-Zugriff (Tunnel)
echo ========================================================
echo.
echo Stelle verschluesselte HTTPS-Verbindung her...
echo Du erhaeltst gleich eine oeffentliche Web-Adresse (URL),
echo die du auf deinem Smartphone oder von ueberall oeffnen kannst.
echo.
echo [INFO] Druecke Strg+C, um den Tunnel zu beenden.
echo ========================================================
echo.
ssh -R 80:127.0.0.1:8080 nokey@localhost.run
pause
