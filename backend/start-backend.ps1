$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPython = Join-Path $scriptDir ".venv311\Scripts\python.exe"
$appPath = Join-Path $scriptDir "app.py"

if (-not (Test-Path $venvPython)) {
    Write-Error "Backend venv Python not found at $venvPython"
}

Set-Location $scriptDir
& $venvPython $appPath

