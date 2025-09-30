@echo off
echo Stopping Angverytime Front Server...

REM Stop Node.js processes on port 8001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do (
    echo Stopping process %%a
    taskkill /f /pid %%a 2>nul
)

REM Stop Node.js processes with server keywords
taskkill /f /im node.exe /fi "WINDOWTITLE eq simple-server*" 2>nul
taskkill /f /im node.exe /fi "WINDOWTITLE eq http-server*" 2>nul

echo Server stopped.
pause