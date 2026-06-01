# start.ps1 — Run AgriGrowth backend + frontend together
# Usage: .\start.ps1
Write-Host "Starting AgriGrowth..." -ForegroundColor Green

# ── Open firewall ports for LAN access (requires admin) ──────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
if ($isAdmin) {
    $rules = @(
        @{ Name = "AgriGrowth Vite 5173";    Port = 5173 },
        @{ Name = "AgriGrowth Backend 8000"; Port = 8000 }
    )
    foreach ($rule in $rules) {
        $exists = netsh advfirewall firewall show rule name=$rule.Name 2>$null
        if ($exists -match "No rules match") {
            netsh advfirewall firewall add rule name=$rule.Name dir=in action=allow protocol=TCP localport=$rule.Port | Out-Null
            Write-Host "  Firewall: Opened port $($rule.Port) ($($rule.Name))" -ForegroundColor Green
        } else {
            Write-Host "  Firewall: Port $($rule.Port) already open." -ForegroundColor DarkGreen
        }
    }
} else {
    Write-Host "  [!] Not running as Administrator - skipping firewall rules." -ForegroundColor Yellow
    Write-Host "      Run: Start-Process powershell -Verb RunAs -ArgumentList '-File $PSCommandPath'" -ForegroundColor Yellow
    Write-Host "      OR manually allow TCP ports 5173 and 8000 in Windows Firewall." -ForegroundColor Yellow
}

# ── Show local network IP so mobile devices know the address ──────────────────
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -eq 'Dhcp' } | Select-Object -First 1).IPAddress
if ($localIP) {
    Write-Host ""
    Write-Host "  Local Network URL:" -ForegroundColor Cyan
    Write-Host "    Frontend : http://${localIP}:5173" -ForegroundColor White
    Write-Host "    Backend  : http://${localIP}:8000" -ForegroundColor White
    Write-Host "  Use these on your phone (same WiFi network)" -ForegroundColor DarkCyan
    Write-Host ""
}

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
