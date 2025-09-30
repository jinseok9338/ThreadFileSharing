# PowerShell script to create a scheduled task for the server
param(
    [Parameter(Mandatory=$true)]
    [string]$DeployPath
)

$taskName = "AngvertimeFrontServer"
$taskDescription = "Angverytime Front End Server"
$exePath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$DeployPath\start-server-task.ps1`""

# Remove existing task if it exists
try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Removed existing scheduled task" -ForegroundColor Yellow
} catch {
    # Task doesn't exist, that's fine
}

# Create new scheduled task
$action = New-ScheduledTaskAction -Execute $exePath -Argument $arguments -WorkingDirectory $DeployPath
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register the task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $taskDescription

# Start the task immediately
Start-ScheduledTask -TaskName $taskName

Write-Host "✅ Scheduled task '$taskName' created and started" -ForegroundColor Green
Write-Host "The server will now start automatically on system boot" -ForegroundColor Cyan