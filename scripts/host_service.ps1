$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
if (-not $projectDir -or -not (Test-Path (Join-Path $projectDir 'index.html'))) {
    $projectDir = 'C:\Users\RUKAMPRO\OneDrive\task-tracker'
}

$listening = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
    $python = (Get-Command python.exe -ErrorAction SilentlyContinue).Source
    if (-not $python) { $python = (Get-Command py.exe -ErrorAction SilentlyContinue).Source }
    if ($python) {
        Start-Process $python -ArgumentList "-m http.server 8080 --bind 0.0.0.0" -WorkingDirectory $projectDir -WindowStyle Hidden
    }
}
