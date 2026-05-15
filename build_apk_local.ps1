$ErrorActionPreference = "Stop"
Write-Host "Downloading Portable Java 17... (This takes about 30 seconds)"
$jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip"
$zipPath = "C:\Users\DEll\anti-project\jdk17.zip"
$extractPath = "C:\Users\DEll\anti-project\.java"

if (-not (Test-Path $extractPath)) {
    Invoke-WebRequest -Uri $jdkUrl -OutFile $zipPath
    Write-Host "Extracting Java Runtime..."
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Remove-Item $zipPath
}

$jdkDir = Get-ChildItem "$extractPath" | Where-Object { $_.PSIsContainer } | Select-Object -First 1
$env:JAVA_HOME = $jdkDir.FullName
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "Java is configured at $env:JAVA_HOME"
java -version

Write-Host "Bundling JavaScript and Building APK via Gradle... (This may take roughly 3 to 6 mins locally)"
cd c:\Users\DEll\anti-project\mobile\android
.\gradlew.bat assembleRelease --no-daemon -Djava.net.preferIPv4Stack=true --stacktrace

if (Test-Path "app\build\outputs\apk\release\app-release.apk") {
    Copy-Item "app\build\outputs\apk\release\app-release.apk" "C:\Users\DEll\anti-project\AgriGrowth_Final.apk" -Force
    Write-Host "SUCCESS_APP_BUILT_LOCALLY"
}
else {
    Write-Host "BUILD_FAILED"
}
