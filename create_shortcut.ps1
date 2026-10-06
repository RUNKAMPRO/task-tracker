$desktop = [Environment]::GetFolderPath('Desktop')
$project = 'c:\Users\RUKAMPRO\.gemini\antigravity-ide\scratch\task-tracker'
$bat = Join-Path $project 'Start_OrbitSuite.bat'
$ico = Join-Path $project 'orbitsuite.ico'

# Create Desktop Shortcut (.lnk)
$wsh = New-Object -ComObject WScript.Shell
$lnkPath = Join-Path $desktop 'OrbitSuite.lnk'
$shortcut = $wsh.CreateShortcut($lnkPath)
$shortcut.TargetPath = $bat
$shortcut.WorkingDirectory = $project
$shortcut.IconLocation = "$ico,0"
$shortcut.Description = 'OrbitSuite • Productivity Workspace'
$shortcut.Save()

# Create direct Desktop Batch file (.bat)
$desktopBat = Join-Path $desktop 'OrbitSuite.bat'
Copy-Item $bat $desktopBat -Force

Write-Host "Created LNK: $lnkPath (Exists: $(Test-Path $lnkPath))"
Write-Host "Created BAT: $desktopBat (Exists: $(Test-Path $desktopBat))"
