# start.ps1 — Run AgriGrowth backend + frontend together
# Usage: .\start.ps1
Write-Host "Starting AgriGrowth..." -ForegroundColor Green

# Activate virtual environment if it exists
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    . .\.venv\Scripts\Activate.ps1
}

# Launch backend in a new background job
Write-Host "Starting Python backend on port 8000..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    & python backend/main.py
}

# Give it 5 seconds to boot, checking repeatedly against the health check endpoint
$retryCount = 0
$backendReady = $false
while ($retryCount -lt 10) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    }
    catch {
        # Silent fail, just wait and retry
    }
    Start-Sleep -Seconds 1
    $retryCount++
}

if (-not $backendReady) {
    Write-Host "WARNING: Backend may not be ready yet. Starting frontend anyway..." -ForegroundColor Yellow
}
else {
    Write-Host "Backend is running!" -ForegroundColor Green
}

# Launch Vite frontend (blocks until you Ctrl+C)
Write-Host "Starting Vite frontend..." -ForegroundColor Cyan
npm run dev

# Cleanup backend job when frontend exits
Write-Host "Stopping backend..." -ForegroundColor Yellow
Stop-Job $backendJob
Remove-Job $backendJob
Write-Host "All services stopped." -ForegroundColor Green
