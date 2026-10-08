$desktop = [Environment]::GetFolderPath('Desktop')
# Also handle OneDrive Desktop if redirected
$oneDriveDesktop = 'C:\Users\RUKAMPRO\OneDrive - Otto Group\Desktop'
if (Test-Path $oneDriveDesktop) {
    $desktop = $oneDriveDesktop
}
$startup = [Environment]::GetFolderPath('Startup')

# Parent directory is the project root
$project = Split-Path -Parent $PSScriptRoot
if (-not $project -or -not (Test-Path (Join-Path $project 'index.html'))) {
    $project = 'C:\Users\RUKAMPRO\OneDrive\task-tracker'
}

$bat = Join-Path $project 'Start_OrbitSuite.bat'
$vbs = Join-Path $project 'scripts\Start_OrbitSuite_Silent.vbs'
$ico = Join-Path $project 'icons\orbitsuite.ico'

$wsh = New-Object -ComObject WScript.Shell

# 1. Desktop Shortcut OrbitSuite (.lnk)
$lnkPath = Join-Path $desktop 'OrbitSuite.lnk'
$shortcut = $wsh.CreateShortcut($lnkPath)
$shortcut.TargetPath = $bat
$shortcut.WorkingDirectory = $project
if (Test-Path $ico) {
    $shortcut.IconLocation = "$ico,0"
}
$shortcut.Description = 'OrbitSuite • All-in-One Productivity Workspace'
$shortcut.Save()

# 2. Desktop Shortcut Folienwerk (.lnk) - Startet direkt in die Folienwerk-Fensteransicht
$fwLnkPath = Join-Path $desktop 'Folienwerk.lnk'
$fwShortcut = $wsh.CreateShortcut($fwLnkPath)
$fwShortcut.TargetPath = $bat
$fwShortcut.WorkingDirectory = $project
if (Test-Path $ico) {
    $fwShortcut.IconLocation = "$ico,0"
}
$fwShortcut.Description = 'Folienwerk • Interaktive Präsentationen in OrbitSuite'
$fwShortcut.Save()

# 3. Desktop Batch file (.bat forwarder)
$desktopBat = Join-Path $desktop 'OrbitSuite.bat'
$batForwarder = "@echo off`r`ncd /d `"$project`"`r`ncall `"$bat`"`r`n"
Set-Content -Path $desktopBat -Value $batForwarder -Encoding ASCII

# 4. Windows Autostart (Startup) - Startet den Server unsichtbar beim PC-Start
$autostartLnk = Join-Path $startup 'OrbitSuite-BackgroundServer.lnk'
$autoShortcut = $wsh.CreateShortcut($autostartLnk)
$autoShortcut.TargetPath = 'wscript.exe'
$autoShortcut.Arguments = "`"$vbs`""
$autoShortcut.WorkingDirectory = $project
if (Test-Path $ico) {
    $autoShortcut.IconLocation = "$ico,0"
}
$autoShortcut.Description = 'OrbitSuite Ghosted Background Server'
$autoShortcut.Save()

Write-Host "Created Desktop LNK: $lnkPath (Exists: $(Test-Path $lnkPath))"
Write-Host "Created Folienwerk LNK: $fwLnkPath (Exists: $(Test-Path $fwLnkPath))"
Write-Host "Created Desktop BAT: $desktopBat (Exists: $(Test-Path $desktopBat))"
Write-Host "Created Autostart LNK: $autostartLnk (Exists: $(Test-Path $autostartLnk))"
