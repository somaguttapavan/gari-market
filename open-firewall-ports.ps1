# open-firewall-ports.ps1
# Run this as Administrator to allow mobile devices on your WiFi to access AgriGrowth
# Right-click this file -> "Run with PowerShell" as Admin

Write-Host ""
Write-Host "=== AgriGrowth LAN Firewall Setup ===" -ForegroundColor Cyan
Write-Host ""

$rules = @(
    @{ Name = "AgriGrowth Vite 5173";    Port = 5173; Desc = "Vite Frontend" },
    @{ Name = "AgriGrowth Backend 8000"; Port = 8000; Desc = "FastAPI Backend" }
)

foreach ($rule in $rules) {
    # Remove old rule if exists
    netsh advfirewall firewall delete rule name=$rule.Name 2>$null | Out-Null
    
    # Add fresh inbound TCP rule
    $result = netsh advfirewall firewall add rule name=$rule.Name dir=in action=allow protocol=TCP localport=$rule.Port
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Port $($rule.Port) opened ($($rule.Desc))" -ForegroundColor Green
    } else {
        Write-Host "  [!!] Failed to open port $($rule.Port)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Your Local Network Address ===" -ForegroundColor Cyan
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and ($_.PrefixOrigin -eq 'Dhcp' -or $_.PrefixOrigin -eq 'Manual') } | Select-Object -First 1).IPAddress
if ($localIP) {
    Write-Host ""
    Write-Host "  Open this on your phone's browser (same WiFi):" -ForegroundColor White
    Write-Host "  http://${localIP}:5173" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "  Could not detect local IP. Check ipconfig." -ForegroundColor Yellow
}

Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
