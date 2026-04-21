# sync-mobile.ps1 - Build and sync frontend to mobile assets
Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build

Write-Host "Syncing to mobile assets..." -ForegroundColor Cyan
$mobileAssetDir = "mobile/android/app/src/main/assets/www"
if (-not (Test-Path $mobileAssetDir)) {
    New-Item -ItemType Directory -Path $mobileAssetDir -Force
}

Copy-Item -Path "dist/*" -Destination $mobileAssetDir -Recurse -Force

Write-Host "Sync Complete! You can now build your APK or run your local dev build." -ForegroundColor Green
