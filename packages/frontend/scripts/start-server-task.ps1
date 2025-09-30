# PowerShell script for scheduled task to run the server
Set-Location $PSScriptRoot

# Stop any existing servers on port 8001
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    try {
        $_.CommandLine -like "*8001*" -or $_.CommandLine -like "*simple-server*" -or $_.CommandLine -like "*http-server*"
    } catch {
        $false
    }
} | ForEach-Object {
    Write-Host "Stopping existing process: $($_.Id)"
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

# Try to start http-server first
if (Test-Path "node_modules\.bin\http-server.cmd") {
    Write-Host "Starting http-server..."
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", "node_modules\.bin\http-server.cmd . -p 8001 --cors -c-1 -s") -WindowStyle Hidden
} elseif (Test-Path "simple-server.js") {
    Write-Host "Starting simple Node.js server..."
    Start-Process -FilePath "node.exe" -ArgumentList @("simple-server.js") -WindowStyle Hidden
} else {
    Write-Host "No server found to start"
    exit 1
}

Write-Host "Server started successfully"