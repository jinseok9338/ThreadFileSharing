# Windows Service Wrapper for Node.js Server
param(
    [string]$DeployPath = "C:\deploy\angverytime-front\current",
    [int]$Port = 8001
)

# Function to check if port is in use
function Test-Port {
    param([int]$PortNumber)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $PortNumber)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Stop any existing processes on the port
Write-Host "Stopping processes using port $Port..."
$procs = netstat -ano | findstr ":$Port" | ForEach-Object { ($_ -split '\s+')[-1] }
$procs | Where-Object { $_ -match '^\d+$' } | ForEach-Object { 
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process $_"
}

# Wait for cleanup
Start-Sleep -Seconds 2

# Create a completely detached background process using PowerShell jobs
Write-Host "Starting server as background job..."

# Create a background script block that will survive the GitHub Actions process
$BackgroundScript = {
    param($ServerPath, $ServerPort)
    
    # Change to the deployment directory
    Set-Location $ServerPath
    
    # Start the Node.js server
    & node.exe "standalone-server.cjs"
}

# Start the background job with a unique name
$JobName = "AngvertimeServer_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$Job = Start-Job -Name $JobName -ScriptBlock $BackgroundScript -ArgumentList $DeployPath, $Port

Write-Host "Server job started with ID: $($Job.Id)"
Write-Host "Job name: $JobName"

# Also try to start with Start-Process as backup
try {
    $ProcessArgs = @{
        FilePath = "node.exe"
        ArgumentList = "standalone-server.cjs"
        WorkingDirectory = $DeployPath
        WindowStyle = "Hidden"
        PassThru = $true
    }
    $Process = Start-Process @ProcessArgs
    Write-Host "Backup process started with PID: $($Process.Id)"
} catch {
    Write-Host "Backup process failed: $($_.Exception.Message)"
}

# Wait for server to start
Write-Host "Waiting for server to start..."
Start-Sleep -Seconds 5

# Test server
$MaxRetries = 12
$RetryCount = 0
$ServerStarted = $false

while ($RetryCount -lt $MaxRetries -and -not $ServerStarted) {
    $RetryCount++
    Write-Host "Testing server connection (attempt $RetryCount/$MaxRetries)..."
    
    if (Test-Port -PortNumber $Port) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✓ Server started successfully at http://localhost:$Port"
            Write-Host "Server status code: $($response.StatusCode)"
            $ServerStarted = $true
        } catch {
            Write-Host "Port is open but server not responding yet..."
        }
    } else {
        Write-Host "Port $Port not yet available..."
    }
    
    if (-not $ServerStarted) {
        Start-Sleep -Seconds 5
    }
}

if (-not $ServerStarted) {
    Write-Host "⚠ Server may need more time to start. Check manually at http://localhost:$Port"
    Write-Host "Background job status:"
    Get-Job -Name "*AngvertimeServer*" -ErrorAction SilentlyContinue | Format-Table Name, State, HasMoreData
} else {
    Write-Host "🎉 Server deployment completed successfully!"
}

Write-Host "To check running jobs later, use: Get-Job -Name '*AngvertimeServer*'"
Write-Host "To stop all server jobs, use: Get-Job -Name '*AngvertimeServer*' | Stop-Job; Get-Job -Name '*AngvertimeServer*' | Remove-Job"